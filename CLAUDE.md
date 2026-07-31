# HyperFrames 영상 제작 프로젝트

이 파일은 **Claude Code가 읽는 규칙서**입니다. 사용자가 몰라도 되도록, 이 프로젝트에서
반복해서 걸리는 함정과 검증된 절차를 여기에 적어 둡니다. 작업 시작 전에 반드시 읽으세요.

---

## 🚨 1. 경로에 한글이 있으면 안 됩니다 (가장 중요)

**HyperFrames CLI는 비ASCII(한글) 경로에서 네이티브 크래시합니다.**
에러 메시지 없이 exit 127 / Windows 0xC0000409 로 조용히 멈추기 때문에,
모르면 원인 파악에만 한 시간 이상 걸립니다.

```
❌ C:\Users\user\바탕화면\양자컴퓨터\  → init·render 전부 조용히 실패
✅ C:\Users\user\hyper\quantum\        → 정상
```

**작업 시작 전에 항상 현재 경로를 확인하세요.**

```bash
pwd   # 한글이 보이면 여기서 멈춘다
```

원본 영상·대본이 한글 폴더에 있는 것은 **괜찮습니다**. ffmpeg·python은 한글 경로를
정상 처리합니다. HyperFrames 프로젝트 폴더만 ASCII면 되고, 완성된 MP4는 마지막에
한글 폴더로 복사하면 됩니다.

### 데스크탑 앱에서 작업하는 경우

이 키트가 안내하는 정상 경로는: 사용자가 처음부터 자료를
`C:\Users\<사용자>\hyper\source` (영어 경로)에 모아 둔 채로 요청합니다.
이 경우 `hyper` 가 곧 작업 폴더이므로 옮길 것이 없습니다 —
`hyperframes-starter-kit` 을 `hyper` 에 아직 안 넣었으면 그것만 복사하고
바로 시작하세요.

만약 사용자가 (안내를 못 보고) 자료를 여전히 한글 폴더에 둔 채로 요청한다면,
**사용자에게 폴더를 옮기라고 시키지 말고 직접 처리하세요:**

1. `C:\Users\<사용자>\hyper` 를 작업 폴더로 쓴다 (없으면 새로 만든다 —
   영상마다 새 이름을 짓지 않고 항상 이 폴더 하나를 재사용한다)
2. `hyperframes-starter-kit` 을 그 안으로 복사한다
3. 원본 자료 폴더는 접근 권한만 받아서 읽는다 (옮기지 않는다)
4. 완성된 MP4 는 `hyper` 폴더에 두거나, 사용자가 원하면 원래 폴더로도 복사한다

공통: `hyper` 안에 이전 영상의 씬 파일이 남아 있다면, 새 영상을 시작하기 전에
정리하세요 (섞이면 검증에서 안 잡히는 버그가 됩니다).

입문자는 이 제약을 몰라도 되게 하는 것이 목표입니다. 경로 이야기로
사용자를 붙잡지 마세요 — 조용히 올바른 곳에서 작업하고, 결과만 전달하세요.

---

## 2. 이 프로젝트의 작업 흐름

입력은 4개 파일입니다 (`templates/` 에 양식이 있습니다).

| 파일 | 내용 |
| --- | --- |
| `PART 0. 초고 영상.mp4` | 내레이션이 녹음된 원본. **오디오만** 씁니다. |
| `PART 1. 낭독 대본.txt` | 확정 대본 |
| `PART 2. 씬별 지시서.txt` | 씬별 화면 요소 / 애니메이션 / 온스크린 텍스트 |
| `PART 3. 제작 프롬프트.txt` | 컬러·애니메이션 세부 사양 |

PART 1~3 은 사용자가 직접 쓰거나, `docs/claude-project/` 의 Claude 프로젝트로
생성한 것일 수 있습니다. 후자의 경우 **`PART 4. 수업 연계 자료`** 라는 파일이
함께 있을 수 있는데(대학 강의 모드), 이건 확인문제·LMS 설명문 등 강의 운영용
자료라 **영상 제작에는 쓰지 않습니다.** 무시하고 PART 1~3만 사용하세요.

절차:

1. **오디오 추출 + 전사** — `scripts/2-오디오추출-전사.ps1`
2. **실제 발화 타이밍에 씬 배치** (아래 3번 참고)
3. **씬별 서브컴포지션 작성** — `compositions/scene-skeleton.html` 복사해서 시작
4. **검증** — `npx hyperframes check`
5. **눈으로 확인** — `npx hyperframes snapshot --at <초,초,초>`
6. **렌더** — `npx hyperframes render -o out.mp4`
7. 완성본을 원본 폴더로 복사

---

## 3. ⏱ PART 3의 초 단위 수치를 그대로 믿지 마세요

기획 단계에서 추정한 타임코드와 **실제 낭독 길이는 거의 항상 다릅니다.**
(실측 사례: 사양서 60초 → 실제 오디오 83.5초, 23.5초 차이)

반드시 이렇게 하세요:

1. `scripts/2-오디오추출-전사.ps1` 로 **단어 단위 타임스탬프**를 뽑는다
   (`transcript.json` 생성)
2. 씬 경계를 **실제 문장 사이의 무음 구간**에 스냅한다
3. 각 씬 안의 개별 비트도 해당 단어가 발화되는 시각에 맞춘다

PART 3의 초 단위 값은 **씬 비율 가이드로만** 쓰고, 절대 좌표로 쓰지 마세요.

또 하나: 원본 오디오 앞에 대본에 없는 인사말("안녕하세요, ○○입니다")이 붙어 있는
경우가 많습니다. 전사 결과를 먼저 확인하고, 그 구간을 덮을 화면을 따로 마련하세요.

---

## 4. 폰트 — Pretendard

`assets/fonts/PretendardVariable.woff2` 한 파일로 45~920 전 웨이트를 씁니다.
`index.html` 과 씬 파일에 이미 배선돼 있으니 건드리지 마세요.

SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). 재배포·번들 모두 허용됩니다.

| 용도 | weight |
| --- | --- |
| 온스크린 대제목 | 900 |
| 소제목 / 강조 | 700 |
| 본문 | 400 |
| 보조 설명 (어두운 배경 보정) | 300 |

가변 폰트라 350, 450 같은 중간 웨이트도 쓸 수 있습니다.

**서브컴포지션마다 `@font-face` 를 다시 선언해야 합니다.** `index.html` 의 `<head>`
선언만으로는 린트가 `font_family_without_font_face` 오류를 냅니다.
`compositions/scene-skeleton.html` 에 이미 포함돼 있으니 그대로 복사해 쓰세요.

---

## 5. HyperFrames 작성 규칙 (자주 틀리는 것)

- 서브컴포지션은 `<style>` · 마크업 · `<script>` 를 **전부 `<template>` 안에** 넣습니다.
  `<head>` 에 둔 `<style>` 은 렌더 시 통째로 버려집니다.
- 서브컴포지션 루트는 **`#root` 로 스타일**합니다. 클래스로 스타일하면 조용히 전부 무시됩니다.
- 호스트 슬롯의 `data-composition-id` = 서브컴포지션 내부 id = `window.__timelines[...]` 키,
  **세 개가 정확히 같아야** 합니다.
- 타임라인은 컴포지션당 **하나**, `gsap.timeline({ paused: true })`, 동기적으로 생성.
- `Math.random()` · `Date.now()` · `repeat: -1` 금지. 반복은
  `Math.max(0, Math.floor(전체시간 / 길이) - 1)` 로 유한하게.
- `drawSVG` 는 GSAP 유료 플러그인이라 **없습니다.** 선 그리기는
  `strokeDasharray` + `strokeDashoffset` 로 하세요.
- `fromTo` 의 시작값이 `opacity: 1` 이면 **타임라인 0초부터 보입니다.**
  나중에 등장해야 하는 요소는 `immediateRender: false` 를 주고,
  `tl.set(요소, { opacity: 0 }, 0)` 으로 바닥을 깔아두세요.
- 배경은 루트에 **한 번만** 깔고 씬은 오브젝트만 담습니다. 씬마다 배경을 다시 그리면
  컷에서 배경이 튑니다.

---

## 6. 검증은 눈으로도 하세요

`npx hyperframes check` 가 통과해도 **화면이 비어 있는 구간은 잡아주지 못합니다.**
실제로 오늘도 check 통과 상태에서 3.5초짜리 빈 화면이 있었고, 스냅샷으로만 발견했습니다.

```bash
npx hyperframes snapshot --at 5,12,20,30,45,60,75 --no-end
```

`snapshots/contact-sheet-*.jpg` 를 열어 **모든 씬을 눈으로 확인**하세요. 특히:

- 내레이터는 말하는데 화면이 빈 구간이 없는지
- 등장해야 할 요소가 미리 보이고 있지 않은지
- 텍스트가 잘리거나 겹치지 않는지

렌더 후에는 **결과물 MP4에서 직접 프레임을 뽑아** 한 번 더 확인하세요
(소스가 정상이어도 인코딩에서 빈 프레임이 나올 수 있습니다):

```bash
ffmpeg -ss 30 -i out.mp4 -frames:v 1 check.png
ffmpeg -i out.mp4 -af volumedetect -f null NUL    # 오디오가 무음이 아닌지
```

---

## 7. 의도된 겹침은 표시해 주세요

레이아웃 검사가 "텍스트 두 개가 겹친다"고 오류를 낼 때, 그게 **의도한 연출**이라면
해당 요소에 `data-layout-allow-overlap` 을 붙이면 통과합니다.
(예: 앞뒷면이 겹쳐 보이는 동전, 교차 전환 중인 두 단어)

억지로 레이아웃을 바꾸지 말고, 의도를 표시하세요.

---

## 8. scripts\ 안의 .ps1 파일을 고칠 때

**반드시 UTF-8 BOM 을 유지하세요.** Windows PowerShell 5.1 은 BOM 이 없는 .ps1 을
ANSI(CP949)로 읽어서 한글이 깨지고, **스크립트가 아예 실행되지 않습니다.**
(Missing argument / string is missing the terminator 같은 파싱 오류가 납니다)

대부분의 편집 도구는 BOM 없이 저장하므로, 수정한 뒤에는 다시 붙여 주세요:

```bash
python -c "
import glob
for f in glob.glob('scripts/*.ps1'):
    d = open(f,'rb').read()
    if not d.startswith(b'\xef\xbb\xbf'):
        open(f,'wb').write(b'\xef\xbb\xbf'+d)
"
```

또 PowerShell 5.1 에는 `&&`, `||`, 삼항 연산자가 없습니다. `if ($?) { }` 를 쓰세요.

---

## 9. 참고 — 이 PC 환경

- **전사**: `hyperframes transcribe` 는 whisper-cpp가 없어 실패합니다.
  대신 openai-whisper + CUDA(RTX 4060)가 설치돼 있어
  `scripts/2-오디오추출-전사.ps1` 이 그걸 씁니다.
- **렌더 시간**: 1080p 30fps 기준 대략 **영상 길이의 1.5배** (83초 → 2분 4초).
- **Chrome Headless Shell** 이 없으면 렌더가 실패합니다.
  `npx hyperframes browser ensure` 로 설치 (약 115MB, 최초 1회).
