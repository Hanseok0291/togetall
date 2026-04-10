"use client";

import { deleteRaceEvent } from "@/lib/actions/races";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRaceEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("이 대회 일정을 삭제할까요?")) return;
    setLoading(true);
    const result = await deleteRaceEvent(id);
    setLoading(false);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="shrink-0 text-xs text-red-600 underline dark:text-red-400"
    >
      {loading ? "…" : "삭제"}
    </button>
  );
}
