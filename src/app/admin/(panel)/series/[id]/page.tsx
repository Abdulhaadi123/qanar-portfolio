import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, FlashBanner, LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteSeries, saveSeries } from "../../../actions/series";
import SeriesForm, { type SeriesRow } from "../SeriesForm";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Edit series" };

export default async function EditSeries({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: series }, { data: works }] = await Promise.all([
    supabase.from("series").select("*").eq("id", id).maybeSingle(),
    supabase.from("works").select("id,no,title").eq("series_id", id).order("position"),
  ]);
  if (!series) notFound();
  const s = series as SeriesRow;

  return (
    <>
      <PageTitle title={s.title}>
        <LinkBtn href="/admin/series">← All series</LinkBtn>
        {s.visible ? <LinkBtn href={`/works#${s.slug}`}>See it on the site ↗</LinkBtn> : null}
      </PageTitle>
      <FlashBanner params={await searchParams} />
      <SeriesForm series={s} works={works ?? []} nextKind="" action={saveSeries.bind(null, id)} />
      <Card title="Delete this series" className="mt-8" note="Only possible when the series has no works. Move or delete its works first.">
        <ConfirmButton action={deleteSeries.bind(null, id)} label="Delete this series…" confirmLabel="Yes, delete it" question={`Delete the series “${s.title}”?`} />
      </Card>
    </>
  );
}
