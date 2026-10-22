import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, Play, Shuffle, Timer as TimerIcon } from "lucide-react";
import { SETS, SET_BY_ID, CASE_BY_ID, getAlignedAlgs, getCaseState, type AlgCase, type SetId } from "../data";
import { caseSetupAlg, invertAlg, movesToString, parseAlg } from "../cube/cube";
import { kociembaSetup } from "../cube/scramble";
import { prependAuf } from "../cube/goals";
import { useStore, type Grade } from "../store/useStore";
import { CaseSelector } from "../components/CaseSelector";
import { CaseThumb } from "../components/CaseViews";
import { Cube3D } from "../components/Cube3D";
import { AlgPlayer } from "../components/AlgPlayer";
import { AlgText } from "../components/AlgText";
import { Callout, Modal, Segmented, Switch } from "../components/ui";
import { formatTime } from "../lib/stats";

type Mode = "random" | "srs";
const AUFS = ["", "U", "U2", "U'"];

interface Item {
  c: AlgCase;
  auf: string;
}

const GRADES: { g: Grade; label: string; hint: string }[] = [
  { g: 0, label: "Raté", hint: "à revoir" },
  { g: 1, label: "Difficile", hint: "hésitation" },
  { g: 2, label: "Bien", hint: "correct" },
  { g: 3, label: "Facile", hint: "automatique" },
];

function solutionWithAuf(alg: string, auf: string): string {
  if (!auf) return alg;
  return prependAuf(invertAlg(auf), alg);
}

export function TrainerPage() {
  const [params] = useSearchParams();
  const initialSet = (params.get("set") as SetId) || "oll2";
  const initialCases = params.get("cases")?.split(",").filter((id) => CASE_BY_ID[id]) ?? [];
  const [setId, setSetId] = useState<SetId>(SET_BY_ID[initialSet] ? initialSet : "oll2");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialCases.length ? initialCases : SET_BY_ID[SET_BY_ID[initialSet] ? initialSet : "oll2"].cases.map((c) => c.id)),
  );
  const [mode, setMode] = useState<Mode>("random");
  const [view, setView] = useState<"3d" | "2d">("3d");
  const [timed, setTimed] = useState(false);
  const [hideName, setHideName] = useState(true);
  const auf = useStore((s) => s.trainerAuf);
  const setSetting = useStore((s) => s.setSetting);
  const [running, setRunning] = useState(false);

  const changeSet = (id: SetId) => {
    setSetId(id);
    setSelected(new Set(SET_BY_ID[id].cases.map((c) => c.id)));
  };

  if (running) {
    return (
      <TrainerSession
        cases={SET_BY_ID[setId].cases.filter((c) => selected.has(c.id))}
        mode={mode} view={view} timed={timed} hideName={hideName} randomAuf={auf}
        onExit={() => setRunning(false)}
      />
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="eyebrow">Entraînement</div>
        <h1>Trainer d'algorithmes</h1>
        <p>Choisissez les cas à travailler. Le trainer vous montre un cas : exécutez l'algorithme sur votre cube, révélez la solution, puis notez-vous.</p>
      </header>

      <div className="card mb">
        <div className="grid grid-2">
          <div className="stack">
            <div className="field">
              <label>Set d'algorithmes</label>
              <div className="row">
                {SETS.map((s) => (
                  <button key={s.id} type="button" className={`chip ${s.id === setId ? "active" : ""}`} onClick={() => changeSet(s.id)}>{s.short}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Mode</label>
              <Segmented<Mode> value={mode} onChange={setMode} options={[{ value: "random", label: "Aléatoire" }, { value: "srs", label: "Révision espacée" }]} />
              <span className="small muted">
                {mode === "random"
                  ? "Les cas sélectionnés tombent au hasard, sans fin."
                  : "Les cas reviennent selon vos notes : souvent si vous les ratez, de plus en plus rarement si vous les maîtrisez."}
              </span>
            </div>
          </div>
          <div className="stack">
            <div className="field">
              <label>Affichage du cas</label>
              <Segmented value={view} onChange={setView} options={[{ value: "3d", label: "Cube 3D" }, { value: "2d", label: "Schéma 2D" }]} />
            </div>
            <Switch checked={auf} onChange={(v) => setSetting("trainerAuf", v)} label="Orientation aléatoire (AUF)" />
            <Switch checked={hideName} onChange={setHideName} label="Masquer le nom du cas" />
            <Switch checked={timed} onChange={setTimed} label={<span className="row" style={{ gap: 6 }}><TimerIcon size={15} /> Chronométrer l'exécution</span>} />
          </div>
        </div>
      </div>

      <CaseSelector set={setId} selected={selected} onChange={setSelected} />

      <div className="selection-bar">
        <strong>{selected.size} cas sélectionné{selected.size > 1 ? "s" : ""}</strong>
        <span className="small muted">{SET_BY_ID[setId].name}</span>
        <div className="spacer" />
        <button type="button" className="btn primary" disabled={selected.size === 0} onClick={() => setRunning(true)}>
          <Play size={16} /> Commencer
        </button>
      </div>
    </div>
  );
}

function TrainerSession({ cases, mode, view, timed, hideName, randomAuf, onExit }: {
  cases: AlgCase[]; mode: Mode; view: "3d" | "2d"; timed: boolean; hideName: boolean; randomAuf: boolean; onExit: () => void;
}) {
  const srs = useStore((s) => s.srs);
  const gradeCase = useStore((s) => s.gradeCase);
  const preferred = useStore((s) => s.preferred);
  const [item, setItem] = useState<Item | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<"wait" | "run" | "stopped">("wait");
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<{ c: AlgCase; g: Grade; ms?: number }[]>([]);
  const [nothingDue, setNothingDue] = useState(false);
  const [forceRandom, setForceRandom] = useState(false);
  const [setup, setSetup] = useState<{ alg: string; kind: "wca" | "direct" } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [animOpen, setAnimOpen] = useState(false);
  const t0 = useRef(0);
  const raf = useRef(0);

  const pick = useCallback((): Item | null => {
    const now = Date.now();
    let c: AlgCase | undefined;
    if (mode === "srs" && !forceRandom) {
      const due = cases
        .map((x) => ({ x, card: useStore.getState().srs[x.id] }))
        .filter(({ card }) => !card || card.due <= now)
        .sort((a, b) => (a.card ? a.card.due : now - 1e12) - (b.card ? b.card.due : now - 1e12));
      // les cas déjà vus et dus passent avant les nouveaux
      const seen = due.filter((d) => d.card);
      const pool = seen.length ? seen : due;
      c = pool[0]?.x;
      if (!c) {
        setNothingDue(true);
        return null;
      }
    } else {
      const last = item?.c.id;
      const pool = cases.length > 1 ? cases.filter((x) => x.id !== last) : cases;
      c = pool[Math.floor(Math.random() * pool.length)];
    }
    setNothingDue(false);
    return { c, auf: randomAuf ? AUFS[Math.floor(Math.random() * 4)] : "" };
  }, [cases, mode, forceRandom, item, randomAuf]);

  const next = useCallback(() => {
    const it = pick();
    setItem(it);
    setRevealed(false);
    setPhase("wait");
    setElapsed(0);
    setSetup(null);
  }, [pick]);

  // premier cas
  useEffect(() => {
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRandom]);

  const solution = useMemo(() => {
    if (!item) return "";
    const algs = getAlignedAlgs(item.c);
    const a = algs[Math.min(preferred[item.c.id] ?? 0, algs.length - 1)];
    return solutionWithAuf(a, item.auf);
  }, [item, preferred]);

  // mélange de mise en place
  useEffect(() => {
    if (!item) return;
    let alive = true;
    const direct = caseSetupAlg(item.c.algs[0], item.auf);
    setSetup({ alg: movesToString(parseAlg(direct)), kind: "direct" });
    void kociembaSetup(direct).then((s) => {
      if (alive && s) setSetup({ alg: s, kind: "wca" });
    });
    return () => { alive = false; };
  }, [item]);

  const state = useMemo(() => (item ? getCaseState(item.c, item.auf) : null), [item]);

  // chrono d'exécution
  useEffect(() => {
    if (phase !== "run") return;
    const loop = () => {
      setElapsed(performance.now() - t0.current);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [phase]);

  const grade = useCallback((g: Grade) => {
    if (!item) return;
    const ms = timed && phase === "stopped" ? elapsed : undefined;
    gradeCase(item.c.id, g, ms);
    setHistory((h) => [{ c: item.c, g, ms }, ...h].slice(0, 50));
    next();
  }, [item, timed, phase, elapsed, gradeCase, next]);

  const primary = useCallback(() => {
    if (!item) return;
    if (timed && !revealed) {
      if (phase === "wait") { t0.current = performance.now(); setPhase("run"); return; }
      if (phase === "run") { setElapsed(performance.now() - t0.current); setPhase("stopped"); setRevealed(true); return; }
    }
    if (!revealed) setRevealed(true);
  }, [item, timed, revealed, phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (animOpen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) primary();
        return;
      }
      if (revealed && ["1", "2", "3", "4"].includes(e.key)) grade((Number(e.key) - 1) as Grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [primary, grade, revealed, animOpen]);

  const done = history.length;
  const ok = history.filter((h) => h.g > 0).length;
  const times = history.map((h) => h.ms).filter((x): x is number => !!x);
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const card = item ? srs[item.c.id] : undefined;
  const setName = cases[0] ? SET_BY_ID[cases[0].set].name : "";
  const isF2L = item?.c.goal === "f2l";

  return (
    <div className="page">
      <div className="row between mb">
        <button type="button" className="btn ghost" onClick={onExit}><ArrowLeft size={16} /> Réglages</button>
        <span className="small muted">{setName} · {cases.length} cas · {mode === "srs" && !forceRandom ? "révision espacée" : "aléatoire"}</span>
      </div>

      <div className="trainer-layout">
        <div className="trainer-stage">
          {nothingDue ? (
            <div className="empty">
              <h2>Tout est révisé !</h2>
              <p>Aucun des cas sélectionnés n'est à revoir pour l'instant. Revenez plus tard, ou continuez en mode aléatoire.</p>
              <button type="button" className="btn primary" onClick={() => setForceRandom(true)}><Shuffle size={16} /> Continuer en aléatoire</button>
            </div>
          ) : item && state && (
            <>
              <div className="row between">
                <div>
                  <h2 style={{ margin: 0 }}>{hideName && !revealed ? "Quel est ce cas ?" : item.c.name}</h2>
                  {(!hideName || revealed) && item.c.nickname && <span className="muted">{item.c.nickname}</span>}
                </div>
                {card && <span className="pill">vu {card.attempts}× · {Math.round((card.success / card.attempts) * 100)} %</span>}
              </div>

              <div className="trainer-visual">
                {view === "3d" ? (
                  <div style={{ width: "100%", height: 320 }}>
                    <Cube3D state={state} mask={item.c.mask} view={isF2L ? "iso" : "top"} />
                  </div>
                ) : (
                  <div style={{ padding: 20 }}><CaseThumb c={item.c} preAuf={item.auf} size={230} arrows={false} /></div>
                )}
              </div>

              {timed && (
                <div className="exec-timer" style={{ color: phase === "run" ? "var(--accent-text)" : undefined }}>
                  {formatTime(elapsed)}
                </div>
              )}

              <div className="reveal-box">
                {revealed ? (
                  <>
                    <AlgText alg={solution} />
                    {item.auf && <span className="small muted">avec l'AUF <code>{invertAlg(item.auf)}</code> au début</span>}
                    <button type="button" className="btn sm ghost" onClick={() => setAnimOpen(true)}><Eye size={14} /> Voir l'animation</button>
                  </>
                ) : (
                  <button type="button" className="btn primary" onClick={primary}>
                    {timed ? (phase === "wait" ? "Démarrer le chrono" : "Stop") : "Révéler la solution"} <kbd style={{ marginLeft: 6 }}>Espace</kbd>
                  </button>
                )}
              </div>

              {revealed && (
                <div className="grade-row">
                  {GRADES.map(({ g, label, hint }) => (
                    <button key={g} type="button" className={`btn grade-${g}`} onClick={() => grade(g)}>
                      <span>{label}</span>
                      <small>{hint} · touche {g + 1}</small>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <button type="button" className="btn sm ghost" onClick={() => setShowSetup(!showSetup)}>
                  {showSetup ? "Masquer" : "Afficher"} le mélange pour mon cube
                </button>
                {showSetup && setup && (
                  <div className="mt">
                    <div className="small muted">
                      {setup.kind === "wca"
                        ? "Cube résolu tenu blanc en haut, vert devant : appliquez ce mélange, puis faites z2 (jaune en haut)."
                        : "Cube résolu tenu jaune en haut, vert devant : appliquez cette séquence."}
                    </div>
                    <div className="mono" style={{ fontWeight: 600, marginTop: 4 }}>{setup.alg}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="stack" style={{ gap: 16 }}>
          <div className="card">
            <h3>Session</h3>
            <div className="stats-grid">
              <div className="stat"><span className="stat-label">Cas</span><span className="stat-value sm">{done}</span></div>
              <div className="stat"><span className="stat-label">Réussite</span><span className="stat-value sm">{done ? `${Math.round((ok / done) * 100)}%` : "–"}</span></div>
              <div className="stat"><span className="stat-label">Moy.</span><span className="stat-value sm">{avg ? formatTime(avg) : "–"}</span></div>
            </div>
          </div>
          <div className="card">
            <h3>Derniers cas</h3>
            {history.length === 0 ? <p className="small muted">Notez votre premier cas pour commencer l'historique.</p> : (
              <div className="stack" style={{ gap: 6 }}>
                {history.slice(0, 12).map((h, i) => (
                  <div key={i} className="row between small">
                    <span>{h.c.name}</span>
                    <span className="row" style={{ gap: 8 }}>
                      {h.ms && <span className="mono muted">{formatTime(h.ms)}</span>}
                      <span className={`pill ${h.g === 0 ? "" : h.g === 1 ? "learning" : "learned"}`} style={h.g === 0 ? { background: "var(--danger-soft)", color: "var(--danger)" } : undefined}>{GRADES[h.g].label}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Callout kind="tip">
            <p className="small"><kbd>Espace</kbd> révèle (ou lance/arrête le chrono), <kbd>1</kbd>–<kbd>4</kbd> pour noter. Après 4 bonnes réponses d'affilée, un cas passe en « maîtrisé ».</p>
          </Callout>
        </aside>
      </div>

      {animOpen && item && state && (
        <Modal title={item.c.name} subtitle="Solution animée" onClose={() => setAnimOpen(false)} width={640}>
          <AlgPlayer alg={solution} start={state} mask={item.c.mask} height={340} view={isF2L ? "iso" : "top"} autoPlay />
        </Modal>
      )}
    </div>
  );
}
