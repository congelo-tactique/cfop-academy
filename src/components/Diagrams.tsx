// Schémas 2D en SVG : vue du dessus (dernière couche), vue isométrique (F2L)
// et patron déplié (mélanges).
import { useMemo } from "react";
import {
  faceColors, indexStickers, stickerKey, FACE_NORMAL,
  type CubeState, type Face, type Vec3,
} from "../cube/cube";
import { maskedColor, STICKER_HEX, type DisplayColor } from "../cube/palette";
import type { MaskId } from "../data/types";

const fillStyle = (c: DisplayColor): React.CSSProperties =>
  c === "X" ? { fill: "var(--sticker-grey)" } : { fill: STICKER_HEX[c] };

// ---------------------------------------------------------------------------
// Vue du dessus
// ---------------------------------------------------------------------------

interface LLProps {
  state: CubeState;
  mask?: MaskId;
  arrows?: boolean;
  size?: number | string;
  className?: string;
}

const CELL = 22;
const GAP = 2;
const C0 = 50;

function cellCenter(x: number, z: number) {
  return [C0 + x * (CELL + GAP), C0 + z * (CELL + GAP)];
}

export function LLDiagram({ state, mask = "full", arrows = false, size = 120, className }: LLProps) {
  const content = useMemo(() => {
    const idx = indexStickers(state);
    const get = (pos: Vec3, n: Vec3) => {
      const s = idx.get(stickerKey(pos, n))!;
      return maskedColor(s, mask);
    };
    const rects: React.ReactNode[] = [];
    // face U
    for (let x = -1; x <= 1; x++)
      for (let z = -1; z <= 1; z++) {
        const [cx, cy] = cellCenter(x, z);
        rects.push(
          <rect key={`u${x}${z}`} x={cx - CELL / 2} y={cy - CELL / 2} width={CELL} height={CELL} rx={3.2} style={fillStyle(get([x, 1, z], [0, 1, 0]))} />,
        );
      }
    // bandes latérales
    const T = 7;
    const off = 1.5 * (CELL + GAP) + 1.5;
    for (let i = -1; i <= 1; i++) {
      const [cx] = cellCenter(i, 0);
      const [, cy] = cellCenter(0, i);
      // arrière (z = -1), en haut
      rects.push(<rect key={`b${i}`} x={cx - CELL / 2} y={C0 - off - T} width={CELL} height={T} rx={2} style={fillStyle(get([i, 1, -1], [0, 0, -1]))} />);
      // avant (z = 1), en bas
      rects.push(<rect key={`f${i}`} x={cx - CELL / 2} y={C0 + off} width={CELL} height={T} rx={2} style={fillStyle(get([i, 1, 1], [0, 0, 1]))} />);
      // gauche (x = -1)
      rects.push(<rect key={`l${i}`} x={C0 - off - T} y={cy - CELL / 2} width={T} height={CELL} rx={2} style={fillStyle(get([-1, 1, i], [-1, 0, 0]))} />);
      // droite (x = 1)
      rects.push(<rect key={`r${i}`} x={C0 + off} y={cy - CELL / 2} width={T} height={CELL} rx={2} style={fillStyle(get([1, 1, i], [1, 0, 0]))} />);
    }

    const arrowEls: React.ReactNode[] = [];
    if (arrows) {
      // flèches : de la position actuelle d'une pièce vers sa place
      const moves: [Vec3, Vec3][] = [];
      const seen = new Set<string>();
      for (const s of state) {
        if (s.pos[1] !== 1) continue;
        const n = s.pos.filter((v) => v !== 0).length;
        if (n < 2) continue;
        const k = s.pos.join();
        if (seen.has(k)) continue;
        seen.add(k);
        if (s.home[0] !== s.pos[0] || s.home[2] !== s.pos[2]) moves.push([s.pos, s.home]);
      }
      const done = new Set<number>();
      moves.forEach(([from, to], i) => {
        if (done.has(i)) return;
        const rev = moves.findIndex(([f2, t2], j) => j !== i && f2.join() === to.join() && t2.join() === from.join());
        const both = rev >= 0;
        if (both) done.add(rev);
        done.add(i);
        const [x1, y1] = cellCenter(from[0], from[2]);
        const [x2, y2] = cellCenter(to[0], to[2]);
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const sh = 6;
        const ax = x1 + (dx / len) * (both ? sh : 4), ay = y1 + (dy / len) * (both ? sh : 4);
        const bx = x2 - (dx / len) * sh, by = y2 - (dy / len) * sh;
        arrowEls.push(
          <line key={`a${i}`} x1={ax} y1={ay} x2={bx} y2={by} className="ll-arrow"
            markerEnd="url(#ah)" markerStart={both ? "url(#ah-start)" : undefined} />,
        );
      });
    }
    return { rects, arrowEls };
  }, [state, mask, arrows]);

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`diagram ll-diagram ${className ?? ""}`} aria-hidden="true">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="ll-arrowhead" />
        </marker>
        <marker id="ah-start" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="ll-arrowhead" />
        </marker>
      </defs>
      <rect x={C0 - 1.5 * (CELL + GAP) - 1} y={C0 - 1.5 * (CELL + GAP) - 1} width={3 * (CELL + GAP) + 2} height={3 * (CELL + GAP) + 2} rx={6} className="diagram-body" />
      {content.rects}
      {content.arrowEls}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Vue isométrique (faces U, F, R)
// ---------------------------------------------------------------------------

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;
function project(p: [number, number, number]): [number, number] {
  return [(p[0] - p[2]) * COS30, (p[0] + p[2]) * SIN30 - p[1]];
}

const TANGENTS: Record<"U" | "F" | "R", [Vec3, Vec3]> = {
  U: [[1, 0, 0], [0, 0, 1]],
  F: [[1, 0, 0], [0, 1, 0]],
  R: [[0, 0, 1], [0, 1, 0]],
};

interface IsoProps {
  state: CubeState;
  mask?: MaskId;
  size?: number | string;
  className?: string;
}

export function IsoDiagram({ state, mask = "full", size = 120, className }: IsoProps) {
  const polys = useMemo(() => {
    const idx = indexStickers(state);
    const out: React.ReactNode[] = [];
    const bodies: React.ReactNode[] = [];
    for (const f of ["U", "F", "R"] as const) {
      const n = FACE_NORMAL[f];
      const [u, v] = TANGENTS[f];
      // fond de la face
      const fc = n.map((x) => x * 1.5) as Vec3;
      const big = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) =>
        project([fc[0] + (u[0] * a + v[0] * b) * 1.52, fc[1] + (u[1] * a + v[1] * b) * 1.52, fc[2] + (u[2] * a + v[2] * b) * 1.52]),
      );
      bodies.push(<polygon key={`body${f}`} points={big.map((p) => p.join(",")).join(" ")} className="diagram-body" />);
      for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++) {
          const pos: Vec3 = [0, 0, 0];
          for (let k = 0; k < 3; k++) pos[k] = n[k] !== 0 ? n[k] : u[k] * i + v[k] * j;
          const s = idx.get(stickerKey(pos, n));
          if (!s) continue;
          const c = [pos[0] + n[0] * 0.5, pos[1] + n[1] * 0.5, pos[2] + n[2] * 0.5];
          const h = 0.43;
          const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) =>
            project([c[0] + (u[0] * a + v[0] * b) * h, c[1] + (u[1] * a + v[1] * b) * h, c[2] + (u[2] * a + v[2] * b) * h]),
          );
          out.push(
            <polygon key={`${f}${i}${j}`} points={pts.map((p) => p.map((x) => x.toFixed(3)).join(",")).join(" ")}
              style={fillStyle(maskedColor(s, mask))} strokeLinejoin="round" className="iso-sticker" />,
          );
        }
    }
    return [...bodies, ...out];
  }, [state, mask]);

  return (
    <svg viewBox="-2.85 -3.25 5.7 6.5" width={size} height={size} className={`diagram iso-diagram ${className ?? ""}`} aria-hidden="true">
      {polys}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Patron déplié
// ---------------------------------------------------------------------------

const NET_POS: Record<Face, [number, number]> = { U: [3, 0], L: [0, 3], F: [3, 3], R: [6, 3], B: [9, 3], D: [3, 6] };

export function CubeNet({ state, size = "100%", className }: { state: CubeState; size?: number | string; className?: string }) {
  const fc = useMemo(() => faceColors(state), [state]);
  const rects: React.ReactNode[] = [];
  (Object.keys(NET_POS) as Face[]).forEach((f) => {
    const [ox, oy] = NET_POS[f];
    rects.push(<rect key={`bg${f}`} x={ox * 10 - 0.6} y={oy * 10 - 0.6} width={31.2} height={31.2} rx={2.4} className="diagram-body" />);
    fc[f].forEach((c, i) => {
      const r = Math.floor(i / 3), col = i % 3;
      rects.push(<rect key={`${f}${i}`} x={ox * 10 + col * 10 + 0.6} y={oy * 10 + r * 10 + 0.6} width={8.8} height={8.8} rx={1.6} style={fillStyle(c)} />);
    });
  });
  return (
    <svg viewBox="-1 -1 122 92" width={size} className={`diagram net-diagram ${className ?? ""}`} role="img" aria-label="Patron du cube mélangé">
      {rects}
    </svg>
  );
}
