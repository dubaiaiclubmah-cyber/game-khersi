import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLang } from "../game/i18n";

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

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.9 5.9l1.5-2L21 14.4v3A3.6 3.6 0 0 1 17.4 21 14.4 14.4 0 0 1 3 6.6 3.6 3.6 0 0 1 6.6 3z" />
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110c]" role="dialog" aria-modal="true">
      {/* ambient layers */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(900px 560px at 50% -6%, #241d0d 0%, rgba(36,29,13,0) 60%), #06110c",
          }}
        />
        <div
          className="absolute -right-40 top-1/4 h-[44vmax] w-[44vmax] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,201,77,0.11) 0%, rgba(255,201,77,0) 62%)",
            animation: "drift-b 19s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -left-44 bottom-0 h-[40vmax] w-[40vmax] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(184,240,77,0.09) 0%, rgba(184,240,77,0) 60%)",
            animation: "drift-a 23s ease-in-out infinite",
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
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3 md:px-8">
          <button
            ref={backRef}
            type="button"
            onClick={onClose}
            className="clip-pixel-sm flex items-center gap-2 border border-hedge bg-[#0e2118] px-3 py-2.5 font-display text-[8px] text-teal transition-all duration-150 hover:-translate-y-0.5 hover:text-fog active:translate-y-0 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:-scale-x-100">
              <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
            </svg>
            {t.aboutBack}
          </button>
          <span className="font-display text-[8px] tracking-[0.24em] text-fern">{t.makerKicker}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-12 md:px-8">
        <Reveal>
          <p className="font-display text-[8px] tracking-[0.3em] text-amber md:text-[9px]">
            {t.makerKicker}
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <section
            className="panel clip-pixel relative p-6 md:p-9"
            style={{ borderColor: "#6b5320" }}
          >
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
                  <p className="font-title text-3xl leading-snug text-fog md:text-4xl">{t.makerLine1}</p>
                  <p className="mt-3 text-sm leading-7 text-mint md:text-[15px]">{t.makerLine2}</p>
                </div>

                <div className="mt-3 flex flex-col items-center gap-3 md:items-start">
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
          </section>
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-center gap-4">
          <p className="font-display text-[7px] tracking-[0.26em] text-fern">
            {t.helpEsc}
            <span className="blink-cursor ms-1.5 inline-block h-2.5 w-1.5 translate-y-px bg-amber" />
          </p>
          <button
            type="button"
            onClick={onClose}
            className="clip-pixel-sm bg-lime px-7 py-3.5 font-display text-[10px] text-[#0a1712] shadow-[0_0_28px_rgba(184,240,77,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 cursor-pointer"
          >
            {t.aboutBack}
          </button>
        </Reveal>
      </div>
    </div>
  );
}
