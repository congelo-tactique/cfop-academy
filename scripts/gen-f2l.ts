// Génère les 41 cas de F2L (slot avant-droit) et cherche des algorithmes
// ergonomiques par recherche exhaustive dans <R,U> et <R,U,F>.
// Usage : npx tsx scripts/gen-f2l.ts > scratch.json
import {
  solvedCube, applyMoveInPlace, parseMove, stickerKey, cloneCube, type Vec3,
} from "../src/cube/cube.ts";

const base = solvedCube();
const N = base.length;
const slotIndex = new Map<string, number>();
base.forEach((s, i) => slotIndex.set(stickerKey(s.pos, s.normal), i));

function permFor(token: string): Int8Array {
  const c = cloneCube(base);
  applyMoveInPlace(c, parseMove(token));
  const t = new Int8Array(N);
  c.forEach((s, i) => (t[i] = slotIndex.get(stickerKey(s.pos, s.normal))!));
  return t; // sticker initialement au slot i -> slot t[i]
}

const FACES_ALL = ["R", "U", "F"];
const moveTokens: string[] = [];
for (const f of FACES_ALL) for (const s of ["", "2", "'"]) moveTokens.push(f + s);
const perms = moveTokens.map(permFor);

const isPair = (h: Vec3) => (h[0] === 1 && h[2] === 1 && h[1] === 0) || (h[0] === 1 && h[1] === -1 && h[2] === 1);
// Slots à préserver : pièces d'origine y <= 0 hors paire FR.
const keep: number[] = [];
const pairStickers: number[] = [];
base.forEach((s, i) => {
  if (s.home[1] <= 0 && !isPair(s.home)) keep.push(i);
  if (isPair(s.home)) pairStickers.push(i);
});
const uPerm = permFor("U");

// état : content[slot] = id du sticker
function apply(content: Int8Array, p: Int8Array): Int8Array {
  const out = new Int8Array(N);
  for (let s = 0; s < N; s++) out[p[s]] = content[s];
  return out;
}

function signature(content: Int8Array): string {
  // position (slot) de chaque sticker de la paire, normalisée par AUF
  const where = new Int8Array(N);
  for (let s = 0; s < N; s++) where[content[s]] = s;
  let best = "";
  let slots = pairStickers.map((id) => where[id]);
  for (let k = 0; k < 4; k++) {
    const sig = slots.join(",");
    if (best === "" || sig < best) best = sig;
    slots = slots.map((s) => uPerm[s]);
  }
  return best;
}

interface Found { alg: string; score: number; }
const found = new Map<string, Found[]>();

function score(tokens: string[]): number {
  let sc = tokens.length;
  for (const t of tokens) {
    if (t[0] === "F") sc += 0.8;
    if (t[1] === "2" && t[0] !== "U") sc += 0.3;
  }
  // un mélange R/F au milieu est moins fluide
  for (let i = 1; i < tokens.length; i++) if (tokens[i][0] === "F" && tokens[i - 1][0] === "R") sc += 0.3;
  return sc;
}

function invertTokens(ts: string[]): string[] {
  return ts.slice().reverse().map((t) => (t.endsWith("'") ? t[0] : t.endsWith("2") ? t : t + "'"));
}

function record(seq: number[], content: Int8Array) {
  for (const s of keep) if (content[s] !== s) return;
  // paire résolue ?
  let solved = true;
  for (const id of pairStickers) if (content[id] !== id) { solved = false; break; }
  if (solved) return;
  const sig = signature(content);
  const alg = invertTokens(seq.map((i) => moveTokens[i]));
  const sc = score(alg);
  const list = found.get(sig) ?? [];
  const algStr = alg.join(" ");
  if (list.some((f) => f.alg === algStr)) return;
  list.push({ alg: algStr, score: sc });
  list.sort((a, b) => a.score - b.score);
  if (list.length > 6) list.length = 6;
  found.set(sig, list);
}

function dfs(content: Int8Array, seq: number[], depth: number, maxDepth: number, faces: number[]) {
  if (seq.length > 0) record(seq, content);
  if (depth === maxDepth) return;
  const last = seq.length ? Math.floor(seq[seq.length - 1] / 3) : -1;
  for (const f of faces) {
    if (f === last) continue;
    // la séquence B commence par autre chose que U (sinon l'algo finit par U inutile)
    if (seq.length === 0 && FACES_ALL[f] === "U") continue;
    for (let v = 0; v < 3; v++) {
      const mi = f * 3 + v;
      seq.push(mi);
      dfs(apply(content, perms[mi]), seq, depth + 1, maxDepth, faces);
      seq.pop();
    }
  }
}

const start = new Int8Array(N);
for (let i = 0; i < N; i++) start[i] = i;

const t0 = Date.now();
dfs(start, [], 0, 14, [0, 1]); // <R,U>
console.error("RU done", found.size, (Date.now() - t0) / 1000);
dfs(start, [], 0, Number(process.argv[2] ?? 9), [0, 1, 2]); // <R,U,F>
console.error("RUF done", found.size, (Date.now() - t0) / 1000);

const out = [...found.entries()].map(([sig, list]) => ({ sig, algs: list }));
console.log(JSON.stringify(out, null, 1));
