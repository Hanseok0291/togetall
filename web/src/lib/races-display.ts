/** 날짜(YYYY-MM-DD) 기준 요일 — 달력 날짜만 쓰므로 UTC 기준으로 일관 처리 */
export function utcDayOfWeek(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function weekdayShortKo(isoDate: string): string {
  return WEEKDAYS_KO[utcDayOfWeek(isoDate)] ?? "";
}

/** 목록용 "M/D" */
export function monthDaySlash(isoDate: string): string {
  const [, m, d] = isoDate.split("-").map(Number);
  return `${m}/${d}`;
}

export function parseDowParam(v: string | undefined): number | null {
  if (v === undefined || v === "" || v === "all") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 6) return null;
  return n;
}

/** YYYY-MM-DD 구간 안에서 해당 요일(UTC, parseDowParam과 동일 0=일~6=토)인 날짜만 나열 — 서버 필터용 */
export function isoDatesInRangeWithWeekday(
  isoStart: string,
  isoEnd: string,
  weekday: number,
): string[] {
  const out: string[] = [];
  const [ys, ms, ds] = isoStart.split("-").map(Number);
  const [ye, me, de] = isoEnd.split("-").map(Number);
  let t = Date.UTC(ys, ms - 1, ds);
  const endT = Date.UTC(ye, me - 1, de);
  while (t <= endT) {
    if (new Date(t).getUTCDay() === weekday) {
      const d = new Date(t);
      out.push(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`,
      );
    }
    t += 86400000;
  }
  return out;
}

export const COURSE_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "풀", label: "풀" },
  { value: "하프", label: "하프" },
  { value: "10", label: "10km" },
  { value: "5", label: "5km" },
] as const;

export const DOW_FILTER_OPTIONS = [
  { value: "all", label: "요일 전체" },
  { value: "0", label: "일" },
  { value: "1", label: "월" },
  { value: "2", label: "화" },
  { value: "3", label: "수" },
  { value: "4", label: "목" },
  { value: "5", label: "금" },
  { value: "6", label: "토" },
] as const;

/** 종목 필터 값 → courses 컬럼 ilike 패턴 */
export function courseFilterPattern(value: string | undefined): string | null {
  if (!value || value === "all") return null;
  const map: Record<string, string> = {
    풀: "%풀%",
    하프: "%하프%",
    "10": "%10km%",
    "5": "%5km%",
  };
  return map[value] ?? `%${value}%`;
}
