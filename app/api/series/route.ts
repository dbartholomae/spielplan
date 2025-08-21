import { NextRequest } from 'next/server';
import { store, type EventSeries } from 'lib/store';
import { isSupabaseEnabled } from 'lib/store';
import { createClient } from '@supabase/supabase-js';

async function getSupabaseUserId(req: NextRequest): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader) return null;
  const client = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let ownerId = searchParams.get('ownerId') ?? '';

  // In Supabase mode, prefer server-side auth to determine ownerId.
  if (isSupabaseEnabled) {
    const uid = await getSupabaseUserId(req);
    if (!uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
    }
    ownerId = uid;
  }

  if (!ownerId) return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });
  const items = await store.listSeriesByOwner(ownerId);
  return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, games, timeslots } = body as Partial<EventSeries>;

  let ownerId: string | undefined = (body as any)?.ownerId;

  // In Supabase mode, ignore client-supplied ownerId and require auth
  if (isSupabaseEnabled) {
    const uid = await getSupabaseUserId(req);
    if (!uid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
    }
    ownerId = uid;
  }

  if (!games || !Array.isArray(games) || games.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one game is required' }), { status: 400 });
  }
  if (!timeslots || !Array.isArray(timeslots) || timeslots.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one timeslot is required' }), { status: 400 });
  }
  const series = await store.createSeries({ ownerId, title, games, timeslots });
  return new Response(JSON.stringify(series), { headers: { 'content-type': 'application/json' }, status: 201 });
}
