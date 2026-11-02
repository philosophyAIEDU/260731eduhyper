---
workflow: general-video
flow: automation
storyboard: no
message: "교수님들을 위한 Claude Code CLI 2편(기초) — 작업 폴더(방) 지정, cd · cd .. · mkdir, claude.md, /model · /help"
destination: youtube
aspect: 1920x1080
language: ko
length: 747.0s
style_preset: pastel-glass-cards (claude-cli-install-1 과 같은 계열)
---

## Intent

사용자 요청 원문: "작업할 영상에 교수님들을 위한 클로드코드 CLI 영상과 자막을 올려놨습니다. 이거를 보고 모션그래픽 영상으로 만든 뒤,
깃헙에 올려주세요. upload-videos에 올려주세요. … (00:00~00:38 인트로 구간에서는 모션그래픽 영상만 넣어주시고, 그 이후부터는
제가 실습하고 있는 영상에 꼭 필요한 모션그래픽만 넣어주세요. 그리고 자막은 제가 영상에 넣은 검정색 배경 자막을 그대로 써주세요)"

## Assets

- `../작업할 영상/교수님들을 위한 클로드 코드 CLI 2편 영상.mp4` → `assets/media/src.mp4` (12:27, 1080p30, 하단에 검정 박스 자막이 이미 박혀 있음, 끝 ~17초는 오로라 아웃트로)
- `../작업할 영상/교수님들을 위한 클로드 코드 CLI 2편 자막.srt` → `assets/source.srt` (365큐). 모든 그래픽은 큐 번호에 고정(`T(n)`).

## Customizations

- 덮개 = 0 ~ 38.70s (큐 1–16, 큐 17 시작에 스냅). 장면: 타이틀(2편 · 기초) → 터미널을 연 폴더 = 작업실 → 폴더를 먼저 지정 → 오늘 배울 것.
- 덮는 구간에서는 원본 자막도 가려지므로 원본과 같은 모양(검정 박스·흰 글씨)의 자막을 다시 올린다. 그 이후는 원본 자막 그대로.
- 실습 카드 자리: 큐 18–63(IDE 로고 화면) = 오른쪽 위 `tr`, 큐 64–345(PowerShell · Claude 실행 · CLAUDE.md) = 왼쪽 Explorer 아래 빈 칸 `lane`,
  마무리 요약(큐 346–361)은 왼쪽에 손그림 필기가 있어 다시 `tr`.
- 오로라 아웃트로 위에 "2편 · 기초 완료 / 다음 편 3편 · 중급 실습" 엔드카드.

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/claude-cli-basics-2.mp4`
- `nested_structure_needs_subcomposition` 경고는 1편과 같은 단일 index.html 구조라 의도된 것.
