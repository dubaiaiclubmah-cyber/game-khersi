let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beep(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.045,
  slide = 0
) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (slide !== 0) {
      o.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq + slide),
        c.currentTime + dur
      );
    }
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {
    /* audio is decoration — never break the game */
  }
}

export const sfx = {
  eat() {
    beep(540, 0.09, "square", 0.05, 260);
  },
  die() {
    beep(320, 0.42, "sawtooth", 0.055, -270);
  },
  start() {
    beep(430, 0.08, "square", 0.045, 240);
  },
  pause() {
    beep(330, 0.09, "triangle", 0.05, -120);
  },
  record() {
    beep(620, 0.1, "square", 0.05, 0);
    setTimeout(() => beep(830, 0.12, "square", 0.05, 0), 110);
    setTimeout(() => beep(1040, 0.18, "square", 0.05, 120), 230);
  },
};
