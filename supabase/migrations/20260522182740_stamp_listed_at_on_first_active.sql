
-- Stamp listed_at the first time a listing becomes Active. Idempotent: if
-- listed_at is already populated we leave it alone (preserves seed values
-- like "Mar 22") so re-saving an existing Active listing never updates it.
create or replace function public.set_listing_listed_at()
returns trigger
language plpgsql
as $$
begin
  if NEW.status = 'Active'
     and (NEW.listed_at is null or btrim(NEW.listed_at) = '')
     and (TG_OP = 'INSERT' or OLD.status is distinct from 'Active')
  then
    NEW.listed_at := to_char((now() at time zone 'America/Detroit'), 'FMMon FMDD');
  end if;
  return NEW;
end;
$$;

drop trigger if exists set_listing_listed_at on public.listings;
create trigger set_listing_listed_at
before insert or update on public.listings
for each row
execute function public.set_listing_listed_at();
;
