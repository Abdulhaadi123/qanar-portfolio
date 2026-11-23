"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Btn, Label, Lines } from "./ui";
import { clamp } from "@/lib/rng";
import { site } from "@/data/site";

const BarkCanvas = dynamic(() => import("./BarkCanvas"), { ssr: false });

/**
 * The first screen. The section is taller than the screen and its content is
 * sticky, so scrolling does not move the page, it unrolls the bark.
 * Progress (0 → 1) goes to the 3D scene and drives the text swap below.
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
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<"wide" | "narrow">("wide");

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setLayout(window.innerWidth / window.innerHeight > 1.1 ? "wide" : "narrow");
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = clamp(-r.top / Math.max(1, total));
      progress.current.p = p;
      if (intro.current) {
        intro.current.style.opacity = String(clamp(1 - p * 3.4));
        intro.current.style.transform = `translateY(${-p * 48}px)`;
      }
      if (urdu.current) urdu.current.style.opacity = String(clamp(1 - p * 4));
      if (hint.current) hint.current.style.opacity = String(clamp(1 - p * 8));
      if (second.current) {
        const k = clamp((p - 0.5) * 5);
        second.current.style.opacity = String(k);
        second.current.style.transform = `translateY(${(1 - k) * 30}px)`;
      }
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
      className="group/hero relative h-[235svh] max-md:h-[200svh]"
    >
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden bg-[radial-gradient(120%_90%_at_72%_48%,#f7f2e7_0%,#e9e0cc_52%,#d9cdb4_100%)] group-data-[layout=narrow]/hero:bg-[radial-gradient(130%_80%_at_50%_30%,#f7f2e7_0%,#e9e0cc_55%,#d9cdb4_100%)]">
        {/* shown until WebGL is ready, and kept if it never is */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready ? "opacity-0" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/hero-bark.webp"
            alt=""
            width={1024}
            height={1536}
            fetchPriority="high"
            className="ml-[min(38vw,520px)] aspect-[2.3/3.45] w-[min(30vh,42vw)] -rotate-2 object-cover drop-shadow-[18px_24px_22px_rgba(80,60,40,0.28)] [clip-path:polygon(0_1%,8%_0,22%_1.4%,40%_0.3%,58%_1.6%,76%_0.4%,100%_1%,99%_40%,100%_100%,0_100%,1%_60%)] group-data-[layout=narrow]/hero:-mt-[18vh] group-data-[layout=narrow]/hero:ml-0 group-data-[layout=narrow]/hero:w-[min(40vw,22vh)]"
          />
        </div>

        <div className="absolute inset-0">
          <BarkCanvas progress={progress} onReady={() => setReady(true)} />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[3]">
          <div
            ref={intro}
            className={`absolute inset-x-gutter top-[calc(var(--spacing-head)+clamp(28px,7vh,88px))] will-change-transform group-data-[layout=narrow]/hero:top-auto group-data-[layout=narrow]/hero:bottom-[clamp(28px,5vh,56px)]`}
          >
            <Label>Visual artist &amp; art educator · Lahore / Gilgit-Baltistan</Label>
            <h1
              className={`mt-[clamp(14px,2.4vh,28px)] max-w-[9ch] font-display text-[clamp(3.4rem,10.5vw,10.5rem)] font-[340] leading-[0.98] tracking-[-0.03em] group-data-[layout=narrow]/hero:max-w-none group-data-[layout=narrow]/hero:text-[clamp(2.8rem,13vw,5.2rem)]`}
            >
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
            <p
              className={`mt-[clamp(18px,3vh,36px)] max-w-[34ch] text-[clamp(1rem,1.35vw,1.2rem)] text-ink-2 group-data-[layout=narrow]/hero:mt-3 group-data-[layout=narrow]/hero:text-[0.98rem]`}
            >
              Calligraphy on paper birch. Landscape, cultural memory, and the visual language of power.
            </p>
            <div className={`pointer-events-auto mt-[clamp(22px,4vh,44px)] flex flex-wrap gap-3 group-data-[layout=narrow]/hero:mt-5`}>
              <Btn href="/works" solid>
                View the works
              </Btn>
              <Btn href="/contact">Commission a piece</Btn>
            </div>
          </div>

          <div ref={urdu} className={`absolute bottom-[clamp(70px,10vh,120px)] right-gutter text-right group-data-[layout=narrow]/hero:hidden`}>
            <p lang="ur" dir="rtl" className="font-urdu text-[clamp(1.4rem,2.4vw,2.1rem)] leading-[1.9] text-ink-2">
              {site.nameUrdu}
            </p>
          </div>

          <div
            ref={hint}
            className={`absolute bottom-[clamp(24px,4.5vh,44px)] left-gutter flex items-center gap-3.5 group-data-[layout=narrow]/hero:hidden`}
          >
            <i className="block h-[38px] w-px animate-drip bg-ink" />
            <Label>Scroll to unroll</Label>
          </div>

          <div
            ref={second}
            style={{ opacity: 0 }}
            className="absolute bottom-[clamp(36px,8vh,92px)] left-gutter max-w-[min(420px,calc(100%-var(--spacing-gutter)*2))] max-md:bottom-7"
          >
            <Label>Ongoing series</Label>
            <p className="m-0 mt-3 font-display text-[clamp(2rem,4.2vw,4rem)] font-[340] leading-[1] tracking-[-0.03em]">
              Echoes on <em className="font-light text-ink-2">Birch</em>
            </p>
            <p className="m-0 mt-3.5 max-w-[38ch] text-[0.98rem] text-ink-2">
              Bhojpatra bark, written on in Khat-e-Suls: landscape and cultural memory, one sheet at a time.
            </p>
            <div className="pointer-events-auto mt-6">
              <Btn href="/works">See the series</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
