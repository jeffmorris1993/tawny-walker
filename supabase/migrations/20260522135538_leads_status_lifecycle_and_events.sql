-- 1. Replace `Qualified` with `Active` and add `Closed` to the lead lifecycle.
alter table public.leads drop constraint leads_status_check;
update public.leads set status = 'Active' where status = 'Qualified';
alter table public.leads
  add constraint leads_status_check
  check (status in ('New', 'Contacted', 'Active', 'Cold', 'Closed'));

-- 2. Re-rank to match the new lifecycle: New → Contacted → Active → Closed,
--    with Cold as a separate dead-end below the active path.
alter table public.leads drop column if exists status_rank;
alter table public.leads
  add column status_rank int
  generated always as (
    case status
      when 'New'       then 0
      when 'Contacted' then 1
      when 'Active'    then 2
      when 'Closed'    then 3
      when 'Cold'      then 4
      else 99
    end
  ) stored;
create index if not exists leads_status_rank_idx on public.leads (status_rank);

-- 3. lead_events: append-only studio log entries (note + status changes).
--    The "intake received" line on each lead detail is still synthesized
--    from `leads.created_at` so we don't need a seed entry per lead.
create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null check (kind in ('note', 'status')),
  previous_value text,
  next_value text,
  created_at timestamptz default now()
);
create index if not exists lead_events_lead_idx on public.lead_events (lead_id, created_at desc);

alter table public.lead_events enable row level security;
drop policy if exists "lead_events open" on public.lead_events;
create policy "lead_events open" on public.lead_events for all using (true) with check (true);;
