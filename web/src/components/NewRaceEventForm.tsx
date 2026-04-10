"use client";

import { createRaceEvent } from "@/lib/actions/races";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewRaceEventForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createRaceEvent(formData);
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="race-name" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          대회명
        </label>
        <input
          id="race-name"
          name="name"
          required
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="race_date" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          대회일 (YYYY-MM-DD)
        </label>
        <input
          id="race_date"
          name="race_date"
          type="date"
          required
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="lat" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            위도
          </label>
          <input
            id="lat"
            name="lat"
            inputMode="decimal"
            placeholder="37.5"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="lng" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            경도
          </label>
          <input
            id="lng"
            name="lng"
            inputMode="decimal"
            placeholder="127.0"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="address" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          주소·장소 (선택)
        </label>
        <input
          id="address"
          name="address"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="organizer" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          주최 (선택)
        </label>
        <input
          id="organizer"
          name="organizer"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="courses" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          종목 (선택)
        </label>
        <input
          id="courses"
          name="courses"
          placeholder="예: 풀, 하프, 10km"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          연락처 (선택)
        </label>
        <input
          id="phone"
          name="phone"
          inputMode="tel"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="region" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          지역 (선택)
        </label>
        <input
          id="region"
          name="region"
          placeholder="예: 경기"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="url" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          신청·안내 URL (선택)
        </label>
        <input
          id="url"
          name="url"
          type="url"
          placeholder="https://"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "등록 중…" : "대회 등록"}
        </button>
      </div>
    </form>
  );
}
