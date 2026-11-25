import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { redirect, unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type ActionState, fail } from "./result";

/**
 * The one place that decides "is this request from the admin?". Called by every admin page, server action and route handler.
 * 1. the session is checked: pages verify the token's signature locally (fast); anything that CHANGES data asks Supabase Auth
 *    to confirm the session (`strong`), so a revoked session stops working at once
 * 2. is_admin() asks the database whether that user is listed in the admins table
 * Even if this check were forgotten somewhere, the database's row level security would still refuse the change.
 *
 * A network hiccup is NOT treated as "signed out": that would throw the admin to the login page in the middle of a save.
 */
export type Admin = { supabase: SupabaseClient; user: { id: string; email: string } };
export type AdminCheck = { ok: true; admin: Admin } | { ok: false; reason: "signed-out" | "not-admin" | "unavailable" };

const isNetwork = (e: { name?: string; message?: string; status?: number } | null | undefined) =>
  Boolean(e) &&
  (e!.name === "AuthRetryableFetchError" || e!.status === 0 || (e!.status ?? 0) >= 500 || /fetch failed|network|timed? ?out|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(e!.message ?? ""));

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function run(strong: boolean): Promise<AdminCheck> {
  const supabase = await createClient();
  let id = "";
  let email = "";
  if (strong) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { ok: false, reason: isNetwork(error) ? "unavailable" : "signed-out" };
    id = data.user.id;
    email = data.user.email ?? "";
  } else {
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return { ok: false, reason: isNetwork(error) ? "unavailable" : "signed-out" };
    id = String(data.claims.sub ?? "");
    email = String((data.claims as { email?: string }).email ?? "");
  }
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) {
    // an expired or invalid token is a signed-out visitor; anything else is the database being out of reach
    return { ok: false, reason: error.code && /^PGRST3/.test(error.code) ? "signed-out" : isNetwork(error) ? "unavailable" : "not-admin" };
  }
  if (isAdmin !== true) return { ok: false, reason: "not-admin" };
  return { ok: true, admin: { supabase, user: { id, email } } };
}

/** one retry after a short pause when the network failed, then the answer */
export const checkAdmin = cache(async (strong: boolean): Promise<AdminCheck> => {
  let result: AdminCheck;
  try {
    result = await run(strong);
    if (!result.ok && result.reason === "unavailable") {
      await pause(500);
      result = await run(strong);
    }
  } catch (error) {
    // Next.js uses thrown signals for its own business (this route reads cookies, so it is dynamic; a redirect; not found): never swallow those
    unstable_rethrow(error);
    result = { ok: false, reason: "unavailable" };
  }
  return result;
});

/** the admin, or null (login page, export): `strong` for anything that changes or downloads data */
export async function getAdmin(strong = false): Promise<Admin | null> {
  const c = await checkAdmin(strong);
  return c.ok ? c.admin : null;
}

/**
 * For pages and for buttons that act and redirect: the admin, or a redirect to the login page.
 * If the database simply cannot be reached it raises an error instead, so the page shows "Try again" and nobody is signed out for nothing.
 */
export async function requireAdmin(strong = false): Promise<Admin> {
  const c = await checkAdmin(strong);
  if (c.ok) return c.admin;
  if (c.reason === "unavailable") throw new Error("The admin panel could not reach the database. Please try again.");
  redirect("/admin/login");
}

/** For form actions: the admin, or a message for the form (the typed text stays on the screen, nothing is lost). */
export async function guardAction(): Promise<{ ok: true; admin: Admin } | { ok: false; state: ActionState }> {
  const c = await checkAdmin(true);
  if (c.ok) return { ok: true, admin: c.admin };
  if (c.reason === "unavailable") return { ok: false, state: fail("The database could not be reached just now. Your changes are still here: press Save again in a moment.") };
  return { ok: false, state: fail("Your session has ended. Sign in again in another tab, then press Save once more: nothing you typed is lost.") };
}
