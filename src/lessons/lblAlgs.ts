// Séquences utilisées par le cours « méthode débutant ».
// Elles sont vérifiées par scripts/verify-algs.ts.
import { invertAlg } from "../cube/cube";
import type { Goal } from "../cube/goals";

export const LBL = {
  sexy: "R U R' U'",
  rightEdge: "U R U' R' U' F' U F",
  leftEdge: "U' L' U L U F U' F'",
  yellowCross: "F R U R' U' F'",
  edgeSwap: "R U R' U R U2 R' U",
  cornerCycle: "U R U' L' U R' U' L",
  cornerTwist: "R' D' R D",
};

export interface LblDemo {
  /** Séquence appliquée au cube résolu pour obtenir l'état de départ. */
  setup: string;
  alg: string;
  goal: Goal;
}

// états de départ obtenus en « défaisant » un algorithme connu
const L_BACK_LEFT = invertAlg("F U R U' R' F'"); // L en haut à gauche
const DOT = invertAlg("F R U R' U' F' f R U R' U' f'"); // aucune arête jaune

export const LBL_DEMOS = {
  daisy: { setup: "F2 R2 B2 L2 U", alg: "U' F2 R2 B2 L2", goal: "cross" },
  corner1: { setup: "U R U' R'", alg: "(R U R' U')", goal: "first-layer" },
  corner3: { setup: "U R U' R' U R U' R' U R U' R'", alg: "(R U R' U') (R U R' U') (R U R' U')", goal: "first-layer" },
  corner5: { setup: "R U R' U'", alg: "(R U R' U') (R U R' U') (R U R' U') (R U R' U') (R U R' U')", goal: "first-layer" },
  crossL: { setup: L_BACK_LEFT, alg: "(F R U R' U' F') (F R U R' U' F')", goal: "oll-edges" },
  crossDot: { setup: DOT, alg: "(F R U R' U' F') U2 (F R U R' U' F') (F R U R' U' F')", goal: "oll-edges" },
} satisfies Record<string, LblDemo>;
