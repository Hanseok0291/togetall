import { DeleteInfoPostButton } from "@/components/DeleteInfoPostButton";
import { SupabaseSetupMessage } from "@/components/SupabaseSetupMessage";
import { INFO_CATEGORY_LABEL } from "@/lib/info-categories";
import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  if (!isSupabaseConfigured()) {
    return { title: "정보 글" };
  }
  const supabase = await createClient();
  const { data: row } = await supabase.from("info_posts").select("title").eq("id", id).maybeSingle();
  if (!row) return { title: "정보 글" };
  return { title: row.title };
}

export default async function InfoPostDetailPage(props: Props) {
  const { id } = await props.params;

  if (!isSupabaseConfigured()) {
    return <SupabaseSetupMessage />;
  }

  const supabase = await createClient();
  const { data: post, error } = await supabase.from("info_posts").select("*").eq("id", id).maybeSingle();

  if (error || !post) {
    notFound();
  }

  const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", post.author_id).maybeSingle();
  const { isAdmin } = await getCurrentUserAdmin();

  const catLabel =
    INFO_CATEGORY_LABEL[post.category as keyof typeof INFO_CATEGORY_LABEL] ?? post.category;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{catLabel}</span>
        <span>{prof?.display_name ?? "익명"}</span>
        <span>{formatDate(post.created_at)}</span>
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{post.title}</h1>
      <div className="prose prose-zinc mt-6 max-w-none whitespace-pre-wrap dark:prose-invert">
        {post.body || <span className="text-zinc-400">본문 없음</span>}
      </div>

      {isAdmin && (
        <div className="mt-10 flex flex-wrap gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link
            href={`/info/${id}/edit`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            수정
          </Link>
          <DeleteInfoPostButton id={id} />
        </div>
      )}

      <p className="mt-8">
        <Link href="/info" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← 정보 목록
        </Link>
      </p>
    </article>
  );
}
