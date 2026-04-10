-- race_events: 공공데이터·목록 UI용 확장 (lat/lng 없는 행 허용 = 지도는 좌표 있는 것만)

alter table public.race_events alter column lat drop not null;
alter table public.race_events alter column lng drop not null;

alter table public.race_events add column if not exists organizer text;
alter table public.race_events add column if not exists courses text;
alter table public.race_events add column if not exists phone text;
alter table public.race_events add column if not exists region text;
alter table public.race_events add column if not exists registration_status text;

alter table public.race_events add column if not exists source text not null default 'manual';
alter table public.race_events add column if not exists external_uid text;

comment on column public.race_events.organizer is '주최';
comment on column public.race_events.courses is '종목(풀·하프 등 문자열)';
comment on column public.race_events.phone is '연락처';
comment on column public.race_events.region is '지역(필터용, 스크립트·수동 입력)';
comment on column public.race_events.registration_status is '접수여부 등 (선택)';
comment on column public.race_events.source is 'manual | odcloud 등 데이터 출처';
comment on column public.race_events.external_uid is '외부 동기화 시 upsert 키 (수동 행은 null)';

drop index if exists race_events_external_uid_unique;
create unique index race_events_external_uid_unique
  on public.race_events (external_uid)
  where external_uid is not null;

create index if not exists race_events_region_idx on public.race_events (region);
