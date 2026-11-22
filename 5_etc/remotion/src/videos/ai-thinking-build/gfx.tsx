import React from 'react';
import type { CSSProperties } from 'react';
import { AbsoluteFill, Img, random, staticFile } from 'remotion';
import { noise2D } from '@remotion/noise';
import { draw, E, mx, pop, prog, slide, spr, up, type A } from '../../kit/anim';
import { Kinetic, type KPart } from '../../kit/fx';
import { iconSvg, type IconName } from '../../kit/icons';

// 사진 위에 얹는 그래픽 부품. 전부 t(초)의 순수 함수라 어느 프레임이든 같은 그림이 나온다.

export const GOLD = '#f2c572';
export const CORAL = '#ff8a73';
export const MINT = '#7fe3b6';
export const SKY = '#8fc7ff';
export const INK = '#f7f3ea';
export const SOFT = '#cfc8dc';

type Pos = { x: number; y: number };
export const at = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: h });

export const Icon: React.FC<{ name: IconName; color?: string; size?: number; style?: CSSProperties }> = ({ name, color = GOLD, size = 44, style }) =>
  <span className="ic" style={{ width: size, height: size, ...style }} dangerouslySetInnerHTML={{ __html: iconSvg(name, color) }} />;

/** 한 글자씩 스프링으로 떨어지는 글자. '\n' = 줄바꿈, { em } = 금색. */
export const Kin: React.FC<Pos & { t: number; from: number; parts: KPart[]; size?: number; center?: boolean; w?: number; stagger?: number }> = ({ t, from, parts, x, y, size = 76, center, w, stagger = 0.028 }) => (
  <div style={at(x, y, w)}><Kinetic t={t} at={from} parts={parts} stagger={stagger} className={`kt${center ? ' c' : ''}`} style={{ fontSize: size }} /></div>
);

/** 왼쪽 금색 막대 + 제목. */
export const Head: React.FC<{ t: number; from: number; parts: KPart[]; x?: number; y?: number; size?: number; lines?: number }> = ({ t, from, parts, x = 90, y = 84, size = 72, lines = 1 }) => (
  <>
    <div className="hbar" style={{ left: x, top: y + 8, height: size * 1.1 * lines, transform: `scaleY(${spr(t, from, 0.75, 10).v})` }} />
    <Kin t={t} from={from + 0.08} parts={parts} x={x + 32} y={y} size={size} />
  </>
);

/** 칩: 등장 애니메이션(enter)을 고를 수 있다. */
export const Chip: React.FC<Pos & { t: number; from: number; text: React.ReactNode; icon?: IconName; color?: string; size?: number; enter?: (t: number, a: number) => A; extra?: A; textColor?: string }> =
  ({ t, from, text, icon, color = GOLD, size = 40, x, y, enter = (a, b) => slide(a, b, -26), extra, textColor }) => (
    <div className="chip" style={{ ...at(x, y), fontSize: size, color: textColor, ...mx(enter(t, from), extra ?? {}) }}>
      {icon && <Icon name={icon} color={color} size={size * 1.15} />}<span>{text}</span>
    </div>
  );

/** 동그라미가 그려지고 체크가 찍히는 표시. */
export const CheckMark: React.FC<{ t: number; from: number; size?: number; color?: string; no?: boolean }> = ({ t, from, size = 46, color = GOLD, no }) => (
  <svg viewBox="0 0 48 48" style={{ width: size, height: size, flex: 'none', ...mx(pop(t, from)) }} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="21" strokeWidth="3.5" pathLength={1} strokeDasharray={1} style={draw(t, from, 0.35)} />
    {no ? <path d="M16 16l16 16M32 16L16 32" strokeWidth="5" pathLength={1} strokeDasharray={1} style={draw(t, from + 0.18, 0.25)} />
      : <path d="M14 25l7 7 13-15" strokeWidth="5" pathLength={1} strokeDasharray={1} style={draw(t, from + 0.18, 0.25)} />}
  </svg>
);

/** 말하는 순서대로 체크되는 목록. */
export const CheckList: React.FC<Pos & { t: number; items: [string, number][]; size?: number; color?: string; gap?: number }> = ({ t, items, x, y, size = 42, color = GOLD, gap = 18 }) => (
  <div style={{ ...at(x, y), display: 'flex', flexDirection: 'column', gap, alignItems: 'flex-start' }}>
    {items.map(([text, a]) => (
      <div key={text} className="chip" style={{ fontSize: size, ...mx(slide(t, a, -30)) }}>
        <CheckMark t={t} from={a + 0.05} size={size * 1.15} color={color} /><span>{text}</span>
      </div>
    ))}
  </div>
);

/** 진행 막대: stages = [[시작초, 목표(0~1), 걸리는 초], …]. */
export const barValue = (t: number, stages: [number, number, number][]) => {
  let v = 0;
  for (const [a, to, d] of stages) if (t >= a) v = v + (to - v) * prog(t, a, d, E.p2io);
  return v;
};
export const Bar: React.FC<Pos & { w: number; h?: number; v: number; color?: string; o?: number }> = ({ x, y, w, h = 30, v, color = GOLD, o = 1 }) => (
  <div style={{ ...at(x, y, w, h), borderRadius: h / 2, background: 'rgba(255,255,255,.14)', overflow: 'hidden', opacity: o, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)' }}>
    <div style={{ width: '100%', height: '100%', borderRadius: h / 2, background: color, transformOrigin: '0 50%', transform: `scaleX(${Math.max(0, v)})`, boxShadow: `0 0 18px ${color}` }} />
  </div>
);

/** SVG 전체 무대(1920×1080) — 선 그리기용. */
export const Svg1080: React.FC<{ children: React.ReactNode; style?: CSSProperties }> = ({ children, style }) =>
  <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, overflow: 'visible', pointerEvents: 'none', ...style }} fill="none">{children}</svg>;

/** 그려지는 선. */
export const Line: React.FC<{ t: number; from: number; d: number; path: string; color?: string; w?: number; glow?: boolean; dash?: boolean }> = ({ t, from, d, path, color = GOLD, w = 6, glow = true }) => (
  <path d={path} pathLength={1} strokeDasharray={1} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
    style={{ ...draw(t, from, d), opacity: t < from ? 0 : 1, filter: glow ? `drop-shadow(0 0 10px ${color})` : undefined }} />
);

/** 노드 → 노드 흐름. 화살표가 그려지고 빛 점이 지나간다. */
export const FlowRow: React.FC<Pos & { t: number; nodes: { text: string; at: number; icon?: IconName; hot?: boolean }[]; nodeW?: number; gapW?: number; size?: number; h?: number }> =
  ({ t, nodes, x, y, nodeW = 300, gapW = 90, size = 40, h = 150 }) => (
    <>
      {nodes.map((n, i) => {
        const nx = x + i * (nodeW + gapW);
        return (
          <React.Fragment key={n.text}>
            {i > 0 && (
              <Svg1080>
                <Line t={t} from={n.at - 0.3} d={0.35} w={5} path={`M${nx - gapW + 10} ${y + h / 2}H${nx - 12}M${nx - 30} ${y + h / 2 - 15}l18 15-18 15`} />
              </Svg1080>
            )}
            <div className="pn" style={{ ...at(nx, y, nodeW, h), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: size, fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap',
              background: n.hot ? GOLD : undefined, color: n.hot ? '#1a1420' : undefined, ...mx(pop(t, n.at)) }}>
              {n.icon && <Icon name={n.icon} color={n.hot ? '#1a1420' : GOLD} size={size * 1.25} />}<span>{n.text}</span>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );

/** 3D 로 뒤집히는 카드(약점 → 강점). */
export const FlipCard: React.FC<Pos & { t: number; from: number; flipAt: number; a: string; b: string; w?: number; h?: number; size?: number }> = ({ t, from, flipAt, a, b, x, y, w = 640, h = 190, size = 66 }) => {
  const { v } = spr(t, flipAt, 0.55, 8);
  return (
    <div className="flip" style={{ ...at(x, y, w, h), ...mx(up(t, from, 40)) }}>
      <div className="flip-in" style={{ transform: `rotateY(${180 * v}deg) scale(${1 + 0.12 * Math.sin(Math.min(1, Math.max(0, v)) * Math.PI)})` }}>
        <div className="flip-f a" style={{ fontSize: size }}><small>약점</small>{a}</div>
        <div className="flip-f b" style={{ fontSize: size }}><small>강점</small>{b}</div>
      </div>
    </div>
  );
};

/** 빛줄기(중심 기준 회전). */
export const Rays: React.FC<{ t: number; x?: number; y?: number; o?: number; color?: string }> = ({ t, x = 50, y = 45, o = 0.5, color = '255,226,170' }) => (
  <AbsoluteFill style={{ opacity: o, mixBlendMode: 'screen', background: `conic-gradient(from ${t * 7}deg at ${x}% ${y}%, ${Array.from({ length: 12 }, (_, i) => `rgba(${color},${i % 2 ? 0 : 0.34}) ${i * 30}deg`).join(', ')}, rgba(${color},.34) 360deg)`, maskImage: `radial-gradient(circle at ${x}% ${y}%, #000 0%, transparent 62%)`, WebkitMaskImage: `radial-gradient(circle at ${x}% ${y}%, #000 0%, transparent 62%)` }} />
);

/** 왼쪽에서 오른쪽으로 빠르게 지나가는 속도선. */
export const SpeedLines: React.FC<{ t: number; from: number; n?: number; seed?: string; y0?: number; y1?: number; o?: number; d?: number }> = ({ t, from, n = 16, seed = 'sl', y0 = 90, y1 = 860, o = 0.8, d = 99 }) => {
  if (t < from || t > from + d) return null;
  const fade = o * prog(t, from, 0.3) * (1 - prog(t, from + d - 0.4, 0.4));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {Array.from({ length: n }, (_, i) => {
        const v = 1500 + random(`${seed}-v-${i}`) * 1800;
        const len = 160 + random(`${seed}-l-${i}`) * 420;
        const p = ((t - from) * v + random(`${seed}-p-${i}`) * 2600) % 2600 - 400;
        return <div key={i} style={{ position: 'absolute', left: p, top: y0 + random(`${seed}-y-${i}`) * (y1 - y0), width: len, height: 3 + random(`${seed}-h-${i}`) * 3, borderRadius: 3, background: `linear-gradient(90deg, rgba(242,197,114,0), ${i % 3 ? 'rgba(255,255,255,.75)' : GOLD})` }} />;
      })}
    </AbsoluteFill>
  );
};

/** 말풍선 달린 캐릭터. */
export const Hero: React.FC<Pos & { t: number; from: number; h?: number }> = ({ t, from, x, y, h = 400 }) => (
  <Img src={staticFile('characters/philosophy.png')} alt="" style={{ ...at(x, y), height: h, width: 'auto', ...mx(up(t, from, 60), { tf: `translateY(${6 * Math.sin((t - from) * 2)}px)` }), filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.6))' }} />
);
export const Bubble: React.FC<Pos & { t: number; from: number; text: React.ReactNode; size?: number; tail?: 'r' | 'b' }> = ({ t, from, text, x, y, size = 44, tail = 'r' }) => (
  <div style={{ ...at(x, y), padding: '20px 34px 24px', borderRadius: 26, background: '#fff', color: '#1a1420', fontSize: size, fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap', boxShadow: '0 18px 50px rgba(0,0,0,.5)', transformOrigin: tail === 'r' ? '100% 80%' : '50% 100%', ...mx(pop(t, from)) }}>
    {text}
    <span style={tail === 'r' ? { position: 'absolute', right: -18, bottom: 26, width: 0, height: 0, borderLeft: '24px solid #fff', borderTop: '14px solid transparent', borderBottom: '14px solid transparent' }
      : { position: 'absolute', left: '50%', bottom: -20, marginLeft: -14, width: 0, height: 0, borderTop: '24px solid #fff', borderLeft: '14px solid transparent', borderRight: '14px solid transparent' }} />
  </div>
);

/** 줄이 쫙 그어지는 글자. */
export const Strike: React.FC<Pos & { t: number; from: number; strikeAt: number; text: string; size?: number; color?: string }> = ({ t, from, strikeAt, text, x, y, size = 64, color = CORAL }) => (
  <div style={{ ...at(x, y), fontSize: size, fontWeight: 800, letterSpacing: '-.03em', whiteSpace: 'nowrap', color: t > strikeAt ? 'rgba(255,255,255,.62)' : '#fff', textShadow: '0 6px 24px rgba(0,0,0,.7)', ...mx(up(t, from, 24)) }}>
    {text}
    <div style={{ position: 'absolute', left: -10, right: -10, top: '54%', height: size * 0.11, borderRadius: size * 0.06, background: color, transformOrigin: '0 50%', transform: `scaleX(${prog(t, strikeAt, 0.3, E.p3)})`, boxShadow: `0 0 16px ${color}` }} />
  </div>
);

/** 도장. */
export const StampText: React.FC<Pos & { t: number; from: number; text: string; color?: string; size?: number; rot?: number }> = ({ t, from, text, x, y, color = CORAL, size = 76, rot = -8 }) => {
  const { v, vel } = spr(t, from, 0.42, 18);
  return (
    <div style={{ ...at(x, y), padding: `${size * 0.14}px ${size * 0.4}px ${size * 0.2}px`, border: `${Math.round(size * 0.09)}px solid ${color}`, borderRadius: 14, color, background: 'rgba(14,12,22,.82)', fontSize: size, fontWeight: 900, letterSpacing: '-.03em', whiteSpace: 'nowrap',
      opacity: prog(t, from, 0.08), transform: `scale(${2.6 - 1.6 * v}) rotate(${rot}deg)`, filter: vel > 0.03 ? `blur(${Math.min(9, vel * 9).toFixed(2)}px)` : undefined }}>{text}</div>
  );
};

/** 반원 게이지: value 0~100. */
export const Dial: React.FC<Pos & { value: number; r?: number; label?: React.ReactNode; hot?: boolean }> = ({ x, y, value, r = 250, label, hot }) => {
  const ang = -180 + (Math.max(-3, Math.min(103, value)) / 100) * 180;
  const rad = (ang * Math.PI) / 180;
  return (
    <div style={at(x, y, r * 2 + 40, r + 110)}>
      <svg viewBox={`${-r - 20} ${-r - 20} ${r * 2 + 40} ${r + 60}`} style={{ width: r * 2 + 40, height: r + 60, overflow: 'visible' }} fill="none">
        <defs><linearGradient id="dialg"><stop offset="0" stopColor="#5f8cc9" /><stop offset=".55" stopColor={GOLD} /><stop offset="1" stopColor={CORAL} /></linearGradient></defs>
        <path d={`M${-r} 0A${r} ${r} 0 0 1 ${r} 0`} stroke="url(#dialg)" strokeWidth={30} strokeLinecap="round" />
        {Array.from({ length: 11 }, (_, i) => { const a = (Math.PI * i) / 10 + Math.PI; return <path key={i} d={`M${Math.cos(a) * (r - 30)} ${Math.sin(a) * (r - 30)}L${Math.cos(a) * (r - 50)} ${Math.sin(a) * (r - 50)}`} stroke="rgba(255,255,255,.55)" strokeWidth={4} strokeLinecap="round" />; })}
        <path d={`M0 0L${Math.cos(rad) * (r - 40)} ${Math.sin(rad) * (r - 40)}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${hot ? CORAL : '#fff'})` }} />
        <circle r={20} fill="#fff" />
      </svg>
      {label}
    </div>
  );
};

/** 숫자가 부드럽게 오른다. decimals 자리 표시. */
export const countTo = (t: number, from: number, d: number, n: number, decimals = 0) => (n * prog(t, from, d, E.p2)).toFixed(decimals);

/** 위아래로 떠다니는 움직임. */
export const bob = (t: number, seed: string, amp = 8): A => ({ tf: `translate(${noise2D(`${seed}-x`, t * 0.4, 0) * amp}px, ${noise2D(`${seed}-y`, 0, t * 0.4) * amp}px)` });

/** 떠다니는 금빛 먼지 — 사진에 공기감을 준다. */
const DUST = Array.from({ length: 34 }, (_, i) => ({ x: random(`d-x-${i}`) * 1920, y: random(`d-y-${i}`) * 1080, s: 2 + random(`d-s-${i}`) * 5, v: 6 + random(`d-v-${i}`) * 18, a: 0.15 + random(`d-a-${i}`) * 0.5 }));
export const Dust: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ zIndex: 4, pointerEvents: 'none' }}>
    {DUST.map((d, i) => (
      <div key={i} style={{ position: 'absolute', left: d.x + noise2D(`dn-${i}`, t * 0.07, i) * 60, top: (((d.y - t * d.v) % 1120) + 1120) % 1120 - 20, width: d.s, height: d.s, borderRadius: '50%', background: '#ffe9bd', opacity: d.a * (0.6 + 0.4 * Math.sin(t + i)), boxShadow: `0 0 ${d.s * 3}px #ffdf9e` }} />
    ))}
  </AbsoluteFill>
);

/** 전체 모션 장면 배경 — 천천히 움직이는 빛과 격자. */
const GLOW = [{ x: 300, y: 200, r: 720, c: '120,86,200', a: 0.34 }, { x: 1620, y: 820, r: 780, c: '242,160,90', a: 0.24 }, { x: 1200, y: 60, r: 600, c: '70,140,190', a: 0.2 }];
export const Stage: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(160deg, #100d1c 0%, #171228 50%, #0e0d17 100%)', overflow: 'hidden' }}>
    {GLOW.map((g, i) => (
      <div key={i} style={{ position: 'absolute', left: g.x - g.r, top: g.y - g.r, width: g.r * 2, height: g.r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${g.c},${g.a}), rgba(${g.c},0))`,
        transform: `translate(${noise2D(`st-x-${i}`, t * 0.05, 0) * 240}px, ${noise2D(`st-y-${i}`, 0, t * 0.05) * 170}px)` }} />
    ))}
    <div className="stage-grid" style={{ transform: `translateY(${(t * 16) % 80}px)` }} />
  </AbsoluteFill>
);
