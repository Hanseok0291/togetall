import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "파트너·모집 · Togetall",
};

const typeLabel: Record<string, string> = {
  partner: "파트너",
  crew: "크루 모집",
  free: "자유",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function PostsPage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, created_at, type, sport, region, author_id")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">목록을 불러오지 못했습니다. 환경 변수와 Supabase 마이그레이션을 확인하세요.</p>
        <p className="mt-2 text-sm text-zinc-500">{error.message}</p>
      </div>
    );
  }

  const ids = [...new Set((posts ?? []).map((p) => p.author_id))];
  const { data: profiles } =
    ids.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", ids)
      : { data: [] as { id: string; display_name: string }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">파트너 · 모집</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">최신순으로 표시됩니다.</p>
      <ul className="mt-8 flex flex-col gap-4">
        {(posts ?? []).length === 0 && (
          <li className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            아직 글이 없습니다. 로그인 후 글을 올려보세요.
          </li>
        )}
        {(posts ?? []).map((post) => (
          <li key={post.id}>
            <Link
              href={`/posts/${post.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                  {typeLabel[post.type] ?? post.type}
                </span>
                <span>{nameById.get(post.author_id) ?? "익명"}</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h2 className="mt-2 font-medium text-zinc-900 dark:text-zinc-100">{post.title}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {[post.sport, post.region].filter(Boolean).join(" · ") || "—"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
