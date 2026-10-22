import { SET_BY_ID, type SetId } from "../data";
import { useStore } from "../store/useStore";
import { CaseCard } from "./CaseViews";

/** Sélection de cas par groupe, avec raccourcis par statut. */
export function CaseSelector({ set, selected, onChange }: { set: SetId; selected: Set<string>; onChange: (s: Set<string>) => void }) {
  const s = SET_BY_ID[set];
  const status = useStore((st) => st.caseStatus);
  const pick = (fn: (id: string) => boolean) => onChange(new Set(s.cases.filter((c) => fn(c.id)).map((c) => c.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    onChange(n);
  };
  const toggleGroup = (g: string) => {
    const ids = s.cases.filter((c) => c.group === g).map((c) => c.id);
    const all = ids.every((id) => selected.has(id));
    const n = new Set(selected);
    ids.forEach((id) => (all ? n.delete(id) : n.add(id)));
    onChange(n);
  };
  const count = (st: string) => s.cases.filter((c) => (status[c.id] ?? "new") === st).length;

  return (
    <div>
      <div className="row">
        <button type="button" className="chip" onClick={() => pick(() => true)}>Tout ({s.cases.length})</button>
        <button type="button" className="chip" onClick={() => pick(() => false)}>Aucun</button>
        <button type="button" className="chip" onClick={() => pick((id) => (status[id] ?? "new") === "learning")}>En cours ({count("learning")})</button>
        <button type="button" className="chip" onClick={() => pick((id) => (status[id] ?? "new") === "new")}>À apprendre ({count("new")})</button>
        <button type="button" className="chip" onClick={() => pick((id) => (status[id] ?? "new") !== "learned")}>Non maîtrisés</button>
        <button type="button" className="chip" onClick={() => pick((id) => status[id] === "learned")}>Maîtrisés ({count("learned")})</button>
      </div>
      {s.groups.map((g) => {
        const list = s.cases.filter((c) => c.group === g.id);
        if (!list.length) return null;
        const all = list.every((c) => selected.has(c.id));
        return (
          <div key={g.id}>
            <div className="group-head">
              <h3>{g.name}</h3>
              <button type="button" className="btn sm ghost" onClick={() => toggleGroup(g.id)}>{all ? "Tout désélectionner" : "Tout sélectionner"}</button>
            </div>
            <div className="case-grid">
              {list.map((c) => (
                <CaseCard key={c.id} c={c} selectable selected={selected.has(c.id)} onToggle={() => toggle(c.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
