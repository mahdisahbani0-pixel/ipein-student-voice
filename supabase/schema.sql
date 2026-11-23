-- IPEIN Student Voice database
-- 1) Replace mahdisahbani0@gmail.com with the email address you will use to log in.
-- 2) Run this entire script in Supabase -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('academic','campus','events','sports','administration','other')),
  message text not null check (char_length(message) between 5 and 3000),
  is_anonymous boolean not null default true,
  student_name text,
  student_class text,
  status text not null default 'new' check (status in ('new','reviewing','considered','done')),
  admin_note text
);

alter table public.suggestions enable row level security;

-- Anyone can submit a suggestion. Public visitors cannot read suggestions.
drop policy if exists "Anyone can submit suggestions" on public.suggestions;
create policy "Anyone can submit suggestions"
on public.suggestions for insert
to anon, authenticated
with check (
  char_length(message) between 5 and 3000
  and category in ('academic','campus','events','sports','administration','other')
  and (
    (is_anonymous = true and student_name is null and student_class is null)
    or
    (is_anonymous = false and student_name is not null and char_length(trim(student_name)) > 0)
  )
);

-- Only the delegate account can view, update or delete submissions.
drop policy if exists "Delegate can read suggestions" on public.suggestions;
create policy "Delegate can read suggestions"
on public.suggestions for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('mahdisahbani0@gmail.com'));

drop policy if exists "Delegate can update suggestions" on public.suggestions;
create policy "Delegate can update suggestions"
on public.suggestions for update
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('mahdisahbani0@gmail.com'))
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('mahdisahbani0@gmail.com'));

drop policy if exists "Delegate can delete suggestions" on public.suggestions;
create policy "Delegate can delete suggestions"
on public.suggestions for delete
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('mahdisahbani0@gmail.com'));

create index if not exists suggestions_created_at_idx on public.suggestions (created_at desc);
create index if not exists suggestions_status_idx on public.suggestions (status);
