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

function makeId(len = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export class InMemoryStore {
  private seriesBySlug = new Map<string, EventSeries>();
  private seriesByOwner = new Map<string, EventSeries[]>();
  private votesBySeries = new Map<string, Vote[]>();

  async createSeries(input: Omit<EventSeries, 'id' | 'slug' | 'createdAt'>): Promise<EventSeries> {
    let slug = makeId(6);
    while (this.seriesBySlug.has(slug)) slug = makeId(6);
    const series: EventSeries = {
      ...input,
      id: crypto.randomUUID(),
      slug,
      createdAt: new Date().toISOString(),
    };
    this.seriesBySlug.set(slug, series);
    if (series.ownerId) {
      const list = this.seriesByOwner.get(series.ownerId) ?? [];
      list.push(series);
      this.seriesByOwner.set(series.ownerId, list);
    }
    return series;
  }

  async listSeriesByOwner(ownerId: string): Promise<EventSeries[]> {
    return (this.seriesByOwner.get(ownerId) ?? [])
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getSeries(slug: string): Promise<EventSeries | undefined> {
    return this.seriesBySlug.get(slug);
  }

  async addVote(vote: Omit<Vote, 'id' | 'createdAt'>): Promise<Vote> {
    const v: Vote = { ...vote, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const list = this.votesBySeries.get(v.seriesId) ?? [];
    // Replace if same voterKey to prevent duplicates
    const existingIdx = list.findIndex(x => x.voterKey === v.voterKey);
    if (existingIdx >= 0) list.splice(existingIdx, 1, v); else list.push(v);
    this.votesBySeries.set(v.seriesId, list);
    return v;
  }

  async listVotes(seriesId: string): Promise<Vote[]> {
    return (this.votesBySeries.get(seriesId) ?? []).slice();
  }
}

export const store = new InMemoryStore();
