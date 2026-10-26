---
workflow: general-video
flow: automation
storyboard: no
message: "AI를 막기 어렵다면 최대한 잘 쓰게 하고, 대신 과제를 어렵게 — AI 시대의 과제(차별점 있는 SWOT 앱 만들기 + 과정 캡처 + 10회 개선 + 발표)"
destination: youtube
aspect: 1920x1080
language: ko
length: 435s (7:15)
style_preset: pastel-glass-cards (sagoryeok-ai-mentor 와 같은 계열)
---

## Intent

사용자 요청 원문: "ai 시대의 과제(완성영상, 자막)을 활용해서 모션그래픽 영상을 만들어주세요. ppt화면은 그냥 모션그래픽으로 덮어버리세요.
자막도 넣어주시고, 중요한 부분에 임팩트 있게 모션그래픽을 넣어주세요. 영상이 완성되면 깃헙에 올려주세요."

## Assets

- `완성영상 (ai 시대의 과제).mp4` (7:29, PPT 화면 + 박힌 자막) → **오디오만** `assets/media/narration.m4a` (0–435s).
  7:11 이후는 무음 오로라 화면이라 잘라내고 엔드카드로 마무리.
- `자막 (ai 시대의 과제).srt` (199큐) → `assets/captions.srt`. 표기 교정: SWAT→SWOT, 안티그래피티→안티그래비티.
- `assets/media/philosophy.png` — 필로소피 캐릭터 (sagoryeok-ai-mentor 에서 재사용).

## Structure

- 전 구간 파스텔 풀스크린(원본 PPT 화면은 쓰지 않음). 씬 34개, 큐 번호에 고정.
- 'say' 씬: 캐릭터 왼쪽 + 말풍선 카드 / 'full' 씬: 캐릭터 퇴장 + 중앙 임팩트 타이포.
- 임팩트: 오프닝 질문, 세 가지 질문, "새로운 방식이 필요합니다", "AI, 최대한 잘 써봐라", "AI 시대의 과제",
  "AI 쓸 거면 확실하게", 역설("AI를 최대한 써서 뭔가를 만들어봐라"), "고생 많으십니다".
- 평가 항목 1~4는 상단 스테퍼로 진행 표시.

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/ai-era-assignment.mp4`.
- 스타일: `assets/base.css`(이전 영상과 공통) + `assets/extra.css`(이번 영상 추가분).
- narration.m4a · out · snaps 는 대용량 생성물이라 저장소에 올리지 않는다.
