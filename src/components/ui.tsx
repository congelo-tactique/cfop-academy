import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Info, Lightbulb, X } from "lucide-react";
import type { CaseStatus } from "../store/useStore";

export function Modal({ title, subtitle, onClose, children, width }: {
  title: ReactNode; subtitle?: ReactNode; onClose: () => void; children: ReactNode; width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" style={width ? { width: `min(${width}px, 100%)` } : undefined}>
        <div className="modal-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{title}</h2>
            {subtitle && <div className="muted small">{subtitle}</div>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Callout({ kind = "info", title, children }: { kind?: "info" | "tip" | "warn"; title?: string; children: ReactNode }) {
  const Icon = kind === "tip" ? Lightbulb : kind === "warn" ? AlertTriangle : Info;
  return (
    <div className={`callout ${kind}`}>
      <Icon size={18} className="callout-icon" />
      <div>
        {title && <strong style={{ display: "block", marginBottom: 4 }}>{title}</strong>}
        {children}
      </div>
    </div>
  );
}

export function Progress({ value, success }: { value: number; success?: boolean }) {
  return (
    <div className={`progress ${success ? "success" : ""}`} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, ariaLabel }: {
  value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; ariaLabel?: string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
          className={o.value === value ? "active" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export const STATUS_LABEL: Record<CaseStatus, string> = {
  new: "À apprendre",
  learning: "En cours",
  learned: "Maîtrisé",
};

export function StatusPill({ status }: { status: CaseStatus }) {
  return <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>;
}

let toastSetter: ((s: string | null) => void) | null = null;

export function toast(msg: string) {
  toastSetter?.(msg);
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    toastSetter = setMsg;
    return () => { toastSetter = null; };
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}
