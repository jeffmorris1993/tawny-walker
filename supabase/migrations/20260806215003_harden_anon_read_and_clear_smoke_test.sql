-- Two small cleanups after verifying the contact-record functions against
-- the live project.

-- 1. Remove the smoke-test contact created while verifying join_list and
--    submit_inquiry end to end over the public REST API. Deleted by email so
--    it is a no-op everywhere else.
delete from public.leads where email_lower = 'smoke.test.tawny@example.com';

-- 2. Defence in depth on the studio tables.
--
-- These tables were already unreadable by the public — no SELECT policy
-- exists for anon, so RLS returned an empty set. But anon still held the
-- table-level SELECT *privilege* inherited from the project's default
-- grants, which meant a single mistaken permissive policy would expose
-- every lead. Dropping the privilege puts a second, independent lock on it:
-- PostgREST now refuses the request outright instead of relying on RLS
-- alone to filter the rows away.
--
-- Safe for the app: every read of these tables in src/lib/queries.js runs
-- behind RequireAdmin with a Supabase session, i.e. as `authenticated`,
-- whose grants are untouched. anon keeps its column-scoped INSERT on leads
-- until the guided inquiry moves fully onto submit_inquiry().
--
-- public.listings is deliberately NOT included — anon SELECT there is what
-- powers the public listing pages.
revoke select on public.leads             from anon;
revoke select on public.lead_events       from anon;
revoke select on public.attached_listings from anon;
