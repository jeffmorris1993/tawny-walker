// Data access layer. Every page reads/writes through these hooks/functions.
// All calls hit Supabase — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// in your environment. There is no mock fallback.

import { useEffect, useState, useCallback } from 'react';
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
export function useListings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (noClient()) { setData([]); setLoading(false); return; }
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('listings')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) {
      console.error('[tw] listings fetch failed', err);
      setData([]);
      setError(err);
    } else {
      setData(rows.map(rowToListing));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data: data || [], loading, error, refresh };
}

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

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!id) {
        if (alive) { setData(null); setLoading(false); }
        return;
      }
      if (noClient()) { if (alive) { setData(null); setLoading(false); } return; }
      setLoading(true);
      const { data: row, error: err } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!alive) return;
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
  statusNotIn,
  page = 1,
  pageSize = 12,
  sort = { column: 'sort_order', ascending: true },
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stable string keys for the filter/sort — avoids re-fetching when the
  // caller creates a new array/object literal each render.
  const notInKey = (statusNotIn || []).join(',');
  const sortKey  = `${sort.column}:${sort.ascending ? 'asc' : 'desc'}`;

  useEffect(() => {
    let alive = true;
    async function load() {
      if (noClient()) {
        if (alive) { setData([]); setTotal(0); setLoading(false); }
        return;
      }
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
        // Stable secondary sort so listings with the same primary value
        // keep a deterministic order across pages.
        .order('id', { ascending: true })
        .range(from, to);
      if (statusEquals) q = q.eq('status', statusEquals);
      if (statusNotIn?.length) {
        const list = statusNotIn.map(s => `"${s}"`).join(',');
        q = q.not('status', 'in', `(${list})`);
      }
      const { data: rows, count, error } = await q;
      if (!alive) return;
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
  }, [statusEquals, notInKey, page, pageSize, sortKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { data, total, pageCount, loading };
}

// One-shot counts query — selects only the `status` column so the filter
// bar can show accurate per-bucket totals without loading every full row.
export function useListingCounts() {
  const [counts, setCounts] = useState({ All: 0, Active: 0, Pending: 0, Sold: 0, Draft: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (noClient()) {
        if (alive) { setCounts({ All: 0, Active: 0, Pending: 0, Sold: 0, Draft: 0 }); setLoading(false); }
        return;
      }
      setLoading(true);
      const { data: rows, error } = await supabase.from('listings').select('status');
      if (!alive) return;
      if (error || !rows) {
        if (error) console.error('[tw] listing counts fetch failed', error);
        setCounts({ All: 0, Active: 0, Pending: 0, Sold: 0, Draft: 0 });
      } else {
        const next = { All: rows.length, Active: 0, Pending: 0, Sold: 0, Draft: 0 };
        for (const r of rows) next[r.status] = (next[r.status] || 0) + 1;
        setCounts(next);
      }
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  return { counts, loading };
}

export function useRelatedListings(currentId, limit = 3) {
  const { data } = useListings();
  return data
    .filter(l => l.id !== currentId && l.status !== 'Sold')
    .slice(0, limit);
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
  return { data, error };
}

export async function updateListingStatus(id, status) {
  if (noClient()) return { data: null, error: { message: 'Supabase not configured' } };
  return supabase.from('listings').update({ status }).eq('id', id).select().single();
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
  return { data, error };
}

export async function deleteListing(id) {
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) console.error('[tw] listing delete failed', error);
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
};

export function usePagedLeads({
  roleIn = [],
  statusIn = [],
  page = 1,
  pageSize = 12,
  sort = 'status',
  sortDir = 'asc',
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const rolesKey = (roleIn || []).slice().sort().join(',');
  const statusesKey = (statusIn || []).slice().sort().join(',');

  useEffect(() => {
    let alive = true;
    async function load() {
      if (noClient()) {
        if (alive) { setData([]); setTotal(0); setLoading(false); }
        return;
      }
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const column = LEAD_SORT_COLUMN[sort] || 'created_at';
      let q = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order(column, { ascending: sortDir === 'asc', nullsFirst: false })
        // Stable secondary order so equal primary values keep their slot.
        .order('id', { ascending: true })
        .range(from, to);
      if (roleIn?.length)   q = q.in('role',   roleIn);
      if (statusIn?.length) q = q.in('status', statusIn);
      const { data: rows, count, error } = await q;
      if (!alive) return;
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
  }, [rolesKey, statusesKey, page, pageSize, sort, sortDir]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { data, total, pageCount, loading };
}

// ─── Leads ──────────────────────────────────────────────────────────────────
export function useLeads() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (noClient()) { setData([]); setLoading(false); return; }
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[tw] leads fetch failed', error);
      setData([]);
    } else {
      setData(rows.map(rowToLead));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data: data || [], loading, refresh };
}

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
      if (!alive) return;
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
export async function submitInquiry({ role, name, contact, payload, message }) {
  const leadInsert = inquiryToLead({ role, name, contact, payload, message });
  if (noClient()) return { data: null, error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase
    .from('leads')
    .insert(leadInsert)
    .select()
    .single();
  if (error) console.error('[tw] lead insert failed', error);
  return { data, error };
}

const ROLE_CAP = { buyer: 'Buyer', seller: 'Seller', investor: 'Investor', agent: 'Agent' };
const ROLE_TONE = { buyer: 'warm', seller: 'bone', investor: 'dusk', agent: 'sage' };

// Pull common fields out of a form payload to populate a `leads` row.
function inquiryToLead({ role, name, contact, payload, message }) {
  const [firstName, ...rest] = String(name || '').trim().split(/\s+/);
  const lastName = rest.join(' ') || null;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact || '');
  const email = isEmail ? contact : null;
  const phone = isEmail ? null : contact || null;

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

  // The intake list rendered on the lead detail page.
  const intake = [];
  for (const [q, a] of Object.entries(fields)) {
    if (!a) continue;
    if (q === 'Name' || q === 'Best contact') continue;
    intake.push({ q, a });
  }
  for (const [q, arr] of Object.entries(chips)) {
    if (Array.isArray(arr) && arr.length) intake.push({ q, a: arr.join(' · ') });
  }
  for (const [q, b] of Object.entries(budgets)) {
    if (b && b.display) intake.push({ q, a: b.display });
  }
  const mandateNotes = Object.values(notes).filter(Boolean).join('\n\n') || null;

  return {
    first_name: firstName || 'Unknown',
    last_name: lastName,
    email,
    phone,
    role: ROLE_CAP[role] || 'Buyer',
    entity,
    city,
    referred_by: null,
    status: 'New',
    tone: ROLE_TONE[role] || 'warm',
    stars: 0,
    summary,
    mandate_notes: mandateNotes,
    studio_note: null,
    intake,
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  // Env-driven shared password, useful while there's only one studio user
  // and you don't want to provision a full Supabase Auth user.
  const demoEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const demoPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  if (demoEmail && demoPassword) {
    if (email === demoEmail && password === demoPassword) {
      localStorage.setItem('tw.admin', '1');
      return { error: null };
    }
    return { error: { message: 'Incorrect email or password.' } };
  }
  if (noClient()) return { error: { message: 'Supabase not configured' } };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) localStorage.setItem('tw.admin', '1');
  return { error };
}

export async function signOut() {
  localStorage.removeItem('tw.admin');
  if (supabase) await supabase.auth.signOut();
}

export function useIsAdmin() {
  const [admin, setAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('tw.admin') === '1';
  });

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setAdmin(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAdmin(!!session || localStorage.getItem('tw.admin') === '1');
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return admin;
}
