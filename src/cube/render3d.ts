// Rendu 3D du cube avec three.js : 26 cubies arrondis + 54 autocollants.
// Les autocollants sont identifiés par leur « emplacement » (position + normale)
// et recolorés à partir de l'état logique après chaque animation.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  FACE_NORMAL, MOVE_DEFS, moveQuarterTurns, stickerKey,
  type CubeState, type Face, type Move, type Vec3,
} from "./cube";
import { maskedColor, STICKER_HEX } from "./palette";
import type { MaskId } from "../data/types";

export interface CubeViewOptions {
  interactive?: boolean;
  labels?: boolean;
  /** "iso" : vue 3/4 classique ; "top" : plus plongeante pour la dernière couche. */
  view?: "iso" | "top";
  background?: string | null;
}

interface Cubie {
  group: THREE.Group;
  pos: Vec3;
}

const SPACING = 1.0;
const BODY = 0.97;
const STICKER = 0.84;

function roundedSquare(size: number, r: number): THREE.Shape {
  const s = size / 2;
  const sh = new THREE.Shape();
  sh.moveTo(-s + r, -s);
  sh.lineTo(s - r, -s);
  sh.quadraticCurveTo(s, -s, s, -s + r);
  sh.lineTo(s, s - r);
  sh.quadraticCurveTo(s, s, s - r, s);
  sh.lineTo(-s + r, s);
  sh.quadraticCurveTo(-s, s, -s, s - r);
  sh.lineTo(-s, -s + r);
  sh.quadraticCurveTo(-s, -s, -s + r, -s);
  return sh;
}

function labelSprite(text: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(20,22,28,0.82)";
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px 'Inter Variable', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(0.55, 0.55, 0.55);
  sp.renderOrder = 10;
  return sp;
}

export class CubeView {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls | null = null;
  private root = new THREE.Group();
  private cubies: Cubie[] = [];
  private stickers = new Map<string, THREE.Mesh<THREE.ShapeGeometry, THREE.MeshStandardMaterial>>();
  private labels: THREE.Sprite[] = [];
  private raf = 0;
  private dirty = true;
  private resizeObs: ResizeObserver;
  private io: IntersectionObserver;
  private visible = true;
  private disposed = false;
  private animation: {
    pivot: THREE.Group; axis: number; target: number; start: number; duration: number;
    resolve: () => void; members: Cubie[]; after: () => void;
  } | null = null;
  private lastColors: string[] = [];
  private highlight: ((pos: Vec3) => boolean) | null = null;

  constructor(private container: HTMLElement, private opts: CubeViewOptions = {}) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.touchAction = opts.interactive === false ? "auto" : "none";

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.resetCamera();

    // Lumières
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x50525a, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(4, 8, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-6, -2, 4);
    this.scene.add(fill);

    this.scene.add(this.root);
    this.build();

    if (opts.interactive !== false) {
      const c = new OrbitControls(this.camera, this.renderer.domElement);
      c.enableDamping = true;
      c.dampingFactor = 0.12;
      c.enablePan = false;
      c.minDistance = 7;
      c.maxDistance = 16;
      c.rotateSpeed = 0.9;
      c.addEventListener("change", () => (this.dirty = true));
      this.controls = c;
    }

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    // pas de rendu quand le cube est hors de l'écran
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) {
        this.dirty = true;
        this.startLoop();
      }
    }, { rootMargin: "120px" });
    this.io.observe(container);
    this.resize();
    this.startLoop();
  }

  private startLoop() {
    if (!this.raf && !this.disposed) this.raf = requestAnimationFrame(this.loop);
  }

  resetCamera() {
    const top = this.opts.view === "top";
    const dist = top ? 12.2 : 11.6;
    const az = THREE.MathUtils.degToRad(top ? 25 : 35);
    const el = THREE.MathUtils.degToRad(top ? 48 : 28);
    this.camera.position.set(
      dist * Math.cos(el) * Math.sin(az),
      dist * Math.sin(el),
      dist * Math.cos(el) * Math.cos(az),
    );
    this.camera.lookAt(0, 0, 0);
    this.controls?.target.set(0, 0, 0);
    this.controls?.update();
    this.dirty = true;
  }

  private build() {
    const bodyGeo = new RoundedBoxGeometry(BODY, BODY, BODY, 4, 0.12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.55, metalness: 0.05 });
    const stickerGeo = new THREE.ShapeGeometry(roundedSquare(STICKER, 0.13), 6);

    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const pos: Vec3 = [x, y, z];
          const g = new THREE.Group();
          g.position.set(x * SPACING, y * SPACING, z * SPACING);
          g.add(new THREE.Mesh(bodyGeo, bodyMat));
          for (const f of Object.keys(FACE_NORMAL) as Face[]) {
            const n = FACE_NORMAL[f];
            const axis = n.findIndex((v) => v !== 0);
            if (pos[axis] !== n[axis]) continue;
            const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.32, metalness: 0.0 });
            const m = new THREE.Mesh(stickerGeo, mat);
            const nv = new THREE.Vector3(...n);
            m.position.copy(nv.clone().multiplyScalar(BODY / 2 + 0.004));
            m.lookAt(nv.clone().multiplyScalar(2));
            g.add(m);
            this.stickers.set(stickerKey(pos, n), m);
          }
          this.root.add(g);
          this.cubies.push({ group: g, pos });
        }

    if (this.opts.labels) {
      for (const f of Object.keys(FACE_NORMAL) as Face[]) {
        const sp = labelSprite(f);
        const n = FACE_NORMAL[f];
        sp.position.set(n[0] * 2.25, n[1] * 2.25, n[2] * 2.25);
        sp.userData.normal = new THREE.Vector3(...n);
        this.scene.add(sp);
        this.labels.push(sp);
      }
    }
  }

  setLabelsVisible(v: boolean) {
    for (const l of this.labels) l.visible = v;
    this.dirty = true;
  }

  /** Met en évidence certaines pièces (les autres sont assombries). */
  setHighlight(fn: ((pos: Vec3) => boolean) | null) {
    this.highlight = fn;
    this.applyHighlight();
  }

  private applyHighlight() {
    for (const [k, mesh] of this.stickers) {
      const pos = k.split("|")[0].split(",").map(Number) as Vec3;
      const dim = this.highlight && !this.highlight(pos);
      mesh.material.emissive.setHex(0x000000);
      mesh.material.opacity = 1;
      mesh.material.transparent = false;
      if (dim) {
        mesh.material.transparent = true;
        mesh.material.opacity = 0.28;
      }
    }
    this.dirty = true;
  }

  setState(state: CubeState, mask: MaskId = "full") {
    const colors: string[] = [];
    for (const s of state) {
      const mesh = this.stickers.get(stickerKey(s.pos, s.normal));
      if (!mesh) continue;
      const hex = STICKER_HEX[maskedColor(s, mask)];
      mesh.material.color.set(hex);
      colors.push(hex);
    }
    this.lastColors = colors;
    this.dirty = true;
  }

  get isAnimating() {
    return this.animation !== null;
  }

  /**
   * Anime un mouvement puis applique `next` (l'état après le mouvement).
   * Si une animation est en cours, elle est terminée immédiatement.
   */
  animateMove(move: Move, next: CubeState, mask: MaskId, durationMs: number): Promise<void> {
    this.finishAnimation();
    const def = MOVE_DEFS[move.family];
    const q = moveQuarterTurns(move);
    const members = this.cubies.filter((c) => def.layers.includes(c.pos[def.axis]));
    const pivot = new THREE.Group();
    this.root.add(pivot);
    for (const m of members) pivot.attach(m.group);
    const dur = durationMs * (Math.abs(q) === 2 ? 1.45 : 1);
    if (!this.visible) {
      for (const m of members) this.root.attach(m.group);
      this.root.remove(pivot);
      this.setState(next, mask);
      return Promise.resolve();
    }
    this.startLoop();
    return new Promise<void>((resolve) => {
      this.animation = {
        pivot, axis: def.axis, target: (q * Math.PI) / 2, start: performance.now(), duration: Math.max(dur, 1),
        resolve, members, after: () => this.setState(next, mask),
      };
      this.dirty = true;
    });
  }

  finishAnimation() {
    const a = this.animation;
    if (!a) return;
    this.animation = null;
    for (const m of a.members) {
      this.root.attach(m.group);
      m.group.position.set(m.pos[0] * SPACING, m.pos[1] * SPACING, m.pos[2] * SPACING);
      m.group.rotation.set(0, 0, 0);
    }
    this.root.remove(a.pivot);
    a.after();
    a.resolve();
    this.dirty = true;
  }

  private loop = () => {
    this.raf = 0;
    if (this.disposed) return;
    if (!this.visible) {
      this.finishAnimation();
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
    const a = this.animation;
    if (a) {
      const t = Math.min(1, (performance.now() - a.start) / a.duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      const angle = a.target * e;
      a.pivot.rotation.set(a.axis === 0 ? angle : 0, a.axis === 1 ? angle : 0, a.axis === 2 ? angle : 0);
      this.dirty = true;
      if (t >= 1) this.finishAnimation();
    }
    this.controls?.update();
    if (this.dirty && this.labels.length) {
      // n'affiche que les étiquettes des faces tournées vers la caméra
      const cam = this.camera.position.clone().normalize();
      for (const l of this.labels) {
        const d = (l.userData.normal as THREE.Vector3).dot(cam);
        const o = Math.max(0, Math.min(1, (d - 0.12) / 0.25));
        (l.material as THREE.SpriteMaterial).opacity = o;
        l.visible = o > 0.01;
      }
    }
    if (this.dirty) {
      this.dirty = false;
      this.renderer.render(this.scene, this.camera);
    }
  };

  private resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // garde le cube entier visible même sur des conteneurs étroits
    const fit = w < h ? (h / w) : 1;
    this.camera.zoom = 1 / Math.min(fit, 1.8);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  get colors() {
    return this.lastColors;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.io.disconnect();
    this.controls?.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
