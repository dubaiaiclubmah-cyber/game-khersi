import { useMemo } from "react";
import type { GameAPI, Status } from "../game/useSnakeGame";
import { DIFFICULTIES } from "../game/engine";
import { useLang, DIFF_LABEL } from "../game/i18n";
import type { Dict } from "../game/i18n";

const PIXEL_BTN =
  "font-display text-[10px] md:text-[11px] tracking-wider text-[#0a1712] bg-lime px-6 py-3.5 clip-pixel-sm " +
  "shadow-[0_0_28px_rgba(184,240,77,0.35)] transition-all duration-150 hover:brightness-110 hover:-translate-y-0.5 " +
  "active:translate-y-0.5 active:brightness-95 select-none cursor-pointer";

const PIXEL_BTN_TEAL =
  "font-display text-[10px] md:text-[11px] tracking-wider text-[#04211a] bg-teal px-6 py-3.5 clip-pixel-sm " +
  "shadow-[0_0_28px_rgba(77,227,194,0.35)] transition-all duration-150 hover:brightness-110 hover:-translate-y-0.5 " +
  "active:translate-y-0.5 active:brightness-95 select-none cursor-pointer";

const STATUS_COLOR: Record<Status, { color: string; pulse: boolean }> = {
  menu: { color: "#ffc94d", pulse: false },
  playing: { color: "#b8f04d", pulse: true },
  paused: { color: "#4de3c2", pulse: false },
  over: { color: "#ff6b5e", pulse: false },
};

function statusWord(t: Dict, s: Status): string {
  if (s === "menu") return t.st_menu;
  if (s === "playing") return t.st_playing;
  if (s === "paused") return t.st_paused;
  return t.st_over;
}

function MiniSerpent() {
  return (
    <svg width="84" height="16" viewBox="0 0 84 16" aria-hidden className="opacity-90">
      <rect x="0" y="8" width="8" height="8" fill="#229e74" />
      <rect x="8" y="8" width="8" height="8" fill="#2fb97f" />
      <rect x="16" y="8" width="8" height="8" fill="#43cd7c" />
      <rect x="24" y="8" width="8" height="8" fill="#5fdd72" />
      <rect x="32" y="8" width="8" height="8" fill="#7fe966" />
      <rect x="40" y="8" width="8" height="8" fill="#9cf05b" />
      <rect x="48" y="8" width="10" height="8" fill="#b8f04d" />
      <rect x="54" y="10" width="2.4" height="2.4" fill="#0a1712" />
      <rect x="66" y="6" width="9" height="9" fill="#ff6b5e" />
      <rect x="69" y="3" width="4" height="3" fill="#7be06a" />
    </svg>
  );
}

export function GameBoard({ game }: { game: GameAPI }) {
  const {
    canvasRef,
    wrapRef,
    status,
    score,
    best,
    isNewBest,
    win,
    difficulty,
    eaten,
    stars,
    start,
    togglePause,
  } = game;

  const { t, fmt, fa } = useLang();
  const diff = DIFFICULTIES[difficulty];
  const meta = STATUS_COLOR[status];
  const coarse = useMemo(
    () =>
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const length = 3 + eaten;
  const applesTxt = fa
    ? `${fmt(eaten)} ${t.applesMany}`
    : `${fmt(eaten)} ${eaten === 1 ? t.appleOne : t.applesMany}`;
  const pausedCopy = t.pausedCopy
    .replace("{score}", fmt(score))
    .replace("{len}", fmt(length));

  return (
    <div className="relative">
      {/* corner brackets */}
      <span aria-hidden className="absolute -left-1.5 -top-1.5 z-20 h-4 w-4 border-l-2 border-t-2 border-lime/80" />
      <span aria-hidden className="absolute -right-1.5 -top-1.5 z-20 h-4 w-4 border-r-2 border-t-2 border-lime/80" />
      <span aria-hidden className="absolute -bottom-1.5 -left-1.5 z-20 h-4 w-4 border-b-2 border-l-2 border-lime/80" />
      <span aria-hidden className="absolute -bottom-1.5 -right-1.5 z-20 h-4 w-4 border-b-2 border-r-2 border-lime/80" />

      <div className="clip-pixel border-2 border-[#244734] bg-[#08130e] shadow-[0_0_90px_rgba(77,227,194,0.13),0_24px_60px_rgba(0,0,0,0.5)]">
        {/* status bar */}
        <div className="flex h-9 items-center justify-between border-b-2 border-[#244734] bg-[#0a1712] px-3">
          <div className="flex items-center gap-2.5">
            <span
              className={"h-2 w-2 rounded-full " + (meta.pulse ? "pulse-dot" : "")}
              style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }}
            />
            <span className="font-display text-[8px] tracking-[0.22em] text-mint">
              {statusWord(t, status)}
            </span>
          </div>
          <div className="flex items-center gap-3 font-display text-[8px] tracking-[0.14em]">
            <span className="text-amber">★ {fmt(stars)}</span>
            <span style={{ color: diff.color }}>×{fmt(diff.mult)}</span>
            <span className="text-fern">
              {t.lenShort} {fmt(String(length).padStart(2, "0"))}
            </span>
          </div>
        </div>

        {/* play area */}
        <div
          ref={wrapRef}
          className="relative aspect-square w-full overflow-hidden"
          style={{ touchAction: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* floating HUD chips (logical positions → mirror cleanly in RTL) */}
          <div className="pointer-events-none absolute start-2.5 top-2.5 flex items-baseline gap-2 border border-hedge/80 bg-[#08130ecc] px-2.5 py-1.5 clip-pixel-sm">
            <span className="font-display text-[7px] tracking-[0.18em] text-mint">{t.score}</span>
            <span key={score} className="score-pop font-display text-[11px] text-amber">
              {fmt(score)}
            </span>
          </div>
          <div className="pointer-events-none absolute end-2.5 top-2.5 flex items-baseline gap-2 border border-hedge/80 bg-[#08130ecc] px-2.5 py-1.5 clip-pixel-sm">
            <span className="font-display text-[7px] tracking-[0.18em] text-mint">{t.best}</span>
            <span className={"font-display text-[11px] " + (isNewBest ? "text-lime" : "text-teal")}>
              {fmt(best)}
            </span>
          </div>

          {/* ---------- overlays ---------- */}
          {status === "menu" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(4,11,8,0.85)] p-5 text-center">
              <div className="rise-in flex flex-col items-center gap-4">
                <MiniSerpent />
                <h2 className="font-title text-xl leading-relaxed text-lime md:text-2xl">
                  {t.menuTitle}
                </h2>
                <p className="max-w-[36ch] text-xs leading-relaxed text-mint md:text-sm">
                  {t.menuCopy}
                </p>
                <button type="button" onClick={() => start()} className={PIXEL_BTN}>
                  ▶ {t.menuBtn}
                </button>
                <p className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {coarse ? t.menuHintTouch : t.menuHintKey}
                  <span className="blink-cursor ms-1 inline-block h-2.5 w-1.5 translate-y-px bg-lime" />
                </p>
              </div>
            </div>
          )}

          {status === "paused" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(4,11,8,0.82)] p-5 text-center">
              <div className="rise-in flex flex-col items-center gap-4">
                <h2 className="font-title text-xl text-teal md:text-2xl">{t.pausedTitle}</h2>
                <p className="text-xs text-mint md:text-sm">{pausedCopy}</p>
                <button type="button" onClick={togglePause} className={PIXEL_BTN_TEAL}>
                  ▶ {t.resumeBtn}
                </button>
                <p className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {coarse ? t.pauseHintTouch : t.pauseHintKey}
                </p>
              </div>
            </div>
          )}

          {status === "over" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(4,11,8,0.87)] p-5 text-center">
              <div className="rise-in-delayed flex flex-col items-center gap-3.5">
                <h2
                  className={
                    "font-title text-2xl md:text-3xl " + (win ? "text-lime" : "text-coral")
                  }
                >
                  {win ? t.overWin : t.overLose}
                </h2>

                {isNewBest && (
                  <span className="wiggle clip-pixel-sm bg-lime px-3 py-1.5 font-display text-[8px] tracking-[0.18em] text-[#0a1712] shadow-[0_0_26px_rgba(184,240,77,0.5)]">
                    ★ {t.newRecord} ★
                  </span>
                )}

                <div className="flex flex-col items-center gap-1">
                  <span className="font-display text-[7px] tracking-[0.24em] text-mint">
                    {t.finalScore}
                  </span>
                  <span className="score-pop font-display text-2xl text-amber md:text-3xl">
                    {fmt(score)}
                  </span>
                  {!isNewBest && (
                    <span className="font-display text-[8px] tracking-[0.14em] text-teal">
                      {t.best} {fmt(best)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-mint">
                  {applesTxt} · {t.lengthWord} {fmt(length)} · {t[DIFF_LABEL[difficulty]]} ×
                  {fmt(diff.mult)}
                  {stars > 0 && <span className="text-amber"> · ★ {fmt(stars)}</span>}
                </p>

                <button type="button" onClick={() => start()} className={PIXEL_BTN}>
                  ↻ {t.playAgain}
                </button>
                <p className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {coarse ? t.overHintTouch : t.overHintKey}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
