import { KakaoMap } from "@/components/KakaoMap";
import { NewRaceEventForm } from "@/components/NewRaceEventForm";
import { RaceEventRow } from "@/components/RaceEventRow";
import { SupabaseSetupMessage } from "@/components/SupabaseSetupMessage";
import {
  COURSE_FILTER_OPTIONS,
  DOW_FILTER_OPTIONS,
  courseFilterPattern,
  isoDatesInRangeWithWeekday,
  parseDowParam,
} from "@/lib/races-display";
import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "대회일정",
};

function monthRange(year: number, month: number): { start: string; end: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const last = new Date(year, month, 0).getDate();
  const end = `${year}-${pad(month)}-${pad(last)}`;
  return { start, end };
}

function yearRange(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

/** 월 숫자 1–12 또는 연간 보기(all). */
function resolveMonthFilter(
  raw: string | undefined,
  now: Date,
): { kind: "month"; month: number } | { kind: "all" } {
  const p = (raw ?? "").trim().toLowerCase();
  if (p === "all" || p === "0") return { kind: "all" };
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return { kind: "month", month: n };
  return { kind: "month", month: now.getMonth() + 1 };
}

const selectFields =
  "id, name, race_date, lat, lng, address, url, courses, organizer, phone, region";

/** Supabase 클라이언트에 race_events 타입이 없어 동적 select 시 추론이 깨짐 */
type RaceEventListRow = {
  id: string;
  name: string;
  race_date: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  url: string | null;
  courses: string | null;
  organizer: string | null;
  phone: string | null;
  region: string | null;
};

function sanitizeIlikeFragment(s: string): string {
  return s.replace(/[%_,]/g, " ").trim();
}

type Param = string | string[] | undefined;

function paramFirst(v: Param): string {
  if (v === undefined) return "";
  if (Array.isArray(v)) return v[0] ?? "";
  return v;
}

type Props = {
  searchParams: Promise<{
    year?: Param;
    month?: Param;
    q?: Param;
    course?: Param;
    dow?: Param;
    region?: Param;
  }>;
};

export default async function RacesPage(props: Props) {
  const searchParams = await props.searchParams;
  const now = new Date();
  const y = Math.min(2100, Math.max(2000, Number(paramFirst(searchParams.year)) || now.getFullYear()));
  const monthView = resolveMonthFilter(paramFirst(searchParams.month), now);
  const qRaw = paramFirst(searchParams.q).trim();
  const courseKey = paramFirst(searchParams.course).trim() || "all";
  const dowFilter = parseDowParam(paramFirst(searchParams.dow));
  const regionKey = paramFirst(searchParams.region).trim() || "all";

  if (!isSupabaseConfigured()) {
    return <SupabaseSetupMessage />;
  }

  const { isAdmin } = await getCurrentUserAdmin();
  const supabase = await createClient();
  const { start, end } =
    monthView.kind === "all" ? yearRange(y) : monthRange(y, monthView.month);

  const safeQ = sanitizeIlikeFragment(qRaw);
  const coursePat = courseFilterPattern(courseKey);
  const dowDates =
    dowFilter === null ? null : isoDatesInRangeWithWeekday(start, end, dowFilter);

  /** 지역 셀렉트·본문 목록이 같은 조건(기간·요일·검색·종목)을 쓰도록 맞춤 — 요일만 클라에서 거르면 지역 조합이 어긋남 */
  function applyListFilters(select: string) {
    let q = supabase
      .from("race_events")
      .select(select)
      .gte("race_date", start)
      .lte("race_date", end);
    if (dowFilter !== null) {
      if (dowDates && dowDates.length > 0) {
        q = q.in("race_date", dowDates);
      } else {
        q = q.eq("race_date", "1900-01-01");
      }
    }
    if (safeQ) {
      const p = `%${safeQ}%`;
      q = q.or(`name.ilike.${p},address.ilike.${p},organizer.ilike.${p}`);
    }
    if (coursePat) {
      q = q.ilike("courses", coursePat);
    }
    return q;
  }

  const { data: regionRows } = await applyListFilters("region").not("region", "is", null);
  type RegionAggRow = { region: string | null };
  const regionOptions = [
    ...new Set(
      ((regionRows ?? []) as unknown as RegionAggRow[])
        .map((r) => r.region)
        .filter((x): x is string => Boolean(x)),
    ),
  ].sort((a, b) => a.localeCompare(b, "ko"));

  let query = applyListFilters(selectFields)
    .order("race_date", { ascending: true })
    .order("name", { ascending: true });

  if (regionKey !== "all") {
    query = query.eq("region", regionKey);
  }

  const { data: eventsRaw, error } = await query;

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <p className="text-red-600">대회 일정을 불러오지 못했습니다. Supabase 마이그레이션(race_events 확장)을 적용했는지 확인하세요.</p>
        <p className="mt-2 text-sm text-zinc-500">{error.message}</p>
      </div>
    );
  }

  const baseList = (eventsRaw as unknown as RaceEventListRow[] | null) ?? [];
  const filtered = baseList;

  const markers = filtered
    .filter((e) => e.lat != null && e.lng != null && Number.isFinite(e.lat) && Number.isFinite(e.lng))
    .map((e) => ({
      id: e.id,
      lat: e.lat as number,
      lng: e.lng as number,
      title: e.name,
    }));

  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 2 + i);

  const fieldClass =
    "rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">대회일정</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        연·월·종목·요일·지역·검색으로 걸러 볼 수 있어요. 공공데이터 연동은 아래 동기화 스크립트 안내를 참고하세요.
      </p>

      <form className="mt-6 flex flex-col gap-3" method="get" action="/races">
        <div className="flex flex-wrap items-end gap-2 gap-y-3">
          <div>
            <label htmlFor="year" className="mb-1 block text-xs text-zinc-500">
              년도
            </label>
            <select id="year" name="year" defaultValue={String(y)} className={fieldClass}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="mb-1 block text-xs text-zinc-500">
              월
            </label>
            <select
              id="month"
              name="month"
              defaultValue={monthView.kind === "all" ? "all" : String(monthView.month)}
              className={fieldClass}
            >
              <option value="all">전체 (해당 연도)</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course" className="mb-1 block text-xs text-zinc-500">
              종목
            </label>
            <select id="course" name="course" defaultValue={courseKey} className={fieldClass}>
              {COURSE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dow" className="mb-1 block text-xs text-zinc-500">
              요일
            </label>
            <select id="dow" name="dow" defaultValue={paramFirst(searchParams.dow) || "all"} className={fieldClass}>
              {DOW_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="region" className="mb-1 block text-xs text-zinc-500">
              지역
            </label>
            <select id="region" name="region" defaultValue={regionKey} className={fieldClass}>
              <option value="all">전체</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reg" className="mb-1 block text-xs text-zinc-500">
              접수여부
            </label>
            <select id="reg" name="reg" disabled className={`${fieldClass} cursor-not-allowed opacity-60`} title="데이터에 접수 필드가 없어 추후 연동 예정">
              <option value="all">전체</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="mb-1 block text-xs text-zinc-500">
              검색 (대회명·장소·주최)
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={qRaw}
              placeholder="키워드"
              className={`w-full min-w-[8rem] ${fieldClass}`}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            검색
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
        현재 총{" "}
        <span className="font-semibold text-red-600 dark:text-red-400">{filtered.length}</span>개의 대회가
        표시됩니다
        <span className="text-zinc-500">
          {" "}
          ({y}년{monthView.kind === "all" ? " 전체" : ` ${monthView.month}월`}, 필터 적용 후)
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
        <Link href="/" className="underline hover:text-zinc-800 dark:hover:text-zinc-300">
          홈
        </Link>
        <span aria-hidden>·</span>
        <span>도움말: 필터는 GET 주소에 저장되어 공유할 수 있어요.</span>
      </div>

      <div className="mt-6">
        <KakaoMap markers={markers} />
        <p className="mt-2 text-xs text-zinc-500">위도·경도가 없는 행(공공데이터 기본 등)은 지도 마커에 포함되지 않습니다.</p>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="hidden border-b border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 md:grid md:grid-cols-[4.5rem_1fr_minmax(0,9.5rem)_minmax(0,11rem)] md:gap-5">
          <span>날짜</span>
          <span>대회명</span>
          <span>장소</span>
          <span>주최·연락처</span>
        </div>
        <ul className="px-4">
          {filtered.length === 0 && (
            <li className="py-10 text-center text-sm text-zinc-500">조건에 맞는 대회가 없습니다.</li>
          )}
          {filtered.map((e) => (
            <RaceEventRow key={e.id} event={e} isAdmin={isAdmin} />
          ))}
        </ul>
      </section>

      {isAdmin && (
        <section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">대회 등록 (관리자)</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            위도·경도는 지도 표시에 필요합니다. 공공데이터는{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">npm run sync:marathon-odcloud</code>로
            넣을 수 있어요.
          </p>
          <NewRaceEventForm />
          <p className="mt-6 text-xs text-zinc-500">
            동기화: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">web/.env.local</code>에{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">OD_CLOUD_SERVICE_KEY</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">SUPABASE_SERVICE_ROLE_KEY</code>를
            넣은 뒤 <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">cd web && npm run sync:marathon-odcloud</code>
            . roadrun 일정은{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run sync:marathon-roadrun</code>
            (기본 1~12월, <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">ROADRUN_YEAR</code>로 연도 지정)
          </p>
        </section>
      )}
    </div>
  );
}
