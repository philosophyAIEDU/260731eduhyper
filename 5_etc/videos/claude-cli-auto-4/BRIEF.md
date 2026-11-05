---
workflow: general-video
flow: automation
storyboard: no
message: "교수님들을 위한 Claude Code CLI 4편 — 중급 실습 · 반복 업무 자동화 (가상 자료 → /plan → 이름 통일 → 스킬 /weekly-notice → 매일 8시 피드백 초안)"
destination: youtube
aspect: 1920x1080
language: ko
length: 602.2s
style_preset: pastel-glass-cards (claude-cli-install-1 과 같은 계열)
---

## Intent

사용자 요청 원문: "초반 00:00~01:33에는 모션그래픽으로만 영상을 만들어주세요. 01:34~08:50 여기에서는 실습 영상 위주로 해주시고
모션그래픽은 중요한 내용만 깔끔하고 임팩트있게 딱딱 찝어주는 용도로 써주세요. 08:51부터는 모션그래픽만 써서 영상을 만들어주세요.
이제 질문 없이 바로 랜더링 작업까지 마쳐주시고, 깃헙 저장소에 올려주세요 (eduhyper)."

## Assets

- `1_작업할 영상/교수님들을 위한 클로드 코드 CLI 4편 영상.mp4` → `assets/media/src.mp4` (10:02, 1080p30, 하단 검정 박스 자막이 박혀 있음, 580s~ 오로라 아웃트로)
- `1_작업할 영상/교수님들을 위한 클로드 코드 CLI 4편 자막.srt` → `assets/source.srt` (307큐). 모든 그래픽은 큐 번호에 고정(`T(n)`).

## Customizations

- 덮개 1 = 0 ~ 93.65s (큐 1–43, 큐 44 시작에 스냅). 장면: 타이틀 → 4편 로드맵 → 자동화하기 좋은 일 → 사람이 꼭 확인할 일 → AI + 사람 →
  자동화하면 안 되는 일(성적·부정행위) → 학생과의 관계 피드백 → AI → 교수님 → 학생 흐름.
- 덮개 2 = 530.29s ~ 끝 (큐 280–307 + 아웃트로). 장면: 오늘 해 본 실습 요약 → 나만의 프롬프트 만드는 법 3단계 → 개인 정보 주의 → 엔드카드(1–4편 완주, 캐릭터).
- 덮는 구간은 원본 자막도 가려지므로 같은 모양(검정 박스·흰 글씨)의 자막을 다시 올린다.
- 실습 카드(16개, 짧게): 큐 52–95 = 왼쪽 Explorer 아래 빈 칸 `lane`, 큐 105–279 = 위쪽 편집기 탭 줄 오른쪽 띠 `top` (터미널 내용을 가리지 않음).
  핵심: 고정 댓글 텍스트 파일, 나만의 프롬프트, STEP 1 폴더 열기, 가상 자료(실제 이름 ✕), 제각각 파일명, /plan, 이름 통일 27개,
  스킬 = 명령어 하나 / 약속, /weekly-notice, TIP 스킬로 만들어 줘, 매일 8시 피드백(점수 ✕), 교수님 한마디, 폴더에 넣기만, 공지문 완성.
- 캐릭터는 인트로·엔드카드에만.

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/claude-cli-auto-4.mp4`
- `nested_structure_needs_subcomposition` 경고는 1–3편과 같은 단일 index.html 구조라 의도된 것.
