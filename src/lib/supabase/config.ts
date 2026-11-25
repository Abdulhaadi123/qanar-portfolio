/** Public Supabase settings. Both values are safe to ship to a browser (see supabase/schema.sql: every table has row level security). */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Where photos uploaded from the admin panel are served from (a public bucket, long-cached, one unique path per file). */
export const MEDIA_BASE = `${SUPABASE_URL}/storage/v1/object/public/media`;
export const MEDIA_BUCKET = "media";

/** Cookie options for the admin session: never readable from the browser's JavaScript. */
export function sessionCookie<T extends Record<string, unknown>>(options: T) {
  return { ...options, httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };
}
