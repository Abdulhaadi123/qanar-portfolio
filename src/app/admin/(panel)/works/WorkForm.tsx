import { CheckField, SelectField, TextField, AdminForm } from "@/components/admin/Form";
import ImageUpload from "@/components/admin/ImageUpload";
import { Card } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/result";

export interface WorkRow {
  id: string;
  no: string;
  title: string;
  series_id: string;
  size_text: string;
  h_cm: number | string | null;
  w_cm: number | string | null;
  medium: string;
  note: string;
  year: number | null;
  price: string;
  availability: string;
  ratio: number | string;
  photo: string;
  photo_md: string;
  photo_thumb: string;
  blur: string;
  visible: boolean;
  featured_pos: number | null;
}

/** the form for adding or changing one work (used by "new" and by "edit") */
export default function WorkForm({
  work,
  series,
  defaultSeries,
  nextNo,
  action,
}: {
  work?: WorkRow;
  series: { id: string; title: string }[];
  /** the series chosen at first when adding a new work */
  defaultSeries?: string;
  nextNo: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  return (
    <AdminForm action={action} submitLabel={work ? "Save changes" : "Add this work"}>
      <Card title="Photograph" note="Use the best photograph you have. It is shrunk in your browser to a fast-loading size.">
        <ImageUpload
          kind="work"
          label="Photograph of the work"
          required
          previewUrl={work?.photo_thumb ?? ""}
          initial={{
            photo: work?.photo ?? "",
            photo_md: work?.photo_md ?? "",
            photo_thumb: work?.photo_thumb ?? "",
            blur: work?.blur ?? "",
            ratio: work ? String(work.ratio) : "",
          }}
          hint="JPG, PNG or WebP. The whole picture is kept; nothing is cut."
        />
      </Card>

      <Card title="About the work">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Number" name="no" defaultValue={work?.no ?? nextNo} required maxLength={12} hint="Shown as “No. 06”. Must be different for every work." />
          <TextField label="Title" name="title" defaultValue={work?.title ?? "Untitled"} required maxLength={160} />
          <SelectField label="Series" name="series_id" defaultValue={work?.series_id ?? defaultSeries ?? series[0]?.id ?? ""} options={series.map((s) => ({ value: s.id, label: s.title }))} />
          <TextField label="Year" name="year" defaultValue={work?.year ?? ""} inputMode="numeric" maxLength={4} placeholder="2025" hint="Optional." />
          <TextField className="sm:col-span-2" label="Medium" name="medium" defaultValue={work?.medium ?? ""} maxLength={200} placeholder="Paper birch and archival ink marker" />
          <TextField className="sm:col-span-2" label="Note" name="note" defaultValue={work?.note ?? ""} maxLength={200} placeholder="Framed" hint="Optional. A short line shown with the work." />
        </div>
      </Card>

      <Card title="Size" note="Fill height and width to put the work on the “true size” wall. Leave both empty for installations, sets and variable works.">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="As written" name="size_text" defaultValue={work?.size_text ?? ""} maxLength={60} placeholder="29.5 × 21.5 in" />
          <TextField label="Height (cm)" name="h_cm" defaultValue={work?.h_cm ?? ""} inputMode="decimal" placeholder="74.9" />
          <TextField label="Width (cm)" name="w_cm" defaultValue={work?.w_cm ?? ""} inputMode="decimal" placeholder="54.6" />
        </div>
      </Card>

      <Card title="Sale and visibility">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Availability"
            name="availability"
            defaultValue={work?.availability ?? "available"}
            options={[
              { value: "available", label: "Available" },
              { value: "sold", label: "Sold" },
              { value: "not_available", label: "Not available" },
            ]}
          />
          <TextField label="Price" name="price" defaultValue={work?.price ?? ""} maxLength={60} placeholder="PKR 150,000" hint="Leave empty to show “On request”." />
          <CheckField label="Show on the site" name="visible" defaultChecked={work?.visible ?? true} hint="Untick to hide it without deleting it." />
          <CheckField label="Show on the home page" name="featured" defaultChecked={work ? work.featured_pos !== null : false} hint="Puts it on the turning 3D wall on the home page." />
        </div>
      </Card>
    </AdminForm>
  );
}
