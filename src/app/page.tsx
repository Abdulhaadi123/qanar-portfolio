import Link from "next/link";
import type { ReactNode } from "react";
import Hero from "@/components/Hero";
import Portrait from "@/components/Portrait";
import WorksGallery from "@/components/WorksGallery";
import SeriesList from "@/components/SeriesList";
import PostRows from "@/components/PostRows";
import Timeline from "@/components/Timeline";
import { Btn, Label, Lines, R, Section, SectionLabel, Wrap, ulink } from "@/components/ui";
import { bio, commissionSteps, recognition, site, statement, teaching } from "@/data/site";
import { works } from "@/data/works";

function Head({ no, label, title, right }: { no: string; label: string; title: ReactNode[]; right?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <SectionLabel no={no}>{label}</SectionLabel>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6 lg:col-span-9">
        <h2 className="m-0 font-display text-[clamp(2.2rem,4.8vw,4.6rem)] font-[340] leading-[1.02] tracking-[-0.028em]">
          <Lines lines={title} />
        </h2>
        {right}
      </div>
    </div>
  );
}

const em = (t: string) => (
  <em key={t} className="font-light text-ink-2">
    {t}
  </em>
);

export default function Home() {
  return (
    <>
      <Hero />

      {/* 01 — the artist, with his portrait */}
      <section className="bg-[#d8c8a5] py-[clamp(64px,8vw,120px)]">
        <Wrap>
          <div className="grid grid-cols-1 items-center gap-x-[clamp(32px,6vw,110px)] gap-y-12 lg:grid-cols-12">
            <R kind="clip" className="lg:col-span-5">
              <Portrait className="aspect-[4/5] w-full" />
              <div className="mt-3 flex justify-between gap-4">
                <Label className="text-ink-2">Qamar Abbas</Label>
                <Label className="text-ink-2">Lahore, Pakistan</Label>
              </div>
            </R>
            <div className="lg:col-span-7">
              <SectionLabel no="01">The artist</SectionLabel>
              <R delay={80}>
                <p className="m-0 mt-8 font-display text-[clamp(1.5rem,2.7vw,2.5rem)] font-[330] leading-[1.25] tracking-[-0.015em]">{bio}</p>
              </R>
              <R delay={160}>
                <dl className="m-0 mt-10 border-t border-ink/40">
                  {[
                    ["Based in", site.base],
                    ["From", site.origin],
                    ["Education", "BFA Painting, National College of Arts, Lahore (2020)"],
                    ["Recognition", "New York Olympic of Art, Artiade Organization (2024)"],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[110px_1fr] gap-4 border-b border-ink/20 py-3">
                      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-2">{k}</dt>
                      <dd className="m-0">{v}</dd>
                    </div>
                  ))}
                </dl>
              </R>
              <R delay={220} className="mt-8 flex flex-wrap gap-3">
                <Btn href="/about" solid>
                  Read more
                </Btn>
                <Btn href={site.portfolioPdf} external>
                  Portfolio PDF
                </Btn>
              </R>
            </div>
          </div>
        </Wrap>
      </section>

      {/* 02 — the statement */}
      <Section>
        <Wrap>
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <SectionLabel no="02">Artist statement</SectionLabel>
            </div>
            <div className="lg:col-span-9">
              <R>
                <p className="m-0 max-w-[30em] font-display text-[clamp(1.7rem,3.3vw,3.2rem)] font-[320] leading-[1.18] tracking-[-0.02em]">{statement[0]}</p>
              </R>
              <R delay={120} className="mt-12 grid gap-x-10 gap-y-6 border-t border-line-strong pt-8 md:grid-cols-2">
                <p className="m-0 max-w-[52ch] text-ink-2">{statement[1]}</p>
                <p className="m-0 max-w-[52ch] text-ink-2">{recognition}</p>
              </R>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* 03 — the works, at true size */}
      <Section className="border-t border-line">
        <Wrap>
          <div className="mb-[clamp(32px,4vw,64px)]">
            <Head
              no="03"
              label="Works"
              title={["Selected", em("works")]}
              right={
                <Link href="/works" className={`font-mono text-[0.74rem] uppercase tracking-[0.1em] ${ulink}`}>
                  All {works.length} works →
                </Link>
              }
            />
          </div>
          <WorksGallery only="selected" />
          <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">
            {works.length} works in all, with sizes and media as listed by the artist. Plates are illustrations drawn from each medium.
          </p>
        </Wrap>
      </Section>

      {/* 04 — series */}
      <Section className="border-t border-line">
        <Wrap>
          <div className="mb-[clamp(32px,4vw,64px)]">
            <Head no="04" label="Bodies of work" title={["Three ways", em("of making")]} />
          </div>
          <SeriesList />
        </Wrap>
      </Section>

      {/* 05 — record and teaching */}
      <Section className="border-t border-line">
        <Wrap>
          <div className="grid grid-cols-1 gap-x-[clamp(32px,6vw,110px)] gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionLabel no="05">Record</SectionLabel>
              <div className="mt-8">
                <Timeline />
              </div>
            </div>
            <div className="lg:col-span-5">
              <SectionLabel no="06">Art educator</SectionLabel>
              <R>
                <h2 className="m-0 mt-8 font-display text-[clamp(1.9rem,3.2vw,3rem)] font-[340] leading-[1.06] tracking-[-0.025em]">
                  Teaching the line, <em className="font-light text-ink-2">the letter and the eye</em>
                </h2>
              </R>
              <R delay={80}>
                <p className="mt-5 max-w-[44ch] text-ink-2">{teaching.intro}</p>
              </R>
              <div className="mt-8 border-t border-line-strong">
                {teaching.principles.map((p, i) => (
                  <R key={p.no} delay={i * 70} kind="fade">
                    <div className="grid grid-cols-[40px_1fr] gap-x-4 border-b border-line py-4">
                      <Label>{p.no}</Label>
                      <div>
                        <p className="m-0 font-display text-[1.3rem] tracking-[-0.01em]">{p.title}</p>
                        <p className="m-0 mt-1 text-[0.95rem] text-ink-2">{p.text}</p>
                      </div>
                    </div>
                  </R>
                ))}
              </div>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* 07 — journal */}
      <Section className="border-t border-line">
        <Wrap>
          <div className="mb-[clamp(32px,4vw,64px)]">
            <Head
              no="07"
              label="Journal"
              title={["Notes on", em("script and masters")]}
              right={
                <Link href="/journal" className={`font-mono text-[0.74rem] uppercase tracking-[0.1em] ${ulink}`}>
                  All posts →
                </Link>
              }
            />
          </div>
          <PostRows />
        </Wrap>
      </Section>

      {/* 08 — commissions */}
      <Section className="border-t border-line">
        <Wrap>
          <Head
            no="08"
            label="Commissions"
            title={["A piece", em("written for you")]}
            right={
              <Btn href="/contact" solid>
                Start a commission
              </Btn>
            }
          />
          <R className="mt-6 grid grid-cols-1 gap-x-8 lg:grid-cols-12">
            <p className="m-0 max-w-[52ch] text-[1.08rem] text-ink-2 lg:col-span-6 lg:col-start-4">
              Verses, names, prayers or poetry — composed and written by hand, in a classical script or a contemporary style.
            </p>
          </R>
          <div className="mt-[clamp(32px,4vw,64px)] grid grid-cols-1 border-t border-line-strong sm:grid-cols-2 lg:grid-cols-4">
            {commissionSteps.map((s, i) => (
              <R
                key={s.no}
                delay={i * 90}
                className="border-b border-line py-7 sm:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <Label>{s.no}</Label>
                <h3 className="m-0 mt-4 font-display text-[1.6rem] font-[360] leading-[1.1] tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-[0.98rem] text-ink-2">{s.text}</p>
              </R>
            ))}
          </div>
        </Wrap>
      </Section>
    </>
  );
}
