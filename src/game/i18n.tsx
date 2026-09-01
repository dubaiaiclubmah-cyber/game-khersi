import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DiffKey } from "./engine";

export type Lang = "en" | "fa";

export interface Dict {
  /* brand */
  brand: string;
  tagline: string;
  langLabel: string;
  ticker: string[];
  /* hud / labels */
  best: string;
  score: string;
  lenShort: string;
  length: string;
  lengthWord: string;
  applesLabel: string;
  appleOne: string;
  applesMany: string;
  tempo: string;
  lv: string;
  controls: string;
  scoreboard: string;
  fame: string;
  selectSpeed: string;
  diffNote: string;
  fameNote: string;
  unmute: string;
  mute: string;
  steer: string;
  pauseWord: string;
  restartWord: string;
  muteWord: string;
  footerLeft: string;
  footerRight: string;
  swipeHint: string;
  /* status */
  st_menu: string;
  st_playing: string;
  st_paused: string;
  st_over: string;
  /* overlays */
  menuTitle: string;
  menuCopy: string;
  menuBtn: string;
  menuHintTouch: string;
  menuHintKey: string;
  pausedTitle: string;
  pausedCopy: string;
  resumeBtn: string;
  pauseHintTouch: string;
  pauseHintKey: string;
  overWin: string;
  overLose: string;
  newRecord: string;
  finalScore: string;
  playAgain: string;
  overHintTouch: string;
  overHintKey: string;
  /* touchpad */
  dirUp: string;
  dirDown: string;
  dirLeft: string;
  dirRight: string;
  playPause: string;
  /* desktop help rows */
  helpSteer: string;
  helpWasd: string;
  helpPause: string;
  helpEnter: string;
  helpRestart: string;
  helpMute: string;
  /* difficulties */
  diffChill: string;
  diffClassic: string;
  diffBlazing: string;
  tagChill: string;
  tagClassic: string;
  tagBlazing: string;
  /* help page */
  helpBtn: string;
  helpBack: string;
  aboutBtn: string;
  aboutBack: string;
  helpKicker: string;
  helpTitle: string;
  helpIntro: string;
  s1Title: string;
  s1Body: string;
  s2Title: string;
  s2Items: string[];
  helpKeysTitle: string;
  helpTouchTitle: string;
  helpTouch1: string;
  helpTouch2: string;
  helpTouch3: string;
  s3Title: string;
  s3Body: string;
  s4Title: string;
  s4Body: string;
  s4Formula: string;
  s4Times: string;
  s4Result: string;
  outFinal: string;
  outLen: string;
  outApples: string;
  outTempo: string;
  s4Save: string;
  s5Title: string;
  s5n1: string;
  s5w1: string;
  s5n2: string;
  s5w2: string;
  s5n3: string;
  s5w3: string;
  s5n4: string;
  s5w4: string;
  s6Title: string;
  makerKicker: string;
  makerLine1: string;
  makerLine2: string;
  makerContact: string;
  makerPhone: string;
  helpEsc: string;
  footerAbout: string;
}

export const DIFF_LABEL: Record<DiffKey, "diffChill" | "diffClassic" | "diffBlazing"> = {
  chill: "diffChill",
  classic: "diffClassic",
  blazing: "diffBlazing",
};

export const DIFF_TAG: Record<DiffKey, "tagChill" | "tagClassic" | "tagBlazing"> = {
  chill: "tagChill",
  classic: "tagClassic",
  blazing: "tagBlazing",
};

const en: Dict = {
  brand: "SERPENT",
  tagline: "ARCADE SNAKE CABINET",
  langLabel: "Language",
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
  best: "BEST",
  score: "SCORE",
  lenShort: "LEN",
  length: "LENGTH",
  lengthWord: "length",
  applesLabel: "APPLES",
  appleOne: "apple",
  applesMany: "apples",
  tempo: "TEMPO",
  lv: "LV",
  controls: "CONTROLS",
  scoreboard: "SCOREBOARD",
  fame: "HALL OF FAME",
  selectSpeed: "SELECT SPEED",
  diffNote: "Switching resets the board — your records are kept per tier.",
  fameNote: "Records live in this browser. Set a mark, then defend it.",
  unmute: "Unmute",
  mute: "Mute",
  steer: "STEER",
  pauseWord: "PAUSE",
  restartWord: "RESTART",
  muteWord: "MUTE",
  footerLeft: "SERPENT v1.0 · 21×21 PIT",
  footerRight: "EAT · GROW · SURVIVE",
  swipeHint: "SWIPE ON THE BOARD — OR USE THE PAD",
  st_menu: "READY",
  st_playing: "LIVE",
  st_paused: "HOLD",
  st_over: "DOWN",
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
  dirUp: "Up",
  dirDown: "Down",
  dirLeft: "Left",
  dirRight: "Right",
  playPause: "Play / Pause",
  helpSteer: "steer the serpent",
  helpWasd: "also steers",
  helpPause: "pause / resume",
  helpEnter: "start / restart",
  helpRestart: "instant restart",
  helpMute: "mute the cabinet",
  diffChill: "CHILL",
  diffClassic: "CLASSIC",
  diffBlazing: "BLAZING",
  tagChill: "Slow cruise · ×1 points",
  tagClassic: "The 1997 Nokia pace · ×2",
  tagBlazing: "Full chaos · ×3 points",
  /* help page */
  helpBtn: "HELP",
  helpBack: "BACK TO THE GAME",
  aboutBtn: "CREATOR",
  aboutBack: "BACK TO THE GAME",
  helpKicker: "THE FIELD MANUAL",
  helpTitle: "HOW TO PLAY",
  helpIntro:
    "Everything a player needs to know about SERPENT — what the game does, how it plays, what its goal is, what it outputs, where the settings live, and who built it.",
  s1Title: "WHAT DOES THE GAME DO?",
  s1Body:
    "SERPENT is a modern arcade remake of the classic snake game. You steer a hungry serpent around a glowing 21×21 pit, eating apples to grow longer while the pace keeps climbing. It runs in any browser on desktop and mobile — with keyboard, swipe and on-screen pad controls, three speed tiers, chiptune sound and records that never leave your device.",
  s2Title: "HOW IT PLAYS",
  s2Items: [
    "Steer with the arrow keys or WASD — on mobile, swipe across the board.",
    "Eat apples to grow longer and score points.",
    "The walls are fatal — and so is your own tail. One touch and the run ends.",
    "Every apple raises the tempo: the longer you live, the faster the pit gets.",
    "Turns are queued, so you can chain rapid moves for tight maneuvers.",
  ],
  helpKeysTitle: "KEYBOARD",
  helpTouchTitle: "TOUCH & MOBILE",
  helpTouch1: "Swipe anywhere on the board to steer — chain swipes for rapid turns.",
  helpTouch2: "Tap the board to start, and tap again to resume after a pause.",
  helpTouch3: "The on-screen pad mirrors the arrow keys; its center button starts or pauses.",
  s3Title: "THE GOAL",
  s3Body:
    "Survive and grow. Every apple adds to your score and to your length — aim for the highest mark on your chosen tier, then defend it. Fill the whole 21×21 pit with your serpent and you trigger the legendary BOARD CLEARED ending.",
  s4Title: "SCORES & OUTPUTS",
  s4Body: "Each apple is worth 10 points, multiplied by the tier you play on.",
  s4Formula: "EACH APPLE",
  s4Times: "TIER MULTIPLIER",
  s4Result: "PER APPLE",
  outFinal: "FINAL SCORE",
  outLen: "LENGTH",
  outApples: "APPLES",
  outTempo: "TEMPO",
  s4Save:
    "When a run ends, the board reports your final score, length and apples eaten. Best records are saved automatically — per tier, in this browser — and listed in the Hall of Fame. No account needed.",
  s5Title: "WHERE ARE THE SETTINGS?",
  s5n1: "SPEED TIER",
  s5w1: "Side panel on desktop · segmented strip under the board on mobile",
  s5n2: "LANGUAGE",
  s5w2: "The EN | فا button in the header — switches everything, instantly",
  s5n3: "SOUND",
  s5w3: "The speaker button in the header · or press M",
  s5n4: "RECORDS",
  s5w4: "Saved automatically in this browser, per tier — nothing leaves your device",
  s6Title: "THE MAKER",
  makerKicker: "BUILT BY A STUDENT",
  makerLine1: "Built by Aref — a 12-year-old maker",
  makerLine2: "Student of Dr. Mah Monir Aghaei",
  makerContact: "CALL THE TEACHER",
  makerPhone: "00971 55 154 4988",
  helpEsc: "PRESS ESC TO RETURN TO THE PIT",
  footerAbout: "THE MAKER",
};

const fa: Dict = {
  brand: "مار",
  tagline: "کابین آرکید مار",
  langLabel: "زبان",
  ticker: [
    "سیب‌ها را بخور",
    "از دیوارها دوری کن",
    "دم خودت را گاز نگیر",
    "SPACE بازی را متوقف می‌کند",
    "در موبایل با کشیدن انگشت هدایت کن",
    "سطح آتشین ×۳ امتیاز می‌دهد",
    "با هر سیب سرعت بیشتر می‌شود",
    "با R فوراً از نو شروع کن",
    "با M صدا را قطع کن",
  ],
  best: "رکورد",
  score: "امتیاز",
  lenShort: "طول",
  length: "طول مار",
  lengthWord: "طول",
  applesLabel: "سیب‌ها",
  appleOne: "سیب",
  applesMany: "سیب",
  tempo: "سرعت",
  lv: "سطح",
  controls: "کنترل‌ها",
  scoreboard: "جدول امتیاز",
  fame: "تالار افتخار",
  selectSpeed: "انتخاب سرعت",
  diffNote: "با تغییر سطح، زمین از نو شروع می‌شود — اما رکوردهایت برای هر سطح حفظ می‌شوند.",
  fameNote: "رکوردها در همین مرورگر ذخیره می‌شوند. رکورد بزن، بعد ازش دفاع کن!",
  unmute: "باصدا کردن",
  mute: "بی‌صدا کردن",
  steer: "هدایت",
  pauseWord: "توقف",
  restartWord: "شروع دوباره",
  muteWord: "بی‌صدا",
  footerLeft: "مار · زمین ۲۱×۲۱",
  footerRight: "بخور · بزرگ شو · زنده بمان",
  swipeHint: "روی زمین بکش — یا از پد استفاده کن",
  st_menu: "آماده",
  st_playing: "در حال بازی",
  st_paused: "توقف",
  st_over: "باخت",
  menuTitle: "آماده‌ای، قهرمان؟",
  menuCopy:
    "سیب بخور، بزرگ شو؛ اما مواظب باش! دیوارها و دمِ خودت کشنده‌اند و با هر لقمه، سرعت بیشتر می‌شود.",
  menuBtn: "شروع بازی",
  menuHintTouch: "ضربه بزن یا بکش تا شروع شود",
  menuHintKey: "SPACE · ENTER · جهت‌نماها",
  pausedTitle: "توقف",
  pausedCopy: "مار منتظر است… امتیاز {score} · طول {len}",
  resumeBtn: "ادامه",
  pauseHintTouch: "برای ادامه، روی زمین ضربه بزن",
  pauseHintKey: "برای ادامه، SPACE را بزن",
  overWin: "زمین پاک شد!",
  overLose: "باختی!",
  newRecord: "رکورد جدید",
  finalScore: "امتیاز نهایی",
  playAgain: "دوباره بازی کن",
  overHintTouch: "برای شروع دوباره ضربه بزن",
  overHintKey: "ENTER را بزن",
  dirUp: "بالا",
  dirDown: "پایین",
  dirLeft: "چپ",
  dirRight: "راست",
  playPause: "شروع / توقف",
  helpSteer: "هدایت مار",
  helpWasd: "این‌ها هم هدایت می‌کنند",
  helpPause: "توقف / ادامه",
  helpEnter: "شروع / شروع دوباره",
  helpRestart: "شروع فوری دوباره",
  helpMute: "بی‌صدا کردن",
  diffChill: "آرام",
  diffClassic: "کلاسیک",
  diffBlazing: "آتشین",
  tagChill: "سرعت ملایم · امتیاز ×۱",
  tagClassic: "سرعت نوکیای ۱۹۹۷ · ×۲",
  tagBlazing: "هیجان کامل · امتیاز ×۳",
  /* help page */
  helpBtn: "راهنما",
  helpBack: "بازگشت به بازی",
  aboutBtn: "درباره سازنده",
  aboutBack: "بازگشت به بازی",
  helpKicker: "دفترچه‌ی راهنما",
  helpTitle: "چطور بازی کنیم؟",
  helpIntro:
    "هر چیزی که یک بازیکن درباره‌ی «مار» باید بداند — این بازی چه کار می‌کند، چطور بازی می‌شود، هدفش چیست، خروجی‌هایش کدام‌اند، تنظیماتش کجاست و سازنده‌اش کیست.",
  s1Title: "این بازی چه کار می‌کند؟",
  s1Body:
    "«مار» یک بازسازی مدرن و آرکید از بازی نوستالژیک مار است. تو یک مار گرسنه را در زمین درخشان ۲۱×۲۱ هدایت می‌کنی؛ سیب می‌خوری تا بلندتر شوی، درحالی‌که سرعت بازی مدام بیشتر می‌شود. بازی در هر مرورگری اجرا می‌شود — هم روی کامپیوتر و هم موبایل؛ با صفحه‌کلید، کشیدن انگشت و پد لمسی، سه سطح سختی، صدای چیپ‌تیون و رکوردهایی که هرگز از دستگاه تو بیرون نمی‌روند.",
  s2Title: "روش بازی",
  s2Items: [
    "مار را با جهت‌نماها یا WASD هدایت کن — در موبایل، انگشتت را روی زمین بکش.",
    "سیب بخور تا مارت بلندتر شود و امتیاز بگیری.",
    "دیوارها کشنده‌اند — دمِ خودت هم همین‌طور؛ با یک برخورد، بازی تمام می‌شود.",
    "با هر سیب، سرعت بیشتر می‌شود: هرچه بیشتر زنده بمانی، زمین تندتر می‌شود.",
    "چرخش‌ها در صف ذخیره می‌شوند؛ پس می‌توانی چند حرکت را پشت‌سرهم و سریع وارد کنی.",
  ],
  helpKeysTitle: "صفحه‌کلید",
  helpTouchTitle: "لمسی و موبایل",
  helpTouch1: "هر جای زمین که انگشت بکشی، مار می‌پیچد — برای پیچ‌های تند، چند بار پشت‌هم بکش.",
  helpTouch2: "با یک ضربه روی زمین، بازی شروع می‌شود و بعد از توقف هم با ضربه ادامه می‌یابد.",
  helpTouch3: "پد روی صفحه نقش جهت‌نماها را دارد؛ دکمه‌ی وسطش بازی را شروع یا متوقف می‌کند.",
  s3Title: "هدف بازی",
  s3Body:
    "زنده بمان و رشد کن! هر سیب هم امتیاز می‌دهد و هم مارت را بلندتر می‌کند — روی سطح سختی دلخواهت بهترین رکورد را بزن و بعد از آن دفاع کن. اگر بتوانی کل زمین ۲۱×۲۱ را با مارت پر کنی، پایان افسانه‌ای «زمین پاک شد!» را می‌بینی.",
  s4Title: "امتیازها و خروجی‌ها",
  s4Body: "هر سیب ۱۰ امتیاز دارد که در ضریب سطح سختیِ انتخابی ضرب می‌شود.",
  s4Formula: "هر سیب",
  s4Times: "ضریب سطح",
  s4Result: "برای هر سیب",
  outFinal: "امتیاز نهایی",
  outLen: "طول مار",
  outApples: "سیب‌ها",
  outTempo: "سطح سرعت",
  s4Save:
    "در پایان هر بازی، زمین نتیجه را گزارش می‌دهد: امتیاز نهایی، طول مار و تعداد سیب‌های خورده‌شده. بهترین رکورد هر سطح به‌طور خودکار در همین مرورگر ذخیره می‌شود و در تالار افتخار قرار می‌گیرد — بدون نیاز به ثبت‌نام.",
  s5Title: "تنظیمات کجاست؟",
  s5n1: "سطح سختی",
  s5w1: "پنل کنار زمین در دسکتاپ · نوار سه‌گزینه‌ای زیر زمین در موبایل",
  s5n2: "زبان",
  s5w2: "دکمه‌ی EN | فا در بالای صفحه — همه‌چیز را فوراً عوض می‌کند",
  s5n3: "صدا",
  s5w3: "دکمه‌ی بلندگو در بالای صفحه · یا کلید M",
  s5n4: "رکوردها",
  s5w4: "به‌طور خودکار برای هر سطح در همین مرورگر ذخیره می‌شود — هیچ‌چیز از دستگاهت بیرون نمی‌رود",
  s6Title: "درباره‌ی سازنده",
  makerKicker: "ساخته‌ی یک دانش‌آموز",
  makerLine1: "ساخته‌ی عارف — سازنده‌ی ۱۲ ساله",
  makerLine2: "از شاگردان دکتر ماه‌منیر آقایی",
  makerContact: "تماس با استاد",
  makerPhone: "۰۰۹۷۱۵۵۱۵۴۴۹۸۸",
  helpEsc: "برای بازگشت به زمین بازی، ESC را بزن",
  footerAbout: "سازنده",
};

const DICTS: Record<Lang, Dict> = { en, fa };
const LANG_KEY = "serpent.lang";

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "fa" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  try {
    return navigator.language?.toLowerCase().startsWith("fa") ? "fa" : "en";
  } catch {
    return "en";
  }
}

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  fa: boolean;
  /** Format a number with the active locale's digits */
  fmt: (n: number | string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "fa" ? "rtl" : "ltr";
    document.title = lang === "fa" ? "مار · بازی آرکید" : "SERPENT · Arcade Snake";
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const fmt = useCallback(
    (n: number | string) =>
      new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(
        typeof n === "string" ? Number(n) || 0 : n
      ),
    [lang]
  );

  return (
    <Ctx.Provider value={{ lang, setLang, t: DICTS[lang], fa: lang === "fa", fmt }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used inside <LangProvider>");
  return v;
}
