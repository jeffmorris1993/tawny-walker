-- Rate limit the two public write paths.
--
-- Both join_list and submit_inquiry emit a lead_events row, and every such row
-- fires the notification webhook. Unthrottled that is an outbound-email
-- primitive anyone can drive in a loop: submit_inquiry with a single repeated
-- address produces one row and unlimited emails. The real damage is not the
-- junk data, it is exhausting the Resend quota, after which genuine inquiry
-- notifications stop being delivered and nobody is told. That makes it an
-- availability attack on the studio's speed-to-lead, which is the whole point
-- of the notification.
--
-- The counters live server-side inside the SECURITY DEFINER functions, so
-- calling the RPC directly (bypassing the form, its honeypot and its timing
-- gate, all of which are client-side) does not get around them.
--
-- What this does and does not stop, plainly: it stops a loop from one host, and
-- it stops repeated submissions for one address. It does not stop a distributed
-- attacker rotating both IP and email. That needs a captcha; this is the
-- cheaper 80% and can sit underneath one later.

create table if not exists public.public_write_throttle (
  scope        text        not null,   -- 'ip' | 'email'
  key          text        not null,
  window_start timestamptz not null default now(),
  hits         integer     not null default 0,
  primary key (scope, key)
);

create index if not exists public_write_throttle_window_idx
  on public.public_write_throttle (window_start);

-- No policies and no grants: the table is reachable only by its owner, which
-- is what the SECURITY DEFINER functions below run as. anon and authenticated
-- cannot read the counters (they would reveal which addresses are on file) or
-- reset them.
alter table public.public_write_throttle enable row level security;
revoke all on public.public_write_throttle from anon, authenticated;

create or replace function public.throttle_public_write(
  p_scope  text,
  p_key    text,
  p_limit  integer,
  p_window interval
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits integer;
begin
  if p_key is null or btrim(p_key) = '' then return; end if;

  -- One atomic upsert: the counter resets when the row's window has aged out,
  -- otherwise it increments. Doing it in a single statement is what makes this
  -- safe under concurrency, where a read-then-write would let simultaneous
  -- requests each see a stale count.
  insert into public.public_write_throttle as t (scope, key, window_start, hits)
  values (p_scope, left(p_key, 200), now(), 1)
  on conflict (scope, key) do update set
    window_start = case when t.window_start < now() - p_window then now() else t.window_start end,
    hits         = case when t.window_start < now() - p_window then 1 else t.hits + 1 end
  returning t.hits into v_hits;

  -- Opportunistic cleanup so a run of rotating addresses cannot grow this
  -- table without bound. Cheap because it almost never runs.
  if random() < 0.01 then
    delete from public.public_write_throttle where window_start < now() - interval '1 day';
  end if;

  if v_hits > p_limit then
    -- Raising rolls back this transaction, including the increment above. That
    -- is harmless: the counter stays pinned at the limit and every further
    -- request re-increments to limit + 1 and is refused again.
    --
    -- The 'PGRST' sqlstate is PostgREST's hook for setting the response status
    -- explicitly. Without it this surfaces as a 500, which is both wrong (the
    -- request was refused, the server did not fail) and noisy, since genuine
    -- server errors are what should be alerted on. The body carries no detail,
    -- so it cannot be used to probe which addresses are on file.
    raise sqlstate 'PGRST' using
      message = pg_catalog.json_build_object(
        'code', '429',
        'message', 'Too many requests. Please try again later.',
        'details', null,
        'hint', null
      )::text,
      detail = pg_catalog.json_build_object(
        'status', 429,
        'headers', pg_catalog.json_build_object('Retry-After', '3600')
      )::text;
  end if;
end $$;

revoke all on function public.throttle_public_write(text, text, integer, interval) from public;
-- Not granted to anon: it is called from inside the two definer functions,
-- which run as the owner. Exposing it directly would let a caller burn other
-- people's quota.

-- The caller's address, as PostgREST sees it. Null when the function is called
-- from a direct database session rather than over the API, in which case the
-- IP limit simply does not apply.
create or replace function public.request_ip()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_headers json;
  v_xff text;
begin
  v_headers := nullif(current_setting('request.headers', true), '')::json;
  if v_headers is null then return null; end if;
  v_xff := v_headers ->> 'x-forwarded-for';
  if v_xff is null then return null; end if;
  -- x-forwarded-for is a list; the client is the first entry.
  return btrim(split_part(v_xff, ',', 1));
end $$;

revoke all on function public.request_ip() from public;

-- ── wire the limits into the two public entry points ───────────────────────
-- Limits are per rolling hour. A real person filling in a form once, then
-- again after spotting a typo, is nowhere near them; a script is immediately.

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
      'role', p_role, 'summary', v_summary, 'mandate_notes', v_notes,
      'entity', v_entity, 'city', v_city, 'tone', p_tone, 'intake', v_intake
    )::text,
    'Public form'
  );
end $$;

revoke all on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, text, text, text, jsonb)
  to anon, authenticated;
