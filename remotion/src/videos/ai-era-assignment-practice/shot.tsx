import React from 'react';
import { Img, staticFile } from 'remotion';
import { E, mx, pop, prog, slide, spr, stamp, up } from '../../kit/anim';
import { Kinetic, Sparkles } from '../../kit/fx';
import type { IconName } from '../../kit/icons';
import { useT, type Timing } from '../../kit/time';
import { BG, C, Ico, Svg } from '../../kit/ui';
import DATA from './shots.json';

// Practice screen — the cinematic take on videos/ai-era-assignment-practice (shots.json is a copy of that file).
// Left: glass practice panel (step number, title, notes, commit ring). Right: a floating, slightly tilted monitor
// with the PPT screenshot inside; the camera pans/zooms across it, highlights get a spotlight and a cursor clicks them.

type Cue = [number, number];
export type ShotDef = {
  id: string; img: string; w: number; h: number; from: number; app: string; label: string; step: number; title: string;
  notes?: [number, number, string][]; hl?: [number, number, number, number, number, number][]; cam?: [number, number, number, number, number][];
  count?: [number, number, number, number]; badge?: [number, number, string]; tip?: [number, number, string];
};
export const SHOTS = DATA.shots as unknown as ShotDef[];
export const STEPS = DATA.steps;

const APP: Record<string, [IconName, string, string]> = {
  claude: ['sparkle', C.coral, BG.peach], code: ['code', C.lav, BG.lav], github: ['git', '#34314a', BG.grey], netlify: ['globe', C.mint, BG.mint],
  studio: ['key', C.sky, BG.sky], app: ['app', C.coral, BG.peach], photo: ['image', C.pink, BG.pink],
};
const VW = 1220, VH = 708;
type Cam = { x: number; y: number; z: number };
const lerp = (a: Cam, b: Cam, p: number): Cam => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z: a.z + (b.z - a.z) * p });

const Note: React.FC<{ text: string; style: React.CSSProperties }> = ({ text, style }) => {
  const m = text.match(/^([SWOT]) · (.*)$/);
  return (
    <div className="dk-note" style={style}>
      {m ? <span className={`sw sw${'SWOT'.indexOf(m[1])} dk-swn`}>{m[1]}</span> : <span className="dk-bar" />}
      <span>{m ? m[2] : text}</span>
    </div>
  );
};

const Cursor: React.FC<{ x: number; y: number; o: number; click: number }> = ({ x, y, o, click }) => (
  <>
    {click > 0 && click < 1 && <div className="dk-ripple" style={{ left: x - 10 - 40 * click, top: y - 10 - 40 * click, width: 20 + 80 * click, height: 20 + 80 * click, opacity: 1 - click }} />}
    <svg className="dk-cursor" viewBox="0 0 32 40" style={{ left: x - 4, top: y - 2, opacity: o, transform: `scale(${1 - 0.18 * Math.sin(Math.PI * Math.min(1, click * 2.5))})` }}>
      <path d="M3 2l25 21-11 1.5 6.5 12-5 2.5-6.5-12.5L3 34z" fill="#fff" stroke="#1b1538" strokeWidth={2.4} strokeLinejoin="round" />
    </svg>
  </>
);

export const Shot: React.FC<{ sh: ShotDef; T: Timing['T']; enter: boolean }> = ({ sh, T, enter }) => {
  const t = useT();
  const s0 = T(sh.from, -0.12);
  const at = (c: Cue) => T(c[0], c[1]);

  // camera
  const fit = Math.min(VW / sh.w, VH / sh.h), dw = sh.w * fit, dh = sh.h * fit;
  const camAt = (z: number, fx: number, fy: number): Cam => {
    const W = dw * z, H = dh * z;
    const ax = (v: number, W2: number, V: number) => (W2 <= V ? (V - W2) / 2 : Math.min(0, Math.max(V - W2, V / 2 - v * W2)));
    return { x: ax(fx, W, VW), y: ax(fy, H, VH), z };
  };
  const keys = (sh.cam ?? [[sh.from, 0, 1, 0.5, 0.5]]).map(([c, o, z, fx, fy]) => ({ t: T(c, o), ...camAt(z, fx, fy) }));
  let cam: Cam = keys[0];
  for (const k of keys.slice(keys[0].t <= s0 + 0.3 ? 1 : 0)) cam = lerp(cam, k, prog(t, Math.max(s0 + 0.05, k.t - 0.2), 1.2, E.p2io));
  const toVp = (fx: number, fy: number) => [cam.x + fx * dw * cam.z, cam.y + fy * dh * cam.z] as const;

  // highlights, spotlight and cursor
  const hls = (sh.hl ?? []).map(([c, o, x, y, w, h]) => ({ th: Math.max(s0 + 0.4, T(c, o)), x, y, w, h }));
  const active = hls.reduce((a, h, i) => (t >= h.th ? i : a), -1);
  let cx = VW * 0.82, cy = VH * 0.88;
  hls.forEach((h, i) => {
    const [px, py] = i ? toVp(hls[i - 1].x + hls[i - 1].w / 2, hls[i - 1].y + hls[i - 1].h / 2) : [VW * 0.82, VH * 0.88];
    const [qx, qy] = toVp(h.x + h.w / 2, h.y + h.h / 2);
    const p = prog(t, h.th - 0.75, 0.75, E.p2io);
    if (t >= h.th - 0.75) { cx = px + (qx - px) * p; cy = py + (qy - py) * p; }
  });
  const click = active >= 0 ? (t - hls[active].th) / 0.6 : 0;

  // entrance — the monitor swings in from depth; afterwards a slow float shared by all shots (so cross-dissolves line up)
  const ent = enter ? spr(t, s0, 0.7, 7.5) : { v: 1, vel: 0 };
  const rotY = -4.5 + 1.2 * Math.sin(t * 0.21) - 30 * (1 - ent.v);
  const rotX = 2.2 + 0.8 * Math.sin(t * 0.17 + 1);
  const [ai, ac, ab] = APP[sh.app];
  const count = sh.count ? Math.round(sh.count[2] * prog(t, at([sh.count[0], sh.count[1]]), sh.count[3])) : 0;
  const countAt = sh.count ? at([sh.count[0], sh.count[1]]) : 0;

  return (
    <>
      <div className="dk-panel" style={enter ? mx(slide(t, s0 + 0.1, -70)) : undefined}>
        <div className="dk-steprow" style={mx(up(t, s0 + 0.1, 14))}>
          <b className="dk-stepn">{String(sh.step).padStart(2, '0')}</b>
          <div><span className="dk-k">실습 단계</span><span className="dk-sl">{STEPS[sh.step - 1]}</span></div>
        </div>
        <div className="dk-track">{STEPS.map((_, i) => <i key={i} className={i < sh.step ? 'on' : ''} />)}</div>
        <Kinetic className="dk-title" t={t} at={s0 + 0.25} stagger={0.022} parts={[sh.title]} />
        <div className="dk-notes">{(sh.notes ?? []).map((n, k) => <Note key={k} text={n[2]} style={mx(slide(t, Math.max(s0 + 0.5, T(n[0], n[1])), -40))} />)}</div>
        {sh.count && (
          <div className="dk-count" style={mx(pop(t, countAt - 0.5))}>
            <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="dk-ring0" />
              <circle cx="60" cy="60" r="50" className={`dk-ring${count >= 10 ? ' full' : ''}`} pathLength={1} style={{ strokeDashoffset: 1 - Math.min(1, count / 10) }} /></svg>
            <div className="dk-cn"><b>{count}</b><span>/ 10 커밋</span></div>
          </div>
        )}
        {sh.badge && <div className="dk-badge" style={mx(stamp(t, at([sh.badge[0], sh.badge[1]])))}><Svg name="check" color="#ffffff" /><span>{sh.badge[2]}</span></div>}
        {sh.tip && <div className="dk-tip" style={mx(pop(t, at([sh.tip[0], sh.tip[1]])))}><Svg name="bulb" color="#ffd27a" /><span>{sh.tip[2].split('\n').map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</span></div>}
      </div>

      <div className="dk-mon" style={{ opacity: Math.min(1, ent.v * 1.6), transform: `perspective(2400px) translateX(${220 * (1 - ent.v)}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
        filter: ent.vel > 0.03 ? `blur(${Math.min(8, ent.vel * 9).toFixed(2)}px)` : undefined }}>
        <div className="dk-bar2"><i /><i /><i /><div className="dk-url"><Ico name={ai} color={ac} bg={ab} className="tiny" /><span>{sh.label}</span></div></div>
        <div className="dk-vp">
          <div className="dk-cam" style={{ width: dw, height: dh, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})` }}>
            <Img src={staticFile(`ai-era-assignment-practice/shots/${sh.img}`)} style={{ width: '100%', height: '100%', display: 'block' }} />
            {hls.map((h, k) => {
              const o = prog(t, h.th, 0.35, E.p2);
              const dim = k === active ? 0.58 * prog(t, h.th, 0.45) * (1 - prog(t, h.th + 3.2, 0.9)) : 0;
              return o > 0 && <div key={k} className="dk-hl" style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%`, opacity: o,
                transform: `scale(${1 + 0.2 * (1 - spr(t, h.th, 0.5, 14).v)})`, boxShadow: `0 0 0 3000px rgba(8,6,24,${dim.toFixed(3)}), 0 0 26px rgba(124,242,255,.6), inset 0 0 18px rgba(124,242,255,.25)` }} />;
            })}
          </div>
          {hls.length > 0 && <Cursor x={cx} y={cy} o={prog(t, s0 + 0.3, 0.3)} click={click} />}
          <div className="dk-glare" />
        </div>
      </div>
      {sh.count && count >= 10 && <Sparkles t={t} at={countAt + sh.count[3] * (10 / sh.count[2])} x={300} y={640} spread={220} seed={`${sh.id}-sp`} />}
    </>
  );
};
