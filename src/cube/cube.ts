// Moteur de cube 3x3 basé sur les autocollants (stickers).
// Chaque sticker connaît la position de son cubie, sa normale (la face vers
// laquelle il pointe) et son « origine » (position/normale dans l'état résolu).
// Repère : x vers la droite (R), y vers le haut (U), z vers l'avant (F).

export type Vec3 = [number, number, number];
export type Face = "U" | "D" | "R" | "L" | "F" | "B";
export type Axis = 0 | 1 | 2;

export const FACES: Face[] = ["U", "R", "F", "D", "L", "B"];

export const FACE_NORMAL: Record<Face, Vec3> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

/** Couleur logique d'un sticker : on la nomme par la couleur réelle. */
export type Color = "W" | "Y" | "G" | "B" | "R" | "O";

/** Schéma de couleurs : quelle couleur sur quelle face à l'état résolu. */
export type Scheme = Record<Face, Color>;

/** Orientation WCA pour mélanger : blanc en haut, vert devant. */
export const WCA_SCHEME: Scheme = { U: "W", D: "Y", F: "G", B: "B", R: "R", L: "O" };
/** Orientation CFOP de résolution : jaune en haut, vert devant (z2 depuis WCA). */
export const CFOP_SCHEME: Scheme = { U: "Y", D: "W", F: "G", B: "B", R: "O", L: "R" };

export interface Sticker {
  pos: Vec3;
  normal: Vec3;
  color: Color;
  /** Position du cubie dans l'état résolu (identité de la pièce). */
  home: Vec3;
  /** Face d'origine du sticker dans l'état résolu. */
  homeFace: Face;
}

export type CubeState = Sticker[];

export function normalToFace(n: Vec3): Face {
  if (n[0] === 1) return "R";
  if (n[0] === -1) return "L";
  if (n[1] === 1) return "U";
  if (n[1] === -1) return "D";
  if (n[2] === 1) return "F";
  return "B";
}

export function solvedCube(scheme: Scheme = CFOP_SCHEME): CubeState {
  const stickers: Sticker[] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const p: Vec3 = [x, y, z];
        for (const f of FACES) {
          const n = FACE_NORMAL[f];
          const axis = n.findIndex((v) => v !== 0);
          if (p[axis] === n[axis]) {
            stickers.push({ pos: [...p], normal: [...n], color: scheme[f], home: [...p], homeFace: f });
          }
        }
      }
  return stickers;
}

export function cloneCube(c: CubeState): CubeState {
  return c.map((s) => ({ ...s, pos: [...s.pos] as Vec3, normal: [...s.normal] as Vec3 }));
}

// Rotation d'un quart de tour (+90°, règle de la main droite) autour d'un axe.
function rot90(v: Vec3, axis: Axis): Vec3 {
  const [x, y, z] = v;
  if (axis === 0) return [x, -z, y];
  if (axis === 1) return [z, y, -x];
  return [-y, x, z];
}

export function rotateVec(v: Vec3, axis: Axis, quarterTurns: number): Vec3 {
  let r = v;
  const k = ((quarterTurns % 4) + 4) % 4;
  for (let i = 0; i < k; i++) r = rot90(r, axis);
  return r;
}

// ---------------------------------------------------------------------------
// Mouvements
// ---------------------------------------------------------------------------

export interface MoveDef {
  axis: Axis;
  layers: number[];
  /** Sens d'un quart de tour « horaire » exprimé en quarts de tour autour de +axe. */
  dir: 1 | -1;
}

const ALL = [-1, 0, 1];

export const MOVE_DEFS: Record<string, MoveDef> = {
  R: { axis: 0, layers: [1], dir: -1 },
  L: { axis: 0, layers: [-1], dir: 1 },
  U: { axis: 1, layers: [1], dir: -1 },
  D: { axis: 1, layers: [-1], dir: 1 },
  F: { axis: 2, layers: [1], dir: -1 },
  B: { axis: 2, layers: [-1], dir: 1 },
  M: { axis: 0, layers: [0], dir: 1 },
  E: { axis: 1, layers: [0], dir: 1 },
  S: { axis: 2, layers: [0], dir: -1 },
  r: { axis: 0, layers: [0, 1], dir: -1 },
  l: { axis: 0, layers: [-1, 0], dir: 1 },
  u: { axis: 1, layers: [0, 1], dir: -1 },
  d: { axis: 1, layers: [-1, 0], dir: 1 },
  f: { axis: 2, layers: [0, 1], dir: -1 },
  b: { axis: 2, layers: [-1, 0], dir: 1 },
  x: { axis: 0, layers: ALL, dir: -1 },
  y: { axis: 1, layers: ALL, dir: -1 },
  z: { axis: 2, layers: ALL, dir: -1 },
};

export interface Move {
  /** Nom canonique de la famille : R, r, M, x… (Rw est normalisé en r). */
  family: string;
  /** Nombre de quarts de tour : 1, 2 ou -1 (prime). 2' est stocké -2. */
  amount: number;
  /** Écriture telle que saisie (pour l'affichage). */
  raw: string;
}

const MOVE_RE = /^([URFDLB]w|[URFDLBurfdlbMESxyz])(\d*)('?)$/;

export class AlgParseError extends Error {
  token: string;
  constructor(token: string) {
    super(`Mouvement inconnu : « ${token} »`);
    this.token = token;
  }
}

/** Normalise les variantes typographiques (’ ′ etc.) et découpe en jetons. */
export function tokenize(alg: string): string[] {
  const cleaned = alg
    .replace(/[’′‘`´]/g, "'")
    .replace(/[()[\]{},]/g, " ")
    .replace(/\/\/.*$/gm, " ");
  // Sépare aussi les mouvements collés : "RUR'" -> R U R'
  const out: string[] = [];
  const re = /([URFDLB]w|[URFDLBurfdlbMESxyz])(\d*)('?)|(\S)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned))) {
    if (m[4] !== undefined) {
      out.push(m[4]);
    } else {
      out.push(m[0]);
    }
  }
  return out;
}

export function parseMove(token: string): Move {
  const m = MOVE_RE.exec(token);
  if (!m) throw new AlgParseError(token);
  let family = m[1];
  if (family.length === 2) family = family[0].toLowerCase(); // Rw -> r
  const n = m[2] === "" ? 1 : parseInt(m[2], 10);
  if (!(n >= 1 && n <= 3)) throw new AlgParseError(token);
  let amount = n === 3 ? -1 : n;
  if (m[3] === "'") amount = -amount;
  return { family, amount, raw: token };
}

export function parseAlg(alg: string): Move[] {
  return tokenize(alg).map(parseMove);
}

/** Vérifie un algorithme ; renvoie null si valide, sinon le jeton fautif. */
export function validateAlg(alg: string): string | null {
  try {
    parseAlg(alg);
    return null;
  } catch (e) {
    if (e instanceof AlgParseError) return e.token;
    throw e;
  }
}

export function moveToString(m: Move): string {
  const a = m.amount;
  const suffix = a === 1 ? "" : a === -1 ? "'" : a === 2 ? "2" : a === -2 ? "2'" : "";
  return m.family + suffix;
}

export function invertMove(m: Move): Move {
  const amount = -m.amount;
  const mv: Move = { family: m.family, amount, raw: "" };
  mv.raw = moveToString(mv);
  return mv;
}

export function invertMoves(ms: Move[]): Move[] {
  return ms.slice().reverse().map(invertMove);
}

export function movesToString(ms: Move[]): string {
  return ms.map(moveToString).join(" ");
}

export function invertAlg(alg: string): string {
  return movesToString(invertMoves(parseAlg(alg)));
}

/** Quarts de tour autour de +axe pour l'animation et l'application. */
export function moveQuarterTurns(m: Move): number {
  return MOVE_DEFS[m.family].dir * m.amount;
}

export function applyMoveInPlace(c: CubeState, m: Move): void {
  const def = MOVE_DEFS[m.family];
  const q = def.dir * m.amount;
  for (const s of c) {
    if (def.layers.includes(s.pos[def.axis])) {
      s.pos = rotateVec(s.pos, def.axis, q);
      s.normal = rotateVec(s.normal, def.axis, q);
    }
  }
}

export function applyMoves(c: CubeState, ms: Move[]): CubeState {
  const r = cloneCube(c);
  for (const m of ms) applyMoveInPlace(r, m);
  return r;
}

export function applyAlg(c: CubeState, alg: string): CubeState {
  return applyMoves(c, parseAlg(alg));
}

// ---------------------------------------------------------------------------
// Lecture de l'état
// ---------------------------------------------------------------------------

const key = (p: Vec3) => `${p[0]},${p[1]},${p[2]}`;
export const stickerKey = (pos: Vec3, normal: Vec3) => `${key(pos)}|${key(normal)}`;

/** Position du cubie correspondant à la case (ligne, colonne) d'une face. */
export function faceletPos(face: Face, row: number, col: number): Vec3 {
  switch (face) {
    case "U":
      return [col - 1, 1, row - 1];
    case "D":
      return [col - 1, -1, 1 - row];
    case "F":
      return [col - 1, 1 - row, 1];
    case "B":
      return [1 - col, 1 - row, -1];
    case "R":
      return [1, 1 - row, 1 - col];
    case "L":
      return [-1, 1 - row, col - 1];
  }
}

export type FaceletMap = Map<string, Sticker>;

export function indexStickers(c: CubeState): FaceletMap {
  const m: FaceletMap = new Map();
  for (const s of c) m.set(stickerKey(s.pos, s.normal), s);
  return m;
}

/** Récupère le sticker visible à la case (ligne, colonne) d'une face. */
export function stickerAt(idx: FaceletMap, face: Face, row: number, col: number): Sticker {
  return idx.get(stickerKey(faceletPos(face, row, col), FACE_NORMAL[face]))!;
}

/** Couleurs des 6 faces (9 cases chacune), ordre U R F D L B. */
export function faceColors(c: CubeState): Record<Face, Color[]> {
  const idx = indexStickers(c);
  const out = {} as Record<Face, Color[]>;
  for (const f of FACES) {
    const arr: Color[] = [];
    for (let r = 0; r < 3; r++) for (let col = 0; col < 3; col++) arr.push(stickerAt(idx, f, r, col).color);
    out[f] = arr;
  }
  return out;
}

export function isSolved(c: CubeState): boolean {
  const fc = faceColors(c);
  return FACES.every((f) => fc[f].every((x) => x === fc[f][4]));
}

const eq = (a: Vec3, b: Vec3) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** Un sticker est-il à sa place d'origine (position + orientation) ? */
export function stickerHome(s: Sticker): boolean {
  return eq(s.pos, s.home) && eq(s.normal, FACE_NORMAL[s.homeFace]);
}

/** Toutes les pièces dont l'origine vérifie `filter` sont-elles en place ? */
export function piecesSolved(c: CubeState, filter: (home: Vec3) => boolean): boolean {
  return c.every((s) => !filter(s.home) || stickerHome(s));
}

// ---------------------------------------------------------------------------
// Rotations du cube entier
// ---------------------------------------------------------------------------

/** Les 24 orientations, chacune exprimée comme une courte séquence de rotations. */
export const ROTATIONS: string[] = (() => {
  const seqs = ["", "y", "y2", "y'", "x", "x y", "x y2", "x y'", "x2", "x2 y", "x2 y2", "x2 y'",
    "x'", "x' y", "x' y2", "x' y'", "z", "z y", "z y2", "z y'", "z'", "z' y", "z' y2", "z' y'"];
  return seqs;
})();

function centersSignature(c: CubeState): string {
  return c
    .filter((s) => s.pos.filter((v) => v !== 0).length === 1)
    .map((s) => `${s.homeFace}:${key(s.normal)}`)
    .sort()
    .join(";");
}

/** Rotation nette (parmi les 24) produite par un algorithme. */
export function netRotation(alg: string): string {
  const base = solvedCube();
  const after = centersSignature(applyAlg(base, alg));
  for (const r of ROTATIONS) {
    if (centersSignature(applyAlg(base, r)) === after) return r;
  }
  return "";
}

/**
 * État « cas » qu'un algorithme résout : centres dans l'orientation standard,
 * et `cas + alg` donne un cube résolu (éventuellement tourné).
 */
export function caseState(alg: string, scheme: Scheme = CFOP_SCHEME, preAuf = ""): CubeState {
  const rot = netRotation(alg);
  let s = solvedCube(scheme);
  s = applyAlg(s, `${rot} ${invertAlg(alg)} ${preAuf}`);
  return s;
}

/** Séquence complète (depuis résolu) qui mène au cas : utile pour les mélanges. */
export function caseSetupAlg(alg: string, preAuf = ""): string {
  return `${netRotation(alg)} ${invertAlg(alg)} ${preAuf}`.trim().replace(/\s+/g, " ");
}
