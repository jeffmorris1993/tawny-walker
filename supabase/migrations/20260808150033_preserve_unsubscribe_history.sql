-- Stop the public forms erasing a record that someone unsubscribed.
--
-- Both functions set `on_list = true` and then nulled `list_unsubscribed_at` on
-- an existing row. Nothing verifies that whoever submitted the form owns the
-- address, so anyone who knew it could put a person who had asked to be removed
-- back on the list. Worse, wiping the stamp also destroyed the evidence: with
-- list_joined_at preserved by coalesce, the record afterwards looked untouched,
-- so there was no way for the studio to notice it had happened.
--
-- The re-subscribe itself still goes through. Refusing it would mean either
-- lying to someone legitimately rejoining ("You're on the list") or telling
-- them they had unsubscribed before, which hands out an oracle for probing
-- which addresses have. Keeping the stamp makes the event visible instead of
-- preventing it, and the lead detail panel now surfaces it.
--
-- The real fix is a confirmation link on re-subscribes, which proves ownership
-- of the address. That needs the sending infrastructure this list does not have
-- yet, and belongs with it.
--
-- Note the studio's own toggle (setListMembership) still clears the stamp when
-- Tawny re-adds someone. That is a deliberate, authenticated act by the person
-- who took the request in the first place.

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
  v_ints   text[];
  v_id     uuid;
  v_already boolean;
  v_new_member boolean := false;
begin
  if length(v_first) < 1 or length(v_first) > 80 then
    raise exception 'invalid first_name' using errcode = '22023';
  end if;
  if length(v_email) > 200
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if coalesce(array_length(coalesce(p_interests, '{}'), 1), 0) > 12 then
    raise exception 'too many interests' using errcode = '22023';
  end if;

  -- Checked after validation so malformed junk cannot burn a real visitor's
  -- allowance, and before any write so a refused call leaves nothing behind.
  perform public.throttle_public_write('ip', public.request_ip(), 8, interval '1 hour');
  perform public.throttle_public_write('email', lower(v_email), 4, interval '1 hour');

  select coalesce(array_agg(distinct left(i, 80)), '{}')
    into v_ints
    from unnest(coalesce(p_interests, '{}')) as i
   where nullif(btrim(i), '') is not null;

  if v_source not in ('home-list','footer','listing-detail','about','list-page','modal','inquiry','studio') then
    v_source := 'home-list';
  end if;

  select l.id, l.on_list into v_id, v_already
    from public.leads l
   where l.email_lower = lower(v_email)
   limit 1;

  if v_id is null then
    begin
      insert into public.leads (
        first_name, last_name, email, phone, role, tone,
        on_list, list_joined_at, list_source, list_interests
      ) values (
        v_first, v_last, v_email, v_phone, 'Contact', 'warm',
        true, now(), v_source, v_ints
      )
      returning id into v_id;
      v_new_member := true;
    exception when unique_violation then
      select l.id, l.on_list into v_id, v_already
        from public.leads l
       where l.email_lower = lower(v_email)
       limit 1;
    end;
  end if;

  if not v_new_member then
    update public.leads set
      on_list              = true,
      list_joined_at       = coalesce(list_joined_at, now()),
      list_source          = coalesce(list_source, v_source),
      list_interests       = coalesce((
        select array_agg(distinct i)
          from unnest(list_interests || v_ints) as i
         limit 12
      ), '{}'),
      first_name = case
        when coalesce(btrim(first_name), '') in ('', 'Unknown') then v_first
        else first_name end,
      last_name  = coalesce(last_name, v_last),
      phone      = coalesce(phone, v_phone)
    where id = v_id;

    v_new_member := not coalesce(v_already, false);
  end if;

  if v_new_member then
    insert into public.lead_events (lead_id, kind, next_value, actor_name)
    values (
      v_id,
      'list_signup',
      jsonb_build_object('source', v_source, 'interests', to_jsonb(v_ints))::text,
      'The List'
    );
  end if;
end $$;

create or replace function public.submit_inquiry(
  p_first_name    text,
  p_last_name     text,
  p_email         text,
  p_phone         text,
  p_role          text,
  p_tone          text,
  p_entity        text,
  p_city          text,
  p_summary       text,
  p_mandate_notes text,
  p_intake        jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_first   text  := left(btrim(coalesce(p_first_name, '')), 80);
  v_last    text  := nullif(left(btrim(coalesce(p_last_name, '')), 80), '');
  v_email   text  := nullif(btrim(coalesce(p_email, '')), '');
  v_phone   text  := nullif(left(btrim(coalesce(p_phone, '')), 60), '');
  v_entity  text  := nullif(left(btrim(coalesce(p_entity, '')), 200), '');
  v_city    text  := nullif(left(btrim(coalesce(p_city, '')), 200), '');
  v_summary text  := nullif(left(btrim(coalesce(p_summary, '')), 1000), '');
  v_notes   text  := nullif(left(btrim(coalesce(p_mandate_notes, '')), 4000), '');
  v_intake  jsonb := coalesce(p_intake, '[]'::jsonb);
  v_id      uuid;
  v_prev    jsonb;
  v_fresh   boolean := false;
begin
  if v_first = '' then v_first := 'Unknown'; end if;

  if p_role not in ('Buyer','Seller','Investor','Agent','Design','Exploring') then
    raise exception 'invalid role' using errcode = '22023';
  end if;
  if p_tone not in ('warm','bone','dusk','sage','bloom','moss') then
    raise exception 'invalid tone' using errcode = '22023';
  end if;
  if v_email is not null
     and (length(v_email) > 200
          or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if v_email is null and v_phone is null then
    raise exception 'an email or phone is required' using errcode = '22023';
  end if;
  if jsonb_typeof(v_intake) <> 'array' then
    raise exception 'intake must be an array' using errcode = '22023';
  end if;
  if octet_length(v_intake::text) > 20000 then
    raise exception 'intake too large' using errcode = '22023';
  end if;

  -- Tighter on email than join_list: a repeat inquiry for the same address
  -- overwrites the lead and emails the studio every single time, so it is the
  -- cheapest way to generate mail and the one most worth bounding.
  perform public.throttle_public_write('ip', public.request_ip(), 8, interval '1 hour');
  perform public.throttle_public_write('email', lower(coalesce(v_email, v_phone)), 3, interval '1 hour');

  if v_email is not null then
    select l.id,
           case when jsonb_array_length(coalesce(l.intake, '[]'::jsonb)) > 0
                then jsonb_build_object(
                  'role', l.role, 'summary', l.summary,
                  'mandate_notes', l.mandate_notes, 'entity', l.entity,
                  'city', l.city, 'tone', l.tone, 'intake', l.intake
                )
           end
      into v_id, v_prev
      from public.leads l
     where l.email_lower = lower(v_email)
     limit 1;
  end if;

  if v_id is null then
    begin
      insert into public.leads (
        first_name, last_name, email, phone, role, tone,
        entity, city, summary, mandate_notes, intake,
        on_list, list_joined_at, list_source
      ) values (
        v_first, v_last, v_email, v_phone, p_role, p_tone,
        v_entity, v_city, v_summary, v_notes, v_intake,
        v_email is not null,
        case when v_email is not null then now() end,
        case when v_email is not null then 'inquiry' end
      )
      returning id into v_id;
      v_fresh := true;
    exception when unique_violation then
      select l.id,
             case when jsonb_array_length(coalesce(l.intake, '[]'::jsonb)) > 0
                  then jsonb_build_object(
                    'role', l.role, 'summary', l.summary,
                    'mandate_notes', l.mandate_notes, 'entity', l.entity,
                    'city', l.city, 'tone', l.tone, 'intake', l.intake
                  )
             end
        into v_id, v_prev
        from public.leads l
       where l.email_lower = lower(v_email)
       limit 1;
    end;
  end if;

  if not v_fresh then
    update public.leads set
      first_name    = case
        when coalesce(btrim(first_name), '') in ('', 'Unknown') then v_first
        else first_name end,
      last_name     = coalesce(last_name, v_last),
      phone         = coalesce(phone, v_phone),
      entity        = coalesce(entity, v_entity),
      city          = coalesce(city, v_city),
      role          = p_role,
      tone          = p_tone,
      summary       = coalesce(v_summary, summary),
      mandate_notes = v_notes,
      intake        = v_intake,
      on_list              = true,
      list_joined_at       = coalesce(list_joined_at, now()),
      list_source          = coalesce(list_source, 'inquiry'),
      status = case when status in ('Closed','Cold') then 'New' else status end
    where id = v_id;
  end if;

  insert into public.lead_events (lead_id, kind, previous_value, next_value, actor_name)
  values (
    v_id,
    'inquiry',
    v_prev::text,
    jsonb_build_object(
      'role', p_role, 'summary', v_summary, 'mandate_notes', v_notes,
      'entity', v_entity, 'city', v_city, 'tone', p_tone, 'intake', v_intake
    )::text,
    'Public form'
  );
end $$;

-- create or replace preserves an existing function's ACL, but restating the
-- grants keeps this migration readable on its own rather than depending on
-- what an earlier one happened to leave behind.
revoke all on function public.join_list(text, text, text, text, text, text[]) from public;
grant execute on function public.join_list(text, text, text, text, text, text[])
  to anon, authenticated;

revoke all on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb)
  to anon, authenticated;
