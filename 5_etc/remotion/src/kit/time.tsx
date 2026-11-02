import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, prog } from './anim';
import type { Cue } from './srt';

// Scenes are authored in absolute seconds pinned to SRT cues (T(12) = start of cue 12),
// but each one lives in its own <Sequence> so it shows up as a block in Remotion Studio.
// useT() turns the Sequence-relative frame back into absolute seconds.

const Offset = createContext(0);

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame + useContext(Offset)) / fps;
};

export type Timing = { T: (n: number, off?: number) => number; TE: (n: number, off?: number) => number };
export const timing = (cues: Cue[]): Timing => {
  const by = new Map(cues.map((c) => [c.n, c]));
  const get = (n: number) => { const c = by.get(n); if (!c) throw new Error(`cue ${n}`); return c; };
  return { T: (n, off = 0) => get(n).s + off, TE: (n, off = 0) => get(n).e + off };
};

/**
 * A scene from `s` to `e` seconds; `impact` switches it to the bold white-type theme (pro.css).
 * `fadeIn` overrides the 0.25s fade-in. `tail` > 0: the scene lingers `tail` seconds past `e` without its exit, so the next scene can cross-dissolve over it.
 */
export const Scene: React.FC<{ s: number; e: number; name?: string; impact?: boolean; tail?: number; fadeIn?: number; children: React.ReactNode }> = ({ s, e, name, impact, tail = 0, fadeIn, children }) => {
  const { fps } = useVideoConfig();
  const from = Math.round(s * fps);
  const dur = Math.max(1, Math.round((e + tail) * fps) - from);
  return (
    <Sequence from={from} durationInFrames={dur} name={name} layout="none">
      <Offset.Provider value={from}>
        <SceneFade s={s} e={tail ? Infinity : e} impact={impact} fadeIn={fadeIn}>{children}</SceneFade>
      </Offset.Provider>
    </Sequence>
  );
};

// exit: the whole scene recedes (scale down, lift, blur) while the next one arrives
const SceneFade: React.FC<{ s: number; e: number; impact?: boolean; fadeIn?: number; children: React.ReactNode }> = ({ s, e, impact, fadeIn = 0.25, children }) => {
  const t = useT();
  const out = Number.isFinite(e) ? prog(t, e - 0.4, 0.38, E.p2in) : 0;
  const o = prog(t, s, fadeIn, E.p2) * (1 - out);
  return <AbsoluteFill className={`scene${impact ? ' impact' : ''}`}
    style={{ opacity: o, transform: out ? `translateY(${-24 * out}px) scale(${1 - 0.05 * out})` : undefined, filter: out > 0.02 ? `blur(${(10 * out).toFixed(2)}px)` : undefined }}>{children}</AbsoluteFill>;
};
