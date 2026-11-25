import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { AdminForm, SelectField, TextArea } from "@/components/admin/Form";
import { Badge, Card, FlashBanner, LinkBtn, PageTitle, btnSolid } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteEnquiry, saveEnquiry } from "../../../actions/enquiries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Message" };

export default async function EnquiryDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: m } = await supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!m) notFound();

  const subject = encodeURIComponent(`Re: ${m.kind || "your message"}`);
  const quoted = encodeURIComponent(`\n\n--\nOn ${new Date(m.created_at).toLocaleDateString("en-GB")} you wrote:\n${m.message}`);
  const row = "grid gap-x-5 gap-y-1 border-b border-line py-3 sm:grid-cols-[150px_minmax(0,1fr)]";
  const dt = "font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3";

  return (
    <>
      <PageTitle title={m.name}>
        <LinkBtn href="/admin/enquiries">← All messages</LinkBtn>
        <a href={`mailto:${m.email}?subject=${subject}&body=${quoted}`} className={btnSolid}>
          Reply by email
        </a>
      </PageTitle>
      <FlashBanner params={await searchParams} />

      <Card className="mb-6">
        <dl className="m-0">
          <div className={row}>
            <dt className={dt}>Received</dt>
            <dd className="m-0">{new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</dd>
          </div>
          <div className={row}>
            <dt className={dt}>Status</dt>
            <dd className="m-0">
              <Badge tone={m.status === "new" ? "warn" : m.status === "replied" ? "ok" : "mute"}>{m.status}</Badge>
            </dd>
          </div>
          <div className={row}>
            <dt className={dt}>Email</dt>
            <dd className="m-0 break-all">
              <a href={`mailto:${m.email}`} className="underline decoration-line-strong underline-offset-4 hover:text-seal">
                {m.email}
              </a>
            </dd>
          </div>
          {m.phone ? (
            <div className={row}>
              <dt className={dt}>Phone / WhatsApp</dt>
              <dd className="m-0">{m.phone}</dd>
            </div>
          ) : null}
          <div className={row}>
            <dt className={dt}>Wants to</dt>
            <dd className="m-0">{m.kind || "—"}</dd>
          </div>
          {m.work_ref ? (
            <div className={row}>
              <dt className={dt}>About the work</dt>
              <dd className="m-0">{m.work_ref}</dd>
            </div>
          ) : null}
          {m.budget ? (
            <div className={row}>
              <dt className={dt}>Budget</dt>
              <dd className="m-0">{m.budget}</dd>
            </div>
          ) : null}
        </dl>
        <p className="m-0 mt-5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">Message</p>
        {/* shown as plain text, with the sender's own line breaks */}
        <p className="m-0 mt-2 whitespace-pre-wrap break-words text-[1.05rem] leading-relaxed">{m.message}</p>
      </Card>

      <AdminForm action={saveEnquiry.bind(null, id)}>
        <Card title="Your notes">
          <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <SelectField
              label="Status"
              name="status"
              defaultValue={m.status}
              options={[
                { value: "new", label: "New" },
                { value: "read", label: "Read" },
                { value: "replied", label: "Replied" },
                { value: "archived", label: "Archived" },
              ]}
            />
            <TextArea label="Private note" name="admin_note" defaultValue={m.admin_note} rows={3} maxLength={2000} hint="Only you see this." />
          </div>
        </Card>
      </AdminForm>

      <Card title="Delete this message" className="mt-8" note="Removes it for good. To just tidy the list, set it to Archived.">
        <ConfirmButton action={deleteEnquiry.bind(null, id)} label="Delete this message…" confirmLabel="Yes, delete it for good" question="Delete this message?" />
      </Card>
    </>
  );
}
