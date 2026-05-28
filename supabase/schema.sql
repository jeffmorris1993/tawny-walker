-- Tawny & Co. — public + admin schema.
-- Run in the Supabase SQL editor. Idempotent: drops and recreates tables
-- (no data preservation). For migrations in production, write incremental
-- ALTERs instead.

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ─── Tables ─────────────────────────────────────────────────────────────────

-- Listings: the public Index.
drop table if exists public.attached_listings cascade;
drop table if exists public.leads cascade;
drop table if exists public.listings cascade;

create table public.listings (
  id text primary key,                       -- slug: 'meridian', 'lakeside-reach', etc.
  addr text not null,
  street text not null,
  loc text not null,
  price text not null,
  specs text not null,
  status text not null check (status in ('Coming Soon', 'Active', 'Pending', 'Sold', 'Draft')),
  -- Which side of the deal Tawny is representing on this listing. Nullable
  -- so legacy rows that predate the field stay valid.
  represented_by text check (represented_by in ('Buyer', 'Seller', 'Both')),
  tone text not null,                        -- color/palette key
  tag text,
  img text,                                  -- key into PHOTOS map
  blurb text,
  beds text,
  baths text,
  sqft text,
  lot text,
  built int,
  renovated int,
  architect text,
  -- Per-status effective dates. The studio sets the one matching the
  -- current status; the public detail page picks the relevant one to
  -- display ("Coming Soon", "Listed", "Pending since", "Sold").
  coming_soon_at date,
  active_at      date,
  pending_at     date,
  sold_at        date,
  -- Per-row "current status date" so server-side ORDER BY can pick the
  -- date matching each listing's status without a CASE expression at
  -- query time. Draft falls through to NULL.
  status_date date generated always as (
    case status
      when 'Coming Soon' then coming_soon_at
      when 'Active'      then active_at
      when 'Pending'     then pending_at
      when 'Sold'        then sold_at
    end
  ) stored,
  listed_at text,                            -- legacy freeform string; superseded by the four typed columns above
  tagline text,
  summary text[],                            -- editorial paragraphs
  attributes jsonb,                          -- [{l, v}, ...]
  area jsonb,                                -- {name, body, coords, waterLabel, nearby:[{l,v}]}
  sort_order int default 100,
  -- Numeric form of the freeform `price` text so server-side ORDER BY
  -- works. The K/M/B suffix is multiplied through, so "$1.45M" sorts
  -- above "$289K" instead of being treated as 1.45.
  price_value numeric generated always as (
    case
      when price ~* 'b\s*$' then
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * 1000000000
      when price ~* 'm\s*$' then
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * 1000000
      when price ~* 'k\s*$' then
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * 1000
      else
        nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric
    end
  ) stored,
  -- Status sort order used by the admin "By Status" column so the pipeline
  -- reads Coming Soon → Active → Pending → Sold → Draft top to bottom.
  status_rank int generated always as (
    case status
      when 'Coming Soon' then 1
      when 'Active'      then 2
      when 'Pending'     then 3
      when 'Sold'        then 4
      when 'Draft'       then 5
      else 99
    end
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index listings_status_idx on public.listings(status);
create index listings_sort_order_idx on public.listings(sort_order);
create index listings_status_date_idx on public.listings(status_date desc);

-- Leads: people who have inquired through the public form.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text,
  phone text,
  role text not null check (role in ('Buyer', 'Seller', 'Investor', 'Agent')),
  entity text,
  city text,
  referred_by text,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Cold')),
  tone text not null default 'warm',
  stars int not null default 0 check (stars between 0 and 3),
  summary text,                              -- one-line for inbox
  mandate_notes text,
  studio_note text,
  studio_note_saved_at timestamptz,
  intake jsonb,                              -- [{q, a}, ...]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index leads_status_idx on public.leads(status);
create index leads_role_idx on public.leads(role);
create index leads_created_at_idx on public.leads(created_at desc);

-- Attached listings: studio's private record of listings shared with a lead.
create table public.attached_listings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  listing_id text not null references public.listings(id) on delete cascade,
  shared_at text,                            -- editorial display, e.g. "May 13"
  created_at timestamptz default now(),
  unique (lead_id, listing_id)
);

create index attached_listings_lead_idx on public.attached_listings(lead_id);

-- ─── updated_at triggers ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
-- Public surface gets two privileges and nothing else:
--   1. SELECT on listings (for the marketing pages)
--   2. INSERT on leads — column-scoped grant + a strict with_check (for
--      the inquiry form). Studio-only columns (status, stars,
--      studio_note, referred_by) are NOT granted to anon, so PostgREST
--      clients cannot set them; the column defaults fill them in.
-- Everything else — UPDATE/DELETE on listings, all DML on leads,
-- attached_listings, lead_events — is authenticated-only.

alter table public.listings enable row level security;
alter table public.leads enable row level security;
alter table public.attached_listings enable row level security;
alter table public.lead_events enable row level security;

-- Anyone can read listings (public Index).
drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read" on public.listings
  for select using (true);

-- Studio (Tawny, signed in via Supabase Auth) keeps full access.
drop policy if exists "listings_admin_all" on public.listings;
drop policy if exists "listings_auth_write" on public.listings;
create policy "listings_auth_write" on public.listings
  for all to authenticated using (true) with check (true);

-- Public can insert a lead via the inquiry form. Column grants below
-- restrict which fields PostgREST will accept from anon; the policy then
-- bounds the values themselves (role enum, tone enum, length caps).
revoke insert on public.leads from anon;
grant insert (first_name, last_name, email, phone, role, entity, city,
              summary, mandate_notes, intake, tone) on public.leads to anon;

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon with check (
    role in ('Buyer','Seller','Investor','Agent')
    and tone in ('warm','bone','dusk','sage')
    and length(coalesce(first_name,''))    between 1 and 80
    and length(coalesce(last_name,''))     <= 80
    and length(coalesce(email,''))         <= 200
    and length(coalesce(phone,''))         <= 60
    and length(coalesce(entity,''))        <= 200
    and length(coalesce(city,''))          <= 200
    and length(coalesce(summary,''))       <= 1000
    and length(coalesce(mandate_notes,'')) <= 4000
    and octet_length(coalesce(intake, '[]'::jsonb)::text) <= 20000
  );

drop policy if exists "leads_admin_all" on public.leads;
drop policy if exists "leads_auth_all" on public.leads;
create policy "leads_auth_all" on public.leads
  for all to authenticated using (true) with check (true);

-- attached_listings + lead_events are studio-only.
drop policy if exists "attached_admin_all" on public.attached_listings;
drop policy if exists "attached_auth_all" on public.attached_listings;
create policy "attached_auth_all" on public.attached_listings
  for all to authenticated using (true) with check (true);

drop policy if exists "lead_events open" on public.lead_events;
drop policy if exists "lead_events_auth_all" on public.lead_events;
create policy "lead_events_auth_all" on public.lead_events
  for all to authenticated using (true) with check (true);
