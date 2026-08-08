-- Records which side of the deal Tawny represents on this listing.
-- Nullable while listings exist that predate the field; new listings can
-- pick Buyer / Seller / Both from the studio dropdown.
alter table public.listings
  add column if not exists represented_by text
  check (represented_by in ('Buyer', 'Seller', 'Both'));;
