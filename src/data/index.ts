import { caseState, solvedCube, type CubeState } from "../cube/cube";
import { alignAlg } from "../cube/goals";
import { F2L_SET } from "./f2l";
import { OLL_SET } from "./oll";
import { PLL_SET } from "./pll";
import { OLL2_SET, PLL2_SET } from "./twoLook";
import type { AlgCase, AlgSet, SetId } from "./types";

export * from "./types";

export const SETS: AlgSet[] = [OLL2_SET, PLL2_SET, F2L_SET, OLL_SET, PLL_SET];

export const SET_BY_ID = Object.fromEntries(SETS.map((s) => [s.id, s])) as Record<SetId, AlgSet>;

export const ALL_CASES: AlgCase[] = SETS.flatMap((s) => s.cases);

export const CASE_BY_ID: Record<string, AlgCase> = Object.fromEntries(ALL_CASES.map((c) => [c.id, c]));

const stateCache = new Map<string, CubeState>();

/** État affiché d'un cas (défini par son algorithme principal). */
export function getCaseState(c: AlgCase, preAuf = ""): CubeState {
  const k = `${c.id}|${preAuf}`;
  let s = stateCache.get(k);
  if (!s) {
    s = caseState(c.algs[0], undefined, preAuf);
    stateCache.set(k, s);
  }
  return s;
}

const alignedCache = new Map<string, string[]>();

/**
 * Algorithmes du cas, chacun ajusté (AUF) pour résoudre exactement l'état affiché.
 * Les alternatives invalides sont écartées.
 */
export function getAlignedAlgs(c: AlgCase): string[] {
  let out = alignedCache.get(c.id);
  if (!out) {
    const st = getCaseState(c);
    out = [c.algs[0]];
    for (const a of c.algs.slice(1)) {
      const al = alignAlg(st, a, c.goal);
      if (al && !out.includes(al)) out.push(al);
    }
    alignedCache.set(c.id, out);
  }
  return out;
}

export function solved(): CubeState {
  return solvedCube();
}
