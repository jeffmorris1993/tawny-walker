-- Remove the two development test leads that shared an email address.
--
-- Production public.leads contained exactly these two rows and nothing else —
-- both submitted from the same address on 2026-05-28 while wiring up the lead
-- notification email. The next migration adds a unique index on the lowercased
-- email so that one person is one row, and these two collide.
--
-- Deleting rather than merging: there were no real client leads in the table,
-- and the guided inquiry rewrite needs fresh end-to-end submissions anyway.
-- attached_listings and lead_events cascade on lead_id.
--
-- Deletes are by primary key, so this is a no-op in every other environment
-- and safe to re-run.
delete from public.leads
 where id in (
   '3ff72da9-6b3a-4851-aae9-201946e078fd',  -- Buyer  · "Just testing the lead notification system"
   'e397cf08-bbb9-4e5a-a664-61e91353a1a1'   -- Agent  · Morris Realty
 );
