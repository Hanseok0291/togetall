"use client";

import { addComment } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { postId: string };

export function CommentForm({ postId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addComment(postId, formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="comment-body" className="text-sm text-zinc-600 dark:text-zinc-400">
        댓글
      </label>
      <textarea
        id="comment-body"
        name="body"
        required
        rows={3}
        placeholder="댓글을 입력하세요"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {loading ? "등록 중…" : "댓글 달기"}
      </button>
    </form>
  );
}
