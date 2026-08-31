import type { GameAPI } from "../game/useSnakeGame";
import { DIFFICULTIES } from "../game/engine";
import type { DiffKey } from "../game/engine";
import { useLang, DIFF_LABEL, DIFF_TAG } from "../game/i18n";

const DIFF_ORDER: DiffKey[] = ["chill", "classic", "blazing"];
const SEG_COLORS = ["#4de3c2", "#7fe966", "#b8f04d", "#ffc94d", "#ff9a4d", "#ff6b5e"];

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-[8px] tracking-[0.26em] text-mint">
      <span className="inline-block h-1.5 w-1.5 bg-lime" aria-hidden />
      {children}
    </h3>
  );
}

function Crown({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M2 18 L4 7 L9.5 11.5 L12 4 L14.5 11.5 L20 7 L22 18 Z" />
    </svg>
  );
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="14" r="8" fill="#ff6b5e" />
      <rect x="11" y="2" width="2" height="5" fill="#8a5a33" />
      <ellipse cx="16" cy="5" rx="3.4" ry="1.6" fill="#7be06a" transform="rotate(-24 16 5)" />
    </svg>
  );
}

function AccChevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="acc-chev text-fern"
      aria-hidden
    >
      <path d="M5 9 L12 16 L19 9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );
}

/* ---------------- shared rows (desktop panels + mobile accordions) ---------------- */

function HelpRows() {
  const { t } = useLang();
  const rows: Array<[string[], string]> = [
    [["↑", "←", "↓", "→"], t.helpSteer],
    [["W", "A", "S", "D"], t.helpWasd],
    [["SPC"], t.helpPause],
    [["ENT"], t.helpEnter],
    [["R"], t.helpRestart],
    [["M"], t.helpMute],
  ];
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map(([keys, label]) => (
        <li key={label} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1">
            {keys.map((k) => (
              <kbd key={k} className="kbd">
                {k}
              </kbd>
            ))}
          </span>
          <span className="text-[11px] text-mint">{label}</span>
        </li>
      ))}
    </ul>
  );
}

function FameRows({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  return (
    <ul className="flex flex-col gap-2">
      {DIFF_ORDER.map((key) => {
        const d = DIFFICULTIES[key];
        const active = game.difficulty === key;
        return (
          <li
            key={key}
            className={
              "flex items-center justify-between border px-3 py-2 transition-colors " +
              (active ? "border-hedge bg-[#0e2118]" : "border-transparent")
            }
          >
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2"
                style={{ background: d.color, boxShadow: `0 0 8px ${d.color}88` }}
              />
              <span
                className={
                  "font-display text-[8px] tracking-[0.14em] " +
                  (active ? "text-fog" : "text-fern")
                }
              >
                {t[DIFF_LABEL[key]]}
              </span>
            </span>
            <span className="font-display text-[10px]" style={{ color: d.color }}>
              {game.bests[key] > 0 ? fmt(game.bests[key]) : "———"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- difficulty (desktop, vertical) ---------------- */

export function DifficultyPanel({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.selectSpeed}</PanelTitle>
      <div className="mt-3 flex flex-col gap-2">
        {DIFF_ORDER.map((key) => {
          const d = DIFFICULTIES[key];
          const active = game.difficulty === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => game.changeDifficulty(key)}
              className="clip-pixel-sm flex items-center justify-between gap-2 border bg-[#0a1712] px-3 py-2.5 text-start transition-all duration-150 hover:-translate-y-0.5 hover:brightness-125 active:translate-y-0 cursor-pointer"
              style={{
                borderColor: active ? d.color : "#1f3b2c",
                boxShadow: active ? `0 0 22px ${d.color}2e, inset 0 0 18px ${d.color}14` : undefined,
              }}
            >
              <span>
                <span
                  className="block font-display text-[9px] tracking-[0.12em]"
                  style={{ color: active ? d.color : "#9fe8c0" }}
                >
                  {t[DIFF_LABEL[key]]}
                </span>
                <span className="mt-1 block text-[11px] leading-tight text-fern">
                  {t[DIFF_TAG[key]]}
                </span>
              </span>
              <span
                className="font-display text-[9px]"
                style={{ color: active ? d.color : "#567e69" }}
              >
                ×{fmt(d.mult)}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-snug text-fern">{t.diffNote}</p>
    </section>
  );
}

/* ---------------- controls help (desktop) ---------------- */

export function HelpPanel() {
  const { t } = useLang();
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.controls}</PanelTitle>
      <div className="mt-3">
        <HelpRows />
      </div>
    </section>
  );
}

/* ---------------- score board (desktop, right) ---------------- */

export function StatsPanel({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  const filled = Math.max(1, Math.round(game.speedPct * 6));
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.scoreboard}</PanelTitle>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-[7px] tracking-[0.24em] text-fern">{t.score}</p>
          <p key={game.score} className="score-pop mt-1.5 font-display text-2xl leading-none text-amber">
            {fmt(game.score)}
          </p>
        </div>
        <div className="text-end">
          <p className="flex items-center justify-end gap-1 font-display text-[7px] tracking-[0.24em] text-fern">
            <Crown className={game.isNewBest ? "text-lime" : "text-teal"} /> {t.best}
          </p>
          <p
            className={
              "mt-1.5 font-display text-base leading-none " +
              (game.isNewBest ? "text-lime" : "text-teal")
            }
          >
            {fmt(game.best)}
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-hedge" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-display text-[7px] tracking-[0.2em] text-fern">{t.length}</p>
          <p className="mt-1.5 font-display text-sm text-fog">{fmt(3 + game.eaten)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 font-display text-[7px] tracking-[0.2em] text-fern">
            <AppleGlyph /> {t.applesLabel}
          </p>
          <p className="mt-1.5 font-display text-sm text-fog">{fmt(game.eaten)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-[7px] tracking-[0.2em] text-fern">{t.tempo}</p>
          <p className="font-display text-[7px] tracking-[0.14em]" style={{ color: SEG_COLORS[filled - 1] }}>
            {t.lv} {fmt(filled)}
          </p>
        </div>
        <div className="mt-2 flex gap-1">
          {SEG_COLORS.map((c, i) => (
            <span
              key={c}
              className="h-2.5 flex-1 transition-all duration-300"
              style={{
                background: i < filled ? c : "#12281d",
                boxShadow: i < filled ? `0 0 10px ${c}55` : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- hall of fame ---------------- */

export function FamePanel({ game }: { game: GameAPI }) {
  const { t } = useLang();
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.fame}</PanelTitle>
      <div className="mt-3">
        <FameRows game={game} />
      </div>
      <p className="mt-3 text-[11px] leading-snug text-fern">{t.fameNote}</p>
    </section>
  );
}

/* ---------------- mobile: compact stat strip ---------------- */

export function MobileStats({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  const filled = Math.max(1, Math.round(game.speedPct * 5));
  const cells: Array<{ label: string; node: React.ReactNode }> = [
    {
      label: t.score,
      node: (
        <span key={game.score} className="score-pop font-display text-sm text-amber">
          {fmt(game.score)}
        </span>
      ),
    },
    {
      label: t.best,
      node: (
        <span className={"font-display text-sm " + (game.isNewBest ? "text-lime" : "text-teal")}>
          {fmt(game.best)}
        </span>
      ),
    },
    {
      label: t.lenShort,
      node: <span className="font-display text-sm text-fog">{fmt(3 + game.eaten)}</span>,
    },
    {
      label: t.tempo,
      node: (
        <span className="flex items-end justify-center gap-0.5 pb-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1.5"
              style={{
                height: 5 + i * 3,
                background: i < filled ? SEG_COLORS[Math.min(i + 1, 5)] : "#12281d",
              }}
            />
          ))}
        </span>
      ),
    },
  ];
  return (
    <div className="grid w-full grid-cols-4 gap-2">
      {cells.map((c) => (
        <div key={c.label} className="panel clip-pixel-sm flex flex-col items-center gap-1.5 px-1 py-2.5">
          <span className="font-display text-[6px] tracking-[0.2em] text-fern">{c.label}</span>
          {c.node}
        </div>
      ))}
    </div>
  );
}

/* ---------------- mobile: segmented difficulty ---------------- */

export function MobileDifficulty({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  return (
    <div className="panel clip-pixel flex w-full gap-1 p-1">
      {DIFF_ORDER.map((key) => {
        const d = DIFFICULTIES[key];
        const active = game.difficulty === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => game.changeDifficulty(key)}
            className="clip-pixel-sm flex-1 px-1 py-2.5 transition-all duration-150 cursor-pointer"
            style={{
              background: active ? `${d.color}1f` : "transparent",
              boxShadow: active ? `inset 0 0 0 1px ${d.color}` : undefined,
            }}
          >
            <span
              className="block font-display text-[8px] tracking-[0.08em]"
              style={{ color: active ? d.color : "#7fa98f" }}
            >
              {t[DIFF_LABEL[key]]}
            </span>
            <span className="mt-1 block font-display text-[7px]" style={{ color: active ? d.color : "#567e69" }}>
              ×{fmt(d.mult)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- mobile: help + fame accordions ---------------- */

export function MobileInfo({ game }: { game: GameAPI }) {
  const { t } = useLang();
  return (
    <div className="flex w-full flex-col gap-3">
      <details className="panel clip-pixel group">
        <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3">
          <span className="font-display text-[8px] tracking-[0.26em] text-mint">{t.controls}</span>
          <AccChevron />
        </summary>
        <div className="border-t border-hedge px-4 py-3.5">
          <HelpRows />
        </div>
      </details>

      <details className="panel clip-pixel group">
        <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3">
          <span className="font-display text-[8px] tracking-[0.26em] text-mint">{t.fame}</span>
          <AccChevron />
        </summary>
        <div className="border-t border-hedge px-4 py-3.5">
          <FameRows game={game} />
          <p className="mt-3 text-[11px] leading-snug text-fern">{t.fameNote}</p>
        </div>
      </details>
    </div>
  );
}
