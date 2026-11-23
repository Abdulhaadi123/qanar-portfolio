import Link from "next/link";
import type { ElementType, ReactNode } from "react";

/* Small building blocks, all Tailwind. Server-safe (no hooks). */

export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1544px] px-gutter ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  id,
  tight,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={`${tight ? "py-[clamp(40px,5vw,80px)]" : "py-[clamp(64px,8vw,120px)]"} ${className}`}>
      {children}
    </section>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-3 ${className}`}>{children}</p>
  );
}

/** A numbered section label:  01 — Practice */
export function SectionLabel({ no, children }: { no: string; children: ReactNode }) {
  return (
    <Label className="flex items-center gap-3">
      <span className="text-ink">{no}</span>
      <span className="h-px w-8 bg-line-strong" />
      <span>{children}</span>
    </Label>
  );
}

const reveal = {
  up: "translate-y-7 opacity-0 data-[in=true]:translate-y-0 data-[in=true]:opacity-100",
  fade: "opacity-0 data-[in=true]:opacity-100",
} as const;

/** Fades / slides / unveils its children once, when they scroll into view. */
export function R({
  as,
  kind = "up",
  delay = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  kind?: keyof typeof reveal | "clip";
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as ?? "div";
  if (kind === "clip") {
    // the observed wrapper stays unclipped; only the inner layer is unveiled
    return (
      <Tag data-reveal className={`group ${className}`}>
        <div
          style={{ transitionDelay: `${delay}ms` }}
          className="transition-[clip-path] duration-[1300ms] ease-expo [clip-path:inset(0_0_100%_0)] group-data-[in=true]:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none motion-reduce:[clip-path:none]"
        >
          {children}
        </div>
      </Tag>
    );
  }
  return (
    <Tag
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[1100ms] ease-expo motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${reveal[kind]} ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Headline lines that rise out of a mask, one after another. */
export function Lines({ lines, delay = 0, className = "" }: { lines: ReactNode[]; delay?: number; className?: string }) {
  return (
    <span data-reveal data-lines className={`group block ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
          <span
            style={{ transitionDelay: `${delay + i * 90}ms` }}
            className="block translate-y-[112%] transition-transform duration-[1150ms] ease-expo group-data-[in=true]:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none"
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

const btnBase =
  "group/btn inline-flex items-center gap-[0.7em] border px-6 py-[0.95em] font-mono text-[0.74rem] uppercase tracking-[0.1em] transition-colors duration-300";
const btnLine = "border-ink hover:bg-ink hover:text-paper";
const btnSolid = "border-ink bg-ink text-paper hover:border-seal hover:bg-seal";

export function Btn({
  href,
  children,
  solid,
  external,
  className = "",
}: {
  href: string;
  children: ReactNode;
  solid?: boolean;
  external?: boolean;
  className?: string;
}) {
  const cls = `${btnBase} ${solid ? btnSolid : btnLine} ${className}`;
  const arrow = <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        {arrow}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}

export const ulink =
  "underline decoration-ink/30 decoration-1 underline-offset-[5px] transition-colors duration-300 hover:decoration-seal";

/** Page title block used by the inner pages. */
export function PageHead({ no, label, title, children }: { no: string; label: string; title: ReactNode[]; children?: ReactNode }) {
  return (
    <section className="pb-[clamp(28px,3.5vw,48px)] pt-[calc(var(--spacing-head)+clamp(36px,5vw,80px))]">
      <Wrap>
        <div className="grid grid-cols-1 items-end gap-x-10 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionLabel no={no}>{label}</SectionLabel>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,6.2vw,5.6rem)] font-[340] leading-[1] tracking-[-0.03em]">
              <Lines lines={title} />
            </h1>
          </div>
          {children ? <div className="max-w-[44ch] text-[1.02rem] text-ink-2 lg:col-span-4 lg:pb-2">{children}</div> : null}
        </div>
      </Wrap>
    </section>
  );
}
