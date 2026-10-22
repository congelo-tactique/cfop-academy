import type { Solve } from "../store/useStore";

/** Temps effectif en ms (Infinity pour un DNF). */
export function effective(s: Solve): number {
  if (s.penalty === "DNF") return Infinity;
  return s.ms + (s.penalty === 2 ? 2000 : 0);
}

export function formatTime(ms: number, decimals = 2): string {
  if (!isFinite(ms)) return "DNF";
  if (ms < 0) ms = 0;
  const totalCs = decimals === 2 ? Math.floor(ms / 10) : Math.floor(ms / 100);
  const div = decimals === 2 ? 100 : 10;
  const sec = Math.floor(totalCs / div);
  const frac = String(totalCs % div).padStart(decimals, "0");
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}.${frac}`;
  }
  return `${sec}.${frac}`;
}

export function formatSolve(s: Solve): string {
  if (s.penalty === "DNF") return "DNF";
  return formatTime(effective(s)) + (s.penalty === 2 ? "+" : "");
}

/**
 * Moyenne WCA « aoN » : on retire 5 % des meilleurs et des pires (au moins 1 de chaque).
 * Renvoie null s'il n'y a pas assez de temps, Infinity si trop de DNF.
 */
export function averageOf(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  const last = solves.slice(-n).map(effective).sort((a, b) => a - b);
  const trim = Math.max(1, Math.ceil(n * 0.05));
  const kept = last.slice(trim, n - trim);
  if (kept.some((x) => !isFinite(x))) return Infinity;
  return kept.reduce((a, b) => a + b, 0) / kept.length;
}

export function meanOf(solves: Solve[]): number | null {
  const ok = solves.map(effective).filter(isFinite);
  if (!ok.length) return null;
  return ok.reduce((a, b) => a + b, 0) / ok.length;
}

export function best(solves: Solve[]): number | null {
  const ok = solves.map(effective).filter(isFinite);
  return ok.length ? Math.min(...ok) : null;
}

export function bestAverage(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  let b = Infinity;
  for (let i = n; i <= solves.length; i++) {
    const a = averageOf(solves.slice(i - n, i), n);
    if (a !== null && a < b) b = a;
  }
  return b;
}

/** Série glissante des aoN (null tant qu'il n'y a pas assez de temps). */
export function rollingAverage(solves: Solve[], n: number): (number | null)[] {
  return solves.map((_, i) => (i + 1 >= n ? averageOf(solves.slice(i + 1 - n, i + 1), n) : null));
}

export function fmtNullable(v: number | null): string {
  return v === null ? "–" : formatTime(v);
}
