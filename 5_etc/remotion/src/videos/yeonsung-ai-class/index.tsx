import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { E, prog } from '../../kit/anim';
import { camera, Grain, type Sfx, SfxTrack } from '../../kit/fx';
import { type Cue, loadSrt } from '../../kit/srt';
import { Scene, timing } from '../../kit/time';
import { BEATS, CHAPTERS, KICKS, SFX, type T2 } from './beats';
import { Dust, Stage } from '../ai-thinking-build/gfx';
import { type Shot as ShotT, SHOTS } from './shots';
import '../ai-thinking-build/theme.css';

// 연성대학교 AI 교육 후기 (4:12) — 원본 영상의 소리만 + 사용자 사진 16장(16번 제외) + Pixabay 사진·영상 + 장면별 모션그래픽.
// 원본 영상 화면(대본 텍스트)은 쓰지 않는다. 자막은 SRT 그대로.
// 소재 목록·출처: videos/yeonsung-ai-class/shots.json, edit/CREDITS.txt
// public/yeonsung-ai-class/narration.m4a : 사용자 녹음 / captions.srt : 자막 원본(문구 수정 금지) / visuals/ : 사용자 사진(u..)·Pixabay 소재(x..)
//
// 층 (아래 → 위): 사진·영상 [카메라] · 어둡게 · 금빛 먼지 · 장면 그래픽 [카메라] · 챕터 표시 · 자막 · 챕터 전환 · 그레인

export const DUR = 252;
const XF = 0.55;

export type Props = { cues: Cue[]; sfx: boolean };

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => ({
  durationInFrames: DUR * 30,
  props: { ...props, cues: await loadSrt('yeonsung-ai-class/captions.srt') },
});

// ---------- 사진·영상 층 --------------------------------------------------------
type Tr = 'zoom' | 'slideL' | 'slideR' | 'iris' | 'diag' | 'push';
const TR_ORDER: Tr[] = ['zoom', 'slideL', 'iris', 'push', 'diag', 'slideR'];
const MOVES = [
  (p: number) => `scale(${1.02 + 0.13 * p})`,
  (p: number) => `scale(1.14) translateX(${60 - 120 * p}px)`,
  (p: number) => `scale(${1.15 - 0.13 * p})`,
  (p: number) => `scale(1.14) translateX(${-60 + 120 * p}px)`,
  (p: number) => `scale(${1.04 + 0.1 * p}) translateY(${24 - 48 * p}px)`,
];

const enterStyle = (tr: Tr, p: number): React.CSSProperties => {
  const q = E.p2io(p);
  const live = p < 1;
  const blur = live ? Math.sin(p * Math.PI) * 16 : 0;
  switch (tr) {
    case 'zoom': return { opacity: q, transform: `scale(${1.28 - 0.28 * q})`, filter: live ? `blur(${blur.toFixed(1)}px)` : undefined };
    case 'slideL': return { transform: `translateX(${1920 * (1 - q)}px)`, filter: live ? `blur(${blur.toFixed(1)}px)` : undefined };
    case 'slideR': return { transform: `translateX(${-1920 * (1 - q)}px)`, filter: live ? `blur(${blur.toFixed(1)}px)` : undefined };
    case 'push': return { transform: `translateY(${1080 * (1 - q)}px)`, filter: live ? `blur(${blur.toFixed(1)}px)` : undefined };
    case 'iris': return { clipPath: live ? `circle(${(q * 115).toFixed(2)}% at 50% 48%)` : undefined };
    case 'diag': { const x = -40 + q * 180; return { clipPath: live ? `polygon(0 0, ${x}% 0, ${x - 40}% 100%, 0 100%)` : undefined }; }
  }
};

const Shot: React.FC<{ sh: ShotT; i: number; t: number; s: number; e: number }> = ({ sh, i, t, s, e }) => {
  const { fps } = useVideoConfig();
  const from = Math.round(s * fps);
  const dur = Math.max(1, Math.round(e * fps) - from);
  if (sh.kind === 'motion') {
    return (
      <Sequence from={from} durationInFrames={dur} name={sh.id} layout="none">
        <AbsoluteFill style={i ? enterStyle('zoom', prog(t, s, XF)) : undefined}><Stage t={t} /></AbsoluteFill>
      </Sequence>
    );
  }
  const tr = TR_ORDER[i % TR_ORDER.length];
  const p = prog(t, s, e - s);
  const mv = MOVES[i % MOVES.length](p);
  const src = staticFile(`yeonsung-ai-class/visuals/${sh.id}.${sh.kind === 'video' ? 'mp4' : 'jpg'}`);
  const fill: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
  return (
    <Sequence from={from} durationInFrames={dur} name={sh.id} layout="none">
      <AbsoluteFill style={{ overflow: 'hidden', ...(i ? enterStyle(tr, prog(t, s, XF)) : undefined) }}>
        <AbsoluteFill style={{ transform: mv }}>
          {sh.kind === 'video' ? <OffthreadVideo src={src} muted trimBefore={Math.round((sh.ss ?? 0) * 30)} playbackRate={Math.min(1, Math.max(0.5, ((sh.vd ?? 99) - (sh.ss ?? 0) - 0.3) / (e - s)))} style={fill} /> : <Img src={src} alt="" style={fill} />}
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- 챕터 --------------------------------------------------------------------
const ChapterWipe: React.FC<{ t: number; c: number; n: string; title: string; dir: 1 | -1 }> = ({ t, c, n, title, dir }) => {
  const a = c - 0.55;
  if (t < a || t > c + 1.0) return null;
  const inn = E.p2io(prog(t, a, 0.42));
  const out = E.p2io(prog(t, c + 0.6, 0.4));
  const x = dir * (-100 * (1 - inn) + 100 * out);
  const tx = prog(t, a + 0.2, 0.5, E.p3);
  return (
    <div className="cw" style={{ transform: `translateX(${x}%) skewX(${-12 * (1 - inn) + 12 * out}deg)` }}>
      <b style={{ opacity: tx, transform: `translateX(${-60 * (1 - tx)}px)` }}>{n}</b>
      <span style={{ opacity: tx, transform: `translateX(${60 * (1 - tx)}px)` }}>{title}</span>
    </div>
  );
};

const ChapterMark: React.FC<{ t: number; chapters: { s: number; e: number; title: string }[] }> = ({ t, chapters }) => {
  const i = chapters.findIndex((c) => t >= c.s && t < c.e);
  if (i < 0) return null;
  const c = chapters[i];
  return (
    <div className="chap" style={{ opacity: prog(t, c.s + 0.9, 0.4) * (1 - prog(t, c.e - 0.5, 0.3)) }}>
      <span>{c.title}</span>
      <div style={{ display: 'flex', gap: 6 }}>{chapters.map((_, k) => <i key={k} className={k <= i ? 'on' : ''} />)}</div>
    </div>
  );
};

// ---------- 자막 (SRT 그대로) --------------------------------------------------------
const Captions: React.FC<{ t: number; cues: Cue[] }> = ({ t, cues }) => {
  const c = cues.find((q) => t >= q.s && t < q.e);
  return c ? <div className="axcap"><span>{c.text.trim()}</span></div> : null;
};

export const YeonsungAiClass: React.FC<Props> = ({ cues, sfx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { T, TE } = timing(cues);
  const T2v: T2 = { T, TE };

  const shots = SHOTS.map((sh, i) => {
    const s = i ? T(sh.from) : 0;
    const next = SHOTS[i + 1] ? T(SHOTS[i + 1].from) : DUR;
    return { sh, i, s, e: SHOTS[i + 1] ? Math.min(next + XF + 0.05, DUR) : DUR };
  });
  const beats = BEATS.map((b, i) => ({ ...b, s: i ? T(b.from, -0.08) : 0, e: BEATS[i + 1] ? T(BEATS[i + 1].from, -0.08) : DUR }));
  const dim = beats.find((b) => t >= b.s && t < b.e);
  // 어둡게: 그래픽이 나오는 동안 사진을 살짝 뒤로 물린다
  const dimV = beats.reduce((v, b) => v + (t >= b.s - 0.2 && t < b.e + 0.2 ? (b.dim ?? 0.42) * prog(t, b.s - 0.2, 0.4, E.sine) * (1 - prog(t, b.e - 0.2, 0.4, E.sine)) : 0), 0);
  const side = dim?.side ?? 'l';
  const scrim = side === 'c' ? `rgba(8,7,12,${dimV})`
    : `linear-gradient(${side === 'l' ? '90deg' : '270deg'}, rgba(8,7,12,${Math.min(0.92, dimV + 0.34)}) 0%, rgba(8,7,12,${dimV}) 48%, rgba(8,7,12,${dimV * 0.55}) 100%)`;

  const chapters = CHAPTERS.map((c, i) => ({ ...c, s: T(c.from), e: CHAPTERS[i + 1] ? T(CHAPTERS[i + 1].from) : T(c.to ?? 105) }));
  const kicks = KICKS(T2v);
  const cam = camera(t, kicks);

  const events: Sfx[] = [
    ...shots.slice(1).map((x) => ({ at: x.s - 0.12, name: 'whoosh' as const, vol: 0.07 })),
    ...chapters.map((c) => ({ at: c.s - 0.55, name: 'whoosh' as const, vol: 0.2 })),
    ...kicks.map((k) => ({ at: k, name: 'hit' as const, vol: 0.14 })),
    ...SFX(T2v),
  ];

  return (
    <AbsoluteFill className="ax">
      <Audio src={staticFile('yeonsung-ai-class/narration.m4a')} />
      {sfx && <SfxTrack events={events} />}

      <AbsoluteFill style={{ transform: cam.transform }}>
        {shots.map((x) => <Shot key={x.sh.id} {...x} t={t} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: scrim, zIndex: 2 }} />
      <AbsoluteFill style={{ zIndex: 3, background: 'linear-gradient(180deg, rgba(8,7,12,.24) 0%, rgba(8,7,12,0) 22%, rgba(8,7,12,0) 72%, rgba(8,7,12,.55) 100%)' }} />
      <Dust t={t} />

      <AbsoluteFill style={{ transform: cam.transform, zIndex: 5 }}>
        {beats.map((b) => <Scene key={b.name} name={b.name} s={b.s} e={b.e} fadeIn={0.12}><b.El T={T} TE={TE} /></Scene>)}
      </AbsoluteFill>

      <ChapterMark t={t} chapters={chapters} />
      <Captions t={t} cues={cues} />
      {chapters.map((c, i) => <ChapterWipe key={c.title} t={t} c={c.s} n={c.n} title={c.title} dir={i % 2 ? -1 : 1} />)}
      <Grain frame={frame} />
      <AbsoluteFill style={{ zIndex: 20, background: '#000', opacity: (1 - prog(t, 0, 0.5)) + prog(t, DUR - 1, 1, E.p2in), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
