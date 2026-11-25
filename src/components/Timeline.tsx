import type { RecordEntry } from "@/lib/content/types";
import { Label, R } from "./ui";

/** Dated milestones as a ruled table. */
export default function Timeline({ record }: { record: RecordEntry[] }) {
  return (
    <div className="border-t border-line-strong">
      {record.map((r, i) => (
        <R key={r.id} delay={i * 50} kind="fade">
          <div className="grid grid-cols-[78px_1fr] items-baseline gap-x-6 gap-y-1 border-b border-line py-[18px] md:grid-cols-[110px_minmax(0,1.4fr)_minmax(0,1fr)]">
            <Label className="text-ink">{r.year || "—"}</Label>
            <p className="m-0 font-display text-[1.25rem] leading-snug tracking-[-0.01em]">{r.what}</p>
            <p className="col-start-2 m-0 text-[0.95rem] text-ink-2 md:col-start-auto">{r.where}</p>
          </div>
        </R>
      ))}
    </div>
  );
}
