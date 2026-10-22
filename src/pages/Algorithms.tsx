import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Dumbbell, HelpCircle } from "lucide-react";
import { SETS, SET_BY_ID, type SetId } from "../data";
import { useStore, type CaseStatus } from "../store/useStore";
import { CaseGallery } from "../components/CaseViews";
import { Progress, Segmented } from "../components/ui";

type Filter = "all" | CaseStatus;

export function AlgorithmsPage() {
  const [params, setParams] = useSearchParams();
  const setId = (params.get("set") as SetId) || "oll2";
  const set = SET_BY_ID[setId] ?? SETS[0];
  const status = useStore((s) => s.caseStatus);
  const [filter, setFilter] = useState<Filter>("all");

  const cases = useMemo(
    () => set.cases.filter((c) => filter === "all" || (status[c.id] ?? "new") === filter),
    [set, filter, status],
  );
  const learned = set.cases.filter((c) => status[c.id] === "learned").length;
  const learning = set.cases.filter((c) => status[c.id] === "learning").length;

  return (
    <div className="page">
      <header className="page-header">
        <div className="eyebrow">Bibliothèque</div>
        <h1>Algorithmes</h1>
        <p>Tous les cas, avec animation, alternatives et suivi de votre apprentissage. Cliquez sur un cas pour le voir en 3D.</p>
      </header>

      <div className="tabs" role="tablist">
        {SETS.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === set.id} className={s.id === set.id ? "active" : ""}
            onClick={() => { setParams({ set: s.id }); setFilter("all"); }}>
            {s.name} <span className="muted small">({s.cases.length})</span>
          </button>
        ))}
      </div>

      <div className="card flat mb">
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ marginBottom: 4 }}>{set.name}</h2>
            <p style={{ marginBottom: 12 }}>{set.description}</p>
            <div className="row" style={{ maxWidth: 460 }}>
              <div style={{ flex: 1 }}><Progress value={learned / set.cases.length} success /></div>
              <span className="small muted">{learned} maîtrisé{learned > 1 ? "s" : ""} · {learning} en cours · {set.cases.length} cas</span>
            </div>
          </div>
          <div className="row">
            <Link className="btn primary" to={`/entrainement/algos?set=${set.id}`}><Dumbbell size={16} /> S'entraîner</Link>
            <Link className="btn" to={`/entrainement/quiz?set=${set.id}`}><HelpCircle size={16} /> Quiz</Link>
          </div>
        </div>
      </div>

      <div className="row between">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrer par statut"
          options={[
            { value: "all", label: "Tous" },
            { value: "new", label: "À apprendre" },
            { value: "learning", label: "En cours" },
            { value: "learned", label: "Maîtrisés" },
          ]}
        />
      </div>

      {cases.length === 0 ? (
        <div className="empty">Aucun cas avec ce statut pour l'instant.</div>
      ) : (
        <CaseGallery cases={cases} groups={set.groups} />
      )}
    </div>
  );
}
