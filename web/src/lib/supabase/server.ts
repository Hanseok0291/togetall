import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseCredentials } from "@/lib/supabase/env";

export async function createClient() {
  const creds = getSupabaseCredentials();
  if (!creds) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. web/.env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    creds.url,
    creds.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; ignore if middleware already set cookies.
          }
        },
      },
    },
  );
}
