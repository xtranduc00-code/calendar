-- Run this in Supabase → SQL Editor to enable push notification subscriptions.
-- Table: push_subscriptions

-- Bảng lưu subscription
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription text not null
);

-- Bật RLS và cho phép anon insert/select/delete (để app + cron đọc/ghi)
alter table public.push_subscriptions enable row level security;

drop policy if exists "Allow anon insert" on public.push_subscriptions;
create policy "Allow anon insert"
  on public.push_subscriptions for insert to anon with check (true);

drop policy if exists "Allow anon select" on public.push_subscriptions;
create policy "Allow anon select"
  on public.push_subscriptions for select to anon using (true);

drop policy if exists "Allow anon delete" on public.push_subscriptions;
create policy "Allow anon delete"
  on public.push_subscriptions for delete to anon using (true);
