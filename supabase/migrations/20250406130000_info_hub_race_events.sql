-- Info hub (info_posts) + race calendar (race_events) + profiles.is_admin
-- Idempotent where possible.
-- 관리자 지정(배포 후 한 번): update public.profiles set is_admin = true where id = '<auth.users.id>';

-- ---------------------------------------------------------------------------
-- profiles.is_admin
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is '관리자만 정보 허브·대회일정 글 작성/수정 가능';

-- ---------------------------------------------------------------------------
-- info_posts
-- ---------------------------------------------------------------------------
create table if not exists public.info_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text not null,
  body text not null default '',
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
      and t.relname = 'info_posts'
      and c.conname = 'info_posts_category_check'
  ) then
    alter table public.info_posts
      add constraint info_posts_category_check check (
        category in (
          'general',
          'question',
          'training_log',
          'monthly_summary',
          'race_review',
          'race_photo',
          'ready_shot',
          'hot_deal',
          'gear_review',
          'tips',
          'injury_care',
          'race_schedule',
          'running_gear',
          'carbo_loading'
        )
      );
  end if;
end $$;

comment on table public.info_posts is '정보 허브 게시글 (런갤식 말머리). 읽기 공개, 쓰기는 관리자.';

create index if not exists info_posts_created_at_idx on public.info_posts (created_at desc);
create index if not exists info_posts_category_idx on public.info_posts (category);

alter table public.info_posts enable row level security;

drop policy if exists "info_posts_select_all" on public.info_posts;
drop policy if exists "info_posts_insert_admin" on public.info_posts;
drop policy if exists "info_posts_update_admin" on public.info_posts;
drop policy if exists "info_posts_delete_admin" on public.info_posts;

create policy "info_posts_select_all"
  on public.info_posts for select
  using (true);

create policy "info_posts_insert_admin"
  on public.info_posts for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

create policy "info_posts_update_admin"
  on public.info_posts for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

create policy "info_posts_delete_admin"
  on public.info_posts for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

-- ---------------------------------------------------------------------------
-- race_events
-- ---------------------------------------------------------------------------
create table if not exists public.race_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  race_date date not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  url text,
  created_at timestamptz not null default now()
);

comment on table public.race_events is '마라톤·대회 일정. 읽기 공개, 쓰기는 관리자.';

create index if not exists race_events_race_date_idx on public.race_events (race_date);

alter table public.race_events enable row level security;

drop policy if exists "race_events_select_all" on public.race_events;
drop policy if exists "race_events_insert_admin" on public.race_events;
drop policy if exists "race_events_update_admin" on public.race_events;
drop policy if exists "race_events_delete_admin" on public.race_events;

create policy "race_events_select_all"
  on public.race_events for select
  using (true);

create policy "race_events_insert_admin"
  on public.race_events for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

create policy "race_events_update_admin"
  on public.race_events for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );

create policy "race_events_delete_admin"
  on public.race_events for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and coalesce(p.is_admin, false) = true
    )
  );
