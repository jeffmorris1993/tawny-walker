-- Demo login signs in against env credentials, not Supabase Auth, so admin
-- queries run as the anon role. Open up admin-scoped tables to anon for now.
-- When the app moves to real Supabase Auth, tighten these back to `authenticated`.

drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all" on public.leads
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "inquiries_admin_all" on public.inquiries;
create policy "inquiries_admin_all" on public.inquiries
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "attached_admin_all" on public.attached_listings;
create policy "attached_admin_all" on public.attached_listings
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "listings_admin_all" on public.listings;
create policy "listings_admin_all" on public.listings
  for all to anon, authenticated using (true) with check (true);;
