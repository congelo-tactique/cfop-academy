import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronFirst, ChevronLast, Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import { applyMoves, caseState, invertMove, parseAlg, validateAlg, type CubeState } from "../cube/cube";
import { Cube3D, type Cube3DHandle } from "./Cube3D";
import { AlgText } from "./AlgText";
import { useStore } from "../store/useStore";
import type { MaskId } from "../data/types";

interface Props {
  alg: string;
  /** État de départ ; par défaut, le cas que l'algorithme résout. */
  start?: CubeState;
  mask?: MaskId;
  height?: number | string;
  autoPlay?: boolean;
  view?: "iso" | "top";
  labels?: boolean;
  showAlg?: boolean;
  compact?: boolean;
  className?: string;
  /** Mode « direct » : quand des mouvements sont ajoutés à la fin, ils sont animés depuis l'état courant. */
  live?: boolean;
}

export const SPEEDS = [
  { label: "Lent", ms: 520 },
  { label: "Normal", ms: 260 },
  { label: "Rapide", ms: 140 },
];

/** Lecteur d'algorithme : cube 3D + contrôles lecture/pause/pas à pas. */
export function AlgPlayer({
  alg, start, mask = "full", height = 320, autoPlay = false, view = "iso", labels = false,
  showAlg = true, compact = false, className, live = false,
}: Props) {
  const animSpeed = useStore((s) => s.animSpeed);
  const setSetting = useStore((s) => s.setSetting);
  const cube = useRef<Cube3DHandle>(null);
  const invalid = useMemo(() => validateAlg(alg), [alg]);
  const moves = useMemo(() => (invalid ? [] : parseAlg(alg)), [alg, invalid]);
  const states = useMemo(() => {
    const s0 = start ?? (invalid ? caseState("") : caseState(alg));
    const arr = [s0];
    let s = s0;
    for (const m of moves) {
      s = applyMoves(s, [m]);
      arr.push(s);
    }
    return arr;
  }, [alg, start, moves, invalid]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const idxRef = useRef(0);
  const playRef = useRef(false);
  const busy = useRef(false);
  const gen = useRef(0);
  const speedRef = useRef(animSpeed);
  speedRef.current = animSpeed;

  // nouvel algo -> retour au début (ou animation des mouvements ajoutés en mode direct)
  const prevMoves = useRef<string[]>([]);
  const prevStart = useRef<CubeState | undefined>(undefined);
  useEffect(() => {
    const old = prevMoves.current;
    const cur = moves.map((m) => m.raw);
    const sameStart = prevStart.current === states[0] || start === undefined;
    prevMoves.current = cur;
    prevStart.current = states[0];
    gen.current++;
    playRef.current = false;
    setPlaying(false);
    cube.current?.finish();
    if (live && sameStart) {
      const isPrefix = old.length < cur.length && old.every((m, i) => m === cur[i]);
      if (isPrefix && idxRef.current === old.length) {
        const g = gen.current;
        void (async () => {
          for (let i = old.length; i < cur.length && g === gen.current; i++) {
            busy.current = true;
            await cube.current?.animate(moves[i], states[i + 1], Math.min(speedRef.current, 200));
            busy.current = false;
            if (g !== gen.current) return;
            idxRef.current = i + 1;
            setIdx(i + 1);
          }
        })();
        return;
      }
      idxRef.current = cur.length;
      setIdx(cur.length);
      return;
    }
    idxRef.current = 0;
    setIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states]);

  const go = useCallback((i: number) => {
    gen.current++;
    playRef.current = false;
    setPlaying(false);
    cube.current?.finish();
    idxRef.current = i;
    setIdx(i);
  }, []);

  const stepForward = useCallback(async () => {
    if (busy.current) return false;
    const i = idxRef.current;
    if (i >= moves.length) return false;
    busy.current = true;
    const g = gen.current;
    await cube.current?.animate(moves[i], states[i + 1], speedRef.current);
    busy.current = false;
    if (g !== gen.current) return false;
    idxRef.current = i + 1;
    setIdx(i + 1);
    return true;
  }, [moves, states]);

  const stepBack = useCallback(async () => {
    if (busy.current) return;
    const i = idxRef.current;
    if (i <= 0) return;
    busy.current = true;
    const g = gen.current;
    await cube.current?.animate(invertMove(moves[i - 1]), states[i - 1], speedRef.current);
    busy.current = false;
    if (g !== gen.current) return;
    idxRef.current = i - 1;
    setIdx(i - 1);
  }, [moves, states]);

  const play = useCallback(async () => {
    if (playRef.current) {
      playRef.current = false;
      setPlaying(false);
      return;
    }
    if (idxRef.current >= moves.length) {
      cube.current?.finish();
      idxRef.current = 0;
      setIdx(0);
      await new Promise((r) => setTimeout(r, 350));
    }
    playRef.current = true;
    setPlaying(true);
    while (playRef.current && idxRef.current < moves.length) {
      const ok = await stepForward();
      if (!ok && !playRef.current) break;
      if (!ok) await new Promise((r) => setTimeout(r, 30));
      else await new Promise((r) => setTimeout(r, 40));
    }
    playRef.current = false;
    setPlaying(false);
  }, [moves.length, stepForward]);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(() => void play(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, states]);

  useEffect(() => () => { playRef.current = false; }, []);

  return (
    <div className={`alg-player ${compact ? "compact" : ""} ${className ?? ""}`}>
      <div className="alg-player-stage" style={{ height }}>
        <Cube3D ref={cube} state={states[idx]} mask={mask} view={view} labels={labels} />
        <button type="button" className="icon-btn stage-reset" onClick={() => cube.current?.resetCamera()} title="Recentrer la vue">
          <RotateCcw size={16} />
        </button>
      </div>
      {showAlg && (
        <div className="alg-player-alg">
          {invalid ? (
            <span className="error-text">Mouvement inconnu : « {invalid} »</span>
          ) : moves.length === 0 ? (
            <span className="muted">Aucun mouvement</span>
          ) : (
            <AlgText alg={alg} current={idx} onMoveClick={go} />
          )}
        </div>
      )}
      <div className="alg-player-controls">
        <div className="btn-group">
          <button type="button" className="icon-btn" onClick={() => go(0)} title="Début" disabled={idx === 0}>
            <ChevronFirst size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={() => { playRef.current = false; setPlaying(false); void stepBack(); }} title="Mouvement précédent" disabled={idx === 0}>
            <StepBack size={18} />
          </button>
          <button type="button" className="icon-btn primary" onClick={() => void play()} title={playing ? "Pause" : "Lecture"} disabled={moves.length === 0}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button type="button" className="icon-btn" onClick={() => { playRef.current = false; setPlaying(false); void stepForward(); }} title="Mouvement suivant" disabled={idx >= moves.length}>
            <StepForward size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={() => go(moves.length)} title="Fin" disabled={idx >= moves.length}>
            <ChevronLast size={18} />
          </button>
        </div>
        <span className="move-counter mono">{idx}/{moves.length}</span>
        {!compact && (
          <div className="speed-select" role="group" aria-label="Vitesse">
            {SPEEDS.map((s) => (
              <button key={s.ms} type="button" className={`chip ${animSpeed === s.ms ? "active" : ""}`} onClick={() => setSetting("animSpeed", s.ms)}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
