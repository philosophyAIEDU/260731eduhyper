import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// AI 시대의 과제 — 직접 해보기 편 (16:23) — generator for index.html.
//
// Sound:    assets/media/narration.m4a (AI 시대의 과제 영상.mp4 의 오디오 0–983s, 976.9s 이후 무음 오로라 구간은 엔드카드로 덮음)
// Picture:  원본은 PPT 화면 녹화라 쓰지 않는다 — 이론·정리 구간은 파스텔 모션그래픽 + 필로소피 캐릭터,
//           실습 구간은 PPT 에 들어 있던 깨끗한 캡처(assets/shots, 박힌 자막·빨간 펜 없음)를 창 프레임에 담아
//           확대/이동 + 하이라이트 + 오른쪽 실습 노트로 보여준다 (shots.json).
// Captions: assets/captions.srt (AI 시대의 과제 자막.srt) — 표기 교정은 FIX 참고.
// Scenes are pinned to SRT cue numbers: T(cue) = cue start, TE(cue) = cue end.
//   kind 'say'  — character on the left, speech card on the right
//   kind 'full' — character steps out, wide card / impact typography in the centre
//   kind 'shot' — practice screen: window (left) + practice note (right); shot → shot cross-dissolves
//
// 수정: 아래 scenes / shots.json → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const FIX = [[/SWAT 웹/g, 'SWOT 앱'], [/SWAT/g, 'SWOT'], [/안티그래피티/g, '안티그래비티'], [/네틀리파이|네트리파이/g, '넷리파이'],
  [/버스에서 배포/g, '버셀에서 배포'], [/EU 1027 SWOT/g, '261027swot'], [/Gemini 3\.5 Flashlight/g, 'Gemini 3.5 Flash-Lite'],
  [/3\.5 플래시라이트/g, '3.5 Flash-Lite'], [/클로드 코-코드/g, '클로드 코드'], [/이거 개 비교/g, '이 두 회사를 비교'], [/주방이-주방이/g, '주방이']];
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const cues = fs.readFileSync(path.join(root, 'assets/captions.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .map((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); return { n: +l[0], s: srtSec(m[1]), e: srtSec(m[2]), text: FIX.reduce((t, [a, b]) => t.replace(a, b), l.slice(2).join(' ')) }; });
const CUE = Object.fromEntries(cues.map((c) => [c.n, c]));
const DUR = 983;

const T = (n, off = 0) => { const c = CUE[n]; if (!c) throw new Error(`cue ${n}`); return +(c.s + off).toFixed(3); };
const TE = (n, off = 0) => { const c = CUE[n]; if (!c) throw new Error(`cue ${n}`); return +(c.e + off).toFixed(3); };
const END_S = T(473, -0.1);

// ---------- icons ----------------------------------------------------------

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

Object.assign(ICON, {
  key: (c) => S(c, `<circle cx="22" cy="40" r="12"/><path d="M31 32l22-22M44 18l7 7M38 24l5 5"/>`),
  image: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="6"/><circle cx="23" cy="26" r="5"/><path d="M8 46l14-12 10 8 10-10 14 12"/>`),
  merge: (c) => S(c, `<circle cx="18" cy="12" r="6"/><circle cx="18" cy="52" r="6"/><circle cx="46" cy="22" r="6"/><path d="M18 18v28M46 28c0 12-14 14-26 22"/>`),
});

// ---------- scenes ---------------------------------------------------------
// { id, from (cue), kind, html, anim } — s = T(from) - .12, e = next scene's s
const SC = [];
const say = (g) => SC.push({ kind: 'say', ...g });
const full = (g) => SC.push({ kind: 'full', ...g });
const f = (t) => t.toFixed(2);
const stepper = (id, act) => `<div id="${id}" class="stepper">${['첫 프롬프트', '과정 캡처', '10회 개선', '차별점 시연'].map((l, i) =>
  `<div class="stp${i + 1 === act ? ' on' : i + 1 < act ? ' done' : ''}"><b>${i + 1}</b><span>${l}</span></div>`).join('')}</div>`;
const swot4 = (id, cls = '') => `<div class="swot ${cls}">${['S', 'W', 'O', 'T'].map((x, i) => `<div id="${id}-s${i}" class="sw sw${i}">${x}</div>`).join('')}</div>`;
const swotPop = (id, t) => [0, 1, 2, 3].map((i) => `pop('#${id}-s${i}', ${f(t + i * 0.18)});`).join(' ');

// ---- 01 들어가며 ------------------------------------------------------------
full({ id: 'g-open', from: 1, html: `
  <div class="mega">
    ${pill('go-k', '필로소피 AI 교육 · 지난 시간에 이어서', C.coral, 'pill-soft')}
    <div id="go-h" class="mt xxl">AI ${hl('시대', 'var(--hl-y)')}의 과제</div>
    <div id="go-s" class="sub">과제를 내고, <b>직접 해 보기</b>까지</div>
  </div>`,
  anim: `up('#go-k', .3, 16); slam('#go-h', ${f(T(3))}); sweep('#go-h .hl', ${f(T(3, .7))}); up('#go-s', ${f(T(3, 1.4))}, 16);` });

say({ id: 'g-worry', from: 4, html: `
  <div id="gw-c" class="card scard say">
    ${pill('gw-k', '많은 교수님들의 고민', C.sky, 'pill-soft')}
    ${flow('gw', [['student', C.sky, BG.sky, '학생'], ['robot', C.lav, BG.lav, 'AI 활용'], ['doc', C.coral, BG.peach, '과제 제출']])}
    <div id="gw-h" class="h2">이 과제, ${hl('어떻게 평가', 'var(--hl-p)')}할까요?</div>
  </div>`,
  anim: `rise('#gw-c', ${f(T(4))}); up('#gw-k', ${f(T(4, .3))}, 16); ${flowAnim('gw', [T(5), T(5, .9), T(6)])}
  up('#gw-h', ${f(T(7))}, 26); sweep('#gw-h .hl', ${f(T(7, 1.2))});` });

full({ id: 'g-use', from: 8, html: `
  <div class="mega">
    <div id="gu-h" class="mt xl"><span class="w1">“AI를 쓸 거면</span><br><span class="w2">${hl('제대로', 'var(--hl-m)')} 써봐라”</span></div>
    <div id="gu-s" class="sub">그렇다면 과제는 <b>어떻게</b> 내 주면 좋을까?</div>
    <div id="gu-n" class="note">그 과제를 제가 <b>직접 해 본 과정</b>까지 보여드립니다</div>
  </div>`,
  anim: `slam('#gu-h .w1', ${f(T(8, .2))}); slam('#gu-h .w2', ${f(T(8, 1.6))}); sweep('#gu-h .hl', ${f(T(8, 2.2))});
  up('#gu-s', ${f(T(11))}, 20); up('#gu-n', ${f(T(13))}, 16);` });

// ---- 02 AI 시대의 과제 -------------------------------------------------------
say({ id: 'g-old', from: 14, html: `
  <div id="go2-c" class="card scard say">
    ${pill('go2-k', '옛날식 과제', C.grey, 'pill-soft')}
    <div class="paper">
      <div id="go2-1" class="pline"><span class="nb">1</span><span><b>SWOT</b>의 개념을 설명하고</span></div>
      <div id="go2-2" class="pline"><span class="nb">2</span><span><b>엔비디아 vs AMD</b>를 비교한 글을</span></div>
      <div id="go2-3" class="pline"><span class="nb">3</span><span><b>A4 다섯 장</b> 이내로 작성해 와라</span></div>
    </div>
    ${swot4('go2')}
  </div>`,
  anim: `rise('#go2-c', ${f(T(14))}); up('#go2-k', ${f(T(14, .3))}, 16); slide('#go2-1', ${f(T(15))}); slide('#go2-2', ${f(T(16))}); slide('#go2-3', ${f(T(17))});
  ${swotPop('go2', T(15, .5))}` });

full({ id: 'g-new', from: 19, html: `
  <div id="gn-c" class="card fcard">
    ${pill('gn-k', '요즘식 과제', C.coral, 'pill-soft')}
    ${flow('gn', [['app', C.lav, BG.lav, '차별점이 있는<br>SWOT 분석 앱 만들기'], ['target', C.mint, BG.mint, '그 앱으로<br>NVIDIA vs AMD 비교'], ['camera', C.coral, BG.peach, '과정을 캡처해서<br>제출']], 'wide')}
  </div>`,
  anim: `rise('#gn-c', ${f(T(19))}); up('#gn-k', ${f(T(19, .2))}, 16); ${flowAnim('gn', [T(19, .8), T(21), T(21, 1.6)])}` });

say({ id: 'g-diff', from: 22, html: `
  <div id="gdf-c" class="card scard say">
    ${pill('gdf-k', '“차별점이 있는” 앱이란?', C.lav, 'pill-soft')}
    <div class="apps">
      <div id="gdf-1" class="appc">${ICON.trend('#4fb489')}<b>애널리스트를 위한</b><span>SWOT 분석 앱</span></div>
      <div id="gdf-2" class="appc">${ICON.code('#6aa3e6')}<b>개발자를 위한</b><span>SWOT 분석 앱</span></div>
      <div id="gdf-3" class="appc ghost2">${ICON.sparkle('#e7a92c')}<b>나만의 ???</b><span>SWOT 분석 앱</span></div>
    </div>
    <div id="gdf-h" class="h3">다른 사람이 ${hl('만들지 않았을 법한', 'var(--hl-y)')} 앱</div>
  </div>`,
  anim: `rise('#gdf-c', ${f(T(22))}); up('#gdf-k', ${f(T(22, .3))}, 16); pop('#gdf-1', ${f(T(23))}); pop('#gdf-2', ${f(T(24))}); pop('#gdf-3', ${f(T(25))});
  up('#gdf-h', ${f(T(25, .8))}, 20); sweep('#gdf-h .hl', ${f(T(26))});` });

say({ id: 'g-capture', from: 27, html: `
  <div id="gcp-c" class="card scard say">
    ${ok('gcp-a', 'AI, 적극 사용해도 됩니다', 'big')}
    <div id="gcp-b" class="row gap">${ico('gcp-i', 'camera', C.coral, BG.peach)}<div class="h3 left">AI를 쓴 과정은<br>${hl('전부 캡처해서 제출', 'var(--hl-y)')}</div></div>
    <div id="gcp-m" class="meter"><span class="mlab">과정이 자세할수록</span><div class="mbar"><span id="gcp-f" class="mfill mint"></span></div><b id="gcp-u" class="mup mint">고득점</b></div>
  </div>`,
  anim: `rise('#gcp-c', ${f(T(27))}); pop('#gcp-a', ${f(T(27, .3))}); up('#gcp-b', ${f(T(28))}, 24); pop('#gcp-i', ${f(T(28, .2))}); sweep('#gcp-b .hl', ${f(T(29))});
  up('#gcp-m', ${f(T(30))}, 20); grow('#gcp-f', ${f(T(30, .3))}, .95, 1.4); stamp('#gcp-u', ${f(T(31, .3))});` });

// ---- 03 평가 항목 4가지 -------------------------------------------------------
say({ id: 'g-e1', from: 32, html: `
  <div id="ge1-c" class="card scard say">
    ${stepper('ge1-st', 1)}
    <div id="ge1-h" class="h2 sm">첫 프롬프트는 ${hl('10줄 이상', 'var(--hl-y)')}</div>
    <div id="ge1-l" class="lines">${Array.from({ length: 10 }, (_, i) => `<div class="ln"><em>${i + 1}</em><i id="ge1-l${i}" style="width:${[92, 76, 84, 60, 88, 70, 80, 66, 90, 54][i]}%"></i></div>`).join('')}</div>
    <div class="row gap">${ok('ge1-o1', '직접 써도 OK', 'ok-sm')}${ok('ge1-o2', 'AI로 만들어도 OK', 'ok-sm')}<div id="ge1-t" class="tagbox">만든 과정은 캡처!</div></div>
  </div>`,
  anim: `rise('#ge1-c', ${f(T(32))}); up('#ge1-st', ${f(T(32, .3))}, 16); up('#ge1-h', ${f(T(34))}, 22); sweep('#ge1-h .hl', ${f(T(34, .9))});
  up('#ge1-l', ${f(T(33))}, 20); ${Array.from({ length: 10 }, (_, i) => `grow('#ge1-l${i}', ${f(T(34, .2 + i * .12))}, 1, .35);`).join(' ')}
  pop('#ge1-o1', ${f(T(35))}); pop('#ge1-o2', ${f(T(36))}); stamp('#ge1-t', ${f(T(37, .6))});` });

say({ id: 'g-e2', from: 39, html: `
  <div id="ge2-c" class="card scard say">
    ${stepper('ge2-st', 2)}
    <div id="ge2-h" class="h2 sm">앱 만드는 과정을 ${hl('하나하나 캡처', 'var(--hl-y)')}</div>
    <div class="row gap tops">
      <div class="tbox2"><div class="tbk">어떤 AI 툴?</div><div class="tools">
        <span id="ge2-t1" class="tl3">Claude Code</span><span id="ge2-t2" class="tl2">안티그래비티</span><span id="ge2-t3" class="tl4">Codex</span></div></div>
      <div class="tbox2"><div class="tbk">얼마나, 어떻게?</div><div class="tools">
        <span id="ge2-t4" class="tl1">총 소요 시간</span><span id="ge2-t5" class="tl5">GitHub 업로드</span><span id="ge2-t6" class="tl3">커밋 횟수</span></div></div>
      <div class="tbox2"><div class="tbk">어디에 배포?</div><div class="tools">
        <span id="ge2-t7" class="tl4">Netlify</span><span id="ge2-t8" class="tl5">Vercel</span></div></div>
    </div>
  </div>`,
  anim: `rise('#ge2-c', ${f(T(39))}); up('#ge2-st', ${f(T(39, .3))}, 16); up('#ge2-h', ${f(T(39, .7))}, 22); sweep('#ge2-h .hl', ${f(T(40))});
  pop('#ge2-t1', ${f(T(42))}); pop('#ge2-t2', ${f(T(43))}); pop('#ge2-t3', ${f(T(44))}); pop('#ge2-t4', ${f(T(45))}); pop('#ge2-t5', ${f(T(46))});
  pop('#ge2-t6', ${f(T(47))}); pop('#ge2-t7', ${f(T(49))}); pop('#ge2-t8', ${f(T(50))});` });

say({ id: 'g-e3', from: 52, html: `
  <div id="ge3-c" class="card scard say">
    ${stepper('ge3-st', 3)}
    <div class="row gap big">
      <div id="ge3-n" class="bignum"><span id="ge3-cnt">0</span><small>회+</small></div>
      <div id="ge3-h" class="h3 left">완성된 앱을<br>${hl('10회 이상 개선', 'var(--hl-m)')}</div>
    </div>
    <div id="ge3-cm" class="commits"><div class="cline"></div>${Array.from({ length: 10 }, (_, i) => `<span id="ge3-d${i}" class="cdot" style="left:${30 + i * 98}px"></span>`).join('')}</div>
    <div id="ge3-s" class="sub">커밋 기록 = 코드를 바꾸고 올릴 때마다 <b>남는 기록</b></div>
  </div>`,
  anim: `rise('#ge3-c', ${f(T(52))}); up('#ge3-st', ${f(T(52, .3))}, 16); pop('#ge3-n', ${f(T(53))}); count('#ge3-cnt', ${f(T(53))}, 1.6, 10);
  up('#ge3-h', ${f(T(53, .4))}, 20); sweep('#ge3-h .hl', ${f(T(53, 1.2))}); up('#ge3-cm', ${f(T(54))}, 16);
  ${Array.from({ length: 10 }, (_, i) => `pop('#ge3-d${i}', ${f(T(57, i * .16))});`).join(' ')} up('#ge3-s', ${f(T(55, .3))}, 16);` });

say({ id: 'g-e4', from: 62, html: `
  <div id="ge4-c" class="card scard say">
    ${stepper('ge4-st', 4)}
    <div class="row gap">${ico('ge4-i', 'present', C.sky, BG.sky)}<div id="ge4-h" class="h3 left">내 SWOT 앱은<br>${hl('무엇이 다른가?', 'var(--hl-y)')}</div></div>
    <div class="row gap">${chip('ge4-1', 'users', C.coral, BG.peach, '다른 사람들 앞에서')}${chip('ge4-2', 'present', C.lav, BG.lav, 'TV · 컴퓨터에 띄워')}<div id="ge4-t" class="tagbox">직접 시연!</div></div>
  </div>`,
  anim: `rise('#ge4-c', ${f(T(62))}); up('#ge4-st', ${f(T(62, .3))}, 16); pop('#ge4-i', ${f(T(63))}); up('#ge4-h', ${f(T(63, .2))}, 20); sweep('#ge4-h .hl', ${f(T(63, 1.4))});
  pop('#ge4-1', ${f(T(64))}); pop('#ge4-2', ${f(T(65))}); stamp('#ge4-t', ${f(T(67))});` });

say({ id: 'g-vs', from: 68, html: `
  <div id="gv-c" class="card scard say">
    ${pill('gv-k', '같은 AI를 써도', C.pink, 'pill-soft')}
    <div class="eqs">
      <div id="gv-1" class="cmp2 bad">${ico('gv-i1', 'chat', C.grey, BG.grey, 'xs')}<div><b>단 한 줄로</b><span>“이런 앱 만들어 줘” 하고 끝</span></div></div>
      <div id="gv-ne" class="ne">≠</div>
      <div id="gv-2" class="cmp2 good">${ico('gv-i2', 'brain', C.mint, BG.mint, 'xs')}<div><b>여러 차례 바꿔 보고 고민</b><span>AI를 썼지만 <em>생각을 더한</em> 앱</span></div></div>
    </div>
    <div id="gv-h" class="h3">${hl('큰 차이', 'var(--hl-p)')}가 납니다</div>
  </div>`,
  anim: `rise('#gv-c', ${f(T(68))}); up('#gv-k', ${f(T(68, .2))}, 16); slide('#gv-1', ${f(T(68, .6))}, -50); pop('#gv-ne', ${f(T(69))}); slide('#gv-2', ${f(T(69, .5))});
  up('#gv-h', ${f(T(70))}, 20); sweep('#gv-h .hl', ${f(T(70, .5))});` });

full({ id: 'g-think', from: 71, html: `
  <div class="mega">
    <div id="gt-k" class="sub">아주 간단하게 만들지 말고</div>
    <div id="gt-h" class="mt xl"><span class="w1">고민은 ${hl('많이', 'var(--hl-y)')},</span><br><span class="w2">머리도 ${hl('많이', 'var(--hl-m)')}</span></div>
    <div id="gt-n" class="note">AI는 <b>많이 써도</b> 됩니다</div>
  </div>`,
  anim: `up('#gt-k', ${f(T(71))}, 20); slam('#gt-h .w1', ${f(T(72))}); sweep('#gt-h .w1 .hl', ${f(T(72, .6))}); slam('#gt-h .w2', ${f(T(73))}); sweep('#gt-h .w2 .hl', ${f(T(73, .6))});
  up('#gt-n', ${f(T(75))}, 16);` });

full({ id: 'g-chap', from: 76, html: `
  <div class="mega">
    <div id="gc-k" class="cc-n">이게 제가 생각한 AI 시대의 과제</div>
    <div id="gc-h" class="mt xl">제가 ${hl('직접', 'var(--hl-y)')} 해 봤습니다</div>
    <div class="road">${[['chat', '프롬프트'], ['code', 'Claude Code'], ['git', 'GitHub'], ['globe', 'Netlify 배포'], ['app', '앱 완성'], ['up', '개선 × 3']].map(([n, l], i) =>
      `${i ? `<span id="gc-a${i}" class="rdash"></span>` : ''}<div id="gc-r${i}" class="rnode">${ico(`gc-ri${i}`, n, Object.values(C)[i], Object.values(BG)[i], 'xs')}<span>${l}</span></div>`).join('')}</div>
  </div>`,
  anim: `up('#gc-k', ${f(T(76, .2))}, 16); slam('#gc-h', ${f(T(77))}); sweep('#gc-h .hl', ${f(T(77, .7))});
  ${[0, 1, 2, 3, 4, 5].map((i) => `${i ? `grow('#gc-a${i}', ${f(T(77, 1.1 + i * .28 - .14))}, 1, .2); ` : ''}pop('#gc-r${i}', ${f(T(77, 1.1 + i * .28))});`).join(' ')}` });

// ---- 04 직접 해보기: 실습 사이사이의 설명 카드 ----------------------------------
say({ id: 'x-pr', from: 108, html: `
  <div id="xp-c" class="card scard say">
    ${pill('xp-k', '이 정도 용어는 알아 두세요', C.lav, 'pill-soft')}
    ${flow('xp', [['code', C.sky, BG.sky, '내가 짠 코드'], ['git', C.lav, BG.lav, '<b class="term">PR</b><br>Pull Request<br><small>“올려도 될까요?”</small>'], ['merge', C.mint, BG.mint, '<b class="term">Merge</b><br>병합<br><small>기존 코드와 합치기</small>']], 'wide xp3')}
    <div id="xp-h" class="h3">Claude Code에게 ${hl('“PR 만들고 merge 해줘”', 'var(--hl-y)')}</div>
  </div>`,
  anim: `rise('#xp-c', ${f(T(108))}); up('#xp-k', ${f(T(108, .3))}, 16); ${flowAnim('xp', [T(109), T(108, 1.2), T(117)])}
  up('#xp-h', ${f(T(122))}, 20); sweep('#xp-h .hl', ${f(T(122, .7))});` });

say({ id: 'x-learn', from: 142, html: `
  <div id="xl-c" class="card scard say">
    ${pill('xl-k', '이런 앱을 만들면서 학생이 배웁니다', C.mint, 'pill-soft')}
    <div class="eqs">
      <div id="xl-1" class="cmp2 bad">${ico('xl-i1', 'doc', C.grey, BG.grey, 'xs')}<div><b>예전 — 워드로 SWOT 설명문 작성</b><span>요즘은 AI가 너무 잘 써서 <em>사고할 필요가 없어짐</em></span></div></div>
      <div id="xl-2" class="cmp2 good">${ico('xl-i2', 'app', C.mint, BG.mint, 'xs')}<div><b>지금 — 앱을 만들고 직접 고치면서</b><span>그 과정에서 <em>SWOT를 공부</em>하게 된다</span></div></div>
    </div>
  </div>`,
  anim: `rise('#xl-c', ${f(T(142))}); up('#xl-k', ${f(T(142, .3))}, 16); slide('#xl-1', ${f(T(142, .8))}, -50); slide('#xl-2', ${f(T(149))});
  tl.fromTo('#xl-1', {opacity:1}, {opacity:.55, duration:.4, immediateRender:false}, ${f(T(149))});` });

say({ id: 'x-free', from: 165, html: `
  <div id="xf-c" class="card scard say">
    ${pill('xf-k', '여기서 중요한 것', C.yellow, 'pill-soft')}
    <div class="row gap">${ico('xf-i', 'zap', C.yellow, BG.yellow)}<div id="xf-h" class="h3 left">Gemini API는<br>${hl('무료 티어', 'var(--hl-y)')}로도 쓸 수 있어요</div></div>
    <div class="vlist">
      <div id="xf-1" class="numrow"><span class="nb">1</span><span>1분에 몇 회 정도는 <b>무료</b></span></div>
      <div id="xf-2" class="numrow"><span class="nb">2</span><span>API 키 <b>테스트할 때</b>는 무료로 먼저 써 보기</span></div>
      <div id="xf-3" class="numrow"><span class="nb">3</span><span><b>가장 최신 모델</b>을 빼면 무료 — 모델 목록 확인!</span></div>
    </div>
  </div>`,
  anim: `rise('#xf-c', ${f(T(165))}); up('#xf-k', ${f(T(165, .2))}, 16); pop('#xf-i', ${f(T(166))}); up('#xf-h', ${f(T(166, .2))}, 20); sweep('#xf-h .hl', ${f(T(167))});
  slide('#xf-1', ${f(T(167, .4))}); slide('#xf-2', ${f(T(168))}); slide('#xf-3', ${f(T(171))});` });

say({ id: 'x-loop', from: 226, html: `
  <div id="xo-c" class="card scard say">
    ${pill('xo-k', '개선 ① — 다시 Claude Code로', C.coral, 'pill-soft')}
    <div id="xo-p" class="promptbox wide"><div class="pbh">${ICON.chat('#9a8be6')}<span>추가 요청</span></div><div class="pbt">SWOT의 개념을 쉽게 설명해서 사이트에 적어 줘</div></div>
    ${flow('xo', [['app', C.sky, BG.sky, '앱 살펴보기'], ['search', C.pink, BG.pink, '부족한 점 깨닫기'], ['chat', C.lav, BG.lav, '추가 요청']])}
  </div>`,
  anim: `rise('#xo-c', ${f(T(226))}); up('#xo-k', ${f(T(226, .3))}, 16); slide('#xo-p', ${f(T(228))}, -50); ${flowAnim('xo', [T(231), T(232), T(232, 1.2)])}` });

say({ id: 'x-trace', from: 246, html: `
  <div id="xt-c" class="card scard say">
    ${pill('xt-k', '고민한 흔적이 곧 평가 근거', C.lav, 'pill-soft')}
    <div id="xt-q" class="qbub wide">“내 사이트, <b>뭐가 부족하지?</b>”</div>
    ${flow('xt', [['brain', C.pink, BG.pink, '머리를 쓰고'], ['camera', C.coral, BG.peach, '과정을 캡처해<br>과제로 제출'], ['eye', C.mint, BG.mint, '얼마나 고민했는지<br>확인 가능']], 'wide')}
  </div>`,
  anim: `rise('#xt-c', ${f(T(246))}); up('#xt-k', ${f(T(246, .2))}, 16); pop('#xt-q', ${f(T(246, .6))}); ${flowAnim('xt', [T(247), T(248), T(250)])}` });

say({ id: 'x-commit', from: 282, html: `
  <div id="xc-c" class="card scard say">
    ${pill('xc-k', '커밋 10회, 생각보다 어렵지 않아요', C.mint, 'pill-soft')}
    <div id="xc-cm" class="commits">${'<div class="cline"></div>'}${Array.from({ length: 10 }, (_, i) => `<span id="xc-d${i}" class="cdot${i < 7 ? '' : ' ghostd'}" style="left:${30 + i * 98}px"></span>`).join('')}</div>
    <div class="vlist">
      <div id="xc-1" class="numrow"><span class="nb">1</span><span><b>merge</b>도 커밋으로 셉니다</span></div>
      <div id="xc-2" class="numrow"><span class="nb">2</span><span>한 번 수정해도 커밋이 <b>세 번</b>쯤 생기기도</span></div>
      <div id="xc-3" class="numrow"><span class="nb">3</span><span><b>10회가 된 화면</b>을 캡처해서 제출</span></div>
    </div>
  </div>`,
  anim: `rise('#xc-c', ${f(T(282))}); up('#xc-k', ${f(T(282, .2))}, 16); up('#xc-cm', ${f(T(282, .4))}, 16); ${Array.from({ length: 10 }, (_, i) => `pop('#xc-d${i}', ${f(T(282, .6 + i * .1))});`).join(' ')}
  slide('#xc-1', ${f(T(282, 1))}); slide('#xc-2', ${f(T(284))}); slide('#xc-3', ${f(T(289))});
  ${[7, 8, 9].map((i, k) => `tl.fromTo('#xc-d${i}', {backgroundColor:'#e5e0ee'}, {backgroundColor:'#3fa877', duration:.3, immediateRender:false}, ${f(T(285, k * .4))});`).join(' ')}` });

full({ id: 'x-onego', from: 292, html: `
  <div class="mega">
    <div id="xg-k" class="sub">커밋 기록을 보면 알 수 있어요</div>
    <div class="qstack">
      <div id="xg-1" class="qline">${ico('xg-i1', 'x', C.grey, BG.grey, 'xs')}<span>AI로 <b>한 번에</b> 만든 앱</span></div>
      <div id="xg-2" class="qline hot">${ico('xg-i2', 'check', C.mint, BG.mint, 'xs')}<span>고민하고 <b>머리를 많이 쓴</b> 앱</span></div>
    </div>
  </div>`,
  anim: `up('#xg-k', ${f(T(292, .1))}, 16); slam('#xg-1', ${f(T(295))}); tl.fromTo('#xg-1', {opacity:1}, {opacity:.5, duration:.4, immediateRender:false}, ${f(T(297))}); slam('#xg-2', ${f(T(297))});` });

full({ id: 'x-matrix', from: 364, html: `
  <div id="xm-c" class="card fcard">
    ${pill('xm-k', 'SWOT, 한 장으로 정리', C.lav, 'pill-soft')}
    <div class="mtx">
      <div></div><div id="xm-c1" class="mhd good2">😊 좋은 일</div><div id="xm-c2" class="mhd bad2">😟 걱정되는 일</div>
      <div id="xm-r1" class="mrow">안<small>내부</small></div><div id="xm-s0" class="mcell sw0">S<span>잘하는 점</span></div><div id="xm-s1" class="mcell sw1">W<span>아쉬운 점</span></div>
      <div id="xm-r2" class="mrow">밖<small>외부</small></div><div id="xm-s2" class="mcell sw2">O<span>기회</span></div><div id="xm-s3" class="mcell sw3">T<span>조심할 점</span></div>
    </div>
  </div>`,
  anim: `rise('#xm-c', ${f(T(364))}); up('#xm-k', ${f(T(364, .2))}, 16); slide('#xm-c1', ${f(T(365))}, 0); up('#xm-c1', ${f(T(365))}, 20); up('#xm-c2', ${f(T(366))}, 20);
  slide('#xm-r1', ${f(T(371))}, -40); slide('#xm-r2', ${f(T(373))}, -40);
  pop('#xm-s0', ${f(T(367))}); pop('#xm-s1', ${f(T(368, .4))}); pop('#xm-s2', ${f(T(372, .6))}); pop('#xm-s3', ${f(T(373, .6))});` });

// ---- 05 정리 ---------------------------------------------------------------
say({ id: 'w-recap0', from: 422, html: `
  <div id="wr0-c" class="card scard say">
    ${pill('wr0-k', '교수님들을 위해 오늘 보여 드린 것', C.coral, 'pill-soft')}
    <div class="row gap">${ok('wr0-1', 'AI 시대의 과제 제안')}${ok('wr0-2', '직접 해 본 과정')}</div>
    ${flow('wr0', [['camera', C.coral, BG.peach, '과정을 캡처해서<br>보내고'], ['present', C.sky, BG.sky, '결과물 앱을<br>들고 나와 시연']], 'wide')}
  </div>`,
  anim: `rise('#wr0-c', ${f(T(422))}); up('#wr0-k', ${f(T(422, .3))}, 16); pop('#wr0-1', ${f(T(423))}); pop('#wr0-2', ${f(T(424))}); ${flowAnim('wr0', [T(425), T(426, .3)])}` });

say({ id: 'w-recap', from: 428, html: `
  <div id="wr-c" class="card scard say">
    ${pill('wr-k', '평가 항목 다시 보기', C.lav, 'pill-soft')}
    <div class="evals">
      <div id="wr-1" class="evl"><span class="nb">1</span><b>첫 프롬프트 10줄 이상</b><em>Claude Code에 넣은 첫 요청</em></div>
      <div id="wr-2" class="evl"><span class="nb">2</span><b>과정을 전부 캡처</b><em>툴 · 시간 · GitHub · 배포</em></div>
      <div id="wr-3" class="evl"><span class="nb">3</span><b>10회 이상 개선</b><em>GitHub 커밋 기록 제출</em></div>
      <div id="wr-4" class="evl"><span class="nb">4</span><b>차별점을 직접 시연</b><em>장점 · 특이점을 설명</em></div>
    </div>
    <div id="wr-h" class="h3">학생은 ${hl('생각할 수밖에', 'var(--hl-y)')} 없습니다</div>
  </div>`,
  anim: `rise('#wr-c', ${f(T(428))}); up('#wr-k', ${f(T(428, .2))}, 16); slide('#wr-1', ${f(T(428, .6))}); slide('#wr-2', ${f(T(431))}); slide('#wr-3', ${f(T(433))}); slide('#wr-4', ${f(T(440))});
  up('#wr-h', ${f(T(448))}, 20); sweep('#wr-h .hl', ${f(T(448, .8))});` });

say({ id: 'w-why', from: 449, html: `
  <div id="ww-c" class="card scard say">
    ${pill('ww-k', 'AI 시대의 어려움', C.pink, 'pill-soft')}
    ${flow('ww', [['robot', C.lav, BG.lav, 'AI가 글을<br>너무 잘 쓴다'], ['doc', C.coral, BG.peach, '과제를<br>대신 써 준다']], 'wide')}
    <div id="ww-h" class="stampbox">평가하기가 너무 어려웠다</div>
  </div>`,
  anim: `rise('#ww-c', ${f(T(449))}); up('#ww-k', ${f(T(449, .2))}, 16); ${flowAnim('ww', [T(450), T(451)])} stamp('#ww-h', ${f(T(454))});` });

full({ id: 'w-answer', from: 455, html: `
  <div class="mega">
    <div id="wa-k" class="sub">그래서 아예</div>
    <div id="wa-h" class="mt xl">AI를 ${hl('제대로, 많이, 잘', 'var(--hl-m)')}</div>
    <div class="row gap">${chip('wa-1', 'app', C.lav, BG.lav, '앱을 만들고')}${chip('wa-2', 'up', C.mint, BG.mint, '많이 고쳐 보고')}${chip('wa-3', 'present', C.coral, BG.peach, '시연까지')}</div>
  </div>`,
  anim: `up('#wa-k', ${f(T(455))}, 16); slam('#wa-h', ${f(T(455, .8))}); sweep('#wa-h .hl', ${f(T(455, 1.6))}); pop('#wa-1', ${f(T(456))}); pop('#wa-2', ${f(T(456, 1.4))}); pop('#wa-3', ${f(T(457))});` });

say({ id: 'w-alt', from: 459, html: `
  <div id="wl-c" class="card scard say">
    <div id="wl-h" class="h2 sm">하나의 ${hl('대안', 'var(--hl-y)')}일 뿐,<br>정답은 아닙니다</div>
    <div id="wl-b" class="row gap">${ico('wl-i', 'chat', C.sky, BG.sky)}<div class="qbub">아이디어가 있으신 교수님,<br>이미 <b>나만의 방식</b>이 있으신 분은<br><b>댓글로 공유</b>해 주세요</div></div>
  </div>`,
  anim: `rise('#wl-c', ${f(T(459))}); up('#wl-h', ${f(T(460))}, 24); sweep('#wl-h .hl', ${f(T(460, .9))}); up('#wl-b', ${f(T(461, .5))}, 24); pop('#wl-i', ${f(T(461, .7))});` });

full({ id: 'w-respect', from: 467, html: `
  <div class="mega">
    <div id="wp-k" class="sub">AI 시대, 변화가 정말 큽니다</div>
    <div id="wp-h" class="mt">늘 노력하시는<br>${hl('교육자분들', 'var(--hl-p)')}</div>
    <div id="wp-n" class="row gap">${ico('wp-i', 'heart', C.pink, BG.pink, 'xs')}<div class="h3">존경합니다</div></div>
  </div>`,
  anim: `up('#wp-k', ${f(T(467))}, 16); slam('#wp-h', ${f(T(469))}); sweep('#wp-h .hl', ${f(T(470, .3))}); up('#wp-n', ${f(T(472))}, 20); pop('#wp-i', ${f(T(472, .2))});
  tl.fromTo('#wp-i', {scale:1}, {scale:1.15, duration:.25, yoyo:true, repeat:3, ease:'sine.inOut', immediateRender:false}, ${f(T(472, .8))});` });

// ---- 실습 화면 (shots.json) ------------------------------------------------
const SH = JSON.parse(fs.readFileSync(path.join(root, 'shots.json'), 'utf8'));
const APP = { claude: ['sparkle', C.coral, BG.peach], code: ['code', C.lav, BG.lav], github: ['git', '#34314a', BG.grey], netlify: ['globe', C.mint, BG.mint],
  studio: ['key', C.sky, BG.sky], app: ['app', C.coral, BG.peach], photo: ['image', C.pink, BG.pink] };
const VW = 1290, VH = 718;
const camAt = (sh, z, fx, fy) => {
  const fit = Math.min(VW / sh.w, VH / sh.h), W = sh.w * fit * z, H = sh.h * fit * z;
  const ax = (v, W2, V) => (W2 <= V ? (V - W2) / 2 : Math.min(0, Math.max(V - W2, V / 2 - v * W2)));
  return { x: +ax(fx, W, VW).toFixed(1), y: +ax(fy, H, VH).toFixed(1), scale: z };
};
const note = (id, txt) => { const m = txt.match(/^([SWOT]) · (.*)$/);
  return m ? `<div id="${id}" class="snote"><span class="sw sw${'SWOT'.indexOf(m[1])} swn">${m[1]}</span><span>${m[2]}</span></div>`
    : `<div id="${id}" class="snote"><span class="sdot"></span><span>${txt}</span></div>`; };
for (const sh of SH.shots) {
  const id = sh.id, fit = Math.min(VW / sh.w, VH / sh.h), [ai, ac, ab] = APP[sh.app];
  const segs = sh.count ? Math.max(10, sh.count[2]) : 0;
  const html = `
  <div id="${id}-win" class="win" data-layout-allow-overlap>
    <div class="wbar"><i></i><i></i><i></i><div class="wurl">${ico(`${id}-wi`, ai, ac, ab, 'tiny')}<span>${sh.label}</span></div></div>
    <div class="vp"><div id="${id}-cam" class="cam" data-layout-allow-overflow style="width:${(sh.w * fit).toFixed(1)}px;height:${(sh.h * fit).toFixed(1)}px">
      <img src="assets/shots/${sh.img}" alt="">
      ${(sh.hl || []).map((h, k) => `<div id="${id}-h${k}" class="hlb" data-layout-allow-overflow style="left:${h[2] * 100}%;top:${h[3] * 100}%;width:${h[4] * 100}%;height:${h[5] * 100}%"></div>`).join('')}
    </div></div>
  </div>
  <div id="${id}-pan" class="spanel" data-layout-allow-overlap>
    <div id="${id}-tag" class="stag"><b>실습 ${String(sh.step).padStart(2, '0')}</b><span>${SH.steps[sh.step - 1]}</span></div>
    <div id="${id}-ttl" class="stitle">${sh.title.replace('\n', '<br>')}</div>
    <div class="snotes">${(sh.notes || []).map((n, k) => note(`${id}-n${k}`, n[2])).join('')}</div>
    ${sh.count ? `<div id="${id}-cnt" class="scount"><div class="scn"><b id="${id}-cv">0</b><span>번 커밋</span></div>
      <div class="segs">${Array.from({ length: segs }, (_, k) => `<i id="${id}-g${k}"${k === 9 ? ' class="goal"' : ''}></i>`).join('')}</div><div class="sgoal">목표 10회</div></div>` : ''}
    ${sh.badge ? `<div id="${id}-bd" class="sbadge"><span class="okc">${ICON.check('#ffffff')}</span><span>${sh.badge[2]}</span></div>` : ''}
    ${sh.tip ? `<div id="${id}-tp" class="stip">${ICON.bulb('#b07d10')}<span>${sh.tip[2].replace('\n', '<br>')}</span></div>` : ''}
  </div>`;
  const s0 = T(sh.from, -0.12);
  const cams = (sh.cam || [[sh.from, 0, 1, 0.5, 0.5]]).map(([c, o, z, fx, fy]) => ({ t: T(c, o), ...camAt(sh, z, fx, fy) }));
  const camA = [`tl.set('#${id}-cam', ${JSON.stringify({ x: cams[0].x, y: cams[0].y, scale: cams[0].scale })}, ${f(s0)});`,
    ...cams.slice(cams[0].t <= s0 + 0.3 ? 1 : 0).map((k) => `tl.to('#${id}-cam', {x:${k.x}, y:${k.y}, scale:${k.scale}, duration:1.2, ease:'power2.inOut'}, ${f(Math.max(s0 + 0.05, k.t - 0.2))});`)];
  const anim = [
    `ENTER_${id}`,
    `up('#${id}-tag', ${f(s0 + 0.15)}, 14); up('#${id}-ttl', ${f(s0 + 0.3)}, 18);`,
    ...camA,
    ...(sh.notes || []).map((n, k) => `slide('#${id}-n${k}', ${f(Math.max(s0 + 0.5, T(n[0], n[1])))}, 40);`),
    ...(sh.hl || []).map((h, k) => `tl.fromTo('#${id}-h${k}', {opacity:0, scale:1.25}, {opacity:1, scale:1, duration:.45, ease:'back.out(2)'}, ${f(Math.max(s0 + 0.4, T(h[0], h[1])))});`),
    sh.count ? `pop('#${id}-cnt', ${f(T(sh.count[0], sh.count[1]) - 0.5)}); count('#${id}-cv', ${f(T(sh.count[0], sh.count[1]))}, ${sh.count[3]}, ${sh.count[2]}); ${Array.from({ length: sh.count[2] }, (_, k) => `pop('#${id}-g${k}', ${f(T(sh.count[0], sh.count[1]) + sh.count[3] * (k + 1) / sh.count[2] - 0.1)});`).join(' ')}` : '',
    sh.badge ? `stamp('#${id}-bd', ${f(T(sh.badge[0], sh.badge[1]))});` : '',
    sh.tip ? `pop('#${id}-tp', ${f(T(sh.tip[0], sh.tip[1]))});` : '',
  ].filter(Boolean).join('\n  ');
  SC.push({ id, from: sh.from, kind: 'shot', html, anim });
}

SC.push({ id: 'g-end', from: 473, kind: 'say', end: true, html: '', anim: '' });
SC.sort((a, b) => a.from - b.from);
for (let i = 1; i < SC.length; i++) if (SC[i].from === SC[i - 1].from) throw new Error(`two scenes on cue ${SC[i].from}`);

SC.forEach((g, i) => { g.s = i ? T(g.from, -0.12) : 0; });
SC.forEach((g, i) => { g.e = i < SC.length - 1 ? SC[i + 1].s : DUR; });
// shot → shot: the window stays put and the picture cross-dissolves (the outgoing shot lingers under the new one)
SC.forEach((g, i) => { const p = SC[i - 1], n = SC[i + 1];
  g.xfade = g.kind === 'shot' && n && n.kind === 'shot';
  g.anim = g.anim.replace(`ENTER_${g.id}`, p && p.kind === 'shot' ? '' : `rise('#${g.id}-win', ${f(g.s)}); slide('#${g.id}-pan', ${f(g.s + 0.15)}, 60);`); });

// ---------- pastel stage (whole video) + character ---------------------------
let seed = 20261028;
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
// character steps out for 'full' / 'shot' scenes and back in for 'say' scenes
const charAnim = [`tl.set('#cwrap', {opacity:0, x:-620}, 0);`];
SC.forEach((g, i) => {
  const now = g.kind === 'say', prev = i ? SC[i - 1].kind === 'say' : false;
  if (now === prev) return;
  charAnim.push(now
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
      <div id="end-k" class="end-k">감사합니다, 선생님들</div>
      <div id="end-h" class="end-big">AI 시대의 과제,<br>${hl('함께 고민해요', 'var(--hl-y)')}</div>
      <div class="row gap">
        <div id="end-like" class="cta">${ICON.thumb('#ffffff')}<span>좋아요</span></div>
        <div id="end-sub" class="cta sub2">${ICON.bell('#ffffff')}<span>구독</span></div>
      </div>
      <div id="end-t" class="end-mid">필로소피 AI 교육</div>
    </div>
  </div>`;
const endAnim = `
  rise('#end-in', ${f(END_S + 0.1)}); up('#end-k', ${f(END_S + 0.3)}, 16); up('#end-h', ${f(END_S + 0.5)}, 30); sweep('#end-h .hl', ${f(END_S + 1.2)});
  pop('#end-like', ${f(END_S + 1.8)}); pop('#end-sub', ${f(END_S + 2.3)}); up('#end-t', ${f(END_S + 2.8)}, 14);
  tl.fromTo('#end-like', {rotation:0}, {rotation:-12, duration:.18, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(END_S + 2.5)});
  tl.fromTo('#end-sub svg', {rotation:0}, {rotation:16, duration:.12, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(END_S + 3.1)});
  tl.fromTo('#phil', {rotation:0}, {rotation:-5, duration:.3, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(END_S + 0.4)});`;

// ---------- section chips ---------------------------------------------------
const sections = [
  [0, T(14, -0.12), '01', '들어가며'],
  [T(14, -0.12), T(32, -0.12), '02', 'AI 시대의 과제'],
  [T(32, -0.12), T(76, -0.12), '03', '평가 항목 4가지'],
  [T(76, -0.12), T(422, -0.12), '04', '직접 해 보기'],
  [T(422, -0.12), END_S, '05', '정리'],
];
const secHTML = sections.map(([s, e, n, label], i) =>
  `<div id="sec${i}" class="chapter clip" data-start="${f(s)}" data-duration="${f(e - s)}" data-track-index="6"><div id="sec${i}-in" class="chip-in"><b>${n}</b><span>${label}</span></div></div>`).join('\n');
const secAnim = sections.map(([s], i) => `tl.fromTo('#sec${i}-in', {opacity:0, x:30}, {opacity:1, x:0, duration:.5, ease:'power3.out'}, ${f(s + 0.3)});`).join('\n  ');

// ---------- assemble ---------------------------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const G = SC.filter((g) => !g.end);
const XF = 0.45;
const gHTML = G.map((g, i) => `
<div id="${g.id}" class="scene clip" data-start="${f(g.s)}" data-duration="${f(g.e - g.s + (g.xfade ? XF : 0))}" data-track-index="${2 + (i % 2)}">
  <div id="${g.id}-sc" class="sc">${g.html}
  </div>
</div>`).join('\n');
const gAnim = G.map((g) => `
  // ${g.id}
  tl.fromTo('#${g.id}-sc', {opacity:0}, {opacity:1, duration:.4, ease:'power2.out'}, ${f(g.s)});
  ${g.xfade ? '' : `tl.to('#${g.id}-sc', {opacity:0, duration:.35, ease:'power2.in'}, ${f(g.e - 0.37)});`}
  ${g.anim.trim()}`).join('\n');
const capHTML = cues.map((c, i) =>
  `<div id="cap${i}" class="cap clip" data-start="${c.s.toFixed(3)}" data-duration="${Math.max(0.2, Math.min(c.e, DUR) - c.s).toFixed(3)}" data-track-index="8"><span>${esc(c.text)}</span></div>`).join('\n');

const css = ['base.css', 'extra.css', 'practice.css'].map((x) => fs.readFileSync(path.join(root, 'assets', x), 'utf8')).join('\n');
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>AI 시대의 과제 — 직접 해보기</title>
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
const k = (x) => G.filter((g) => g.kind === x).length;
console.log(`Built ${G.length} scenes (${k('say')} say / ${k('full')} full / ${k('shot')} shot), ${cues.length} captions, end ${END_S}–${DUR}`);
