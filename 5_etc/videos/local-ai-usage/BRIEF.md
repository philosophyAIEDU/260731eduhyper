---
workflow: general-video
flow: automation
message: "로컬 AI 사용법 — 필로소피 로컬 AI 앱 (인트로 + 실습 + 아웃트로, 교수님 대상)"
destination: youtube
aspect: 1920x1080
language: ko
length: 1176.4s
style_preset: pastel-glass-cards (claude-cli 시리즈와 같은 계열)
---

## Intent

사용자 요청 원문: "작업할 영상에 로컬 AI 사용법 인트로 영상, 아웃트로 영상, 실습영상 3개를 넣었습니다. 인트로 영상 먼저 나오게 해주시고,
실습영상 나오게 해주시고, 아웃트로 영상이 나오게 해주세요. 그리고 자막은 3영상 다 동일하게 넣어주세요. 인트로와 아웃트로 영상은 hyper를
사용해서 모션그래픽 영상으로만 가득채워주세요. 배경 영상은 안 써도 됩니다. 실습 영상은 제가 실습하는 영상 위주로 해주시고 모션 그래픽은
중요한 부분만 임팩트 있게 보여주세요. 이제부터 질문 없이 랜더링까지 마치고 완성 영상을 깃헙 (eduhyper 저장소) 저장소에 올려주세요."

## 원본 (`3_원본 보관/로컬 AI 사용법/`, 납품 전엔 `1_작업할 영상/`)

- `로컬 AI 사용법 (인트로 영상).mp4` 145.39s — 대본 문서 화면 + 검정 박스 자막이 박혀 있음 → 화면은 전부 덮음
- `로컬 AI 실습영상.mp4` 950.03s — 브라우저·이미지 뷰어·앱 화면, 자막 없음
- `로컬 AI 사용법 (아웃트로 영상).mp4` 80.93s — 대본 화면 + 끝 14초 오로라 → 전부 덮음
- 세 개를 ffmpeg concat 으로 이어 `assets/media/src.mp4` (1176.4s). 오프셋 O2=145.387, O3=1095.42.

## 자막

- SRT 없음 → `edit/t1~t3.json` (whisper medium, unsloth python + CUDA) → `edit/make_srt.py` 로 짧은 줄(최대 22자) 자막 생성.
- 표기 교정: `make_srt.py` 의 `FIX` (ChatGPT·Claude·Gemini·Qwen3·Gemma3·Ollama·로컬 AI 등) + `edit/fixes.txt` (큐별 교체).
- 모양은 인트로 원본에 박힌 것과 같은 검정 박스·흰 글씨, 영상 전체(인트로·실습·아웃트로)에 동일하게.

## 모션그래픽

- 인트로 덮개 12장면: 타이틀 → 설문 고민 → 클라우드 AI에 못 주는 자료 → 정리·수정·새로 만들기 → 해법 로컬 AI → 보안 비교 →
  시작 장벽 → 필로소피 로컬 AI 앱(고정 댓글→카페→홈페이지→다운로드) → 앱 구조(Qwen·Gemma / Ollama) → 안전 설계 4가지 →
  앱 밖 파일은 보호 밖 → 학생 정보 넣는 법 3가지 → "실습으로 볼까요?"
- 실습: 오른쪽 위 작은 카드(`.ovc.side`) — 접속 주소, 앱 특징, 할 수 있는 일, STEP 1~3(컴퓨터 확인·AI 추천·설치), 강의 자료 분석,
  별칭, 연구 자료, 행정, Excel, 메뉴, 업데이트, 학생 정보 5원칙, 잠금, 댓글. 임팩트 팝 3개(화면 가운데 몇 초):
  "인터넷 OFF"(랜선 뽑음, 이후 '인터넷 끊긴 상태' 배지), "인터넷 없이도 답이 나왔어요!", "Claude·ChatGPT에 주기 어려운 데이터 → 로컬 AI".
- 아웃트로 덮개 5장면: 실습 끝 요약 → 개인정보 고민 → 필로소피 로컬 AI → 쓸 때 지킬 6가지 → 인용 + 댓글 → 엔드카드(좋아요·구독).

## Notes

- 재생성: `python edit/make_srt.py` → `node build.mjs` → `npx --yes hyperframes@0.8.169 check` → `npx --yes hyperframes@0.8.169 render -o out/local-ai-usage.mp4`
- `timeline_track_too_dense` · `composition_file_too_large` 경고는 이전 편들과 같은 단일 index.html 구조라 의도된 것.
