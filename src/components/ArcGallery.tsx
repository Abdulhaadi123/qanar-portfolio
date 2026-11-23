"use client";

/**
 * A curved wall of his works in WebGL: the photographs hang on an arc around a vertical axis.
 *  - drag (mouse or touch) to turn it, it settles on the nearest work
 *  - scrolling the page turns it a little as the section passes
 *  - click the centre work to open it, click a side work to bring it forward
 * The pictures are his own photographs; nothing is drawn or invented here.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Work } from "@/data/works";
import { clamp } from "@/lib/rng";

export interface ArcHandle {
  go: (delta: number) => void;
}

interface Props {
  items: Work[];
  handle: { current: ArcHandle | null };
  onActive?: (i: number) => void;
  onOpen?: (i: number) => void;
  onReady?: () => void;
  onFail?: () => void;
}

const TAU = Math.PI * 2;
const H = 2.3; // height of every work, world units
const GAP = 0.6; // space between works along the arc
const DIST = 4.7; // distance from the camera to the front of the arc

const wrap = (a: number) => {
  let x = a % TAU;
  if (x > Math.PI) x -= TAU;
  if (x < -Math.PI) x += TAU;
  return x;
};
const nearestTo = (angle: number, ref: number) => ref + wrap(angle - ref);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** a soft rectangle used as the shadow behind each work */
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  // soft edge without ctx.filter (Safari): draw the box off-canvas and keep only its blurred shadow
  x.shadowColor = "#000";
  x.shadowBlur = 16;
  x.shadowOffsetX = 300;
  x.fillStyle = "#000";
  x.fillRect(28 - 300, 28, 72, 72);
  return new THREE.CanvasTexture(c);
}

export default function ArcGallery({ items, handle, onActive, onOpen, onReady, onFail }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef({ onActive, onOpen, onReady, onFail });
  cb.current = { onActive, onOpen, onReady, onFail };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      cb.current.onFail?.();
      return;
    }
    if (!renderer.getContext()) {
      cb.current.onFail?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;opacity:0;transition:opacity .8s ease;touch-action:pan-y;cursor:grab";
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 0, 0);

    /* ---------------- where each work sits on the arc ---------------- */
    const widths = items.map((w) => clamp(H * w.ratio, 1, 3.6));
    const total = widths.reduce((s, w) => s + w + GAP, 0);
    const R = total / TAU;
    const phi: number[] = [];
    let acc = 0;
    items.forEach((_, i) => {
      if (i === 0) phi.push(0);
      else acc += (widths[i - 1] / 2 + GAP + widths[i] / 2) / R, phi.push(acc);
    });

    const tex = new THREE.TextureLoader();
    const disposables: { dispose: () => void }[] = [];
    const shadowTex = shadowTexture();
    disposables.push(shadowTex);

    interface Slot {
      group: THREE.Group;
      photo: THREE.Mesh;
      shade: THREE.Mesh;
      photoMat: THREE.MeshBasicMaterial;
      shadeMat: THREE.MeshBasicMaterial;
      loaded: number; // 0 → 1 fade-in
      ready: boolean;
    }
    const slots: Slot[] = items.map((w, i) => {
      const geo = new THREE.PlaneGeometry(widths[i], H);
      const photoMat = new THREE.MeshBasicMaterial({ color: 0xe9e2d3, transparent: true, toneMapped: false });
      const photo = new THREE.Mesh(geo, photoMat);
      const shadeMat = new THREE.MeshBasicMaterial({ map: shadowTex, color: 0x4a3622, transparent: true, opacity: 0, depthWrite: false });
      const shade = new THREE.Mesh(new THREE.PlaneGeometry(widths[i] * 1.5, H * 1.5), shadeMat);
      shade.position.set(0.1, -0.16, -0.05);
      const group = new THREE.Group();
      group.add(shade, photo);
      scene.add(group);
      disposables.push(geo, photoMat, shadeMat, shade.geometry);
      const slot: Slot = { group, photo, shade, photoMat, shadeMat, loaded: 0, ready: false };
      tex.load(w.photo, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        photoMat.map = t;
        photoMat.color.setHex(0xffffff);
        photoMat.needsUpdate = true;
        disposables.push(t);
        slot.ready = true;
        if (!revealed) {
          revealed = true;
          canvas.style.opacity = "1";
          cb.current.onReady?.();
        }
      });
      return slot;
    });
    let revealed = false;

    /* ---------------- state ---------------- */
    let rot = 0; // current turn (radians)
    let rotT = 0; // target turn
    let scrollOff = 0;
    let activeIdx = 0;
    const pointer = { x: 0, y: 0 };
    let hover = -1;
    let visible = true;
    let dragging = false;
    let downX = 0;
    let downRot = 0;
    let moved = 0;

    const nearestIndex = (angle: number) => {
      let best = 0;
      let bd = Infinity;
      phi.forEach((p, i) => {
        const d = Math.abs(wrap(p - angle));
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    };
    const settle = () => {
      rotT = nearestTo(phi[nearestIndex(rotT)], rotT);
    };
    handle.current = {
      go: (d) => {
        const i = (nearestIndex(rotT) + d + items.length * 4) % items.length;
        rotT = nearestTo(phi[i], rotT);
      },
    };

    /* ---------------- layout ---------------- */
    const layout = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // the front work fills about 80% of the height
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan((H * 1.22) / 2 / DIST));
      camera.updateProjectionMatrix();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    /* ---------------- pointer: drag, hover, click ---------------- */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(slots.map((s) => s.photo), false);
      return hits.length ? slots.findIndex((s) => s.photo === hits[0].object) : -1;
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      downX = e.clientX;
      downRot = rotT;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (dragging) {
        const dx = e.clientX - downX;
        moved = Math.max(moved, Math.abs(dx));
        rotT = downRot - (dx / r.width) * 2.6;
      } else if (e.pointerType === "mouse") {
        hover = pick(e);
        canvas.style.cursor = hover >= 0 ? "pointer" : "grab";
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = hover >= 0 ? "pointer" : "grab";
      if (moved < 6) {
        const i = pick(e);
        if (i >= 0) {
          if (i === activeIdx) cb.current.onOpen?.(i);
          else rotT = nearestTo(phi[i], rotT);
        }
      } else settle();
    };
    const onLeave = () => {
      hover = -1;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    /* ---------------- loop ---------------- */
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // the page scrolling turns the arc a little as the section passes
      const rect = el.getBoundingClientRect();
      const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
      const offT = reduce ? 0 : (p - 0.5) * 1.1;
      scrollOff += (offT - scrollOff) * (1 - Math.exp(-dt * 6));
      rot += (rotT - rot) * (1 - Math.exp(-dt * 7));
      const view = rot + scrollOff;

      const idx = nearestIndex(view);
      if (idx !== activeIdx) {
        activeIdx = idx;
        cb.current.onActive?.(idx);
      }

      camera.position.x += (pointer.x * 0.25 - camera.position.x) * 0.05;
      camera.position.y += (-pointer.y * 0.1 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -DIST - R);

      slots.forEach((s, i) => {
        const a = wrap(phi[i] - view);
        const ax = Math.abs(a);
        s.group.position.set(R * Math.sin(a), 0, -(DIST + R) + R * Math.cos(a));
        s.group.rotation.y = a;
        const vis = 1 - smooth(1.0, 1.55, ax);
        s.loaded += ((s.ready ? 1 : 0) - s.loaded) * (1 - Math.exp(-dt * 5));
        const op = vis * s.loaded;
        s.group.visible = op > 0.01;
        s.photoMat.opacity = op;
        s.shadeMat.opacity = op * 0.32;
        const shade = 1 - 0.22 * smooth(0.1, 0.9, ax); // side works sit a little in shadow
        s.photoMat.color.setScalar(s.ready ? shade : 1);
        const target = i === hover && i !== activeIdx ? 1.04 : 1;
        const sc = s.group.scale.x + (target - s.group.scale.x) * 0.12;
        s.group.scale.setScalar(sc);
        s.group.position.y = Math.sin(now / 1400 + i * 1.7) * 0.025 * (1 - ax * 0.5);
      });

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      handle.current = null;
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <div ref={host} className="absolute inset-0" />;
}
