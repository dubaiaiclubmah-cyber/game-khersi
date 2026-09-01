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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8h4v12h-9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9h5M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.9 5.9l1.5-2L21 14.4v3A3.6 3.6 0 0 1 17.4 21 14.4 14.4 0 0 1 3 6.6 3.6 3.6 0 0 1 6.6 3z" />
    </svg>
  );
}

function SwipeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 12h13M12 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <circle cx="19" cy="5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function TapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

function PadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
      <rect x="15" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="15" width="6" height="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ---------- pixel portrait of the maker ---------- */

function MakerAvatar() {
  const P = "#5b3a24"; // hair
  const S = "#ffd9a0"; // skin
  const D = "#12281d"; // dark
  const L = "#b8f04d"; // shirt
  const rects: Array<[number, number, number, number, string]> = [
    [3, 1, 6, 1, P],
    [2, 2, 8, 2, P],
    [2, 4, 2, 2, P],
    [8, 4, 2, 2, P],
    [4, 4, 4, 1, S],
    [2, 5, 8, 1, S],
    [4, 5, 1, 1, D],
    [7, 5, 1, 1, D],
    [2, 6, 8, 1, S],
    [3, 7, 6, 1, S],
    [5, 7, 2, 1, P],
    [4, 8, 4, 1, S],
    [2, 9, 8, 1, L],
    [1, 10, 10, 2, L],
  ];
  return (
    <svg
      viewBox="0 0 12 12"
      width="112"
      height="112"
      shapeRendering="crispEdges"
      className="drop-shadow-[0_0_18px_rgba(184,240,77,0.25)]"
      aria-hidden
    >
      {rects.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
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
    <div
      dir="ltr"
      aria-hidden
      className="relative mt-9 h-16 overflow-hidden border border-hedge bg-[#0a1712] clip-pixel-sm"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(159,232,192,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(159,232,192,0.06) 1px, transparent 1px)",
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
      <svg
        width="20"
        height="22"
        viewBox="0 0 24 26"
        className="pulse-dot absolute end-7 top-1/2 -translate-y-1/2"
      >
        <circle cx="12" cy="15" r="9" fill="#ff6b5e" />
        <rect x="11" y="2" width="2" height="6" fill="#8a5a33" />
        <ellipse cx="16" cy="5" rx="4" ry="1.8" fill="#7be06a" transform="rotate(-24 16 5)" />
      </svg>
    </div>
  );
}

/* ---------- section shell ---------- */

function Section({
  num,
  title,
  children,
  accent = "#1f3b2c",
}: {
  num: string;
  title: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <Reveal>
      <section className="panel clip-pixel relative p-5 md:p-7" style={{ borderColor: accent }}>
        <span
          aria-hidden
          className="absolute end-4 top-1 font-display text-5xl text-hedge/50 select-none md:text-6xl"
        >
          {num}
        </span>
        <h2 className="relative font-title text-2xl text-fog md:text-3xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </section>
    </Reveal>
  );
}

/* ---------- help page ---------- */

export function HelpPage({ game, onClose }: { game: GameAPI; onClose: () => void }) {
  const { t, fmt, lang } = useLang();
  const backRef = useRef<HTMLButtonElement>(null);

  /* lock page scroll + esc to close + focus */
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
    { label: t.outFinal, v: fmt(120), c: "#ffc94d" },
    { label: t.outLen, v: fmt(15), c: "#d7f0e0" },
    { label: t.outApples, v: fmt(12), c: "#ff6b5e" },
    { label: t.outTempo, v: `${t.lv} ${fmt(3)}`, c: "#4de3c2" },
  ];

  const settings: Array<[string, string]> = [
    [t.s5n1, t.s5w1],
    [t.s5n2, t.s5w2],
    [t.s5n3, t.s5w3],
    [t.s5n4, t.s5w4],
  ];

  const diffOrder: DiffKey[] = ["chill", "classic", "blazing"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110c]" role="dialog" aria-modal="true">
      {/* ambient layers */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 560px at 50% -6%, #0d2b1e 0%, rgba(13,43,30,0) 60%)",
          }}
        />
        <div
          className="absolute -left-40 top-1/4 h-[44vmax] w-[44vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(77,227,194,0.10) 0%, rgba(77,227,194,0) 62%)",
            animation: "drift-a 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -right-44 bottom-0 h-[40vmax] w-[40vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,201,77,0.09) 0%, rgba(255,201,77,0) 60%)",
            animation: "drift-b 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>

      {/* sticky top bar */}
      <div className="sticky top-0 z-20 border-b border-hedge bg-[#06110cf2] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <button
            ref={backRef}
            type="button"
            onClick={onClose}
            className="clip-pixel-sm flex items-center gap-2 border border-hedge bg-[#0e2118] px-3 py-2.5 font-display text-[8px] text-teal transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:-scale-x-100">
              <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
            </svg>
            {t.helpBack}
          </button>
          <span className="font-display text-[8px] tracking-[0.24em] text-fern">
            {t.helpKicker}
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-10 md:px-8">
        {/* hero */}
        <Reveal>
          <p className="font-display text-[8px] tracking-[0.3em] text-teal md:text-[9px]">
            {t.helpKicker}
          </p>
          <h1 className="mt-3 font-title text-4xl leading-tight text-lime [text-shadow:0_0_26px_rgba(184,240,77,0.35)] md:text-6xl">
            {t.helpTitle}
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-mint md:text-base">
            {t.helpIntro}
          </p>
          <CrawlStrip />
        </Reveal>

        {/* sections */}
        <div className="mt-10 flex flex-col gap-6">
          {/* 01 — what it does */}
          <Section num="01" title={t.s1Title}>
            <p className="max-w-[68ch] text-sm leading-7 text-fog/90 md:text-[15px]">{t.s1Body}</p>
          </Section>

          {/* 02 — how it plays */}
          <Section num="02" title={t.s2Title}>
            <ul className="flex flex-col gap-2.5">
              {t.s2Items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-6 text-fog/90 md:text-[15px]">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-2 w-2 shrink-0 bg-lime shadow-[0_0_10px_rgba(184,240,77,0.6)]"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="clip-pixel-sm border border-hedge bg-[#0a1712] p-4">
                <p className="font-display text-[8px] tracking-[0.22em] text-teal">{t.helpKeysTitle}</p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {keyRows.map(([keys, label]) => (
                    <li key={label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1" dir="ltr">
                        {keys.map((k) => (
                          <kbd key={k} className="kbd">
                            {k}
                          </kbd>
                        ))}
                      </span>
                      <span className="text-[12px] text-mint">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="clip-pixel-sm border border-hedge bg-[#0a1712] p-4">
                <p className="font-display text-[8px] tracking-[0.22em] text-teal">{t.helpTouchTitle}</p>
                <ul className="mt-3 flex flex-col gap-3.5">
                  {touchRows.map((row, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 text-lime">{row.icon}</span>
                      <span className="text-[12px] leading-5 text-mint">{row.txt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* 03 — the goal */}
          <Section num="03" title={t.s3Title}>
            <p className="max-w-[68ch] text-sm leading-7 text-fog/90 md:text-[15px]">{t.s3Body}</p>
          </Section>

          {/* 04 — scores & outputs */}
          <Section num="04" title={t.s4Title}>
            <p className="text-sm leading-7 text-fog/90 md:text-[15px]">{t.s4Body}</p>

            {/* formula — math reads LTR in both languages */}
            <div
              dir="ltr"
              className="mt-5 flex flex-wrap items-stretch justify-center gap-2 md:gap-3"
            >
              {[
                { top: fmt(10), label: t.s4Formula, c: "#b8f04d" },
                { top: "×", label: "", c: "#567e69" },
                { top: fmt(2), label: t.s4Times, c: "#ffc94d" },
                { top: "=", label: "", c: "#567e69" },
                { top: fmt(20), label: t.s4Result, c: "#4de3c2" },
              ].map((chip, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className="clip-pixel-sm flex h-14 min-w-14 items-center justify-center border border-hedge bg-[#0a1712] px-3 font-display text-base md:text-lg"
                    style={{ color: chip.c }}
                  >
                    {chip.top}
                  </span>
                  <span className="font-display text-[6px] tracking-[0.14em] text-fern">
                    {chip.label}
                  </span>
                </div>
              ))}
            </div>

            {/* outputs */}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {outputs.map((o) => (
                <div
                  key={o.label}
                  className="clip-pixel-sm flex flex-col items-center gap-1.5 border border-hedge bg-[#0a1712] px-2 py-3"
                >
                  <span className="font-display text-[6px] tracking-[0.18em] text-fern">{o.label}</span>
                  <span className="font-display text-sm" style={{ color: o.c }}>
                    {o.v}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 border-s-2 border-teal/50 ps-3 text-[13px] leading-6 text-mint">
              {t.s4Save}
            </p>
          </Section>

          {/* 05 — settings */}
          <Section num="05" title={t.s5Title}>
            <ul className="flex flex-col gap-3">
              {settings.map(([name, where], i) => (
                <li
                  key={i}
                  className="clip-pixel-sm flex flex-col gap-1.5 border border-hedge bg-[#0a1712] px-4 py-3 transition-colors hover:border-mint/40 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span
                    className="w-28 shrink-0 font-display text-[8px] tracking-[0.16em] text-amber"
                  >
                    {name}
                  </span>
                  <span className="text-[13px] leading-5 text-mint">{where}</span>
                </li>
              ))}
            </ul>

            {/* live replica of the tier strip */}
            <div className="mt-5 flex w-full gap-1 border border-hedge bg-[#0a1712] p-1 clip-pixel-sm">
              {diffOrder.map((key) => {
                const d = DIFFICULTIES[key];
                const active = game.difficulty === key;
                return (
                  <span
                    key={key}
                    className="flex flex-1 flex-col items-center gap-1 px-1 py-2"
                    style={{
                      background: active ? `${d.color}1f` : "transparent",
                      boxShadow: active ? `inset 0 0 0 1px ${d.color}` : undefined,
                    }}
                  >
                    <span
                      className="font-display text-[7px]"
                      style={{ color: active ? d.color : "#567e69" }}
                    >
                      {t[DIFF_LABEL[key]]}
                    </span>
                    <span className="font-display text-[7px]" style={{ color: active ? d.color : "#3f5c4c" }}>
                      ×{fmt(d.mult)}
                    </span>
                  </span>
                );
              })}
            </div>
          </Section>

          {/* 06 — the maker */}
          <Section num="06" title={t.s6Title} accent="#6b5320">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="flex shrink-0 flex-col items-center gap-3">
                <div className="clip-pixel-sm border-2 border-[#6b5320] bg-[#0a1712] p-3">
                  <MakerAvatar />
                </div>
                <span className="clip-pixel-sm bg-amber px-2.5 py-1 font-display text-[7px] tracking-[0.14em] text-[#0a1712]">
                  {lang === "fa" ? "۱۲ ساله" : "AGE 12"}
                </span>
              </div>

              <div className="flex w-full flex-col items-center gap-4 text-center md:items-start md:text-start">
                <span className="clip-pixel-sm border border-teal/50 px-2.5 py-1 font-display text-[7px] tracking-[0.2em] text-teal">
                  {t.makerKicker}
                </span>
                <div>
                  <p className="font-title text-2xl leading-snug text-fog md:text-3xl">{t.makerLine1}</p>
                  <p className="mt-2 text-sm leading-6 text-mint md:text-[15px]">{t.makerLine2}</p>
                </div>

                <div className="mt-2 flex flex-col items-center gap-3 md:items-start">
                  <a
                    href="tel:00971551544988"
                    className="clip-pixel-sm flex items-center gap-2.5 bg-amber px-6 py-3.5 font-display text-[10px] text-[#0a1712] shadow-[0_0_28px_rgba(255,201,77,0.3)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:brightness-95 cursor-pointer"
                  >
                    <PhoneIcon />
                    {t.makerContact}
                  </a>
                  <a
                    href="tel:00971551544988"
                    dir="ltr"
                    className="font-display text-sm tracking-[0.12em] text-amber transition-colors hover:text-lime md:text-base"
                  >
                    {t.makerPhone}
                  </a>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* footer of the manual */}
        <Reveal className="mt-10 flex flex-col items-center gap-4">
          <p className="font-display text-[7px] tracking-[0.26em] text-fern">
            {t.helpEsc}
            <span className="blink-cursor ms-1.5 inline-block h-2.5 w-1.5 translate-y-px bg-lime" />
          </p>
          <button
            type="button"
            onClick={onClose}
            className="clip-pixel-sm flex items-center gap-2.5 bg-lime px-7 py-3.5 font-display text-[10px] text-[#0a1712] shadow-[0_0_28px_rgba(184,240,77,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 cursor-pointer"
          >
            <BookIcon />
            {t.helpBack}
          </button>
        </Reveal>
      </div>
    </div>
  );
}
