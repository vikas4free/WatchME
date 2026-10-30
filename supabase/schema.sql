-- WatchME per-user library
-- Run this in Supabase Dashboard > SQL Editor > New query.

create table if not exists public.user_library (
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  item_data jsonb not null default '{}'::jsonb,
  is_watchlisted boolean not null default true,
  is_favorite boolean not null default false,
  progress_seconds double precision,
  progress_duration double precision,
  progress_updated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, tmdb_id, media_type)
);

alter table public.user_library enable row level security;

drop policy if exists "Users can view their own library" on public.user_library;
create policy "Users can view their own library"
  on public.user_library for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to their own library" on public.user_library;
create policy "Users can add to their own library"
  on public.user_library for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own library" on public.user_library;
create policy "Users can update their own library"
  on public.user_library for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete from their own library" on public.user_library;
create policy "Users can delete from their own library"
  on public.user_library for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists user_library_user_watchlist_idx
  on public.user_library (user_id, is_watchlisted);
