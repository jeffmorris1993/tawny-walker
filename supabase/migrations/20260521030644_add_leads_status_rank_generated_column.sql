-- status_rank: integer mirror of `status` used for server-side ordering
-- in workflow order (New → Contacted → Qualified → Cold). Allows PostgREST
-- .order('status_rank') to give the same result the client-side sort
-- function does.
alter table public.leads
  add column status_rank int
  generated always as (
    case status
      when 'New' then 0
      when 'Contacted' then 1
      when 'Qualified' then 2
      when 'Cold' then 3
      else 99
    end
  ) stored;

create index if not exists leads_status_rank_idx on public.leads (status_rank);
create index if not exists leads_role_idx on public.leads (role);;
