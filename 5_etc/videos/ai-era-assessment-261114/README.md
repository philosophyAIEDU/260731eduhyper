# AI 시대의 평가 — Remotion 영상

- 1920×1080 / 30fps / 약 4분 35초
- 원본 전체 길이 유지, 배경은 21개 모션그래픽 장면으로 교체
- 제공 SRT의 문구와 타이밍을 검은 배경/흰 글씨 자막으로 재현
- 최종 MP4의 음성은 원본 AAC를 재인코딩 없이 사용
- 속도 막대는 통계 수치가 아닌 개념도

## 수정 및 렌더링

```sh
npm ci
npx remotion studio index.tsx
npx remotion render index.tsx Main visual.mp4 --concurrency=2
ffmpeg -i visual.mp4 -i public/audio.m4a -map 0:v -map 1:a -c copy -movflags +faststart AI_Assessment_MotionGraphics.mp4
```

Linux에서 시스템 Chromium 사용 시 `--browser-executable=/usr/bin/chromium`을 추가합니다.

## 파일

- `index.tsx`: 장면, 디자인, 모션 구성
- `subtitles.srt`, `subs.json`: 원문 자막과 렌더링용 타임라인
- `public/audio.m4a`: 원본 오디오
- `original.mp4`: 제공된 원본 영상
- `AI_Assessment_MotionGraphics.mp4`: 최종 영상 (렌더링 완료 후 추가)
- `Remotion_Project.zip`: 편집용 프로젝트 묶음 (렌더링 완료 후 추가)
