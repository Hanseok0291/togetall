# Togetall — 구현 결정 (확정)

프로젝트 계획(“지금 정할 것 / 다음에 할 일”)에 따라 아래를 **이 레포에서 확정**한다.

| 항목 | 결정 | 비고 |
|------|------|------|
| **백엔드** | **Supabase** (Postgres + Auth + RLS) | [ARCHITECTURE.md](./ARCHITECTURE.md) 권장안 |
| **로그인** | **이메일·비밀번호** (MVP) · 소셜(Google 등)은 이후 추가 | PRD 3.1 |
| **스타일** | **Tailwind CSS** | create-next-app 기본 포함 |
| **앱 위치** | [`web/`](../web/) | 루트는 문서·Supabase 마이그레이션 유지 |
| **첫 스프린트** | 로그인·가입 → **게시글 목록·상세·작성** → **댓글** | 파트너 MVP 1순위 ([PRD](./PRD.md) 3.2) |
| **배포** | **Vercel** (Next 앱 루트: `web`) | 저장소 연결 후 Root Directory `web`, 환경 변수는 [web/.env.example](../web/.env.example) 참고 |

## 후순위 (이번 스프린트 제외)

- 신고·차단 UI 및 관리자 검토 큐 (스키마만 준비 가능)
- Web Push / 이메일 알림
- 소셜 로그인

---

*개정: 2026-03-31*
