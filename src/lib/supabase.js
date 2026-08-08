import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

const STORAGE_KEY = 'tw.supabase';

// A stored session that the configured backend won't accept takes down the
// whole public site, not just the admin: supabase-js attaches the token to
// anonymous reads too, and PostgREST rejects the request with a 401 before RLS
// is ever consulted. Listings vanish, the list signup fails, and the only
// symptom is a generic fetch error.
//
// Two ways that happens:
//   1. The token was issued by a different backend — switching between the
//      local Docker stack and the hosted project, or between projects. Caught
//      synchronously below by comparing the token's `iss` claim to the URL
//      we're configured against, before createClient ever reads storage.
//   2. The project's JWT secret was rotated, so a same-issuer token no longer
//      verifies. Can't be detected without asking the server; handled by the
//      async check further down.
function decodeIssuer(token) {
  try {
    // JWT segments are base64url. atob only accepts standard base64, so a
    // token whose payload happens to encode a '-' or '_' would throw here,
    // land in the catch, and get the session discarded on every page load.
    const seg = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(seg));
    return payload.iss || null;
  } catch {
    return null;
  }
}

function purgeForeignSession() {
  if (typeof window === 'undefined') return;
  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return;   // storage blocked (private mode, embedded webview) — nothing to do
  }
  if (!raw) return;

  let issuer;
  try {
    issuer = decodeIssuer(JSON.parse(raw).access_token || '');
  } catch {
    issuer = null;   // unparseable stored blob — treat it as unusable
  }

  // Compare origins rather than prefixes: startsWith would accept an issuer
  // of https://<ref>.supabase.co.evil.example. Harmless in itself, since the
  // decision is only whether to keep a token the server still has to verify,
  // but there is no reason to be loose about it.
  let belongsHere;
  try {
    belongsHere = Boolean(issuer) && new URL(issuer).origin === new URL(url).origin;
  } catch {
    belongsHere = false;   // unparseable issuer is as unusable as a foreign one
  }
  if (belongsHere) return;

  console.warn(
    `[tw] Discarding a stored session issued by ${issuer || 'an unreadable source'}. ` +
    `This client is configured for ${url}. Left in place it would 401 every ` +
    'request, including public reads.'
  );
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* nothing more we can do */ }
}

if (isSupabaseConfigured) purgeForeignSession();

export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: STORAGE_KEY },
    })
  : null;

// Case 2: same issuer, but the signature no longer verifies (secret rotated,
// user deleted). getSession only reads local storage, so it can't tell —
// getUser asks the server. On rejection, drop the session locally so every
// subsequent request falls back to the anon key and the public pages recover.
// `scope: 'local'` because the token is already invalid; a server-side signout
// would just fail.
if (supabase && typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data }) => {
    if (!data?.session) return;
    return supabase.auth.getUser().then(({ error }) => {
      if (!error) return;
      // Only act on an actual rejection. A network blip or a sleeping project
      // also produces an error here, and signing out on those would kick the
      // studio out of the admin for no reason — better to keep the session and
      // let the next request retry.
      const rejected = error.status === 401 || error.status === 403;
      if (!rejected) return;
      console.warn('[tw] Stored session rejected by the server, signing out locally.', error.message);
      return supabase.auth.signOut({ scope: 'local' });
    });
  }).catch(() => { /* offline or unreachable — leave the session alone */ });
}
