import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, HelpCircle, Shuffle, Timer } from "lucide-react";
import { useStore } from "../store/useStore";
import { ALL_CASES } from "../data";
import { averageOf, fmtNullable } from "../lib/stats";

export function TrainingPage() {
  const solves = useStore((s) => s.solves);
  const srs = useStore((s) => s.srs);
  const now = Date.now();
  const due = ALL_CASES.filter((c) => srs[c.id] && srs[c.id].due <= now).length;
  const trained = Object.keys(srs).length;

  const modes = [
    {
      to: "/entrainement/chrono", icon: Timer, color: "var(--c-blue)", title: "Chronomètre",
      text: "Résolutions complètes avec mélanges officiels, inspection WCA, pénalités, ao5/ao12 et graphique de progression.",
      stat: solves.length ? `${solves.length} temps · ao5 ${fmtNullable(averageOf(solves, 5))}` : "Aucun temps pour l'instant",
    },
    {
      to: "/entrainement/algos", icon: BookOpen, color: "var(--c-green)", title: "Trainer d'algorithmes",
      text: "Choisissez vos cas, exécutez-les sur votre cube, notez-vous. Mode aléatoire ou répétition espacée.",
      stat: trained ? `${trained} cas entraînés · ${due} à revoir` : "Aucun cas entraîné",
    },
    {
      to: "/entrainement/quiz", icon: HelpCircle, color: "var(--accent-2)", title: "Quiz de reconnaissance",
      text: "Identifiez un cas par son nom ou son algorithme, sans cube en main. Parfait pour réviser n'importe où.",
      stat: "OLL, PLL, F2L, 2 temps",
    },
    {
      to: "/melangeur", icon: Shuffle, color: "var(--c-red)", title: "Mélangeur",
      text: "Générez des mélanges random-state, une série de compétition, et la solution optimale de la croix.",
      stat: "Norme WCA",
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div className="eyebrow">Entraînement</div>
        <h1>Choisissez votre entraînement</h1>
        <p>Chaque outil est indépendant : utilisez ceux qui vous conviennent, dans l'ordre que vous voulez.</p>
      </header>
      <div className="grid grid-2">
        {modes.map((m) => (
          <Link key={m.to} to={m.to} className="card card-link mode-card">
            <div className="feature-icon" style={{ background: m.color }}><m.icon size={20} /></div>
            <h2 style={{ margin: 0 }}>{m.title}</h2>
            <p style={{ margin: 0 }}>{m.text}</p>
            <div className="row between mt">
              <span className="small muted">{m.stat}</span>
              <span className="btn sm">Ouvrir <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>
      {due > 0 && (
        <div className="practice-box mt-lg">
          <div className="grow">
            <h4>{due} cas à réviser</h4>
            <p>La répétition espacée vous propose de les revoir maintenant, au moment idéal pour les mémoriser.</p>
          </div>
          <Link to="/entrainement/algos" className="btn primary">Réviser</Link>
        </div>
      )}
    </div>
  );
}
