import { EditInfoPostForm } from "@/components/EditInfoPostForm";
import { SupabaseSetupMessage } from "@/components/SupabaseSetupMessage";
import { isInfoCategorySlug, type InfoCategorySlug } from "@/lib/info-categories";
import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  if (!isSupabaseConfigured()) {
    return { title: "글 수정" };
  }
  const supabase = await createClient();
  const { data: row } = await supabase.from("info_posts").select("title").eq("id", id).maybeSingle();
  if (!row) return { title: "글 수정" };
  return { title: `${row.title} · 수정` };
}

export default async function EditInfoPostPage(props: Props) {
  const { id } = await props.params;

  if (!isSupabaseConfigured()) {
    return <SupabaseSetupMessage />;
  }

  const { isAdmin } = await getCurrentUserAdmin();
  if (!isAdmin) {
    redirect(`/info/${id}`);
  }

  const supabase = await createClient();
  const { data: post, error } = await supabase.from("info_posts").select("*").eq("id", id).maybeSingle();

  if (error || !post) {
    notFound();
  }

  if (!isInfoCategorySlug(post.category)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">정보 글 수정</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">관리자만 수정할 수 있습니다.</p>
      <div className="mt-8">
        <EditInfoPostForm
          id={id}
          defaultCategory={post.category as InfoCategorySlug}
          defaultTitle={post.title}
          defaultBody={post.body ?? ""}
        />
      </div>
      <p className="mt-8">
        <Link href={`/info/${id}`} className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← 글 보기
        </Link>
      </p>
    </div>
  );
}
