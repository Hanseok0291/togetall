"use client";

import { updateInfoPost } from "@/lib/actions/info";
import { INFO_CATEGORY_SLUGS, INFO_CATEGORY_LABEL, type InfoCategorySlug } from "@/lib/info-categories";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  defaultCategory: InfoCategorySlug;
  defaultTitle: string;
  defaultBody: string;
};

export function EditInfoPostForm({ id, defaultCategory, defaultTitle, defaultBody }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateInfoPost(id, formData);
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/info/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="category" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          말머리
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultCategory}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {INFO_CATEGORY_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {INFO_CATEGORY_LABEL[slug]}
            </option>
          ))}
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
          defaultValue={defaultTitle}
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
          rows={10}
          defaultValue={defaultBody}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
