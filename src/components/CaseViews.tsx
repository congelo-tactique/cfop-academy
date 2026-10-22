import { useState } from "react";
import { Check, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { getAlignedAlgs, getCaseState, SET_BY_ID, type AlgCase } from "../data";
import { useStore, type CaseStatus } from "../store/useStore";
import { IsoDiagram, LLDiagram } from "./Diagrams";
import { AlgPlayer } from "./AlgPlayer";
import { AlgText } from "./AlgText";
import { Callout, Modal, STATUS_LABEL, StatusPill } from "./ui";

/** Miniature 2D adaptée au type de cas. */
export function CaseThumb({ c, size = 110, preAuf = "", arrows }: { c: AlgCase; size?: number | string; preAuf?: string; arrows?: boolean }) {
  const st = getCaseState(c, preAuf);
  if (SET_BY_ID[c.set].thumb === "f2l") return <IsoDiagram state={st} mask={c.mask} size={size} />;
  const showArrows = arrows ?? (c.goal === "pll" && !preAuf);
  return <LLDiagram state={st} mask={c.mask} size={size} arrows={showArrows} />;
}

export function usePreferredAlg(c: AlgCase): string {
  const pref = useStore((s) => s.preferred[c.id] ?? 0);
  const algs = getAlignedAlgs(c);
  return algs[Math.min(pref, algs.length - 1)];
}

export function CaseCard({ c, onOpen, selectable, selected, onToggle }: {
  c: AlgCase; onOpen?: () => void; selectable?: boolean; selected?: boolean; onToggle?: () => void;
}) {
  const status = useStore((s) => s.caseStatus[c.id] ?? "new");
  const alg = usePreferredAlg(c);
  return (
    <button
      type="button"
      className={`case-card ${selectable ? "selectable" : ""} ${selected ? "selected" : ""}`}
      onClick={selectable ? onToggle : onOpen}
      aria-pressed={selectable ? selected : undefined}
    >
      {selectable && <span className="check">{selected && <Check size={14} />}</span>}
      <div className="thumb"><CaseThumb c={c} /></div>
      <div className="case-name">
        <span>{c.name}</span>
        {!selectable && <span className={`status-dot ${status}`} title={STATUS_LABEL[status]} />}
      </div>
      {c.nickname && <div className="case-nick">{c.nickname}</div>}
      {!selectable && <div className="case-alg">{alg}</div>}
    </button>
  );
}

export function CaseGrid({ cases, onOpen }: { cases: AlgCase[]; onOpen: (c: AlgCase) => void }) {
  return (
    <div className="case-grid">
      {cases.map((c) => <CaseCard key={c.id} c={c} onOpen={() => onOpen(c)} />)}
    </div>
  );
}

/** Galerie groupée d'un set, avec modale de détail intégrée. */
export function CaseGallery({ cases, groups }: { cases: AlgCase[]; groups?: { id: string; name: string; description?: string }[] }) {
  const [open, setOpen] = useState<AlgCase | null>(null);
  const gs = groups ?? [{ id: "_", name: "" }];
  return (
    <>
      {gs.map((g) => {
        const list = groups ? cases.filter((c) => c.group === g.id) : cases;
        if (list.length === 0) return null;
        return (
          <div key={g.id}>
            {groups && (
              <div className="group-head">
                <h3>{g.name}</h3>
                <span className="muted">{list.length} cas{g.description ? ` · ${g.description}` : ""}</span>
              </div>
            )}
            <CaseGrid cases={list} onOpen={setOpen} />
          </div>
        );
      })}
      {open && <CaseModal c={open} onClose={() => setOpen(null)} />}
    </>
  );
}

export function CaseModal({ c, onClose }: { c: AlgCase; onClose: () => void }) {
  const algs = getAlignedAlgs(c);
  const pref = useStore((s) => s.preferred[c.id] ?? 0);
  const setPreferred = useStore((s) => s.setPreferred);
  const status = useStore((s) => s.caseStatus[c.id] ?? "new");
  const setStatus = useStore((s) => s.setCaseStatus);
  const card = useStore((s) => s.srs[c.id]);
  const [shown, setShown] = useState(Math.min(pref, algs.length - 1));
  const set = SET_BY_ID[c.set];
  const group = set.groups.find((g) => g.id === c.group);

  return (
    <Modal
      title={<span className="row">{c.name}{c.nickname && <span className="muted" style={{ fontWeight: 500 }}>· {c.nickname}</span>}</span>}
      subtitle={`${set.name} · ${group?.name ?? ""}`}
      onClose={onClose}
    >
      <div className="case-detail">
        <div>
          <AlgPlayer alg={algs[shown]} mask={c.mask} height={330} view={c.goal === "f2l" ? "iso" : "top"} />
        </div>
        <div className="stack">
          <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
            <CaseThumb c={c} size={120} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <StatusPill status={status} />
              {c.tip && <p className="small" style={{ marginTop: 8 }}>{c.tip}</p>}
              {card && (
                <p className="small muted" style={{ marginBottom: 0 }}>
                  Entraîné {card.attempts} fois · {Math.round((card.success / Math.max(1, card.attempts)) * 100)} % de réussite
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: 8 }}>Algorithmes</h3>
            <p className="small muted" style={{ marginBottom: 8 }}>
              Cliquez pour l'animer. Le bouton radio choisit votre algorithme préféré (utilisé partout dans l'application).
            </p>
            <div className="stack" style={{ gap: 8 }}>
              {algs.map((a, i) => (
                <div key={a} className={`alg-option ${i === shown ? "active" : ""}`} onClick={() => setShown(i)}>
                  <button
                    type="button"
                    className={`radio ${i === pref ? "on" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setPreferred(c.id, i); setShown(i); }}
                    title="Choisir comme algorithme préféré"
                    aria-label="Choisir comme algorithme préféré"
                  >
                  </button>
                  <AlgText alg={a} />
                  {i === pref && <span className="pill accent" style={{ marginLeft: "auto" }}>Préféré</span>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: 8 }}>Mon statut</h3>
            <div className="status-picker">
              {(["new", "learning", "learned"] as CaseStatus[]).map((s) => (
                <button key={s} type="button" className={`btn sm ${status === s ? `active ${s}` : ""}`} onClick={() => setStatus(c.id, s)}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          {c.goal === "f2l" && (
            <Callout kind="info">
              <p className="small">Algorithmes donnés pour l'emplacement avant-droit. Pour un autre emplacement, tournez le cube (y, y', y2) ou faites le miroir.</p>
            </Callout>
          )}
          <Link className="btn" to={`/entrainement/algos?set=${c.set}&cases=${c.id}`} onClick={onClose}>
            <Dumbbell size={16} /> S'entraîner sur ce cas
          </Link>
        </div>
      </div>
    </Modal>
  );
}
