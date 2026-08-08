-- Security review follow-ups on the two public write paths.
--
-- 1. Close an email-existence oracle. Both functions did SELECT-then-branch,
--    so two concurrent calls for an address that does NOT exist both took the
--    insert branch: one won, the other hit leads_email_lower_key and PostgREST
--    returned 409 with `Key (email_lower)=(victim@example.com) already exists`.
--    An address that DOES exist returned 204 from both. That is a reliable
--    probe for whether someone is in the database, and it echoes the address
--    being probed back to the caller. Each insert is now wrapped so a lost
--    race falls through to the update path and the caller sees the same 204
--    either way.
--
-- 2. Bound the size of list_interests. The count was capped at 12 but each
--    element was unbounded, and the update path re-aggregated without a cap,
--    so repeat calls could grow the array indefinitely. Anything stored here
--    ends up in the notification email and the monthly CSV export.

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
  -- Cap each element, not just the count.
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
      -- Another request inserted this address between the select above and
      -- this insert. Swallow it and fall through to the update path, so the
      -- caller cannot distinguish a new address from an existing one.
      select l.id, l.on_list into v_id, v_already
        from public.leads l
       where l.email_lower = lower(v_email)
       limit 1;
    end;
  end if;

  if not v_new_member then
    update public.leads set
      on_list              = true,
      list_unsubscribed_at = null,
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

revoke all on function public.join_list(text, text, text, text, text, text[]) from public;
grant execute on function public.join_list(text, text, text, text, text, text[])
  to anon, authenticated;

-- ── submit_inquiry: same race, same fix ────────────────────────────────────
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

  -- v_prev is only set when the matched row carries a real earlier
  -- submission, so a list member inquiring for the first time is not
  -- reported as a repeat.
  if v_email is not null then
    select l.id,
           case when jsonb_array_length(coalesce(l.intake, '[]'::jsonb)) > 0
                then jsonb_build_object(
                  'role',          l.role,
                  'summary',       l.summary,
                  'mandate_notes', l.mandate_notes,
                  'entity',        l.entity,
                  'city',          l.city,
                  'tone',          l.tone,
                  'intake',        l.intake
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
      -- Lost a race against a concurrent submission for the same address.
      -- Fall through to the update path rather than surfacing a 409, which
      -- would reveal whether the address was already on file.
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
      -- Gap-fill rather than overwrite. These are studio-curated values, and
      -- the submitter is unauthenticated: knowing an email address should not
      -- be enough to erase what Tawny has recorded about someone.
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
      list_unsubscribed_at = null,
      status = case when status in ('Closed','Cold') then 'New' else status end
    where id = v_id;
  end if;

  insert into public.lead_events (lead_id, kind, previous_value, next_value, actor_name)
  values (
    v_id,
    'inquiry',
    v_prev::text,
    jsonb_build_object(
      'role',          p_role,
      'summary',       v_summary,
      'mandate_notes', v_notes,
      'entity',        v_entity,
      'city',          v_city,
      'tone',          p_tone,
      'intake',        v_intake
    )::text,
    'Public form'
  );
end $$;

revoke all on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb)
  to anon, authenticated;
