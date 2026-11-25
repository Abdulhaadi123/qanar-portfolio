import { AdminForm } from "@/components/admin/Form";
import ListEditor from "@/components/admin/ListEditor";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { saveRecord } from "../../actions/site";

export const metadata = { title: "Exhibitions & record" };

export default async function RecordPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("record_entries").select("id,year,what,place,exhibition").order("position").order("id");
  const rows = (data ?? []).map((r) => ({ id: r.id as string, year: r.year as string, what: r.what as string, place: r.place as string, exhibition: Boolean(r.exhibition) }));

  return (
    <>
      <PageTitle title="Exhibitions & record" note="Dated milestones, shown as a table on the home page and the About page. The order here is the order on the site." />
      <AdminForm action={saveRecord}>
        <Card
          title="Entries"
          note="Tick “Counts as an exhibition or award” for shows and prizes: they are counted in the “Exhibitions & awards” number on the home page, and the earliest one becomes “First exhibition”."
        >
          <ListEditor
            // after a save the rows have new ids: start the editor again from them, so the next save updates rows instead of re-adding them
            key={rows.map((r) => r.id).join("|")}
            name="record"
            errorPrefix=""
            initial={rows}
            newItem={{ year: "", what: "", place: "", exhibition: false }}
            addLabel="Add an entry"
            empty="No entries yet."
            max={80}
            fields={[
              { key: "year", label: "Year", placeholder: "2025" },
              { key: "place", label: "Where", placeholder: "Alhamra Art Council, Lahore" },
              { key: "what", label: "What", placeholder: "Group exhibition", wide: true },
              { key: "exhibition", label: "Counts as an exhibition or award", type: "checkbox" },
            ]}
          />
        </Card>
      </AdminForm>
    </>
  );
}
