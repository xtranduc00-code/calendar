-- Run this in Supabase → SQL Editor to enable push notification subscriptions.
-- Table: push_subscriptions

-- Bảng lưu subscription
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription text not null
);

-- Bật RLS: một policy "for all" cho anon (tránh lỗi USING khi upsert/select)
alter table public.push_subscriptions enable row level security;

drop policy if exists "Allow anon insert" on public.push_subscriptions;
drop policy if exists "Allow anon select" on public.push_subscriptions;
drop policy if exists "Allow anon delete" on public.push_subscriptions;
drop policy if exists "Allow anon all" on public.push_subscriptions;

create policy "Allow anon all"
  on public.push_subscriptions for all to anon
  using (true) with check (true);
