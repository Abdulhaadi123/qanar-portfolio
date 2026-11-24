/**
 * Canvas drawing for the 3D hero sheet: birch bark, ink and the red seal.
 * The sheet is a drawn object that evokes his surface; it is not one of his works,
 * and the only writing on it is his own name.
 */

export const SCRIPT_FONT = '"Aref Ruqaa", "Amiri", "Noto Nastaliq Urdu", serif';
const TAU = Math.PI * 2;

/** Paper-birch bark: pale, fibrous, with the dark horizontal lenticels. */
export function barkBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rng: () => number,
  bump?: CanvasRenderingContext2D | null,
) {
  const u = Math.max(w, h) / 1000;
  const g = ctx.createLinearGradient(0, 0, w * 0.8, h);
  g.addColorStop(0, "#f2eadb");
  g.addColorStop(0.55, "#e7dbc4");
  g.addColorStop(1, "#d6c7aa");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (bump) {
    bump.fillStyle = "#8c8c8c";
    bump.fillRect(0, 0, w, h);
  }

  // tonal blotches
  for (let i = 0; i < 22; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = (0.12 + rng() * 0.4) * Math.max(w, h);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    const warm = rng() > 0.55;
    rg.addColorStop(0, warm ? "rgba(196,150,108,0.14)" : "rgba(255,252,244,0.18)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // fibres
  const nF = Math.min(8000, Math.floor((w * h) / 800));
  ctx.lineCap = "round";
  for (let i = 0; i < nF; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (18 + rng() * 120) * u;
    const dark = rng() > 0.5;
    ctx.strokeStyle = dark ? `rgba(110,84,60,${0.035 + rng() * 0.08})` : `rgba(255,255,250,${0.07 + rng() * 0.12})`;
    ctx.lineWidth = (0.5 + rng() * 1.1) * u;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rng() - 0.5) * 3 * u);
    ctx.stroke();
  }

  // lifted layer edges
  for (let i = 0; i < 7; i++) {
    const y0 = rng() * h;
    const ph = rng() * TAU;
    const amp = (2 + rng() * 5) * u;
    const len = (0.4 + rng() * 0.6) * w;
    const x0 = rng() * (w - len);
    const trace = (dy: number) => {
      ctx.beginPath();
      for (let x = 0; x <= len; x += 8 * u) {
        const y = y0 + dy + Math.sin(x / (60 * u) + ph) * amp + Math.sin(x / (17 * u) + ph * 2) * amp * 0.35;
        if (x === 0) ctx.moveTo(x0 + x, y);
        else ctx.lineTo(x0 + x, y);
      }
    };
    trace(0);
    ctx.strokeStyle = "rgba(92,70,50,0.24)";
    ctx.lineWidth = 1.6 * u;
    ctx.stroke();
    trace(2.4 * u);
    ctx.strokeStyle = "rgba(255,255,250,0.55)";
    ctx.lineWidth = 1.8 * u;
    ctx.stroke();
  }

  // lenticels
  const bands = 11;
  for (let b = 0; b < bands; b++) {
    const by = ((b + 0.2 + rng() * 0.6) / bands) * h;
    const n = 8 + Math.floor(rng() * 15);
    for (let i = 0; i < n; i++) {
      const x = rng() * w;
      const y = by + (rng() - 0.5) * 0.05 * h;
      const len = (10 + rng() * 58) * u;
      const th = (2 + rng() * 4.6) * u;
      const rot = (rng() - 0.5) * 0.06;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = "rgba(150,112,82,0.20)";
      ctx.beginPath();
      ctx.ellipse(0, 0, len * 0.62, th * 1.7, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(52,40,32,${0.5 + rng() * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, len * 0.5, th * 0.55, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      if (bump) {
        bump.save();
        bump.translate(x, y);
        bump.rotate(rot);
        bump.fillStyle = "#3c3c3c";
        bump.beginPath();
        bump.ellipse(0, 0, len * 0.55, th * 0.8, 0, 0, TAU);
        bump.fill();
        bump.restore();
      }
    }
  }

  // edges a little darker
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.78);
  vg.addColorStop(0, "rgba(110,84,60,0)");
  vg.addColorStop(1, "rgba(110,84,60,0.26)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

/** One piece of script, sized to a target width, with a little ink bleed. */
export function inkWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  cx: number,
  cy: number,
  targetW: number,
  angle = 0,
  opts: { color?: string; alpha?: number; weight?: 400 | 700 } = {},
) {
  const { color = "#18120f", alpha = 1, weight = 700 } = opts;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${weight} 200px ${SCRIPT_FONT}`;
  const m = ctx.measureText(word).width || 200;
  const fs = (200 * targetW) / m;
  ctx.font = `${weight} ${fs}px ${SCRIPT_FONT}`;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(24,18,15,0.5)";
  ctx.shadowBlur = fs * 0.02;
  ctx.fillText(word, 0, 0);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillText(word, fs * 0.006, fs * 0.004);
  ctx.restore();
  return fs;
}

/** A red seal (chop) with the artist's name knocked out of it. */
export function makeSealCanvas(size: number, rng: () => number) {
  const s = Math.max(24, Math.round(size));
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const k = c.getContext("2d")!;
  const r = s * 0.1;
  k.fillStyle = "#b23a2b";
  k.beginPath();
  k.roundRect(s * 0.04, s * 0.04, s * 0.92, s * 0.92, r);
  k.fill();
  k.globalCompositeOperation = "destination-out";
  k.lineWidth = s * 0.045;
  k.beginPath();
  k.roundRect(s * 0.14, s * 0.14, s * 0.72, s * 0.72, r * 0.6);
  k.stroke();
  k.direction = "rtl";
  k.textAlign = "center";
  k.textBaseline = "middle";
  k.font = `700 ${s * 0.4}px ${SCRIPT_FONT}`;
  k.fillText("قمر", s / 2, s * 0.36);
  k.fillText("عباس", s / 2, s * 0.67);
  for (let i = 0; i < 90; i++) {
    k.beginPath();
    k.arc(rng() * s, rng() * s, rng() * s * 0.012 + 0.4, 0, TAU);
    k.fill();
  }
  return c;
}

/** Resolves once the script fonts are ready so the canvas never draws in a fallback face. */
export async function scriptFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('700 120px "Aref Ruqaa"', "قمر عباس"),
        document.fonts.load('400 120px "Aref Ruqaa"', "قمر عباس"),
      ]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* fall back to whatever is installed */
  }
}
