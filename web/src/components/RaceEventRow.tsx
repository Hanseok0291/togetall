import { DeleteRaceEventButton } from "@/components/DeleteRaceEventButton";
import { monthDaySlash, weekdayShortKo } from "@/lib/races-display";
import Link from "next/link";

export type RaceEventListItem = {
  id: string;
  name: string;
  race_date: string;
  address: string | null;
  url: string | null;
  courses: string | null;
  organizer: string | null;
  phone: string | null;
};

type Props = { event: RaceEventListItem; isAdmin: boolean };

export function RaceEventRow({ event: e, isAdmin }: Props) {
  const md = monthDaySlash(e.race_date);
  const dow = weekdayShortKo(e.race_date);

  return (
    <li className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
      <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[minmax(0,4.5rem)_1fr] sm:gap-4 md:grid-cols-[4.5rem_1fr_minmax(0,9.5rem)_minmax(0,11rem)] md:items-start md:gap-5">
        <div className="flex flex-row items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0">
          <span className="text-xs font-medium text-zinc-500 md:hidden">날짜</span>
          <div>
            <div className="text-xl font-semibold tabular-nums text-sky-600 dark:text-sky-400">{md}</div>
            <div className="text-xs text-zinc-500">({dow})</div>
          </div>
        </div>

        <div className="min-w-0">
          <span className="text-xs font-medium text-zinc-500 md:hidden">대회명</span>
          <div className="font-medium text-zinc-900 dark:text-zinc-50">{e.name}</div>
          {e.courses ? <div className="mt-1 text-sm text-red-600 dark:text-red-400">{e.courses}</div> : null}
          {e.url && (
            <p className="mt-2 md:mt-1">
              <Link href={e.url} className="text-xs text-zinc-600 underline dark:text-zinc-400" target="_blank" rel="noopener noreferrer">
                안내 링크
              </Link>
            </p>
          )}
        </div>

        <div className="min-w-0 text-sm">
          <span className="text-xs font-medium text-zinc-500 md:hidden">장소</span>
          <p className="text-zinc-700 dark:text-zinc-300">{e.address ?? "—"}</p>
        </div>

        <div className="flex min-w-0 flex-col gap-2 text-sm">
          <div>
            <span className="text-xs font-medium text-zinc-500 md:hidden">주최·연락처</span>
            <p className="text-zinc-800 dark:text-zinc-200">{e.organizer ?? "—"}</p>
            {e.phone ? (
              <p className="mt-1 tabular-nums text-zinc-600 dark:text-zinc-400">☎ {e.phone}</p>
            ) : null}
          </div>
          {isAdmin && (
            <div className="md:pt-0">
              <DeleteRaceEventButton id={e.id} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
