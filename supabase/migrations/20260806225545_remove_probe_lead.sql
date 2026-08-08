-- Remove the probe row created while verifying, against the live project, that
-- closing the anon INSERT path left join_list() and submit_inquiry() working.
--
-- (The preceding migration, 20260806224722_clear_final_probe.sql, is empty: the
-- shell writing it was interrupted before its body landed, and it applied as a
-- no-op. It is left as-is rather than edited, because a migration that has
-- already run is history — corrections belong in a new file. This is that file.)
--
-- Deleted by email, so it is a no-op in every other environment.
delete from public.leads where email_lower = 'probe.final@example.com';
