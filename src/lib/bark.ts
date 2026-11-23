/**
 * Textures for the 3D birch-bark sheet in the hero.
 * Everything is drawn at run time: bark, the ink, the red seal.
 */
import { mulberry32, clamp } from "./rng";
import { barkBase, inkWord, makeSealCanvas } from "./art";

export const SHEET_W = 2.3;
export const SHEET_L = 3.45;

export interface BarkTextures {
  /** what the 3D material reads; redrawn while the ink is "written" */
  color: HTMLCanvasElement;
  base: HTMLCanvasElement;
  ink: HTMLCanvasElement;
  bump: HTMLCanvasElement;
  back: HTMLCanvasElement;
  seal: HTMLCanvasElement;
  sealAt: { x: number; y: number };
}

function sheetPath(w: number, h: number, seed: number) {
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

export function makeBarkTextures(w: number, h: number): BarkTextures {
  const mk = (cw: number, ch: number) => {
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    return c;
  };
  const u = Math.max(w, h) / 1500;

  /* ---- bark, front face ---- */
  const base = mk(w, h);
  const bctx = base.getContext("2d")!;
  const bump = mk(w, h);
  const kctx = bump.getContext("2d")!;
  barkBase(bctx, w, h, mulberry32(7), kctx);
  const path = sheetPath(w, h, 19);
  bctx.save();
  bctx.globalCompositeOperation = "destination-in";
  bctx.fillStyle = "#000"; // barkBase leaves a gradient as the fill style; the mask must be opaque
  bctx.fill(path);
  bctx.restore();

  /* ---- ink, drawn once, revealed later ---- */
  const ink = mk(w, h);
  const ictx = ink.getContext("2d")!;
  const r = mulberry32(31);
  ictx.globalCompositeOperation = "source-over";
  // The only words on the sheet are the artist's own name.
  // quiet rows of it near the top, like a hand warming up
  for (let row = 0; row < 3; row++) {
    const y = h * (0.085 + row * 0.03);
    let x = w * 0.9;
    const size = 38 * u;
    while (x > w * 0.16) {
      const fw = size * (2.3 + r() * 0.5);
      inkWord(ictx, "قمر عباس", x - fw / 2, y, fw, (r() - 0.5) * 0.03, { weight: 400, alpha: 0.45 + r() * 0.3 });
      x -= fw * 1.18;
    }
  }
  // the large mark
  inkWord(ictx, "قمر", w * 0.5, h * 0.27, w * 0.66, -0.05, { alpha: 0.97 });
  inkWord(ictx, "عباس", w * 0.42, h * 0.425, w * 0.46, 0.03, { alpha: 0.9 });
  // lower half, revealed as the sheet unrolls
  inkWord(ictx, "قمر عباس", w * 0.5, h * 0.9, w * 0.38, 0, { alpha: 0.78, weight: 400 });
  ictx.strokeStyle = "rgba(24,18,15,0.6)";
  ictx.lineWidth = 2 * u;
  for (let i = 0; i < 3; i++) {
    const y = h * (0.6 + i * 0.1);
    ictx.beginPath();
    ictx.moveTo(w * (0.1 + r() * 0.2), y);
    ictx.bezierCurveTo(w * 0.4, y + (r() - 0.5) * 36 * u, w * 0.6, y + (r() - 0.5) * 36 * u, w * (0.72 + r() * 0.2), y + (r() - 0.5) * 14 * u);
    ictx.stroke();
  }
  ictx.fillStyle = "rgba(24,18,15,0.75)";
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 1.6) * w * 0.42;
    ictx.beginPath();
    ictx.arc(w * 0.5 + Math.cos(a) * d, h * 0.3 + Math.sin(a) * d * 0.7, (0.7 + r() * 2.4) * u, 0, Math.PI * 2);
    ictx.fill();
  }

  /* ---- seal ---- */
  const sealSize = w * 0.15;
  const seal = makeSealCanvas(sealSize, mulberry32(5));
  const sealAt = { x: w * 0.7, y: h * 0.46 };

  /* ---- the tan inner side of the bark ---- */
  const back = mk(Math.round(w / 2), Math.round(h / 2));
  const cctx = back.getContext("2d")!;
  const bw = back.width;
  const bh = back.height;
  const bg = cctx.createLinearGradient(0, 0, bw, bh);
  bg.addColorStop(0, "#c39a70");
  bg.addColorStop(0.5, "#b0825a");
  bg.addColorStop(1, "#9a6e48");
  cctx.fillStyle = bg;
  cctx.fillRect(0, 0, bw, bh);
  const br = mulberry32(88);
  cctx.lineCap = "round";
  for (let i = 0; i < 5200; i++) {
    const x = br() * bw;
    const y = br() * bh;
    cctx.strokeStyle = br() > 0.5 ? `rgba(70,44,26,${0.05 + br() * 0.12})` : `rgba(235,205,170,${0.05 + br() * 0.1})`;
    cctx.lineWidth = 0.6 + br() * 1.3;
    cctx.beginPath();
    cctx.moveTo(x, y);
    cctx.lineTo(x + 10 + br() * 70, y + (br() - 0.5) * 2);
    cctx.stroke();
  }
  cctx.save();
  cctx.scale(0.5, 0.5);
  cctx.globalCompositeOperation = "destination-in";
  cctx.fillStyle = "#000";
  cctx.fill(path);
  cctx.restore();

  /* ---- the live texture ---- */
  const color = mk(w, h);
  color.getContext("2d")!.drawImage(base, 0, 0);

  return { color, base, ink, bump, back, seal, sealAt };
}

/** Returns a function that redraws `color` with the ink written up to `inkP` (0–1). */
export function createComposer(t: BarkTextures) {
  const w = t.base.width;
  const h = t.base.height;
  const ctx = t.color.getContext("2d")!;
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext("2d")!;

  return (inkP: number, sealP: number) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(t.base, 0, 0);

    if (inkP > 0) {
      tctx.globalCompositeOperation = "source-over";
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(t.ink, 0, 0);
      if (inkP < 1) {
        // a soft edge that sweeps from the top-right (where Urdu begins) down and to the left
        const soft = 0.2;
        const q = inkP * (1 + soft) - soft;
        const a = clamp(q, 0, 1);
        const b = clamp(q + soft, 0, 1);
        const g = tctx.createLinearGradient(w, 0, w * 0.05, h * 0.78);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(a, "rgba(0,0,0,1)");
        g.addColorStop(Math.min(1, Math.max(b, a + 0.0001)), "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        tctx.globalCompositeOperation = "destination-in";
        tctx.fillStyle = g;
        tctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(tmp, 0, 0);
    }

    if (sealP > 0) {
      const s = t.seal.width;
      const k = 1 + (1 - sealP) * 0.28; // lands slightly large, settles
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = clamp(sealP * 1.4) * 0.94;
      ctx.save();
      ctx.translate(t.sealAt.x + s / 2, t.sealAt.y + s / 2);
      ctx.rotate(-0.05);
      ctx.scale(k, k);
      ctx.drawImage(t.seal, -s / 2, -s / 2);
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  };
}
