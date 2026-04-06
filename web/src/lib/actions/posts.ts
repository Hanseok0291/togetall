"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";

export type PostType = "partner" | "crew" | "free";

export async function createPost(
  formData: FormData,
): Promise<{ error: string } | { id: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? "partner") as PostType;
  const sport = String(formData.get("sport") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  const schedule_text = String(formData.get("schedule_text") ?? "").trim() || null;

  if (!title) {
    return { error: "제목을 입력하세요." };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      type,
      title,
      body,
      sport,
      region,
      schedule_text,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/posts");
  return { id: data.id };
}

export async function addComment(postId: string, formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "댓글을 입력하세요." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    body,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
  return { error: null };
}
