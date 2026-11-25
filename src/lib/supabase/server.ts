import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL, sessionCookie } from "./config";

/**
 * A Supabase client that acts as the logged-in visitor (the admin): it reads the session from the cookies.
 * Row level security in the database decides what that session may do; this code never uses a privileged key.
 */
export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, sessionCookie(options)));
        } catch {
          // called from a Server Component, which cannot set cookies: the proxy refreshes the session instead
        }
      },
    },
  });
}

/**
 * A client with no session at all, used for everything the public site shows.
 * It reads as "anon", so it can only ever see what the public policies allow (visible works, published posts...).
 */
export function createPublicClient() {
  return createJsClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
