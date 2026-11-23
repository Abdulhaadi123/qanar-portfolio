import type { Metadata } from "next";
import { Suspense } from "react";
import EnquiryForm from "@/components/EnquiryForm";
import { Label, PageHead, R, Wrap, ulink } from "@/components/ui";
import { commissionSteps, site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact & commissions",
  description: "Buy a work, commission a piece, or invite Qamar Abbas for a talk or class. Studio in Lahore.",
};

export default function ContactPage() {
  return (
    <>
      <PageHead no="04" label="Contact" title={["Let’s talk", <em key="e" className="font-light text-ink-2">about art</em>]}>
        <p className="m-0">
          To buy a work, commission a piece, or invite me for a talk or class — send a message and I’ll reply by email.
        </p>
      </PageHead>

      <section className="pb-[clamp(72px,10vw,150px)]">
        <Wrap>
          <div className="grid grid-cols-1 gap-x-[clamp(32px,6vw,110px)] gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Label>Start a conversation</Label>
              <div className="mt-6">
                <Suspense fallback={<div className="h-[420px] animate-shimmer bg-paper-2" />}>
                  <EnquiryForm />
                </Suspense>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <R>
                <Label>Direct</Label>
                <ul className="m-0 mt-3 list-none space-y-1 p-0 text-[1.1rem]">
                  <li>
                    <a href={`mailto:${site.email}`} className={ulink}>
                      {site.email}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${site.email2}`} className={ulink}>
                      {site.email2}
                    </a>
                  </li>
                  <li>
                    <a href={`tel:${site.phoneHref}`} className={ulink}>
                      {site.phone}
                    </a>
                  </li>
                </ul>
                <Label className="mt-8">Studio</Label>
                <address className="mt-3 not-italic leading-relaxed text-ink-2">
                  {site.studio.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                  <span className="block">Lahore, Pakistan</span>
                </address>
                <address className="mt-3 not-italic leading-relaxed text-ink-2">
                  {site.studio2.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <Label className="mt-8">Elsewhere</Label>
                <ul className="m-0 mt-3 list-none space-y-1 p-0 text-ink-2">
                  {site.socials.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className={ulink}>
                        {s.label}
                      </a>{" "}
                      <span className="text-ink-3">{s.handle}</span>
                    </li>
                  ))}
                </ul>
              </R>

              <R delay={120} className="mt-14">
                <Label>How a commission works</Label>
                <ol className="m-0 mt-4 list-none border-t border-line-strong p-0">
                  {commissionSteps.map((s) => (
                    <li key={s.no} className="grid grid-cols-[40px_1fr] gap-x-4 border-b border-line py-4">
                      <span className="font-mono text-[0.74rem] text-ink-3">{s.no}</span>
                      <div>
                        <p className="m-0 font-display text-[1.25rem] tracking-[-0.01em]">{s.title}</p>
                        <p className="m-0 mt-1 text-[0.95rem] text-ink-2">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </R>
            </aside>
          </div>
        </Wrap>
      </section>
    </>
  );
}
