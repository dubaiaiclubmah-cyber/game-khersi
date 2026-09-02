import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GameAPI } from "../game/useSnakeGame";
import { useLang, DIFF_LABEL } from "../game/i18n";
import { DIFFICULTIES } from "../game/engine";
import type { DiffKey } from "../game/engine";

/* ---------- scroll reveal ---------- */

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={
        "transition-all duration-700 ease-out " +
        (vis ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0") +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}

/* ---------- tiny inline icons ---------- */

function BookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8h4v12h-9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9h5M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function SwipeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 12h13M12 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <circle cx="19" cy="5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function TapIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

function PadIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
      <rect x="15" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="15" width="6" height="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ---------- the crawling serpent strip ---------- */

const SEGMENTS = [
  { c: "#229e74", s: 10 },
  { c: "#2fb97f", s: 11 },
  { c: "#43cd7c", s: 12 },
  { c: "#5fdd72", s: 13 },
  { c: "#7fe966", s: 13 },
  { c: "#9cf05b", s: 14 },
  { c: "#b8f04d", s: 15 },
];

function CrawlStrip() {
  return (
    <div dir="ltr" aria-hidden className="relative mt-9 h-16 overflow-hidden border border-hedge bg-shell2 clip-pixel-sm">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--t-lattice) 1px, transparent 1px), linear-gradient(90deg, var(--t-lattice) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="crawl-snake absolute top-1/2 flex -translate-y-1/2 items-center gap-[3px]">
        {SEGMENTS.map((seg, i) => (
          <span
            key={i}
            style={{
              width: seg.s,
              height: seg.s,
              background: seg.c,
              boxShadow: i === SEGMENTS.length - 1 ? `0 0 14px ${seg.c}` : undefined,
            }}
          />
        ))}
      </div>
      <svg width="20" height="22" viewBox="0 0 24 26" className="pulse-dot absolute end-7 top-1/2 -translate-y-1/2">
        <circle cx="12" cy="15" r="9" fill="#ff6b5e" />
        <rect x="11" y="2" width="2" height="6" fill="#8a5a33" />
        <ellipse cx="16" cy="5" rx="4" ry="1.8" fill="#7be06a" transform="rotate(-24 16 5)" />
      </svg>
    </div>
  );
}

/* ---------- section shell ---------- */

function Section({ num, title, children, accent }: {
  num: string;
  title: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <Reveal>
      <section className="panel clip-pixel relative p-5 md:p-7" style={{ borderColor: accent }}>
        <span aria-hidden className="absolute end-4 top-1 font-display text-5xl text-hedge/50 select-none md:text-6xl">
          {num}
        </span>
        <h2 className="relative font-title text-3xl text-fog md:text-4xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </section>
    </Reveal>
  );
}

/* ---------- help page (user guide only) ---------- */

export function HelpPage({ game, onClose }: { game: GameAPI; onClose: () => void }) {
  const { t, fmt } = useLang();
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    backRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const keyRows: Array<[string[], string]> = [
    [["↑", "←", "↓", "→"], t.helpSteer],
    [["W", "A", "S", "D"], t.helpWasd],
    [["SPC"], t.helpPause],
    [["ENT"], t.helpEnter],
    [["R"], t.helpRestart],
    [["M"], t.helpMute],
  ];

  const touchRows = [
    { icon: <SwipeIcon />, txt: t.helpTouch1 },
    { icon: <TapIcon />, txt: t.helpTouch2 },
    { icon: <PadIcon />, txt: t.helpTouch3 },
  ];

  const outputs = [
    { label: t.finalScore, v: fmt(120), c: "#ffc94d" },
    { label: t.length, v: fmt(15), c: "var(--color-fog)" },
    { label: t.applesLabel, v: fmt(12), c: "#ff6b5e" },
    { label: t.tempo, v: `${t.lv} ${fmt(3)}`, c: "#4de3c2" },
  ];

  const settings: Array<[string, string]> = [
    [t.s5n1, t.s5w1],
    [t.s5n2, t.s5w2],
    [t.s5n3, t.s5w3],
    [t.s5n4, t.s5w4],
  ];

  const diffOrder: DiffKey[] = ["chill", "classic", "blazing"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-pit" role="dialog" aria-modal="true">
      {/* ambient layers */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(900px 560px at 50% -6%, var(--t-glowTop) 0%, transparent 60%)" }}
        />
        <div
          className="absolute -left-40 top-1/4 h-[44vmax] w-[44vmax] rounded-full"
          style={{ background: "radial-gradient(circle, var(--t-glowA), transparent 62%)", animation: "drift-a 18s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-44 bottom-0 h-[40vmax] w-[40vmax] rounded-full"
          style={{ background: "radial-gradient(circle, var(--t-glowB), transparent 60%)", animation: "drift-b 22s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
            opacity: "var(--t-scan)" as unknown as number,
          }}
        />
      </div>

      {/* sticky top bar */}
      <div className="sticky top-0 z-20 border-b border-hedge bg-pit/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <button
            ref={backRef}
            type="button"
            onClick={onClose}
            className="clip-pixel-sm flex items-center gap-2 border border-hedge bg-shell px-3.5 py-3 font-display text-[11px] text-teal transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:-scale-x-100">
              <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
            </svg>
            {t.helpBack}
          </button>
          <span className="hidden font-display text-[10px] text-fern sm:inline">{t.helpKicker}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-10 md:px-8">
        <Reveal>
          <p className="font-display text-[10px] text-teal md:text-[11px]">{t.helpKicker}</p>
          <h1 className="mt-3 font-title text-5xl leading-tight text-lime title-glow md:text-6xl">
            {t.helpTitle}
          </h1>
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-mint md:text-lg">{t.helpIntro}</p>
          <CrawlStrip />
        </Reveal>

        <div className="mt-10 flex flex-col gap-6">
          <Section num="01" title={t.s1Title}>
            <p className="max-w-[68ch] text-[15px] leading-7 text-fog/90 md:text-base">{t.s1Body}</p>
          </Section>

          <Section num="02" title={t.s2Title}>
            <ul className="flex flex-col gap-3">
              {t.s2Items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-6 text-fog/90 md:text-base">
                  <span aria-hidden className="mt-2 inline-block h-2 w-2 shrink-0 bg-lime shadow-[0_0_10px_var(--glow1)]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="clip-pixel-sm border border-hedge bg-shell2 p-4">
                <p className="font-display text-[11px] text-teal">{t.helpKeysTitle}</p>
                <ul className="mt-3.5 flex flex-col gap-3">
                  {keyRows.map(([keys, label]) => (
                    <li key={label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1" dir="ltr">
                        {keys.map((k) => (
                          <kbd key={k} className="kbd">
                            {k}
                          </kbd>
                        ))}
                      </span>
                      <span className="text-[14px] font-medium text-mint">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="clip-pixel-sm border border-hedge bg-shell2 p-4">
                <p className="font-display text-[11px] text-teal">{t.helpTouchTitle}</p>
                <ul className="mt-3.5 flex flex-col gap-4">
                  {touchRows.map((row, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 text-lime">{row.icon}</span>
                      <span className="text-[14px] leading-6 text-mint">{row.txt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section num="03" title={t.s3Title}>
            <p className="max-w-[68ch] text-[15px] leading-7 text-fog/90 md:text-base">{t.s3Body}</p>
          </Section>

          <Section num="04" title={t.s4Title}>
            <p className="text-[15px] leading-7 text-fog/90 md:text-base">{t.s4Body}</p>

            <div dir="ltr" className="mt-5 flex flex-wrap items-stretch justify-center gap-2 md:gap-3">
              {[
                { top: fmt(10), label: t.s4Formula, c: "#b8f04d" },
                { top: "×", label: "", c: "var(--color-fern)" },
                { top: fmt(2), label: t.s4Times, c: "#ffc94d" },
                { top: "=", label: "", c: "var(--color-fern)" },
                { top: fmt(20), label: t.s4Result, c: "#4de3c2" },
              ].map((chip, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span
                    className="clip-pixel-sm flex h-16 min-w-16 items-center justify-center border border-hedge bg-shell2 px-3 font-display text-xl md:text-2xl"
                    style={{ color: chip.c }}
                  >
                    {chip.top}
                  </span>
                  <span className="font-display text-[9px] text-fern">{chip.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {outputs.map((o) => (
                <div key={o.label} className="clip-pixel-sm flex flex-col items-center gap-2 border border-hedge bg-shell2 px-2 py-3.5">
                  <span className="font-display text-[9px] text-fern">{o.label}</span>
                  <span className="font-display text-lg" style={{ color: o.c }}>
                    {o.v}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 border-s-2 border-teal/50 ps-3 text-[14px] leading-6 text-mint">{t.s4Save}</p>
          </Section>

          <Section num="05" title={t.s5Title}>
            <ul className="flex flex-col gap-3">
              {settings.map(([name, where], i) => (
                <li
                  key={i}
                  className="clip-pixel-sm flex flex-col gap-1.5 border border-hedge bg-shell2 px-4 py-3.5 transition-colors hover:border-mint/40 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="w-32 shrink-0 font-display text-[11px] text-amber">{name}</span>
                  <span className="text-[14px] leading-6 text-mint">{where}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex w-full gap-1 border border-hedge bg-shell2 p-1 clip-pixel-sm">
              {diffOrder.map((key) => {
                const d = DIFFICULTIES[key];
                const active = game.difficulty === key;
                return (
                  <span
                    key={key}
                    className="flex flex-1 flex-col items-center gap-1.5 px-1 py-2.5"
                    style={{
                      background: active ? `${d.color}1f` : "transparent",
                      boxShadow: active ? `inset 0 0 0 1px ${d.color}` : undefined,
                    }}
                  >
                    <span className="font-display text-[10px]" style={{ color: active ? d.color : "var(--color-fern)" }}>
                      {t[DIFF_LABEL[key]]}
                    </span>
                    <span className="font-display text-[10px]" style={{ color: active ? d.color : "var(--color-fern)" }}>
                      ×{fmt(d.mult)}
                    </span>
                  </span>
                );
              })}
            </div>
          </Section>
        </div>

        <Reveal className="mt-10 flex flex-col items-center gap-4">
          <p className="font-display text-[10px] text-fern">
            {t.helpEsc}
            <span className="blink-cursor ms-1.5 inline-block h-3 w-2 translate-y-px bg-lime" />
          </p>
          <button
            type="button"
            onClick={onClose}
            className="clip-pixel-sm flex items-center gap-2.5 bg-btn px-7 py-4 font-display text-[13px] text-inkdeep glow-lime transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 cursor-pointer"
          >
            <BookIcon />
            {t.helpBack}
          </button>
        </Reveal>
      </div>
    </div>
  );
}
