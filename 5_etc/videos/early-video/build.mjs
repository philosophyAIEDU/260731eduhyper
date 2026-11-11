import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 봉사단 Claude Code CLI 실습 리허설 (88분 줌 녹화 → 31분) — generator for index.html.
//
// 그림 + 소리: assets/media/src.mp4
//   edit/cuts.py → edit/cuts.json (원본 기준 구간) → edit/render.py 로 잘라 붙임.
//   줌 녹화에서 화면 공유 영역(1022x548)만 잘라 1720x922 로 키워 위쪽에 두었다.
//   → 오른쪽 참가자 얼굴 띠는 영상에 아예 없다. 아래 140px 띠는 STEP 진행 표시줄 자리.
//   원본 앞부분(갤러리 보기, 얼굴 타일 큼)은 0 ~ 92.8s 덮개 장면이 가린다.
// 모든 시각은 편집본(src.mp4) 기준 초. edit/outscript.txt 에 편집본 기준 발화 시각이 있다.
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 1871.8;

// 덮개(모션그래픽 전용) 구간
const COVER = [
  { id: 'cov1', s: 0, e: 92.8, fin: 0, fout: 0.45 },
  { id: 'cov2', s: 510.2, e: 563.9, fin: 0.4, fout: 0.4 },
  { id: 'cov3', s: 695.5, e: 725.7, fin: 0.4, fout: 0.4 },
  { id: 'cov4', s: 972.8, e: 1050.8, fin: 0.4, fout: 0.4 },
  { id: 'cov5', s: 1431.2, e: 1459.0, fin: 0.4, fout: 0.4 },
  { id: 'cov6', s: 1612.6, e: 1643.5, fin: 0.4, fout: 0.4 },
  { id: 'cov7', s: 1712.0, e: DUR, fin: 0.4, fout: 0 },
];

// STEP 진행 표시줄 (아래 띠)
const STEPS = [
  ['준비', 92.8], ['STEP 1 · 폴더·모드', 232.7], ['STEP 2 · 가상 자료', 298.8], ['STEP 3 · 정리표', 581.7],
  ['STEP 4 · 수업 자료', 725.9], ['STEP 5 · 스킬', 965.6], ['STEP 6 · 자동화 스킬', 1283.5], ['매일 8시 자동화', 1482.4],
];
const STEP_END = 1712.0;

// ---------- icons ----------------------------------------------------------
const S = (c, body, w = 4) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  terminal: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="6"/><path d="M18 26l8 6-8 6M30 40h14"/>`),
  folder: (c) => S(c, `<path d="M8 18a4 4 0 0 1 4-4h12l6 6h22a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"/>`),
  doc: (c) => S(c, `<path d="M16 8h22l12 12v36H16z"/><path d="M38 8v12h12"/><path d="M23 32h18M23 40h18M23 48h11"/>`),
  check: (c) => S(c, `<path d="M18 33l9 9 19-20"/>`, 7),
  x: (c) => S(c, `<path d="M20 20l24 24M44 20L20 44"/>`, 7),
  chat: (c) => S(c, `<path d="M10 14h44v28H30l-12 10V42h-8z"/><path d="M20 26h24M20 33h14"/>`),
  sparkle: (c) => S(c, `<path d="M28 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${c}" stroke-width="2"/><path d="M50 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="${c}" stroke-width="1.5"/>`),
  warn: (c) => S(c, `<path d="M32 8l26 46H6z"/><path d="M32 26v12"/><circle cx="32" cy="45" r="1.5" fill="${c}"/>`),
  play: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M27 22l15 10-15 10z" fill="${c}"/>`),
  bolt: (c) => S(c, `<path d="M36 6L14 36h16l-4 22 22-30H32z" fill="${c}" stroke-width="2"/>`),
  pen: (c) => S(c, `<path d="M14 50l4-14 26-26 10 10-26 26z"/><path d="M38 16l10 10"/>`),
  heart: (c) => S(c, `<path d="M32 52C18 42 10 34 10 24c0-7 5-12 11-12 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 5 11 12 0 10-8 18-22 28z" fill="${c}"/>`, 2),
  user: (c) => S(c, `<circle cx="32" cy="22" r="10"/><path d="M12 54c2-11 10-17 20-17s18 6 20 17"/>`),
  eye: (c) => S(c, `<path d="M6 32s10-16 26-16 26 16 26 16-10 16-26 16S6 32 6 32z"/><circle cx="32" cy="32" r="7"/>`),
  clock: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M32 18v14l10 6"/>`),
  shield: (c) => S(c, `<path d="M32 6l22 8v16c0 14-9 24-22 28C19 54 10 44 10 30V14z"/><path d="M22 31l7 7 13-14"/>`),
  lock: (c) => S(c, `<rect x="12" y="28" width="40" height="28" rx="6"/><path d="M20 28v-8a12 12 0 0 1 24 0v8"/><circle cx="32" cy="42" r="3" fill="${c}"/>`),
  table: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="5"/><path d="M8 24h48M8 38h48M24 12v40M40 12v40"/>`),
  wand: (c) => S(c, `<path d="M10 54L40 24"/><path d="M36 20l8 8"/><path d="M46 8v8M42 12h8M54 22v6M51 25h6M28 8v5M25.5 10.5h5"/>`),
  students: (c) => S(c, `<circle cx="22" cy="22" r="8"/><circle cx="44" cy="24" r="7"/><path d="M6 52c1-10 7-15 16-15s15 5 16 15M38 38c8 0 14 4 15 14"/>`),
  download: (c) => S(c, `<path d="M32 8v32M20 28l12 12 12-12"/><path d="M10 46v8h44v-8"/>`),
  plan: (c) => S(c, `<rect x="12" y="8" width="40" height="48" rx="5"/><path d="M22 6h20v8H22z"/><path d="M20 26l4 4 7-7M20 40l4 4 7-7M36 28h10M36 42h10"/>`),
  slides: (c) => S(c, `<rect x="6" y="10" width="52" height="34" rx="4"/><path d="M32 44v10M22 56h20"/><path d="M16 22h20M16 30h14"/><circle cx="46" cy="27" r="5"/>`),
  handshake: (c) => S(c, `<path d="M4 26l12-10 10 4 8-4 8 0 18 12"/><path d="M16 16l-12 10 14 16"/><path d="M60 28L46 42"/><path d="M24 34l6 6M30 30l8 8M36 28l8 8M18 40l6 6"/>`),
  inbox: (c) => S(c, `<path d="M8 36l8-24h32l8 24v16H8z"/><path d="M8 36h14l4 6h12l4-6h14"/>`),
  layers: (c) => S(c, `<path d="M32 8l26 13-26 13L6 21z"/><path d="M6 32l26 13 26-13"/><path d="M6 43l26 13 26-13"/>`),
  news: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="5"/><path d="M16 22h32M16 31h14M16 40h14"/><rect x="34" y="29" width="14" height="14" rx="2"/>`),
  book: (c) => S(c, `<path d="M32 16c-6-5-14-6-24-5v38c10-1 18 0 24 5 6-5 14-6 24-5V11c-10-1-18 0-24 5z"/><path d="M32 16v38"/>`),
};

const C = { coral: '#ef8a6f', mint: '#4fb489', lav: '#9a8be6', sky: '#6aa3e6', pink: '#e8708f', yellow: '#e7a92c', ink: '#34314a' };
const BG = { peach: '#ffe6dc', mint: '#dcf3e8', lav: '#ebe6ff', sky: '#e2eeff', pink: '#ffe3ea', yellow: '#fff1cc' };

const ico = (id, name, color, bg, cls = '') => `<div id="${id}" class="ico ${cls}" style="background:${bg}">${ICON[name](color)}</div>`;
const pill = (id, txt, dot = C.coral, cls = '') => `<div id="${id}" class="pill ${cls}"><span class="pdot" style="background:${dot}"></span><span>${txt}</span></div>`;
const ok = (id, txt, cls = '') => `<div id="${id}" class="okpill ${cls}"><span class="okc">${ICON.check('#ffffff')}</span><span>${txt}</span></div>`;
const no = (id, txt, cls = '') => `<div id="${id}" class="okpill nopill ${cls}"><span class="okc">${ICON.x('#ffffff')}</span><span>${txt}</span></div>`;
const hl = (txt, color = 'var(--hl-y)') => `<span class="hl" style="--hlc:${color}">${txt}</span>`;
const arrowR = (id, cls = '') => `<svg id="${id}" class="arrow ${cls}" viewBox="0 0 120 24" fill="none" stroke="#5b5873" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M4 12h108M98 2l14 10-14 10"/></svg>`;
const step = (n, t) => `<div class="stephead"><span class="stepn">${n}</span><span class="stept">${t}</span></div>`;
const f = (t) => t.toFixed(2);

// ---------- graphics -------------------------------------------------------
// { id, s, e, html, anim, layer } — 편집본 기준 초.
// layer: 'full' = 덮개 장면, 'ov' = 실습 화면 위 작은 카드
const G = [];
const add = (g) => G.push({ layer: 'ov', ...g });

// ===== 0. 인트로 (0 ~ 92.8) — 덮개 =========================================
add({ id: 's-title', layer: 'full', s: 0, e: 23.0, html: `
  <div id="st-ph" class="phwrap"><img id="st-img" class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="st-c" class="card titlecard">
    ${pill('st-k', '필로소피 AI 교육 봉사단 · 온라인 실습', C.coral, 'pill-soft')}
    <h1 id="st-h" class="h1 center">${hl('Claude Code CLI', 'var(--hl-p)')}<br>30분 실습 리허설</h1>
    <div id="st-term" class="term"><span class="tprompt">&gt;</span><span id="st-tt">claude</span><span id="st-cur" class="tcur"></span></div>
    <div id="st-sub" class="subline sm">오프라인 컨퍼런스를 앞두고 단원들과 <b>먼저 해 본</b> 실습</div>
  </div>`, anim: `
  tl.fromTo('#st-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, .15);
  rise('#st-c', .3); up('#st-k', .55, 16); up('#st-h', .7, 34); sweep('#st-h .hl', 1.3);
  up('#st-term', 1.4, 20); type('#st-tt', 'claude', 1.65, .6); blink('#st-cur', 1.4, 22.5);
  up('#st-sub', 15.1, 18);
  tl.fromTo('#st-ph', {y:0}, {y:-14, duration:1.6, ease:'sine.inOut', yoyo:true, repeat:${Math.max(0, Math.floor(20 / 1.6) - 1)}, immediateRender:false}, 2);` });

add({ id: 's-why', layer: 'full', s: 23.0, e: 63.4, html: `
  <div class="center-col" style="top:110px">
    ${pill('sw-k', '왜 Claude Code CLI일까요?', C.lav, 'pill-soft')}
  </div>
  <div class="duo2" style="top:290px">
    <div id="sw-a" class="card dcard">
      ${ico('sw-ai', 'sparkle', C.coral, BG.peach)}
      <div class="dt">자유도가 <b>굉장히 높다</b></div>
      <div class="ds">자동화 · 여러 작업을 편하게</div>
    </div>
    <div id="sw-vs" class="bigop vs">하지만</div>
    <div id="sw-b" class="card dcard">
      ${ico('sw-bi', 'terminal', '#ffffff', '#34314a')}
      <div class="dt"><b>진입장벽</b>이 있다</div>
      <div class="ds">검정 화면 · 명령어 입력</div>
    </div>
  </div>
  <div class="center-col" style="top:800px"><div id="sw-s" class="subline">교육자의 <b>반복 업무</b>에 도움이 되도록 준비한 실습</div></div>`, anim: `
  up('#sw-k', 23.2, 16);
  rise('#sw-a', 31.9); pop('#sw-ai', 32.2);
  pop('#sw-vs', 35.7); rise('#sw-b', 36.2); pop('#sw-bi', 36.5);
  tl.to('#sw-a', {scale:1.04, duration:.5, ease:'back.out(2)'}, 42.3);
  up('#sw-s', 49.9, 20);` });

const PREP = [['folder', C.yellow, BG.yellow, '새 폴더 열기', 'File → Open Folder', 63.4], ['terminal', '#ffffff', '#34314a', '새 터미널 열기', 'Terminal → New Terminal', 85.8]];
add({ id: 's-prep', layer: 'full', s: 63.4, e: 92.8, html: `
  <div class="center-col" style="top:110px">
    ${pill('sp-k', '실습 준비 · Antigravity IDE', C.yellow, 'pill-soft')}
  </div>
  <div class="flow" style="top:300px">
    ${PREP.map(([ic, c, b, t, d], i) => `<div id="sp-${i}" class="card fcard tall"><span class="fnum">${i + 1}</span>${ico(`sp-i${i}`, ic, c, b, 'sm')}<div class="ft big">${t}</div><div class="fd">${d}</div></div>${i < 1 ? arrowR(`sp-a${i}`) : ''}`).join('')}
    ${arrowR('sp-a1')}
    <div id="sp-2" class="card fcard tall"><span class="fnum">3</span><div class="term">&gt; claude</div><div class="ft big">Claude Code 실행</div><div class="fd">터미널에 claude 입력</div></div>
  </div>`, anim: `
  up('#sp-k', 63.6, 16);
  rise('#sp-0', 63.8); pop('#sp-i0', 64.1);
  draw('#sp-a0 path', 85.5, .4); rise('#sp-1', 85.8); pop('#sp-i1', 86.1);
  draw('#sp-a1 path', 89.8, .4); rise('#sp-2', 90.0);` });

// ===== 준비 (92.8 ~ 232.7) — 실습 화면 + 작은 카드 ============================
add({ id: 'o-claude', s: 93.2, e: 108.3, html: `
  <div id="oc-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="oc-tt">claude</code><span id="oc-cur" class="tcur"></span></div>
    <div class="ovt">Claude Code 실행 · 모델 <b>Opus 5.5</b></div>
  </div>`, anim: `rise('#oc-c', 93.3); type('#oc-tt', 'claude', 93.6, .5); blink('#oc-cur', 94.2, 107.5);` });

add({ id: 'o-repo', s: 109.0, e: 171.5, html: `
  <div id="or-c" class="ovc top">
    ${pill('or-k', '실습 코스를 깃허브에 미리 준비', C.sky, 'pill-soft pill-sm')}
    <div class="chain">
      <span id="or-0" class="chip">채팅창 프롬프트 붙여넣기</span><span id="or-g0" class="cg">›</span>
      <span id="or-1" class="chip mono">repo/</span><span id="or-g1" class="cg">›</span>
      <span id="or-2" class="chip mono">instructor</span><span id="or-3" class="chip mono">practice</span><span id="or-4" class="chip mono">tutor</span>
    </div>
    ${ok('or-ok', '30분 정도 진행하는 실습 코스', 'ok-xs')}
  </div>`, anim: `rise('#or-c', 109.1); up('#or-k', 109.3, 12); pop('#or-0', 114.9); pop('#or-g0', 142.7); pop('#or-1', 149.3);
  pop('#or-g1', 155.0); pop('#or-2', 155.3); pop('#or-3', 155.6); pop('#or-4', 155.9); pop('#or-ok', 162.0);` });

add({ id: 'o-start', s: 172.1, e: 186.8, html: `
  <div id="os-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="os-tt">30분짜리 실습을 시작하겠습니다</code></div>
    <div class="ovs2">준비해 둔 실습이<br><b>순서대로 안내</b>를 시작해요</div>
  </div>`, anim: `rise('#os-c', 172.2); type('#os-tt', '30분짜리 실습을 시작하겠습니다', 172.5, 1.4); up('#os-c .ovs2', 179.8, 12);` });

add({ id: 'o-cli', s: 187.6, e: 232.2, html: `
  <div id="ol-c" class="ovc top row">
    ${ico('ol-i', 'folder', C.yellow, BG.yellow, 'xs')}
    <div class="col">
      <div class="chain"><span id="ol-0" class="chip">데스크탑 앱 · 코워크</span><span id="ol-g" class="cg">= CLI를 쉽게 쓰도록 만든 것</span></div>
      <div id="ol-t" class="ovt">내 컴퓨터 폴더의 파일을 <b>만들고 · 고치고 · 지우는</b> 일 → ${hl('CLI가 원조', 'var(--hl-y)')}</div>
    </div>
  </div>`, anim: `rise('#ol-c', 187.7); pop('#ol-i', 188.0); pop('#ol-0', 196.0); up('#ol-g', 197.0, 10); up('#ol-t', 216.5, 12); sweep('#ol-t .hl', 225.0);` });

// ===== STEP 1 (232.7 ~ 298.8) ===============================================
add({ id: 'o-s1', s: 233.0, e: 254.0, html: `
  <div id="o1-c" class="ovc top row">
    ${step('STEP 1', '지금 어느 폴더에서 일하나요?')}
    <div id="o1-t" class="ovs2">Claude Code는 <b>이 폴더 안의 파일</b>을<br>만들고 · 지워요 → 작업 폴더가 중요</div>
  </div>`, anim: `rise('#o1-c', 233.1); up('#o1-t', 242.2, 12);` });

const MODES = [['manual', '수동 · 하나하나 허락', 267.1], ['accept edits on', '수정은 바로 반영', 275.7], ['plan mode', '계획만 보여 줌', 282.0]];
add({ id: 'o-modes', s: 254.4, e: 298.4, html: `
  <div id="om-c" class="ovc top row">
    <div id="om-k" class="keycap">Shift + Tab</div>
    ${arrowR('om-a', 'arrow-sm')}
    <div class="modes">${MODES.map(([m, d], i) => `<div id="om-${i}" class="mode"><code>${m}</code><span>${d}</span></div>`).join('')}</div>
  </div>`, anim: `rise('#om-c', 254.5); pop('#om-k', 254.8); tl.fromTo('#om-k', {y:0}, {y:5, duration:.12, ease:'power1.inOut', yoyo:true, repeat:1, immediateRender:false}, 261.2);
  draw('#om-a path', 261.4, .35);
  ${MODES.map(([, , t], i) => `pop('#om-${i}', ${f(t)}); tl.to('#om-${i}', {backgroundColor:'#fff1cc', boxShadow:'inset 0 0 0 3px #f3d98a', duration:.3}, ${f(t + 0.1)}); ${i < 2 ? `tl.to('#om-${i}', {backgroundColor:'#f4f1fa', boxShadow:'inset 0 0 0 2px #e4def0', duration:.3}, ${f(MODES[i + 1][2])});` : ''}`).join('\n  ')}` });

// ===== STEP 2 (298.8 ~ 581.7) ===============================================
add({ id: 'o-s2', s: 299.0, e: 347.8, html: `
  <div id="o2-c" class="ovc top row">
    ${step('STEP 2', '가상 수업 자료 만들기')}
    <div class="chain"><span id="o2-0" class="chip">전공 과목</span><span id="o2-p" class="cg">+</span><span id="o2-1" class="chip">수업 주제</span><span id="o2-g" class="cg">›</span><span id="o2-2" class="chip hot">교육학 · 생성형 AI가 교육에 미치는 영향</span></div>
  </div>`, anim: `rise('#o2-c', 299.1); pop('#o2-0', 299.6); pop('#o2-p', 316.4); pop('#o2-1', 316.6); pop('#o2-g', 330.6); pop('#o2-2', 330.9);` });

const MEMO = [['가상 논문 메모 6편', 355.8], ['정리하기', 368.8], ['수업 자료 만들기', 371.5], ['자동화', 376.9]];
add({ id: 'o-memo', s: 348.6, e: 381.2, html: `
  <div id="oo-c" class="ovc top row">
    ${ico('oo-i', 'book', C.coral, BG.peach, 'xs')}
    <div class="col">
      <div class="ovs2">예: 중국문학 교수님 → 중국 신화와 중국 문화</div>
      <div class="chain">${MEMO.map(([t], i) => `${i ? `<span id="oo-g${i}" class="cg">›</span>` : ''}<span id="oo-${i}" class="chip ${i === 3 ? 'hot' : ''}">${t}</span>`).join('')}</div>
    </div>
  </div>`, anim: `rise('#oo-c', 348.7); pop('#oo-i', 349.0); ${MEMO.map(([, t], i) => `${i ? `pop('#oo-g${i}', ${f(t - 0.15)}); ` : ''}pop('#oo-${i}', ${f(t)});`).join(' ')}` });

add({ id: 'o-ide', s: 381.8, e: 418.3, html: `
  <div id="oi-c" class="ovc top row">
    ${ico('oi-i', 'eye', C.sky, BG.sky, 'xs')}
    <div class="col">
      <div class="ovt">왜 <b>Antigravity IDE</b> 터미널에서 쓸까요?</div>
      <div id="oi-t" class="ovs2">만든 파일이 <b>옆에 한눈에</b> 보여야 무엇을 만드는지 머리에 들어와요</div>
    </div>
  </div>`, anim: `rise('#oi-c', 381.9); pop('#oi-i', 382.2); up('#oi-t', 398.6, 12);` });

add({ id: 'o-papers', s: 438.0, e: 482.0, html: `
  <div id="op-c" class="ovc top row done">
    ${ico('op-i', 'doc', C.mint, BG.mint, 'xs')}
    <div class="col">
      <div class="ovt"><code class="mono-in">papers/</code> 가상 논문 <b class="num"><span id="op-n">0</span>편</b> 생성</div>
      <div class="chain"><span id="op-0" class="chip">연습이니까 가상 자료로</span><span id="op-1" class="chip hot">이 자료로 자동화까지</span></div>
    </div>
  </div>`, anim: `rise('#op-c', 438.1); pop('#op-i', 438.4); count('#op-n', 6, 438.6, 1.6); confetti('op', 476.8); pop('#op-0', 453.9); pop('#op-1', 461.8);` });

add({ id: 'o-q', s: 482.9, e: 510.0, html: `
  <div id="oq-c" class="ovc top row">
    ${ico('oq-i', 'chat', C.pink, BG.pink, 'xs')}
    <div class="col">
      <div class="ovt">단원 질문 — “지금 <b>무엇을 하는 과정</b>인지 모르겠어요”</div>
      <div id="oq-t" class="ovs2">처음 하는 분이 길을 잃지 않게 — 실습 전에 <b>전체 그림</b>부터</div>
    </div>
  </div>`, anim: `rise('#oq-c', 483.0); pop('#oq-i', 483.3); up('#oq-t', 503.3, 12);` });

// 덮개 2 — 오늘 실습의 전체 그림
const MAP = [['terminal', '#ffffff', '#34314a', 'CLI = 하얀 도화지', '실습 코드를 미리 준비', 510.4], ['download', C.sky, BG.sky, '코드 받기', 'Claude가 순서대로 안내', 527.7], ['doc', C.coral, BG.peach, '가상 자료', '과목 · 주제로 만들기', 547.8], ['folder', C.mint, BG.mint, '정리 · 수업 자료', '폴더 정리 → 새 자료', 555.0]];
add({ id: 's-map', layer: 'full', s: 510.2, e: 563.9, html: `
  <div class="center-col" style="top:100px">
    ${pill('sm-k', '지금 무엇을 하고 있을까요?', C.pink, 'pill-soft')}
    <h2 id="sm-h" class="h2">실습의 ${hl('전체 그림', 'var(--hl-p)')}</h2>
  </div>
  <div class="flow" style="top:340px;gap:18px">
    ${MAP.map(([ic, c, b, t, d], i) => `<div id="sm-${i}" class="card fcard mcard">${ico(`sm-i${i}`, ic, c, b, 'sm')}<div class="ft">${t}</div><div class="fd">${d}</div></div>${i < 3 ? arrowR(`sm-a${i}`, 'rarrow') : ''}`).join('')}
  </div>
  <div class="center-col" style="top:820px"><div id="sm-s" class="subline">지금은 <b>세팅 단계</b> — 이제 이 자료로 실습을 시작해요</div></div>`, anim: `
  up('#sm-k', 510.4, 16); up('#sm-h', 510.8, 30); sweep('#sm-h .hl', 511.6);
  ${MAP.map((g, i) => `${i ? `draw('#sm-a${i - 1} path', ${f(g[5] - 0.3)}, .4);` : ''} rise('#sm-${i}', ${f(g[5] + 0.1)}); pop('#sm-i${i}', ${f(g[5] + 0.3)});`).join('\n  ')}
  up('#sm-s', 556.5, 20);` });

// ===== STEP 3 (581.7 ~ 725.9) ===============================================
add({ id: 'o-s3', s: 564.3, e: 581.3, html: `
  <div id="on-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="on-tt">다음</code></div>
    <div class="ovs2">“다음”만 입력하면<br><b>다음 단계</b>를 안내해요</div>
  </div>`, anim: `rise('#on-c', 564.4); type('#on-tt', '다음', 571.8, .3);` });

add({ id: 'o-plan', s: 582.0, e: 646.8, html: `
  <div id="opl-c" class="ovc top row">
    ${step('STEP 3', '가상 자료 정리하기')}
    <div class="col">
      <div class="duoline"><div class="keycap sm">Shift + Tab</div>${arrowR('opl-a', 'arrow-sm')}<code id="opl-m" class="chip mono hot">plan mode</code></div>
      <div id="opl-t" class="ovs2">바로 만들거나 지우지 않고 <b>계획부터</b> 짜 줘요</div>
    </div>
  </div>`, anim: `rise('#opl-c', 582.1); draw('#opl-a path', 600.3, .35); pop('#opl-m', 600.6); up('#opl-t', 629.4, 12);` });

const COLS = ['파일명', '제목', '저자', '연도', '핵심 주장', '연구 방법'];
add({ id: 'o-table', s: 647.2, e: 695.2, html: `
  <div id="ot-c" class="ovc top row">
    ${ico('ot-i', 'table', C.sky, BG.sky, 'xs')}
    <div class="col">
      <div class="ovt"><code class="mono-in">literature_table.csv</code> — 6편을 한 표로</div>
      <div class="chain">${COLS.map((t, i) => `<span id="ot-${i}" class="chip">${t}</span>`).join('')}</div>
    </div>
  </div>`, anim: `rise('#ot-c', 647.3); pop('#ot-i', 647.6); ${COLS.map((_, i) => `pop('#ot-${i}', ${f(681.8 + i * 0.35)});`).join(' ')}` });

// 덮개 3 — 오늘의 실습 목표
const GOAL = [['book', C.coral, BG.peach, '내 자료', '논문 · 메모', 704.1], ['table', C.sky, BG.sky, '정리표', 'CSV 한 장', 706.5], ['slides', C.lav, BG.lav, '수업 자료 초고', 'Claude가 작성', 710.0], ['bolt', C.yellow, BG.yellow, '자동화', '알아서 반복', 716.6]];
add({ id: 's-goal', layer: 'full', s: 695.5, e: 725.7, html: `
  <div class="center-col" style="top:110px">
    ${pill('sg-k', '오늘의 실습 목표', C.yellow, 'pill-soft')}
    <h2 id="sg-h" class="h2">수업 자료 초고 만들기를 ${hl('자동화', 'var(--hl-y)')}로</h2>
  </div>
  <div class="flow" style="top:380px;gap:18px">
    ${GOAL.map(([ic, c, b, t, d], i) => `<div id="sg-${i}" class="card fcard mcard">${ico(`sg-i${i}`, ic, c, b, 'sm')}<div class="ft">${t}</div><div class="fd">${d}</div></div>${i < 3 ? arrowR(`sg-a${i}`, 'rarrow') : ''}`).join('')}
  </div>
  <div class="center-col" style="top:840px"><div id="sg-s" class="subline">지금은 가상 자료 — 실제로는 <b>내 자료</b>를 넣으면 돼요</div></div>`, anim: `
  up('#sg-k', 695.7, 16); up('#sg-h', 696.1, 30);
  ${GOAL.map((g, i) => `${i ? `draw('#sg-a${i - 1} path', ${f(g[5] - 0.3)}, .4);` : ''} rise('#sg-${i}', ${f(g[5])}); pop('#sg-i${i}', ${f(g[5] + 0.2)});`).join('\n  ')}
  sweep('#sg-h .hl', 717.0); tl.to('#sg-3', {scale:1.07, duration:.5, ease:'back.out(2)'}, 717.5);
  up('#sg-s', 719.5, 20);` });

// ===== STEP 4 (725.9 ~ 965.6) ===============================================
add({ id: 'o-guide', s: 726.2, e: 750.0, html: `
  <div id="og-c" class="ovc top row">
    ${ico('og-i', 'plan', C.lav, BG.lav, 'xs')}
    <div class="col">
      <div class="ovt">왜 코드를 미리 준비했을까요?</div>
      <div id="og-t" class="ovs2">초보자에게는 <b>안내가 하나하나</b> 나오는 게 좋더라고요</div>
    </div>
  </div>`, anim: `rise('#og-c', 726.3); pop('#og-i', 726.6); up('#og-t', 733.8, 12);` });

add({ id: 'o-s4', s: 750.4, e: 803.0, html: `
  <div id="o4-c" class="ovc top row">
    ${step('STEP 4', '수업 자료 만들기')}
    <div class="chain"><span id="o4-0" class="chip mono">literature_table.csv</span><span id="o4-g0" class="cg">만 근거로</span><span id="o4-g1" class="cg">›</span><span id="o4-1" class="chip mono hot">class-materials/slides.html</span></div>
  </div>`, anim: `rise('#o4-c', 750.5); pop('#o4-0', 762.2); up('#o4-g0', 762.5, 8); pop('#o4-g1', 783.9); pop('#o4-1', 784.1); tl.fromTo('#o4-1', {scale:1}, {scale:1.08, duration:.3, ease:'sine.inOut', yoyo:true, repeat:1, immediateRender:false}, 795.7);` });

const PROC = [['파일 만들기', 815.7], ['정리하기', 818.5], ['새로운 것 만들기', 824.4]];
add({ id: 'o-proc', s: 803.4, e: 835.0, html: `
  <div id="opr-c" class="ovc top row">
    ${ico('opr-i', 'students', C.mint, BG.mint, 'xs')}
    <div class="col">
      <div class="ovt">CLI를 <b>처음 쓰는 교육자</b>를 위한 흐름</div>
      <div class="chain">${PROC.map(([t], i) => `${i ? `<span id="opr-g${i}" class="cg">›</span>` : ''}<span id="opr-${i}" class="chip ${i === 2 ? 'hot' : ''}">${t}</span>`).join('')}</div>
    </div>
  </div>`, anim: `rise('#opr-c', 803.5); pop('#opr-i', 803.8); ${PROC.map(([, t], i) => `${i ? `pop('#opr-g${i}', ${f(t - 0.15)}); ` : ''}pop('#opr-${i}', ${f(t)});`).join(' ')}` });

add({ id: 'o-design', s: 835.5, e: 895.8, html: `
  <div id="od-c" class="ovc top row">
    ${ico('od-i', 'pen', C.pink, BG.pink, 'xs')}
    <div class="col">
      <div class="ovt">“슬라이드 <b>디자인을 바꿔 줘</b>”</div>
      <div id="od-t" class="ovs2">원하는 컬러 톤 · 바꿀 페이지를 말로 지정</div>
    </div>
    ${ok('od-ok', '훨씬 나아졌어요', 'ok-xs')}
  </div>`, anim: `rise('#od-c', 835.6); pop('#od-i', 835.9); tl.fromTo('#od-i', {rotation:0}, {rotation:-14, duration:.2, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, 842.3); up('#od-t', 853.0, 12); pop('#od-ok', 877.2);` });

add({ id: 'o-power', s: 896.3, e: 945.4, html: `
  <div id="ow-c" class="ovc top row">
    <div class="duoline"><span id="ow-0" class="chip hot">자유도가 높다</span><span id="ow-g" class="cg">=</span><span id="ow-1" class="chip">강력하지만 위험할 수도</span></div>
    ${arrowR('ow-a', 'arrow-sm')}
    <div id="ow-t" class="ovt">세팅만 되어 있으면<br>${hl('AI의 힘', 'var(--hl-y)')}을 가장 잘 느끼는 도구</div>
  </div>`, anim: `rise('#ow-c', 896.4); pop('#ow-0', 901.7); pop('#ow-g', 908.3); pop('#ow-1', 908.5); draw('#ow-a path', 922.1, .35); up('#ow-t', 928.9, 12); sweep('#ow-t .hl', 932.3);` });

add({ id: 'o-privacy', s: 945.8, e: 965.2, html: `
  <div id="opv-c" class="ovc top row warnc">
    ${ico('opv-i', 'shield', C.pink, BG.pink, 'xs')}
    <div class="col">
      <div class="ovt"><b>개인정보 · 민감한 파일</b> → 로컬 실행은 조심해서</div>
      <div id="opv-t" class="ovs2">자동화가 무조건 답은 아니에요 — 실습에서도 꼭 강조</div>
    </div>
  </div>`, anim: `rise('#opv-c', 945.9); pop('#opv-i', 946.2); shake('#opv-i', 950.5); up('#opv-t', 950.5, 12);` });

// ===== STEP 5 (965.6 ~ 1283.5) ==============================================
add({ id: 'o-s5', s: 965.8, e: 972.6, html: `
  <div id="o5-c" class="ovc top row">
    ${step('STEP 5', '수업 자료 만드는 과정을 스킬로 저장')}
  </div>`, anim: `rise('#o5-c', 965.9);` });

// 덮개 4 — 스킬 = 약속
add({ id: 's-skill', layer: 'full', s: 972.8, e: 1050.8, html: `
  <div class="center-col" style="top:96px">
    ${pill('sk-k', 'STEP 5 · 스킬이란?', C.lav, 'pill-soft')}
    <h2 id="sk-h" class="h2">스킬 = ${hl('약속', 'var(--hl-p)')}</h2>
  </div>
  <div class="duo2" style="top:330px">
    <div id="sk-a" class="card dcard">
      ${ico('sk-ai', 'doc', C.coral, BG.peach)}
      <div class="dt"><b>업무 인수인계서</b></div>
      <div class="ds">방금 한 작업을<br>A4 한 장으로 정리해 둔 것</div>
    </div>
    <div id="sk-ar" class="bigop">→</div>
    <div id="sk-b" class="card dcard">
      <div id="sk-say" class="bubble">“A”</div>
      <div class="dt">짧게 말해도 <b>똑같이</b></div>
      <div class="ds">합이 잘 맞는 조교처럼<br>알아서 같은 작업을</div>
    </div>
  </div>
  <div class="center-col" style="top:840px"><div id="sk-s" class="subline">작업을 마치면 꼭 <b>“스킬로 저장해 줘”</b></div></div>`, anim: `
  up('#sk-k', 973.0, 16); up('#sk-h', 973.4, 30); sweep('#sk-h .hl', 974.2);
  rise('#sk-a', 979.5); pop('#sk-ai', 979.8);
  pop('#sk-ar', 989.3); rise('#sk-b', 989.5); stamp('#sk-say', 990.2);
  up('#sk-s', 999.4, 20);
  tl.to('#sk-b', {scale:1.05, duration:.5, ease:'back.out(2)'}, 1043.0);
  tl.fromTo('#sk-say', {scale:1}, {scale:1.15, duration:.4, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, 1043.2);` });

add({ id: 'o-lk', s: 1051.2, e: 1142.3, html: `
  <div id="olk-c" class="ovc top row">
    ${ico('olk-i', 'wand', C.coral, BG.peach, 'xs')}
    <div class="col">
      <div class="chain"><span id="olk-0" class="chip">논문 메모 정리</span><span id="olk-g0" class="cg">›</span><span id="olk-1" class="chip">정리표</span><span id="olk-g1" class="cg">›</span><span id="olk-2" class="chip">수업 자료</span><span id="olk-g" class="cg">= 스킬 하나로</span></div>
      <div id="olk-cmd" class="bigcmd sm"><span class="tprompt">&gt;</span><code>/lecture-kit <span id="olk-tt"></span></code></div>
    </div>
  </div>`, anim: `rise('#olk-c', 1051.3); pop('#olk-i', 1051.6); pop('#olk-0', 1051.8); pop('#olk-g0', 1052.1); pop('#olk-1', 1052.3); pop('#olk-g1', 1052.6); pop('#olk-2', 1052.8); up('#olk-g', 1053.4, 8);
  up('#olk-cmd', 1101.2, 10); type('#olk-tt', '생성형 AI가 대학생에게 미치는 영향', 1116.4, 1.2);` });

add({ id: 'o-skmd', s: 1142.7, e: 1193.2, html: `
  <div id="osm-c" class="ovc top row done">
    ${ico('osm-i', 'check', '#ffffff', '#3fa877', 'xs')}
    <div class="col">
      <div class="ovt">스킬 완성 — <code class="mono-in">.claude/skills/lecture-kit/SKILL.md</code></div>
      <div id="osm-t" class="ovs2">방금 한 작업이 <b>지침 문서</b>로 들어가 있어요</div>
    </div>
  </div>`, anim: `rise('#osm-c', 1142.8); tl.fromTo('#osm-i', {opacity:0, scale:.3, rotation:-90}, {opacity:1, scale:1, rotation:0, duration:.6, ease:'back.out(2)'}, 1143.1); up('#osm-t', 1188.0, 12);` });

add({ id: 'o-skuse', s: 1193.6, e: 1214.2, html: `
  <div id="osu-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="osu-tt">/lecture-kit 학생들이 AI를 활용하는 경우가 많습니다</code></div>
  </div>`, anim: `rise('#osu-c', 1193.7); type('#osu-tt', '/lecture-kit 학생들이 AI를 활용하는 경우가 많습니다', 1194.0, 1.6);` });

add({ id: 'o-skq', s: 1214.6, e: 1255.2, html: `
  <div id="oskq-c" class="ovc top row">
    ${ico('oskq-i', 'chat', C.pink, BG.pink, 'xs')}
    <div class="col">
      <div class="ovt">Q. 이 폴더의 스킬, <b>다른 폴더</b>에서도 쓸 수 있나요?</div>
      <div id="oskq-t" class="ovs2">A. 스킬도 결국 <b>파일</b> — 그 파일이 있는 곳에서 Claude가 읽고 작업해요</div>
    </div>
  </div>`, anim: `rise('#oskq-c', 1214.7); pop('#oskq-i', 1215.0); up('#oskq-t', 1226.9, 12); tl.fromTo('#oskq-t b', {color:'#34314a'}, {color:'#c9583c', duration:.4}, 1227.5);` });

add({ id: 'o-skres', s: 1255.6, e: 1283.2, html: `
  <div id="osr-c" class="ovc top row done">
    ${ico('osr-i', 'slides', C.mint, BG.mint, 'xs')}
    <div class="col">
      <div class="ovt">스킬로 같은 작업 → 새 수업 자료</div>
      <div class="chain"><span id="osr-0" class="chip hot">AI 시대에 어떤 과제를 내줘야 할까</span><span id="osr-1" class="chip">디자인도 그대로</span></div>
    </div>
  </div>`, anim: `rise('#osr-c', 1255.7); pop('#osr-i', 1256.0); pop('#osr-0', 1264.2); pop('#osr-1', 1266.5);` });

// ===== STEP 6 (1283.5 ~ 1482.4) =============================================
const WEEK = [['inbox', C.sky, BG.sky, 'inbox 새 메모 확인', 1331.0], ['table', C.mint, BG.mint, '정리표에 추가', 1336.8], ['wand', C.coral, BG.peach, '/lecture-kit 으로 수업 자료', 1356.3]];
add({ id: 'o-s6', s: 1283.8, e: 1375.0, html: `
  <div id="o6-c" class="ovc top row">
    ${step('STEP 6', '자동화 스킬 만들기')}
    <div class="col">
      <div class="ovs2">다음 주 주제만 넣으면 —</div>
      <div class="chain">${WEEK.map(([ic, c, b, t], i) => `${i ? `<span id="o6-g${i}" class="cg">›</span>` : ''}<span id="o6-${i}" class="chip">${t}</span>`).join('')}</div>
    </div>
  </div>`, anim: `rise('#o6-c', 1283.9); up('#o6-c .ovs2', 1322.6, 10); ${WEEK.map(([, , , , t], i) => `${i ? `pop('#o6-g${i}', ${f(t - 0.15)}); ` : ''}pop('#o6-${i}', ${f(t)});`).join(' ')}
  tl.to('#o6-2', {backgroundColor:'#fff1cc', boxShadow:'inset 0 0 0 2px #f3d98a', duration:.3}, 1363.5);` });

add({ id: 'o-week', s: 1375.4, e: 1431.0, html: `
  <div id="owk-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="owk-tt">다음 주 주제: AI를 활용한 평가</code></div>
    <div class="col">
      <div class="chain"><span id="owk-0" class="chip mono">inbox/ 7번 · 8번 메모</span><span id="owk-g0" class="cg">›</span><span id="owk-1" class="chip">정리표</span><span id="owk-g1" class="cg">›</span><span id="owk-2" class="chip hot">수업 자료</span></div>
    </div>
  </div>`, anim: `rise('#owk-c', 1375.5); type('#owk-tt', '다음 주 주제: AI를 활용한 평가', 1380.9, 1.2); pop('#owk-0', 1394.8); pop('#owk-g0', 1400.9); pop('#owk-1', 1401.1); pop('#owk-g1', 1416.1); pop('#owk-2', 1416.3);` });

// 덮개 5 — 스킬이 쌓이는 구조
const STACK = [['pen', C.lav, BG.lav, '한 번 직접 작업', '정리표 → 수업 자료', 1431.4], ['wand', C.coral, BG.peach, '스킬로 저장', '/lecture-kit', 1433.6], ['layers', C.sky, BG.sky, '스킬 안에 스킬', '자동화 스킬', 1444.6]];
add({ id: 's-stack', layer: 'full', s: 1431.2, e: 1459.0, html: `
  <div class="center-col" style="top:110px">
    ${pill('ss-k', '처음엔 방대했던 작업이', C.sky, 'pill-soft')}
    <h2 id="ss-h" class="h2">스킬로 점점 ${hl('짧아져요', 'var(--hl-m)')}</h2>
  </div>
  <div class="flow" style="top:350px">
    ${STACK.map(([ic, c, b, t, d], i) => `<div id="ss-${i}" class="card fcard"><span class="fnum">${i + 1}</span>${ico(`ss-i${i}`, ic, c, b, 'sm')}<div class="ft">${t}</div><div class="fd">${d}</div></div>${i < 2 ? arrowR(`ss-a${i}`) : ''}`).join('')}
  </div>`, anim: `
  up('#ss-k', 1431.4, 16); up('#ss-h', 1431.8, 30); sweep('#ss-h .hl', 1437.0);
  ${STACK.map((g, i) => `${i ? `draw('#ss-a${i - 1} path', ${f(g[5] - 0.3)}, .4);` : ''} rise('#ss-${i}', ${f(g[5])}); pop('#ss-i${i}', ${f(g[5] + 0.2)});`).join('\n  ')}
  tl.to('#ss-2', {scale:1.06, duration:.5, ease:'back.out(2)'}, 1453.6);` });

add({ id: 'o-claudemd', s: 1459.3, e: 1482.0, html: `
  <div id="ocm-c" class="ovc top row">
    ${ico('ocm-i', 'book', C.lav, BG.lav, 'xs')}
    <div class="col">
      <div class="ovt"><code class="mono-in">CLAUDE.md</code> = Claude의 ${hl('헌법', 'var(--hl-p)')}</div>
      <div id="ocm-t" class="ovs2">하고 싶은 작업을 요청하면 여기에 정리 → 작업할 때 <b>꼭 참고</b>하는 필수 문서</div>
    </div>
  </div>`, anim: `rise('#ocm-c', 1459.4); pop('#ocm-i', 1459.7); up('#ocm-t', 1467.2, 12); sweep('#ocm-c .hl', 1473.8);` });

// ===== 매일 8시 자동화 (1482.4 ~ 1712) ======================================
add({ id: 'o-daily', s: 1482.8, e: 1550.0, html: `
  <div id="oy-c" class="ovc top row">
    <div id="oy-clk" class="clock"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#fff7ee" stroke="#e7a92c" stroke-width="5"/><path id="oy-h" d="M32 32V19" stroke="#34314a" stroke-width="5" stroke-linecap="round"/><path id="oy-m" d="M32 32V12" stroke="#ef8a6f" stroke-width="4" stroke-linecap="round"/></svg></div>
    <div class="col">
      <div class="ovt">매일 아침 <b>8시</b>에 —</div>
      <div class="chain"><span id="oy-0" class="chip">최신 AI 뉴스 검색</span><span id="oy-g0" class="cg">›</span><span id="oy-1" class="chip">교육학 관련 내용 추리기</span><span id="oy-g1" class="cg">›</span><span id="oy-2" class="chip hot">수업용 HTML 파일</span></div>
    </div>
  </div>`, anim: `rise('#oy-c', 1482.9); tl.fromTo('#oy-m', {rotation:0, svgOrigin:'32 32'}, {rotation:720, svgOrigin:'32 32', duration:1.4, ease:'power2.inOut'}, 1495.8); tl.fromTo('#oy-h', {rotation:-60, svgOrigin:'32 32'}, {rotation:-120, svgOrigin:'32 32', duration:1.4, ease:'power2.inOut'}, 1495.8);
  pop('#oy-0', 1496.0); pop('#oy-g0', 1504.2); pop('#oy-1', 1504.4); pop('#oy-g1', 1510.9); pop('#oy-2', 1511.1);` });

add({ id: 'o-sched', s: 1550.4, e: 1590.0, html: `
  <div id="osc-c" class="ovc top row">
    ${ico('osc-i', 'clock', C.yellow, BG.yellow, 'xs')}
    <div class="col">
      <div class="ovt">내 컴퓨터의 <b>작업 스케줄러</b>가 매일 8시에 실행</div>
      <div class="chain">${ok('osc-0', '컴퓨터 켜짐 + Windows 로그인', 'ok-xs')}${no('osc-1', '컴퓨터가 꺼져 있으면 ✕', 'ok-xs')}</div>
    </div>
  </div>`, anim: `rise('#osc-c', 1550.5); pop('#osc-i', 1550.8); pop('#osc-0', 1563.1); pop('#osc-1', 1564.5);` });

add({ id: 'o-news', s: 1590.4, e: 1612.3, html: `
  <div id="onw-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="onw-tt">/daily-ai-news 지금 실행해 줘</code></div>
    <div class="ovs2">AI 뉴스 × 교육학<br>→ <b>수업 자료</b></div>
  </div>`, anim: `rise('#onw-c', 1590.5); type('#onw-tt', '/daily-ai-news 지금 실행해 줘', 1590.8, 1.2); up('#onw-c .ovs2', 1598.9, 10);` });

// 덮개 6 — 오늘 해 본 흐름
const RECAP = [['doc', C.coral, BG.peach, '파일 만들기'], ['table', C.sky, BG.sky, '정리하기'], ['wand', C.lav, BG.lav, '스킬 만들기'], ['slides', C.mint, BG.mint, '수업 자료'], ['bolt', C.yellow, BG.yellow, '자동화']];
add({ id: 's-recap', layer: 'full', s: 1612.6, e: 1643.5, html: `
  <div class="center-col" style="top:120px">
    ${pill('sr-k', '오늘 함께 해 본 흐름', C.coral, 'pill-soft')}
    <h2 id="sr-h" class="h2">미리 준비한 코드로 ${hl('순서대로', 'var(--hl-y)')}</h2>
  </div>
  <div class="recap" style="top:420px">
    ${RECAP.map(([ic, c, b, t], i) => `<div id="sr-${i}" class="card rtile big">${ico(`sr-i${i}`, ic, c, b, 'xs')}<span>${t}</span></div>`).join('')}
  </div>
  <div class="center-col" style="top:720px"><div id="sr-s" class="subline">마지막엔 <b>자동화</b>까지 — 직접 해 볼 수 있게</div></div>`, anim: `
  up('#sr-k', 1612.8, 16); up('#sr-h', 1613.2, 30); sweep('#sr-h .hl', 1620.4);
  ${RECAP.map((_, i) => `rise('#sr-${i}', ${f(1620.4 + i * 1.6)}); pop('#sr-i${i}', ${f(1620.6 + i * 1.6)});`).join(' ')}
  tl.to('#sr-4', {scale:1.1, duration:.5, ease:'back.out(2)'}, 1636.6); up('#sr-s', 1637.0, 20);` });

add({ id: 'o-result', s: 1643.9, e: 1711.6, html: `
  <div id="ors-c" class="ovc top row done">
    ${ico('ors-i', 'news', C.mint, BG.mint, 'xs')}
    <div class="col">
      <div class="ovt">오늘의 AI 교육뉴스 — <b>HTML 브리핑</b> 완성</div>
      <div class="chain"><span id="ors-0" class="chip">매일 자동으로</span><span id="ors-1" class="chip">공유하기</span><span id="ors-2" class="chip">PPT · Word로도</span></div>
    </div>
  </div>`, anim: `rise('#ors-c', 1644.0); pop('#ors-i', 1644.3); confetti('ors', 1676.0); pop('#ors-0', 1685.7); pop('#ors-1', 1691.9); pop('#ors-2', 1696.0);` });

// ===== 피드백 (1712 ~ 끝) — 덮개 ============================================
const FB = [
  ['조헌국 교수님', '시간이 두 배는 더 걸릴 것 같아요. 스킬 · 자동화는 <b>잘라서</b> — 앞부분만 해도 충분히 필요해요', 1733.2, C.coral, BG.peach],
  ['김종현 수석님', '처음 하는 분들께는 <b>CLI 창 띄우기</b>부터 어려움 — 처음 헤매는 부분을 줄여야 해요', 1756.4, C.sky, BG.sky],
  ['임재홍 선생님', '기능이 많이 늘었으니 <b>데스크탑 앱</b>으로 먼저 실습하는 게 낫지 않을까요', 1805.7, C.mint, BG.mint],
  ['손정우 교수님', 'CLI를 아는 사람에겐 쉽지만, 오랜만이면 <b>터미널 켜는 법</b>부터 헷갈려요', 1820.4, C.lav, BG.lav],
];
add({ id: 's-fb', layer: 'full', s: 1712.0, e: 1849.6, html: `
  <div class="center-col" style="top:70px">
    ${pill('sf-k', '실습을 마치고 · 단원 피드백', C.pink, 'pill-soft')}
    <h2 id="sf-h" class="h2 sm">오프라인 실습, ${hl('어떻게 보셨나요?', 'var(--hl-p)')}</h2>
  </div>
  <div class="fbgrid">
    ${FB.map(([who, txt, , c, b], i) => `<div id="sf-${i}" class="card fbcard"><div class="fbwho">${ico(`sf-i${i}`, 'user', c, b, 'xxs')}<span>${who}</span></div><div class="fbtxt">${txt}</div></div>`).join('')}
  </div>`, anim: `
  up('#sf-k', 1712.3, 16); up('#sf-h', 1712.7, 30); sweep('#sf-h .hl', 1720.8);
  ${FB.map(([, , t], i) => `rise('#sf-${i}', ${f(t)}); pop('#sf-i${i}', ${f(t + 0.2)}); tl.to('#sf-${i}', {boxShadow:'0 0 0 6px rgba(232,112,143,.35), 0 30px 70px rgba(80,60,70,.2)', duration:.4}, ${f(t + 0.1)}); ${FB[i + 1] ? `tl.to('#sf-${i}', {boxShadow:'0 30px 70px rgba(80,60,70,.2), 0 6px 18px rgba(80,60,70,.08)', duration:.4}, ${f(FB[i + 1][2])});` : `tl.to('#sf-${i}', {boxShadow:'0 30px 70px rgba(80,60,70,.2), 0 6px 18px rgba(80,60,70,.08)', duration:.4}, 1849.0);`}`).join('\n  ')}` });

add({ id: 's-end', layer: 'full', s: 1849.6, e: DUR, html: `
  <div id="sx-ph" class="phwrap end"><img class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="sx-c" class="card endcard">
    ${pill('sx-k', '필로소피 AI 교육 봉사단', C.lav, 'pill-soft')}
    <div id="sx-h" class="endbig">다음엔 <span class="endok">데스크탑 앱</span>으로</div>
    <div id="sx-t" class="endsub">목표는 하나 — 오프라인 컨퍼런스에 오시는<br>교육자분들께 <b>도움이 되는 실습</b></div>
    <div id="sx-ty" class="thanks">다들 고생하셨습니다 · 감사합니다</div>
  </div>`, anim: `
  tl.fromTo('#sx-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, 1849.8);
  rise('#sx-c', 1850.0); up('#sx-k', 1850.2, 14); up('#sx-h', 1850.4, 26); up('#sx-t', 1851.2, 20);
  up('#sx-ty', 1859.6, 20);
  tl.fromTo('#sx-ph', {y:0}, {y:-14, duration:1.6, ease:'sine.inOut', yoyo:true, repeat:${Math.max(0, Math.floor((DUR - 1851) / 1.6) - 1)}, immediateRender:false}, 1851.0);` });

// sanity
for (const g of G) if (!(g.e > g.s + 0.5)) throw new Error(`bad span ${g.id}: ${g.s} → ${g.e}`);
const ov = G.filter((g) => g.layer === 'ov').sort((a, b) => a.s - b.s);
for (let i = 1; i < ov.length; i++) if (ov[i].s < ov[i - 1].e) throw new Error(`overlap ${ov[i - 1].id} / ${ov[i].id}`);

// ---------- assemble ---------------------------------------------------------
const gHTML = G.map((g) => `
<div id="${g.id}" class="scene ${g.layer} clip" data-start="${g.s.toFixed(3)}" data-duration="${(g.e - g.s).toFixed(3)}" data-track-index="${g.layer === 'full' ? 3 : 4}">
  <div id="${g.id}-sc" class="sc">${g.html}
  </div>
</div>`).join('\n');

const blobs = (id) => [
  ['#ffd9cb', 760, -160, -220], ['#d8f1e5', 640, 1380, 560], ['#e3dcff', 700, 1300, -260], ['#fff0c2', 520, -120, 640], ['#ffdbe5', 420, 820, 760],
].map(([c, sz, x, y], i) => `<span id="${id}-bl${i}" class="blob" style="width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;background:${c}"></span>`).join('');
const DECO = [['dot', C.coral, 18, 140, 140], ['ring', C.lav, 34, 1740, 120], ['dia', C.mint, 22, 1680, 820], ['dot', C.yellow, 14, 260, 860], ['ring', C.pink, 26, 90, 520], ['dia', C.sky, 18, 1820, 470], ['dot', C.mint, 12, 960, 40]];
const deco = (id) => DECO.map(([k, c, sz, x, y], i) => `<span id="${id}-d${i}" class="dc dc-${k}" style="--c:${c};width:${sz}px;height:${sz}px;left:${x}px;top:${y}px"></span>`).join('');
const covHTML = COVER.map((cv) => `
<div id="${cv.id}" class="cover clip" data-start="${cv.s.toFixed(3)}" data-duration="${(cv.e - cv.s).toFixed(3)}" data-track-index="2"><div id="${cv.id}-in" class="cov-in"${cv.fin ? ' style="opacity:0"' : ''}>${blobs(cv.id)}${deco(cv.id)}</div></div>`).join('');
const covAnim = COVER.map((cv) => {
  const len = cv.e - cv.s; const cyc = 7; const n = Math.max(0, Math.floor(len / cyc) - 1);
  return `
  ${cv.fin ? `tl.fromTo('#${cv.id}-in', {opacity:0}, {opacity:1, duration:${cv.fin}, ease:'power2.out'}, ${f(cv.s)});` : ''}
  ${cv.fout ? `tl.to('#${cv.id}-in', {opacity:0, duration:${cv.fout}, ease:'power2.in'}, ${f(cv.e - cv.fout)});` : ''}
  ${[0, 1, 2, 3, 4].map((i) => `tl.fromTo('#${cv.id}-bl${i}', {x:0, y:0}, {x:${[60, -70, -50, 70, 40][i]}, y:${[40, -50, 60, -40, -60][i]}, duration:${cyc}, ease:'sine.inOut', yoyo:true, repeat:${n}}, ${f(cv.s)});`).join('\n  ')}
  ${DECO.map((d, i) => `tl.fromTo('#${cv.id}-d${i}', {y:0, rotation:0}, {y:${i % 2 ? 22 : -22}, rotation:${i % 2 ? 40 : -40}, duration:${cyc / 2 + i * 0.3}, ease:'sine.inOut', yoyo:true, repeat:${Math.max(0, Math.floor(len / (cyc / 2 + i * 0.3)) - 1)}}, ${f(cv.s)});`).join('\n  ')}`;
}).join('');

// STEP tracker
const trkHTML = `
<div id="trk" class="clip" data-start="${STEPS[0][1].toFixed(3)}" data-duration="${(STEP_END - STEPS[0][1]).toFixed(3)}" data-track-index="1">
  <div id="trk-in">
    <div class="tlabel">Claude Code CLI<br><b>30분 실습</b></div>
    <div class="tchips">${STEPS.map(([t], i) => `<div id="tc-${i}" class="tchip"><span id="tcd-${i}" class="tdot">${ICON.check('#ffffff')}</span><span>${t}</span></div>`).join('')}</div>
  </div>
</div>`;
const trkAnim = `
  tl.fromTo('#trk-in', {opacity:0, y:30}, {opacity:1, y:0, duration:.6, ease:'power3.out'}, ${f(STEPS[0][1] + 0.2)});
  ${STEPS.map(([, t], i) => {
    const nx = STEPS[i + 1] ? STEPS[i + 1][1] : STEP_END;
    return `tl.to('#tc-${i}', {backgroundColor:'#ffe6dc', color:'#34314a', boxShadow:'0 0 0 3px #ef8a6f', duration:.4, ease:'power2.out'}, ${f(t)});
  tl.fromTo('#tc-${i}', {scale:1}, {scale:1.08, duration:.25, ease:'power2.out', yoyo:true, repeat:1, immediateRender:false}, ${f(t)});
  tl.to('#tc-${i}', {backgroundColor:'rgba(79,180,137,.22)', color:'#cdeedd', boxShadow:'0 0 0 2px rgba(79,180,137,.5)', duration:.4, ease:'power2.out'}, ${f(nx)});
  tl.fromTo('#tcd-${i}', {opacity:0, scale:.3}, {opacity:1, scale:1, duration:.4, ease:'back.out(2)'}, ${f(nx + 0.1)});`;
  }).join('\n  ')}`;

const gAnim = G.map((g) => {
  const fin = g.layer === 'full' ? .35 : .4, fout = g.layer === 'full' ? .3 : .35;
  return `
  // ${g.id}
  tl.fromTo('#${g.id}-sc', {opacity:0}, {opacity:1, duration:${fin}, ease:'power2.out'}, ${f(g.s)});
  ${g.e < DUR - 0.01 ? `tl.to('#${g.id}-sc', {opacity:0, duration:${fout}, ease:'power2.in'}, ${(g.e - fout - 0.02).toFixed(3)});` : ''}
  ${g.anim.trim()}`;
}).join('\n');

const baseCss = fs.readFileSync(path.join(root, 'edit/base.css'), 'utf8');
const extraCss = `
#vid { object-fit: fill; }
/* STEP tracker (bottom band: y 940–1080) */
#trk { position: absolute; left: 0; right: 0; top: 940px; height: 140px; z-index: 1; }
#trk-in { position: absolute; left: 100px; right: 100px; top: 0; bottom: 0; display: flex; align-items: center; gap: 22px; opacity: 0; }
.tlabel { flex: 0 0 auto; font-size: 22px; font-weight: 500; line-height: 1.25; color: #b9b3cf; letter-spacing: -.01em; }
.tlabel b { font-weight: 850; color: #f4efe6; font-size: 26px; }
.tchips { flex: 1 1 auto; display: flex; gap: 10px; }
.tchip { flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: 8px; height: 62px; padding: 0 10px; border-radius: 18px;
  background: rgba(255, 255, 255, .06); box-shadow: 0 0 0 2px rgba(255, 255, 255, .08); color: #b3adca; font-size: 21px; font-weight: 800; letter-spacing: -.02em; white-space: nowrap; }
.tdot { display: block; width: 24px; height: 24px; border-radius: 50%; background: #3fa877; padding: 4px; opacity: 0; flex: 0 0 auto; }
.tdot svg { display: block; width: 100%; height: 100%; }
/* overlay position: top-right over title bar / old terminal lines */
.ovc.top { right: 120px; top: 30px; max-width: 1500px; }
.ovc.warnc { box-shadow: 0 22px 50px rgba(10, 8, 20, .45), inset 0 0 0 3px #f2b3c3; }
.subline.sm { font-size: 30px; padding: 12px 28px; }
.titlecard { gap: 28px; }
.h2.sm { font-size: 60px; }
.keycap { padding: 10px 18px; border-radius: 14px; background: #fff; box-shadow: inset 0 -5px 0 #d9d2e6, 0 0 0 2px #d9d2e6; font-family: Consolas, "Courier New", monospace; font-size: 28px; font-weight: 800; white-space: nowrap; flex: 0 0 auto; }
.keycap.sm { font-size: 22px; padding: 6px 12px; }
.modes { display: flex; gap: 10px; }
.mode { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 16px; border-radius: 16px; background: #f4f1fa; box-shadow: inset 0 0 0 2px #e4def0; }
.mode code { font-family: Consolas, "Courier New", monospace; font-size: 24px; font-weight: 800; white-space: nowrap; }
.mode span { font-size: 19px; font-weight: 650; color: var(--ink-soft); white-space: nowrap; }
.bigcmd.sm { font-size: 26px; padding: 8px 16px; }
.mcard { width: 380px; height: 380px; }
.mcard .ft { font-size: 36px; }
.bubble { display: flex; align-items: center; justify-content: center; width: 150px; height: 120px; border-radius: 40px 40px 40px 10px; background: #ebe6ff; color: #6a55c0; font-size: 60px; font-weight: 900; }
.rtile.big { font-size: 38px; padding: 22px 34px 22px 22px; }
.fbgrid { position: absolute; left: 150px; right: 150px; top: 290px; display: grid; grid-template-columns: 1fr 1fr; gap: 34px; }
.fbcard { position: relative; padding: 34px 40px; display: flex; flex-direction: column; gap: 16px; border-radius: 36px; }
.fbwho { display: flex; align-items: center; gap: 14px; font-size: 32px; font-weight: 900; letter-spacing: -.02em; }
.fbtxt { font-size: 34px; font-weight: 600; line-height: 1.42; letter-spacing: -.02em; word-break: keep-all; }
.fbtxt b { font-weight: 900; color: #c4486c; }
.endsub { font-size: 38px; font-weight: 600; line-height: 1.4; color: var(--ink-soft); letter-spacing: -.02em; }
.endsub b { color: var(--ink); font-weight: 900; }
`;

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>봉사단 Claude Code CLI 실습 리허설</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
${baseCss}
${extraCss}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
  <div id="vwrap"><video id="vid" class="clip" src="assets/media/src.mp4" playsinline data-has-audio="true" data-start="0" data-duration="${DUR}" data-track-index="0"></video></div>
${trkHTML}
${covHTML}
${gHTML}
  <div id="endfade"></div>
</div>
<script>
(function () {
  const tl = gsap.timeline({ paused: true });
  const pop = (sel, t) => tl.fromTo(sel, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.8)' }, t);
  const up = (sel, t, dy = 30) => tl.fromTo(sel, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, t);
  const rise = (sel, t) => tl.fromTo(sel, { opacity: 0, y: 60, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'expo.out' }, t);
  const slide = (sel, t, dx = 60) => tl.fromTo(sel, { opacity: 0, x: dx }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, t);
  const sweep = (sel, t) => tl.fromTo(sel, { backgroundSize: '0% 38%' }, { backgroundSize: '100% 38%', duration: .7, ease: 'power2.inOut', immediateRender: false }, t);
  const draw = (sel, t, d) => tl.fromTo(sel, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: 'power2.out' }, t);
  const stamp = (sel, t) => tl.fromTo(sel, { opacity: 0, scale: 1.8, rotation: -18 }, { opacity: 1, scale: 1, rotation: -4, duration: .45, ease: 'back.out(2)' }, t);
  const shake = (sel, t) => tl.fromTo(sel, { rotation: 0 }, { rotation: -12, duration: .16, ease: 'sine.inOut', yoyo: true, repeat: 5, immediateRender: false }, t);
  const type = (sel, text, t, d) => {
    const el = document.querySelector(sel); const st = { n: 0 };
    tl.fromTo(st, { n: 0 }, { n: text.length, duration: d, ease: 'none', onUpdate: () => { el.textContent = text.slice(0, Math.round(st.n)); } }, t);
  };
  const count = (sel, to, t, d) => {
    const el = document.querySelector(sel); const st = { n: 0 };
    tl.fromTo(st, { n: 0 }, { n: to, duration: d, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(st.n)); } }, t);
  };
  const blink = (sel, t0, t1) => {
    const cyc = .9, n = Math.max(0, Math.floor((t1 - t0) / cyc) - 1);
    tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: cyc / 2, ease: 'steps(1)', yoyo: true, repeat: n * 2 + 1, immediateRender: false }, t0);
  };
  const confetti = (pre, t) => {
    const host = document.getElementById(pre + '-c'); const cols = ['#ef8a6f', '#e7a92c', '#4fb489', '#9a8be6', '#e8708f', '#6aa3e6'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span'); p.className = 'cf'; p.style.background = cols[i % 6];
      p.style.left = '50px'; p.style.top = '50px'; host.appendChild(p);
      const a = (i / 18) * Math.PI * 2, r = 80 + (i % 4) * 26;
      tl.fromTo(p, { opacity: 1, x: 0, y: 0, rotation: 0 }, { opacity: 0, x: Math.cos(a) * r, y: Math.sin(a) * r, rotation: 200 + i * 20, duration: 1.1, ease: 'power3.out', immediateRender: false }, t);
    }
  };

  // STEP tracker
  ${trkAnim}

  // cover backgrounds
  ${covAnim}

  // graphics
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
console.log(`Built ${G.length} graphics (${G.filter((g) => g.layer === 'full').length} full scenes), duration ${DUR}s`);
