import type { AlgCase, AlgSet } from "./types";

export const OLL2_CASES: AlgCase[] = [
  {
    id: "oll2-line", set: "oll2", name: "Ligne", group: "edges", mask: "oll-edges", goal: "oll-edges",
    algs: ["F (R U R' U') F'"],
    tip: "Deux arêtes jaunes opposées : tenez la ligne à l'horizontale.",
  },
  {
    id: "oll2-l", set: "oll2", name: "Forme en L", group: "edges", mask: "oll-edges", goal: "oll-edges",
    algs: ["F (U R U' R') F'", "f (R U R' U') f'"],
    tip: "Deux arêtes jaunes voisines : placez le « L » en haut à gauche (arêtes arrière et gauche).",
  },
  {
    id: "oll2-dot", set: "oll2", name: "Point", group: "edges", mask: "oll-edges", goal: "oll-edges",
    algs: ["F (R U R' U') F' f (R U R' U') f'"],
    tip: "Aucune arête jaune : on enchaîne deux algorithmes « en F ». Après le premier, on obtient un L.",
  },
  {
    id: "oll2-sune", set: "oll2", name: "Sune", group: "corners", mask: "oll", goal: "oll",
    algs: ["R U R' U R U2 R'"],
    tip: "Un seul coin jaune : placez-le devant à gauche. Le jaune du coin avant droit regarde vers vous.",
  },
  {
    id: "oll2-antisune", set: "oll2", name: "Anti-Sune", group: "corners", mask: "oll", goal: "oll",
    algs: ["R U2 R' U' R U' R'"],
    tip: "Un seul coin jaune : placez-le derrière à droite. Le jaune du coin avant gauche regarde vers vous.",
  },
  {
    id: "oll2-h", set: "oll2", name: "H", group: "corners", mask: "oll", goal: "oll",
    algs: ["(R U2 R' U') (R U R' U') (R U' R')"],
    tip: "Aucun coin jaune : deux paires de phares, devant et derrière.",
  },
  {
    id: "oll2-pi", set: "oll2", name: "Pi", group: "corners", mask: "oll", goal: "oll",
    algs: ["R U2 R2 U' R2 U' R2 U2 R"],
    tip: "Aucun coin jaune : des phares à gauche uniquement.",
  },
  {
    id: "oll2-headlights", set: "oll2", name: "Phares", group: "corners", mask: "oll", goal: "oll",
    algs: ["R2 D' (R U2 R') D (R U2 R)"],
    tip: "Deux coins jaunes devant ; des phares (deux autocollants jaunes) à l'arrière.",
  },
  {
    id: "oll2-t", set: "oll2", name: "T (Caméléon)", group: "corners", mask: "oll", goal: "oll",
    algs: ["(r U R' U') (r' F R F')"],
    tip: "Deux coins jaunes à droite ; à gauche, les autocollants jaunes regardent vers l'avant et vers l'arrière.",
  },
  {
    id: "oll2-bowtie", set: "oll2", name: "Nœud papillon", group: "corners", mask: "oll", goal: "oll",
    algs: ["F' (r U R' U') r' F R"],
    tip: "Deux coins jaunes en diagonale.",
  },
];

export const OLL2_SET: AlgSet = {
  id: "oll2",
  name: "OLL en 2 temps",
  short: "OLL 2-look",
  description: "Orienter la dernière couche en deux étapes : d'abord la croix jaune (3 cas), puis les coins (7 cas).",
  groups: [
    { id: "edges", name: "Étape 1 · La croix jaune", description: "On oriente les arêtes, sans se soucier des coins." },
    { id: "corners", name: "Étape 2 · Les coins", description: "La croix est faite : on oriente les coins." },
  ],
  cases: OLL2_CASES,
  thumb: "ll",
};

export const PLL2_CASES: AlgCase[] = [
  {
    id: "pll2-adj", set: "pll2", name: "Phares (coins adjacents)", group: "corners", mask: "pll-corners", goal: "pll-corners",
    algs: ["(R U R' U') R' F R2 U' R' U' (R U R' F')"],
    tip: "Repérez des « phares » (deux coins de même couleur sur un côté) et placez-les à gauche. C'est la T-perm.",
  },
  {
    id: "pll2-diag", set: "pll2", name: "Diagonale", group: "corners", mask: "pll-corners", goal: "pll-corners",
    algs: ["F (R U' R' U') (R U R' F') (R U R' U') (R' F R F')"],
    tip: "Aucun phare sur aucun côté : deux coins s'échangent en diagonale. C'est la Y-perm.",
  },
  {
    id: "pll2-ua", set: "pll2", name: "Ua-perm", group: "edges", mask: "pll", goal: "pll",
    algs: ["M2 U M U2 M' U M2", "R U' R U R U R U' R' U' R2"],
    tip: "Un côté complet : placez-le à l'arrière. Les trois autres arêtes tournent dans le sens inverse des aiguilles d'une montre.",
  },
  {
    id: "pll2-ub", set: "pll2", name: "Ub-perm", group: "edges", mask: "pll", goal: "pll",
    algs: ["M2 U' M U2 M' U' M2", "R2 U R U R' U' R' U' R' U R'"],
    tip: "Un côté complet : placez-le à l'arrière. Les trois autres arêtes tournent dans le sens des aiguilles d'une montre.",
  },
  {
    id: "pll2-h", set: "pll2", name: "H-perm", group: "edges", mask: "pll", goal: "pll",
    algs: ["M2 U M2 U2 M2 U M2"],
    tip: "Phares sur les quatre côtés ; chaque arête porte la couleur du côté opposé.",
  },
  {
    id: "pll2-z", set: "pll2", name: "Z-perm", group: "edges", mask: "pll", goal: "pll",
    algs: ["M' U M2 U M2 U M' U2 M2 U'"],
    tip: "Phares sur les quatre côtés ; chaque arête porte la couleur d'un côté voisin.",
  },
];

export const PLL2_SET: AlgSet = {
  id: "pll2",
  name: "PLL en 2 temps",
  short: "PLL 2-look",
  description: "Permuter la dernière couche en deux étapes : d'abord les coins (2 cas), puis les arêtes (4 cas).",
  groups: [
    { id: "corners", name: "Étape 1 · Les coins", description: "On place les coins, les arêtes peuvent être mélangées." },
    { id: "edges", name: "Étape 2 · Les arêtes", description: "Les coins sont bien placés : on termine avec les arêtes." },
  ],
  cases: PLL2_CASES,
  thumb: "ll",
};
