import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DiffKey } from "./engine";

export type Lang = "en" | "fa";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toFa = (s: string) => s.replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

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

export interface Dict {
  brand: string; tagline: string; langLabel: string; ticker: string[];
  best: string; score: string; lenShort: string; length: string; lengthWord: string;
  applesLabel: string; appleOne: string; applesMany: string; starsWord: string;
  diffChill: string; diffClassic: string; diffBlazing: string;
  tagChill: string; tagClassic: string; tagBlazing: string;
  selectSpeed: string; diffNote: string; controls: string; scoreboard: string;
  tempo: string; lv: string; fame: string; fameNote: string; historyTitle: string;
  medalsTitle: string; medalsNote: string; unlockToast: string;
  mFirstBite: string; dFirstBite: string; mFruitEater: string; dFruitEater: string;
  mAppleHoarder: string; dAppleHoarder: string; mCenturion: string; dCenturion: string;
  mTreasure: string; dTreasure: string; mSpeedDemon: string; dSpeedDemon: string;
  mMarathoner: string; dMarathoner: string; mStarHunter: string; dStarHunter: string;
  mLegend: string; dLegend: string; mExplorer: string; dExplorer: string;
  st_menu: string; st_playing: string; st_paused: string; st_over: string;
  menuTitle: string; menuCopy: string; menuBtn: string; menuHintTouch: string; menuHintKey: string;
  pausedTitle: string; pausedCopy: string; resumeBtn: string; pauseHintTouch: string; pauseHintKey: string;
  overWin: string; overLose: string; newRecord: string; finalScore: string;
  playAgain: string; overHintTouch: string; overHintKey: string;
  steer: string; pauseWord: string; restartWord: string; muteWord: string; swipeHint: string;
  helpSteer: string; helpWasd: string; helpPause: string; helpEnter: string; helpRestart: string; helpMute: string;
  helpBtn: string; helpBack: string; helpKicker: string; helpTitle: string; helpIntro: string;
  s1Title: string; s1Body: string; s2Title: string; s2Items: string[];
  helpKeysTitle: string; helpTouchTitle: string; helpTouch1: string; helpTouch2: string; helpTouch3: string;
  s3Title: string; s3Body: string; s4Title: string; s4Body: string;
  s4Formula: string; s4Times: string; s4Result: string; s4Save: string;
  s5Title: string; s5n1: string; s5n2: string; s5n3: string; s5n4: string;
  s5w1: string; s5w2: string; s5w3: string; s5w4: string; helpEsc: string;
  aboutBtn: string; aboutBack: string; aboutKicker: string; aboutTitle: string;
  makerKicker: string; makerLine1: string; makerLine2: string; makerContact: string; makerPhone: string;
  footerLeft: string; footerRight: string; footerAbout: string;
  themeBtn: string; themeDark: string; themeLight: string;
  palForest: string; palOcean: string; palEmber: string; palNight: string;
  dirUp: string; dirDown: string; dirLeft: string; dirRight: string; playPause: string;
  mute: string; unmute: string;
}

const EN: Dict = {
  brand: "SERPENT", tagline: "ARCADE SNAKE CABINET", langLabel: "Language",
  ticker: ["EAT THE APPLES","GRAB THE GOLDEN STARS","AVOID THE WALLS","DON'T BITE YOURSELF","SPACE PAUSES","SWIPE TO STEER ON MOBILE","BLAZING PAYS ×3","EVERY APPLE RAISES THE TEMPO","R RESTARTS INSTANTLY","PICK YOUR PALETTE"],
  best: "BEST", score: "SCORE", lenShort: "LEN", length: "LENGTH", lengthWord: "length",
  applesLabel: "APPLES", appleOne: "apple", applesMany: "apples", starsWord: "STARS",
  diffChill: "CHILL", diffClassic: "CLASSIC", diffBlazing: "BLAZING",
  tagChill: "Slow cruise · ×1 points", tagClassic: "The 1997 Nokia pace · ×2", tagBlazing: "Full chaos · ×3 points",
  selectSpeed: "SELECT SPEED", diffNote: "Switching resets the board — your records are kept per tier.",
  controls: "CONTROLS", scoreboard: "SCOREBOARD", tempo: "TEMPO", lv: "LV",
  fame: "HALL OF FAME", fameNote: "Records live in this browser. Set a mark, then defend it.",
  historyTitle: "LAST RUNS", medalsTitle: "MEDALS",
  medalsNote: "Earned forever in this browser. Hover a medal for its secret.",
  unlockToast: "NEW MEDAL — {name}",
  mFirstBite: "FIRST BITE", dFirstBite: "Eat your first apple",
  mFruitEater: "FRUIT EATER", dFruitEater: "Eat 10 apples in one run",
  mAppleHoarder: "APPLE HOARDER", dAppleHoarder: "Eat 25 apples in one run",
  mCenturion: "CENTURION", dCenturion: "Score 100 in one run",
  mTreasure: "TREASURE OF THE PIT", dTreasure: "Score 300 in one run",
  mSpeedDemon: "SPEED DEMON", dSpeedDemon: "Reach tempo level 4",
  mMarathoner: "MARATHONER", dMarathoner: "Survive 2 minutes in one run",
  mStarHunter: "STAR HUNTER", dStarHunter: "Catch a golden star",
  mLegend: "LEGEND OF THE PIT", dLegend: "Reach a best score of 500",
  mExplorer: "EXPLORER", dExplorer: "Play 10 rounds",
  st_menu: "READY", st_playing: "LIVE", st_paused: "HOLD", st_over: "DOWN",
  menuTitle: "READY, PLAYER?",
  menuCopy: "Eat apples. Grow long. The walls — and your own tail — are fatal. Speed climbs with every bite. Golden stars pay big… if you're fast enough.",
  menuBtn: "INSERT COIN", menuHintTouch: "TAP OR SWIPE TO LAUNCH", menuHintKey: "SPACE · ENTER · ANY ARROW",
  pausedTitle: "PAUSED", pausedCopy: "The serpent waits… score {score} · length {len}",
  resumeBtn: "RESUME", pauseHintTouch: "TAP THE BOARD TO CONTINUE", pauseHintKey: "SPACE TO RESUME",
  overWin: "BOARD CLEARED!", overLose: "GAME OVER", newRecord: "NEW RECORD", finalScore: "FINAL SCORE",
  playAgain: "PLAY AGAIN", overHintTouch: "TAP TO RUN IT BACK", overHintKey: "PRESS ENTER",
  steer: "STEER", pauseWord: "PAUSE", restartWord: "RESTART", muteWord: "MUTE",
  swipeHint: "SWIPE ON THE BOARD — OR USE THE PAD",
  helpSteer: "steer the serpent", helpWasd: "also steers", helpPause: "pause / resume",
  helpEnter: "start / restart", helpRestart: "instant restart", helpMute: "mute the cabinet",
  helpBtn: "HELP", helpBack: "BACK TO THE GAME", helpKicker: "THE FIELD MANUAL",
  helpTitle: "How to play",
  helpIntro: "Everything about this little cabinet — what it does, how it plays, what you take home, and where every setting hides.",
  s1Title: "What does this game do?",
  s1Body: "SERPENT is a modern remake of the classic snake game. A hungry serpent crawls across a 21×21 pit. You steer it toward apples; every bite makes it longer and a little faster. The whole game runs right in your browser — on a desktop with a keyboard or on a phone with your thumb — and keeps your records safely on this device.",
  s2Title: "How it plays",
  s2Items: [
    "The serpent never stops — you only choose where it turns.",
    "Every apple: +10 points × your tier's multiplier, and the tempo rises.",
    "Every 5 apples a GOLDEN STAR appears. Grab it before it fades for 50× the multiplier.",
    "Hitting a wall or your own tail ends the run instantly.",
    "Fill the whole board and you achieve the legendary “BOARD CLEARED!” ending.",
  ],
  helpKeysTitle: "KEYBOARD", helpTouchTitle: "TOUCH",
  helpTouch1: "Swipe anywhere on the board to steer — chain swipes for tight corners.",
  helpTouch2: "Tap the board to start or resume.",
  helpTouch3: "Use the on-screen pad; its middle key pauses and plays.",
  s3Title: "The goal",
  s3Body: "Survive. Grow. Outscore your past self. Each speed tier keeps its own crown in the Hall of Fame, and medals mark your milestones — first bite, star hunting, marathon runs and the rare legend status.",
  s4Title: "Scores & outputs",
  s4Body: "Every run ends with a full report card. The formula is simple, the mastery is not:",
  s4Formula: "EACH APPLE", s4Times: "TIER MULTIPLIER", s4Result: "POINTS",
  s4Save: "Your best score per tier, medals, recent runs and every setting are saved automatically in this browser — no account needed.",
  s5Title: "Where are the settings?",
  s5n1: "SPEED TIER", s5n2: "LANGUAGE", s5n3: "SOUND", s5n4: "RECORDS",
  s5w1: "The “SELECT SPEED” panel beside the board (or above the pad on phones).",
  s5w2: "The EN / فا switch at the top — the whole cabinet flips, even the digits.",
  s5w3: "The speaker button in the header. M for mute on keyboards.",
  s5w4: "Stored in your browser. Clear site data and the pit forgets everything.",
  helpEsc: "PRESS ESC TO RETURN TO THE PIT",
  aboutBtn: "THE MAKER", aboutBack: "BACK TO THE GAME", aboutKicker: "THE HUMAN BEHIND THE PIT",
  aboutTitle: "About the maker",
  makerKicker: "BUILT BY A STUDENT",
  makerLine1: "Made by Aref — a 12-year-old maker.",
  makerLine2: "Aref is one of the students of Dr. Mah Monir Aghaei. This cabinet — every pixel, medal and line of code — is his project work.",
  makerContact: "CALL THE MENTOR", makerPhone: "00971 55 154 4988",
  footerLeft: "SERPENT v2.0 · 21×21 PIT", footerRight: "EAT · GROW · SURVIVE", footerAbout: "THE MAKER",
  themeBtn: "THEME", themeDark: "DARK", themeLight: "LIGHT",
  palForest: "FOREST", palOcean: "OCEAN", palEmber: "EMBER", palNight: "NIGHT",
  dirUp: "Up", dirDown: "Down", dirLeft: "Left", dirRight: "Right", playPause: "Play or pause",
  mute: "Mute", unmute: "Unmute",
};

const FA: Dict = {
  brand: "مار", tagline: "کابین آرکید مار", langLabel: "زبان",
  ticker: ["سیب‌ها را بخور","ستاره‌های طلایی را بگیر","مراقب دیوارها باش","دم خودت را گاز نگیر","فاصله = توقف","روی موبایل بکش","آتشین ×۳ امتیاز می‌دهد","هر سیب سرعت را بیشتر می‌کند","R شروع دوباره","پوسته‌ات را انتخاب کن"],
  best: "رکورد", score: "امتیاز", lenShort: "طول", length: "طول", lengthWord: "طول",
  applesLabel: "سیب‌ها", appleOne: "سیب", applesMany: "سیب", starsWord: "ستاره‌ها",
  diffChill: "آرام", diffClassic: "کلاسیک", diffBlazing: "آتشین",
  tagChill: "سیر آرام · امتیاز ×۱", tagClassic: "سرعت نوکیای ۱۹۹۷ · ×۲", tagBlazing: "آشوب کامل · امتیاز ×۳",
  selectSpeed: "انتخاب سرعت", diffNote: "تغییر سطح، زمین را از نو می‌چیند — رکوردهای هر سطح برای خودشان حفظ می‌شوند.",
  controls: "کنترل‌ها", scoreboard: "جدول امتیاز", tempo: "سرعت", lv: "سطح",
  fame: "تالار افتخار", fameNote: "رکوردها در همین مرورگر ذخیره می‌شوند. رکورد بزن و بعد ازش دفاع کن.",
  historyTitle: "بازی‌های اخیر", medalsTitle: "مدال‌ها",
  medalsNote: "برای همیشه در همین مرورگر می‌مانند. نشانگر را روی مدال نگه دار تا رازش را ببینی.",
  unlockToast: "مدال جدید — {name}",
  mFirstBite: "اولین گاز", dFirstBite: "اولین سیب را بخور",
  mFruitEater: "میوه‌خور", dFruitEater: "۱۰ سیب در یک بازی بخور",
  mAppleHoarder: "انباردار سیب", dAppleHoarder: "۲۵ سیب در یک بازی بخور",
  mCenturion: "صدتایی", dCenturion: "۱۰۰ امتیاز در یک بازی",
  mTreasure: "گنج زمین", dTreasure: "۳۰۰ امتیاز در یک بازی",
  mSpeedDemon: "دور تند", dSpeedDemon: "به سطح سرعت ۴ برس",
  mMarathoner: "ماراتن", dMarathoner: "۲ دقیقه در یک بازی زنده بمان",
  mStarHunter: "شکارچی ستاره", dStarHunter: "یک ستاره طلایی بگیر",
  mLegend: "افسانه زمین", dLegend: "رکورد ۵۰۰ را رد کن",
  mExplorer: "جهانگرد", dExplorer: "۱۰ دست بازی کن",
  st_menu: "آماده", st_playing: "زنده", st_paused: "توقف", st_over: "باخت",
  menuTitle: "آماده‌ای، قهرمان؟",
  menuCopy: "سیب بخور و دراز شو. دیوارها و دم خودت کشنده‌اند. با هر لقمه سرعت بالا می‌رود. ستاره‌های طلایی کلی امتیاز می‌دهند… اگر به‌اندازهٔ کافی سریع باشی.",
  menuBtn: "شروع بازی", menuHintTouch: "ضربه بزن یا بکش تا شروع شود", menuHintKey: "فاصله · اینتر · هر جهت‌نما",
  pausedTitle: "توقف", pausedCopy: "مار منتظر است… امتیاز {score} · طول {len}",
  resumeBtn: "ادامه", pauseHintTouch: "برای ادامه، روی زمین ضربه بزن", pauseHintKey: "فاصله برای ادامه",
  overWin: "زمین پاک شد!", overLose: "باختی!", newRecord: "رکورد جدید", finalScore: "امتیاز نهایی",
  playAgain: "دوباره بازی", overHintTouch: "ضربه بزن تا دوباره شروع شود", overHintKey: "اینتر را بزن",
  steer: "حرکت", pauseWord: "توقف", restartWord: "شروع دوباره", muteWord: "بی‌صدا",
  swipeHint: "روی زمین بکش — یا از پد استفاده کن",
  helpSteer: "هدایت مار", helpWasd: "این هم هدایت می‌کند", helpPause: "توقف / ادامه",
  helpEnter: "شروع / شروع دوباره", helpRestart: "شروع دوبارهٔ فوری", helpMute: "بی‌صدا کردن",
  helpBtn: "راهنما", helpBack: "بازگشت به بازی", helpKicker: "دفترچهٔ راهنما",
  helpTitle: "راهنمای بازی",
  helpIntro: "هر آنچه دربارهٔ این کابین کوچک لازم است — چه کار می‌کند، چطور بازی می‌شود، چه چیزی گیرت می‌آید و هر تنظیم کجا قایم شده.",
  s1Title: "این بازی چه کار می‌کند؟",
  s1Body: "«مار» بازسازی مدرن همان بازی نوستالژیک مار است. یک مار گرسنه در زمین ۲۱×۲۱ می‌خزد. تو آن را به سمت سیب‌ها هدایت می‌کنی؛ هر لقمه آن را درازتر و کمی سریع‌تر می‌کند. کل بازی همین‌جا در مرورگر اجرا می‌شود — روی کامپیوتر با کیبورد و روی گوشی با انگشت — و رکوردهایت را امن در همین دستگاه نگه می‌دارد.",
  s2Title: "روش بازی",
  s2Items: [
    "مار هرگز نمی‌ایستد — تو فقط جهت چرخیدنش را انتخاب می‌کنی.",
    "هر سیب: ۱۰ امتیاز × ضریب سطح، و کمی سرعت بیشتر.",
    "هر ۵ سیب، یک ستارهٔ طلایی ظاهر می‌شود. قبل از محو شدن بگیرش: ۵۰× ضریب جایزه!",
    "خوردن به دیوار یا دم خودت بازی را همان لحظه تمام می‌کند.",
    "کل زمین را پر کنی، پایان افسانه‌ای «زمین پاک شد!» را می‌بینی.",
  ],
  helpKeysTitle: "کیبورد", helpTouchTitle: "لمسی",
  helpTouch1: "هرجای زمین که بکشی، مار می‌پیچد — برای پیچ‌های تند، پشت‌سرهم بکش.",
  helpTouch2: "ضربه روی زمین، بازی را شروع یا ادامه می‌دهد.",
  helpTouch3: "از پد روی صفحه استفاده کن؛ دکمهٔ وسطش توقف و پخش است.",
  s3Title: "هدف بازی",
  s3Body: "زنده بمان. دراز شو. از رکورد قبلی خودت جلو بزن. هر سطح سرعت، تاج خودش را در تالار افتخار دارد و مدال‌ها نقطه‌عطف‌هایت را ثبت می‌کنند — اولین گاز، شکار ستاره، ماراتن و مقام کمیاب افسانه.",
  s4Title: "امتیازها و خروجی‌ها",
  s4Body: "هر بازی با یک کارنامهٔ کامل تمام می‌شود. فرمول ساده است، مهارت نه:",
  s4Formula: "هر سیب", s4Times: "ضریب سطح", s4Result: "امتیاز",
  s4Save: "رکورد هر سطح، مدال‌ها، بازی‌های اخیر و همهٔ تنظیم‌ها خودکار در همین مرورگر ذخیره می‌شوند — بدون نیاز به حساب کاربری.",
  s5Title: "تنظیمات کجاست؟",
  s5n1: "سطح سرعت", s5n2: "زبان", s5n3: "صدا", s5n4: "رکوردها",
  s5w1: "پنل «انتخاب سرعت» کنار زمین بازی (در گوشی بالای پد).",
  s5w2: "سوییچ EN / فا بالای صفحه — کل بازی می‌چرخد، حتی رقم‌ها.",
  s5w3: "دکمهٔ بلندگو در هدر. در کیبورد کلید M.",
  s5w4: "در مرورگر خودت ذخیره می‌شوند. اگر داده‌های سایت را پاک کنی، زمین همه‌چیز را فراموش می‌کند.",
  helpEsc: "برای بازگشت به زمین بازی، ESC را بزن",
  aboutBtn: "درباره سازنده", aboutBack: "بازگشت به بازی", aboutKicker: "انسانِ پشت زمین بازی",
  aboutTitle: "درباره‌ی سازنده",
  makerKicker: "ساختهٔ یک دانش‌آموز",
  makerLine1: "ساخته‌ی عارف — سازنده‌ی ۱۲ ساله.",
  makerLine2: "عارف یکی از شاگردان خانم دکتر ماه‌منیر آقایی است. این کابین — از هر پیکسل و مدال تا همهٔ کدهایش — پروژه‌ی اوست.",
  makerContact: "تماس با استاد", makerPhone: "۰۰۹۷۱۵۵۱۵۴۴۹۸۸",
  footerLeft: "مار نسخهٔ ۲٫۰ · زمین ۲۱×۲۱", footerRight: "بخور · دراز شو · زنده بمان", footerAbout: "سازنده",
  themeBtn: "پوسته", themeDark: "تیره", themeLight: "روشن",
  palForest: "جنگل", palOcean: "اقیانوس", palEmber: "آتش", palNight: "شب",
  dirUp: "بالا", dirDown: "پایین", dirLeft: "چپ", dirRight: "راست", playPause: "پخش یا توقف",
  mute: "بی‌صدا", unmute: "باصدا",
};

const DICTS: Record<Lang, Dict> = { en: EN, fa: FA };
const LANG_KEY = "serpent.lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "fa" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.toLowerCase().startsWith("fa") ? "fa" : "en";
  }
  return "en";
}

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  fa: boolean;
  fmt: (n: number | string) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: EN,
  fa: false,
  fmt: (n) => String(n),
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "fa" ? "rtl" : "ltr";
    document.title = lang === "fa" ? "مار · بازی آرکید مار" : "SERPENT · Arcade Snake";
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = DICTS[lang];
  const value: LangCtx = {
    lang,
    setLang: setLangState,
    t,
    fa: lang === "fa",
    fmt: (n) => {
      const s = String(n);
      return lang === "fa" ? toFa(s) : s;
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
