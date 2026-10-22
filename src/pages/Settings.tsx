import { useRef } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { exportData, useStore } from "../store/useStore";
import { Segmented, Switch, toast } from "../components/ui";
import { SPEEDS } from "../components/AlgPlayer";

export function SettingsPage() {
  const s = useStore();
  const file = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cfop-academy-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Sauvegarde téléchargée");
  };

  const doImport = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (s.importData(data)) toast("Données importées");
      else toast("Fichier non reconnu");
    } catch {
      toast("Fichier invalide");
    }
  };

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="eyebrow">Réglages</div>
        <h1>Préférences</h1>
      </header>

      <div className="card stack" style={{ gap: 20 }}>
        <div className="row between">
          <div><strong>Thème</strong><div className="small muted">Sombre ou clair.</div></div>
          <Segmented value={s.theme} onChange={(v) => s.setSetting("theme", v)} options={[{ value: "dark", label: "Sombre" }, { value: "light", label: "Clair" }]} />
        </div>
        <div className="row between">
          <div><strong>Vitesse des animations</strong><div className="small muted">Pour tous les cubes 3D.</div></div>
          <Segmented value={s.animSpeed} onChange={(v) => s.setSetting("animSpeed", v)} options={SPEEDS.map((x) => ({ value: x.ms, label: x.label }))} />
        </div>
        <div className="stack" style={{ gap: 12 }}>
          <strong>Chronomètre</strong>
          <Switch checked={s.inspection} onChange={(v) => s.setSetting("inspection", v)} label="Inspection WCA de 15 secondes" />
          <Switch checked={s.hideTimeWhileRunning} onChange={(v) => s.setSetting("hideTimeWhileRunning", v)} label="Masquer le temps pendant la résolution" />
          <Switch checked={s.showCrossSolution} onChange={(v) => s.setSetting("showCrossSolution", v)} label="Afficher la solution optimale de la croix" />
        </div>
        <div className="stack" style={{ gap: 12 }}>
          <strong>Trainer</strong>
          <Switch checked={s.trainerAuf} onChange={(v) => s.setSetting("trainerAuf", v)} label="Orientation aléatoire des cas (AUF)" />
        </div>
      </div>

      <div className="card mt">
        <h3>Vos données</h3>
        <p className="small">
          Tout est enregistré dans ce navigateur : progression, statuts des cas, temps et révisions. Exportez une sauvegarde pour
          la transférer sur un autre appareil ou navigateur.
        </p>
        <div className="row">
          <button type="button" className="btn" onClick={doExport}><Download size={16} /> Exporter</button>
          <button type="button" className="btn" onClick={() => file.current?.click()}><Upload size={16} /> Importer</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ""; }} />
          <div className="spacer" />
          <button type="button" className="btn danger" onClick={() => { if (confirm("Effacer toute votre progression, vos temps et vos révisions ? Cette action est définitive.")) { s.resetAll(); toast("Progression réinitialisée"); } }}>
            <RotateCcw size={16} /> Tout réinitialiser
          </button>
        </div>
        <p className="small muted mt" style={{ marginBottom: 0 }}>
          {Object.keys(s.lessonsDone).filter((k) => s.lessonsDone[k]).length} leçons terminées · {Object.keys(s.caseStatus).length} cas suivis · {s.solves.length} temps
        </p>
      </div>
    </div>
  );
}
