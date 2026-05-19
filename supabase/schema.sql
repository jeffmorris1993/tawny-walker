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
  status text not null check (status in ('Active', 'Pending', 'Sold', 'Draft')),
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
  listed_at text,
  tagline text,
  summary text[],                            -- editorial paragraphs
  attributes jsonb,                          -- [{l, v}, ...]
  area jsonb,                                -- {name, body, coords, waterLabel, nearby:[{l,v}]}
  sort_order int default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index listings_status_idx on public.listings(status);
create index listings_sort_order_idx on public.listings(sort_order);

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
alter table public.listings enable row level security;
alter table public.leads enable row level security;
alter table public.attached_listings enable row level security;

-- Anyone can read listings (public Index).
drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read" on public.listings
  for select using (true);

-- Anyone can submit a lead via the public form. They can't read or update
-- existing leads.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert with check (true);

-- Admin (anon + authenticated) full access. Demo login uses env credentials
-- and runs as anon; switch this to `authenticated` once real Supabase Auth
-- is in place.
drop policy if exists "listings_admin_all" on public.listings;
create policy "listings_admin_all" on public.listings
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all" on public.leads
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "attached_admin_all" on public.attached_listings;
create policy "attached_admin_all" on public.attached_listings
  for all to anon, authenticated using (true) with check (true);
