"use client";

import { createPost } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPostForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createPost(formData);
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/posts/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="type" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          유형
        </label>
        <select
          id="type"
          name="type"
          defaultValue="partner"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="partner">파트너</option>
          <option value="crew">크루 모집</option>
          <option value="free">자유</option>
        </select>
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          제목
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="body" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          본문
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sport" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            종목
          </label>
          <input
            id="sport"
            name="sport"
            placeholder="예: 러닝"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="region" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            지역 (시·구)
          </label>
          <input
            id="region"
            name="region"
            placeholder="예: 강남구"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>
      <div>
        <label htmlFor="schedule_text" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          일정 / 시간대
        </label>
        <input
          id="schedule_text"
          name="schedule_text"
          placeholder="예: 평일 저녁 7시"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "등록 중…" : "등록"}
      </button>
    </form>
  );
}
