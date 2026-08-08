alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check
  check (status in ('Coming Soon', 'Active', 'Pending', 'Sold', 'Draft'));

alter table public.listings
  add column if not exists coming_soon_at date,
  add column if not exists active_at      date,
  add column if not exists pending_at     date,
  add column if not exists sold_at        date;

grant select (coming_soon_at, active_at, pending_at, sold_at),
      insert (coming_soon_at, active_at, pending_at, sold_at),
      update (coming_soon_at, active_at, pending_at, sold_at),
      references (coming_soon_at, active_at, pending_at, sold_at)
  on public.listings
  to anon, authenticated, service_role;;
