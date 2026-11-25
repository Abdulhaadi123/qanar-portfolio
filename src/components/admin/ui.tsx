import Link from "next/link";
import type { ReactNode } from "react";

/* Building blocks of the admin panel. Tailwind utilities only, on the same tokens as the public site. */

export const inputCls =
  "w-full border border-line-strong bg-white/50 px-3 py-2.5 text-[1rem] leading-snug outline-none transition-colors placeholder:text-ink-3/60 focus:border-seal aria-invalid:border-seal disabled:opacity-60";

const btnBase =
  "inline-flex items-center justify-center gap-2 border px-5 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";
export const btnSolid = `${btnBase} border-ink bg-ink text-paper hover:border-seal hover:bg-seal`;
export const btnLine = `${btnBase} border-ink text-ink hover:bg-ink hover:text-paper`;
export const btnDanger = `${btnBase} border-seal text-seal hover:bg-seal hover:text-paper`;
export const btnSmall = "px-3 py-1.5 text-[0.66rem]";

export function PageTitle({ title, note, children }: { title: string; note?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line-strong pb-6">
      <div className="min-w-0">
        <h1 className="m-0 font-display text-[clamp(1.9rem,3.2vw,2.8rem)] font-[340] leading-[1.05] tracking-[-0.025em]">{title}</h1>
        {note ? <p className="m-0 mt-2 max-w-[62ch] text-[0.98rem] text-ink-2">{note}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </header>
  );
}

export function Card({ title, note, children, className = "" }: { title?: string; note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line-strong bg-paper-2/40 p-5 sm:p-6 ${className}`}>
      {title ? (
        <div className="mb-5">
          <h2 className="m-0 font-display text-[1.35rem] font-[380] tracking-[-0.015em]">{title}</h2>
          {note ? <p className="m-0 mt-1 max-w-[62ch] text-[0.92rem] text-ink-2">{note}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const bannerTone = {
  ok: "border-[#2f6b3f] bg-[#2f6b3f]/10 text-[#1f4a2b]",
  error: "border-seal bg-seal/10 text-seal",
  info: "border-line-strong bg-paper-2 text-ink-2",
} as const;

export function Banner({ kind = "info", children }: { kind?: keyof typeof bannerTone; children: ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`m-0 mb-6 border-l-4 px-4 py-3 text-[0.96rem] ${bannerTone[kind]}`}>
      {children}
    </p>
  );
}

const badgeTone = {
  ok: "border-[#2f6b3f] text-[#2f6b3f]",
  warn: "border-seal text-seal",
  mute: "border-line-strong text-ink-3",
  ink: "border-ink bg-ink text-paper",
} as const;

export function Badge({ tone = "mute", children }: { tone?: keyof typeof badgeTone; children: ReactNode }) {
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] ${badgeTone[tone]}`}>{children}</span>
  );
}

export function LinkBtn({ href, children, solid, small }: { href: string; children: ReactNode; solid?: boolean; small?: boolean }) {
  return (
    <Link href={href} className={`${solid ? btnSolid : btnLine} ${small ? btnSmall : ""}`}>
      {children}
    </Link>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="m-0 border border-dashed border-line-strong px-5 py-10 text-center text-ink-3">{children}</p>;
}

/** what a ?saved=1 / ?deleted=1 / ?error=… in the address says */
export function FlashBanner({ params }: { params: { saved?: string; deleted?: string; error?: string } }) {
  if (params.saved) return <Banner kind="ok">Saved. The public site shows the change now.</Banner>;
  if (params.deleted) return <Banner kind="ok">Deleted.</Banner>;
  if (params.error === "has-works") return <Banner kind="error">This series still has works. Move or delete them first.</Banner>;
  if (params.error) return <Banner kind="error">That did not work. Please try again.</Banner>;
  return null;
}
