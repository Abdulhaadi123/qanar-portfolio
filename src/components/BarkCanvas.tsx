"use client";

/**
 * The hero object: a sheet of birch bark in WebGL (three.js).
 *  - surface "drawn": bark painted at run time, his name written on in ink, then a red seal pressed
 *  - surface "real": a photograph of one of his own works (no. 02) on the sheet
 *
 * The scroll story has three stages (progress 0 → 1 over the hero's runway):
 *   1. 0.00 – 0.32  the roll opens into a flat sheet
 *   2. 0.28 – 0.78  the sheet comes forward, turns toward the viewer and settles in the middle
 *   3. 0.86 – 1.00  it lifts away as the page moves on
 *
 * Cheap on purpose: no shadow map, a modest mesh, pixel ratio capped, and a frame is drawn only
 * when something actually changed (the page is still, the scene is still, the GPU is idle).
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeSheetTextures, SHEET_W, SHEET_L } from "@/lib/bark";
import { makeBarkTextures, createComposer } from "@/lib/drawnSheet";
import { scriptFontsReady } from "@/lib/art";
import { clamp, lerp, easeInOut, easeOutCubic } from "@/lib/rng";

interface Props {
  progress: { current: { p: number } };
  surface?: "drawn" | "real";
  onReady?: () => void;
  onFail?: () => void;
}

/** a soft dark blob used as the sheet's shadow on the wall behind it */
function softShadow() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  x.shadowColor = "#000";
  x.shadowBlur = 18;
  x.shadowOffsetX = 400;
  x.fillStyle = "#000";
  x.fillRect(30 - 400, 24, 68, 80);
  return new THREE.CanvasTexture(c);
}

export default function BarkCanvas({ progress, surface = "drawn", onReady, onFail }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "high-performance" });
    } catch {
      onFail?.();
      return;
    }
    if (!renderer.getContext()) {
      onFail?.();
      return;
    }

    let disposed = false;
    let raf = 0;
    let visible = true;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;opacity:0;transition:opacity .9s ease";
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);

    const scene = new THREE.Scene();
    const camDist = 9.2;
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
    camera.position.set(0, 0.1, camDist);

    /* ---------------- light: a pale studio, warm key ---------------- */
    scene.add(new THREE.HemisphereLight(0xfff6e6, 0xcbb99a, 1.7));
    const key = new THREE.DirectionalLight(0xffeed6, 2.5);
    key.position.set(3.2, 3.6, 4.6);
    scene.add(key);
    const rimLight = new THREE.DirectionalLight(0xe4ecff, 0.5);
    rimLight.position.set(-3.5, 1.5, -2);
    scene.add(rimLight);

    /* ---------------- groups ---------------- */
    const pivot = new THREE.Group(); // layout and scroll: where on screen, how big
    const rig = new THREE.Group(); // motion: tilt, intro drop
    const sheet = new THREE.Group(); // centres the sheet on its own middle
    sheet.position.y = SHEET_L / 2 - 0.15;
    rig.add(sheet);
    pivot.add(rig);
    scene.add(pivot);
    rig.visible = false;

    // the shadow on the wall: one soft quad behind the sheet
    const shadowTex = softShadow();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, color: 0x4a3622, transparent: true, opacity: 0, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(SHEET_W * 1.32, SHEET_L * 1.16);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0.2, -0.12, -0.3);
    pivot.add(shadow);

    /* ---------------- geometry: a plane we bend by hand ---------------- */
    const segU = small ? 24 : 36;
    const segV = small ? 72 : 112;
    const geo = new THREE.PlaneGeometry(SHEET_W, SHEET_L, segU, segV);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    const baseU = new Float32Array(count);
    const baseS = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      baseU[i] = pos.getX(i);
      baseS[i] = SHEET_L / 2 - pos.getY(i); // distance from the top edge
    }
    const R0 = 0.2; // inner radius of the roll
    const GAP = 0.09; // spacing between turns
    const B = GAP / (Math.PI * 2);
    let lastS0 = -1;
    let lastBend = -1;
    const deform = (s0: number, bend: number) => {
      for (let i = 0; i < count; i++) {
        const u = baseU[i];
        const s = baseS[i];
        const bz = bend * u * u;
        if (s <= s0) {
          pos.setXYZ(i, u, -s, bz);
        } else {
          const sp = s - s0;
          const th = (-R0 + Math.sqrt(R0 * R0 + 2 * B * sp)) / B;
          const r = R0 + B * th;
          pos.setXYZ(i, u, -s0 - r * Math.sin(th), bz + R0 - r * Math.cos(th));
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      lastS0 = s0;
      lastBend = bend;
    };

    const textures: THREE.Texture[] = [shadowTex];
    const mats: THREE.Material[] = [shadowMat];
    const state = { p: progress.current.p, introT: 0, started: false };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let dirty = true; // something changed that needs a new frame

    /* ---------------- paint (or load) the sheet's surface, then show it ---------------- */
    let compose: ((ink: number, seal: number) => void) | null = null;
    let colorTex: THREE.CanvasTexture | null = null;
    const ink = { clock: 0, t: 0, seal: 0 };
    (async () => {
      const tw = small ? 640 : 1024;
      const th = Math.round((tw * SHEET_L) / SHEET_W);
      let color: HTMLCanvasElement;
      let bump: HTMLCanvasElement;
      let back: HTMLCanvasElement;
      if (surface === "drawn") {
        await scriptFontsReady();
        if (disposed) return;
        const T = makeBarkTextures(tw, th);
        compose = createComposer(T);
        ({ color, bump, back } = T);
        if (reduce) {
          ink.t = 1;
          ink.seal = 1;
        }
        compose(ink.t, ink.seal);
      } else {
        const img = new Image();
        img.src = "/media/hero-bark.webp";
        try {
          await img.decode();
        } catch {
          onFail?.();
          return;
        }
        if (disposed) return;
        ({ color, bump, back } = makeSheetTextures(img, tw, th));
      }
      const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      const mkTex = (c: HTMLCanvasElement, srgb = true) => {
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = aniso;
        t.needsUpdate = true;
        textures.push(t);
        return t;
      };
      colorTex = mkTex(color);
      const frontMat = new THREE.MeshStandardMaterial({
        map: colorTex,
        bumpMap: mkTex(bump, false),
        bumpScale: surface === "drawn" ? 1.0 : 0.45,
        roughness: 0.9,
        metalness: 0,
        alphaTest: 0.5,
        alphaToCoverage: !small,
        side: THREE.FrontSide,
      });
      const backMat = new THREE.MeshStandardMaterial({
        map: mkTex(back),
        roughness: 0.96,
        metalness: 0,
        alphaTest: 0.5,
        alphaToCoverage: !small,
        side: THREE.BackSide,
      });
      mats.push(frontMat, backMat);
      sheet.add(new THREE.Mesh(geo, backMat), new THREE.Mesh(geo, frontMat));
      if (reduce) state.introT = 1;
      rig.visible = true;
      state.started = true;
      dirty = true;
    })();

    /* ---------------- layout ---------------- */
    let baseScale = 1;
    let baseX = 0;
    let baseY = 0;
    let wide = true;
    let vhWorld = 1;
    const layout = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      vhWorld = 2 * camDist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const vw = vhWorld * camera.aspect;
      wide = camera.aspect > 1.1;
      // wide: object on the right, text on the left. narrow: object above, text below.
      // narrow screens: the sheet stays in the upper 40% so the words below never sit on it
      baseScale = wide
        ? Math.min(1.12, (0.4 * vw) / SHEET_W, (0.86 * vhWorld) / (SHEET_L + 0.3))
        : Math.min(1.12, (0.62 * vw) / SHEET_W, (0.37 * vhWorld) / SHEET_L);
      baseX = wide ? vw * 0.2 : 0;
      baseY = wide ? -0.05 : vhWorld * 0.22;
      dirty = true;
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) dirty = true;
    });
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    /* ---------------- loop: cheap checks every frame, a draw only on change ---------------- */
    let last = performance.now();
    let revealed = false;
    let sig = "";
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = progress.current.p;
      state.p += (target - state.p) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - state.p) < 0.0004) state.p = target;
      if (state.started && !reduce && state.introT < 1) state.introT = Math.min(1, state.introT + dt / 1.5);
      if (compose && colorTex && !reduce && (ink.t < 1 || ink.seal < 1)) {
        ink.clock += dt;
        if (ink.clock > 0.45 && ink.t < 1) ink.t = Math.min(1, ink.t + dt / 3.2);
        if (ink.t > 0.92 && ink.seal < 1) ink.seal = Math.min(1, ink.seal + dt / 0.55);
        compose(easeInOut(ink.t), easeOutCubic(ink.seal));
        colorTex.needsUpdate = true;
        dirty = true;
      }
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      if (Math.abs(pointer.tx - pointer.x) < 0.001) pointer.x = pointer.tx;
      if (Math.abs(pointer.ty - pointer.y) < 0.001) pointer.y = pointer.ty;

      const p = state.p;
      const e = easeInOut(clamp(p / 0.32)); // stage 1: unroll
      const z = easeInOut(clamp((p - 0.28) / 0.5)); // stage 2: come forward and turn
      const out = easeInOut(clamp((p - 0.86) / 0.14)); // stage 3: lift away
      const intro = easeOutCubic(state.introT);

      // nothing moved? then do nothing
      const next = [e, z, out, intro, pointer.x, pointer.y, baseScale].map((v) => v.toFixed(4)).join("|");
      if (!dirty && next === sig) return;
      sig = next;
      dirty = false;

      const s0 = lerp(SHEET_L * 0.5, SHEET_L, e);
      const bend = lerp(0.26, 0.04, e);
      if (Math.abs(s0 - lastS0) > 0.0015 || Math.abs(bend - lastBend) > 0.0015) deform(s0, bend);

      pivot.scale.setScalar(baseScale * (1 + (wide ? 0.22 : 0.08) * z));
      pivot.position.set(baseX * (1 - 0.5 * z), baseY + (wide ? 0 : vhWorld * 0.02 * z) + out * vhWorld * 0.22, 0);
      rig.position.y = (1 - intro) * 0.6;
      rig.rotation.y = lerp(-0.52, 0, e) - 0.14 * z + pointer.x * 0.14;
      rig.rotation.x = lerp(0.07, 0, e) + 0.05 * z - pointer.y * 0.06;
      rig.rotation.z = lerp(-0.035, 0, e) + 0.02 * z;
      shadowMat.opacity = 0.24 * intro * (1 - out);

      renderer.render(scene, camera);
      if (!revealed && state.started) {
        revealed = true;
        canvas.style.opacity = "1";
        onReady?.();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      shadowGeo.dispose();
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} className="absolute inset-0" />;
}
