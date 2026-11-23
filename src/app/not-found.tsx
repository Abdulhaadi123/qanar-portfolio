import { Btn, Label, Wrap } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="grid min-h-[80svh] place-items-center pt-head">
      <Wrap>
        <Label>404</Label>
        <p lang="ur" dir="rtl" className="m-0 mt-4 font-script text-[clamp(5rem,16vw,12rem)] leading-none text-seal">
          گم
        </p>
        <h1 className="m-0 mt-4 font-display text-[clamp(2rem,5vw,4rem)] font-[340] tracking-[-0.03em]">This page has gone missing.</h1>
        <div className="mt-8">
          <Btn href="/" solid>
            Back to the studio
          </Btn>
        </div>
      </Wrap>
    </section>
  );
}
