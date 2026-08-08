
-- Record who made each change so the studio log can show the actor
-- instead of a hardcoded "TW". `actor_id` is the auth.users row;
-- `actor_name` is a snapshot taken at write time so the historical
-- log doesn't rewrite itself if someone changes their display name later.
alter table public.lead_events
  add column if not exists actor_id   uuid references auth.users(id) on delete set null,
  add column if not exists actor_name text;

create index if not exists lead_events_actor_id_idx on public.lead_events(actor_id);
;
