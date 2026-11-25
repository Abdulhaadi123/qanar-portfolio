"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAction, requireAdmin } from "@/lib/admin/auth";
import { type ActionState, dbMessage, done, fail } from "@/lib/admin/result";
import { enquiryUpdateSchema, fieldErrors, text } from "@/lib/admin/schemas";

export async function saveEnquiry(id: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const { supabase } = gate.admin;
  const parsed = enquiryUpdateSchema.safeParse({ status: text(fd, "status"), admin_note: text(fd, "admin_note") });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const { error } = await supabase.from("enquiries").update(parsed.data).eq("id", id);
  if (error) return fail(dbMessage(error));
  revalidatePath("/admin", "layout");
  return done("Saved.");
}

/** one-click status change from the list */
export async function setEnquiryStatus(id: string, status: "new" | "read" | "replied" | "archived") {
  const { supabase } = await requireAdmin(true);
  if (["new", "read", "replied", "archived"].includes(status)) await supabase.from("enquiries").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries");
}

export async function deleteEnquiry(id: string) {
  const { supabase } = await requireAdmin(true);
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) redirect(`/admin/enquiries/${id}?error=delete`);
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries?deleted=1");
}
