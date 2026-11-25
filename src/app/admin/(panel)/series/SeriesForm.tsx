import { AdminForm, CheckField, SelectField, TextField } from "@/components/admin/Form";
import { StringListEditor } from "@/components/admin/ListEditor";
import { Card } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/result";

export interface SeriesRow {
  id: string;
  slug: string;
  title: string;
  kind: string;
  medium: string;
  statement: string[];
  cover_work_id: string | null;
  visible: boolean;
}

export default function SeriesForm({
  series,
  works,
  nextKind,
  action,
}: {
  series?: SeriesRow;
  /** this series' own works, for choosing the cover */
  works: { id: string; no: string; title: string }[];
  nextKind: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  return (
    <AdminForm action={action} submitLabel={series ? "Save changes" : "Add this series"}>
      <Card title="Name">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Title" name="title" defaultValue={series?.title} required maxLength={120} placeholder="Echoes on Birch" />
          <TextField
            label="Address name"
            name="slug"
            defaultValue={series?.slug}
            required
            maxLength={80}
            placeholder="echoes-on-birch"
            hint="Part of the link to this series (/works#echoes-on-birch). Small letters, numbers and hyphens."
          />
          <TextField label="Label" name="kind" defaultValue={series?.kind ?? nextKind} maxLength={60} hint="Shown above the title, e.g. “Series 1” or “Series 4 · 2020”." />
          <TextField label="Medium" name="medium" defaultValue={series?.medium} maxLength={200} placeholder="Paper birch, ink and gum arabic" />
        </div>
      </Card>

      <Card title="Artist statement" note="Shown beside the works of this series. One box per paragraph.">
        <StringListEditor name="statement" initial={series?.statement ?? []} addLabel="Add a paragraph" rows={6} empty="No statement yet." />
      </Card>

      <Card title="On the site">
        <div className="grid gap-5 sm:grid-cols-2">
          {series ? (
            <SelectField
              label="Cover picture"
              name="cover_work_id"
              defaultValue={series.cover_work_id ?? ""}
              options={[{ value: "", label: "First work of the series" }, ...works.map((w) => ({ value: w.id, label: `${w.no} · ${w.title}` }))]}
              hint="Shown beside the series name on the home page."
            />
          ) : (
            <input type="hidden" name="cover_work_id" value="" />
          )}
          <CheckField label="Show on the site" name="visible" defaultChecked={series?.visible ?? true} hint="Untick to take the whole series, with all its works, off the site. Nothing is deleted." />
        </div>
      </Card>
    </AdminForm>
  );
}
