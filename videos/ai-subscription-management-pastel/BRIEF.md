---
workflow: general-video
flow: automation
storyboard: no
message: "AI 구독료를 아끼면서도 작업 흐름을 유지하는 7가지 실전 관리법"
destination: youtube
aspect: 1920x1080
language: ko
audience: "AI 유료 요금제가 비싸거나 토큰이 부족하다고 느끼는 사용자"
length: 430.677s
style_preset: pastel-warm-paper
---

## Intent

원본 "초고영상.mp4"는 사용자의 데스크탑을 그대로 녹화한 화면(작업표시줄·실시간 날짜/시간·날씨 위젯 노출)이라 그대로 공개할 수 없음이 확인되어, 2026-09-11 사용자 확인 후 오디오(내레이션)만 사용하고 화면 전체를 파스텔 톤 모션그래픽으로 새로 제작하는 것으로 전환함. 27개 장면 카드로 7가지 팁과 핵심 비교 수치를 구성하고, 제공된 SRT 타이밍으로 하단 안전 영역에 전체 자막을 추가함.

## Assets

- C:/Users/user/Desktop/Yes Philosophy AI Edu/0. Youtube (필로소피 AI 교육)/263. ai 구독료 관리/초고영상.mp4 — 오디오(내레이션)만 사용. 화면은 데스크탑 녹화라 공개용으로 쓰지 않음 → `public/narration.m4a`로 오디오만 추출.
- C:/Users/user/Desktop/Yes Philosophy AI Edu/0. Youtube (필로소피 AI 교육)/263. ai 구독료 관리/자막 srt.srt — 전 구간 한국어 자막과 타이밍 → `public/captions.srt`, 하단 안전 영역 자막으로 렌더에 반영.
- C:/Users/user/Desktop/Yes Philosophy AI Edu/0. Youtube (필로소피 AI 교육)/263. ai 구독료 관리/자막 txt.txt — 내용 확인용 원고.
- C:/Users/user/Desktop/Yes Philosophy AI Edu/0. Youtube (필로소피 AI 교육)/263. ai 구독료 관리/1.png — 6번 팁(card-25)에서 구독료 관리 앱을 설명할 때 크게 삽입.

## Customizations

- 파스텔 웜페이퍼 팔레트와 높은 명암 대비를 사용한다. 27개 장면(scene)이 각자 연한 파스텔 톤 배경(accent tint)을 가진다.
- 7가지 팁의 번호, 핵심 문장, 요금 비교를 27개의 풀스크린 그래픽 장면으로 구성한다. 장면 사이 공백이 없도록 각 장면은 다음 장면이 시작하기 전까지 화면을 채운다.
- 6번 팁의 앱 소개 구간(약 05:58–06:05, card-25)에 1.png를 좌우 분할 레이아웃으로 크게 보여준다.
- 자막(195개 문장)은 build.mjs가 `public/captions.srt`를 파싱해 하단 안전 영역 캡션 바로 자동 생성한다.

## Notes

- build.mjs가 전체 index.html/public/index.html을 재생성하는 소스. 카드 문구·타이밍을 바꾸려면 build.mjs의 `cards` 배열을 수정한 뒤 `node build.mjs` → `npx hyperframes check` 재실행.
- 원본 화면(데스크탑 녹화)은 사용하지 않기로 확정됨(2026-09-11, 사용자 확인). 오디오만 유지한다.
