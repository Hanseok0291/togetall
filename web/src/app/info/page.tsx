import { SupabaseSetupMessage } from "@/components/SupabaseSetupMessage";
import { INFO_CATEGORY_LABEL, INFO_CATEGORY_SLUGS, isInfoCategorySlug } from "@/lib/info-categories";
import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "정보 · 러닝·운동 팁",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type Props = { searchParams: Promise<{ cat?: string }> };

export default async function InfoPage(props: Props) {
  const searchParams = await props.searchParams;
  const catRaw = searchParams.cat?.trim() ?? "";
  const catFilter = isInfoCategorySlug(catRaw) ? catRaw : null;

  if (!isSupabaseConfigured()) {
    return <SupabaseSetupMessage />;
  }

  const { isAdmin } = await getCurrentUserAdmin();
  const supabase = await createClient();

  let query = supabase.from("info_posts").select("id, title, category, created_at, author_id").order("created_at", { ascending: false });
  if (catFilter) {
    query = query.eq("category", catFilter);
  }
  const { data: posts, error } = await query;

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <p className="text-red-600">목록을 불러오지 못했습니다. Supabase 마이그레이션(info_posts)을 적용했는지 확인하세요.</p>
        <p className="mt-2 text-sm text-zinc-500">{error.message}</p>
      </div>
    );
  }

  const ids = [...new Set((posts ?? []).map((p) => p.author_id))];
  const { data: profiles } =
    ids.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", ids)
      : { data: [] as { id: string; display_name: string | null }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const tabClass = (active: boolean) =>
    [
      "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
      active
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
    ].join(" ");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">정보</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            런갤 스타일 말머리로 나눈 팁·정보 글입니다. 글 등록은 관리자만 할 수 있어요.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/info/new"
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            글쓰기
          </Link>
        )}
      </div>

      <nav
        className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="말머리"
      >
        <Link href="/info" scroll={false} className={tabClass(!catFilter)}>
          전체
        </Link>
        {INFO_CATEGORY_SLUGS.map((slug) => (
          <Link key={slug} href={`/info?cat=${slug}`} scroll={false} className={tabClass(catFilter === slug)}>
            {INFO_CATEGORY_LABEL[slug]}
          </Link>
        ))}
      </nav>

      <ul className="mt-6 flex flex-col gap-4">
        {(posts ?? []).length === 0 && (
          <li className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            이 말머리에 표시할 글이 없습니다.
          </li>
        )}
        {(posts ?? []).map((post) => (
          <li key={post.id}>
            <Link
              href={`/info/${post.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                  {isInfoCategorySlug(post.category) ? INFO_CATEGORY_LABEL[post.category] : post.category}
                </span>
                <span>{nameById.get(post.author_id) ?? "익명"}</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h2 className="mt-2 font-medium text-zinc-900 dark:text-zinc-100">{post.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
