-- Test-volume seed. Generates 100 active + 100 sold listings on top of the
-- canonical seed.sql rows so the public Listings + Sold Listings pages have
-- enough data to exercise the infinite-scroll behaviour.
--
-- Run AFTER schema.sql + seed.sql:
--   psql $DATABASE_URL -f supabase/schema.sql
--   psql $DATABASE_URL -f supabase/seed.sql
--   psql $DATABASE_URL -f supabase/seed-test-volume.sql
--
-- To remove the test rows (keep the curated ones):
--   delete from public.listings where id like 'seed-%';

with
  streets(name) as (values
    ('Oak Lane'), ('Cranbrook Road'), ('Maple Court'), ('Pine Lake Road'),
    ('Yorkshire Road'), ('Cedar Lane'), ('Hawthorne Road'), ('Old Woodward'),
    ('Lone Pine Road'), ('Quarton Lake Road'), ('Long Lake Road'),
    ('Lakeshore Drive'), ('Lakewood Drive'), ('Birch Avenue'),
    ('Pearl Street'), ('Bartlett Road'), ('Willow Lane'), ('Linden Road'),
    ('Sycamore Court'), ('Hickory Lane')
  ),
  cities(name) as (values
    ('Birmingham, MI'), ('Bloomfield Hills, MI'), ('West Bloomfield, MI'),
    ('Royal Oak, MI'), ('Ferndale, MI'), ('Novi, MI'), ('Northville, MI'),
    ('Grosse Pointe, MI'), ('Farmington Hills, MI')
  ),
  tones(name) as (values
    ('warm'), ('cool'), ('dusk'), ('sage'), ('bone'), ('night')
  ),
  imgs(name) as (values
    ('livingMarble'), ('kitchenWhite'), ('kitchenMarbleIsl'),
    ('kitchenModernWood'), ('deck')
  ),
  tags_active(name) as (values
    ('Lakefront'), ('Mid-century'), ('Restored'), ('Modernist'),
    ('Cottage'), ('Estate'), ('Penthouse'), ('Renovation')
  ),
  -- Pull each lookup table into an indexed list so we can pick by position.
  streets_arr as (select array_agg(name order by name) a from streets),
  cities_arr  as (select array_agg(name order by name) a from cities),
  tones_arr   as (select array_agg(name order by name) a from tones),
  imgs_arr    as (select array_agg(name order by name) a from imgs),
  tags_arr    as (select array_agg(name order by name) a from tags_active)

-- Active / pending volume — 100 rows.
insert into public.listings (
  id, addr, street, loc, price, specs, status, tone, tag, img, blurb,
  beds, baths, sqft, lot, sort_order
)
select
  format('seed-active-%s', lpad(i::text, 3, '0')),
  format('%s Residence %s', split_part((select a[((i * 3) % array_length(a,1)) + 1] from streets_arr), ' ', 1), i),
  format('%s %s', 100 + i * 7, (select a[((i * 3) % array_length(a,1)) + 1] from streets_arr)),
  (select a[((i * 5) % array_length(a,1)) + 1] from cities_arr),
  '$' || to_char(850000 + ((i * 117000) % 11000000), 'FM999,999,999'),
  format('%s BD · %s BA · %s SF%s',
    ((i % 5) + 2),
    ((i % 5) + 2) + case when i % 2 = 0 then 0.5 else 0 end,
    to_char(1800 + ((i * 137) % 9000), 'FM999,999'),
    case when i % 3 = 0
      then ' · ' || to_char((((i * 13) % 200)::numeric) / 100, 'FM0.00') || ' AC'
      else ''
    end
  ),
  case when i % 13 = 0 then 'Pending' else 'Active' end,
  (select a[(i % array_length(a,1)) + 1] from tones_arr),
  (select a[(i % array_length(a,1)) + 1] from tags_arr),
  (select a[(i % array_length(a,1)) + 1] from imgs_arr),
  '',
  ((i % 5) + 2)::text,
  (((i % 5) + 2) + case when i % 2 = 0 then 0.5 else 0 end)::text,
  to_char(1800 + ((i * 137) % 9000), 'FM999,999'),
  case when i % 3 = 0
    then to_char((((i * 13) % 200)::numeric) / 100, 'FM0.00') || ' AC'
    else '—'
  end,
  1000 + i
from generate_series(1, 100) i;

with
  streets(name) as (values
    ('Oak Lane'), ('Cranbrook Road'), ('Maple Court'), ('Pine Lake Road'),
    ('Yorkshire Road'), ('Cedar Lane'), ('Hawthorne Road'), ('Old Woodward'),
    ('Lone Pine Road'), ('Quarton Lake Road'), ('Long Lake Road'),
    ('Lakeshore Drive'), ('Lakewood Drive'), ('Birch Avenue'),
    ('Pearl Street'), ('Bartlett Road'), ('Willow Lane'), ('Linden Road'),
    ('Sycamore Court'), ('Hickory Lane')
  ),
  cities(name) as (values
    ('Birmingham, MI'), ('Bloomfield Hills, MI'), ('West Bloomfield, MI'),
    ('Royal Oak, MI'), ('Ferndale, MI'), ('Novi, MI'), ('Northville, MI'),
    ('Grosse Pointe, MI'), ('Farmington Hills, MI')
  ),
  tones(name) as (values
    ('warm'), ('cool'), ('dusk'), ('sage'), ('bone'), ('night')
  ),
  imgs(name) as (values
    ('livingMarble'), ('kitchenWhite'), ('kitchenMarbleIsl'),
    ('kitchenModernWood'), ('deck')
  ),
  streets_arr as (select array_agg(name order by name) a from streets),
  cities_arr  as (select array_agg(name order by name) a from cities),
  tones_arr   as (select array_agg(name order by name) a from tones),
  imgs_arr    as (select array_agg(name order by name) a from imgs)

-- Sold archive volume — 100 rows.
insert into public.listings (
  id, addr, street, loc, price, specs, status, tone, tag, img, blurb,
  beds, baths, sqft, lot, sort_order
)
select
  format('seed-sold-%s', lpad(i::text, 3, '0')),
  format('%s House %s', split_part((select a[((i * 7) % array_length(a,1)) + 1] from streets_arr), ' ', 1), i),
  format('%s %s', 200 + i * 11, (select a[((i * 2) % array_length(a,1)) + 1] from streets_arr)),
  (select a[((i * 3) % array_length(a,1)) + 1] from cities_arr),
  '$' || to_char(750000 + ((i * 91000) % 9500000), 'FM999,999,999'),
  format('%s BD · %s BA · %s SF%s',
    ((i % 6) + 2),
    ((i % 6) + 2) + case when i % 2 = 0 then 0 else 0.5 end,
    to_char(2200 + ((i * 211) % 10000), 'FM999,999'),
    case when i % 4 = 0
      then ' · ' || to_char((((i * 11) % 220)::numeric) / 100, 'FM0.00') || ' AC'
      else ''
    end
  ),
  'Sold',
  (select a[((i + 2) % array_length(a,1)) + 1] from tones_arr),
  format('Closed %s', 2020 + (i % 7)),
  (select a[((i + 1) % array_length(a,1)) + 1] from imgs_arr),
  '',
  ((i % 6) + 2)::text,
  (((i % 6) + 2) + case when i % 2 = 0 then 0 else 0.5 end)::text,
  to_char(2200 + ((i * 211) % 10000), 'FM999,999'),
  case when i % 4 = 0
    then to_char((((i * 11) % 220)::numeric) / 100, 'FM0.00') || ' AC'
    else '—'
  end,
  2000 + i
from generate_series(1, 100) i;
