// Simple in-memory store for event series and votes.
// Note: This is ephemeral. In production, we can use Supabase tables via SupabaseStore below.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

export class SupabaseStore {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  private isMissingTableError(err: any): boolean {
    const code = err?.code || err?.details?.code;
    const msg = String(err?.message || '').toLowerCase();
    return code === 'PGRST205' || code === '42P01' || msg.includes('could not find the table') || (msg.includes('relation') && msg.includes('does not exist'));
  }

  private throwSchemaError(context: string, err: any): never {
    if (this.isMissingTableError(err)) {
      throw new Error(`[SupabaseStore] Missing required tables. Please run: pnpm setup:supabase (context: ${context})`);
    }
    throw new Error(`[SupabaseStore] ${context} failed: ${err?.message || String(err)}`);
  }

  private mapSeriesRow(row: any): EventSeries {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title ?? undefined,
      ownerId: row.owner_id ?? undefined,
      createdAt: row.created_at,
      games: row.games ?? [],
      timeslots: row.timeslots ?? [],
    } as EventSeries;
  }

  async createSeries(input: Omit<EventSeries, 'id' | 'slug' | 'createdAt'>): Promise<EventSeries> {
    // Ensure unique slug (best-effort)
    let slug = makeId(6);
    for (let i = 0; i < 5; i++) {
      const { data: existing, error: checkErr } = await this.client
        .from('series')
        .select('slug')
        .eq('slug', slug)
        .limit(1);
      if (checkErr) break; // tolerate check errors; proceed to attempt insert
      if (!existing || existing.length === 0) break;
      slug = makeId(6);
    }
    const series: EventSeries = {
      ...(input as any),
      id: crypto.randomUUID(),
      slug,
      createdAt: new Date().toISOString(),
    };
    const { error } = await this.client.from('series').insert({
      id: series.id,
      slug: series.slug,
      title: series.title ?? null,
      owner_id: series.ownerId ?? null,
      created_at: series.createdAt,
      games: series.games,
      timeslots: series.timeslots,
    });
    if (error) {
      this.throwSchemaError('createSeries', error);
    }
    return series;
  }

  async listSeriesByOwner(ownerId: string): Promise<EventSeries[]> {
    const { data, error } = await this.client
      .from('series')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) {
      this.throwSchemaError('listSeriesByOwner', error);
    }
    return (data ?? []).map((row: any) => this.mapSeriesRow(row));
  }

  async getSeries(slug: string): Promise<EventSeries | undefined> {
    const { data, error } = await this.client
      .from('series')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();
    if (error) {
      this.throwSchemaError('getSeries', error);
    }
    if (!data) return undefined;
    return this.mapSeriesRow(data);
  }

  async addVote(vote: Omit<Vote, 'id' | 'createdAt'>): Promise<Vote> {
    const v: Vote = { ...vote, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const { error: upErr } = await this.client.from('votes').upsert({
      id: v.id,
      series_id: v.seriesId,
      voter_name: v.voterName ?? null,
      voter_key: v.voterKey,
      selected_game_ids: v.selectedGameIds,
      selected_timeslot_ids: v.selectedTimeslotIds,
      created_at: v.createdAt,
    }, { onConflict: 'series_id,voter_key' });
    if (upErr) {
      this.throwSchemaError('addVote', upErr);
    }
    return v;
  }

  async listVotes(seriesId: string): Promise<Vote[]> {
    const { data, error } = await this.client
      .from('votes')
      .select('id, series_id, voter_name, voter_key, selected_game_ids, selected_timeslot_ids, created_at')
      .eq('series_id', seriesId);
    if (error) {
      this.throwSchemaError('listVotes', error);
    }
    return (data ?? []).map((row: any) => ({
      id: row.id,
      seriesId: row.series_id,
      voterName: row.voter_name ?? undefined,
      voterKey: row.voter_key,
      selectedGameIds: row.selected_game_ids ?? [],
      selectedTimeslotIds: row.selected_timeslot_ids ?? [],
      createdAt: row.created_at,
    } as Vote));
  }
}

// Choose store implementation based on environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let storeImpl: InMemoryStore | SupabaseStore;
if (supabaseUrl && supabaseKey) {
  const client = createClient(supabaseUrl, supabaseKey);
  storeImpl = new SupabaseStore(client);
  console.log('[Store] Using SupabaseStore');
} else {
  storeImpl = new InMemoryStore();
  console.warn('[Store] Using InMemoryStore (no Supabase env vars set)');
}

export const store = storeImpl;
