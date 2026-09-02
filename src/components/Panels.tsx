import { useState } from "react";
import type { ReactNode } from "react";
import type { GameAPI, MedalKind } from "../game/useSnakeGame";
import { DIFFICULTIES } from "../game/engine";
import type { DiffKey } from "../game/engine";
import { useLang, DIFF_LABEL, DIFF_TAG } from "../game/i18n";

const DIFF_ORDER: DiffKey[] = ["chill", "classic", "blazing"];
const SEG_COLORS = ["#4de3c2", "#7fe966", "#b8f04d", "#ffc94d", "#ff9a4d", "#ff6b5e"];

function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-[11px] text-mint">
      <span className="inline-block h-2 w-2 bg-lime" aria-hidden />
      {children}
    </h3>
  );
}

function Crown({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M2 18 L4 7 L9.5 11.5 L12 4 L14.5 11.5 L20 7 L22 18 Z" />
    </svg>
  );
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="14" r="8" fill="#ff6b5e" />
      <rect x="11" y="2" width="2" height="5" fill="#8a5a33" />
      <ellipse cx="16" cy="5" rx="3.4" ry="1.6" fill="#7be06a" transform="rotate(-24 16 5)" />
    </svg>
  );
}

/* ---------------- difficulty (desktop, vertical) ---------------- */

export function DifficultyPanel({ game }: { game: GameAPI }) {
  const { t } = useLang();
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
              className="clip-pixel-sm flex items-center justify-between gap-2 border bg-shell2 px-3 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:brightness-125 active:translate-y-0 cursor-pointer"
              style={{
                borderColor: active ? d.color : "var(--color-hedge)",
                boxShadow: active ? `0 0 22px ${d.color}2e, inset 0 0 18px ${d.color}14` : undefined,
              }}
            >
              <span>
                <span
                  className="block font-display text-[12px]"
                  style={{ color: active ? d.color : "var(--color-mint)" }}
                >
                  {t[DIFF_LABEL[key]]}
                </span>
                <span className="mt-1.5 block text-[13px] leading-tight text-fern">
                  {t[DIFF_TAG[key]]}
                </span>
              </span>
              <span
                className="font-display text-[12px]"
                style={{ color: active ? d.color : "var(--color-fern)" }}
              >
                ×{d.mult}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] leading-snug text-fern">{t.diffNote}</p>
    </section>
  );
}

/* ---------------- controls help (desktop) ---------------- */

export function HelpPanel() {
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
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.controls}</PanelTitle>
      <ul className="mt-3.5 flex flex-col gap-3">
        {rows.map(([keys, label]) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1" dir="ltr">
              {keys.map((k) => (
                <kbd key={k} className="kbd">
                  {k}
                </kbd>
              ))}
            </span>
            <span className="text-[13px] font-medium text-mint">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- score board (desktop, right) ---------------- */

export function StatsPanel({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  const filled = Math.max(1, Math.round(game.speedPct * 6));
  const maxHist = Math.max(1, ...game.history);
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.scoreboard}</PanelTitle>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-[10px] text-fern">{t.score}</p>
          <p key={game.score} className="score-pop mt-2 font-display text-3xl leading-none text-amber">
            {fmt(game.score)}
          </p>
        </div>
        <div className="text-end">
          <p className="flex items-center justify-end gap-1.5 font-display text-[10px] text-fern">
            <Crown className={game.isNewBest ? "text-lime" : "text-teal"} /> {t.best}
          </p>
          <p className={"mt-2 font-display text-xl leading-none " + (game.isNewBest ? "text-lime" : "text-teal")}>
            {fmt(game.best)}
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-hedge" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-display text-[10px] text-fern">{t.length}</p>
          <p className="mt-1.5 font-display text-lg text-fog">{fmt(3 + game.eaten)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 font-display text-[10px] text-fern">
            <AppleGlyph /> {t.applesLabel}
          </p>
          <p className="mt-1.5 font-display text-lg text-fog">{fmt(game.eaten)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-[10px] text-fern">{t.tempo}</p>
          <p className="font-display text-[10px]" style={{ color: SEG_COLORS[filled - 1] }}>
            {t.lv} {fmt(filled)}
          </p>
        </div>
        <div className="mt-2 flex gap-1">
          {SEG_COLORS.map((c, i) => (
            <span
              key={c}
              className="h-3 flex-1 transition-all duration-300"
              style={{
                background: i < filled ? c : "var(--color-dim)",
                boxShadow: i < filled ? `0 0 10px ${c}55` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* recent runs chart */}
      <div className="mt-4">
        <p className="font-display text-[10px] text-fern">{t.historyTitle}</p>
        <div className="mt-2 flex h-14 items-end gap-1">
          {Array.from({ length: 8 }).map((_, i) => {
            const v = game.history[i];
            if (v === undefined) {
              return <span key={i} className="h-[3px] flex-1 bg-dim" />;
            }
            const isLast = i === game.history.length - 1;
            return (
              <span
                key={i}
                title={fmt(v)}
                className="flex-1 transition-all duration-500"
                style={{
                  height: `${Math.max(10, (v / maxHist) * 100)}%`,
                  background: isLast ? "var(--color-amber)" : "var(--color-fern)",
                  boxShadow: isLast ? "0 0 10px rgba(255,201,77,0.4)" : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- hall of fame ---------------- */

export function FamePanel({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>{t.fame}</PanelTitle>
      <ul className="mt-3 flex flex-col gap-2">
        {DIFF_ORDER.map((key) => {
          const d = DIFFICULTIES[key];
          const active = game.difficulty === key;
          return (
            <li
              key={key}
              className={
                "flex items-center justify-between border px-3 py-2.5 transition-colors " +
                (active ? "border-hedge bg-shell" : "border-transparent")
              }
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-block h-2.5 w-2.5" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}88` }} />
                <span className={"font-display text-[11px] " + (active ? "text-fog" : "text-fern")}>
                  {t[DIFF_LABEL[key]]}
                </span>
              </span>
              <span className="font-display text-[13px]" style={{ color: d.color }}>
                {game.bests[key] > 0 ? fmt(game.bests[key]) : "———"}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[13px] leading-snug text-fern">{t.fameNote}</p>
    </section>
  );
}

/* ---------------- medals ---------------- */

function MedalIcon({ kind, dim }: { kind: MedalKind; dim?: boolean }) {
  const style = dim ? { filter: "grayscale(1)", opacity: 0.42 } : undefined;
  switch (kind) {
    case "apple":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <circle cx="12" cy="14" r="8" fill="#ff6b5e" />
          <rect x="11" y="2" width="2" height="5" fill="#8a5a33" />
          <ellipse cx="16" cy="5" rx="3.4" ry="1.6" fill="#7be06a" transform="rotate(-24 16 5)" />
        </svg>
      );
    case "apples":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <circle cx="8" cy="15" r="6" fill="#ff6b5e" />
          <circle cx="16" cy="12" r="6" fill="#b8f04d" />
          <rect x="15" y="3" width="2" height="4" fill="#8a5a33" />
        </svg>
      );
    case "pile":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <circle cx="7" cy="17" r="5" fill="#ff6b5e" />
          <circle cx="17" cy="17" r="5" fill="#d63b2f" />
          <circle cx="12" cy="8" r="5" fill="#ffb3a6" />
          <rect x="11" y="0" width="2" height="4" fill="#8a5a33" />
        </svg>
      );
    case "coin":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <circle cx="12" cy="12" r="9" fill="#ffc94d" />
          <circle cx="12" cy="12" r="5.5" fill="#0a1712" />
          <circle cx="12" cy="12" r="2.6" fill="#ffc94d" />
        </svg>
      );
    case "coins":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <ellipse cx="12" cy="18" rx="8" ry="3.4" fill="#c98f2e" />
          <ellipse cx="12" cy="13" rx="8" ry="3.4" fill="#e0ad3e" />
          <ellipse cx="12" cy="8" rx="8" ry="3.4" fill="#ffc94d" />
        </svg>
      );
    case "bolt":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <path d="M13 2 L5 14 h5 L9 22 L19 9 h-6 Z" fill="#ffe9a8" />
        </svg>
      );
    case "clock":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" style={style} aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="#4de3c2" strokeWidth="2.4" />
          <path d="M12 7 v5 l4 3" stroke="#4de3c2" strokeWidth="2.4" strokeLinecap="square" />
        </svg>
      );
    case "star":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <path
            d="M12 2 L14.6 8.6 L21.8 9 L16.2 13.4 L18 20.4 L12 16.4 L6 20.4 L7.8 13.4 L2.2 9 L9.4 8.6 Z"
            fill="#ffc94d"
          />
        </svg>
      );
    case "crown":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <path d="M2 18 L4 7 L9.5 11.5 L12 4 L14.5 11.5 L20 7 L22 18 Z" fill="#ffc94d" />
          <rect x="2" y="19" width="20" height="2.4" fill="#c98f2e" />
        </svg>
      );
    case "flag":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" style={style} aria-hidden>
          <rect x="5" y="2" width="2.4" height="20" fill="#9fe8c0" />
          <path d="M7.4 3 H21 L17.5 8 L21 13 H7.4 Z" fill="#ff6b5e" />
        </svg>
      );
    default:
      return null;
  }
}

function MedalCell({ icon, nameKey, descKey, unlocked }: {
  icon: MedalKind;
  nameKey: string;
  descKey: string;
  unlocked: boolean;
}) {
  const { t } = useLang();
  const T = t as unknown as Record<string, string>;
  return (
    <div
      title={`${T[nameKey]} — ${T[descKey]}`}
      className={
        "clip-pixel-sm relative flex aspect-square cursor-help flex-col items-center justify-center border transition-all duration-200 " +
        (unlocked
          ? "border-amber/70 bg-amber/20 shadow-[0_0_16px_var(--glow3)] hover:-translate-y-0.5 hover:shadow-[0_0_22px_var(--glow3)]"
          : "border-hedge bg-shell2 hover:border-mint/40")
      }
    >
      <MedalIcon kind={icon} dim={!unlocked} />
      {unlocked && <span className="absolute bottom-1 h-1 w-3 bg-lime" aria-hidden />}
    </div>
  );
}

export function MedalsPanel({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  const got = game.medals.filter((md) => md.unlocked).length;
  return (
    <section className="panel clip-pixel p-4">
      <PanelTitle>
        {t.medalsTitle}
        <span className="ms-1 text-amber">
          {fmt(got)}/{fmt(game.medals.length)}
        </span>
      </PanelTitle>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {game.medals.map((md) => (
          <MedalCell
            key={md.id}
            icon={md.icon}
            nameKey={md.nameKey}
            descKey={md.descKey}
            unlocked={md.unlocked}
          />
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-snug text-fern">{t.medalsNote}</p>
    </section>
  );
}

/* ---------------- mobile: compact stat strip ---------------- */

export function MobileStats({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  const filled = Math.max(1, Math.round(game.speedPct * 5));
  const cells: Array<{ label: string; node: ReactNode }> = [
    {
      label: t.score,
      node: (
        <span key={game.score} className="score-pop font-display text-base text-amber">
          {fmt(game.score)}
        </span>
      ),
    },
    {
      label: t.best,
      node: (
        <span className={"font-display text-base " + (game.isNewBest ? "text-lime" : "text-teal")}>
          {fmt(game.best)}
        </span>
      ),
    },
    {
      label: t.lenShort,
      node: <span className="font-display text-base text-fog">{fmt(3 + game.eaten)}</span>,
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
                height: 6 + i * 3.5,
                background: i < filled ? SEG_COLORS[Math.min(i + 1, 5)] : "var(--color-dim)",
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
        <div key={c.label} className="panel clip-pixel-sm flex flex-col items-center gap-2 px-1 py-3">
          <span className="font-display text-[10px] text-fern">{c.label}</span>
          {c.node}
        </div>
      ))}
    </div>
  );
}

/* ---------------- mobile: segmented difficulty ---------------- */

export function MobileDifficulty({ game }: { game: GameAPI }) {
  const { t } = useLang();
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
            className="clip-pixel-sm flex-1 px-1 py-3 transition-all duration-150 cursor-pointer"
            style={{
              background: active ? `${d.color}1f` : "transparent",
              boxShadow: active ? `inset 0 0 0 1px ${d.color}` : undefined,
            }}
          >
            <span className="block font-display text-[11px]" style={{ color: active ? d.color : "var(--color-mint)" }}>
              {t[DIFF_LABEL[key]]}
            </span>
            <span className="mt-1.5 block font-display text-[10px]" style={{ color: active ? d.color : "var(--color-fern)" }}>
              ×{d.mult}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- mobile: accordion hub ---------------- */

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel clip-pixel w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5"
      >
        <span className="font-display text-[11px] text-mint">{title}</span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          className={"text-fern transition-transform duration-200 " + (open ? "rotate-180" : "")}
          aria-hidden
        >
          <path d="M5 9 L12 16 L19 9" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        </svg>
      </button>
      {open && <div className="border-t border-hedge px-4 py-4">{children}</div>}
    </div>
  );
}

export function MobileInfo({ game }: { game: GameAPI }) {
  const { t, fmt } = useLang();
  const keyRows: Array<[string[], string]> = [
    [["↑", "←", "↓", "→"], t.helpSteer],
    [["SPC"], t.helpPause],
    [["ENT"], t.helpEnter],
    [["R"], t.helpRestart],
    [["M"], t.helpMute],
  ];
  return (
    <div className="flex w-full flex-col gap-2.5">
      <Accordion title={t.controls}>
        <ul className="flex flex-col gap-3">
          {keyRows.map(([keys, label]) => (
            <li key={label} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1" dir="ltr">
                {keys.map((k) => (
                  <kbd key={k} className="kbd">
                    {k}
                  </kbd>
                ))}
              </span>
              <span className="text-[13px] font-medium text-mint">{label}</span>
            </li>
          ))}
        </ul>
      </Accordion>

      <Accordion title={t.fame}>
        <ul className="flex flex-col gap-2.5">
          {DIFF_ORDER.map((key) => {
            const d = DIFFICULTIES[key];
            const active = game.difficulty === key;
            return (
              <li key={key} className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <span className="inline-block h-2.5 w-2.5" style={{ background: d.color }} />
                  <span className={"font-display text-[11px] " + (active ? "text-fog" : "text-fern")}>
                    {t[DIFF_LABEL[key]]}
                  </span>
                </span>
                <span className="font-display text-[13px]" style={{ color: d.color }}>
                  {game.bests[key] > 0 ? fmt(game.bests[key]) : "———"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[13px] leading-snug text-fern">{t.fameNote}</p>
      </Accordion>

      <Accordion title={t.medalsTitle}>
        <div className="grid grid-cols-5 gap-1.5">
          {game.medals.map((md) => (
            <MedalCell
              key={md.id}
              icon={md.icon}
              nameKey={md.nameKey}
              descKey={md.descKey}
              unlocked={md.unlocked}
            />
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-snug text-fern">{t.medalsNote}</p>
      </Accordion>
    </div>
  );
}
