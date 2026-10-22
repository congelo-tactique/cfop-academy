import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, HelpCircle, Timer } from "lucide-react";
import { AlgPlayer } from "../components/AlgPlayer";
import { CaseGallery } from "../components/CaseViews";
import { IsoDiagram, LLDiagram } from "../components/Diagrams";
import { applyAlg, caseState, solvedCube } from "../cube/cube";
import { SET_BY_ID, type MaskId, type SetId } from "../data";

/** Démonstration animée : texte à gauche, cube à droite. */
export function Demo({ alg, mask = "full", title, children, start, view, height = 280, setup }: {
  alg: string; mask?: MaskId; title?: string; children?: ReactNode; view?: "iso" | "top"; height?: number;
  /** État de départ explicite : algorithme appliqué depuis le cube résolu. */
  setup?: string; start?: ReturnType<typeof caseState>;
}) {
  const st = useMemo(
    () => start ?? (setup !== undefined ? applyAlg(solvedCube(), setup) : undefined),
    [start, setup],
  );
  return (
    <div className={`demo ${children || title ? "" : "single"}`}>
      {(title || children) && (
        <div className="demo-text">
          {title && <h4>{title}</h4>}
          {children}
        </div>
      )}
      <AlgPlayer alg={alg} start={st} mask={mask} height={height} view={view} compact />
    </div>
  );
}

/** Image fixe d'un état (isométrique ou vue du dessus). */
export function StateFigure({ setup = "", alg, mask = "full", kind = "iso", caption, size = 120 }: {
  setup?: string; alg?: string; mask?: MaskId; kind?: "iso" | "ll"; caption?: ReactNode; size?: number;
}) {
  const st = alg ? caseState(alg) : applyAlg(solvedCube(), setup);
  return (
    <div className="figure">
      {kind === "iso" ? <IsoDiagram state={st} mask={mask} size={size} /> : <LLDiagram state={st} mask={mask} size={size} />}
      {caption && <span>{caption}</span>}
    </div>
  );
}

export function SetGallery({ set, filter }: { set: SetId; filter?: (id: string, tags?: string[]) => boolean }) {
  const s = SET_BY_ID[set];
  const cases = filter ? s.cases.filter((c) => filter(c.id, c.tags)) : s.cases;
  return <CaseGallery cases={cases} groups={s.groups} />;
}

export function Practice({ title, text, set, cases, quiz, timer }: {
  title: string; text: ReactNode; set?: SetId; cases?: string[]; quiz?: boolean; timer?: boolean;
}) {
  const q = new URLSearchParams();
  if (set) q.set("set", set);
  if (cases?.length) q.set("cases", cases.join(","));
  return (
    <div className="practice-box">
      <div className="feature-icon" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))", margin: 0 }}>
        <Dumbbell size={20} />
      </div>
      <div className="grow">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
      <div className="row">
        {set && (
          <Link className="btn primary" to={`/entrainement/algos?${q}`}>
            <Dumbbell size={16} /> Trainer
          </Link>
        )}
        {quiz && set && (
          <Link className="btn" to={`/entrainement/quiz?set=${set}`}>
            <HelpCircle size={16} /> Quiz
          </Link>
        )}
        {timer && (
          <Link className="btn" to="/entrainement/chrono">
            <Timer size={16} /> Chronomètre
          </Link>
        )}
      </div>
    </div>
  );
}
