-- The Tawny & Co. list now collects a full name and a phone number, not just
-- a first name and an email.
--
-- The old four-argument signature is dropped rather than left alongside the
-- new one: `create or replace` with a different argument list creates an
-- overload, and two live versions of a public write path is exactly the kind
-- of ambiguity that leaves one of them quietly unmaintained.
drop function if exists public.join_list(text, text, text, text[]);

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
begin
  -- Only first name and email are enforced here. Last name and phone are
  -- required by the signup form, but keeping the function itself permissive
  -- means a lighter placement (a footer strip asking for less, say) can reuse
  -- it without a migration. The caps below still bound whatever arrives.
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
    first_name, last_name, email, phone, role, tone,
    on_list, list_joined_at, list_source, list_interests
  ) values (
    v_first, v_last, v_email, v_phone, 'Contact', 'warm',
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
    -- Fill gaps only. Someone re-joining the list must never overwrite the
    -- name or number the studio already has on an existing lead.
    first_name           = case
      when coalesce(btrim(public.leads.first_name), '') in ('', 'Unknown')
      then excluded.first_name
      else public.leads.first_name
    end,
    last_name            = coalesce(public.leads.last_name, excluded.last_name),
    phone                = coalesce(public.leads.phone, excluded.phone);
end $$;

revoke all on function public.join_list(text, text, text, text, text, text[]) from public;
grant execute on function public.join_list(text, text, text, text, text, text[])
  to anon, authenticated;
