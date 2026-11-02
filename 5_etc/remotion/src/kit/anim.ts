import type { CSSProperties } from 'react';
import { Easing, interpolate } from 'remotion';

// Seek-safe motion helpers. Every helper is a pure function of the current time `t` (seconds),
// so any frame renders the same picture no matter the order frames are rendered in.
// Before `at` an element holds its "from" state, after it settles its "to" state.
//
// Entrances use a damped spring (closed form, no frame state), so things overshoot and settle
// like physical objects, and carry a little blur while they move fast (cheap motion blur).

export const E = {
  linear: (x: number) => x,
  back: (s = 1.8) => Easing.out(Easing.back(s)),
  p2: Easing.out(Easing.cubic),
  p3: Easing.out(Easing.poly(4)),
  p2in: Easing.in(Easing.cubic),
  p2io: Easing.inOut(Easing.cubic),
  expo: Easing.out(Easing.exp),
  sine: Easing.inOut(Easing.sin),
};

/** 0 → 1 between `at` and `at + d`, clamped, eased. */
export const prog = (t: number, at: number, d: number, ease: (x: number) => number = E.linear) =>
  interpolate(t, [at, at + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/**
 * Damped spring 0 → 1 starting at `at`. zeta < 1 overshoots (0.4 bouncy, 0.75 smooth), w = stiffness (rad/s).
 * Returns { v: position, vel: |velocity| normalised } — vel drives motion blur.
 */
export const spr = (t: number, at: number, zeta = 0.6, w = 12) => {
  const x = t - at;
  if (x <= 0) return { v: 0, vel: 0 };
  const wd = w * Math.sqrt(1 - zeta * zeta);
  const env = Math.exp(-zeta * w * x);
  const v = 1 - env * (Math.cos(wd * x) + ((zeta * w) / wd) * Math.sin(wd * x));
  const vel = Math.abs(env * (w * w / wd) * Math.sin(wd * x)) / w;
  return { v, vel };
};

/** Yoyo pulse 0 → 1 → 0 …, `reps` like GSAP repeat (repeat:1 = there and back). Ends at rest. */
export const yoyo = (t: number, at: number, d: number, reps: number, ease = E.sine) => {
  const halves = reps + 1;
  if (t <= at) return 0;
  const k = Math.floor((t - at) / d);
  if (k >= halves) return halves % 2 ? 1 : 0;
  const local = ease((t - at) / d - k);
  return k % 2 ? 1 - local : local;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** A partial style: opacity multiplies, transforms and filters concatenate. Combine with mx(). */
export type A = { o?: number; tf?: string; f?: string; css?: CSSProperties };
export const mx = (...as: A[]): CSSProperties => {
  let o = 1;
  const tf: string[] = [];
  const fl: string[] = [];
  let css: CSSProperties = {};
  for (const a of as) {
    if (a.o !== undefined) o *= a.o;
    if (a.tf) tf.push(a.tf);
    if (a.f) fl.push(a.f);
    if (a.css) css = { ...css, ...a.css };
  }
  return { ...css, opacity: clamp01(o), transform: tf.length ? tf.join(' ') : undefined, filter: fl.length ? fl.join(' ') : undefined };
};
const blur = (px: number) => (px > 0.15 ? `blur(${px.toFixed(2)}px)` : undefined);

export const pop = (t: number, at: number): A => {
  const { v, vel } = spr(t, at, 0.42, 15);
  return { o: prog(t, at, 0.16), tf: `scale(${0.35 + 0.65 * v})`, f: blur(Math.min(8, vel * 9)) };
};
export const up = (t: number, at: number, dy = 30): A => {
  const { v, vel } = spr(t, at, 0.72, 11);
  return { o: prog(t, at, 0.3), tf: `translateY(${dy * 1.8 * (1 - v)}px)`, f: blur(Math.min(6, vel * 7)) };
};
/** Card entrance — swings in from depth (3D) with a sheen sweep (--sheen drives .card::after). */
export const rise = (t: number, at: number): A => {
  const { v, vel } = spr(t, at, 0.68, 9);
  return {
    o: prog(t, at, 0.3),
    tf: `perspective(1800px) translateY(${110 * (1 - v)}px) rotateX(${16 * (1 - v)}deg) rotateY(${-10 * (1 - v)}deg) scale(${0.9 + 0.1 * v})`,
    f: blur(Math.min(10, vel * 12)),
    css: { ['--sheen' as string]: prog(t, at + 0.25, 1.1, E.p2io) } as CSSProperties,
  };
};
export const slide = (t: number, at: number, dx = 60): A => {
  const { v, vel } = spr(t, at, 0.66, 12);
  return { o: prog(t, at, 0.25), tf: `translateX(${dx * 1.8 * (1 - v)}px)`, f: blur(Math.min(7, vel * 8)) };
};
export const slam = (t: number, at: number): A => {
  const { v, vel } = spr(t, at, 0.48, 16);
  return { o: prog(t, at, 0.12), tf: `scale(${1.9 - 0.9 * v})`, f: blur(Math.min(14, vel * 16)) };
};
export const stamp = (t: number, at: number): A => {
  const { v, vel } = spr(t, at, 0.38, 17);
  return { o: prog(t, at, 0.1), tf: `scale(${2.8 - 1.8 * v}) rotate(${-16 * (1 - v)}deg)`, f: blur(Math.min(10, vel * 10)) };
};
export const pulse = (t: number, at: number, d: number, reps: number, amount: number): A => ({ tf: `scale(${1 + amount * yoyo(t, at, d, reps)})` });
export const shake = (t: number, at: number, d: number, reps: number, px: number): A => ({ tf: `translateX(${px * yoyo(t, at, d, reps, E.linear)}px)` });
export const spin = (t: number, at: number, d: number, reps: number, deg: number): A => ({ tf: `rotate(${deg * yoyo(t, at, d, reps)}deg)` });
/** Slow continuous float, for idle life (phase in seconds). */
export const float = (t: number, amp = 6, period = 3.2, phase = 0): A => ({ tf: `translateY(${amp * Math.sin((2 * Math.PI * (t + phase)) / period)}px)` });

/** Highlighter sweep for <Hl> (drives --hlw; pro.css sizes the marker, thinner on impact scenes). */
export const sweep = (t: number, at: number): CSSProperties => ({ ['--hlw' as string]: 100 * prog(t, at, 0.6, E.p2io) } as CSSProperties);
/** Line draw for paths with pathLength="1". */
export const draw = (t: number, at: number, d: number): CSSProperties => ({ strokeDashoffset: 1 - prog(t, at, d, E.p2io) });
/** Bar fill (scaleX) with a springy settle, optionally in several stages: [[at, to, duration], …]. */
export const grow = (t: number, stages: [number, number, number][]): CSSProperties => {
  let v = 0;
  for (const [at, to, d] of stages) if (t >= at) v = v + (to - v) * spr(t, at, 0.7, 5.5 / d).v;
  return { transform: `scaleX(${v})` };
};
/** Integer count-up (ease-out, so the last numbers tick slower). */
export const count = (t: number, at: number, d: number, n: number) => Math.round(n * prog(t, at, d, E.p2));
