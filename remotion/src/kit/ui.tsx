import React from 'react';
import type { CSSProperties } from 'react';
import { type IconName, iconSvg } from './icons';
import { draw, mx, pop, up } from './anim';

// Building blocks of the pastel card style. Class names match src/kit/pastel.css
// (the same stylesheet the HyperFrames videos use), animation comes in through `style`.

export const C = { coral: '#ef8a6f', mint: '#4fb489', lav: '#9a8be6', sky: '#6aa3e6', pink: '#e8708f', yellow: '#e7a92c', grey: '#8e8aa3' };
export const BG = { peach: '#ffe6dc', mint: '#dcf3e8', lav: '#ebe6ff', sky: '#e2eeff', pink: '#ffe3ea', yellow: '#fff1cc', grey: '#efedf3' };
export const HL = { y: 'var(--hl-y)', m: 'var(--hl-m)', p: 'var(--hl-p)' };

type P = { style?: CSSProperties; className?: string };

/** Bare SVG icon (for places where CSS sizes the <svg> directly). */
export const Svg: React.FC<{ name: IconName; color: string }> = ({ name, color }) =>
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: iconSvg(name, color) }} />;

/** Round icon badge: size '' (150) | 'sm' (120) | 'xs' (84). */
export const Ico: React.FC<P & { name: IconName; color: string; bg: string; size?: '' | 'sm' | 'xs' }> = ({ name, color, bg, size = '', style, className = '' }) =>
  <div className={`ico ${size} ${className}`} style={{ background: bg, ...style }}><Svg name={name} color={color} /></div>;

export const Pill: React.FC<P & { dot?: string; soft?: boolean; children: React.ReactNode }> = ({ dot = C.coral, soft = true, style, children }) =>
  <div className={`pill ${soft ? 'pill-soft' : ''}`} style={style}><span className="pdot" style={{ background: dot }} /><span>{children}</span></div>;

export const Ok: React.FC<P & { no?: boolean; size?: '' | 'big' | 'ok-sm'; children: React.ReactNode }> = ({ no, size = '', style, children }) =>
  <div className={`okpill ${no ? 'nopill' : ''} ${size}`} style={style}><span className="okc"><Svg name={no ? 'x' : 'check'} color="#ffffff" /></span><span>{children}</span></div>;

export const Chip: React.FC<P & { name: IconName; color: string; bg: string; children: React.ReactNode }> = ({ name, color, bg, style, children }) =>
  <div className="ichip" style={style}><Ico name={name} color={color} bg={bg} size="xs" /><span>{children}</span></div>;

/** Highlighter-pen span; pass sweep(t, at) as style. */
export const Hl: React.FC<P & { c?: string; children: React.ReactNode }> = ({ c = HL.y, style, children }) =>
  <span className="hl" style={{ ['--hlc' as string]: c, ...style } as CSSProperties}>{children}</span>;

/** → arrow drawn with strokeDashoffset; pass draw(t, at, d) as pathStyle. */
export const Arrow: React.FC<{ sm?: boolean; pathStyle?: CSSProperties }> = ({ sm, pathStyle }) => (
  <svg className={`arrow ${sm ? 'sm' : ''}`} viewBox="0 0 120 24" fill="none" stroke="#5b5873" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <path pathLength={1} d="M4 12h108M98 2l14 10-14 10" style={pathStyle} />
  </svg>
);

/** Icon → arrow → icon … row; each node pops at its own time. */
export const Flow: React.FC<{ t: number; wide?: boolean; nodes: [IconName, string, string, React.ReactNode, number][] }> = ({ t, wide, nodes }) => (
  <div className={`flow ${wide ? 'wide' : ''}`}>
    {nodes.map(([n, c, b, label, at], i) => (
      <React.Fragment key={i}>
        {i > 0 && <Arrow pathStyle={draw(t, at - 0.35, 0.45)} />}
        <div className="node">
          <Ico name={n} color={c} bg={b} style={mx(pop(t, at))} />
          <div className="nlabel" style={mx(up(t, at + 0.15, 16))}>{label}</div>
        </div>
      </React.Fragment>
    ))}
  </div>
);
