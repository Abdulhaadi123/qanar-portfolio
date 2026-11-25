import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Label, Lines, R, Wrap, ulink } from "@/components/ui";
import { formatDate, postById } from "@/lib/content/helpers";
import { getContent } from "@/lib/content/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { posts } = await getContent();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = await getContent();
  const post = postById(posts, slug);
  if (!post) return {};
  return { title: post.title, description: post.dek, openGraph: { type: "article", title: post.title, description: post.dek } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { posts } = await getContent();
  const post = postById(posts, slug);
  if (!post) notFound();
  const i = posts.findIndex((p) => p.slug === slug);
  const next = posts[(i + 1) % posts.length];

  return (
    <article className="pb-[clamp(72px,10vw,150px)] pt-[calc(var(--spacing-head)+clamp(40px,7vw,110px))]">
      <Wrap>
        <Link href="/journal" className={`font-mono text-[0.74rem] uppercase tracking-[0.1em] ${ulink}`}>
          ← Journal
        </Link>
        <Label className="mt-10">
          {post.category} · {formatDate(post.date)} · {post.read}
        </Label>
        <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.6rem,7vw,6.4rem)] font-[340] leading-[1] tracking-[-0.03em]">
          <Lines lines={[post.title]} />
        </h1>
        <R delay={150}>
          <p className="mt-8 max-w-[44ch] font-display text-[clamp(1.2rem,2vw,1.7rem)] font-[320] leading-[1.35] text-ink-2">{post.dek}</p>
        </R>

        <div className="mt-[clamp(40px,6vw,80px)] grid grid-cols-1 gap-x-8 border-t border-line-strong pt-10 lg:grid-cols-12">
          <div className="max-w-[40rem] font-display text-[clamp(1.15rem,1.5vw,1.35rem)] font-[340] leading-[1.62] lg:col-span-7 lg:col-start-4">
            {post.body.map((b, k) => {
              if (b.h)
                return (
                  <R as="h2" key={k} className="mb-[0.6em] mt-[2em] text-[clamp(1.6rem,2.4vw,2.2rem)] font-[380] leading-tight tracking-[-0.02em]">
                    {b.h}
                  </R>
                );
              if (b.quote)
                return (
                  <R as="blockquote" key={k} className="my-[1.6em] ml-0 border-l-2 border-seal pl-5 text-[1.2em] italic text-ink-2">
                    {b.quote}
                  </R>
                );
              return (
                <R as="p" key={k} className="mb-[1.3em] mt-0">
                  {b.p}
                </R>
              );
            })}
          </div>
        </div>

        {next && next.slug !== post.slug && (
          <div className="mt-[clamp(56px,8vw,110px)] border-t border-line-strong pt-8">
            <Label>Next</Label>
            <Link
              href={`/journal/${next.slug}`}
              className="group/n mt-4 block max-w-[22ch] font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-[340] leading-[1.05] tracking-[-0.025em] transition-colors hover:text-seal"
            >
              {next.title} <span className="inline-block transition-transform duration-300 group-hover/n:translate-x-2">→</span>
            </Link>
          </div>
        )}
      </Wrap>
    </article>
  );
}
