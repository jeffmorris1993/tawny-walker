
-- Lifecycle ordering for the listings table — Active first, then Pending,
-- Sold, Draft. Mirrors the leads.status_rank pattern. Used by the admin
-- table's "Status" column sort.
alter table public.listings
  add column if not exists status_rank int generated always as (
    case status
      when 'Active'  then 1
      when 'Pending' then 2
      when 'Sold'    then 3
      when 'Draft'   then 4
      else 99
    end
  ) stored;
;
