"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { btnDanger, btnLine, btnSmall } from "./ui";

function Yes({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnDanger} ${btnSmall} bg-seal text-paper`}>
      {pending ? "Please wait…" : label}
    </button>
  );
}

/** A destructive button that needs a second click ("Sure?") before it sends anything. */
export default function ConfirmButton({
  action,
  label,
  confirmLabel = "Yes, delete",
  question = "Are you sure?",
  small,
}: {
  action: () => Promise<void>;
  label: string;
  confirmLabel?: string;
  question?: string;
  small?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className={`${btnDanger} ${small ? btnSmall : ""}`}>
        {label}
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <span role="alert" className="text-[0.92rem] text-seal">
        {question}
      </span>
      <Yes label={confirmLabel} />
      <button type="button" onClick={() => setArmed(false)} className={`${btnLine} ${btnSmall}`}>
        Cancel
      </button>
    </form>
  );
}

/** a small button that submits a server action straight away (move up / down, show / hide ...) */
export function ActionButton({
  action,
  children,
  label,
  className = "",
  disabled,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <form action={action} className="inline-flex">
      <Pressable label={label} className={className} disabled={disabled}>
        {children}
      </Pressable>
    </form>
  );
}

function Pressable({ children, label, className, disabled }: { children: React.ReactNode; label: string; className: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" aria-label={label} title={label} disabled={disabled || pending} className={className}>
      {children}
    </button>
  );
}
