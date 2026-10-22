import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// AI로 사고력 향상하기 (사고력 향상 AI 멘토) — generator for index.html.
//
// Picture + sound: assets/media/source.mp4 (사고력 완성영상.mp4 그대로, 컷 편집 없음)
// Captions:        assets/captions.srt (사고력 자막.srt) — 하단 크림 밴드가 원본에 박힌 자막·작업표시줄을 가린다.
// Sections:        0:00 프로젝트 만들기(원본 + 가벼운 콜아웃)
//                  0:29 인트로 — 파스텔 풀스크린 + 캐릭터 + 카드
//                  2:10 AI 토론 — 원본 화면을 왼쪽으로 줄이고(split) 오른쪽에 요약 카드, 캐릭터 리액션(peek)
//                  6:48 마무리 — 파스텔 풀스크린 + 캐릭터 + 엔드카드
// Graphics are pinned to SRT cue numbers: T(cue) = cue start, TE(cue) = cue end.
//
// 수정: 아래 graphics → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const cues = fs.readFileSync(path.join(root, 'assets/captions.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .map((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); return { n: +l[0], s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }; });
const CUE = Object.fromEntries(cues.map((c) => [c.n, c]));
const DUR = 469.066;

const T = (n, off = 0) => { const c = CUE[n]; if (!c) throw new Error(`cue ${n}`); return +(c.s + off).toFixed(3); };
const TE = (n, off = 0) => { const c = CUE[n]; if (!c) throw new Error(`cue ${n}`); return +(c.e + off).toFixed(3); };

const INTRO_S = T(14, -0.15), INTRO_E = TE(55, 0.15);
const OUTRO_S = T(231, -0.15), END_S = T(260, -0.1);
const DEBATE_S = T(62), DEBATE_E = OUTRO_S;

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

// ---------- graphics -------------------------------------------------------
// { id, s, e, lane, html, anim }
//   lane 'card'  — intro/outro speech cards and plain overlays
//   lane 'split' — debate: footage shrinks left, card sits on the right (.side)
//   lane 'peek'  — debate: character peeks up from behind the caption band with a bubble
const G = [];
const add = (g) => G.push({ lane: 'card', ...g });
const f = (t) => t.toFixed(2);

// ---- 0:00 프로젝트 만들기 (원본 화면 + 가벼운 콜아웃) -------------------------
add({ id: 'g-open', s: 0.2, e: T(3, -0.1), wash: 'center', html: `
  <div id="go-c" class="card titlecard">
    ${pill('go-k', 'Claude 프로젝트 · 사고력 향상 AI 멘토', C.lav, 'pill-soft')}
    <h1 id="go-h" class="h1 center">AI로 ${hl('사고력', 'var(--hl-y)')} 향상하기</h1>
    <div id="go-s" class="sub">사용법이 아니라, 생각하는 힘을 키우는 AI 활용법</div>
  </div>`,
  anim: `rise('#go-c', .3); up('#go-k', .6, 16); up('#go-h', .8, 34); sweep('#go-h .hl', 1.6); up('#go-s', 1.5, 16);` });

add({ id: 'g-setup', lane: 'split', s: T(6, -0.2), e: TE(7, 0.4), html: `
  <div id="gsu-c" class="card side">
    ${pill('gsu-k', '새 프로젝트 만들기', C.lav, 'pill-soft')}
    <div id="gsu-1" class="field"><div class="flab">이름</div><div class="fval">사고력 향상 AI 멘토</div></div>
    <div id="gsu-2" class="field"><div class="flab">목적</div><div class="fval sm">사용자의 사고력 향상에<br>도움을 줍니다</div></div>
  </div>`,
  anim: `rise('#gsu-c', ${f(T(6, -0.1))}); up('#gsu-k', ${f(T(6, 0.15))}, 16); slide('#gsu-1', ${f(T(6, 0.6))}); slide('#gsu-2', ${f(T(7))});` });

add({ id: 'g-guide', lane: 'split', s: T(8, -0.1), e: TE(11, 0.5), html: `
  <div id="ggd-c" class="card side">
    ${pill('ggd-k', '지침은 무료로 제공해 드려요', C.mint, 'pill-soft')}
    <div class="vflow">
      ${chip('ggd-1', 'pin', C.coral, BG.peach, '고정 댓글')}
      ${darrow('ggd-a1')}
      ${chip('ggd-2', 'link', C.mint, BG.mint, '네이버 카페 링크')}
      ${darrow('ggd-a2')}
      ${chip('ggd-3', 'doc', C.lav, BG.lav, '지침 받아서 붙여넣기')}
    </div>
  </div>`,
  anim: `rise('#ggd-c', ${f(T(8))}); up('#ggd-k', ${f(T(8, 0.25))}, 16);
  slide('#ggd-1', ${f(T(9))}); draw('#ggd-a1 path', ${f(T(10, -0.3))}, .4); slide('#ggd-2', ${f(T(10))}); draw('#ggd-a2 path', ${f(T(11, -0.3))}, .4); slide('#ggd-3', ${f(T(11))});` });

// ---- 0:29 인트로 (파스텔 풀스크린 + 캐릭터) ---------------------------------
const say = (g) => add({ ...g, intro: true });

say({ id: 'g-i1', s: T(14, -0.05), e: T(18, -0.1), html: `
  <div id="gi1-c" class="card scard say">
    ${pill('gi1-k', 'AI를 배우는 우리', C.sky, 'pill-soft')}
    <div class="row gap">${ok('gi1-a', '사용법 배우기')}${ok('gi1-b', '익히기')}</div>
    <div id="gi1-h" class="h2">좋아요. 그런데 이게<br>${hl('가장 중요한 건', 'var(--hl-p)')} 아닙니다</div>
  </div>`,
  anim: `rise('#gi1-c', ${f(T(14))}); up('#gi1-k', ${f(T(14, 0.3))}, 16); pop('#gi1-a', ${f(T(15, 0.6))}); pop('#gi1-b', ${f(T(16, 0.4))});
  up('#gi1-h', ${f(T(17))}, 26); sweep('#gi1-h .hl', ${f(T(17, 0.9))});` });

say({ id: 'g-i2', s: T(18, -0.05), e: T(23, -0.1), html: `
  <div id="gi2-c" class="card scard say">
    ${pill('gi2-k', '그럼 무엇이 중요할까?', C.coral, 'pill-soft')}
    ${flow('gi2', [['sparkle', C.yellow, BG.yellow, 'AI를 활용해서'], ['brain', C.lav, BG.lav, '사고력 향상'], ['trend', C.mint, BG.mint, '지속적으로']], 'tight')}
    <div id="gi2-h" class="h2">AI로 ${hl('생각하는 힘', 'var(--hl-y)')}을 키우는 것</div>
  </div>`,
  anim: `rise('#gi2-c', ${f(T(18))}); up('#gi2-k', ${f(T(18, 0.3))}, 16);
  ${flowAnim('gi2', [T(19), T(20, 0.6), T(21, 0.3)])}
  up('#gi2-h', ${f(T(22))}, 24); sweep('#gi2-h .hl', ${f(T(22, 0.6))});` });

say({ id: 'g-i3', s: T(23, -0.05), e: T(28, -0.1), html: `
  <div id="gi3-c" class="card scard say">
    ${pill('gi3-k', '쉽게 말하면, 내비게이션', C.sky, 'pill-soft')}
    <div class="duo2">
      <div id="gi3-a" class="dcol">${ico('gi3-ia', 'map', C.sky, BG.sky, 'sm')}<div class="dct">내비 이전</div><div class="dcs">지도 보고<br>스스로 길 찾기</div></div>
      ${arrow('gi3-ar')}
      <div id="gi3-b" class="dcol">${ico('gi3-ib', 'car', C.coral, BG.peach, 'sm')}<div class="dct">내비 이후</div><div class="dcs">내비 없이 운전할 수<br>있는 사람 <b class="dn">↓</b></div></div>
    </div>
  </div>`,
  anim: `rise('#gi3-c', ${f(T(23))}); up('#gi3-k', ${f(T(23, 0.3))}, 16); slide('#gi3-a', ${f(T(24, 0.2))}, -50);
  draw('#gi3-ar path', ${f(T(26, -0.2))}, .45); slide('#gi3-b', ${f(T(26, 0.2))}); pop('#gi3-b .dn', ${f(T(27, 1.0))});` });

say({ id: 'g-i4', s: T(28, -0.05), e: T(33, -0.1), html: `
  <div id="gi4-c" class="card scard say">
    <div id="gi4-h" class="h2">AI도 ${hl('마찬가지', 'var(--hl-m)')}입니다</div>
    <div class="chips5">
      ${chip('gi4-1', 'brain', C.lav, BG.lav, '생각')}
      ${chip('gi4-2', 'pen', C.coral, BG.peach, '글쓰기')}
      ${chip('gi4-3', 'palette', C.pink, BG.pink, '그림')}
      ${chip('gi4-4', 'music', C.sky, BG.sky, '음악')}
      ${chip('gi4-5', 'code', C.mint, BG.mint, '코딩')}
    </div>
    <div id="gi4-s" class="sub">AI와 함께하는 시대는 <b>이미 시작됐어요</b></div>
  </div>`,
  anim: `rise('#gi4-c', ${f(T(28))}); up('#gi4-h', ${f(T(28, 0.2))}, 24); sweep('#gi4-h .hl', ${f(T(28, 0.9))});
  pop('#gi4-1', ${f(T(29, 0.9))}); pop('#gi4-2', ${f(T(29, 1.8))}); pop('#gi4-3', ${f(T(30, 0.3))}); pop('#gi4-4', ${f(T(30, 1.2))}); pop('#gi4-5', ${f(T(31))});
  up('#gi4-s', ${f(T(32))}, 16);` });

say({ id: 'g-i5', s: T(33, -0.05), e: T(38, -0.1), html: `
  <div id="gi5-c" class="card scard say">
    ${pill('gi5-k', '시간이 흐르면…', C.yellow, 'pill-soft')}
    <div class="row gap">${ico('gi5-i', 'users', C.lav, BG.lav)}${ico('gi5-j', 'sparkle', C.yellow, BG.yellow)}</div>
    <div id="gi5-t" class="sub">그때 태어난 아이들에겐 <b>AI가 익숙한 것</b></div>
    <div id="gi5-h" class="h2">AI 없이 하는 게<br>${hl('오히려 어색한', 'var(--hl-p)')} 세대</div>
  </div>`,
  anim: `rise('#gi5-c', ${f(T(33))}); up('#gi5-k', ${f(T(33, 0.3))}, 16); pop('#gi5-i', ${f(T(34))}); pop('#gi5-j', ${f(T(35))});
  up('#gi5-t', ${f(T(35, 0.3))}, 16); up('#gi5-h', ${f(T(36, 0.2))}, 24); sweep('#gi5-h .hl', ${f(T(37))});` });

say({ id: 'g-i6', s: T(38, -0.05), e: T(43, -0.1), html: `
  <div id="gi6-c" class="card scard say">
    ${pill('gi6-k', '그렇기 때문에', C.coral, 'pill-soft')}
    <div class="eqs">
      <div id="gi6-r1" class="eq">${ico('gi6-i1', 'map', C.sky, BG.sky, 'xs')}<span>내비 없으면</span>${arrow('gi6-a1', 'sm')}<b>길을 못 찾고</b></div>
      <div id="gi6-r2" class="eq hot">${ico('gi6-i2', 'sparkle', C.yellow, BG.yellow, 'xs')}<span>AI 없으면</span>${arrow('gi6-a2', 'sm')}<b>글쓰기도, 생각도 어렵다</b></div>
    </div>
  </div>`,
  anim: `rise('#gi6-c', ${f(T(38))}); up('#gi6-k', ${f(T(38, 0.3))}, 16);
  slide('#gi6-r1', ${f(T(39))}); draw('#gi6-a1 path', ${f(T(40))}, .4); slide('#gi6-r2', ${f(T(41))}); draw('#gi6-a2 path', ${f(T(42))}, .4);` });

say({ id: 'g-i7', s: T(43, -0.05), e: T(51, -0.1), html: `
  <div id="gi7-c" class="card scard say">
    ${pill('gi7-k', 'AI를 어려서부터 쓰는 세대라면', C.pink, 'pill-soft')}
    <div class="bars">
      <div id="gi7-b1" class="barrow">${ico('gi7-i1', 'book', C.coral, BG.peach, 'xs')}<span class="blab">책 읽는 시간</span><div class="bar"><span id="gi7-f1" class="barf" style="background:#f3a48e"></span></div></div>
      <div id="gi7-b2" class="barrow">${ico('gi7-i2', 'brain', C.lav, BG.lav, 'xs')}<span class="blab">생각하는 시간</span><div class="bar"><span id="gi7-f2" class="barf" style="background:#b4a6f0"></span></div></div>
    </div>
    <div id="gi7-h" class="h2 sm">현저히 줄어들 ${hl('가능성', 'var(--hl-p)')}이 있습니다</div>
  </div>`,
  anim: `rise('#gi7-c', ${f(T(43))}); up('#gi7-k', ${f(T(46))}, 16); slide('#gi7-b1', ${f(T(47))}); slide('#gi7-b2', ${f(T(47, 0.6))});
  tl.fromTo('#gi7-f1, #gi7-f2', {width:'100%'}, {width:'26%', duration:1.6, ease:'power2.inOut', stagger:.25, immediateRender:false}, ${f(T(48))});
  up('#gi7-h', ${f(T(49))}, 20); sweep('#gi7-h .hl', ${f(T(50))});` });

say({ id: 'g-i8', s: T(51, -0.05), e: INTRO_E - 0.05, html: `
  <div id="gi8-c" class="card scard say">
    ${pill('gi8-k', '그래서 우리는', C.mint, 'pill-soft')}
    <div class="vs2">
      ${no('gi8-a', 'AI 사용법만 계속 익히기', 'big')}
      ${ok('gi8-b', 'AI를 활용해 사고력 향상하기', 'big')}
    </div>
    <div id="gi8-h" class="h2">이게 ${hl('굉장히 중요합니다', 'var(--hl-y)')}</div>
  </div>`,
  anim: `rise('#gi8-c', ${f(T(51))}); up('#gi8-k', ${f(T(51, 0.2))}, 16); pop('#gi8-a', ${f(T(51, 1.4))}); pop('#gi8-b', ${f(T(54))});
  up('#gi8-h', ${f(T(55))}, 22); sweep('#gi8-h .hl', ${f(T(55, 0.5))});` });

// ---- 2:10 AI 토론 (핵심 순간에만 split / peek) -------------------------------
const peek = (id, s, e, lines, mood = '') => add({ id, lane: 'peek', s, e, html: `
  <div id="${id}-w" class="peek">
    <div id="${id}-b" class="pbub ${mood}">${lines.map(([, t], i) => `<div id="${id}-l${i}" class="pl">${t}</div>`).join('')}<span class="pname">필로소피</span></div>
    <img id="${id}-p" class="pchar" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
  </div>`,
  anim: `tl.fromTo('#${id}-p', {y:420}, {y:0, duration:.6, ease:'back.out(1.3)'}, ${f(s + 0.05)});
  tl.to('#${id}-p', {y:420, duration:.4, ease:'power2.in'}, ${f(e - 0.45)});
  pop('#${id}-b', ${f(s + 0.35)}); ${lines.map(([t], i) => (i ? `up('#${id}-l${i}', ${f(t)}, 14);` : '')).join(' ')}
  tl.fromTo('#${id}-p', {rotation:0}, {rotation:-4, duration:.22, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(s + 0.7)});` });

add({ id: 'g-pick', lane: 'split', s: T(74, -0.1), e: TE(79, 0.3), html: `
  <div id="gpk-c" class="card side">
    ${pill('gpk-k', '제가 고른 것: 1, 2, 3 전부', C.sky, 'pill-soft')}
    <div class="vlist">
      ${chip('gpk-1', 'brain', C.lav, BG.lav, '논리적 사고')}
      ${chip('gpk-2', 'eye', C.sky, BG.sky, '비판적 사고')}
      ${chip('gpk-3', 'sparkle', C.yellow, BG.yellow, '창의적 사고')}
    </div>
    ${ok('gpk-ok', '토론 질문 주고받기', 'ok-sm')}
  </div>`,
  anim: `rise('#gpk-c', ${f(T(74))}); up('#gpk-k', ${f(T(75))}, 16); slide('#gpk-1', ${f(T(76, 0.1))}); slide('#gpk-2', ${f(T(76, 0.8))}); slide('#gpk-3', ${f(T(76, 1.6))}); pop('#gpk-ok', ${f(T(78))});` });

add({ id: 'g-topic', lane: 'split', s: T(80, -0.1), e: TE(82, 0.4), html: `
  <div id="gtp-c" class="card side center">
    ${pill('gtp-k', '토론 주제', C.coral, 'pill-soft')}
    ${ico('gtp-i', 'question', C.lav, BG.lav)}
    <div id="gtp-h" class="h3">AI가 인간의 ${hl('창의성', 'var(--hl-y)')}을<br>대체할 수 있을까?</div>
  </div>`,
  anim: `rise('#gtp-c', ${f(T(80))}); up('#gtp-k', ${f(T(80, 0.2))}, 16); pop('#gtp-i', ${f(T(80, 0.5))}); up('#gtp-h', ${f(T(81))}, 24); sweep('#gtp-h .hl', ${f(T(81, 0.8))});` });

add({ id: 'g-myarg', lane: 'split', s: T(83, -0.1), e: TE(92, 0.4), html: `
  <div id="gma-c" class="card side">
    ${pill('gma-k', '나의 주장', C.coral, 'pill-soft')}
    <div id="gma-d" class="def">창의성 = <b>기존에 없는 것</b>을 생각해내는 것</div>
    <div id="gma-1" class="cmp2 good">${ico('gma-i1', 'target', C.mint, BG.mint, 'xs')}<div><b>사람</b><span>확률이 낮아도 확신을 갖고 도전</span></div></div>
    <div id="gma-2" class="cmp2 bad">${ico('gma-i2', 'dice', C.grey, BG.grey, 'xs')}<div><b>AI</b><span>확률이 낮으면 선택하지 않는다</span></div></div>
  </div>`,
  anim: `rise('#gma-c', ${f(T(83))}); up('#gma-k', ${f(T(83, 0.2))}, 16); up('#gma-d', ${f(T(84))}, 16);
  slide('#gma-1', ${f(T(87))}); slide('#gma-2', ${f(T(90))});` });

peek('g-p-sharp', T(104, -0.1), TE(108, 0.6), [[T(104), '이렇게 <b>날선 토론</b>은 처음!'], [T(108), 'AI가 약간 <b>긁혔나 봐요</b>']]);

add({ id: 'g-counter1', lane: 'split', s: T(116, -0.1), e: T(121, -0.05), html: `
  <div id="gc1-c" class="card side">
    ${pill('gc1-k', 'AI의 반론 두 가지', C.lav, 'pill-soft')}
    <div id="gc1-1" class="numrow"><span class="nb">1</span><div>‘기존에 없는 것’이라는<br><b>기준이 과연 명확할까요?</b></div></div>
    <div id="gc1-2" class="numrow"><span class="nb">2</span><div><b>확률 논리</b>에 대해서는?</div></div>
  </div>`,
  anim: `rise('#gc1-c', ${f(T(116, 0.1))}); up('#gc1-k', ${f(T(117))}, 16); slide('#gc1-1', ${f(T(118))}); slide('#gc1-2', ${f(T(120))});` });

peek('g-p-blush', T(121, 0.05), TE(123, 0.3), [[T(121), '여기서부터 <b>얼굴이 살짝</b><br><b>붉어지더라고요</b>']], 'blush');

add({ id: 'g-temp', lane: 'split', s: T(130, -0.1), e: TE(137, 0.5), html: `
  <div id="gtm-c" class="card side">
    ${pill('gtm-k', '나의 재반론', C.coral, 'pill-soft')}
    <div class="sub left">같은 ‘낮은 확률’이라도…</div>
    <div id="gtm-1" class="cmp2 bad">${ico('gtm-i1', 'dice', C.grey, BG.grey, 'xs')}<div><b>AI</b><span>temperature로 <em>랜덤하게</em></span></div></div>
    <div id="gtm-ne" class="ne">≠</div>
    <div id="gtm-2" class="cmp2 good">${ico('gtm-i2', 'target', C.coral, BG.peach, 'xs')}<div><b>인간</b><span><em>의도·목적성</em>을 가지고</span></div></div>
    <div id="gtm-h" class="h3 sm">${hl('근본적으로 다릅니다', 'var(--hl-p)')}</div>
  </div>`,
  anim: `rise('#gtm-c', ${f(T(130))}); up('#gtm-k', ${f(T(130, 0.2))}, 16); slide('#gtm-1', ${f(T(130, 0.6))}); pop('#gtm-ne', ${f(T(131))});
  slide('#gtm-2', ${f(T(131, 0.4))}); up('#gtm-h', ${f(T(137))}, 16); sweep('#gtm-h .hl', ${f(T(137, 0.3))});` });

add({ id: 'g-brain', lane: 'split', s: T(140, -0.1), e: TE(146, 0.6), html: `
  <div id="gbr-c" class="card side center">
    ${ico('gbr-i', 'brain', C.lav, BG.lav)}
    ${pill('gbr-k', '토론하면서 느낀 점', C.mint, 'pill-soft')}
    <div id="gbr-h" class="h3">평소보다 AI를 쓸 때<br>${hl('머리를 많이 쓰게', 'var(--hl-y)')}<br>되더라고요</div>
  </div>`,
  anim: `rise('#gbr-c', ${f(T(140))}); pop('#gbr-i', ${f(T(140, 0.3))}); up('#gbr-k', ${f(T(140, 0.5))}, 16); up('#gbr-h', ${f(T(143))}, 24); sweep('#gbr-h .hl', ${f(T(145, 0.3))});
  tl.fromTo('#gbr-i', {scale:1}, {scale:1.08, duration:.5, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(143, 0.5))});` });

add({ id: 'g-intent', lane: 'split', s: T(151, -0.1), e: TE(154, 0.6), html: `
  <div id="gin-c" class="card side">
    ${pill('gin-k', 'AI가 더 파고듭니다', C.lav, 'pill-soft')}
    <div id="gin-h" class="h3 left">‘의도’는 어떻게<br>확인할 수 있을까요?</div>
    <div class="row gap">
      <div id="gin-a" class="tagbox">진짜 의도</div><div id="gin-v" class="vs">vs</div><div id="gin-b" class="tagbox ghost">의도의 시뮬레이션</div>
    </div>
  </div>`,
  anim: `rise('#gin-c', ${f(T(151))}); up('#gin-k', ${f(T(151, 0.3))}, 16); up('#gin-h', ${f(T(153))}, 20);
  pop('#gin-a', ${f(T(154, 0.3))}); pop('#gin-v', ${f(T(154, 0.9))}); pop('#gin-b', ${f(T(154, 1.4))});` });

add({ id: 'g-draw', lane: 'split', s: T(157, -0.1), e: TE(171, 0.5), html: `
  <div id="gdr-c" class="card side">
    ${pill('gdr-k', '의도 확인법: 같은 그림을 또 그릴 수 있는가', C.coral, 'pill-soft')}
    <div class="prompt" id="gdr-p">“<b>행복</b>을 표현해 보세요”</div>
    <div id="gdr-1" class="cmp2 good">${ico('gdr-i1', 'house', C.coral, BG.peach, 'xs')}<div><b>어린아이</b><span>네 명의 가족과 집<br>다시 그려도 <em>비슷한 그림</em></span></div></div>
    <div id="gdr-2" class="cmp2 bad">${ico('gdr-i2', 'dice', C.grey, BG.grey, 'xs')}<div><b>AI</b><span>별의별 그림이 다 나온다</span></div></div>
    <div id="gdr-h" class="sub left">의도 없이 <b>확률적으로</b> 답하기 때문</div>
  </div>`,
  anim: `rise('#gdr-c', ${f(T(157))}); up('#gdr-k', ${f(T(157, 0.3))}, 16); up('#gdr-p', ${f(T(160))}, 16);
  slide('#gdr-1', ${f(T(162))}); pop('#gdr-i1', ${f(T(162, 0.3))}); slide('#gdr-2', ${f(T(166))}); pop('#gdr-i2', ${f(T(169))}); up('#gdr-h', ${f(T(170))}, 14);` });

add({ id: 'g-picasso', lane: 'split', s: T(185, -0.1), e: TE(190, 0.3), html: `
  <div id="gpc-c" class="card side">
    ${pill('gpc-k', '일관성이란?', C.pink, 'pill-soft')}
    <div id="gpc-1" class="cmp2 good">${ico('gpc-i1', 'palette', C.pink, BG.pink, 'xs')}<div><b>피카소</b><span>그림은 다양해도<br>누가 봐도 <em>피카소의 그림</em></span></div></div>
    <div id="gpc-2" class="cmp2 bad">${ico('gpc-i2', 'dice', C.grey, BG.grey, 'xs')}<div><b>AI</b><span>같은 프롬프트에도<br><em>아예 관련 없는 그림</em></span></div></div>
  </div>`,
  anim: `rise('#gpc-c', ${f(T(185))}); up('#gpc-k', ${f(T(185, 0.2))}, 16); slide('#gpc-1', ${f(T(185, 0.6))}); slide('#gpc-2', ${f(T(188))});` });

peek('g-p-think', T(193, -0.3), TE(194, 0.4), [[T(193, -0.3), '얼굴이 붉어지고<br><b>머리를 엄청 쓰게</b> 되더라고요']], 'blush');

add({ id: 'g-inner', lane: 'split', s: T(197, -0.1), e: TE(200, 0.2), html: `
  <div id="gnr-c" class="card side">
    ${pill('gnr-k', 'AI의 마지막 질문', C.lav, 'pill-soft')}
    <div id="gnr-h" class="h3 left">“AI에겐 내면이 없다”<br>— 그걸 ${hl('확신할 근거', 'var(--hl-p)')}는<br>무엇인가요?</div>
    <div id="gnr-t" class="scary">와… 무섭더라고요</div>
  </div>`,
  anim: `rise('#gnr-c', ${f(T(197))}); up('#gnr-k', ${f(T(197, 0.3))}, 16); up('#gnr-h', ${f(T(199))}, 20); sweep('#gnr-h .hl', ${f(T(199, 0.8))}); pop('#gnr-t', ${f(T(200, 0.2))});` });

add({ id: 'g-seem', lane: 'split', s: T(203, -0.1), e: TE(206, 0.6), html: `
  <div id="gsm-c" class="card side center">
    ${pill('gsm-k', '태생적인 차이', C.coral, 'pill-soft')}
    <div id="gsm-a" class="bigq">내면이 <b>있는</b> 것</div>
    <div id="gsm-ne" class="ne big">≠</div>
    <div id="gsm-b" class="bigq ghost">내면이 있는 것처럼 <b>보이는</b> 것</div>
  </div>`,
  anim: `rise('#gsm-c', ${f(T(203))}); up('#gsm-k', ${f(T(203, 0.2))}, 16); up('#gsm-a', ${f(T(204))}, 20); up('#gsm-b', ${f(T(205))}, 20); pop('#gsm-ne', ${f(T(206))});` });

add({ id: 'g-onto', lane: 'split', s: T(210, -0.1), e: TE(217, 0.4), html: `
  <div id="gon-c" class="card side">
    ${pill('gon-k', '결국 핵심 신념에 도달', C.lav, 'pill-soft')}
    <div id="gon-h" class="h3 left">철학에서 말하는<br>${hl('존재론적 입장', 'var(--hl-m)')}</div>
    <div id="gon-s" class="sub left">외부에서 구별이 불가능해져도<br><b>본질적으로 다르다</b></div>
    <div id="gon-r" class="mini">${ICON.zap(C.yellow)}<span>AI가 화가 난 것 같아요</span></div>
  </div>`,
  anim: `rise('#gon-c', ${f(T(210))}); up('#gon-k', ${f(T(210, 0.2))}, 16); up('#gon-h', ${f(T(211))}, 20); sweep('#gon-h .hl', ${f(T(211, 1.0))});
  pop('#gon-r', ${f(T(212, 0.2))}); up('#gon-s', ${f(T(216))}, 16);` });

add({ id: 'g-review', lane: 'split', s: T(218, -0.1), e: TE(226, 0.2), html: `
  <div id="grv-c" class="card side">
    ${pill('grv-k', 'AI의 토론 피드백', C.mint, 'pill-soft')}
    <div class="row gap wrap">${ok('grv-1', '논리적', 'ok-sm')}${ok('grv-2', '비판적', 'ok-sm')}${ok('grv-3', '창의적', 'ok-sm')}</div>
    <div id="grv-q" class="advice"><span class="adk">한 가지 더</span><b>“내가 틀릴 수 있는 조건은<br>무엇일까?”</b><span>스스로 질문하는 습관</span></div>
    <div id="grv-h" class="flexup">${ICON.trend(C.mint)}<span>사고의 유연성 <b>한 단계 UP</b></span></div>
  </div>`,
  anim: `rise('#grv-c', ${f(T(218))}); up('#grv-k', ${f(T(218, 0.2))}, 16); pop('#grv-1', ${f(T(220, 0.6))}); pop('#grv-2', ${f(T(220, 1.3))}); pop('#grv-3', ${f(T(220, 2.0))});
  up('#grv-q', ${f(T(223))}, 20); up('#grv-h', ${f(T(226))}, 16);` });

peek('g-p-angry', T(227, 0.3), TE(230, 0.1), [[T(227, 0.3), '존재론적으로 얘기하니까<br><b>화가 난 것 같아요</b>'], [T(229), '마지막엔 <b>따끔한 충고</b>까지!']]);

// ---- 6:48 마무리 (파스텔 풀스크린 + 캐릭터) -----------------------------------
const sayO = (g) => add({ ...g, outro: true });

sayO({ id: 'g-o1', s: T(231, -0.05), e: T(235, -0.1), html: `
  <div id="go1-c" class="card scard say">
    ${pill('go1-k', 'AI와 토론해 보고 느낀 점', C.coral, 'pill-soft')}
    ${ico('go1-i', 'search', C.sky, BG.sky)}
    <div id="go1-h" class="h2">우리는 AI를<br>${hl('정보를 얻으려고만', 'var(--hl-y)')} 쓰잖아요</div>
  </div>`,
  anim: `rise('#go1-c', ${f(T(231))}); up('#go1-k', ${f(T(231, 0.3))}, 16); pop('#go1-i', ${f(T(231, 0.8))}); up('#go1-h', ${f(T(233, 0.3))}, 24); sweep('#go1-h .hl', ${f(T(234))});` });

sayO({ id: 'g-o2', s: T(235, -0.05), e: T(243, -0.1), html: `
  <div id="go2-c" class="card scard say">
    ${pill('go2-k', '사용법은 어렵지 않아요', C.mint, 'pill-soft')}
    ${flow('go2', [['folder', C.sky, BG.sky, '프로젝트<br>만들기'], ['brain', C.lav, BG.lav, '사고력 향상<br>지침'], ['chat', C.coral, BG.peach, '토론하도록<br>세팅']], 'tight')}
    <div id="go2-h" class="h2 sm">생각보다 ${hl('머리를 많이 쓰게', 'var(--hl-y)')} 됩니다</div>
  </div>`,
  anim: `rise('#go2-c', ${f(T(235))}); up('#go2-k', ${f(T(235, 0.3))}, 16);
  ${flowAnim('go2', [T(236), T(237, 0.3), T(239)])}
  up('#go2-h', ${f(T(241))}, 22); sweep('#go2-h .hl', ${f(T(242))});` });

sayO({ id: 'g-o3', s: T(243, -0.05), e: T(252, -0.1), html: `
  <div id="go3-c" class="card scard say">
    ${pill('go3-k', '선생님들께', C.pink, 'pill-soft')}
    <div id="go3-h" class="h2 sm">학생들을 위해 어떻게 쓰면 좋을지<br>한번 고민해 보세요</div>
    <div class="vs2">
      ${no('go3-a', 'AI 사용법만 알려주기', 'big')}
      ${ok('go3-b', '사고력을 키우는 방향으로 AI 쓰게 하기', 'big')}
    </div>
  </div>`,
  anim: `rise('#go3-c', ${f(T(243))}); up('#go3-k', ${f(T(243, 0.3))}, 16); up('#go3-h', ${f(T(243, 0.9))}, 20);
  pop('#go3-a', ${f(T(249, 0.4))}); pop('#go3-b', ${f(T(250, 0.3))});` });

sayO({ id: 'g-o4', s: T(252, -0.05), e: T(257, -0.1), html: `
  <div id="go4-c" class="card scard say">
    ${pill('go4-k', '다시, 내비게이션', C.sky, 'pill-soft')}
    <div class="eqs">
      <div id="go4-r1" class="eq">${ico('go4-i1', 'car', C.sky, BG.sky, 'xs')}<span>내비 등장 이후</span>${arrow('go4-a1', 'sm')}<b>직접 운전하는 능력 ↓</b></div>
      <div id="go4-r2" class="eq hot">${ico('go4-i2', 'sparkle', C.yellow, BG.yellow, 'xs')}<span>AI 등장 이후</span>${arrow('go4-a2', 'sm')}<b>사고력 · 글쓰기 능력 ↓</b></div>
    </div>
  </div>`,
  anim: `rise('#go4-c', ${f(T(252))}); up('#go4-k', ${f(T(252, 0.2))}, 16);
  slide('#go4-r1', ${f(T(252, 0.6))}); draw('#go4-a1 path', ${f(T(253, 0.5))}, .4); slide('#go4-r2', ${f(T(254))}); draw('#go4-a2 path', ${f(T(255))}, .4);` });

sayO({ id: 'g-o5', s: T(257, -0.05), e: END_S - 0.05, html: `
  <div id="go5-c" class="card scard say">
    <div class="row gap">${ico('go5-i1', 'brain', C.lav, BG.lav, 'sm')}${ico('go5-i2', 'pen', C.coral, BG.peach, 'sm')}</div>
    <div id="go5-h" class="h2">AI로 ${hl('사고력', 'var(--hl-y)')}과 ${hl('글쓰기', 'var(--hl-m)')}를<br>키울 수 있도록</div>
    ${ok('go5-ok', '우리가 안내해 주세요')}
  </div>`,
  anim: `rise('#go5-c', ${f(T(257))}); pop('#go5-i1', ${f(T(257, 0.3))}); pop('#go5-i2', ${f(T(257, 0.6))}); up('#go5-h', ${f(T(258))}, 24);
  tl.fromTo('#go5-h .hl', {backgroundSize:'0% 38%'}, {backgroundSize:'100% 38%', duration:.6, ease:'power2.inOut', stagger:.5, immediateRender:false}, ${f(T(258, 1.0))});
  pop('#go5-ok', ${f(T(259))});` });

// ---------- overlap check ---------------------------------------------------
const laneOf = (g) => (g.lane === 'peek' ? 'peek' : 'card');
for (const L of ['card', 'peek']) {
  const xs = G.filter((g) => laneOf(g) === L).sort((a, b) => a.s - b.s);
  for (let i = 1; i < xs.length; i++) if (xs[i].s < xs[i - 1].e) { console.warn(`trim ${xs[i - 1].id} ${xs[i - 1].e} → ${xs[i].s - 0.05}`); xs[i - 1].e = +(xs[i].s - 0.05).toFixed(3); }
}
const peeks = G.filter((g) => g.lane === 'peek'), splitsG = G.filter((g) => g.lane === 'split');
for (const p of peeks) for (const s of splitsG) if (p.s < s.e && p.e > s.s) console.warn(`peek ${p.id} overlaps split ${s.id}`);
for (const g of G) if (!(g.e > g.s + 1.5)) console.warn(`short ${g.id}: ${g.s}–${g.e}`);

// split windows: merge split graphics closer than 1.2s so the footage doesn't bounce
const splits = [];
for (const g of splitsG.sort((a, b) => a.s - b.s)) {
  const last = splits.at(-1);
  if (last && g.s - last.e < 1.2) last.e = Math.max(last.e, g.e); else splits.push({ s: g.s, e: g.e });
}
const SPLIT = { x: 48, y: 180, scale: 0.6 };
const CLIP0 = 'inset(0px 0px 0px 0px round 0px)', CLIP1 = 'inset(0px 0px 160px 0px round 60px)'; // crop burned captions + taskbar
const splitAnim = splits.map(({ s, e }) => `
  tl.fromTo('#vwrap', {x:0, y:0, scale:1, clipPath:'${CLIP0}'}, {x:${SPLIT.x}, y:${SPLIT.y}, scale:${SPLIT.scale}, clipPath:'${CLIP1}', duration:.6, ease:'power3.inOut', immediateRender:false}, ${f(s - 0.2)});
  tl.fromTo('#vwrap', {x:${SPLIT.x}, y:${SPLIT.y}, scale:${SPLIT.scale}, clipPath:'${CLIP1}'}, {x:0, y:0, scale:1, clipPath:'${CLIP0}', duration:.6, ease:'power3.inOut', immediateRender:false}, ${f(e - 0.3)});`).join('');

// ---------- full-screen pastel stages (intro, outro) ------------------------
let seed = 20261023;
const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const decorPos = [[120, 140], [420, 90], [780, 60], [1180, 110], [1560, 80], [1820, 190], [70, 480], [1860, 470], [160, 800], [560, 840], [1360, 850], [1780, 780], [980, 820], [300, 360], [1640, 330]];
const stage = (key, s, e, beats, opts = {}) => {
  const decor = decorPos.map(([x, y], i) => ({ id: `${key}-dc${i}`, x, y, kind: ['dia', 'ring', 'dot', 'dia', 'dot'][i % 5], color: ['#7fd1ae', '#b9acf2', '#f4c25b', '#f39a86', '#f3a3b8'][i % 5],
    size: (14 + rand() * 12).toFixed(1), ph: +rand().toFixed(3), amp: +(5 + rand() * 7).toFixed(1) }));
  const d = e - s;
  const html = `<div id="${key}bg" class="stagebg clip" data-start="${f(s)}" data-duration="${f(d)}" data-track-index="1">
    <div class="blob" style="left:-220px;top:-200px;width:900px;height:760px;background:radial-gradient(closest-side,rgba(255,205,186,.75),rgba(255,205,186,0))"></div>
    <div class="blob" style="left:1180px;top:380px;width:980px;height:820px;background:radial-gradient(closest-side,rgba(207,195,255,.7),rgba(207,195,255,0))"></div>
    <div class="blob" style="left:700px;top:-260px;width:760px;height:600px;background:radial-gradient(closest-side,rgba(185,232,209,.6),rgba(185,232,209,0))"></div>
    ${decor.map((x) => `<span id="${x.id}" class="dc dc-${x.kind}" style="left:${x.x}px;top:${x.y}px;width:${x.size}px;height:${x.size}px;--c:${x.color}"></span>`).join('')}
  </div>
  <div id="${key}-char" class="charclip clip" data-start="${f(s)}" data-duration="${f(d)}" data-track-index="4">
    <div id="${key}-wrap" class="cwrap">
      <img id="${key}-phil" class="cphil" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
      <div class="ctag">${pill(`${key}-k`, '필로소피', C.coral)}</div>
    </div>
  </div>`;
  const anim = `
  tl.fromTo('#${key}bg', {opacity:0}, {opacity:1, duration:.5, ease:'power2.out'}, ${f(s)});
  tl.to('#${key}bg', {opacity:0, duration:.5, ease:'power2.in'}, ${f(e - 0.5)});
  tl.fromTo('#${key}bg .blob', {scale:1, x:0}, {scale:1.12, x:40, duration:${f(d)}, ease:'sine.inOut', stagger:.3}, ${f(s)});
  tl.fromTo('#${key}-wrap', {opacity:0, y:300}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, ${f(s + 0.15)});
  tl.to('#${key}-wrap', {opacity:0, y:80, duration:.45, ease:'power2.in'}, ${f(e - 0.5)});
  ${beats.map((t) => `tl.fromTo('#${key}-phil', {y:0}, {y:-26, duration:.18, ease:'power2.out', yoyo:true, repeat:1, immediateRender:false}, ${f(t - 0.05)});`).join(' ')}
  { const dd = ${f(d - 1.4)}, cyc = .46, n = Math.max(0, Math.floor(dd / cyc) - 1);
    tl.fromTo('#${key}-phil', {scaleY:1, scaleX:1}, {scaleY:1.018, scaleX:.992, duration:cyc / 2, ease:'sine.inOut', yoyo:true, repeat:n * 2 + 1, immediateRender:false}, ${f(s + 1)});
    const c2 = 2.6, m = Math.max(0, Math.floor(dd / c2) - 1);
    tl.fromTo('#${key}-wrap', {rotation:-1.6}, {rotation:1.6, duration:c2 / 2, ease:'sine.inOut', yoyo:true, repeat:m * 2 + 1, immediateRender:false}, ${f(s + 1)}); }
  { const dec = ${JSON.stringify(decor.map((x) => ({ id: x.id, ph: x.ph, amp: x.amp })))};
    const els = dec.map((x) => document.getElementById(x.id)); const drv = { t: 0 };
    tl.fromTo(drv, { t: 0 }, { t: ${f(d)}, duration: ${f(d)}, ease: 'none', onUpdate: () => {
      for (let i = 0; i < dec.length; i++) { const a = (drv.t / 9 + dec[i].ph) * Math.PI * 2;
        els[i].style.transform = 'translate(' + (Math.cos(a * .7) * dec[i].amp).toFixed(2) + 'px,' + (Math.sin(a) * dec[i].amp * 1.4).toFixed(2) + 'px) rotate(' + (45 + Math.sin(a * .5) * 30).toFixed(1) + 'deg)'; } } }, ${f(s)}); }`;
  return { html, anim };
};
const intro = stage('intro', INTRO_S, INTRO_E, G.filter((g) => g.intro).map((g) => g.s).slice(1));
const outro = stage('outro', OUTRO_S, DUR, G.filter((g) => g.outro).map((g) => g.s).slice(1).concat([END_S]));

// end card: the character steps to centre-left and waves, 좋아요 · 구독
const endHTML = `<div id="endclip" class="clip" data-start="${f(END_S)}" data-duration="${f(DUR - END_S)}" data-track-index="5">
    <div id="end-in" class="endin">
      <div id="end-k" class="end-k">오늘의 영상은 여기까지입니다</div>
      <div id="end-h" class="end-big">AI로 ${hl('생각하는 힘', 'var(--hl-y)')}을 키우세요</div>
      <div class="row gap">
        <div id="end-like" class="cta">${ICON.thumb('#ffffff')}<span>좋아요</span></div>
        <div id="end-sub" class="cta sub2">${ICON.bell('#ffffff')}<span>구독</span></div>
      </div>
      <div id="end-t" class="end-mid">감사합니다 · 필로소피 AI 교육</div>
    </div>
  </div>`;
const endAnim = `
  rise('#end-in', ${f(END_S + 0.1)}); up('#end-k', ${f(END_S + 0.3)}, 16); up('#end-h', ${f(END_S + 0.5)}, 30); sweep('#end-h .hl', ${f(END_S + 1.2)});
  pop('#end-like', ${f(T(262, 0.2))}); pop('#end-sub', ${f(T(262, 0.8))}); up('#end-t', ${f(T(263, -0.1))}, 14);
  tl.fromTo('#end-like', {rotation:0}, {rotation:-12, duration:.18, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(T(262, 0.8))});
  tl.fromTo('#end-sub svg', {rotation:0}, {rotation:16, duration:.12, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(262, 1.4))});
  tl.fromTo('#outro-phil', {rotation:0}, {rotation:-5, duration:.3, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(END_S + 0.4)});`;

// ---------- section chips ---------------------------------------------------
const sections = [
  [0, INTRO_S, '01', '사고력 향상 AI 멘토 만들기'],
  [INTRO_S, DEBATE_S, '02', '왜 사고력일까?'],
  [DEBATE_S, DEBATE_E, '03', 'AI와 토론 실습'],
  [DEBATE_E, END_S, '04', '토론을 마치며'],
];
const secHTML = sections.map(([s, e, n, label], i) =>
  `<div id="sec${i}" class="chapter clip" data-start="${f(s)}" data-duration="${f(e - s)}" data-track-index="6"><div id="sec${i}-in" class="chip-in"><b>${n}</b><span>${label}</span></div></div>`).join('\n');
const secAnim = sections.map(([s], i) => `tl.fromTo('#sec${i}-in', {opacity:0, x:30}, {opacity:1, x:0, duration:.5, ease:'power3.out'}, ${f(s + 0.3)});`).join('\n  ');
// debate opens with a chapter card
const ccS = DEBATE_S;
const ccHTML = `<div id="cc0" class="ccard clip" data-start="${f(ccS)}" data-duration="2.700" data-track-index="7"><div id="cc0-in" class="cc-in"><div class="cc-n">실습</div><div class="cc-t">AI와 날선 토론 해보기</div><div class="cc-s">주제 · AI가 인간의 창의성을 대체할 수 있을까?</div></div></div>`;
const ccAnim = `
  tl.fromTo('#cc0-in', {opacity:0, y:40, scale:.92}, {opacity:1, y:0, scale:1, duration:.55, ease:'power3.out'}, ${f(ccS + 0.15)});
  tl.to('#cc0-in', {opacity:0, y:-20, duration:.4, ease:'power2.in'}, ${f(ccS + 2.25)});`;

// ---------- assemble ---------------------------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const track = { card: 2, split: 2, peek: 3 };
const gHTML = G.map((g) => `
<div id="${g.id}" class="scene clip" data-start="${f(g.s)}" data-duration="${f(g.e - g.s)}" data-track-index="${track[g.lane]}">
  <div id="${g.id}-sc" class="sc${g.lane === 'peek' ? ' sc-peek' : ''}">${g.wash ? `<div class="wash wash-${g.wash}"></div>` : ''}${g.html}
  </div>
</div>`).join('\n');
const gAnim = G.map((g) => `
  // ${g.id}
  tl.fromTo('#${g.id}-sc', {opacity:0}, {opacity:1, duration:.4, ease:'power2.out'}, ${f(g.s)});
  tl.to('#${g.id}-sc', {opacity:0, duration:.35, ease:'power2.in'}, ${f(g.e - 0.37)});
  ${g.anim.trim()}`).join('\n');
const capHTML = cues.map((c, i) =>
  `<div id="cap${i}" class="cap clip" data-start="${c.s.toFixed(3)}" data-duration="${Math.max(0.2, Math.min(c.e, DUR) - c.s).toFixed(3)}" data-track-index="8"><span>${esc(c.text)}</span></div>`).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>AI로 사고력 향상하기</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face { font-family: "Pretendard"; src: url("assets/fonts/PretendardVariable.woff2") format("woff2-variations"); font-weight: 45 920; font-style: normal; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: #fdf6ee; }
:root {
  --ink: #34314a; --ink-soft: #5b5873; --cream: #fdf6ee;
  --hl-y: rgba(255, 220, 120, .8); --hl-m: rgba(140, 222, 190, .72); --hl-p: rgba(248, 180, 200, .78);
}
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Pretendard", sans-serif; color: var(--ink);
  background: linear-gradient(135deg, #fff4ea 0%, #fdf0f4 50%, #efedff 100%); }

/* footage — shrinks to the left during debate key moments */
#vframe { position: absolute; inset: 0; z-index: 0; filter: drop-shadow(0 24px 40px rgba(80, 60, 90, .25)); }
#vwrap { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; transform-origin: 0 0; clip-path: inset(0px 0px 0px 0px round 0px); }
#vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
#startfade, #endfade { position: absolute; inset: 0; z-index: 20; background: #fdf6ee; pointer-events: none; }
#endfade { opacity: 0; }

/* caption band — covers the burned-in captions and the Windows taskbar */
#band { position: absolute; left: 0; right: 0; top: 916px; height: 164px; z-index: 7;
  background: linear-gradient(180deg, #fffaf4 0%, #fdf3ea 100%); box-shadow: 0 -10px 30px rgba(80, 60, 50, .16); }
#band::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 6px;
  background: linear-gradient(90deg, #ffc7b4, #ffe39c 30%, #b9e8d1 60%, #cfc3ff 85%, #ffc2d3); }
.bdot { position: absolute; border-radius: 50%; }
.cap { position: absolute; left: 0; right: 0; top: 922px; height: 158px; z-index: 8; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.cap span { display: block; max-width: 1560px; padding: 0 30px; color: var(--ink);
  font-size: 52px; font-weight: 700; line-height: 1.3; text-align: center; word-break: keep-all; letter-spacing: -.01em; }

/* pastel stages */
.stagebg { position: absolute; inset: 0; z-index: 2; overflow: hidden; background: linear-gradient(135deg, #fff6ee 0%, #fdf1f4 45%, #f1f0ff 100%); }
.blob { position: absolute; border-radius: 50%; }
.dc { position: absolute; display: block; }
.dc-dot { border-radius: 50%; background: var(--c); opacity: .8; }
.dc-ring { border-radius: 50%; border: 4px solid var(--c); opacity: .85; }
.dc-dia { background: var(--c); opacity: .75; border-radius: 4px; }
.charclip { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
.cwrap { position: absolute; left: 50px; top: 170px; width: 520px; height: 720px; transform-origin: 50% 100%; }
.cphil { position: absolute; left: 0; bottom: 0; width: 520px; height: auto; transform-origin: 50% 100%; filter: drop-shadow(0 24px 30px rgba(80, 60, 90, .22)); }
.ctag { position: absolute; left: 0; right: 0; bottom: -10px; display: flex; justify-content: center; }
.say::before { content: ""; position: absolute; left: -30px; top: 120px; width: 0; height: 0;
  border-top: 22px solid transparent; border-bottom: 22px solid transparent; border-right: 32px solid rgba(255, 255, 255, .95); }

/* graphics */
.scene { position: absolute; inset: 0; z-index: 3; }
.sc { position: absolute; inset: 0; opacity: 0; }
.sc-peek { z-index: 1; }
.wash { position: absolute; left: 0; top: 0; width: 1920px; height: 916px; pointer-events: none; }
.wash-center { background: radial-gradient(ellipse 1400px 860px at 50% 50%, rgba(253, 246, 238, .9), rgba(253, 246, 238, .6) 60%, rgba(253, 246, 238, 0) 100%); }

.card { position: absolute; display: block; background: rgba(255, 255, 255, .95); border: 2px solid #fff; border-radius: 44px;
  box-shadow: 0 30px 70px rgba(80, 60, 70, .22), 0 6px 18px rgba(80, 60, 70, .1); }
.scard { left: 640px; top: 150px; width: 1200px; min-height: 560px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 56px 60px; }
.side { left: 1250px; top: 180px; width: 630px; display: flex; flex-direction: column; align-items: flex-start; gap: 26px; padding: 44px 44px 48px; }
.side.center { align-items: center; text-align: center; }
.titlecard { left: 330px; top: 220px; width: 1260px; display: flex; flex-direction: column; align-items: center; gap: 30px; padding: 64px 60px; }

.pill { display: inline-flex; align-items: center; gap: 14px; padding: 14px 28px; border-radius: 999px; background: #fff;
  box-shadow: 0 8px 22px rgba(120, 92, 80, .12); font-size: 30px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.side .pill { font-size: 26px; padding: 12px 24px; }
.pill-soft { background: #fff7ee; box-shadow: inset 0 0 0 2px #f6e8da; }
.pdot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; }
.okpill { display: inline-flex; align-items: center; gap: 16px; padding: 14px 30px 14px 16px; border-radius: 999px; background: #e3f6ec;
  font-size: 34px; font-weight: 750; color: #24533f; box-shadow: 0 10px 24px rgba(60, 140, 100, .14); white-space: nowrap; }
.okc { display: block; width: 50px; height: 50px; border-radius: 50%; background: #3fa877; padding: 6px; flex: 0 0 auto; }
.okc svg { display: block; width: 100%; height: 100%; }
.nopill { background: #f3f1f5; color: #7a7690; box-shadow: none; }
.nopill .okc { background: #b9b4c6; }
.nopill span:last-child { text-decoration: line-through; text-decoration-thickness: 3px; text-decoration-color: rgba(122, 118, 144, .6); }
.okpill.big { font-size: 40px; padding: 18px 40px 18px 18px; }
.okpill.big .okc { width: 58px; height: 58px; }
.ok-sm { font-size: 28px; padding: 10px 24px 10px 12px; }
.ok-sm .okc { width: 40px; height: 40px; }

.h1 { font-size: 96px; font-weight: 900; line-height: 1.18; letter-spacing: -.035em; word-break: keep-all; }
.h1.center { text-align: center; }
.h2 { font-size: 68px; font-weight: 850; line-height: 1.24; letter-spacing: -.03em; word-break: keep-all; text-align: center; }
.h2.sm { font-size: 54px; }
.h3 { font-size: 50px; font-weight: 850; line-height: 1.28; letter-spacing: -.03em; word-break: keep-all; }
.h3.left { text-align: left; }
.h3.sm { font-size: 42px; }
.hl { background-image: linear-gradient(var(--hlc), var(--hlc)); background-repeat: no-repeat; background-position: 0 88%; background-size: 0% 38%; padding: 0 4px; }
.sub { font-size: 38px; font-weight: 600; color: var(--ink-soft); text-align: center; word-break: keep-all; line-height: 1.35; }
.sub b { color: var(--ink); font-weight: 850; }
.sub.left { text-align: left; font-size: 32px; }
.row { display: flex; align-items: center; }
.row.gap { gap: 22px; }
.row.wrap { flex-wrap: wrap; }

.ico { display: flex; align-items: center; justify-content: center; width: 150px; height: 150px; border-radius: 50%; padding: 34px; flex: 0 0 auto;
  box-shadow: 0 12px 26px rgba(120, 92, 80, .12), inset 0 0 0 6px rgba(255, 255, 255, .7); }
.ico svg { display: block; width: 100%; height: 100%; }
.ico.sm { width: 120px; height: 120px; padding: 27px; }
.ico.xs { width: 84px; height: 84px; padding: 18px; }
.arrow { display: block; width: 90px; height: 24px; flex: 0 0 auto; }
.arrow.sm { width: 70px; }
.arrow path, .darrow path { stroke-dasharray: 1; stroke-dashoffset: 1; }
.darrow { display: block; width: 24px; height: 52px; margin-left: 30px; }
.flow { display: flex; align-items: flex-start; gap: 22px; }
.flow .arrow { margin-top: 63px; }
.node { display: flex; flex-direction: column; align-items: center; gap: 18px; width: 220px; }
.nlabel { font-size: 34px; font-weight: 750; color: var(--ink); text-align: center; word-break: keep-all; line-height: 1.25; }

.ichip { display: inline-flex; align-items: center; gap: 18px; padding: 10px 30px 10px 10px; border-radius: 999px; background: #fff;
  box-shadow: 0 8px 22px rgba(120, 92, 80, .12), inset 0 0 0 2px #f3ece4; font-size: 34px; font-weight: 800; white-space: nowrap; }
.chips5 { display: flex; flex-wrap: wrap; justify-content: center; gap: 22px; max-width: 1000px; }
.vflow, .vlist { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.vlist { gap: 18px; }

.field { width: 100%; display: flex; flex-direction: column; gap: 8px; padding: 22px 28px; border-radius: 26px; background: #f8f6fc; box-shadow: inset 0 0 0 2px #ebe6f5; }
.flab { font-size: 24px; font-weight: 700; color: #8d7bd6; letter-spacing: .04em; }
.fval { font-size: 42px; font-weight: 900; letter-spacing: -.03em; line-height: 1.25; }
.fval.sm { font-size: 36px; font-weight: 800; }

.duo2 { display: flex; align-items: center; gap: 40px; }
.dcol { width: 400px; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 34px 20px; border-radius: 32px; background: #faf8fd; }
.dct { font-size: 44px; font-weight: 900; letter-spacing: -.03em; }
.dcs { font-size: 32px; font-weight: 600; color: var(--ink-soft); text-align: center; line-height: 1.35; }
.dcs b.dn { display: inline-block; color: #e8708f; font-size: 40px; font-weight: 900; }

.eqs { display: flex; flex-direction: column; gap: 24px; width: 100%; }
.eq { display: flex; align-items: center; gap: 24px; padding: 22px 34px; border-radius: 30px; background: #f7f5fb; font-size: 40px; font-weight: 650; color: var(--ink-soft); white-space: nowrap; }
.eq b { font-weight: 900; color: var(--ink); }
.eq.hot { background: #fff6e6; box-shadow: inset 0 0 0 3px #f6cf7c; }

.bars { display: flex; flex-direction: column; gap: 26px; width: 100%; }
.barrow { display: flex; align-items: center; gap: 22px; }
.blab { width: 250px; font-size: 36px; font-weight: 800; flex: 0 0 auto; }
.bar { flex: 1 1 auto; height: 44px; border-radius: 22px; background: #f1eef6; overflow: hidden; }
.barf { display: block; height: 100%; width: 100%; border-radius: 22px; }

.vs2 { display: flex; flex-direction: column; align-items: center; gap: 22px; }

.def { font-size: 32px; font-weight: 600; color: var(--ink-soft); line-height: 1.35; word-break: keep-all; }
.def b { color: var(--ink); font-weight: 850; }
.cmp2 { width: 100%; display: flex; align-items: center; gap: 22px; padding: 20px 24px; border-radius: 28px; }
.cmp2 > div:last-child { display: flex; flex-direction: column; gap: 4px; }
.cmp2 b { font-size: 36px; font-weight: 900; letter-spacing: -.02em; }
.cmp2 span { font-size: 30px; font-weight: 600; color: var(--ink-soft); line-height: 1.3; word-break: keep-all; }
.cmp2 em { font-style: normal; font-weight: 850; color: var(--ink); }
.cmp2.good { background: #effaf4; box-shadow: inset 0 0 0 3px #a9e0c4; }
.cmp2.bad { background: #f5f4f8; box-shadow: inset 0 0 0 2px #e4e1ec; }
.ne { align-self: center; font-size: 56px; font-weight: 900; color: #e8708f; line-height: .8; }
.ne.big { font-size: 80px; }
.numrow { display: flex; align-items: flex-start; gap: 20px; font-size: 36px; font-weight: 600; line-height: 1.35; word-break: keep-all; }
.numrow b { font-weight: 900; }
.nb { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: #ebe6ff; color: #6b58c8; font-size: 30px; font-weight: 900; flex: 0 0 auto; }
.tagbox { padding: 16px 26px; border-radius: 22px; background: #fff6e6; box-shadow: inset 0 0 0 3px #f6cf7c; font-size: 32px; font-weight: 850; white-space: nowrap; }
.tagbox.ghost { background: #f5f4f8; box-shadow: inset 0 0 0 3px #dcd7e8; border: 0; color: var(--ink-soft); }
.vs { font-size: 34px; font-weight: 900; color: #7d62c0; }
.prompt { font-size: 38px; font-weight: 700; color: var(--ink-soft); }
.prompt b { color: var(--ink); font-weight: 900; }
.scary { align-self: flex-end; padding: 12px 26px; border-radius: 999px; background: #fff0f3; color: #b04a6c; font-size: 30px; font-weight: 850; }
.bigq { font-size: 46px; font-weight: 750; line-height: 1.3; word-break: keep-all; }
.bigq b { font-weight: 900; color: #6b58c8; }
.bigq.ghost { color: var(--ink-soft); }
.bigq.ghost b { color: #b04a6c; }
.mini { display: inline-flex; align-items: center; gap: 12px; padding: 12px 24px 12px 14px; border-radius: 999px; background: #fff6e6; font-size: 30px; font-weight: 800; color: #9a6a12; }
.mini svg { width: 40px; height: 40px; }
.advice { width: 100%; display: flex; flex-direction: column; gap: 8px; padding: 24px 28px; border-radius: 28px; background: #fff6e6; box-shadow: inset 0 0 0 3px #f6cf7c; }
.adk { font-size: 24px; font-weight: 800; color: #b07d10; letter-spacing: .04em; }
.advice b { font-size: 38px; font-weight: 900; line-height: 1.3; letter-spacing: -.02em; }
.advice span:last-child { font-size: 28px; font-weight: 650; color: var(--ink-soft); }
.flexup { display: inline-flex; align-items: center; gap: 14px; font-size: 34px; font-weight: 700; }
.flexup svg { width: 52px; height: 52px; }
.flexup b { font-weight: 900; color: #2f8a63; }

/* peek: the character rises from behind the caption band */
.peek { position: absolute; right: 30px; bottom: 164px; width: 1100px; height: 520px; }
.pchar { position: absolute; right: 0; bottom: -60px; width: 330px; height: auto; filter: drop-shadow(0 18px 26px rgba(80, 60, 90, .25)); transform-origin: 50% 100%; }
.pbub { position: absolute; right: 330px; top: 120px; max-width: 640px; padding: 30px 40px 30px; border-radius: 40px 40px 10px 40px; background: #fff;
  box-shadow: 0 24px 60px rgba(80, 60, 70, .26), inset 0 0 0 3px #f3e6ff; display: flex; flex-direction: column; gap: 10px; transform-origin: 100% 100%; }
.pbub.blush { box-shadow: 0 24px 60px rgba(80, 60, 70, .26), inset 0 0 0 3px #ffc9d6; }
.pl { font-size: 44px; font-weight: 750; line-height: 1.28; letter-spacing: -.02em; word-break: keep-all; }
.pl b { font-weight: 900; color: #b04a6c; }
.pname { align-self: flex-end; font-size: 22px; font-weight: 700; color: #8a7cc0; }

/* section chip + chapter card + brand */
#brand { position: absolute; left: 36px; top: 30px; z-index: 6; display: flex; align-items: center; gap: 12px; padding: 12px 24px; border-radius: 999px;
  background: rgba(255, 255, 255, .94); box-shadow: 0 8px 22px rgba(80, 60, 70, .18); font-size: 24px; font-weight: 600; color: var(--ink-soft); }
#brand b { font-weight: 850; color: var(--ink); }
.chapter { position: absolute; right: 36px; top: 30px; z-index: 6; }
.chip-in { display: flex; align-items: center; gap: 12px; padding: 12px 24px; border-radius: 999px; background: rgba(255, 255, 255, .94);
  box-shadow: 0 8px 22px rgba(80, 60, 70, .18); font-size: 24px; font-weight: 700; color: var(--ink-soft); }
.chip-in b { color: #d0603f; font-weight: 850; }
.ccard { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.cc-in { margin-top: -80px; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 44px 84px; border-radius: 40px; background: rgba(255, 255, 255, .97);
  box-shadow: 0 30px 70px rgba(80, 60, 70, .25), inset 0 0 0 3px #f7e6da; }
.cc-n { font-size: 28px; font-weight: 800; letter-spacing: .18em; color: #d0603f; }
.cc-t { font-size: 78px; font-weight: 900; letter-spacing: -.035em; }
.cc-s { font-size: 32px; font-weight: 650; color: var(--ink-soft); }

/* end card (on the outro stage, right of the character) */
#endclip { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
.endin { position: absolute; left: 640px; top: 160px; width: 1200px; height: 600px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 34px;
  border-radius: 44px; background: rgba(255, 255, 255, .95); box-shadow: 0 30px 70px rgba(80, 60, 70, .22); }
.end-k { font-size: 36px; font-weight: 750; color: #d0603f; }
.end-big { font-size: 84px; font-weight: 900; letter-spacing: -.04em; text-align: center; line-height: 1.15; }
.end-mid { font-size: 36px; font-weight: 650; color: var(--ink-soft); }
.cta { display: inline-flex; align-items: center; gap: 16px; padding: 20px 44px 20px 30px; border-radius: 999px; background: #ef8a6f; color: #fff;
  font-size: 44px; font-weight: 900; box-shadow: 0 14px 30px rgba(239, 138, 111, .35); }
.cta svg { width: 54px; height: 54px; }
.cta.sub2 { background: #e8708f; box-shadow: 0 14px 30px rgba(232, 112, 143, .35); }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080">
  <div id="vframe"><div id="vwrap"><video id="vid" class="clip" src="assets/media/source.mp4" playsinline data-has-audio="true" data-start="0" data-duration="${DUR}" data-track-index="0"></video></div></div>
  ${intro.html}
  ${outro.html}
${gHTML}
  <div id="brand"><span class="pdot" style="background:#9a8be6"></span><span>필로소피</span><b>AI 교육</b></div>
${secHTML}
${ccHTML}
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

  tl.fromTo('#startfade', { opacity: 1 }, { opacity: 0, duration: .5, ease: 'power1.out' }, 0);

  // footage split (debate)
  ${splitAnim}

  // pastel stages
  ${intro.anim}
  ${outro.anim}

  // sections
  ${secAnim}
  ${ccAnim}

  // graphics
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
console.log(`Built ${G.length} graphics (${splitsG.length} split → ${splits.length} windows, ${peeks.length} peeks), ${cues.length} captions, intro ${INTRO_S}–${INTRO_E}, outro ${OUTRO_S}–${DUR}`);
