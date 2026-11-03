import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 필로소피 AI 봉사단 2기 첫 회의 (30분 편집본) — index.html 생성기
//
// 화면 + 소리: assets/media/src.mp4 (72분 회의 → 30분 편집본, 자막 없음)
// 사용자 요청:
//   · 필로소피 설명 구간(0 ~ 471s)  → 아주 중요한 부분에만 풀스크린 모션그래픽 (나머지는 슬라이드 그대로)
//   · PPT 를 쓴 단원(PPT 가 녹화에 보이는 두 분) → PPT 위에 포인트 카드만
//   · 목소리만 나온 단원 → 그 구간 전체를 모션그래픽으로 덮는다
//   · 자막: 전 구간, 검정 박스 + 흰 글씨. 단원 이름은 넣지 않는다 (assets/captions.txt 에서 교정 완료)
// 시각은 모두 편집본 기준 초. 근거는 assets/captions.txt 의 자막 시작 시각.
// 수정: 아래 데이터 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 1780.5;
// v2: 화면+소리 = assets/media/export.mp4 (사용자 내보내기본, 자막 박힘). 장면 데이터는 옛 편집본(src.mp4) 시각으로 적혀 있고
// 장면마다 off(초) 만큼 당겨서 놓는다 (오디오 맞대기로 잰 차이: edit/v2/align.json).
const OFF = 11.88;
const f = (t) => (+t).toFixed(2);

// ---------- icons ----------------------------------------------------------
const S = (c, body, w = 4) => `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  user: (c) => S(c, `<circle cx="32" cy="22" r="10"/><path d="M12 54c2-11 10-17 20-17s18 6 20 17"/>`),
  users: (c) => S(c, `<circle cx="24" cy="24" r="8"/><circle cx="44" cy="26" r="6"/><path d="M8 52c2-9 8-14 16-14s14 5 16 14M40 38c7 0 13 4 16 12"/>`),
  cap: (c) => S(c, `<path d="M4 26l28-12 28 12-28 12z"/><path d="M16 32v12c8 6 24 6 32 0V32M58 27v14"/>`),
  doc: (c) => S(c, `<path d="M16 8h22l12 12v36H16z"/><path d="M38 8v12h12"/><path d="M23 32h18M23 40h18M23 48h11"/>`),
  book: (c) => S(c, `<path d="M8 14c8-3 16-3 24 2v38c-8-5-16-5-24-2zM56 14c-8-3-16-3-24 2v38c8-5 16-5 24-2z"/>`),
  check: (c) => S(c, `<path d="M18 33l9 9 19-20"/>`, 7),
  x: (c) => S(c, `<path d="M20 20l24 24M44 20L20 44"/>`, 7),
  chat: (c) => S(c, `<path d="M10 14h44v28H30l-12 10V42h-8z"/><path d="M20 26h24M20 33h14"/>`),
  repeat: (c) => S(c, `<path d="M14 30a18 18 0 0 1 32-11l4 4"/><path d="M50 13v10H40"/><path d="M50 34a18 18 0 0 1-32 11l-4-4"/><path d="M14 51V41h10"/>`),
  hand: (c) => S(c, `<path d="M22 34V16a4 4 0 0 1 8 0v14M30 28V12a4 4 0 0 1 8 0v18M38 28v-12a4 4 0 0 1 8 0v22c0 10-6 16-15 16-6 0-10-3-13-8l-6-10a4 4 0 0 1 7-4l3 4"/>`),
  sparkle: (c) => S(c, `<path d="M28 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${c}" stroke-width="2"/><path d="M50 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="${c}" stroke-width="1.5"/>`),
  warn: (c) => S(c, `<path d="M32 8l26 46H6z"/><path d="M32 26v12"/><circle cx="32" cy="45" r="1.5" fill="${c}"/>`),
  play: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M27 22l15 10-15 10z" fill="${c}"/>`),
  coin: (c) => S(c, `<circle cx="32" cy="32" r="22"/><path d="M38 24c-1-3-4-4-6-4-4 0-7 2-7 5 0 7 14 4 14 11 0 3-3 5-7 5-3 0-6-1-7-4M32 16v4M32 44v4"/>`),
  bolt: (c) => S(c, `<path d="M36 6L14 36h16l-4 22 22-30H32z" fill="${c}" stroke-width="2"/>`),
  pen: (c) => S(c, `<path d="M14 50l4-14 26-26 10 10-26 26z"/><path d="M38 16l10 10"/>`),
  code: (c) => S(c, `<path d="M22 20L10 32l12 12M42 20l12 12-12 12M36 14l-8 36"/>`),
  heart: (c) => S(c, `<path d="M32 52C18 42 10 34 10 24c0-7 5-12 11-12 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 5 11 12 0 10-8 18-22 28z" fill="${c}"/>`, 2),
  pin: (c) => S(c, `<path d="M32 56s18-17 18-30a18 18 0 0 0-36 0c0 13 18 30 18 30z"/><circle cx="32" cy="26" r="6"/>`),
  mic: (c) => S(c, `<rect x="24" y="8" width="16" height="30" rx="8"/><path d="M16 30a16 16 0 0 0 32 0M32 46v10M22 56h20"/>`),
  gear: (c) => S(c, `<circle cx="32" cy="32" r="8"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/>`),
  laptop: (c) => S(c, `<rect x="12" y="14" width="40" height="28" rx="3"/><path d="M6 50h52l-4-8H10z"/>`),
  clock: (c) => S(c, `<circle cx="32" cy="32" r="22"/><path d="M32 18v15l10 6"/>`),
  shield: (c) => S(c, `<path d="M32 6l22 8v16c0 14-10 23-22 28C20 53 10 44 10 30V14z"/><path d="M22 32l7 7 13-14"/>`),
  heartbeat: (c) => S(c, `<path d="M6 34h12l5-12 8 24 6-16 4 4h17"/>`),
  calendar: (c) => S(c, `<rect x="8" y="12" width="48" height="42" rx="6"/><path d="M8 24h48M20 6v12M44 6v12"/>`),
  gift: (c) => S(c, `<rect x="10" y="26" width="44" height="28" rx="3"/><path d="M6 18h52v8H6zM32 18v36M32 18c-4-10-16-10-14-2 1 3 8 3 14 2zM32 18c4-10 16-10 14-2-1 3-8 3-14 2z"/>`),
  stage: (c) => S(c, `<rect x="8" y="10" width="48" height="30" rx="4"/><path d="M32 40v8M20 56l12-8 12 8"/><path d="M18 30l8-8 6 6 10-10"/>`),
  image: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="5"/><circle cx="22" cy="26" r="5"/><path d="M8 46l14-12 10 8 8-6 16 12"/>`),
};

const C = { coral: '#ef8a6f', mint: '#3fa877', lav: '#8a78e0', sky: '#5b93dc', pink: '#e2678a', yellow: '#b8820f', ink: '#34314a' };
const BG = { coral: '#ffe6dc', mint: '#dcf3e8', lav: '#ebe6ff', sky: '#e2eeff', pink: '#ffe3ea', yellow: '#fff1cc' };
const icoB = (name, col, cls = '') => `<span class="icb ${cls}" style="background:${BG[col]}">${ICON[name](C[col])}</span>`;

// ---------- item kinds (단원 장면 오른쪽에 차례로 나타나는 카드) -----------------
//   C(t, icon, title, sub)  카드     Q(t, text)  인용
//   F([[t, txt]…], sub?)     흐름     S(t, big, label)  큰 숫자
const Ci = (t, ic, title, sub = '') => ({ k: 'card', t, ic, title, sub });
const Qi = (t, text) => ({ k: 'quote', t, text });
const Fi = (steps, sub = '') => ({ k: 'flow', t: steps[0][0], steps, sub });
const Si = (t, big, label) => ({ k: 'stat', t, big, label });

const CATS = ['나는 누구인가요', '나의 전문 분야', '요즘 AI로 하는 일', '진행하실 발표 내용'];

// ---------- 목소리만 나온 단원 — 구간 전체 모션그래픽 ---------------------------
// pages: { s, cat, head, items }  — 다음 page 시작에서 앞 page 가 사라진다
const MEMBERS = [
  { id: 'm1', s: 471.35, e: 536.6, col: 'sky', ic: 'cap', name: '손정우', role: '교수', sub: '학생들의 AI 활용 고민',
    tags: [['학생 AI 접근성', 476], ['제미나이', 484], ['스킬 활용', 513]],
    pages: [
      { s: 475.0, cat: 2, head: '학생들의 현실', items: [
        Ci(475.4, 'coin', '가장 큰 문제', '학생들은 유료 AI를 쓰기 어렵다'),
        Ci(483.6, 'sparkle', '대학생은 제미나이 1년 무료', '연장도 가능'),
        Ci(489.6, 'warn', '작업은 클로드가 최고지만', '학생이 실제로 쓸 수 있는 건 거의 제미나이') ] },
      { s: 504.97, cat: 2, head: '도구는 아직 어렵다', items: [
        Fi([[505.3, '코덱스'], [506.6, '제미나이 CLI'], [508.0, '안티그래비티']], '학생들이 접근하기 너무 어려워해요') ] },
      { s: 512.65, cat: 2, head: '그래서 지금은 스킬에 집중', items: [
        Ci(513.2, 'sparkle', '스킬을 잘 만들어', '업무에 활용하는 방법'),
        Ci(520.6, 'bolt', '프로 요금제 이상이라면', '작업할 때 스킬을 넘겨서 작업'),
        Ci(527.8, 'repeat', '계속 다듬어 가는 중', '') ] },
    ] },
  { id: 'm2', s: 536.6, e: 626.2, col: 'coral', ic: 'user', name: '박병태', role: '기술사', sub: '직장인 · AI를 체계적으로',
    tags: [['직장인', 545.4], ['AI 강의 열공', 554], ['함께 성장', 585.4]],
    pages: [
      { s: 545.1, cat: 0, head: '나는 누구인가요', items: [
        Ci(545.5, 'user', '기술사 · 직장인', ''),
        Ci(554.0, 'play', '올해 초부터 유튜브로 AI 강의', '좋은 강의를 많이 들어 왔어요'),
        Ci(567.9, 'heart', '필로소피 강의가 귀에 쏙쏙', '좋은 일도 많이 하셔서') ] },
      { s: 575.62, cat: 0, head: '봉사단에 참여한 이유', items: [
        Fi([[575.9, '체계적인 AI 공부'], [580.4, '전문성 키우기'], [585.4, '혼자보다 함께']]) ] },
      { s: 592.92, cat: 3, head: '발표는 이렇게 준비할게요', items: [
        Ci(593.2, 'mic', '다른 분들 발표를 들어 보고', '어떤 내용을 준비할지 주제 정하기'),
        Qi(613.3, '실력도 키우고, 좋은 일도 함께') ] },
    ] },
  { id: 'm3', s: 626.2, e: 723.8, col: 'mint', ic: 'gear', name: '임재홍', role: '선생', sub: '공장·시스템 자동화 · 해외 현장',
    tags: [['베트남 하노이', 635], ['공장 자동화', 642], ['AI 실무', 659]],
    pages: [
      { s: 634.75, cat: 0, head: '나는 누구인가요', items: [
        Ci(635.0, 'pin', '베트남 하노이', '중소기업에서 근무'),
        Ci(641.9, 'gear', '공장 자동화 · 시스템 자동화', '') ] },
      { s: 647.05, cat: 1, head: 'AI를 만나기까지', items: [
        Fi([[647.4, 'IT · 공장 자동화'], [652.5, 'AI'], [658.9, '필로소피 강좌로 관심 ↑']], '지금은 AI 쪽 일을 많이 하고 있어요') ] },
      { s: 666.97, cat: 2, head: '현장에서 느낀 것', items: [
        Ci(672.0, 'doc', '앞서 본 고민 4번 · 8번', '사고력 키우기 · 수업 참여 높이기'),
        Ci(677.7, 'users', '학생이 AI를 잘 활용하게', ''),
        Ci(686.6, 'sparkle', '무엇을 해야 할지 아는 힘', '기능은 계속 좋아지니까 더 중요해요') ] },
      { s: 693.07, cat: 3, head: '하고 싶은 발표', items: [
        Ci(697.0, 'stage', 'AI로 더 잘 가르치는 실제 사례', '발굴해서 소개하기'),
        Ci(713.3, 'check', '실무에 다가가는 활동', '') ] },
    ] },
  { id: 'm4', s: 723.8, e: 813.5, col: 'lav', ic: 'code', name: '조헌국', role: '교수', sub: '물리교육 · AI 학습 디자인',
    tags: [['물리교육', 730], ['전 프로그래머', 741.3], ['머신러닝 독학', 747.6]],
    pages: [
      { s: 729.35, cat: 0, head: '나는 누구인가요', items: [
        Ci(729.7, 'cap', '부산대학교 · 물리교육 전공', ''),
        Ci(741.3, 'code', '예전엔 컴퓨터 프로그래머', '프로그래밍에 익숙해요'),
        Si(747.6, '2018', '머신러닝 독학 시작') ] },
      { s: 758.93, cat: 1, head: '교육용 AI의 핵심', items: [
        Qi(761.0, 'AI는 교육용으로 만들어진 게 아니라서,<br><em>어떻게 디자인하느냐</em>에 따라 완전히 달라진다') ] },
      { s: 780.23, cat: 2, head: '요즘 관심 · 내적 피드백', items: [
        Fi([[784.0, '스스로 문제 찾기'], [786.5, '외부와 비교'], [789.0, '스스로 개선']]),
        Ci(791.0, 'sparkle', 'AI를 그렇게 쓰도록', '학습 디자인과 테스트를 하고 있어요') ] },
      { s: 794.15, cat: 3, head: '하고 싶은 발표', items: [
        Ci(796.0, 'doc', 'AI 학습 디자인 사례', ''),
        Ci(799.0, 'book', '새로운 학습 이론과의 접목', 'AI 시대에 등장한 학습 이론 소개') ] },
    ] },
  { id: 'm5', s: 813.5, e: 892.8, col: 'coral', ic: 'users', name: '손미현', role: '교수', sub: '화학교육 · 학생과 함께 쓰는 AI',
    tags: [['화학교육', 829.5], ['AI 활용', 836], ['자기주도 학습', 843]],
    pages: [
      { s: 829.25, cat: 0, head: '나는 누구인가요', items: [
        Ci(829.5, 'cap', '화학교육과 교수', ''),
        Ci(836.2, 'x', '프로그래밍 전문가는 아니에요', ''),
        Ci(838.8, 'check', 'AI를 정말 잘 쓰는 사람', '') ] },
      { s: 842.89, cat: 2, head: '학생들과 이렇게 써요', items: [
        Ci(843.3, 'users', '학생들이 AI로 스스로 공부', ''),
        Ci(856.8, 'coin', '유료 버전까지 쓰면서', '공부 내용을 AI에게 훈련시켜요'),
        Ci(868.3, 'chat', '프롬프트 훈련 · 피드백 받기', '') ] },
      { s: 877.59, cat: 3, head: '발표는 이렇게', items: [
        Ci(878.0, 'stage', '학생 활용 사례 소개', ''),
        Ci(882.0, 'repeat', '현장 반응 보며 추가 준비', '') ] },
    ] },
  { id: 'm6', s: 892.8, e: 1008.7, col: 'yellow', ic: 'pen', name: '권혁만', role: '선생', sub: '시니어 AI 강사 · 전자책 작가',
    tags: [['은퇴 후 AI 독학', 902.4], ['또래 대상 강의', 924.3], ['전자책 5권', 935]],
    pages: [
      { s: 902.15, cat: 0, head: '나는 누구인가요', items: [
        Ci(902.4, 'user', '은퇴 후 AI를 만나다', ''),
        Ci(911.1, 'sparkle', '"시대의 대세가 되겠다"', ''),
        Ci(917.9, 'clock', '혼자서 몇 년 동안 독학', '가르쳐 주는 사람 없이') ] },
      { s: 924.05, cat: 1, head: '나의 전문 분야', items: [
        Ci(924.3, 'chat', '또래분들께 AI 강의', '제 경험이 도움이 되도록'),
        Si(935.0, '5권', 'AI를 배운 뒤 낸 전자책'),
        Ci(944.2, 'doc', '예전 글로 · AI로 · 의뢰받아', '') ] },
      { s: 954.69, cat: 3, head: '하고 싶은 발표', items: [
        Fi([[955.0, 'AI와 함께 시작'], [960.0, '집필'], [963.5, '출간']], '그 과정에서 겪은 시행착오를 공유할게요') ] },
      { s: 976.75, cat: 2, head: '요즘 AI로 하는 일', items: [
        Ci(977.0, 'chat', '사고력 프롬프트 × 클로드 프로젝트', ''),
        Si(979.5, '2~3시간', '하루에 AI와 대화하는 시간'),
        Qi(989.0, '내 사례와 말과 경험이<br><em>이렇게 녹아들 수 있구나</em>') ] },
    ] },
  { id: 'm7', s: 1008.7, e: 1167.3, col: 'sky', ic: 'heartbeat', name: '김보연', role: '박사', sub: 'AI · 머신러닝 전문 강사',
    tags: [['컴퓨터공학', 1015], ['의공학 박사', 1040], ['AI 전문 강사', 1056]],
    pages: [
      { s: 1014.89, cat: 0, head: '나는 누구인가요', items: [
        Ci(1015.1, 'code', '학부 · 석사: 컴퓨터공학', ''),
        Ci(1028.4, 'sparkle', '석사 때부터 인공신경망', '지금 말하는 딥러닝'),
        Ci(1040.0, 'heartbeat', '박사: 의공학', '컴퓨터공학 + 의공학, 두 가지 배경') ] },
      { s: 1050.55, cat: 1, head: '나의 전문 분야', items: [
        Si(1055.8, '2019~', 'AI 전문 강사로 활동'),
        Ci(1073.5, 'book', 'AI · 머신러닝 기본 이론', '') ] },
      { s: 1080.45, cat: 3, head: '특강으로 할 수 있는 것', items: [
        Ci(1088.7, 'pen', '시험 문제 출제', '중간고사 · 기말고사'),
        Ci(1109.6, 'check', '루브릭 작성', 'GPTs 대신 할 수 있는 방법'),
        Si(1112.2, '3시간', '특강으로 가능') ] },
      { s: 1118.27, cat: 0, head: '봉사단에 온 이유', items: [
        Ci(1133.9, 'hand', '교육 때 받은 도움', '옆에서 정말 잘 도와주셨어요'),
        Ci(1142.6, 'heart', '이제는 저도 보조라도!', '') ] },
    ] },
  { id: 'm8', s: 1167.3, e: 1273.5, col: 'mint', ic: 'cap', name: '박지훈', role: '교수', sub: '화학교육 · 업무를 스킬로',
    tags: [['화학교육', 1174.3], ['사고력 × AI', 1197.4], ['클로드 스킬', 1214.8]],
    pages: [
      { s: 1174.12, cat: 0, head: '나는 누구인가요', items: [
        Ci(1174.3, 'cap', '경인교육대학교 · 화학교육', ''),
        Ci(1187.4, 'doc', '이론보다는 관심 분야 소개', '') ] },
      { s: 1197.16, cat: 1, head: '나의 관심 분야', items: [
        Ci(1197.4, 'sparkle', 'AI로 학생 사고력 높이기', '활용 방법을 연구하고 있어요') ] },
      { s: 1209.24, cat: 2, head: '업무 워크플로 → 스킬', items: [
        Fi([[1214.8, '업무 워크플로'], [1246.2, '클로드 스킬'], [1249.0, '선생님들께 배포']]),
        Qi(1251.5, '원고 쓰기가 <em>굉장히 편해졌어요</em>') ] },
      { s: 1255.96, cat: 3, head: '하고 싶은 발표', items: [
        Ci(1256.4, 'check', '선생님들이 실제로 유용하게 쓴 스킬', '') ] },
    ] },
  { id: 'm9', s: 1403.0, e: 1527.01, col: 'pink', ic: 'image', name: '안성혜', role: '원장', sub: '영어 교육 · AI 강사',
    tags: [['영어 입시', 1424.4], ['AI 강사', 1447.1], ['인스타툰', 1469.6]],
    pages: [
      { s: 1416.63, cat: 0, head: '요즘 하는 두 가지 일', items: [
        Ci(1424.4, 'doc', '고등학교 입시 영어', ''),
        Ci(1447.1, 'cap', '중장년층 AI 강사 양성 과정 선발', '지금은 AI 강사로 활동'),
        Ci(1461.6, 'pin', 'AI 디지털 배움터 강사', '서울 · 경기') ] },
      { s: 1469.33, cat: 2, head: '코덱스로 만든 인스타툰 생성기', items: [
        Fi([[1469.6, '프로젝트 설정'], [1491.6, '캐릭터'], [1493.6, '대본'], [1495.4, '이미지 프롬프트']]),
        Ci(1477.5, 'users', '영어학원 원장님 모임용', ''),
        Ci(1498.0, 'heart', '어르신용 캐릭터도 개발 중', '디지털 소외계층을 위해') ] },
      { s: 1505.51, cat: 3, head: '봉사단에서는', items: [
        Ci(1514.0, 'hand', '보조 · 후원으로 함께', '많이 배우고 싶어요') ] },
    ] },
  { id: 'm10', off: 12.17, s: 1527.3, e: 1630.9, col: 'lav', ic: 'book', name: '정진선', role: '교수', sub: '중국어 · 중국 고전문학',
    tags: [['중국 시 · 소설', 1539.5], ['유일한 문과', 1547.2], ['『논어』 GPTs', 1578.7]],
    pages: [
      { s: 1539.26, cat: 0, head: '나는 누구인가요', items: [
        Ci(1539.5, 'book', '중국어 · 중국 시와 고전 소설', ''),
        Ci(1550.0, 'sparkle', '도메인 지식 × AI', '학생들이 텍스트에 더 집중하도록') ] },
      { s: 1561.64, cat: 2, head: '『논어』 GPTs', items: [
        Fi([[1562.0, '학생의 고민'], [1572.0, '『논어』 데이터'], [1580.0, '공자님 페르소나'], [1588.0, '구절로 답하기']]),
        Ci(1578.7, 'chat', '질문하면 공자님이 답해요', '학생의 고민에 맞게 설명하며') ] },
      { s: 1596.72, cat: 3, head: '하고 싶은 발표', items: [
        Ci(1597.2, 'chat', '좌충우돌 AI 인사이트', '기술보다 사용 경험'),
        Ci(1615.0, 'book', '깊이 · 자세히 읽는 연습', '텍스트를 기반으로') ] },
    ] },
];

// ---------- 필로소피 설명 구간 — 중요한 곳만 풀스크린 ---------------------------
const G = []; // { id, s, e, html, anim, layer: 'full' | 'ov' }
const add = (g) => G.push({ layer: 'full', off: OFF, ...g });

add({ id: 'h-title', off: 0, s: 0.2, e: 7.9, html: `
  <img id="ht-ph" class="hero-ph" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
  <div id="ht-c" class="card hero">
    <span id="ht-k" class="pill">교육자를 위한 AI 재능기부 모임</span>
    <h1 id="ht-h" class="h1">필로소피 AI 봉사단 <span class="hl">2기</span></h1>
    <div id="ht-s" class="ep"><b>첫 번째</b><span>온라인 회의</span></div>
  </div>`, anim: `
  tl.fromTo('#ht-ph', {opacity:0, x:-140}, {opacity:1, x:0, duration:.8, ease:'back.out(1.4)'}, 0.4);
  rise('#ht-c', 0.5); up('#ht-k', 0.8, 16); up('#ht-h', 1.0, 30); sweep('#ht-h .hl', 1.7); pop('#ht-s', 3.3);` });

const STAT1 = [[19.9, 'calendar', '3회', 'AI 스터디', 'sky'], [30.7, 'coin', '5만 원', '참가비', 'yellow'], [35.8, 'laptop', '5대', '리퍼 노트북 구매', 'coral'], [37.4, 'gift', '아이들에게', '보육원 아동 4명 + 지역아동센터', 'mint']];
add({ id: 'h-gen1', off: 0, s: 13.4, e: 43.2, html: `
  <div class="hdr"><span id="g1-k" class="pill">1기 돌아보기</span><h2 id="g1-h" class="h2">2026년 1월 ~ 6월</h2></div>
  <div class="statrow">${STAT1.map(([, ic, big, lab, col], i) => `
    <div id="g1-${i}" class="card statc">${icoB(ic, col, 'lg')}<b style="color:${C[col]}">${big}</b><span>${lab}</span></div>`).join('')}
  </div>
  <div id="g1-ar" class="flowline">스터디 참가비 <i>→</i> 리퍼 노트북 <i>→</i> 아이들에게 선물</div>`, anim: `
  up('#g1-k', 13.6, 16); up('#g1-h', 16.6, 24);
  ${STAT1.map(([t], i) => `rise('#g1-${i}', ${f(t)});`).join(' ')}
  up('#g1-ar', 39.4, 20);` });

const STEP2 = [[104.9, 'mic', '격주 AI 발표', '2주에 한 번 · 돌아가며', 'lav'], [111.9, 'stage', '오프라인 컨퍼런스', '2회 · 내년 2월 · 6월', 'coral'], [126.7, 'gift', '노트북 선물', '참가비로 보육원 아동들에게', 'mint']];
add({ id: 'h-gen2', s: 71.18, e: 132.9, html: `
  <div class="hdr"><span id="g2-k" class="pill">봉사단 2기</span><h2 id="g2-h" class="h2">2026년 11월 ~ 내년 6월 · <span class="hl">7개월</span></h2></div>
  <div id="g2-vs" class="vsrow">
    <div id="g2-a" class="vsc"><span class="vsl">1기</span><b>혼자 수업</b></div>
    <span id="g2-ar" class="vsar">→</span>
    <div id="g2-b" class="vsc hot"><span class="vsl">2기</span><b>함께 발표</b><small>어드밴스드 단원들과</small></div>
  </div>
  <div class="steprow">${STEP2.map(([, ic, t, s, col], i) => `${i ? `<span id="g2-sa${i}" class="sar">›</span>` : ''}
    <div id="g2-s${i}" class="card stepc"><span class="stn">${i + 1}</span>${icoB(ic, col)}<b>${t}</b><span>${s}</span></div>`).join('')}
  </div>`, anim: `
  up('#g2-k', 71.4, 16); up('#g2-h', 71.6, 24); sweep('#g2-h .hl', 82.0);
  pop('#g2-a', 87.6); pop('#g2-ar', 93.2); pop('#g2-b', 93.6);
  tl.to('#g2-vs', {opacity:.35, scale:.86, y:-40, duration:.5, ease:'power2.inOut'}, 104.2);
  ${STEP2.map(([t], i) => `${i ? `pop('#g2-sa${i}', ${f(t - 0.2)}); ` : ''}rise('#g2-s${i}', ${f(t)});`).join(' ')}
  tl.to('#g2-s1', {boxShadow:'0 0 0 10px rgba(255,199,180,.6), 0 30px 70px rgba(239,138,111,.25)', duration:.4, ease:'power2.out'}, 120.2);` });

add({ id: 'h-quote', s: 222.06, e: 243.0, html: `
  <div id="hq-c" class="card bigquote">
    <span class="qmk">“</span>
    <p id="hq-1" class="qline1">미래를 예측하는 가장 좋은 방법은</p>
    <p id="hq-2" class="qline2"><span class="hl">그것을 만드는 것</span>이다</p>
    <span id="hq-en" class="qen">The best way to predict the future is to create it.</span>
  </div>
  <div id="hq-n" class="note">AI에 대한 부정적인 예측 속에서, 우리는 좋은 일을 만들어 보기로</div>`, anim: `
  rise('#hq-c', 222.4); up('#hq-1', 225.0, 20); up('#hq-2', 227.0, 24); sweep('#hq-2 .hl', 228.2); up('#hq-en', 229.6, 12);
  up('#hq-n', 234.2, 16);` });

add({ id: 'h-bonjeon', s: 257.0, e: 290.4, html: `
  <div class="center-col" style="top:150px">
    <span id="hb-k" class="pill">우리가 시작하는 이유</span>
    <div id="hb-h" class="mega">밑져야 <span class="hl">본전</span></div>
    <div id="hb-r" class="bjrow">
      <div id="hb-a" class="card bjc"><span>어차피 AI 때문에</span><b>좋지 않은 미래가 온다면</b></div>
      <span id="hb-ar" class="vsar">→</span>
      <div id="hb-b" class="card bjc hot"><span>조금이라도</span><b>좋게 만들기 위해</b></div>
    </div>
  </div>`, anim: `
  up('#hb-k', 257.3, 16); tl.fromTo('#hb-h', {opacity:0, scale:.6}, {opacity:1, scale:1, duration:.7, ease:'back.out(1.7)'}, 257.5); sweep('#hb-h .hl', 258.6);
  rise('#hb-a', 274.6); pop('#hb-ar', 281.6); rise('#hb-b', 282.0);
  tl.fromTo('#hb-h', {scale:1}, {scale:1.06, duration:.35, ease:'power2.out', yoyo:true, repeat:1, immediateRender:false}, 288.0);` });

add({ id: 'h-topics', s: 356.3, e: 384.6, html: `
  <div class="hdr"><span id="tp-k" class="pill">필로소피가 준비할 발표</span><h2 id="tp-h" class="h2">교육자분들을 위한 <span class="hl">클로드 코드</span></h2></div>
  <div class="duo">
    <div id="tp-1" class="card duoc"><span class="stn">1</span>${icoB('repeat', 'coral', 'lg')}<b>클로드 코드 CLI</b><span>반복 업무 해결하기</span></div>
    <div id="tp-2" class="card duoc"><span class="stn">2</span>${icoB('laptop', 'lav', 'lg')}<b>클로드 코드 데스크톱</b><span>학습 앱 만들고 배포하기</span></div>
  </div>
  <div id="tp-n" class="flowline">내 발표 차례 <i>+</i> 오프라인 컨퍼런스에서</div>`, anim: `
  up('#tp-k', 356.6, 16); up('#tp-h', 356.8, 24); sweep('#tp-h .hl', 358.0);
  rise('#tp-1', 357.4); rise('#tp-2', 365.8); up('#tp-n', 376.6, 18);` });

add({ id: 'h-members', s: 459.51, e: 471.2, html: `
  <div class="hdr"><span id="hm-k" class="pill">이제 들어 볼 차례</span><h2 id="hm-h" class="h2">봉사 단원 소개</h2></div>
  <div class="catrow">${CATS.map((c, i) => `<div id="hm-${i}" class="card catc">${icoB(['hand', 'cap', 'sparkle', 'mic'][i], ['coral', 'sky', 'mint', 'lav'][i], 'lg')}<b>${c}</b></div>`).join('')}</div>
  <div id="hm-n" class="flowline">교수님 · 선생님 · 원장님 · 박사님 <i>12명</i>의 이야기</div>`, anim: `
  up('#hm-k', 459.8, 16); up('#hm-h', 460.0, 26);
  ${CATS.map((c, i) => `rise('#hm-${i}', ${f(461.0 + i * 0.5)});`).join(' ')} up('#hm-n', 464.6, 18);` });

add({ id: 'h-close', off: 0, s: 1739.0, e: DUR, html: `
  <div class="hdr"><span id="hc-k" class="pill">오늘 회의 정리</span><h2 id="hc-h" class="h2">함께 만들어 갈 봉사단 2기</h2></div>
  <div class="closelist">
    <div id="hc-0" class="card cli">${icoB('chat', 'sky')}<b>발표 일정은 카톡방에서 정해요</b></div>
    <div id="hc-1" class="card cli">${icoB('heart', 'pink')}<b>부담 없이, 할 수 있는 만큼만</b></div>
    <div id="hc-2" class="card cli">${icoB('stage', 'mint')}<b>오프라인 강의는 준비한 대로 진행</b></div>
  </div>
  <img id="hc-ph" class="close-ph" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
  <div id="hc-end" class="endbig">수고하셨습니다</div>`, anim: `
  up('#hc-k', 1739.3, 16); up('#hc-h', 1739.5, 24);
  slide('#hc-0', 1749.4, -60); slide('#hc-1', 1760.4, -60); slide('#hc-2', 1766.2, -60);
  tl.fromTo('#hc-ph', {opacity:0, x:120}, {opacity:1, x:0, duration:.8, ease:'back.out(1.4)'}, 1740.2);
  tl.to('.closelist, #h-close .hdr', {opacity:0, y:-30, duration:.5, ease:'power2.in'}, 1775.6);
  tl.fromTo('#hc-end', {opacity:0, scale:.7}, {opacity:1, scale:1, duration:.7, ease:'back.out(1.7)'}, 1776.3);` });

// ---------- PPT 를 쓴 단원 — 화면 위 포인트 카드 ------------------------------
// 원장님 (PDF 발표, 1273.5 ~ 1403.0) — PDF 오른쪽 빈 여백
const PBL = [[1314.2, '관심사 발견'], [1320.5, '깊이 공감'], [1324.5, '함께 탐구'], [1342.8, '실제 경험으로 확장']];
add({ id: 'o-pbl', layer: 'ov', s: 1313.78, e: 1349.7, html: `
  <div id="op-c" class="ovc rside">
    <span id="op-k" class="pill pill-sm">프로젝트 기반 학습</span>
    ${PBL.map(([, t], i) => `<div id="op-${i}" class="vstep"><span class="stn sm">${i + 1}</span><b>${t}</b></div>`).join('<span class="vdown">↓</span>')}
  </div>`, anim: `rise('#op-c', 1314.0); up('#op-k', 1314.2, 12); ${PBL.map(([t], i) => `slide('#op-${i}', ${f(t)}, 40);`).join(' ')}` });
add({ id: 'o-think', layer: 'ov', s: 1349.87, e: 1365.2, html: `
  <div id="ot-c" class="ovc rside">
    <span id="ot-k" class="pill pill-sm">AI와 함께하는 수업</span>
    <div id="ot-a" class="ovline no">${ICON.x('#e0607f')}<span>AI가 생각을 <b>대신</b>하는 수업</span></div>
    <div id="ot-b" class="ovline yes">${ICON.check('#3fa877')}<span>아이들의 생각이 <b>담기는</b> AI 콘텐츠</span></div>
  </div>`, anim: `rise('#ot-c', 1350.1); slide('#ot-a', 1350.5, 40); slide('#ot-b', 1356.6, 40);` });
add({ id: 'o-topic', layer: 'ov', s: 1365.41, e: 1401.0, html: `
  <div id="oc-c" class="ovc rside">
    <div class="ovhead">${icoB('mic', 'lav')}<span class="ovh">진행하실 발표 내용</span></div>
    <div id="oc-t" class="ovt">학생의 관심사를<br><b>AI 프로젝트 수업</b>으로<br>연결하는 방법</div>
    <div id="oc-n" class="okpill">${ICON.check('#ffffff')}<span>실제 수업 경험 공유</span></div>
  </div>`, anim: `rise('#oc-c', 1365.6); up('#oc-t', 1366.0, 14); pop('#oc-n', 1371.6);` });

// 수석님 (줌 화면 공유, 1630.9 ~ 1750.6) — 오른쪽 참가자·채팅 패널(단원 이름이 보임)을 카드 패널로 덮는다
const RP = 1630.9, RPE = 1750.7;
add({ id: 'o-panel', layer: 'ov', off: 12.17, s: RP, e: 1739.0 + 12.17, html: `
  <div id="rp" class="rpanel">
    <span id="rp-k" class="pill pill-sm">단원 소개</span>
    <div id="rp-p0" class="rpg">
      <div id="rp-a0" class="rpi">${icoB('pin', 'sky', 'sm')}<span><b>대구</b> 에듀테크 기업 재직</span></div>
      <div id="rp-a1" class="rpi">${icoB('code', 'lav', 'sm')}<span><b>전자전기공학</b><br>임베디드 · 안드로이드 · OS</span></div>
      <div id="rp-a2" class="rpi">${icoB('doc', 'coral', 'sm')}<span>연구 기획 · R&amp;D 전략<br><b>10년+</b></span></div>
    </div>
    <div id="rp-p1" class="rpg">
      <div id="rp-b0" class="rpi">${icoB('laptop', 'mint', 'sm')}<span>올해부터 <b>바이브 코딩</b><br>→ 학교 현장 적용</span></div>
      <div id="rp-b1" class="rpi">${icoB('users', 'yellow', 'sm')}<span>주 대상은<br><b>초 · 중등</b> 교육 현장</span></div>
    </div>
    <div id="rp-p2" class="rpg">
      <span class="rph">교육 현장의 AI, 세 가지</span>
      <div id="rp-c0" class="rpi">${icoB('bolt', 'yellow', 'sm')}<span>선생님 <b>업무 경감</b></span></div>
      <div id="rp-c1" class="rpi">${icoB('stage', 'sky', 'sm')}<span><b>수업</b>에 AI 활용</span></div>
      <div id="rp-c2" class="rpi star">${icoB('shield', 'mint', 'sm')}<span><b>AI 리터러시</b><br>책임감 있고 안전하게</span></div>
      <div id="rp-c3" class="rpnote">다루는 곳이 아직 드물어요</div>
    </div>
  </div>`, anim: `
  tl.fromTo('#rp', {x:380}, {x:0, duration:.6, ease:'power3.out'}, ${f(RP)}); up('#rp-k', ${f(RP + 0.4)}, 12);
  slide('#rp-a0', 1636.3, 40); slide('#rp-a1', 1645.6, 40); slide('#rp-a2', 1667.5, 40);
  tl.to('#rp-p0', {opacity:0, duration:.35, ease:'power2.in'}, 1676.0);
  slide('#rp-b0', 1676.5, 40); slide('#rp-b1', 1692.0, 40);
  tl.to('#rp-p1', {opacity:0, duration:.35, ease:'power2.in'}, 1705.5);
  up('#rp-p2 .rph', 1705.9, 12); slide('#rp-c0', 1711.8, 40); slide('#rp-c1', 1718.2, 40); slide('#rp-c2', 1723.3, 40);
  tl.to('#rp-c2', {boxShadow:'0 0 0 5px rgba(63,168,119,.55)', backgroundColor:'#effaf4', duration:.4, ease:'power2.out'}, 1732.8);
  up('#rp-c3', 1736.0, 12);` });

// ---------- 단원 장면 → G ---------------------------------------------------
const itemHTML = (m, pi, ii, it) => {
  const id = `${m.id}-p${pi}-i${ii}`;
  if (it.k === 'card') return `<div id="${id}" class="it card-it">${icoB(it.ic, m.col)}<div class="itx"><b>${it.title}</b>${it.sub ? `<span>${it.sub}</span>` : ''}</div></div>`;
  if (it.k === 'quote') return `<div id="${id}" class="it q-it" style="--ac:${C[m.col]}"><span class="qm">“</span><p>${it.text}</p></div>`;
  if (it.k === 'stat') return `<div id="${id}" class="it st-it"><b style="color:${C[m.col]}">${it.big}</b><span>${it.label}</span></div>`;
  return `<div id="${id}" class="it fl-it"><div class="flr">${it.steps.map(([, t], si) => `${si ? `<span id="${id}-a${si}" class="fla">›</span>` : ''}<span id="${id}-s${si}" class="fls" style="--ac:${C[m.col]};--bg:${BG[m.col]}">${t}</span>`).join('')}</div>${it.sub ? `<span id="${id}-sub" class="flsub">${it.sub}</span>` : ''}</div>`;
};
MEMBERS.forEach((m, mi) => {
  const html = `
  <div class="mtop">
    <span id="${m.id}-lab" class="mlab">봉사 단원 소개</span>
    ${CATS.map((c, i) => `<span id="${m.id}-c${i}" class="mcat">${c}</span>`).join('')}
  </div>
  <div id="${m.id}-pf" class="card prof" style="--ac:${C[m.col]}">
    <span class="pnum">단원 ${String(mi + 1).padStart(2, '0')}</span>
    <span class="pav" style="background:${BG[m.col]}">${ICON[m.ic](C[m.col])}</span>
    <b class="prole">${m.name} ${m.role}님</b>
    <span class="psub">${m.sub}</span>
    <div class="ptags">${m.tags.map(([t], i) => `<span id="${m.id}-t${i}" class="ptag" style="--ac:${C[m.col]};--bg:${BG[m.col]}">${t}</span>`).join('')}</div>
  </div>
  ${m.pages.map((p, pi) => `
  <div id="${m.id}-p${pi}" class="pg">
    <div class="pgh"><span class="pgc" style="background:${C[m.col]}">${CATS[p.cat]}</span><b>${p.head}</b></div>
    <div class="pgi">${p.items.map((it, ii) => itemHTML(m, pi, ii, it)).join('')}</div>
  </div>`).join('')}`;
  const a = [];
  a.push(`rise('#${m.id}-pf', ${f(m.s + 0.2)}); up('#${m.id}-lab', ${f(m.s + 0.1)}, 10);`);
  CATS.forEach((c, i) => a.push(`up('#${m.id}-c${i}', ${f(m.s + 0.2 + i * 0.08)}, 10);`));
  m.tags.forEach(([, t], i) => a.push(`pop('#${m.id}-t${i}', ${f(t)});`));
  let prevCat = -1;
  m.pages.forEach((p, pi) => {
    const pe = pi + 1 < m.pages.length ? m.pages[pi + 1].s : m.e;
    a.push(`tl.fromTo('#${m.id}-p${pi}', {opacity:0, y:30}, {opacity:1, y:0, duration:.45, ease:'power3.out'}, ${f(p.s)});`);
    if (pi + 1 < m.pages.length) a.push(`tl.to('#${m.id}-p${pi}', {opacity:0, y:-24, duration:.3, ease:'power2.in'}, ${f(pe - 0.32)});`);
    if (p.cat !== prevCat) {
      if (prevCat >= 0) a.push(`tl.to('#${m.id}-c${prevCat}', {backgroundColor:'rgba(255,255,255,.7)', color:'#8d89a3', duration:.3}, ${f(p.s)});`);
      a.push(`tl.to('#${m.id}-c${p.cat}', {backgroundColor:'${C[m.col]}', color:'#ffffff', duration:.3, ease:'power2.out'}, ${f(p.s)});`);
      prevCat = p.cat;
    }
    p.items.forEach((it, ii) => {
      const id = `#${m.id}-p${pi}-i${ii}`;
      const t = Math.max(it.t, p.s + 0.15);
      if (it.k === 'flow') {
        a.push(`tl.fromTo('${id}', {opacity:0}, {opacity:1, duration:.3}, ${f(t)});`);
        it.steps.forEach(([st], si) => { const tt = Math.max(st, p.s + 0.15); if (si) a.push(`pop('${id}-a${si}', ${f(tt - 0.15)});`); a.push(`pop('${id}-s${si}', ${f(tt)});`); });
        if (it.sub) a.push(`up('${id}-sub', ${f(Math.max(it.steps.at(-1)[0], p.s) + 0.6)}, 12);`);
      } else if (it.k === 'stat') a.push(`pop('${id}', ${f(t)});`);
      else a.push(`slide('${id}', ${f(t)}, 50);`);
    });
  });
  G.push({ id: m.id, layer: 'full', off: m.off ?? OFF, s: m.s, e: m.e, html, anim: a.join('\n  ') });
});

// 새 시간축 위치
G.forEach((g) => { g.ns = Math.max(0, g.s - g.off); g.ne = Math.min(DUR, g.e - g.off); });
// 모션그래픽이 화면을 덮는 구간(파스텔 배경). 이어지는 full 장면은 한 덩어리로.
const COVER = [];
G.filter((g) => g.layer === 'full').map((g) => [g.ns, g.ne]).sort((x, y) => x[0] - y[0]).forEach(([s0, e0]) => {
  const L = COVER.at(-1);
  if (L && s0 - L[1] < 0.8) L[1] = Math.max(L[1], e0); else COVER.push([s0 < 0.3 ? 0 : s0, e0]);
});

// ---------- 자막 -------------------------------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
// 사용자 SRT 그대로. 단원 이름만 흐리게 가린다.
const NAMES = ['손정우', '손정배', '박병태', '임재용', '조원국', '손정은', '손미영', '손정호', '박평태', '임지홍', '권형만', '김보연', '박지훈', '손정미', '송정미', '안성희', '안성혜', '정진선', '김종현', '박진'];
const nameRe = () => new RegExp(`(${NAMES.join('|')})|김(?= 실장님)|안(?= 원장님)`, 'g');
// v3 (사용자 요청 2026-11-04): 이름을 가리지 않고 그대로 둔다. true 로 바꾸면 v2 처럼 흐림 + 화면 이름 패치.
const HIDE_NAMES = false;
// v3: 사용자가 알려 준 바른 이름으로 자막 속 이름 표기만 고친다 (나머지 문구는 SRT 그대로).
const NAMEFIX = { '권형만': '권혁만', '임재용': '임재홍', '임지홍': '임재홍', '조원국': '조헌국', '손정은': '손정우', '손미영': '손미현', '손정호': '손정우', '박평태': '박병태', '손정미': '송정미', '안성희': '안성혜' };
const fixNames = (t) => t.replace(new RegExp(Object.keys(NAMEFIX).join('|'), 'g'), (m) => NAMEFIX[m]);
// 이름을 고친 자막은 덮개 밖에서도 큐 전체를 다시 올려 원본(박힌) 자막을 덮는다.
const hasName = (t) => (HIDE_NAMES && nameRe().test(t)) || fixNames(t) !== t;
const capText = (t) => HIDE_NAMES ? esc(fixNames(t)).replace(nameRe(), (m) => `<i class="nm">${m}</i>`) : esc(fixNames(t));
const tsec = (x) => { const [h, m, r] = x.trim().split(':'); return +h * 3600 + +m * 60 + +r.replace(',', '.'); };
const srt = fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '').trim().split(/\n\n+/)
  .map((bl) => bl.split('\n')).filter((L) => L.length >= 3)
  .map((L) => { const [a, b] = L[1].split('-->'); return { s: tsec(a), e: tsec(b), text: L.slice(2).join(' ') }; });
// 원본 영상에 자막이 박혀 있으므로, 덮개(모션그래픽)가 깔린 구간의 자막과 이름이 든 자막만 같은 모양으로 다시 올린다.
const inCover = (c) => COVER.some(([s0, e0]) => c.s < e0 - 0.05 && c.e > s0 + 0.05);
// 이름 없는 자막은 덮개 구간 안으로만 자른다 (덮개 밖에서는 원본 자막이 그대로 보인다).
// 이름 든 자막은 큐 전체를 다시 올리고, 덮개 밖이면 원본 자막 박스 크기(assets/capbox.json, edit/v2/capbox.py)보다 크게 덮는다.
const caps = [];
srt.forEach((c) => {
  const e = Math.min(c.e, DUR);
  if (hasName(c.text)) { caps.push({ s: c.s, e, text: c.text }); return; }
  COVER.forEach(([s0, e0]) => { const a = Math.max(c.s, s0), b = Math.min(e, e0); if (b - a > 0.05) caps.push({ s: a, e: b, text: c.text }); });
});
const capbox = fs.existsSync(path.join(root, 'assets/capbox.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'assets/capbox.json'), 'utf8')) : {};
const boxStyle = (c) => { const b = capbox[c.s.toFixed(2)]; if (!b || !hasName(c.text) || b[3] < 1015 || b[0] < 20 || b[2] > 1900 || b[2] - b[0] < 200) return ''; return `min-width:${Math.min(1900, b[2] - b[0] + 14)}px;min-height:98px;`; };
fs.writeFileSync(path.join(root, 'edit/v2/capneed.json'), JSON.stringify(caps.filter((c) => !COVER.some(([s0, e0]) => c.s >= s0 - 0.02 && c.e <= e0 + 0.02)).map((c) => ({ s: c.s, e: c.e, text: c.text }))));
const masks = HIDE_NAMES ? JSON.parse(fs.readFileSync(path.join(root, 'assets/masks.json'), 'utf8')) : [];

// ---------- assemble ---------------------------------------------------------
const gHTML = G.map((g) => `
<div id="${g.id}" class="scene ${g.layer} clip" data-start="${g.ns.toFixed(3)}" data-duration="${(g.ne - g.ns).toFixed(3)}" data-track-index="${g.layer === 'full' ? 3 : 4}">
  <div id="${g.id}-sc" class="sc">${g.html}
  </div>
</div>`).join('\n');

const blobs = (id) => [['#ffd9cb', 760, -160, -220], ['#d8f1e5', 640, 1380, 560], ['#e3dcff', 700, 1300, -260], ['#fff0c2', 520, -120, 640], ['#ffdbe5', 420, 820, 760]]
  .map(([c, sz, x, y], i) => `<span id="${id}-bl${i}" class="blob" data-layout-allow-overflow style="width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;background:${c}"></span>`).join('');
const covHTML = COVER.map(([s, e], i) => `
<div id="cv${i}" class="cover clip" data-start="${s.toFixed(3)}" data-duration="${(e - s).toFixed(3)}" data-track-index="2"><div id="cv${i}-in" class="cov-in">${blobs(`cv${i}`)}</div></div>`).join('');
const covAnim = COVER.map(([s, e], i) => {
  const len = e - s, cyc = 9, n = Math.max(0, Math.floor(len / cyc) - 1);
  return `
  tl.fromTo('#cv${i}-in', {opacity:0}, {opacity:1, duration:.4, ease:'power2.out'}, ${f(s)});
  ${e < DUR - 0.01 ? `tl.to('#cv${i}-in', {opacity:0, duration:.4, ease:'power2.in'}, ${f(e - 0.42)});` : ''}
  ${[0, 1, 2, 3, 4].map((k) => `tl.fromTo('#cv${i}-bl${k}', {x:0, y:0}, {x:${[60, -70, -50, 70, 40][k]}, y:${[40, -50, 60, -40, -60][k]}, duration:${cyc}, ease:'sine.inOut', yoyo:true, repeat:${n}}, ${f(s)});`).join('\n  ')}`;
}).join('');

const capHTML = caps.map((c, i) => `<div id="cap${i}" class="cap clip" data-start="${c.s.toFixed(3)}" data-duration="${Math.max(0.2, c.e - c.s).toFixed(3)}" data-track-index="8"><span style="${boxStyle(c)}font-size:${Math.max(44, Math.min(62, Math.round(62 * 26 / c.text.length)))}px">${capText(c.text)}</span></div>`).join('\n');
const maskHTML = masks.map((m, i) => `<div id="mk${i}" class="mask clip" data-start="${m.s.toFixed(2)}" data-duration="${(Math.min(m.e, DUR) - m.s).toFixed(2)}" data-track-index="1" style="left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px;background:${m.c}"></div>`).join('\n');

const gAnim = G.map((g) => `
  // ${g.id}  (off ${g.off})
  { const tl = SH(${g.off}); const { pop, up, rise, slide, sweep } = H(tl);
  tl.fromTo('#${g.id}-sc', {opacity:0}, {opacity:1, duration:.4, ease:'power2.out'}, ${f(g.s)});
  ${g.ne < DUR - 0.01 ? `tl.to('#${g.id}-sc', {opacity:0, duration:.35, ease:'power2.in'}, ${(g.ne + g.off - 0.37).toFixed(3)});` : ''}
  ${g.anim.trim()}
  }`).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>필로소피 AI 봉사단 2기 첫 회의</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face { font-family: "Pretendard"; src: url("assets/fonts/PretendardVariable.woff2") format("woff2-variations"); font-weight: 45 920; font-style: normal; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: #fdf6ee; }
:root { --ink: #34314a; --ink-soft: #5b5873; --hl-y: rgba(255, 220, 120, .85); }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Pretendard", sans-serif; color: var(--ink); background: #000; }
#vwrap { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
#vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
#endfade { position: absolute; inset: 0; z-index: 20; background: #000; opacity: 0; pointer-events: none; }

.cover { position: absolute; inset: 0; z-index: 2; }
.cov-in { position: absolute; inset: 0; overflow: hidden; opacity: 0; background: linear-gradient(135deg, #fff6ee 0%, #fdf1f4 45%, #f1f0ff 100%); }
.blob { position: absolute; border-radius: 50%; opacity: .75; filter: blur(30px); }

.cap { position: absolute; left: 0; right: 0; bottom: 52px; z-index: 8; display: flex; justify-content: center; pointer-events: none; }
.cap span { max-width: 1900px; padding: 8px 34px 14px; background: #000; color: #fff; word-break: keep-all; display: flex; align-items: center; justify-content: center;
  font-size: 62px; font-weight: 800; line-height: 1.2; text-align: center; letter-spacing: -.01em; }
.cap .nm { font-style: normal; display: inline-block; filter: blur(12px); opacity: .9; }
.mask { position: absolute; z-index: 1; border-radius: 4px; }

.scene { position: absolute; inset: 0; }
.scene.full { z-index: 3; }
.scene.ov { z-index: 4; }
.sc { position: absolute; inset: 0; opacity: 0; }

.card { position: absolute; display: block; background: rgba(255, 255, 255, .95); border: 2px solid #fff; border-radius: 40px;
  box-shadow: 0 26px 60px rgba(80, 60, 70, .16), 0 6px 18px rgba(80, 60, 70, .07); }
.center-col { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 34px; }
.pill { display: inline-flex; align-items: center; padding: 12px 28px; border-radius: 999px; background: #fff7ee; box-shadow: inset 0 0 0 2px #f6e8da;
  font-size: 30px; font-weight: 750; color: #9a4f35; white-space: nowrap; }
.pill-sm { font-size: 24px; padding: 8px 18px; align-self: flex-start; }
.h1 { font-size: 100px; font-weight: 900; line-height: 1.12; letter-spacing: -.035em; text-align: center; word-break: keep-all; }
.h2 { font-size: 66px; font-weight: 900; line-height: 1.2; letter-spacing: -.03em; text-align: center; word-break: keep-all; }
.hl { background-image: linear-gradient(var(--hl-y), var(--hl-y)); background-repeat: no-repeat; background-position: 0 88%; background-size: 0% 38%; padding: 0 4px; }
.icb { display: flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 76px; height: 76px; border-radius: 50%; padding: 17px; box-shadow: inset 0 0 0 4px rgba(255,255,255,.7); }
.icb svg { display: block; width: 100%; height: 100%; }
.icb.lg { width: 120px; height: 120px; padding: 27px; }
.icb.sm { width: 54px; height: 54px; padding: 12px; }
.hdr { position: absolute; left: 0; right: 0; top: 90px; display: flex; flex-direction: column; align-items: center; gap: 22px; }
.flowline { position: absolute; left: 0; right: 0; top: 790px; text-align: center; font-size: 40px; font-weight: 750; color: var(--ink-soft); }
.flowline i { font-style: normal; font-weight: 900; color: #ef8a6f; padding: 0 10px; }
.stn { display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 50%; background: #34314a; color: #fff; font-size: 28px; font-weight: 900; flex: 0 0 auto; }
.stn.sm { width: 40px; height: 40px; font-size: 22px; }

/* title */
.hero-ph { position: absolute; left: 130px; top: 200px; width: 430px; height: auto; filter: drop-shadow(0 24px 30px rgba(80, 60, 90, .22)); }
.hero { left: 640px; top: 230px; width: 1140px; padding: 60px 60px 66px; display: flex; flex-direction: column; align-items: center; gap: 34px; }
.ep { display: flex; align-items: center; gap: 18px; padding: 14px 36px; border-radius: 999px; background: #ffe6dc; font-size: 42px; font-weight: 700; color: #9a4f35; }
.ep b { font-weight: 900; color: #d0603f; }

/* gen 1 stats */
.statrow { position: absolute; left: 0; right: 0; top: 330px; display: flex; justify-content: center; gap: 34px; }
.statc { position: relative; width: 380px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px; text-align: center; }
.statc b { font-size: 76px; font-weight: 900; letter-spacing: -.03em; line-height: 1; }
.statc span { font-size: 32px; font-weight: 700; color: var(--ink-soft); line-height: 1.3; word-break: keep-all; }

/* gen 2 */
.vsrow { position: absolute; left: 0; right: 0; top: 330px; display: flex; justify-content: center; align-items: center; gap: 40px; }
.vsc { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 34px 60px; border-radius: 36px; background: rgba(255,255,255,.92); box-shadow: 0 20px 50px rgba(80,60,70,.14); }
.vsc.hot { box-shadow: 0 0 0 8px rgba(255, 199, 180, .55), 0 26px 60px rgba(239, 138, 111, .22); }
.vsl { font-size: 30px; font-weight: 850; color: var(--ink-soft); }
.vsc b { font-size: 60px; font-weight: 900; letter-spacing: -.03em; }
.vsc small { font-size: 28px; font-weight: 650; color: var(--ink-soft); }
.vsar { font-size: 70px; font-weight: 900; color: #c4583a; }
.steprow { position: absolute; left: 0; right: 0; top: 520px; display: flex; justify-content: center; align-items: center; gap: 22px; }
.stepc { position: relative; width: 470px; height: 330px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 26px; text-align: center; }
.stepc .stn { position: absolute; left: 28px; top: 26px; }
.stepc b { font-size: 46px; font-weight: 900; letter-spacing: -.03em; }
.stepc span:last-child { font-size: 30px; font-weight: 650; color: var(--ink-soft); }
.sar { font-size: 60px; font-weight: 900; color: #b4a9d3; }

/* quote */
.bigquote { left: 260px; top: 200px; width: 1400px; padding: 70px 90px 64px; display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; }
.qmk { position: absolute; left: 50px; top: -30px; font-size: 220px; line-height: 1; font-weight: 900; color: #f6dccf; }
.qline1 { font-size: 64px; font-weight: 700; letter-spacing: -.03em; }
.qline2 { font-size: 88px; font-weight: 900; letter-spacing: -.035em; }
.qen { margin-top: 10px; font-size: 32px; font-weight: 600; font-style: italic; color: var(--ink-soft); }
.note { position: absolute; left: 0; right: 0; top: 720px; text-align: center; font-size: 40px; font-weight: 700; color: var(--ink-soft); }

/* bonjeon */
.mega { font-size: 190px; font-weight: 900; letter-spacing: -.05em; line-height: 1.05; }
.bjrow { display: flex; align-items: center; gap: 40px; }
.bjc { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 34px 54px; }
.bjc span { font-size: 32px; font-weight: 650; color: var(--ink-soft); }
.bjc b { font-size: 48px; font-weight: 900; letter-spacing: -.03em; }
.bjc.hot { box-shadow: 0 0 0 8px rgba(160, 225, 195, .6), 0 26px 60px rgba(63, 168, 119, .2); }

/* topics / members intro */
.duo { position: absolute; left: 0; right: 0; top: 340px; display: flex; justify-content: center; gap: 50px; }
.duoc { position: relative; width: 640px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.duoc .stn { position: absolute; left: 30px; top: 28px; }
.duoc b { font-size: 52px; font-weight: 900; letter-spacing: -.03em; }
.duoc span:last-child { font-size: 36px; font-weight: 700; color: var(--ink-soft); }
.catrow { position: absolute; left: 0; right: 0; top: 340px; display: flex; justify-content: center; gap: 30px; }
.catc { position: relative; width: 380px; height: 360px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; }
.catc b { font-size: 38px; font-weight: 900; letter-spacing: -.02em; }

/* closing */
.closelist { position: absolute; left: 200px; top: 330px; width: 1060px; display: flex; flex-direction: column; gap: 28px; }
.cli { position: relative; display: flex; align-items: center; gap: 28px; padding: 26px 40px; border-radius: 32px; }
.cli b { font-size: 46px; font-weight: 850; letter-spacing: -.02em; }
.close-ph { position: absolute; right: 150px; top: 260px; width: 420px; height: auto; filter: drop-shadow(0 24px 30px rgba(80, 60, 90, .22)); }
.endbig { position: absolute; left: 0; right: 520px; top: 400px; text-align: center; font-size: 130px; font-weight: 900; letter-spacing: -.04em; color: #34314a; }

/* member scenes */
.mtop { position: absolute; left: 110px; right: 110px; top: 54px; display: flex; align-items: center; gap: 14px; }
.mlab { font-size: 30px; font-weight: 900; color: var(--ink); margin-right: 18px; white-space: nowrap; }
.mcat { padding: 10px 22px; border-radius: 999px; background: rgba(255,255,255,.7); box-shadow: inset 0 0 0 2px rgba(0,0,0,.05); font-size: 26px; font-weight: 800; color: #8d89a3; white-space: nowrap; }
.prof { left: 110px; top: 160px; width: 540px; height: 720px; display: flex; flex-direction: column; align-items: center; gap: 22px; padding: 60px 40px 40px; text-align: center; }
.pnum { position: absolute; left: 30px; top: 26px; font-size: 24px; font-weight: 900; letter-spacing: .06em; color: var(--ac); }
.pav { display: flex; align-items: center; justify-content: center; width: 210px; height: 210px; border-radius: 50%; padding: 48px; box-shadow: inset 0 0 0 8px rgba(255,255,255,.75), 0 16px 36px rgba(80,60,70,.12); }
.pav svg { display: block; width: 100%; height: 100%; }
.prole { font-size: 72px; font-weight: 900; letter-spacing: -.03em; line-height: 1.1; }
.psub { font-size: 32px; font-weight: 700; color: var(--ink-soft); line-height: 1.3; word-break: keep-all; }
.ptags { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 8px; }
.ptag { padding: 10px 22px; border-radius: 999px; background: var(--bg); color: var(--ink); box-shadow: inset 0 0 0 2px var(--ac); font-size: 28px; font-weight: 850; white-space: nowrap; }
.pg { position: absolute; left: 710px; top: 160px; width: 1100px; height: 720px; display: flex; flex-direction: column; gap: 26px; opacity: 0; }
.pgh { display: flex; align-items: center; gap: 20px; }
.pgc { padding: 8px 20px; border-radius: 14px; color: #fff; font-size: 26px; font-weight: 850; white-space: nowrap; }
.pgh b { font-size: 54px; font-weight: 900; letter-spacing: -.03em; }
.pgi { display: flex; flex-direction: column; gap: 22px; }
.it { position: relative; }
.card-it { display: flex; align-items: center; gap: 28px; padding: 24px 34px; border-radius: 30px; background: rgba(255,255,255,.95); box-shadow: 0 16px 40px rgba(80,60,70,.12); }
.itx { display: flex; flex-direction: column; gap: 6px; }
.itx b { font-size: 44px; font-weight: 850; letter-spacing: -.025em; line-height: 1.2; word-break: keep-all; }
.itx span { font-size: 30px; font-weight: 600; color: var(--ink-soft); line-height: 1.3; word-break: keep-all; }
.q-it { padding: 44px 56px 46px 90px; border-radius: 34px; background: rgba(255,255,255,.95); box-shadow: 0 16px 40px rgba(80,60,70,.12), inset 6px 0 0 var(--ac); }
.qm { position: absolute; left: 26px; top: -6px; font-size: 140px; font-weight: 900; line-height: 1; color: var(--ac); opacity: .35; }
.q-it p { font-size: 50px; font-weight: 800; line-height: 1.35; letter-spacing: -.03em; word-break: keep-all; }
.q-it em { font-style: normal; color: var(--ac); }
.st-it { display: flex; align-items: baseline; gap: 26px; padding: 22px 34px; border-radius: 30px; background: rgba(255,255,255,.95); box-shadow: 0 16px 40px rgba(80,60,70,.12); align-self: flex-start; }
.st-it b { font-size: 90px; font-weight: 900; letter-spacing: -.04em; line-height: 1; }
.st-it span { font-size: 36px; font-weight: 750; color: var(--ink-soft); }
.fl-it { display: flex; flex-direction: column; gap: 22px; padding: 34px; border-radius: 30px; background: rgba(255,255,255,.95); box-shadow: 0 16px 40px rgba(80,60,70,.12); }
.flr { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
.fls { padding: 18px 28px; border-radius: 22px; background: var(--bg); box-shadow: inset 0 0 0 3px var(--ac); font-size: 38px; font-weight: 900; letter-spacing: -.02em; white-space: nowrap; }
.fla { font-size: 50px; font-weight: 900; color: #b4a9d3; }
.flsub { font-size: 32px; font-weight: 650; color: var(--ink-soft); }

/* overlays on PPT */
.ovc { position: absolute; display: flex; flex-direction: column; gap: 14px; padding: 26px 28px; border-radius: 28px; background: rgba(255, 255, 255, .97);
  box-shadow: 0 22px 50px rgba(30, 24, 40, .28), inset 0 0 0 2px #f3ebe2; }
.ovc.rside { left: 1470px; top: 250px; width: 410px; }
.vstep { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 18px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; font-size: 30px; }
.vstep b { font-weight: 850; }
.vdown { align-self: center; font-size: 26px; font-weight: 900; color: #b4a9d3; line-height: 1; }
.ovline { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 18px; font-size: 29px; font-weight: 650; line-height: 1.3; word-break: keep-all; }
.ovline svg { display: block; flex: 0 0 auto; width: 40px; height: 40px; }
.ovline b { font-weight: 900; }
.ovline.no { background: #fde8ec; color: #8a3550; }
.ovline.yes { background: #e3f6ec; color: #24533f; }
.ovhead { display: flex; align-items: center; gap: 16px; }
.ovh { font-size: 28px; font-weight: 850; color: var(--ink-soft); }
.ovt { font-size: 40px; font-weight: 650; line-height: 1.3; letter-spacing: -.02em; }
.ovt b { font-weight: 900; color: #6b57c9; }
.okpill { display: inline-flex; align-items: center; gap: 12px; align-self: flex-start; padding: 8px 20px 8px 8px; border-radius: 999px; background: #e3f6ec; font-size: 26px; font-weight: 800; color: #24533f; }
.okpill svg { display: block; width: 38px; height: 38px; padding: 6px; border-radius: 50%; background: #3fa877; }
.zlabel { position: absolute; left: 440px; top: 4px; width: 260px; height: 36px; border-radius: 8px; background: #1c1c1e; color: #d9d6e3; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.rpanel { position: absolute; left: 1550px; top: 0; width: 370px; height: 1080px; padding: 40px 24px; display: flex; flex-direction: column; gap: 20px;
  background: linear-gradient(160deg, #fff6ee 0%, #fdf1f4 50%, #f1f0ff 100%); box-shadow: -14px 0 40px rgba(0,0,0,.35); }
.rpg { position: absolute; left: 24px; right: 24px; top: 110px; display: flex; flex-direction: column; gap: 16px; }
.rph { font-size: 28px; font-weight: 900; letter-spacing: -.02em; }
.rpi { display: flex; align-items: center; gap: 14px; padding: 16px 16px; border-radius: 22px; background: rgba(255,255,255,.96); box-shadow: 0 10px 26px rgba(80,60,70,.12); font-size: 25px; font-weight: 650; line-height: 1.3; word-break: keep-all; }
.rpi b { font-weight: 900; }
.rpnote { font-size: 24px; font-weight: 750; color: #9a4f35; padding: 10px 16px; border-radius: 16px; background: #fff1e8; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
  <div id="vwrap"><video id="vid" class="clip" src="assets/media/export.mp4" playsinline data-has-audio="true" data-start="0" data-duration="${DUR}" data-track-index="0"></video></div>
${maskHTML}
${covHTML}
${gHTML}
${capHTML}
  <div id="endfade"></div>
</div>
<script>
(function () {
  const tl = gsap.timeline({ paused: true });
  // 장면 시각을 off 만큼 당겨 놓는 래퍼 (같은 하나의 tl 에 추가된다)
  const SH = (o) => ({ to: (a, b, p) => tl.to(a, b, p - o), fromTo: (a, b, c, p) => tl.fromTo(a, b, c, p - o), set: (a, b, p) => tl.set(a, b, p - o) });
  const H = (T) => ({
    pop: (sel, t) => T.fromTo(sel, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.8)' }, t),
    up: (sel, t, dy = 30) => T.fromTo(sel, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, t),
    rise: (sel, t) => T.fromTo(sel, { opacity: 0, y: 60, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'expo.out' }, t),
    slide: (sel, t, dx = 60) => T.fromTo(sel, { opacity: 0, x: dx }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, t),
    sweep: (sel, t) => T.fromTo(sel, { backgroundSize: '0% 38%' }, { backgroundSize: '100% 38%', duration: .7, ease: 'power2.inOut', immediateRender: false }, t),
  });
  ${covAnim}
${gAnim}
  tl.fromTo('#endfade', { opacity: 0 }, { opacity: 1, duration: .8, ease: 'power1.in' }, ${(DUR - 0.8).toFixed(3)});
  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Built ${G.length} graphics, ${COVER.length} covers, ${caps.length} captions, duration ${DUR}s`);
