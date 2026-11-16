import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 로컬 AI 사용법 (필로소피 로컬 AI) — generator for index.html.
//
// Picture + sound: assets/media/src.mp4 = 인트로(145.39s) + 실습(950.03s) + 아웃트로(80.93s) 이어 붙임
//   0      ~ O2     인트로   — 모션그래픽만 (원본 화면을 완전히 덮음)
//   O2     ~ O3     실습     — 실습 화면 그대로 + 중요한 순간에만 카드 / 임팩트 팝
//   O3     ~ 끝     아웃트로 — 모션그래픽만
// 자막: assets/source.srt (whisper 전사 + edit/make_srt.py 교정) 를 영상 전체에 같은 모양(검정 박스·흰 글씨)으로.
// 시각: 인트로 = 초 그대로, 실습 = P(실습 영상 기준 초), 아웃트로 = Q(아웃트로 기준 초).
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 1176.4;
const O2 = 145.387;
const O3 = 145.387 + 950.033;
const P = (t) => +(O2 + t).toFixed(3);
const Q = (t) => +(O3 + t).toFixed(3);

// ---------- SRT --------------------------------------------------------------
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const CUES = [];
fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .forEach((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); CUES.push({ s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }); });

const COVER = [
  { id: 'cov1', s: 0, e: O2, fin: 0, fout: 0.45 },
  { id: 'cov2', s: O3, e: DUR, fin: 0.45, fout: 0 },
];

// ---------- icons ----------------------------------------------------------
const S = (c, body, w = 4) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  folder: (c) => S(c, `<path d="M8 18a4 4 0 0 1 4-4h12l6 6h22a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"/>`),
  doc: (c) => S(c, `<path d="M16 8h22l12 12v36H16z"/><path d="M38 8v12h12"/><path d="M23 32h18M23 40h18M23 48h11"/>`),
  check: (c) => S(c, `<path d="M18 33l9 9 19-20"/>`, 7),
  x: (c) => S(c, `<path d="M20 20l24 24M44 20L20 44"/>`, 7),
  chat: (c) => S(c, `<path d="M10 14h44v28H30l-12 10V42h-8z"/><path d="M20 26h24M20 33h14"/>`),
  key: (c) => S(c, `<circle cx="20" cy="40" r="10"/><path d="M27 33l22-22M41 19l6 6M35 25l5 5"/>`),
  sparkle: (c) => S(c, `<path d="M28 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${c}" stroke-width="2"/><path d="M50 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="${c}" stroke-width="1.5"/>`),
  warn: (c) => S(c, `<path d="M32 8l26 46H6z"/><path d="M32 26v12"/><circle cx="32" cy="45" r="1.5" fill="${c}"/>`),
  play: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M27 22l15 10-15 10z" fill="${c}"/>`),
  heart: (c) => S(c, `<path d="M32 52C18 42 10 34 10 24c0-7 5-12 11-12 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 5 11 12 0 10-8 18-22 28z" fill="${c}"/>`, 2),
  bell: (c) => S(c, `<path d="M18 44V30a14 14 0 0 1 28 0v14l4 6H14z"/><path d="M27 54a5 5 0 0 0 10 0"/>`),
  user: (c) => S(c, `<circle cx="32" cy="22" r="10"/><path d="M12 54c2-11 10-17 20-17s18 6 20 17"/>`),
  lock: (c) => S(c, `<rect x="14" y="28" width="36" height="26" rx="5"/><path d="M21 28v-7a11 11 0 0 1 22 0v7"/><circle cx="32" cy="40" r="3" fill="${c}"/><path d="M32 43v5"/>`),
  shield: (c) => S(c, `<path d="M32 6l22 8v16c0 14-10 23-22 28C20 53 10 44 10 30V14z"/><path d="M22 31l7 7 13-14"/>`),
  cloud: (c) => S(c, `<path d="M18 48a12 12 0 0 1-1-24 16 16 0 0 1 31 3 10 10 0 0 1-2 21z"/>`),
  pc: (c) => S(c, `<rect x="6" y="10" width="52" height="34" rx="4"/><path d="M24 54h16M32 44v10"/>`),
  wifioff: (c) => S(c, `<path d="M8 24a34 34 0 0 1 48 0M16 32a22 22 0 0 1 32 0M24 40a10 10 0 0 1 16 0"/><circle cx="32" cy="49" r="2.5" fill="${c}"/><path d="M10 10l44 44"/>`),
  plug: (c) => S(c, `<path d="M24 8v12M40 8v12M18 20h28v10a14 14 0 0 1-28 0z"/><path d="M32 44v12"/>`),
  download: (c) => S(c, `<path d="M32 8v32M20 28l12 12 12-12"/><path d="M10 46v8h44v-8"/>`),
  refresh: (c) => S(c, `<path d="M14 30a18 18 0 0 1 32-11l4 4"/><path d="M50 13v10H40"/><path d="M50 34a18 18 0 0 1-32 11l-4-4"/><path d="M14 51V41h10"/>`),
  mail: (c) => S(c, `<rect x="8" y="14" width="48" height="36" rx="4"/><path d="M8 18l24 18 24-18"/>`),
  chip: (c) => S(c, `<rect x="16" y="16" width="32" height="32" rx="4"/><path d="M24 8v8M32 8v8M40 8v8M24 48v8M32 48v8M40 48v8M8 24h8M8 32h8M8 40h8M48 24h8M48 32h8M48 40h8"/><path d="M26 38l6-12 6 12M28 34h8"/>`, 3),
  book: (c) => S(c, `<path d="M10 12h16a6 6 0 0 1 6 6v36a5 5 0 0 0-5-5H10z"/><path d="M54 12H38a6 6 0 0 0-6 6v36a5 5 0 0 1 5-5h17z"/>`),
  chart: (c) => S(c, `<path d="M10 54h44"/><rect x="14" y="34" width="8" height="18"/><rect x="28" y="22" width="8" height="30"/><rect x="42" y="12" width="8" height="40"/>`),
  flask: (c) => S(c, `<path d="M24 8h16M27 8v18L12 52a4 4 0 0 0 4 6h32a4 4 0 0 0 4-6L37 26V8"/><path d="M18 42h28"/>`),
  brief: (c) => S(c, `<rect x="8" y="20" width="48" height="32" rx="4"/><path d="M24 20v-6h16v6M8 32h48"/>`),
  pen: (c) => S(c, `<path d="M14 50l4-14 26-26 10 10-26 26z"/><path d="M38 16l10 10"/>`),
  plus: (c) => S(c, `<path d="M32 12v40M12 32h40"/>`, 6),
  id: (c) => S(c, `<rect x="6" y="14" width="52" height="36" rx="5"/><circle cx="22" cy="30" r="6"/><path d="M12 44c2-5 6-7 10-7s8 2 10 7M38 26h12M38 34h12"/>`),
  thumb: (c) => S(c, `<path d="M20 28v26H10V28zM20 28l10-20c5 0 7 4 6 8l-2 10h16a5 5 0 0 1 5 6l-4 16a6 6 0 0 1-6 6H20"/>`),
  comment: (c) => S(c, `<path d="M8 12h48v32H26l-12 10V44H8z"/><circle cx="22" cy="28" r="2" fill="${c}"/><circle cx="32" cy="28" r="2" fill="${c}"/><circle cx="42" cy="28" r="2" fill="${c}"/>`),
  bolt: (c) => S(c, `<path d="M36 6L14 36h16l-4 22 22-30H32z" fill="${c}" stroke-width="2"/>`),
  trash: (c) => S(c, `<path d="M12 18h40M26 18v-6h12v6M16 18l3 36h26l3-36"/><path d="M27 28v16M37 28v16"/>`),
};

const C = { coral: '#ef8a6f', mint: '#4fb489', lav: '#9a8be6', sky: '#6aa3e6', pink: '#e8708f', yellow: '#e7a92c', ink: '#34314a', navy: '#1f2747' };
const BG = { peach: '#ffe6dc', mint: '#dcf3e8', lav: '#ebe6ff', sky: '#e2eeff', pink: '#ffe3ea', yellow: '#fff1cc' };

const ico = (id, name, color, bg, cls = '') => `<div id="${id}" class="ico ${cls}" style="background:${bg}">${ICON[name](color)}</div>`;
const pill = (id, txt, dot = C.coral, cls = '') => `<div id="${id}" class="pill ${cls}"><span class="pdot" style="background:${dot}"></span><span>${txt}</span></div>`;
const ok = (id, txt, cls = '') => `<div id="${id}" class="okpill ${cls}"><span class="okc">${ICON.check('#ffffff')}</span><span>${txt}</span></div>`;
const no = (id, txt, cls = '') => `<div id="${id}" class="okpill nopill ${cls}"><span class="okc">${ICON.x('#ffffff')}</span><span>${txt}</span></div>`;
const hl = (txt, color = 'var(--hl-y)') => `<span class="hl" style="--hlc:${color}">${txt}</span>`;
const arrowR = (id, cls = '') => `<svg id="${id}" class="arrow ${cls}" viewBox="0 0 120 24" fill="none" stroke="#5b5873" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M4 12h108M98 2l14 10-14 10"/></svg>`;
const applogo = (id, cls = '') => `<div id="${id}" class="applogo ${cls}"><span>Φ</span></div>`;
const f = (t) => t.toFixed(2);

// ---------- graphics -------------------------------------------------------
// { id, s, e, html, anim, layer } — 'full' = 덮는 구간 장면, 'ov' = 실습 화면 위 카드, 'pop' = 실습 중 임팩트 팝
const G = [];
const add = (g) => G.push({ layer: 'ov', ...g });

// ============ 1. 인트로 (0 ~ 145.39) ==========================================
add({ id: 'i-title', layer: 'full', s: 0, e: 7.3, html: `
  <div id="it-ph" class="phwrap"><img id="it-img" class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="it-c" class="card titlecard">
    ${pill('it-k', '필로소피 AI 교육 · 교수님들을 위한', C.coral, 'pill-soft')}
    <h1 id="it-h" class="h1 center">${hl('로컬 AI', 'var(--hl-m)')} 사용법</h1>
    <div id="it-app" class="appchip">${applogo('it-lg', 'sm')}<b>필로소피 로컬 AI</b><span>앱으로 시작하기</span></div>
    <div id="it-sv" class="survey">${ico('it-si', 'doc', C.sky, BG.sky, 'xxs')}<span>AI 교육 전 <b>설문조사</b> — 어떤 고민이 있으세요?</span></div>
  </div>`, anim: `
  tl.fromTo('#it-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, .15);
  rise('#it-c', .3); up('#it-k', .55, 16); up('#it-h', .7, 34); sweep('#it-h .hl', 1.3);
  pop('#it-app', 1.6); up('#it-sv', 2.8, 20);` });

add({ id: 'i-worry', layer: 'full', s: 7.3, e: 14.7, html: `
  <div class="center-col" style="top:120px">${pill('iw-k', '자주 나오는 고민', C.pink, 'pill-soft')}</div>
  <div id="iw-c" class="card quote">
    <div class="qmark">“</div>
    <div class="qrow2">${ico('iw-i', 'lock', '#ffffff', C.pink, 'sm')}
      <div class="qbody" id="iw-b">AI에 <span class="red">개인정보</span>를 넣지 못해서<br>쓰고 싶어도 ${hl('쓸 수 없어요', 'var(--hl-p)')}</div>
    </div>
  </div>`, anim: `
  up('#iw-k', 7.45, 16); rise('#iw-c', 8.0); pop('#iw-i', 8.9); sweep('#iw-b .hl', 12.0);
  tl.fromTo('#iw-i', {rotation:0}, {rotation:-10, duration:.18, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, 10.0);` });

const DOCS = [['school', '학교 내부 자료', 22.0, C.sky, BG.sky, 'brief'], ['stud', '학생 개인정보', 24.4, C.pink, BG.pink, 'id'], ['res', '교수님 연구 자료', 25.6, C.mint, BG.mint, 'flask']];
add({ id: 'i-cloud', layer: 'full', s: 14.7, e: 27.5, html: `
  <div class="center-col" style="top:90px">
    <h2 id="ic-h" class="h2">교수님 자료 대부분은<br>${hl('클라우드 AI에 주기 어려워요', 'var(--hl-y)')}</h2>
  </div>
  <div class="cloudrow">
    <div class="doccol">${DOCS.map(([k, t, , c, b, ic]) => `<div id="ic-d-${k}" class="card docc">${ico(`ic-di-${k}`, ic, c, b, 'xs')}<span>${t}</span></div>`).join('')}</div>
    <div class="blockwrap">${arrowR('ic-ar', 'arrow-lg')}<div id="ic-x" class="bigx">${ICON.x('#ffffff')}</div></div>
    <div id="ic-cl" class="card cloudbox">
      <div class="cloudico">${ICON.cloud('#9a8be6')}</div>
      <div class="cloudl">클라우드 AI</div>
      <div class="cchips"><span id="ic-a0" class="cchip">ChatGPT</span><span id="ic-a1" class="cchip">Claude</span><span id="ic-a2" class="cchip">Gemini</span></div>
    </div>
  </div>`, anim: `
  up('#ic-h', 14.85, 30); sweep('#ic-h .hl', 20.0);
  rise('#ic-cl', 16.4); pop('#ic-a0', 17.6); pop('#ic-a1', 19.1); pop('#ic-a2', 19.8);
  ${DOCS.map(([k, , t]) => `slide('#ic-d-${k}', ${f(t)}, -60);`).join(' ')}
  draw('#ic-ar path', 26.0, .4); pop('#ic-x', 26.5);` });

add({ id: 'i-want', layer: 'full', s: 27.5, e: 35.0, html: `
  <div class="center-col" style="top:150px">
    <h2 id="iv-h" class="h2">정말 도움받고 싶은 일은<br>${hl('AI에 넣을 수 없는 자료', 'var(--hl-p)')}로 하는 일</h2>
  </div>
  <div class="verbs">
    <div id="iv-0" class="card verb">${ico('iv-i0', 'folder', C.yellow, BG.yellow)}<b>정리</b></div>
    <div id="iv-1" class="card verb">${ico('iv-i1', 'pen', C.coral, BG.peach)}<b>수정</b></div>
    <div id="iv-2" class="card verb">${ico('iv-i2', 'sparkle', C.lav, BG.lav)}<b>새로 만들기</b></div>
  </div>`, anim: `
  up('#iv-h', 27.65, 30); sweep('#iv-h .hl', 30.2);
  rise('#iv-0', 31.8); rise('#iv-1', 32.5); rise('#iv-2', 33.3);` });

add({ id: 'i-local', layer: 'full', s: 35.0, e: 48.0, html: `
  <div class="center-col" style="top:90px">
    ${pill('il-k', '해법', C.mint, 'pill-soft')}
    <h1 id="il-h" class="h1 center">${hl('로컬 AI', 'var(--hl-m)')}</h1>
  </div>
  <div id="il-pc" class="pcbig">
    <div class="pcscreen">${ico('il-ai', 'sparkle', C.mint, BG.mint)}<div class="pcl">내 컴퓨터 안에서 돌아가는 AI</div></div>
    <div class="pcneck"></div><div class="pcbase"></div>
  </div>
  <div id="il-f0" class="card feat" style="left:150px;top:560px">${ico('il-fi0', 'wifioff', '#ffffff', C.sky, 'xs')}<span>인터넷 연결 <b>없이도</b></span></div>
  <div id="il-f1" class="card feat" style="left:1330px;top:560px">${ico('il-fi1', 'shield', '#ffffff', C.mint, 'xs')}<span>외부로 정보를<br><b>보내지 않아요</b></span></div>`, anim: `
  up('#il-k', 35.2, 16); up('#il-h', 36.8, 34); sweep('#il-h .hl', 37.5);
  rise('#il-pc', 39.9); pop('#il-ai', 40.4);
  slide('#il-f0', 40.9, -60); slide('#il-f1', 45.0, 60);` });

add({ id: 'i-safe', layer: 'full', s: 48.0, e: 55.1, html: `
  <div class="center-col" style="top:130px">
    <h2 id="is-h" class="h2">외부로 보내지 않으니까<br>${hl('보안 측면에서 더 나아요', 'var(--hl-m)')}</h2>
  </div>
  <div id="is-b" class="card bars">
    <div class="bhead">보안</div>
    <div class="brow"><span class="bl">클라우드 AI</span><span class="btrack"><span id="is-f0" class="bfill" style="background:#c9c3dc"></span></span><span class="bnote">ChatGPT · Claude · Gemini</span></div>
    <div class="brow"><span class="bl"><b>로컬 AI</b></span><span class="btrack"><span id="is-f1" class="bfill" style="background:linear-gradient(90deg,#8de0bb,#3fa877)"></span></span><span id="is-ok" class="bmax">더 안전</span></div>
  </div>`, anim: `
  up('#is-h', 48.15, 30); sweep('#is-h .hl', 50.0);
  rise('#is-b', 49.9); fill('#is-f0', 51.0, 45); fill('#is-f1', 52.4, 92); pop('#is-ok', 53.6);` });

const HURD = [['chip', '컴퓨터 성능', 56.6, C.sky, BG.sky], ['download', '이것저것 다운로드', 58.6, C.yellow, BG.yellow], ['key', '초기 세팅', 64.8, C.coral, BG.peach]];
add({ id: 'i-hurdle', layer: 'full', s: 55.1, e: 67.6, html: `
  <div class="center-col" style="top:120px">
    <h2 id="ih-h" class="h2">좋지만… 시작하기가 ${hl('조금 어려워요', 'var(--hl-y)')}</h2>
  </div>
  <div class="verbs" style="top:420px">${HURD.map(([ic, t, , c, b], i) => `<div id="ih-${i}" class="card verb">${ico(`ih-i${i}`, ic, c, b)}<b>${t}</b><span id="ih-w${i}" class="wtag">${ICON.warn('#c4486c')}</span></div>`).join('')}</div>`, anim: `
  up('#ih-h', 55.3, 30); sweep('#ih-h .hl', 61.5);
  ${HURD.map(([, , t], i) => `rise('#ih-${i}', ${f(t)}); pop('#ih-w${i}', ${f(t + 0.5)});`).join(' ')}` });

const ROUTE = [['comment', '유튜브 고정 댓글', 74.0], ['chat', '네이버 카페', 71.4], ['pc', '홈페이지', 72.4], ['download', '앱 다운로드', 76.6]];
add({ id: 'i-app', layer: 'full', s: 67.6, e: 80.0, html: `
  <div id="ia-c" class="card appcard">
    ${applogo('ia-lg')}
    <div class="appt"><span id="ia-k">그래서 교수님들을 위해 만들었어요</span><b id="ia-n">필로소피 로컬 AI</b></div>
  </div>
  <div class="route">${[ROUTE[0], ROUTE[1], ROUTE[2], ROUTE[3]].map(([ic, t], i) => `${i ? arrowR(`ia-a${i}`, 'arrow-sm') : ''}<div id="ia-r${i}" class="card rstep">${ico(`ia-ri${i}`, ic, i === 3 ? '#ffffff' : C.lav, i === 3 ? C.mint : BG.lav, 'xs')}<span>${t}</span></div>`).join('')}</div>`, anim: `
  rise('#ia-c', 67.75); pop('#ia-lg', 68.0); up('#ia-k', 68.2, 14); up('#ia-n', 68.6, 24); confetti('ia', 69.0);
  pop('#ia-r1', 71.4); draw('#ia-a2 path', 72.2, .3); pop('#ia-r2', 72.5);
  tl.fromTo('#ia-r0', {opacity:0, x:-40}, {opacity:1, x:0, duration:.5, ease:'power3.out'}, 74.1); draw('#ia-a1 path', 74.5, .3);
  draw('#ia-a3 path', 76.4, .3); pop('#ia-r3', 76.7);` });

add({ id: 'i-inside', layer: 'full', s: 80.0, e: 94.5, html: `
  <div class="center-col" style="top:80px">
    <h2 id="in-h" class="h2">필로소피 로컬 AI 안에는</h2>
  </div>
  <div class="stack">
    <div id="in-l0" class="layer l-app">${applogo('in-lg', 'sm')}<b>필로소피 로컬 AI</b><span>쉽게 쓰는 앱 화면</span></div>
    <div id="in-l1" class="layer l-model"><span class="ltag">공개 AI 모델</span><span id="in-m0" class="mchip">Qwen</span><span id="in-m1" class="mchip">Gemma</span></div>
    <div id="in-l2" class="layer l-eng"><span class="ltag">실행 엔진</span><b>Ollama</b></div>
  </div>
  <div class="sidechips">
    ${ok('in-o0', '교수님 컴퓨터에 설치')}
    ${ok('in-o1', '업데이트도 앱에서')}
  </div>`, anim: `
  up('#in-h', 80.15, 26);
  rise('#in-l0', 80.6); rise('#in-l1', 81.4); pop('#in-m0', 82.0); pop('#in-m1', 83.4); rise('#in-l2', 84.6);
  slide('#in-o0', 88.7, 50); slide('#in-o1', 91.4, 50);` });

const SAFE = [['chat', '질문·대화가 <b>외부로 나가지 않아요</b>', 94.7], ['wifioff', '인터넷이 <b>끊겨도 작동</b>해요', 98.7], ['download', '인터넷은 <b>AI 내려받기 · 업데이트</b> 때만', 103.2], ['lock', '기록은 <b>암호화</b> · 잠금 암호로 앱 잠금', 109.6]];
add({ id: 'i-sec', layer: 'full', s: 94.5, e: 115.0, html: `
  <div id="isc-c" class="card listcard">
    ${pill('isc-k', '내 자료는 내 컴퓨터 안에', C.mint, 'pill-soft')}
    <div class="plist">${SAFE.map(([ic, t], i) => `<div id="isc-${i}" class="pro">${ico(`isc-i${i}`, ic, '#ffffff', [C.sky, C.lav, C.yellow, C.mint][i], 'xs')}<span class="ptxt">${t}</span><span id="isc-t${i}" class="tick">${ICON.check('#ffffff')}</span></div>`).join('')}</div>
  </div>`, anim: `
  rise('#isc-c', 94.6); up('#isc-k', 94.8, 14);
  ${SAFE.map(([, , t], i) => `slide('#isc-${i}', ${f(t)}, -40); pop('#isc-t${i}', ${f(t + 1.2)});`).join(' ')}` });

add({ id: 'i-out', layer: 'full', s: 115.0, e: 123.0, html: `
  <div class="center-col" style="top:110px">
    ${pill('io-k', '하나만 기억해 주세요', C.pink, 'pill-soft')}
    <h2 id="io-h" class="h2">앱 밖으로 내보낸 파일은 ${hl('보호 밖', 'var(--hl-p)')}이에요</h2>
  </div>
  <div class="outrow">
    <div id="io-in" class="card shieldbox">${ico('io-si', 'shield', '#ffffff', C.mint)}<b>앱 안</b><span>암호화로 보호</span></div>
    ${arrowR('io-a', 'arrow-lg')}
    <div id="io-f" class="card filebox">
      <div class="frow"><span id="io-f0" class="fchip">복사 · 캡처</span><span id="io-f1" class="fchip">${ICON.mail('#2d6b51')}메일 · 메신저</span></div>
      <b id="io-w" class="warnbig">${ICON.warn('#c4486c')}보호 밖</b>
    </div>
  </div>`, anim: `
  up('#io-k', 115.2, 14); up('#io-h', 115.5, 28); sweep('#io-h .hl', 120.6);
  rise('#io-in', 116.0); pop('#io-si', 116.3); draw('#io-a path', 117.2, .4);
  rise('#io-f', 117.6); pop('#io-f0', 117.9); pop('#io-f1', 118.5); pop('#io-w', 120.5);` });

const TIPS = [['brief', '학교 규정 확인 ·<br><b>필요한 만큼만</b>', 123.1, C.sky, BG.sky], ['id', '주민등록번호 등<br><b>민감정보는 피하기</b>', 129.0, C.pink, BG.pink], ['user', '학생 이름은<br><b>조금씩 바꿔서</b>', 133.9, C.lav, BG.lav]];
add({ id: 'i-tips', layer: 'full', s: 123.0, e: 142.1, html: `
  <div class="center-col" style="top:100px">
    <h2 id="ip-h" class="h2">학생 정보는 이렇게 넣어 주세요</h2>
  </div>
  <div class="tips">${TIPS.map(([ic, t, , c, b], i) => `<div id="ip-${i}" class="card tip"><span class="tnum">${i + 1}</span>${ico(`ip-i${i}`, ic, c, b)}<div class="tt">${t}</div></div>`).join('')}</div>
  <div id="ip-end" class="endrib">${ICON.shield('#ffffff')}<span>조심하면서 쓰면 좋아요</span></div>`, anim: `
  up('#ip-h', 123.2, 28);
  ${TIPS.map(([, , t], i) => `rise('#ip-${i}', ${f(t)}); pop('#ip-i${i}', ${f(t + 0.25)});`).join(' ')}
  pop('#ip-end', 138.6);` });

add({ id: 'i-go', layer: 'full', s: 142.1, e: O2, html: `
  <div class="center-col" style="top:330px">
    ${ico('ig-i', 'play', '#ffffff', C.coral)}
    <div id="ig-h" class="h1 center">실습으로 볼까요?</div>
  </div>`, anim: `pop('#ig-i', 142.2); up('#ig-h', 142.5, 30);` });

// ============ 2. 실습 (O2 ~ O3) — 실습 화면 위주, 중요한 순간만 =====================
// 'side' = 오른쪽 위 작은 카드 (웹사이트·앱 화면 오른쪽 여백). 'pop' = 화면 가운데 짧은 임팩트.
add({ id: 'p-url', s: P(8.0), e: P(36.0), html: `
  <div id="pu-c" class="ovc side">
    ${pill('pu-k', '접속 주소', C.coral, 'pill-soft pill-sm')}
    <div id="pu-u" class="urlbox">philolocalai<br>.netlify.app</div>
    <div id="pu-r" class="flow"><span class="fnum">${ICON.comment('#7d62c0')}</span><span>유튜브 <b>고정 댓글</b> → 네이버 카페</span></div>
    <div id="pu-d" class="dlbtn">${ICON.download('#ffffff')}<span>설치 파일 내려받기</span></div>
  </div>`, anim: `rise('#pu-c', ${f(P(8.1))}); up('#pu-k', ${f(P(8.3))}, 12); pop('#pu-u', ${f(P(8.6))});
  up('#pu-r', ${f(P(14.6))}, 14); pop('#pu-d', ${f(P(29.8))});` });

const FEAT = [['sparkle', '내 컴퓨터에 맞는 <b>AI 추천</b>', 55.3, '메모리 · 그래픽 · 저장 공간 자동 확인', 61.6], ['lock', '비밀번호로 <b>앱 잠금</b>', 84.1, '다른 사람이 못 보게', 88.4], ['refresh', '앱 안에서 <b>업데이트</b>', 95.8, '새 버전이 나오면 바로', 98.0]];
add({ id: 'p-feat', s: P(55.2), e: P(105.0), html: `
  <div id="pf-c" class="ovc side">
    ${pill('pf-k', '이 앱의 특징', C.lav, 'pill-soft pill-sm')}
    ${FEAT.map(([ic, t, , sub], i) => `<div id="pf-${i}" class="frow2">${ico(`pf-i${i}`, ic, '#ffffff', [C.lav, C.pink, C.mint][i], 'xxs')}<div class="ftx"><span>${t}</span><small id="pf-s${i}">${sub}</small></div></div>`).join('')}
  </div>`, anim: `rise('#pf-c', ${f(P(55.3))}); up('#pf-k', ${f(P(55.5))}, 12);
  ${FEAT.map(([, , t, , t2], i) => `slide('#pf-${i}', ${f(P(t))}, 30); up('#pf-s${i}', ${f(P(t2))}, 8);`).join(' ')}` });

const CAN = [['chat', 'AI와 대화', 110.3], ['book', '강의 자료 분석', 111.9], ['user', '학생 상담 기록', 115.0], ['flask', '연구 자료 분석', 119.7], ['brief', '행정 업무', 121.2], ['chart', 'Excel 데이터 분석', 122.9]];
add({ id: 'p-can', s: P(105.4), e: P(133.0), html: `
  <div id="pc-c" class="ovc side">
    ${pill('pc-k', '할 수 있는 일', C.mint, 'pill-soft pill-sm')}
    <div class="cangrid">${CAN.map(([ic, t], i) => `<div id="pc-${i}" class="canitem">${ICON[ic](C.ink)}<span>${t}</span></div>`).join('')}</div>
    <div id="pc-os" class="osrow"><span class="os win">Windows</span><span class="os">Mac</span><span>둘 다 OK</span></div>
  </div>`, anim: `rise('#pc-c', ${f(P(105.5))}); up('#pc-k', ${f(P(105.7))}, 12);
  ${CAN.map(([, , t], i) => `pop('#pc-${i}', ${f(P(t))});`).join(' ')} up('#pc-os', ${f(P(128.6))}, 10);` });

const SPEC = [['Windows 11', '운영체제', 172.6], ['96GB', '메모리', 180.0], ['RTX 4060', '그래픽', 184.2], ['140GB 남음', '저장 공간', 186.8]];
add({ id: 'p-spec', s: P(166.9), e: P(194.6), html: `
  <div id="ps-c" class="ovc side">
    <div class="stephead"><span class="stepn">STEP 1</span><span class="stept">컴퓨터 확인</span></div>
    <div class="ovs2">앱이 <b>자동으로</b> 확인해요</div>
    ${SPEC.map(([v, k], i) => `<div id="ps-${i}" class="specrow"><span class="sk">${k}</span><b>${v}</b></div>`).join('')}
  </div>`, anim: `rise('#ps-c', ${f(P(167.0))});
  ${SPEC.map(([, , t], i) => `slide('#ps-${i}', ${f(P(t))}, 30);`).join(' ')}` });

const REC = [['Qwen3 4B', '가벼움', 197.5, ''], ['Qwen3 8B', '균형 · 추천', 202.2, 'pick'], ['Gemma3 27B', '고성능 · 느릴 수 있음', 205.3, '']];
add({ id: 'p-rec', s: P(194.9), e: P(239.6), html: `
  <div id="pr-c" class="ovc side">
    <div class="stephead"><span class="stepn">STEP 2</span><span class="stept">AI 추천 받기</span></div>
    ${REC.map(([m, d, , cls], i) => `<div id="pr-${i}" class="recrow ${cls}"><code>${m}</code><span>${d}</span></div>`).join('')}
    ${ok('pr-ok', 'Qwen3 8B 다운로드!', 'ok-xs')}
  </div>`, anim: `rise('#pr-c', ${f(P(195.0))});
  ${REC.map(([, , t], i) => `slide('#pr-${i}', ${f(P(t))}, 30);`).join(' ')}
  tl.to('#pr-1', {backgroundColor:'#e3f6ec', boxShadow:'inset 0 0 0 3px #3fa877', scale:1.04, duration:.4, ease:'back.out(2)'}, ${f(P(213.6))});
  pop('#pr-ok', ${f(P(214.2))});` });

const INST = [['Ollama', '실행 엔진', 249.1], ['Qwen3 8B', 'AI 모델', 256.4], ['테스트', '잘 되는지 확인', 259.5], ['사용 시작', '', 264.3]];
add({ id: 'p-inst', s: P(240.2), e: P(270.0), html: `
  <div id="pi-c" class="ovc side">
    <div class="stephead"><span class="stepn">STEP 3</span><span class="stept">설치</span></div>
    ${INST.map(([a, b], i) => `<div id="pi-${i}" class="flow"><span class="fnum">${i + 1}</span><span><b>${a}</b> ${b}</span><span id="pi-t${i}" class="tick sm">${ICON.check('#ffffff')}</span></div>`).join('')}
  </div>`, anim: `rise('#pi-c', ${f(P(240.3))});
  ${INST.map(([, , t], i) => `slide('#pi-${i}', ${f(P(t))}, 30); pop('#pi-t${i}', ${f(P(t + 1.4))});`).join(' ')}` });

// ---- 임팩트: 인터넷을 끊는다 -----
add({ id: 'p-off', layer: 'pop', s: P(321.6), e: P(327.4), html: `
  <div id="po-c" class="card impact">
    <div id="po-i" class="imico" style="background:#e0607f">${ICON.wifioff('#ffffff')}</div>
    <div class="imtx"><small>랜선을 뽑았어요</small><b>인터넷 <span class="red">OFF</span></b></div>
  </div>`, anim: `tl.fromTo('#po-c', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.8)'}, ${f(P(321.7))});
  tl.fromTo('#po-i', {rotation:0}, {rotation:12, duration:.15, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(P(322.4))});` });

add({ id: 'p-offb', s: P(327.4), e: P(446.2), html: `
  <div id="pob" class="offbadge">${ICON.wifioff('#ffffff')}<span>인터넷 끊긴 상태</span></div>`, anim: `pop('#pob', ${f(P(327.5))});` });

add({ id: 'p-done', layer: 'pop', s: P(431.8), e: P(436.4), html: `
  <div id="pd-c" class="card impact">
    <div id="pd-i" class="imico" style="background:#3fa877">${ICON.check('#ffffff')}</div>
    <div class="imtx"><small>인터넷 없이도</small><b>답이 <span class="grn">나왔어요!</span></b></div>
  </div>`, anim: `tl.fromTo('#pd-c', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.8)'}, ${f(P(431.9))}); confetti('pd', ${f(P(432.3))});` });

const PPT = [['PPT 10장 · 2,374자', 469.6], ['강의 자료 요약', 473.6], ['핵심 개념 추출', 477.5]];
add({ id: 'p-ppt', s: P(465.1), e: P(492.0), html: `
  <div id="pp-c" class="ovc side">
    ${pill('pp-k', '강의 자료 분석', C.sky, 'pill-soft pill-sm')}
    ${PPT.map(([t], i) => `<div id="pp-${i}" class="flow"><span class="fnum">${i + 1}</span><span>${t}</span></div>`).join('')}
    ${ok('pp-ok', '인터넷 없이 빠르게', 'ok-xs')}
  </div>`, anim: `rise('#pp-c', ${f(P(465.2))}); up('#pp-k', ${f(P(465.4))}, 12);
  ${PPT.map(([, t], i) => `slide('#pp-${i}', ${f(P(t))}, 30);`).join(' ')} pop('#pp-ok', ${f(P(484.3))});` });

add({ id: 'p-name', s: P(541.7), e: P(556.0), html: `
  <div id="pn-c" class="ovc side warnc">
    <div class="ovhead">${ico('pn-i', 'user', '#ffffff', C.pink, 'xxs')}<span class="stept">학생 이름은</span></div>
    <div class="namefx"><span id="pn-a" class="nm real">실명</span><span class="cg">→</span><span id="pn-b" class="nm alias">학생 A</span></div>
    <div id="pn-s" class="ovs2">교수님만 아는 <b>별칭</b>으로</div>
  </div>`, anim: `rise('#pn-c', ${f(P(541.8))}); pop('#pn-a', ${f(P(542.4))});
  tl.to('#pn-a', {opacity:.35, textDecoration:'line-through', duration:.3}, ${f(P(544.4))}); pop('#pn-b', ${f(P(544.7))}); up('#pn-s', ${f(P(546.6))}, 10);` });

add({ id: 'p-res', s: P(619.8), e: P(641.5), html: `
  <div id="pq-c" class="ovc side">
    ${pill('pq-k', '연구 자료 분석', C.mint, 'pill-soft pill-sm')}
    <div id="pq-f" class="flow"><span class="fnum">${ICON.doc('#7d62c0')}</span><span>연구 자료 <b>1,910자</b></span></div>
    <div id="pq-g" class="flow"><span class="fnum">${ICON.pen('#7d62c0')}</span><span><b>연구 보고서 초안</b></span></div>
    <div id="pq-s" class="speed">${ICON.bolt('#e7a92c')}<span>답 속도가 <b>놀라워요</b></span></div>
  </div>`, anim: `rise('#pq-c', ${f(P(619.9))}); up('#pq-k', ${f(P(620.1))}, 12); slide('#pq-f', ${f(P(620.4))}, 30); slide('#pq-g', ${f(P(623.0))}, 30); pop('#pq-s', ${f(P(628.6))});` });

add({ id: 'p-adm', s: P(663.0), e: P(676.0), html: `
  <div id="pa-c" class="ovc side">
    ${pill('pa-k', '행정 업무 도우미', C.yellow, 'pill-soft pill-sm')}
    <div id="pa-f" class="flow"><span class="fnum">${ICON.brief('#7d62c0')}</span><span>학과 회의 → <b>회의록 요약</b></span></div>
  </div>`, anim: `rise('#pa-c', ${f(P(663.1))}); up('#pa-k', ${f(P(663.3))}, 12); slide('#pa-f', ${f(P(666.3))}, 30);` });

add({ id: 'p-xls', s: P(691.0), e: P(713.0), html: `
  <div id="px-c" class="ovc side">
    ${pill('px-k', 'Excel 데이터 분석', C.mint, 'pill-soft pill-sm')}
    <div id="px-f" class="flow"><span class="fnum">${ICON.chart('#7d62c0')}</span><span>가상 성적 데이터 <b>48명</b></span></div>
    <div id="px-g" class="flow"><span class="fnum">${ICON.doc('#7d62c0')}</span><span><b>분석 결과 보고서</b></span></div>
  </div>`, anim: `rise('#px-c', ${f(P(691.1))}); up('#px-k', ${f(P(691.3))}, 12); slide('#px-f', ${f(P(694.3))}, 30); slide('#px-g', ${f(P(699.9))}, 30);` });

add({ id: 'p-why', layer: 'pop', s: P(714.6), e: P(723.2), html: `
  <div id="pw-c" class="card impact wide">
    <div class="whyrow">
      <div id="pw-a" class="whyc"><span class="cchip">Claude</span><span class="cchip">ChatGPT</span><small>에 주기 어려운 데이터</small></div>
      ${arrowR('pw-ar', 'arrow-lg')}
      <div id="pw-b" class="whyc on">${ICON.pc('#2d6b51')}<b>로컬 AI로 분석</b></div>
    </div>
    <div id="pw-t" class="whyt">이게 바로 <span class="hl" style="--hlc:var(--hl-m)">로컬 AI를 쓰는 이유</span></div>
  </div>`, anim: `tl.fromTo('#pw-c', {opacity:0, scale:.6}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.6)'}, ${f(P(714.7))});
  pop('#pw-a', ${f(P(715.0))}); draw('#pw-ar path', ${f(P(717.4))}, .4); pop('#pw-b', ${f(P(717.8))}); up('#pw-t', ${f(P(719.0))}, 14); sweep('#pw-t .hl', ${f(P(719.6))});` });

add({ id: 'p-noname', s: P(734.7), e: P(747.0), html: `
  <div id="pk-c" class="ovc side warnc">
    <div class="ovhead">${ico('pk-i', 'warn', '#ffffff', C.pink, 'xxs')}<span class="stept">이름은 빼고</span></div>
    <div id="pk-s" class="ovs2">로컬 AI가 더 안전해도<br><b>조심할수록 좋아요</b></div>
  </div>`, anim: `rise('#pk-c', ${f(P(734.8))}); up('#pk-s', ${f(P(738.6))}, 10);` });

add({ id: 'p-model', s: P(762.7), e: P(795.0), html: `
  <div id="pm-c" class="ovc side">
    ${pill('pm-k', '앱 메뉴 둘러보기', C.lav, 'pill-soft pill-sm')}
    <div id="pm-0" class="flow"><span class="fnum">${ICON.chip('#7d62c0')}</span><span><b>내 AI 모델 관리</b><br><small class="sm2">용도별 AI 추천</small></span></div>
    <div id="pm-1" class="flow"><span class="fnum">${ICON.shield('#7d62c0')}</span><span><b>개인정보 보호 설정</b><br><small class="sm2">한 번씩 꼭 읽어 보세요</small></span></div>
  </div>`, anim: `rise('#pm-c', ${f(P(762.8))}); up('#pm-k', ${f(P(763.0))}, 12); slide('#pm-0', ${f(P(763.2))}, 30); slide('#pm-1', ${f(P(781.4))}, 30);` });

add({ id: 'p-upd', s: P(803.3), e: P(841.0), html: `
  <div id="pg-c" class="ovc side">
    <div class="ovhead">${ico('pg-i', 'refresh', '#ffffff', C.mint, 'xxs')}<span class="stept">앱 업데이트</span></div>
    <div id="pg-b" class="dlbtn">${ICON.download('#ffffff')}<span>업데이트 확인하기</span></div>
    <div id="pg-s" class="ovs2"><b>가끔씩</b> 눌러 보세요<br>새 버전이 있으면 설치 → 앱이 바뀌어요</div>
  </div>`, anim: `rise('#pg-c', ${f(P(803.4))}); pop('#pg-b', ${f(P(807.6))}); up('#pg-s', ${f(P(818.8))}, 10);
  tl.fromTo('#pg-i', {rotation:0}, {rotation:360, duration:1.2, ease:'power2.inOut', immediateRender:false}, ${f(P(830.7))});` });

const RULES = [['소속 대학 규정 확인', 874.9], ['보안 점검 모두 초록색', 878.4], ['꼭 필요한 정보만', 882.2], ['내보낸 파일 잘 관리', 887.1], ['다 쓰면 바로 지우기', 894.8]];
add({ id: 'p-rules', s: P(859.5), e: P(904.5), html: `
  <div id="pl-c" class="ovc side">
    <div class="ovhead">${ico('pl-i', 'shield', '#ffffff', C.mint, 'xxs')}<span class="stept sm">학생 정보 넣을 때</span></div>
    <div id="pl-n" class="ovs2">앱이 안전해도 <b>처리 허용은 아니에요</b></div>
    ${RULES.map(([t], i) => `<div id="pl-${i}" class="flow"><span class="fnum">${i + 1}</span><span>${t}</span></div>`).join('')}
  </div>`, anim: `rise('#pl-c', ${f(P(859.6))}); up('#pl-n', ${f(P(868.9))}, 10);
  ${RULES.map(([, t], i) => `slide('#pl-${i}', ${f(P(t))}, 30);`).join(' ')}` });

add({ id: 'p-lock', s: P(905.0), e: P(919.0), html: `
  <div id="pz-c" class="ovc side">
    <div class="ovhead">${ico('pz-i', 'lock', '#ffffff', C.navy, 'xxs')}<span class="stept">지금 잠그기</span></div>
    <div id="pz-s" class="ovs2">암호를 걸어 두고 쓰세요<br>잠금을 풀면 다시 사용</div>
  </div>`, anim: `rise('#pz-c', ${f(P(905.1))}); up('#pz-s', ${f(P(906.5))}, 10);
  tl.fromTo('#pz-i', {rotation:0}, {rotation:-12, duration:.15, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(P(905.8))});` });

add({ id: 'p-idea', s: P(935.6), e: P(949.6), html: `
  <div id="pj-c" class="ovc side">
    <div class="ovhead">${ico('pj-i', 'comment', '#ffffff', C.coral, 'xxs')}<span class="stept">아이디어는 댓글로</span></div>
    <div id="pj-s" class="ovs2">수정 · 기능 제안을 남겨 주시면<br><b>앱에 반영</b>할게요</div>
  </div>`, anim: `rise('#pj-c', ${f(P(935.7))}); up('#pj-s', ${f(P(937.4))}, 10);` });

// ============ 3. 아웃트로 (O3 ~ 끝) ============================================
add({ id: 'q-done', layer: 'full', s: O3, e: Q(9.0), html: `
  <div class="center-col" style="top:110px">
    ${ok('qd-k', '실습 끝!')}
    <h2 id="qd-h" class="h2">로컬 AI를 쓰면<br>${hl('인터넷 연결 없이도', 'var(--hl-m)')} 내 컴퓨터에서 AI를</h2>
  </div>
  <div id="qd-pc" class="pcbig" style="top:500px">
    <div class="pcscreen">${ico('qd-ai', 'sparkle', C.mint, BG.mint)}<div class="pcl">내 컴퓨터 안의 AI</div></div>
    <div class="pcneck"></div><div class="pcbase"></div>
  </div>
  <div id="qd-w" class="card feat" style="left:330px;top:620px">${ico('qd-wi', 'wifioff', '#ffffff', C.sky, 'xs')}<span>인터넷 <b>없이도</b></span></div>`, anim: `
  pop('#qd-k', ${f(Q(0.5))}); up('#qd-h', ${f(Q(2.2))}, 28); sweep('#qd-h .hl', ${f(Q(4.0))});
  rise('#qd-pc', ${f(Q(3.0))}); pop('#qd-ai', ${f(Q(3.4))}); slide('#qd-w', ${f(Q(4.4))}, -50);` });

add({ id: 'q-help', layer: 'full', s: Q(9.0), e: Q(21.0), html: `
  <div class="duo2" style="top:250px">
    <div id="qh-a" class="card dcard">
      ${ico('qh-ai', 'lock', '#ffffff', C.pink)}
      <div class="dt">개인정보 때문에</div>
      <div class="ds">AI를 쓰고 싶어도<br><b>못 쓰셨던</b> 교수님들께</div>
    </div>
    ${arrowR('qh-ar', 'arrow-lg')}
    <div id="qh-b" class="card dcard glow">
      ${applogo('qh-lg')}
      <div class="dt"><b>필로소피 로컬 AI</b></div>
      <div class="ds">도움이 될 수 있어요</div>
    </div>
  </div>`, anim: `
  rise('#qh-a', ${f(Q(9.1))}); pop('#qh-ai', ${f(Q(9.4))});
  draw('#qh-ar path', ${f(Q(15.0))}, .4); rise('#qh-b', ${f(Q(15.3))}); pop('#qh-lg', ${f(Q(15.6))});` });

const RULE2 = [['lock', '잠금 암호 <b>꼭 설정</b>', 26.7], ['user', '학생 정보는 <b>꼭 필요한 만큼만</b>', 29.6], ['id', '실명 대신 <b>별칭</b>', 32.7], ['warn', '주민번호 · 건강정보 <b>넣지 않기</b>', 35.4], ['brief', '학교 <b>개인정보 규정</b> 먼저 확인', 39.9], ['pen', 'AI 답은 <b>초안</b>으로만', 44.6]];
add({ id: 'q-rules', layer: 'full', s: Q(21.0), e: Q(49.2), html: `
  <div id="qr-c" class="card listcard two">
    ${pill('qr-k', '다만, 쓸 때도 조심해 주세요', C.pink, 'pill-soft')}
    <div class="plist grid2">${RULE2.map(([ic, t], i) => `<div id="qr-${i}" class="pro">${ico(`qr-i${i}`, ic, '#ffffff', [C.navy, C.lav, C.sky, C.pink, C.yellow, C.mint][i], 'xs')}<span class="ptxt sm">${t}</span></div>`).join('')}</div>
  </div>`, anim: `
  rise('#qr-c', ${f(Q(21.1))}); up('#qr-k', ${f(Q(21.3))}, 14);
  ${RULE2.map(([, , t], i) => `rise('#qr-${i}', ${f(Q(t))});`).join(' ')}` });

add({ id: 'q-safe', layer: 'full', s: Q(49.2), e: Q(62.1), html: `
  <div id="qs-c" class="card quote" style="top:200px">
    <div class="qmark">“</div>
    <div class="qbody" id="qs-b">내 컴퓨터 안의 AI,<br>${hl('안전하게 잘 활용하세요', 'var(--hl-m)')}</div>
  </div>
  <div id="qs-n" class="card notec">${ico('qs-i', 'comment', '#ffffff', C.coral, 'xs')}<span>의견을 <b>댓글</b>로 남겨 주시면<br>앱을 계속 다듬어 갈게요</span></div>`, anim: `
  rise('#qs-c', ${f(Q(49.3))}); sweep('#qs-b .hl', ${f(Q(50.6))});
  rise('#qs-n', ${f(Q(52.9))}); pop('#qs-i', ${f(Q(53.2))});` });

add({ id: 'q-end', layer: 'full', s: Q(62.1), e: DUR, html: `
  <div id="qe-ph" class="phwrap" style="top:200px"><img class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="qe-c" class="card titlecard" style="top:200px">
    ${pill('qe-k', '필로소피 AI 교육 · 로컬 AI 사용법', C.lav, 'pill-soft')}
    <div id="qe-h" class="h1 center" style="font-size:88px">오늘의 영상<br>여기까지입니다</div>
    <div class="endbtns">
      <div id="qe-l" class="ebtn like">${ICON.thumb('#ffffff')}<span>좋아요</span></div>
      <div id="qe-s" class="ebtn sub">${ICON.bell('#ffffff')}<span>구독</span></div>
    </div>
    <div id="qe-t" class="thanks">감사합니다 ${ICON.heart('#e8708f')}</div>
  </div>`, anim: `
  tl.fromTo('#qe-ph', {opacity:0, y:200}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, ${f(Q(62.2))});
  rise('#qe-c', ${f(Q(62.3))}); up('#qe-k', ${f(Q(62.5))}, 14); up('#qe-h', ${f(Q(62.6))}, 28);
  pop('#qe-l', ${f(Q(63.6))}); pop('#qe-s', ${f(Q(64.4))}); up('#qe-t', ${f(Q(66.5))}, 20);
  tl.to('#qe-l', {scale:1.12, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(Q(65.4))});
  tl.to('#qe-s', {scale:1.12, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(Q(65.9))});` });

// ---------- captions (whole video) ------------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const capHTML = CUES.map((c, i) =>
  `<div id="cap${i}" class="cap clip" data-start="${c.s.toFixed(3)}" data-duration="${Math.max(0.2, c.e - c.s).toFixed(3)}" data-track-index="8"><span>${esc(c.text)}</span></div>`).join('\n');

// ---------- assemble ---------------------------------------------------------
const gHTML = G.map((g) => `
<div id="${g.id}" class="scene ${g.layer} clip" data-start="${g.s.toFixed(3)}" data-duration="${(g.e - g.s).toFixed(3)}" data-track-index="${g.layer === 'full' ? 3 : g.layer === 'pop' ? 5 : 4}">
  <div id="${g.id}-sc" class="sc">${g.html}
  </div>
</div>`).join('\n');

const blobs = (id) => [
  ['#ffd9cb', 760, -160, -220], ['#d8f1e5', 640, 1380, 560], ['#e3dcff', 700, 1300, -260], ['#fff0c2', 520, -120, 640], ['#ffdbe5', 420, 820, 760],
].map(([c, sz, x, y], i) => `<span id="${id}-bl${i}" class="blob" style="width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;background:${c}"></span>`).join('');
const DECO = [['dot', C.coral, 18, 140, 140], ['ring', C.lav, 34, 1740, 120], ['dia', C.mint, 22, 1680, 820], ['dot', C.yellow, 14, 260, 860], ['ring', C.pink, 26, 90, 520], ['dia', C.sky, 18, 1820, 470], ['dot', C.mint, 12, 960, 60]];
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

const gAnim = G.map((g) => {
  const fin = g.layer === 'full' ? .35 : .4, fout = g.layer === 'full' ? .3 : .35;
  return `
  // ${g.id}
  tl.fromTo('#${g.id}-sc', {opacity:0}, {opacity:1, duration:${fin}, ease:'power2.out'}, ${f(g.s)});
  ${g.e < DUR - 0.01 ? `tl.to('#${g.id}-sc', {opacity:0, duration:${fout}, ease:'power2.in'}, ${(g.e - fout - 0.02).toFixed(3)});` : ''}
  ${g.anim.trim()}`;
}).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>로컬 AI 사용법 — 필로소피 로컬 AI</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face { font-family: "Pretendard"; src: url("assets/fonts/PretendardVariable.woff2") format("woff2-variations"); font-weight: 45 920; font-style: normal; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: #fdf6ee; }
:root {
  --ink: #34314a; --ink-soft: #5b5873; --cream: #fdf6ee;
  --hl-y: rgba(255, 220, 120, .85); --hl-m: rgba(140, 222, 190, .75); --hl-p: rgba(248, 180, 200, .8);
}
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Pretendard", sans-serif; color: var(--ink); background: #000; }
#vwrap { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
#vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
#endfade { position: absolute; inset: 0; z-index: 20; background: #000; opacity: 0; pointer-events: none; }

.cover { position: absolute; inset: 0; z-index: 2; }
.cov-in { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(135deg, #fff6ee 0%, #fdf1f4 45%, #f1f0ff 100%); }
.blob { position: absolute; border-radius: 50%; opacity: .75; filter: blur(30px); }
.dc { position: absolute; display: block; }
.dc-dot { border-radius: 50%; background: var(--c); opacity: .75; }
.dc-ring { border-radius: 50%; border: 4px solid var(--c); opacity: .8; }
.dc-dia { background: var(--c); opacity: .7; border-radius: 4px; transform: rotate(45deg); }

/* captions — black box, white text (같은 모양으로 영상 전체) */
.cap { position: absolute; left: 0; right: 0; bottom: 56px; z-index: 9; display: flex; justify-content: center; pointer-events: none; }
.cap span { display: block; max-width: 1500px; padding: 6px 22px 10px; background: #000; color: #fff;
  font-size: 52px; font-weight: 700; line-height: 1.3; text-align: center; word-break: keep-all; letter-spacing: -.01em; }

.scene { position: absolute; inset: 0; }
.scene.full { z-index: 3; }
.scene.ov { z-index: 4; }
.scene.pop { z-index: 5; }
.sc { position: absolute; inset: 0; opacity: 0; }

.card { position: absolute; display: block; background: rgba(255, 255, 255, .95); border: 2px solid #fff; border-radius: 44px;
  box-shadow: 0 30px 70px rgba(80, 60, 70, .2), 0 6px 18px rgba(80, 60, 70, .08); }
.center-col { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 26px; }
.pill { display: inline-flex; align-items: center; gap: 14px; padding: 14px 28px; border-radius: 999px; background: #fff;
  box-shadow: 0 8px 22px rgba(120, 92, 80, .12); font-size: 30px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.pill-soft { background: #fff7ee; box-shadow: inset 0 0 0 2px #f6e8da; }
.pill-sm { font-size: 22px; padding: 8px 18px; gap: 10px; align-self: flex-start; }
.pill-sm .pdot { width: 12px; height: 12px; }
.pdot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; }
.okpill { display: inline-flex; align-items: center; gap: 16px; padding: 14px 30px 14px 16px; border-radius: 999px; background: #e3f6ec;
  font-size: 34px; font-weight: 750; color: #24533f; box-shadow: 0 10px 24px rgba(60, 140, 100, .14); white-space: nowrap; }
.okc { display: block; width: 48px; height: 48px; border-radius: 50%; background: #3fa877; padding: 7px; flex: 0 0 auto; }
.okc svg { display: block; width: 100%; height: 100%; }
.ok-xs { font-size: 22px; padding: 8px 18px 8px 8px; gap: 10px; align-self: flex-start; white-space: normal; }
.ok-xs .okc { width: 34px; height: 34px; padding: 5px; }
.h1 { font-size: 104px; font-weight: 900; line-height: 1.12; letter-spacing: -.035em; word-break: keep-all; }
.h1.center { text-align: center; }
.h2 { font-size: 66px; font-weight: 850; line-height: 1.22; letter-spacing: -.03em; word-break: keep-all; text-align: center; }
.hl { background-image: linear-gradient(var(--hlc), var(--hlc)); background-repeat: no-repeat; background-position: 0 88%; background-size: 0% 38%; padding: 0 4px; }
.red { color: #d2486c; }
.grn { color: #2f9a68; }
.ico { display: flex; align-items: center; justify-content: center; width: 150px; height: 150px; border-radius: 50%; padding: 34px; flex: 0 0 auto;
  box-shadow: 0 12px 26px rgba(120, 92, 80, .12), inset 0 0 0 6px rgba(255, 255, 255, .7); }
.ico svg { display: block; width: 100%; height: 100%; }
.ico.sm { width: 120px; height: 120px; padding: 27px; }
.ico.xs { width: 76px; height: 76px; padding: 17px; }
.ico.xxs { width: 48px; height: 48px; padding: 10px; box-shadow: inset 0 0 0 3px rgba(255, 255, 255, .5); }
.arrow { display: block; width: 90px; height: 24px; flex: 0 0 auto; }
.arrow path { stroke-dasharray: 1; stroke-dashoffset: 1; }
.arrow-sm { width: 56px; }
.arrow-lg { width: 150px; height: 30px; }
.applogo { display: flex; align-items: center; justify-content: center; width: 150px; height: 150px; border-radius: 36px; background: #1f2747; color: #fff;
  font-size: 84px; font-weight: 800; box-shadow: 0 18px 36px rgba(31, 39, 71, .35); flex: 0 0 auto; }
.applogo.sm { width: 64px; height: 64px; border-radius: 16px; font-size: 36px; box-shadow: 0 8px 16px rgba(31, 39, 71, .3); }

/* intro title */
.phwrap { position: absolute; left: 110px; top: 170px; width: 480px; }
.phimg { display: block; width: 480px; height: auto; filter: drop-shadow(0 24px 30px rgba(80, 60, 90, .22)); }
.titlecard { left: 660px; top: 150px; width: 1120px; display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 56px 60px 60px; }
.appchip { display: flex; align-items: center; gap: 20px; padding: 14px 34px 14px 16px; border-radius: 999px; background: #eef0fa; font-size: 34px; color: var(--ink-soft); font-weight: 600; }
.appchip b { font-size: 42px; font-weight: 900; color: #1f2747; }
.survey { display: flex; align-items: center; gap: 16px; padding: 12px 28px 12px 12px; border-radius: 999px; background: #eef4ff; font-size: 30px; font-weight: 600; color: #3d5a8a; }
.survey b { font-weight: 900; }

.quote { left: 300px; top: 300px; width: 1320px; padding: 60px 70px; }
.qrow2 { display: flex; align-items: center; gap: 44px; }
.qmark { position: absolute; right: 54px; top: -10px; font-size: 200px; line-height: 1; font-weight: 900; color: #f6dccf; }
.qbody { font-size: 70px; font-weight: 900; line-height: 1.28; letter-spacing: -.03em; word-break: keep-all; }

.cloudrow { position: absolute; left: 0; right: 0; top: 380px; display: flex; justify-content: center; align-items: center; gap: 40px; }
.doccol { display: flex; flex-direction: column; gap: 22px; }
.docc { position: relative; display: flex; align-items: center; gap: 22px; width: 520px; padding: 18px 26px; border-radius: 30px; font-size: 38px; font-weight: 850; }
.blockwrap { position: relative; width: 170px; height: 120px; display: flex; align-items: center; justify-content: center; }
.bigx { position: absolute; left: 40px; top: 15px; width: 90px; height: 90px; border-radius: 50%; background: #e0607f; padding: 18px; box-shadow: 0 12px 26px rgba(224, 96, 127, .4); }
.bigx svg { display: block; width: 100%; height: 100%; }
.cloudbox { position: relative; width: 560px; height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
.cloudico { width: 150px; height: 120px; }
.cloudico svg { display: block; width: 100%; height: 100%; }
.cloudl { font-size: 44px; font-weight: 900; }
.cchips { display: flex; gap: 12px; }
.cchip { display: inline-block; padding: 10px 20px; border-radius: 16px; background: #f1eefc; box-shadow: inset 0 0 0 2px #ddd5f6; font-size: 28px; font-weight: 800; color: #4b3f8a; }

.verbs { position: absolute; left: 0; right: 0; top: 470px; display: flex; justify-content: center; gap: 50px; }
.verb { position: relative; width: 440px; height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
.verb b { font-size: 54px; font-weight: 900; letter-spacing: -.03em; }
.wtag { position: absolute; right: 30px; top: 26px; width: 60px; height: 60px; }
.wtag svg { display: block; width: 100%; height: 100%; }

.pcbig { position: absolute; left: 610px; top: 440px; width: 700px; display: flex; flex-direction: column; align-items: center; }
.pcscreen { width: 700px; height: 380px; border-radius: 34px; background: #1f2747; border: 14px solid #2c3560; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;
  box-shadow: 0 30px 60px rgba(31, 39, 71, .3); }
.pcl { font-size: 38px; font-weight: 800; color: #fff; }
.pcneck { width: 80px; height: 50px; background: #2c3560; }
.pcbase { width: 300px; height: 22px; border-radius: 12px; background: #2c3560; }
.feat { display: flex; align-items: center; gap: 20px; padding: 20px 30px 20px 20px; border-radius: 30px; font-size: 34px; font-weight: 600; line-height: 1.3; }
.feat b { font-weight: 900; }

.bars { left: 310px; top: 470px; width: 1300px; padding: 40px 56px; border-radius: 40px; display: flex; flex-direction: column; gap: 26px; }
.bhead { font-size: 28px; font-weight: 800; color: var(--ink-soft); letter-spacing: .08em; }
.brow { display: flex; align-items: center; gap: 26px; }
.bl { width: 240px; font-size: 40px; font-weight: 700; }
.bl b { font-weight: 900; }
.btrack { flex: 1 1 auto; height: 40px; border-radius: 999px; background: #f2eff6; overflow: hidden; }
.bfill { display: block; height: 100%; width: 0%; border-radius: 999px; }
.bnote { width: 290px; font-size: 24px; font-weight: 700; color: var(--ink-soft); }
.bmax { width: 290px; font-size: 40px; font-weight: 900; color: #2f9a68; }

.appcard { left: 410px; top: 140px; width: 1100px; display: flex; align-items: center; gap: 44px; padding: 44px 56px; }
.appt { display: flex; flex-direction: column; gap: 8px; }
.appt span { font-size: 34px; font-weight: 650; color: var(--ink-soft); }
.appt b { font-size: 84px; font-weight: 900; letter-spacing: -.035em; color: #1f2747; }
.route { position: absolute; left: 0; right: 0; top: 560px; display: flex; justify-content: center; align-items: center; gap: 16px; }
.rstep { position: relative; display: flex; flex-direction: column; align-items: center; gap: 16px; width: 330px; padding: 30px 20px; border-radius: 34px; font-size: 34px; font-weight: 850; }
.cf { position: absolute; display: block; width: 16px; height: 16px; border-radius: 3px; opacity: 0; }

.stack { position: absolute; left: 330px; top: 260px; width: 860px; display: flex; flex-direction: column; gap: 22px; }
.layer { display: flex; align-items: center; gap: 24px; padding: 30px 40px; border-radius: 34px; box-shadow: 0 20px 44px rgba(80, 60, 70, .14); font-size: 40px; }
.layer b { font-weight: 900; }
.layer span { font-weight: 600; color: var(--ink-soft); font-size: 30px; }
.l-app { background: #fff; }
.l-model { background: #f4f1ff; }
.l-eng { background: #1f2747; color: #fff; }
.l-eng span.ltag { color: #c9cff0; }
.l-eng b { font-size: 48px; }
.ltag { font-size: 28px !important; font-weight: 800 !important; letter-spacing: .02em; width: 220px; }
.mchip { display: inline-block; padding: 10px 28px; border-radius: 18px; background: #fff; box-shadow: inset 0 0 0 3px #c9bdf3; font-size: 40px !important; font-weight: 900 !important; color: #4b3f8a !important; }
.sidechips { position: absolute; left: 1250px; top: 380px; display: flex; flex-direction: column; gap: 30px; }

.listcard { left: 300px; top: 110px; width: 1320px; padding: 50px 64px; display: flex; flex-direction: column; gap: 28px; }
.listcard .pill { align-self: flex-start; }
.plist { display: flex; flex-direction: column; gap: 20px; }
.pro { position: relative; display: flex; align-items: center; gap: 26px; padding: 16px 90px 16px 20px; border-radius: 30px; background: #faf8fd; box-shadow: inset 0 0 0 2px #efebf5; }
.ptxt { font-size: 42px; font-weight: 600; letter-spacing: -.02em; }
.ptxt b { font-weight: 900; }
.ptxt.sm { font-size: 36px; }
.tick { position: absolute; right: 24px; top: 50%; margin-top: -25px; display: block; width: 50px; height: 50px; border-radius: 50%; background: #3fa877; padding: 8px; }
.tick svg { display: block; width: 100%; height: 100%; }
.listcard.two { left: 160px; top: 200px; width: 1600px; gap: 34px; }
.listcard.two .pro { padding-top: 24px; padding-bottom: 24px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid2 .pro { padding-right: 24px; }

.outrow { position: absolute; left: 0; right: 0; top: 440px; display: flex; justify-content: center; align-items: center; gap: 40px; }
.shieldbox { position: relative; width: 440px; height: 360px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; box-shadow: 0 0 0 10px rgba(140, 222, 190, .5), 0 30px 70px rgba(63, 168, 119, .2); }
.shieldbox b { font-size: 48px; font-weight: 900; }
.shieldbox span { font-size: 30px; font-weight: 650; color: var(--ink-soft); }
.filebox { position: relative; width: 640px; height: 360px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 34px; border: 4px dashed #e9a3b6; }
.frow { display: flex; gap: 18px; }
.fchip { display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: 18px; background: #f1f8f4; box-shadow: inset 0 0 0 2px #cfeedd; font-size: 34px; font-weight: 800; color: #2d6b51; }
.fchip svg { width: 40px; height: 40px; }
.warnbig { display: flex; align-items: center; gap: 16px; font-size: 56px; font-weight: 900; color: #c4486c; }
.warnbig svg { width: 64px; height: 64px; }

.tips { position: absolute; left: 0; right: 0; top: 300px; display: flex; justify-content: center; gap: 44px; }
.tip { position: relative; width: 500px; height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
.tnum { position: absolute; left: 30px; top: 24px; width: 62px; height: 62px; border-radius: 50%; background: #ffe6dc; color: #d0603f; font-size: 36px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.tt { font-size: 42px; font-weight: 600; line-height: 1.3; text-align: center; letter-spacing: -.02em; }
.tt b { font-weight: 900; }
.endrib { position: absolute; left: 660px; top: 790px; width: 600px; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 18px 30px; border-radius: 999px; background: #3fa877; color: #fff; font-size: 38px; font-weight: 850; box-shadow: 0 16px 34px rgba(63, 168, 119, .35); }
.endrib svg { width: 46px; height: 46px; }

/* practice overlay cards */
.ovc { position: absolute; display: flex; flex-direction: column; gap: 14px; padding: 22px 24px; border-radius: 26px; background: rgba(255, 255, 255, .97);
  box-shadow: 0 22px 50px rgba(30, 24, 40, .32), inset 0 0 0 2px #f3ebe2; }
.ovc.side { right: 28px; top: 120px; width: 400px; }
.ovc.warnc { box-shadow: 0 22px 50px rgba(30, 24, 40, .32), inset 0 0 0 3px #f2a9bd; }
.ovs2 { font-size: 23px; font-weight: 600; color: var(--ink-soft); line-height: 1.38; }
.ovs2 b { color: var(--ink); font-weight: 850; }
.ovhead { display: flex; align-items: center; gap: 14px; }
.stephead { display: flex; align-items: center; gap: 14px; }
.stepn { padding: 5px 12px; border-radius: 10px; background: #d2603f; color: #fff; font-size: 20px; font-weight: 900; letter-spacing: .06em; }
.stept { font-size: 32px; font-weight: 900; letter-spacing: -.03em; }
.stept.sm { font-size: 28px; }
.flow { position: relative; display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 650; line-height: 1.3; }
.flow b { font-weight: 900; }
.fnum { flex: 0 0 auto; width: 38px; height: 38px; border-radius: 50%; background: #ebe6ff; color: #7d62c0; font-size: 21px; font-weight: 900; display: flex; align-items: center; justify-content: center; padding: 7px; }
.fnum svg { display: block; width: 100%; height: 100%; }
.sm2 { font-size: 19px; font-weight: 650; color: var(--ink-soft); }
.tick.sm { position: static; margin: 0 0 0 auto; width: 30px; height: 30px; padding: 5px; flex: 0 0 auto; }
.urlbox { padding: 12px 18px; border-radius: 14px; background: #2c2a3d; color: #ffd27a; font-family: Consolas, "Courier New", monospace; font-size: 30px; font-weight: 700; line-height: 1.25; }
.dlbtn { display: flex; align-items: center; gap: 12px; align-self: flex-start; padding: 12px 22px; border-radius: 14px; background: #b8923a; color: #fff; font-size: 24px; font-weight: 850; box-shadow: 0 10px 20px rgba(184, 146, 58, .35); }
.dlbtn svg { width: 30px; height: 30px; }
.frow2 { display: flex; align-items: flex-start; gap: 14px; }
.ftx { display: flex; flex-direction: column; gap: 2px; font-size: 25px; font-weight: 650; }
.ftx b { font-weight: 900; }
.ftx small { font-size: 19px; font-weight: 650; color: var(--ink-soft); }
.cangrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.canitem { display: flex; align-items: center; gap: 8px; padding: 10px 10px; border-radius: 14px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; font-size: 20px; font-weight: 800; }
.canitem svg { width: 28px; height: 28px; flex: 0 0 auto; }
.osrow { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: var(--ink-soft); }
.os { padding: 4px 12px; border-radius: 10px; background: #e9e4f7; color: #5a4aa8; font-size: 20px; font-weight: 850; }
.os.win { background: #dceaff; color: #2f5fa8; }
.specrow { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-radius: 14px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; }
.sk { font-size: 20px; font-weight: 750; color: var(--ink-soft); }
.specrow b { font-size: 26px; font-weight: 900; }
.recrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 14px; border-radius: 14px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; }
.recrow code { font-family: Consolas, "Courier New", monospace; font-size: 24px; font-weight: 700; }
.recrow span { font-size: 19px; font-weight: 750; color: var(--ink-soft); text-align: right; }
.recrow.pick span { color: #2f7a55; font-weight: 900; }
.namefx { display: flex; align-items: center; gap: 14px; }
.nm { padding: 8px 18px; border-radius: 14px; font-size: 30px; font-weight: 900; }
.nm.real { background: #fde8ec; color: #8a3550; }
.nm.alias { background: #e3f6ec; color: #24533f; }
.cg { font-size: 30px; font-weight: 900; color: #b4a9d3; }
.speed { display: flex; align-items: center; gap: 10px; align-self: flex-start; padding: 8px 16px; border-radius: 14px; background: #fff1cc; font-size: 24px; font-weight: 700; color: #8a6414; }
.speed b { font-weight: 900; }
.speed svg { width: 30px; height: 30px; }
.offbadge { position: absolute; right: 28px; top: 120px; display: flex; align-items: center; gap: 12px; padding: 10px 22px 10px 12px; border-radius: 999px; background: #e0607f; color: #fff;
  font-size: 24px; font-weight: 850; box-shadow: 0 12px 26px rgba(224, 96, 127, .4); }
.offbadge svg { width: 38px; height: 38px; padding: 4px; }

/* practice impact pops (화면 가운데, 몇 초만) */
.impact { left: 560px; top: 330px; width: 800px; display: flex; align-items: center; gap: 40px; padding: 40px 54px; }
.imico { flex: 0 0 auto; width: 170px; height: 170px; border-radius: 50%; padding: 36px; box-shadow: 0 16px 34px rgba(0, 0, 0, .18); }
.imico svg { display: block; width: 100%; height: 100%; }
.imtx { display: flex; flex-direction: column; gap: 6px; }
.imtx small { font-size: 36px; font-weight: 700; color: var(--ink-soft); }
.imtx b { font-size: 84px; font-weight: 900; letter-spacing: -.035em; line-height: 1.05; }
.impact.wide { left: 360px; top: 300px; width: 1200px; flex-direction: column; gap: 30px; padding: 46px 56px; }
.whyrow { display: flex; align-items: center; gap: 30px; }
.whyc { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 26px 30px; border-radius: 28px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; }
.whyc small { font-size: 30px; font-weight: 750; color: var(--ink-soft); }
.whyc.on { background: #e3f6ec; box-shadow: inset 0 0 0 3px #3fa877; }
.whyc.on svg { width: 110px; height: 90px; }
.whyc.on b { font-size: 42px; font-weight: 900; color: #24533f; }
.whyt { font-size: 52px; font-weight: 800; letter-spacing: -.03em; }

/* outro */
.duo2 { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 46px; }
.dcard { position: relative; width: 640px; height: 460px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; padding: 30px; }
.dcard.glow { box-shadow: 0 0 0 10px rgba(255, 228, 160, .6), 0 30px 70px rgba(231, 169, 44, .22); }
.dt { font-size: 48px; font-weight: 750; letter-spacing: -.03em; }
.dt b { font-weight: 900; color: #1f2747; }
.ds { font-size: 34px; font-weight: 600; color: var(--ink-soft); text-align: center; line-height: 1.35; }
.ds b { color: var(--ink); font-weight: 900; }
.notec { left: 460px; top: 640px; width: 1000px; display: flex; align-items: center; gap: 26px; padding: 26px 40px; border-radius: 34px; font-size: 36px; font-weight: 600; line-height: 1.35; }
.notec b { font-weight: 900; }
.endbtns { display: flex; gap: 26px; }
.ebtn { display: flex; align-items: center; gap: 14px; padding: 18px 40px; border-radius: 999px; color: #fff; font-size: 40px; font-weight: 900; }
.ebtn svg { width: 46px; height: 46px; }
.ebtn.like { background: #6aa3e6; box-shadow: 0 14px 30px rgba(106, 163, 230, .4); }
.ebtn.sub { background: #e0405f; box-shadow: 0 14px 30px rgba(224, 64, 95, .4); }
.thanks { display: flex; align-items: center; gap: 14px; font-size: 44px; font-weight: 850; color: var(--ink-soft); }
.thanks svg { width: 48px; height: 48px; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
  <div id="vwrap"><video id="vid" class="clip" src="assets/media/src.mp4" playsinline data-has-audio="true" data-start="0" data-duration="${DUR}" data-track-index="0"></video></div>
${covHTML}
${gHTML}
${capHTML}
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
  const fill = (sel, t, pct) => tl.fromTo(sel, { width: '0%' }, { width: pct + '%', duration: 1.0, ease: 'power3.out' }, t);
  const type = () => {};
  const confetti = (pre, t) => {
    const host = document.getElementById(pre + '-c'); const cols = ['#ef8a6f', '#e7a92c', '#4fb489', '#9a8be6', '#e8708f', '#6aa3e6'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('span'); p.className = 'cf'; p.style.background = cols[i % 6];
      p.style.left = '50%'; p.style.top = '50%'; host.appendChild(p);
      const a = (i / 22) * Math.PI * 2, r = 260 + (i % 4) * 60;
      tl.fromTo(p, { opacity: 1, x: 0, y: 0, rotation: 0 }, { opacity: 0, x: Math.cos(a) * r, y: Math.sin(a) * r * .6, rotation: 200 + i * 20, duration: 1.3, ease: 'power3.out', immediateRender: false }, t);
    }
  };

  // cover backgrounds
  ${covAnim}

  // graphics
${gAnim}

  tl.fromTo('#endfade', { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power1.in' }, ${(DUR - 1.0).toFixed(3)});

  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Built ${G.length} graphics (${G.filter((g) => g.layer === 'full').length} full scenes), ${CUES.length} captions, duration ${DUR}s`);
