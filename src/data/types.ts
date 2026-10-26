import type { Goal } from "../cube/goals";

export type SetId = "oll2" | "pll2" | "f2l" | "oll" | "pll";

/** Masque d'affichage : quelles pièces sont grisées. */
export type MaskId = "full" | "oll" | "oll-edges" | "pll" | "pll-corners" | "f2l" | "cross" | "first-layer" | "ll-edges";

export interface AlgCase {
  id: string;
  set: SetId;
  /** Nom court affiché : « OLL 27 », « T-perm », « F2L 12 »… */
  name: string;
  /** Surnom optionnel : « Sune », « Phares »… */
  nickname?: string;
  /** Identifiant du groupe dans le set. */
  group: string;
  /** Algorithmes : le premier est l'algorithme principal. */
  algs: string[];
  mask: MaskId;
  goal: Goal;
  /** Astuce de reconnaissance ou d'exécution. */
  tip?: string;
  tags?: string[];
}

export interface CaseGroup {
  id: string;
  name: string;
  description?: string;
}

export interface AlgSet {
  id: SetId;
  name: string;
  short: string;
  description: string;
  groups: CaseGroup[];
  cases: AlgCase[];
  /** Vue 2D par défaut pour les miniatures. */
  thumb: "ll" | "f2l";
}
