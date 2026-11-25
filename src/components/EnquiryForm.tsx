"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { mediumOf } from "@/lib/content/helpers";
import type { Work } from "@/lib/content/types";
import { Label } from "./ui";

type Status = "idle" | "sending" | "sent" | "mailto" | "limited" | "error";

const field = "block border-b border-line-strong pb-2 pt-3.5 transition-colors focus-within:border-seal";
const input = "w-full bg-transparent py-1.5 text-[1.12rem] outline-none placeholder:text-ink-3/60";

export type EnquiryWork = Pick<Work, "no" | "title" | "size" | "medium">;

export default function EnquiryForm({ works, kinds, email }: { works: EnquiryWork[]; kinds: string[]; email: string }) {
  const params = useSearchParams();
  const prefill = params.get("work");
  const work = prefill ? works.find((w) => w.no === prefill) : undefined;
  const enquiryKinds = kinds.length ? kinds : ["Something else"];

  const [kind, setKind] = useState(work ? enquiryKinds[0] : (enquiryKinds[1] ?? enquiryKinds[0]));
  const [status, setStatus] = useState<Status>("idle");
  const [composed, setComposed] = useState("");

  const needsBudget = enquiryKinds.length > 1 && kind === enquiryKinds[1];
  const initialMessage = useMemo(
    () => (work ? `I would like to ask about no. ${work.no}, ${work.title} (${work.size}, ${mediumOf(work)}).\n\n` : ""),
    [work],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      kind,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      budget: String(fd.get("budget") || ""),
      work: work ? `No. ${work.no}, ${work.title}` : "",
      message: String(fd.get("message") || ""),
      company: String(fd.get("company") || ""), // honeypot
    };
    setStatus("sending");
    const text = [
      body.kind,
      body.work ? `Work: ${body.work}` : null,
      `From: ${body.name} <${body.email}>`,
      body.phone ? `Phone / WhatsApp: ${body.phone}` : null,
      body.budget ? `Budget: ${body.budget}` : null,
      "",
      body.message,
    ]
      .filter((l): l is string => l !== null)
      .join("\n");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (res.status === 400) {
        // the server explains what is missing; show the form again with that message
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setComposed(json?.error ?? "Please check the form and try again.");
        setStatus("error");
        return;
      }
      if (!res.ok) throw new Error("bad");
      const json = (await res.json()) as { mode: "sent" | "mailto" };
      if (json.mode === "sent") {
        setStatus("sent");
        return;
      }
    } catch {
      /* the message could not be saved: fall through to mail */
    }
    // The message could not be stored: open the visitor's mail app with the message ready, so nothing is lost.
    setComposed(text);
    setStatus("mailto");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`${body.kind} — ${body.name}`)}&body=${encodeURIComponent(text)}`;
  }

  if (status === "sent") {
    return (
      <div role="status" className="border-t border-line-strong py-10">
        <p className="m-0 font-display text-[2rem] leading-tight tracking-[-0.02em]">Thank you. Your message is on its way.</p>
        <p className="mt-3 text-ink-2">I will reply by email.</p>
      </div>
    );
  }

  if (status === "limited") {
    return (
      <div role="status" className="border-t border-line-strong py-10">
        <p className="m-0 font-display text-[2rem] leading-tight tracking-[-0.02em]">That is a lot of messages in a short time.</p>
        <p className="mt-3 max-w-[52ch] text-ink-2">
          Please try again in an hour, or write directly to{" "}
          <a className="underline decoration-seal underline-offset-4" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
      </div>
    );
  }

  if (status === "mailto") {
    return (
      <div role="status" className="border-t border-line-strong py-10">
        <p className="m-0 font-display text-[2rem] leading-tight tracking-[-0.02em]">Your mail app should open with the message ready.</p>
        <p className="mt-3 max-w-[52ch] text-ink-2">
          If nothing opened, copy the message below and send it to{" "}
          <a className="underline decoration-seal underline-offset-4" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
        <textarea readOnly value={composed} rows={8} className="mt-5 w-full resize-y border border-line-strong bg-transparent p-4 font-mono text-[0.82rem]" />
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(composed)}
          className="mt-3 border border-ink px-5 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
        >
          Copy message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {status === "error" && (
        <p role="alert" className="m-0 border-l-2 border-seal pl-3 text-[0.98rem] text-ink">
          {composed}
        </p>
      )}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-3 p-0">
          <Label>I’d like to</Label>
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {enquiryKinds.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className="border border-line-strong px-[1.1em] py-[0.6em] font-mono text-[0.72rem] uppercase tracking-[0.08em] transition-colors aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
            >
              {k}
            </button>
          ))}
        </div>
      </fieldset>

      {work && (
        <p className="m-0 border-l-2 border-seal pl-3 font-mono text-[0.74rem] uppercase tracking-[0.08em] text-ink-2">
          About no. {work.no} · {work.title} · {work.size} · {mediumOf(work)}
        </p>
      )}

      <div className="grid gap-x-8 sm:grid-cols-2">
        <label className={field}>
          <Label>Name</Label>
          <input name="name" required autoComplete="name" className={input} />
        </label>
        <label className={field}>
          <Label>Email</Label>
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className={field}>
          <Label>Phone / WhatsApp (optional)</Label>
          <input name="phone" type="tel" autoComplete="tel" className={input} />
        </label>
        {needsBudget && (
          <label className={field}>
            <Label>Budget (optional)</Label>
            <input name="budget" className={input} />
          </label>
        )}
      </div>

      <label className={field}>
        <Label>{needsBudget ? "Tell me about the piece — text or verse, size, colours, deadline" : "Message"}</Label>
        <textarea name="message" required minLength={5} rows={5} defaultValue={initialMessage} className={`${input} min-h-[130px] resize-y`} />
      </label>

      {/* honeypot: people never see it */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-3 border border-ink bg-ink px-6 py-[0.95em] font-mono text-[0.74rem] uppercase tracking-[0.1em] text-paper transition-colors hover:border-seal hover:bg-seal disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"} <span>→</span>
        </button>
        <Label>Replies come by email</Label>
      </div>
    </form>
  );
}
