import { useMemo } from "react";
import type { GameAPI } from "../game/useSnakeGame";
import { DIFFICULTIES } from "../game/engine";

const PIXEL_BTN =
  "font-display text-[10px] md:text-[11px] tracking-wider text-[#0a1712] bg-lime px-6 py-3.5 clip-pixel-sm " +
  "shadow-[0_0_28px_rgba(184,240,77,0.35)] transition-all duration-150 hover:brightness-110 hover:-translate-y-0.5 " +
  "active:translate-y-0.5 active:brightness-95 select-none cursor-pointer";

const PIXEL_BTN_TEAL =
  "font-display text-[10px] md:text-[11px] tracking-wider text-[#04211a] bg-teal px-6 py-3.5 clip-pixel-sm " +
  "shadow-[0_0_28px_rgba(77,227,194,0.35)] transition-all duration-150 hover:brightness-110 hover:-translate-y-0.5 " +
  "active:translate-y-0.5 active:brightness-95 select-none cursor-pointer";

const STATUS_META = {
  menu: { word: "READY", color: "#ffc94d", pulse: false },
  playing: { word: "LIVE", color: "#b8f04d", pulse: true },
  paused: { word: "HOLD", color: "#4de3c2", pulse: false },
  over: { word: "DOWN", color: "#ff6b5e", pulse: false },
} as const;

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
    start,
    togglePause,
  } = game;

  const diff = DIFFICULTIES[difficulty];
  const meta = STATUS_META[status];
  const coarse = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
    []
  );

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
              {meta.word}
            </span>
          </div>
          <div className="flex items-center gap-3 font-display text-[8px] tracking-[0.14em]">
            <span style={{ color: diff.color }}>×{diff.mult}</span>
            <span className="text-fern">LEN {String(3 + eaten).padStart(2, "0")}</span>
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

          {/* floating HUD chips */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-baseline gap-2 border border-hedge/80 bg-[#08130ecc] px-2.5 py-1.5 clip-pixel-sm">
            <span className="font-display text-[7px] tracking-[0.18em] text-mint">SCORE</span>
            <span key={score} className="score-pop font-display text-[11px] text-amber">
              {score}
            </span>
          </div>
          <div className="pointer-events-none absolute right-2.5 top-2.5 flex items-baseline gap-2 border border-hedge/80 bg-[#08130ecc] px-2.5 py-1.5 clip-pixel-sm">
            <span className="font-display text-[7px] tracking-[0.18em] text-mint">BEST</span>
            <span className={"font-display text-[11px] " + (isNewBest ? "text-lime" : "text-teal")}>
              {best}
            </span>
          </div>

          {/* ---------- overlays ---------- */}
          {status === "menu" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(4,11,8,0.85)] p-5 text-center">
              <div className="rise-in flex flex-col items-center gap-4">
                <MiniSerpent />
                <h2 className="font-display text-base leading-relaxed text-lime md:text-xl">
                  READY, PLAYER?
                </h2>
                <p className="max-w-[34ch] text-xs leading-relaxed text-mint md:text-sm">
                  Eat apples. Grow long. The walls — and your own tail — are
                  fatal. Speed climbs with every bite.
                </p>
                <button type="button" onClick={() => start()} className={PIXEL_BTN}>
                  ▶ INSERT COIN
                </button>
                <p className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {coarse ? "TAP OR SWIPE TO LAUNCH" : "SPACE · ENTER · ANY ARROW"}
                  <span className="blink-cursor ml-1 inline-block h-2.5 w-1.5 translate-y-px bg-lime" />
                </p>
              </div>
            </div>
          )}

          {status === "paused" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(4,11,8,0.82)] p-5 text-center">
              <div className="rise-in flex flex-col items-center gap-4">
                <h2 className="font-display text-base text-teal md:text-xl">PAUSED</h2>
                <p className="text-xs text-mint md:text-sm">
                  The serpent waits… score {score} · length {3 + eaten}
                </p>
                <button type="button" onClick={togglePause} className={PIXEL_BTN_TEAL}>
                  ▶ RESUME
                </button>
                <p className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {coarse ? "TAP THE BOARD TO CONTINUE" : "SPACE TO RESUME"}
                </p>
              </div>
            </div>
          )}

          {status === "over" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[rgba(4,11,8,0.87)] p-5 text-center">
              <div className="rise-in-delayed flex flex-col items-center gap-3.5">
                <h2
                  className={
                    "font-display text-lg md:text-2xl " +
                    (win ? "text-lime" : "text-coral")
                  }
                >
                  {win ? "BOARD CLEARED!" : "GAME OVER"}
                </h2>

                {isNewBest && (
                  <span className="wiggle clip-pixel-sm bg-lime px-3 py-1.5 font-display text-[8px] tracking-[0.18em] text-[#0a1712] shadow-[0_0_26px_rgba(184,240,77,0.5)]">
                    ★ NEW RECORD ★
                  </span>
                )}

                <div className="flex flex-col items-center gap-1">
                  <span className="font-display text-[7px] tracking-[0.24em] text-mint">
                    FINAL SCORE
                  </span>
                  <span className="score-pop font-display text-2xl text-amber md:text-3xl">
                    {score}
                  </span>
                  {!isNewBest && (
                    <span className="font-display text-[8px] tracking-[0.14em] text-teal">
                      BEST {best}
                    </span>
                  )}
                </div>

                <p className="text-xs text-mint">
                  {eaten} apple{eaten === 1 ? "" : "s"} · length {3 + eaten} ·{" "}
                  {diff.label} ×{diff.mult}
                </p>

                <button type="button" onClick={() => start()} className={PIXEL_BTN}>
                  ↻ PLAY AGAIN
                </button>
                <p className="font-display text-[7px] tracking-[0.2em] text-fern">
                  {coarse ? "TAP TO RUN IT BACK" : "PRESS ENTER"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
