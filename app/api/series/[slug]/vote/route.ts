import { NextRequest } from 'next/server';
import { store, isSupabaseEnabled } from 'lib/store';
import { createClient } from '@supabase/supabase-js';

// Minimal date-time formatter for server-side usage
function formatIso(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  try {
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return d.toISOString();
  }
}

async function getOwnerEmail(ownerId?: string): Promise<string | null> {
  if (!ownerId) return null;
  // Only attempt if Supabase is configured and service role key is present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  try {
    const admin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await admin.auth.admin.getUserById(ownerId);
    if (error) return null;
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

async function sendResendEmail(to: string, subject: string, html: string, text?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };
  const payload = {
    from: process.env.RESEND_FROM || 'onboarding@resend.dev',
    to: [to],
    subject,
    html,
    text,
  } as any;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

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
  if ((selectedGameIds?.length ?? 0) === 0 || (selectedTimeslotIds?.length ?? 0) === 0) {
    return new Response(JSON.stringify({ error: 'At least one game and one timeslot required' }), { status: 400 });
  }
  const key = series?.id ?? params.slug;
  const vote = await store.addVote({ seriesId: key, voterKey, voterName, selectedGameIds, selectedTimeslotIds });

  // Best-effort: email the series owner with a summary of the vote
  try {
    const ownerEmail = (isSupabaseEnabled && series?.ownerId) ? await getOwnerEmail(series.ownerId) : null;
    if (ownerEmail && series) {
      const gameNames = (series.games || [])
        .filter(g => selectedGameIds.includes(g.id))
        .map(g => `• ${g.name}`);
      const times = (series.timeslots || [])
        .filter(ts => selectedTimeslotIds.includes(ts.id))
        .map(ts => `• ${formatIso(ts.startsAt)}${ts.endsAt ? ` - ${new Date(ts.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`);
      const voter = (voterName && voterName.trim()) ? voterName.trim() : 'Anonymous';
      const title = series.title || 'Game series';
      const subject = `New vote for ${title}`;
      const html = `
        <div>
          <p><strong>${voter}</strong> submitted a vote for <strong>${title}</strong>.</p>
          <p><strong>Games:</strong><br/>${gameNames.length ? gameNames.join('<br/>') : '(none)'}</p>
          <p><strong>Timeslots:</strong><br/>${times.length ? times.join('<br/>') : '(none)'}</p>
        </div>
      `;
      const text = `${voter} submitted a vote for ${title}\n\nGames:\n${gameNames.join('\n') || '(none)'}\n\nTimeslots:\n${times.join('\n') || '(none)'}\n`;
      await sendResendEmail(ownerEmail, subject, html, text);
    }
  } catch {
    // Ignore email errors
  }

  return new Response(JSON.stringify(vote), { headers: { 'content-type': 'application/json' }, status: 201 });
}
