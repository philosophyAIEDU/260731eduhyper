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

/** A scene from `s` to `e` seconds: fades in over .4s, out over .35s. */
export const Scene: React.FC<{ s: number; e: number; name?: string; children: React.ReactNode }> = ({ s, e, name, children }) => {
  const { fps } = useVideoConfig();
  const from = Math.round(s * fps);
  const dur = Math.max(1, Math.round(e * fps) - from);
  return (
    <Sequence from={from} durationInFrames={dur} name={name} layout="none">
      <Offset.Provider value={from}>
        <SceneFade s={s} e={e}>{children}</SceneFade>
      </Offset.Provider>
    </Sequence>
  );
};

const SceneFade: React.FC<{ s: number; e: number; children: React.ReactNode }> = ({ s, e, children }) => {
  const t = useT();
  const o = prog(t, s, 0.4, E.p2) * (1 - prog(t, e - 0.37, 0.35, E.p2in));
  return <AbsoluteFill className="scene" style={{ opacity: o }}>{children}</AbsoluteFill>;
};
