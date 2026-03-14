-- Run this in Supabase → SQL Editor to create the events table.
-- Table: events

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
