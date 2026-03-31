import { CommentForm } from "@/components/CommentForm";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("title").eq("id", id).maybeSingle();
  if (!post) return { title: "글 · Togetall" };
  return { title: `${post.title} · Togetall` };
}

export default async function PostDetailPage(props: Props) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: post, error: postError } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();

  if (postError || !post) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const authorIds = [post.author_id, ...(comments ?? []).map((c) => c.author_id)];
  const uniqueIds = [...new Set(authorIds)];
  const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", uniqueIds);
  const nameById = new Map((profs ?? []).map((p) => [p.id, p.display_name]));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
          {typeLabel[post.type] ?? post.type}
        </span>
        <span>{nameById.get(post.author_id) ?? "익명"}</span>
        <span>{formatDate(post.created_at)}</span>
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{post.title}</h1>
      <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        {[post.sport && `종목: ${post.sport}`, post.region && `지역: ${post.region}`, post.schedule_text && `일정: ${post.schedule_text}`]
          .filter(Boolean)
          .map((line) => (
            <p key={String(line)}>{line}</p>
          ))}
      </div>
      <div className="prose prose-zinc mt-6 max-w-none whitespace-pre-wrap dark:prose-invert">
        {post.body || <span className="text-zinc-400">본문 없음</span>}
      </div>

      <section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">댓글 {(comments ?? []).length}</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {(comments ?? []).map((c) => (
            <li key={c.id} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">
                {nameById.get(c.author_id) ?? "익명"} · {formatDate(c.created_at)}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{c.body}</p>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="mt-6">
            <CommentForm postId={id} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            댓글을 남기려면{" "}
            <Link href="/auth/login" className="font-medium text-zinc-900 underline dark:text-zinc-100">
              로그인
            </Link>
            하세요.
          </p>
        )}
      </section>

      <p className="mt-8">
        <Link href="/posts" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← 목록
        </Link>
      </p>
    </article>
  );
}
