/**
 * Plates: illustrations drawn from what Qamar's own sites say about each work
 * (medium, size, his statement). They are NOT photographs of the works.
 * Marks are made with a simulated broad-nib reed pen, the tool of Khat-e-Suls, so
 * no letters or words are invented. The only text is a phrase from his statement.
 */
import { barkBase } from "./art";
import { mulberry32 } from "./rng";

export type PlateStyle = "birch" | "marker" | "watercolour" | "currency" | "embroidery";
type Pt = [number, number];
const TAU = Math.PI * 2;

/** a phrase from his artist statement, used as micro-text on the currency plate */
export const STATEMENT_PHRASE =
  "subvert constitutional texts and currency-based imagery to critique systemic structures, hierarchies, and the visual representation of power";

/* ---------------------------- pen engine ---------------------------- */

const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const m = 1 - t;
  return [
    m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0],
    m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1],
  ];
};

/** dense points along a chain of cubic Béziers (3n+1 control points) */
function chain(c: Pt[], per = 34): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i + 3 < c.length; i += 3) {
    for (let k = i > 0 ? 1 : 0; k <= per; k++) out.push(cubic(c[i], c[i + 1], c[i + 2], c[i + 3], k / per));
  }
  return out;
}

function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, rot = 0, n = 70): Pt[] {
  const out: Pt[] = [];
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return out;
}

interface PenOpts {
  nib: number;
  w: number;
  color?: string;
  alpha?: number;
  bleed?: number;
  entry?: number;
  exit?: number;
}

/** A broad-nib stroke: width follows the angle between the stroke and the nib, as with a reed pen. */
function pen(ctx: CanvasRenderingContext2D, pts: Pt[], o: PenOpts) {
  const { nib, w, color = "#17120f", alpha = 1, bleed = 0, entry = 0.1, exit = 0.24 } = o;
  const ca = Math.cos(nib);
  const sa = Math.sin(nib);
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (bleed) {
    ctx.shadowColor = color;
    ctx.shadowBlur = bleed;
  }
  const n = pts.length;
  let pa: Pt | null = null;
  let pb: Pt | null = null;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const press = Math.max(0.3, Math.sqrt(Math.min(1, t / entry, (1 - t) / exit)));
    const half = (w * press) / 2;
    const a: Pt = [pts[i][0] - ca * half, pts[i][1] - sa * half];
    const b: Pt = [pts[i][0] + ca * half, pts[i][1] + sa * half];
    if (bleed) ctx.shadowBlur = i % 4 === 0 ? bleed : 0; // a soft halo without blurring every sliver
    if (pa && pb) {
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(a[0], a[1]);
      ctx.closePath();
      ctx.fill();
    }
    pa = a;
    pb = b;
  }
  // a hairline keeps the stroke whole where it runs along the nib
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(0.7, w * 0.06);
  ctx.beginPath();
  const from = Math.floor(n * 0.08);
  const to = Math.floor(n * 0.86);
  for (let i = from; i < to; i++) {
    if (i === from) ctx.moveTo(pts[i][0], pts[i][1]);
    else ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.stroke();
  ctx.restore();
}

/** the rhombic dot of the proportioned script: one touch of the nib */
function dot(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, nib: number, color = "#17120f", alpha = 1) {
  const ca = Math.cos(nib);
  const sa = Math.sin(nib);
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x + ca * s, y + sa * s);
  ctx.lineTo(x - sa * s * 0.62, y + ca * s * 0.62);
  ctx.lineTo(x - ca * s, y - sa * s);
  ctx.lineTo(x + sa * s * 0.62, y - ca * s * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number, alpha: number) {
  const n = Math.min(14000, Math.floor((w * h) / 90));
  for (let i = 0; i < n; i++) {
    const v = rng() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${rng() * alpha})`;
    ctx.fillRect(rng() * w, rng() * h, 1.2, 1.2);
  }
}

/** cuts the canvas to a slightly torn outline (transparent outside) */
function tornEdge(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number, amp: number) {
  const u = Math.max(w, h) / 1000;
  const a = amp * u;
  const pts: Pt[] = [];
  const nx = 16;
  const ny = 22;
  for (let i = 0; i <= nx; i++) pts.push([(i / nx) * w, a * (0.2 + rng() * 1.6)]);
  for (let j = 1; j <= ny; j++) pts.push([w - a * (0.2 + rng() * 1.5), (j / ny) * h]);
  for (let i = nx - 1; i >= 0; i--) pts.push([(i / nx) * w, h - a * (0.2 + rng() * 1.6)]);
  for (let j = ny - 1; j >= 1; j--) pts.push([a * (0.2 + rng() * 1.5), (j / ny) * h]);
  const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  const m0 = mid(pts[pts.length - 1], pts[0]);
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < pts.length; i++) {
    const m = mid(pts[i], pts[(i + 1) % pts.length]);
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ---------------------------- the five plates ---------------------------- */

/** Echoes on Birch: pale bark, and reed-pen gestures: a long sweep, upright strokes, bowls, rhombic dots. */
function plateBirch(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const bg = mulberry32(seed);
  const r = mulberry32(seed + 1000);
  const m = Math.min(w, h);
  const u = Math.max(w, h) / 1000;
  barkBase(ctx, w, h, bg);

  const nib = -0.6 + (r() - 0.5) * 0.14;
  const W = m * (0.05 + r() * 0.018);
  const by = h * (0.5 + (r() - 0.5) * 0.14);
  ctx.globalCompositeOperation = "multiply";

  // upright strokes first, so the sweep crosses over them
  const nA = 2 + Math.floor(r() * 2);
  for (let k = 0; k < nA; k++) {
    const x = w * (0.18 + 0.64 * ((k + r() * 0.7) / nA));
    const top = h * (0.09 + r() * 0.14);
    const bot = by + (r() - 0.3) * h * 0.07;
    const lean = (r() - 0.5) * 0.06 * w;
    pen(
      ctx,
      chain([
        [x + w * 0.03, top + h * 0.014],
        [x + w * 0.006, top - h * 0.004],
        [x - lean * 0.2, top + h * 0.04],
        [x - lean * 0.35, top + h * 0.1],
        [x - lean * 0.6, top + (bot - top) * 0.42],
        [x - lean * 0.9, top + (bot - top) * 0.72],
        [x - lean, bot],
      ]),
      { nib, w: W * (0.85 + r() * 0.3), alpha: 0.94, bleed: W * 0.1, exit: 0.3 },
    );
  }

  // the long sweep, right to left, as in a kashida
  const x0 = w * 0.93;
  const x1 = w * (0.08 + r() * 0.08);
  pen(
    ctx,
    chain([
      [x0, by - h * 0.015],
      [w * 0.7, by - h * (0.05 + r() * 0.07)],
      [w * 0.42, by + h * (0.04 + r() * 0.07)],
      [x1, by + (r() - 0.5) * h * 0.06],
    ]),
    { nib, w: W * 1.2, alpha: 0.96, bleed: W * 0.16, entry: 0.06, exit: 0.3 },
  );

  // bowls below the line
  const nB = 1 + Math.floor(r() * 2);
  for (let k = 0; k < nB; k++) {
    const cx = w * (0.26 + 0.48 * r());
    const cy = by + h * (0.07 + 0.05 * r());
    pen(ctx, arc(cx, cy, w * (0.08 + 0.09 * r()), h * (0.05 + 0.06 * r()), -0.1 * Math.PI, (1.1 + r() * 0.15) * Math.PI, (r() - 0.5) * 0.3), {
      nib,
      w: W * 0.95,
      alpha: 0.92,
      bleed: W * 0.1,
      exit: 0.35,
    });
  }

  // the dot, the unit the whole script is measured in
  const nD = 3 + Math.floor(r() * 4);
  for (let k = 0; k < nD; k++) {
    dot(ctx, w * (0.15 + 0.7 * r()), h * (r() > 0.5 ? 0.08 + 0.12 * r() : 0.72 + 0.18 * r()), W * (0.32 + r() * 0.18), nib, "#17120f", 0.9);
  }

  // archival ink marker: fine lines and ticks
  ctx.strokeStyle = "rgba(23,18,15,0.6)";
  ctx.lineWidth = 1.5 * u;
  ctx.lineCap = "round";
  for (let k = 0; k < 3; k++) {
    const y = h * (0.7 + k * 0.07 + r() * 0.03);
    ctx.beginPath();
    ctx.moveTo(w * (0.08 + r() * 0.2), y);
    ctx.bezierCurveTo(w * 0.35, y + (r() - 0.5) * 22 * u, w * 0.6, y + (r() - 0.5) * 22 * u, w * (0.7 + r() * 0.22), y + (r() - 0.5) * 8 * u);
    ctx.stroke();
  }
  for (let k = 0; k < 30; k++) {
    const x = w * (0.1 + 0.8 * r());
    const y = h * (0.9 + 0.05 * r());
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 6 * u, y - (6 + r() * 12) * u);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  tornEdge(ctx, w, h, mulberry32(seed + 77), 7);
}

/** Marker on paper: rows of fine, asemic mark-making and one large gesture. */
function plateMarker(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const bg = mulberry32(seed);
  const r = mulberry32(seed + 1000);
  const m = Math.min(w, h);
  const u = Math.max(w, h) / 1000;
  ctx.fillStyle = "#f4f0e6";
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, bg, 0.05);
  ctx.globalCompositeOperation = "multiply";

  const rows = 15;
  for (let row = 0; row < rows; row++) {
    const y = h * (0.07 + (row / rows) * 0.58);
    const bold = row % 5 === 2;
    const sz = (bold ? 15 : 9) * u;
    const c: Pt[] = [[w * 0.92, y]];
    let x = w * 0.92;
    while (x > w * 0.1) {
      const step = sz * (1.1 + r() * 1.3);
      const a = sz * (0.7 + r() * 0.9);
      c.push([x - step * 0.3, y - a], [x - step * 0.7, y + a * 0.7], [x - step, y + (r() - 0.5) * sz * 0.5]);
      x -= step;
    }
    pen(ctx, chain(c, 6), { nib: -0.7, w: (bold ? 4.2 : 2.3) * u, alpha: bold ? 0.9 : 0.65, entry: 0.02, exit: 0.06 });
  }

  // the large gesture: an open circle drawn in one breath, and a rhombic dot
  const cx = w * (0.46 + r() * 0.1);
  const cy = h * (0.76 + r() * 0.04);
  pen(ctx, arc(cx, cy, m * 0.28, m * 0.2, -0.4, TAU - 0.25, (r() - 0.5) * 0.4, 90), {
    nib: -0.6,
    w: m * 0.055,
    alpha: 0.95,
    bleed: m * 0.01,
    entry: 0.05,
    exit: 0.4,
  });
  dot(ctx, cx + m * 0.02, cy - m * 0.02, m * 0.022, -0.6, "#17120f", 0.95);
  ctx.globalCompositeOperation = "source-over";
}

/** Watercolour on paper: layered washes of mountain ridges, a pale sun. */
function plateWatercolour(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const bg = mulberry32(seed);
  const u = Math.max(w, h) / 1000;
  ctx.fillStyle = "#f4f0e6";
  ctx.fillRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, "#c9d3da");
  sky.addColorStop(0.7, "#efe6d2");
  sky.addColorStop(1, "#f4f0e6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sx = w * 0.7;
  const sy = h * 0.3;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.14);
  sg.addColorStop(0, "rgba(232,190,110,0.85)");
  sg.addColorStop(1, "rgba(232,190,110,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(sx - w * 0.2, sy - w * 0.2, w * 0.4, w * 0.4);

  const layers = [
    { y: 0.5, amp: 0.13, col: "rgba(150,168,182,0.62)" },
    { y: 0.6, amp: 0.1, col: "rgba(112,134,150,0.66)" },
    { y: 0.7, amp: 0.08, col: "rgba(78,102,120,0.72)" },
    { y: 0.82, amp: 0.05, col: "rgba(44,66,82,0.78)" },
  ];
  layers.forEach((L, li) => {
    const n = 64;
    const ph = [bg() * TAU, bg() * TAU, bg() * TAU];
    const ys: number[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const v = Math.sin(t * 5 + ph[0]) * 0.5 + Math.sin(t * 11 + ph[1]) * 0.28 + Math.sin(t * 23 + ph[2]) * 0.14 + (bg() - 0.5) * 0.12;
      ys.push(h * (L.y - Math.abs(v) * L.amp));
    }
    ctx.save();
    ctx.shadowColor = L.col;
    ctx.shadowBlur = 14 * u;
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ys.forEach((y, i) => ctx.lineTo((i / n) * w, y));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ys.forEach((y, i) => (i ? ctx.lineTo((i / n) * w, y) : ctx.moveTo(0, y)));
    ctx.strokeStyle = "rgba(30,48,62,0.22)";
    ctx.lineWidth = 2.2 * u;
    ctx.stroke();
    if (li < 2) {
      // a soft wash of snow just under the ridge line, not a hard shape
      ctx.save();
      ctx.shadowColor = "rgba(250,248,242,0.5)";
      ctx.shadowBlur = 10 * u;
      ctx.strokeStyle = "rgba(250,248,242,0.38)";
      ctx.lineWidth = 7 * u;
      ctx.lineJoin = "round";
      ctx.beginPath();
      let pen = false;
      ys.forEach((y, i) => {
        const high = y < h * (L.y - L.amp * 0.45);
        if (high) {
          if (!pen) ctx.moveTo((i / n) * w, y + 6 * u);
          else ctx.lineTo((i / n) * w, y + 6 * u);
          pen = true;
        } else pen = false;
      });
      ctx.stroke();
      ctx.restore();
    }
  });
  grain(ctx, w, h, bg, 0.07);
}

function guilloche(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, r: number, d: number, turns: number, color: string, lw: number) {
  ctx.beginPath();
  const steps = 2800;
  const k = (R - r) / r;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * TAU * turns;
    const x = cx + (R - r) * Math.cos(t) + d * Math.cos(k * t);
    const y = cy + (R - r) * Math.sin(t) - d * Math.sin(k * t);
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** Constitution & currency: banknote guilloche and micro-text from his statement, struck through by one stroke. */
function plateCurrency(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const bg = mulberry32(seed);
  const r = mulberry32(seed + 1000);
  const u = Math.max(w, h) / 1000;
  const m = Math.min(w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#dfe6d3");
  g.addColorStop(1, "#cfd9c4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, bg, 0.06);

  const rosette = (cx: number, cy: number, R: number, hue: string) => {
    for (let k = 0; k < 4; k++) guilloche(ctx, cx, cy, R, R * (5 / 13), R * (0.55 + k * 0.1), 5, hue, 0.8 * u);
  };
  rosette(w * 0.3, h * 0.4, m * 0.36, "rgba(63,104,90,0.42)");
  rosette(w * 0.72, h * 0.66, m * 0.3, "rgba(120,86,62,0.34)");

  // micro-text: his own words, set small like the security text on a note
  ctx.font = `${8.5 * u}px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.fillStyle = "rgba(48,86,72,0.62)";
  ctx.textBaseline = "alphabetic";
  const line = (STATEMENT_PHRASE + " · ").repeat(6);
  const rowsAt = (y0: number, n: number) => {
    for (let i = 0; i < n; i++) ctx.fillText(line.slice((i * 7) % 40), -((i * 23) % 60) * u, y0 + i * 12 * u);
  };
  rowsAt(h * 0.045, 6);
  rowsAt(h * 0.9, 6);

  ctx.strokeStyle = "rgba(63,104,90,0.6)";
  ctx.lineWidth = 2 * u;
  ctx.strokeRect(w * 0.04, h * 0.03, w * 0.92, h * 0.94);
  ctx.lineWidth = 0.8 * u;
  ctx.strokeRect(w * 0.055, h * 0.045, w * 0.89, h * 0.91);

  // the struck-through gesture
  ctx.globalCompositeOperation = "multiply";
  const nib = -0.5 + (r() - 0.5) * 0.2;
  pen(ctx, chain([[w * 0.1, h * 0.7], [w * 0.36, h * 0.52], [w * 0.62, h * 0.6], [w * 0.9, h * 0.3]]), { nib, w: m * 0.07, alpha: 0.92, bleed: m * 0.01, exit: 0.3 });
  pen(ctx, chain([[w * 0.14, h * 0.28], [w * 0.4, h * 0.36], [w * 0.6, h * 0.2], [w * 0.88, h * 0.5]]), {
    nib,
    w: m * 0.028,
    color: "#b23a2b",
    alpha: 0.9,
    exit: 0.3,
  });
  ctx.globalCompositeOperation = "source-over";
}

function stitch(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, rng: () => number, u: number, step = 9, lw = 2.4) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw * u;
  ctx.lineCap = "round";
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (!len) continue;
    const ux = dx / len;
    const uy = dy / len;
    let p = carry;
    while (p < len) {
      const a = p;
      const b = Math.min(len, p + step * u * 0.72);
      const jx = -uy * (rng() - 0.5) * 1.4 * u;
      const jy = ux * (rng() - 0.5) * 1.4 * u;
      ctx.beginPath();
      ctx.moveTo(x0 + ux * a + jx, y0 + uy * a + jy);
      ctx.lineTo(x0 + ux * b + jx, y0 + uy * b + jy);
      ctx.stroke();
      p += step * u;
    }
    carry = p - len;
  }
}

/** Series 4, embroidery: stitched mountains, a sun and ibex horns on dark cloth, from his Series 4 statement. */
function plateEmbroidery(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const bg = mulberry32(seed);
  const th = mulberry32(seed + 1000);
  const u = Math.max(w, h) / 1000;
  const cloth = ctx.createLinearGradient(0, 0, 0, h);
  cloth.addColorStop(0, "#222a38");
  cloth.addColorStop(1, "#171c27");
  ctx.fillStyle = cloth;
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3 * u) {
    ctx.fillStyle = `rgba(255,255,255,${0.025 + bg() * 0.025})`;
    ctx.fillRect(0, y, w, 1 * u);
  }
  for (let x = 0; x < w; x += 3 * u) {
    ctx.fillStyle = `rgba(0,0,0,${0.08 + bg() * 0.06})`;
    ctx.fillRect(x, 0, 1 * u, h);
  }
  const palette = ["#e8d9b5", "#c8553d", "#d9a441", "#7aa7a1"];
  const sx = w * 0.7;
  const sy = h * 0.27;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU;
    const r0 = w * 0.07;
    const r1 = w * (0.1 + (i % 2) * 0.03);
    stitch(ctx, [[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], "#d9a441", th, u, 6, 2.6);
  }
  const ridges = [
    { y: 0.52, amp: 0.13, col: palette[3] },
    { y: 0.64, amp: 0.1, col: palette[0] },
    { y: 0.78, amp: 0.07, col: palette[1] },
  ];
  ridges.forEach((R, ri) => {
    const n = 48;
    const ph = [th() * TAU, th() * TAU, th() * TAU];
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const v = Math.abs(Math.sin(t * 5 + ph[0]) * 0.55 + Math.sin(t * 12 + ph[1]) * 0.3 + Math.sin(t * 27 + ph[2]) * 0.1);
      pts.push([t * w, h * (R.y - v * R.amp)]);
    }
    stitch(ctx, pts, R.col, th, u, 9, 2.8);
    for (let i = 0; i < n * 2; i++) {
      const idx = Math.min(n, Math.round((i / (n * 2)) * n));
      const [px, py] = pts[idx];
      const d = (14 + th() * 26) * u;
      ctx.strokeStyle = R.col;
      ctx.globalAlpha = 0.55 - ri * 0.08;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(px + (th() - 0.5) * 4 * u, py + 8 * u);
      ctx.lineTo(px + (th() - 0.5) * 4 * u, py + 8 * u + d);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  const horn = (cx: number, cy: number, s: number, flip: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const m = 1 - t;
      const x = 3 * m * m * t * 0.1 + 3 * m * t * t * 0.85 + t * t * t;
      const y = 3 * m * m * t * -0.75 + 3 * m * t * t * -1 + t * t * t * -0.25;
      pts.push([cx + flip * x * s, cy + y * s]);
    }
    stitch(ctx, pts, palette[0], th, u, 8, 3.2);
    for (let i = 6; i < 60; i += 5) {
      const [px, py] = pts[i];
      const [qx, qy] = pts[i + 1];
      const nx = -(qy - py);
      const ny = qx - px;
      const l = Math.hypot(nx, ny) || 1;
      ctx.strokeStyle = palette[2];
      ctx.lineWidth = 2.2 * u;
      ctx.beginPath();
      ctx.moveTo(px - (nx / l) * 9 * u, py - (ny / l) * 9 * u);
      ctx.lineTo(px + (nx / l) * 9 * u, py + (ny / l) * 9 * u);
      ctx.stroke();
    }
  };
  horn(w * 0.4, h * 0.34, w * 0.2, -1);
  horn(w * 0.4, h * 0.34, w * 0.2, 1);
  grain(ctx, w, h, bg, 0.05);
}

/* ---------------------------- entry points ---------------------------- */

export function paintPlate(canvas: HTMLCanvasElement, style: PlateStyle, seed: number, cssW: number, cssH: number, dpr = 1) {
  const w = Math.max(40, Math.round(cssW * dpr));
  const h = Math.max(40, Math.round(cssH * dpr));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  switch (style) {
    case "birch":
      plateBirch(ctx, w, h, seed);
      break;
    case "marker":
      plateMarker(ctx, w, h, seed);
      break;
    case "watercolour":
      plateWatercolour(ctx, w, h, seed);
      break;
    case "currency":
      plateCurrency(ctx, w, h, seed);
      break;
    case "embroidery":
      plateEmbroidery(ctx, w, h, seed);
      break;
  }
}

export async function plateFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.race([document.fonts.load('9px "JetBrains Mono Variable"', "subvert"), new Promise((r) => setTimeout(r, 1800))]);
  } catch {
    /* use the fallback face */
  }
}
