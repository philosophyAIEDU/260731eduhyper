---
workflow: general-video
flow: automation
message: "왕초보 바이브코딩 — 구글 AI 스튜디오로 나만의 앱 만들기 (튜토리얼, 두 트랙 방식)"
destination: youtube
aspect: 1920x1080
language: ko
length: 219.15s
style_preset: pastel-glass-cards (claude-cli · local-ai 시리즈와 같은 계열)
---

## Intent

사용자 요청 원문: "작업할 영상에 왕초보 바이브코딩 영상, 자막을 넣어놨습니다. 초보자들을 위한 실습 영상이니까, 필요한 부분에 모션그래픽을
쉽고 친절하게 넣어주세요. 다 완료되면 edyhyper 깃헙에 완료 영상을 올려주세요. 랜더링 까지 질문없이 작업해주시고 깃헙에 영상을 올려주세요."

## 원본 (`3_원본 보관/왕초보 바이브코딩/`, 납품 전엔 `1_작업할 영상/`)

- `왕초보 바이브코딩 영상.mp4` 219.17s — 화면 녹화, 검정 박스·흰 글씨 자막이 이미 박혀 있음. 206s 이후는 오로라 배경(말 없음).
- `왕초보 바이브코딩 자막.srt` 120큐 → `assets/source.srt`

## 구성 (모든 시각은 SRT 큐 시작 `T(n)` 에 고정)

- ① 덮개 (모션그래픽 전용, 같은 SRT 문구를 원본 자막과 같은 모양·위치로 다시 올림)
  - 0~T5 인트로: "왕초보를 위한 나만의 앱 만들기" + 말로 설명 → AI가 만들어요 + "결과물부터"
  - T36~T44: 프롬프트 한 줄 → 7분 57초 → 앱 완성 / 바이브 코딩이란? / 왕초보 3단계 로드맵(접속·설명·배포)
  - T107~끝: 가장 간단한 바이브 코딩 요약 → 계단(직면·공부·한 걸음씩) → 엔드카드(원본 끝 오로라를 덮음)
- ② 실습 화면 + 작은 카드 (화면 빈 곳: 대부분 오른쪽 위, 공유 패널 구간은 왼쪽)
  - 결과물: 7분 57초 + 프롬프트 / 앱 기능 / 업무·학습 앱 / AI 맞춤 조언
  - STEP 1 검색·주소 → New app·로그인 / TIP 앱 갤러리 리믹스 / STEP 2 간단한 프롬프트 → Tab·Enter / 대기
  - 임팩트 팝: "AI가 순식간에"(코드), "배포까지 끝!" / STEP 3 Share·Publish·결제 카드 프로젝트 필요

## Notes

- 재생성: `node build.mjs` → `npx --yes hyperframes@0.8.169 check` → `npx --yes hyperframes@0.8.169 render -o out/vibe-coding-beginner.mp4`
- 홈 화면(Build your ideas)은 오른쪽 위 x≥1540, y≤410 만 비어 있어 그 구간 카드는 폭 360(`.ovc.narrow`).
