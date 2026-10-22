import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw, Trash2 } from "lucide-react";
import { applyAlg, solvedCube, WCA_SCHEME } from "../cube/cube";
import { ScrambleQueue } from "../cube/scramble";
import { solveWhiteCrossForScramble } from "../cube/crossSolver";
import { CubeNet } from "../components/Diagrams";
import { Switch, toast } from "../components/ui";
import { useStore, type Penalty, type Solve } from "../store/useStore";
import {
  averageOf, best, bestAverage, effective, fmtNullable, formatSolve, formatTime, meanOf, rollingAverage,
} from "../lib/stats";

type Phase = "idle" | "inspecting" | "holding" | "ready" | "running" | "done";

const HOLD_MS = 300;

function TimesChart({ solves }: { solves: Solve[] }) {
  const data = solves.slice(-60);
  if (data.length < 2) return <p className="small muted">Le graphique apparaît après quelques résolutions.</p>;
  const vals = data.map(effective);
  const avg = rollingAverage(solves, 5).slice(-60);
  const finite = [...vals, ...avg.filter((x): x is number => x !== null)].filter(isFinite);
  const min = Math.min(...finite), max = Math.max(...finite);
  const pad = (max - min) * 0.12 || 1000;
  const lo = min - pad, hi = max + pad;
  const W = 320, H = 150, L = 34, R = 6, T = 8, B = 16;
  const x = (i: number) => L + (i / (data.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const path = (arr: (number | null)[]) => {
    let d = "";
    let pen = false;
    arr.forEach((v, i) => {
      if (v === null || !isFinite(v)) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const ticks = [lo + pad, (lo + hi) / 2, hi - pad];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Évolution des temps">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid-line" />
          <text x={L - 4} y={y(t) + 3} textAnchor="end">{formatTime(t, 1)}</text>
        </g>
      ))}
      <path d={path(vals)} className="line-single" />
      <path d={path(avg)} className="line-avg" />
    </svg>
  );
}

export function TimerPage() {
  const solves = useStore((s) => s.solves);
  const addSolve = useStore((s) => s.addSolve);
  const updateSolve = useStore((s) => s.updateSolve);
  const deleteSolve = useStore((s) => s.deleteSolve);
  const clearSolves = useStore((s) => s.clearSolves);
  const inspection = useStore((s) => s.inspection);
  const hideTime = useStore((s) => s.hideTimeWhileRunning);
  const showCross = useStore((s) => s.showCrossSolution);
  const setSetting = useStore((s) => s.setSetting);

  const queue = useRef(new ScrambleQueue(2));
  const [scramble, setScramble] = useState<{ scramble: string; official: boolean } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [display, setDisplay] = useState(0);
  const [inspLeft, setInspLeft] = useState(15);
  const [showNet, setShowNet] = useState(true);
  const phaseRef = useRef<Phase>("idle");
  const t0 = useRef(0);
  const inspStart = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const raf = useRef(0);
  const penaltyRef = useRef<Penalty>(0);
  const lastSolveId = useRef<string | null>(null);
  const scrambleRef = useRef<string>("");

  const setP = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const nextScramble = useCallback(async () => {
    setScramble(null);
    const r = await queue.current.next();
    scrambleRef.current = r.scramble;
    setScramble(r);
  }, []);

  useEffect(() => { void nextScramble(); }, [nextScramble]);

  // boucle d'affichage
  useEffect(() => {
    const loop = () => {
      const p = phaseRef.current;
      if (p === "running") setDisplay(performance.now() - t0.current);
      if (p === "inspecting" || p === "holding" || p === "ready") {
        if (inspStart.current) setInspLeft(15 - (performance.now() - inspStart.current) / 1000);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const startHold = useCallback(() => {
    setP("holding");
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      if (phaseRef.current === "holding") setP("ready");
    }, HOLD_MS);
  }, []);

  const stop = useCallback(() => {
    const ms = performance.now() - t0.current;
    setDisplay(ms);
    setP("done");
    const id = `${Date.now()}`;
    lastSolveId.current = id;
    addSolve({ id, ms: Math.round(ms), penalty: penaltyRef.current, scramble: scrambleRef.current, date: Date.now() });
    void nextScramble();
  }, [addSolve, nextScramble]);

  const press = useCallback(() => {
    const p = phaseRef.current;
    if (p === "running") { stop(); return; }
    if (p === "idle" || p === "done") {
      if (inspection) {
        // la première pression lance l'inspection au relâchement
        setP("inspecting");
        inspStart.current = 0;
        return;
      }
      inspStart.current = 0;
      startHold();
      return;
    }
    if (p === "inspecting") startHold();
  }, [inspection, startHold, stop]);

  const release = useCallback(() => {
    const p = phaseRef.current;
    if (p === "inspecting" && inspStart.current === 0) {
      inspStart.current = performance.now();
      setInspLeft(15);
      return;
    }
    if (p === "holding") {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      setP(inspection && inspStart.current ? "inspecting" : "idle");
      return;
    }
    if (p === "ready") {
      let pen: Penalty = 0;
      if (inspStart.current) {
        const el = (performance.now() - inspStart.current) / 1000;
        if (el > 17) pen = "DNF";
        else if (el > 15) pen = 2;
      }
      penaltyRef.current = pen;
      inspStart.current = 0;
      t0.current = performance.now();
      setDisplay(0);
      setP("running");
    }
  }, [inspection]);

  const cancel = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    inspStart.current = 0;
    setP("idle");
    setDisplay(0);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (phaseRef.current === "running") { e.preventDefault(); press(); return; }
      if (e.key === "Escape") { cancel(); return; }
      if (e.code !== "Space" || e.repeat) { if (e.code === "Space") e.preventDefault(); return; }
      e.preventDefault();
      (document.activeElement as HTMLElement | null)?.blur?.();
      press();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [press, release, cancel]);

  const stats = useMemo(() => ({
    count: solves.length,
    best: best(solves),
    mean: meanOf(solves),
    ao5: averageOf(solves, 5),
    ao12: averageOf(solves, 12),
    ao100: averageOf(solves, 100),
    bao5: bestAverage(solves, 5),
    bao12: bestAverage(solves, 12),
  }), [solves]);

  const cross = useMemo(() => (scramble && showCross ? solveWhiteCrossForScramble(scramble.scramble) : null), [scramble, showCross]);
  const netState = useMemo(() => (scramble ? applyAlg(solvedCube(WCA_SCHEME), scramble.scramble) : null), [scramble]);

  const focus = phase === "inspecting" || phase === "holding" || phase === "ready" || phase === "running";
  const last = solves[solves.length - 1];
  const lastIsCurrent = phase === "done" && last && last.id === lastSolveId.current;

  let big: string;
  let cls = "";
  if (phase === "inspecting" || ((phase === "holding" || phase === "ready") && inspStart.current)) {
    big = inspLeft > 0 ? String(Math.ceil(inspLeft)) : inspLeft > -2 ? "+2" : "DNF";
    cls = phase === "inspecting" ? "inspecting" : phase;
    if (inspStart.current === 0 && phase === "inspecting") big = "15";
  } else if (phase === "running") {
    big = hideTime ? "…" : formatTime(display);
  } else if (phase === "holding" || phase === "ready") {
    big = formatTime(0);
    cls = phase;
  } else if (lastIsCurrent) {
    big = formatSolve(last);
  } else {
    big = formatTime(phase === "done" ? display : 0);
  }

  const togglePenalty = (s: Solve, p: Penalty) => updateSolve(s.id, { penalty: s.penalty === p ? 0 : p });

  return (
    <div className="page">
      <header className="page-header" style={{ marginBottom: 18 }}>
        <div className="eyebrow">Entraînement</div>
        <h1>Chronomètre</h1>
      </header>

      <div className="timer-layout">
        <div className="stack" style={{ gap: 16 }}>
          <div className="scramble-box">
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="small muted">Mélange {scramble?.official === false ? "(mode secours)" : "officiel"} · blanc en haut, vert devant</span>
              <div className="row" style={{ gap: 6 }}>
                <button type="button" className="icon-btn" onClick={() => scramble && navigator.clipboard?.writeText(scramble.scramble).then(() => toast("Mélange copié"))} title="Copier"><Copy size={16} /></button>
                <button type="button" className="icon-btn" onClick={() => void nextScramble()} title="Nouveau mélange"><RefreshCw size={16} /></button>
              </div>
            </div>
            <div className="scramble-text">{scramble?.scramble ?? "Génération du mélange…"}</div>
          </div>

          <div
            className={`timer-zone ${focus ? "fullscreen" : ""}`}
            onPointerDown={(e) => { if (e.pointerType !== "mouse" || e.button === 0) { e.preventDefault(); press(); } }}
            onPointerUp={() => release()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className={`timer-display ${cls}`}>{big}</div>
            {lastIsCurrent && last.penalty !== 0 && (
              <div className="pill learning mt">{last.penalty === "DNF" ? "DNF (inspection > 17 s)" : "+2 (inspection > 15 s)"}</div>
            )}
            <div className="timer-hint">
              {phase === "idle" || phase === "done"
                ? <>Maintenez <kbd>Espace</kbd> (ou touchez l'écran) {inspection ? "pour lancer l'inspection" : "puis relâchez pour démarrer"}</>
                : phase === "inspecting" ? <>Inspection : maintenez <kbd>Espace</kbd> jusqu'au vert puis relâchez · <kbd>Échap</kbd> pour annuler</>
                : phase === "holding" ? "Maintenez…"
                : phase === "ready" ? "Relâchez pour démarrer !"
                : "N'importe quelle touche pour arrêter"}
            </div>
            {lastIsCurrent && (
              <div className="row mt" onPointerDown={(e) => e.stopPropagation()}>
                <button type="button" className={`btn sm ${last.penalty === 2 ? "active" : ""}`} onClick={() => togglePenalty(last, 2)}>+2</button>
                <button type="button" className="btn sm" onClick={() => togglePenalty(last, "DNF")}>DNF</button>
                <button type="button" className="btn sm ghost danger" onClick={() => { deleteSolve(last.id); setP("idle"); setDisplay(0); }}>
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="card">
              <div className="row between mb">
                <h3 style={{ margin: 0 }}>Aperçu du mélange</h3>
                <button type="button" className="icon-btn" onClick={() => setShowNet(!showNet)} title={showNet ? "Masquer" : "Afficher"}>
                  {showNet ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {showNet && netState && <CubeNet state={netState} />}
            </div>
            <div className="card">
              <h3>Options</h3>
              <div className="stack" style={{ gap: 10 }}>
                <Switch checked={inspection} onChange={(v) => setSetting("inspection", v)} label="Inspection WCA (15 s)" />
                <Switch checked={hideTime} onChange={(v) => setSetting("hideTimeWhileRunning", v)} label="Masquer le temps pendant la résolution" />
                <Switch checked={showCross} onChange={(v) => setSetting("showCrossSolution", v)} label="Afficher la croix optimale" />
              </div>
              {cross && (
                <div className="mt">
                  <div className="small muted">Croix blanche (après z2) · {cross.length} mvts</div>
                  <div className="mono" style={{ fontWeight: 600 }}>{cross.join(" ") || "déjà faite"}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="stack" style={{ gap: 16 }}>
          <div className="card">
            <div className="stats-grid">
              <div className="stat"><span className="stat-label">ao5</span><span className="stat-value sm">{fmtNullable(stats.ao5)}</span></div>
              <div className="stat"><span className="stat-label">ao12</span><span className="stat-value sm">{fmtNullable(stats.ao12)}</span></div>
              <div className="stat"><span className="stat-label">ao100</span><span className="stat-value sm">{fmtNullable(stats.ao100)}</span></div>
              <div className="stat"><span className="stat-label">Record</span><span className="stat-value sm">{fmtNullable(stats.best)}</span></div>
              <div className="stat"><span className="stat-label">Meil. ao5</span><span className="stat-value sm">{fmtNullable(stats.bao5)}</span></div>
              <div className="stat"><span className="stat-label">Meil. ao12</span><span className="stat-value sm">{fmtNullable(stats.bao12)}</span></div>
            </div>
            <div className="row between mt small muted">
              <span>{stats.count} résolution{stats.count > 1 ? "s" : ""}</span>
              <span>Moyenne : {fmtNullable(stats.mean)}</span>
            </div>
          </div>
          <div className="card">
            <h3>Progression</h3>
            <TimesChart solves={solves} />
            <div className="row small muted" style={{ gap: 14 }}>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 2, background: "var(--muted)" }} /> temps</span>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 3, background: "var(--accent)" }} /> ao5</span>
            </div>
          </div>
          <div className="card">
            <div className="row between mb">
              <h3 style={{ margin: 0 }}>Temps</h3>
              {solves.length > 0 && (
                <button type="button" className="btn sm ghost danger" onClick={() => { if (confirm("Effacer tous les temps ?")) clearSolves(); }}>
                  <Trash2 size={14} /> Tout effacer
                </button>
              )}
            </div>
            {solves.length === 0 ? (
              <p className="small muted">Vos temps apparaîtront ici.</p>
            ) : (
              <div className="times-list">
                {solves.slice().reverse().map((s, i) => (
                  <div key={s.id} className="time-row" title={s.scramble}>
                    <span className="idx">{solves.length - i}.</span>
                    <span>{formatSolve(s)}</span>
                    <span className="acts">
                      <button type="button" className={`mini-btn ${s.penalty === 2 ? "on" : ""}`} onClick={() => togglePenalty(s, 2)}>+2</button>
                      <button type="button" className={`mini-btn ${s.penalty === "DNF" ? "on" : ""}`} onClick={() => togglePenalty(s, "DNF")}>DNF</button>
                      <button type="button" className="mini-btn" onClick={() => deleteSolve(s.id)} aria-label="Supprimer">×</button>
                    </span>
                    <span className="small muted">{new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
