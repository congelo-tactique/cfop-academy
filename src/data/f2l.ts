import type { AlgCase, AlgSet, CaseGroup } from "./types";

// Les 41 cas ont été énumérés et résolus par recherche exhaustive
// (scripts/gen-f2l.ts) pour l'emplacement avant-droit, puis triés à la main.
// La numérotation est propre à l'application (regroupée par configuration).

const groups: CaseGroup[] = [
  { id: "basic", name: "Cas de base", description: "La paire est prête : on l'insère en 3 ou 4 mouvements. Tous les autres cas se ramènent à ceux-ci." },
  { id: "corner-up", name: "Coin en haut, blanc vers le haut", description: "Le coin est dans la couche du haut avec son autocollant blanc vers le ciel." },
  { id: "corner-side", name: "Coin en haut, blanc sur le côté", description: "Le coin et l'arête sont en haut, le blanc du coin regarde sur le côté." },
  { id: "corner-slot", name: "Coin en bas, arête en haut", description: "Le coin est déjà dans son emplacement (bien orienté ou non)." },
  { id: "edge-slot", name: "Arête en bas, coin en haut", description: "L'arête est déjà dans son emplacement (bien orientée ou non)." },
  { id: "both-slot", name: "Les deux en bas", description: "Coin et arête sont dans leur emplacement mais mal orientés." },
];

type Row = [string, string[], string[]?];

// [groupe, algorithmes, tags]
const rows: Row[] = [
  ["basic", ["U (R U' R')", "R U' R'"], ["basic"]],
  ["basic", ["U' (F' U F)", "y' U' (R' U R)"], ["basic"]],
  ["basic", ["F' U' F", "y' (R' U' R)"], ["basic"]],
  ["basic", ["R U R'"], ["basic"]],

  ["corner-up", ["(R U2 R') U' (R U R')"]],
  ["corner-up", ["(R U2 R') U (R U' R')"]],
  ["corner-up", ["(R U R') U (R U' R')", "(R U' R') U2 (R U R')"]],
  ["corner-up", ["R2 U2 R' U' R U' R2"]],
  ["corner-up", ["(R U R') F' U' F", "(R U R') y' (R' U' R)"]],
  ["corner-up", ["y' (R' U2 R) U' (R' U R)", "F' U2 F U' F' U F"]],
  ["corner-up", ["y' (R' U2 R) U (R' U' R)", "F' U2 F U F' U' F"]],
  ["corner-up", ["y' R2 U2 R U R' U R2", "F U R U' R' F' R U' R'"]],

  ["corner-side", ["(R U R') U2 (R U' R')", "(R U R') U' (R U2 R')"]],
  ["corner-side", ["(R U' R') U' (R U R')", "(R U R') U (R U R')"]],
  ["corner-side", ["(R U2 R') U2 (R U' R')", "(R U2 R') U' (R U2 R')"]],
  ["corner-side", ["(R U' R') U (R U R')"]],
  ["corner-side", ["R' U2 R2 U R2 U R", "F' U2 F U' (R U R')"]],
  ["corner-side", ["F' U F U2 (R U R')", "y' (R' U R) U2 y (R U R')"]],
  ["corner-side", ["(R U' R') U2 F' U' F", "(R U' R') U2 y' (R' U' R)"]],
  ["corner-side", ["(R U R') U2 F' U' F", "(R U' R') U F' U' F"]],
  ["corner-side", ["(R U2 R') U F' U' F", "(R U2 R') U y' (R' U' R)"]],
  ["corner-side", ["y' (R' U2 R) U (R' U2 R)", "R2 U2 F R2 F' U2 R2"]],
  ["corner-side", ["y' (R' U' R) U (R' U2 R)", "F R' F' R U2 (R U R')"]],
  ["corner-side", ["y' (R' U R) U' (R' U' R)", "F' U F U' F' U' F"]],

  ["corner-slot", ["(R U' R') U (R U' R')", "(R U' R') U2 (R U2 R')"]],
  ["corner-slot", ["(R U R') U' (R U R')", "F' U F (R U R')"]],
  ["corner-slot", ["(R U2 R') F' U2 F", "(R U R') U F' U2 F"]],
  ["corner-slot", ["(R U' R') F' U' F", "(R U' R') y' (R' U' R)"]],
  ["corner-slot", ["F' U F U (R U' R')", "F' U F U2 (R U2 R')"]],
  ["corner-slot", ["(R U R') U' F' U' F", "(R U2 R') U2 F' U' F"]],

  ["edge-slot", ["(R U' R') U2 (R U' R')", "(R U' R') U' (R U2 R')"]],
  ["edge-slot", ["(R U R') U2 (R U R')", "(R U2 R') U (R U R')"]],
  ["edge-slot", ["(R U2 R') F' U' F", "F' U F (R U2 R')"]],
  ["edge-slot", ["R2 U2 R2 U' R2 U' R2", "R2 U R2 U R2 U2 R2"]],
  ["edge-slot", ["F' U' F U (R U' R')", "F' U' F U' (R U R')"]],
  ["edge-slot", ["(R U' R') U' F' U' F", "(R U R') U F' U' F"]],

  ["both-slot", ["(R U' R') U' (R U R') U2 (R U' R')", "R2 U2 R' U' R U' R' U2 R'"]],
  ["both-slot", ["(R U' R') U (R U2 R') U (R U' R')", "R U2 R U R' U R U2 R2"]],
  ["both-slot", ["R U F (R U R' U') F' R'", "(R U' R') U2 (R U R') F' U' F"]],
  ["both-slot", ["R F (U R U' R') F' U' R'", "F' U F (R U' R') U2 (R U R')"]],
  ["both-slot", ["R2 U2 F R2 F' U2 R' U R'", "(R U' R') d (R' U2 R) U2 (R' U R)"]],
];

export const F2L_CASES: AlgCase[] = rows.map(([group, algs, tags], i) => ({
  id: `f2l-${i + 1}`,
  set: "f2l",
  name: `F2L ${i + 1}`,
  group,
  algs,
  mask: "f2l",
  goal: "f2l",
  tags,
}));

export const F2L_SET: AlgSet = {
  id: "f2l",
  name: "F2L avancé",
  short: "F2L",
  description: "Les 41 configurations d'une paire coin-arête, avec des algorithmes optimisés pour l'emplacement avant-droit.",
  groups,
  cases: F2L_CASES,
  thumb: "f2l",
};
