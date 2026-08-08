-- Widen the enums for the six-path guided inquiry and the contact list.
--
-- Two new inquiry directions ship with the guided form:
--   Design    — design & renovation support
--   Exploring — "I'm not sure yet"
-- Plus one role that never comes from the inquiry at all:
--   Contact   — joined the Tawny & Co. list, has not inquired. Upgraded in
--               place to a real role the moment that person submits a form.
--
-- Nothing here is destructive; it only relaxes constraints. Safe to push
-- while the current site is live.

-- ── leads.role ─────────────────────────────────────────────────────────────
alter table public.leads drop constraint leads_role_check;
alter table public.leads
  add constraint leads_role_check
  check (role in ('Buyer', 'Seller', 'Investor', 'Agent', 'Design', 'Exploring', 'Contact'));

-- ── lead_events.kind ───────────────────────────────────────────────────────
-- 'inquiry' records a form submission. Every submission writes one, which is
-- what the notification webhook fires on (both first-time and repeat
-- inquiries), and what preserves the previous intake when an existing
-- contact submits again.
alter table public.lead_events drop constraint lead_events_kind_check;
alter table public.lead_events
  add constraint lead_events_kind_check
  check (kind in ('note', 'status', 'inquiry'));

-- ── leads_public_insert ────────────────────────────────────────────────────
-- The anon insert policy repeats the role and tone enums inline, so it has to
-- be widened in lockstep or the two new inquiry paths 403 at submit time.
-- Tones: Design → bloom, Exploring → moss (both already exist in the app's
-- photo palette). Contact rows use the 'warm' column default.
--
-- This policy is dropped entirely by the later close_anon_insert migration,
-- once all public writes go through the SECURITY DEFINER functions. It is
-- widened here so the two states are compatible in either order.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon with check (
    role in ('Buyer','Seller','Investor','Agent','Design','Exploring','Contact')
    and tone in ('warm','bone','dusk','sage','bloom','moss')
    and length(coalesce(first_name,''))    between 1 and 80
    and length(coalesce(last_name,''))     <= 80
    and length(coalesce(email,''))         <= 200
    and length(coalesce(phone,''))         <= 60
    and length(coalesce(entity,''))        <= 200
    and length(coalesce(city,''))          <= 200
    and length(coalesce(summary,''))       <= 1000
    and length(coalesce(mandate_notes,'')) <= 4000
    and octet_length(coalesce(intake, '[]'::jsonb)::text) <= 20000
  );
