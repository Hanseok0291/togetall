"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

export async function signInWithPassword(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed")) {
      return {
        error:
          "이메일 인증이 아직 완료되지 않았습니다. 가입 시 받은 메일의 링크를 누른 뒤 다시 로그인하세요. (Supabase 대시보드에서 이메일 확인을 끄면 로컬 개발 시 바로 로그인할 수 있습니다.)",
      };
    }
    if (msg.includes("invalid login credentials")) {
      return {
        error:
          "이메일 또는 비밀번호가 올바르지 않습니다. 가입 시 사용한 이메일과 동일한지, 이메일 인증을 마쳤는지 확인하세요.",
      };
    }
    return { error: error.message || "로그인에 실패했습니다." };
  }

  redirect("/posts");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/posts");
}
