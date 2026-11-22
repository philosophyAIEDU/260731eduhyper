---
workflow: insight-video (Remotion 판)
flow: automation
message: "AI를 질문 기계로만 쓰면 사고력이 크지 않는다. AI로 무언가를 만들어(빌드) 보는 과정을 반복할 때 사고력이 향상된다"
destination: youtube
aspect: 1920x1080
language: ko
length: 412s
style_preset: insight-cinematic (ADHD 편 Remotion 판과 같은 다크 + 금색)
---

## Intent

사용자 요청 원문: "ai로 사고력을 향상시키는 방법 영상, 자막을 작업할 영상 폴더에 넣어놨습니다. 배경 화면은 안 써도 됩니다.
모션그래픽, 픽사베이 사진을 활용해서, 사람들이 몰입해서 볼 수 있는 영상을 만들어주세요. 랜더링까지 질문 없이 완료해주세요.
git hub, eduhyper 저장소에 완성 영상을 넣어주세요."

## 원본 (`3_원본 보관/AI로 사고력을 향상시키는 방법/`)

- `AI로 사고력을 향상시키는 방법 영상.mp4` 424s — 화면은 쓰지 않고 소리만 사용. 말이 끝난 뒤 무음은 잘라 412s.
- `AI로 사고력을 향상시키는 방법 자막.srt` 201큐 → `assets/source.srt`, `remotion/public/ai-thinking-build/captions.srt` (문구 수정 없음)

## 구성

- 소재: 이 폴더의 `shots.json` (Pixabay 사진 30장 + Pixabay 영상 10개 + Gemini 1장(s36 찰흙 만들기)) — `node ../../scripts/visuals.mjs fetch`
- 영상 엔진: Remotion — `remotion/src/videos/ai-thinking-build/` (`shots.ts` 샷, `beats.tsx` 장면 그래픽 48개, `gfx.tsx` 공용 부품)
- 챕터 3개: 01 사고력이란 (큐 3) / 02 AI 시대, 왜 사고력인가 (큐 19) / 03 AI로 사고력 키우기 (큐 100)
- 전체 모션 장면 7개: 4년 타임라인, 의존 → 구독료, 사고력 없이 vs 충분히 비교, BUILD, 질문 기계가 아닙니다, 반복 순환, 엔드카드
- 사진·영상 위에는 큐마다 그래픽: 생각+궁리=힘, 객관식✗, 내비 사용자 감소, 머리 쓸 일 막대, 채팅 말풍선, 타이핑 프롬프트,
  아이디어 카드 ✓✗, 프롬프트→바이브 코딩→GitHub→배포 흐름, 찰흙 공 → 모양 만들기 등
- 출처는 영상에 넣지 않고 `edit/CREDITS.txt` 를 설명란에 넣는다.

## 재생성

1. `node ../../scripts/visuals.mjs fetch` 후 `assets/media/visuals/*` 를 `remotion/public/ai-thinking-build/visuals/` 로 복사
2. `ffmpeg -i "<원본 영상>" -t 412 -vn -c:a aac -b:a 192k remotion/public/ai-thinking-build/narration.m4a`
3. `remotion/` 에서 `npx remotion render ai-thinking-build out/ai-thinking-build.mp4`
   → 배포용 `ffmpeg -i out/ai-thinking-build.mp4 -c:v libx264 -preset slow -crf 20 -c:a copy out/ai-thinking-build-final.mp4`
