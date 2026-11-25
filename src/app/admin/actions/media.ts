"use server";

import { checkAdmin } from "@/lib/admin/auth";
import { MEDIA_BASE, MEDIA_BUCKET } from "@/lib/supabase/config";

const KINDS = {
  work: ["full", "md", "thumb"],
  hero: ["image"],
  portrait: ["image"],
} as const;

export type UploadKind = keyof typeof KINDS;
export interface UploadTarget {
  name: string;
  path: string;
  token: string;
  /** the public address the file will have once uploaded */
  url: string;
}

/**
 * Hands the browser one-time upload tickets for a new photograph (one per size).
 * The browser then sends the files straight to storage: they never pass through this server, so there is no size limit problem,
 * and the ticket is valid for one exact path only.
 */
export async function createUploadTargets(kind: UploadKind): Promise<{ ok: true; targets: UploadTarget[] } | { ok: false; message: string }> {
  const c = await checkAdmin(true);
  if (!c.ok) {
    return { ok: false, message: c.reason === "unavailable" ? "The database could not be reached. Please try again in a moment." : "Your session has ended. Sign in again in another tab, then try the upload again." };
  }
  const { supabase } = c.admin;
  const names = KINDS[kind];
  if (!names) return { ok: false, message: "Unknown kind of picture." };
  const id = crypto.randomUUID();
  const targets: UploadTarget[] = [];
  for (const name of names) {
    const path = kind === "work" ? `work/${id}/${name}.webp` : `site/${kind}-${id}.webp`;
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { ok: false, message: "Could not prepare the upload. Please try again." };
    targets.push({ name, path, token: data.token, url: `${MEDIA_BASE}/${path}` });
  }
  return { ok: true, targets };
}
