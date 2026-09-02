import { useEffect, useRef, useState } from "react";
import { useSnakeGame } from "./game/useSnakeGame";
import { LangProvider, useLang, DIFF_LABEL } from "./game/i18n";
import type { Lang } from "./game/i18n";
import { ThemeProvider, useTheme, PALETTES, SWATCH } from "./game/theme";
import type { Mode, Palette } from "./game/theme";
import { GameBoard } from "./components/GameBoard";
import { TouchPad } from "./components/TouchPad";
import { HelpPage } from "./components/HelpPage";
import { AboutPage } from "./components/AboutPage";
import {
  DifficultyPanel,
  WorldPanel,
  HelpPanel,
  StatsPanel,
  FamePanel,
  MedalsPanel,
  MobileStats,
  MobileDifficulty,
  MobileWorlds,
  MobileInfo,
} from "./components/Panels";

/* ---------- ambient background (theme-driven) ---------- */

const FLIES = [
  { top: "16%", left: "10%", c: "var(--acc1)", d: "7s", delay: "0s", s: 5 },
  { top: "26%", left: "86%", c: "var(--acc2)", d: "9s", delay: "1.2s", s: 4 },
  { top: "64%", left: "6%", c: "var(--acc3)", d: "8s", delay: "0.6s", s: 4 },
  { top: "78%", left: "90%", c: "var(--acc1)", d: "10s", delay: "2s", s: 6 },
  { top: "42%", left: "94%", c: "var(--acc4)", d: "7.5s", delay: "0.3s", s: 3 },
  { top: "8%", left: "58%", c: "var(--acc2)", d: "11s", delay: "1.8s", s: 3 },
  { top: "88%", left: "38%", c: "var(--acc3)", d: "9.5s", delay: "0.9s", s: 5 },
];

function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 50% -8%, var(--bg-grad) 0%, rgba(0,0,0,0) 62%), var(--bg)",
        }}
      />
      <div
        className="absolute -left-44 -top-44 h-[56vmax] w-[56vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--glow2) 0%, rgba(0,0,0,0) 62%)",
          animation: "drift-a 17s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-52 top-1/3 h-[50vmax] w-[50vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--glow3) 0%, rgba(0,0,0,0) 60%)",
          animation: "drift-b 21s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-56 left-1/4 h-[46vmax] w-[46vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--glow1) 0%, rgba(0,0,0,0) 60%)",
          animation: "drift-a 24s ease-in-out infinite reverse",
        }}
      />
      {/* faint pixel lattice */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--lattice) 1px, transparent 1px), linear-gradient(90deg, var(--lattice) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse at 50% 38%, black 28%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 38%, black 28%, transparent 74%)",
        }}
      />
      {/* CRT scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--scan) 0px, var(--scan) 1px, transparent 1px, transparent 3px)",
          opacity: 0.5,
        }}
      />
      {FLIES.map((f, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: f.top,
            left: f.left,
            width: f.s,
            height: f.s,
            background: f.c,
            boxShadow: `0 0 12px ${f.c}`,
            animation: `floaty ${f.d} ease-in-out ${f.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- icons ---------- */

function LogoSnake() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      aria-hidden
      className="h-9 w-9 shrink-0 sm:h-11 sm:w-11"
      style={{ animation: "floaty 5s ease-in-out infinite" }}
    >
      <rect x="1" y="16" width="5" height="5" fill="#229e74" />
      <rect x="6" y="16" width="5" height="5" fill="#2fb97f" />
      <rect x="6" y="11" width="5" height="5" fill="#43cd7c" />
      <rect x="6" y="6" width="5" height="5" fill="#7fe966" />
      <rect x="11" y="6" width="5" height="5" fill="#9cf05b" />
      <rect x="16" y="6" width="6" height="5" fill="#b8f04d" />
      <rect x="19.4" y="7.4" width="1.6" height="1.6" fill="#0a1712" />
      <rect x="15" y="0" width="5" height="5" fill="#ff6b5e" />
      <rect x="17" y="-1.4" width="2.6" height="2" fill="#7be06a" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 18 L4 7 L9.5 11.5 L12 4 L14.5 11.5 L20 7 L22 18 Z" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      {muted ? (
        <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          <path d="M16.5 8.5c1.8 1.4 1.8 5.6 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M19 6c3 2.6 3 9.4 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a9 9 0 1 0 0 18c1.6 0 2.4-1 2.2-2.2-.2-1.1.4-2.3 1.9-2.3H18a3.5 3.5 0 0 0 3.4-4.2A9 9 0 0 0 12 3z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8" cy="10" r="1.4" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1.4" fill="currentColor" />
      <circle cx="16" cy="10" r="1.4" fill="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

function StarBurstIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2 L14.6 8.6 L21.8 9 L16.2 13.4 L18 20.4 L12 16.4 L6 20.4 L7.8 13.4 L2.2 9 L9.4 8.6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------- language switch ---------- */

function LangSwitch() {
  const { lang, setLang, t } = useLang();
  const seg = (l: Lang, label: string) => {
    const active = lang === l;
    return (
      <button
        type="button"
        onClick={() => setLang(l)}
        aria-pressed={active}
        className={
          "clip-pixel-sm min-w-9 px-2 py-2 font-display text-[10px] transition-all duration-150 cursor-pointer " +
          (active ? "bg-lime text-ink glow-lime" : "text-fern hover:text-mint")
        }
      >
        {label}
      </button>
    );
  };
  return (
    <div
      className="clip-pixel-sm flex items-center gap-0.5 border border-hedge bg-chip p-1"
      role="group"
      aria-label={t.langLabel}
    >
      {seg("en", "EN")}
      {seg("fa", "فا")}
    </div>
  );
}

/* ---------- appearance picker (mode + 4 palettes) ---------- */

const PALETTE_LABEL: Record<Palette, "palForest" | "palOcean" | "palEmber" | "palNight"> = {
  forest: "palForest",
  ocean: "palOcean",
  ember: "palEmber",
  night: "palNight",
};

function ThemePicker() {
  const { t } = useLang();
  const { mode, palette, setMode, setPalette } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const modeSeg = (m: Mode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={
        "clip-pixel-sm flex flex-1 items-center justify-center gap-1.5 px-2 py-2 font-display text-[10px] transition-all duration-150 cursor-pointer " +
        (mode === m ? "bg-teal text-ink" : "text-fern hover:text-mint")
      }
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t.themeBtn}
        title={t.themeBtn}
        className={
          "clip-pixel-sm flex h-10 items-center justify-center border transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer w-10 " +
          (open
            ? "border-linesoft bg-chip text-lime"
            : "border-hedge bg-chip text-teal hover:text-fog")
        }
      >
        <PaletteIcon />
      </button>

      {open && (
        <div className="panel clip-pixel absolute end-0 top-12 z-50 w-60 p-3.5 rise-in">
          <p className="font-display text-[10px] text-mint">{t.themeBtn}</p>

          <div className="mt-2.5 flex gap-1 border border-hedge bg-cell p-1 clip-pixel-sm">
            {modeSeg("dark", t.themeDark, <MoonIcon />)}
            {modeSeg("light", t.themeLight, <SunIcon />)}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {PALETTES.map((p) => {
              const active = palette === p;
              const [acc, deep] = SWATCH[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPalette(p)}
                  aria-pressed={active}
                  title={t[PALETTE_LABEL[p]]}
                  className="flex cursor-pointer flex-col items-center gap-1.5"
                >
                  <span
                    className="clip-pixel-sm block h-10 w-full border transition-all duration-150 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${deep} 0%, ${deep} 55%, ${acc} 55%, ${acc} 100%)`,
                      borderColor: active ? acc : "var(--line)",
                      boxShadow: active ? `0 0 14px ${acc}66` : undefined,
                    }}
                  />
                  <span
                    className={
                      "font-display text-[8px] " + (active ? "text-fog" : "text-fern")
                    }
                  >
                    {t[PALETTE_LABEL[p]]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- ticker ---------- */

function Ticker() {
  const { t } = useLang();
  const items = [...t.ticker, ...t.ticker];
  return (
    <div className="marquee mt-8 overflow-hidden border-y border-hedge py-3">
      {/* dir stays ltr so the marquee math is identical in both languages */}
      <div className="marquee-track flex w-max items-center" dir="ltr">
        {items.map((tip, i) => (
          <span key={i} className="flex items-center">
            <span className="px-5 font-display text-[11px] text-fern">{tip}</span>
            <span className="text-[11px] text-lime/70">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- cabinet ---------- */

function Cabinet() {
  const game = useSnakeGame();
  const { t, fmt } = useLang();
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [coarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  const openHelp = () => {
    if (game.status === "playing") game.togglePause();
    setShowAbout(false);
    setShowHelp(true);
  };

  const openAbout = () => {
    if (game.status === "playing") game.togglePause();
    setShowHelp(false);
    setShowAbout(true);
  };

  return (
    <div className="relative min-h-screen font-body text-fog">
      <Background />

      <div
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-5 md:px-8"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {/* header */}
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <LogoSnake />
            <div className="min-w-0">
              <h1 className="truncate font-title text-2xl leading-none text-lime title-glow sm:text-3xl md:text-4xl">
                {t.brand}
              </h1>
              <p className="mt-2.5 font-display text-[9px] text-mint max-[380px]:hidden sm:text-[10px]">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="clip-pixel-sm hidden items-center gap-2 border border-hedge bg-chip px-3 py-2.5 xl:flex">
              <span className="text-amber">
                <CrownIcon />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[10px] text-fern">
                  {t[DIFF_LABEL[game.difficulty]]} · {t.best}
                </span>
                <span key={game.best} className="score-pop font-display text-sm text-amber">
                  {fmt(game.best)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openHelp}
              aria-label={t.helpBtn}
              title={t.helpBtn}
              className="clip-pixel-sm flex h-10 items-center gap-2 border border-hedge bg-chip px-2.5 text-teal transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer sm:px-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" stroke="currentColor" strokeWidth="2" />
                <path d="M16 8h4v12h-9" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9h5M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
              <span className="hidden font-display text-[10px] md:inline">{t.helpBtn}</span>
            </button>
            <button
              type="button"
              onClick={openAbout}
              aria-label={t.aboutBtn}
              title={t.aboutBtn}
              className="clip-pixel-sm flex h-10 items-center gap-2 border border-hedge bg-chip px-2.5 text-amber transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer sm:px-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="9" y="4" width="6" height="6" />
                <rect x="5" y="13" width="14" height="7" />
              </svg>
              <span className="hidden font-display text-[10px] md:inline">{t.aboutBtn}</span>
            </button>
            <ThemePicker />
            <LangSwitch />
            <button
              type="button"
              onClick={game.toggleMute}
              aria-label={game.muted ? t.unmute : t.mute}
              title={game.muted ? t.unmute : t.mute}
              className={
                "clip-pixel-sm flex h-10 w-10 items-center justify-center border transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer " +
                (game.muted
                  ? "border-hedge bg-chip text-fern hover:text-mint"
                  : "border-hedge bg-chip text-lime hover:brightness-125 glow-lime")
              }
            >
              <SpeakerIcon muted={game.muted} />
            </button>
          </div>
        </header>

        {/* main grid */}
        <main className="mt-6 grid flex-1 items-start gap-5 md:grid-cols-[236px_minmax(0,1fr)_236px] lg:grid-cols-[258px_minmax(0,1fr)_258px]">
          {/* left rail */}
          <aside className="order-2 hidden flex-col gap-5 md:order-1 md:flex">
            <DifficultyPanel game={game} />
            <WorldPanel game={game} />
            <HelpPanel />
          </aside>

          {/* board column */}
          <section className="order-1 flex flex-col items-center gap-4 md:order-2">
            <div className="w-full max-w-[540px] lg:max-w-[572px]">
              <GameBoard game={game} />
            </div>

            {/* desktop quick keys */}
            <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 font-display text-[10px] text-fern md:flex">
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">←↑↓→</kbd> {t.steer}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">SPC</kbd> {t.pauseWord}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">R</kbd> {t.restartWord}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">M</kbd> {t.muteWord}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="kbd">1-4</kbd> {t.quickWorld}
              </span>
            </div>

            {/* mobile-only furniture */}
            <div className="flex w-full max-w-[540px] flex-col items-center gap-3 md:hidden">
              <MobileStats game={game} />
              <MobileDifficulty game={game} />
              <MobileWorlds game={game} />
              {coarse && <TouchPad game={game} />}
              <p className="text-center font-display text-[10px] text-fern">{t.swipeHint}</p>
              <MobileInfo game={game} />
            </div>
          </section>

          {/* right rail */}
          <aside className="order-3 hidden flex-col gap-5 md:flex">
            <StatsPanel game={game} />
            <FamePanel game={game} />
            <MedalsPanel game={game} />
          </aside>
        </main>

        <Ticker />

        <footer className="flex flex-wrap items-center justify-between gap-2 py-4 font-display text-[9px] text-fern/90 sm:text-[10px]">
          <span>{t.footerLeft}</span>
          <span className="flex items-center gap-2">
            <span className="text-mint/80">{t.footerRight}</span>
            <span aria-hidden className="text-hedge">·</span>
            <button
              type="button"
              onClick={openAbout}
              className="cursor-pointer text-amber underline decoration-dotted underline-offset-4 transition-colors hover:text-lime"
            >
              {t.footerAbout}
            </button>
          </span>
        </footer>
      </div>

      {/* medal unlock toasts */}
      <div className="pointer-events-none fixed left-1/2 top-3 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-3">
        {game.toasts.map((toast) => {
          const T = t as unknown as Record<string, string>;
          return (
            <div
              key={toast.key}
              className="toast-in clip-pixel-sm flex items-center gap-2.5 border border-amber/60 bg-chip px-4 py-3 glow-amber"
            >
              <span className="text-amber">
                <StarBurstIcon />
              </span>
              <span className="font-display text-[11px] text-amber">
                {t.unlockToast.replace("{name}", T[toast.nameKey] ?? "")}
              </span>
            </div>
          );
        })}
      </div>

      {showHelp && <HelpPage game={game} onClose={() => setShowHelp(false)} />}
      {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <ThemeProvider>
        <Cabinet />
      </ThemeProvider>
    </LangProvider>
  );
}
