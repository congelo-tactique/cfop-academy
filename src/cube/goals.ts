// Objectifs de résolution (F2L, OLL, PLL…) et alignement d'algorithmes alternatifs
// sur l'état exact d'un cas (ajout automatique de l'AUF nécessaire).
import {
  applyAlg, faceColors, isSolved, parseAlg, movesToString, ROTATIONS, stickerHome,
  type CubeState, type Move, FACE_NORMAL,
} from "./cube";

export type Goal = "f2l" | "oll" | "oll-edges" | "pll" | "pll-corners" | "solved" | "cross";

/** Remet le cube dans l'orientation standard (centres à leur place). */
export function normalizeOrientation(state: CubeState): CubeState {
  for (const r of ROTATIONS) {
    const s = r ? applyAlg(state, r) : state;
    const ok = s
      .filter((st) => st.pos.filter((v) => v !== 0).length === 1)
      .every((st) => stickerHome(st));
    if (ok) return s;
  }
  return state;
}

const isEdgePos = (p: number[]) => p.filter((v) => v !== 0).length === 2;

function f2lSolved(s: CubeState) {
  return s.every((st) => st.home[1] > 0 || stickerHome(st));
}

function crossSolved(s: CubeState) {
  return s.every((st) => !(st.home[1] === -1 && isEdgePos(st.home)) || stickerHome(st));
}

function topOriented(s: CubeState, edgesOnly = false) {
  const up = FACE_NORMAL.U;
  const uColor = s.find((st) => st.pos[0] === 0 && st.pos[1] === 1 && st.pos[2] === 0)!.color;
  return s
    .filter((st) => st.pos[1] === 1 && st.normal[1] === up[1])
    .filter((st) => !edgesOnly || st.pos.filter((v) => v !== 0).length <= 2)
    .every((st) => st.color === uColor);
}

function cornersPermuted(s: CubeState) {
  const fc = faceColors(s);
  return (["F", "R", "B", "L"] as const).every((f) => fc[f][0] === fc[f][2]);
}

export function goalReached(state: CubeState, goal: Goal): boolean {
  const s = normalizeOrientation(state);
  switch (goal) {
    case "solved":
    case "pll":
      return isSolved(s);
    case "cross":
      return crossSolved(s);
    case "f2l":
      return f2lSolved(s);
    case "oll":
      return f2lSolved(s) && topOriented(s);
    case "oll-edges":
      return f2lSolved(s) && topOriented(s, true);
    case "pll-corners":
      return f2lSolved(s) && topOriented(s) && cornersPermuted(s);
  }
}

const AUFS = ["", "U", "U2", "U'"];

function mergeU(moves: Move[]): Move[] {
  // fusionne les mouvements U consécutifs (au début et à la fin)
  const out: Move[] = [];
  for (const m of moves) {
    const last = out[out.length - 1];
    if (last && last.family === "U" && m.family === "U") {
      let a = (((last.amount + m.amount) % 4) + 4) % 4;
      out.pop();
      if (a === 0) continue;
      if (a === 3) a = -1;
      out.push({ family: "U", amount: a, raw: "" });
    } else out.push(m);
  }
  return out;
}

/**
 * Trouve l'AUF (avant et éventuellement après) pour que `alg` résolve exactement
 * l'état `caseSt` selon `goal`. Renvoie l'algorithme ajusté ou null.
 */
export function alignAlg(caseSt: CubeState, alg: string, goal: Goal): string | null {
  const allowPost = goal === "pll" || goal === "solved";
  for (const p of AUFS) {
    for (const q of allowPost ? AUFS : [""]) {
      const full = `${p} ${alg} ${q}`;
      if (goalReached(applyAlg(caseSt, full), goal)) {
        if (!p && !q) return alg;
        const moves = parseAlg(full);
        return prettyAlg(movesToString(mergeU(moves)), alg);
      }
    }
  }
  return null;
}

/** Conserve les parenthèses de l'original quand seul un AUF a été ajouté. */
function prettyAlg(merged: string, original: string): string {
  const orig = movesToString(parseAlg(original));
  const idx = merged.indexOf(orig);
  if (idx >= 0 && orig.length > 0) {
    return (merged.slice(0, idx) + original + merged.slice(idx + orig.length)).trim();
  }
  return merged;
}

/** Ajoute un AUF devant un algorithme, en fusionnant avec un éventuel U initial. */
export function prependAuf(auf: string, alg: string): string {
  if (!auf.trim()) return alg;
  const a = parseAlg(auf);
  const m = parseAlg(alg);
  if (m.length && m[0].family === "U") return movesToString(mergeU([...a, ...m]));
  return `${auf} ${alg}`;
}
