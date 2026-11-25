import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content/queries";

/** After the admin saves: drop the cached content at once and rebuild the public pages on their next visit. */
export function publish() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}
