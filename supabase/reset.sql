-- RESET: Xóa hết bảng rồi tạo lại. Copy cả file này vào Supabase → SQL Editor → Run.

-- ========== Xóa bảng (kèm policy) ==========
drop table if exists public.push_subscriptions cascade;
drop table if exists public.events cascade;

-- ========== Tạo lại events ==========
create table public.events (
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

create policy "Public access" on public.events
  for all using (true) with check (true);

-- ========== Tạo lại push_subscriptions ==========
create table public.push_subscriptions (
  endpoint text primary key,
  subscription text not null
);

alter table public.push_subscriptions enable row level security;

create policy "Allow anon all"
  on public.push_subscriptions for all to anon
  using (true) with check (true);
