-- Remove the rows created while verifying the new permissions against the
-- live project: one contact from join_list, and one lead from the legacy
-- anon insert path (checked to confirm the running inquiry form had not been
-- broken by revoking anon's SELECT privilege).
--
-- Deleted by email, so this is a no-op in every other environment.
delete from public.leads
 where email_lower in (
   'ping.check@example.com',
   'legacy.path@example.com'
 );
