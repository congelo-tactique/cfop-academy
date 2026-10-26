import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Circle, Clock } from "lucide-react";
import { LESSONS, type Lesson, type Track } from "../lessons";
import { useStore } from "../store/useStore";
import { Progress } from "../components/ui";

export function nextLessonId(done: Record<string, boolean>, lessons: Lesson[] = LESSONS): string {
  return (lessons.find((l) => !done[l.id]) ?? lessons[lessons.length - 1]).id;
}

export function CoursePage({ track }: { track: Track }) {
  const done = useStore((s) => s.lessonsDone);
  const { lessons } = track;
  const count = lessons.filter((l) => done[l.id]).length;
  const current = nextLessonId(done, lessons);
  let lastPhase = "";

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="eyebrow">{track.eyebrow}</div>
        <h1>{track.title}</h1>
        <p>{track.intro}</p>
        <div className="row" style={{ maxWidth: 420 }}>
          <div style={{ flex: 1 }}><Progress value={count / lessons.length} /></div>
          <span className="small muted">{count}/{lessons.length} leçons</span>
        </div>
      </header>

      <div className="path">
        {lessons.map((l, i) => {
          const showPhase = l.phase !== lastPhase;
          lastPhase = l.phase;
          return (
            <div key={l.id} style={{ display: "contents" }}>
              {showPhase && <div className="phase-label">{l.phase}</div>}
              <Link to={`${track.base}/${l.id}`} className={`path-item ${l.id === current ? "current" : ""}`}>
                <div className={`path-num ${done[l.id] ? "done" : ""}`} style={{ background: l.color }}>
                  {i}
                </div>
                <div>
                  <h3>{l.title}</h3>
                  <p>{l.description}</p>
                  <div className="path-meta">
                    <span className="pill"><Clock size={12} /> ~{l.minutes} min</span>
                    {l.badge && <span className="pill accent">{l.badge}</span>}
                    {l.id === current && !done[l.id] && <span className="pill learning">Prochaine étape</span>}
                  </div>
                </div>
                <ChevronRight className="path-go muted" size={20} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LessonPage({ track }: { track: Track }) {
  const { id } = useParams();
  const { lessons } = track;
  const lesson = lessons.find((l) => l.id === id);
  const done = useStore((s) => (id ? !!s.lessonsDone[id] : false));
  const toggle = useStore((s) => s.toggleLesson);
  if (!lesson) return <Navigate to={track.base} replace />;
  const idx = lessons.indexOf(lesson);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const Content = lesson.component;

  return (
    <article className="lesson">
      <Link to={track.base} className="btn ghost sm" style={{ marginBottom: 12 }}><ArrowLeft size={14} /> {track.eyebrow}</Link>
      <header className="page-header">
        <div className="eyebrow">
          <span style={{ width: 10, height: 10, borderRadius: 3, background: lesson.color, display: "inline-block" }} />
          Étape {idx} · {lesson.phase}
        </div>
        <h1>{lesson.title}</h1>
        <div className="row small muted"><Clock size={14} /> environ {lesson.minutes} min{done && <span className="pill learned">Terminée</span>}</div>
      </header>

      <Content />

      <div className="lesson-done-bar">
        {done ? <CheckCircle2 color="var(--success)" /> : <Circle className="muted" />}
        <div style={{ flex: 1, minWidth: 200 }}>
          <strong>{done ? "Leçon terminée" : "Vous avez fini cette leçon ?"}</strong>
          <div className="small muted">Marquer les leçons vous permet de suivre votre progression sur l'accueil.</div>
        </div>
        <button type="button" className={`btn ${done ? "" : "primary"}`} onClick={() => toggle(lesson.id)}>
          {done ? "Marquer comme non terminée" : "Marquer comme terminée"}
        </button>
      </div>

      <nav className="lesson-nav">
        {prev ? (
          <Link className="btn" to={`${track.base}/${prev.id}`}><ArrowLeft size={16} /> {prev.title}</Link>
        ) : <span />}
        {next && (
          <Link className="btn primary" to={`${track.base}/${next.id}`} onClick={() => !done && toggle(lesson.id, true)}>
            {next.title} <ArrowRight size={16} />
          </Link>
        )}
      </nav>
    </article>
  );
}
