# Supabase 설정 (Togetall)

## 1. SQL 마이그레이션 적용

1. [Supabase](https://supabase.com)에서 프로젝트를 만든다.
2. **SQL Editor**에서 [supabase/migrations/20260331120000_initial_schema.sql](../supabase/migrations/20260331120000_initial_schema.sql) 전체를 붙여 넣고 실행한다.
3. **Table Editor**에 `profiles`, `posts`, `comments` 등이 생겼는지 확인한다.

트리거 문법 오류가 나면(환경에 따라 `EXECUTE PROCEDURE` vs `EXECUTE FUNCTION`), Supabase Postgres 버전에 맞게 [공식 문서](https://supabase.com/docs/guides/auth/managing-user-data)의 트리거 예시로 바꾼다.

## 2. 인증 URL (로컬·배포)

**Authentication → URL Configuration**

- **Site URL**: 배포 후 `https://your-domain.vercel.app` (로컬 개발 시 `http://localhost:3000`도 테스트에 사용).
- **Redirect URLs**에 다음을 포함한다.
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.vercel.app/auth/callback`

## 3. Next.js 환경 변수

`web/.env.example`을 참고해 `web/.env.local`에 다음을 넣는다.

- `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key  

Vercel에도 동일 키를 **Environment Variables**로 등록한다 (Root Directory `web`).

## 4. 이메일 확인

이메일 가입 시 확인 메일을 끄려면 **Authentication → Providers → Email**에서 “Confirm email”을 비활성화할 수 있다 (개발용). 운영 시에는 켜 두는 것이 좋다.
