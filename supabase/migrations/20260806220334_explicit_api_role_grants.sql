-- Make the API-role privileges explicit and version-controlled.
--
-- Found while verifying the contact-record work against a database rebuilt
-- purely from this migration history: anon, authenticated, and service_role
-- held no SELECT/INSERT/UPDATE/DELETE on ANY public table. Not on leads, not
-- even on listings — which the public marketing pages read on every visit.
--
-- The hosted project works because Supabase applies default privileges to
-- tables at creation time, and every table here was created directly against
-- that project. Those grants were therefore never captured in a migration, so
-- the history is not self-sufficient: `supabase db reset`, a branch database,
-- or a restore into a fresh project all produce a database whose admin is
-- entirely broken and whose listings pages return nothing.
--
-- This migration writes the intended privilege model down. On the live project
-- it re-states what is already true; everywhere else it repairs the gap. RLS
-- policies are unchanged and remain the actual access control — these grants
-- are the coarse layer underneath that RLS then filters.

-- ── listings: public marketing data ────────────────────────────────────────
grant select on public.listings to anon, authenticated;
grant select, insert, update, delete on public.listings to service_role;
grant insert, update, delete on public.listings to authenticated;

-- ── leads: the contact record ──────────────────────────────────────────────
-- anon deliberately gets NO table-level privilege here. Its only write path
-- is the column-scoped INSERT granted by the tighten-RLS migration (retired
-- once the guided inquiry moves onto submit_inquiry()), and its only read
-- access is none at all — see harden_anon_read_and_clear_smoke_test.
grant select, insert, update, delete on public.leads to authenticated, service_role;

-- ── studio-only tables ─────────────────────────────────────────────────────
grant select, insert, update, delete on public.lead_events       to authenticated, service_role;
grant select, insert, update, delete on public.attached_listings to authenticated, service_role;

-- ── future tables ──────────────────────────────────────────────────────────
-- So the next `create table` in a migration doesn't reintroduce the same gap.
-- Deliberately excludes anon: a new table should be invisible to the public
-- until someone grants it on purpose.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
