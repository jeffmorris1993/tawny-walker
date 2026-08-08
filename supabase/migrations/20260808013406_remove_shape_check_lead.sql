-- Remove the row created while confirming, against the live project, that the
-- widened join_list signature took and the old four-argument overload was gone.
--
-- Deleted by email, so this is a no-op in every other environment.
delete from public.leads where email_lower = 'shape.check@example.com';
