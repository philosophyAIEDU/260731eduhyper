---
workflow: general-video
flow: automation
storyboard: no
message: "AI 시대의 과제를 직접 해 보기 — 차별점 있는 SWOT 앱을 Claude 프로젝트 → Claude Code → GitHub → Netlify → Gemini API 로 만들고, 10회 이상 개선(커밋)하는 과정"
destination: youtube
aspect: 1920x1080
language: ko
length: 983s (16:23)
style_preset: pastel-glass-cards (ai-era-assignment 와 같은 계열) + 실습 화면(창 프레임 + 실습 노트)
---

## Intent

사용자 요청 원문: "AI 시대의 과제 영상과 자막을 넣어뒀고 PPT파일도 넣어뒀습니다. 이걸 보고 hyper와 remotion으로 각각 다른 스타일의 영상을
만들어주세요. hyper는 원래 하던 스타일(파스텔톤)으로 작업을 진행해주시고, 최종 작업물은 깃헙에 올려주세요. 제가 제공한 영상은
모션그래픽으로 덮어주세요. 그래도 실습하는 부분은 신경써주세요. ppt에 있는 이미지를 활용해도 좋습니다."

## Assets

- `AI 시대의 과제 영상.mp4` (16:35, PPT 화면 녹화 + 박힌 자막 + 빨간 펜) → **오디오만** `assets/media/narration.m4a` (0–983s).
  976.9s 이후는 무음 오로라 화면이라 엔드카드로 덮는다.
- `AI 시대의 과제 자막.srt` (473큐) → `assets/captions.srt`. 표기 교정은 build.mjs 의 FIX
  (SWAT→SWOT, 네틀리파이→넷리파이, 버스에서→버셀에서, EU 1027 SWAT→261027swot, Flashlight→Flash-Lite …).
- `AI 시대의 과제.pptx` 의 슬라이드 이미지 39장 → `assets/shots/s01…s39` (화면 녹화에 있던 자막·펜 표시가 없는 깨끗한 캡처).
  슬라이드가 화면에 나온 시각은 원본 영상의 장면 전환으로 측정해서 SRT 큐에 맞췄다.

## Structure

- 이론(0:00–2:58): 파스텔 모션그래픽 — 교수님들의 고민 → 옛날식/요즘식 과제 → 평가 항목 4가지 → "직접 해 봤습니다" 로드맵.
- 실습(2:58–14:27): `shots.json` 의 42개 실습 화면. 왼쪽 창 프레임 안에서 캡처를 확대/이동하고 하이라이트, 오른쪽 실습 노트
  (실습 단계 · 제목 · 핵심 메모 · 커밋 카운터 · 배지 · 팁). 실습 화면끼리는 크로스 디졸브.
  사이사이 설명 카드: PR · Merge 용어, 앱으로 배운다, Gemini 무료 티어, 개선 루프, 고민의 흔적, 커밋 10회, SWOT 매트릭스.
- 정리(14:27–16:23): 평가 항목 다시 보기 → AI 시대의 어려움 → "AI를 제대로, 많이, 잘" → 교육자분들께 → 엔드카드.

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/ai-era-assignment-practice.mp4`.
- 스타일: `assets/base.css` + `assets/extra.css`(이전 영상과 공통) + `assets/practice.css`(실습 화면).
- `shots.json` 은 Remotion 판(`remotion/src/videos/ai-era-assignment-practice/shots.json`)과 같은 내용 — 고치면 둘 다 복사.
- 실습 화면마다 radial-gradient 같은 무거운 효과를 넣지 말 것 (40개가 넘으면 렌더 앞부분이 검게 나올 수 있다는 check 경고).
- narration.m4a · out · snaps 는 대용량 생성물이라 저장소에 올리지 않는다.
