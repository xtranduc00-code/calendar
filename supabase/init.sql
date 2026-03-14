-- Run this once in Supabase → SQL Editor to create all tables and RLS.
-- (Or run events.sql and push_subscriptions.sql separately.)

-- ========== events ==========
create table if not exists public.events (
  id text primary key,
  name text not null,
  start timestamptz not null,
  "end" timestamptz not null,
  color text,
  notes text,
  recurrence text,
  recurrence_end timestamptz,
  reminder_minutes integer
);

alter table public.events enable row level security;

drop policy if exists "Public access" on public.events;
create policy "Public access" on public.events
  for all using (true) with check (true);

-- ========== push_subscriptions ==========
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription text not null
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Allow anon insert" on public.push_subscriptions;
drop policy if exists "Allow anon select" on public.push_subscriptions;
drop policy if exists "Allow anon delete" on public.push_subscriptions;
drop policy if exists "Allow anon all" on public.push_subscriptions;

create policy "Allow anon all"
  on public.push_subscriptions for all to anon
  using (true) with check (true);
