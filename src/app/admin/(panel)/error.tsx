"use client";

import { useEffect } from "react";
import { btnLine, btnSolid } from "@/components/admin/ui";

/** If an admin page breaks, say so plainly and offer a way on, instead of a raw error screen. */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);
  return (
    <div role="alert" className="border border-seal bg-seal/5 p-6">
      <h1 className="m-0 font-display text-[1.8rem] font-[360] tracking-[-0.02em]">Something went wrong</h1>
      <p className="mt-3 max-w-[60ch] text-ink-2">
        This page could not be shown. Nothing you saved earlier is lost. Try again; if it keeps happening, check your internet connection or sign out and in again.
      </p>
      {error.digest ? <p className="m-0 mt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-3">Reference {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={btnSolid}>
          Try again
        </button>
        <a href="/admin" className={btnLine}>
          Back to the dashboard
        </a>
      </div>
    </div>
  );
}
