---
workflow: general-video
flow: automation
message: "필로소피 AI 봉사단 2기 첫 온라인 회의 — 72분 회의를 30분으로 편집 + 모션그래픽·자막"
destination: 내부 공유 / 유튜브
aspect: 1920x1080
language: ko
length: 1798.63s
style_preset: pastel-glass-cards (claude-cli 시리즈와 같은 계열)
---

## Intent

1차 요청: 72분 회의 → 30분. 앞부분 필로소피 설명은 이해를 위해 남기고, 단원 소개는 줄이되 12명 모두 포함. 모션그래픽 없이 길이만.
2차 요청: 30분 편집본에 모션그래픽.
- 필로소피 설명 구간 → 아주 중요한 부분에만
- PPT 를 쓴 단원 → 그 PPT 화면 위 중요한 부분에만
- 목소리만 나온 단원 → 구간 전체를 모션그래픽으로
- 자막: 단원 이름 제외, 맞춤법·문맥에 맞게 다듬기

## 편집 (1차)

- 원본: `3_원본 보관/봉사단 첫 회의/봉사단 첫 회의 원본영상.mp4` (72:18)
- `edit/transcript.json` (whisper medium). 3080~3270s 는 전사가 "네"로 비어서 `edit/song.json` 으로 다시 전사함.
- `edit/cuts.py` → `edit/cuts.json` (원본 기준 68구간) → `edit/render.py` 로 잘라 붙임 → `assets/media/src.mp4`
- whisper 는 `C:\Users\user\.unsloth\studio\unsloth_studio\Scripts\python.exe` 에만 깔려 있음 (CUDA)

## 모션그래픽 (2차)

- 녹화에 PPT 가 실제로 보이는 단원은 2명: 원장님(PDF, 1273.5~1403) · 수석님(줌 공유, 1630.9~1750.6).
  두 분의 화면 공유(박사님·인스타툰 원장님)는 녹화에 안 잡혀서 목소리만 나온 분으로 처리.
- 수석님 구간은 줌 오른쪽 참가자·채팅 패널에 단원 이름과 개인 메시지가 보여서 카드 패널로 덮음. 상단 "○○'s screen" 라벨도 덮음.
- 목소리만 나온 10명: 슬라이드의 4항목(나는 누구인가요 / 전문 분야 / AI로 하는 일 / 발표 내용)을 상단 진행 칩으로, 왼쪽 프로필 카드(이름 없이 호칭·역할), 오른쪽에 말에 맞춰 카드가 쌓임.
- 필로소피 설명 구간 풀스크린 7장면: 타이틀 / 1기 성과 / 2기 계획 / "미래를 만드는 것" 인용 / 밑져야 본전 / 필로소피 발표 주제 / 단원 소개 전환 + 마무리 장면.

## 자막

- `assets/captions.txt` = 편집본 기준 시각 | 끝 | 문구. 손으로 교정한 최종본. ` / ` 는 나누는 자리, 34자 넘으면 build 가 쉼표·띄어쓰기에서 자동 분할.
- 이름은 전부 호칭(교수님·선생님·기술사님·원장님·박사님·수석님)으로 바꿈. 필로소피(진행자 본인)는 유지.

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/volunteer-meeting-1.mp4`
- `nested_structure_needs_subcomposition` 경고는 이전 편들과 같은 단일 index.html 구조라 의도된 것.

## v2 (2026-11-04) — 사용자 내보내기본 위에 다시 얹음

- 사용자가 30분 편집본을 다시 다듬어 자막을 박아 내보냄: `assets/media/export.mp4` (1780.5s), 자막 `assets/source.srt`.
  요청: **제공한 자막은 그대로**, 이름 부분만 가리기. 모션그래픽 규칙은 2차와 같음.
- 시간축: 오디오 맞대기(`edit/v2/align.py` → `align.json`)로 옛 src.mp4 대비 차이를 잼. 단원 구간은 −11.88s,
  m10·수석님 구간은 −12.17s. 장면 데이터는 옛 시각 그대로 두고 장면마다 `off` 로 당김 (`SH(off)` 래퍼).
  1기 장면·마무리 장면은 새 자막 시각으로 다시 씀 (`off: 0`).
- 자막: 원본에 박혀 있으므로 덮개 구간에서만 같은 모양(검정 박스·흰 글씨)으로 다시 올림.
  이름(`NAMES`)은 `<i class="nm">` 로 흐리게. 덮개 밖 이름 자막은 원본 박스 크기(`edit/v2/capbox.py` → `assets/capbox.json`)보다 크게 덮음.
- 화면 속 이름: PDF 탭·주소창·경로·본문 이름, 줌 공유 라벨·pptx 제목줄·슬라이드 이름을 템플릿 추적(`edit/v2/detect.py` → `assets/masks.json`)해 바탕색 패치로 지움. 참가자·채팅 패널은 카드 패널이 덮음.
- 렌더: `npx hyperframes render -o out/volunteer-meeting-1-v2.mp4`

## v3 (2026-11-04) — 이름 그대로, 표기 교정

- 사용자: "이름을 지우니까 더 이상하네요" → 이름 가리기 전부 해제 (`HIDE_NAMES = false`: 자막 흐림·화면 이름 패치 끔).
- 사용자가 준 바른 이름으로 자막 속 이름 표기만 교정 (`NAMEFIX`). 고친 자막이 덮개 밖이면 큐 전체를 같은 모양으로 다시 올려 박힌 자막을 덮는다 (21:02 '송정미 교수님' 1개).
- 단원 카드: 직함만 → "이름 + 직함님" (예: 임재홍 선생님). role '선생님' → '선생' 으로 '선생님님' 제거.
- 결과: `out/volunteer-meeting-1-v3.mp4` → `2_완성 영상/봉사단 첫 회의_30분 편집본_모션그래픽.mp4`, GitHub `5_etc/upload-videos/volunteer-meeting-1.mp4`.
