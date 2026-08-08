
-- Existing storage policies for the listing-photos bucket only allow the
-- `anon` role to insert/update/delete. Now that the studio uses real
-- Supabase Auth users (role = authenticated), the policies need to apply
-- to both. Drop and recreate with TO {anon, authenticated}.

drop policy if exists "listing photos anon insert" on storage.objects;
drop policy if exists "listing photos anon update" on storage.objects;
drop policy if exists "listing photos anon delete" on storage.objects;

create policy "listing photos write insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'listing-photos');

create policy "listing photos write update"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'listing-photos')
  with check (bucket_id = 'listing-photos');

create policy "listing photos write delete"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'listing-photos');
;
