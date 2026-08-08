-- price_value: numeric mirror of the text `price` column, used for sorting.
-- Strips out everything except digits and decimal points (e.g. "$5,200,000"
-- → 5200000). Nullable so empty/missing prices sort last with NULLS LAST.
alter table public.listings
  add column price_value numeric
  generated always as (
    nullif(regexp_replace(coalesce(price, ''), '[^0-9.]', '', 'g'), '')::numeric
  ) stored;

create index if not exists listings_price_value_idx
  on public.listings (price_value);;
