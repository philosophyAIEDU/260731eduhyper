import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 교수님만의 AI 연구실 (Philosophy Research Hub) — generator for index.html.
//
// Picture + sound: assets/media/src.mp4 (원본 녹화, 검정 박스·흰 글씨 자막이 이미 박혀 있음)
//   ① 덮개(모션그래픽 전용): 0~T62 앱 소개(웹사이트 화면) · T265~끝 마무리 + 엔드카드(원본 끝 오로라 포함)
//   ② T62~T265 앱 실습 화면 그대로 + 위쪽 빈 곳에 한 줄 안내 배너(STEP 1·2, 기능 1~8) + 짧은 임팩트 팝 2개
// 자막: ② 구간은 원본에 박힌 자막이 보이고, ① 구간에만 같은 SRT 문구를 같은 모양·위치로 다시 올린다.
// 모든 시각은 assets/source.srt 큐 시작 T(n) 에 맞춤.
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 527.85;

// ---------- SRT --------------------------------------------------------------
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const CUES = [];
fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .forEach((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); CUES.push({ s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }); });
const T = (n) => CUES[n - 1].s; // 큐 시작 (SRT 번호)

const COVER = [
  { id: 'cov1', s: 0, e: T(62), fin: 0, fout: 0.45 },
  { id: 'cov2', s: T(265), e: DUR, fin: 0.45, fout: 0 },
];
const inCover = (t) => COVER.some((c) => t >= c.s - 0.01 && t < c.e - 0.01);

// ---------- icons ----------------------------------------------------------
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

Object.assign(ICON, {
  search: (c) => S(c, `<circle cx="27" cy="27" r="16"/><path d="M39 39l15 15"/>`, 5),
  timer: (c) => S(c, `<circle cx="32" cy="36" r="20"/><path d="M32 36V25M26 8h12M32 8v8M48 18l4-4"/>`),
  globe: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M8 32h48M32 8c9 8 9 40 0 48M32 8c-9 8-9 40 0 48"/>`),
  code: (c) => S(c, `<path d="M22 18L8 32l14 14M42 18l14 14-14 14M36 12l-8 40"/>`),
  rocket: (c) => S(c, `<path d="M32 6c12 8 16 22 12 36H20C16 28 20 14 32 6z"/><circle cx="32" cy="26" r="5"/><path d="M20 42l-8 10h12M44 42l8 10H40M30 48v8M34 48v8"/>`),
  share: (c) => S(c, `<circle cx="16" cy="32" r="7"/><circle cx="46" cy="16" r="7"/><circle cx="46" cy="48" r="7"/><path d="M22 29l18-10M22 35l18 10"/>`),
  robot: (c) => S(c, `<rect x="12" y="20" width="40" height="30" rx="8"/><circle cx="24" cy="34" r="4" fill="${c}"/><circle cx="40" cy="34" r="4" fill="${c}"/><path d="M32 20v-8M28 12h8M26 44h12"/>`),
  phone: (c) => S(c, `<rect x="18" y="6" width="28" height="52" rx="6"/><path d="M28 50h8M24 18h16M24 26h16M24 34h10"/>`),
  card: (c) => S(c, `<rect x="6" y="14" width="52" height="36" rx="5"/><path d="M6 26h52M14 40h12"/>`),
  game: (c) => S(c, `<rect x="6" y="20" width="52" height="28" rx="14"/><path d="M18 34h10M23 29v10"/><circle cx="42" cy="31" r="2.5" fill="${c}"/><circle cx="48" cy="37" r="2.5" fill="${c}"/>`),
  cursor: (c) => S(c, `<path d="M16 8l34 22-15 4 9 17-7 4-9-17-12 10z" fill="${c}" stroke-width="2"/>`),
  remix: (c) => S(c, `<path d="M8 20h34l-8-8M42 20l-8 8M56 44H22l8-8M22 44l8 8"/>`),
  hourglass: (c) => S(c, `<path d="M16 8h32M16 56h32M20 8c0 14 24 16 24 24S20 42 20 56M44 8c0 14-24 16-24 24s24 10 24 24"/>`),
  calendar: (c) => S(c, `<rect x="8" y="12" width="48" height="42" rx="5"/><path d="M8 24h48M20 6v12M44 6v12M18 34h8M30 34h8M42 34h4M18 44h8M30 44h8"/>`),
  bulb: (c) => S(c, `<path d="M22 40c-6-4-9-10-9-16a19 19 0 0 1 38 0c0 6-3 12-9 16v6H22z"/><path d="M24 52h16M27 58h10"/>`),
});
const kbd = (t) => `<span class="kbd">${t}</span>`;

// ---------- graphics -------------------------------------------------------
// { id, s, e, html, anim, layer } — 'full' = 덮개 장면, 'ov' = 실습 화면 위 안내 배너, 'pop' = 실습 중 짧은 임팩트
const G = [];
const add = (g) => G.push({ layer: 'ov', ...g });
const sv = (name, c) => `<span class="bi">${ICON[name](c)}</span>`;

// ============ ① 앱 소개 (0 ~ T62) — 웹사이트 화면을 덮고 개념을 그림으로 ============================
add({ id: 'a-title', layer: 'full', s: 0, e: T(2), html: `
  <div id="at-ph" class="phwrap"><img class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="at-c" class="card titlecard">
    ${pill('at-k', '필로소피 AI 교육 · 교수님들을 위한 앱', C.coral, 'pill-soft')}
    <h1 id="at-h" class="h1 center">교수님만의<br>${hl('AI 연구실', 'var(--hl-y)')}</h1>
    <div id="at-s" class="appchip">${applogo('at-lg', 'sm')}<b>Philosophy Research Hub</b></div>
  </div>`, anim: `
  tl.fromTo('#at-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, .1);
  rise('#at-c', .2); up('#at-k', .4, 16); up('#at-h', .6, 34); sweep('#at-h .hl', 1.4); pop('#at-s', 2.2);` });

const DL = [['comment', '유튜브<br><b>고정 댓글</b>', T(2)], ['chat', '<b>네이버 카페</b><br>링크', T(4)], ['globe', '앱 소개<br><b>사이트</b>', T(5)]];
add({ id: 'a-dl', layer: 'full', s: T(2), e: T(9), html: `
  <div class="center-col" style="top:110px">
    ${pill('ad-k', '앱 받는 방법', C.sky, 'pill-soft')}
    <h2 id="ad-h" class="h2">어디서 받나요?</h2>
  </div>
  <div class="route" style="top:400px">${DL.map(([ic, t], i) => `${i ? arrowR(`ad-a${i}`, 'arrow-sm') : ''}<div id="ad-${i}" class="card rstep">${ico(`ad-i${i}`, ic, C.lav, BG.lav, 'xs')}<span class="rt">${t}</span></div>`).join('')}
    ${arrowR('ad-a3', 'arrow-sm')}
    <div id="ad-3" class="card rstep dlstep">${ico('ad-i3', 'download', '#ffffff', C.mint, 'xs')}<span id="ad-w" class="os2 win">Windows</span><span id="ad-m" class="os2">Mac</span></div>
  </div>
  <div id="ad-ok" class="endrib" style="top:740px">${ICON.check('#ffffff')}<span>내려받아 설치하면 끝!</span></div>`, anim: `
  up('#ad-k', ${f(T(2) + .2)}, 14); up('#ad-h', ${f(T(2) + .4)}, 26);
  ${DL.map(([, , t], i) => `${i ? `draw('#ad-a${i} path', ${f(t - .3)}, .3);` : ''} rise('#ad-${i}', ${f(t + .1)});`).join(' ')}
  draw('#ad-a3 path', ${f(T(6) - .3)}, .3); rise('#ad-3', ${f(T(6))}); pop('#ad-w', ${f(T(6) + .3)}); pop('#ad-m', ${f(T(7) + .1)});
  pop('#ad-ok', ${f(T(8) + .2)});` });

const DO = [['book', '논문 <b>저장</b>', T(10), C.sky, BG.sky], ['pen', '연구 <b>노트</b>', T(12), C.coral, BG.peach], ['folder', '연구 <b>프로젝트</b>', T(13), C.yellow, BG.yellow]];
add({ id: 'a-do', layer: 'full', s: T(9), e: T(14), html: `
  <div class="center-col" style="top:140px">
    <h2 id="ao-h" class="h2">AI 연구실은 ${hl('이런 일을', 'var(--hl-y)')} 해요</h2>
  </div>
  <div class="verbs" style="top:400px">${DO.map(([ic, t, , c, b], i) => `<div id="ao-${i}" class="card verb">${ico(`ao-i${i}`, ic, c, b)}<b class="vb">${t}</b></div>`).join('')}</div>`, anim: `
  up('#ao-h', ${f(T(9) + .2)}, 28); sweep('#ao-h .hl', ${f(T(9) + .9)});
  ${DO.map(([, , t], i) => `rise('#ao-${i}', ${f(t + .1)}); pop('#ao-i${i}', ${f(t + .3)});`).join(' ')}` });

add({ id: 'a-local', layer: 'full', s: T(14), e: T(19), html: `
  <div class="center-col" style="top:90px">
    ${pill('al-k', '중요한 것', C.mint, 'pill-soft')}
    <h2 id="al-h" class="h2">${hl('로컬 AI', 'var(--hl-m)')}로 도와줘요</h2>
  </div>
  <div id="al-pc" class="pcbig" style="top:400px">
    <div class="pcscreen">${ico('al-ai', 'sparkle', C.mint, BG.mint)}<div class="pcl">교수님 컴퓨터 안의 AI</div></div>
    <div class="pcneck"></div><div class="pcbase"></div>
  </div>
  <div id="al-f0" class="card feat" style="left:150px;top:520px">${ico('al-fi0', 'pen', '#ffffff', C.coral, 'xs')}<span>연구 <b>노트</b> 만들기</span></div>
  <div id="al-f1" class="card feat" style="left:1360px;top:520px">${ico('al-fi1', 'chart', '#ffffff', C.sky, 'xs')}<span>논문 <b>비교</b>하기</span></div>`, anim: `
  up('#al-k', ${f(T(14) + .2)}, 14); up('#al-h', ${f(T(15))}, 30); sweep('#al-h .hl', ${f(T(15) + .7)});
  rise('#al-pc', ${f(T(15) + .3)}); pop('#al-ai', ${f(T(15) + .7)});
  slide('#al-f0', ${f(T(16) + .2)}, -60); slide('#al-f1', ${f(T(17) + .2)}, 60);` });

const SCAT = [[180, 330, -8], [430, 300, 6], [250, 520, 4], [520, 500, -5], [330, 700, -3]];
add({ id: 'a-hub', layer: 'full', s: T(19), e: T(28), html: `
  <div class="center-col" style="top:90px">
    <h2 id="ah-h" class="h2">흩어진 연구자료를 → ${hl('지식 자산으로', 'var(--hl-y)')}</h2>
  </div>
  <div id="ah-fd" class="fdlabel">${ICON.folder('#b8923a')}<span>폴더 곳곳에 숨은 논문</span></div>
  ${SCAT.map(([x, y, r], i) => `<div id="ah-p${i}" class="paper" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)">${ICON.doc('#7d62c0')}<span>논문 ${['A', 'B', 'C', 'D', 'E'][i]}.pdf</span></div>`).join('')}
  ${arrowR('ah-ar', 'arrow-lg')}
  <div id="ah-hub" class="card hubbox">
    ${applogo('ah-lg')}
    <b>한 곳에 모으면</b>
    <div id="ah-ai" class="hubai">${ICON.sparkle('#7d62c0')}<span>AI가 연구를 도와줘요</span></div>
  </div>`, anim: `
  up('#ah-h', ${f(T(19) + .2)}, 28);
  up('#ah-fd', ${f(T(20))}, 14); ${SCAT.map((_, i) => `pop('#ah-p${i}', ${f(T(20) + .2 + i * .25)});`).join(' ')}
  draw('#ah-ar path', ${f(T(22))}, .4); rise('#ah-hub', ${f(T(22) + .2)}); pop('#ah-lg', ${f(T(22) + .5)});
  ${SCAT.map(([x, y], i) => `tl.to('#ah-p${i}', {x:${1340 - x}, y:${470 - y}, scale:.3, opacity:0, duration:.7, ease:'power2.in'}, ${f(T(22) + .9 + i * .12)});`).join(' ')}
  pop('#ah-ai', ${f(T(23) + .2)}); sweep('#ah-h .hl', ${f(T(27))});` });

add({ id: 'a-where', layer: 'full', s: T(28), e: T(35), html: `
  <div id="aw-c" class="card quote" style="top:170px">
    <div class="qmark">“</div>
    <div class="qrow2">${ico('aw-i', 'search', '#ffffff', C.pink, 'sm')}
      <div class="qbody" id="aw-b">아, 그 논문<br>${hl('어디 있었더라?', 'var(--hl-p)')}</div>
    </div>
  </div>
  <div class="outrow" style="top:620px;gap:30px">
    <div id="aw-0" class="card feat" style="position:relative">${ico('aw-i0', 'folder', '#ffffff', C.yellow, 'xs')}<span>폴더 뒤지고 · 윈도우 검색…</span></div>
    ${arrowR('aw-ar', 'arrow-lg')}
    <div id="aw-1" class="okpill">${'<span class="okc">' + ICON.check('#ffffff') + '</span>'}<span>여기 다 올려두고 바로 찾기</span></div>
  </div>`, anim: `
  rise('#aw-c', ${f(T(28) + .1)}); pop('#aw-i', ${f(T(28) + .4)}); sweep('#aw-b .hl', ${f(T(29))});
  tl.fromTo('#aw-i', {rotation:0}, {rotation:-12, duration:.16, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(30))});
  slide('#aw-0', ${f(T(31))}, -40); draw('#aw-ar path', ${f(T(33) + .6)}, .4); pop('#aw-1', ${f(T(34))});` });

const CMP = ['논문 1', '논문 2', '논문 3', '논문 4', '…10'];
add({ id: 'a-cmp', layer: 'full', s: T(35), e: T(39), html: `
  <div class="center-col" style="top:100px">
    <h2 id="ac-h" class="h2">방법이 어떻게 달랐지?</h2>
  </div>
  <div id="ac-t" class="card cmptable">
    <div class="crow head"><span></span>${CMP.map((c, i) => `<b id="ac-c${i}">${c}</b>`).join('')}</div>
    ${['연구 목적', '연구 방법', '결과'].map((r, j) => `<div class="crow"><span>${r}</span>${CMP.map((_, i) => `<i id="ac-x${j}${i}"></i>`).join('')}</div>`).join('')}
  </div>
  <div id="ac-n" class="endrib" style="top:800px;left:560px;width:800px">${ICON.chart('#ffffff')}<span>논문 2~10편을 한 번에 비교</span></div>`, anim: `
  up('#ac-h', ${f(T(35) + .2)}, 28); rise('#ac-t', ${f(T(36))});
  ${CMP.map((_, i) => `pop('#ac-c${i}', ${f(T(37) + i * .18)});`).join(' ')}
  ${[0, 1, 2].map((j) => CMP.map((_, i) => `tl.fromTo('#ac-x${j}${i}', {scaleX:0}, {scaleX:1, duration:.35, ease:'power2.out'}, ${f(T(37) + .8 + j * .3 + i * .08)});`).join(' ')).join(' ')}
  pop('#ac-n', ${f(T(38))});` });

add({ id: 'a-ai', layer: 'full', s: T(39), e: T(48), html: `
  <div class="center-col" style="top:90px">
    <h2 id="ai-h" class="h2">내 연구자료, 외부 AI에 올리기 ${hl('걱정되신다면?', 'var(--hl-p)')}</h2>
  </div>
  <div class="duo2" style="top:270px">
    <div id="ai-a" class="card dcard glow2">
      ${ico('ai-ai', 'pc', '#ffffff', C.mint)}
      <div class="dt"><b>로컬 AI</b> <span class="tagb">기본</span></div>
      <div class="ds">내 컴퓨터 안에서만<br><b>정보가 밖으로 안 나가요</b></div>
    </div>
    <div id="ai-or" class="orb">또는</div>
    <div id="ai-b" class="card dcard">
      ${ico('ai-bi', 'cloud', '#ffffff', C.sky)}
      <div class="dt"><b>Gemini API</b> <span class="tagb gray">선택</span></div>
      <div class="ds">구글 서버로 보내서 처리<br>컴퓨터가 <b>느릴 때</b> 사용</div>
    </div>
  </div>
  <div id="ai-r" class="endrib" style="top:790px;left:410px;width:1100px">${ICON.shield('#ffffff')}<span>외부로 안 나가길 원하면 → 로컬 AI 선택</span></div>`, anim: `
  up('#ai-h', ${f(T(39) + .2)}, 28); sweep('#ai-h .hl', ${f(T(41))});
  rise('#ai-a', ${f(T(42))}); pop('#ai-ai', ${f(T(42) + .3)});
  pop('#ai-or', ${f(T(44) - .2)}); rise('#ai-b', ${f(T(44))}); pop('#ai-bi', ${f(T(44) + .3)});
  pop('#ai-r', ${f(T(47))});` });

const MENU = [['search', 'AI 연구 검색'], ['chart', '논문 비교'], ['doc', '문헌 고찰 지원'], ['sparkle', '지식 그래프'], ['pen', '연구 노트'], ['folder', '연구 프로젝트'], ['book', 'Zotero 가져오기'], ['download', '내보내기']];
add({ id: 'a-menu', layer: 'full', s: T(48), e: T(53), html: `
  <div class="center-col" style="top:100px">
    <h2 id="am-h" class="h2">한마디로, ${hl('논문 관리 앱', 'var(--hl-y)')}</h2>
  </div>
  <div class="menugrid">${MENU.map(([ic, t], i) => `<div id="am-${i}" class="card mitem">${ico(`am-i${i}`, ic, '#ffffff', [C.sky, C.lav, C.coral, C.mint, C.pink, C.yellow, C.navy, C.sky][i], 'xs')}<b>${t}</b></div>`).join('')}</div>
  <div id="am-go" class="gochip" style="position:absolute;left:640px;top:780px;width:640px;justify-content:center">${ICON.play('#ffffff')}<span>실제 화면으로 볼게요</span></div>`, anim: `
  up('#am-h', ${f(T(48) + .2)}, 28); sweep('#am-h .hl', ${f(T(49))});
  ${MENU.map((_, i) => `pop('#am-${i}', ${f(T(50) + i * .2)});`).join(' ')} pop('#am-go', ${f(T(51) + .5)});` });

const ST3 = [['download', '프로그램<br><b>설치하기</b>', T(58), C.sky, BG.sky], ['sparkle', 'AI<br><b>먼저 고르기</b>', T(59), C.lav, BG.lav], ['key', '설정에서<br><b>연결하기</b>', T(60), C.mint, BG.mint]];
add({ id: 'a-start', layer: 'full', s: T(53), e: T(62), html: `
  <div class="center-col" style="top:90px">
    ${pill('as-k', '사이트에 다 정리되어 있어요', C.sky, 'pill-soft')}
    <h2 id="as-h" class="h2">시작은 ${hl('3단계', 'var(--hl-m)')}</h2>
  </div>
  <div class="tips" style="top:330px">${ST3.map(([ic, t, , c, b], i) => `<div id="as-${i}" class="card tip short"><span class="tnum">${i + 1}</span>${ico(`as-i${i}`, ic, c, b)}<div class="tt">${t}</div></div>`).join('')}</div>
  <div id="as-end" class="endrib" style="top:760px">${ICON.play('#ffffff')}<span>그 다음, 실제로 써 보기</span></div>`, anim: `
  up('#as-k', ${f(T(53) + .2)}, 14); up('#as-h', ${f(T(53) + .5)}, 28); sweep('#as-h .hl', ${f(T(54))});
  ${ST3.map(([, , t], i) => `rise('#as-${i}', ${f(t)}); pop('#as-i${i}', ${f(t + .25)});`).join(' ')}
  pop('#as-end', ${f(T(61) + .1)});` });

// ============ ② 실습 — 화면 위쪽 빈 곳에 단계 안내 배너 (한 줄, 키 큐에 칩 등장) =====================
// pos: 'top' 오른쪽 위 / 'topc' 오른쪽 버튼(파일 등록 등)을 피해 조금 왼쪽 / 'br' 오른쪽 아래(새 노트·새 프로젝트 버튼 구간)
const banner = (id, s, e, pos, badge, title, items) => add({ id, s, e, html: `
  <div id="${id}-c" class="ovc banner ${pos}">
    <span class="bdg">${badge}</span>${title ? `<b class="btitle">${title}</b>` : ''}
    ${items.map(([h, , cls = ''], i) => `${i ? `<span id="${id}-a${i}" class="bsep">›</span>` : ''}<span id="${id}-${i}" class="bchip ${cls}">${h}</span>`).join('')}
  </div>`, anim: `rise('#${id}-c', ${f(s + .1)});
  ${items.map(([, t], i) => `${i ? `pop('#${id}-a${i}', ${f(t - .1)});` : ''} pop('#${id}-${i}', ${f(t)});`).join(' ')}` });

banner('b-dash', T(64) + .1, T(77) - .1, 'top', '화면 둘러보기', '대시보드', [
  ['저장된 논문', T(67)], ['연구 노트', T(68)], ['진행 중 프로젝트', T(70)], ['의미 검색 색인', T(72)], ['처음엔 모두 0이에요', T(74), 'note']]);
banner('b-mgr', T(77), T(82) - .1, 'top', 'STEP 1', 'AI 연결하기', [
  ['현재 AI 모델 상태 → <b>관리</b>', T(77) + .3], ['설정 화면', T(81), 'ok']]);
banner('b-pick', T(82), T(96) - .1, 'top', 'STEP 1', 'AI 고르기', [
  [`${sv('pc', '#2f7a55')}<b>로컬 AI</b> 외부 전송 없음`, T(83), 'ok'], [`${sv('cloud', '#3d5a8a')}<b>Gemini API</b> 컴퓨터가 느릴 때`, T(84)], ['로컬로 쓰면 → <b>취소(로컬 AI 유지)</b>', T(93), 'note']]);
banner('b-model', T(96), T(109) - .1, 'top', 'STEP 1', 'AI 모델 받기', [
  ['엔진 <b>Ollama</b>', T(96) + .3], ['추천 모델 <b>다운로드</b>', T(98)], ['답변 <b>Qwen3 4B</b>', T(106), 'ok'], ['임베딩 = <b>의미 검색용</b>', T(107)]]);
banner('b-index', T(111), T(114) - .1, 'top', 'STEP 1', '의미 검색 색인', [
  ['<b>색인 만들기</b> 누르기', T(111) + .3], ['세팅 완료!', T(113), 'ok']]);
banner('b-tabs', T(114), T(121) - .1, 'top', '설정 탭', '', [
  ['연구실 자료 <b>백업</b>', T(114) + .3], ['<b>업데이트</b> 확인', T(115)], ['최신 버전 사용 중', T(118), 'ok']]);

add({ id: 'p-ready', layer: 'pop', s: T(123), e: T(127) - .1, html: `
  <div id="prd-c" class="card impact">
    <div id="prd-i" class="imico" style="background:#3fa877">${ICON.check('#ffffff')}</div>
    <div class="imtx"><small>Qwen3 4B · 로컬 AI</small><b>AI 준비 <span class="grn">완료!</span></b></div>
  </div>`, anim: `tl.fromTo('#prd-c', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.8)'}, ${f(T(123) + .05)}); confetti('prd', ${f(T(123) + .5)});` });

banner('b-reg', T(127), T(138) - .1, 'topc', 'STEP 2', '내 논문 등록', [
  ['<b>내 논문</b> 메뉴', T(128)], ['<b>파일 등록</b>', T(130)], ['실습 자료 <b>1 내 논문 등록</b>', T(134), 'note']]);

add({ id: 'p-reg', layer: 'pop', s: T(138), e: T(140) + 1.0, html: `
  <div id="prg-c" class="card impact">
    <div id="prg-i" class="imico" style="background:#6aa3e6">${ICON.book('#ffffff')}</div>
    <div class="imtx"><small>이제 논문을 활용해요</small><b>논문 <span class="grn">8편</span> 등록!</b></div>
  </div>`, anim: `tl.fromTo('#prg-c', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.8)'}, ${f(T(138) + .05)});` });

banner('b-mat', T(144), T(148) - .1, 'topc', '실습 자료', '', [
  [`${sv('comment', '#7d62c0')}유튜브 <b>고정 댓글</b>`, T(145)], ['<b>네이버 카페</b>에서 받기', T(146), 'ok']]);
banner('b-search', T(148), T(164) - .1, 'top', '기능 1', 'AI 연구 검색', [
  ['<b>내 논문 안에서</b> 찾기', T(152)], ['<b>로컬 AI</b>로 답변', T(159), 'ok'], ['근거 원문 · <b>PDF 열기</b>', T(161)]]);
banner('b-mode', T(164), T(170) - .1, 'top', '기능 1', '검색 방식', [
  ['하이브리드', T(164) + .2], ['의미 검색', T(165)], ['키워드', T(166)], ['<b>범위</b> 좁히기', T(167), 'ok']]);
banner('b-cmp', T(170), T(180) - .1, 'top', '기능 2', '논문 비교', [
  ['논문 선택', T(171)], ['비교 항목', T(172)], ['<b>비교표</b> 완성', T(173), 'ok'], ['Excel · Word · CSV', T(174)]]);
banner('b-idea', T(180), T(185) - .1, 'top', `${sv('comment', '#ffffff')}`, '', [
  ['넣고 싶은 기능은 <b>댓글</b>로', T(180) + .3], ['앱 업데이트에 <b>반영</b>', T(183), 'ok']]);
banner('b-lit', T(185), T(194) - .1, 'top', '기능 3', '문헌 고찰 지원', [
  ['논문 고르기', T(186)], ['<b>주제</b> 넣기', T(187)], ['<b>초안</b> + 출처 근거', T(190), 'ok']]);
banner('b-graph', T(194), T(201) - .1, 'top', '기능 4', '지식 그래프', [
  ['옵시디언처럼', T(195)], ['논문 사이 <b>관계</b>를 한눈에', T(196), 'ok']]);
banner('b-note', T(201), T(216) - .1, 'br', '기능 5', '연구 노트', [
  ['<b>새 노트</b> 직접', T(203)], ['<b>논문으로 AI 초안</b>', T(205), 'ok'], ['논문 → 관점 → 초안', T(207)]]);
banner('b-proj', T(216), T(235) - .1, 'br', '기능 6', '연구 프로젝트', [
  ['이름 · 설명 · 상태', T(219)], ['노트에서 <b>프로젝트 지정</b>', T(227)], ['<b>보고서</b>로 내보내기', T(232), 'ok']]);
banner('b-zot', T(235), T(252) - .1, 'br', '기능 7', 'Zotero 가져오기', [
  ['Zotero에서 <b>내보내기</b>', T(237)], ['파일 가져오기 <small>(실습 자료 2번)</small>', T(239)], ['<b>서지 연결</b>', T(244), 'ok']]);
banner('b-exp', T(252), T(263) - .1, 'top', '기능 8', '내보내기', [
  ['무엇을 내보낼지 <b>선택</b>', T(253)], ['Word · Excel · Markdown', T(257)], ['<b>한꺼번에</b> 저장', T(259), 'ok']]);
banner('b-set', T(263), T(265) - .1, 'top', '마지막', '설정', [['처음 봤던 그 화면', T(264)]]);

// ============ ① 마무리 (T265 ~ 끝) ================================================
add({ id: 'c-fast', layer: 'full', s: T(265), e: T(275), html: `
  <div class="center-col" style="top:90px">
    <h2 id="cf-h" class="h2">AI가 ${hl('정말 빠르게', 'var(--hl-p)')} 발전하고 있어요</h2>
  </div>
  <div id="cf-c" class="card chartc">
    <svg viewBox="0 0 900 380" class="chsvg" fill="none" stroke-linecap="round">
      <path d="M40 340H870M40 340V20" stroke="#d9d3e6" stroke-width="4"/>
      <path id="cf-ai" pathLength="1" d="M50 330C300 320 520 290 650 200S800 40 860 30" stroke="#e0607f" stroke-width="10"/>
      <path id="cf-me" pathLength="1" d="M50 330C300 315 600 300 860 280" stroke="#9a8be6" stroke-width="8" stroke-dasharray="1"/>
    </svg>
    <span id="cf-l0" class="chl" style="left:640px;top:40px;color:#c4486c">AI 발전 속도</span>
    <span id="cf-l1" class="chl" style="left:640px;top:330px;color:#6a57c0">따라가는 우리</span>
  </div>
  <div id="cf-n" class="endrib" style="top:800px;left:460px;width:1000px;background:#e0607f">${ICON.warn('#ffffff')}<span>새 것만 쫓다 보면 정작 할 일을 못 해요</span></div>`, anim: `
  up('#cf-h', ${f(T(265) + .2)}, 28); sweep('#cf-h .hl', ${f(T(266) + .4)}); rise('#cf-c', ${f(T(266))});
  draw('#cf-ai', ${f(T(266) + .5)}, 1.6); pop('#cf-l0', ${f(T(267) + .6)}); draw('#cf-me', ${f(T(269))}, 1.4); pop('#cf-l1', ${f(T(269) + 1.0)});
  pop('#cf-n', ${f(T(273))});` });

add({ id: 'c-env', layer: 'full', s: T(275), e: T(281), html: `
  <div class="duo2" style="top:200px">
    <div id="ce-a" class="card dcard dim">
      ${ico('ce-ai', 'x', '#ffffff', '#b9b3c9')}
      <div class="dt">AI <b>뒤만 따라가기</b></div>
      <div class="ds">새로 나올 때마다<br>쫓아가기 바빠요</div>
    </div>
    ${arrowR('ce-ar', 'arrow-lg')}
    <div id="ce-b" class="card dcard glow">
      ${ico('ce-bi', 'check', '#ffffff', C.mint)}
      <div class="dt"><b>내 업무에 맞게</b></div>
      <div class="ds">환경을 <b>세팅</b>해 두고<br id="ce-br">AI를 <b>하나씩 골라</b> 쓰기</div>
    </div>
  </div>`, anim: `
  rise('#ce-a', ${f(T(275) + .1)}); pop('#ce-ai', ${f(T(275) + .4)});
  draw('#ce-ar path', ${f(T(276))}, .4); rise('#ce-b', ${f(T(276) + .3)}); pop('#ce-bi', ${f(T(277))});
  tl.to('#ce-b', {scale:1.04, duration:.3, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(278) + .3)});` });

add({ id: 'c-app', layer: 'full', s: T(281), e: T(289), html: `
  <div id="cp-c" class="card appcard" style="top:150px">
    ${applogo('cp-lg')}
    <div class="appt"><span id="cp-k">교수님들을 위해 만든 앱</span><b id="cp-n">교수님만의 AI 연구실</b></div>
  </div>
  <div class="route" style="top:480px">
    <div id="cp-0" class="card rstep">${ico('cp-i0', 'comment', C.lav, BG.lav, 'xs')}<span class="rt">유튜브<br><b>고정 댓글</b></span></div>
    ${arrowR('cp-a1', 'arrow-sm')}
    <div id="cp-1" class="card rstep">${ico('cp-i1', 'download', '#ffffff', C.mint, 'xs')}<span class="rt">받아서<br><b>활용하기</b></span></div>
    ${arrowR('cp-a2', 'arrow-sm')}
    <div id="cp-2" class="card rstep">${ico('cp-i2', 'chat', '#ffffff', C.coral, 'xs')}<span class="rt">필요한 기능은<br><b>댓글로</b></span></div>
  </div>`, anim: `
  rise('#cp-c', ${f(T(281) + .1)}); pop('#cp-lg', ${f(T(281) + .3)}); up('#cp-k', ${f(T(281) + .5)}, 14); up('#cp-n', ${f(T(281) + .8)}, 24); confetti('cp', ${f(T(281) + 1.2)});
  rise('#cp-0', ${f(T(283))}); draw('#cp-a1 path', ${f(T(284) - .2)}, .3); rise('#cp-1', ${f(T(284))});
  draw('#cp-a2 path', ${f(T(285))}, .3); rise('#cp-2', ${f(T(285) + .2)});` });

add({ id: 'c-end', layer: 'full', s: T(289), e: DUR, html: `
  <div id="ce2-ph" class="phwrap" style="top:190px"><img class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="ce2-c" class="card titlecard" style="top:170px">
    ${pill('ce2-k', '필로소피 AI 교육 · 교수님만의 AI 연구실', C.lav, 'pill-soft')}
    <div id="ce2-h" class="h1 center" style="font-size:88px">오늘 영상<br>여기까지입니다</div>
    <div class="endbtns">
      <div id="ce2-l" class="ebtn like">${ICON.thumb('#ffffff')}<span>좋아요</span></div>
      <div id="ce2-s" class="ebtn sub">${ICON.bell('#ffffff')}<span>구독</span></div>
    </div>
    <div id="ce2-t" class="thanks">감사합니다 ${ICON.heart('#e8708f')}</div>
  </div>`, anim: `
  tl.fromTo('#ce2-ph', {opacity:0, y:200}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, ${f(T(289) + .1)});
  rise('#ce2-c', ${f(T(289) + .2)}); up('#ce2-k', ${f(T(289) + .4)}, 14); up('#ce2-h', ${f(T(289) + .5)}, 28);
  pop('#ce2-l', ${f(T(291))}); pop('#ce2-s', ${f(T(291) + .5)}); up('#ce2-t', ${f(T(293))}, 20);
  tl.to('#ce2-l', {scale:1.12, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(293) + 1.5)});
  tl.to('#ce2-s', {scale:1.12, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(293) + 2.1)});` });

// ---------- captions (whole video) ------------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const capHTML = CUES.map((c, i) => [c, i]).filter(([c]) => inCover(c.s)).map(([c, i]) =>
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
<title>교수님만의 AI 연구실</title>
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
.cap { position: absolute; left: 0; right: 0; bottom: 55px; z-index: 9; display: flex; justify-content: center; pointer-events: none; }
.cap span { display: block; max-width: 1820px; padding: 6px 22px 8px; background: #000; color: #fff;
  font-size: 64px; font-weight: 800; line-height: 1.2; text-align: center; word-break: keep-all; letter-spacing: -.01em; }

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
.ebtn.like { background: #3f78c4; box-shadow: 0 14px 30px rgba(106, 163, 230, .4); }
.ebtn.sub { background: #e0405f; box-shadow: 0 14px 30px rgba(224, 64, 95, .4); }
.thanks { display: flex; align-items: center; gap: 14px; font-size: 44px; font-weight: 850; color: var(--ink-soft); }
.thanks svg { width: 48px; height: 48px; }

/* ---- vibe-coding-beginner 추가 ---- */
.titlecard { gap: 30px; }
.subrow { display: flex; align-items: center; gap: 18px; }
.mini { display: inline-flex; align-items: center; gap: 12px; padding: 12px 24px 12px 14px; border-radius: 999px; background: #f6f3fd; box-shadow: inset 0 0 0 2px #e6e0f6; font-size: 34px; font-weight: 800; }
.mini svg { width: 44px; height: 44px; }
.gochip { display: flex; align-items: center; gap: 14px; padding: 14px 34px 14px 16px; border-radius: 999px; background: #ef8a6f; color: #fff; font-size: 34px; font-weight: 850; box-shadow: 0 14px 30px rgba(239, 138, 111, .4); }
.gochip svg { width: 50px; height: 50px; }

.ovc.narrow { width: 360px; right: 20px; top: 128px; }
.ovc.lside { left: 28px; top: 250px; width: 470px; }
.timerrow { display: flex; align-items: center; gap: 16px; }
.timerrow div { display: flex; flex-direction: column; }
.timerrow small { font-size: 20px; font-weight: 700; color: var(--ink-soft); }
.timerrow b { font-size: 50px; font-weight: 900; letter-spacing: -.03em; line-height: 1.05; color: #d2603f; }
.promptbox { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; border-radius: 16px; background: #f6f3fd; box-shadow: inset 0 0 0 2px #e6e0f6; }
.promptbox small { display: flex; align-items: center; gap: 8px; font-size: 19px; font-weight: 800; color: #7d62c0; }
.promptbox small svg { width: 26px; height: 26px; }
.promptbox p { font-size: 22px; font-weight: 750; line-height: 1.4; color: var(--ink); }
.featgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fchip2 { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; font-size: 22px; font-weight: 850; }
.fchip2.wide { grid-column: 1 / 3; }
.fdot { display: block; width: 14px; height: 14px; border-radius: 50%; flex: 0 0 auto; }
.fnum.ok2 { background: #3fa877; padding: 8px; }
.searchbox { display: flex; align-items: center; gap: 12px; padding: 10px 18px; border-radius: 999px; background: #fff; box-shadow: inset 0 0 0 2px #dadce0, 0 4px 10px rgba(0, 0, 0, .06); font-size: 26px; font-weight: 600; color: #2c2a3d; }
.searchbox svg { width: 28px; height: 28px; }
.appbtn { display: flex; align-items: center; gap: 12px; align-self: flex-start; position: relative; padding: 12px 26px 12px 18px; border-radius: 999px; background: #e9eef6; font-size: 30px; font-weight: 800; color: #2c2a3d; }
.appbtn svg { width: 30px; height: 30px; }
.appbtn svg:last-child { position: absolute; right: -26px; bottom: -18px; width: 40px; height: 40px; }
.noteline { display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 650; line-height: 1.35; color: var(--ink-soft); }
.noteline b { color: var(--ink); font-weight: 900; }
.noteline svg { width: 34px; height: 34px; flex: 0 0 auto; }
.noteline.warn { padding: 10px 12px; border-radius: 14px; background: #fde8ec; color: #8a3550; }
.noteline.warn b { color: #8a3550; }
.tipb { padding: 4px 10px; border-radius: 8px; background: #a8720f; color: #fff; font-size: 18px; font-weight: 900; letter-spacing: .06em; }
.bubble { position: relative; padding: 14px 18px; border-radius: 18px 18px 18px 4px; background: #ebe6ff; font-size: 25px; font-weight: 850; line-height: 1.35; color: #3c3270; }
.keyrow { display: flex; align-items: center; gap: 12px; font-size: 23px; font-weight: 650; }
.keyrow b { font-weight: 900; }
.kbd { display: inline-block; padding: 5px 12px; border-radius: 10px; background: #fff; box-shadow: inset 0 0 0 2px #c9c3dc, 0 5px 0 #c9c3dc; font-family: Consolas, "Courier New", monospace; font-size: 22px; font-weight: 800; color: #2c2a3d; white-space: nowrap; }

.rstep.big { width: 400px; padding: 40px 24px; gap: 22px; font-size: 40px; font-weight: 650; text-align: center; line-height: 1.3; }
.rstep.big b { font-weight: 900; }
.rstep.hot { box-shadow: 0 0 0 10px rgba(239, 138, 111, .35), 0 30px 70px rgba(239, 138, 111, .25); }
.rstep.hot b { font-size: 54px; color: #d2603f; }
.tip.short { height: 380px; }

.sumrow { position: absolute; left: 0; right: 0; top: 400px; display: flex; justify-content: center; align-items: center; gap: 26px; }
.sumc { position: relative; display: flex; align-items: center; gap: 20px; padding: 26px 90px 26px 26px; border-radius: 34px; }
.sumc b { font-size: 48px; font-weight: 900; }
.plus { font-size: 54px; font-weight: 900; color: #b4a9d3; }

.stairs { position: absolute; inset: 0; }
.stair { position: absolute; bottom: 220px; width: 380px; border-radius: 28px 28px 0 0; transform-origin: 50% 100%; display: flex; justify-content: center; padding-top: 28px;
  box-shadow: 0 20px 40px rgba(80, 60, 70, .16); }
.stair span { font-size: 40px; font-weight: 900; color: #fff; letter-spacing: -.02em; text-shadow: 0 2px 6px rgba(0, 0, 0, .15); }
.stairph { position: absolute; left: 1260px; top: 190px; width: 200px; height: auto; filter: drop-shadow(0 16px 20px rgba(80, 60, 90, .25)); }

/* ---- ai-research-lab 추가 ---- */
.rstep .rt { font-size: 32px; font-weight: 650; text-align: center; line-height: 1.3; }
.rstep .rt b { font-weight: 900; }
.dlstep { gap: 12px; }
.os2 { display: inline-block; padding: 6px 18px; border-radius: 12px; background: #e9e4f7; color: #5a4aa8; font-size: 28px; font-weight: 850; }
.os2.win { background: #dceaff; color: #2f5fa8; }
.verb .vb { font-weight: 600; }
.verb .vb b { font-weight: 900; }

.fdlabel { position: absolute; left: 230px; top: 240px; display: flex; align-items: center; gap: 12px; font-size: 32px; font-weight: 800; color: #8a6414; }
.fdlabel svg { width: 48px; height: 48px; }
.paper { position: absolute; display: flex; align-items: center; gap: 12px; padding: 18px 26px 18px 18px; border-radius: 20px; background: #fff; box-shadow: 0 14px 30px rgba(80, 60, 70, .16); font-size: 30px; font-weight: 800; }
.paper svg { width: 46px; height: 46px; }
#ah-ar { position: absolute; left: 870px; top: 520px; }
.hubbox { left: 1080px; top: 320px; width: 560px; height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;
  box-shadow: 0 0 0 10px rgba(255, 228, 160, .55), 0 30px 70px rgba(231, 169, 44, .22); }
.hubbox > b { font-size: 50px; font-weight: 900; letter-spacing: -.03em; }
.hubai { display: flex; align-items: center; gap: 12px; padding: 12px 24px; border-radius: 999px; background: #f1eefc; font-size: 30px; font-weight: 800; color: #4b3f8a; }
.hubai svg { width: 38px; height: 38px; }

.cmptable { left: 310px; top: 270px; width: 1300px; padding: 30px 36px; border-radius: 36px; display: flex; flex-direction: column; gap: 14px; }
.crow { display: grid; grid-template-columns: 200px repeat(5, 1fr); gap: 14px; align-items: center; }
.crow > span { font-size: 30px; font-weight: 850; color: var(--ink-soft); }
.crow.head b { padding: 12px 0; border-radius: 16px; background: #ebe6ff; text-align: center; font-size: 28px; font-weight: 900; color: #4b3f8a; }
.crow i { display: block; height: 70px; border-radius: 14px; background: linear-gradient(180deg, #f6f3fd 0 30%, #e6e0f6 30% 42%, #f6f3fd 42% 58%, #e6e0f6 58% 70%, #f6f3fd 70%); box-shadow: inset 0 0 0 2px #ece8f3; transform-origin: 0 50%; }

.dcard.glow2 { box-shadow: 0 0 0 10px rgba(140, 222, 190, .55), 0 30px 70px rgba(63, 168, 119, .22); }
.dcard.dim { opacity: .92; filter: grayscale(.4); }
.tagb { display: inline-block; vertical-align: middle; margin-left: 8px; padding: 4px 14px; border-radius: 10px; background: #3fa877; color: #fff; font-size: 26px; font-weight: 900; }
.tagb.gray { background: #8a85a0; }
.orb { width: 110px; height: 110px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; color: var(--ink-soft); box-shadow: 0 12px 26px rgba(80, 60, 70, .14); }

.menugrid { position: absolute; left: 260px; top: 300px; width: 1400px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 26px; }
.mitem { position: relative; display: flex; align-items: center; gap: 18px; padding: 22px 24px; border-radius: 30px; }
.mitem b { font-size: 34px; font-weight: 900; letter-spacing: -.03em; }

.chartc { left: 460px; top: 260px; width: 1000px; height: 460px; padding: 40px 50px; border-radius: 40px; }
.chsvg { display: block; width: 900px; height: 380px; }
.chsvg path[pathLength] { stroke-dasharray: 1; stroke-dashoffset: 1; }
.chl { position: absolute; font-size: 34px; font-weight: 900; }

/* 실습 안내 배너 (한 줄) */
.ovc.banner { flex-direction: row; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 22px; white-space: nowrap; }
.ovc.banner.top { right: 20px; top: 14px; }
.ovc.banner.topc { right: 440px; top: 14px; }
.ovc.banner.br { right: 20px; bottom: 175px; }
.bdg { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 12px; background: #d2603f; color: #fff; font-size: 22px; font-weight: 900; letter-spacing: .02em; }
.bdg .bi { width: 26px; height: 26px; }
.btitle { font-size: 32px; font-weight: 900; letter-spacing: -.03em; margin-right: 4px; }
.bchip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 14px; background: #f6f3fd; box-shadow: inset 0 0 0 2px #e6e0f6; font-size: 25px; font-weight: 650; color: var(--ink); }
.bchip b { font-weight: 900; }
.bchip small { font-size: 20px; color: var(--ink-soft); font-weight: 700; }
.bchip.ok { background: #e3f6ec; box-shadow: inset 0 0 0 2px #9fdcbd; color: #24533f; }
.bchip.note { background: #fff1cc; box-shadow: inset 0 0 0 2px #f1d58a; color: #6b4e10; }
.bi { display: inline-block; width: 30px; height: 30px; flex: 0 0 auto; }
.bi svg { display: block; width: 100%; height: 100%; }
.bsep { font-size: 30px; font-weight: 900; color: #7d6fae; }
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
  const typeIn = (sel, t, d) => tl.fromTo(sel, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'none' }, t);
  const confetti = (pre, t) => {
    const host = (document.getElementById(pre + '-c') || document.getElementById(pre)); const cols = ['#ef8a6f', '#e7a92c', '#4fb489', '#9a8be6', '#e8708f', '#6aa3e6'];
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
