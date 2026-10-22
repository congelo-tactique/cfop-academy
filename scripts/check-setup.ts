// Vérifie que les mélanges de mise en place (solveur cubing.js) reproduisent bien les cas.
import { applyAlg, caseSetupAlg, faceColors, solvedCube, WCA_SCHEME } from "../src/cube/cube.ts";
import { kociembaSetup } from "../src/cube/scramble.ts";
import { ALL_CASES, getCaseState } from "../src/data/index.ts";

const picks = ["pll2-diag", "pll-Ga", "oll-27", "oll-1", "f2l-12", "f2l-41", "pll-V", "oll2-l"];
let bad = 0;
for (const id of picks) {
  const c = ALL_CASES.find((x) => x.id === id)!;
  for (const auf of ["", "U2"]) {
    const s = await kociembaSetup(caseSetupAlg(c.algs[0], auf));
    if (!s) { console.log(id, "pas de solution"); bad++; continue; }
    const got = faceColors(applyAlg(solvedCube(WCA_SCHEME), `${s} z2`));
    const want = faceColors(getCaseState(c, auf));
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) bad++;
    console.log(id.padEnd(10), auf.padEnd(3), ok ? "OK " : "FAIL", s);
  }
}
console.log(bad ? `${bad} échec(s)` : "Tous les mélanges reproduisent le cas ✓");
process.exit(bad ? 1 : 0);
