// Vérifie mécaniquement toutes les données d'algorithmes.
// - chaque algo se lit correctement
// - l'algo principal préserve ce qu'il doit préserver (F2L, croix, autres paires…)
// - les alternatives résolvent le même cas (à l'AUF près)
// - les cas d'un même set sont tous distincts
// - contrôles de catégorie OLL / PLL
import { applyAlg, caseState, faceColors, solvedCube, stickerHome, validateAlg, type CubeState } from "../src/cube/cube.ts";
import { LBL, LBL_DEMOS } from "../src/lessons/lblAlgs.ts";
import { alignAlg, goalReached, normalizeOrientation } from "../src/cube/goals.ts";
import { SETS } from "../src/data/index.ts";

let errors = 0;
const err = (m: string) => { errors++; console.log("  ✗ " + m); };

function llSignature(s: CubeState, withColors: boolean): string {
  // signature de la dernière couche, minimale sur les 4 rotations U (pré-AUF)
  // et, pour la permutation, sur les 4 AUF après.
  const sigs: string[] = [];
  for (const pre of ["", "U", "U2", "U'"]) {
    for (const post of withColors ? ["", "U", "U2", "U'"] : [""]) {
      const t = normalizeOrientation(applyAlg(s, `${pre} ${post}`));
      const fc = faceColors(t);
      const uCol = fc.U[4];
      const parts: string[] = [];
      for (const f of ["U", "F", "R", "B", "L"] as const) {
        const cells = f === "U" ? fc.U : fc[f].slice(0, 3);
        parts.push(cells.map((c) => (withColors ? c : c === uCol ? "1" : "0")).join(""));
      }
      sigs.push(parts.join("|"));
    }
  }
  // pour PLL : on veut l'invariance par conjugaison U (rotation de l'observateur)
  // + AUF après : on prend le minimum.
  return sigs.sort()[0];
}

function edgesOriented(s: CubeState): number {
  const fc = faceColors(normalizeOrientation(s));
  return [1, 3, 5, 7].filter((i) => fc.U[i] === fc.U[4]).length;
}
function cornersOriented(s: CubeState): number {
  const fc = faceColors(normalizeOrientation(s));
  return [0, 2, 6, 8].filter((i) => fc.U[i] === fc.U[4]).length;
}

for (const set of SETS) {
  console.log(`\n== ${set.name} (${set.cases.length} cas)`);
  const seen = new Map<string, string>();
  for (const c of set.cases) {
    for (const a of c.algs) {
      const bad = validateAlg(a);
      if (bad) err(`${c.name}: jeton invalide « ${bad} » dans ${a}`);
    }
    const st = caseState(c.algs[0]);
    // ce que le cas doit préserver
    const f2lOk = goalReached(st, "f2l");
    if (c.goal !== "f2l" && !f2lOk) err(`${c.name}: l'algo principal casse le F2L`);
    if (c.goal === "f2l") {
      if (!goalReached(st, "cross")) err(`${c.name}: casse la croix`);
      // seules les pièces de la paire avant-droite (ou d'une seule paire) bougent
      const moved = new Set(
        st.filter((x) => x.home[1] <= 0)
          .filter((x) => !stickerHome(x))
          .map((x) => x.home.join()),
      );
      const pairKeys = new Set(["1,0,1", "1,-1,1"]);
      if (moved.size === 0 || [...moved].some((k) => !pairKeys.has(k)))
        err(`${c.name}: pièces F2L déplacées hors de la paire avant-droite : ${[...moved].join(" ")}`);
    }
    if (c.goal === "pll" || c.goal === "pll-corners") {
      if (!goalReached(st, "oll")) err(`${c.name}: le cas n'est pas déjà orienté`);
    }
    // « arêtes seulement » : les coins doivent être à leur place dans le schéma affiché
    if (c.group === "edges" && (c.goal === "pll" || c.set === "pll2")) {
      const ok = st.filter((x) => x.home[1] === 1 && x.pos.every((v) => v !== 0)).every(stickerHome);
      if (!ok) err(`${c.name}: les coins ne sont pas en place alors que le cas est classé « arêtes seulement »`);
    }
    if (c.goal === "oll" && c.set !== "oll2" && goalReached(st, "oll")) err(`${c.name}: cas déjà orienté`);
    if (goalReached(st, c.goal)) err(`${c.name}: le cas est déjà résolu`);
    // l'algo principal résout bien
    if (!goalReached(applyAlg(st, c.algs[0]), c.goal)) err(`${c.name}: l'algo principal ne résout pas`);
    // alternatives
    for (const a of c.algs.slice(1)) {
      const al = alignAlg(st, a, c.goal);
      if (!al) err(`${c.name}: alternative incorrecte : ${a}`);
      else if (al !== a) console.log(`  · ${c.name}: alternative ajustée « ${a} » -> « ${al} »`);
    }
    // unicité
    let sig: string;
    if (c.goal === "f2l") {
      // signature de la paire, normalisée par AUF
      const variants = ["", "U", "U2", "U'"].map((u) => {
        const t = applyAlg(st, u);
        return t.filter((x) => x.home[0] === 1 && x.home[2] === 1 && x.home[1] <= 0)
          .map((x) => `${x.homeFace}@${x.pos.join()}/${x.normal.join()}`).sort().join(";");
      });
      sig = variants.sort()[0];
    } else if (c.goal === "oll" || c.goal === "oll-edges") {
      sig = llSignature(st, false);
      if (c.goal === "oll-edges") sig = sig.split("|")[0].split("").filter((_, i) => i % 2 === 1).join("");
    } else {
      sig = llSignature(st, true);
    }
    if (seen.has(sig)) err(`${c.name}: même cas que ${seen.get(sig)}`);
    seen.set(sig, c.name);

    // contrôles de catégorie OLL
    if (c.set === "oll") {
      const e = edgesOriented(st);
      const co = cornersOriented(st);
      const expectE = c.group === "dot" ? 0 : c.group === "ocll" ? 4 : 2;
      if (e !== expectE) err(`${c.name} (${c.group}): ${e} arêtes orientées, attendu ${expectE}`);
      if (c.group === "corners" && co !== 4) err(`${c.name}: coins non orientés`);
      if (c.group === "i") {
        const fc = faceColors(normalizeOrientation(st));
        const line = (fc.U[1] === fc.U[4] && fc.U[7] === fc.U[4]) || (fc.U[3] === fc.U[4] && fc.U[5] === fc.U[4]);
        if (!line) err(`${c.name}: pas une ligne`);
      }
    }
  }
  console.log(`  ${seen.size} cas distincts`);
}

// ---------------------------------------------------------------------------
// Méthode débutant (LBL)
// ---------------------------------------------------------------------------
console.log("\n== Méthode débutant");
{
  const solvedSt = solvedCube();
  for (const [name, d] of Object.entries(LBL_DEMOS)) {
    const st = applyAlg(solvedSt, d.setup);
    if (goalReached(st, d.goal)) err(`démo ${name} : déjà résolue au départ`);
    if (!goalReached(applyAlg(st, d.alg), d.goal)) err(`démo ${name} : la séquence n'atteint pas l'objectif`);
  }
  const movedHomes = (st: CubeState) => [...new Set(st.filter((x) => !stickerHome(x)).map((x) => x.home.join()))].sort();
  const isTopEdge = (h: string) => { const v = h.split(",").map(Number); return v[1] === 1 && v.filter((x) => x !== 0).length === 2; };
  // arêtes de 2e couche : seule l'arête visée bouge parmi les deux premières couches
  for (const [a, home] of [[LBL.rightEdge, "1,0,1"], [LBL.leftEdge, "-1,0,1"]] as const) {
    const m = movedHomes(caseState(a)).filter((h) => Number(h.split(",")[1]) <= 0);
    if (m.join() !== home) err(`${a} : pièces des 2 premières couches déplacées : ${m.join(" ")}`);
  }
  // échange d'arêtes : avant et gauche échangées, arrière et droite intactes
  const sw = applyAlg(solvedSt, LBL.edgeSwap);
  const swEdges = movedHomes(sw).filter(isTopEdge);
  if (swEdges.join(" ") !== "-1,1,0 0,1,1" || !goalReached(sw, "f2l")) err(`${LBL.edgeSwap} : effet inattendu (${swEdges.join(" ")})`);
  // placement des coins : le coin avant-droit et les arêtes ne bougent pas
  const cc = applyAlg(solvedSt, LBL.cornerCycle);
  const ccMoved = movedHomes(cc);
  if (ccMoved.includes("1,1,1") || ccMoved.length !== 3 || !goalReached(cc, "f2l")) err(`${LBL.cornerCycle} : effet inattendu (${ccMoved.join(" ")})`);
  // orientation : 6 répétitions = identité
  if (!goalReached(applyAlg(solvedSt, Array(6).fill(LBL.cornerTwist).join(" ")), "solved")) err("R' D' R D x6 n'est pas l'identité");
  console.log("  démos et algorithmes vérifiés");
}

console.log(errors ? `\n${errors} erreur(s)` : "\nTout est correct ✓");
process.exit(errors ? 1 : 0);
