# Remotion 키트

HyperFrames 키트(저장소 루트)와 같은 디자인(파스텔 카드 · 필로소피 캐릭터 · Pretendard)을 쓰되,
React 로만 쉽게 할 수 있는 **시네마틱 연출**을 더한 키트입니다.

- 살아 있는 배경 — 움직이는 오로라 그라데이션, 깊이감 있는 보케, 필름 그레인, 비네트
- 카메라 — 영상 전체의 느린 핸드헬드 드리프트, 임팩트 순간의 펀치 인 + 흔들림
- 임팩트 씬 — 보라→코랄 그라데이션 무대 + 흰 글씨, 한 글자씩 스프링으로 떨어지는 키네틱 타이포,
  쇼크웨이브 링 · 파티클 버스트 · 반짝이 · 플래시
- 전환 — 대각선 컬러 와이프, 카드는 3D로 스윙해 들어오고 블러로 빠짐, 등장 순간 광택(sheen)
- 물리 스프링 — 모든 팝/슬라이드가 감쇠 스프링으로 튕기고, 빠르게 움직일 때 모션 블러
- 노래방 자막 — 말하는 단어에 불이 들어오고, 핵심 단어(AI · SWOT · 과제 …)는 색으로
- 캐릭터 리액션 — 머리 위에 ? ! 💡 같은 말풍선이 튀어나옴
- 효과음 — whoosh · hit · ding · pop · tick (ffmpeg 로 합성, `public/sfx/`), `sfx: false` 로 끌 수 있음

> Remotion 은 개인·직원 3명 이하 회사는 무료, 그 이상의 회사는 유료 라이선스가 필요합니다.
> https://www.remotion.dev/license

## 구조

```
remotion/
├─ public/                       ← staticFile() 로 읽는 파일
│  ├─ fonts/PretendardVariable.woff2
│  ├─ characters/philosophy.png
│  ├─ sfx/                       whoosh · hit · ding · pop · tick (합성 효과음)
│  └─ ai-era-assignment/         ← 영상마다 폴더 하나
│     ├─ captions.srt
│     └─ narration.m4a           (저장소에 없음 — 아래 '오디오 준비')
└─ src/
   ├─ Root.tsx                   ← 영상(Composition) 등록
   ├─ kit/                       ← 모든 영상이 같이 쓰는 부품
   │  ├─ anim.ts                 스프링 기반 pop · up · rise · slide · slam · stamp · sweep · draw · grow · count
   │  ├─ fx.tsx                  Backdrop · Bokeh · Grain · ImpactBackdrop · Wipe · Flash · Burst · Ring · Sparkles
   │  │                          camera() · Kinetic(한 글자씩) · Emote · SfxTrack
   │  ├─ pro.css                 시네마틱 테마 (유리 카드, 임팩트 흰 글씨, 노래방 자막)
   │  ├─ time.tsx                Scene(시작~끝 초) · useT() · T(큐 번호)
   │  ├─ srt.ts                  SRT 읽기 + 표기 교정
   │  ├─ stage.tsx               배경 · 캐릭터 · 브랜드/챕터 칩 · 자막 밴드 · 엔드카드
   │  ├─ ui.tsx                  Pill · Chip · Ico · Ok · Hl · Arrow · Flow
   │  ├─ icons.ts                라인 아이콘
   │  └─ pastel.css              HyperFrames 영상과 같은 스타일시트
   └─ videos/ai-era-assignment/  ← 'AI 시대의 과제' (videos/ai-era-assignment 의 Remotion 판)
      ├─ index.tsx               레이어 조립 + 챕터 + 엔드카드
      └─ scenes.tsx              씬 34개
```

## 사용법

```bash
cd remotion
npm install                       # 처음 한 번
npm run studio                    # 브라우저 미리보기 (타임라인에 씬이 블록으로 보임)
npx remotion render ai-era-assignment out/ai-era-assignment.mp4
node scripts/stills.mjs ai-era-assignment 30,91.2,181.6 out/stills    # 여러 시점 스틸 (번들 1번)
npx remotion render ai-era-assignment out/x.mp4 --props='{"sfx":false}'  # 효과음 없이
npm run check                     # 타입 검사
```

### 오디오 준비

원본 영상에서 내레이션만 뽑아 `public/<영상>/narration.m4a` 로 둡니다.

```bash
ffmpeg -i "완성영상.mp4" -vn -t 435 -af "afade=t=out:st=433.3:d=1.7" -c:a aac -b:a 192k public/ai-era-assignment/narration.m4a
```

`ai-era-assignment-practice` (AI 시대의 과제 — 직접 해보기 편, 16:23):

```bash
ffmpeg -i "AI 시대의 과제 영상.mp4" -vn -t 983 -c:a aac -b:a 192k public/ai-era-assignment-practice/narration.m4a
```

## 영상 목록

| id | 내용 | 스타일 |
| --- | --- | --- |
| `ai-era-assignment` | AI 시대의 과제 (7:15) | 파스텔 시네마틱 |
| `ai-era-assignment-practice` | AI 시대의 과제 — 직접 해보기 편 (16:23) | **미드나이트 테마** (`theme.css`, `.dark-root` 안에서만) |

`ai-era-assignment-practice` 는 실습 화면이 대부분이라 `shot.tsx` 가 따로 있습니다.
PPT 에서 뽑은 캡처(`public/ai-era-assignment-practice/shots/`)를 기울어진 모니터에 띄우고,
`shots.json` 의 키프레임대로 카메라가 이동/확대하며, 하이라이트마다 스포트라이트 + 커서 클릭이 들어갑니다.
`shots.json` 은 HyperFrames 판(`videos/ai-era-assignment-practice/shots.json`)과 같은 파일입니다 — 고치면 둘 다 복사하세요.
실습 화면끼리는 `Scene` 의 `tail` / `fadeIn` 으로 크로스 디졸브합니다.

## 새 영상 만들기

1. `public/<새영상>/` 에 `captions.srt` 와 `narration.m4a` 를 둔다.
2. `src/videos/ai-era-assignment/` 를 `src/videos/<새영상>/` 로 복사한다.
3. `index.tsx` 의 `DUR` · SRT 경로 · `FIX` · 챕터(sections) · 엔드카드를 고친다.
4. `scenes.tsx` 의 `SCENES` 를 새 대본에 맞게 다시 쓴다. 씬은 **SRT 큐 번호에 고정**한다
   (`from: 12` = 12번 자막에서 시작, 애니메이션은 `T(13, 0.4)` = 13번 자막 0.4초 뒤).
5. `Root.tsx` 에 `<Composition>` 을 하나 추가한다.

## 규칙 (HyperFrames 와 같은 원칙)

- 화면은 **시각 t 만의 함수**여야 합니다. `Math.random()` · `Date.now()` · `setTimeout` 금지,
  난수는 `random('seed')`(remotion) 만.
- CSS `transition` / `animation` 금지 — 렌더러가 프레임을 건너뛰며 찍으므로 전부 `kit/anim.ts` 로.
- 이미지는 `<Img>`, 오디오는 `<Audio>`, 파일 경로는 `staticFile()` 로.
- 임팩트(펀치 인 · 효과음)는 `index.tsx` 의 `kicks` · `stamps` · `emotes` 목록에서 시각만 고치면 됩니다.
- 렌더 후에는 결과 MP4 에서 프레임을 뽑아 눈으로 확인합니다
  (`ffmpeg -ss 30 -i out/x.mp4 -frames:v 1 check.png`).
