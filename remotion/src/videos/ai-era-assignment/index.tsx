import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { type Cue, loadSrt } from '../../kit/srt';
import { Brand, Captions, ChapterChip, Character, EndCard, Fades, StageBg } from '../../kit/stage';
import { Scene, timing } from '../../kit/time';
import { SCENES } from './scenes';

// AI 시대의 과제 (7:15) — Remotion port of videos/ai-era-assignment (HyperFrames).
// public/ai-era-assignment/narration.m4a : 완성영상의 오디오 0–435s (README 의 추출 명령 참고)
// public/ai-era-assignment/captions.srt  : 자막 원본 — 표기 교정은 FIX

export const DUR = 435;
const FIX: [RegExp, string][] = [[/SWAT 웹/g, 'SWOT 앱'], [/SWAT/g, 'SWOT'], [/안티그래피티/g, '안티그래비티']];

export type Props = { cues: Cue[] };

export const calculateMetadata: CalculateMetadataFunction<Props> = async () => ({
  durationInFrames: DUR * 30,
  props: { cues: await loadSrt('ai-era-assignment/captions.srt', FIX) },
});

export const AiEraAssignment: React.FC<Props> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { T } = timing(cues);

  const scenes = SCENES.map((g, i) => ({ ...g, s: i ? T(g.from, -0.12) : 0 }));
  const END_S = T(196, -0.1);
  const all = [...scenes, { s: END_S, kind: 'say' as const }];
  const sections: [number, number, string, string][] = [
    [0, T(44, -0.12), '01', '교수님들의 고민'],
    [T(44, -0.12), T(52, -0.12), '02', '새로운 접근'],
    [T(52, -0.12), T(87, -0.12), '03', '과거의 과제'],
    [T(87, -0.12), T(140, -0.12), '04', 'AI 시대의 과제'],
    [T(140, -0.12), T(175, -0.12), '05', '왜 이 방식일까?'],
    [T(175, -0.12), END_S, '06', '교육자분들께'],
  ];

  return (
    <AbsoluteFill className="pastel-root">
      <Audio src={staticFile('ai-era-assignment/narration.m4a')} />
      <StageBg t={t} />
      <Character t={t} scenes={all} waveAt={END_S + 0.4} />
      {scenes.map((g, i) => (
        <Scene key={g.name} name={g.name} s={g.s} e={i < scenes.length - 1 ? scenes[i + 1].s : END_S}><g.El T={T} /></Scene>
      ))}
      <Brand />
      <ChapterChip t={t} sections={sections} />
      <EndCard t={t} at={END_S} likeAt={T(198, 0.3)} thanksAt={T(199, -0.1)} title={<>AI 시대의 과제,<br /></>} hlText="함께 고민해요" />
      <Captions t={t} cues={cues} />
      <Fades t={t} dur={DUR} />
    </AbsoluteFill>
  );
};
