-- Enable pg_cron once; idempotent.
create extension if not exists pg_cron;

-- Monthly backup: 09:00 UTC on the 1st of every month
-- (~5am ET in May/EDT, ~4am ET in winter/EST — lands before anyone's
-- using the studio).
--
-- cron.schedule(name, ...) is upsert-by-name in pg_cron 1.4+, so
-- re-running this migration overwrites the existing schedule cleanly.
-- The anon JWT is the public publishable key (safe to embed); the
-- edge function uses SUPABASE_SERVICE_ROLE_KEY internally to bypass
-- RLS on leads.
select cron.schedule(
  'monthly-leads-csv-backup',
  '0 9 1 * *',
  $$
  select net.http_post(
    url := 'https://zdmpkshtrtdcndvwvrug.supabase.co/functions/v1/leads-csv-backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbXBrc2h0cnRkY25kdnd2cnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDQ5MzMsImV4cCI6MjA5NDcyMDkzM30.7mV8_8XYG6e1jt_kM--FQM732VkqMFWZef_SzShV19Y'
    ),
    body := '{}'::jsonb
  );
  $$
);;
