# 봉사단 2기 두 번째 발표 — 30분 편집본 (Remotion)

- 원본: `봉사단2기 두번째 발표.mp4` (Zoom 녹화 52분 38초) + `봉사단2기 두번째 발표 자막.srt` (977큐) → 지금 `3_원본 보관/봉사단2기 두번째 발표/`
- 발표: 김종현 수석 「AI 시대, 도구를 넘어 역량으로 — 인간 중심 AI 리터러시」, 앞부분 필로소피의 봉사단 소개 포함
- 결과: `2_완성 영상/봉사단2기 두번째 발표_모션그래픽.mp4` (29분 46초)

## 사용자 요청
1. 사람 얼굴이 나오면 편집 → 카메라 화면 구간(32:02, 41:39, 45:40~47:17)은 편집에서 뺐다 (`edit/facescan.py` 로 전 구간 검사)
2. 전체 30분 정도 → 남길 큐 구간 `edit/segs.py`, 말 사이 1초 넘는 침묵은 0.7초로 (`edit/edl.py`)
3. 맨 앞 발표자 소개 인트로는 유지 (큐 1~40)
4. 슬라이드를 쓰는 설명 → 발표 화면 위에 확대·옆 패널 그래픽 (Remotion)
5. 슬라이드 내용을 안 쓰는 이야기 → Pixabay 사진·영상 + 그래픽 (15장면, 1장은 Gemini)

## 만드는 순서
1. `edit/segs.py` → `cuts.json` (남길 큐 구간), `edit/edl.py` → `edl.json` (무음 줄이기)
2. `edit/mkcut.py` → `fc.txt`, `map.json` → ffmpeg 로 `remotion/public/volunteer2-talk2/talk.mp4`
   (발표 화면 영역만 잘라 1080p — Zoom 창 테두리와 원본에 박힌 자막이 빠진다)
3. 영상 프레임 타임스탬프로 `map.json` 보정 후 `edit/mksrt.py` → `captions.srt` (큐 번호 원본 유지, 전사 오탈자 최소 교정)
4. `node ../../scripts/visuals.mjs search/fetch` → `remotion/public/volunteer2-talk2/visuals/`
5. `remotion/src/videos/volunteer2-talk2/` → `npx remotion render volunteer2-talk2 out/volunteer2-talk2.mp4`
