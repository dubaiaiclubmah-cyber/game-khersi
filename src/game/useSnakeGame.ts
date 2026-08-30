import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  Cell,
  Dir,
  DiffKey,
  DIFFICULTIES,
  DELTA,
  OPPOSITE,
  GRID,
  makeSnake,
  randomFood,
} from "./engine";
import { sfx, setMuted as setAudioMuted } from "./audio";

export type Status = "menu" | "playing" | "paused" | "over";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface GameData {
  diff: DiffKey;
  snake: Cell[];
  prev: Cell[];
  dir: Dir;
  queue: Dir[];
  food: Cell | null;
  stepMs: number;
  acc: number;
  status: Status;
  score: number;
  eaten: number;
  shake: number;
  deathAt: number;
  eatAt: number;
  win: boolean;
}

export interface GameAPI {
  canvasRef: RefObject<HTMLCanvasElement>;
  wrapRef: RefObject<HTMLDivElement>;
  status: Status;
  score: number;
  eaten: number;
  best: number;
  bests: Record<DiffKey, number>;
  difficulty: DiffKey;
  muted: boolean;
  isNewBest: boolean;
  win: boolean;
  speedPct: number;
  start: (dir?: Dir) => void;
  restart: () => void;
  togglePause: () => void;
  setDirection: (d: Dir) => void;
  changeDifficulty: (d: DiffKey) => void;
  toggleMute: () => void;
}

const BEST_KEY = (d: DiffKey) => "serpent.best." + d;
const DIFF_KEY = "serpent.difficulty";
const MUTE_KEY = "serpent.muted";

function readInitialDifficulty(): DiffKey {
  try {
    const d = localStorage.getItem(DIFF_KEY) as DiffKey | null;
    if (d && DIFFICULTIES[d]) return d;
  } catch {
    /* private mode etc. */
  }
  return "classic";
}

function loadBests(): Record<DiffKey, number> {
  const out: Record<DiffKey, number> = { chill: 0, classic: 0, blazing: 0 };
  (Object.keys(out) as DiffKey[]).forEach((k) => {
    try {
      const v = Number(localStorage.getItem(BEST_KEY(k)));
      out[k] = Number.isFinite(v) && v > 0 ? v : 0;
    } catch {
      out[k] = 0;
    }
  });
  return out;
}

function freshData(diff: DiffKey): GameData {
  const snake = makeSnake();
  return {
    diff,
    snake,
    prev: snake.map((c) => ({ ...c })),
    dir: "right",
    queue: [],
    food: randomFood(snake),
    stepMs: DIFFICULTIES[diff].stepMs,
    acc: 0,
    status: "menu",
    score: 0,
    eaten: 0,
    shake: 0,
    deathAt: 0,
    eatAt: -9999,
    win: false,
  };
}

/* ---------- tiny render helpers ---------- */

const HEAD_RGB = [184, 240, 77];
const TAIL_RGB = [34, 158, 116];

function mix(a: number[], b: number[], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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

export function useSnakeGame(): GameAPI {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const metrics = useRef({ size: 0, dpr: 1, cell: 0 });
  const particles = useRef<Particle[]>([]);

  const [status, setStatus] = useState<Status>("menu");
  const [score, setScore] = useState(0);
  const [eaten, setEaten] = useState(0);
  const [speedPct, setSpeedPct] = useState(0);
  const [difficulty, setDifficultyState] = useState<DiffKey>(
    readInitialDifficulty
  );
  const [bests, setBests] = useState<Record<DiffKey, number>>(loadBests);
  const [isNewBest, setIsNewBest] = useState(false);
  const [win, setWin] = useState(false);
  const [muted, setMutedState] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const g = useRef<GameData>(freshData(readInitialDifficulty()));
  const bestsRef = useRef(bests);
  bestsRef.current = bests;

  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  /* ---------------- actions ---------------- */

  const startGame = useCallback((dir: Dir = "right") => {
    const base = freshData(g.current.diff);
    /* the serpent spawns facing right — starting left would bite its own neck */
    const safeDir: Dir = dir === "left" ? "right" : dir;
    g.current = { ...base, status: "playing", dir: safeDir, acc: 0 };
    particles.current = [];
    setStatus("playing");
    setScore(0);
    setEaten(0);
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

  const endGame = useCallback(
    (won: boolean) => {
      const d = g.current;
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
      if (d.score > bestsRef.current[d.diff] && d.score > 0) {
        try {
          localStorage.setItem(BEST_KEY(d.diff), String(d.score));
        } catch {
          /* ignore */
        }
        setBests((prev) => ({ ...prev, [d.diff]: d.score }));
        setIsNewBest(true);
        window.setTimeout(() => sfx.record(), 350);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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

  const stepOnce = useCallback(() => {
    const d = g.current;
    const diff = DIFFICULTIES[d.diff];

    while (d.queue.length > 0) {
      const next = d.queue.shift() as Dir;
      if (next !== d.dir && next !== OPPOSITE[d.dir]) {
        d.dir = next;
        break;
      }
    }

    d.prev = d.snake.map((c) => ({ ...c }));
    const head = d.snake[0];
    const nx = head.x + DELTA[d.dir].x;
    const ny = head.y + DELTA[d.dir].y;

    const hitWall = nx < 0 || ny < 0 || nx >= GRID || ny >= GRID;
    const ate = d.food !== null && nx === d.food.x && ny === d.food.y;
    const bodyToCheck = ate ? d.snake : d.snake.slice(0, -1);
    const hitSelf = bodyToCheck.some((c) => c.x === nx && c.y === ny);

    if (hitWall || hitSelf) {
      endGame(false);
      return;
    }

    d.snake.unshift({ x: nx, y: ny });

    if (ate && d.food) {
      d.score += 10 * diff.mult;
      d.eaten += 1;
      d.stepMs = Math.max(diff.minMs, d.stepMs - diff.speedup);
      d.eatAt = performance.now();
      spawnBurst(d.food.x, d.food.y, EAT_COLORS, 12);
      sfx.eat();
      d.food = randomFood(d.snake);
      setScore(d.score);
      setEaten(d.eaten);
      setSpeedPct(
        Math.min(1, (diff.stepMs - d.stepMs) / (diff.stepMs - diff.minMs))
      );
      if (d.food === null || d.snake.length >= GRID * GRID) {
        endGame(true);
        return;
      }
    } else {
      d.snake.pop();
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
    try {
      localStorage.setItem(DIFF_KEY, key);
    } catch {
      /* ignore */
    }
    setDifficultyState(key);
    g.current = freshData(key);
    particles.current = [];
    setStatus("menu");
    setScore(0);
    setEaten(0);
    setSpeedPct(0);
    setWin(false);
    setIsNewBest(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
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
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      W: "up",
      S: "down",
      A: "left",
      D: "right",
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
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
          ? "down"
          : "up"
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
        ctx.fillStyle = (x + y) % 2 === 0 ? "#0a1712" : "#0c1b15";
        ctx.fillRect(x * px, y * px, px + 0.6, px + 0.6);
      }
    }

    const t = d.status === "playing" ? Math.min(1, d.acc / d.stepMs) : 1;

    /* food */
    if (d.food) {
      const pulse = 0.86 + Math.sin(now / 260) * 0.14;
      const fx = d.food.x * px + px / 2;
      const fy = d.food.y * px + px / 2;
      const r = px * 0.32 * pulse;
      const glow = ctx.createRadialGradient(fx, fy, r * 0.2, fx, fy, r * 2.7);
      glow.addColorStop(0, "rgba(255,107,94,0.5)");
      glow.addColorStop(1, "rgba(255,107,94,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(fx - r * 2.7, fy - r * 2.7, r * 5.4, r * 5.4);
      const body = ctx.createRadialGradient(
        fx - r * 0.35,
        fy - r * 0.4,
        r * 0.12,
        fx,
        fy,
        r * 1.05
      );
      body.addColorStop(0, "#ffb3a6");
      body.addColorStop(0.55, "#ff6b5e");
      body.addColorStop(1, "#d63b2f");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(fx, fy + px * 0.04, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7be06a";
      ctx.beginPath();
      ctx.ellipse(
        fx + r * 0.38,
        fy - r * 1.02,
        r * 0.4,
        r * 0.18,
        -0.6,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#8a5a33";
      ctx.lineWidth = Math.max(1, px * 0.07);
      ctx.beginPath();
      ctx.moveTo(fx, fy - r * 0.82);
      ctx.quadraticCurveTo(fx + r * 0.14, fy - r * 1.28, fx + r * 0.3, fy - r * 1.34);
      ctx.stroke();
    }

    /* snake */
    const n = d.snake.length;
    const dying = d.status === "over" && !d.win;
    const blink =
      dying && now - d.deathAt < 1100 && Math.sin((now - d.deathAt) / 55) > 0;

    for (let i = n - 1; i >= 0; i--) {
      const cur = d.snake[i];
      const pv = i < d.prev.length ? d.prev[i] : cur;
      const rx = (pv.x + (cur.x - pv.x) * t) * px;
      const ry = (pv.y + (cur.y - pv.y) * t) * px;
      const f = n === 1 ? 0 : i / (n - 1);
      const taper = 1 - f * 0.3;
      const size = px * (i === 0 ? 0.94 : 0.82) * taper;
      const pad = (px - size) / 2;
      if (i === 0) {
        ctx.shadowColor = "rgba(184,240,77,0.75)";
        ctx.shadowBlur = px * 0.55;
      }
      ctx.fillStyle = blink && i % 2 === 0 ? "#ff6b5e" : mix(HEAD_RGB, TAIL_RGB, f);
      rr(ctx, rx + pad, ry + pad, size, size, size * 0.34);
      ctx.fill();
      ctx.shadowBlur = 0;
      /* subtle top sheen on every 3rd segment */
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

    /* vignette */
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.34, W / 2, H / 2, W * 0.74);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.44)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
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

  return {
    canvasRef,
    wrapRef,
    status,
    score,
    eaten,
    best: bests[difficulty],
    bests,
    difficulty,
    muted,
    isNewBest,
    win,
    speedPct,
    start: startGame,
    restart,
    togglePause,
    setDirection,
    changeDifficulty,
    toggleMute,
  };
}
