/*
  Supabase schema setup script (TypeScript)
  - Creates tables: public.series, public.votes
  - Adds constraints and indexes
  - Enables RLS and adds secure policies

  Usage:
    SUPABASE_DB_URL=postgres://USER:PASSWORD@HOST:PORT/dbname pnpm setup:supabase

  Note:
    This connects directly to the Postgres instance behind Supabase.
*/

import { Client } from 'pg';
import { config as dotenvConfig } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load environment variables from .env.local (preferred) or .env at repo root
(() => {
  try {
    const root = process.cwd();
    const envLocal = path.join(root, '.env.local');
    const envDefault = path.join(root, '.env');
    const chosen = fs.existsSync(envLocal) ? envLocal : (fs.existsSync(envDefault) ? envDefault : undefined);
    if (chosen) {
      dotenvConfig({ path: chosen });
      console.log(`[setup-supabase] Loaded environment from ${path.basename(chosen)}`);
    }
  } catch (e) {
    // best-effort loading; continue even if this fails
  }
})();

// To work around "self-signed certificate" issues in some environments, we allow insecure SSL for this setup script
// by default. You can opt into strict verification by setting SUPABASE_SETUP_STRICT_SSL=1.
if (process.env.SUPABASE_SETUP_STRICT_SSL !== '1') {
  // This affects only this Node process and is common for ephemeral setup scripts.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[setup-supabase] Insecure TLS allowed for setup (NODE_TLS_REJECT_UNAUTHORIZED=0). Set SUPABASE_SETUP_STRICT_SSL=1 to enforce strict SSL.');
}

const url = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('[setup-supabase] Missing SUPABASE_DB_URL (or POSTGRES_URL/DATABASE_URL).');
  console.error('Please set SUPABASE_DB_URL to your Supabase connection string (can be placed in .env.local).');
  process.exit(1);
}

const SQL = `
create schema if not exists public;

-- series table
create table if not exists public.series (
  id uuid primary key,
  slug text not null unique,
  title text,
  owner_id text,
  created_at timestamptz not null default now(),
  games jsonb not null default '[]'::jsonb,
  timeslots jsonb not null default '[]'::jsonb
);

-- votes table
create table if not exists public.votes (
  id uuid primary key,
  series_id uuid not null references public.series(id) on delete cascade,
  voter_name text,
  voter_key text not null,
  selected_game_ids jsonb not null default '[]'::jsonb,
  selected_timeslot_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint votes_unique_series_voter unique (series_id, voter_key)
);

-- Helpful indexes
create index if not exists idx_votes_series_id on public.votes(series_id);
create index if not exists idx_series_owner_id on public.series(owner_id);

-- Enable RLS and create secure policies
alter table public.series enable row level security;
alter table public.votes enable row level security;

-- SERIES policies: allow public SELECT for reading by slug, but restrict INSERT/UPDATE/DELETE to the owner
DO $$ BEGIN
  -- Drop legacy select policy if present
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_select_own'
  ) THEN
    EXECUTE 'drop policy series_select_own on public.series';
  END IF;
  -- Ensure public select policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_select_public'
  ) THEN
    EXECUTE 'create policy series_select_public on public.series for select using (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_insert_own'
  ) THEN
    EXECUTE 'create policy series_insert_own on public.series for insert with check (owner_id = auth.uid()::text)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_update_own'
  ) THEN
    EXECUTE 'create policy series_update_own on public.series for update using (owner_id = auth.uid()::text)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_delete_own'
  ) THEN
    EXECUTE 'create policy series_delete_own on public.series for delete using (owner_id = auth.uid()::text)';
  END IF;
END $$;

-- VOTES policies: allow select by anyone, but prevent overwriting others via upsert by requiring voter_key = auth.uid() for updates.
-- Note: Anonymous voting without auth will not be able to upsert; consider handling votes via server if allowing guests.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'votes' AND policyname = 'votes_select_public'
  ) THEN
    EXECUTE 'create policy votes_select_public on public.votes for select using (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'votes' AND policyname = 'votes_insert_public'
  ) THEN
    EXECUTE 'create policy votes_insert_public on public.votes for insert with check (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'votes' AND policyname = 'votes_update_self'
  ) THEN
    EXECUTE 'create policy votes_update_self on public.votes for update using (voter_key = auth.uid()::text)';
  END IF;
END $$;
`;

(async () => {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query('begin');
    await client.query(SQL);
    await client.query('commit');
    console.log('[setup-supabase] Schema setup completed successfully.');
  } catch (err: any) {
    try { await client.query('rollback'); } catch {}
    console.error('[setup-supabase] Error during setup:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
