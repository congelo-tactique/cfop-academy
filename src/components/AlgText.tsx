import { Fragment } from "react";

const TOKEN_RE = /([URFDLB]w|[URFDLBurfdlbMESxyz])(\d*)('?)|([()[\]])|(\S+)/g;

interface Props {
  alg: string;
  /** Nombre de mouvements déjà joués (pour surligner). */
  current?: number;
  onMoveClick?: (index: number) => void;
  className?: string;
}

/** Affiche un algorithme en conservant les parenthèses, avec le mouvement courant surligné. */
export function AlgText({ alg, current, onMoveClick, className }: Props) {
  const parts: React.ReactNode[] = [];
  let moveIdx = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(TOKEN_RE.source, "g");
  const text = alg.replace(/[’′]/g, "'");
  let k = 0;
  while ((m = re.exec(text))) {
    if (m[4]) {
      parts.push(<span key={k++} className="alg-paren">{m[4]}</span>);
      continue;
    }
    if (m[5]) {
      parts.push(<span key={k++} className="alg-bad">{m[5]}</span>);
      continue;
    }
    const i = moveIdx++;
    const state = current === undefined ? "" : i < current ? "done" : i === current ? "next" : "";
    parts.push(
      <Fragment key={k++}>
        {onMoveClick ? (
          <button type="button" className={`alg-move ${state}`} onClick={() => onMoveClick(i + 1)} title="Aller à ce mouvement">
            {m[0]}
          </button>
        ) : (
          <span className={`alg-move ${state}`}>{m[0]}</span>
        )}
      </Fragment>,
    );
  }
  return <span className={`alg-text ${className ?? ""}`}>{parts}</span>;
}
