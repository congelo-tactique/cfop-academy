import type { AlgCase, AlgSet, CaseGroup } from "./types";

const groups: CaseGroup[] = [
  { id: "edges", name: "Arêtes seulement", description: "Les coins sont déjà bien placés." },
  { id: "corners", name: "Coins seulement", description: "Les arêtes sont déjà bien placées." },
  { id: "adj", name: "Échange de coins adjacents", description: "On repère une paire de « phares » sur un côté." },
  { id: "diag", name: "Échange de coins en diagonale", description: "Aucun phare : les coins s'échangent en diagonale." },
  { id: "g", name: "Perms G", description: "Un échange de coins combiné à un cycle de trois arêtes." },
];

type Row = [string, string, string[], string];

// [nom, groupe, algorithmes, astuce de reconnaissance]
const rows: Row[] = [
  ["Ua", "edges", ["M2 U M U2 M' U M2", "R U' R U R U R U' R' U' R2"], "Un côté complet (barre de 3) : placez-le à l'arrière. Les trois autres arêtes tournent dans le sens inverse des aiguilles d'une montre."],
  ["Ub", "edges", ["M2 U' M U2 M' U' M2", "R2 U R U R' U' R' U' R' U R'"], "Un côté complet (barre de 3) : placez-le à l'arrière. Les trois autres arêtes tournent dans le sens des aiguilles d'une montre."],
  ["H", "edges", ["M2 U M2 U2 M2 U M2", "M2 U' M2 U2 M2 U' M2"], "Phares sur les quatre côtés ; chaque arête porte la couleur du côté opposé."],
  ["Z", "edges", ["M' U M2 U M2 U M' U2 M2"], "Phares sur les quatre côtés ; chaque arête porte la couleur d'un côté voisin."],
  ["Aa", "corners", ["x (R' U R') D2 (R U' R') D2 R2 x'"], "Phares sur un seul côté (ici à l'arrière) et toutes les arêtes en place : trois coins tournent."],
  ["Ab", "corners", ["x R2 D2 (R U R') D2 (R U' R) x'"], "Phares sur un seul côté (ici à droite) et toutes les arêtes en place : trois coins tournent, dans l'autre sens que Aa."],
  ["E", "corners", ["x' (R U' R' D) (R U R' D') (R U R' D) (R U' R' D') x", "x' L' U L D' L' U' L D L' U' L D' L' U L D x"], "Aucun phare et toutes les arêtes en place : sur chaque côté, les deux coins sont de couleurs différentes."],
  ["T", "adj", ["(R U R' U') R' F R2 U' R' U' (R U R' F')"], "Phares à gauche, encadrant l'arête de la couleur opposée ; un bloc de 2 devant et un derrière."],
  ["F", "adj", ["R' U' F' (R U R' U') R' F R2 U' R' U' R U R' U R"], "Une barre complète de 3 sur un côté (ici à gauche) et aucun phare ailleurs."],
  ["Ja", "adj", ["x R2 F R F' R U2 r' U r U2 x'", "R' U L' U2 R U' R' U2 R L"], "Une barre de 3 à gauche, prolongée par un bloc de 2 devant et un derrière : un grand bloc en J."],
  ["Jb", "adj", ["(R U R' F') (R U R' U') R' F R2 U' R'", "R U2 R' U' R U2 L' U R' U' L"], "Une barre de 3 à gauche et un bloc de 2 devant à droite."],
  ["Ra", "adj", ["(R U' R' U') (R U R D) (R' U' R D') R' U2 R'"], "Phares à gauche (avec une arête d'une couleur voisine entre eux) et un bloc de 2 devant à gauche."],
  ["Rb", "adj", ["R2 F R U R U' R' F' R U2 R' U2 R"], "Phares à gauche (avec une arête d'une couleur voisine entre eux) et un bloc de 2 à l'arrière."],
  ["V", "diag", ["R' U R' U' y R' F' R2 U' R' U R' F R F", "R' U R' d' R' F' R2 U' R' U R' F R F"], "Coins à échanger en diagonale et un seul bloc 2×2 (un coin et ses deux arêtes) devant à gauche."],
  ["Y", "diag", ["F (R U' R' U') (R U R' F') (R U R' U') (R' F R F')"], "Coins à échanger en diagonale et deux blocs de 2 séparés (devant à gauche et à droite vers l'arrière)."],
  ["Na", "diag", ["(R U R' U) (R U R' F') (R U R' U') (R' F R2 U' R') U2 (R U' R')"], "Coins en diagonale ; chaque côté montre un bloc de 2, en « escalier ». Symétrique de Nb."],
  ["Nb", "diag", ["R' U R U' R' F' U' F R U R' F R' F' R U' R", "r' D' F r U' r' F' D r2 U r' U' r' F r F'"], "Coins en diagonale ; chaque côté montre un bloc de 2, en « escalier ». Symétrique de Na."],
  ["Ga", "g", ["R2 U R' U R' U' R U' R2 U' D R' U R D'"], "Phares à gauche et un bloc de 2 devant à droite."],
  ["Gb", "g", ["R' U' R U D' R2 U R' U R U' R U' R2 D"], "Phares à gauche et un bloc de 2 sur le côté droit, vers l'arrière."],
  ["Gc", "g", ["R2 U' R U' R U R' U R2 U D' R U' R' D"], "Phares à gauche et un bloc de 2 à l'arrière."],
  ["Gd", "g", ["R U R' U' D R2 U' R U' R' U R' U R2 D'"], "Phares à gauche et un bloc de 2 sur le côté droit, vers l'avant."],
];

export const PLL_CASES: AlgCase[] = rows.map(([name, group, algs, tip]) => ({
  id: `pll-${name}`,
  set: "pll",
  name: `${name}-perm`,
  group,
  algs,
  mask: "pll",
  goal: "pll",
  tip,
}));

export const PLL_SET: AlgSet = {
  id: "pll",
  name: "PLL complète",
  short: "PLL",
  description: "Les 21 permutations de la dernière couche, pour finir en un seul algorithme.",
  groups,
  cases: PLL_CASES,
  thumb: "ll",
};
