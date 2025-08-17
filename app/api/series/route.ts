import { NextRequest } from 'next/server';
import { createSeries, listSeriesByOwner, EventSeries } from 'lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId') ?? '';
  if (!ownerId) return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });
  const items = listSeriesByOwner(ownerId);
  return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ownerId, title, games, timeslots } = body as Partial<EventSeries> & { ownerId?: string };
  if (!games || !Array.isArray(games) || games.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one game is required' }), { status: 400 });
  }
  if (!timeslots || !Array.isArray(timeslots) || timeslots.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one timeslot is required' }), { status: 400 });
  }
  const series = createSeries({ ownerId, title, games, timeslots });
  return new Response(JSON.stringify(series), { headers: { 'content-type': 'application/json' }, status: 201 });
}
