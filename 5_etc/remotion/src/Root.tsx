import React from 'react';
import { Composition } from 'remotion';
import './kit/fonts';
import './kit/pastel.css';
import './kit/pro.css';
import { AiThinkingBuild, calculateMetadata as thinkMeta, DUR as THINK_DUR } from './videos/ai-thinking-build';
import { AiEraAssignment, calculateMetadata as aiEraMeta, DUR as AI_ERA_DUR } from './videos/ai-era-assignment';
import { YeonsungAiClass, calculateMetadata as yeonsungMeta, DUR as YEONSUNG_DUR } from './videos/yeonsung-ai-class';
import { AiEraAssignmentPractice, calculateMetadata as practiceMeta, DUR as PRACTICE_DUR } from './videos/ai-era-assignment-practice';

// One <Composition> per video. New video: copy src/videos/ai-era-assignment, register it here.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ai-era-assignment"
      component={AiEraAssignment}
      durationInFrames={AI_ERA_DUR * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ cues: [], sfx: true }}
      calculateMetadata={aiEraMeta}
    />
    <Composition
      id="ai-era-assignment-practice"
      component={AiEraAssignmentPractice}
      durationInFrames={PRACTICE_DUR * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ cues: [], sfx: true }}
      calculateMetadata={practiceMeta}
    />
    <Composition
      id="ai-thinking-build"
      component={AiThinkingBuild}
      durationInFrames={THINK_DUR * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ cues: [], sfx: true }}
      calculateMetadata={thinkMeta}
    />
    <Composition
      id="yeonsung-ai-class"
      component={YeonsungAiClass}
      durationInFrames={YEONSUNG_DUR * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ cues: [], sfx: true }}
      calculateMetadata={yeonsungMeta}
    />
  </>
);
