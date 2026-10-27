import React from 'react';
import { AbsoluteFill, Img, random, staticFile } from 'remotion';
import { E, mx, pop, prog, rise, spin, spr, sweep, up, yoyo } from './anim';
import type { Cue } from './srt';
import { Hl, Pill, Svg, C } from './ui';

// Persistent layers: pastel background, the 필로소피 character, brand + chapter chips,
// the caption band and the start/end fades. Scenes sit between the background and the band.

const decorPos = [[120, 140], [420, 90], [780, 60], [1180, 110], [1560, 80], [1820, 190], [70, 480], [1860, 470], [160, 800], [560, 840], [1360, 850], [1780, 780], [980, 820], [300, 360], [1640, 330]];
const decor = decorPos.map(([x, y], i) => ({
  x, y, kind: ['dia', 'ring', 'dot', 'dia', 'dot'][i % 5], color: ['#7fd1ae', '#b9acf2', '#f4c25b', '#f39a86', '#f3a3b8'][i % 5],
  size: 14 + random(`dc-size-${i}`) * 12, ph: random(`dc-ph-${i}`), amp: 5 + random(`dc-amp-${i}`) * 7,
}));
const blobs = [
  { left: -220, top: -200, width: 900, height: 760, c: '255,205,186', a: 0.75 },
  { left: 1180, top: 380, width: 980, height: 820, c: '207,195,255', a: 0.7 },
  { left: 700, top: -260, width: 760, height: 600, c: '185,232,209', a: 0.6 },
];

export const StageBg: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill className="stagebg">
    {blobs.map((b, i) => {
      const w = (1 - Math.cos((2 * Math.PI * Math.max(0, t - i * 0.4)) / 14)) / 2;
      return <div key={i} className="blob" style={{ left: b.left, top: b.top, width: b.width, height: b.height, transform: `translateX(${40 * w}px) scale(${1 + 0.12 * w})`,
        background: `radial-gradient(closest-side,rgba(${b.c},${b.a}),rgba(${b.c},0))` }} />;
    })}
    {decor.map((d, i) => {
      const a = (t / 9 + d.ph) * Math.PI * 2;
      return <span key={i} className={`dc dc-${d.kind}`} style={{ left: d.x, top: d.y, width: d.size, height: d.size, ['--c' as string]: d.color,
        transform: `translate(${Math.cos(a * 0.7) * d.amp}px,${Math.sin(a) * d.amp * 1.4}px) rotate(${45 + Math.sin(a * 0.5) * 30}deg)` } as React.CSSProperties} />;
    })}
  </AbsoluteFill>
);

export type Kind = 'say' | 'full';

/** The character walks in for 'say' scenes and out for 'full' scenes; hops on every new card, waves at the end. */
export const Character: React.FC<{ t: number; scenes: { s: number; kind: Kind }[]; waveAt?: number; children?: React.ReactNode }> = ({ t, scenes, waveAt, children }) => {
  let v = 0;
  let hop = 0;
  scenes.forEach((g, i) => {
    const prev = i ? scenes[i - 1].kind : 'full';
    if (g.kind !== prev) {
      if (g.kind === 'say' && t >= g.s + 0.1) v += (1 - v) * spr(t, g.s + 0.1, 0.62, 9).v;
      if (g.kind === 'full' && t >= g.s - 0.25) v += (0 - v) * prog(t, g.s - 0.25, 0.4, E.p2in);
    } else if (g.kind === 'say') hop = Math.max(hop, yoyo(t, g.s, 0.18, 1, E.p2));
  });
  const breathe = (1 - Math.cos((2 * Math.PI * Math.max(0, t - 1)) / 0.46)) / 2;
  const sway = -1.6 * Math.cos((2 * Math.PI * Math.max(0, t - 1)) / 2.6);
  const wave = waveAt === undefined ? '' : mx(spin(t, waveAt, 0.3, 5, -5)).transform;
  return (
    <AbsoluteFill className="charclip">
      {children}
      <div className="cwrap" style={{ opacity: Math.min(1, Math.max(0, v * 3)), transform: `translateX(${-620 * (1 - v)}px) rotate(${sway + 14 * (1 - v)}deg)` }}>
        <Img className="cphil" src={staticFile('characters/philosophy.png')}
          style={{ transform: `translateY(${-26 * hop}px) scale(${1 - 0.008 * breathe}, ${1 + 0.018 * breathe}) ${wave ?? ''}` }} />
        <div className="ctag"><Pill dot={C.coral} soft={false}>필로소피</Pill></div>
      </div>
    </AbsoluteFill>
  );
};

export const Brand: React.FC<{ name?: string; sub?: string }> = ({ name = '필로소피', sub = 'AI 교육' }) =>
  <div id="brand"><span className="pdot" style={{ background: '#9a8be6' }} /><span>{name}</span><b>{sub}</b></div>;

/** Top-right chapter chip; sections = [start, end, number, label]. */
export const ChapterChip: React.FC<{ t: number; sections: [number, number, string, string][] }> = ({ t, sections }) => {
  const sec = sections.find(([s, e]) => t >= s && t < e);
  if (!sec) return null;
  const p = spr(t, sec[0] + 0.3, 0.6, 12).v;
  return <div className="chapter"><div className="chip-in" style={{ opacity: Math.min(1, p * 2), transform: `translateX(${60 * (1 - p)}px)` }}><b>{sec[2]}</b><span>{sec[3]}</span>
    <i className="chip-prog" style={{ transform: `scaleX(${prog(t, sec[0], sec[1] - sec[0])})` }} /></div></div>;
};

/**
 * Karaoke caption band: words light up as they are spoken. SRT has cue-level timing only, so word
 * times are spread across the cue by character count. `kw` colours key terms.
 */
export const Captions: React.FC<{ t: number; cues: Cue[]; kw?: RegExp }> = ({ t, cues, kw }) => {
  const cue = cues.find((c) => t >= c.s && t < c.e);
  let line: React.ReactNode = null;
  if (cue) {
    const words = cue.text.split(' ');
    const w = words.map((x) => x.length + 1);
    const total = w.reduce((a, b) => a + b, 0);
    const span = (cue.e - cue.s) * 0.9;
    let acc = 0;
    const p = spr(t, cue.s, 0.7, 16).v;
    line = (
      <span className="capl" style={{ transform: `translateY(${12 * (1 - p)}px)`, opacity: Math.min(1, p * 1.6) }}>
        {words.map((x, i) => {
          const ws = cue.s + (acc / total) * span;
          acc += w[i];
          const we = cue.s + (acc / total) * span;
          const state = t < ws ? 'next' : t < we ? 'now' : 'done';
          return <React.Fragment key={i}>{i > 0 && ' '}<span className={`w ${state}${kw && kw.test(x) ? ' kw' : ''}`}>{x}</span></React.Fragment>;
        })}
      </span>
    );
  }
  return (
    <>
      <div id="band">
        <span className="bdot" style={{ left: 40, top: 70, width: 16, height: 16, background: '#ffc7b4' }} />
        <span className="bdot" style={{ left: 68, top: 94, width: 10, height: 10, background: '#b9e8d1' }} />
        <span className="bdot" style={{ right: 46, top: 66, width: 14, height: 14, background: '#cfc3ff' }} />
        <span className="bdot" style={{ right: 72, top: 96, width: 10, height: 10, background: '#ffe39c' }} />
      </div>
      {line && <div className="cap"><span>{line}</span></div>}
    </>
  );
};

/** End card on the right of the character: headline + 좋아요 / 구독. */
export const EndCard: React.FC<{ t: number; at: number; likeAt: number; thanksAt: number; title: React.ReactNode; hlText: string }> = ({ t, at, likeAt, thanksAt, title, hlText }) => {
  if (t < at) return null;
  return (
    <AbsoluteFill style={{ zIndex: 5 }}>
      <div className="endin" style={mx(rise(t, at + 0.1))}>
        <div className="end-k" style={mx(up(t, at + 0.3, 16))}>오늘의 영상은 여기까지입니다</div>
        <div className="end-big" style={mx(up(t, at + 0.5, 30))}>{title}<Hl style={sweep(t, at + 1.2)}>{hlText}</Hl></div>
        <div className="row gap">
          <div className="cta" style={mx(pop(t, likeAt), spin(t, likeAt + 0.7, 0.18, 3, -12))}><Svg name="thumb" color="#ffffff" /><span>좋아요</span></div>
          <div className="cta sub2" style={mx(pop(t, likeAt + 0.6))}><Svg name="bell" color="#ffffff" /><span>구독</span></div>
        </div>
        <div className="end-mid" style={mx(up(t, thanksAt, 14))}>감사합니다 · 필로소피 AI 교육</div>
      </div>
    </AbsoluteFill>
  );
};

/** Cream fade from/to at the very start and end. */
export const Fades: React.FC<{ t: number; dur: number }> = ({ t, dur }) => (
  <>
    <AbsoluteFill style={{ zIndex: 20, background: '#fdf6ee', opacity: 1 - prog(t, 0, 0.5) }} />
    <AbsoluteFill style={{ zIndex: 20, background: '#fdf6ee', opacity: prog(t, dur - 0.7, 0.7, E.p2in) }} />
  </>
);
