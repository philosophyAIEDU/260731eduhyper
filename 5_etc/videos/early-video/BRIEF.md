---
workflow: general-video
flow: automation
message: "필로소피 AI 교육 봉사단 — Claude Code CLI 30분 실습 리허설 (88분 줌 녹화 → 31분 편집 + 모션그래픽, 얼굴 가림)"
destination: 내부 공유 / 유튜브
aspect: 1920x1080
language: ko
length: 1871.8s
style_preset: pastel-glass-cards (claude-cli 시리즈 · volunteer-meeting-1 과 같은 계열)
---

## Intent

사용자 요청 원문: "작업할 영상에 들어 있는 초기 영상을 30분 정도로 줄여주세요. 그리고 중요한 부분에 모션그래픽을 적절히 넣어주세요.
얼굴은 가려주세요. 질문 없이 랜더링까지 끝내주시고, 깃헙에 올려주세요 (eduhyper)"

## 원본

- `3_원본 보관/초기영상/초기영상.mp4` (납품 전에는 `1_작업할 영상/`) (1:27:50, 1152x720 24fps 줌 녹화). 필로소피가 봉사단 단원들과 오프라인 컨퍼런스용
  Claude Code CLI 실습(깃허브에 미리 준비한 30분 코스, STEP 1–6 + 매일 8시 자동화)을 해 보고, 끝에 단원 피드백.
- 자막(SRT) 없음 → `edit/transcript.json` (whisper medium, `scripts/transcribe.py`, unsloth python + CUDA).

## 편집

- `edit/cuts.py` → `edit/cuts.json` (원본 기준 59구간, 구간 안 1.5초 넘는 무음 정리 → 80조각) → `edit/render.py` → `assets/media/src.mp4`.
- 빠진 것: 시작 전 잡담, 참가자 개별 문제 해결(경로·cd·화면 공유 실수), 결과 공유 대기, 반복 설명, 피드백 일부.
- render.py 는 프레임 단위로 자른다(누적 끝 × 30 반올림). 영상은 조각별 인코딩 후 이어 붙이고, 소리는 원본에서 같은 길이로
  한 번에 잘라 붙인다 → 계산한 시각표와 실제 영상이 정확히 일치(1871.8s), 싱크 밀림 없음. (ts 조각 concat 은 조각마다 1프레임씩 밀렸음)
- `edit/outscript.txt` = 편집본 기준 발화 시각. 그래픽 시각은 전부 여기서 잡았다.

## 얼굴 가림

- 줌 녹화의 화면 공유 영역(x0–1022, y84–632)만 잘라 1720x922 로 키워 위쪽에 둔다 → 오른쪽 참가자 얼굴 띠는 영상에 아예 없다.
- 원본 앞 3분(갤러리 보기, 얼굴 타일이 큼)은 편집본 0–92.8s 인트로 덮개 장면이 완전히 가린다.
- 이름은 그대로 둔다 (기존 사용자 피드백: 이름 가리기는 어색함). 피드백 카드 이름은 바른 표기(조헌국·김종현·임재홍·손정우).

## 모션그래픽

- 아래 140px 띠 = STEP 진행 표시줄 (준비 → STEP 1–6 → 매일 8시 자동화). 현재 단계 강조, 끝난 단계 체크.
- 실습 화면 위 작은 카드 33개 — 오른쪽 위(제목 줄·오래된 터미널 줄) 자리. 명령어·STEP 제목·핵심 개념만.
- 덮개 장면 7개: 인트로(타이틀·왜 CLI·실습 준비) / 실습의 전체 그림(단원 질문 직후) / 오늘의 실습 목표 / 스킬 = 약속 /
  스킬로 점점 짧아져요 / 오늘 함께 해 본 흐름 / 단원 피드백 + 엔드카드("다음엔 데스크탑 앱으로").
- 자막은 넣지 않았다 (요청 없음, 원본에도 없음).

## Notes

- 재생성: `node build.mjs` → `npx hyperframes check` → `npx hyperframes render -o out/early-video.mp4`
- `nested_structure_needs_subcomposition` · `timeline_track_too_dense` 경고는 이전 편들과 같은 단일 index.html 구조라 의도된 것.
- 렌더는 반드시 고정 버전으로: `npx --yes hyperframes@0.8.169 render -o out/early-video.mp4` (36분).
  최신 `npx hyperframes`(0.9.31)는 캡처가 끝난 뒤 인코딩 단계에서 "capture_disk stalled: no progress for 300000ms" 로 실패했다(31분 영상).
- 결과: `2_완성 영상/초기영상_모션그래픽.mp4` (31:11.8, 326MB), GitHub `5_etc/upload-videos/early-video.mp4`.
