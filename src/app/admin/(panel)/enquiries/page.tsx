import Link from "next/link";
import { Badge, Empty, FlashBanner, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

const STATUSES = ["new", "read", "replied", "archived"] as const;
const TONE = { new: "warn", read: "mute", replied: "ok", archived: "mute" } as const;

export const metadata = { title: "Enquiries" };

export default async function EnquiriesList({ searchParams }: { searchParams: Promise<{ status?: string; deleted?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = (STATUSES as readonly string[]).includes(params.status ?? "") ? (params.status as (typeof STATUSES)[number]) : null;

  let q = supabase.from("enquiries").select("id,created_at,name,email,kind,work_ref,status,message").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const [{ data }, { data: all }] = await Promise.all([q, supabase.from("enquiries").select("status")]);
  const counts = new Map<string, number>();
  (all ?? []).forEach((r) => counts.set(r.status, (counts.get(r.status) ?? 0) + 1));
  const rows = data ?? [];

  const tab = "border-b-2 px-1 py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors";
  return (
    <>
      <PageTitle title="Enquiries" note="Messages sent from the contact form. Only you can see them." />
      <FlashBanner params={{ deleted: params.deleted, error: params.error }} />

      <nav aria-label="Filter" className="mb-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line">
        <Link href="/admin/enquiries" aria-current={!status ? "page" : undefined} className={`${tab} border-transparent aria-[current=page]:border-seal`}>
          All <sup>{all?.length ?? 0}</sup>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} aria-current={status === s ? "page" : undefined} className={`${tab} border-transparent aria-[current=page]:border-seal`}>
            {s} <sup>{counts.get(s) ?? 0}</sup>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <Empty>{status ? `No ${status} messages.` : "No messages yet. When someone uses the contact form, it appears here."}</Empty>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-line-strong p-0">
          {rows.map((m) => (
            <li key={m.id} className="border-b border-line">
              <Link href={`/admin/enquiries/${m.id}`} className="group grid gap-x-5 gap-y-1 py-4 md:grid-cols-[170px_minmax(0,1fr)_auto]">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">
                  {new Date(m.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="min-w-0">
                  <span className={`block font-display text-[1.15rem] group-hover:text-seal ${m.status === "new" ? "font-semibold" : ""}`}>
                    {m.name} <span className="text-[0.86rem] font-normal text-ink-3">{m.email}</span>
                  </span>
                  <span className="block text-[0.82rem] text-ink-3">{[m.kind, m.work_ref].filter(Boolean).join(" · ")}</span>
                  <span className="line-clamp-2 text-[0.94rem] text-ink-2">{m.message}</span>
                </span>
                <span className="md:text-right">
                  <Badge tone={TONE[m.status as keyof typeof TONE] ?? "mute"}>{m.status}</Badge>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
