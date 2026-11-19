---
workflow: general-video
flow: automation
message: "교수님만의 AI 연구실 (Philosophy Research Hub) 앱 소개 + 실습 (튜토리얼, 두 트랙 방식)"
destination: youtube
aspect: 1920x1080
language: ko
length: 527.85s
style_preset: pastel-glass-cards (claude-cli · local-ai · vibe-coding 시리즈와 같은 계열)
---

## Intent

사용자 요청 원문: "작업할 영상에 교수님만의 ai 연구실 영상, 자막이 있습니다. 중요한 부분에 모션그래픽을 잘 넣어주세요. 보는 사람들이 집중할 수
있게 적절하게 잘 넣어주시고, 자막은 그대로 활용해주세요. 실습을 잘 할 수 있도록 적절히 모션그래픽을 넣어주시고, 랜더링이 끝날 때까지 질문 없이
작업을 마쳐주세요. 깃헙 저장소에 완성 영상을 올려주세요." (+ "깃헙 저장소 eduhyper")

## 원본 (`3_원본 보관/교수님만의 AI 연구실/`, 납품 전엔 `1_작업할 영상/`)

- `교수님만의 AI 연구실 영상.mp4` 527.87s — 앱 소개 사이트 + 앱 실습 화면 녹화. 검정 박스·흰 글씨 자막(약 64px)이 박혀 있음. 514s 이후 오로라(말 없음).
- `교수님만의 AI 연구실 자막.srt` 293큐 → `assets/source.srt` (문구 그대로)

## 구성 (모든 시각은 SRT 큐 시작 `T(n)`)

- ① 덮개 0~T62: 제목 → 받는 방법(고정 댓글→카페→사이트→Windows/Mac) → 하는 일(저장·노트·프로젝트) → 로컬 AI →
  흩어진 논문을 한 곳에(지식 자산) → "그 논문 어디 있었더라?" → 2~10편 비교표 → 로컬 AI vs Gemini API → 메뉴 8개 → 시작 3단계
- ② T62~T265 앱 실습: 화면 위쪽 빈 곳에 한 줄 안내 배너 — 대시보드 / STEP 1 AI 연결·고르기·모델 받기·색인·설정 탭 /
  STEP 2 논문 등록 / 실습 자료 / 기능 1 AI 연구 검색·검색 방식 / 기능 2 논문 비교 / 기능 3 문헌 고찰 / 기능 4 지식 그래프 /
  기능 5 연구 노트 / 기능 6 연구 프로젝트 / 기능 7 Zotero / 기능 8 내보내기. 임팩트 팝 2개: "AI 준비 완료!", "논문 8편 등록!"
  - 오른쪽 위 버튼(파일 등록)을 누르는 구간은 `topc`(조금 왼쪽), 새 노트·새 프로젝트·Zotero 버튼 구간은 `br`(오른쪽 아래).
- ① 덮개 T265~끝: AI 발전 속도 그래프 → 따라가기보다 내 업무에 맞게 세팅 → 앱 안내 → 엔드카드(원본 끝 오로라를 덮음)

## Notes

- 재생성: `node build.mjs` → `npx --yes hyperframes@0.8.169 check` → `npx --yes hyperframes@0.8.169 render -o out/ai-research-lab.mp4`
- lint 의 `composition_file_too_large` 등 경고는 이전 편들과 같은 단일 index.html 구조라 의도된 것.
