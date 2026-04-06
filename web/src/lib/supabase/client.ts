import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseCredentials } from "@/lib/supabase/env";

export function createClient() {
  const creds = getSupabaseCredentials();
  if (!creds) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. web/.env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
    );
  }
  return createBrowserClient(creds.url, creds.anonKey);
}
