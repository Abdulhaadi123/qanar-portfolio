import { LinkBtn } from "@/components/admin/ui";

export default function PanelNotFound() {
  return (
    <div className="border border-line-strong bg-paper-2/40 p-8">
      <p className="m-0 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-3">404</p>
      <h1 className="m-0 mt-3 font-display text-[2rem] font-[340] tracking-[-0.02em]">That item is not here</h1>
      <p className="mt-3 max-w-[56ch] text-ink-2">It may have been deleted, or the link is wrong.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkBtn href="/admin" solid>
          Dashboard
        </LinkBtn>
        <LinkBtn href="/admin/works">All works</LinkBtn>
      </div>
    </div>
  );
}
