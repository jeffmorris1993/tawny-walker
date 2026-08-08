-- Remove the row created while confirming the rate limit engages on the live
-- project, and clear the counters that check left behind so a real visitor
-- from the same address is not refused.
--
-- Both are no-ops in every other environment.
delete from public.leads where email_lower = 'throttle.check@example.com';
delete from public.public_write_throttle where key = 'throttle.check@example.com';
