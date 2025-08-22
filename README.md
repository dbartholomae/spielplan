# Spielplan – Board‑Game Scheduler (Next.js + optional Supabase)

A playful Doodle‑like scheduler to find days and times to play board games. Create a series, pick games via BoardGameGeek autocomplete, choose timeslots, and share a public link for friends to vote on games and availability.

## Features
- Select one or more board games via an autocomplete powered by BGG XML API2 (proxied server‑side).
- Add potential dates and time slots.
- Generate a public shareable link where anyone can select preferred games and timeslots without an account.
- Optional sign‑in with Supabase (GitHub OAuth). If not configured, the app works in guest mode using a local owner key.
- Playful, board‑game‑inspired UI.

## Getting Started (Local)

1. Install dependencies (pnpm):

   pnpm install

2. (Optional) Create a `.env.local` file to enable Supabase auth and email sending (Resend):

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Resend API key (used to email the series owner when a vote is submitted)
   RESEND_API_KEY=re_...
   # Optional: set a custom verified sender (defaults to onboarding@resend.dev)
   RESEND_FROM=noreply@yourdomain.com

   If not set, the app will run in guest mode and skip emails.

3. Run the development server:

   pnpm dev

4. Open http://localhost:3000
   - Click "Create new" to set up a series (select games, add timeslots) and you’ll be redirected to a public link.
   - Share that link with friends so they can submit availability.

## Data Storage
This starter uses an in‑memory store (see `lib/store.ts`). Data resets on server restart and is not shared across instances.

If you set Supabase environment variables, the app will use Supabase. You must provision the tables first (no automatic fallback). Run the setup script:

1. Create `.env.local` with:

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   And set a Postgres connection string (from Supabase project -> Settings -> Database -> Connection string):

   SUPABASE_DB_URL=postgres://USER:PASSWORD@HOST:PORT/dbname

2. Install deps and run setup:

   pnpm install
   pnpm setup:supabase

After this, restart the dev server and the API will read/write to Supabase.

## API Endpoints
- `GET /api/bgg-search?q=term` – Proxy to BGG XML API2 returning `{ items: [{ id, name, thumbnail }] }`.
- `GET /api/series?ownerId=...` – List series by owner.
- `POST /api/series` – Create a series: `{ ownerId, title, games, timeslots }`.
- `GET /api/series/[slug]` – Get series by slug.
- `POST /api/series/[slug]/vote` – Submit availability: `{ voterKey, voterName?, selectedGameIds, selectedTimeslotIds }`.

## Notes
- Replace the in‑memory store with Supabase for persistence. A minimal schema would include tables for series, games, timeslots, and votes.
- The app directory uses Next.js 14 route handlers and client components for the UI.
- Vercel Analytics is enabled via @vercel/analytics. It automatically collects traffic analytics on Vercel deployments; in local dev it remains inactive.
