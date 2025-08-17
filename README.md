# Spielplan - Next.js + Supabase (Hello World)

This is a minimal Next.js app configured with Supabase client and ready for deployment on Vercel.

## Getting Started (Local)

1. Install dependencies (pnpm):

   pnpm install

2. Create a `.env.local` file in the project root and set the following:

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

3. Run the development server:

   pnpm dev

Then open http://localhost:3000 in your browser. You should see "Hello, Next.js + Supabase" and a Supabase status indicator.

## Deploying to Vercel

- Vercel automatically uses pnpm when `pnpm-lock.yaml` is present. If you deploy without a lockfile, you can set the project’s install command to `pnpm install` and build command to `pnpm run build` in Vercel settings.

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel and select the framework "Next.js" (auto-detected).
3. In Vercel Project Settings -> Environment Variables, add:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy.

## Notes
- The Supabase client is initialized from `lib/supabaseClient.ts` and used in a small client component `components/SupabaseStatus.tsx` to verify configuration.
- No database schema is required for this hello-world example.
