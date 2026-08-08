-- Tawny & Co. — public + admin schema.

create extension if not exists pgcrypto;

create table public.listings (
  id text primary key,
  addr text not null,
  street text not null,
  loc text not null,
  price text not null,
  specs text not null,
  status text not null check (status in ('Active', 'Pending', 'Sold', 'Draft')),
  tone text not null,
  tag text,
  img text,
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
  summary text[],
  attributes jsonb,
  area jsonb,
  sort_order int default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index listings_status_idx on public.listings(status);
create index listings_sort_order_idx on public.listings(sort_order);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('Buyer', 'Seller', 'Investor', 'Agent')),
  entity text,
  city text,
  referred_by text,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Cold')),
  tone text not null default 'warm',
  stars int not null default 0 check (stars between 0 and 3),
  summary text,
  mandate_notes text,
  studio_note text,
  studio_note_saved_at timestamptz,
  intake jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index leads_status_idx on public.leads(status);
create index leads_role_idx on public.leads(role);
create index leads_created_at_idx on public.leads(created_at desc);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('buyer', 'seller', 'investor', 'agent')),
  name text not null,
  contact text not null,
  payload jsonb not null,
  message text,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz default now()
);

create index inquiries_role_idx on public.inquiries(role);
create index inquiries_created_at_idx on public.inquiries(created_at desc);

create table public.attached_listings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  listing_id text not null references public.listings(id) on delete cascade,
  shared_at text,
  created_at timestamptz default now(),
  unique (lead_id, listing_id)
);

create index attached_listings_lead_idx on public.attached_listings(lead_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

create trigger trg_leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.listings enable row level security;
alter table public.leads enable row level security;
alter table public.inquiries enable row level security;
alter table public.attached_listings enable row level security;

create policy "listings_public_read" on public.listings
  for select using (true);

create policy "inquiries_public_insert" on public.inquiries
  for insert with check (true);

create policy "listings_admin_all" on public.listings
  for all to authenticated using (true) with check (true);

create policy "leads_admin_all" on public.leads
  for all to authenticated using (true) with check (true);

create policy "inquiries_admin_all" on public.inquiries
  for all to authenticated using (true) with check (true);

create policy "attached_admin_all" on public.attached_listings
  for all to authenticated using (true) with check (true);;
