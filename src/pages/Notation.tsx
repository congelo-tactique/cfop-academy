import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Eraser, FlipHorizontal2, Keyboard, RotateCcw } from "lucide-react";
import { Cube3D, type Cube3DHandle } from "../components/Cube3D";
import { AlgPlayer } from "../components/AlgPlayer";
import { Callout, Segmented, Switch } from "../components/ui";
import {
  applyMoves, invertAlg, MOVE_DEFS, parseMove, solvedCube, validateAlg, type CubeState, type Vec3,
} from "../cube/cube";
import { STICKER_HEX } from "../cube/palette";
import { useStore } from "../store/useStore";

// ---------------------------------------------------------------------------
// Cube de démonstration partagé
// ---------------------------------------------------------------------------

function useDemoCube() {
  const ref = useRef<Cube3DHandle>(null);
  const [state, setState] = useState<CubeState>(() => solvedCube());
  const stateRef = useRef(state);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const speed = useStore((s) => s.animSpeed);

  const run = useCallback((token: string) => {
    chain.current = chain.current.then(async () => {
      const m = parseMove(token);
      const next = applyMoves(stateRef.current, [m]);
      stateRef.current = next;
      await ref.current?.animate(m, next, Math.max(220, speed));
      setState(next);
    });
  }, [speed]);

  const reset = useCallback(() => {
    chain.current = chain.current.then(() => {
      ref.current?.finish();
      const s = solvedCube();
      stateRef.current = s;
      setState(s);
    });
  }, []);

  const highlight = useCallback((token: string | null) => {
    if (!token) return ref.current?.setHighlight(null);
    const def = MOVE_DEFS[parseMove(token).family];
    ref.current?.setHighlight((p: Vec3) => def.layers.includes(p[def.axis]));
  }, []);

  return { ref, state, run, reset, highlight };
}

type Demo = ReturnType<typeof useDemoCube>;

function MoveBtn({ m, demo, big }: { m: string; demo: Demo; big?: boolean }) {
  return (
    <button
      type="button"
      className={big ? "big" : "move-btn"}
      onClick={() => demo.run(m)}
      onMouseEnter={() => demo.highlight(m)}
      onMouseLeave={() => demo.highlight(null)}
      onFocus={() => demo.highlight(m)}
      onBlur={() => demo.highlight(null)}
      title={`Jouer ${m}`}
    >
      {m}
    </button>
  );
}

function MoveExplain({ m, variants, demo, children }: { m: string; variants?: string[]; demo: Demo; children: ReactNode }) {
  return (
    <div className="move-explain">
      <MoveBtn m={m} demo={demo} big />
      <div>
        {children}
        {variants && (
          <div className="row">
            {variants.map((v) => (
              <MoveBtn key={v} m={v} demo={demo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------

const FACE_INFO: [string, string, string, string][] = [
  ["U", "Up", "haut", STICKER_HEX.Y],
  ["D", "Down", "bas", STICKER_HEX.W],
  ["R", "Right", "droite", STICKER_HEX.O],
  ["L", "Left", "gauche", STICKER_HEX.R],
  ["F", "Front", "avant", STICKER_HEX.G],
  ["B", "Back", "arrière", STICKER_HEX.B],
];

function StepFaces({ demo }: { demo: Demo }) {
  return (
    <>
      <p>
        Chaque face du cube est désignée par une lettre, l'initiale de son nom en anglais. On la nomme selon sa
        <strong> position</strong> (par rapport à vous), pas selon sa couleur.
      </p>
      <div className="face-legend">
        {FACE_INFO.map(([l, en, fr, c]) => (
          <div key={l}>
            <b>{l}</b>
            <span className="swatch" style={{ background: c }} />
            <span><span className="muted">{en}</span> · {fr}</span>
          </div>
        ))}
      </div>
      <Callout kind="tip" title="La règle d'or">
        <p>Une lettre seule = un <strong>quart de tour dans le sens des aiguilles d'une montre</strong>, comme si vous
          regardiez cette face droit dans les yeux. Pour L, D et B, imaginez-vous de l'autre côté du cube.</p>
      </Callout>
      <div className="stack">
        <MoveExplain m="R" demo={demo}><p><strong>R</strong> : la face droite. Vue de face, sa colonne monte.</p></MoveExplain>
        <MoveExplain m="L" demo={demo}><p><strong>L</strong> : la face gauche. Vue de face, sa colonne descend (c'est le miroir de R).</p></MoveExplain>
        <MoveExplain m="U" demo={demo}><p><strong>U</strong> : la face du haut. Vue de face, la rangée du haut part vers la gauche.</p></MoveExplain>
        <MoveExplain m="D" demo={demo}><p><strong>D</strong> : la face du bas. Vue de face, la rangée du bas part vers la droite.</p></MoveExplain>
        <MoveExplain m="F" demo={demo}><p><strong>F</strong> : la face avant, tournée comme une horloge que vous regardez.</p></MoveExplain>
        <MoveExplain m="B" demo={demo}><p><strong>B</strong> : la face arrière. Vue de face, sa rangée du haut part vers la gauche.</p></MoveExplain>
      </div>
      <p className="small muted mt">Survolez un bouton pour voir la couche qui va tourner. Faites glisser le cube pour le regarder sous tous les angles.</p>
    </>
  );
}

function StepPrime({ demo }: { demo: Demo }) {
  return (
    <>
      <p>Deux symboles modifient un mouvement :</p>
      <div className="stack">
        <MoveExplain m="R'" variants={["U'", "F'", "L'", "D'", "B'"]} demo={demo}>
          <p><strong>Prime (')</strong> : on tourne dans le <strong>sens inverse</strong>. <code>R'</code> se lit « R prime ». <code>R</code> puis <code>R'</code> ne fait rien.</p>
        </MoveExplain>
        <MoveExplain m="R2" variants={["U2", "F2", "L2", "D2", "B2"]} demo={demo}>
          <p><strong>2</strong> : un <strong>demi-tour</strong> (deux quarts de tour). Le sens n'a pas d'importance pour le résultat. On voit aussi parfois <code>R2'</code>, qui indique juste le sens le plus confortable.</p>
        </MoveExplain>
      </div>
      <Callout title="Inverser une séquence">
        <p>Pour défaire une séquence, on lit à l'envers en inversant chaque mouvement : l'inverse de <code>R U F'</code> est <code>F U' R'</code>.</p>
      </Callout>
    </>
  );
}

function StepWide({ demo }: { demo: Demo }) {
  return (
    <>
      <p>
        Un mouvement <strong>large</strong> tourne une face <strong>et la tranche du milieu</strong> qui la touche, soit deux
        couches à la fois. On l'écrit en minuscule (<code>r</code>) ou avec un <code>w</code> (<code>Rw</code>, pour « wide »).
        Les deux notations sont équivalentes.
      </p>
      <div className="stack">
        <MoveExplain m="r" variants={["r'", "r2"]} demo={demo}><p><strong>r</strong> : les deux couches de droite, dans le sens de R.</p></MoveExplain>
        <MoveExplain m="l" variants={["l'"]} demo={demo}><p><strong>l</strong> : les deux couches de gauche, dans le sens de L.</p></MoveExplain>
        <MoveExplain m="u" variants={["u'", "d", "d'"]} demo={demo}><p><strong>u</strong> et <strong>d</strong> : deux couches du haut ou du bas.</p></MoveExplain>
        <MoveExplain m="f" variants={["f'", "b", "b'"]} demo={demo}><p><strong>f</strong> et <strong>b</strong> : deux couches avant ou arrière. On les croise dans plusieurs OLL.</p></MoveExplain>
      </div>
    </>
  );
}

function StepSlices({ demo }: { demo: Demo }) {
  return (
    <>
      <p>Les <strong>tranches</strong> sont les couches du milieu, entre deux faces opposées. Chacune suit le sens d'une face :</p>
      <div className="stack">
        <MoveExplain m="M" variants={["M'", "M2"]} demo={demo}><p><strong>M</strong> (Middle) : la tranche entre R et L, dans le sens de <strong>L</strong> (l'avant descend).</p></MoveExplain>
        <MoveExplain m="E" variants={["E'", "E2"]} demo={demo}><p><strong>E</strong> (Equator) : la tranche entre U et D, dans le sens de <strong>D</strong>.</p></MoveExplain>
        <MoveExplain m="S" variants={["S'", "S2"]} demo={demo}><p><strong>S</strong> (Standing) : la tranche entre F et B, dans le sens de <strong>F</strong>.</p></MoveExplain>
      </div>
      <Callout kind="tip" title="Moyen mnémotechnique">
        <p>Un mouvement large, c'est une face + sa tranche : <code>r</code> = <code>R M'</code>, <code>l</code> = <code>L M</code>.</p>
      </Callout>
    </>
  );
}

function StepRotations({ demo }: { demo: Demo }) {
  return (
    <>
      <p>Les <strong>rotations</strong> font tourner le cube entier dans vos mains, sans rien mélanger. Elles s'écrivent en minuscule :</p>
      <div className="stack">
        <MoveExplain m="x" variants={["x'", "x2"]} demo={demo}><p><strong>x</strong> : tout le cube, dans le sens de <strong>R</strong> (la face avant passe en haut).</p></MoveExplain>
        <MoveExplain m="y" variants={["y'", "y2"]} demo={demo}><p><strong>y</strong> : tout le cube, dans le sens de <strong>U</strong> (la face droite passe devant).</p></MoveExplain>
        <MoveExplain m="z" variants={["z'", "z2"]} demo={demo}><p><strong>z</strong> : tout le cube, dans le sens de <strong>F</strong> (la face du haut passe à droite).</p></MoveExplain>
      </div>
      <Callout title="Dans l'application">
        <p>Pour mélanger, on tient le cube blanc en haut et vert devant. Pour résoudre en CFOP, on fait <code>z2</code> (ou <code>x2</code>)
          pour mettre le blanc en bas : c'est l'orientation de tous les cours.</p>
      </Callout>
    </>
  );
}

function StepReading() {
  return (
    <>
      <p>Un algorithme est une suite de mouvements à lire de gauche à droite. Quelques conventions pour s'y retrouver :</p>
      <ul>
        <li>Les <strong>parenthèses</strong> regroupent des mouvements qui s'enchaînent d'un seul geste. Elles ne changent rien au résultat.</li>
        <li>Certains groupes reviennent tout le temps et ont un surnom : <code>R U R' U'</code> (le « sexy move »), <code>R' F R F'</code> (le « sledgehammer »).</li>
        <li>Un <code>U</code> au début ou à la fin d'un algorithme sert souvent juste à bien positionner : c'est l'<strong>AUF</strong>.</li>
      </ul>
      <AlgPlayer alg="(R U R' U) (R U2 R')" height={260} view="top" />
      <p className="small muted mt">
        Cliquez sur un mouvement de l'algorithme pour sauter directement à cet endroit, ou utilisez les boutons pas à pas.
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Bac à sable
// ---------------------------------------------------------------------------

const PAD = ["U", "D", "R", "L", "F", "B", "M", "E", "S", "r", "l", "u", "d", "f", "b", "x", "y", "z"];
const KEYMAP: Record<string, string> = {
  u: "U", d: "D", r: "R", l: "L", f: "F", b: "B", m: "M", e: "E", s: "S", x: "x", y: "y", z: "z",
};

function Sandbox() {
  const [text, setText] = useState("R U R' U'");
  const [mode, setMode] = useState<"solved" | "case">("solved");
  const [kbd, setKbd] = useState(false);
  const bad = validateAlg(text);
  const solved = useMemo(() => solvedCube(), []);

  const append = useCallback((m: string) => setText((t) => (t.trim() ? `${t.trim()} ${m}` : m)), []);

  useEffect(() => {
    if (!kbd) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        setText((t) => t.trim().split(/\s+/).slice(0, -1).join(" "));
        e.preventDefault();
        return;
      }
      const base = KEYMAP[e.key.toLowerCase()];
      if (!base) return;
      e.preventDefault();
      append(base + (e.shiftKey ? "'" : ""));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kbd, append]);

  return (
    <>
      <p>Écrivez n'importe quelle séquence (ou utilisez les boutons) et regardez-la s'exécuter.</p>
      <div className="field">
        <label htmlFor="sandbox-alg">Séquence</label>
        <textarea id="sandbox-alg" className="input mono" rows={2} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        {bad && <span className="small error-text">Mouvement inconnu : « {bad} »</span>}
      </div>
      <div className="row mt">
        <button type="button" className="btn sm" onClick={() => setText((t) => (validateAlg(t) ? t : invertAlg(t)))} disabled={!!bad || !text.trim()}>
          <FlipHorizontal2 size={14} /> Inverser
        </button>
        <button type="button" className="btn sm" onClick={() => setText("")}>
          <Eraser size={14} /> Effacer
        </button>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[{ value: "solved", label: "Depuis résolu" }, { value: "case", label: "Vers résolu" }]}
          ariaLabel="Point de départ"
        />
      </div>
      <div className="move-pad mt">
        {PAD.flatMap((m) => [m, `${m}'`, `${m}2`]).map((m) => (
          <button key={m} type="button" className="move-btn" onClick={() => append(m)} style={{ fontSize: "0.9rem" }}>{m}</button>
        ))}
      </div>
      <div className="row mt">
        <Switch checked={kbd} onChange={setKbd} label={<span className="row" style={{ gap: 6 }}><Keyboard size={15} /> Saisie au clavier</span>} />
        {kbd && <span className="small muted">Lettre = mouvement, Maj + lettre = prime, Retour arrière = annuler.</span>}
      </div>
      <p className="small muted mt">
        « Depuis résolu » applique la séquence au cube résolu. « Vers résolu » montre l'état que la séquence résout (pratique pour visualiser un algorithme).
      </p>
      <SandboxPlayer text={bad ? "" : text} start={mode === "solved" ? solved : undefined} />
    </>
  );
}

function SandboxPlayer({ text, start }: { text: string; start?: CubeState }) {
  return (
    <div className="mt">
      <AlgPlayer alg={text} start={start} height={300} live={!!start} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const STEPS = [
  { id: "faces", label: "1. Les faces" },
  { id: "prime", label: "2. Prime et double" },
  { id: "wide", label: "3. Mouvements larges" },
  { id: "slices", label: "4. Tranches" },
  { id: "rotations", label: "5. Rotations" },
  { id: "reading", label: "6. Lire un algorithme" },
  { id: "sandbox", label: "7. Bac à sable" },
];

export function NotationPage() {
  const [step, setStep] = useState(0);
  const demo = useDemoCube();
  const id = STEPS[step].id;
  const usesDemo = !["reading", "sandbox"].includes(id);

  return (
    <div className="page">
      <header className="page-header">
        <div className="eyebrow">Notation</div>
        <h1>Lire et écrire les mouvements</h1>
        <p>La notation standard (dite « Singmaster ») permet d'écrire n'importe quelle séquence. Elle est utilisée partout : tutoriels, algorithmes, mélanges officiels.</p>
      </header>

      <div className="steps-nav">
        {STEPS.map((s, i) => (
          <button key={s.id} type="button" className={`chip ${i === step ? "active" : ""}`} onClick={() => setStep(i)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className={usesDemo ? "notation-layout" : ""}>
        <div className={usesDemo ? "" : "page-narrow"} style={usesDemo ? undefined : { margin: 0, maxWidth: 820 }}>
          <h2>{STEPS[step].label.replace(/^\d+\.\s*/, "")}</h2>
          {id === "faces" && <StepFaces demo={demo} />}
          {id === "prime" && <StepPrime demo={demo} />}
          {id === "wide" && <StepWide demo={demo} />}
          {id === "slices" && <StepSlices demo={demo} />}
          {id === "rotations" && <StepRotations demo={demo} />}
          {id === "reading" && <StepReading />}
          {id === "sandbox" && <Sandbox />}

          <div className="lesson-nav">
            <button type="button" className="btn" onClick={() => setStep(step - 1)} disabled={step === 0}><ArrowLeft size={16} /> Précédent</button>
            {step < STEPS.length - 1 && (
              <button type="button" className="btn primary" onClick={() => setStep(step + 1)}>{STEPS[step + 1].label.replace(/^\d+\.\s*/, "")} <ArrowRight size={16} /></button>
            )}
          </div>
        </div>
        {usesDemo && (
          <div className="notation-cube">
            <div className="alg-player-stage" style={{ height: 380 }}>
              <Cube3D ref={demo.ref} state={demo.state} labels />
              <button type="button" className="icon-btn stage-reset" onClick={demo.reset} title="Remettre à zéro" aria-label="Remettre le cube à zéro">
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="row mt" style={{ justifyContent: "center" }}>
              <button type="button" className="btn sm" onClick={demo.reset}><RotateCcw size={14} /> Remettre à zéro</button>
              <button type="button" className="btn sm ghost" onClick={() => demo.ref.current?.resetCamera()}>Recentrer la vue</button>
            </div>
            <p className="small muted" style={{ textAlign: "center", marginTop: 8 }}>
              Jaune en haut, vert devant : l'orientation des cours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
