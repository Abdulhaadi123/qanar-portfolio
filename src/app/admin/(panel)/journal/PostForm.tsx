import { AdminForm, CheckField, TextArea, TextField } from "@/components/admin/Form";
import ListEditor from "@/components/admin/ListEditor";
import { Card } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/result";
import type { PostBlock } from "@/lib/content/types";

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  published_on: string;
  dek: string;
  body: PostBlock[];
  published: boolean;
}

const toRows = (body: PostBlock[]) =>
  body.map((b) => (b.h !== undefined ? { type: "h", text: b.h } : b.quote !== undefined ? { type: "quote", text: b.quote } : { type: "p", text: b.p ?? "" }));

export default function PostForm({ post, today, action }: { post?: PostRow; today: string; action: (prev: ActionState, fd: FormData) => Promise<ActionState> }) {
  return (
    <AdminForm action={action} submitLabel={post ? "Save changes" : "Save post"}>
      <Card title="Heading">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField className="sm:col-span-2" label="Title" name="title" defaultValue={post?.title} required maxLength={200} />
          <TextField label="Category" name="category" defaultValue={post?.category} maxLength={60} placeholder="Artists" />
          <TextField label="Date" name="published_on" type="date" defaultValue={post?.published_on ?? today} required />
          <TextArea className="sm:col-span-2" label="Short introduction" name="dek" defaultValue={post?.dek} rows={3} maxLength={500} hint="Shown under the title and in the list of posts." />
          <TextField
            className="sm:col-span-2"
            label="Address name"
            name="slug"
            defaultValue={post?.slug}
            maxLength={120}
            placeholder="sadequain-calligraphy-as-painting"
            hint="Part of the link to the post. Leave it empty to make one from the title. Changing it later breaks links people already shared."
          />
        </div>
      </Card>

      <Card title="Text" note="Build the post from blocks: a paragraph, a heading, or a quotation. Blank blocks are dropped.">
        <ListEditor
          name="body"
          initial={post ? toRows(post.body) : [{ type: "p", text: "" }]}
          newItem={{ type: "p", text: "" }}
          addLabel="Add a block"
          empty="Nothing written yet."
          max={200}
          fields={[
            {
              key: "type",
              label: "Kind",
              type: "select",
              options: [
                { value: "p", label: "Paragraph" },
                { value: "h", label: "Heading" },
                { value: "quote", label: "Quotation" },
              ],
            },
            { key: "text", label: "Text", type: "textarea", rows: 5, wide: true },
          ]}
        />
      </Card>

      <Card title="Visibility">
        <CheckField label="Published" name="published" defaultChecked={post?.published ?? true} hint="Untick to keep it as a draft that visitors cannot see." />
      </Card>
    </AdminForm>
  );
}
