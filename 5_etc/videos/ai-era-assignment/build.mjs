import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// AI 시대의 과제 — generator for index.html.
//
// Sound:    assets/media/narration.m4a (완성영상 (ai 시대의 과제).mp4 의 오디오, 0–435s, 끝 오로라 무음 구간은 잘라냄)
// Picture:  원본은 PPT 화면이라 쓰지 않는다 — 전 구간 파스텔 모션그래픽 + 필로소피 캐릭터.
// Captions: assets/captions.srt (자막 (ai 시대의 과제).srt) — 표기 교정은 FIX 참고.
// Scenes are contiguous and pinned to SRT cue numbers: T(cue) = cue start, TE(cue) = cue end.
//   kind 'say'  — character on the left, speech card on the right
//   kind 'full' — character steps out, wide card / impact typography in the centre
//
// 수정: 아래 scenes → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const FIX = [[/SWAT 웹/g, 'SWOT 앱'], [/SWAT/g, 'SWOT'], [/안티그래피티/g, '안티그래비티']];
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const cues = fs.readFileSync(path.join(root, 'assets/captions.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .map((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); return { n: +l[0], s: srtSec(m[1]), e: srtSec(m[2]), text: FIX.reduce((t, [a, b]) => t.replace(a, b), l.slice(2).join(' ')) }; });
const CUE = Object.fromEntries(cues.map((c) => [c.n, c]));
const DUR = 435;

const T = (n, off = 0) => { const c = CUE[n]; if (!c) throw new Error(`cue ${n}`); return +(c.s + off).toFixed(3); };
const TE = (n, off = 0) => { const c = CUE[n]; if (!c) throw new Error(`cue ${n}`); return +(c.e + off).toFixed(3); };
const END_S = T(196, -0.1);

// ---------- icons ----------------------------------------------------------
const S = (c, body, w = 4) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  sparkle: (c) => S(c, `<path d="M28 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${c}" stroke-width="2"/><path d="M50 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="${c}" stroke-width="1.5"/>`),
  check: (c) => S(c, `<path d="M18 33l9 9 19-20"/>`, 7),
  x: (c) => S(c, `<path d="M21 21l22 22M43 21L21 43"/>`, 7),
  brain: (c) => S(c, `<path d="M26 12c-6 0-10 4-10 9-5 1-8 5-8 10 0 4 2 7 5 9-1 5 3 11 9 11 2 3 5 4 8 4V12z"/><path d="M38 12c6 0 10 4 10 9 5 1 8 5 8 10 0 4-2 7-5 9 1 5-3 11-9 11-2 3-5 4-8 4V12z"/>`),
  trend: (c) => S(c, `<path d="M8 50l16-16 10 8 20-22"/><path d="M42 20h12v12"/>`),
  down: (c) => S(c, `<path d="M8 14l16 16 10-8 20 22"/><path d="M42 44h12V32"/>`),
  users: (c) => S(c, `<circle cx="24" cy="24" r="8"/><circle cx="44" cy="26" r="6"/><path d="M8 52c2-9 8-14 16-14s14 5 16 14"/><path d="M40 38c7 0 13 4 15 12"/>`),
  book: (c) => S(c, `<path d="M10 14c8-3 15-3 22 2 7-5 14-5 22-2v38c-8-3-15-3-22 2-7-5-14-5-22-2z"/><path d="M32 16v38"/>`),
  question: (c) => S(c, `<circle cx="32" cy="32" r="22"/><path d="M25 26c0-5 3-8 7-8s7 3 7 7c0 6-7 6-7 12"/><circle cx="32" cy="45" r="1.5" fill="${c}"/>`),
  map: (c) => S(c, `<path d="M8 16l16-6 16 6 16-6v38l-16 6-16-6-16 6z"/><path d="M24 10v38M40 16v38"/>`),
  pin: (c) => S(c, `<path d="M32 56s-16-15-16-28a16 16 0 0 1 32 0c0 13-16 28-16 28z"/><circle cx="32" cy="28" r="6"/>`),
  car: (c) => S(c, `<path d="M10 42l5-14c1-3 3-4 6-4h22c3 0 5 1 6 4l5 14v8H10z"/><path d="M10 42h44"/><circle cx="20" cy="50" r="4" fill="${c}"/><circle cx="44" cy="50" r="4" fill="${c}"/>`),
  pen: (c) => S(c, `<path d="M44 8l12 12-30 30-14 2 2-14z"/><path d="M38 14l12 12"/>`),
  palette: (c) => S(c, `<path d="M32 8C18 8 8 18 8 31s10 23 22 23c4 0 5-3 3-6s0-6 4-6h7c6 0 12-5 12-12C56 17 45 8 32 8z"/><circle cx="20" cy="31" r="3" fill="${c}"/><circle cx="27" cy="20" r="3" fill="${c}"/><circle cx="40" cy="20" r="3" fill="${c}"/>`),
  music: (c) => S(c, `<path d="M24 46V14l28-6v32"/><circle cx="18" cy="46" r="6"/><circle cx="46" cy="40" r="6"/>`),
  code: (c) => S(c, `<path d="M22 20L10 32l12 12M42 20l12 12-12 12M36 14l-8 36"/>`),
  house: (c) => S(c, `<path d="M10 30L32 12l22 18"/><path d="M16 26v26h32V26"/><path d="M27 52V38h10v14"/>`),
  dice: (c) => S(c, `<rect x="10" y="10" width="44" height="44" rx="9"/><circle cx="22" cy="22" r="3.5" fill="${c}"/><circle cx="42" cy="22" r="3.5" fill="${c}"/><circle cx="32" cy="32" r="3.5" fill="${c}"/><circle cx="22" cy="42" r="3.5" fill="${c}"/><circle cx="42" cy="42" r="3.5" fill="${c}"/>`),
  target: (c) => S(c, `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="13"/><circle cx="32" cy="32" r="4" fill="${c}"/>`),
  folder: (c) => S(c, `<path d="M8 18c0-3 2-5 5-5h12l5 6h21c3 0 5 2 5 5v23c0 3-2 5-5 5H13c-3 0-5-2-5-5z"/><path d="M8 26h48"/>`),
  chat: (c) => S(c, `<path d="M10 14h44v28H30l-12 10V42h-8z"/><path d="M20 26h24M20 33h14"/>`),
  doc: (c) => S(c, `<path d="M16 8h22l12 12v36H16z"/><path d="M38 8v12h12"/><path d="M23 32h18M23 40h18M23 48h11"/>`),
  eye: (c) => S(c, `<path d="M6 32s10-16 26-16 26 16 26 16-10 16-26 16S6 32 6 32z"/><circle cx="32" cy="32" r="7"/>`),
  heart: (c) => S(c, `<path d="M32 52C18 42 10 34 10 24c0-7 5-12 11-12 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 5 11 12 0 10-8 18-22 28z" fill="${c}"/>`, 2),
  thumb: (c) => S(c, `<path d="M20 28v26H10V28z"/><path d="M20 28l10-18c4 0 6 3 5 7l-2 9h15c3 0 5 3 4 6l-4 18c-1 3-3 4-6 4H20"/>`),
  bell: (c) => S(c, `<path d="M18 44V30a14 14 0 0 1 28 0v14l5 5H13z"/><path d="M27 54a5 5 0 0 0 10 0"/>`),
  search: (c) => S(c, `<circle cx="28" cy="28" r="16"/><path d="M40 40l14 14"/>`, 5),
  zap: (c) => S(c, `<path d="M36 6L14 36h16l-4 22 22-30H32z" fill="${c}" stroke-width="2"/>`),
  link: (c) => S(c, `<path d="M27 37l10-10"/><path d="M22 30l-6 6a8 8 0 0 0 12 12l6-6M42 34l6-6a8 8 0 0 0-12-12l-6 6"/>`),
};

const C = { coral: '#ef8a6f', mint: '#4fb489', lav: '#9a8be6', sky: '#6aa3e6', pink: '#e8708f', yellow: '#e7a92c', grey: '#8e8aa3' };
const BG = { peach: '#ffe6dc', mint: '#dcf3e8', lav: '#ebe6ff', sky: '#e2eeff', pink: '#ffe3ea', yellow: '#fff1cc', grey: '#efedf3' };

const ico = (id, name, color, bg, cls = '') => `<div id="${id}" class="ico ${cls}" style="background:${bg}">${ICON[name](color)}</div>`;
const pill = (id, txt, dot = C.coral, cls = '') => `<div id="${id}" class="pill ${cls}"><span class="pdot" style="background:${dot}"></span><span>${txt}</span></div>`;
const ok = (id, txt, cls = '') => `<div id="${id}" class="okpill ${cls}"><span class="okc">${ICON.check('#ffffff')}</span><span>${txt}</span></div>`;
const no = (id, txt, cls = '') => `<div id="${id}" class="okpill nopill ${cls}"><span class="okc">${ICON.x('#ffffff')}</span><span>${txt}</span></div>`;
const arrow = (id, cls = '') => `<svg id="${id}" class="arrow ${cls}" viewBox="0 0 120 24" fill="none" stroke="#5b5873" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M4 12h108M98 2l14 10-14 10"/></svg>`;
const darrow = (id) => `<svg id="${id}" class="darrow" viewBox="0 0 24 70" fill="none" stroke="#5b5873" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M12 4v58M2 50l10 12 10-12"/></svg>`;
const hl = (txt, color = 'var(--hl-y)') => `<span class="hl" style="--hlc:${color}">${txt}</span>`;
const chip = (id, name, color, bg, label) => `<div id="${id}" class="ichip">${ico(`${id}-i`, name, color, bg, 'xs')}<span>${label}</span></div>`;

const flow = (id, nodes, cls = '') => `<div class="flow ${cls}">${nodes.map(([n, c, b, l], i) =>
  `${i ? arrow(`${id}-a${i}`) : ''}<div class="node" id="${id}-n${i}">${ico(`${id}-i${i}`, n, c, b)}<div class="nlabel">${l}</div></div>`).join('')}</div>`;
const flowAnim = (id, times) => times.map((t, i) =>
  `${i ? `draw('#${id}-a${i} path', ${(t - 0.35).toFixed(2)}, .45); ` : ''}pop('#${id}-i${i}', ${t.toFixed(2)}); up('#${id}-n${i} .nlabel', ${(t + 0.15).toFixed(2)}, 16);`).join('\n  ');

Object.assign(ICON, {
  robot: (c) => S(c, `<rect x="12" y="20" width="40" height="32" rx="9"/><circle cx="25" cy="35" r="3.5" fill="${c}"/><circle cx="39" cy="35" r="3.5" fill="${c}"/><path d="M26 45h12M32 20v-8"/><circle cx="32" cy="10" r="3" fill="${c}"/><path d="M8 32v10M56 32v10"/>`),
  student: (c) => S(c, `<path d="M6 22l26-10 26 10-26 10z"/><path d="M16 27v12c0 4 7 8 16 8s16-4 16-8V27"/><path d="M58 22v14"/>`),
  camera: (c) => S(c, `<path d="M8 22c0-3 2-5 5-5h8l4-6h14l4 6h8c3 0 5 2 5 5v24c0 3-2 5-5 5H13c-3 0-5-2-5-5z"/><circle cx="32" cy="34" r="10"/>`),
  rocket: (c) => S(c, `<path d="M32 6c10 8 14 20 12 32H20C18 26 22 14 32 6z"/><circle cx="32" cy="24" r="5"/><path d="M20 38l-8 8 10 2M44 38l8 8-10 2M27 46l5 12 5-12"/>`),
  clock: (c) => S(c, `<circle cx="32" cy="32" r="22"/><path d="M32 18v15l10 6"/>`),
  git: (c) => S(c, `<circle cx="20" cy="14" r="6"/><circle cx="20" cy="50" r="6"/><circle cx="46" cy="26" r="6"/><path d="M20 20v24M46 32c0 10-10 10-22 14"/>`),
  present: (c) => S(c, `<rect x="8" y="10" width="48" height="32" rx="4"/><path d="M32 42v12M22 56l10-6 10 6"/><path d="M18 34l9-9 7 6 12-12"/>`),
  app: (c) => S(c, `<rect x="8" y="10" width="48" height="44" rx="7"/><path d="M8 22h48"/><circle cx="15" cy="16" r="1.5" fill="${c}"/><circle cx="21" cy="16" r="1.5" fill="${c}"/><rect x="16" y="30" width="14" height="16" rx="2"/><path d="M36 32h12M36 39h12M36 46h8"/>`),
  globe: (c) => S(c, `<circle cx="32" cy="32" r="22"/><path d="M10 32h44M32 10c7 7 10 14 10 22s-3 15-10 22c-7-7-10-14-10-22s3-15 10-22z"/>`),
  lock: (c) => S(c, `<rect x="14" y="28" width="36" height="26" rx="6"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/><circle cx="32" cy="41" r="3" fill="${c}"/>`),
  wave: (c) => S(c, `<path d="M6 40c8-10 14-10 22 0s14 10 22 0 10-8 10-8"/><path d="M6 26c8-10 14-10 22 0s14 10 22 0 10-8 10-8"/>`),
  wind: (c) => S(c, `<path d="M8 24h30a7 7 0 1 0-7-7"/><path d="M8 34h42a7 7 0 1 1-7 7"/><path d="M8 44h20"/>`),
  bulb: (c) => S(c, `<path d="M24 44c0-6-8-10-8-20a16 16 0 0 1 32 0c0 10-8 14-8 20z"/><path d="M25 52h14M28 58h8"/>`),
  up: (c) => S(c, `<path d="M32 54V12M16 28l16-16 16 16"/>`, 6),
});

// ---------- scenes ---------------------------------------------------------
// { id, from (cue), kind, html, anim } — s = T(from) - .12, e = next scene's s
const SC = [];
const say = (g) => SC.push({ kind: 'say', ...g });
const full = (g) => SC.push({ kind: 'full', ...g });
const f = (t) => t.toFixed(2);
const stepper = (id, act) => `<div id="${id}" class="stepper">${['첫 프롬프트', '과정 캡처', '10회 개선', '차별점 발표'].map((l, i) =>
  `<div class="stp${i + 1 === act ? ' on' : i + 1 < act ? ' done' : ''}"><b>${i + 1}</b><span>${l}</span></div>`).join('')}</div>`;

// ---- 01 교수님들의 고민 ------------------------------------------------------
full({ id: 'g-open', from: 1, html: `
  <div class="mega">
    ${pill('go-k', 'AI 시대의 과제', C.coral, 'pill-soft')}
    <div id="go-l1" class="mt">과제를 ${hl('AI로', 'var(--hl-y)')} 한다면</div>
    <div id="go-l2" class="mt">평가는 <span class="ink2">어떻게</span> 해야 할까요<span id="go-q" class="qm">?</span></div>
    <div id="go-s" class="sub">요즘 교수님들의 가장 큰 고민</div>
  </div>`,
  anim: `up('#go-k', .3, 16); up('#go-s', 1.0, 16); up('#go-l1', ${f(T(3))}, 50); sweep('#go-l1 .hl', ${f(T(3, .6))});
  up('#go-l2', ${f(T(4))}, 50); stamp('#go-q', ${f(T(4, 1.2))});` });

say({ id: 'g-survey', from: 5, html: `
  <div id="gs-c" class="card scard say">
    ${pill('gs-k', '교육자 · 교수님 대상 사전 설문', C.lav, 'pill-soft')}
    <div class="row gap">${ico('gs-i', 'doc', C.lav, BG.lav)}<div id="gs-q" class="qbub">교수님들, 요즘 <b>AI와 관련해서</b><br>어떤 고민이 있으신가요?</div></div>
    <div class="ans">
      <div id="gs-a1" class="abub">과제를 AI로 해 와요…</div>
      <div id="gs-a2" class="abub b2">평가를 어떻게 하죠?</div>
      <div id="gs-a3" class="abub b3">AI를 막아야 할까요?</div>
    </div>
  </div>`,
  anim: `rise('#gs-c', ${f(T(5))}); up('#gs-k', ${f(T(6))}, 16); pop('#gs-i', ${f(T(7))}); slide('#gs-q', ${f(T(9))});
  pop('#gs-a1', ${f(T(11, .3))}); pop('#gs-a2', ${f(T(11, 1.1))}); pop('#gs-a3', ${f(T(11, 1.9))});` });

say({ id: 'g-whose', from: 12, html: `
  <div id="gw-c" class="card scard say">
    ${pill('gw-k', '학생들이 AI를 써서 과제를 낸다', C.sky, 'pill-soft')}
    ${flow('gw', [['student', C.sky, BG.sky, '학생'], ['robot', C.lav, BG.lav, 'AI가 작성'], ['doc', C.coral, BG.peach, '과제 제출']])}
    <div id="gw-h" class="h2">이 점수, ${hl('누구의 것', 'var(--hl-p)')}일까요?</div>
  </div>`,
  anim: `rise('#gw-c', ${f(T(12))}); up('#gw-k', ${f(T(12, .3))}, 16);
  ${flowAnim('gw', [T(12, .9), T(13, .6), T(14, .5)])}
  up('#gw-h', ${f(T(15, .3))}, 26); sweep('#gw-h .hl', ${f(T(16, .6))});` });

full({ id: 'g-3q', from: 18, html: `
  <div class="mega">
    <div id="g3-k" class="sub">저도 고민을 많이 해봤습니다</div>
    <div class="qstack">
      <div id="g3-1" class="qline">${ico('g3-i1', 'lock', C.coral, BG.peach, 'xs')}<span>AI를 <b>막을 수</b> 있을까?</span></div>
      <div id="g3-2" class="qline">${ico('g3-i2', 'x', C.pink, BG.pink, 'xs')}<span>AI를 <b>안 쓰게 할 수</b> 있을까?</span></div>
      <div id="g3-3" class="qline hot">${ico('g3-i3', 'question', C.lav, BG.lav, 'xs')}<span>안 쓰게 하는 게 <b>맞을까?</b></span></div>
    </div>
  </div>`,
  anim: `up('#g3-k', ${f(T(18, .1))}, 16); slam('#g3-1', ${f(T(20))}); slam('#g3-2', ${f(T(21))}); slam('#g3-3', ${f(T(22))});
  tl.fromTo('#g3-3', {x:0}, {x:10, duration:.06, ease:'none', yoyo:true, repeat:5, immediateRender:false}, ${f(T(23))});` });

say({ id: 'g-world', from: 24, html: `
  <div id="gwd-c" class="card scard say">
    ${pill('gwd-k', '학생들이 살아갈 앞으로의 세상', C.mint, 'pill-soft')}
    <div class="row gap">${ico('gwd-i', 'globe', C.mint, BG.mint)}<div id="gwd-h" class="h2 sm">AI가 ${hl('꼭 필요', 'var(--hl-m)')}합니다</div></div>
    <div class="chips5">
      ${chip('gwd-1', 'code', C.mint, BG.mint, '개발')}
      ${chip('gwd-2', 'pen', C.coral, BG.peach, '글쓰기')}
      ${chip('gwd-3', 'palette', C.pink, BG.pink, '디자인')}
      ${chip('gwd-4', 'trend', C.sky, BG.sky, '금융')}
      ${chip('gwd-5', 'book', C.lav, BG.lav, '교육')}
      ${chip('gwd-6', 'heart', C.pink, BG.pink, '의료')}
    </div>
    <div id="gwd-s" class="sub">AI가 없는 분야가 거의 없고, <b>너무 빠르게</b> 퍼지는 중</div>
  </div>`,
  anim: `rise('#gwd-c', ${f(T(24))}); up('#gwd-k', ${f(T(24, .3))}, 16); pop('#gwd-i', ${f(T(25))}); up('#gwd-h', ${f(T(25, .2))}, 20); sweep('#gwd-h .hl', ${f(T(25, .8))});
  ${[0, .35, .7, 1.05, 1.4, 1.75].map((d, i) => `pop('#gwd-${i + 1}', ${f(T(26, d))});`).join(' ')} up('#gwd-s', ${f(T(27))}, 16);` });

say({ id: 'g-dilemma', from: 28, html: `
  <div id="gd-c" class="card scard say">
    ${pill('gd-k', '딜레마', C.pink, 'pill-soft')}
    <div class="duo2">
      <div id="gd-a" class="dcol">${ico('gd-ia', 'lock', C.coral, BG.peach, 'sm')}<div class="dct">무조건 금지?</div><div class="dcs">앞으로의 세상엔<br>AI가 필요한데…</div></div>
      <div class="vs">VS</div>
      <div id="gd-b" class="dcol">${ico('gd-ib', 'sparkle', C.yellow, BG.yellow, 'sm')}<div class="dct">자유롭게 허용?</div><div class="dcs">답은 <b>Claude</b>·<b>ChatGPT</b>가<br>주는 거니까…</div></div>
    </div>
    <div id="gd-h" class="stampbox">평가가 무의미해진다</div>
  </div>`,
  anim: `rise('#gd-c', ${f(T(28))}); up('#gd-k', ${f(T(28, .3))}, 16); slide('#gd-a', ${f(T(28, .7))}, -50); slide('#gd-b', ${f(T(29))});
  stamp('#gd-h', ${f(T(30, 1.0))}); tl.fromTo('#gd-b .dcs', {color:'#5b5873'}, {color:'#b04a6c', duration:.3, immediateRender:false}, ${f(T(31))});` });

say({ id: 'g-flip', from: 34, html: `
  <div id="gf-c" class="card scard say">
    ${pill('gf-k', 'AI 활용 능력의 역전', C.yellow, 'pill-soft')}
    <div class="bars">
      <div id="gf-b1" class="barrow">${ico('gf-i1', 'student', C.sky, BG.sky, 'xs')}<span class="blab">젊은 세대</span><div class="bar"><span id="gf-f1" class="barf" style="background:#8fc0f0"></span></div><b class="bnum">뛰어남</b></div>
      <div id="gf-b2" class="barrow">${ico('gf-i2', 'book', C.coral, BG.peach, 'xs')}<span class="blab">교수님</span><div class="bar"><span id="gf-f2" class="barf" style="background:#f3a48e"></span></div><b class="bnum">?</b></div>
    </div>
    <div id="gf-h" class="h2 sm">평가하려면 교수님도<br>${hl('AI를 굉장히 잘 아셔야', 'var(--hl-y)')} 합니다</div>
  </div>`,
  anim: `rise('#gf-c', ${f(T(34))}); up('#gf-k', ${f(T(34, .3))}, 16);
  slide('#gf-b1', ${f(T(35))}); grow('#gf-f1', ${f(T(35, .4))}, .92, 1.2); slide('#gf-b2', ${f(T(36, .5))}); grow('#gf-f2', ${f(T(36, .9))}, .45, 1.0);
  up('#gf-h', ${f(T(37))}, 24); sweep('#gf-h .hl', ${f(T(37, 1.4))}); grow('#gf-f2', ${f(T(38))}, .95, 1.2, .45);` });

say({ id: 'g-harder', from: 39, html: `
  <div id="gh-c" class="card scard say">
    ${pill('gh-k', '옛날 관점 그대로 평가한다면', C.grey, 'pill-soft')}
    <div class="chartbox">
      <svg id="gh-svg" viewBox="0 0 900 300" fill="none"><path d="M20 280H880M20 20V280" stroke="#d9d4e4" stroke-width="4"/>
        <path id="gh-line" pathLength="1" d="M40 60C220 70 360 110 480 160S740 250 860 268" stroke="#e8708f" stroke-width="10" stroke-linecap="round"/></svg>
      <div id="gh-tag" class="ctagr">평가의 정확도 ↓</div>
    </div>
    <div id="gh-h" class="h2 sm">과제 평가가 ${hl('점점 어려워진다', 'var(--hl-p)')}</div>
  </div>`,
  anim: `rise('#gh-c', ${f(T(39))}); up('#gh-k', ${f(T(41))}, 16); draw('#gh-line', ${f(T(40))}, 2.6); pop('#gh-tag', ${f(T(40, 2.4))});
  up('#gh-h', ${f(T(42))}, 24); sweep('#gh-h .hl', ${f(T(42, 1.2))});` });

full({ id: 'g-new', from: 43, html: `
  <div class="mega">
    ${ico('gn-i', 'bulb', C.yellow, BG.yellow)}
    <div id="gn-h" class="mt xl">${hl('새로운 방식', 'var(--hl-y)')}이<br>필요합니다</div>
  </div>`,
  anim: `pop('#gn-i', ${f(T(43, .1))}); slam('#gn-h', ${f(T(43, .9))}); sweep('#gn-h .hl', ${f(T(43, 1.6))});
  tl.fromTo('#gn-i', {rotation:0}, {rotation:12, duration:.15, yoyo:true, repeat:3, ease:'sine.inOut', immediateRender:false}, ${f(T(43, 1.8))});` });

// ---- 02 새로운 접근 ----------------------------------------------------------
full({ id: 'g-useit', from: 44, html: `
  <div class="mega">
    <div id="gu-k" class="sub">AI 쓰는 것을 막기 어렵다면?</div>
    <div id="gu-h" class="mt xxl"><span class="w1">AI,</span> <span class="w2">최대한</span><br><span class="w3">${hl('잘 써봐라', 'var(--hl-m)')}</span></div>
    <div id="gu-n" class="note">물론 이것도 정답은 아닙니다 · 여러 방안 중 하나</div>
  </div>`,
  anim: `up('#gu-k', ${f(T(44, .1))}, 20); slam('#gu-h .w1', ${f(T(46, .9))}); slam('#gu-h .w2', ${f(T(47, .2))}); slam('#gu-h .w3', ${f(T(47, .7))}); sweep('#gu-h .hl', ${f(T(47, 1.3))});
  up('#gu-n', ${f(T(48, .2))}, 16);` });

say({ id: 'g-harder2', from: 49, html: `
  <div id="gu2-c" class="card scard say">
    ${pill('gu2-k', '못 막는다면, 이렇게', C.mint, 'pill-soft')}
    <div class="row gap">${ok('gu2-a', 'AI 자유롭게 사용', 'big')}</div>
    <div id="gu2-p" class="plus">+</div>
    <div id="gu2-b" class="meter"><span class="mlab">대신 과제 난이도</span><div class="mbar"><span id="gu2-f" class="mfill"></span></div><b id="gu2-u" class="mup">UP</b></div>
  </div>`,
  anim: `rise('#gu2-c', ${f(T(49))}); up('#gu2-k', ${f(T(49, .3))}, 16); pop('#gu2-a', ${f(T(50))}); pop('#gu2-p', ${f(T(51, -.3))});
  up('#gu2-b', ${f(T(51))}, 20); grow('#gu2-f', ${f(T(51, .4))}, .9, 1.1); stamp('#gu2-u', ${f(T(51, 1.2))});` });

// ---- 03 과거의 과제 ----------------------------------------------------------
say({ id: 'g-old', from: 52, html: `
  <div id="go2-c" class="card scard say">
    ${pill('go2-k', '예를 들어, 과거의 과제', C.grey, 'pill-soft')}
    <div class="paper">
      <div id="go2-1" class="pline"><span class="nb">1</span><span><b>SWOT 분석</b>의 개념을 설명하고</span></div>
      <div id="go2-2" class="pline"><span class="nb">2</span><span><b>엔비디아 vs AMD</b>를 SWOT 관점에서 비교하는 리포트</span></div>
      <div id="go2-3" class="pline"><span class="nb">3</span><span>A4 5쪽 이내 · <b>워드</b>로 제출</span></div>
    </div>
    <div class="swot">${['S', 'W', 'O', 'T'].map((x, i) => `<div id="go2-s${i}" class="sw sw${i}">${x}</div>`).join('')}</div>
  </div>`,
  anim: `rise('#go2-c', ${f(T(52))}); up('#go2-k', ${f(T(52, .3))}, 16); slide('#go2-1', ${f(T(54))}); slide('#go2-2', ${f(T(55))}); slide('#go2-3', ${f(T(57))});
  ${[0, 1, 2, 3].map((i) => `pop('#go2-s${i}', ${f(T(54, .5 + i * .2))});`).join(' ')}` });

say({ id: 'g-search', from: 58, html: `
  <div id="gse-c" class="card scard say">
    ${pill('gse-k', '옛날에는 — 구글 · 네이버 검색', C.sky, 'pill-soft')}
    <div class="sbar">${ICON.search('#6aa3e6')}<span id="gse-t">딱 맞는 리포트는 많지 않죠</span></div>
    <div class="row gap">
      ${chip('gse-1', 'search', C.sky, BG.sky, 'SWOT이란?')}
      ${chip('gse-2', 'search', C.mint, BG.mint, '엔비디아')}
      ${chip('gse-3', 'search', C.coral, BG.peach, 'AMD')}
    </div>
    <div class="row gap">${chip('gse-4', 'book', C.lav, BG.lav, '그 전엔 책을 찾아보며')}<div id="gse-h" class="h3">→ 그 ${hl('과정 속에서 학습', 'var(--hl-y)')}</div></div>
  </div>`,
  anim: `rise('#gse-c', ${f(T(58))}); up('#gse-k', ${f(T(58, .3))}, 16); up('#gse-t', ${f(T(60, .3))}, 12);
  pop('#gse-1', ${f(T(61))}); pop('#gse-2', ${f(T(62))}); pop('#gse-3', ${f(T(63))}); up('#gse-h', ${f(T(64))}, 20); sweep('#gse-h .hl', ${f(T(64, .8))});
  slide('#gse-4', ${f(T(65, .3))}, -40);` });

full({ id: 'g-now', from: 68, html: `
  <div id="gnw-c" class="card fcard">
    ${pill('gnw-k', '이제는 — 이 문장만 AI에게', C.lav, 'pill-soft')}
    <div class="row gap big">
      <div id="gnw-p" class="promptbox"><div class="pbh">${ICON.chat('#9a8be6')}<span>프롬프트</span></div><div class="pbt">SWOT 개념을 설명하고 엔비디아와 AMD를 비교하는 리포트를 써줘</div></div>
      ${arrow('gnw-a')}
      <div class="pages">${[0, 1, 2, 3, 4].map((i) => `<div id="gnw-pg${i}" class="pg" style="left:${i * 34}px;top:${i * 22}px"><i></i><i></i><i></i><i></i><i class="s"></i></div>`).join('')}<div id="gnw-n" class="pgn"><span id="gnw-cnt">0</span>쪽</div></div>
    </div>
    <div class="row gap">
      ${chip('gnw-1', 'palette', C.pink, BG.pink, '원하는 스타일')}
      ${chip('gnw-2', 'music', C.sky, BG.sky, '원하는 톤')}
      <div id="gnw-w" class="docx">W<span>보고서.docx</span></div>
    </div>
  </div>`,
  anim: `rise('#gnw-c', ${f(T(68))}); up('#gnw-k', ${f(T(68, .3))}, 16); slide('#gnw-p', ${f(T(68, .9))}, -50); draw('#gnw-a path', ${f(T(69, .3))}, .5);
  ${[0, 1, 2, 3, 4].map((i) => `pop('#gnw-pg${i}', ${f(T(69, .7 + i * .35))});`).join(' ')} pop('#gnw-n', ${f(T(69, .7))}); count('#gnw-cnt', ${f(T(69, .7))}, 1.75, 5);
  pop('#gnw-1', ${f(T(71, .4))}); pop('#gnw-2', ${f(T(72, .6))}); stamp('#gnw-w', ${f(T(74))});` });

say({ id: 'g-detect', from: 75, html: `
  <div id="gdt-c" class="card scard say">
    ${pill('gdt-k', '이런 과제는 평가하기 어렵다', C.coral, 'pill-soft')}
    <div class="row gap">
      <div id="gdt-a" class="dcol sm2">${ICON.doc('#9a8be6')}<span>톤만 살짝 다른 과제</span><b>AI 썼을까? 안 썼을까?</b></div>
      <div id="gdt-b" class="gauge">
        <svg viewBox="0 0 220 130" fill="none"><path d="M20 120a90 90 0 0 1 180 0" stroke="#efe9f6" stroke-width="22" stroke-linecap="round"/>
          <path id="gdt-arc" pathLength="1" d="M20 120a90 90 0 0 1 180 0" stroke="#f3c25b" stroke-width="22" stroke-linecap="round"/>
          <g id="gdt-nd"><path d="M110 120L110 46" stroke="#34314a" stroke-width="7" stroke-linecap="round"/></g><circle cx="110" cy="120" r="11" fill="#34314a"/></svg>
        <span>AI 탐지기</span><b id="gdt-q">정확할까?</b>
      </div>
    </div>
    <div id="gdt-h" class="h2 sm">AI로 ${hl('해결하기 쉬운', 'var(--hl-p)')} 과제였다면</div>
  </div>`,
  anim: `rise('#gdt-c', ${f(T(75))}); up('#gdt-k', ${f(T(75, .3))}, 16); slide('#gdt-a', ${f(T(79, .3))}, -50);
  up('#gdt-b', ${f(T(84))}, 24); tl.fromTo('#gdt-arc', {strokeDashoffset:1}, {strokeDashoffset:.5, duration:.8, ease:'power2.out'}, ${f(T(84, .3))});
  tl.fromTo('#gdt-nd', {rotation:-80, svgOrigin:'110 120'}, {rotation:50, svgOrigin:'110 120', duration:.9, ease:'power2.out'}, ${f(T(84, .3))});
  tl.to('#gdt-nd', {rotation:-30, duration:.5, ease:'sine.inOut', yoyo:true, repeat:3}, ${f(T(84, 1.3))}); pop('#gdt-q', ${f(T(85))});
  up('#gdt-h', ${f(T(86))}, 24); sweep('#gdt-h .hl', ${f(T(86, .9))});` });

// ---- 04 AI 시대의 과제 -------------------------------------------------------
full({ id: 'g-chap', from: 87, html: `
  <div class="mega">
    <div id="gc-k" class="cc-n">제가 생각해 본</div>
    <div id="gc-h" class="mt xxl">AI ${hl('시대', 'var(--hl-y)')}의 과제</div>
    <div id="gc-s" class="sub">이런 식으로 과제를 내주면 어떨까요?</div>
  </div>`,
  anim: `up('#gc-k', ${f(T(87, .3))}, 16); slam('#gc-h', ${f(T(87, .6))}); sweep('#gc-h .hl', ${f(T(87, 1.3))}); up('#gc-s', ${f(T(89))}, 16);` });

full({ id: 'g-task', from: 90, html: `
  <div id="gt-c" class="card fcard">
    ${pill('gt-k', 'AI 시대의 과제', C.coral, 'pill-soft')}
    ${flow('gt', [['app', C.lav, BG.lav, '차별점 있는<br>SWOT 앱 직접 만들기'], ['target', C.mint, BG.mint, '그 앱으로<br>NVIDIA vs AMD 비교'], ['camera', C.coral, BG.peach, '비교 결과를<br>캡처해서 제출']], 'wide')}
  </div>`,
  anim: `rise('#gt-c', ${f(T(90))}); up('#gt-k', ${f(T(90, .2))}, 16); ${flowAnim('gt', [T(90, .5), T(91), T(92)])}` });

say({ id: 'g-diff', from: 93, html: `
  <div id="gdf-c" class="card scard say">
    ${pill('gdf-k', '“차별점이 있는” SWOT 앱이란?', C.lav, 'pill-soft')}
    <div class="apps">
      <div id="gdf-1" class="appc">${ICON.trend('#4fb489')}<b>애널리스트만을 위한</b><span>SWOT 분석 앱</span></div>
      <div id="gdf-2" class="appc">${ICON.code('#6aa3e6')}<b>개발자를 위한</b><span>SWOT 분석 앱</span></div>
      <div id="gdf-3" class="appc ghost2">${ICON.sparkle('#e7a92c')}<b>나만의 ???</b><span>SWOT 분석 앱</span></div>
    </div>
    <div id="gdf-h" class="h3">다른 사람이 ${hl('만들지 않을 만한', 'var(--hl-y)')} 앱</div>
  </div>`,
  anim: `rise('#gdf-c', ${f(T(93))}); up('#gdf-k', ${f(T(93, .3))}, 16); pop('#gdf-1', ${f(T(94))}); pop('#gdf-2', ${f(T(95))}); pop('#gdf-3', ${f(T(96))});
  up('#gdf-h', ${f(T(96, .6))}, 20); sweep('#gdf-h .hl', ${f(T(96, 1.4))});` });

say({ id: 'g-rule', from: 98, html: `
  <div id="gr-c" class="card scard say">
    ${pill('gr-k', '규칙', C.mint, 'pill-soft')}
    <div class="row gap">${ok('gr-a', 'AI 사용해도 됩니다', 'big')}${ok('gr-b', '적극 사용!', 'big')}</div>
    <div id="gr-c2" class="advice"><span class="adk">단,</span><b>AI를 사용한 과정은 전부 캡처해서 제출</b></div>
    <div id="gr-m" class="meter"><span class="mlab">과정이 자세할수록 점수</span><div class="mbar"><span id="gr-f" class="mfill mint"></span></div><b id="gr-u" class="mup mint">A+</b></div>
  </div>`,
  anim: `rise('#gr-c', ${f(T(98))}); up('#gr-k', ${f(T(98, .3))}, 16); pop('#gr-a', ${f(T(98, .5))}); pop('#gr-b', ${f(T(99, .3))});
  up('#gr-c2', ${f(T(100, .5))}, 20); up('#gr-m', ${f(T(102))}, 20); grow('#gr-f', ${f(T(102, .3))}, .95, 2.2); stamp('#gr-u', ${f(T(103, .8))});` });

say({ id: 'g-e1', from: 104, html: `
  <div id="ge1-c" class="card scard say top">
    ${stepper('ge1-st', 1)}
    <div id="ge1-h" class="h3">첫 프롬프트는 ${hl('10줄 이상', 'var(--hl-y)')}</div>
    <div id="ge1-p" class="lines">${Array.from({ length: 10 }, (_, i) => `<div id="ge1-l${i}" class="ln"><em>${i + 1}</em><i style="width:${[86, 72, 92, 64, 80, 70, 88, 58, 76, 66][i]}%"></i></div>`).join('')}</div>
    <div class="row gap">${ok('ge1-a', '직접 입력 OK', 'ok-sm')}${ok('ge1-b', '프롬프트도 AI로 OK', 'ok-sm')}<div id="ge1-c2" class="mini">${ICON.camera('#9a6a12')}<span>그 과정도 캡처</span></div></div>
  </div>`,
  anim: `rise('#ge1-c', ${f(T(104))}); up('#ge1-st', ${f(T(104, .2))}, 14); up('#ge1-h', ${f(T(105))}, 20); sweep('#ge1-h .hl', ${f(T(105, .7))});
  ${Array.from({ length: 10 }, (_, i) => `tl.fromTo('#ge1-l${i}', {opacity:0, x:-20}, {opacity:1, x:0, duration:.25, ease:'power2.out'}, ${f(T(106, i * .45))});`).join(' ')}
  pop('#ge1-a', ${f(T(108))}); pop('#ge1-b', ${f(T(109))}); pop('#ge1-c2', ${f(T(110, .5))});` });

say({ id: 'g-e2', from: 112, html: `
  <div id="ge2-c" class="card scard say top">
    ${stepper('ge2-st', 2)}
    <div id="ge2-h" class="h3">앱을 만드는 ${hl('과정을 모두 캡처', 'var(--hl-y)')}</div>
    <div class="row gap">
      <div id="ge2-t" class="tools"><span class="tl1">Claude Code</span><span class="tl2">Codex</span><span class="tl3">Antigravity</span></div>
      ${arrow('ge2-a1', 'sm')}
      <div id="ge2-g" class="tbox">${ICON.git('#34314a')}<span>GitHub</span></div>
      ${arrow('ge2-a2', 'sm')}
      <div id="ge2-d" class="tools"><span class="tl4">Netlify</span><span class="tl5">Vercel</span></div>
    </div>
    <div id="ge2-k" class="mini">${ICON.clock('#9a6a12')}<span>앱 만드는 데 걸린 시간도 적기</span></div>
  </div>`,
  anim: `rise('#ge2-c', ${f(T(112))}); up('#ge2-st', ${f(T(112, .2))}, 14); up('#ge2-h', ${f(T(112, .5))}, 20); sweep('#ge2-h .hl', ${f(T(112, 1.3))});
  up('#ge2-t', ${f(T(113))}, 16); pop('#ge2-t .tl1', ${f(T(113, .1))}); pop('#ge2-t .tl2', ${f(T(114))}); pop('#ge2-t .tl3', ${f(T(115))});
  draw('#ge2-a1 path', ${f(T(116))}, .4); pop('#ge2-g', ${f(T(116, .4))}); draw('#ge2-a2 path', ${f(T(117))}, .4);
  up('#ge2-d', ${f(T(118))}, 16); pop('#ge2-d .tl4', ${f(T(118, .1))}); pop('#ge2-d .tl5', ${f(T(119))}); pop('#ge2-k', ${f(T(121, .3))});` });

say({ id: 'g-e3', from: 123, html: `
  <div id="ge3-c" class="card scard say top">
    ${stepper('ge3-st', 3)}
    <div class="row gap"><div id="ge3-n" class="bignum"><span id="ge3-cnt">0</span><small>회+</small></div><div id="ge3-h" class="h3 left">완성된 앱을<br>${hl('10회 이상 개선', 'var(--hl-m)')}</div></div>
    <div class="commits"><div class="cline"></div>${Array.from({ length: 10 }, (_, i) => `<span id="ge3-d${i}" class="cdot" style="left:${30 + i * 98}px"></span>`).join('')}</div>
    <div id="ge3-g" class="mini">${ICON.git('#9a6a12')}<span>GitHub 커밋 기록 제출 → 진짜 AI로 수정했는지 확인</span></div>
  </div>`,
  anim: `rise('#ge3-c', ${f(T(123))}); up('#ge3-st', ${f(T(123, .2))}, 14); pop('#ge3-n', ${f(T(124))}); up('#ge3-h', ${f(T(124, .3))}, 20); sweep('#ge3-h .hl', ${f(T(125))});
  count('#ge3-cnt', ${f(T(124, .2))}, 2.6, 10); ${Array.from({ length: 10 }, (_, i) => `pop('#ge3-d${i}', ${f(T(124, .2 + i * .26))});`).join(' ')}
  pop('#ge3-g', ${f(T(126))}); tl.fromTo('.cdot', {backgroundColor:'#9a8be6'}, {backgroundColor:'#4fb489', duration:.4, stagger:.08, immediateRender:false}, ${f(T(131))});` });

say({ id: 'g-e4', from: 134, html: `
  <div id="ge4-c" class="card scard say top">
    ${stepper('ge4-st', 4)}
    <div class="row gap">${ico('ge4-i', 'present', C.lav, BG.lav)}<div id="ge4-h" class="h3 left">내 앱은 ${hl('무엇이 다른가', 'var(--hl-y)')}<br>학생들 앞에서 발표</div></div>
    <div class="row gap">
      <div id="ge4-t" class="timer">${ICON.clock('#e8708f')}<b>5:00</b></div>
      ${chip('ge4-1', 'zap', C.yellow, BG.yellow, '강점')}
      ${chip('ge4-2', 'target', C.mint, BG.mint, '차별점')}
    </div>
  </div>`,
  anim: `rise('#ge4-c', ${f(T(134))}); up('#ge4-st', ${f(T(134, .2))}, 14); pop('#ge4-i', ${f(T(134, .5))}); up('#ge4-h', ${f(T(135))}, 20); sweep('#ge4-h .hl', ${f(T(135, .8))});
  pop('#ge4-t', ${f(T(136))}); pop('#ge4-1', ${f(T(137, .4))}); pop('#ge4-2', ${f(T(138, .2))});` });

// ---- 05 왜 이 방식일까? -------------------------------------------------------
full({ id: 'g-vs', from: 140, html: `
  <div id="gv-c" class="card fcard">
    ${pill('gv-k', '이런 과제를 내주면', C.coral, 'pill-soft')}
    <div class="duo2 wide">
      <div id="gv-a" class="cmp2 bad col">${ico('gv-ia', 'robot', C.grey, BG.grey, 'sm')}<b>“SWOT 앱 만들어 줘”</b><span>AI에게 간단히 부탁한 학생</span></div>
      <div class="vs">VS</div>
      <div id="gv-b" class="cmp2 good col">${ico('gv-ib', 'brain', C.mint, BG.mint, 'sm')}<b>“어떤 차별점을 줄까?”</b><span>스스로 고민한 학생</span></div>
    </div>
    <div id="gv-h" class="h2 sm">결과물이 ${hl('다를 수밖에', 'var(--hl-m)')} 없습니다</div>
  </div>`,
  anim: `rise('#gv-c', ${f(T(140))}); up('#gv-k', ${f(T(140, .3))}, 16); slide('#gv-a', ${f(T(142))}, -60); slide('#gv-b', ${f(T(143))});
  up('#gv-h', ${f(T(145))}, 24); sweep('#gv-h .hl', ${f(T(145, 1.2))});
  tl.fromTo('#gv-b', {scale:1}, {scale:1.05, duration:.3, yoyo:true, repeat:1, ease:'power2.out', immediateRender:false}, ${f(T(145, .4))});` });

full({ id: 'g-sure', from: 146, html: `
  <div class="mega">
    <div id="gsu-h" class="mt xl">AI 쓸 거면 <span class="w2">${hl('확실하게', 'var(--hl-y)')}</span></div>
    <div id="gsu-s" class="mt md">그리고 고민 많이 해보기</div>
  </div>`,
  anim: `slam('#gsu-h', ${f(T(146, .1))}); sweep('#gsu-h .hl', ${f(T(146, 1.0))}); up('#gsu-s', ${f(T(147, .2))}, 30);` });

say({ id: 'g-build', from: 148, html: `
  <div id="gb-c" class="card scard say">
    ${pill('gb-k', '제가 직접 AI로 이것저것 만들어 보니', C.sky, 'pill-soft')}
    <div class="bars">
      <div id="gb-b1" class="barrow">${ico('gb-i1', 'chat', C.grey, BG.grey, 'xs')}<span class="blab w2">텍스트로 질문 → 답</span><div class="bar"><span id="gb-f1" class="barf" style="background:#c9c4d6"></span></div></div>
      <div id="gb-b2" class="barrow">${ico('gb-i2', 'app', C.lav, BG.lav, 'xs')}<span class="blab w2">직접 빌드해 보기</span><div class="bar"><span id="gb-f2" class="barf" style="background:#9a8be6"></span></div></div>
    </div>
    <div class="row gap">${ico('gb-br', 'brain', C.pink, BG.pink, 'sm')}<div id="gb-h" class="h3">머리를 ${hl('상당히 쓰게', 'var(--hl-p)')} 됩니다</div></div>
  </div>`,
  anim: `rise('#gb-c', ${f(T(148))}); up('#gb-k', ${f(T(148, .3))}, 16);
  slide('#gb-b1', ${f(T(150))}); grow('#gb-f1', ${f(T(151))}, .22, .8); slide('#gb-b2', ${f(T(152))}); grow('#gb-f2', ${f(T(153))}, .96, 1.6);
  pop('#gb-br', ${f(T(154))}); up('#gb-h', ${f(T(154, .2))}, 20); sweep('#gb-h .hl', ${f(T(154, .8))});
  tl.fromTo('#gb-br', {scale:1}, {scale:1.18, duration:.25, yoyo:true, repeat:3, ease:'sine.inOut', immediateRender:false}, ${f(T(154, .9))});` });

full({ id: 'g-paradox', from: 155, html: `
  <div class="mega">
    <div id="gp-k" class="qbub wide">학생들이 사고력·논리력을 키워야 하는데 <b>AI 때문에 어렵다</b></div>
    <div id="gp-t" class="cc-n">그렇다면 역설적으로</div>
    <div id="gp-h" class="mt xl">AI를 ${hl('최대한', 'var(--hl-y)')} 써서<br>뭔가를 만들어봐라</div>
    <div id="gp-s" class="sub">그 과정에서 <b>머리를 써보도록</b></div>
  </div>`,
  anim: `up('#gp-k', ${f(T(156))}, 20); up('#gp-t', ${f(T(158, 1.0))}, 16); slam('#gp-h', ${f(T(158, 2.2))}); sweep('#gp-h .hl', ${f(T(158, 3.0))}); up('#gp-s', ${f(T(159))}, 16);
  tl.to('#gp-k', {opacity:.45, scale:.94, duration:.5, ease:'power2.out'}, ${f(T(158, 2.0))});` });

say({ id: 'g-flowai', from: 161, html: `
  <div id="gfa-c" class="card scard say">
    ${pill('gfa-k', '정답은 아닙니다 · 하나의 방법일 뿐', C.grey, 'pill-soft')}
    <div class="row gap">${ico('gfa-i', 'wave', C.sky, BG.sky)}<div id="gfa-h" class="h3 left">AI는 이제 막을 수 없는<br>${hl('큰 흐름', 'var(--hl-y)')}이 됐습니다</div></div>
    <div id="gfa-r" class="eq hot">${ico('gfa-i2', 'student', C.coral, BG.peach, 'xs')}<span>학생들이</span><b>유리하게 AI를 쓰도록 유도</b></div>
    <div id="gfa-s" class="sub">그게 <b>교육자의 역할</b>이라고 생각합니다</div>
  </div>`,
  anim: `rise('#gfa-c', ${f(T(161))}); up('#gfa-k', ${f(T(161, .3))}, 16); pop('#gfa-i', ${f(T(163))}); up('#gfa-h', ${f(T(164))}, 20); sweep('#gfa-h .hl', ${f(T(165, .3))});
  slide('#gfa-r', ${f(T(166))}); up('#gfa-s', ${f(T(169))}, 16);` });

full({ id: 'g-sum', from: 170, html: `
  <div id="gsm-c" class="card fcard">
    ${pill('gsm-k', '정리하면', C.coral, 'pill-soft')}
    ${flow('gsm', [['sparkle', C.yellow, BG.yellow, 'AI를 활용해서'], ['app', C.lav, BG.lav, '무언가를<br>만들어내는 과제'], ['brain', C.mint, BG.mint, '사고력 · 논리력<br>UP']], 'wide')}
    <div id="gsm-h" class="h2 sm">이것이 ${hl('AI 시대만의 과제', 'var(--hl-y)')}</div>
  </div>`,
  anim: `rise('#gsm-c', ${f(T(170))}); up('#gsm-k', ${f(T(170, .2))}, 16); up('#gsm-h', ${f(T(170, .5))}, 20); sweep('#gsm-h .hl', ${f(T(170, 1.2))});
  ${flowAnim('gsm', [T(171), T(172, .3), T(174)])}` });

// ---- 06 교육자분들께 ---------------------------------------------------------
say({ id: 'g-cmt', from: 175, html: `
  <div id="gcm-c" class="card scard say">
    ${pill('gcm-k', '여러분의 생각을 들려주세요', C.mint, 'pill-soft')}
    <div class="row gap">${ico('gcm-i', 'chat', C.mint, BG.mint)}<div id="gcm-h" class="h3 left">또 다른 아이디어 ·<br>지금 하고 계신 ${hl('좋은 방법', 'var(--hl-m)')}</div></div>
    <div id="gcm-b" class="cta mintc">${ICON.chat('#ffffff')}<span>댓글로 알려주세요</span></div>
  </div>`,
  anim: `rise('#gcm-c', ${f(T(175))}); up('#gcm-k', ${f(T(175, .3))}, 16); pop('#gcm-i', ${f(T(176))}); up('#gcm-h', ${f(T(176, .3))}, 20); sweep('#gcm-h .hl', ${f(T(177, .6))}); stamp('#gcm-b', ${f(T(178))});` });

full({ id: 'g-thanks', from: 179, html: `
  <div class="mega">
    ${ico('gth-i', 'heart', C.pink, BG.pink)}
    <div id="gth-k" class="sub">우리 교수님들, 선생님들</div>
    <div id="gth-h" class="mt xl">AI 시대에<br>${hl('고생 많으십니다', 'var(--hl-p)')}</div>
  </div>`,
  anim: `pop('#gth-i', ${f(T(179, .2))}); up('#gth-k', ${f(T(179, .4))}, 16); slam('#gth-h', ${f(T(180))}); sweep('#gth-h .hl', ${f(T(180, .7))});
  tl.fromTo('#gth-i', {scale:1}, {scale:1.15, duration:.3, yoyo:true, repeat:5, ease:'sine.inOut', immediateRender:false}, ${f(T(180, 1.2))});` });

say({ id: 'g-pioneer', from: 181, html: `
  <div id="gpi-c" class="card scard say">
    ${pill('gpi-k', '교육자분들은', C.lav, 'pill-soft')}
    <div class="row gap">${ico('gpi-i', 'wind', C.sky, BG.sky)}<div id="gpi-h" class="h3 left">늘 앞선에서 바람을 맞는<br>${hl('선구자', 'var(--hl-y)')}</div></div>
    <div id="gpi-s" class="sub">변화가 너무 큰 AI 시대 — 학생들이 <b>잘 적응하도록</b> 애쓰고 계십니다</div>
  </div>`,
  anim: `rise('#gpi-c', ${f(T(181))}); up('#gpi-k', ${f(T(181, .3))}, 16); pop('#gpi-i', ${f(T(182))}); up('#gpi-h', ${f(T(182, .3))}, 20); sweep('#gpi-h .hl', ${f(T(183, .8))});
  tl.fromTo('#gpi-i svg', {x:-6}, {x:6, duration:.4, yoyo:true, repeat:7, ease:'sine.inOut', immediateRender:false}, ${f(T(182, .4))}); up('#gpi-s', ${f(T(184))}, 16);` });

say({ id: 'g-me', from: 189, html: `
  <div id="gme-c" class="card scard say">
    ${pill('gme-k', '필로소피 AI 교육', C.coral, 'pill-soft')}
    <div id="gme-h" class="h2 sm">교육자분들의 고민을<br>${hl('함께 해결', 'var(--hl-m)')}하고 싶습니다</div>
    <div id="gme-s" class="sub">그 고민의 일환으로 만든 영상입니다</div>
  </div>`,
  anim: `rise('#gme-c', ${f(T(189))}); up('#gme-k', ${f(T(189, .3))}, 16); up('#gme-h', ${f(T(189, 1.0))}, 24); sweep('#gme-h .hl', ${f(T(189, 2.5))}); up('#gme-s', ${f(T(191))}, 16);` });

say({ id: 'g-next', from: 193, html: `
  <div id="gnx-c" class="card scard say">
    ${pill('gnx-k', '다음 영상 예고', C.yellow, 'pill-soft')}
    <div class="row gap">
      <div id="gnx-app" class="mock"><div class="mbarh"><i></i><i></i><i></i><span>SWOT Analyzer</span></div>
        <div class="swot sm">${['S', 'W', 'O', 'T'].map((x, i) => `<div id="gnx-s${i}" class="sw sw${i}">${x}</div>`).join('')}</div></div>
      <div id="gnx-h" class="h3 left">SWOT 분석 앱<br>${hl('직접 만들어 보기', 'var(--hl-y)')}</div>
    </div>
    <div id="gnx-s" class="sub">어떻게 만드는지 교수님들께 알려드릴게요</div>
  </div>`,
  anim: `rise('#gnx-c', ${f(T(193))}); up('#gnx-k', ${f(T(193, .3))}, 16); pop('#gnx-app', ${f(T(193, .8))}); ${[0, 1, 2, 3].map((i) => `pop('#gnx-s${i}', ${f(T(193, 1.4 + i * .2))});`).join(' ')}
  up('#gnx-h', ${f(T(193, 1.2))}, 20); sweep('#gnx-h .hl', ${f(T(193, 2.2))}); up('#gnx-s', ${f(T(194))}, 16);` });

SC.push({ id: 'g-end', from: 196, kind: 'say', end: true, html: '', anim: '' });

SC.forEach((g, i) => { g.s = i ? T(g.from, -0.12) : 0; });
SC.forEach((g, i) => { g.e = i < SC.length - 1 ? SC[i + 1].s : DUR; });

// ---------- pastel stage (whole video) + character ---------------------------
let seed = 20261027;
const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const decorPos = [[120, 140], [420, 90], [780, 60], [1180, 110], [1560, 80], [1820, 190], [70, 480], [1860, 470], [160, 800], [560, 840], [1360, 850], [1780, 780], [980, 820], [300, 360], [1640, 330]];
const decor = decorPos.map(([x, y], i) => ({ id: `dc${i}`, x, y, kind: ['dia', 'ring', 'dot', 'dia', 'dot'][i % 5], color: ['#7fd1ae', '#b9acf2', '#f4c25b', '#f39a86', '#f3a3b8'][i % 5],
  size: (14 + rand() * 12).toFixed(1), ph: +rand().toFixed(3), amp: +(5 + rand() * 7).toFixed(1) }));
const stageHTML = `<div id="stagebg" class="stagebg">
    <div class="blob b1" data-layout-allow-overflow style="left:-220px;top:-200px;width:900px;height:760px;background:radial-gradient(closest-side,rgba(255,205,186,.75),rgba(255,205,186,0))"></div>
    <div class="blob b2" data-layout-allow-overflow style="left:1180px;top:380px;width:980px;height:820px;background:radial-gradient(closest-side,rgba(207,195,255,.7),rgba(207,195,255,0))"></div>
    <div class="blob b3" data-layout-allow-overflow style="left:700px;top:-260px;width:760px;height:600px;background:radial-gradient(closest-side,rgba(185,232,209,.6),rgba(185,232,209,0))"></div>
    ${decor.map((x) => `<span id="${x.id}" class="dc dc-${x.kind}" style="left:${x.x}px;top:${x.y}px;width:${x.size}px;height:${x.size}px;--c:${x.color}"></span>`).join('')}
  </div>
  <div id="charclip" class="charclip">
    <div id="cwrap" class="cwrap">
      <img id="phil" class="cphil" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
      <div class="ctag">${pill('ck', '필로소피', C.coral)}</div>
    </div>
  </div>`;
// character steps out for 'full' scenes and back in for 'say' scenes
const charAnim = [`tl.set('#cwrap', {opacity:0, x:-620}, 0);`];
SC.forEach((g, i) => {
  const prev = i ? SC[i - 1].kind : 'full';
  if (g.kind === prev) return;
  charAnim.push(g.kind === 'say'
    ? `tl.fromTo('#cwrap', {opacity:0, x:-620}, {opacity:1, x:0, duration:.7, ease:'back.out(1.3)', immediateRender:false}, ${f(g.s + 0.05)});`
    : `tl.fromTo('#cwrap', {opacity:1, x:0}, {opacity:0, x:-620, duration:.5, ease:'power2.in', immediateRender:false}, ${f(g.s - 0.2)});`);
});
SC.forEach((g, i) => { if (g.kind === 'say' && i && SC[i - 1].kind === 'say')
  charAnim.push(`tl.fromTo('#phil', {y:0}, {y:-26, duration:.18, ease:'power2.out', yoyo:true, repeat:1, immediateRender:false}, ${f(g.s)});`); });
const stageAnim = `
  ${charAnim.join('\n  ')}
  { const cyc = .46, n = Math.max(0, Math.floor(${DUR - 2} / cyc) - 1);
    tl.fromTo('#phil', {scaleY:1, scaleX:1}, {scaleY:1.018, scaleX:.992, duration:cyc / 2, ease:'sine.inOut', yoyo:true, repeat:n * 2 + 1, immediateRender:false}, 1);
    const c2 = 2.6, m = Math.max(0, Math.floor(${DUR - 2} / c2) - 1);
    tl.fromTo('#cwrap', {rotation:-1.6}, {rotation:1.6, duration:c2 / 2, ease:'sine.inOut', yoyo:true, repeat:m * 2 + 1, immediateRender:false}, 1);
    const c3 = 14, k = Math.max(0, Math.floor(${DUR} / c3) - 1);
    tl.fromTo('#stagebg .blob', {scale:1, x:0}, {scale:1.12, x:40, duration:c3 / 2, ease:'sine.inOut', yoyo:true, repeat:k * 2 + 1, stagger:.4}, 0); }
  { const dec = ${JSON.stringify(decor.map((x) => ({ id: x.id, ph: x.ph, amp: x.amp })))};
    const els = dec.map((x) => document.getElementById(x.id)); const drv = { t: 0 };
    tl.fromTo(drv, { t: 0 }, { t: ${DUR}, duration: ${DUR}, ease: 'none', onUpdate: () => {
      for (let i = 0; i < dec.length; i++) { const a = (drv.t / 9 + dec[i].ph) * Math.PI * 2;
        els[i].style.transform = 'translate(' + (Math.cos(a * .7) * dec[i].amp).toFixed(2) + 'px,' + (Math.sin(a) * dec[i].amp * 1.4).toFixed(2) + 'px) rotate(' + (45 + Math.sin(a * .5) * 30).toFixed(1) + 'deg)'; } } }, 0); }`;

// ---------- end card ---------------------------------------------------------
const endHTML = `<div id="endclip" class="clip" data-start="${f(END_S)}" data-duration="${f(DUR - END_S)}" data-track-index="5">
    <div id="end-in" class="endin">
      <div id="end-k" class="end-k">오늘의 영상은 여기까지입니다</div>
      <div id="end-h" class="end-big">AI 시대의 과제,<br>${hl('함께 고민해요', 'var(--hl-y)')}</div>
      <div class="row gap">
        <div id="end-like" class="cta">${ICON.thumb('#ffffff')}<span>좋아요</span></div>
        <div id="end-sub" class="cta sub2">${ICON.bell('#ffffff')}<span>구독</span></div>
      </div>
      <div id="end-t" class="end-mid">감사합니다 · 필로소피 AI 교육</div>
    </div>
  </div>`;
const endAnim = `
  rise('#end-in', ${f(END_S + 0.1)}); up('#end-k', ${f(END_S + 0.3)}, 16); up('#end-h', ${f(END_S + 0.5)}, 30); sweep('#end-h .hl', ${f(END_S + 1.2)});
  pop('#end-like', ${f(T(198, 0.3))}); pop('#end-sub', ${f(T(198, 0.9))}); up('#end-t', ${f(T(199, -0.1))}, 14);
  tl.fromTo('#end-like', {rotation:0}, {rotation:-12, duration:.18, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(T(198, 1.0))});
  tl.fromTo('#end-sub svg', {rotation:0}, {rotation:16, duration:.12, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(198, 1.6))});
  tl.fromTo('#phil', {rotation:0}, {rotation:-5, duration:.3, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(END_S + 0.4)});`;

// ---------- section chips ---------------------------------------------------
const sections = [
  [0, T(44, -0.12), '01', '교수님들의 고민'],
  [T(44, -0.12), T(52, -0.12), '02', '새로운 접근'],
  [T(52, -0.12), T(87, -0.12), '03', '과거의 과제'],
  [T(87, -0.12), T(140, -0.12), '04', 'AI 시대의 과제'],
  [T(140, -0.12), T(175, -0.12), '05', '왜 이 방식일까?'],
  [T(175, -0.12), END_S, '06', '교육자분들께'],
];
const secHTML = sections.map(([s, e, n, label], i) =>
  `<div id="sec${i}" class="chapter clip" data-start="${f(s)}" data-duration="${f(e - s)}" data-track-index="6"><div id="sec${i}-in" class="chip-in"><b>${n}</b><span>${label}</span></div></div>`).join('\n');
const secAnim = sections.map(([s], i) => `tl.fromTo('#sec${i}-in', {opacity:0, x:30}, {opacity:1, x:0, duration:.5, ease:'power3.out'}, ${f(s + 0.3)});`).join('\n  ');

// ---------- assemble ---------------------------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const G = SC.filter((g) => !g.end);
const gHTML = G.map((g) => `
<div id="${g.id}" class="scene clip" data-start="${f(g.s)}" data-duration="${f(g.e - g.s)}" data-track-index="2">
  <div id="${g.id}-sc" class="sc">${g.html}
  </div>
</div>`).join('\n');
const gAnim = G.map((g) => `
  // ${g.id}
  tl.fromTo('#${g.id}-sc', {opacity:0}, {opacity:1, duration:.4, ease:'power2.out'}, ${f(g.s)});
  tl.to('#${g.id}-sc', {opacity:0, duration:.35, ease:'power2.in'}, ${f(g.e - 0.37)});
  ${g.anim.trim()}`).join('\n');
const capHTML = cues.map((c, i) =>
  `<div id="cap${i}" class="cap clip" data-start="${c.s.toFixed(3)}" data-duration="${Math.max(0.2, Math.min(c.e, DUR) - c.s).toFixed(3)}" data-track-index="8"><span>${esc(c.text)}</span></div>`).join('\n');

const css = fs.readFileSync(path.join(root, 'assets/base.css'), 'utf8') + fs.readFileSync(path.join(root, 'assets/extra.css'), 'utf8');
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>AI 시대의 과제</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
${css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
  <audio id="vo" src="assets/media/narration.m4a" data-start="0" data-duration="${DUR}" data-track-index="0"></audio>
  ${stageHTML}
${gHTML}
  <div id="brand"><span class="pdot" style="background:#9a8be6"></span><span>필로소피</span><b>AI 교육</b></div>
${secHTML}
${endHTML}
  <div id="band"><span class="bdot" style="left:40px;top:70px;width:16px;height:16px;background:#ffc7b4"></span><span class="bdot" style="left:68px;top:94px;width:10px;height:10px;background:#b9e8d1"></span><span class="bdot" style="right:46px;top:66px;width:14px;height:14px;background:#cfc3ff"></span><span class="bdot" style="right:72px;top:96px;width:10px;height:10px;background:#ffe39c"></span></div>
${capHTML}
  <div id="startfade"></div>
  <div id="endfade"></div>
</div>
<script>
(function () {
  const tl = gsap.timeline({ paused: true });
  const pop = (sel, t) => tl.fromTo(sel, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.8)' }, t);
  const up = (sel, t, dy = 30) => tl.fromTo(sel, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, t);
  const rise = (sel, t) => tl.fromTo(sel, { opacity: 0, y: 70, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .65, ease: 'expo.out' }, t);
  const slide = (sel, t, dx = 60) => tl.fromTo(sel, { opacity: 0, x: dx }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, t);
  const sweep = (sel, t) => tl.fromTo(sel, { backgroundSize: '0% 38%' }, { backgroundSize: '100% 38%', duration: .7, ease: 'power2.inOut', immediateRender: false }, t);
  const draw = (sel, t, d) => tl.fromTo(sel, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: 'power2.out' }, t);
  const slam = (sel, t) => tl.fromTo(sel, { opacity: 0, scale: 1.35, y: -10 }, { opacity: 1, scale: 1, y: 0, duration: .5, ease: 'expo.out' }, t);
  const stamp = (sel, t) => tl.fromTo(sel, { opacity: 0, scale: 2.2, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: .45, ease: 'back.out(2.2)' }, t);
  const grow = (sel, t, to, d, from = 0) => tl.fromTo(sel, { scaleX: from }, { scaleX: to, duration: d, ease: 'power2.out', immediateRender: from === 0 }, t);
  const count = (sel, t, d, n) => { const el = document.querySelector(sel); const o = { v: 0 };
    tl.fromTo(o, { v: 0 }, { v: n, duration: d, ease: 'none', onUpdate: () => { el.textContent = Math.round(o.v); } }, t); };

  tl.fromTo('#startfade', { opacity: 1 }, { opacity: 0, duration: .5, ease: 'power1.out' }, 0);

  // stage + character
  ${stageAnim}

  // sections
  ${secAnim}

  // scenes
${gAnim}

  // end card
  ${endAnim}
  tl.fromTo('#endfade', { opacity: 0 }, { opacity: 1, duration: .7, ease: 'power1.in' }, ${f(DUR - 0.7)});

  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Built ${G.length} scenes (${G.filter((g) => g.kind === 'say').length} say / ${G.filter((g) => g.kind === 'full').length} full), ${cues.length} captions, end ${END_S}–${DUR}`);
