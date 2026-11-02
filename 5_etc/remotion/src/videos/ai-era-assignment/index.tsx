import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { type Cue, loadSrt } from '../../kit/srt';
import { Brand, Captions, ChapterChip, Character, EndCard, Fades } from '../../kit/stage';
import { Backdrop, Bokeh, camera, Emote, Grain, ImpactBackdrop, type Sfx, SfxTrack, Wipe } from '../../kit/fx';
import { Scene, timing } from '../../kit/time';
import { BG, C } from '../../kit/ui';
import type { IconName } from '../../kit/icons';
import { SCENES } from './scenes';

// AI 시대의 과제 (7:15) — cinematic Remotion edition of videos/ai-era-assignment (HyperFrames).
// public/ai-era-assignment/narration.m4a : 완성영상의 오디오 0–435s (README 의 추출 명령 참고)
// public/ai-era-assignment/captions.srt  : 자막 원본 — 표기 교정은 FIX
//
// Layers (bottom → top): living backdrop · impact gradient (full scenes) · bokeh ·
// camera [character + emotes · scenes · end card] · chrome · karaoke captions · wipes · grain · fades

export const DUR = 435;
const FIX: [RegExp, string][] = [[/SWAT 웹/g, 'SWOT 앱'], [/SWAT/g, 'SWOT'], [/안티그래피티/g, '안티그래비티']];
const KW = /AI|SWOT|GitHub|클로드|챗GPT|엔비디아|NVIDIA|AMD|사고력|논리력|평가|과제|캡처|차별/;

export type Props = { cues: Cue[]; sfx: boolean };

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => ({
  durationInFrames: DUR * 30,
  props: { ...props, cues: await loadSrt('ai-era-assignment/captions.srt', FIX) },
});

/** Frame times at which an eased (cubic-out) count from 0 to n ticks over. */
const tickTimes = (at: number, d: number, n: number) => Array.from({ length: n }, (_, k) => at + d * (1 - Math.cbrt(1 - (k + 1) / n)));

export const AiEraAssignment: React.FC<Props> = ({ cues, sfx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { T } = timing(cues);

  const END_S = T(196, -0.1);
  const scenes = SCENES.map((g, i, a) => ({ ...g, s: i ? T(g.from, -0.12) : 0, e: i < a.length - 1 ? T(a[i + 1].from, -0.12) : END_S }));
  const all = [...scenes, { s: END_S, kind: 'say' as const }];
  const sections: [number, number, string, string][] = [
    [0, T(44, -0.12), '01', '교수님들의 고민'],
    [T(44, -0.12), T(52, -0.12), '02', '새로운 접근'],
    [T(52, -0.12), T(87, -0.12), '03', '과거의 과제'],
    [T(87, -0.12), T(140, -0.12), '04', 'AI 시대의 과제'],
    [T(140, -0.12), T(175, -0.12), '05', '왜 이 방식일까?'],
    [T(175, -0.12), END_S, '06', '교육자분들께'],
  ];

  // a colour wipe hides every cut into or out of a full-screen impact scene
  const wipes = scenes.filter((g, i) => i > 0 && (g.kind === 'full' || scenes[i - 1].kind === 'full')).map((g) => g.s);
  // camera punch-ins (the big words) and stamp hits
  const kicks = [T(4, 1.2), T(20), T(21), T(22), T(43, 0.95), T(46, 0.9), T(47, 0.2), T(47, 0.75), T(87, 0.6), T(146, 0.4), T(158, 2.3), T(180, 0.2)];
  const stamps = [T(30, 1.0), T(51, 1.2), T(74), T(103, 0.8), T(178)];
  const emotes: [number, IconName, string, string][] = [
    [T(9), 'question', C.lav, BG.lav], [T(15, 0.3), 'question', C.pink, BG.pink], [T(30, 1.0), 'zap', C.yellow, BG.yellow],
    [T(37, 0.4), 'sparkle', C.yellow, BG.yellow], [T(51, 1.2), 'up', C.coral, BG.peach], [T(65, 0.3), 'book', C.lav, BG.lav],
    [T(84, 0.4), 'question', C.sky, BG.sky], [T(96, 0.6), 'bulb', C.yellow, BG.yellow], [T(103, 0.9), 'check', C.mint, BG.mint],
    [T(124, 2.9), 'sparkle', C.mint, BG.mint], [T(154, 0.2), 'brain', C.pink, BG.pink], [T(166, 0.3), 'heart', C.coral, BG.peach],
    [T(178, 0.2), 'chat', C.mint, BG.mint], [T(183, 0.8), 'heart', C.pink, BG.pink], [T(194), 'rocket', C.sky, BG.sky],
    [T(198, 0.4), 'thumb', C.coral, BG.peach],
  ];
  const events: Sfx[] = [
    ...wipes.map((c) => ({ at: c - 0.3, name: 'whoosh' as const, vol: 0.32 })),
    ...kicks.map((k) => ({ at: k, name: 'hit' as const, vol: 0.34 })),
    ...stamps.map((k) => ({ at: k, name: 'ding' as const, vol: 0.22 })),
    ...scenes.filter((g) => g.kind === 'say').map((g) => ({ at: g.s + 0.05, name: 'whoosh' as const, vol: 0.1 })),
    ...emotes.map(([at]) => ({ at, name: 'pop' as const, vol: 0.16 })),
    ...tickTimes(T(124, 0.2), 2.6, 10).map((at) => ({ at, name: 'tick' as const, vol: 0.2 })),
    ...tickTimes(T(69, 0.7), 1.75, 5).map((at) => ({ at, name: 'tick' as const, vol: 0.2 })),
  ];

  const cam = camera(t, kicks);
  const impactNow = scenes.some((g) => g.kind === 'full' && t >= g.s && t < g.e);

  return (
    <AbsoluteFill className="pastel-root">
      <Audio src={staticFile('ai-era-assignment/narration.m4a')} />
      {sfx && <SfxTrack events={events} />}

      <Backdrop t={t} />
      {scenes.filter((g) => g.kind === 'full').map((g) => <ImpactBackdrop key={g.name} t={t} s={g.s} e={g.e} />)}
      <Bokeh t={t} cam={cam.drift} light={impactNow ? 1 : 0} />

      <AbsoluteFill style={{ transform: cam.transform, zIndex: 3 }}>
        <Character t={t} scenes={all} waveAt={END_S + 0.4}>
          {emotes.map(([at, icon, c, b]) => <Emote key={at} t={t} at={at} icon={icon} color={c} bg={b} />)}
        </Character>
        {scenes.map((g) => (
          <Scene key={g.name} name={g.name} s={g.s} e={g.e} impact={g.kind === 'full'}><g.El T={T} /></Scene>
        ))}
        <EndCard t={t} at={END_S} likeAt={T(198, 0.3)} thanksAt={T(199, -0.1)} title={<>AI 시대의 과제,<br /></>} hlText="함께 고민해요" />
      </AbsoluteFill>

      <Brand />
      <ChapterChip t={t} sections={sections} />
      <Captions t={t} cues={cues} kw={KW} />
      {wipes.map((c, i) => <Wipe key={c} t={t} c={c} dir={i % 2 ? -1 : 1} />)}
      <Grain frame={frame} />
      <Fades t={t} dur={DUR} />
    </AbsoluteFill>
  );
};
