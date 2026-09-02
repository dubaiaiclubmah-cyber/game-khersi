export const GRID = 21;

export interface Cell {
  x: number;
  y: number;
}

export type Dir = "up" | "down" | "left" | "right";
export type DiffKey = "chill" | "classic" | "blazing";

export interface Difficulty {
  key: DiffKey;
  /** ms per step at start */
  stepMs: number;
  /** fastest allowed step */
  minMs: number;
  /** ms shaved off per apple */
  speedup: number;
  /** score multiplier per apple */
  mult: number;
  color: string;
}

export const DIFFICULTIES: Record<DiffKey, Difficulty> = {
  chill: { key: "chill", stepMs: 168, minMs: 122, speedup: 1.5, mult: 1, color: "#4de3c2" },
  classic: { key: "classic", stepMs: 118, minMs: 82, speedup: 2, mult: 2, color: "#ffc94d" },
  blazing: { key: "blazing", stepMs: 82, minMs: 54, speedup: 3, mult: 3, color: "#ff6b5e" },
};

export const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const DELTA: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function makeSnake(): Cell[] {
  const c = Math.floor(GRID / 2);
  return [
    { x: c, y: c },
    { x: c - 1, y: c },
    { x: c - 2, y: c },
  ];
}

export function randomFree(exclude: Cell[]): Cell | null {
  const taken = new Set(exclude.map((c) => c.x + "," + c.y));
  const free: Cell[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!taken.has(x + "," + y)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

export function randomFood(snake: Cell[], obstacles: Cell[] = []): Cell | null {
  return randomFree([...snake, ...obstacles]);
}

/* ---------------- worlds ---------------- */

export type WorldKey = "garden" | "ocean" | "space" | "circuit";

export interface WorldDef {
  key: WorldKey;
  /** pass through the edges instead of dying */
  wrap: boolean;
  /** static blocks that kill on contact */
  obstacles: Cell[];
  obstacleBase: string;
  obstacleRim: string;
  foodMain: string;
  foodGlow: string;
  bonusMain: string;
  bonusGlow: string;
  /** snake tint overrides (fall back to the active palette when absent) */
  headRGB?: [number, number, number];
  tailRGB?: [number, number, number];
  headGlow?: string;
  /** translucent wash over the checkerboard */
  tint?: string;
}

export const WORLD_ORDER: WorldKey[] = ["garden", "ocean", "space", "circuit"];

const circuitObstacles: Cell[] = [
  { x: 4, y: 4 }, { x: 5, y: 4 },
  { x: 15, y: 4 }, { x: 16, y: 4 },
  { x: 4, y: 16 }, { x: 5, y: 16 },
  { x: 15, y: 16 }, { x: 16, y: 16 },
  { x: 10, y: 6 }, { x: 10, y: 7 },
  { x: 10, y: 13 }, { x: 10, y: 14 },
];

export const WORLDS: Record<WorldKey, WorldDef> = {
  garden: {
    key: "garden",
    wrap: false,
    obstacles: [],
    obstacleBase: "#223028",
    obstacleRim: "#567e69",
    foodMain: "#ff6b5e",
    foodGlow: "rgba(255,107,94,0.5)",
    bonusMain: "#ffc94d",
    bonusGlow: "rgba(255,201,77,0.55)",
  },
  ocean: {
    key: "ocean",
    wrap: true,
    obstacles: [],
    obstacleBase: "#123043",
    obstacleRim: "#5eead4",
    foodMain: "#5eead4",
    foodGlow: "rgba(94,234,212,0.5)",
    bonusMain: "#f8fafc",
    bonusGlow: "rgba(248,250,252,0.55)",
    headRGB: [125, 211, 252],
    tailRGB: [2, 132, 199],
    headGlow: "rgba(125,211,252,0.6)",
    tint: "rgba(30,100,180,0.10)",
  },
  space: {
    key: "space",
    wrap: false,
    obstacles: [],
    obstacleBase: "#241a33",
    obstacleRim: "#e879f9",
    foodMain: "#e879f9",
    foodGlow: "rgba(232,121,249,0.5)",
    bonusMain: "#ffd27d",
    bonusGlow: "rgba(255,210,125,0.55)",
    headRGB: [163, 230, 53],
    tailRGB: [192, 60, 220],
    headGlow: "rgba(163,230,53,0.6)",
    tint: "rgba(120,60,200,0.10)",
  },
  circuit: {
    key: "circuit",
    wrap: false,
    obstacles: circuitObstacles,
    obstacleBase: "#1b2733",
    obstacleRim: "#67e8f9",
    foodMain: "#67e8f9",
    foodGlow: "rgba(103,232,249,0.5)",
    bonusMain: "#fbbf24",
    bonusGlow: "rgba(251,191,36,0.55)",
    headRGB: [251, 146, 60],
    tailRGB: [194, 65, 12],
    headGlow: "rgba(251,146,60,0.6)",
    tint: "rgba(0,80,100,0.10)",
  },
};
