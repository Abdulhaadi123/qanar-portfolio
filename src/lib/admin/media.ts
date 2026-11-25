import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BASE, MEDIA_BUCKET } from "@/lib/supabase/config";

/** "https://…/storage/v1/object/public/media/work/ab12/full.webp" -> "work/ab12/full.webp"; files in the repository (/works/01.webp) -> null */
export function mediaPath(url: string): string | null {
  return url.startsWith(`${MEDIA_BASE}/`) ? url.slice(MEDIA_BASE.length + 1) : null;
}

/** removes the files in the storage bucket that these addresses point to (files shipped with the site are left alone). Never throws. */
export async function removeMedia(supabase: SupabaseClient, urls: (string | null | undefined)[]) {
  const paths = [...new Set(urls.filter((u): u is string => Boolean(u)).map(mediaPath).filter((p): p is string => p !== null))];
  if (!paths.length) return;
  try {
    await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  } catch {
    /* a file left behind costs nothing; the row is what matters */
  }
}
