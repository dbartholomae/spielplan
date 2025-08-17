import { NextRequest } from 'next/server';
import { store } from 'lib/store';

// Note: We intentionally allow voting even if the in-memory series map isn't present
// (e.g., after a hot reload or on serverless instances). In that case, we fall back
// to using the slug as the votes key so submissions don't 404.
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const series = await store.getSeries(params.slug);
  const key = series?.id ?? params.slug;
  const votes = await store.listVotes(key);
  return new Response(JSON.stringify({ votes }), { headers: { 'content-type': 'application/json' } });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const series = await store.getSeries(params.slug);
  const body = await req.json();
  const { voterKey, voterName, selectedGameIds, selectedTimeslotIds } = body as {
    voterKey: string; voterName?: string; selectedGameIds: string[]; selectedTimeslotIds: string[];
  };
  if (!voterKey) return new Response(JSON.stringify({ error: 'voterKey required' }), { status: 400 });
  if (!Array.isArray(selectedGameIds) || !Array.isArray(selectedTimeslotIds)) {
    return new Response(JSON.stringify({ error: 'Invalid selections' }), { status: 400 });
  }
  const key = series?.id ?? params.slug;
  const vote = await store.addVote({ seriesId: key, voterKey, voterName, selectedGameIds, selectedTimeslotIds });
  return new Response(JSON.stringify(vote), { headers: { 'content-type': 'application/json' }, status: 201 });
}
