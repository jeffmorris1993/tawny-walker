-- Per-row "current status date" so server-side ORDER BY can pick the
-- date matching each listing's status without a CASE expression at
-- query time. Coming Soon → coming_soon_at, Active → active_at,
-- Pending → pending_at, Sold → sold_at. Draft falls through to NULL.
alter table public.listings
  add column if not exists status_date date generated always as (
    case status
      when 'Coming Soon' then coming_soon_at
      when 'Active'      then active_at
      when 'Pending'     then pending_at
      when 'Sold'        then sold_at
    end
  ) stored;

create index if not exists listings_status_date_idx on public.listings(status_date desc);;
