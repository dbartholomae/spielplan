import { NextRequest } from 'next/server';
import { store, type EventSeries } from 'lib/store';
import { isSupabaseEnabled } from 'lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId') ?? '';

  // In Supabase mode, do not allow client-driven ownerId listing without server-side auth.
  if (isSupabaseEnabled) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  if (!ownerId) return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });
  const items = await store.listSeriesByOwner(ownerId);
  return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ownerId, title, games, timeslots } = body as Partial<EventSeries> & { ownerId?: string };

  // In Supabase mode, refuse client-supplied ownerId without server-side auth
  if (isSupabaseEnabled) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
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
