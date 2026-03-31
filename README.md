# Togetall

**Together**의 말장난인 서비스 이름으로, 운동 파트너·러닝 크루 모집·운동 커뮤니티를 한곳에서 다루는 **웹 서비스**를 목표로 한다. (모바일 브라우저 우선 반응형.)

## 구현 결정

확정된 스택·범위는 [docs/DECISIONS.md](docs/DECISIONS.md)를 본다. (Supabase, Next 앱은 `web/`, Tailwind, 이메일 로그인 MVP.)

## PRD 요약

| 항목 | 내용 |
|------|------|
| **핵심 가치** | 함께 운동할 사람과 크루를 찾고, 운동 이야기를 나눈다. |
| **MVP 1순위** | **파트너 탐색·연결** (모집 글, 검색·필터, 상세, 댓글/관심, 신고·차단). |
| **크루·커뮤니티** | MVP에서는 **단순 형태** — 모집은 카테고리/유형으로 구분, 커뮤니티는 피드·댓글 중심. |
| **하지 않을 것 (MVP)** | 유료 결제, 복잡한 추천 알고리즘, 실시간 위치 공유, 크루 전용 채팅방. |
| **스택** | **Next.js** ([`web/`](web/)) + **Vercel** + **Supabase** — [ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## 문서

| 문서 | 설명 |
|------|------|
| [docs/DECISIONS.md](docs/DECISIONS.md) | 백엔드·로그인·스타일·스프린트 범위 확정 |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Supabase SQL·Redirect URL·환경 변수 |
| [docs/VISION.md](docs/VISION.md) | 1페이지 비전, 페르소나, MVP 범위 |
| [docs/PRD.md](docs/PRD.md) | 제품 요구사항 전문 |
| [docs/wireframes.md](docs/wireframes.md) | 화면 와이어·사용자 플로우 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 기술 스택·아키텍처 초안 |

## 로컬 개발

1. Supabase 프로젝트 생성 후 SQL 에디터에서 [supabase/migrations](supabase/migrations) 순서대로 적용하거나 `supabase db push`(CLI 사용 시).
2. [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)대로 SQL 적용 및 Redirect URL 설정 후, `cp web/.env.example web/.env.local`에 Supabase URL·anon key 입력.
3. `cd web && npm install && npm run dev`

## Vercel 배포

1. GitHub 등에 푸시 후 Vercel에서 저장소 Import.
2. **Root Directory**를 `web`으로 설정.
3. Environment Variables에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가.

---

앱 소스는 [`web/`](web/) 디렉터리에 있다.
