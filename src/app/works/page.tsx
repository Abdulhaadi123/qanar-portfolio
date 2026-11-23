import type { Metadata } from "next";
import ScaleWall from "@/components/ScaleWall";
import WorksGallery from "@/components/WorksGallery";
import Photo from "@/components/Photo";
import { Btn, Label, Lines, PageHead, R, Section, SectionLabel, Wrap } from "@/components/ui";
import { series } from "@/data/series";
import { site } from "@/data/site";
import { hasSize, worksByNo, worksOf, works } from "@/data/works";

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

      <section className="pb-[clamp(56px,7vw,100px)]">
        <Wrap>
          <WorksGallery />
        </Wrap>
      </section>

      {/* the four series, with his statements */}
      {series.map((s, i) => {
        const items = worksOf(s.id);
        const shots = [s.cover, ...items.map((w) => w.no).filter((n) => n !== s.cover)].slice(0, 3).map((n) => worksByNo(n)!);
        return (
          <Section key={s.id} id={s.slug} className="scroll-mt-24 border-t border-line">
            <Wrap>
              <div className="grid grid-cols-1 items-start gap-x-[clamp(32px,6vw,100px)] gap-y-10 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <SectionLabel no={`0${i + 2}`}>{s.kind}</SectionLabel>
                  <Label className="mt-4">{items.length} works</Label>
                </div>
                <div className="lg:col-span-5">
                  <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em]">
                    <Lines lines={[s.title]} />
                  </h2>
                  <R delay={100}>
                    <Label className="mt-6 text-ink">{s.medium}</Label>
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
                <div className="grid grid-cols-2 items-start gap-4 lg:col-span-4">
                  {shots.map((w, k) => (
                    <R key={w.no} kind="clip" delay={k * 100} className={k === 0 ? "col-span-2" : ""}>
                      <Photo src={w.photo} ratio={w.ratio} alt={`${w.title}, ${w.size}`} className="shadow-[0_12px_20px_rgba(70,50,30,0.2)]" />
                    </R>
                  ))}
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
