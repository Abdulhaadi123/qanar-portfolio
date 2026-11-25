"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { ActionState } from "@/lib/admin/result";
import { btnSolid, inputCls } from "./ui";

const Errors = createContext<Record<string, string>>({});
const Pending = createContext(false);

/** a text snapshot of everything the form would send, to tell whether anything changed since it was loaded or saved */
function snapshot(form: HTMLFormElement): string {
  const parts: string[] = [];
  new FormData(form).forEach((v, k) => {
    if (typeof v === "string" && !k.startsWith("$ACTION")) parts.push(`${k}=${v}`);
  });
  return parts.join("\u0001");
}

/**
 * A form wired to a server action. It sends the fields itself (not through the form's action attribute) so a failed save
 * never wipes what was typed: React 19 would otherwise reset the fields after every submit.
 * A bar stays at the bottom of the screen with the Save button, a note when there are unsaved changes, and the result of the last save.
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  extra,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  /** more buttons beside Save */
  extra?: ReactNode;
}) {
  const [state, run, pending] = useActionState(action, {} as ActionState);
  const form = useRef<HTMLFormElement>(null);
  const base = useRef("");
  const [dirty, setDirty] = useState(false);
  const [shown, setShown] = useState<ActionState>({});

  // what the form looked like when it was loaded: changes are measured from here
  useEffect(() => {
    const f = form.current;
    if (!f) return;
    const t = setTimeout(() => {
      base.current = snapshot(f);
    }, 400);
    const poll = setInterval(() => {
      if (document.hidden || !base.current) return;
      setDirty(snapshot(f) !== base.current);
    }, 500);
    return () => {
      clearTimeout(t);
      clearInterval(poll);
    };
  }, []);

  // a save has finished: show its result, and measure changes from the saved state
  useEffect(() => {
    if (!state.message) return;
    setShown(state);
    const f = form.current;
    if (state.ok && f) {
      base.current = snapshot(f);
      setDirty(false);
    }
    if (!state.ok && f) {
      const bad = f.querySelector<HTMLElement>('[aria-invalid="true"]');
      bad?.scrollIntoView({ block: "center", behavior: "smooth" });
      bad?.focus({ preventScroll: true });
    }
  }, [state]);

  // leaving the page with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // typing hides the result of the previous save
  useEffect(() => {
    if (dirty && shown.ok) setShown({});
  }, [dirty, shown.ok]);

  return (
    <Errors.Provider value={state.errors ?? {}}>
      <Pending.Provider value={pending}>
        <form
          ref={form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(() => run(fd));
          }}
          className="flex flex-col gap-6"
        >
          {children}
          <div className="sticky bottom-0 z-10 -mx-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-strong bg-paper/95 px-5 py-3.5 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            <button type="submit" disabled={pending} className={btnSolid}>
              {pending ? "Saving…" : submitLabel}
            </button>
            {extra}
            <span aria-live="polite" className="min-w-0 flex-1 text-[0.92rem]">
              {pending ? (
                <span className="text-ink-3">Saving…</span>
              ) : shown.message ? (
                <span className={shown.ok ? "text-[#1f4a2b]" : "text-seal"}>
                  {shown.ok ? "✓ " : "✕ "}
                  {shown.message}
                </span>
              ) : dirty ? (
                <span className="inline-flex items-center gap-2 text-ink-2">
                  <i className="inline-block size-2 rounded-full bg-seal" aria-hidden />
                  Unsaved changes
                </span>
              ) : null}
            </span>
          </div>
        </form>
      </Pending.Provider>
    </Errors.Provider>
  );
}

export const usePending = () => useContext(Pending);
export const useErrors = () => useContext(Errors);

/** label, hint and the error for one field */
export function Field({ label, name, hint, children, className = "" }: { label: string; name?: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  const errors = useContext(Errors);
  const error = name ? errors[name] : undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-[0.88rem] text-seal">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[0.86rem] text-ink-3">{hint}</span>
      ) : null}
    </div>
  );
}

function useInvalid(name: string) {
  return Boolean(useContext(Errors)[name]);
}

export function TextField({
  label,
  name,
  defaultValue = "",
  hint,
  type = "text",
  placeholder,
  required,
  maxLength,
  inputMode,
  autoComplete = "off",
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: ReactNode;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url";
  /** "current-password" / "new-password" let password managers do their job */
  autoComplete?: string;
  className?: string;
}) {
  const id = useId();
  const invalid = useInvalid(name);
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={invalid || undefined}
        autoComplete={autoComplete}
        className={inputCls}
      />
    </Field>
  );
}

export function TextArea({
  label,
  name,
  defaultValue = "",
  hint,
  rows = 4,
  maxLength,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: ReactNode;
  rows?: number;
  maxLength?: number;
  className?: string;
}) {
  const invalid = useInvalid(name);
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} maxLength={maxLength} aria-invalid={invalid || undefined} className={`${inputCls} resize-y`} />
    </Field>
  );
}

export function SelectField({
  label,
  name,
  defaultValue = "",
  options,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: ReactNode;
  className?: string;
}) {
  const invalid = useInvalid(name);
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <select name={name} defaultValue={defaultValue} aria-invalid={invalid || undefined} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckField({ label, name, defaultChecked = false, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-[#17120f]" />
      <span>
        <span className="block text-[1rem]">{label}</span>
        {hint ? <span className="block text-[0.86rem] text-ink-3">{hint}</span> : null}
      </span>
    </label>
  );
}
