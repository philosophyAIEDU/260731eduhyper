import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { E, prog } from '../../kit/anim';
import { type Cue, loadSrt } from '../../kit/srt';
import { Brand, Captions, ChapterChip, Character, EndCard } from '../../kit/stage';
import { Bokeh, camera, Emote, Grain, ImpactBackdrop, type Sfx, SfxTrack, Wipe } from '../../kit/fx';
import { Scene, timing } from '../../kit/time';
import { BG, C } from '../../kit/ui';
import type { IconName } from '../../kit/icons';
import { SCENES } from './scenes';
import { Shot, SHOTS } from './shot';
import './theme.css';

// AI 시대의 과제 — 직접 해보기 편 (16:23) — the dark cinematic Remotion edition of videos/ai-era-assignment-practice (HyperFrames, pastel).
// public/ai-era-assignment-practice/narration.m4a : AI 시대의 과제 영상.mp4 의 오디오 0–983s (README 의 추출 명령 참고)
// public/ai-era-assignment-practice/captions.srt  : 자막 원본 — 표기 교정은 FIX
// public/ai-era-assignment-practice/shots/        : PPT 에 들어 있던 실습 캡처 (박힌 자막·펜 표시 없는 원본)
//
// Layers (bottom → top): midnight backdrop · impact gradient (full scenes) · bokeh ·
// camera [character + emotes · scenes / practice screens · end card] · chrome · karaoke captions · wipes · grain · fades

export const DUR = 983;
const FIX: [RegExp, string][] = [[/SWAT 웹/g, 'SWOT 앱'], [/SWAT/g, 'SWOT'], [/안티그래피티/g, '안티그래비티'], [/네틀리파이|네트리파이/g, '넷리파이'],
  [/버스에서 배포/g, '버셀에서 배포'], [/EU 1027 SWOT/g, '261027swot'], [/Gemini 3\.5 Flashlight/g, 'Gemini 3.5 Flash-Lite'],
  [/3\.5 플래시라이트/g, '3.5 Flash-Lite'], [/클로드 코-코드/g, '클로드 코드'], [/이거 개 비교/g, '이 두 회사를 비교'], [/주방이-주방이/g, '주방이']];
const KW = /AI|SWOT|GitHub|깃허브|클로드|Claude|PR|merge|머지|커밋|넷리파이|API|제미나이|Gemini|엔비디아|NVIDIA|AMD|평가|과제|캡처|차별/;
const XF = 0.45;

export type Props = { cues: Cue[]; sfx: boolean };

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => ({
  durationInFrames: DUR * 30,
  props: { ...props, cues: await loadSrt('ai-era-assignment-practice/captions.srt', FIX) },
});

// deep night sky: slow aurora ribbons, a faint perspective grid on the floor
const AUR = [
  { x: 260, y: 220, r: 700, c: '120,86,255', a: 0.42 }, { x: 1620, y: 780, r: 760, c: '255,96,170', a: 0.28 },
  { x: 1100, y: 60, r: 620, c: '60,210,220', a: 0.26 }, { x: 420, y: 960, r: 600, c: '255,160,110', a: 0.18 },
];
const Midnight: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(160deg, #0c0a1f 0%, #151038 45%, #0b1630 100%)', overflow: 'hidden' }}>
    {AUR.map((b, i) => (
      <div key={i} style={{ position: 'absolute', left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%',
        background: `radial-gradient(closest-side, rgba(${b.c},${b.a}), rgba(${b.c},0))`,
        transform: `translate(${noise2D(`m-x-${i}`, t * 0.04, 0) * 240}px, ${noise2D(`m-y-${i}`, 0, t * 0.04) * 160}px) scale(${1 + 0.2 * noise2D(`m-s-${i}`, t * 0.03, 2)})` }} />
    ))}
    <div className="dk-grid" style={{ backgroundPosition: `0 ${(t * 18) % 80}px` }} />
  </AbsoluteFill>
);

const tickTimes = (at: number, d: number, n: number) => Array.from({ length: n }, (_, k) => at + (d * (k + 1)) / n);

export const AiEraAssignmentPractice: React.FC<Props> = ({ cues, sfx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { T } = timing(cues);

  const END_S = T(473, -0.1);
  type G = { name: string; from: number; kind: 'say' | 'full' | 'shot'; El?: (typeof SCENES)[number]['El']; shot?: (typeof SHOTS)[number] };
  const list: G[] = [...SCENES, ...SHOTS.map((sh) => ({ name: `${sh.id} ${sh.title.replace('\n', ' ')}`, from: sh.from, kind: 'shot' as const, shot: sh }))].sort((a, b) => a.from - b.from);
  const scenes = list.map((g, i, a) => ({ ...g, s: i ? T(g.from, -0.12) : 0, e: i < a.length - 1 ? T(a[i + 1].from, -0.12) : END_S }));
  const isShot = (i: number) => scenes[i]?.kind === 'shot';
  const charScenes = [...scenes.map((g) => ({ s: g.s, kind: g.kind === 'say' ? ('say' as const) : ('full' as const) })), { s: END_S, kind: 'say' as const }];
  const sections: [number, number, string, string][] = [
    [0, T(14, -0.12), '01', '들어가며'],
    [T(14, -0.12), T(32, -0.12), '02', 'AI 시대의 과제'],
    [T(32, -0.12), T(76, -0.12), '03', '평가 항목 4가지'],
    [T(76, -0.12), T(422, -0.12), '04', '직접 해 보기'],
    [T(422, -0.12), END_S, '05', '정리'],
  ];

  // a colour wipe hides every cut into or out of a full-screen impact scene
  const wipes = scenes.filter((g, i) => i > 0 && (g.kind === 'full' || scenes[i - 1].kind === 'full')).map((g) => g.s);
  const kicks = [T(3), T(8, 1.6), T(19, 0.8), T(72), T(73), T(77), T(295), T(297), T(455, 0.85), T(469)];
  const emotes: [number, IconName, string, string][] = [
    [T(7, 0.8), 'question', C.lav, BG.lav], [T(27, 0.3), 'check', C.mint, BG.mint], [T(34, 0.9), 'doc', C.sky, BG.sky], [T(53), 'up', C.mint, BG.mint],
    [T(70, 0.4), 'zap', C.yellow, BG.yellow], [T(108, 1.2), 'git', C.lav, BG.lav], [T(122, 0.7), 'check', C.mint, BG.mint], [T(149), 'bulb', C.yellow, BG.yellow],
    [T(166), 'zap', C.yellow, BG.yellow], [T(232), 'search', C.pink, BG.pink], [T(250), 'eye', C.mint, BG.mint], [T(289), 'camera', C.coral, BG.peach],
    [T(424), 'heart', C.pink, BG.pink], [T(448, 0.8), 'brain', C.pink, BG.pink], [T(454), 'question', C.sky, BG.sky], [T(466), 'chat', C.sky, BG.sky],
  ];
  const shotEv: Sfx[] = SHOTS.flatMap((sh) => {
    const s0 = T(sh.from, -0.12);
    const ev: Sfx[] = (sh.hl ?? []).map(([c, o]) => ({ at: Math.max(s0 + 0.4, T(c, o)), name: 'tick' as const, vol: 0.28 }));
    if (sh.count) ev.push(...tickTimes(T(sh.count[0], sh.count[1]), sh.count[3], sh.count[2]).map((at) => ({ at, name: 'tick' as const, vol: 0.18 })));
    if (sh.badge) ev.push({ at: T(sh.badge[0], sh.badge[1]), name: 'ding', vol: 0.24 });
    return ev;
  });
  const events: Sfx[] = [
    ...wipes.map((c) => ({ at: c - 0.3, name: 'whoosh' as const, vol: 0.3 })),
    ...kicks.map((k) => ({ at: k, name: 'hit' as const, vol: 0.3 })),
    ...scenes.filter((g, i) => g.kind === 'say' || (g.kind === 'shot' && !isShot(i - 1))).map((g) => ({ at: g.s + 0.05, name: 'whoosh' as const, vol: 0.1 })),
    ...emotes.map(([at]) => ({ at, name: 'pop' as const, vol: 0.14 })),
    ...shotEv,
    { at: END_S + 1.8, name: 'pop', vol: 0.2 }, { at: END_S + 2.3, name: 'pop', vol: 0.2 },
  ];

  const cam = camera(t, kicks);
  const impactNow = scenes.some((g) => g.kind === 'full' && t >= g.s && t < g.e);

  return (
    <AbsoluteFill className="pastel-root dark-root">
      <Audio src={staticFile('ai-era-assignment-practice/narration.m4a')} />
      {sfx && <SfxTrack events={events} />}

      <Midnight t={t} />
      {scenes.filter((g) => g.kind === 'full').map((g) => <ImpactBackdrop key={g.name} t={t} s={g.s} e={g.e} hue={-18} />)}
      <Bokeh t={t} cam={cam.drift} light={impactNow ? 1 : 0.4} />

      <AbsoluteFill style={{ transform: cam.transform, zIndex: 3 }}>
        <Character t={t} scenes={charScenes} waveAt={END_S + 0.4}>
          {emotes.map(([at, icon, c, b]) => <Emote key={at} t={t} at={at} icon={icon} color={c} bg={b} />)}
        </Character>
        {scenes.map((g, i) => (
          <Scene key={g.name} name={g.name} s={g.s} e={g.e} impact={g.kind === 'full'}
            tail={g.kind === 'shot' && isShot(i + 1) ? XF : 0} fadeIn={g.kind === 'shot' && isShot(i - 1) ? XF : undefined}>
            {g.shot ? <Shot sh={g.shot} T={T} enter={!isShot(i - 1)} /> : g.El && <g.El T={T} />}
          </Scene>
        ))}
        <EndCard t={t} at={END_S} likeAt={END_S + 1.8} thanksAt={END_S + 2.8} title={<>AI 시대의 과제,<br /></>} hlText="함께 고민해요" />
      </AbsoluteFill>

      <Brand />
      <ChapterChip t={t} sections={sections} />
      <Captions t={t} cues={cues} kw={KW} />
      {wipes.map((c, i) => <Wipe key={c} t={t} c={c} dir={i % 2 ? -1 : 1} />)}
      <Grain frame={frame} />
      <AbsoluteFill style={{ zIndex: 20, background: '#0c0a1f', opacity: (1 - prog(t, 0, 0.6)) + prog(t, DUR - 0.8, 0.8, E.p2in), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
