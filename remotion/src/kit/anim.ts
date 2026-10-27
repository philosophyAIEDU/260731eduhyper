import type { CSSProperties } from 'react';
import { Easing, interpolate } from 'remotion';

// Seek-safe motion helpers. Every helper is a pure function of the current time `t` (seconds),
// so any frame renders the same picture no matter the order frames are rendered in.
// Before `at` an element holds its "from" state, after `at + duration` its "to" state —
// the same contract as a GSAP fromTo() in the HyperFrames videos.

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

/** A partial style: opacity multiplies, transforms concatenate. Combine with mx(). */
export type A = { o?: number; tf?: string; css?: CSSProperties };
export const mx = (...as: A[]): CSSProperties => {
  let o = 1;
  const tf: string[] = [];
  let css: CSSProperties = {};
  for (const a of as) {
    if (a.o !== undefined) o *= a.o;
    if (a.tf) tf.push(a.tf);
    if (a.css) css = { ...css, ...a.css };
  }
  return { ...css, opacity: clamp01(o), transform: tf.length ? tf.join(' ') : undefined };
};

export const pop = (t: number, at: number): A => { const p = prog(t, at, 0.5, E.back(1.8)); return { o: p, tf: `scale(${0.6 + 0.4 * p})` }; };
export const up = (t: number, at: number, dy = 30): A => { const p = prog(t, at, 0.55, E.p3); return { o: p, tf: `translateY(${dy * (1 - p)}px)` }; };
export const rise = (t: number, at: number): A => { const p = prog(t, at, 0.65, E.expo); return { o: p, tf: `translateY(${70 * (1 - p)}px) scale(${0.97 + 0.03 * p})` }; };
export const slide = (t: number, at: number, dx = 60): A => { const p = prog(t, at, 0.5, E.p3); return { o: p, tf: `translateX(${dx * (1 - p)}px)` }; };
export const slam = (t: number, at: number): A => { const p = prog(t, at, 0.5, E.expo); return { o: p, tf: `translateY(${-10 * (1 - p)}px) scale(${1.35 - 0.35 * p})` }; };
export const stamp = (t: number, at: number): A => { const p = prog(t, at, 0.45, E.back(2.2)); return { o: p, tf: `scale(${2.2 - 1.2 * p}) rotate(${-10 * (1 - p)}deg)` }; };
export const pulse = (t: number, at: number, d: number, reps: number, amount: number): A => ({ tf: `scale(${1 + amount * yoyo(t, at, d, reps)})` });
export const shake = (t: number, at: number, d: number, reps: number, px: number): A => ({ tf: `translateX(${px * yoyo(t, at, d, reps, E.linear)}px)` });
export const spin = (t: number, at: number, d: number, reps: number, deg: number): A => ({ tf: `rotate(${deg * yoyo(t, at, d, reps)}deg)` });

/** Highlighter sweep for <Hl>. */
export const sweep = (t: number, at: number): CSSProperties => ({ backgroundSize: `${100 * prog(t, at, 0.7, E.p2io)}% 38%` });
/** Line draw for paths with pathLength="1". */
export const draw = (t: number, at: number, d: number): CSSProperties => ({ strokeDashoffset: 1 - prog(t, at, d, E.p2) });
/** Bar fill (scaleX), optionally in several stages: [[at, to, duration], …]. */
export const grow = (t: number, stages: [number, number, number][]): CSSProperties => {
  let v = 0;
  for (const [at, to, d] of stages) if (t >= at) v = v + (to - v) * prog(t, at, d, E.p2);
  return { transform: `scaleX(${v})` };
};
/** Integer count-up. */
export const count = (t: number, at: number, d: number, n: number) => Math.round(n * prog(t, at, d));
