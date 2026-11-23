import type { Metadata } from "next";
import Link from "next/link";
import ScaleWall from "@/components/ScaleWall";
import WorksGallery from "@/components/WorksGallery";
import { Btn, Label, Lines, PageHead, R, Section, SectionLabel, Wrap } from "@/components/ui";
import { series } from "@/data/series";
import { site } from "@/data/site";
import { hasSize, worksOf, works } from "@/data/works";

export const metadata: Metadata = {
  title: "Works",
  description:
    "39 works in four series: birch bark and ink, constitution and currency, charcoal portraits of the mountain people, and embroidery on canvas.",
};

export default function WorksPage() {
  const sized = works.filter(hasSize).length;
  return (
    <>
      <PageHead
        no="01"
        label="Works"
        title={[
          <>
            Selected <em className="font-light text-ink-2">works</em>
          </>,
        ]}
      >
        <p className="m-0">
          {works.length} works in four series, with the titles, sizes and media written in the artist’s portfolio. Open one to see it large and at its real size.
        </p>
      </PageHead>

      {/* index of the four series */}
      <Wrap className="pb-[clamp(24px,3vw,40px)]">
        <nav aria-label="Series" className="grid grid-cols-1 border-t border-line-strong sm:grid-cols-2 lg:grid-cols-4">
          {series.map((s, i) => (
            <Link
              key={s.id}
              href={`#${s.slug}`}
              className="group/idx flex items-baseline justify-between gap-4 border-b border-line py-4 pr-4 transition-colors duration-300 hover:text-seal lg:border-b-0 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"
            >
              <span>
                <Label>{s.kind}</Label>
                <span className="mt-1 block font-display text-[1.3rem] tracking-[-0.015em]">{s.title}</span>
              </span>
              <span className="font-mono text-[0.74rem] text-ink-3 transition-transform duration-300 group-hover/idx:translate-y-0.5">
                {worksOf(s.id).length} ↓
              </span>
              <span className="sr-only">{i + 1}</span>
            </Link>
          ))}
        </nav>
      </Wrap>

      {/* each series: its statement stays in view while its works scroll past */}
      {series.map((s, i) => {
        const items = worksOf(s.id);
        return (
          <Section key={s.id} id={s.slug} className="scroll-mt-20 border-t border-line">
            <Wrap>
              <div className="grid grid-cols-1 items-start gap-x-[clamp(32px,5vw,88px)] gap-y-10 lg:grid-cols-12">
                <div className="lg:sticky lg:top-[calc(var(--spacing-head)+28px)] lg:col-span-5">
                  <SectionLabel no={`0${i + 2}`}>{s.kind}</SectionLabel>
                  <h2 className="m-0 mt-6 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em]">
                    <Lines lines={[s.title]} />
                  </h2>
                  <R delay={100}>
                    <Label className="mt-6 text-ink">
                      {s.medium} · {items.length} works
                    </Label>
                    <div className="mt-4 flex flex-col gap-4 text-[1.02rem] text-ink-2">
                      {s.statement.map((p) => (
                        <p key={p} className="m-0 max-w-[58ch]">
                          {p}
                        </p>
                      ))}
                    </div>
                  </R>
                  {i === 3 && (
                    <R delay={160} className="mt-8 flex flex-wrap gap-3">
                      <Btn href="/contact">Ask about this series</Btn>
                      <Btn href={site.portfolioPdf} external>
                        Portfolio PDF
                      </Btn>
                    </R>
                  )}
                </div>
                <div className="lg:col-span-7">
                  <WorksGallery seriesId={s.id} />
                </div>
              </div>
            </Wrap>
          </Section>
        );
      })}

      <Section className="border-t border-line">
        <Wrap>
          <div className="mb-[clamp(28px,3.5vw,48px)] grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="06">At true size</SectionLabel>
            </div>
            <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em] lg:col-span-9">
              <Lines
                lines={[
                  <>
                    Each work <em className="font-light text-ink-2">on a gallery wall</em>
                  </>,
                ]}
              />
            </h2>
          </div>
          <ScaleWall />
          <p className="mt-6 max-w-[70ch] font-mono text-[0.7rem] uppercase leading-relaxed tracking-[0.08em] text-ink-3">
            {sized} of the {works.length} works have one fixed size. The digital images and the installation are variable, and the set of small portraits is
            5 × 6 in each, so they are not on the wall.
          </p>
        </Wrap>
      </Section>
    </>
  );
}
