// Data access layer. Every page reads/writes through these hooks/functions.
// When Supabase is configured (VITE_SUPABASE_URL + ANON_KEY), all calls hit the
// database. Otherwise they fall back to the bundled mock data so the UI still
// works (useful for design review, local dev without a project, etc.).

import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { LISTINGS as MOCK_LISTINGS } from '../data/listings';
import { LEADS as MOCK_LEADS, LEAD_DETAIL as MOCK_LEAD_DETAIL } from '../data/leads';
import { getListingDetail as mockListingDetail } from '../data/listingDetails';
import { PHOTOS } from '../components/Photo';

// ─── shape converters ───────────────────────────────────────────────────────
// DB rows use snake_case + a `img` text key (matches PHOTOS map). UI expects
// `img` to be the resolved photo URL/asset.
function rowToListing(row) {
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
    img: row.img && PHOTOS[row.img] ? PHOTOS[row.img] : row.img || null,
    imgKey: row.img,
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
const MOCK_NUMBERS = Object.fromEntries(
  MOCK_LISTINGS.map((l, i) => [l.id, String(i + 1).padStart(2, '0')]),
);

export function useListings() {
  const [data, setData] = useState(isSupabaseConfigured ? null : MOCK_LISTINGS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(MOCK_LISTINGS);
      return;
    }
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('listings')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) {
      console.warn('[tw] listings fetch failed, falling back to mock', err);
      setData(MOCK_LISTINGS);
      setError(err);
    } else {
      setData(rows.map(rowToListing));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data: data || [], loading, error, refresh };
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
      if (!isSupabaseConfigured) {
        if (alive) {
          setData(mockListingDetail(id));
          setLoading(false);
        }
        return;
      }
      const { data: row, error: err } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!alive) return;
      if (err || !row) {
        // Try mock fallback before declaring not-found.
        setData(mockListingDetail(id));
      } else {
        const listing = rowToListing(row);
        setData({ ...listing, number: MOCK_NUMBERS[id] || '—' });
      }
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [id]);

  return { data, loading };
}

export function useRelatedListings(currentId, limit = 3) {
  const { data } = useListings();
  return data
    .filter(l => l.id !== currentId && l.status !== 'Sold')
    .slice(0, limit);
}

export async function createListing(input) {
  // input: { id, addr, street, loc, price, specs, status, tone, tag, blurb, beds, baths, sqft, lot, img }
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
    sort_order: input.sort_order || 200,
  };

  if (!isSupabaseConfigured) {
    // Mutation in mock mode: push to in-memory array so the user can see it
    // until reload. Returns a synthetic row.
    MOCK_LISTINGS.push({
      ...payload,
      img: payload.img && PHOTOS[payload.img] ? PHOTOS[payload.img] : payload.img,
    });
    return { data: payload, error: null };
  }

  const { data, error } = await supabase.from('listings').insert(payload).select().single();
  return { data, error };
}

export async function updateListingStatus(id, status) {
  if (!isSupabaseConfigured) {
    const l = MOCK_LISTINGS.find(x => x.id === id);
    if (l) l.status = status;
    return { data: l, error: null };
  }
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
  };

  if (!isSupabaseConfigured) {
    const idx = MOCK_LISTINGS.findIndex(l => l.id === id);
    if (idx >= 0) {
      const resolvedImg = payload.img && PHOTOS[payload.img] ? PHOTOS[payload.img] : payload.img;
      MOCK_LISTINGS[idx] = { ...MOCK_LISTINGS[idx], ...payload, id, img: resolvedImg || MOCK_LISTINGS[idx].img };
    }
    return { data: { id, ...payload }, error: null };
  }
  return supabase.from('listings').update(payload).eq('id', id).select().single();
}

export async function deleteListing(id) {
  if (!isSupabaseConfigured) {
    const idx = MOCK_LISTINGS.findIndex(l => l.id === id);
    if (idx >= 0) MOCK_LISTINGS.splice(idx, 1);
    return { error: null };
  }
  return supabase.from('listings').delete().eq('id', id);
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

// ─── Leads ──────────────────────────────────────────────────────────────────
export function useLeads() {
  const [data, setData] = useState(isSupabaseConfigured ? null : MOCK_LEADS);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(MOCK_LEADS);
      return;
    }
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[tw] leads fetch failed, falling back to mock', error);
      setData(MOCK_LEADS);
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
    if (!isSupabaseConfigured) {
      // Mock mode: only one detail exists. If id matches its id, return it,
      // otherwise synthesize from the LEADS array.
      const lead = MOCK_LEADS.find(l => String(l.id) === String(id));
      if (lead && String(lead.id) === String(MOCK_LEAD_DETAIL.id)) {
        setData({ ...MOCK_LEAD_DETAIL });
      } else if (lead) {
        setData({
          ...lead,
          firstName: lead.name.split(' ')[0],
          lastName: lead.name.split(' ').slice(1).join(' '),
          email: '—',
          phone: '—',
          entity: '—',
          city: '—',
          referredBy: '—',
          number: String(lead.id).padStart(2, '0'),
          intake: [],
          mandateNotes: '',
          studioNote: '',
          studioNoteSavedAt: '',
          studioLog: [{ t: 'Intake received', when: lead.when, highlight: true }],
          attached: [],
        });
      } else {
        setData(null);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: row } = await supabase
      .from('leads')
      .select('*, attached_listings(listing_id, shared_at, listings(addr, tone))')
      .eq('id', id)
      .maybeSingle();
    if (row) {
      const lead = rowToLead(row);
      const attached = (row.attached_listings || []).map(a => ({
        id: a.listing_id,
        name: a.listings?.addr,
        tone: a.listings?.tone,
        sharedAt: a.shared_at,
      }));
      const studioLog = [
        { t: 'Intake received', when: lead.when, highlight: true },
      ];
      if (lead.studioNoteSavedAt) {
        studioLog.push({
          t: 'Studio note edited — TW',
          when: relativeTime(lead.studioNoteSavedAt, true),
        });
      }
      setData({
        ...lead,
        number: String(row.id).slice(0, 2).toUpperCase(),
        studioLog,
        attached,
      });
    } else {
      setData(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

export async function updateLeadStatus(id, status) {
  if (!isSupabaseConfigured) {
    const lead = MOCK_LEADS.find(l => String(l.id) === String(id));
    if (lead) lead.status = status;
    if (String(id) === String(MOCK_LEAD_DETAIL.id)) MOCK_LEAD_DETAIL.status = status;
    return { error: null };
  }
  return supabase.from('leads').update({ status }).eq('id', id);
}

export async function updateLeadNote(id, studioNote) {
  if (!isSupabaseConfigured) {
    if (String(id) === String(MOCK_LEAD_DETAIL.id)) {
      MOCK_LEAD_DETAIL.studioNote = studioNote;
      MOCK_LEAD_DETAIL.studioNoteSavedAt = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
    return { error: null };
  }
  return supabase
    .from('leads')
    .update({ studio_note: studioNote, studio_note_saved_at: new Date().toISOString() })
    .eq('id', id);
}

export async function detachListing(leadId, listingId) {
  if (!isSupabaseConfigured) return { error: null };
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

  if (!isSupabaseConfigured) {
    console.info('[tw] inquiry (mock):', leadInsert);
    await new Promise(r => setTimeout(r, 400));
    return { data: { id: `mock-${Date.now()}` }, error: null };
  }

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
  // Env-driven demo creds, used when Supabase isn't configured OR when the
  // operator wants a simple shared password.
  const demoEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const demoPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  if (demoEmail && demoPassword) {
    if (email === demoEmail && password === demoPassword) {
      sessionStorage.setItem('tw.admin', '1');
      return { error: null };
    }
    return { error: { message: 'Incorrect email or password.' } };
  }
  if (!isSupabaseConfigured) {
    // No env creds, no supabase: open admin to anyone with non-empty values.
    if (!email || !password) return { error: { message: 'Email and password required.' } };
    sessionStorage.setItem('tw.admin', '1');
    return { error: null };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) sessionStorage.setItem('tw.admin', '1');
  return { error };
}

export async function signOut() {
  sessionStorage.removeItem('tw.admin');
  if (isSupabaseConfigured) await supabase.auth.signOut();
}

export function useIsAdmin() {
  const [admin, setAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('tw.admin') === '1';
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setAdmin(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAdmin(!!session || sessionStorage.getItem('tw.admin') === '1');
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return admin;
}
