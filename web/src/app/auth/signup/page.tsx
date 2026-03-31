import { SignupForm } from "@/components/SignupForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "가입 · Togetall",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">가입</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          이메일로 계정을 만듭니다. Supabase 대시보드에서 이메일 확인 설정을 확인하세요.
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-zinc-500">
        <Link href="/posts">목록으로 돌아가기</Link>
      </p>
    </div>
  );
}
