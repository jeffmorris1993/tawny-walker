
-- Rebuild the lifecycle rank to include the new "Coming Soon" state,
-- ordered ahead of Active so the admin "Status" sort surfaces it first.
alter table public.listings drop column if exists status_rank;
alter table public.listings
  add column status_rank int generated always as (
    case status
      when 'Coming Soon' then 1
      when 'Active'      then 2
      when 'Pending'     then 3
      when 'Sold'        then 4
      when 'Draft'       then 5
      else 99
    end
  ) stored;
;
