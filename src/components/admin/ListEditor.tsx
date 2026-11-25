"use client";

import { useRef, useState } from "react";
import { useErrors } from "./Form";
import { btnLine, btnSmall, inputCls } from "./ui";

export interface ListField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "checkbox" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  /** takes the whole row instead of half of it */
  wide?: boolean;
}

type Item = Record<string, string | boolean> & { _k: string };

/**
 * An editable list: add, remove, move up / down. The list travels to the server as JSON in one hidden field.
 *  - `scalarKey`: the list is plain text (each item is one string); the hidden field is then a JSON array of strings
 *  - `errorPrefix`: how the server names errors of the items ("socials.0.href"); "" when the field itself is the array
 */
export default function ListEditor({
  name,
  initial,
  fields,
  newItem,
  addLabel = "Add",
  scalarKey,
  errorPrefix,
  empty = "Nothing yet.",
  max = 40,
}: {
  name: string;
  initial: Record<string, string | boolean>[];
  fields: ListField[];
  newItem: Record<string, string | boolean>;
  addLabel?: string;
  scalarKey?: string;
  errorPrefix?: string;
  empty?: string;
  max?: number;
}) {
  const counter = useRef(0);
  const mint = (row: Record<string, string | boolean>): Item => ({ ...row, _k: `k${counter.current++}` });
  const [items, setItems] = useState<Item[]>(() => initial.map(mint));
  const errors = useErrors();
  const prefix = errorPrefix ?? `${name}.`;

  const json = JSON.stringify(
    scalarKey ? items.map((i) => String(i[scalarKey] ?? "")) : items.map((i) => Object.fromEntries(Object.entries(i).filter(([k]) => k !== "_k"))),
  );
  const set = (k: string, key: string, value: string | boolean) => setItems((a) => a.map((i) => (i._k === k ? { ...i, [key]: value } : i)));
  const move = (index: number, dir: -1 | 1) =>
    setItems((a) => {
      const j = index + dir;
      if (j < 0 || j >= a.length) return a;
      const c = [...a];
      [c[index], c[j]] = [c[j], c[index]];
      return c;
    });
  const remove = (k: string) => setItems((a) => a.filter((i) => i._k !== k));

  const rowBtn = `${btnLine} ${btnSmall} !px-2.5`;

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={json} />
      {items.length === 0 ? <p className="m-0 border border-dashed border-line-strong px-4 py-5 text-center text-[0.95rem] text-ink-3">{empty}</p> : null}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((item, index) => (
          <li key={item._k} className="border border-line-strong bg-paper p-3.5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex gap-1.5">
                <button type="button" className={rowBtn} onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move item ${index + 1} up`}>
                  ↑
                </button>
                <button type="button" className={rowBtn} onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Move item ${index + 1} down`}>
                  ↓
                </button>
                <button type="button" className={`${rowBtn} !border-seal !text-seal hover:!bg-seal hover:!text-paper`} onClick={() => remove(item._k)} aria-label={`Remove item ${index + 1}`}>
                  Remove
                </button>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => {
                const err = errors[scalarKey ? `${prefix}${index}` : `${prefix}${index}.${f.key}`];
                const id = `${name}-${item._k}-${f.key}`;
                const wide = f.wide || f.type === "textarea" || fields.length === 1;
                return (
                  <div key={f.key} className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
                    {f.type === "checkbox" ? (
                      <label className="flex cursor-pointer items-center gap-3">
                        <input type="checkbox" checked={Boolean(item[f.key])} onChange={(e) => set(item._k, f.key, e.target.checked)} className="size-4 accent-[#17120f]" />
                        <span className="text-[0.98rem]">{f.label}</span>
                      </label>
                    ) : (
                      <>
                        <label htmlFor={id} className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.1em] text-ink-2">
                          {f.label}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            id={id}
                            rows={f.rows ?? 3}
                            value={String(item[f.key] ?? "")}
                            placeholder={f.placeholder}
                            onChange={(e) => set(item._k, f.key, e.target.value)}
                            aria-invalid={err ? true : undefined}
                            className={`${inputCls} resize-y`}
                          />
                        ) : f.type === "select" ? (
                          <select id={id} value={String(item[f.key] ?? "")} onChange={(e) => set(item._k, f.key, e.target.value)} className={inputCls}>
                            {(f.options ?? []).map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={id}
                            value={String(item[f.key] ?? "")}
                            placeholder={f.placeholder}
                            onChange={(e) => set(item._k, f.key, e.target.value)}
                            aria-invalid={err ? true : undefined}
                            autoComplete="off"
                            className={inputCls}
                          />
                        )}
                      </>
                    )}
                    {err ? (
                      <span role="alert" className="text-[0.86rem] text-seal">
                        {err}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <div>
        <button type="button" className={`${btnLine} ${btnSmall}`} onClick={() => setItems((a) => (a.length >= max ? a : [...a, mint(newItem)]))} disabled={items.length >= max}>
          + {addLabel}
        </button>
      </div>
    </div>
  );
}

/** a list of plain texts (paragraphs, lines of an address ...) */
export function StringListEditor({
  name,
  initial,
  addLabel,
  rows = 4,
  placeholder,
  multiline = true,
  empty,
  max,
}: {
  name: string;
  initial: string[];
  addLabel: string;
  rows?: number;
  placeholder?: string;
  multiline?: boolean;
  empty?: string;
  max?: number;
}) {
  return (
    <ListEditor
      name={name}
      scalarKey="v"
      initial={initial.map((v) => ({ v }))}
      newItem={{ v: "" }}
      addLabel={addLabel}
      empty={empty}
      max={max}
      fields={[{ key: "v", label: multiline ? "Text" : "Line", type: multiline ? "textarea" : "text", rows, placeholder }]}
    />
  );
}
