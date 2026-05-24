// Data access layer. Every page reads/writes through these hooks/functions.
// All calls hit Supabase — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// in your environment. There is no mock fallback.

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { PHOTOS } from '../components/Photo';

if (!isSupabaseConfigured) {
  // Loud, dev-time warning. Pages will render empty if the queries can't
  // resolve, so surface the misconfiguration immediately rather than
  // silently degrading.
  console.warn(
    '[tw] Supabase not configured. Set VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

// Returns true if the supabase client is missing. Hooks use this to bail
// early so a misconfigured env yields empty data instead of throwing.
function noClient() {
  if (!supabase) {
    console.error(
      '[tw] Supabase client unavailable — request skipped. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart `vite`.'
    );
    return true;
  }
  return false;
}

// ─── shape converters ───────────────────────────────────────────────────────
// DB rows use snake_case + a `img` text key (matches PHOTOS map). UI expects
// `img` to be the resolved photo URL/asset.
function rowToListing(row) {
  const photos = Array.isArray(row.photos) ? row.photos : [];
  // Prefer the admin-uploaded hero (first photo) so every card/hero/thumb
  // reflects what was set in the studio. Fall back to the legacy `img` key
  // (which maps into the bundled PHOTOS catalogue) when no upload exists.
  const uploadedHero = photos[0]?.url || null;
  const fallbackImg = row.img && PHOTOS[row.img] ? PHOTOS[row.img] : row.img || null;
  return {
    id: row.id,
    addr: row.addr,
    street: row.street,
    loc: row.loc,
    price: row.price,
    specs: row.specs,
    status: row.status,
    tone: row.tone,
    tag: row.tag,
    blurb: row.blurb,
    img: uploadedHero || fallbackImg,
    imgKey: row.img,
    photos,
    beds: row.beds,
    baths: row.baths,
    sqft: row.sqft,
    lot: row.lot,
    built: row.built,
    renovated: row.renovated,
    architect: row.architect,
    listedAt: row.listed_at,
    tagline: row.tagline,
    summary: row.summary || [],
    attributes: row.attributes || [],
    area: row.area || { name: '', body: '', coords: '—', waterLabel: '', nearby: [] },
  };
}

function rowToLead(row) {
  return {
    id: row.id,
    name: `${row.first_name}${row.last_name ? ' ' + row.last_name : ''}`.trim(),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    type: row.role,
    entity: row.entity,
    city: row.city,
    referredBy: row.referred_by,
    status: row.status,
    tone: row.tone,
    stars: row.stars,
    summary: row.summary,
    mandateNotes: row.mandate_notes,
    studioNote: row.studio_note,
    studioNoteSavedAt: row.studio_note_saved_at,
    intake: row.intake || [],
    receivedAt: relativeTime(row.created_at),
    when: relativeTime(row.created_at, true),
    createdAt: row.created_at,
  };
}

function relativeTime(iso, short = false) {
  if (!iso) return '';
  const then = new Date(iso);
  // `now` is computed at row-mapping time, so the "today" / "yesterday"
  // bucket reflects when the row was rendered, not when the page first
  // mounted. Acceptable for short-lived admin views; if a session stays
  // open across midnight the label will be stale until the next refresh.
  const now = new Date();
  const diffMs = now - then;
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 24) {
    const fmt = then.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return short ? `Today · ${fmt}` : `today ${fmt}`;
  }
  if (hours < 48) {
    const fmt = then.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return short ? `Yesterday · ${fmt}` : `yesterday ${fmt}`;
  }
  return then.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Listings ──────────────────────────────────────────────────────────────
// Reads the studio's in-progress edit blob for a listing. Used by the
// preview route so admin tweaks render live without saving to the DB. The
// editor writes/clears this key; we just observe it.
export function usePreviewOverride(id) {
  const [override, setOverride] = useState(null);

  useEffect(() => {
    if (!id || typeof window === 'undefined') {
      setOverride(null);
      return undefined;
    }
    const key = `tw.preview.${id}`;
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        setOverride(raw ? JSON.parse(raw) : null);
      } catch {
        setOverride(null);
      }
    };
    read();
    function onStorage(e) {
      if (e.key === key) read();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [id]);

  return override;
}

export function useListing(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Sequence counter — every effect run bumps it and only commits state
  // when its own request is the latest, so out-of-order Supabase responses
  // can't paint a previous id's row on top of the current one.
  const reqRef = useRef(0);

  useEffect(() => {
    const myReq = ++reqRef.current;
    let alive = true;
    async function load() {
      if (!id) {
        if (alive && myReq === reqRef.current) { setData(null); setLoading(false); }
        return;
      }
      if (noClient()) {
        if (alive && myReq === reqRef.current) { setData(null); setLoading(false); }
        return;
      }
      setLoading(true);
      const { data: row, error: err } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!alive || myReq !== reqRef.current) return;
      if (err) console.error('[tw] listing fetch failed', err);
      setData(row ? rowToListing(row) : null);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [id]);

  return { data, loading };
}

// Page-aware fetch used by the public Listings + Sold pages. Only the rows
// for the current page round-trip to Supabase (range query), so adding more
// rows doesn't increase the initial payload.
//
// `sort` is { column: 'sort_order' | 'price_value' | …, ascending: boolean }.
// `price_value` is a stored generated column on `listings` that strips the
// text price down to a numeric, so server-side ordering works across pages.
export function usePagedListings({
  statusEquals,
  statusIn,
  statusNotIn,
  locContains,
  // When set, OR an additional clause: rows whose `loc` does NOT match any
  // of these substrings. Used by the "Other" area facet — combined with
  // locContains via OR so the row qualifies if it matches a selected named
  // area OR sits in none of the known areas.
  locNotInAll,
  query,
  page = 1,
  pageSize = 12,
  sort = { column: 'sort_order', ascending: true },
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const reqRef = useRef(0);

  // Stable string keys for the filter/sort — avoids re-fetching when the
  // caller creates a new array/object literal each render.
  const inKey    = (statusIn    || []).slice().sort().join(',');
  const notInKey = (statusNotIn || []).join(',');
  const locKey   = (locContains || []).slice().sort().join('|');
  const otherKey = (locNotInAll || []).slice().sort().join('|');
  const sortKey  = `${sort.column}:${sort.ascending ? 'asc' : 'desc'}`;
  const q        = (query || '').trim();

  useEffect(() => {
    const myReq = ++reqRef.current;
    let alive = true;
    async function load() {
      if (noClient()) {
        if (alive && myReq === reqRef.current) { setData([]); setTotal(0); setLoading(false); }
        return;
      }
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let req = supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
        // Stable secondary sort so listings with the same primary value
        // keep a deterministic order across pages.
        .order('id', { ascending: true })
        .range(from, to);
      if (statusEquals) req = req.eq('status', statusEquals);
      if (statusIn?.length) req = req.in('status', statusIn);
      if (statusNotIn?.length) {
        const list = statusNotIn.map(s => `"${s}"`).join(',');
        req = req.not('status', 'in', `(${list})`);
      }
      // Area filter: combine selected named areas (loc ilike substring) with
      // an optional "everything else" clause built as `and(not.ilike,...)`.
      // Both pieces are joined inside a single .or() so a row qualifies if
      // it matches any selected area OR sits outside every known area.
      if (locContains?.length || locNotInAll?.length) {
        const clauses = [];
        for (const n of (locContains || [])) {
          clauses.push(`loc.ilike.*${escapeOrToken(n)}*`);
        }
        if (locNotInAll?.length) {
          const negs = locNotInAll
            .map(n => `loc.not.ilike.*${escapeOrToken(n)}*`)
            .join(',');
          clauses.push(`and(${negs})`);
        }
        req = req.or(clauses.join(','));
      }
      if (q) {
        const safe = escapeOrToken(q);
        req = req.or(
          `addr.ilike.*${safe}*,street.ilike.*${safe}*,loc.ilike.*${safe}*,tag.ilike.*${safe}*`
        );
      }
      const { data: rows, count, error } = await req;
      // Drop out-of-order responses; only the latest request commits state.
      if (!alive || myReq !== reqRef.current) return;
      if (error) {
        console.error('[tw] paged listings fetch failed', error);
        setData([]);
        setTotal(0);
      } else {
        setData((rows || []).map(rowToListing));
        setTotal(count ?? 0);
      }
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [statusEquals, inKey, notInKey, locKey, otherKey, q, page, pageSize, sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { data, total, pageCount, loading };
}

// PostgREST `or()` parses several characters specially: commas separate
// clauses, parens delimit groups, dots split column/operator/value, colons
// rename aliases, asterisk + percent are wildcards, and backslash would
// escape any of the above. Reduce a user-supplied substring to a plain
// alphanumeric/space token so it can be safely interpolated into an
// `ilike.*…*` clause. Whitespace is preserved so multi-word searches still
// match across rows.
function escapeOrToken(s) {
  return String(s)
    // Strip every character with reserved meaning in PostgREST or() syntax.
    .replace(/[,()*:.\\%]/g, ' ')
    // Collapse runs of whitespace so the leading/trailing wildcards still
    // hug a single token.
    .replace(/\s+/g, ' ')
    .trim();
}

// Module-level cache for the per-status / per-loc rollup. Counts don't need
// to be real-time, so subsequent callers within the TTL window reuse the
// in-memory snapshot rather than firing another full-table scan.
const COUNTS_TTL_MS = 60_000;
const EMPTY_COUNTS = { All: 0, 'Coming Soon': 0, Active: 0, Pending: 0, Sold: 0, Draft: 0 };
let listingCountsCache = null;
let listingCountsInflight = null;

async function fetchListingCounts() {
  if (noClient()) return { counts: { ...EMPTY_COUNTS }, locCounts: {} };
  const { data: rows, error } = await supabase.from('listings').select('status, loc');
  if (error || !rows) {
    if (error) console.error('[tw] listing counts fetch failed', error);
    return { counts: { ...EMPTY_COUNTS }, locCounts: {} };
  }
  const next = { ...EMPTY_COUNTS, All: rows.length };
  const locNext = {};
  for (const r of rows) {
    next[r.status] = (next[r.status] || 0) + 1;
    if (r.loc) locNext[r.loc] = (locNext[r.loc] || 0) + 1;
  }
  return { counts: next, locCounts: locNext };
}

// One-shot facet count query. Subsequent calls within `COUNTS_TTL_MS` of
// the last fetch reuse the cached snapshot, so navigating between admin
// pages doesn't re-pull the table.
//
// Returns:
//   counts      = { All, Coming Soon, Active, Pending, Sold, Draft }
//   locCounts   = { 'Birmingham, MI': n, … }
export function useListingCounts() {
  const [snapshot, setSnapshot] = useState(() => listingCountsCache?.value
    || { counts: { ...EMPTY_COUNTS }, locCounts: {} });
  const [loading, setLoading] = useState(!listingCountsCache);

  useEffect(() => {
    let alive = true;
    const fresh = listingCountsCache && (Date.now() - listingCountsCache.at) < COUNTS_TTL_MS;
    if (fresh) {
      setSnapshot(listingCountsCache.value);
      setLoading(false);
      return () => { alive = false; };
    }
    setLoading(true);
    // Coalesce concurrent callers onto a single network round-trip.
    if (!listingCountsInflight) {
      listingCountsInflight = fetchListingCounts().then((value) => {
        listingCountsCache = { value, at: Date.now() };
        listingCountsInflight = null;
        return value;
      });
    }
    listingCountsInflight.then((value) => {
      if (!alive) return;
      setSnapshot(value);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  return { counts: snapshot.counts, locCounts: snapshot.locCounts, loading };
}

// Invalidate the counts cache — call from createListing/updateListing/
// deleteListing so the next read picks up fresh totals immediately.
function invalidateListingCounts() {
  listingCountsCache = null;
}

// Unfiltered total — count-only query (no rows fetched, just the header).
// Cheap enough to share between the admin sidebar badge and any other
// places that need "how many listings exist in total".
export function useListingTotal() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (noClient()) return;
      const { count, error } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true });
      if (!alive) return;
      if (error) console.error('[tw] listing total fetch failed', error);
      else setTotal(count ?? 0);
    }
    load();
    return () => { alive = false; };
  }, []);

  return total;
}

// Targeted paged query — pulls only `limit` rows that exclude the current
// listing + sold rows. Replaces the prior implementation which loaded the
// entire listings table client-side just to render 3 cards.
export function useRelatedListings(currentId, limit = 3) {
  const [data, setData] = useState([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!currentId || noClient()) return;
      let req = supabase
        .from('listings')
        .select('*')
        .neq('status', 'Sold')
        .neq('status', 'Draft')
        .order('sort_order', { ascending: true })
        .limit(limit + 1); // +1 in case the current id sneaks in
      req = req.neq('id', currentId);
      const { data: rows, error } = await req;
      if (!alive) return;
      if (error) { console.error('[tw] related listings failed', error); return; }
      setData((rows || []).slice(0, limit).map(rowToListing));
    }
    load();
    return () => { alive = false; };
  }, [currentId, limit]);

  return data;
}

// Lightweight featured-listings query for the public Landing page. Pulls a
// few active rows, ordered by sort_order, so the home page doesn't need to
// load the full table just to render three cards.
export function useFeaturedListings(limit = 3) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (noClient()) { setLoading(false); return; }
      const { data: rows, error } = await supabase
        .from('listings')
        .select('*')
        .not('status', 'in', '("Sold","Draft")')
        .order('sort_order', { ascending: true })
        .limit(limit);
      if (!alive) return;
      if (error) console.error('[tw] featured listings fetch failed', error);
      setData((rows || []).map(rowToListing));
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [limit]);

  return { data, loading };
}

export async function createListing(input) {
  const cleanedId = (input.id || slugify(input.addr || input.name || ''));
  const payload = {
    id: cleanedId,
    addr: input.addr || input.name,
    street: input.street || input.address,
    loc: input.loc || input.city,
    price: input.price,
    specs: input.specs || buildSpecs(input),
    status: input.status || 'Draft',
    tone: input.tone || 'warm',
    tag: input.tag || null,
    blurb: input.blurb || input.description || null,
    img: input.img || null,
    beds: input.beds || null,
    baths: input.baths || null,
    sqft: input.sqft || null,
    lot: input.lot || null,
    photos: Array.isArray(input.photos) ? input.photos : [],
    sort_order: input.sort_order || 200,
  };
  if (noClient()) return { data: null, error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.from('listings').insert(payload).select().single();
  if (error) console.error('[tw] listing insert failed', error);
  if (!error) invalidateListingCounts();
  return { data, error };
}

export async function updateListingStatus(id, status) {
  if (noClient()) return { data: null, error: { message: 'Supabase not configured' } };
  const result = await supabase.from('listings').update({ status }).eq('id', id).select().single();
  if (!result.error) invalidateListingCounts();
  return result;
}

// Full-field update for an existing listing. Field names mirror createListing
// (UI camelCase) and are mapped to the DB columns in the same way.
export async function updateListing(id, input) {
  const payload = {
    addr: input.addr || input.name,
    street: input.street || input.address,
    loc: input.loc || input.city,
    price: input.price,
    specs: input.specs || buildSpecs(input),
    status: input.status,
    tone: input.tone,
    tag: input.tag ?? null,
    blurb: input.blurb ?? input.description ?? null,
    img: input.img ?? null,
    beds: input.beds ?? null,
    baths: input.baths ?? null,
    sqft: input.sqft ?? null,
    lot: input.lot ?? null,
    photos: Array.isArray(input.photos) ? input.photos : [],
  };
  if (noClient()) return { data: null, error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.from('listings').update(payload).eq('id', id).select().single();
  if (error) console.error('[tw] listing update failed', error);
  if (!error) invalidateListingCounts();
  return { data, error };
}

export async function deleteListing(id) {
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) console.error('[tw] listing delete failed', error);
  if (!error) invalidateListingCounts();
  return { error };
}

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `listing-${Date.now()}`;
}

function buildSpecs(input) {
  const parts = [];
  if (input.beds) parts.push(`${input.beds} BD`);
  if (input.baths) parts.push(`${input.baths} BA`);
  if (input.sqft) parts.push(`${input.sqft} SF`);
  if (input.lot && input.lot !== '—') parts.push(input.lot);
  return parts.join(' · ');
}

// Page-aware fetch for the admin Leads inbox. Filters by role/status via
// .in() arrays (empty array = no filter), sorts on the server via the
// `status_rank` generated column for the "By Status" sort.
const LEAD_SORT_COLUMN = {
  status: 'status_rank',
  date:   'created_at',
  type:   'role',
  name:   'first_name',
};

// Unfiltered total — used by the inbox helper text ("2 matches in 9 leads").
// Module-level cache mirrors the listing-counts pattern so a fresh insert or
// status update can invalidate the cached count and the sidebar badge picks
// up the new value on the next mount.
const LEAD_TOTAL_TTL_MS = 60_000;
let leadTotalCache = null; // { value, at }
let leadTotalInflight = null;

function invalidateLeadTotal() {
  leadTotalCache = null;
}

async function fetchLeadTotal() {
  if (noClient()) return 0;
  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true });
  if (error) {
    console.error('[tw] lead total fetch failed', error);
    return 0;
  }
  return count ?? 0;
}

export function useLeadTotal() {
  const [total, setTotal] = useState(() => leadTotalCache?.value ?? 0);

  useEffect(() => {
    let alive = true;
    const fresh = leadTotalCache && (Date.now() - leadTotalCache.at) < LEAD_TOTAL_TTL_MS;
    if (fresh) {
      setTotal(leadTotalCache.value);
      return () => { alive = false; };
    }
    if (!leadTotalInflight) {
      leadTotalInflight = fetchLeadTotal().then((value) => {
        leadTotalCache = { value, at: Date.now() };
        leadTotalInflight = null;
        return value;
      });
    }
    leadTotalInflight.then((value) => {
      if (!alive) return;
      setTotal(value);
    });
    return () => { alive = false; };
  }, []);

  return total;
}

export function usePagedLeads({
  roleIn = [],
  statusIn = [],
  query,
  page = 1,
  pageSize = 12,
  sort = 'status',
  sortDir = 'asc',
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const reqRef = useRef(0);

  const rolesKey = (roleIn || []).slice().sort().join(',');
  const statusesKey = (statusIn || []).slice().sort().join(',');
  const q = (query || '').trim();

  useEffect(() => {
    const myReq = ++reqRef.current;
    let alive = true;
    async function load() {
      if (noClient()) {
        if (alive && myReq === reqRef.current) { setData([]); setTotal(0); setLoading(false); }
        return;
      }
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const column = LEAD_SORT_COLUMN[sort] || 'created_at';
      let req = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order(column, { ascending: sortDir === 'asc', nullsFirst: false })
        // Stable secondary order so equal primary values keep their slot.
        .order('id', { ascending: true })
        .range(from, to);
      if (roleIn?.length)   req = req.in('role',   roleIn);
      if (statusIn?.length) req = req.in('status', statusIn);
      if (q) {
        const safe = escapeOrToken(q);
        req = req.or(
          `first_name.ilike.*${safe}*,last_name.ilike.*${safe}*,email.ilike.*${safe}*,summary.ilike.*${safe}*`
        );
      }
      const { data: rows, count, error } = await req;
      if (!alive || myReq !== reqRef.current) return;
      if (error) {
        console.error('[tw] paged leads fetch failed', error);
        setData([]);
        setTotal(0);
      } else {
        setData((rows || []).map(rowToLead));
        setTotal(count ?? 0);
      }
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [rolesKey, statusesKey, q, page, pageSize, sort, sortDir]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { data, total, pageCount, loading };
}

// ─── Leads ──────────────────────────────────────────────────────────────────
export function useLead(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (noClient()) { setData(null); setLoading(false); return; }
    setLoading(true);
    const { data: row, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) console.error('[tw] lead fetch failed', error);
    if (row) {
      const lead = rowToLead(row);
      setData({
        ...lead,
        number: String(row.id).slice(0, 2).toUpperCase(),
      });
    } else {
      setData(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

// Paginated fetch of lead_events for a single lead. Used by the studio log
// to "infinite scroll" inside a bounded container — each call to loadMore
// fetches the next `pageSize` events (newest-first) and appends them. The
// `bumpKey` argument lets the parent force a refetch (e.g. after writing a
// new event) without re-mounting the hook.
export function useLeadEvents(leadId, { pageSize = 15, bumpKey = 0 } = {}) {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const reqRef = useRef(0);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Whenever the lead changes (or a write bumps the key) reset to page 0.
  useEffect(() => {
    setEvents([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
  }, [leadId, bumpKey]);

  useEffect(() => {
    if (!leadId) { setLoading(false); return; }
    if (noClient()) { setLoading(false); return; }
    const myReq = ++reqRef.current;
    let alive = true;
    async function load() {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data: rows, error } = await supabase
        .from('lead_events')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .range(from, to);
      // Drop late responses (e.g. user scrolled quickly across two pages
      // before the first request landed) so we never double-append.
      if (!alive || myReq !== reqRef.current) return;
      if (error) {
        console.error('[tw] lead events fetch failed', error);
        setHasMore(false);
        setLoading(false);
        return;
      }
      setEvents(prev => page === 0 ? (rows || []) : [...prev, ...(rows || [])]);
      setHasMore((rows || []).length === pageSize);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [leadId, page, pageSize, bumpKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage(p => p + 1);
  }, [loading, hasMore]);

  return { events, hasMore, loading, loadMore };
  /* eslint-enable react-hooks/set-state-in-effect */
}

export async function updateLeadStatus(id, status, previousStatus) {
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (!error) invalidateLeadTotal();
  if (!error && previousStatus !== status) {
    await supabase.from('lead_events').insert({
      lead_id: id, kind: 'status',
      previous_value: previousStatus || null,
      next_value: status,
    });
  }
  return { error };
}

export async function updateLeadNote(id, studioNote, previousNote) {
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  const { error } = await supabase
    .from('leads')
    .update({ studio_note: studioNote, studio_note_saved_at: new Date().toISOString() })
    .eq('id', id);
  if (!error) {
    await supabase.from('lead_events').insert({
      lead_id: id, kind: 'note',
      previous_value: previousNote || null,
      next_value: studioNote || null,
    });
  }
  return { error };
}

export async function detachListing(leadId, listingId) {
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  return supabase
    .from('attached_listings')
    .delete()
    .eq('lead_id', leadId)
    .eq('listing_id', listingId);
}

// ─── Form submission ────────────────────────────────────────────────────────
// Each public-form submission inserts straight into `leads`. The intake JSON
// on the lead captures the full Q/A breakdown; mandate_notes captures the
// free-text fields. No separate audit table.
export async function submitInquiry({ role, name, email, phone, contact, payload, message }) {
  const leadInsert = inquiryToLead({ role, name, email, phone, contact, payload, message });
  if (noClient()) return { data: null, error: { message: 'Supabase not configured' } };
  // Don't chain .select() — anon has INSERT but no SELECT on leads, so
  // a RETURNING * round-trip would fail RLS. We only need success/error.
  const { error } = await supabase.from('leads').insert(leadInsert);
  if (error) console.error('[tw] lead insert failed', error);
  if (!error) invalidateLeadTotal();
  return { data: null, error };
}

const ROLE_CAP = { buyer: 'Buyer', seller: 'Seller', investor: 'Investor', agent: 'Agent' };
const ROLE_TONE = { buyer: 'warm', seller: 'bone', investor: 'dusk', agent: 'sage' };

// Pull common fields out of a form payload to populate a `leads` row.
function inquiryToLead({ role, name, email, phone, contact, payload, message }) {
  const [firstName, ...rest] = String(name || '').trim().split(/\s+/);
  const lastName = rest.join(' ') || null;

  // Prefer explicit email/phone (current form). Fall back to a legacy
  // single "contact" string if a caller is still on the old signature.
  let emailVal = (email || '').trim() || null;
  let phoneVal = (phone || '').trim() || null;
  if (!emailVal && !phoneVal && contact) {
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    emailVal = looksLikeEmail ? contact : null;
    phoneVal = looksLikeEmail ? null    : contact;
  }

  const fields = (payload && payload.fields) || {};
  const chips = (payload && payload.chips) || {};
  const budgets = (payload && payload.budgets) || {};
  const notes = (payload && payload.notes) || {};

  const entity = fields['Entity'] || fields['Brokerage / org'] || null;
  // The form doesn't ask for "city" explicitly, but a few labels carry one:
  const city = fields['City, State'] || fields['City'] || null;

  // One-line inbox summary: pull a handful of the most informative fields.
  const summaryParts = [];
  for (const key of ['Household', 'Property type', 'Investor type', 'I am a…', 'Hold horizon', 'Time frame to buy', 'Time frame to sell']) {
    if (fields[key]) summaryParts.push(fields[key]);
  }
  for (const list of Object.values(chips)) {
    if (Array.isArray(list) && list.length) {
      summaryParts.push(list.slice(0, 3).join(' · '));
      break;
    }
  }
  for (const b of Object.values(budgets)) {
    if (b && b.display) { summaryParts.push(b.display); break; }
  }
  const summary = summaryParts.length ? summaryParts.join(' · ') : (message ? message.slice(0, 160) : null);

  // The intake list rendered on the lead detail page. The multi-select
  // dropdowns ("Other → please specify") write their typed value into a
  // companion field named "<label> — other"; fold those into the chip
  // entry so the studio sees one row per question, not two.
  const OTHER_SUFFIX = ' — other';
  const intake = [];
  for (const [q, a] of Object.entries(fields)) {
    if (!a) continue;
    if (q === 'Name' || q === 'Email' || q === 'Phone' || q === 'Best contact') continue;
    // Skip "<label> — other" rows; they get folded into the chip entry below.
    if (q.endsWith(OTHER_SUFFIX)) continue;
    intake.push({ q, a });
  }
  for (const [q, arr] of Object.entries(chips)) {
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const otherText = (fields[`${q}${OTHER_SUFFIX}`] || '').trim();
    const items = arr.map(v => (v === 'Other' && otherText) ? `Other: ${otherText}` : v);
    intake.push({ q, a: items.join(' · ') });
  }
  for (const [q, b] of Object.entries(budgets)) {
    if (b && b.display) intake.push({ q, a: b.display });
  }
  const mandateNotes = Object.values(notes).filter(Boolean).join('\n\n') || null;

  // Public RLS grants anon INSERT only on the columns below. `status`,
  // `stars`, `studio_note`, and `referred_by` are studio-only fields and
  // fall back to their DB defaults (status='New', stars=0, others null).
  return {
    first_name: firstName || 'Unknown',
    last_name: lastName,
    email: emailVal,
    phone: phoneVal,
    role: ROLE_CAP[role] || 'Buyer',
    entity,
    city,
    tone: ROLE_TONE[role] || 'warm',
    summary,
    mandate_notes: mandateNotes,
    intake,
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  // Auth is Supabase-only. The previous env-var "demo" branch shipped the
  // password in the public Vite bundle (anything VITE_* is inlined), so it
  // has been removed.
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

// Auth state has three values: 'checking' (initial, before getSession
// resolves), true (signed in), false (signed out). RequireAdmin renders a
// neutral loader on 'checking' so the admin pages never flash before the
// redirect-to-login decision is made.
export function useIsAdmin() {
  const [admin, setAdmin] = useState('checking');

  useEffect(() => {
    if (!supabase) { setAdmin(false); return undefined; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setAdmin(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!alive) return;
      setAdmin(!!session);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return admin;
}
