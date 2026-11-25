import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, FlashBanner, LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteWork, saveWork } from "../../../actions/works";
import WorkForm, { type WorkRow } from "../WorkForm";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Edit work" };

export default async function EditWork({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: work }, { data: series }] = await Promise.all([
    supabase.from("works").select("*").eq("id", id).maybeSingle(),
    supabase.from("series").select("id,title,slug").order("position"),
  ]);
  if (!work) notFound();
  const mine = (series ?? []).find((s) => s.id === (work as WorkRow).series_id);
  const w = work as WorkRow;

  return (
    <>
      <PageTitle title={`${w.no} · ${w.title}`}>
        <LinkBtn href="/admin/works">← All works</LinkBtn>
        {mine && w.visible ? <LinkBtn href={`/works#${mine.slug}`}>See it on the site ↗</LinkBtn> : null}
      </PageTitle>
      <FlashBanner params={await searchParams} />
      <WorkForm work={w} series={series ?? []} nextNo={w.no} action={saveWork.bind(null, id)} />
      <Card title="Delete this work" className="mt-8" note="This removes the work and its photographs for good. If you only want it off the site, untick “Show on the site” instead.">
        <ConfirmButton action={deleteWork.bind(null, id)} label="Delete this work…" confirmLabel="Yes, delete it for good" question={`Delete “${w.title}” (no. ${w.no})?`} />
      </Card>
    </>
  );
}
