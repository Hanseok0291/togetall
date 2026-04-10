/**
 * 확인 메일·OAuth의 `emailRedirectTo`에 쓰는 사이트 루트.
 * - `NEXT_PUBLIC_SITE_URL`이 있으면 항상 그 값(배포 도메인 고정).
 * - 없으면 **지금 주소창 origin** → localhost에서 가입하면 메일에도 localhost가 들어갑니다.
 *   로컬에서 테스트해도 배포 주소로 메일 받으려면 `.env.local`에 NEXT_PUBLIC_SITE_URL을 넣으세요.
 */
export function getAuthRedirectOrigin(): string {
  if (typeof window === "undefined") return "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  return siteUrl || window.location.origin;
}
