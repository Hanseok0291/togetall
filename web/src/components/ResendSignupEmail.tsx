"use client";

import { createClient } from "@/lib/supabase/client";
import { getAuthRedirectOrigin } from "@/lib/auth-redirect";
import { useState } from "react";

type Props = Readonly<{
  defaultEmail?: string;
}>;

export function ResendSignupEmail({ defaultEmail = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("이메일을 입력하세요.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const origin = getAuthRedirectOrigin();
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("인증 메일을 다시 보냈습니다. 스팸함도 확인해 보세요.");
  }

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">가입 인증 메일을 못 받았나요?</h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        이메일 확인을 켠 경우, 아래에서 같은 주소로 인증 메일을 다시 보낼 수 있어요.
      </p>
      <form onSubmit={handleResend} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="resend-email" className="sr-only">
            이메일
          </label>
          <input
            id="resend-email"
            type="email"
            autoComplete="email"
            placeholder="가입에 쓴 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {loading ? "보내는 중…" : "인증 메일 다시 보내기"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {message && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
    </div>
  );
}
