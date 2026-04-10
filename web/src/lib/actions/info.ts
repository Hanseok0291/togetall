"use server";

import { type InfoCategorySlug, isInfoCategorySlug } from "@/lib/info-categories";
import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function categoryFromForm(formData: FormData): InfoCategorySlug | null {
  const raw = String(formData.get("category") ?? "").trim();
  return isInfoCategorySlug(raw) ? raw : null;
}

export async function createInfoPost(
  formData: FormData,
): Promise<{ error: string } | { id: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const { userId, isAdmin } = await getCurrentUserAdmin();
  if (!userId || !isAdmin) {
    return { error: "관리자만 글을 작성할 수 있습니다." };
  }

  const category = categoryFromForm(formData);
  if (!category) {
    return { error: "말머리를 선택하세요." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) {
    return { error: "제목을 입력하세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("info_posts")
    .insert({
      author_id: userId,
      category,
      title,
      body,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/info");
  return { id: data.id };
}

export async function updateInfoPost(
  id: string,
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const { isAdmin } = await getCurrentUserAdmin();
  if (!isAdmin) {
    return { error: "관리자만 수정할 수 있습니다." };
  }

  const category = categoryFromForm(formData);
  if (!category) {
    return { error: "말머리를 선택하세요." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) {
    return { error: "제목을 입력하세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("info_posts")
    .update({ category, title, body })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/info");
  revalidatePath(`/info/${id}`);
  return { ok: true };
}

export async function deleteInfoPost(id: string): Promise<{ error: string } | { ok: true }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const { isAdmin } = await getCurrentUserAdmin();
  if (!isAdmin) {
    return { error: "관리자만 삭제할 수 있습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("info_posts").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/info");
  return { ok: true };
}
