import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

/**
 * Called once a day by Vercel Cron (vercel.json). A free Supabase project is paused after a week without any request;
 * this small read keeps it awake. When CRON_SECRET is set (Vercel sends it as a Bearer token) other callers are refused.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!hasSupabase) return NextResponse.json({ ok: false, reason: "not configured" }, { status: 503 });
  const { error } = await createPublicClient().from("site_settings").select("id").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
