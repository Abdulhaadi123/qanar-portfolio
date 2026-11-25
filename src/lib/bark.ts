/**
 * Textures for the 3D sheet in the hero.
 * The face is a photograph of one of his own birch-bark works (no. 02), cut to a torn outline;
 * the back is the tan inner side of the bark, drawn here.
 */
import { mulberry32 } from "./rng";

export const SHEET_W = 2.5;
export const SHEET_L = 3.34;

export interface SheetTextures {
  color: HTMLCanvasElement;
  bump: HTMLCanvasElement;
  back: HTMLCanvasElement;
}

export function sheetPath(w: number, h: number, seed: number) {
  const r = mulberry32(seed);
  const u = Math.max(w, h) / 1500;
  const p = new Path2D();
  const top: [number, number][] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const tear = r() > 0.86 ? 26 * u : 0;
    top.push([(i / n) * w, (10 + r() * 20) * u + tear]);
  }
  p.moveTo(0, top[0][1]);
  top.forEach(([x, y]) => p.lineTo(x, y));
  const m = 34;
  for (let j = 1; j <= m; j++) {
    p.lineTo(w - (3 + r() * 14) * u * (0.6 + 0.4 * Math.sin(j * 0.45)), (j / m) * h);
  }
  p.lineTo(w, h + 4);
  p.lineTo(0, h + 4);
  for (let j = m - 1; j >= 1; j--) {
    p.lineTo((3 + r() * 14) * u * (0.6 + 0.4 * Math.cos(j * 0.4)), (j / m) * h);
  }
  p.closePath();
  return p;
}

const mk = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

export function makeSheetTextures(img: HTMLImageElement, w: number, h: number): SheetTextures {
  const path = sheetPath(w, h, 19);

  /* ---- front: his photograph, torn at the edges ---- */
  const color = mk(w, h);
  const cctx = color.getContext("2d")!;
  cctx.drawImage(img, 0, 0, w, h);
  // a little darkening toward the edges, as light falls off on a real sheet
  const vg = cctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, "rgba(90,66,44,0)");
  vg.addColorStop(1, "rgba(90,66,44,0.12)");
  cctx.fillStyle = vg;
  cctx.fillRect(0, 0, w, h);
  cctx.save();
  cctx.globalCompositeOperation = "destination-in";
  cctx.fillStyle = "#000";
  cctx.fill(path);
  cctx.restore();

  /* ---- relief: the photograph's own light and dark, so the ink and the bark catch the light ---- */
  const bump = mk(w, h);
  const bctx = bump.getContext("2d")!;
  bctx.drawImage(img, 0, 0, w, h);
  const d = bctx.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) {
    const l = d.data[i] * 0.3 + d.data[i + 1] * 0.59 + d.data[i + 2] * 0.11;
    const g = Math.max(0, Math.min(255, (l - 128) * 1.5 + 128));
    d.data[i] = d.data[i + 1] = d.data[i + 2] = g;
    d.data[i + 3] = 255;
  }
  bctx.putImageData(d, 0, 0);

  /* ---- the tan inner side of the bark ---- */
  const back = mk(Math.round(w / 2), Math.round(h / 2));
  const k = back.getContext("2d")!;
  const bw = back.width;
  const bh = back.height;
  const bg = k.createLinearGradient(0, 0, bw, bh);
  bg.addColorStop(0, "#c39a70");
  bg.addColorStop(0.5, "#b0825a");
  bg.addColorStop(1, "#9a6e48");
  k.fillStyle = bg;
  k.fillRect(0, 0, bw, bh);
  const br = mulberry32(88);
  k.lineCap = "round";
  for (let i = 0; i < 5200; i++) {
    const x = br() * bw;
    const y = br() * bh;
    k.strokeStyle = br() > 0.5 ? `rgba(70,44,26,${0.05 + br() * 0.12})` : `rgba(235,205,170,${0.05 + br() * 0.1})`;
    k.lineWidth = 0.6 + br() * 1.3;
    k.beginPath();
    k.moveTo(x, y);
    k.lineTo(x + 10 + br() * 70, y + (br() - 0.5) * 2);
    k.stroke();
  }
  k.save();
  k.scale(0.5, 0.5);
  k.globalCompositeOperation = "destination-in";
  k.fillStyle = "#000";
  k.fill(path);
  k.restore();

  return { color, bump, back };
}
