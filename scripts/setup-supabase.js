#!/usr/bin/env node
/*
  Supabase schema setup script
  - Creates tables: public.series, public.votes
  - Adds constraints and indexes
  - Enables RLS and adds permissive policies for select/insert (and upsert for votes)

  Usage:
    SUPABASE_DB_URL=postgres://USER:PASSWORD@HOST:PORT/dbname pnpm setup:supabase

  Note:
    This connects directly to the Postgres instance behind Supabase.
*/

const { Client } = require('pg');

const url = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('[setup-supabase] Missing SUPABASE_DB_URL (or POSTGRES_URL/DATABASE_URL).');
  console.error('Please set SUPABASE_DB_URL to your Supabase connection string.');
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

-- Enable RLS and create permissive policies
alter table public.series enable row level security;
alter table public.votes enable row level security;

-- Policies (idempotent creation):
-- We use DO blocks to avoid errors if policies exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_select_public'
  ) THEN
    EXECUTE 'create policy series_select_public on public.series for select using (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'series_insert_public'
  ) THEN
    EXECUTE 'create policy series_insert_public on public.series for insert with check (true)';
  END IF;
END $$;

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
  } catch (err) {
    try { await client.query('rollback'); } catch {}
    console.error('[setup-supabase] Error during setup:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
