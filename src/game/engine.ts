export const GRID = 21;

export interface Cell {
  x: number;
  y: number;
}

export type Dir = "up" | "down" | "left" | "right";
export type DiffKey = "chill" | "classic" | "blazing";

export interface Difficulty {
  key: DiffKey;
  label: string;
  tag: string;
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
  chill: {
    key: "chill",
    label: "CHILL",
    tag: "Slow cruise · ×1 points",
    stepMs: 168,
    minMs: 122,
    speedup: 1.5,
    mult: 1,
    color: "#4de3c2",
  },
  classic: {
    key: "classic",
    label: "CLASSIC",
    tag: "The 1997 Nokia pace · ×2",
    stepMs: 118,
    minMs: 82,
    speedup: 2,
    mult: 2,
    color: "#ffc94d",
  },
  blazing: {
    key: "blazing",
    label: "BLAZING",
    tag: "Full chaos · ×3 points",
    stepMs: 82,
    minMs: 54,
    speedup: 3,
    mult: 3,
    color: "#ff6b5e",
  },
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

export function randomFood(snake: Cell[]): Cell | null {
  const taken = new Set(snake.map((s) => s.x + "," + s.y));
  const free: Cell[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!taken.has(x + "," + y)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}
