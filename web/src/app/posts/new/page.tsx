import { NewPostForm } from "@/components/NewPostForm";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "글쓰기 · Togetall",
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">새 글</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">파트너 모집 또는 크루 모집 글을 작성합니다.</p>
      <div className="mt-8">
        <NewPostForm />
      </div>
    </div>
  );
}
