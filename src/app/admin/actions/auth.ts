"use server";

import { redirect } from "next/navigation";
import { guardAction } from "@/lib/admin/auth";
import { type ActionState, done, fail } from "@/lib/admin/result";
import { fieldErrors, loginSchema, passwordSchema, text } from "@/lib/admin/schemas";
import { createClient } from "@/lib/supabase/server";

/** only ever go back to a page inside the admin panel */
function safeNext(raw: string): string {
  return raw.startsWith("/admin") && !raw.startsWith("//") && !raw.includes("\\") && !raw.includes("://") ? raw : "/admin";
}

const WRONG = "That email or password is not right.";

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: text(fd, "email"), password: String(fd.get("password") ?? "") });
  if (!parsed.success) return fail("Please enter your email and password.", fieldErrors(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // a short pause makes guessing passwords slower, and the answer never says which part was wrong
    await new Promise((r) => setTimeout(r, 700));
    if (error.status === 429) return fail("Too many attempts. Please wait a few minutes and try again.");
    return fail(WRONG);
  }

  // a correct password is not enough: the account must be listed as an admin
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    await new Promise((r) => setTimeout(r, 700));
    return fail(WRONG);
  }
  redirect(safeNext(text(fd, "next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const again = String(fd.get("again") ?? "");

  const errors: Record<string, string> = {};
  if (!current) errors.current = "Enter your current password.";
  const strong = passwordSchema.safeParse(next);
  if (!strong.success) errors.next = strong.error.issues[0]?.message ?? "Too weak.";
  if (next !== again) errors.again = "The two new passwords are not the same.";
  if (next && next === current) errors.next = "The new password must be different.";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);

  const { error } = await gate.admin.supabase.auth.updateUser({ password: next, current_password: current });
  if (error) {
    if (/current/i.test(error.message) || error.code === "current_password_mismatch") return fail("Your current password is not right.", { current: "Not right." });
    if (error.status === 429) return fail("Too many attempts. Please wait a few minutes.");
    if (/weak|password/i.test(error.message)) return fail(error.message);
    return fail("The password could not be changed. Please try again.");
  }
  return done("Your password has been changed.");
}
