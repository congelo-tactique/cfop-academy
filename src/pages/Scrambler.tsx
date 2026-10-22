import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Check, Copy, ListOrdered, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { applyAlg, solvedCube, WCA_SCHEME } from "../cube/cube";
import { ScrambleQueue } from "../cube/scramble";
import { solveWhiteCrossForScramble } from "../cube/crossSolver";
import { CubeNet } from "../components/Diagrams";
import { Cube3D } from "../components/Cube3D";
import { Callout, Segmented, toast } from "../components/ui";
import { useStore } from "../store/useStore";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copié dans le presse-papiers");
  } catch {
    toast("Impossible de copier");
  }
}

export function ScramblerPage() {
  const queue = useRef(new ScrambleQueue(2));
  const [current, setCurrent] = useState<{ scramble: string; official: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [showCross, setShowCross] = useState(false);
  const [series, setSeries] = useState<string[] | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const history = useStore((s) => s.scrambleHistory);
  const pushScramble = useStore((s) => s.pushScramble);

  const generate = useCallback(async () => {
    setLoading(true);
    setShowCross(false);
    const r = await queue.current.next();
    setCurrent(r);
    pushScramble(r.scramble);
    setLoading(false);
  }, [pushScramble]);

  useEffect(() => { void generate(); }, [generate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement).closest("input, textarea, button")) {
        e.preventDefault();
        if (!loading) void generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate, loading]);

  const state = useMemo(() => (current ? applyAlg(solvedCube(WCA_SCHEME), current.scramble) : solvedCube(WCA_SCHEME)), [current]);
  const cross = useMemo(() => (current && showCross ? solveWhiteCrossForScramble(current.scramble) : null), [current, showCross]);
  const moveCount = current ? current.scramble.trim().split(/\s+/).length : 0;

  const makeSeries = async () => {
    setSeriesLoading(true);
    const out: string[] = [];
    for (let i = 0; i < 7; i++) out.push((await queue.current.next()).scramble);
    setSeries(out);
    setSeriesLoading(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="eyebrow">Mélangeur</div>
        <h1>Mélanges officiels 3x3</h1>
        <p>
          Chaque mélange part d'un état du cube tiré au hasard parmi les 43 trillions possibles, puis un solveur calcule la
          séquence qui y mène : c'est la méthode <strong>random-state</strong> utilisée en compétition WCA.
        </p>
      </header>

      <div className="scramble-box">
        <div className="row between mb">
          {current?.official === false ? (
            <span className="pill learning"><TriangleAlert size={13} /> Mode secours : mélange aléatoire de 25 coups</span>
          ) : (
            <span className="pill learned"><ShieldCheck size={13} /> Random-state · norme WCA</span>
          )}
          <span className="small muted">{moveCount ? `${moveCount} mouvements` : ""}</span>
        </div>
        <div className="scramble-text" aria-live="polite" style={{ minHeight: 80, display: "grid", placeItems: "center", opacity: loading ? 0.4 : 1 }}>
          {current?.scramble ?? "Génération…"}
        </div>
        <div className="row mt" style={{ justifyContent: "center" }}>
          <button type="button" className="btn primary lg" onClick={() => void generate()} disabled={loading}>
            <RefreshCw size={18} className={loading ? "spin" : ""} /> Nouveau mélange
          </button>
          <button type="button" className="btn lg" onClick={() => current && void copy(current.scramble)} disabled={!current}>
            <Copy size={18} /> Copier
          </button>
        </div>
        <p className="small muted" style={{ textAlign: "center", marginTop: 10, marginBottom: 0 }}>Astuce : <kbd>Espace</kbd> génère un nouveau mélange.</p>
      </div>

      <div className="grid grid-2 mt" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="row between mb">
            <h3 style={{ margin: 0 }}>Aperçu</h3>
            <Segmented value={view} onChange={setView} options={[{ value: "2d", label: "Patron" }, { value: "3d", label: <span className="row" style={{ gap: 4 }}><Box size={14} /> 3D</span> }]} />
          </div>
          {view === "2d" ? (
            <CubeNet state={state} />
          ) : (
            <div className="alg-player-stage" style={{ height: 300 }}>
              <Cube3D state={state} />
            </div>
          )}
          <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
            Tenez le cube <strong>blanc en haut, vert devant</strong> pour appliquer le mélange. Comparez avec l'aperçu pour vérifier.
          </p>
        </div>

        <div className="card">
          <h3>Solution de la croix</h3>
          <p className="small">Après le mélange, retournez le cube (blanc en bas, vert devant, soit <code>z2</code>). Voici la croix blanche optimale :</p>
          {cross ? (
            <div className="scramble-box" style={{ padding: 14 }}>
              <div className="scramble-text" style={{ fontSize: "1.1rem" }}>{cross.length ? cross.join(" ") : "Croix déjà faite !"}</div>
              <p className="small muted" style={{ textAlign: "center", margin: "6px 0 0" }}>{cross.length} mouvement{cross.length > 1 ? "s" : ""}</p>
            </div>
          ) : (
            <button type="button" className="btn" onClick={() => setShowCross(true)} disabled={!current}>Afficher la solution optimale</button>
          )}
          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "18px 0" }} />
          <h3>Série de compétition</h3>
          <p className="small">5 mélanges et 2 de secours (E1, E2), comme pour un round officiel.</p>
          {series ? (
            <div className="stack" style={{ gap: 6 }}>
              {series.map((s, i) => (
                <div key={i} className="row" style={{ gap: 10, alignItems: "flex-start", flexWrap: "nowrap" }}>
                  <span className="pill" style={{ minWidth: 34, justifyContent: "center" }}>{i < 5 ? i + 1 : `E${i - 4}`}</span>
                  <span className="mono small" style={{ flex: 1 }}>{s}</span>
                </div>
              ))}
              <div className="row mt">
                <button type="button" className="btn sm" onClick={() => void copy(series.map((s, i) => `${i < 5 ? i + 1 : `E${i - 4}`}. ${s}`).join("\n"))}><Copy size={14} /> Tout copier</button>
                <button type="button" className="btn sm ghost" onClick={() => void makeSeries()} disabled={seriesLoading}><RefreshCw size={14} /> Nouvelle série</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn" onClick={() => void makeSeries()} disabled={seriesLoading}>
              <ListOrdered size={16} /> {seriesLoading ? "Génération…" : "Générer une série"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2 mt" style={{ alignItems: "start" }}>
        <div className="card">
          <h3>Les règles officielles</h3>
          <ul className="small" style={{ paddingLeft: 18, color: "var(--text-2)", marginBottom: 0 }}>
            <li>Le cube est mélangé <strong>blanc en haut, vert devant</strong>, en suivant la séquence générée par le programme officiel (TNoodle).</li>
            <li>Les mélanges sont <strong>random-state</strong> : chaque position du cube a la même probabilité d'apparaître. Ils font en général une vingtaine de mouvements.</li>
            <li>Le compétiteur dispose de <strong>15 secondes d'inspection</strong>. Entre 15 et 17 s : +2 s. Au-delà : DNF.</li>
            <li>Un round se fait sur 5 résolutions (ao5) : la meilleure et la pire sont retirées.</li>
          </ul>
        </div>
        <div className="card">
          <h3>Historique</h3>
          {history.length === 0 ? (
            <p className="small muted">Aucun mélange pour l'instant.</p>
          ) : (
            <div className="stack" style={{ gap: 4, maxHeight: 260, overflowY: "auto" }}>
              {history.slice(0, 15).map((h, i) => (
                <button key={i} type="button" className="row mono small" onClick={() => void copy(h)} title="Copier"
                  style={{ border: 0, background: "none", textAlign: "left", cursor: "pointer", padding: "4px 6px", borderRadius: 8, color: "var(--text-2)", flexWrap: "nowrap" }}>
                  <Check size={12} style={{ opacity: i === 0 ? 1 : 0, flexShrink: 0 }} color="var(--success)" /> {h}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Callout kind="info" title="Ici, pas besoin de rotation">
        <p>Les mélanges WCA n'utilisent que les 6 faces (R, L, U, D, F, B), avec ' et 2. Si besoin, révisez la <Link to="/notation">notation</Link>.</p>
      </Callout>
    </div>
  );
}
