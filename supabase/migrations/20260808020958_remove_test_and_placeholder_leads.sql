-- Clear the last two non-real leads out of production, leaving Tawny an empty
-- inbox before any genuine one arrives.
--
--   signup.test@example.com     the signup fired to confirm the list
--                               notification reaches her inbox
--   morrisjeffjr1993@gmail.com  a walkthrough of the guided inquiry, not a
--                               real enquiry
--
-- lead_events rows cascade on lead_id, so the inquiry and list_signup entries
-- behind these two go with them. Any "View in studio" link in the notification
-- emails already sent will 404 after this, which is expected.
--
-- Deleted by email, so this is a no-op in every other environment.
delete from public.leads
 where email_lower in (
   'signup.test@example.com',
   'morrisjeffjr1993@gmail.com'
 );
