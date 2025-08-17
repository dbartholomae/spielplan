// Simple in-memory store for event series and votes.
// Note: This is ephemeral. In production, replace with a real database (e.g., Supabase tables).

export type BggGame = {
  id: string; // BGG ID as string
  name: string;
  thumbnail?: string;
};

export type Timeslot = {
  id: string; // uuid
  startsAt: string; // ISO string
  endsAt?: string; // ISO string (optional)
};

export type EventSeries = {
  id: string; // uuid
  slug: string; // short shareable code
  title?: string;
  ownerId?: string; // supabase user id or guest id
  createdAt: string; // ISO
  games: BggGame[];
  timeslots: Timeslot[];
};

export type Vote = {
  id: string; // uuid
  seriesId: string;
  voterName?: string;
  voterKey: string; // cookie-based anon key or auth user id
  selectedGameIds: string[];
  selectedTimeslotIds: string[];
  createdAt: string;
};

const seriesBySlug = new Map<string, EventSeries>();
const seriesByOwner = new Map<string, EventSeries[]>();
const votesBySeries = new Map<string, Vote[]>();

function makeId(len = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function createSeries(input: Omit<EventSeries, 'id' | 'slug' | 'createdAt'>): EventSeries {
  let slug = makeId(6);
  while (seriesBySlug.has(slug)) slug = makeId(6);
  const series: EventSeries = {
    ...input,
    id: crypto.randomUUID(),
    slug,
    createdAt: new Date().toISOString(),
  };
  seriesBySlug.set(slug, series);
  if (series.ownerId) {
    const list = seriesByOwner.get(series.ownerId) ?? [];
    list.push(series);
    seriesByOwner.set(series.ownerId, list);
  }
  return series;
}

export function listSeriesByOwner(ownerId: string): EventSeries[] {
  return (seriesByOwner.get(ownerId) ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSeries(slug: string): EventSeries | undefined {
  return seriesBySlug.get(slug);
}

export function addVote(vote: Omit<Vote, 'id' | 'createdAt'>): Vote {
  const v: Vote = { ...vote, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const list = votesBySeries.get(v.seriesId) ?? [];
  // Replace if same voterKey to prevent duplicates
  const existingIdx = list.findIndex(x => x.voterKey === v.voterKey);
  if (existingIdx >= 0) list.splice(existingIdx, 1, v); else list.push(v);
  votesBySeries.set(v.seriesId, list);
  return v;
}

export function listVotes(seriesId: string): Vote[] {
  return (votesBySeries.get(seriesId) ?? []).slice();
}
