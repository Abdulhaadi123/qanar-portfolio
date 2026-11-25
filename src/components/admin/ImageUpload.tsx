"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createUploadTargets, type UploadKind } from "@/app/admin/actions/media";
import { blurDataUrl, cropTo, fitLongSide, loadBitmap, round4, toWebp } from "@/lib/admin/imageTools";
import { MEDIA_BUCKET, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { useErrors } from "./Form";
import { btnLine, btnSmall } from "./ui";

/**
 * Choose a photograph, shrink it in the browser, send it straight to storage, and put its addresses in hidden fields
 * so the surrounding form saves them with everything else.
 *   work     three sizes (full 1600, medium 1000, small 480 px) + a tiny blurred placeholder + proportions
 *   hero     one picture cropped to the sheet's proportions
 *   portrait one picture cropped to 4:5 + a placeholder
 * `aspect` (width / height) switches on the crop step, with sliders to choose which part of the picture is kept.
 */
export default function ImageUpload({
  kind,
  initial,
  previewUrl,
  aspect,
  label,
  hint,
  required,
}: {
  kind: UploadKind;
  /** hidden field name -> its current value; posted unchanged when no new picture is chosen */
  initial: Record<string, string>;
  previewUrl: string;
  aspect?: number;
  label: string;
  hint?: ReactNode;
  required?: boolean;
}) {
  const errors = useErrors();
  // the server names a missing or unusable picture by its field: photo / ratio for a work
  const saveError = errors.photo ?? errors.photo_md ?? errors.photo_thumb ?? errors.ratio;
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [shown, setShown] = useState(previewUrl);
  const [fresh, setFresh] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [fx, setFx] = useState(0.5);
  const [fy, setFy] = useState(0.5);
  const [cropPreview, setCropPreview] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const bmpRef = useRef<ImageBitmap | null>(null);

  useEffect(() => {
    bmpRef.current = bmp;
    return () => bmp?.close();
  }, [bmp]);

  // the live preview of the crop
  useEffect(() => {
    if (!bmp || !aspect) return;
    setCropPreview(cropTo(bmp, aspect, 320, fx, fy).toDataURL("image/jpeg", 0.85));
  }, [bmp, aspect, fx, fy]);

  async function upload(source: ImageBitmap) {
    setError(null);
    try {
      setBusy("Preparing the picture…");
      const sizes: { name: string; blob: Blob }[] = [];
      let shownUrl = "";
      const extra: Record<string, string> = {};
      if (kind === "work") {
        const [full, md, thumb] = [fitLongSide(source, 1600), fitLongSide(source, 1000), fitLongSide(source, 480)];
        sizes.push({ name: "full", blob: await toWebp(full, 0.82) }, { name: "md", blob: await toWebp(md, 0.8) }, { name: "thumb", blob: await toWebp(thumb, 0.74) });
        shownUrl = thumb.toDataURL("image/jpeg", 0.8);
        extra.blur = blurDataUrl(source);
        extra.ratio = String(round4(source.width / source.height));
      } else {
        const crop = cropTo(source, aspect ?? source.width / source.height, kind === "hero" ? 1100 : 1000, fx, fy);
        sizes.push({ name: "image", blob: await toWebp(crop, 0.86) });
        shownUrl = crop.toDataURL("image/jpeg", 0.8);
        if (kind === "portrait") extra.portrait_blur = blurDataUrl(cropTo(source, aspect ?? 0.8, 40, fx, fy));
      }

      setBusy("Preparing the upload…");
      const prepared = await createUploadTargets(kind);
      if (!prepared.ok) throw new Error(prepared.message);

      const storage = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(MEDIA_BUCKET);
      const urls: Record<string, string> = {};
      let n = 0;
      for (const target of prepared.targets) {
        n += 1;
        setBusy(`Uploading ${n} of ${prepared.targets.length}…`);
        const blob = sizes.find((s) => s.name === target.name)?.blob;
        if (!blob) throw new Error("Something went wrong while preparing the picture.");
        const { error: upError } = await storage.uploadToSignedUrl(target.path, target.token, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (upError) throw new Error("The upload did not go through. Check your connection and try again.");
        urls[target.name] = target.url;
      }

      const next: Record<string, string> =
        kind === "work"
          ? { photo: urls.full, photo_md: urls.md, photo_thumb: urls.thumb, blur: extra.blur ?? "", ratio: extra.ratio }
          : kind === "hero"
            ? { hero_image: urls.image }
            : { portrait_image: urls.image, portrait_blur: extra.portrait_blur ?? "" };
      setValues((v) => ({ ...v, ...next }));
      setShown(shownUrl);
      setFresh(true);
      setBmp(null);
      if (input.current) input.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "The picture could not be uploaded.");
    } finally {
      setBusy(null);
    }
  }

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const b = await loadBitmap(file);
      setFx(0.5);
      setFy(0.5);
      if (aspect) setBmp(b);
      else {
        await upload(b);
        b.close();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "That picture could not be read.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-2">{label}</span>
      {Object.entries(values).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <div className="flex flex-wrap items-start gap-5">
        <div className="w-[150px] shrink-0 border border-line-strong bg-paper-2" style={aspect ? { aspectRatio: aspect } : { minHeight: 100 }}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full min-h-[100px] place-items-center text-[0.8rem] text-ink-3">No picture yet</span>
          )}
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col gap-3">
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy !== null}
            onChange={(e) => onPick(e.target.files?.[0])}
            aria-label={label}
            aria-invalid={saveError && !values.photo ? true : undefined}
            className="block w-full text-[0.9rem] file:mr-3 file:cursor-pointer file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-[0.7rem] file:uppercase file:tracking-[0.1em] hover:file:bg-ink hover:file:text-paper"
          />
          {hint ? <span className="text-[0.86rem] text-ink-3">{hint}</span> : null}
          {busy ? (
            <span role="status" className="text-[0.92rem] text-ink-2">
              {busy}
            </span>
          ) : null}
          {fresh && !busy ? (
            <span role="status" className="text-[0.92rem] text-[#1f4a2b]">
              New picture is ready. Press Save to publish it.
            </span>
          ) : null}
          {required && !values.photo && !values.hero_image && !values.portrait_image ? (
            <span className={`text-[0.86rem] ${saveError ? "text-seal" : "text-ink-3"}`}>{saveError ?? "A photograph is required."}</span>
          ) : null}
          {error ? (
            <span role="alert" className="text-[0.92rem] text-seal">
              {error}
            </span>
          ) : null}
        </div>
      </div>

      {bmp && aspect ? (
        <div className="flex flex-col gap-3 border border-line-strong bg-paper p-4">
          <p className="m-0 text-[0.92rem] text-ink-2">The picture is cut to the proportions of the place it is shown. Choose which part to keep.</p>
          <div className="flex flex-wrap items-start gap-5">
            {cropPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cropPreview} alt="How the picture will be cut" className="w-[200px] border border-line-strong" />
            ) : null}
            <div className="flex min-w-[200px] flex-1 flex-col gap-3">
              <label className="flex flex-col gap-1 text-[0.86rem] text-ink-2">
                Left ↔ right
                <input type="range" min={0} max={1} step={0.01} value={fx} onChange={(e) => setFx(Number(e.target.value))} disabled={bmp.width / bmp.height <= aspect} className="accent-[#17120f]" />
              </label>
              <label className="flex flex-col gap-1 text-[0.86rem] text-ink-2">
                Top ↕ bottom
                <input type="range" min={0} max={1} step={0.01} value={fy} onChange={(e) => setFy(Number(e.target.value))} disabled={bmp.width / bmp.height > aspect} className="accent-[#17120f]" />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => bmpRef.current && upload(bmpRef.current)} disabled={busy !== null} className={`${btnLine} ${btnSmall}`}>
                  Use this picture
                </button>
                <button type="button" onClick={() => setBmp(null)} disabled={busy !== null} className={`${btnLine} ${btnSmall}`}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
