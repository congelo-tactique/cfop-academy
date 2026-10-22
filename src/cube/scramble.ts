// Mélanges officiels (random-state, comme TNoodle/WCA) via cubing.js,
// avec repli « random-move » si les workers ne sont pas disponibles.
import { movesToString, parseAlg } from "./cube";

export interface ScrambleResult {
  scramble: string;
  official: boolean;
}

// cubing.js est pré-assemblé dans public/vendor/cubing (scripts/vendor-cubing.mjs) et
// chargé par URL : s'il était ré-empaqueté par Vite, ses web workers ne fonctionneraient plus.
function vendor<T>(name: string): Promise<T> {
  const url = new URL(`${import.meta.env.BASE_URL}vendor/cubing/${name}.js`, document.baseURI).href;
  return import(/* @vite-ignore */ url) as Promise<T>;
}

let scrambleMod: Promise<typeof import("cubing/scramble")> | null = null;

function randomMoveScramble(len = 25): string {
  const faces = ["U", "D", "R", "L", "F", "B"];
  const axis: Record<string, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };
  const out: string[] = [];
  let last = "";
  let prev = "";
  while (out.length < len) {
    const f = faces[Math.floor(Math.random() * 6)];
    if (f === last) continue;
    // évite « R L R » (même axe trois fois)
    if (prev && axis[prev] === axis[f] && axis[last] === axis[f]) continue;
    out.push(f + ["", "'", "2"][Math.floor(Math.random() * 3)]);
    prev = last;
    last = f;
  }
  return out.join(" ");
}

export async function randomScramble333(): Promise<ScrambleResult> {
  try {
    scrambleMod ??= Promise.all([
      vendor<typeof import("cubing/scramble")>("scramble"),
      vendor<typeof import("cubing/search")>("search"),
    ]).then(([scr, search]) => {
      search.setSearchDebug({ logPerf: false });
      return scr;
    });
    const { randomScrambleForEvent } = await scrambleMod;
    const alg = await Promise.race([
      randomScrambleForEvent("333"),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000)),
    ]);
    return { scramble: alg.toString(), official: true };
  } catch (e) {
    console.warn("Mélange random-state indisponible, repli random-move", e);
    return { scramble: randomMoveScramble(), official: false };
  }
}

/** File de mélanges pré-générés pour un affichage instantané. */
export class ScrambleQueue {
  private queue: Promise<ScrambleResult>[] = [];
  constructor(private size = 2) {}
  next(): Promise<ScrambleResult> {
    while (this.queue.length < this.size + 1) this.queue.push(randomScramble333());
    const n = this.queue.shift()!;
    this.queue.push(randomScramble333());
    return n;
  }
}

let searchMods: Promise<[typeof import("cubing/search"), typeof import("cubing/puzzles")]> | null = null;

/**
 * Mélange « naturel » (~20 coups, solveur de Kociemba) qui produit l'état
 * obtenu par `setupAlg` depuis l'orientation CFOP (jaune en haut, vert devant).
 * Le mélange s'applique en tenant le cube blanc en haut, vert devant, puis on fait z2.
 */
export async function kociembaSetup(setupAlg: string): Promise<string | null> {
  try {
    searchMods ??= Promise.all([
      vendor<typeof import("cubing/search")>("search"),
      vendor<typeof import("cubing/puzzles")>("puzzles"),
    ]);
    const [search, puzzles] = await searchMods;
    const kpuzzle = await puzzles.cube3x3x3.kpuzzle();
    const clean = movesToString(parseAlg(setupAlg));
    const pattern = kpuzzle.defaultPattern().applyAlg(`z2 ${clean} z2`);
    const sol = await Promise.race([
      search.experimentalSolve3x3x3IgnoringCenters(pattern),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000)),
    ]);
    return sol.invert().toString().replace(/2'/g, "2");
  } catch (e) {
    console.warn("Solveur indisponible", e);
    return null;
  }
}
