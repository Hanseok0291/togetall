"use client";

import { deleteInfoPost } from "@/lib/actions/info";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteInfoPostButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("이 글을 삭제할까요?")) return;
    setLoading(true);
    const result = await deleteInfoPost(id);
    setLoading(false);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    router.push("/info");
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
    >
      {loading ? "삭제 중…" : "삭제"}
    </button>
  );
}
