import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Mode = "dark" | "light";
export type Palette = "forest" | "ocean" | "ember" | "night";

export interface CanvasTokens {
  page: string;
  boardA: string;
  boardB: string;
  vig: string;
  headRGB: [number, number, number];
  tailRGB: [number, number, number];
  headGlow: string;
}

export const PALETTES: Palette[] = ["forest", "ocean", "ember", "night"];

const CANVAS: Record<Mode, Record<Palette, CanvasTokens>> = {
  dark: {
    forest: {
      page: "#06110c",
      boardA: "#0a1712",
      boardB: "#0c1b15",
      vig: "rgba(0,0,0,0.44)",
      headRGB: [184, 240, 77],
      tailRGB: [34, 158, 116],
      headGlow: "rgba(184,240,77,0.75)",
    },
    ocean: {
      page: "#050f1c",
      boardA: "#0a1a2e",
      boardB: "#0c1e34",
      vig: "rgba(0,0,0,0.44)",
      headRGB: [94, 234, 212],
      tailRGB: [14, 116, 144],
      headGlow: "rgba(94,234,212,0.7)",
    },
    ember: {
      page: "#140b08",
      boardA: "#20130e",
      boardB: "#251712",
      vig: "rgba(0,0,0,0.46)",
      headRGB: [255, 159, 67],
      tailRGB: [184, 72, 44],
      headGlow: "rgba(255,159,67,0.7)",
    },
    night: {
      page: "#0b0d12",
      boardA: "#12161e",
      boardB: "#151a24",
      vig: "rgba(0,0,0,0.44)",
      headRGB: [163, 230, 53],
      tailRGB: [38, 110, 130],
      headGlow: "rgba(163,230,53,0.7)",
    },
  },
  light: {
    forest: {
      page: "#eaf2e6",
      boardA: "#f2f8ee",
      boardB: "#e8f1e2",
      vig: "rgba(23,47,32,0.16)",
      headRGB: [95, 174, 30],
      tailRGB: [16, 110, 84],
      headGlow: "rgba(95,174,30,0.5)",
    },
    ocean: {
      page: "#e6f0f9",
      boardA: "#f0f6fb",
      boardB: "#e5eef7",
      vig: "rgba(18,42,62,0.15)",
      headRGB: [11, 127, 109],
      tailRGB: [7, 89, 133],
      headGlow: "rgba(11,127,109,0.45)",
    },
    ember: {
      page: "#f9ece2",
      boardA: "#faf0e7",
      boardB: "#f3e3d5",
      vig: "rgba(51,28,16,0.15)",
      headRGB: [194, 94, 0],
      tailRGB: [150, 50, 30],
      headGlow: "rgba(194,94,0,0.45)",
    },
    night: {
      page: "#eceef2",
      boardA: "#f2f4f8",
      boardB: "#e8ecf2",
      vig: "rgba(26,32,44,0.15)",
      headRGB: [77, 124, 15],
      tailRGB: [14, 116, 144],
      headGlow: "rgba(77,124,15,0.45)",
    },
  },
};

/* the render loop reads this every frame — no re-render needed */
export const activeCanvas = { current: CANVAS.dark.forest };

export const SWATCH: Record<Palette, [string, string]> = {
  forest: ["#b8f04d", "#0d2b1e"],
  ocean: ["#5eead4", "#0a2440"],
  ember: ["#ff9f43", "#33150a"],
  night: ["#a3e635", "#141a26"],
};

const KEY = "serpent.theme";

function readSaved(): { mode: Mode; palette: Palette } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as { mode?: string; palette?: string };
      const mode: Mode = v.mode === "light" ? "light" : "dark";
      const palette: Palette = (PALETTES as string[]).includes(v.palette ?? "")
        ? (v.palette as Palette)
        : "forest";
      return { mode, palette };
    }
  } catch {
    /* private mode etc. */
  }
  return { mode: "dark", palette: "forest" };
}

interface ThemeCtx {
  mode: Mode;
  palette: Palette;
  setMode: (m: Mode) => void;
  setPalette: (p: Palette) => void;
}

const Ctx = createContext<ThemeCtx>({
  mode: "dark",
  palette: "forest",
  setMode: () => {},
  setPalette: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readSaved);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = state.mode;
    root.dataset.palette = state.palette;
    activeCanvas.current = CANVAS[state.mode][state.palette];
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    try {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", activeCanvas.current.page);
    } catch {
      /* ignore */
    }
  }, [state]);

  const value: ThemeCtx = {
    mode: state.mode,
    palette: state.palette,
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    setPalette: (palette) => setState((s) => ({ ...s, palette })),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
