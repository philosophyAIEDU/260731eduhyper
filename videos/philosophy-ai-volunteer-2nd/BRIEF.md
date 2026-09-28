---
workflow: general-video
message: "필로소피 AI 봉사단 2기 모집 — AI로 교육자를 돕는 사람들을 찾습니다"
destination: youtube
aspect: 1920x1080
language: ko
length: 314.0s (내레이션 312.38s + 끝 카드 1.6s)
style_preset: pastel-warm
---

## Intent

원본 초고 영상은 블로그 글 화면 녹화라, **오디오(내레이션)만 쓰고 화면은 전부
파스텔 톤 모션그래픽으로 덮었다.** 30개 씬, 13개 챕터, 제공된 SRT 116줄을
하단 자막으로 표시한다.

## Assets

- 초고 영상.mp4 → `public/narration.m4a` (오디오만 추출, 저장소에는 올리지 않음)
- 자막 srt → `public/captions.srt` (씬 경계·비트 타이밍의 기준이자 하단 자막)
- 자막 txt → `script.txt` (내용 확인용 대본)

## 구조

- `build.mjs` — 씬 정의(마크업 + GSAP 비트)와 타이밍. 이걸 고친 뒤 `node build.mjs` → `index.html` 재생성
- `style.css` — 파스텔 스타일 (빌드 시 index.html 에 인라인)
- 폰트: Pretendard (OFL, `public/fonts/`)

## 재현

```bash
node build.mjs
npx hyperframes@0.8.34 check
npx hyperframes@0.8.34 render -o renders/philosophy-ai-volunteer-2nd.mp4 -q high
```

## 메모

- 씬 시작은 모두 SRT 큐 시각에 스냅. 각 씬 안의 강조(형광펜, 카운트업, 등장)도 해당 문장이 발화되는 큐에 맞춤.
- "활동 기간: 26년 11월부터 내년 6월까지" → 화면에는 `2026년 11월 ~ 2027년 6월`로 표기.
- S17의 분야 태그(초등·중등·고등·대학·연구·평생교육), S19의 AI 툴 종류, S20의 추천 카드 문구는 대본의 "여러 분야", "AI 툴들", "도움이 될 만한 것들"을 시각화하기 위한 예시 문구.
