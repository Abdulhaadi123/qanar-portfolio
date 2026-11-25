"use client";

import { startTransition, useActionState, useState } from "react";
import { signIn } from "@/app/admin/actions/auth";
import type { ActionState } from "@/lib/admin/result";
import { Banner, btnSolid, inputCls } from "@/components/admin/ui";

export default function LoginForm({ next }: { next: string }) {
  const [state, run, pending] = useActionState(signIn, {} as ActionState);
  const [show, setShow] = useState(false);
  const label = "font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2";
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => run(fd));
      }}
      className="flex flex-col gap-5"
    >
      {state.message ? <Banner kind="error">{state.message}</Banner> : null}
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5">
        <span className={label}>Email</span>
        <input name="email" type="email" autoComplete="username" required autoFocus aria-invalid={state.errors?.email ? true : undefined} className={inputCls} />
        {state.errors?.email ? <span className="text-[0.86rem] text-seal">{state.errors.email}</span> : null}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={label}>Password</span>
        <span className="flex">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={state.errors?.password ? true : undefined}
            className={`${inputCls} border-r-0`}
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} className="border border-line-strong px-3 font-mono text-[0.66rem] uppercase tracking-[0.1em] hover:bg-ink hover:text-paper">
            {show ? "Hide" : "Show"}
          </button>
        </span>
        {state.errors?.password ? <span className="text-[0.86rem] text-seal">{state.errors.password}</span> : null}
      </label>
      <button type="submit" disabled={pending} className={btnSolid}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
