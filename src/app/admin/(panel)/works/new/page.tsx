import { LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { saveWork } from "../../../actions/works";
import WorkForm from "../WorkForm";

export const metadata = { title: "Add a work" };

export default async function NewWork({ searchParams }: { searchParams: Promise<{ series?: string }> }) {
  const { supabase } = await requireAdmin();
  const { series: wanted } = await searchParams;
  const [{ data: series }, { data: nos }] = await Promise.all([supabase.from("series").select("id,title").order("position"), supabase.from("works").select("no")]);
  const top = (nos ?? []).reduce((m, r) => Math.max(m, parseInt(String(r.no), 10) || 0), 0);
  const list = series ?? [];
  // "+ Add to this series" on the works list opens this page with that series chosen
  const first = list.find((s) => s.id === wanted)?.id ?? list[0]?.id;
  return (
    <>
      <PageTitle title="Add a work">
        <LinkBtn href="/admin/works">← All works</LinkBtn>
      </PageTitle>
      <WorkForm series={list} defaultSeries={first} nextNo={String(top + 1).padStart(2, "0")} action={saveWork.bind(null, null)} />
    </>
  );
}
