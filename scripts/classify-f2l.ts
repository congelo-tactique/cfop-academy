// Classe les cas F2L trouvés par gen-f2l.ts et produit un brouillon de données.
// Usage : npx tsx scripts/classify-f2l.ts f2l10.json
import { readFileSync } from "node:fs";
import { caseState, normalToFace, type Vec3 } from "../src/cube/cube.ts";

const data: { sig: string; algs: { alg: string; score: number }[] }[] = JSON.parse(readFileSync(process.argv[2], "utf8"));

const isCorner = (h: Vec3) => h[0] === 1 && h[1] === -1 && h[2] === 1;
const isEdge = (h: Vec3) => h[0] === 1 && h[1] === 0 && h[2] === 1;

function stripAuf(a: string) {
  return a.replace(/^U[2']?\s+/, "");
}

const rows = data.map((c) => {
  const st = caseState(c.algs[0].alg);
  const corner = st.filter((s) => isCorner(s.home));
  const edge = st.filter((s) => isEdge(s.home));
  const cornerInU = corner[0].pos[1] === 1;
  const edgeInU = edge[0].pos[1] === 1;
  const white = corner.find((s) => s.homeFace === "D")!;
  let group: string;
  const best = c.algs[0];
  if (best.alg.split(" ").length <= 4 && cornerInU && edgeInU) group = "basic";
  else if (cornerInU && edgeInU) {
    const wf = normalToFace(white.normal);
    group = wf === "U" ? "corner-up" : "corner-side";
  } else if (!cornerInU && edgeInU) group = "corner-slot";
  else if (cornerInU && !edgeInU) group = "edge-slot";
  else group = "both-slot";
  // choix : algo principal + alternatives distinctes (hors simple AUF)
  const seen = new Set<string>();
  const picks: string[] = [];
  const sorted = c.algs.slice().sort((a, b) => a.score - b.score);
  for (const a of sorted) {
    const k = stripAuf(a.alg);
    if (seen.has(k)) continue;
    seen.add(k);
    picks.push(a.alg);
  }
  return { group, picks, len: best.score };
});

const order = ["basic", "corner-up", "corner-side", "corner-slot", "edge-slot", "both-slot"];
rows.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.len - b.len);
for (const r of rows) console.log(`  ["${r.group}", ${JSON.stringify(r.picks.slice(0, 3))}],`);
