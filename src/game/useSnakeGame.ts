import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Cell, Dir, DiffKey, WorldKey } from "./engine";
import {
  DIFFICULTIES,
  DELTA,
  OPPOSITE,
  GRID,
  makeSnake,
  randomFood,
  randomFree,
  WORLDS,
} from "./engine";
import { sfx, setMuted as setAudioMuted } from "./audio";
import { activeCanvas } from "./theme";

export type Status = "menu" | "playing" | "paused" | "over";

export type MedalKind =
  | "apple"
  | "apples"
  | "pile"
  | "coin"
  | "coins"
  | "bolt"
  | "clock"
  | "star"
  | "crown"
  | "flag";

interface MedalDef {
  id: string;
  icon: MedalKind;
  nameKey: string;
  descKey: string;
}

export interface MedalView extends MedalDef {
  unlocked: boolean;
}

const MEDALS: MedalDef[] = [
  { id: "first_bite", icon: "apple", nameKey: "mFirstBite", descKey: "dFirstBite" },
  { id: "fruit_eater", icon: "apples", nameKey: "mFruitEater", descKey: "dFruitEater" },
  { id: "apple_hoarder", icon: "pile", nameKey: "mAppleHoarder", descKey: "dAppleHoarder" },
  { id: "centurion", icon: "coin", nameKey: "mCenturion", descKey: "dCenturion" },
  { id: "treasure", icon: "coins", nameKey: "mTreasure", descKey: "dTreasure" },
  { id: "speed_demon", icon: "bolt", nameKey: "mSpeedDemon", descKey: "dSpeedDemon" },
  { id: "marathoner", icon: "clock", nameKey: "mMarathoner", descKey: "dMarathoner" },
  { id: "star_hunter", icon: "star", nameKey: "mStarHunter", descKey: "dStarHunter" },
  { id: "legend", icon: "crown", nameKey: "mLegend", descKey: "dLegend" },
  { id: "explorer", icon: "flag", nameKey: "mExplorer", descKey: "dExplorer" },
];

interface UnlockStats {
  score: number;
  eaten: number;
  stars: number;
  best: number;
  len: number;
  lv: number;
  timeSec: number;
  totalGames: number;
}

function medalEarned(id: string, s: UnlockStats): boolean {
  switch (id) {
    case "first_bite": return s.eaten >= 1;
    case "fruit_eater": return s.eaten >= 10;
    case "apple_hoarder": return s.eaten >= 25;
    case "centurion": return s.score >= 100;
    case "treasure": return s.score >= 300;
    case "speed_demon": return s.lv >= 4;
    case "marathoner": return s.timeSec >= 120;
    case "star_hunter": return s.stars >= 1;
    case "legend": return s.best >= 500;
    case "explorer": return s.totalGames >= 10;
    default: return false;
  }
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string;
}

interface Popup {
  x: number; y: number; txt: string; color: string; born: number;
}

const STAR_TTL = 6800;
const STAR_EVERY = 5;

interface GameData {
  diff: DiffKey;
  world: WorldKey;
  snake: Cell[];
  prev: Cell[];
  dir: Dir;
  queue: Dir[];
  food: Cell | null;
  star: Cell | null;
  starBorn: number;
  stepMs: number;
  acc: number;
  status: Status;
  score: number;
  eaten: number;
  stars: number;
  shake: number;
  deathAt: number;
  eatAt: number;
  startedAt: number;
  win: boolean;
}

export interface GameAPI {
  canvasRef: RefObject<HTMLCanvasElement>;
  wrapRef: RefObject<HTMLDivElement>;
  status: Status;
  score: number;
  eaten: number;
  stars: number;
  best: number;
  bests: Record<DiffKey, number>;
  difficulty: DiffKey;
  world: WorldKey;
  muted: boolean;
  isNewBest: boolean;
  win: boolean;
  speedPct: number;
  history: number[];
  medals: MedalView[];
  toasts: Array<{ key: number; nameKey: string }>;
  start: (dir?: Dir) => void;
  restart: () => void;
  togglePause: () => void;
  setDirection: (d: Dir) => void;
  changeDifficulty: (d: DiffKey) => void;
  changeWorld: (w: WorldKey) => void;
  toggleMute: () => void;
}

const BEST_KEY = (d: DiffKey) => "serpent.best." + d;
const DIFF_KEY = "serpent.difficulty";
const WORLD_KEY = "serpent.world";
const MUTE_KEY = "serpent.muted";
const MEDALS_KEY = "serpent.medals";
const HISTORY_KEY = "serpent.history";
const PLAYS_KEY = "serpent.plays";

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeWrite(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* ignore */
  }
}

function readInitialDifficulty(): DiffKey {
  const d = safeRead(DIFF_KEY) as DiffKey | null;
  if (d && DIFFICULTIES[d]) return d;
  return "classic";
}

function readInitialWorld(): WorldKey {
  const w = safeRead(WORLD_KEY) as WorldKey | null;
  if (w && WORLDS[w]) return w;
  return "garden";
}

function loadBests(): Record<DiffKey, number> {
  const out: Record<DiffKey, number> = { chill: 0, classic: 0, blazing: 0 };
  (Object.keys(out) as DiffKey[]).forEach((k) => {
    const v = Number(safeRead(BEST_KEY(k)));
    out[k] = Number.isFinite(v) && v > 0 ? v : 0;
  });
  return out;
}

function loadMedalIds(): string[] {
  try {
    const raw = safeRead(MEDALS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string");
    }
  } catch {
    /* ignore */
  }
  return [];
}

function loadHistory(): number[] {
  try {
    const raw = safeRead(HISTORY_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr.filter((x) => Number.isFinite(x)).slice(-8).map(Number);
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function loadPlays(): number {
  const v = Number(safeRead(PLAYS_KEY));
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function freshData(diff: DiffKey, world: WorldKey): GameData {
  const snake = makeSnake();
  return {
    diff,
    world,
    snake,
    prev: snake.map((c) => ({ ...c })),
    dir: "right",
    queue: [],
    food: randomFood(snake, WORLDS[world].obstacles),
    star: null,
    starBorn: 0,
    stepMs: DIFFICULTIES[diff].stepMs,
    acc: 0,
    status: "menu",
    score: 0,
    eaten: 0,
    stars: 0,
    shake: 0,
    deathAt: 0,
    eatAt: -9999,
    startedAt: 0,
    win: false,
  };
}

/* ---------- tiny render helpers ---------- */

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

const EAT_COLORS = ["#ffc94d", "#ff6b5e", "#b8f04d", "#4de3c2"];
const DEATH_COLORS = ["#ff6b5e", "#ffc94d", "#ffffff"];
const STAR_COLORS = ["#ffe9a8", "#ffc94d", "#ffffff"];

/* ---------- per-world item painters ---------- */

function drawWorldFood(
  ctx: CanvasRenderingContext2D,
  px: number,
  fx: number,
  fy: number,
  now: number,
  world: WorldKey
) {
  const wdef = WORLDS[world];
  const pulse = 0.86 + Math.sin(now / 260) * 0.14;
  const r = px * 0.32 * pulse;

  /* glow halo */
  const glow = ctx.createRadialGradient(fx, fy, r * 0.2, fx, fy, r * 2.7);
  glow.addColorStop(0, wdef.foodGlow);
  glow.addColorStop(1, wdef.foodGlow.replace(/[\d.]+\)$/, "0)"));
  ctx.fillStyle = glow;
  ctx.fillRect(fx - r * 2.7, fy - r * 2.7, r * 5.4, r * 5.4);

  if (world === "garden") {
    /* apple */
    const body = ctx.createRadialGradient(fx - r * 0.35, fy - r * 0.4, r * 0.12, fx, fy, r * 1.05);
    body.addColorStop(0, "#ffb3a6");
    body.addColorStop(0.55, "#ff6b5e");
    body.addColorStop(1, "#d63b2f");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(fx, fy + px * 0.04, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7be06a";
    ctx.beginPath();
    ctx.ellipse(fx + r * 0.38, fy - r * 1.02, r * 0.4, r * 0.18, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a5a33";
    ctx.lineWidth = Math.max(1, px * 0.07);
    ctx.beginPath();
    ctx.moveTo(fx, fy - r * 0.82);
    ctx.quadraticCurveTo(fx + r * 0.14, fy - r * 1.28, fx + r * 0.3, fy - r * 1.34);
    ctx.stroke();
  } else if (world === "ocean") {
    /* little fish */
    const wag = Math.sin(now / 180) * 0.12;
    ctx.fillStyle = wdef.foodMain;
    ctx.beginPath();
    ctx.ellipse(fx - r * 0.15, fy, r * 1.02, r * 0.66, wag, 0, Math.PI * 2);
    ctx.fill();
    /* tail */
    ctx.beginPath();
    ctx.moveTo(fx - r * 1.05, fy);
    ctx.lineTo(fx - r * 1.65, fy - r * 0.55);
    ctx.lineTo(fx - r * 1.65, fy + r * 0.55);
    ctx.closePath();
    ctx.fill();
    /* eye */
    ctx.fillStyle = "#083344";
    ctx.beginPath();
    ctx.arc(fx + r * 0.4, fy - r * 0.14, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    /* shine */
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(fx - r * 0.2, fy - r * 0.28, r * 0.3, r * 0.13, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (world === "space") {
    /* ringed planet */
    const body = ctx.createRadialGradient(fx - r * 0.35, fy - r * 0.4, r * 0.1, fx, fy, r * 1.05);
    body.addColorStop(0, "#f5d0fe");
    body.addColorStop(0.6, "#e879f9");
    body.addColorStop(1, "#a21caf");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(fx, fy, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = Math.max(1.4, px * 0.08);
    ctx.beginPath();
    ctx.ellipse(fx, fy, r * 1.5, r * 0.42, -0.45, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    /* micro-chip */
    const s = r * 1.7;
    ctx.fillStyle = "#0e7490";
    rr(ctx, fx - s / 2, fy - s / 2, s, s, s * 0.18);
    ctx.fill();
    ctx.fillStyle = wdef.foodMain;
    rr(ctx, fx - s * 0.3, fy - s * 0.3, s * 0.6, s * 0.6, s * 0.1);
    ctx.fill();
    /* pins */
    ctx.strokeStyle = "#a5f3fc";
    ctx.lineWidth = Math.max(1, px * 0.06);
    for (let i = -1; i <= 1; i++) {
      const off = i * s * 0.28;
      ctx.beginPath();
      ctx.moveTo(fx + off, fy - s / 2); ctx.lineTo(fx + off, fy - s * 0.72);
      ctx.moveTo(fx + off, fy + s / 2); ctx.lineTo(fx + off, fy + s * 0.72);
      ctx.moveTo(fx - s / 2, fy + off); ctx.lineTo(fx - s * 0.72, fy + off);
      ctx.moveTo(fx + s / 2, fy + off); ctx.lineTo(fx + s * 0.72, fy + off);
      ctx.stroke();
    }
  }
}

function drawWorldBonus(
  ctx: CanvasRenderingContext2D,
  px: number,
  sx: number,
  sy: number,
  now: number,
  remain: number,
  world: WorldKey
) {
  const wdef = WORLDS[world];
  const R = px * 0.4 * (0.9 + 0.1 * Math.sin(now / 220));

  const glow = ctx.createRadialGradient(sx, sy, R * 0.2, sx, sy, R * 3);
  glow.addColorStop(0, wdef.bonusGlow);
  glow.addColorStop(1, wdef.bonusGlow.replace(/[\d.]+\)$/, "0)"));
  ctx.fillStyle = glow;
  ctx.fillRect(sx - R * 3, sy - R * 3, R * 6, R * 6);

  if (world === "garden" || world === "space") {
    /* spinning star (garden) / comet-head star (space) */
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(now / 700);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr2 = i % 2 === 0 ? R : R * 0.46;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
      else ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
    }
    ctx.closePath();
    ctx.fillStyle = wdef.bonusMain;
    ctx.shadowColor = wdef.bonusGlow;
    ctx.shadowBlur = px * 0.5;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  } else if (world === "ocean") {
    /* pearl */
    const body = ctx.createRadialGradient(sx - R * 0.4, sy - R * 0.45, R * 0.1, sx, sy, R);
    body.addColorStop(0, "#ffffff");
    body.addColorStop(0.6, "#e2e8f0");
    body.addColorStop(1, "#94a3b8");
    ctx.fillStyle = body;
    ctx.shadowColor = wdef.bonusGlow;
    ctx.shadowBlur = px * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, R * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    /* golden CPU */
    const s = R * 1.9;
    ctx.fillStyle = wdef.bonusMain;
    ctx.shadowColor = wdef.bonusGlow;
    ctx.shadowBlur = px * 0.5;
    rr(ctx, sx - s / 2, sy - s / 2, s, s, s * 0.16);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#92400e";
    rr(ctx, sx - s * 0.28, sy - s * 0.28, s * 0.56, s * 0.56, s * 0.08);
    ctx.fill();
  }

  /* countdown ring */
  ctx.strokeStyle = wdef.bonusGlow;
  ctx.lineWidth = Math.max(1.5, px * 0.07);
  ctx.beginPath();
  ctx.arc(sx, sy, px * 0.62, -Math.PI / 2, -Math.PI / 2 + remain * Math.PI * 2);
  ctx.stroke();
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  px: number,
  c: Cell,
  world: WorldKey
) {
  const wdef = WORLDS[world];
  const x = c.x * px;
  const y = c.y * px;
  const pad = px * 0.1;
  ctx.fillStyle = wdef.obstacleBase;
  rr(ctx, x + pad, y + pad, px - pad * 2, px - pad * 2, px * 0.18);
  ctx.fill();
  ctx.strokeStyle = wdef.obstacleRim;
  ctx.lineWidth = Math.max(1, px * 0.07);
  rr(ctx, x + pad, y + pad, px - pad * 2, px - pad * 2, px * 0.18);
  ctx.stroke();
  /* inner detail */
  ctx.fillStyle = wdef.obstacleRim;
  ctx.globalAlpha = 0.35;
  const d = px * 0.34;
  ctx.fillRect(x + px / 2 - d / 2, y + px / 2 - d / 2, d, d);
  ctx.globalAlpha = 1;
}

export function useSnakeGame(): GameAPI {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const metrics = useRef({ size: 0, dpr: 1, cell: 0 });
  const particles = useRef<Particle[]>([]);
  const popups = useRef<Popup[]>([]);
  const decoys = useRef<number[]>(Array.from({ length: GRID * GRID }, (_, i) => i * 7919));

  const [status, setStatus] = useState<Status>("menu");
  const [score, setScore] = useState(0);
  const [eaten, setEaten] = useState(0);
  const [stars, setStars] = useState(0);
  const [speedPct, setSpeedPct] = useState(0);
  const [difficulty, setDifficultyState] = useState<DiffKey>(readInitialDifficulty);
  const [world, setWorldState] = useState<WorldKey>(readInitialWorld);
  const [bests, setBests] = useState<Record<DiffKey, number>>(loadBests);
  const [isNewBest, setIsNewBest] = useState(false);
  const [win, setWin] = useState(false);
  const [history, setHistory] = useState<number[]>(loadHistory);
  const [unlockedIds, setUnlockedIds] = useState<string[]>(loadMedalIds);
  const [toasts, setToasts] = useState<Array<{ key: number; nameKey: string }>>([]);
  const [muted, setMutedState] = useState(() => safeRead(MUTE_KEY) === "1");

  const g = useRef<GameData>(freshData(readInitialDifficulty(), readInitialWorld()));
  const bestsRef = useRef(bests);
  bestsRef.current = bests;
  const unlockedRef = useRef(unlockedIds);
  unlockedRef.current = unlockedIds;
  const historyRef = useRef(history);
  historyRef.current = history;
  const playsRef = useRef(loadPlays());
  const langFaRef = useRef(false);
  try {
    langFaRef.current = (localStorage.getItem("serpent.lang") || "").indexOf("fa") === 0;
  } catch {
    /* ignore */
  }

  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  const fmtNum = (n: number) => {
    const s = String(n);
    return langFaRef.current ? s.replace(/\d/g, (d) => faDigits[Number(d)]) : s;
  };

  /* ---------------- actions ---------------- */

  const startGame = useCallback((dir: Dir = "right") => {
    const base = freshData(g.current.diff, g.current.world);
    /* the serpent spawns facing right — starting left would bite its own neck */
    const safeDir: Dir = dir === "left" ? "right" : dir;
    g.current = { ...base, status: "playing", dir: safeDir, acc: 0, startedAt: performance.now() };
    particles.current = [];
    popups.current = [];
    setStatus("playing");
    setScore(0);
    setEaten(0);
    setStars(0);
    setSpeedPct(0);
    setWin(false);
    setIsNewBest(false);
    sfx.start();
  }, []);

  const pauseGame = useCallback(() => {
    if (g.current.status !== "playing") return;
    g.current.status = "paused";
    setStatus("paused");
    sfx.pause();
  }, []);

  const resumeGame = useCallback(() => {
    if (g.current.status !== "paused") return;
    g.current.status = "playing";
    setStatus("playing");
    sfx.start();
  }, []);

  const togglePause = useCallback(() => {
    if (g.current.status === "playing") pauseGame();
    else if (g.current.status === "paused") resumeGame();
  }, [pauseGame, resumeGame]);

  const spawnBurst = (cx: number, cy: number, colors: string[], count: number) => {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.0022 + Math.random() * 0.0065;
      particles.current.push({
        x: cx + 0.5,
        y: cy + 0.5,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 420 + Math.random() * 320,
        maxLife: 740,
        size: 0.1 + Math.random() * 0.16,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    if (particles.current.length > 140) {
      particles.current.splice(0, particles.current.length - 140);
    }
  };

  const endGame = useCallback((won: boolean) => {
    const d = g.current;
    const diff = DIFFICULTIES[d.diff];
    d.status = "over";
    d.win = won;
    d.shake = 1;
    d.deathAt = performance.now();
    if (!won) {
      sfx.die();
      const head = d.snake[0];
      spawnBurst(head.x, head.y, DEATH_COLORS, 16);
    }
    setWin(won);
    setStatus("over");

    const newBest = d.score > bestsRef.current[d.diff] && d.score > 0;
    if (newBest) {
      safeWrite(BEST_KEY(d.diff), String(d.score));
      setBests((prev) => ({ ...prev, [d.diff]: d.score }));
      setIsNewBest(true);
      window.setTimeout(() => sfx.record(), 350);
    }

    /* history + play counter */
    const nextHistory = [...historyRef.current, d.score].slice(-8);
    safeWrite(HISTORY_KEY, JSON.stringify(nextHistory));
    setHistory(nextHistory);
    playsRef.current += 1;
    safeWrite(PLAYS_KEY, String(playsRef.current));

    /* medals */
    const pct = Math.min(1, (diff.stepMs - d.stepMs) / (diff.stepMs - diff.minMs));
    const stats: UnlockStats = {
      score: d.score,
      eaten: d.eaten,
      stars: d.stars,
      best: Math.max(bestsRef.current[d.diff], d.score),
      len: d.snake.length,
      lv: 1 + Math.round(pct * 5),
      timeSec: (performance.now() - d.startedAt) / 1000,
      totalGames: playsRef.current,
    };
    const newly = MEDALS.filter(
      (m) => !unlockedRef.current.includes(m.id) && medalEarned(m.id, stats)
    );
    if (newly.length > 0) {
      const ids = [...unlockedRef.current, ...newly.map((m) => m.id)];
      unlockedRef.current = ids;
      setUnlockedIds(ids);
      safeWrite(MEDALS_KEY, JSON.stringify(ids));
      newly.forEach((m, i) => {
        const key = Date.now() + i;
        window.setTimeout(() => {
          setToasts((ts) => [...ts.slice(-2), { key, nameKey: m.nameKey }]);
          sfx.star();
        }, 500 + i * 500);
        window.setTimeout(() => {
          setToasts((ts) => ts.filter((x) => x.key !== key));
        }, 3600 + i * 500);
      });
    }
  }, []);

  const stepOnce = useCallback(() => {
    const d = g.current;
    const diff = DIFFICULTIES[d.diff];
    const now = performance.now();

    while (d.queue.length > 0) {
      const next = d.queue.shift() as Dir;
      if (next !== d.dir && next !== OPPOSITE[d.dir]) {
        d.dir = next;
        break;
      }
    }

    d.prev = d.snake.map((c) => ({ ...c }));
    const head = d.snake[0];
    const wdef = WORLDS[d.world];
    let nx = head.x + DELTA[d.dir].x;
    let ny = head.y + DELTA[d.dir].y;

    /* ocean world: the serpent swims through the edges */
    if (wdef.wrap) {
      nx = (nx + GRID) % GRID;
      ny = (ny + GRID) % GRID;
    }

    const hitWall = !wdef.wrap && (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID);
    const hitObstacle = wdef.obstacles.some((c) => c.x === nx && c.y === ny);
    const ate = d.food !== null && nx === d.food.x && ny === d.food.y;
    const ateStar = d.star !== null && nx === d.star.x && ny === d.star.y;
    const bodyToCheck = ate ? d.snake : d.snake.slice(0, -1);
    const hitSelf = bodyToCheck.some((c) => c.x === nx && c.y === ny);

    if (hitWall || hitObstacle || hitSelf) {
      endGame(false);
      return;
    }

    d.snake.unshift({ x: nx, y: ny });

    if (ate && d.food) {
      const gained = 10 * diff.mult;
      d.score += gained;
      d.eaten += 1;
      d.stepMs = Math.max(diff.minMs, d.stepMs - diff.speedup);
      d.eatAt = now;
      spawnBurst(d.food.x, d.food.y, EAT_COLORS, 12);
      popups.current.push({ x: nx + 0.5, y: ny + 0.3, txt: "+" + fmtNum(gained), color: "#ffc94d", born: now });
      sfx.eat();
      d.food = randomFood(d.snake, wdef.obstacles);

      /* every 5 items: a bonus appears for a short window */
      if (d.eaten % STAR_EVERY === 0 && d.star === null) {
        const cell = randomFree([...d.snake, ...(d.food ? [d.food] : []), ...wdef.obstacles]);
        if (cell) {
          d.star = cell;
          d.starBorn = now;
        }
      }

      setScore(d.score);
      setEaten(d.eaten);
      setSpeedPct(Math.min(1, (diff.stepMs - d.stepMs) / (diff.stepMs - diff.minMs)));
      if (d.food === null || d.snake.length >= GRID * GRID) {
        endGame(true);
        return;
      }
    } else {
      d.snake.pop();
    }

    if (ateStar && d.star) {
      const bonus = 50 * diff.mult;
      d.score += bonus;
      d.stars += 1;
      spawnBurst(d.star.x, d.star.y, STAR_COLORS, 20);
      popups.current.push({ x: nx + 0.5, y: ny + 0.3, txt: "+" + fmtNum(bonus), color: "#ffe9a8", born: now });
      sfx.star();
      d.star = null;
      setScore(d.score);
      setStars(d.stars);
    }

    /* star fades away */
    if (d.star && now - d.starBorn > STAR_TTL) {
      d.star = null;
    }
  }, [endGame]);

  const setDirection = useCallback(
    (dir: Dir) => {
      const d = g.current;
      if (d.status === "menu") {
        startGame(dir);
        return;
      }
      if (d.status !== "playing") return;
      const last = d.queue.length > 0 ? d.queue[d.queue.length - 1] : d.dir;
      if (dir === last || dir === OPPOSITE[last]) return;
      if (d.queue.length < 3) d.queue.push(dir);
    },
    [startGame]
  );

  const changeDifficulty = useCallback((key: DiffKey) => {
    safeWrite(DIFF_KEY, key);
    setDifficultyState(key);
    g.current = freshData(key, g.current.world);
    particles.current = [];
    popups.current = [];
    setStatus("menu");
    setScore(0);
    setEaten(0);
    setStars(0);
    setSpeedPct(0);
    setWin(false);
    setIsNewBest(false);
  }, []);

  const changeWorld = useCallback((key: WorldKey) => {
    safeWrite(WORLD_KEY, key);
    setWorldState(key);
    g.current = freshData(g.current.diff, key);
    particles.current = [];
    popups.current = [];
    setStatus("menu");
    setScore(0);
    setEaten(0);
    setStars(0);
    setSpeedPct(0);
    setWin(false);
    setIsNewBest(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      safeWrite(MUTE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const pressPrimary = useCallback(() => {
    const st = g.current.status;
    if (st === "menu") startGame();
    else if (st === "playing") pauseGame();
    else if (st === "paused") resumeGame();
    else startGame();
  }, [startGame, pauseGame, resumeGame]);

  const restart = useCallback(() => startGame(), [startGame]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const dirMap: Record<string, Dir> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
      W: "up", S: "down", A: "left", D: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (dirMap[k]) {
        e.preventDefault();
        setDirection(dirMap[k]);
        return;
      }
      if (e.repeat) return;
      if (k === " " || k === "p" || k === "P") {
        e.preventDefault();
        pressPrimary();
        return;
      }
      if (k === "Enter") {
        e.preventDefault();
        pressPrimary();
        return;
      }
      if (k === "r" || k === "R") {
        restart();
        return;
      }
      if (k === "m" || k === "M") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDirection, pressPrimary, restart, toggleMute]);

  /* auto-pause when the tab hides */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pauseGame();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseGame]);

  /* ---------------- touch (swipe on the board) ---------------- */

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let sx = 0;
    let sy = 0;
    let active = false;
    let moved = false;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      active = true;
      moved = false;
    };
    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
      moved = true;
      setDirection(
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up"
      );
      sx = t.clientX;
      sy = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (active && !moved) {
        const target = e.target as Element | null;
        const onButton = !!(target && target.closest && target.closest("button"));
        if (!onButton) {
          const st = g.current.status;
          if (st === "menu") startGame();
          else if (st === "paused") resumeGame();
        }
      }
      active = false;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [setDirection, startGame, resumeGame]);

  /* ---------------- sizing ---------------- */

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const size = Math.floor(Math.min(rect.width, rect.height));
      if (size <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      metrics.current = { size, dpr, cell: (size * dpr) / GRID };
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  /* ---------------- render ---------------- */

  const render = useCallback((now: number, dt: number) => {
    const canvas = canvasRef.current;
    const m = metrics.current;
    if (!canvas || m.size === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const px = m.cell;
    const W = canvas.width;
    const H = canvas.height;
    const cv = activeCanvas.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const d = g.current;

    if (d.shake > 0) {
      d.shake = Math.max(0, d.shake - dt / 480);
      const s = d.shake * d.shake * 8 * m.dpr;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    /* board checker */
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? cv.boardA : cv.boardB;
        ctx.fillRect(x * px, y * px, px + 0.6, px + 0.6);
      }
    }

    /* drifting dew — tiny living sparkles on the field */
    for (let i = 0; i < 14; i++) {
      const ph = decoys.current[i] + now * 0.00006 * (10 + (i % 5));
      const dx = ((i * 7919) % GRID) + 0.5;
      const dy = ((i * 4391) % GRID) + 0.5;
      const tw = 0.5 + 0.5 * Math.sin(ph * 6.283);
      ctx.globalAlpha = 0.05 + 0.11 * tw;
      ctx.fillStyle = "#9fe8c0";
      const s = px * 0.07 * (0.7 + tw * 0.6);
      ctx.fillRect(dx * px - s / 2, dy * px - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    const wdef = WORLDS[d.world];

    /* world color wash over the field */
    if (wdef.tint) {
      ctx.fillStyle = wdef.tint;
      ctx.fillRect(0, 0, W, H);
    }

    /* static obstacles */
    for (const ob of wdef.obstacles) drawObstacle(ctx, px, ob, d.world);

    const t = d.status === "playing" ? Math.min(1, d.acc / d.stepMs) : 1;

    /* food */
    if (d.food) {
      drawWorldFood(ctx, px, d.food.x * px + px / 2, d.food.y * px + px / 2, now, d.world);
    }

    /* bonus */
    if (d.star) {
      const age = now - d.starBorn;
      const remain = Math.max(0, 1 - age / STAR_TTL);
      const blinkOut = remain < 0.22 && Math.sin(now / 90) > 0;
      if (!blinkOut) {
        drawWorldBonus(ctx, px, d.star.x * px + px / 2, d.star.y * px + px / 2, now, remain, d.world);
      }
    }

    /* snake */
    const n = d.snake.length;
    const dying = d.status === "over" && !d.win;
    const blink = dying && now - d.deathAt < 1100 && Math.sin((now - d.deathAt) / 55) > 0;

    const headRGB = wdef.headRGB ?? cv.headRGB;
    const tailRGB = wdef.tailRGB ?? cv.tailRGB;
    const headGlow = wdef.headGlow ?? cv.headGlow;

    for (let i = n - 1; i >= 0; i--) {
      const cur = d.snake[i];
      const pv = i < d.prev.length ? d.prev[i] : cur;
      /* in the ocean world the body glides across the seam instead of snapping */
      let apx = pv.x;
      let apy = pv.y;
      if (wdef.wrap) {
        if (cur.x - apx > GRID / 2) apx += GRID;
        else if (apx - cur.x > GRID / 2) apx -= GRID;
        if (cur.y - apy > GRID / 2) apy += GRID;
        else if (apy - cur.y > GRID / 2) apy -= GRID;
      }
      const rx = (apx + (cur.x - apx) * t) * px;
      const ry = (apy + (cur.y - apy) * t) * px;
      const f = n === 1 ? 0 : i / (n - 1);
      const taper = 1 - f * 0.3;
      const size = px * (i === 0 ? 0.94 : 0.82) * taper;
      const pad = (px - size) / 2;
      if (i === 0) {
        ctx.shadowColor = headGlow;
        ctx.shadowBlur = px * 0.55;
      }
      ctx.fillStyle = blink && i % 2 === 0 ? "#ff6b5e" : mix(headRGB, tailRGB, f);
      rr(ctx, rx + pad, ry + pad, size, size, size * 0.34);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (i > 0 && i % 3 === 0 && !blink) {
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        rr(ctx, rx + pad + size * 0.16, ry + pad + size * 0.12, size * 0.68, size * 0.3, size * 0.15);
        ctx.fill();
      }
    }

    /* head details */
    const hCur = d.snake[0];
    const hPrev = d.prev.length > 0 ? d.prev[0] : hCur;
    const hx = (hPrev.x + (hCur.x - hPrev.x) * t) * px + px / 2;
    const hy = (hPrev.y + (hCur.y - hPrev.y) * t) * px + px / 2;
    const dv = DELTA[d.dir];
    const perp = { x: -dv.y, y: dv.x };

    /* tongue flick right after eating */
    if (now - d.eatAt < 240 && d.status !== "over") {
      const k = Math.sin(((now - d.eatAt) / 240) * Math.PI);
      const len = px * (0.3 + 0.34 * k);
      const tx = hx + dv.x * px * 0.46;
      const ty = hy + dv.y * px * 0.46;
      ctx.strokeStyle = "#ff5c7a";
      ctx.lineWidth = Math.max(1, px * 0.07);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + dv.x * len, ty + dv.y * len);
      ctx.stroke();
      const tipX = tx + dv.x * len;
      const tipY = ty + dv.y * len;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + (dv.x * 0.5 + perp.x * 0.5) * px * 0.14, tipY + (dv.y * 0.5 + perp.y * 0.5) * px * 0.14);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + (dv.x * 0.5 - perp.x * 0.5) * px * 0.14, tipY + (dv.y * 0.5 - perp.y * 0.5) * px * 0.14);
      ctx.stroke();
    }

    /* eyes (or X eyes when dead) */
    const eyeR = px * 0.125;
    const blinkClosed = !dying && now % 3400 < 130;
    for (const s of [-1, 1]) {
      const ex = hx + dv.x * px * 0.17 + perp.x * px * 0.19 * s;
      const ey = hy + dv.y * px * 0.17 + perp.y * px * 0.19 * s;
      if (dying) {
        ctx.strokeStyle = "#0a1712";
        ctx.lineWidth = Math.max(1.2, px * 0.07);
        ctx.beginPath();
        ctx.moveTo(ex - eyeR * 0.8, ey - eyeR * 0.8);
        ctx.lineTo(ex + eyeR * 0.8, ey + eyeR * 0.8);
        ctx.moveTo(ex + eyeR * 0.8, ey - eyeR * 0.8);
        ctx.lineTo(ex - eyeR * 0.8, ey + eyeR * 0.8);
        ctx.stroke();
      } else if (blinkClosed) {
        ctx.strokeStyle = "#0a1712";
        ctx.lineWidth = Math.max(1.2, px * 0.06);
        ctx.beginPath();
        ctx.moveTo(ex - eyeR * 0.8, ey);
        ctx.lineTo(ex + eyeR * 0.8, ey);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#f4fff0";
        ctx.beginPath();
        ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a1712";
        ctx.beginPath();
        ctx.arc(ex + dv.x * eyeR * 0.42, ey + dv.y * eyeR * 0.42, eyeR * 0.52, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* particles */
    const pts = particles.current;
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.life -= dt;
      if (p.life <= 0) {
        pts.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.995;
      p.vy *= 0.995;
      const a = Math.max(0, Math.min(1, p.life / (p.maxLife * 0.6)));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      const s = p.size * px;
      ctx.fillRect(p.x * px - s / 2, p.y * px - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    /* floating score popups */
    const pops = popups.current;
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i];
      const age = now - p.born;
      if (age > 950) {
        pops.splice(i, 1);
        continue;
      }
      const a = 1 - age / 950;
      const rise = (age / 950) * px * 1.1;
      ctx.globalAlpha = Math.min(1, a * 1.6);
      ctx.font = `700 ${Math.round(px * 0.46)}px "Space Grotesk","Vazirmatn",sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = Math.max(2, px * 0.09);
      ctx.strokeStyle = "rgba(6,17,12,0.85)";
      ctx.strokeText(p.txt, p.x * px, p.y * px - rise);
      ctx.fillStyle = p.color;
      ctx.fillText(p.txt, p.x * px, p.y * px - rise);
    }
    ctx.globalAlpha = 1;

    /* vignette */
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.34, W / 2, H / 2, W * 0.74);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, cv.vig);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    /* death flash */
    if (dying && now - d.deathAt < 260) {
      const k = 1 - (now - d.deathAt) / 260;
      ctx.fillStyle = `rgba(255,80,60,${(0.32 * k).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }, []);

  /* ---------------- main loop ---------------- */

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(now - last, 80);
      last = now;
      const d = g.current;
      if (d.status === "playing") {
        d.acc += dt;
        let guard = 0;
        while (d.acc >= d.stepMs && d.status === "playing" && guard < 4) {
          d.acc -= d.stepMs;
          guard += 1;
          stepOnce();
        }
        if (d.acc > d.stepMs) d.acc = 0;
      }
      render(now, dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [stepOnce, render]);

  const medals: MedalView[] = MEDALS.map((m) => ({
    ...m,
    unlocked: unlockedIds.includes(m.id),
  }));

  return {
    canvasRef,
    wrapRef,
    status,
    score,
    eaten,
    stars,
    best: bests[difficulty],
    bests,
    difficulty,
    world,
    muted,
    isNewBest,
    win,
    speedPct,
    history,
    medals,
    toasts,
    start: startGame,
    restart,
    togglePause,
    setDirection,
    changeDifficulty,
    changeWorld,
    toggleMute,
  };
}
