---
workflow: general-video
flow: automation
storyboard: no
message: "교수님들을 위한 Claude Code CLI 3편 — 폴더 정리 실습 (가상 자료 → /plan → 정리 → 검증 → cleanup-log → CLAUDE.md)"
destination: youtube
aspect: 1920x1080
language: ko
length: 352.76s
style_preset: pastel-glass-cards (claude-cli-basics-2 와 같은 계열)
---

## Intent

사용자 요청 원문: "3편 영상과 자막을 작업할 영상에 넣어뒀습니다. 제가 실습한 화면과 검정색 배경 자막은 그대로 잘 살려주시고,
포인트 부분에만 모션그래픽을 깔끔하게 넣어서 사용자들이 집중할 수 있게 해주세요. 제 실습 영상의 장점이 잘 드러나게 모션그래픽을
잘 넣어주세요. 필로소피 캐릭터도 너무 많이 쓰지는 마시고, 초반, 끝에만 살짝 넣어주세요. … 깃헙 저장소 (eduhyper)에 올려주세요."

## Assets

- `1_작업할 영상/교수님들을 위한 클로드 코드 CLI 3편 영상.mp4` → `assets/media/src.mp4` (5:52.8, 1080p30, 하단 검정 박스 자막이 박혀 있음, 334s~ 오로라 아웃트로)
- `1_작업할 영상/교수님들을 위한 클로드 코드 CLI 3편 자막.srt` → `assets/source.srt` (192큐). 모든 그래픽은 큐 번호에 고정(`T(n)`).

## Customizations

- 덮는 구간 없음. 인트로(0 ~ 큐 5)는 실습 화면을 어둡게 깔고 타이틀 + 캐릭터를 올리되, 원본 자막 띠는 가리지 않는다.
- 실습의 장점 = "안전한 순서". 제목 표시줄 위에 `폴더 정리 순서` 진행 바(가상 자료 → /plan 계획 → 정리 → 검증 → 정리 로그 → CLAUDE.md)를
  큐 23 ~ 188 동안 띄우고, 해당 단계가 말해질 때 불이 켜진다. 마무리 요약(큐 155~176)에서 순서대로 다시 켜진다.
- 카드 자리: 큐 9–92 = 왼쪽 Explorer 아래 빈 칸 `lane` (Explorer 가 펼쳐지기 전), 큐 104–152 = 오른쪽 아래 `br`,
  큐 163–188 = 오른쪽 위 `tr` (아래쪽에 손글씨 필기가 있음).
- 캐릭터는 인트로와 엔드카드에만.
- 오로라 아웃트로 위 "3편 · 폴더 정리 완료 / 4편에서 만나요" 엔드카드.

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/claude-cli-folder-3.mp4`
- `nested_structure_needs_subcomposition` 경고는 1·2편과 같은 단일 index.html 구조라 의도된 것. `text_below_floor` 는 실습 화면을 덜 가리려고 일부러 작게 만든 카드.
