import React from 'react';
import { E, mx, pop, prog, slide, spr, up } from '../../kit/anim';
import type { IconName } from '../../kit/icons';
import { CheckMark, CORAL, GOLD, Icon, MINT, SKY } from './gfx';

// 옆 패널(슬라이드 화면 옆)과 사진 위(왼쪽 위)에 쌓는 그래픽 부품.
// 시각은 [큐, 오프셋초] 로 적고, 렌더할 때 at() 로 초로 바꾼다. 모든 모양은 t 의 순수 함수.

export type W =
  | { k: 'card'; at: Q; label: string; title: string; icon?: IconName; color?: string }
  | { k: 'list'; items: [string, Q][]; mark?: 'check' | 'num' | 'dot'; color?: string }
  | { k: 'flow'; items: [string, Q][]; color?: string }
  | { k: 'vs'; a: [string, string, Q]; b: [string, string, Q] }
  | { k: 'quote'; at: Q; text: string }
  | { k: 'stamp'; at: Q; text: string; color?: string }
  | { k: 'chip'; at: Q; text: string; icon?: IconName; color?: string }
  | { k: 'prompt'; at: Q; end: Q; text: string }
  | { k: 'bars'; at: Q; rows: [string, number, boolean?][]; hot?: Q }
  | { k: 'people'; at: Q; cut: Q; n: number; keep: number }
  | { k: 'stat'; at: Q; value: number; suffix: string; label: string; color?: string };

/** 큐 번호, 또는 [큐, 오프셋초]. */
export type Q = number | [number, number];
export type ToSec = (q: Q) => number;

const S = (big: boolean, n: number) => (big ? n * 1.55 : n);

const Card: React.FC<{ t: number; a: number; big: boolean; label: string; title: string; icon?: IconName; color?: string }> = ({ t, a, big, label, title, icon, color = GOLD }) => {
  const bar = spr(t, a, 0.75, 10).v;
  return (
    <div className="wcard" style={{ padding: big ? '30px 40px 34px' : '20px 24px 22px', ...mx(slide(t, a, 40)) }}>
      <div className="wbar" style={{ background: color, transform: `scaleY(${bar})`, boxShadow: `0 0 18px ${color}` }} />
      <div className="wlabel" style={{ fontSize: S(big, 21), color }}>
        {icon && <Icon name={icon} color={color} size={S(big, 28)} />}<span>{label}</span>
      </div>
      <div className="wtitle" style={{ fontSize: S(big, 36) }}>
        {title.split('\n').map((l, i) => <div key={i} style={mx(up(t, a + 0.12 + i * 0.1, 16))}>{l}</div>)}
      </div>
    </div>
  );
};

const List: React.FC<{ t: number; big: boolean; items: [string, number][]; mark: 'check' | 'num' | 'dot'; color: string }> = ({ t, big, items, mark, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: big ? 16 : 10 }}>
    {items.map(([text, a], i) => (
      <div key={text + i} className="wrow" style={{ fontSize: S(big, 27), padding: big ? '14px 26px' : '11px 16px', ...mx(slide(t, a, -30)) }}>
        {mark === 'check' && <CheckMark t={t} from={a + 0.05} size={S(big, 32)} color={color} />}
        {mark === 'num' && <b className="wnum" style={{ background: color, width: S(big, 34), height: S(big, 34), fontSize: S(big, 21), ...mx(pop(t, a + 0.05)) }}>{i + 1}</b>}
        {mark === 'dot' && <i className="wdot" style={{ background: color, ...mx(pop(t, a + 0.05)) }} />}
        <span>{text}</span>
      </div>
    ))}
  </div>
);

const Flow: React.FC<{ t: number; big: boolean; items: [string, number][]; color: string }> = ({ t, big, items, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
    {items.map(([text, a], i) => (
      <React.Fragment key={text + i}>
        {i > 0 && (
          <svg viewBox="0 0 40 34" style={{ width: S(big, 30), height: S(big, 26), alignSelf: 'center', margin: '3px 0' }} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 2v26M10 19l10 10 10-10" pathLength={1} strokeDasharray={1} style={{ strokeDashoffset: 1 - prog(t, a - 0.25, 0.3, E.p2io) }} />
          </svg>
        )}
        <div className={`wrow flow${i === items.length - 1 ? ' last' : ''}`} style={{ fontSize: S(big, 27), padding: big ? '14px 26px' : '11px 16px', justifyContent: 'center', ['--fc' as string]: color, ...mx(pop(t, a)) }}>
          <span>{text}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
);

const Vs: React.FC<{ t: number; big: boolean; a: [string, string, number]; b: [string, string, number] }> = ({ t, big, a, b }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: big ? 14 : 10 }}>
    {[a, b].map(([lab, text, at], i) => (
      <div key={i} className="wvs" style={{ borderColor: i ? GOLD : 'rgba(255,255,255,.18)', ...mx(slide(t, at, i ? 40 : -40)) }}>
        <small style={{ fontSize: S(big, 19), color: i ? GOLD : '#b9b2c9' }}>{lab}</small>
        <div style={{ fontSize: S(big, 29), color: i ? '#fff' : '#d8d2e3' }}>{text}</div>
      </div>
    ))}
  </div>
);

const Prompt: React.FC<{ t: number; big: boolean; a: number; e: number; text: string }> = ({ t, big, a, e, text }) => {
  const n = Math.round(text.length * prog(t, a + 0.2, Math.max(0.6, (e - a) * 0.85)));
  const shown = text.slice(0, n);
  const caret = n < text.length || Math.floor(t * 2) % 2 === 0;
  return (
    <div className="wprompt" style={{ fontSize: S(big, 24), ...mx(up(t, a, 24)) }}>
      <div className="wprompt-h"><i /><i /><i /><span>프롬프트</span></div>
      <div className="wprompt-b">{shown.split('\n').map((l, i, arr) => <div key={i}>{l}{i === arr.length - 1 && caret ? <b className="caret" /> : null}</div>)}</div>
    </div>
  );
};

const Bars: React.FC<{ t: number; big: boolean; a: number; rows: [string, number, boolean?][]; hot: number }> = ({ t, big, a, rows, hot }) => {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <div className="wcard" style={{ padding: big ? '24px 30px' : '16px 18px', display: 'flex', flexDirection: 'column', gap: big ? 14 : 10, ...mx(up(t, a, 20)) }}>
      {rows.map(([lab, v, h], i) => {
        const on = h && t >= hot;
        const g = spr(t, a + 0.15 + i * 0.12, 0.8, 8).v;
        return (
          <div key={lab} style={{ display: 'grid', gridTemplateColumns: `${S(big, 150)}px 1fr ${S(big, 54)}px`, alignItems: 'center', gap: 10, fontSize: S(big, 21), color: on ? '#fff' : '#cfc8dc', fontWeight: on ? 800 : 600 }}>
            <span style={{ whiteSpace: 'nowrap' }}>{lab}</span>
            <div style={{ height: S(big, 16), borderRadius: 9, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
              <div style={{ width: `${(v / max) * 100}%`, height: '100%', borderRadius: 9, background: on ? CORAL : SKY, transformOrigin: '0 50%', transform: `scaleX(${g})`, boxShadow: on ? `0 0 16px ${CORAL}` : undefined }} />
            </div>
            <b style={{ textAlign: 'right', color: on ? CORAL : '#fff' }}>{Math.round(v * prog(t, a + 0.15 + i * 0.12, 0.8, E.p2))}%</b>
          </div>
        );
      })}
    </div>
  );
};

const People: React.FC<{ t: number; big: boolean; a: number; c: number; n: number; keep: number }> = ({ t, big, a, c, n, keep }) => (
  <div className="wcard" style={{ padding: big ? '26px 30px' : '16px 18px', display: 'flex', justifyContent: 'center', gap: big ? 18 : 8, ...mx(up(t, a, 20)) }}>
    {Array.from({ length: n }, (_, i) => {
      const gone = i >= keep ? prog(t, c + (i - keep) * 0.12, 0.35, E.p2) : 0;
      const hot = i < keep && t >= c + 0.3;
      return (
        <div key={i} style={{ ...mx(pop(t, a + 0.1 + i * 0.1)), opacity: (1 - gone * 0.82) * prog(t, a + 0.1 + i * 0.1, 0.2), transform: `scale(${1 - gone * 0.25 + (hot ? 0.12 * spr(t, c + 0.3, 0.4, 14).v : 0)})` }}>
          <Icon name="users" color={hot ? GOLD : gone > 0.5 ? '#6f6880' : '#e9e4f2'} size={S(big, 52)} />
        </div>
      );
    })}
  </div>
);

export const Widget: React.FC<{ t: number; w: W; at: ToSec; big?: boolean }> = ({ t, w, at, big = false }) => {
  switch (w.k) {
    case 'card': return <Card t={t} a={at(w.at)} big={big} label={w.label} title={w.title} icon={w.icon} color={w.color} />;
    case 'list': return <List t={t} big={big} items={w.items.map(([x, q]) => [x, at(q)])} mark={w.mark ?? 'check'} color={w.color ?? GOLD} />;
    case 'flow': return <Flow t={t} big={big} items={w.items.map(([x, q]) => [x, at(q)])} color={w.color ?? GOLD} />;
    case 'vs': return <Vs t={t} big={big} a={[w.a[0], w.a[1], at(w.a[2])]} b={[w.b[0], w.b[1], at(w.b[2])]} />;
    case 'quote': {
      const a = at(w.at);
      return (
        <div className="wquote" style={{ fontSize: S(big, 31), ...mx(up(t, a, 24)) }}>
          <span className="qm" style={mx(pop(t, a))}>“</span>
          {w.text.split('\n').map((l, i) => <div key={i} style={mx(up(t, a + 0.1 + i * 0.12, 14))}>{l}</div>)}
        </div>
      );
    }
    case 'stamp': {
      const a = at(w.at);
      const { v, vel } = spr(t, a, 0.42, 18);
      const c = w.color ?? CORAL;
      return (
        <div style={{ alignSelf: 'center', padding: big ? '10px 34px 14px' : '6px 22px 9px', border: `${big ? 7 : 5}px solid ${c}`, borderRadius: 12, color: c, background: 'rgba(14,12,22,.85)', fontSize: S(big, 38), fontWeight: 900, letterSpacing: '-.03em', whiteSpace: 'nowrap',
          opacity: prog(t, a, 0.08), transform: `scale(${2.4 - 1.4 * v}) rotate(-6deg)`, filter: vel > 0.03 ? `blur(${Math.min(8, vel * 8).toFixed(2)}px)` : undefined }}>{w.text}</div>
      );
    }
    case 'chip': {
      const a = at(w.at);
      const c = w.color ?? MINT;
      return (
        <div className="wchip" style={{ fontSize: S(big, 25), borderColor: c, ...mx(pop(t, a)) }}>
          {w.icon && <Icon name={w.icon} color={c} size={S(big, 30)} />}<span>{w.text}</span>
        </div>
      );
    }
    case 'prompt': return <Prompt t={t} big={big} a={at(w.at)} e={at(w.end)} text={w.text} />;
    case 'bars': return <Bars t={t} big={big} a={at(w.at)} rows={w.rows} hot={w.hot ? at(w.hot) : Infinity} />;
    case 'people': return <People t={t} big={big} a={at(w.at)} c={at(w.cut)} n={w.n} keep={w.keep} />;
    case 'stat': {
      const a = at(w.at);
      const c = w.color ?? GOLD;
      return (
        <div className="wcard" style={{ padding: big ? '24px 34px' : '16px 22px', display: 'flex', alignItems: 'baseline', gap: 14, ...mx(up(t, a, 20)) }}>
          <b style={{ fontSize: S(big, 76), fontWeight: 900, color: c, lineHeight: 1, textShadow: `0 0 24px ${c}66`, ...mx(pop(t, a + 0.1)) }}>{Math.round(w.value * prog(t, a + 0.1, 0.9, E.p2))}{w.suffix}</b>
          <span style={{ fontSize: S(big, 25), fontWeight: 700, color: '#e9e4f2' }}>{w.label}</span>
        </div>
      );
    }
  }
};

/** 위젯 여러 개를 세로로 쌓는다. */
export const Stack: React.FC<{ t: number; ws: W[]; at: ToSec; big?: boolean; gap?: number }> = ({ t, ws, at, big, gap }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: gap ?? (big ? 22 : 14), alignItems: 'stretch' }}>
    {ws.map((w, i) => <Widget key={i} t={t} w={w} at={at} big={big} />)}
  </div>
);
