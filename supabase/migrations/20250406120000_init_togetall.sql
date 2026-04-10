-- Togetall: profiles, posts, comments + RLS + auth → profiles 트리거
-- 이미 profiles 등이 있어도 다시 실행 가능(idempotent).
-- Supabase SQL Editor에서 전체 실행.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- 예전에 만든 profiles에 컬럼만 없을 때 보강
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists created_at timestamptz;
alter table public.profiles alter column created_at set default now();
update public.profiles set created_at = now() where created_at is null;
alter table public.profiles alter column created_at set not null;

comment on table public.profiles is '사용자 표시 이름. auth.users 가입 시 트리거로 생성됩니다.';

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  sport text,
  region text,
  schedule_text text,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public'
      and t.relname = 'posts'
      and c.conname = 'posts_type_check'
  ) then
    alter table public.posts
      add constraint posts_type_check check (type in ('partner', 'crew', 'free'));
  end if;
end $$;

comment on table public.posts is '파트너/크루 모집 게시글';

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_select_all" on public.posts;
drop policy if exists "posts_insert_authenticated_author" on public.posts;
drop policy if exists "posts_update_own" on public.posts;
drop policy if exists "posts_delete_own" on public.posts;

create policy "posts_select_all"
  on public.posts for select
  using (true);

create policy "posts_insert_authenticated_author"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);

alter table public.comments enable row level security;

drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_insert_authenticated_author" on public.comments;
drop policy if exists "comments_update_own" on public.comments;
drop policy if exists "comments_delete_own" on public.comments;

create policy "comments_select_all"
  on public.comments for select
  using (true);

create policy "comments_insert_authenticated_author"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "comments_update_own"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- 가입 시 profiles 행 자동 생성
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '')
  )
  on conflict (id) do update
    set display_name = coalesce(
      excluded.display_name,
      public.profiles.display_name
    );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
