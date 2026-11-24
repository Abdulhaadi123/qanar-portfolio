"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Btn, Label, Lines } from "./ui";
import { clamp } from "@/lib/rng";
import { mediumOf, worksByNo } from "@/data/works";
import { heroSurface, site } from "@/data/site";

const BarkCanvas = dynamic(() => import("./BarkCanvas"), { ssr: false });

const piece = worksByNo("02")!;

/**
 * The first screen. The section is taller than the screen and its content is sticky,
 * so scrolling does not move the page, it moves the story:
 *   0.00 – 0.32  the roll opens into a sheet; the headline gives way
 *   0.30 – 0.80  the sheet comes forward and turns; the series and the work's caption appear
 *   0.86 – 1.00  everything lifts away into the page
 * Progress (0 → 1) also goes to the 3D scene, which draws a frame only when it changes.
 *
 * Layout rule (shared with the 3D scene): wider than 1.1 : 1 → text left, object right.
 * Otherwise → object on top, text below.
 */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef({ p: 0 });
  const intro = useRef<HTMLDivElement>(null);
  const urdu = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const second = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<"wide" | "narrow">("wide");

  // layout only changes on resize, never while scrolling
  useEffect(() => {
    const calc = () => setLayout(window.innerWidth / window.innerHeight > 1.1 ? "wide" : "narrow");
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = clamp(-r.top / Math.max(1, total));
      progress.current.p = p;

      const introK = clamp(1 - (p - 0.04) / 0.18);
      if (intro.current) {
        intro.current.style.opacity = String(introK);
        intro.current.style.transform = `translate3d(0,${-(1 - introK) * 56}px,0)`;
      }
      if (urdu.current) urdu.current.style.opacity = String(clamp(1 - p / 0.12));
      if (hint.current) hint.current.style.opacity = String(clamp(1 - p / 0.05));
      if (second.current) {
        const k = clamp((p - 0.34) / 0.12) * (1 - clamp((p - 0.8) / 0.1));
        second.current.style.opacity = String(k);
        second.current.style.transform = `translate3d(0,${(1 - clamp((p - 0.34) / 0.12)) * 32}px,0)`;
      }
      if (caption.current) {
        const k = clamp((p - 0.42) / 0.1) * (1 - clamp((p - 0.82) / 0.08));
        caption.current.style.opacity = String(k);
        caption.current.style.transform = `translate3d(0,${(1 - k) * 18}px,0)`;
      }
      if (rail.current) rail.current.style.transform = `scaleY(${p})`;
      if (stage.current) stage.current.style.opacity = String(1 - clamp((p - 0.9) / 0.1) * 0.9);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={section}
      data-layout={layout}
      aria-label="Introduction"
      className="group/hero relative h-[210svh] max-md:h-[190svh]"
    >
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden bg-[radial-gradient(120%_90%_at_72%_48%,#f7f2e7_0%,#e9e0cc_52%,#d9cdb4_100%)] group-data-[layout=narrow]/hero:bg-[radial-gradient(130%_80%_at_50%_30%,#f7f2e7_0%,#e9e0cc_55%,#d9cdb4_100%)]">
        <div ref={stage} className="absolute inset-0">
          {/* shown until WebGL is ready, and kept if it never is */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready ? "opacity-0" : ""}`}
          >
            {heroSurface === "real" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/media/hero-bark.webp"
                alt=""
                width={1024}
                height={1536}
                fetchPriority="high"
                className="ml-[min(38vw,520px)] aspect-[2.3/3.45] w-[min(30vh,42vw)] -rotate-2 object-cover drop-shadow-[18px_24px_22px_rgba(80,60,40,0.28)] [clip-path:polygon(0_1%,8%_0,22%_1.4%,40%_0.3%,58%_1.6%,76%_0.4%,100%_1%,99%_40%,100%_100%,0_100%,1%_60%)] group-data-[layout=narrow]/hero:-mt-[18vh] group-data-[layout=narrow]/hero:ml-0 group-data-[layout=narrow]/hero:w-[min(40vw,22vh)]"
              />
            ) : (
              <div className="ml-[min(38vw,520px)] grid aspect-[2.3/3.45] w-[min(30vh,42vw)] -rotate-2 place-items-center bg-[repeating-linear-gradient(0deg,rgb(60_44_32/0.07)_0_1px,transparent_1px_7px),linear-gradient(160deg,#f4eddf,#e6dbc4_60%,#d8c9ac)] drop-shadow-[18px_24px_22px_rgba(80,60,40,0.28)] [clip-path:polygon(0_1%,8%_0,22%_1.4%,40%_0.3%,58%_1.6%,76%_0.4%,100%_1%,99%_40%,100%_100%,0_100%,1%_60%)] group-data-[layout=narrow]/hero:-mt-[18vh] group-data-[layout=narrow]/hero:ml-0 group-data-[layout=narrow]/hero:w-[min(40vw,22vh)]">
                <span lang="ur" dir="rtl" className="font-script text-[clamp(3rem,9vh,6rem)]">
                  قمر
                </span>
              </div>
            )}
          </div>

          <div className="absolute inset-0">
            <BarkCanvas progress={progress} surface={heroSurface} onReady={() => setReady(true)} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[3]">
          <div
            ref={intro}
            className="absolute inset-x-gutter top-[calc(var(--spacing-head)+clamp(28px,7vh,88px))] will-change-transform group-data-[layout=narrow]/hero:top-auto group-data-[layout=narrow]/hero:bottom-[clamp(28px,5vh,56px)]"
          >
            <Label>Visual artist &amp; art educator · Lahore / Gilgit-Baltistan</Label>
            <h1 className="mt-[clamp(14px,2.4vh,28px)] max-w-[9ch] font-display text-[clamp(3.4rem,10.5vw,10.5rem)] font-[340] leading-[0.98] tracking-[-0.03em] group-data-[layout=narrow]/hero:max-w-none group-data-[layout=narrow]/hero:text-[clamp(2.8rem,13vw,5.2rem)]">
              <Lines
                delay={150}
                lines={[
                  "Qamar",
                  <em key="a" className="block pl-[0.9em] font-light text-ink-2">
                    Abbas
                  </em>,
                ]}
              />
            </h1>
            <p className="mt-[clamp(18px,3vh,36px)] max-w-[34ch] text-[clamp(1rem,1.35vw,1.2rem)] text-ink-2 group-data-[layout=narrow]/hero:mt-3 group-data-[layout=narrow]/hero:text-[0.98rem]">
              Calligraphy on paper birch. Landscape, cultural memory, and the visual language of power.
            </p>
            <div className="pointer-events-auto mt-[clamp(22px,4vh,44px)] flex flex-wrap gap-3 group-data-[layout=narrow]/hero:mt-5">
              <Btn href="/works" solid>
                View the works
              </Btn>
              <Btn href="/contact">Commission a piece</Btn>
            </div>
          </div>

          <div ref={urdu} className="absolute bottom-[clamp(70px,10vh,120px)] right-gutter text-right group-data-[layout=narrow]/hero:hidden">
            <p lang="ur" dir="rtl" className="font-script text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.6] text-ink-2">
              {site.nameUrdu}
            </p>
          </div>

          <div ref={hint} className="absolute bottom-[clamp(24px,4.5vh,44px)] left-gutter flex items-center gap-3.5 group-data-[layout=narrow]/hero:hidden">
            <i className="block h-[38px] w-px animate-drip bg-ink" />
            <Label>Scroll to unroll</Label>
          </div>

          {/* stage 2: the series, and the caption of the piece on the sheet */}
          <div
            ref={second}
            style={{ opacity: 0 }}
            className="absolute bottom-[clamp(36px,8vh,92px)] left-gutter max-w-[min(440px,calc(100%-var(--spacing-gutter)*2))] will-change-transform max-md:bottom-7"
          >
            <Label>Series 1</Label>
            <p className="m-0 mt-3 font-display text-[clamp(2.2rem,4.6vw,4.4rem)] font-[340] leading-[1] tracking-[-0.03em]">
              Echoes on <em className="font-light text-ink-2">Birch</em>
            </p>
            <p className="m-0 mt-3.5 max-w-[38ch] text-[0.98rem] text-ink-2">
              Bhojpatra bark from the mountains of Gilgit-Baltistan, written on in Khat-e-Suls: landscape and cultural memory, one sheet at a time.
            </p>
            <div className="pointer-events-auto mt-6">
              <Btn href="/works#echoes-on-birch">See the series</Btn>
            </div>
          </div>

          {heroSurface === "real" && (
            <div
              ref={caption}
              style={{ opacity: 0 }}
              className="absolute bottom-[clamp(36px,8vh,92px)] right-gutter text-right will-change-transform group-data-[layout=narrow]/hero:hidden"
            >
              <Label className="text-ink">
                No. {piece.no} · {piece.title}
              </Label>
              <Label className="mt-1.5 block">{mediumOf(piece)}</Label>
              <Label className="mt-1.5 block">{piece.size}</Label>
            </div>
          )}

          {/* progress of the story */}
          <div aria-hidden className="absolute right-[calc(var(--spacing-gutter)/2-1px)] top-1/2 hidden h-28 w-px -translate-y-1/2 bg-line-strong/40 md:block">
            <span ref={rail} className="absolute inset-0 origin-top scale-y-0 bg-seal" />
          </div>
        </div>

        {/* the bottom edge melts into the page */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-24 bg-gradient-to-b from-transparent to-paper" />
      </div>
    </section>
  );
}
