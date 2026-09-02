import { useEffect, useRef } from "react";
import { useLang } from "../game/i18n";

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
      width="124"
      height="124"
      shapeRendering="crispEdges"
      className="drop-shadow-[0_0_18px_var(--glow1)]"
      aria-hidden
    >
      {rects.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.9 5.9l1.5-2L21 14.4v3A3.6 3.6 0 0 1 17.4 21 14.4 14.4 0 0 1 3 6.6 3.6 3.6 0 0 1 6.6 3z" />
    </svg>
  );
}

export function AboutPage({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang();
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-pit" role="dialog" aria-modal="true">
      {/* ambient layers */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(900px 560px at 50% -6%, var(--t-glowTop) 0%, transparent 60%)" }}
        />
        <div
          className="absolute -right-40 top-1/4 h-[44vmax] w-[44vmax] rounded-full"
          style={{ background: "radial-gradient(circle, var(--t-glowB), transparent 62%)", animation: "drift-b 19s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-44 bottom-0 h-[40vmax] w-[40vmax] rounded-full"
          style={{ background: "radial-gradient(circle, var(--t-glowC), transparent 60%)", animation: "drift-a 23s ease-in-out infinite" }}
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
            className="clip-pixel-sm flex items-center gap-2 border border-hedge bg-shell px-3.5 py-3 font-display text-[11px] text-amber transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:-scale-x-100">
              <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
            </svg>
            {t.aboutBack}
          </button>
          <span className="hidden font-display text-[10px] text-fern sm:inline">{t.aboutKicker}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-12 md:px-8">
        <p className="text-center font-display text-[10px] text-amber md:text-[11px]">{t.aboutKicker}</p>
        <h1 className="mt-3 text-center font-title text-5xl leading-tight text-lime title-glow md:text-6xl">
          {t.aboutTitle}
        </h1>

        <div className="panel clip-pixel mt-10 p-6 md:p-8" style={{ borderColor: "#6b5320" }}>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="clip-pixel-sm border-2 border-[#6b5320] bg-shell2 p-3">
                <MakerAvatar />
              </div>
              <span className="clip-pixel-sm bg-amber px-3 py-1.5 font-display text-[11px] text-inkdeep">
                {lang === "fa" ? "۱۲ ساله" : "AGE 12"}
              </span>
            </div>

            <div className="flex w-full flex-col items-center gap-4 text-center md:items-start md:text-start">
              <span className="clip-pixel-sm border border-teal/50 px-3 py-1.5 font-display text-[10px] text-teal">
                {t.makerKicker}
              </span>
              <div>
                <p className="font-title text-3xl leading-snug text-fog md:text-4xl">{t.makerLine1}</p>
                <p className="mt-3 text-[15px] leading-7 text-mint md:text-base">{t.makerLine2}</p>
              </div>

              <div className="mt-2 flex flex-col items-center gap-3.5 md:items-start">
                <a
                  href="tel:00971551544988"
                  className="clip-pixel-sm flex items-center gap-2.5 bg-amber px-6 py-4 font-display text-[13px] text-inkdeep glow-amber transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:brightness-95 cursor-pointer"
                >
                  <PhoneIcon />
                  {t.makerContact}
                </a>
                <a
                  href="tel:00971551544988"
                  dir="ltr"
                  className="font-display text-base text-amber transition-colors hover:text-lime md:text-lg"
                >
                  {t.makerPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="font-display text-[10px] text-fern">
            {t.helpEsc}
            <span className="blink-cursor ms-1.5 inline-block h-3 w-2 translate-y-px bg-amber" />
          </p>
          <button
            type="button"
            onClick={onClose}
            className="clip-pixel-sm flex items-center gap-2.5 bg-btn px-7 py-4 font-display text-[13px] text-inkdeep glow-lime transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 cursor-pointer"
          >
            {t.aboutBack}
          </button>
        </div>
      </div>
    </div>
  );
}
