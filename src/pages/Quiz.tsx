import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw, Trophy, X } from "lucide-react";
import { SETS, SET_BY_ID, getAlignedAlgs, type AlgCase, type SetId } from "../data";
import { useStore } from "../store/useStore";
import { CaseThumb } from "../components/CaseViews";
import { AlgText } from "../components/AlgText";
import { Segmented, Switch, toast } from "../components/ui";

type QType = "name" | "alg";
const AUFS = ["", "U", "U2", "U'"];

interface Question {
  c: AlgCase;
  auf: string;
  choices: AlgCase[];
}

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function label(c: AlgCase) {
  return c.nickname ? `${c.name} · ${c.nickname}` : c.name;
}

function makeQuestions(cases: AlgCase[], n: number, randomAuf: boolean): Question[] {
  const out: Question[] = [];
  let bag: AlgCase[] = [];
  for (let i = 0; i < n; i++) {
    if (bag.length === 0) bag = shuffle(cases);
    const c = bag.pop()!;
    const sameGroup = shuffle(cases.filter((x) => x.id !== c.id && x.group === c.group)).slice(0, 2);
    const others = shuffle(cases.filter((x) => x.id !== c.id && !sameGroup.includes(x)));
    const distract = [...sameGroup, ...others].slice(0, Math.min(3, cases.length - 1));
    out.push({ c, auf: randomAuf ? AUFS[Math.floor(Math.random() * 4)] : "", choices: shuffle([c, ...distract]) });
  }
  return out;
}

export function QuizPage() {
  const [params] = useSearchParams();
  const init = (params.get("set") as SetId) || "pll2";
  const [setId, setSetId] = useState<SetId>(SET_BY_ID[init] ? init : "pll2");
  const [qtype, setQtype] = useState<QType>("name");
  const [count, setCount] = useState(10);
  const [auf, setAuf] = useState(true);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const quiz = useStore((s) => s.quiz);
  const isF2L = setId === "f2l";
  const effectiveType: QType = isF2L ? "alg" : qtype;
  const key = `${setId}-${effectiveType}`;

  if (questions) {
    return (
      <QuizSession
        questions={questions} qtype={effectiveType} recordKey={key}
        onExit={() => setQuestions(null)}
        onRestart={() => setQuestions(makeQuestions(SET_BY_ID[setId].cases, count, auf))}
      />
    );
  }

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="eyebrow">Entraînement</div>
        <h1>Quiz de reconnaissance</h1>
        <p>Un cas s'affiche : retrouvez son nom ou son algorithme le plus vite possible. Idéal pour travailler la reconnaissance sans cube en main.</p>
      </header>
      <div className="card stack" style={{ gap: 20 }}>
        <div className="field">
          <label>Set</label>
          <div className="row">
            {SETS.map((s) => (
              <button key={s.id} type="button" className={`chip ${s.id === setId ? "active" : ""}`} onClick={() => setSetId(s.id)}>{s.name}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Question</label>
          <Segmented<QType>
            value={effectiveType}
            onChange={setQtype}
            options={isF2L ? [{ value: "alg", label: "Trouver l'algorithme" }] : [{ value: "name", label: "Trouver le nom" }, { value: "alg", label: "Trouver l'algorithme" }]}
          />
          {isF2L && <span className="small muted">Pour le F2L, on retrouve l'algorithme (les numéros n'ont pas de sens universel).</span>}
        </div>
        <div className="field">
          <label>Nombre de questions</label>
          <Segmented<number> value={count} onChange={setCount} options={[10, 20, 40].map((n) => ({ value: n, label: String(n) }))} />
        </div>
        <Switch checked={auf} onChange={setAuf} label="Orientation aléatoire (AUF)" />
        <div className="row between">
          <span className="small muted">
            {quiz[key] ? <>Meilleur score : <strong>{quiz[key].best} %</strong> · {quiz[key].played} partie{quiz[key].played > 1 ? "s" : ""}</> : "Pas encore joué"}
          </span>
          <button type="button" className="btn primary lg" onClick={() => setQuestions(makeQuestions(SET_BY_ID[setId].cases, count, auf))}>
            <Play size={18} /> Lancer le quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizSession({ questions, qtype, recordKey, onExit, onRestart }: {
  questions: Question[]; qtype: QType; recordKey: string; onExit: () => void; onRestart: () => void;
}) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [startT] = useState(() => Date.now());
  const recordQuiz = useStore((s) => s.recordQuiz);
  const setStatus = useStore((s) => s.setCaseStatus);
  const preferred = useStore((s) => s.preferred);
  const finished = results.length === questions.length;
  const q = questions[Math.min(i, questions.length - 1)];
  const score = Math.round((results.filter(Boolean).length / questions.length) * 100);

  const algOf = useCallback((c: AlgCase) => {
    const a = getAlignedAlgs(c);
    return a[Math.min(preferred[c.id] ?? 0, a.length - 1)];
  }, [preferred]);

  const choose = useCallback((id: string) => {
    if (answer || finished) return;
    setAnswer(id);
    const ok = id === q.c.id;
    setResults((r) => {
      const n = [...r, ok];
      if (n.length === questions.length) recordQuiz(recordKey, Math.round((n.filter(Boolean).length / questions.length) * 100));
      return n;
    });
  }, [answer, finished, q, questions.length, recordQuiz, recordKey]);

  const nextQ = useCallback(() => {
    if (!answer) return;
    setAnswer(null);
    setI((x) => x + 1);
  }, [answer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const c = q.choices[Number(e.key) - 1];
        if (c) choose(c.id);
      } else if ((e.key === "Enter" || e.code === "Space") && answer) {
        e.preventDefault();
        nextQ();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, choose, answer, nextQ]);

  const mistakes = useMemo(() => {
    const seen = new Set<string>();
    return questions.filter((qq, k) => results[k] === false && !seen.has(qq.c.id) && seen.add(qq.c.id)).map((qq) => qq.c);
  }, [questions, results]);

  if (finished && !answer) {
    const secs = Math.round((Date.now() - startT) / 1000);
    return (
      <div className="page-narrow">
        <div className="card" style={{ textAlign: "center" }}>
          <Trophy size={40} color="var(--warning)" />
          <h1 style={{ marginTop: 10 }}>{score} %</h1>
          <p>{results.filter(Boolean).length} bonnes réponses sur {questions.length} · {secs} s</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <button type="button" className="btn primary" onClick={onRestart}><RotateCcw size={16} /> Rejouer</button>
            <button type="button" className="btn" onClick={onExit}>Changer de quiz</button>
          </div>
        </div>
        {mistakes.length > 0 && (
          <div className="card mt">
            <div className="row between mb">
              <h3 style={{ margin: 0 }}>À revoir</h3>
              <button type="button" className="btn sm" onClick={() => { mistakes.forEach((c) => setStatus(c.id, "learning")); toast("Cas marqués « en cours »"); }}>
                Marquer « en cours »
              </button>
            </div>
            <div className="case-grid">
              {mistakes.map((c) => (
                <div key={c.id} className="case-card" style={{ cursor: "default" }}>
                  <div className="thumb"><CaseThumb c={c} /></div>
                  <div className="case-name">{c.name}</div>
                  {c.nickname && <div className="case-nick">{c.nickname}</div>}
                  <div className="case-alg">{algOf(c)}</div>
                </div>
              ))}
            </div>
            <Link className="btn mt" to={`/entrainement/algos?set=${mistakes[0].set}&cases=${mistakes.map((c) => c.id).join(",")}`}>
              S'entraîner sur ces cas <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <div className="row between mb">
        <button type="button" className="btn ghost" onClick={onExit}><ArrowLeft size={16} /> Quitter</button>
        <span className="small muted">Question {Math.min(i + 1, questions.length)} / {questions.length} · {results.filter(Boolean).length} ✓</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: "100%", width: `${(results.length / questions.length) * 100}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))", transition: "width .3s" }} />
      </div>
      <div className="trainer-stage">
        <h2 style={{ margin: 0, textAlign: "center" }}>{qtype === "name" ? "Quel est ce cas ?" : "Quel algorithme résout ce cas ?"}</h2>
        <div className="trainer-visual" style={{ minHeight: 260, padding: 20 }}>
          <CaseThumb c={q.c} preAuf={q.auf} size={220} arrows={false} />
        </div>
        <div className="quiz-choices">
          {q.choices.map((c, k) => {
            const state = answer ? (c.id === q.c.id ? "correct" : c.id === answer ? "wrong" : "") : "";
            return (
              <button key={c.id} type="button" className={`quiz-choice ${state}`} onClick={() => choose(c.id)} disabled={!!answer}>
                <span className="key">{k + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{qtype === "name" ? <strong>{label(c)}</strong> : <AlgText alg={algOf(c)} />}</span>
                {state === "correct" && <Check size={18} color="var(--success)" />}
                {state === "wrong" && <X size={18} color="var(--danger)" />}
              </button>
            );
          })}
        </div>
        {answer && (
          <div className="row between">
            <span className="small">
              {answer === q.c.id ? <strong style={{ color: "var(--success)" }}>Bonne réponse !</strong> : <><strong style={{ color: "var(--danger)" }}>Raté.</strong> C'était {label(q.c)}.</>}
              {q.c.tip && <span className="muted"> {q.c.tip}</span>}
            </span>
            <button type="button" className="btn primary" onClick={nextQ}>
              {results.length === questions.length ? "Voir le résultat" : "Suivant"} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
      <p className="small muted" style={{ textAlign: "center", marginTop: 12 }}>Touches <kbd>1</kbd>–<kbd>4</kbd> pour répondre, <kbd>Entrée</kbd> pour continuer.</p>
    </div>
  );
}
