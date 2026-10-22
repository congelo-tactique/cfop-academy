import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CubeView, type CubeViewOptions } from "../cube/render3d";
import type { CubeState, Move, Vec3 } from "../cube/cube";
import type { MaskId } from "../data/types";

export interface Cube3DHandle {
  animate(move: Move, next: CubeState, ms: number): Promise<void>;
  finish(): void;
  resetCamera(): void;
  setHighlight(fn: ((pos: Vec3) => boolean) | null): void;
}

interface Props extends CubeViewOptions {
  state: CubeState;
  mask?: MaskId;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/** Cube 3D (three.js). L'état affiché suit `state` ; les animations passent par la ref. */
export const Cube3D = forwardRef<Cube3DHandle, Props>(function Cube3D(
  { state, mask = "full", className, style, interactive = true, labels = false, view = "iso", ariaLabel },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<CubeView | null>(null);
  const latest = useRef({ state, mask });
  latest.current = { state, mask };
  // le contexte WebGL n'est créé qu'à la première apparition à l'écran
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { rootMargin: "200px" });
    io.observe(host.current!);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen) return;
    const v = new CubeView(host.current!, { interactive, labels, view });
    v.setState(latest.current.state, latest.current.mask);
    viewRef.current = v;
    return () => {
      v.dispose();
      viewRef.current = null;
    };
  }, [interactive, labels, view, seen]);

  useEffect(() => {
    const v = viewRef.current;
    if (v && !v.isAnimating) v.setState(state, mask);
  }, [state, mask]);

  useImperativeHandle(ref, () => ({
    animate(move, next, ms) {
      const v = viewRef.current;
      if (!v) return Promise.resolve();
      return v.animateMove(move, next, latest.current.mask, ms);
    },
    finish() {
      viewRef.current?.finishAnimation();
    },
    resetCamera() {
      viewRef.current?.resetCamera();
    },
    setHighlight(fn) {
      viewRef.current?.setHighlight(fn);
    },
  }), []);

  return (
    <div
      ref={host}
      className={`cube3d ${className ?? ""}`}
      style={style}
      role="img"
      aria-label={ariaLabel ?? "Cube 3D interactif : faites-le glisser pour le tourner"}
    />
  );
});
