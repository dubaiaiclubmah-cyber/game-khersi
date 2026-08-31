import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { DiffKey } from "./engine";

export type Lang = "en" | "fa";

const LANG_KEY = "serpent.lang";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toFaDigits = (s: string) => s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);

/* ---------------- dictionaries ---------------- */

const en = {
  brand: "SERPENT",
  tagline: "ARCADE SNAKE CABINET",
  langLabel: "Language",
  mute: "Mute",
  unmute: "Unmute",

  steer: "STEER",
  pauseWord: "PAUSE",
  restartWord: "RESTART",
  muteWord: "MUTE",
  swipeHint: "SWIPE ON THE BOARD — OR USE THE PAD",

  footerLeft: "SERPENT v1.0 · 21×21 PIT",
  footerRight: "EAT · GROW · SURVIVE",

  ticker: [
    "EAT THE APPLES",
    "AVOID THE WALLS",
    "DON'T BITE YOURSELF",
    "SPACE PAUSES",
    "SWIPE TO STEER ON MOBILE",
    "BLAZING PAYS ×3",
    "EVERY APPLE RAISES THE TEMPO",
    "R RESTARTS INSTANTLY",
    "M MUTES THE CABINET",
  ],

  st_menu: "READY",
  st_playing: "LIVE",
  st_paused: "HOLD",
  st_over: "DOWN",
  lenShort: "LEN",

  score: "SCORE",
  best: "BEST",

  menuTitle: "READY, PLAYER?",
  menuCopy:
    "Eat apples. Grow long. The walls — and your own tail — are fatal. Speed climbs with every bite.",
  menuBtn: "INSERT COIN",
  menuHintTouch: "TAP OR SWIPE TO LAUNCH",
  menuHintKey: "SPACE · ENTER · ANY ARROW",

  pausedTitle: "PAUSED",
  pausedCopy: "The serpent waits… score {score} · length {len}",
  resumeBtn: "RESUME",
  pauseHintTouch: "TAP THE BOARD TO CONTINUE",
  pauseHintKey: "SPACE TO RESUME",

  overWin: "BOARD CLEARED!",
  overLose: "GAME OVER",
  newRecord: "NEW RECORD",
  finalScore: "FINAL SCORE",
  playAgain: "PLAY AGAIN",
  overHintTouch: "TAP TO RUN IT BACK",
  overHintKey: "PRESS ENTER",
  appleOne: "apple",
  applesMany: "apples",
  lengthWord: "length",

  selectSpeed: "SELECT SPEED",
  diffNote: "Switching resets the board — your records are kept per tier.",
  diffChill: "CHILL",
  diffClassic: "CLASSIC",
  diffBlazing: "BLAZING",
  tagChill: "Slow cruise · ×1 points",
  tagClassic: "The 1997 Nokia pace · ×2",
  tagBlazing: "Full chaos · ×3 points",

  controls: "CONTROLS",
  helpSteer: "steer the serpent",
  helpWasd: "also steers",
  helpPause: "pause / resume",
  helpEnter: "start / restart",
  helpRestart: "instant restart",
  helpMute: "mute the cabinet",

  scoreboard: "SCOREBOARD",
  length: "LENGTH",
  applesLabel: "APPLES",
  tempo: "TEMPO",
  lv: "LV",

  fame: "HALL OF FAME",
  fameNote: "Records live in this browser. Set a mark, then defend it.",

  dirUp: "Up",
  dirDown: "Down",
  dirLeft: "Left",
  dirRight: "Right",
  playPause: "Pause or play",
};

export type Dict = typeof en;

const fa: Dict = {
  brand: "مار",
  tagline: "کابین آرکید مار",
  langLabel: "زبان",
  mute: "بی‌صدا کردن",
  unmute: "باصدا کردن",

  steer: "حرکت",
  pauseWord: "توقف",
  restartWord: "شروع دوباره",
  muteWord: "بی‌صدا",
  swipeHint: "روی صفحه بکش یا از دکمه‌ها استفاده کن",

  footerLeft: "نسخه ۱٫۰ · زمین ۲۱×۲۱",
  footerRight: "بخور · بزرگ شو · زنده بمان",

  ticker: [
    "سیب‌ها را بخور",
    "به دیوارها نخور",
    "دُم خودت را گاز نگیر",
    "با Space توقف کن",
    "در موبایل با کشیدن انگشت حرکت کن",
    "سطح سوزان ۳ برابر امتیاز می‌دهد",
    "با هر سیب، سرعت بیشتر می‌شود",
    "با R از اول شروع کن",
    "با M صدا را قطع کن",
  ],

  st_menu: "آماده",
  st_playing: "زنده",
  st_paused: "توقف",
  st_over: "باخت",
  lenShort: "طول",

  score: "امتیاز",
  best: "رکورد",

  menuTitle: "آماده‌ای، قهرمان؟",
  menuCopy:
    "سیب بخور و بزرگ شو. دیوارها و دُم خودت کشنده‌اند؛ با هر لقمه سرعت بیشتر می‌شود.",
  menuBtn: "شروع بازی",
  menuHintTouch: "برای شروع بزن یا بکش",
  menuHintKey: "SPACE · ENTER · جهت‌نما",

  pausedTitle: "توقف",
  pausedCopy: "مار منتظر است… امتیاز {score} · طول {len}",
  resumeBtn: "ادامه",
  pauseHintTouch: "برای ادامه روی صفحه بزن",
  pauseHintKey: "SPACE برای ادامه",

  overWin: "صفحه را پاک کردی!",
  overLose: "باختی!",
  newRecord: "رکورد جدید",
  finalScore: "امتیاز نهایی",
  playAgain: "دوباره بازی",
  overHintTouch: "برای بازی دوباره بزن",
  overHintKey: "ENTER بزن",
  appleOne: "سیب",
  applesMany: "سیب",
  lengthWord: "طول",

  selectSpeed: "انتخاب سرعت",
  diffNote: "تغییر سطح، زمین را از نو می‌کند؛ رکوردها برای هر سطح جدا ذخیره می‌شوند.",
  diffChill: "آرام",
  diffClassic: "کلاسیک",
  diffBlazing: "سوزان",
  tagChill: "قدم‌روی آرام · امتیاز ×۱",
  tagClassic: "ریتم نوکیا ۱۹۹۷ · ×۲",
  tagBlazing: "آشوب تمام‌عیار · ×۳",

  controls: "کنترل‌ها",
  helpSteer: "هدایت مار",
  helpWasd: "این هم هدایت می‌کند",
  helpPause: "توقف / ادامه",
  helpEnter: "شروع / شروع دوباره",
  helpRestart: "شروع دوباره فوری",
  helpMute: "قطع و وصل صدا",

  scoreboard: "جدول امتیاز",
  length: "طول مار",
  applesLabel: "سیب‌ها",
  tempo: "سرعت",
  lv: "سطح",

  fame: "تالار افتخار",
  fameNote: "رکوردها در همین مرورگر ذخیره می‌شوند؛ رکورد بزن و پایش بمان.",

  dirUp: "بالا",
  dirDown: "پایین",
  dirLeft: "چپ",
  dirRight: "راست",
  playPause: "توقف یا شروع",
};

const DICTS: Record<Lang, Dict> = { en, fa };

/* difficulty label / tag lookups (labels are translated, data stays in engine) */
export const DIFF_LABEL: Record<DiffKey, keyof Dict> = {
  chill: "diffChill",
  classic: "diffClassic",
  blazing: "diffBlazing",
};
export const DIFF_TAG: Record<DiffKey, keyof Dict> = {
  chill: "tagChill",
  classic: "tagClassic",
  blazing: "tagBlazing",
};

/* ---------------- context ---------------- */

interface LangAPI {
  lang: Lang;
  fa: boolean;
  setLang: (l: Lang) => void;
  t: Dict;
  fmt: (n: number | string) => string;
}

const LangCtx = createContext<LangAPI | null>(null);

function initialLang(): Lang {
  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === "fa" || s === "en") return s;
    if (
      typeof navigator !== "undefined" &&
      navigator.language &&
      navigator.language.toLowerCase().startsWith("fa")
    ) {
      return "fa";
    }
  } catch {
    /* private mode */
  }
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "fa" ? "rtl" : "ltr";
    document.title =
      lang === "fa" ? "مار · بازی آرکید مار" : "SERPENT · Arcade Snake";
  }, [lang]);

  const fmt = useCallback(
    (n: number | string) => (lang === "fa" ? toFaDigits(String(n)) : String(n)),
    [lang]
  );

  const value = useMemo<LangAPI>(
    () => ({ lang, fa: lang === "fa", setLang, t: DICTS[lang], fmt }),
    [lang, setLang, fmt]
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang(): LangAPI {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
