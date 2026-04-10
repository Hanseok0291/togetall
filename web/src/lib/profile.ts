import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserAdmin(): Promise<{
  userId: string | null;
  isAdmin: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { userId: null, isAdmin: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { userId: null, isAdmin: false };
  }

  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  return { userId: user.id, isAdmin: data?.is_admin === true };
}
