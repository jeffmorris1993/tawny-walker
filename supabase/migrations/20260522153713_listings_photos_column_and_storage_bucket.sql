-- 1. Add ordered photos array to listings. First entry is the hero; the
--    rest power the gallery. Each entry is a { path, url } pair so we can
--    delete from storage when removed from the listing.
alter table public.listings
  add column if not exists photos jsonb not null default '[]'::jsonb;

-- 2. Public storage bucket for listing photos.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- 3. Allow the anon role (used by the admin client) to read, upload, and
--    remove files in this bucket. Public bucket already permits anonymous
--    SELECT, but explicit policies keep mutations working under RLS.
drop policy if exists "listing photos public read"   on storage.objects;
drop policy if exists "listing photos anon insert"   on storage.objects;
drop policy if exists "listing photos anon update"   on storage.objects;
drop policy if exists "listing photos anon delete"   on storage.objects;

create policy "listing photos public read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "listing photos anon insert"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'listing-photos');

create policy "listing photos anon update"
  on storage.objects for update
  to anon
  using (bucket_id = 'listing-photos')
  with check (bucket_id = 'listing-photos');

create policy "listing photos anon delete"
  on storage.objects for delete
  to anon
  using (bucket_id = 'listing-photos');;
