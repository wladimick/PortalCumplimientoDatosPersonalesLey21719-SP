"use client";

import { useEffect, useState } from "react";
import { AArrowDown, AArrowUp, RotateCcw, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const scales = [0.9, 1, 1.1, 1.2];

function applyScale(scale: number) {
  document.documentElement.style.setProperty("--ui-scale", String(scale));
  localStorage.setItem("tbx-ui-scale", String(scale));
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("tbx-theme", theme);
}

export function AccessibilityControls({ compact = false }: { compact?: boolean }) {
  const [scale, setScale] = useState(1);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedScale = Number(localStorage.getItem("tbx-ui-scale"));
    const initialScale = scales.includes(savedScale) ? savedScale : 1;
    const savedTheme = localStorage.getItem("tbx-theme") as Theme | null;
    const preferredTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme;
    setScale(initialScale);
    setTheme(initialTheme);
    applyScale(initialScale);
    applyTheme(initialTheme);
  }, []);

  const setNewScale = (next: number) => {
    const value = scales[Math.max(0, Math.min(scales.length - 1, next))];
    setScale(value);
    applyScale(value);
  };

  const scaleIndex = Math.max(0, scales.indexOf(scale));

  return (
    <div className={`accessibility-controls${compact ? " compact" : ""}`} aria-label="Preferencias de visualización">
      <button className="icon-btn" type="button" onClick={() => setNewScale(scaleIndex - 1)} aria-label="Disminuir tamaño de texto" title="Disminuir texto" disabled={scaleIndex === 0}>
        <AArrowDown size={18} />
      </button>
      <button className="icon-btn text-reset" type="button" onClick={() => { setScale(1); applyScale(1); }} aria-label="Restablecer tamaño de texto" title="Restablecer texto">
        <RotateCcw size={16} />
      </button>
      <button className="icon-btn" type="button" onClick={() => setNewScale(scaleIndex + 1)} aria-label="Aumentar tamaño de texto" title="Aumentar texto" disabled={scaleIndex === scales.length - 1}>
        <AArrowUp size={18} />
      </button>
      <span className="utility-divider" aria-hidden="true" />
      <button className="icon-btn" type="button" onClick={() => { const next = theme === "light" ? "dark" : "light"; setTheme(next); applyTheme(next); }} aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"} title={theme === "light" ? "Modo oscuro" : "Modo claro"}>
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
}
