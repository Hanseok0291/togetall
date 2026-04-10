import { NewInfoPostForm } from "@/components/NewInfoPostForm";
import { SupabaseSetupMessage } from "@/components/SupabaseSetupMessage";
import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "정보 글쓰기",
};

export default async function NewInfoPostPage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupMessage />;
  }

  const { isAdmin } = await getCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/info");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">정보 글쓰기</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">관리자만 등록할 수 있습니다.</p>
      <div className="mt-8">
        <NewInfoPostForm />
      </div>
      <p className="mt-8">
        <Link href="/info" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← 정보 목록
        </Link>
      </p>
    </div>
  );
}
