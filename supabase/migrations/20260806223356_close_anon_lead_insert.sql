-- Close the last direct public write path into public.leads.
--
-- ORDERING MATTERS. This migration breaks any client still inserting into
-- leads directly, so it must not be pushed before the guided inquiry rewrite
-- deploys. The rewrite routes every submission through submit_inquiry()
-- instead — see src/lib/queries.js.
--
-- After this, anon can reach `leads` through exactly two functions and
-- nothing else:
--   join_list(...)      — the Tawny & Co. list signup
--   submit_inquiry(...) — the guided inquiry
--
-- Both are SECURITY DEFINER and validate their own input, so the enum and
-- length rules that used to live in the RLS policy now live in one auditable
-- place rather than being duplicated between the policy and the browser.

revoke insert on public.leads from anon;
drop policy if exists "leads_public_insert" on public.leads;

-- The studio's own policy is untouched: authenticated keeps full access, and
-- that is what the admin app runs as.
