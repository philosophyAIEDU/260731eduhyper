import React from 'react';
import { AbsoluteFill, type CalculateMetadataFunction, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, prog, spr } from '../../kit/anim';
import { type Sfx, SfxTrack } from '../../kit/fx';
import { type Cue, loadSrt } from '../../kit/srt';
import { Scene } from '../../kit/time';
import { BEATS, CHAPTERS, ZOOMS } from './beats';
import { Dust, GOLD, Icon, Stage } from './gfx';
import { Stack, type Q, type ToSec } from './widgets';
import './theme.css';

// 봉사단 2기 두 번째 발표 (김종현 수석, Zoom 녹화 52분 → 30분 편집본)
// public/volunteer2-talk2/talk.mp4   : 편집본 (videos/volunteer2-talk2/edit/mkcut.py — 남길 구간·무음 줄이기·발표 화면만 잘라 1080p로)
// public/volunteer2-talk2/captions.srt: 원본 SRT 를 편집 시간으로 옮긴 것 (큐 번호는 원본 그대로, 오탈자만 최소 교정 — mksrt.py)
// public/volunteer2-talk2/visuals/   : Pixabay 사진·영상 + Gemini 1장 (출처: videos/volunteer2-talk2/edit/CREDITS.txt)
// 얼굴이 나오는 카메라 화면 구간은 편집에서 빠져 있다.
//
// 층 (아래 → 위): 배경 · 발표 화면 카드(확대) · 옆 패널 · 사진 덮개 · 전체 장면 · 자막 · 챕터 전환

export const DUR = 1786;
const VIDEO_END = 1781.7;
const CARD = { x: 36, y: 40, w: 1440, h: 810 };
const SIDE = { x: 1506, y: 40, w: 382 };

export type Props = { cues: Cue[]; sfx: boolean };

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => ({
  durationInFrames: DUR * 30,
  props: { ...props, cues: await loadSrt('volunteer2-talk2/captions.srt') },
});

/** 큐 → 초. 잘려 나간 큐는 다음으로 남아 있는 큐의 시작. */
const makeAt = (cues: Cue[]): ToSec => {
  const sorted = [...cues].sort((a, b) => a.n - b.n);
  return (q: Q) => {
    const [n, off] = typeof q === 'number' ? [q, 0] : q;
    const c = sorted.find((x) => x.n >= n);
    return (c ? c.s : DUR) + off;
  };
};

// ---------- 발표 화면 카드 + 확대 -----------------------------------------------------------
const zoomAt = (t: number, keys: { s: number; cx: number; cy: number; z: number }[]) => {
  let i = -1;
  for (let k = 0; k < keys.length; k++) if (keys[k].s <= t) i = k;
  if (i < 0) return { cx: 960, cy: 540, z: 1 };
  const cur = keys[i];
  const prev = i ? keys[i - 1] : cur;
  const p = prog(t, cur.s, 1.0, E.p2io);
  return { cx: prev.cx + (cur.cx - prev.cx) * p, cy: prev.cy + (cur.cy - prev.cy) * p, z: prev.z + (cur.z - prev.z) * p };
};

const Screen: React.FC<{ t: number; zoom: { cx: number; cy: number; z: number } }> = ({ t, zoom }) => {
  const k = CARD.w / 1920;
  const s = zoom.z;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const tx = clamp(CARD.w / 2 - zoom.cx * k * s, CARD.w - CARD.w * s, 0);
  const ty = clamp(CARD.h / 2 - zoom.cy * k * s, CARD.h - CARD.h * s, 0);
  return (
    <div className="screen" style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, transformOrigin: '0 0', transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})` }}>
        <OffthreadVideo src={staticFile('volunteer2-talk2/talk.mp4')} style={{ width: CARD.w, height: CARD.h }} />
      </div>
      <div className="screen-glint" style={{ opacity: 0.5 + 0.5 * Math.sin(t * 0.3) }} />
    </div>
  );
};

// ---------- 옆 패널: 발표 정보 + 목차 -----------------------------------------------------------
const SideHead: React.FC<{ t: number; ch: number; chapters: { s: number; n: string; title: string }[] }> = ({ t, ch, chapters }) => (
  <div className="sidehead" style={{ left: SIDE.x, top: SIDE.y, width: SIDE.w }}>
    <div className="sh-top"><Icon name="users" color={GOLD} size={26} /><span>필로소피 AI 봉사단 2기</span></div>
    <div className="sh-name">김종현 수석 <small>· 두 번째 발표</small></div>
    <div className="sh-toc">
      {chapters.map((c, i) => (
        <div key={c.n} className={i === ch ? 'on' : i < ch ? 'done' : ''}>
          <i style={i === ch ? { transform: `scale(${1 + 0.4 * (1 - spr(t, c.s, 0.4, 12).v)})` } : undefined} />
          <b>{c.n}</b><span>{c.title}</span>
        </div>
      ))}
    </div>
  </div>
);

// ---------- 사진 덮개 ---------------------------------------------------------------------
const MOVES = [
  (p: number) => `scale(${1.03 + 0.1 * p})`,
  (p: number) => `scale(1.12) translateX(${50 - 100 * p}px)`,
  (p: number) => `scale(${1.13 - 0.1 * p})`,
  (p: number) => `scale(1.12) translateX(${-50 + 100 * p}px)`,
];
const VIDEOS = new Set(['p01', 'p05', 'p06', 'p08', 'p10', 'p11']);
const VD: Record<string, number> = { p01: 69.7, p05: 37, p06: 20.4, p08: 10.6, p10: 26, p11: 63.1 };

const Photo: React.FC<{ id: string; i: number; t: number; s: number; e: number }> = ({ id, i, t, s, e }) => {
  const { fps } = useVideoConfig();
  const from = Math.round(s * fps);
  const dur = Math.max(1, Math.round((e + 0.5) * fps) - from);
  const p = prog(t, s, e - s);
  const inn = E.p2io(prog(t, s, 0.6));
  const out = prog(t, e - 0.1, 0.5, E.p2in);
  const live = inn < 1;
  const fill: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
  const src = staticFile(`volunteer2-talk2/visuals/${id}.${VIDEOS.has(id) ? 'mp4' : 'jpg'}`);
  return (
    <Sequence from={from} durationInFrames={dur} name={`photo ${id}`} layout="none">
      <AbsoluteFill style={{ zIndex: 6, overflow: 'hidden', opacity: 1 - out, clipPath: live ? `circle(${(inn * 120).toFixed(2)}% at ${i % 2 ? 70 : 30}% 50%)` : undefined }}>
        <AbsoluteFill style={{ transform: MOVES[i % MOVES.length](p) }}>
          {VIDEOS.has(id)
            ? <OffthreadVideo src={src} muted playbackRate={Math.min(1, Math.max(0.5, (VD[id] - 0.3) / (e - s + 0.6)))} style={fill} />
            : <Img src={src} alt="" style={fill} />}
        </AbsoluteFill>
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(8,7,12,.88) 0%, rgba(8,7,12,.6) 42%, rgba(8,7,12,.12) 75%), linear-gradient(180deg, rgba(8,7,12,0) 70%, rgba(8,7,12,.6) 100%)' }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- 챕터 전환 ---------------------------------------------------------------------
const ChapterWipe: React.FC<{ t: number; c: number; n: string; title: string; dir: 1 | -1 }> = ({ t, c, n, title, dir }) => {
  const a = c - 0.5;
  if (t < a || t > c + 1.3) return null;
  const inn = E.p2io(prog(t, a, 0.42));
  const out = E.p2io(prog(t, c + 0.85, 0.42));
  const x = dir * (-100 * (1 - inn) + 100 * out);
  const tx = prog(t, a + 0.2, 0.5, E.p3);
  return (
    <div className="cw" style={{ transform: `translateX(${x}%) skewX(${-12 * (1 - inn) + 12 * out}deg)` }}>
      <b style={{ opacity: tx, transform: `translateX(${-60 * (1 - tx)}px)` }}>{n}</b>
      <span style={{ opacity: tx, transform: `translateX(${60 * (1 - tx)}px)` }}>{title}</span>
    </div>
  );
};

const Captions: React.FC<{ t: number; cues: Cue[]; full: boolean }> = ({ t, cues, full }) => {
  const c = cues.find((q) => t >= q.s && t < q.e);
  return c ? <div className={`axcap${full ? '' : ' oncard'}`}><span>{c.text.trim()}</span></div> : null;
};

export const Volunteer2Talk2: React.FC<Props> = ({ cues, sfx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const A = makeAt(cues);

  const beats = BEATS.map((b, i) => ({ ...b, i, s: i ? A(b.from) - 0.1 : 0, e: BEATS[i + 1] ? A(BEATS[i + 1].from) - 0.1 : DUR }));
  const cur = beats.find((b) => t >= b.s && t < b.e) ?? beats[0];
  const zkeys = ZOOMS.map(([q, cx, cy, z]) => ({ s: A(q), cx, cy, z }));
  const zoom = zoomAt(t, zkeys);
  const chapters = [{ s: 0, n: 'INTRO', title: '봉사단 소개 · 발표자' }, ...CHAPTERS.map(([q, n, title]) => ({ s: A(q), n, title }))];
  let ch = 0;
  chapters.forEach((c, i) => { if (t >= c.s) ch = i; });

  const covered = cur.kind !== 'slide' && t > cur.s + 0.6 && t < cur.e - 0.2;
  const photos = beats.filter((b) => b.kind === 'photo');
  const fulls = beats.filter((b) => b.kind === 'full');
  const sides = beats.filter((b) => b.kind === 'slide');

  const events: Sfx[] = [
    ...photos.map((b) => ({ at: b.s, name: 'whoosh' as const, vol: 0.1 })),
    ...fulls.map((b) => ({ at: b.s, name: 'whoosh' as const, vol: 0.12 })),
    ...chapters.slice(1).map((c) => ({ at: c.s - 0.5, name: 'whoosh' as const, vol: 0.18 })),
    ...beats.flatMap((b) => (b.ws ?? []).filter((w) => w.k === 'card' || w.k === 'stamp').map((w) => ({ at: A((w as { at: Q }).at), name: (w.k === 'stamp' ? 'hit' : 'pop') as 'hit' | 'pop', vol: w.k === 'stamp' ? 0.1 : 0.06 }))),
  ];

  return (
    <AbsoluteFill className="ax v2">
      {sfx && <SfxTrack events={events} />}
      <Stage t={t} />
      <Dust t={t} />

      {/* 발표 화면 (소리도 여기서 나온다) */}
      <div style={{ opacity: covered ? 0 : 1 }}>
        <Screen t={t} zoom={zoom} />
      </div>
      {t > VIDEO_END && <AbsoluteFill style={{ background: '#0a0910', zIndex: 1 }} />}

      {/* 옆 패널 */}
      <SideHead t={t} ch={ch} chapters={chapters} />
      <AbsoluteFill style={{ zIndex: 5 }}>
        {sides.map((b) => (
          <Scene key={`s${b.i}`} name={`side ${b.i}`} s={b.s} e={b.e}>
            <div style={{ position: 'absolute', left: SIDE.x, top: 330, width: SIDE.w }}>
              <Stack t={t} ws={b.ws ?? []} at={A} />
            </div>
          </Scene>
        ))}
      </AbsoluteFill>

      {/* 사진 덮개 + 큰 그래픽 */}
      {photos.map((b) => <Photo key={`p${b.i}`} id={b.photo!} i={b.i} t={t} s={b.s} e={b.e} />)}
      <div style={{ position: 'absolute', inset: 0, zIndex: 7 }}>
        {photos.map((b) => (
          <Scene key={`pw${b.i}`} name={`photo gfx ${b.photo}`} s={b.s + 0.25} e={b.e}>
            <div style={{ position: 'absolute', left: 96, top: 90, width: 820 }}>
              <Stack t={t} ws={b.ws ?? []} at={A} big />
            </div>
          </Scene>
        ))}
      </div>

      {/* 전체 장면 */}
      <AbsoluteFill style={{ zIndex: 8 }}>
      {fulls.map((b) => {
        const F = b.Full!;
        const inn = prog(t, b.s, 0.5, E.p2);
        return (
          <Scene key={`f${b.i}`} name={`full ${b.i}`} s={b.s} e={b.e} fadeIn={0.01}>
            <AbsoluteFill style={{ zIndex: 8, clipPath: inn < 1 ? `inset(${(50 * (1 - inn)).toFixed(2)}% 0 ${(50 * (1 - inn)).toFixed(2)}% 0)` : undefined }}>
              <Stage t={t} />
              <AbsoluteFill className="impactfull"><F at={(n, off = 0) => A([n, off])} /></AbsoluteFill>
            </AbsoluteFill>
          </Scene>
        );
      })}
      </AbsoluteFill>

      <Captions t={t} cues={cues} full={cur.kind !== 'slide'} />
      {chapters.slice(1).map((c, i) => <ChapterWipe key={c.n} t={t} c={c.s} n={c.n} title={c.title} dir={i % 2 ? -1 : 1} />)}
      <AbsoluteFill style={{ zIndex: 20, background: '#000', opacity: (1 - prog(t, 0, 0.5)) + prog(t, DUR - 1.2, 1.2, E.p2in), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
