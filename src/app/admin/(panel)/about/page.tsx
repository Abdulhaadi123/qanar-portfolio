import { AdminForm, TextArea } from "@/components/admin/Form";
import ListEditor, { StringListEditor } from "@/components/admin/ListEditor";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { saveAbout } from "../../actions/site";

export const metadata = { title: "About & teaching" };

export default async function AboutText() {
  const { supabase } = await requireAdmin();
  const { data: s } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (!s) return <PageTitle title="About & teaching" note="The site settings row is missing from the database." />;

  return (
    <>
      <PageTitle title="About & teaching" note="The words on the About page and in the “The artist” and “Art educator” parts of the home page." />
      <AdminForm action={saveAbout}>
        <Card title="Biography">
          <div className="flex flex-col gap-5">
            <TextArea label="Opening paragraph" name="bio" defaultValue={s.bio} rows={4} maxLength={1500} hint="Shown large at the top of the About page and beside your portrait on the home page." />
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">Career</span>
              <StringListEditor name="career" initial={s.career} addLabel="Add a paragraph" rows={6} empty="No paragraphs yet." max={8} />
            </div>
          </div>
        </Card>

        <Card title="Artist statement">
          <div className="flex flex-col gap-5">
            <StringListEditor name="statement" initial={s.statement} addLabel="Add a paragraph" rows={6} empty="No statement yet." max={8} />
            <TextArea label="Closing note" name="statement_note" defaultValue={s.statement_note} rows={2} maxLength={600} hint="Optional. A last line under the statement, e.g. a residency or a teaching post." />
          </div>
        </Card>

        <Card title="Teaching">
          <div className="flex flex-col gap-5">
            <TextArea label="Introduction" name="teaching_intro" defaultValue={s.teaching_intro} rows={4} maxLength={800} />
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">Principles</span>
              <ListEditor
                name="teaching_principles"
                initial={(s.teaching_principles ?? []) as Record<string, string>[]}
                newItem={{ title: "", text: "" }}
                addLabel="Add a principle"
                empty="No principles yet."
                max={8}
                fields={[
                  { key: "title", label: "Title", placeholder: "Line first" },
                  { key: "text", label: "Text", type: "textarea", rows: 2 },
                ]}
              />
            </div>
          </div>
        </Card>
      </AdminForm>
    </>
  );
}
