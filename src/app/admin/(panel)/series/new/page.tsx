import { LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { saveSeries } from "../../../actions/series";
import SeriesForm from "../SeriesForm";

export const metadata = { title: "Add a series" };

export default async function NewSeries() {
  const { supabase } = await requireAdmin();
  const { count } = await supabase.from("series").select("id", { count: "exact", head: true });
  return (
    <>
      <PageTitle title="Add a series">
        <LinkBtn href="/admin/series">← All series</LinkBtn>
      </PageTitle>
      <SeriesForm works={[]} nextKind={`Series ${(count ?? 0) + 1}`} action={saveSeries.bind(null, null)} />
    </>
  );
}
