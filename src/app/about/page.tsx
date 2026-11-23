import type { Metadata } from "next";
import Portrait from "@/components/Portrait";
import Timeline from "@/components/Timeline";
import { Btn, Label, Lines, PageHead, R, Section, SectionLabel, Wrap, ulink } from "@/components/ui";
import { alsoOnWix, bio, career, site, statement, teaching } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Qamar Abbas, born 1997 in the Oshikhandass valley of Gilgit-Baltistan. Fine Arts at the National College of Arts, Lahore (2020). Exhibitions, awards and teaching.",
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        no="01"
        label="About"
        title={["The artist", <em key="e" className="font-light text-ink-2">and the surface</em>]}
      />

      <Section tight className="pt-0">
        <Wrap>
          <div className="grid grid-cols-1 gap-x-[clamp(32px,6vw,110px)] gap-y-12 lg:grid-cols-12">
            <R kind="clip" className="lg:col-span-5">
              <Portrait className="aspect-[4/5] w-full" />
              <dl className="m-0 mt-6 border-t border-line-strong">
                {[
                  ["Born", `${site.born}, ${site.origin}`],
                  ["Based in", site.base],
                  ["Studio", site.studio[0]],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-5 border-b border-line py-2.5">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-3">{k}</dt>
                    <dd className="m-0 text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </R>

            <div className="lg:col-span-7">
              <R>
                <p className="m-0 font-display text-[clamp(1.4rem,2.4vw,2.2rem)] font-[330] leading-[1.3] tracking-[-0.012em]">{bio}</p>
              </R>
              <R delay={100} className="mt-10">
                <div className="flex flex-col gap-5 text-[1.05rem] text-ink-2">
                  {career.map((p) => (
                    <p key={p} className="m-0 max-w-[62ch]">
                      {p}
                    </p>
                  ))}
                </div>
              </R>
              <R delay={160} className="mt-12">
                <Label>Artist statement</Label>
                <div className="mt-4 flex flex-col gap-5 text-[1.05rem] text-ink-2">
                  {statement.map((p) => (
                    <p key={p} className="m-0 max-w-[62ch]">
                      {p}
                    </p>
                  ))}
                  <p className="m-0 max-w-[62ch]">{alsoOnWix}</p>
                </div>
              </R>
              <R delay={200} className="mt-10 flex flex-wrap gap-3">
                <Btn href="/works" solid>
                  View the works
                </Btn>
                <Btn href={site.portfolioPdf} external>
                  Portfolio PDF
                </Btn>
              </R>
            </div>
          </div>
        </Wrap>
      </Section>

      <Section className="border-t border-line">
        <Wrap>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="02">Exhibitions &amp; record</SectionLabel>
            </div>
            <div className="lg:col-span-9">
              <Timeline />
            </div>
          </div>
        </Wrap>
      </Section>

      <Section className="border-t border-line">
        <Wrap>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="03">Teaching</SectionLabel>
            </div>
            <div className="lg:col-span-9">
              <h2 className="m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-[340] leading-[1.04] tracking-[-0.028em]">
                <Lines lines={["Teaching the line,", <em key="e" className="font-light text-ink-2">the letter and the eye</em>]} />
              </h2>
              <R delay={100}>
                <p className="mt-6 max-w-[56ch] text-[1.05rem] text-ink-2">{teaching.intro}</p>
              </R>
              <div className="mt-10 border-t border-line-strong">
                {teaching.principles.map((p, i) => (
                  <R key={p.no} delay={i * 70} kind="fade">
                    <div className="grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1 border-b border-line py-6 md:grid-cols-[48px_minmax(0,1fr)_minmax(0,1.3fr)]">
                      <Label>{p.no}</Label>
                      <h3 className="m-0 font-display text-[1.6rem] font-[360] tracking-[-0.02em]">{p.title}</h3>
                      <p className="col-start-2 m-0 text-ink-2 md:col-start-auto">{p.text}</p>
                    </div>
                  </R>
                ))}
              </div>
              <p className="mt-10 text-ink-2">
                To invite me for a talk, class or workshop,{" "}
                <a href="/contact" className={ulink}>
                  write to me
                </a>
                .
              </p>
            </div>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
