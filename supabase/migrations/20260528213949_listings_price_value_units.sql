-- Rebuild price_value so the K/M/B suffix is respected. Previously the
-- expression stripped non-numeric characters and cast the rest, which
-- turned "$1.45M" into 1.45 (sorting below "$289K" = 289). Now the
-- numeric prefix is multiplied by the unit the suffix implies, so
-- "$1.45M" → 1450000 and prices sort the way they read.
alter table public.listings drop column if exists price_value;

alter table public.listings
  add column price_value numeric generated always as (
    case
      when price ~* 'b\s*$' then
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * 1000000000
      when price ~* 'm\s*$' then
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * 1000000
      when price ~* 'k\s*$' then
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * 1000
      else
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric
    end
  ) stored;;
