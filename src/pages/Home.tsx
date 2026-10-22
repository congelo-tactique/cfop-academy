import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell, GraduationCap, HelpCircle, PenLine, Shuffle, Timer } from "lucide-react";
import { Cube3D, type Cube3DHandle } from "../components/Cube3D";
import { Progress } from "../components/ui";
import { applyMoves, parseAlg, solvedCube, type CubeState } from "../cube/cube";
import { LESSONS, LESSON_BY_ID } from "../lessons";
import { SETS } from "../data";
import { useStore } from "../store/useStore";
import { averageOf, best, fmtNullable } from "../lib/stats";
import { nextLessonId } from "./Course";

// Petite animation d'accueil : le cube joue en boucle une séquence qui le ramène à l'état résolu.
const LOOP = parseAlg("R U R' U' R' F R2 U' R' U' R U R' F' U2 R U2 R' U' R U' R' U2 F R U R' U' F'");
const HERO_SEQ = [...LOOP, ...LOOP.slice().reverse().map((m) => ({ ...m, amount: -m.amount }))];

function HeroCube() {
  const ref = useRef<Cube3DHandle>(null);
  const [state] = useState<CubeState>(() => solvedCube());
  useEffect(() => {
    let alive = true;
    let s = state;
    let i = 0;
    const tick = async () => {
      await new Promise((r) => setTimeout(r, 900));
      while (alive) {
        const m = HERO_SEQ[i % HERO_SEQ.length];
        s = applyMoves(s, [m]);
        await ref.current?.animate(m, s, 230);
        i++;
        if (i % HERO_SEQ.length === 0) await new Promise((r) => setTimeout(r, 1600));
        else await new Promise((r) => setTimeout(r, 70));
      }
    };
    void tick();
    return () => { alive = false; };
  }, [state]);
  return (
    <div className="hero-cube">
      <Cube3D ref={ref} state={state} ariaLabel="Cube animé" />
    </div>
  );
}

export function HomePage() {
  const done = useStore((s) => s.lessonsDone);
  const status = useStore((s) => s.caseStatus);
  const solves = useStore((s) => s.solves);
  const next = LESSON_BY_ID[nextLessonId(done)];
  const doneCount = LESSONS.filter((l) => done[l.id]).length;
  const stats = useMemo(() => ({ best: best(solves), ao5: averageOf(solves, 5), ao12: averageOf(solves, 12) }), [solves]);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="eyebrow">Méthode CFOP · de débutant à speedcuber</div>
          <h1>Résolvez le Rubik's Cube <span className="grad">plus vite, pas à pas.</span></h1>
          <p style={{ fontSize: "1.06rem", maxWidth: 560 }}>
            Des cours progressifs avec un cube 3D animé, la notation expliquée simplement, un mélangeur officiel et des
            outils d'entraînement pour ancrer chaque algorithme.
          </p>
          <div className="row mt">
            <Link to={`/parcours/${next.id}`} className="btn primary lg">
              {doneCount === 0 ? "Commencer le parcours" : "Continuer"} <ArrowRight size={18} />
            </Link>
            <Link to="/entrainement/chrono" className="btn lg"><Timer size={18} /> Chronomètre</Link>
          </div>
        </div>
        <HeroCube />
      </section>

      <div className="grid grid-3">
        <div className="card">
          <div className="card-title"><GraduationCap size={20} color="var(--accent-text)" /><h3>Votre parcours</h3></div>
          <Progress value={doneCount / LESSONS.length} />
          <p className="small mt" style={{ marginBottom: 6 }}>{doneCount} leçon{doneCount > 1 ? "s" : ""} sur {LESSONS.length}</p>
          <p className="small" style={{ marginBottom: 12 }}>Prochaine étape : <strong>{next.title}</strong></p>
          <Link to={`/parcours/${next.id}`} className="btn sm">Ouvrir la leçon <ArrowRight size={14} /></Link>
        </div>
        <div className="card">
          <div className="card-title"><Dumbbell size={20} color="var(--success)" /><h3>Algorithmes maîtrisés</h3></div>
          <div className="stack" style={{ gap: 10 }}>
            {SETS.map((s) => {
              const n = s.cases.filter((c) => status[c.id] === "learned").length;
              return (
                <Link key={s.id} to={`/algorithmes?set=${s.id}`} style={{ color: "inherit" }}>
                  <div className="row between small" style={{ marginBottom: 3 }}>
                    <span>{s.short}</span>
                    <span className="muted mono">{n}/{s.cases.length}</span>
                  </div>
                  <Progress value={n / s.cases.length} success />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title"><Timer size={20} color="var(--warning)" /><h3>Vos temps</h3></div>
          {solves.length === 0 ? (
            <p className="small">Aucune résolution chronométrée pour l'instant. Lancez-vous : le chronomètre suit les règles WCA.</p>
          ) : (
            <div className="stats-grid">
              <div className="stat"><span className="stat-label">Record</span><span className="stat-value sm">{fmtNullable(stats.best)}</span></div>
              <div className="stat"><span className="stat-label">ao5</span><span className="stat-value sm">{fmtNullable(stats.ao5)}</span></div>
              <div className="stat"><span className="stat-label">ao12</span><span className="stat-value sm">{fmtNullable(stats.ao12)}</span></div>
            </div>
          )}
          <Link to="/entrainement/chrono" className="btn sm mt">Ouvrir le chronomètre <ArrowRight size={14} /></Link>
        </div>
      </div>

      <h2 className="mt-lg">Tout ce qu'il faut pour progresser</h2>
      <div className="grid grid-4">
        {[
          { to: "/notation", icon: PenLine, color: "var(--c-blue)", title: "Notation", text: "Comprendre R, U', F2, r, M, x… avec un cube animé et un bac à sable." },
          { to: "/parcours", icon: GraduationCap, color: "var(--c-green)", title: "Parcours CFOP", text: "De la croix à la PLL complète, en passant par les versions en 2 temps." },
          { to: "/entrainement", icon: HelpCircle, color: "var(--accent-2)", title: "Entraînement", text: "Chrono, trainer d'algorithmes avec répétition espacée, quiz de reconnaissance." },
          { to: "/melangeur", icon: Shuffle, color: "var(--c-red)", title: "Mélangeur officiel", text: "Mélanges « random-state » conformes aux normes WCA." },
        ].map((f) => (
          <Link key={f.to} to={f.to} className="card card-link">
            <div className="feature-icon" style={{ background: f.color }}><f.icon size={20} /></div>
            <h3>{f.title}</h3>
            <p className="small" style={{ marginBottom: 0 }}>{f.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
