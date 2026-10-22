import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { applyAlg, solvedCube, WCA_SCHEME } from "../cube/cube";
import { solveWhiteCrossForScramble } from "../cube/crossSolver";
import { randomScramble333 } from "../cube/scramble";
import { AlgPlayer } from "./AlgPlayer";
import { CubeNet } from "./Diagrams";

/** Exercice de croix : un mélange officiel, puis la solution optimale animée. */
export function CrossTrainer() {
  const [scramble, setScramble] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = useCallback(async () => {
    setLoading(true);
    setShow(false);
    const r = await randomScramble333();
    setScramble(r.scramble);
    setLoading(false);
  }, []);

  useEffect(() => { void next(); }, [next]);

  const data = useMemo(() => {
    if (!scramble) return null;
    const sol = solveWhiteCrossForScramble(scramble);
    return {
      sol: sol.join(" "),
      len: sol.length,
      start: applyAlg(solvedCube(), `z2 ${scramble} z2`),
      net: applyAlg(solvedCube(WCA_SCHEME), scramble),
    };
  }, [scramble]);

  return (
    <div className="card">
      <div className="row between mb">
        <h3 style={{ margin: 0 }}>Exercice : planifier la croix</h3>
        <button type="button" className="btn sm" onClick={() => void next()} disabled={loading}>
          <RefreshCw size={14} /> Nouveau mélange
        </button>
      </div>
      <p className="small">
        Mélangez votre cube <strong>blanc en haut, vert devant</strong>, puis retournez-le (blanc en bas). En 15 secondes,
        essayez de prévoir toute la croix, puis comparez avec la solution optimale.
      </p>
      <div className="scramble-box" style={{ padding: 14 }}>
        <div className="scramble-text" style={{ fontSize: "1.05rem" }}>{scramble ?? "Génération du mélange…"}</div>
      </div>
      {data && (
        <div className="grid grid-2 mt" style={{ alignItems: "start" }}>
          <div>
            <CubeNet state={data.net} />
            <p className="small muted" style={{ marginTop: 6 }}>Aperçu du mélange (blanc en haut, vert devant).</p>
          </div>
          <div>
            {show ? (
              <>
                <p className="small" style={{ marginBottom: 6 }}>
                  Solution optimale en <strong>{data.len} mouvements</strong>, cube tenu blanc en bas (après <code>z2</code>) :
                </p>
                <AlgPlayer alg={data.sol} start={data.start} mask="cross" height={240} compact />
              </>
            ) : (
              <div className="reveal-box" style={{ minHeight: 200 }}>
                <p className="small" style={{ margin: 0 }}>Prévoyez votre croix, puis…</p>
                <button type="button" className="btn primary" onClick={() => setShow(true)}>
                  <Eye size={16} /> Voir la solution optimale
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
