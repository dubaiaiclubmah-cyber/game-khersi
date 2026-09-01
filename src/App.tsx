import { useState } from "react";
import { useSnakeGame } from "./game/useSnakeGame";
import { LangProvider, useLang, DIFF_LABEL } from "./game/i18n";
import type { Lang } from "./game/i18n";
import { GameBoard } from "./components/GameBoard";
import { TouchPad } from "./components/TouchPad";
import { HelpPage } from "./components/HelpPage";
import { AboutPage } from "./components/AboutPage";
import {
  DifficultyPanel,
  HelpPanel,
  StatsPanel,
  FamePanel,
  MobileStats,
  MobileDifficulty,
  MobileInfo,
} from "./components/Panels";

/* ---------- ambient background ---------- */

const FLIES = [
  { top: "16%", left: "10%", c: "#b8f04d", d: "7s", delay: "0s", s: 5 },
  { top: "26%", left: "86%", c: "#4de3c2", d: "9s", delay: "1.2s", s: 4 },
  { top: "64%", left: "6%", c: "#ffc94d", d: "8s", delay: "0.6s", s: 4 },
  { top: "78%", left: "90%", c: "#b8f04d", d: "10s", delay: "2s", s: 6 },
  { top: "42%", left: "94%", c: "#ff6b5e", d: "7.5s", delay: "0.3s", s: 3 },
  { top: "8%", left: "58%", c: "#4de3c2", d: "11s", delay: "1.8s", s: 3 },
  { top: "88%", left: "38%", c: "#ffc94d", d: "9.5s", delay: "0.9s", s: 5 },
];

function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 50% -8%, #0d2b1e 0%, rgba(13,43,30,0) 62%), #06110c",
        }}
      />
      <div
        className="absolute -left-44 -top-44 h-[56vmax] w-[56vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(77,227,194,0.13) 0%, rgba(77,227,194,0) 62%)",
          animation: "drift-a 17s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-52 top-1/3 h-[50vmax] w-[50vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,201,77,0.10) 0%, rgba(255,201,77,0) 60%)",
          animation: "drift-b 21s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-56 left-1/4 h-[46vmax] w-[46vmax] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(184,240,77,0.10) 0%, rgba(184,240,77,0) 60%)",
          animation: "drift-a 24s ease-in-out infinite reverse",
        }}
      />
      {/* faint pixel lattice */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(159,232,192,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(159,232,192,0.045) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse at 50% 38%, black 28%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 38%, black 28%, transparent 74%)",
        }}
      />
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
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
      width="40"
      height="40"
      viewBox="0 0 24 24"
      aria-hidden
      className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
      style={{ animation: "floaty 5s ease-in-out infinite" }}
    >
      <rect x="1" y="16" width="5" height="5" fill="#229e74" />
      <rect x="6" y="16" width="5" height="5" fill="#2fb97f" />
      <rect x="6" y="11" width="5" height="5" fill="#43cd7c" />
      <rect x="6" y="6" width="5" height="5" fill="#7fe966" />
      <rect x="11" y="6" width="5" height="5" fill="#9cf05b" />
      <rect x="16" y="6" width="6" height="5" fill="#b8f04d" />
      <rect x="19.4" y="7.4" width="1.6" height="1.6" fill="#06110c" />
      <rect x="15" y="0" width="5" height="5" fill="#ff6b5e" />
      <rect x="17" y="-1.4" width="2.6" height="2" fill="#7be06a" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 18 L4 7 L9.5 11.5 L12 4 L14.5 11.5 L20 7 L22 18 Z" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
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
          "clip-pixel-sm min-w-8 px-1.5 py-1.5 font-display text-[7px] transition-all duration-150 cursor-pointer sm:min-w-9 sm:px-2 sm:text-[8px] " +
          (active
            ? "bg-lime text-[#0a1712] shadow-[0_0_16px_rgba(184,240,77,0.35)]"
            : "text-fern hover:text-mint")
        }
      >
        {label}
      </button>
    );
  };
  return (
    <div
      className="clip-pixel-sm flex items-center gap-0.5 border border-hedge bg-[#0e2118] p-1"
      role="group"
      aria-label={t.langLabel}
    >
      {seg("en", "EN")}
      {seg("fa", "فا")}
    </div>
  );
}

/* ---------- ticker ---------- */

function Ticker() {
  const { t } = useLang();
  const items = [...t.ticker, ...t.ticker];
  return (
    <div className="marquee mt-8 overflow-hidden border-y border-hedge py-2.5">
      {/* dir stays ltr so the marquee math is identical in both languages */}
      <div className="marquee-track flex w-max items-center" dir="ltr">
        {items.map((tip, i) => (
          <span key={i} className="flex items-center">
            <span className="px-5 font-display text-[8px] text-fern">{tip}</span>
            <span className="text-[9px] text-lime/70">◆</span>
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
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
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
              <h1 className="truncate font-title text-lg leading-none text-lime [text-shadow:0_0_18px_rgba(184,240,77,0.45)] sm:text-2xl md:text-3xl">
                {t.brand}
              </h1>
              <p className="mt-2 font-display text-[6px] tracking-[0.34em] text-mint md:text-[7px]">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="clip-pixel-sm hidden items-center gap-2 border border-hedge bg-[#0e2118cc] px-3 py-2 lg:flex">
              <CrownIcon />
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {t[DIFF_LABEL[game.difficulty]]} · {t.best}
                </span>
                <span key={game.best} className="score-pop font-display text-[11px] text-amber">
                  {fmt(game.best)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openHelp}
              aria-label={t.helpBtn}
              title={t.helpBtn}
              className="clip-pixel-sm flex h-9 items-center gap-2 border border-hedge bg-[#0e2118] px-2 text-teal transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer sm:h-10 sm:px-3"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" stroke="currentColor" strokeWidth="2" />
                <path d="M16 8h4v12h-9" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9h5M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
              <span className="hidden font-display text-[8px] tracking-[0.12em] md:inline">{t.helpBtn}</span>
            </button>
            <button
              type="button"
              onClick={openAbout}
              aria-label={t.aboutBtn}
              title={t.aboutBtn}
              className="clip-pixel-sm flex h-9 items-center gap-2 border border-hedge bg-[#0e2118] px-2 text-amber transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer sm:h-10 sm:px-3"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="9" y="4" width="6" height="6" />
                <rect x="5" y="13" width="14" height="7" />
              </svg>
              <span className="hidden font-display text-[8px] tracking-[0.12em] md:inline">{t.aboutBtn}</span>
            </button>
            <LangSwitch />
            <button
              type="button"
              onClick={game.toggleMute}
              aria-label={game.muted ? t.unmute : t.mute}
              className={
                "clip-pixel-sm flex h-9 w-9 items-center justify-center border transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer sm:h-10 sm:w-10 " +
                (game.muted
                  ? "border-hedge bg-[#0e2118] text-fern hover:text-mint"
                  : "border-hedge bg-[#0e2118] text-lime hover:brightness-125")
              }
              style={game.muted ? undefined : { boxShadow: "0 0 18px rgba(184,240,77,0.18)" }}
            >
              <SpeakerIcon muted={game.muted} />
            </button>
          </div>
        </header>

        {/* main grid */}
        <main className="mt-6 grid flex-1 items-start gap-5 md:grid-cols-[230px_minmax(0,1fr)_230px] lg:grid-cols-[252px_minmax(0,1fr)_252px]">
          {/* left rail */}
          <aside className="order-2 hidden flex-col gap-5 md:order-1 md:flex">
            <DifficultyPanel game={game} />
            <HelpPanel />
          </aside>

          {/* board column */}
          <section className="order-1 flex flex-col items-center gap-4 md:order-2">
            <div className="w-full max-w-[540px] lg:max-w-[572px]">
              <GameBoard game={game} />
            </div>

            {/* desktop quick keys */}
            <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 font-display text-[7px] tracking-[0.18em] text-fern md:flex">
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
            </div>

            {/* mobile-only furniture */}
            <div className="flex w-full max-w-[540px] flex-col items-center gap-3 md:hidden">
              <MobileStats game={game} />
              <MobileDifficulty game={game} />
              {coarse && <TouchPad game={game} />}
              <p className="text-center font-display text-[7px] tracking-[0.24em] text-fern">
                {t.swipeHint}
              </p>
              <MobileInfo game={game} />
            </div>
          </section>

          {/* right rail */}
          <aside className="order-3 hidden flex-col gap-5 md:flex">
            <StatsPanel game={game} />
            <FamePanel game={game} />
          </aside>
        </main>

        <Ticker />

        <footer className="flex flex-wrap items-center justify-between gap-2 py-4 font-display text-[6px] tracking-[0.26em] text-fern/80 md:text-[7px]">
          <span>{t.footerLeft}</span>
          <span className="flex items-center gap-2">
            <span className="text-mint/70">{t.footerRight}</span>
            <span aria-hidden className="text-hedge">·</span>
            <button
              type="button"
              onClick={openAbout}
              className="text-amber underline decoration-dotted underline-offset-4 transition-colors hover:text-lime cursor-pointer"
            >
              {t.footerAbout}
            </button>
          </span>
        </footer>
      </div>

      {showHelp && <HelpPage game={game} onClose={() => setShowHelp(false)} />}
      {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Cabinet />
    </LangProvider>
  );
}
