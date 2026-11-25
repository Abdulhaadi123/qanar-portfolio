/**
 * Picture handling that runs in the admin's browser: a big photograph from a phone or camera is shrunk to the few sizes the site needs
 * (as WebP), before anything is sent. That is what keeps the public pages fast: nobody downloads a 6 MB original.
 */

export const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024;

export async function loadBitmap(file: File): Promise<ImageBitmap> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not a picture.");
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error("That picture is larger than 30 MB. Please use a smaller one.");
  try {
    // 'from-image' turns a phone photo the right way up
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This browser cannot read that kind of picture. Use a JPG, PNG or WebP file.");
  }
}

const canvasOf = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

/** draws a region of the source into a new canvas of the given size, halving step by step for a clean result */
function drawRegion(src: ImageBitmap | HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, w: number, h: number): HTMLCanvasElement {
  let cur: ImageBitmap | HTMLCanvasElement = src;
  let cx = sx;
  let cy = sy;
  let cw = sw;
  let ch = sh;
  while (cw / 2 > w && ch / 2 > h) {
    const half = canvasOf(cw / 2, ch / 2);
    const g = half.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(cur, cx, cy, cw, ch, 0, 0, half.width, half.height);
    cur = half;
    cx = 0;
    cy = 0;
    cw = half.width;
    ch = half.height;
  }
  const out = canvasOf(w, h);
  const g = out.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(cur, cx, cy, cw, ch, 0, 0, out.width, out.height);
  return out;
}

type Drawable = ImageBitmap | HTMLCanvasElement;

/** the whole picture, shrunk so its longer side is at most `longSide` (never enlarged) */
export function fitLongSide(bmp: Drawable, longSide: number): HTMLCanvasElement {
  const k = Math.min(1, longSide / Math.max(bmp.width, bmp.height));
  return drawRegion(bmp, 0, 0, bmp.width, bmp.height, bmp.width * k, bmp.height * k);
}

/** a crop with the given proportions (width / height); fx and fy (0..1) choose which part of the picture is kept */
export function cropTo(bmp: ImageBitmap, aspect: number, outWidth: number, fx: number, fy: number): HTMLCanvasElement {
  const r = bmp.width / bmp.height;
  let sx = 0;
  let sy = 0;
  let sw = bmp.width;
  let sh = bmp.height;
  if (r > aspect) {
    sw = bmp.height * aspect;
    sx = (bmp.width - sw) * fx;
  } else {
    sh = bmp.width / aspect;
    sy = (bmp.height - sh) * fy;
  }
  const w = Math.min(outWidth, sw);
  return drawRegion(bmp, sx, sy, sw, sh, w, w / aspect);
}

export function toWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b && b.type === "image/webp") resolve(b);
        else reject(new Error("This browser cannot save WebP pictures. Please use a recent Chrome, Edge, Firefox or Safari."));
      },
      "image/webp",
      quality,
    );
  });
}

/** a 20-pixel copy as a data URL: shown blurred while the real picture loads ("" if the browser cannot make a WebP one) */
export function blurDataUrl(bmp: Drawable): string {
  const url = fitLongSide(bmp, 20).toDataURL("image/webp", 0.35);
  return url.startsWith("data:image/webp;base64,") ? url : "";
}

export const round4 = (n: number) => Math.round(n * 10000) / 10000;
