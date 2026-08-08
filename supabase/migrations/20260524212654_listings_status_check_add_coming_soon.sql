
-- Allow 'Coming Soon' as a valid lifecycle stage. The status_rank generated
-- column and the admin UI both already know about it; the CHECK constraint
-- just hadn't caught up.
alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check
  check (status = any (array['Coming Soon'::text, 'Active'::text, 'Pending'::text, 'Sold'::text, 'Draft'::text]));
;
