import { LoginForm } from "@/components/LoginForm";
import { ResendSignupEmail } from "@/components/ResendSignupEmail";
import { SupabaseSetupMessage } from "@/components/SupabaseSetupMessage";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "로그인 · Togetall",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">로그인</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Togetall에서 함께 운동할 사람을 찾아보세요.
        </p>
      </div>
      {isSupabaseConfigured() ? (
        <>
          <LoginForm />
          <ResendSignupEmail />
        </>
      ) : (
        <SupabaseSetupMessage />
      )}
      <p className="text-center text-sm text-zinc-500">
        <Link href="/posts">목록으로 돌아가기</Link>
      </p>
    </div>
  );
}
