import { AdminForm, TextArea } from "@/components/admin/Form";
import ListEditor, { StringListEditor } from "@/components/admin/ListEditor";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { saveHome } from "../../actions/site";

export const metadata = { title: "Home & footer" };

export default async function HomePageText() {
  const { supabase } = await requireAdmin();
  const { data: s } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (!s) return <PageTitle title="Home & footer" note="The site settings row is missing from the database." />;

  return (
    <>
      <PageTitle title="Home & footer" note="The words at the top of the home page, the commission section, the footer, and the line search engines show." />
      <AdminForm action={saveHome}>
        <Card title="Top of the home page">
          <div className="grid gap-4">
            <TextArea label="Line under your name" name="hero_tagline" defaultValue={s.hero_tagline} rows={2} maxLength={300} />
            <TextArea label="Text beside the first series" name="hero_blurb" defaultValue={s.hero_blurb} rows={3} maxLength={400} hint="Appears as the bark sheet turns, next to the name of the first series." />
          </div>
        </Card>

        <Card title="Facts beside your portrait" note="“Born” and “Based in” are filled in from Contact & identity. Add the others here, e.g. Education, Recognition.">
          <ListEditor
            name="highlights"
            initial={(s.highlights ?? []) as Record<string, string>[]}
            newItem={{ k: "", v: "" }}
            addLabel="Add a fact"
            empty="No extra facts."
            max={8}
            fields={[
              { key: "k", label: "Label", placeholder: "Education" },
              { key: "v", label: "Text", placeholder: "Fine Arts, painting: National College of Arts, Lahore (2020)" },
            ]}
          />
        </Card>

        <Card title="Commissions">
          <div className="grid gap-5">
            <TextArea label="Introduction" name="commission_intro" defaultValue={s.commission_intro} rows={3} maxLength={500} />
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">How a commission works</span>
              <ListEditor
                name="commission_steps"
                initial={(s.commission_steps ?? []) as Record<string, string>[]}
                newItem={{ title: "", text: "" }}
                addLabel="Add a step"
                empty="No steps yet."
                max={8}
                fields={[
                  { key: "title", label: "Step", placeholder: "Share your idea" },
                  { key: "text", label: "What happens", type: "textarea", rows: 2 },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card title="Contact form">
          <div className="flex flex-col gap-5">
            <TextArea label="Text above the form and in the footer" name="footer_blurb" defaultValue={s.footer_blurb} rows={3} maxLength={400} />
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">What people can ask for</span>
              <p className="m-0 text-[0.86rem] text-ink-3">The buttons at the top of the form. The first is chosen when someone arrives from a work (“Enquire about this work”); the second asks for a budget.</p>
              <StringListEditor name="enquiry_kinds" initial={s.enquiry_kinds} addLabel="Add an option" multiline={false} max={8} />
            </div>
          </div>
        </Card>

        <Card title="Search engines">
          <TextArea label="Description" name="seo_description" defaultValue={s.seo_description} rows={3} maxLength={320} hint="The sentence under your name in Google results and when the link is shared. About 150 characters is best." />
        </Card>
      </AdminForm>
    </>
  );
}
