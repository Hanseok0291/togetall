"use client";

import { createClient } from "@/lib/supabase/client";
import { getAuthRedirectOrigin } from "@/lib/auth-redirect";
import Link from "next/link";
import { useState } from "react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const origin = getAuthRedirectOrigin();
    const emailTrimmed = email.trim();
    const { data, error: err } = await supabase.auth.signUp({
      email: emailTrimmed,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          display_name: displayName.trim() || undefined,
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      setMessage("가입되었습니다. 잠시 후 목록으로 이동합니다.");
      window.location.assign("/posts");
      return;
    }
    setMessage(
      "가입 메일을 보냈습니다. 메일의 인증 링크를 누른 뒤 로그인하세요. 인증 전에는 로그인되지 않습니다.",
    );
  }

  async function handleResendSignupEmail() {
    setResendError(null);
    setResendMessage(null);
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setResendError("위에 가입 이메일을 입력한 뒤 다시 시도하세요.");
      return;
    }
    setResendLoading(true);
    const supabase = createClient();
    const origin = getAuthRedirectOrigin();
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: emailTrimmed,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    setResendLoading(false);
    if (err) {
      setResendError(err.message);
      return;
    }
    setResendMessage("인증 메일을 다시 보냈습니다. 스팸함도 확인해 보세요.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          닉네임
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
      {message && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleResendSignupEmail}
            disabled={resendLoading}
            className="rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {resendLoading ? "보내는 중…" : "인증 메일 다시 보내기"}
          </button>
          {resendError && <p className="text-sm text-red-600 dark:text-red-400">{resendError}</p>}
          {resendMessage && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{resendMessage}</p>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "처리 중…" : "가입"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        이미 계정이 있나요?{" "}
        <Link href="/auth/login" className="font-medium text-zinc-900 underline dark:text-zinc-100">
          로그인
        </Link>
      </p>
    </form>
  );
}
