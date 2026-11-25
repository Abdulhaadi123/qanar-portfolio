import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { next = "" } = await searchParams;
  return (
    <main className="grid min-h-svh place-items-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <p lang="ur" dir="rtl" className="m-0 text-center font-script text-[3.2rem] leading-none text-seal">
          قمر
        </p>
        <h1 className="m-0 mt-4 text-center font-display text-[2rem] font-[340] tracking-[-0.02em]">Studio admin</h1>
        <p className="m-0 mb-8 mt-2 text-center text-[0.95rem] text-ink-2">Sign in to change the pictures and words on the site.</p>
        <div className="border border-line-strong bg-paper-2/40 p-6">
          <LoginForm next={next} />
        </div>
        <p className="m-0 mt-6 text-center">
          <Link href="/" className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-3 underline decoration-line-strong underline-offset-4 hover:text-ink">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
