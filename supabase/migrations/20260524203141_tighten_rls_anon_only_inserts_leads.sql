
-- Public surface gets two privileges and nothing else:
--   1. SELECT on listings (for the marketing pages)
--   2. INSERT on leads with column-level grants + a strict with_check
--      (for the inquiry form)
-- Everything else — UPDATE/DELETE on listings, all DML on leads,
-- everything in lead_events / attached_listings, and writes to the
-- listing-photos bucket — is restricted to authenticated.

------------------------------------------------------------
-- leads: drop the catch-all, replace with column-grant + strict insert
------------------------------------------------------------
drop policy if exists "leads_admin_all" on public.leads;

revoke insert on public.leads from anon;
grant insert (first_name, last_name, email, phone, role, entity, city,
              summary, mandate_notes, intake, tone) on public.leads to anon;

-- Public insert: constrained values + length caps on every user-supplied
-- string. `status`, `stars`, `created_at`, `updated_at` are NOT granted
-- to anon, so PostgREST clients cannot set them; the column defaults
-- fill them in.
create policy "leads_public_insert" on public.leads
  for insert to anon with check (
    role in ('Buyer','Seller','Investor','Agent')
    and tone in ('warm','bone','dusk','sage')
    and length(coalesce(first_name,''))    between 1 and 80
    and length(coalesce(last_name,''))     <= 80
    and length(coalesce(email,''))         <= 200
    and length(coalesce(phone,''))         <= 60
    and length(coalesce(entity,''))        <= 200
    and length(coalesce(city,''))          <= 200
    and length(coalesce(summary,''))       <= 1000
    and length(coalesce(mandate_notes,'')) <= 4000
    and octet_length(coalesce(intake, '[]'::jsonb)::text) <= 20000
  );

-- Studio (Tawny, signed in via Supabase Auth) keeps full access.
create policy "leads_auth_all" on public.leads
  for all to authenticated using (true) with check (true);

------------------------------------------------------------
-- listings: keep public read (already present), restrict writes
------------------------------------------------------------
drop policy if exists "listings_admin_all" on public.listings;
create policy "listings_auth_write" on public.listings
  for all to authenticated using (true) with check (true);

------------------------------------------------------------
-- attached_listings: studio-only
------------------------------------------------------------
drop policy if exists "attached_admin_all" on public.attached_listings;
create policy "attached_auth_all" on public.attached_listings
  for all to authenticated using (true) with check (true);

------------------------------------------------------------
-- lead_events: was open to the world; lock down to studio
------------------------------------------------------------
drop policy if exists "lead_events open" on public.lead_events;
create policy "lead_events_auth_all" on public.lead_events
  for all to authenticated using (true) with check (true);

------------------------------------------------------------
-- Storage: public read of listing photos stays, writes drop anon
------------------------------------------------------------
drop policy if exists "listing photos write insert" on storage.objects;
drop policy if exists "listing photos write update" on storage.objects;
drop policy if exists "listing photos write delete" on storage.objects;

create policy "listing photos auth insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-photos');

create policy "listing photos auth update" on storage.objects
  for update to authenticated
  using  (bucket_id = 'listing-photos')
  with check (bucket_id = 'listing-photos');

create policy "listing photos auth delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos');
;
