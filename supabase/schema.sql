-- HighPay Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Then enable Email/Phone/Google/GitHub under Authentication → Providers

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cash-out requests (OTC leads / orders)
create type public.order_status as enum (
  'pending',
  'quoted',
  'awaiting_deposit',
  'confirming',
  'paid',
  'cancelled'
);

create type public.payout_method as enum (
  'bank',
  'mobile_money',
  'cash'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  phone text not null,
  usdt_amount numeric(18, 6) not null check (usdt_amount > 0),
  quoted_ugx numeric(18, 2),
  fee_rate numeric(5, 4) not null default 0.02,
  payout_method public.payout_method,
  payout_details text, -- account / momo number / pickup note
  status public.order_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Users see only their own orders
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

-- Service role / dashboard bypasses RLS for staff ops
-- (use Supabase service role key only on a secure backend, never in the browser)

-- Contact / WhatsApp lead log (optional)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone text,
  message text,
  source text default 'website',
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anyone can insert a lead from the site (rate-limit at edge if abused)
create policy "Public can insert leads"
  on public.leads for insert
  with check (true);

-- No public read on leads
create policy "No public read leads"
  on public.leads for select
  using (false);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Simple public stats view (optional; numbers can also stay hardcoded on the site)
-- Staff can maintain a single-row table for marketing metrics
create table if not exists public.site_stats (
  id int primary key default 1 check (id = 1),
  avg_tx_per_day numeric(10, 1) not null default 7,
  monthly_users int not null default 200,
  location text not null default 'Zone 7, Mutungo, Kampala',
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, avg_tx_per_day, monthly_users, location)
values (1, 7, 200, 'Zone 7, Mutungo, Kampala')
on conflict (id) do update set
  avg_tx_per_day = excluded.avg_tx_per_day,
  monthly_users = excluded.monthly_users,
  location = excluded.location,
  updated_at = now();

alter table public.site_stats enable row level security;

create policy "Public can read site_stats"
  on public.site_stats for select
  using (true);

-- Done.
-- Next:
-- 1. Authentication → Providers: enable Google, GitHub, Phone as needed
-- 2. Copy Project URL + anon key into assets/main.js
-- 3. Add your site URL under Authentication → URL Configuration
