// Solveur optimal de croix (4 arêtes de la face D).
// État : pour chaque arête de croix, l'emplacement (parmi 24 « autocollants
// d'arête ») de son autocollant D. Table de distances exacte par BFS (24^4 cases).
import {
  applyAlg, applyMoveInPlace, cloneCube, parseMove, solvedCube, stickerKey,
  type CubeState, type Sticker,
} from "./cube";

const FACES = ["U", "D", "R", "L", "F", "B"];
const MOVES = FACES.flatMap((f) => [f, f + "'", f + "2"]);

interface Tables {
  slotOf: Map<string, number>;
  trans: Int8Array[]; // trans[m][slot] -> slot
  dist: Uint8Array;
  crossIds: number[]; // index dans l'état résolu des autocollants D des arêtes de croix
}

let tables: Tables | null = null;

const isEdge = (s: Sticker) => s.pos.filter((v) => v !== 0).length === 2;

function build(): Tables {
  const base = solvedCube();
  // 24 emplacements d'autocollants d'arêtes
  const edgeStickers = base.filter(isEdge);
  const slotOf = new Map<string, number>();
  edgeStickers.forEach((s, i) => slotOf.set(stickerKey(s.pos, s.normal), i));
  const trans = MOVES.map((m) => {
    const c = cloneCube(edgeStickers.length ? base : base);
    applyMoveInPlace(c, parseMove(m));
    const t = new Int8Array(24);
    // base[i] (si arête) -> où est-il après le mouvement ?
    let k = 0;
    base.forEach((s, i) => {
      if (!isEdge(s)) return;
      const after = c[i];
      t[k++] = slotOf.get(stickerKey(after.pos, after.normal))!;
    });
    return t;
  });
  const crossSlots = edgeStickers
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.pos[1] === -1 && s.normal[1] === -1)
    .map(({ i }) => i);
  const N = 24 ** 4;
  const dist = new Uint8Array(N).fill(255);
  const enc = (a: number, b: number, c: number, d: number) => ((a * 24 + b) * 24 + c) * 24 + d;
  const start = enc(crossSlots[0], crossSlots[1], crossSlots[2], crossSlots[3]);
  dist[start] = 0;
  let frontier = [start];
  let depth = 0;
  while (frontier.length) {
    const next: number[] = [];
    for (const st of frontier) {
      const d = st % 24, c = Math.floor(st / 24) % 24, b = Math.floor(st / 576) % 24, a = Math.floor(st / 13824);
      for (const t of trans) {
        const ns = enc(t[a], t[b], t[c], t[d]);
        if (dist[ns] === 255) {
          dist[ns] = depth + 1;
          next.push(ns);
        }
      }
    }
    frontier = next;
    depth++;
  }
  return { slotOf, trans, dist, crossIds: crossSlots };
}

function getTables() {
  tables ??= build();
  return tables;
}

/**
 * Solution optimale de la croix D pour un état donné (orientation CFOP :
 * centres standards). Renvoie la liste des mouvements.
 */
export function solveCross(state: CubeState): string[] {
  const T = getTables();
  const base = solvedCube();
  // identifier les autocollants D des arêtes de croix par leur origine
  const want = T.crossIds.map((slotIdx) => {
    const edges = base.filter(isEdge);
    const s = edges[slotIdx];
    return { home: s.home.join(), face: s.homeFace };
  });
  const cur = want.map((w) => {
    const s = state.find((x) => x.home.join() === w.home && x.homeFace === w.face)!;
    return T.slotOf.get(stickerKey(s.pos, s.normal))!;
  });
  const enc = (v: number[]) => ((v[0] * 24 + v[1]) * 24 + v[2]) * 24 + v[3];
  const sol: string[] = [];
  let v = cur;
  let d = T.dist[enc(v)];
  // préférence d'ordre : faces confortables d'abord
  const pref = ["R", "U", "F", "L", "D", "B"];
  const order = MOVES.map((m, i) => ({ m, i })).sort((a, b) => pref.indexOf(a.m[0]) - pref.indexOf(b.m[0]));
  while (d > 0) {
    let found = false;
    for (const { m, i } of order) {
      if (sol.length && sol[sol.length - 1][0] === m[0]) continue;
      const nv = v.map((x) => T.trans[i][x]);
      const nd = T.dist[enc(nv)];
      if (nd === d - 1) {
        sol.push(m);
        v = nv;
        d = nd;
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  return sol;
}

/**
 * Pour un mélange WCA (blanc en haut, vert devant) : solution de la croix
 * blanche après z2 (blanc en bas, vert devant).
 */
export function solveWhiteCrossForScramble(scramble: string): string[] {
  // On applique le mélange en orientation WCA puis on retourne le cube (z2).
  // En orientation CFOP, cela revient à appliquer « z2 mélange z2 ».
  const s = applyAlg(solvedCube(), `z2 ${scramble} z2`);
  return solveCross(s);
}
