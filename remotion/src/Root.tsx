import React from 'react';
import { Composition } from 'remotion';
import './kit/fonts';
import './kit/pastel.css';
import './kit/pro.css';
import { AiEraAssignment, calculateMetadata as aiEraMeta, DUR as AI_ERA_DUR } from './videos/ai-era-assignment';

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
  </>
);
