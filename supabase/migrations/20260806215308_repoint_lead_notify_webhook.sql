-- Move the lead-notify webhook off public.leads and onto public.lead_events.
--
-- Why: one person is now one leads row. That breaks a webhook on `leads` in
-- both directions —
--   * a repeat inquiry from someone already known is an UPDATE, so an
--     INSERT webhook never fires and Tawny never hears about it;
--   * joining the contact list now INSERTs a leads row, which the old
--     webhook would announce as an inquiry with an empty intake.
--
-- submit_inquiry() writes exactly one lead_events row of kind 'inquiry' per
-- submission, first-time or repeat, so firing on that covers both cases and
-- nothing else. The WHEN clause keeps studio notes and status changes from
-- making pointless HTTP calls.
--
-- The trigger being replaced was created through the dashboard
-- (Database → Webhooks), so its name isn't knowable from this repo — it is
-- discovered by looking for triggers on public.leads bound to
-- supabase_functions.http_request.

-- 1. Drop whatever dashboard webhook currently sits on public.leads.
do $$
declare
  r record;
begin
  for r in
    select t.tgname
      from pg_trigger t
      join pg_proc p on p.oid = t.tgfoid
      join pg_namespace n on n.oid = p.pronamespace
     where t.tgrelid = 'public.leads'::regclass
       and not t.tgisinternal
       and n.nspname = 'supabase_functions'
       and p.proname = 'http_request'
  loop
    execute format('drop trigger if exists %I on public.leads', r.tgname);
    raise notice 'dropped webhook trigger % on public.leads', r.tgname;
  end loop;
end $$;

-- 2. Fire on submitted inquiries instead.
--
-- The bearer token is the project's public anon key — the same one already
-- embedded in the monthly backup schedule, and the same one shipped in the
-- browser bundle. The function itself uses SUPABASE_SERVICE_ROLE_KEY
-- internally to read the lead behind the event.
drop trigger if exists trg_lead_events_notify on public.lead_events;
create trigger trg_lead_events_notify
  after insert on public.lead_events
  for each row
  when (new.kind = 'inquiry')
  execute function supabase_functions.http_request(
    'https://zdmpkshtrtdcndvwvrug.supabase.co/functions/v1/lead-notify',
    'POST',
    '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbXBrc2h0cnRkY25kdnd2cnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDQ5MzMsImV4cCI6MjA5NDcyMDkzM30.7mV8_8XYG6e1jt_kM--FQM732VkqMFWZef_SzShV19Y"}',
    '{}',
    '5000'
  );
