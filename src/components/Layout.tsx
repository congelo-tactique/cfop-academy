import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen, Dumbbell, GraduationCap, Home, LayoutGrid, Menu, Moon, PenLine, Settings, Shuffle, Sun, Timer,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { ToastHost } from "./ui";

export function Logo({ size = 34 }: { size?: number }) {
  // petit cube isométrique aux couleurs CFOP
  const c = [["#ffd43b", "#ffd43b", "#ffd43b"], ["#16b45b", "#ff7b1c"]];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,3 36,12 20,21 4,12" fill={c[0][0]} />
      <polygon points="4,12 20,21 20,38 4,29" fill={c[1][0]} />
      <polygon points="36,12 20,21 20,38 36,29" fill={c[1][1]} />
      <g stroke="#0b0d12" strokeWidth="1.4" fill="none">
        <polygon points="20,3 36,12 20,21 4,12" />
        <polygon points="4,12 20,21 20,38 4,29" />
        <polygon points="36,12 20,21 20,38 36,29" />
        <line x1="9.3" y1="9" x2="25.3" y2="18" /><line x1="14.7" y1="6" x2="30.7" y2="15" />
        <line x1="25.3" y1="6" x2="9.3" y2="15" /><line x1="30.7" y1="9" x2="14.7" y2="18" />
        <line x1="4" y1="17.7" x2="20" y2="26.7" /><line x1="4" y1="23.3" x2="20" y2="32.3" />
        <line x1="9.3" y1="15" x2="9.3" y2="32" /><line x1="14.7" y1="18" x2="14.7" y2="35" />
        <line x1="36" y1="17.7" x2="20" y2="26.7" /><line x1="36" y1="23.3" x2="20" y2="32.3" />
        <line x1="30.7" y1="15" x2="30.7" y2="32" /><line x1="25.3" y1="18" x2="25.3" y2="35" />
      </g>
    </svg>
  );
}

const NAV = [
  { section: "Apprendre" },
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/notation", label: "Notation", icon: PenLine, dot: "var(--c-blue)" },
  { to: "/parcours", label: "Parcours CFOP", icon: GraduationCap, dot: "var(--c-green)" },
  { to: "/algorithmes", label: "Algorithmes", icon: LayoutGrid, dot: "var(--c-yellow)" },
  { section: "Pratiquer" },
  { to: "/entrainement", label: "Entraînement", icon: Dumbbell, end: true },
  { to: "/entrainement/chrono", label: "Chronomètre", icon: Timer },
  { to: "/entrainement/algos", label: "Trainer d'algos", icon: BookOpen },
  { to: "/melangeur", label: "Mélangeur", icon: Shuffle, dot: "var(--c-red)" },
] as const;

export function Layout() {
  const [open, setOpen] = useState(false);
  const theme = useStore((s) => s.theme);
  const setSetting = useStore((s) => s.setSetting);
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  const toggleTheme = () => setSetting("theme", theme === "dark" ? "light" : "dark");

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink to="/" className="brand">
          <Logo />
          <div>
            <div className="brand-name">CFOP <span>Academy</span></div>
            <div className="brand-sub">Apprendre le speedcubing</div>
          </div>
        </NavLink>
        {NAV.map((n, i) =>
          "section" in n ? (
            <div key={i} className="nav-section">{n.section}</div>
          ) : (
            <NavLink key={n.to} to={n.to} end={"end" in n ? n.end : false} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <n.icon size={18} />
              {n.label}
              {"dot" in n && <span className="nav-dot" style={{ background: n.dot }} />}
            </NavLink>
          ),
        )}
        <div className="sidebar-foot">
          <NavLink to="/reglages" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} style={{ flex: 1 }}>
            <Settings size={18} /> Réglages
          </NavLink>
          <button type="button" className="icon-btn" onClick={toggleTheme} title={theme === "dark" ? "Thème clair" : "Thème sombre"} aria-label="Changer de thème">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </aside>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <div style={{ minWidth: 0 }}>
        <header className="topbar">
          <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <Menu size={18} />
          </button>
          <NavLink to="/" className="brand" style={{ padding: 0 }}>
            <Logo size={28} />
            <div className="brand-name">CFOP <span>Academy</span></div>
          </NavLink>
          <div className="spacer" />
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Changer de thème">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  );
}
