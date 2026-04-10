"use server";

import { getCurrentUserAdmin } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function parseCoord(v: FormDataEntryValue | null): number | null {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

export async function createRaceEvent(
  formData: FormData,
): Promise<{ error: string } | { id: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const { isAdmin } = await getCurrentUserAdmin();
  if (!isAdmin) {
    return { error: "관리자만 대회를 등록할 수 있습니다." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const race_date = String(formData.get("race_date") ?? "").trim();
  const lat = parseCoord(formData.get("lat"));
  const lng = parseCoord(formData.get("lng"));
  const address = String(formData.get("address") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const organizer = String(formData.get("organizer") ?? "").trim() || null;
  const courses = String(formData.get("courses") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;

  if (!name) {
    return { error: "대회 이름을 입력하세요." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(race_date)) {
    return { error: "날짜 형식은 YYYY-MM-DD 입니다." };
  }
  if (lat === null || lng === null) {
    return { error: "위도·경도를 숫자로 입력하세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("race_events")
    .insert({
      name,
      race_date,
      lat,
      lng,
      address,
      url,
      organizer,
      courses,
      phone,
      region,
      source: "manual",
      external_uid: null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/races");
  return { id: data.id };
}

export async function deleteRaceEvent(id: string): Promise<{ error: string } | { ok: true }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase가 설정되지 않았습니다. .env.local을 확인하세요." };
  }

  const { isAdmin } = await getCurrentUserAdmin();
  if (!isAdmin) {
    return { error: "관리자만 삭제할 수 있습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("race_events").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/races");
  return { ok: true };
}
