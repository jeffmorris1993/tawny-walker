-- Notify the studio when someone joins the Tawny & Co. list.
--
-- List signups were silent: the notification webhook fires on lead_events rows
-- of kind 'inquiry', and join_list never wrote an event. So join_list now
-- records one, and the same webhook carries it.
--
-- Only a genuinely new membership emits an event. Someone who is already on
-- the list re-submitting the form updates their row as before but sends
-- nothing, so re-signups can't turn into a stream of duplicate mail.
--
-- Inquiries are deliberately excluded: submit_inquiry already auto-subscribes
-- and already writes its own 'inquiry' event, and firing both would mean two
-- emails for one submission.

alter table public.lead_events drop constraint lead_events_kind_check;
alter table public.lead_events
  add constraint lead_events_kind_check
  check (kind in ('note', 'status', 'inquiry', 'list_signup'));

create or replace function public.join_list(
  p_first_name text,
  p_last_name  text,
  p_email      text,
  p_phone      text,
  p_source     text   default 'home-list',
  p_interests  text[] default '{}'
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_first  text   := btrim(coalesce(p_first_name, ''));
  v_last   text   := nullif(left(btrim(coalesce(p_last_name, '')), 80), '');
  v_email  text   := btrim(coalesce(p_email, ''));
  v_phone  text   := nullif(left(btrim(coalesce(p_phone, '')), 60), '');
  v_source text   := coalesce(nullif(btrim(coalesce(p_source, '')), ''), 'home-list');
  v_ints   text[] := coalesce(p_interests, '{}');
  v_id     uuid;
  v_already boolean;
begin
  -- Only first name and email are enforced here. Last name and phone are
  -- required by the signup form, but keeping the function itself permissive
  -- means a lighter placement can reuse it without a migration.
  if length(v_first) < 1 or length(v_first) > 80 then
    raise exception 'invalid first_name' using errcode = '22023';
  end if;
  if length(v_email) > 200
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if coalesce(array_length(v_ints, 1), 0) > 12 then
    raise exception 'too many interests' using errcode = '22023';
  end if;
  if v_source not in ('home-list','footer','listing-detail','about','list-page','modal','inquiry','studio') then
    v_source := 'home-list';
  end if;

  -- Written as an explicit branch rather than an upsert so the function can
  -- tell a new member from someone re-submitting, which is what decides
  -- whether the studio hears about it.
  select l.id, l.on_list into v_id, v_already
    from public.leads l
   where l.email_lower = lower(v_email)
   limit 1;

  if v_id is null then
    insert into public.leads (
      first_name, last_name, email, phone, role, tone,
      on_list, list_joined_at, list_source, list_interests
    ) values (
      v_first, v_last, v_email, v_phone, 'Contact', 'warm',
      true, now(), v_source, v_ints
    )
    returning id into v_id;
  else
    update public.leads set
      on_list              = true,
      list_unsubscribed_at = null,
      list_joined_at       = coalesce(list_joined_at, now()),
      list_source          = coalesce(list_source, v_source),
      list_interests       = coalesce((
        select array_agg(distinct i) from unnest(list_interests || v_ints) as i
      ), '{}'),
      -- Fill gaps only. Re-joining must never overwrite the name or number
      -- the studio already holds.
      first_name = case
        when coalesce(btrim(first_name), '') in ('', 'Unknown') then v_first
        else first_name end,
      last_name  = coalesce(last_name, v_last),
      phone      = coalesce(phone, v_phone)
    where id = v_id;
  end if;

  if not coalesce(v_already, false) then
    insert into public.lead_events (lead_id, kind, next_value, actor_name)
    values (
      v_id,
      'list_signup',
      jsonb_build_object(
        'source',    v_source,
        'interests', to_jsonb(v_ints)
      )::text,
      'The List'
    );
  end if;
end $$;

revoke all on function public.join_list(text, text, text, text, text, text[]) from public;
grant execute on function public.join_list(text, text, text, text, text, text[])
  to anon, authenticated;

-- Carry the new kind on the existing webhook rather than adding a second one,
-- so there stays exactly one path from "something happened" to "an email went
-- out". lead-notify branches on kind to decide which email to render.
drop trigger if exists trg_lead_events_notify on public.lead_events;
create trigger trg_lead_events_notify
  after insert on public.lead_events
  for each row
  when (new.kind in ('inquiry', 'list_signup'))
  execute function supabase_functions.http_request(
    'https://zdmpkshtrtdcndvwvrug.supabase.co/functions/v1/lead-notify',
    'POST',
    '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbXBrc2h0cnRkY25kdnd2cnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDQ5MzMsImV4cCI6MjA5NDcyMDkzM30.7mV8_8XYG6e1jt_kM--FQM732VkqMFWZef_SzShV19Y"}',
    '{}',
    '5000'
  );
