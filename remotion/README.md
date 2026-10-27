# Remotion 키트

HyperFrames 키트(저장소 루트)와 **같은 영상을 Remotion(React)으로 만드는** 키트입니다.
파스텔 카드 디자인 · 필로소피 캐릭터 · 자막 밴드 · Pretendard 폰트를 그대로 씁니다.

> Remotion 은 개인·직원 3명 이하 회사는 무료, 그 이상의 회사는 유료 라이선스가 필요합니다.
> https://www.remotion.dev/license

## 구조

```
remotion/
├─ public/                       ← staticFile() 로 읽는 파일
│  ├─ fonts/PretendardVariable.woff2
│  ├─ characters/philosophy.png
│  └─ ai-era-assignment/         ← 영상마다 폴더 하나
│     ├─ captions.srt
│     └─ narration.m4a           (저장소에 없음 — 아래 '오디오 준비')
└─ src/
   ├─ Root.tsx                   ← 영상(Composition) 등록
   ├─ kit/                       ← 모든 영상이 같이 쓰는 부품
   │  ├─ anim.ts                 pop · up · rise · slide · slam · stamp · sweep · draw · grow · count
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
npx remotion still  ai-era-assignment out/check.png --frame=900    # 30초 지점 한 장
npm run check                     # 타입 검사
```

### 오디오 준비

원본 영상에서 내레이션만 뽑아 `public/<영상>/narration.m4a` 로 둡니다.

```bash
ffmpeg -i "완성영상.mp4" -vn -t 435 -af "afade=t=out:st=433.3:d=1.7" -c:a aac -b:a 192k public/ai-era-assignment/narration.m4a
```

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
- 렌더 후에는 결과 MP4 에서 프레임을 뽑아 눈으로 확인합니다
  (`ffmpeg -ss 30 -i out/x.mp4 -frames:v 1 check.png`).
