import React from 'react';
import type { CSSProperties } from 'react';
import { AbsoluteFill, Audio, random, Sequence, staticFile, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { E, prog, spr } from './anim';
import { type IconName } from './icons';
import { Svg } from './ui';

// Cinematic layers on top of the pastel kit: living background, impact backdrop, wipes,
// particle bursts, shockwaves, camera, kinetic type, character emotes and sound effects.
// Everything is a pure function of `t` (seconds) — random() is seeded, noise2D is deterministic.

// ---------- living background --------------------------------------------------
const AURORA = [
  { x: 280, y: 180, r: 620, c: '255,196,172', a: 0.85 },
  { x: 1560, y: 760, r: 700, c: '200,186,255', a: 0.8 },
  { x: 1050, y: 90, r: 560, c: '178,232,207', a: 0.65 },
  { x: 520, y: 900, r: 520, c: '255,192,214', a: 0.55 },
  { x: 1700, y: 160, r: 460, c: '190,218,255', a: 0.6 },
];
const BOKEH = Array.from({ length: 30 }, (_, i) => {
  const depth = [0.35, 0.65, 1][i % 3];
  return {
    x: random(`bk-x-${i}`) * 1920, y: random(`bk-y-${i}`) * 1080, depth,
    size: (10 + random(`bk-s-${i}`) * 34) * (0.6 + depth),
    color: ['255,255,255', '255,214,170', '214,200,255', '190,240,215', '255,200,220'][i % 5],
    a: 0.25 + random(`bk-a-${i}`) * 0.45, speed: 8 + random(`bk-v-${i}`) * 14,
  };
});
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.35  0 0 0 0.9 0"/></filter><rect width="220" height="220" filter="url(#n)"/></svg>')}")`;

export const Backdrop: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(135deg, #fff4ea 0%, #fdf0f4 50%, #efedff 100%)', overflow: 'hidden' }}>
    {AURORA.map((b, i) => {
      const dx = noise2D(`au-x-${i}`, t * 0.045, 0) * 220;
      const dy = noise2D(`au-y-${i}`, 0, t * 0.045) * 160;
      const s = 1 + 0.18 * noise2D(`au-s-${i}`, t * 0.03, 1);
      return <div key={i} style={{ position: 'absolute', left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%',
        background: `radial-gradient(closest-side, rgba(${b.c},${b.a}), rgba(${b.c},0))`, transform: `translate(${dx}px,${dy}px) scale(${s})` }} />;
    })}
  </AbsoluteFill>
);

/** Floating bokeh with parallax (cam = camera drift in px). */
export const Bokeh: React.FC<{ t: number; cam: [number, number]; light?: number }> = ({ t, cam, light = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 2 }}>
    {BOKEH.map((b, i) => {
      const y = ((b.y - t * b.speed * b.depth) % 1180 + 1180) % 1180 - 50;
      const x = b.x + noise2D(`bk-n-${i}`, t * 0.08, i) * 40 - cam[0] * b.depth * 1.6;
      const tw = 0.75 + 0.25 * Math.sin(t * 1.3 + i);
      return <div key={i} style={{ position: 'absolute', left: x, top: y - cam[1] * b.depth * 1.6, width: b.size, height: b.size, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${b.color},${(b.a + light * 0.3) * tw}) 0%, rgba(${b.color},${b.a * 0.35 * tw}) 55%, rgba(${b.color},0) 72%)`,
        filter: b.depth < 0.5 ? 'blur(3px)' : b.depth > 0.9 ? 'blur(1.5px)' : undefined }} />;
    })}
  </AbsoluteFill>
);

/** Film grain + vignette, topmost. */
export const Grain: React.FC<{ frame: number }> = ({ frame }) => {
  const k = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 19 }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(60,40,80,0) 55%, rgba(60,40,80,.16) 100%)' }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, backgroundPosition: `${Math.floor(random(`g-x-${k}`) * 220)}px ${Math.floor(random(`g-y-${k}`) * 220)}px`, opacity: 0.11, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};

// ---------- impact backdrop (for 'full' scenes) ---------------------------------
/** Bold violet→coral stage with slow light rays. Shown between s and e (the wipe hides the cut). */
export const ImpactBackdrop: React.FC<{ t: number; s: number; e: number; hue?: number }> = ({ t, s, e, hue = 0 }) => {
  if (t < s - 0.05 || t > e + 0.05) return null;
  const local = t - s;
  const ang = 135 + 12 * Math.sin(local * 0.25);
  return (
    <AbsoluteFill style={{ zIndex: 1, overflow: 'hidden', filter: hue ? `hue-rotate(${hue}deg)` : undefined }}>
      <AbsoluteFill style={{ background: `linear-gradient(${ang}deg, #5b3fd0 0%, #9a56d6 38%, #e8739b 72%, #ffb183 100%)` }} />
      <AbsoluteFill style={{ background: `conic-gradient(from ${local * 6}deg at 50% 42%, rgba(255,255,255,0) 0deg, rgba(255,255,255,.13) 12deg, rgba(255,255,255,0) 26deg, rgba(255,255,255,0) 52deg, rgba(255,255,255,.1) 64deg, rgba(255,255,255,0) 80deg, rgba(255,255,255,0) 120deg, rgba(255,255,255,.12) 134deg, rgba(255,255,255,0) 150deg, rgba(255,255,255,0) 200deg, rgba(255,255,255,.09) 214deg, rgba(255,255,255,0) 230deg, rgba(255,255,255,0) 280deg, rgba(255,255,255,.12) 296deg, rgba(255,255,255,0) 312deg)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 50% 45% at 50% 42%, rgba(255,236,250,.42), rgba(255,236,250,0) 70%)' }} />
    </AbsoluteFill>
  );
};

// ---------- transitions -----------------------------------------------------------
/** Diagonal colour wipe that fully covers the frame at time `c` (hides a scene cut). */
export const Wipe: React.FC<{ t: number; c: number; dir?: 1 | -1 }> = ({ t, c, dir = 1 }) => {
  const d = 0.8;
  if (t < c - d / 2 || t > c + d / 2) return null;
  const p = E.p2io(prog(t, c - d / 2, d));
  const x = dir * (-2900 + 5800 * p);
  const band = (off: number, w: number, bg: string): CSSProperties => ({ position: 'absolute', top: -300, height: 1680, left: '50%', width: w, marginLeft: -w / 2 + off * dir,
    transform: `translateX(${x}px) skewX(-20deg)`, background: bg });
  return (
    <AbsoluteFill style={{ zIndex: 6, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={band(-1500, 260, 'linear-gradient(90deg,#ffd9c8,#ffe9a8)')} />
      <div style={band(-1120, 380, 'linear-gradient(90deg,#c7b8ff,#f7b5cc)')} />
      <div style={band(0, 2400, 'linear-gradient(90deg,#7a5ae0,#b562d2 45%,#ee7f9f 80%,#ffb48a)')} />
      <div style={band(1350, 160, 'rgba(255,255,255,.9)')} />
    </AbsoluteFill>
  );
};

/** White flash at an impact. */
export const Flash: React.FC<{ t: number; at: number; strength?: number }> = ({ t, at, strength = 0.55 }) => {
  if (t < at || t > at + 0.4) return null;
  return <AbsoluteFill style={{ zIndex: 14, background: '#fff', opacity: strength * (1 - prog(t, at, 0.35, E.p2)), pointerEvents: 'none' }} />;
};

// ---------- particles ---------------------------------------------------------------
const PCOL = ['#ffd56b', '#ff9fb8', '#b9a6ff', '#8fe0bd', '#ffffff', '#ffb183'];
/** Radial confetti burst from (x, y) at `at`. */
export const Burst: React.FC<{ t: number; at: number; x: number; y: number; n?: number; power?: number; seed?: string }> = ({ t, at, x, y, n = 28, power = 1, seed = 'b' }) => {
  const dt = t - at;
  if (dt < 0 || dt > 1.6) return null;
  return (
    <AbsoluteFill style={{ zIndex: 13, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`${seed}-a-${i}`) * 0.5;
        const sp = (520 + random(`${seed}-v-${i}`) * 680) * power;
        const k = 2.6;
        const dist = (sp / k) * (1 - Math.exp(-k * dt));
        const px = x + Math.cos(a) * dist;
        const py = y + Math.sin(a) * dist + 260 * dt * dt;
        const size = 8 + random(`${seed}-s-${i}`) * 14;
        const shape = i % 3;
        return <div key={i} style={{ position: 'absolute', left: px - size / 2, top: py - size / 2, width: size, height: shape === 2 ? size * 0.45 : size,
          borderRadius: shape === 0 ? '50%' : 3, background: PCOL[i % PCOL.length], opacity: 1 - prog(t, at + 0.6, 1.0),
          transform: `rotate(${(random(`${seed}-r-${i}`) - 0.5) * 900 * dt}deg) scale(${1 - 0.5 * prog(t, at + 0.5, 1.1)})`,
          boxShadow: '0 0 12px rgba(255,255,255,.6)' }} />;
      })}
    </AbsoluteFill>
  );
};

/** Expanding shockwave ring. */
export const Ring: React.FC<{ t: number; at: number; x: number; y: number; r?: number; color?: string }> = ({ t, at, x, y, r = 460, color = 'rgba(255,255,255,.95)' }) => {
  if (t < at || t > at + 0.9) return null;
  const p = prog(t, at, 0.85, E.expo);
  const rad = 30 + r * p;
  return <div style={{ position: 'absolute', zIndex: 13, left: x - rad, top: y - rad, width: rad * 2, height: rad * 2, borderRadius: '50%',
    border: `${Math.max(1, 14 * (1 - p))}px solid ${color}`, opacity: 1 - p, pointerEvents: 'none' }} />;
};

/** Twinkling sparkle stars around a point (for wins / highlights). */
export const Sparkles: React.FC<{ t: number; at: number; x: number; y: number; spread?: number; seed?: string }> = ({ t, at, x, y, spread = 420, seed = 'sp' }) => {
  if (t < at || t > at + 2.4) return null;
  return (
    <AbsoluteFill style={{ zIndex: 13, pointerEvents: 'none' }}>
      {Array.from({ length: 9 }, (_, i) => {
        const d0 = at + i * 0.09;
        const life = prog(t, d0, 0.35, E.p2) * (1 - prog(t, d0 + 1.2, 0.6));
        const px = x + (random(`${seed}-x-${i}`) - 0.5) * spread * 2;
        const py = y + (random(`${seed}-y-${i}`) - 0.5) * spread * 0.9;
        const s = 18 + random(`${seed}-s-${i}`) * 26;
        return <svg key={i} viewBox="0 0 40 40" style={{ position: 'absolute', left: px, top: py, width: s, height: s, opacity: life, transform: `scale(${0.4 + 0.6 * life}) rotate(${(t - d0) * 60}deg)` }}>
          <path d="M20 0C22 14 26 18 40 20 26 22 22 26 20 40 18 26 14 22 0 20 14 18 18 14 20 0z" fill={i % 2 ? '#ffe08a' : '#ffffff'} /></svg>;
      })}
    </AbsoluteFill>
  );
};

// ---------- camera --------------------------------------------------------------------
/** Slow handheld drift + punch-in kicks and shakes at impact times. Returns transform + drift for parallax. */
export const camera = (t: number, kicks: number[]) => {
  const dx = noise2D('cam-x', t * 0.07, 0) * 9;
  const dy = noise2D('cam-y', 0, t * 0.07) * 6;
  let scale = 1.02 + 0.008 * noise2D('cam-s', t * 0.05, 3);
  let sx = 0, sy = 0;
  for (const k of kicks) {
    const x = t - k;
    if (x < 0 || x > 1.2) continue;
    scale += 0.055 * (x * 9) * Math.exp(1 - x * 9);
    const sh = Math.exp(-x * 9) * 14;
    sx += sh * Math.sin(x * 70);
    sy += sh * 0.6 * Math.cos(x * 83);
  }
  return { transform: `translate(${dx + sx}px, ${dy + sy}px) scale(${scale})`, drift: [dx, dy] as [number, number] };
};

// ---------- kinetic type ------------------------------------------------------------------
export type KPart = string | { hl: string; c?: string } | { em: string };
/**
 * Per-character spring typography. Parts: plain strings ('\n' breaks a line) or { hl } for a highlighted run,
 * which gets its highlighter sweep right after its letters land.
 */
export const Kinetic: React.FC<{ t: number; at: number; parts: KPart[]; stagger?: number; className?: string; style?: CSSProperties; inline?: boolean }> = ({ t, at, parts, stagger = 0.032, className = 'mt', style, inline }) => {
  let i = 0;
  const ch = (c: string, key: string) => {
    const t0 = at + i++ * stagger;
    if (c === ' ') return <span key={key} className="ksp">{' '}</span>;
    const { v, vel } = spr(t, t0, 0.55, 13);
    return <span key={key} className="kch" style={{ opacity: prog(t, t0, 0.14), filter: vel > 0.02 ? `blur(${Math.min(10, vel * 12).toFixed(2)}px)` : undefined,
      transform: `translateY(${(1 - v) * 0.75}em) rotateX(${(1 - v) * -75}deg) scale(${0.7 + 0.3 * v})` }}>{c}</span>;
  };
  const out: React.ReactNode[] = [];
  parts.forEach((p, pi) => {
    if (typeof p === 'string') {
      p.split('\n').forEach((line, li) => {
        if (li) out.push(<br key={`br-${pi}-${li}`} />);
        [...line].forEach((c, ci) => out.push(ch(c, `${pi}-${li}-${ci}`)));
      });
    } else if ('em' in p) {
      out.push(<span key={`em-${pi}`} className="ink2">{[...p.em].map((c, ci) => ch(c, `${pi}-e-${ci}`))}</span>);
    } else {
      const chars = [...p.hl].map((c, ci) => ch(c, `${pi}-h-${ci}`));
      const sw = prog(t, at + i * stagger + 0.05, 0.55, E.p2io);
      out.push(<span key={`hl-${pi}`} className="hl" style={{ ['--hlc' as string]: p.c ?? 'var(--hl-y)', ['--hlw' as string]: sw * 100 } as CSSProperties}>{chars}</span>);
    }
  });
  return inline ? <span className={className} style={style}>{out}</span> : <div className={className} style={{ perspective: 900, ...style }}>{out}</div>;
};
/** When a Kinetic line finishes landing (for chaining beats). */
export const kineticEnd = (at: number, parts: KPart[], stagger = 0.032) =>
  at + parts.reduce((n, p) => n + [...(typeof p === 'string' ? p.replace(/\n/g, '') : 'em' in p ? p.em : p.hl)].length, 0) * stagger;

// ---------- character emotes ----------------------------------------------------------------
/** Little reaction bubble above the character's head. */
export const Emote: React.FC<{ t: number; at: number; icon: IconName; color: string; bg: string; hold?: number }> = ({ t, at, icon, color, bg, hold = 1.8 }) => {
  if (t < at || t > at + hold + 0.5) return null;
  const { v } = spr(t, at, 0.4, 14);
  const out = prog(t, at + hold, 0.35, E.p2in);
  return (
    <div className="emote" style={{ opacity: 1 - out, transform: `translateY(${-14 * Math.sin((t - at) * 3) - 40 * out}px) scale(${(0.3 + 0.7 * v) * (1 - 0.3 * out)}) rotate(${(1 - v) * -25}deg)` }}>
      <div className="emote-in" style={{ background: bg }}><Svg name={icon} color={color} /></div>
    </div>
  );
};

// ---------- sound effects -------------------------------------------------------------------
export type Sfx = { at: number; name: 'whoosh' | 'hit' | 'pop' | 'ding' | 'tick'; vol?: number };
const SFX_LEN = { whoosh: 0.8, hit: 1.1, pop: 0.25, ding: 1.4, tick: 0.06 };
export const SfxTrack: React.FC<{ events: Sfx[] }> = ({ events }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {events.map((e, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(e.at * fps))} durationInFrames={Math.ceil(SFX_LEN[e.name] * fps) + 2} layout="none" name={`sfx ${e.name}`}>
          <Audio src={staticFile(`sfx/${e.name}.wav`)} volume={e.vol ?? 0.3} />
        </Sequence>
      ))}
    </>
  );
};
