import { NextRequest } from 'next/server';
import { store, isSupabaseEnabled } from 'lib/store';
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

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const series = await store.getSeries(params.slug);
  if (!series) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(series), { headers: { 'content-type': 'application/json' } });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  if (isSupabaseEnabled) {
    // Supabase mode: strict checks with accurate 404/403
    const series = await (store as any).getSeries(slug);
    if (!series) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }
    const uid = await getSupabaseUserId(req);
    if (!uid) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
    if ((series.ownerId ?? undefined) && series.ownerId !== uid) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
    }
    const ok = await (store as any).deleteSeries(slug, uid);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }
    return new Response(null, { status: 204 });
  } else {
    // Guest (in-memory) mode: instances may not share memory. Be idempotent.
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('ownerId') ?? '';
    if (!owner) return new Response(JSON.stringify({ error: 'ownerId required' }), { status: 400, headers: { 'content-type': 'application/json' } });
    try {
      await (store as any).deleteSeries(slug, owner);
    } catch {}
    // Always return 204 to keep deletion idempotent even if this server instance
    // does not have the in-memory record (e.g., after reload or on serverless).
    return new Response(null, { status: 204 });
  }
}
