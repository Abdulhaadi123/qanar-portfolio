import { getAdmin } from "@/lib/admin/auth";

/** A backup of everything in the database as one JSON file. Only the admin may download it. */
export async function GET() {
  const admin = await getAdmin(true);
  if (!admin) return new Response("Not allowed", { status: 401, headers: { "Cache-Control": "no-store" } });
  const { supabase } = admin;
  const tables = ["site_settings", "series", "works", "journal_posts", "record_entries", "enquiries"] as const;
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString() };
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*");
    if (error) return new Response(`Could not read ${t}`, { status: 500, headers: { "Cache-Control": "no-store" } });
    out[t] = data;
  }
  const day = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(out, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="qamar-portfolio-backup-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
