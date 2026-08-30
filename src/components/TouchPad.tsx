import type { PointerEvent } from "react";
import type { GameAPI } from "../game/useSnakeGame";
import type { Dir } from "../game/engine";

const BTN =
  "clip-pixel-sm flex h-14 w-full items-center justify-center border border-[#2c523d] bg-[#0e2118] " +
  "text-[#9fe8c0] transition-all duration-100 hover:bg-[#123024] active:scale-90 active:bg-[#16352a] " +
  "active:text-[#d7f0e0] touch-manipulation select-none cursor-pointer";

function Chevron({ rotate }: { rotate: number }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M5 15 L12 8 L19 15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function TouchPad({ game }: { game: GameAPI }) {
  const press = (dir: Dir) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    game.setDirection(dir);
  };
  const center = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (game.status === "menu" || game.status === "over") game.start();
    else game.togglePause();
  };

  const centerLabel =
    game.status === "playing" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="5" y="4" width="5" height="16" />
        <rect x="14" y="4" width="5" height="16" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7 4 L20 12 L7 20 Z" />
      </svg>
    );

  return (
    <div className="grid w-56 grid-cols-3 gap-2" aria-label="Touch controls">
      <span />
      <button type="button" className={BTN} onPointerDown={press("up")} aria-label="Up">
        <Chevron rotate={0} />
      </button>
      <span />
      <button type="button" className={BTN} onPointerDown={press("left")} aria-label="Left">
        <Chevron rotate={-90} />
      </button>
      <button
        type="button"
        className={BTN + " text-amber"}
        onPointerDown={center}
        aria-label="Pause or play"
      >
        {centerLabel}
      </button>
      <button type="button" className={BTN} onPointerDown={press("right")} aria-label="Right">
        <Chevron rotate={90} />
      </button>
      <span />
      <button type="button" className={BTN} onPointerDown={press("down")} aria-label="Down">
        <Chevron rotate={180} />
      </button>
      <span />
    </div>
  );
}
