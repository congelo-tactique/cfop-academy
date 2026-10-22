import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CaseStatus = "new" | "learning" | "learned";
export type Penalty = 0 | 2 | "DNF";
export type Grade = 0 | 1 | 2 | 3; // Raté, Difficile, Bien, Facile

export interface Solve {
  id: string;
  ms: number;
  penalty: Penalty;
  scramble: string;
  date: number;
}

export interface SrsCard {
  due: number;
  interval: number; // en minutes
  ease: number;
  reps: number;
  lapses: number;
  streak: number;
  last?: number;
  times: number[]; // derniers temps d'exécution (ms)
  attempts: number;
  success: number;
}

export interface QuizRecord {
  best: number;
  played: number;
}

interface Settings {
  theme: "dark" | "light";
  animSpeed: number; // ms par quart de tour
  inspection: boolean;
  hideTimeWhileRunning: boolean;
  trainerAuf: boolean;
  showCrossSolution: boolean;
}

interface State extends Settings {
  lessonsDone: Record<string, boolean>;
  caseStatus: Record<string, CaseStatus>;
  preferred: Record<string, number>;
  srs: Record<string, SrsCard>;
  solves: Solve[];
  quiz: Record<string, QuizRecord>;
  scrambleHistory: string[];

  setSetting<K extends keyof Settings>(k: K, v: Settings[K]): void;
  toggleLesson(id: string, done?: boolean): void;
  setCaseStatus(id: string, s: CaseStatus): void;
  setPreferred(id: string, idx: number): void;
  gradeCase(id: string, g: Grade, timeMs?: number): void;
  addSolve(s: Solve): void;
  updateSolve(id: string, patch: Partial<Solve>): void;
  deleteSolve(id: string): void;
  clearSolves(): void;
  recordQuiz(key: string, score: number): void;
  pushScramble(s: string): void;
  importData(data: unknown): boolean;
  resetAll(): void;
}

const DEFAULTS: Settings = {
  theme: "dark",
  animSpeed: 260,
  inspection: true,
  hideTimeWhileRunning: false,
  trainerAuf: true,
  showCrossSolution: false,
};

const MIN = 1;
const DAY = 60 * 24;

export function newCard(): SrsCard {
  return { due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, streak: 0, times: [], attempts: 0, success: 0 };
}

/** Répétition espacée simplifiée (inspirée de SM-2), intervalles en minutes. */
export function schedule(card: SrsCard, g: Grade, now = Date.now()): SrsCard {
  const c = { ...card, times: card.times.slice() };
  c.attempts++;
  c.last = now;
  if (g === 0) {
    c.lapses++;
    c.streak = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.interval = MIN;
  } else {
    c.success++;
    c.streak++;
    c.reps++;
    if (g === 1) {
      c.ease = Math.max(1.3, c.ease - 0.15);
      c.interval = c.interval < 10 ? 10 : c.interval * 1.2;
    } else if (g === 2) {
      c.interval = c.interval < DAY ? (c.reps <= 1 ? 60 * 8 : DAY) : c.interval * c.ease;
    } else {
      c.ease += 0.15;
      c.interval = c.interval < DAY ? 3 * DAY : c.interval * c.ease * 1.3;
    }
  }
  c.due = now + c.interval * 60_000;
  return c;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      lessonsDone: {},
      caseStatus: {},
      preferred: {},
      srs: {},
      solves: [],
      quiz: {},
      scrambleHistory: [],

      setSetting: (k, v) => set({ [k]: v } as Partial<State>),
      toggleLesson: (id, done) =>
        set((s) => ({ lessonsDone: { ...s.lessonsDone, [id]: done ?? !s.lessonsDone[id] } })),
      setCaseStatus: (id, st) => set((s) => ({ caseStatus: { ...s.caseStatus, [id]: st } })),
      setPreferred: (id, idx) => set((s) => ({ preferred: { ...s.preferred, [id]: idx } })),
      gradeCase: (id, g, timeMs) =>
        set((s) => {
          const card = schedule(s.srs[id] ?? newCard(), g);
          if (timeMs && g > 0) {
            card.times.push(timeMs);
            if (card.times.length > 12) card.times.shift();
          }
          const status = s.caseStatus[id] ?? "new";
          let next: CaseStatus = status;
          if (status === "new") next = "learning";
          if (card.streak >= 4 && g >= 2) next = "learned";
          if (g === 0 && status === "learned") next = "learning";
          return { srs: { ...s.srs, [id]: card }, caseStatus: { ...s.caseStatus, [id]: next } };
        }),
      addSolve: (sv) => set((s) => ({ solves: [...s.solves, sv] })),
      updateSolve: (id, patch) => set((s) => ({ solves: s.solves.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSolve: (id) => set((s) => ({ solves: s.solves.filter((x) => x.id !== id) })),
      clearSolves: () => set({ solves: [] }),
      recordQuiz: (key, score) =>
        set((s) => {
          const r = s.quiz[key] ?? { best: 0, played: 0 };
          return { quiz: { ...s.quiz, [key]: { best: Math.max(r.best, score), played: r.played + 1 } } };
        }),
      pushScramble: (sc) => set((s) => ({ scrambleHistory: [sc, ...s.scrambleHistory].slice(0, 30) })),
      importData: (data) => {
        if (!data || typeof data !== "object") return false;
        const d = data as Partial<State>;
        const keys: (keyof State)[] = [
          "lessonsDone", "caseStatus", "preferred", "srs", "solves", "quiz", "scrambleHistory",
          "theme", "animSpeed", "inspection", "hideTimeWhileRunning", "trainerAuf", "showCrossSolution",
        ];
        const patch: Partial<State> = {};
        for (const k of keys) if (k in d) (patch as Record<string, unknown>)[k] = d[k];
        if (Object.keys(patch).length === 0) return false;
        set(patch);
        return true;
      },
      resetAll: () =>
        set({
          ...DEFAULTS, theme: get().theme, lessonsDone: {}, caseStatus: {}, preferred: {}, srs: {}, solves: [], quiz: {}, scrambleHistory: [],
        }),
    }),
    { name: "cfop-academy", version: 1 },
  ),
);

export function exportData(): string {
  const s = useStore.getState();
  const { lessonsDone, caseStatus, preferred, srs, solves, quiz, scrambleHistory, theme, animSpeed, inspection, hideTimeWhileRunning, trainerAuf, showCrossSolution } = s;
  return JSON.stringify(
    { app: "cfop-academy", version: 1, exportedAt: new Date().toISOString(), lessonsDone, caseStatus, preferred, srs, solves, quiz, scrambleHistory, theme, animSpeed, inspection, hideTimeWhileRunning, trainerAuf, showCrossSolution },
    null, 2,
  );
}
