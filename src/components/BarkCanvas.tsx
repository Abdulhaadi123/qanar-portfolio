"use client";

/**
 * The hero object: a sheet of birch bark in WebGL (three.js), carrying one of his own works (no. 02).
 *  - the bottom of the sheet is curled into a spiral roll
 *  - scrolling unrolls it into a flat sheet
 *  - the pointer tilts it a little
 * One canvas, no model files.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeSheetTextures, SHEET_W, SHEET_L } from "@/lib/bark";
import { clamp, lerp, easeInOut, easeOutCubic } from "@/lib/rng";

interface Props {
  progress: { current: { p: number } };
  onReady?: () => void;
  onFail?: () => void;
}

export default function BarkCanvas({ progress, onReady, onFail }: Props) {
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !small;
    renderer.shadowMap.type = THREE.PCFShadowMap;
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
    if (!small) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const sc = key.shadow.camera;
      sc.left = -4;
      sc.right = 4;
      sc.top = 4;
      sc.bottom = -4;
      sc.near = 1;
      sc.far = 16;
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.025;
      key.shadow.radius = 5;
    }
    scene.add(key);
    const rimLight = new THREE.DirectionalLight(0xe4ecff, 0.5);
    rimLight.position.set(-3.5, 1.5, -2);
    scene.add(rimLight);

    /* ---------------- groups ---------------- */
    const pivot = new THREE.Group(); // layout: where on screen, how big
    const rig = new THREE.Group(); // motion: tilt, intro drop
    const sheet = new THREE.Group(); // centres the sheet on its own middle
    sheet.position.y = SHEET_L / 2 - 0.15;
    rig.add(sheet);
    pivot.add(rig);
    scene.add(pivot);
    rig.visible = false;

    if (!small) {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.ShadowMaterial({ opacity: 0.2, color: 0x5a4632 }));
      wall.position.z = -0.22;
      wall.receiveShadow = true;
      pivot.add(wall);
    }

    /* ---------------- geometry: a plane we bend by hand ---------------- */
    const segU = small ? 36 : 60;
    const segV = small ? 96 : 160;
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
    const GAP = 0.09; // spacing between turns, wide enough that the spiral shows at the ends
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
      geo.computeBoundingSphere();
      lastS0 = s0;
      lastBend = bend;
    };

    const textures: THREE.Texture[] = [];
    const mats: THREE.Material[] = [];
    const state = { p: progress.current.p, introT: 0, started: false };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    /* ---------------- load his photograph, then show the sheet ---------------- */
    (async () => {
      const img = new Image();
      img.src = "/media/hero-bark.webp";
      try {
        await img.decode();
      } catch {
        onFail?.();
        return;
      }
      if (disposed) return;
      const tw = small ? 768 : 1024;
      const th = Math.round((tw * SHEET_L) / SHEET_W);
      const T = makeSheetTextures(img, tw, th);
      const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const mkTex = (c: HTMLCanvasElement, srgb = true) => {
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = aniso;
        t.needsUpdate = true;
        textures.push(t);
        return t;
      };
      const frontMat = new THREE.MeshStandardMaterial({
        map: mkTex(T.color),
        bumpMap: mkTex(T.bump, false),
        bumpScale: 0.45,
        roughness: 0.9,
        metalness: 0,
        alphaTest: 0.5,
        alphaToCoverage: true,
        side: THREE.FrontSide,
      });
      const backMat = new THREE.MeshStandardMaterial({
        map: mkTex(T.back),
        roughness: 0.96,
        metalness: 0,
        alphaTest: 0.5,
        alphaToCoverage: true,
        side: THREE.BackSide,
      });
      mats.push(frontMat, backMat);
      const front = new THREE.Mesh(geo, frontMat);
      const back = new THREE.Mesh(geo, backMat);
      front.castShadow = !small;
      front.receiveShadow = !small;
      back.receiveShadow = !small;
      sheet.add(back, front);
      if (reduce) state.introT = 1;
      rig.visible = true;
      state.started = true;
    })();

    /* ---------------- layout ---------------- */
    const layout = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const vh = 2 * camDist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const vw = vh * camera.aspect;
      const wide = camera.aspect > 1.1;
      // wide: object on the right, text on the left. narrow: object above, text below.
      const fit = Math.min(1.12, ((wide ? 0.4 : 0.62) * vw) / SHEET_W, ((wide ? 0.86 : 0.5) * vh) / (SHEET_L + 0.3));
      pivot.scale.setScalar(fit);
      pivot.position.set(wide ? vw * 0.2 : 0, wide ? -0.05 : vh * 0.08, 0);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    /* ---------------- loop ---------------- */
    let last = performance.now();
    let revealed = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;

      const target = progress.current.p;
      state.p += (target - state.p) * (1 - Math.exp(-dt * 8));
      if (Math.abs(target - state.p) < 0.0003) state.p = target;
      if (state.started && !reduce) state.introT = Math.min(1, state.introT + dt / 1.6);

      // scroll story: roll → flat sheet
      const e = easeInOut(clamp((state.p - 0.04) / 0.86));
      const s0 = lerp(SHEET_L * 0.5, SHEET_L, e);
      const bend = lerp(0.26, 0.04, e);
      if (Math.abs(s0 - lastS0) > 0.0006 || Math.abs(bend - lastBend) > 0.0006) deform(s0, bend);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const intro = easeOutCubic(state.introT);
      rig.position.y = (1 - intro) * 0.6;
      rig.rotation.y = lerp(-0.52, 0, e) + pointer.x * 0.16 + Math.sin(time * 0.55) * 0.025 * (1 - e * 0.6);
      rig.rotation.x = lerp(0.07, 0, e) - pointer.y * 0.07 + Math.sin(time * 0.43) * 0.012;
      rig.rotation.z = lerp(-0.035, 0, e);

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
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh && m.geometry !== geo) {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} className="absolute inset-0" />;
}
