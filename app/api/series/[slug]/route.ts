import { NextRequest } from 'next/server';
import { store } from 'lib/store';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const series = await store.getSeries(params.slug);
  if (!series) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(series), { headers: { 'content-type': 'application/json' } });
}
