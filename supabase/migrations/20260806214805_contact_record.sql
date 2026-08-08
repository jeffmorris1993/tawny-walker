-- One person, one row.
--
-- Joining the Tawny & Co. list and submitting an inquiry both write to
-- public.leads, matched on lowercased email. A list member who later inquires
-- is upgraded in place rather than duplicated, and every inquiry also puts
-- that person on the list.
--
-- Both public write paths become SECURITY DEFINER functions. anon cannot
-- SELECT or UPDATE leads, so "does this person already exist?" has to be
-- decided server-side. That also collapses the validation currently
-- duplicated between the client and the RLS policy into one place.
--
-- NOTE: do NOT add `force row level security` to public.leads. Both functions
-- below run as the table owner and FORCE would block them.

-- ── list columns ───────────────────────────────────────────────────────────
alter table public.leads
  add column if not exists email_lower text
    generated always as (nullif(lower(btrim(email)), '')) stored,
  add column if not exists on_list boolean not null default false,
  add column if not exists list_joined_at timestamptz,
  add column if not exists list_source text,
  add column if not exists list_interests text[] not null default '{}',
  add column if not exists list_unsubscribed_at timestamptz;

alter table public.leads drop constraint if exists leads_list_source_check;
alter table public.leads
  add constraint leads_list_source_check
  check (list_source is null or list_source in (
    'home-list', 'footer', 'listing-detail', 'about', 'list-page',
    'modal', 'inquiry', 'studio'
  ));

-- ── refuse to proceed if the email key isn't unique yet ────────────────────
-- Merging two rows that describe the same person is a judgement call about
-- studio data (which intake to keep, which status is current), so it is not
-- automated here. If this raises, resolve the duplicates by hand — keeping the
-- newest row and preserving the loser's intake into lead_events — then re-run.
do $$
declare
  v_dupes text;
begin
  select string_agg(e || ' (' || n || ')', ', ')
    into v_dupes
    from (
      select lower(btrim(email)) as e, count(*) as n
        from public.leads
       where nullif(btrim(coalesce(email, '')), '') is not null
       group by 1
      having count(*) > 1
    ) d;

  if v_dupes is not null then
    raise exception
      'public.leads has duplicate emails; merge them before adding the unique index: %', v_dupes
      using errcode = '23505';
  end if;
end $$;

create unique index if not exists leads_email_lower_key
  on public.leads (email_lower) where email_lower is not null;

create index if not exists leads_on_list_idx
  on public.leads (on_list) where on_list;

-- ── join_list ──────────────────────────────────────────────────────────────
-- Deliberately narrow: it only ever touches list columns. It must never
-- change role, status, stars, studio_note, summary, or intake, so that
-- someone who is already a Buyer joining the list from the footer has their
-- lead left completely undisturbed.
--
-- Returns void so a new signup and a repeat signup are indistinguishable to
-- the caller — there is no email-enumeration oracle.
create or replace function public.join_list(
  p_first_name text,
  p_email      text,
  p_source     text   default 'home-list',
  p_interests  text[] default '{}'
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_first  text   := btrim(coalesce(p_first_name, ''));
  v_email  text   := btrim(coalesce(p_email, ''));
  v_source text   := coalesce(nullif(btrim(coalesce(p_source, '')), ''), 'home-list');
  v_ints   text[] := coalesce(p_interests, '{}');
begin
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

  insert into public.leads (
    first_name, email, role, tone,
    on_list, list_joined_at, list_source, list_interests
  ) values (
    v_first, v_email, 'Contact', 'warm',
    true, now(), v_source, v_ints
  )
  on conflict (email_lower) where email_lower is not null
  do update set
    on_list              = true,
    list_unsubscribed_at = null,
    list_joined_at       = coalesce(public.leads.list_joined_at, now()),
    list_source          = coalesce(public.leads.list_source, excluded.list_source),
    list_interests       = coalesce((
      select array_agg(distinct i)
        from unnest(public.leads.list_interests || excluded.list_interests) as i
    ), '{}'),
    -- Only fill a name we don't already have. Never overwrite a real one.
    first_name           = case
      when coalesce(btrim(public.leads.first_name), '') in ('', 'Unknown')
      then excluded.first_name
      else public.leads.first_name
    end;
end $$;

-- ── submit_inquiry ─────────────────────────────────────────────────────────
-- Enforces everything the leads_public_insert policy did (role and tone
-- enums, length caps, intake size), then either inserts a new lead or
-- upgrades the existing one.
--
-- Written as an explicit branch rather than an upsert because it needs the
-- pre-update row to preserve the previous submission into lead_events.
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
  -- Mirrors the form rule: a name, plus an email or a phone.
  if v_email is null and v_phone is null then
    raise exception 'an email or phone is required' using errcode = '22023';
  end if;
  if jsonb_typeof(v_intake) <> 'array' then
    raise exception 'intake must be an array' using errcode = '22023';
  end if;
  if octet_length(v_intake::text) > 20000 then
    raise exception 'intake too large' using errcode = '22023';
  end if;

  -- Phone-only submissions have no key to match on, so they always insert.
  --
  -- v_prev is only populated when the matched row carries a real earlier
  -- submission. Someone who joined the list and is now inquiring for the
  -- first time has an empty intake, and must not be reported as a repeat —
  -- the notification email keys "Repeat inquiry" off exactly this being set.
  if v_email is not null then
    select l.id,
           case when jsonb_array_length(coalesce(l.intake, '[]'::jsonb)) > 0
                then jsonb_build_object(
                  'role',          l.role,
                  'summary',       l.summary,
                  'mandate_notes', l.mandate_notes,
                  'intake',        l.intake
                )
           end
      into v_id, v_prev
      from public.leads l
     where l.email_lower = lower(v_email)
     limit 1;
  end if;

  if v_id is null then
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
  else
    update public.leads set
      -- Contact details: fill gaps, never clobber what the studio already has.
      first_name    = case
        when coalesce(btrim(first_name), '') in ('', 'Unknown') then v_first
        else first_name end,
      last_name     = coalesce(last_name, v_last),
      phone         = coalesce(phone, v_phone),
      entity        = coalesce(v_entity, entity),
      city          = coalesce(v_city, city),
      -- The inquiry itself is authoritative: newest answers win.
      role          = p_role,
      tone          = p_tone,
      summary       = coalesce(v_summary, summary),
      mandate_notes = v_notes,
      intake        = v_intake,
      -- Inquiring always puts you on the list.
      on_list              = true,
      list_joined_at       = coalesce(list_joined_at, now()),
      list_source          = coalesce(list_source, 'inquiry'),
      list_unsubscribed_at = null,
      -- Resurface a dormant contact; leave a live conversation where it is.
      status = case when status in ('Closed','Cold') then 'New' else status end
    where id = v_id;
  end if;

  -- One event per submission, first-time or repeat. This is what the
  -- notification webhook fires on, and it keeps the prior answers visible in
  -- the studio log instead of being overwritten.
  insert into public.lead_events (lead_id, kind, previous_value, next_value, actor_name)
  values (
    v_id,
    'inquiry',
    v_prev::text,
    jsonb_build_object(
      'role',          p_role,
      'summary',       v_summary,
      'mandate_notes', v_notes,
      'intake',        v_intake
    )::text,
    'Public form'
  );
end $$;

-- ── grants ─────────────────────────────────────────────────────────────────
revoke all on function public.join_list(text, text, text, text[]) from public;
revoke all on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb) from public;

grant execute on function public.join_list(text, text, text, text[])
  to anon, authenticated;
grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb)
  to anon, authenticated;
