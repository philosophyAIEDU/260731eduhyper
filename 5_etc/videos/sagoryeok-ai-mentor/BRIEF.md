---
workflow: general-video
flow: automation
storyboard: no
message: "AI 사용법보다 중요한 것은 AI로 사고력을 키우는 것 — 클로드 프로젝트(사고력 향상 AI 멘토)로 AI와 날선 토론을 해 본 실습"
destination: youtube
aspect: 1920x1080
language: ko
length: 469.07s (7:49)
style_preset: pastel-glass-cards (comingsoon-ai-coaching / innercircle-gpt 와 같은 계열)
---

## Intent

사용자 요청 원문: "완성영상에 모션그래픽을 넣어주세요. 1. 00:29~01:57 인트로 구간 (특히, 모션그래픽 위주로 중요한 내용을 강조해주세요,
캐릭터도 활용해주세요) 2. 02:10~06:48 AI 토론 구간은 중요한 부분에만 모션그래픽을 넣어주시고, 원본 화면의 내용도 잘 살려주세요.
3. 06:48~07:49 : 마지막 마무리도 모션그래픽을 활용해주세요. 캐릭터도 넣어주세요" + "필로소피 캐릭터.png 를 써주세요".

## Assets

- `../작업할 영상/사고력 완성영상.mp4` (7:49, 1080p30, Claude 데스크탑 화면 녹화, **하단 검정 박스 자막이 박혀 있음**) → `assets/media/source.mp4` (컷 편집 없음).
- `../작업할 영상/사고력 자막.srt` (263큐) → `assets/captions.srt`. 그래픽은 큐 번호에 고정(T(cue)).
- `../../필로소피 캐릭터.png` (크림 배경) → 가장자리 flood-fill 로 배경 제거 → `assets/media/philosophy.png`.

## Customizations

- 크림 자막 밴드(y 916–1080)가 박힌 자막과 작업표시줄(날짜·시간·날씨)을 가리고, SRT 자막을 새로 올린다.
- 0:00–0:29: 원본 + 타이틀 카드, 프로젝트 이름/목적·지침 받는 곳 콜아웃(split).
- 0:29–1:59 인트로: 파스텔 풀스크린 + 캐릭터(왼쪽, 말할 때 들썩) + 말풍선 카드 8장.
- 2:08 실습 챕터 카드 → 토론 구간: 핵심 순간에만 원본 화면을 왼쪽으로 60% 축소(하단 자막·작업표시줄은 잘라냄) + 오른쪽 요약 카드 12장,
  감정 리액션은 캐릭터가 자막 밴드 뒤에서 올라오는 말풍선(peek) 4번.
- 6:48– 마무리: 파스텔 풀스크린 + 캐릭터 + 카드 5장 → 엔드카드(좋아요·구독).

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/sagoryeok-ai-mentor.mp4`.
- source.mp4 · out · snaps 는 대용량 생성물이라 저장소에 올리지 않는다.
