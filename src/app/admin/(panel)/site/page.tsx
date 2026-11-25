import { AdminForm, TextField } from "@/components/admin/Form";
import ListEditor, { StringListEditor } from "@/components/admin/ListEditor";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { saveIdentity } from "../../actions/site";

export const metadata = { title: "Contact & identity" };

export default async function IdentityPage() {
  const { supabase } = await requireAdmin();
  const { data: s } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (!s) return <PageTitle title="Contact & identity" note="The site settings row is missing from the database." />;

  return (
    <>
      <PageTitle title="Contact & identity" note="Your name, where you are, and how people reach you. Shown in the header, the footer and on the Contact page." />
      <AdminForm action={saveIdentity}>
        <Card title="You">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" name="name" defaultValue={s.name} required maxLength={120} />
            <TextField label="Name in Urdu" name="name_urdu" defaultValue={s.name_urdu} maxLength={120} hint="Written in calligraphy on the home page and the footer." />
            <TextField label="What you do" name="role" defaultValue={s.role} maxLength={120} placeholder="Visual artist & art educator" />
            <TextField label="Born" name="born" defaultValue={s.born} maxLength={20} placeholder="1997" />
            <TextField label="Based in" name="base" defaultValue={s.base} maxLength={120} placeholder="Lahore, Pakistan" />
            <TextField label="From" name="origin" defaultValue={s.origin} maxLength={160} placeholder="Oshikhandass valley, Gilgit-Baltistan" />
          </div>
        </Card>

        <Card title="How people reach you">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Main email" name="email" type="email" defaultValue={s.email} hint="The contact form's backup address, shown in the footer." />
            <TextField label="Second email" name="email2" type="email" defaultValue={s.email2} hint="Optional." />
            <TextField label="Phone / WhatsApp" name="phone" defaultValue={s.phone} maxLength={40} placeholder="+92 300 0000000" />
            <TextField label="Portfolio PDF link" name="portfolio_pdf" defaultValue={s.portfolio_pdf} type="url" placeholder="https://…" hint="The “Portfolio PDF” buttons open this. Leave empty to hide them." />
          </div>
        </Card>

        <Card title="Studio address" note="One line per box, in the order they should be written.">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">Studio</span>
              <StringListEditor name="studio" initial={s.studio} addLabel="Add a line" multiline={false} empty="No address yet." max={6} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">Second studio (optional)</span>
              <StringListEditor name="studio2" initial={s.studio2} addLabel="Add a line" multiline={false} empty="None." max={6} />
            </div>
          </div>
        </Card>

        <Card title="Social links" note="Shown in the footer and on the Contact page.">
          <ListEditor
            name="socials"
            initial={(s.socials ?? []) as Record<string, string>[]}
            newItem={{ label: "", handle: "", href: "" }}
            addLabel="Add a link"
            empty="No links yet."
            max={12}
            fields={[
              { key: "label", label: "Name", placeholder: "Instagram" },
              { key: "handle", label: "Handle", placeholder: "@qamarabbas_artist" },
              { key: "href", label: "Link", placeholder: "https://www.instagram.com/…", wide: true },
            ]}
          />
        </Card>
      </AdminForm>
    </>
  );
}
