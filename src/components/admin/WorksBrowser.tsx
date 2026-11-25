"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActionButton } from "./ConfirmButton";
import { Badge, btnLine, btnSmall, inputCls } from "./ui";

export interface BrowserSeries {
  id: string;
  title: string;
  kind: string;
}
export interface BrowserWork {
  id: string;
  no: string;
  title: string;
  series_id: string;
  size_text: string;
  medium: string;
  photo_thumb: string;
  ratio: number;
  visible: boolean;
  featured: boolean;
  availability: string;
  /** server actions, already bound to this work */
  moveUp: () => Promise<void>;
  moveDown: () => Promise<void>;
  toggle: () => Promise<void>;
}

const small = `${btnLine} ${btnSmall} !px-2.5`;
/** the shared input style without its full-width rule, so the toolbar can size each control itself */
const compact = inputCls.replace("w-full ", "");

function Badges({ w }: { w: BrowserWork }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {!w.visible ? <Badge tone="warn">Hidden</Badge> : null}
      {w.featured ? <Badge tone="ink">On home page</Badge> : null}
      {w.availability === "sold" ? <Badge>Sold</Badge> : null}
      {w.availability === "not_available" ? <Badge>Not available</Badge> : null}
    </span>
  );
}

/** The works, grouped by series, as a grid of pictures or a list, with search. */
export default function WorksBrowser({ series, works }: { series: BrowserSeries[]; works: BrowserWork[] }) {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const v = localStorage.getItem("admin-works-view");
      if (v === "grid" || v === "list") setView(v);
    } catch {
      /* private window: the default is fine */
    }
  }, []);
  const choose = (v: "grid" | "list") => {
    setView(v);
    try {
      localStorage.setItem("admin-works-view", v);
    } catch {
      /* ignore */
    }
  };

  const needle = q.trim().toLowerCase();
  const filtering = needle !== "" || only !== "";
  const matches = (w: BrowserWork) =>
    (only === "" || w.series_id === only) && (needle === "" || `${w.no} ${w.title} ${w.medium} ${w.size_text}`.toLowerCase().includes(needle));
  const shown = useMemo(() => works.filter(matches), [works, needle, only]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, number, medium…"
          aria-label="Search works"
          className={`${compact} min-w-[200px] max-w-[360px] flex-1`}
        />
        <select value={only} onChange={(e) => setOnly(e.target.value)} aria-label="Show one series" className={`${compact} w-auto max-w-[240px]`}>
          <option value="">All series</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">
          {shown.length} of {works.length}
        </span>
        <span role="group" aria-label="View" className="ml-auto flex">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => choose(v)}
              className="border border-ink px-3.5 py-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-colors first:border-r-0 aria-pressed:bg-ink aria-pressed:text-paper"
            >
              {v}
            </button>
          ))}
        </span>
      </div>

      {shown.length === 0 ? <p className="m-0 border border-dashed border-line-strong px-5 py-10 text-center text-ink-3">No work matches “{q}”.</p> : null}

      {series.map((s) => {
        const all = works.filter((w) => w.series_id === s.id);
        const list = shown.filter((w) => w.series_id === s.id);
        if (filtering && list.length === 0) return null;
        return (
          <section key={s.id} className="mb-12">
            <h2 className="m-0 mb-4 flex flex-wrap items-baseline gap-x-3 font-display text-[1.45rem] font-[380] tracking-[-0.015em]">
              {s.title}
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">
                {s.kind} · {all.length}
              </span>
              <Link href={`/admin/works/new?series=${s.id}`} className="ml-auto font-mono text-[0.68rem] uppercase tracking-[0.1em] underline decoration-line-strong underline-offset-4 hover:text-seal">
                + Add to this series
              </Link>
            </h2>

            {all.length === 0 ? (
              <p className="m-0 border border-dashed border-line-strong px-5 py-8 text-center text-ink-3">No works in this series yet.</p>
            ) : view === "grid" ? (
              <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-7 p-0 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((w) => {
                  const i = all.findIndex((x) => x.id === w.id);
                  return (
                    <li key={w.id} className="group flex flex-col">
                      <Link href={`/admin/works/${w.id}`} className="relative block aspect-[4/5] overflow-hidden border border-line bg-paper-2" aria-label={`Edit ${w.title}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={w.photo_thumb}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className={`absolute inset-0 size-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03] ${w.visible ? "" : "opacity-40"}`}
                        />
                        <span className="absolute left-0 top-0 bg-paper/90 px-2 py-1 font-mono text-[0.66rem] tracking-[0.06em]">{w.no}</span>
                      </Link>
                      <div className="mt-2.5 min-w-0">
                        <Link href={`/admin/works/${w.id}`} className="block truncate font-display text-[1.05rem] hover:text-seal">
                          {w.title}
                        </Link>
                        <span className="block truncate text-[0.82rem] text-ink-3">{w.size_text || "Size not listed"}</span>
                        <div className="mt-1.5 min-h-[22px]">
                          <Badges w={w} />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <ActionButton action={w.moveUp} label={`Move ${w.title} up`} className={small} disabled={filtering || i === 0}>
                          ↑
                        </ActionButton>
                        <ActionButton action={w.moveDown} label={`Move ${w.title} down`} className={small} disabled={filtering || i === all.length - 1}>
                          ↓
                        </ActionButton>
                        <ActionButton action={w.toggle} label={w.visible ? `Hide ${w.title}` : `Show ${w.title}`} className={small}>
                          {w.visible ? "Hide" : "Show"}
                        </ActionButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="m-0 flex list-none flex-col border-t border-line-strong p-0">
                {list.map((w) => {
                  const i = all.findIndex((x) => x.id === w.id);
                  return (
                    <li key={w.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line py-3">
                      <Link href={`/admin/works/${w.id}`} className="flex min-w-0 flex-1 basis-[260px] items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.photo_thumb} alt="" loading="lazy" className={`h-16 w-14 shrink-0 border border-line bg-paper-2 object-contain ${w.visible ? "" : "opacity-40"}`} />
                        <span className="min-w-0">
                          <span className="block truncate font-display text-[1.1rem] hover:text-seal">
                            <span className="mr-2 font-mono text-[0.78rem] text-ink-3">{w.no}</span>
                            {w.title}
                          </span>
                          <span className="block truncate text-[0.86rem] text-ink-3">{[w.size_text || "Size not listed", w.medium].filter(Boolean).join(" · ")}</span>
                        </span>
                      </Link>
                      <Badges w={w} />
                      <span className="flex items-center gap-1.5">
                        <ActionButton action={w.moveUp} label={`Move ${w.title} up`} className={small} disabled={filtering || i === 0}>
                          ↑
                        </ActionButton>
                        <ActionButton action={w.moveDown} label={`Move ${w.title} down`} className={small} disabled={filtering || i === all.length - 1}>
                          ↓
                        </ActionButton>
                        <ActionButton action={w.toggle} label={w.visible ? `Hide ${w.title}` : `Show ${w.title}`} className={small}>
                          {w.visible ? "Hide" : "Show"}
                        </ActionButton>
                        <Link href={`/admin/works/${w.id}`} className={small}>
                          Edit
                        </Link>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
      {filtering ? <p className="m-0 text-[0.86rem] text-ink-3">The order arrows are off while you search or filter.</p> : null}
    </>
  );
}
