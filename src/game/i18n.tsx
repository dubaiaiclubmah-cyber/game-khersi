import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DiffKey } from "./engine";

export type Lang = "en" | "fa";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export interface Dict {
  brand: string;
  tagline: string;
  langLabel: string;
  ticker: string[];
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
  selectSpeed: string;
  diffNote: string;
  diffChill: string;
  diffClassic: string;
  diffBlazing: string;
  diffChillTag: string;
  diffClassicTag: string;
  diffBlazingTag: string;
  scoreboard: string;
  fame: string;
  fameNote: string;
  controls: string;
  helpSteer: string;
  helpWasd: string;
  helpPause: string;
  helpEnter: string;
  helpRestart: string;
  helpMute: string;
  swipeHint: string;
  steer: string;
  pauseWord: string;
  restartWord: string;
  muteWord: string;
  mute: string;
  unmute: string;
  footerLeft: string;
  footerRight: string;
  footerAbout: string;
  playPause: string;
  dirUp: string;
  dirDown: string;
  dirLeft: string;
  dirRight: string;
  /* status bar */
  st_menu: string;
  st_playing: string;
  st_paused: string;
  st_over: string;
  /* overlays */
  menuTitle: string;
  menuCopy: string;
  menuBtn: string;
  menuHintKey: string;
  menuHintTouch: string;
  pausedTitle: string;
  pausedCopy: string;
  resumeBtn: string;
  pauseHintKey: string;
  pauseHintTouch: string;
  overWin: string;
  overLose: string;
  newRecord: string;
  finalScore: string;
  playAgain: string;
  overHintKey: string;
  overHintTouch: string;
  /* header */
  helpBtn: string;
  aboutBtn: string;
  helpBack: string;
  aboutBack: string;
  /* help page */
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
  helpEsc: string;
  /* about page */
  makerKicker: string;
  makerLine1: string;
  makerLine2: string;
  makerContact: string;
  makerPhone: string;
  /* medals & history */
  historyTitle: string;
  medalsTitle: string;
  medalsNote: string;
  unlockToast: string;
  m1n: string;
  m1d: string;
  m2n: string;
  m2d: string;
  m3n: string;
  m3d: string;
  m4n: string;
  m4d: string;
  m5n: string;
  m5d: string;
  m6n: string;
  m6d: string;
  m7n: string;
  m7d: string;
  m8n: string;
  m8d: string;
  m9n: string;
  m9d: string;
  m10n: string;
  m10d: string;
}

export const DIFF_LABEL: Record<DiffKey, keyof Dict> = {
  chill: "diffChill",
  classic: "diffClassic",
  blazing: "diffBlazing",
};

export const DIFF_TAG: Record<DiffKey, keyof Dict> = {
  chill: "diffChillTag",
  classic: "diffClassicTag",
  blazing: "diffBlazingTag",
};

const EN: Dict = {
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
    "GOLDEN STAR = 50× TIER",
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
  selectSpeed: "SELECT SPEED",
  diffNote: "Switching resets the board — your records are kept per tier.",
  diffChill: "CHILL",
  diffClassic: "CLASSIC",
  diffBlazing: "BLAZING",
  diffChillTag: "Slow cruise · ×1 points",
  diffClassicTag: "The 1997 Nokia pace · ×2",
  diffBlazingTag: "Full chaos · ×3 points",
  scoreboard: "SCOREBOARD",
  fame: "HALL OF FAME",
  fameNote: "Records live in this browser. Set a mark, then defend it.",
  controls: "CONTROLS",
  helpSteer: "steer the serpent",
  helpWasd: "also steers",
  helpPause: "pause / resume",
  helpEnter: "start / restart",
  helpRestart: "instant restart",
  helpMute: "mute the cabinet",
  swipeHint: "SWIPE ON THE BOARD — OR USE THE PAD",
  steer: "STEER",
  pauseWord: "PAUSE",
  restartWord: "RESTART",
  muteWord: "MUTE",
  mute: "Mute",
  unmute: "Unmute",
  footerLeft: "SERPENT v1.1 · 21×21 PIT",
  footerRight: "EAT · GROW · SURVIVE",
  footerAbout: "THE MAKER",
  playPause: "Play / pause",
  dirUp: "Up",
  dirDown: "Down",
  dirLeft: "Left",
  dirRight: "Right",
  st_menu: "READY",
  st_playing: "LIVE",
  st_paused: "HOLD",
  st_over: "DOWN",
  menuTitle: "READY, PLAYER?",
  menuCopy:
    "Eat apples. Grow long. The walls — and your own tail — are fatal. Speed climbs with every bite, and every fifth apple summons a golden star.",
  menuBtn: "INSERT COIN",
  menuHintKey: "SPACE · ENTER · ANY ARROW",
  menuHintTouch: "TAP OR SWIPE TO LAUNCH",
  pausedTitle: "PAUSED",
  pausedCopy: "The serpent waits… score {score} · length {len}",
  resumeBtn: "RESUME",
  pauseHintKey: "SPACE TO RESUME",
  pauseHintTouch: "TAP THE BOARD TO CONTINUE",
  overWin: "BOARD CLEARED!",
  overLose: "GAME OVER",
  newRecord: "NEW RECORD",
  finalScore: "FINAL SCORE",
  playAgain: "PLAY AGAIN",
  overHintKey: "PRESS ENTER",
  overHintTouch: "TAP TO RUN IT BACK",
  helpBtn: "HELP",
  aboutBtn: "THE MAKER",
  helpBack: "BACK TO THE GAME",
  aboutBack: "BACK TO THE GAME",
  helpKicker: "THE FIELD MANUAL",
  helpTitle: "How to Play SERPENT",
  helpIntro:
    "Everything you need: what the game does, how it plays, where the scores go, and where every setting lives.",
  s1Title: "What does this game do?",
  s1Body:
    "SERPENT is a modern take on the classic snake game. You steer a hungry serpent around a 21×21 pit, eating apples to grow longer and score points. Every bite makes it faster. Hit a wall — or your own tail — and the run is over. It runs entirely in your browser, on desktop and mobile, with keyboard and touch controls.",
  s2Title: "How it plays",
  s2Items: [
    "The serpent moves on its own — you only choose the direction.",
    "Eat apples to grow. Longer means more points — and less room.",
    "You cannot reverse straight into your own neck.",
    "Turning twice quickly queues both turns, so corners feel crisp.",
    "Speed rises with every apple; the tempo meter shows your level.",
  ],
  helpKeysTitle: "KEYBOARD",
  helpTouchTitle: "TOUCH",
  helpTouch1: "Swipe anywhere on the board to steer — chain swipes for corners.",
  helpTouch2: "Tap the board to start, or to resume after a pause.",
  helpTouch3: "Or use the on-screen pad; its center key pauses and plays.",
  s3Title: "The goal",
  s3Body:
    "Survive as long as you can and push your score higher than your personal best on each speed tier. The legendary ending — filling the entire board — has never been witnessed. Will you be the first?",
  s4Title: "Scores & outputs",
  s4Body:
    "Every apple pays 10 points, multiplied by the tier you chose — CHILL ×1, CLASSIC ×2, BLAZING ×3. The more you eat, the faster it gets. And every 5th apple summons a golden star — grab it before it fades for 50× the tier, pure bonus.",
  s4Formula: "PER APPLE",
  s4Times: "TIER",
  s4Result: "POINTS",
  s4Save:
    "At the end of every run you get four outputs: final score, serpent length, apples eaten, and top tempo level. Records are saved per tier, in this browser, and survive reloads.",
  s5Title: "Where are the settings?",
  s5n1: "SPEED TIER",
  s5w1: "Left panel on desktop · strip under the board on mobile",
  s5n2: "LANGUAGE",
  s5w2: "The EN | فا switch at the top — everything re-renders instantly, right-to-left included",
  s5n3: "SOUND",
  s5w3: "The speaker icon at the top — press M any time to mute",
  s5n4: "RECORDS",
  s5w4: "Hall of Fame panel · saved automatically in your browser",
  helpEsc: "PRESS ESC TO RETURN TO THE PIT",
  makerKicker: "THE MAKER",
  makerLine1: "Built by Aref — a 12-year-old creator.",
  makerLine2:
    "Aref is one of the students of Dr. Mahmonir Aghaei. This cabinet is his project: designed, tuned, and shipped by a young developer.",
  makerContact: "CALL THE MENTOR",
  makerPhone: "00971 55 154 4988",
  historyTitle: "LAST RUNS",
  medalsTitle: "MEDALS",
  medalsNote: "Medals are earned across runs and kept in this browser.",
  unlockToast: "NEW MEDAL: {name}",
  m1n: "First Bite",
  m1d: "Eat your first apple",
  m2n: "Fruit Fan",
  m2d: "Eat 25 apples in total",
  m3n: "Apple Hoarder",
  m3d: "Eat 100 apples in total",
  m4n: "Century",
  m4d: "Score 100+ in one run",
  m5n: "Treasure Pit",
  m5d: "Score 300+ in one run",
  m6n: "Overdrive",
  m6d: "Reach tempo level 5",
  m7n: "Marathon",
  m7d: "Stay alive 90 seconds in one run",
  m8n: "Star Catcher",
  m8d: "Catch a golden star",
  m9n: "Legend",
  m9d: "Clear the entire board",
  m10n: "Explorer",
  m10d: "Play all three speed tiers",
};

const FA: Dict = {
  brand: "مار",
  tagline: "کابین آرکید مار",
  langLabel: "زبان",
  ticker: [
    "سیب‌ها را بخور",
    "از دیوارها دوری کن",
    "دم خودت را گاز نگیر",
    "Space بازی را نگه می‌دارد",
    "در موبایل با سوایپ بران",
    "توفانی ×۳ امتیاز می‌دهد",
    "هر سیب سرعت را بیشتر می‌کند",
    "ستاره‌ی طلایی = ۵۰× ضریب",
    "کلید R شروع دوباره",
    "کلید M بی‌صدا",
  ],
  best: "رکورد",
  score: "امتیاز",
  lenShort: "طول",
  length: "طول",
  lengthWord: "طول",
  applesLabel: "سیب‌ها",
  appleOne: "سیب",
  applesMany: "سیب",
  tempo: "سرعت",
  lv: "سطح",
  selectSpeed: "انتخاب سرعت",
  diffNote: "با تغییر سطح، زمین از نو می‌شود — رکوردهایت برای هر سطح جدا می‌ماند.",
  diffChill: "آرام",
  diffClassic: "کلاسیک",
  diffBlazing: "توفانی",
  diffChillTag: "قدم‌زدن آرام · امتیاز ×۱",
  diffClassicTag: "همان سرعت نوکیای ۱۹۹۷ · ×۲",
  diffBlazingTag: "آشوب تمام‌عیار · امتیاز ×۳",
  scoreboard: "جدول امتیاز",
  fame: "تالار افتخار",
  fameNote: "رکوردها در همین مرورگر می‌مانند. رکورد بزن و بعد ازش دفاع کن.",
  controls: "کنترل‌ها",
  helpSteer: "هدایت مار",
  helpWasd: "این هم هدایت می‌کند",
  helpPause: "توقف / ادامه",
  helpEnter: "شروع / شروع دوباره",
  helpRestart: "شروع دوباره فوری",
  helpMute: "بی‌صدا کردن",
  swipeHint: "روی صفحه سوایپ کن — یا از پد استفاده کن",
  steer: "هدایت",
  pauseWord: "توقف",
  restartWord: "دوباره",
  muteWord: "صدا",
  mute: "بی‌صدا",
  unmute: "باصدا",
  footerLeft: "مار ن.۱٫۱ · زمین ۲۱×۲۱",
  footerRight: "بخور · بزرگ شو · زنده بمان",
  footerAbout: "سازنده",
  playPause: "پخش / توقف",
  dirUp: "بالا",
  dirDown: "پایین",
  dirLeft: "چپ",
  dirRight: "راست",
  st_menu: "آماده",
  st_playing: "زنده",
  st_paused: "نگهداشت",
  st_over: "باخت",
  menuTitle: "آماده‌ای، قهرمان؟",
  menuCopy:
    "سیب بخور و بزرگ شو. دیوارها و دم خودت کشنده‌اند. با هر گاز سرعت بیشتر می‌شود و هر پنجمین سیب یک ستاره‌ی طلایی احضار می‌کند.",
  menuBtn: "سکه بینداز",
  menuHintKey: "Space · Enter · هر جهت‌نما",
  menuHintTouch: "ضربه بزن یا سوایپ کن",
  pausedTitle: "توقف",
  pausedCopy: "مار منتظر است… امتیاز {score} · طول {len}",
  resumeBtn: "ادامه",
  pauseHintKey: "Space برای ادامه",
  pauseHintTouch: "برای ادامه ضربه بزن",
  overWin: "زمین پاک شد!",
  overLose: "باختی!",
  newRecord: "رکورد جدید",
  finalScore: "امتیاز نهایی",
  playAgain: "دوباره بازی کن",
  overHintKey: "Enter را بزن",
  overHintTouch: "ضربه بزن تا دوباره بدوی",
  helpBtn: "راهنما",
  aboutBtn: "سازنده",
  helpBack: "بازگشت به بازی",
  aboutBack: "بازگشت به بازی",
  helpKicker: "دفترچه‌ی راهنما",
  helpTitle: "چطور مار بازی کنیم؟",
  helpIntro:
    "هر آنچه لازم داری: بازی چه می‌کند، چطور بازی می‌شود، امتیازها کجا می‌روند و هر تنظیم کجاست.",
  s1Title: "این بازی چه می‌کند؟",
  s1Body:
    "«مار» نسخه‌ی امروزی همان بازی نوستالژیک مار است. یک مار گرسنه را در زمینی ۲۱×۲۱ می‌رانی، سیب می‌خوری تا بزرگ‌تر شوی و امتیاز بگیری؛ با هر گاز سرعت بیشتر می‌شود. به دیوار یا دم خودت بخوری، بازی تمام است. همه‌چیز داخل مرورگر اجرا می‌شود — روی کامپیوتر و موبایل، با کیبورد و لمس.",
  s2Title: "چطور بازی می‌شود؟",
  s2Items: [
    "مار خودش حرکت می‌کند — تو فقط جهت را انتخاب می‌کنی.",
    "سیب بخور تا بزرگ شوی؛ بلندتر یعنی امتیاز بیشتر و جای کمتر.",
    "نمی‌توانی مستقیم به گردن خودت برگردی.",
    "دو فرمان پیاپی در صف می‌مانند تا گوشه‌ها نرم گرفته شوند.",
    "با هر سیب سرعت بالا می‌رود؛ نوار «سرعت» سطح را نشان می‌دهد.",
  ],
  helpKeysTitle: "کیبورد",
  helpTouchTitle: "لمسی",
  helpTouch1: "هر جای زمین سوایپ کن تا مار بپیچد — سوایپ‌های پیاپی برای گوشه‌ها.",
  helpTouch2: "برای شروع ضربه بزن؛ بعد از توقف هم با ضربه ادامه بده.",
  helpTouch3: "یا از پد روی صفحه استفاده کن؛ کلید وسطش توقف/پخش است.",
  s3Title: "هدف بازی",
  s3Body:
    "تا می‌توانی زنده بمان و امتیازت را در هر سطح سرعت از رکورد خودت بالاتر ببر. پایان افسانه‌ای — پر کردن کل زمین — هنوز هیچ‌کس ندیده؛ شاید تو اولین باشی.",
  s4Title: "امتیازها و خروجی‌ها",
  s4Body:
    "هر سیب ۱۰ امتیاز دارد، ضرب‌در ضریب سطحی که انتخاب کرده‌ای — آرام ×۱، کلاسیک ×۲، توفانی ×۳. هر چه بیشتر بخوری، سرعت بیشتر می‌شود. و هر پنجمین سیب یک ستاره‌ی طلایی احضار می‌کند — قبل از محو شدن بگیرش: ۵۰× ضریب، امتیاز خالص!",
  s4Formula: "هر سیب",
  s4Times: "ضریب سطح",
  s4Result: "امتیاز",
  s4Save:
    "پایان هر بازی چهار خروجی داری: امتیاز نهایی، طول مار، سیب‌های خورده‌شده و بالاترین سطح سرعت. رکوردها برای هر سطح جدا، در همین مرورگر، ذخیره می‌شوند و با رفرش پاک نمی‌شوند.",
  s5Title: "تنظیمات کجاست؟",
  s5n1: "سطح سرعت",
  s5w1: "پنل سمت راست دسکتاپ · نوار زیر زمین در موبایل",
  s5n2: "زبان",
  s5w2: "کلید EN | فا بالای صفحه — همه‌چیز همان لحظه عوض می‌شود، راست‌چین هم هست",
  s5n3: "صدا",
  s5w3: "آیکون بلندگوی بالای صفحه — هر وقت خواستی M را بزن",
  s5n4: "رکوردها",
  s5w4: "پنل تالار افتخار · خودکار در مرورگرت ذخیره می‌شود",
  helpEsc: "برای بازگشت به زمین بازی، ESC را بزن",
  makerKicker: "سازنده",
  makerLine1: "ساخته‌ی عارف — سازنده‌ی ۱۲ ساله.",
  makerLine2:
    "عارف از شاگردان خانم دکتر ماه منیر آقایی است. این کابین پروژه‌ی اوست: طراحی، تنظیم و ساخت، همه زیر دست یک توسعه‌دهنده‌ی نوجوان.",
  makerContact: "تماس با استاد",
  makerPhone: "۰۰۹۷۱۵۵۱۵۴۴۹۸۸",
  historyTitle: "بازی‌های اخیر",
  medalsTitle: "مدال‌ها",
  medalsNote: "مدال‌ها در طول بازی‌ها کسب می‌شوند و در همین مرورگر می‌مانند.",
  unlockToast: "مدال جدید: {name}",
  m1n: "اولین گاز",
  m1d: "اولین سیب را بخور",
  m2n: "میوه‌خور",
  m2d: "در مجموع ۲۵ سیب بخور",
  m3n: "انباردار سیب",
  m3d: "در مجموع ۱۰۰ سیب بخور",
  m4n: "صدتایی",
  m4d: "در یک بازی ۱۰۰ امتیاز یا بیشتر بگیر",
  m5n: "گنجِ زمین",
  m5d: "در یک بازی ۳۰۰ امتیاز یا بیشتر بگیر",
  m6n: "دور تند",
  m6d: "به سطح سرعت ۵ برس",
  m7n: "ماراتن",
  m7d: "در یک بازی ۹۰ ثانیه زنده بمان",
  m8n: "شکارچی ستاره",
  m8d: "یک ستاره‌ی طلایی بگیر",
  m9n: "افسانه",
  m9d: "کل زمین را پاک کن",
  m10n: "جهانگرد",
  m10d: "هر سه سطح سرعت را بازی کن",
};

const DICTS: Record<Lang, Dict> = { en: EN, fa: FA };

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  fa: boolean;
  fmt: (n: number | string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

const LANG_KEY = "serpent.lang";

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "fa" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  try {
    if (navigator.language && navigator.language.toLowerCase().startsWith("fa")) return "fa";
  } catch {
    /* ignore */
  }
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

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
    document.title = lang === "fa" ? "مار · بازی آرکید مار" : "SERPENT · Arcade Snake";
  }, [lang]);

  const t = DICTS[lang];

  const fmt = useCallback(
    (n: number | string) => {
      if (lang === "en") return String(n);
      return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, fa: lang === "fa", fmt }),
    [lang, setLang, t, fmt]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used inside LangProvider");
  return v;
}
