import Link from "next/link";
import { ActionButton } from "@/components/admin/ConfirmButton";
import { Badge, Empty, FlashBanner, LinkBtn, PageTitle, btnLine, btnSmall } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { moveSeries } from "../../actions/series";

export const metadata = { title: "Series" };

export default async function SeriesList({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [{ data: series }, { data: works }] = await Promise.all([
    supabase.from("series").select("id,slug,title,kind,medium,visible").order("position"),
    supabase.from("works").select("series_id"),
  ]);
  const counts = new Map<string, number>();
  (works ?? []).forEach((w) => counts.set(w.series_id, (counts.get(w.series_id) ?? 0) + 1));
  const rows = series ?? [];
  const small = `${btnLine} ${btnSmall} !px-2.5`;

  return (
    <>
      <PageTitle title="Series" note="The bodies of work. Each has its own statement on the Works page. The order here is the order on the site.">
        <LinkBtn href="/admin/series/new" solid>
          + Add a series
        </LinkBtn>
      </PageTitle>
      <FlashBanner params={params} />
      {rows.length === 0 ? (
        <Empty>No series yet.</Empty>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-line-strong p-0">
          {rows.map((s, i) => (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line py-4">
              <Link href={`/admin/series/${s.id}`} className="min-w-0 flex-1 basis-[260px]">
                <span className="block font-display text-[1.3rem] tracking-[-0.015em] hover:text-seal">
                  <span className="mr-3 font-mono text-[0.78rem] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </span>
                <span className="block text-[0.88rem] text-ink-3">
                  {[s.kind, s.medium, `${counts.get(s.id) ?? 0} works`].filter(Boolean).join(" · ")}
                </span>
              </Link>
              {!s.visible ? <Badge tone="warn">Hidden</Badge> : null}
              <span className="flex items-center gap-1.5">
                <ActionButton action={moveSeries.bind(null, s.id, -1)} label={`Move ${s.title} up`} className={small} disabled={i === 0}>
                  ↑
                </ActionButton>
                <ActionButton action={moveSeries.bind(null, s.id, 1)} label={`Move ${s.title} down`} className={small} disabled={i === rows.length - 1}>
                  ↓
                </ActionButton>
                <Link href={`/admin/series/${s.id}`} className={small}>
                  Edit
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
