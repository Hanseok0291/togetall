# Supabase 데이터베이스 (Togetall)

앱은 `profiles`, `posts`, `comments` 테이블을 사용합니다. 스키마는 `migrations/`에 있습니다.

## 적용 방법

1. [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택  
2. 왼쪽 **SQL Editor** → **New query**  
3. [`migrations/20250406120000_init_togetall.sql`](./migrations/20250406120000_init_togetall.sql) 파일 내용을 **전부 복사**해 붙여넣기  
4. **Run** 실행  

성공하면 테이블·RLS·트리거가 생성됩니다.

## 이미 `profiles` 테이블이 있는 경우

마이그레이션은 **여러 번 실행해도 되도록** 바뀌었습니다. `CREATE TABLE IF NOT EXISTS`, 정책은 `DROP IF EXISTS` 후 재생성, `display_name` / `created_at` 컬럼은 없으면 추가합니다.

그래도 오류가 나면: **Table Editor**에서 `posts` / `comments`가 이미 있는지, `posts`에 `type` 제약과 맞지 않는 데이터가 있는지 확인하세요. (`partner` / `crew` / `free`만 허용)

## Supabase CLI 사용 시

```bash
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

(로컬에 Supabase CLI가 설치되어 있고 프로젝트가 연결된 경우)

## 가입 시 프로필

`auth.users`에 사용자가 생기면 트리거가 `profiles`에 한 줄을 넣습니다. 회원가입 시 `display_name`을 넣으면 `raw_user_meta_data`로 저장되며, 트리거에서 `profiles.display_name`으로 복사됩니다 (값이 비어 있으면 NULL).

## 마이그레이션 전에 이미 가입한 사용자가 있다면

스키마 적용 후 `profiles`가 비어 있는 기존 계정이 있으면, SQL Editor에서 한 번 실행할 수 있습니다.

```sql
insert into public.profiles (id, display_name)
select u.id, nullif(trim(coalesce(u.raw_user_meta_data->>'display_name', '')), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
```
