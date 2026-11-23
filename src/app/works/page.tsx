import type { Metadata } from "next";
import PlateCanvas from "@/components/PlateCanvas";
import ScaleWall from "@/components/ScaleWall";
import WorksGallery from "@/components/WorksGallery";
import { Btn, Label, Lines, PageHead, R, Section, SectionLabel, Wrap } from "@/components/ui";
import { seriesFourStatement, site, statement } from "@/data/site";
import { works } from "@/data/works";

export const metadata: Metadata = {
  title: "Works",
  description: "Seventeen works on paper birch, paper and watercolour, shown at true size, plus Series 4 in embroidery.",
};

export default function WorksPage() {
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
          {works.length} works, with the sizes and media given by the artist. Open a plate to see it large and on a wall at its real size.
        </p>
      </PageHead>

      <section id="echoes-on-birch" className="scroll-mt-24 pb-[clamp(56px,7vw,100px)]">
        <Wrap>
          <WorksGallery />
          <p className="mt-2 max-w-[78ch] font-mono text-[0.7rem] uppercase leading-relaxed tracking-[0.08em] text-ink-3">
            Plates are illustrations drawn from each work’s medium and size. Photographs of the works will replace them.
          </p>
        </Wrap>
      </section>

      <Section className="border-t border-line">
        <Wrap>
          <div className="mb-[clamp(28px,3.5vw,48px)] grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="02">At true size</SectionLabel>
            </div>
            <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em] lg:col-span-9">
              <Lines
                lines={[
                  <>
                    Every work, <em className="font-light text-ink-2">hung on one wall</em>
                  </>,
                ]}
              />
            </h2>
          </div>
          <ScaleWall />
        </Wrap>
      </Section>

      <Section id="constitution-and-currency" className="scroll-mt-24 border-t border-line">
        <Wrap>
          <div className="grid grid-cols-1 items-start gap-x-[clamp(32px,6vw,100px)] gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="03">Constitution &amp; currency</SectionLabel>
            </div>
            <div className="lg:col-span-5">
              <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em]">
                <Lines lines={["Texts of power,", <em key="e" className="font-light text-ink-2">turned against themselves</em>]} />
              </h2>
              <R delay={100}>
                <p className="mt-8 max-w-[56ch] text-[1.05rem] text-ink-2">{statement[1]}</p>
              </R>
            </div>
            <R kind="clip" className="lg:col-span-4">
              <PlateCanvas style="currency" seed={149} photo="/works/constitution.webp" ratio={1.05} alt="Constitution and currency: guilloche and micro-text from the statement, struck through" maxW={640} />
              <Label className="mt-3">Micro-text: a phrase from the statement</Label>
            </R>
          </div>
        </Wrap>
      </Section>

      <Section id="needle-and-thread" className="scroll-mt-24 border-t border-line">
        <Wrap>
          <div className="grid grid-cols-1 items-start gap-x-[clamp(32px,6vw,100px)] gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="04">Series 4 · Embroidery</SectionLabel>
            </div>
            <div className="lg:col-span-5">
              <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em]">
                <Lines lines={["Needle &", <em key="e" className="font-light text-ink-2">Thread</em>]} />
              </h2>
              <R delay={100}>
                <Label className="mt-8">Lockdown, 2020 · Gilgit</Label>
                <p className="mt-4 max-w-[56ch] text-[1.05rem] text-ink-2">{seriesFourStatement}</p>
              </R>
              <R delay={160} className="mt-8 flex flex-wrap gap-3">
                <Btn href="/contact">Ask about this series</Btn>
                <Btn href={site.portfolioPdf} external>
                  Portfolio PDF
                </Btn>
              </R>
            </div>
            <R kind="clip" className="lg:col-span-4">
              <PlateCanvas style="embroidery" seed={66} photo="/works/needle.webp" ratio={0.85} alt="Mountains, sun and ibex horns in thread on dark cloth" maxW={640} />
              <Label className="mt-3">Mountains, sun and ibex, as in the statement</Label>
            </R>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
