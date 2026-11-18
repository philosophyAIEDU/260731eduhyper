import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 왕초보 바이브코딩 (구글 AI 스튜디오로 나만의 앱 만들기) — generator for index.html.
//
// Picture + sound: assets/media/src.mp4 (원본 녹화, 자막이 이미 박혀 있음)
//   ① 덮개(모션그래픽 전용): 0~7.43 인트로 · 63.13~77.21 요약+로드맵 · 181.0~끝 아웃트로(원본 끝 오로라 포함)
//   ② 실습 화면 그대로 + 빈 영역에 작은 카드 / 짧은 임팩트 팝
// 자막: 원본에 박힌 자막이 ② 구간에서 그대로 보이므로, ① 구간에만 같은 SRT 문구를 같은 모양으로 다시 올린다.
// 모든 시각은 assets/source.srt 큐 시작에 맞춤.
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 219.15;

// ---------- SRT --------------------------------------------------------------
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const CUES = [];
fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .forEach((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); CUES.push({ s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }); });
const T = (n) => CUES[n - 1].s; // 큐 시작 (SRT 번호)

const COVER = [
  { id: 'cov1', s: 0, e: T(5), fin: 0, fout: 0.45 },
  { id: 'cov2', s: T(36), e: T(44), fin: 0.45, fout: 0.45 },
  { id: 'cov3', s: T(107), e: DUR, fin: 0.45, fout: 0 },
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
// { id, s, e, html, anim, layer } — 'full' = 덮개 장면, 'ov' = 실습 화면 위 작은 카드, 'pop' = 실습 중 짧은 임팩트
const G = [];
const add = (g) => G.push({ layer: 'ov', ...g });

// ============ ① 인트로 (0 ~ T5) =====================================================
add({ id: 'i-title', layer: 'full', s: 0, e: T(5), html: `
  <div id="it-ph" class="phwrap"><img id="it-img" class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="it-c" class="card titlecard">
    ${pill('it-k', '필로소피 AI 교육 · 왕초보 바이브 코딩', C.coral, 'pill-soft')}
    <h1 id="it-h" class="h1 center">왕초보를 위한<br>${hl('나만의 앱 만들기', 'var(--hl-y)')}</h1>
    <div id="it-s" class="subrow">
      <span id="it-s0" class="mini">${ICON.chat(C.lav)}말로 설명하면</span>
      ${arrowR('it-a0', 'arrow-sm')}
      <span id="it-s1" class="mini">${ICON.robot(C.mint)}AI가 만들어요</span>
    </div>
    <div id="it-go" class="gochip">${ICON.play('#ffffff')}<span>결과물부터 먼저 볼게요</span></div>
  </div>`, anim: `
  tl.fromTo('#it-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, .1);
  rise('#it-c', .25); up('#it-k', .45, 16); up('#it-h', ${f(T(2))}, 34); sweep('#it-h .hl', ${f(T(2) + .7)});
  pop('#it-s0', ${f(T(3))}); draw('#it-a0 path', ${f(T(3) + .4)}, .3); pop('#it-s1', ${f(T(3) + .7)});
  pop('#it-go', ${f(T(4) + .3)});` });

// ============ ② 결과물 보기 ==========================================================
add({ id: 'p-made', s: T(5) + 0.1, e: T(13) - 0.1, html: `
  <div id="pmd-c" class="ovc side">
    ${pill('pmd-k', '결과물 먼저 보기', C.coral, 'pill-soft pill-sm')}
    <div id="pmd-t" class="timerrow">${ico('pmd-ti', 'timer', '#ffffff', C.coral, 'xs')}<div><small>구글 AI 스튜디오로</small><b>7분 57초</b><small>만에 만든 앱</small></div></div>
    <div id="pmd-p" class="promptbox"><small>${ICON.chat('#7d62c0')}입력한 프롬프트는 이것뿐!</small>
      <p id="pmd-pt">“하루 일과를 기록하고 분석하고<br>조언을 해주는 앱을 만들어주세요”</p></div>
  </div>`, anim: `rise('#pmd-c', ${f(T(5) + .2)}); up('#pmd-k', ${f(T(5) + .4)}, 12);
  up('#pmd-t', ${f(T(5) + .9)}, 14); pop('#pmd-ti', ${f(T(6))});
  tl.fromTo('#pmd-ti', {rotation:0}, {rotation:14, duration:.14, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(6) + .6)});
  up('#pmd-p', ${f(T(7))}, 14); typeIn('#pmd-pt', ${f(T(9))}, 2.0);` });

const FEAT = [['총 기록 시간', 13, C.sky], ['집중 업무', 14, C.lav], ['평균 에너지', 15, C.yellow], ['휴식·건강', 16, C.mint], ['시간대별 하루 흐름', 17, C.coral]];
add({ id: 'p-site', s: T(13), e: T(20) - 1.2, html: `
  <div id="pst-c" class="ovc side">
    ${pill('pst-k', '이런 앱이 생겼어요', C.mint, 'pill-soft pill-sm')}
    <div class="featgrid">${FEAT.map(([t, , c], i) => `<div id="pst-${i}" class="fchip2${i === 4 ? ' wide' : ''}"><span class="fdot" style="background:${c}"></span>${t}</div>`).join('')}</div>
    ${ok('pst-ok', '이 정도로 디테일하게!', 'ok-xs')}
  </div>`, anim: `rise('#pst-c', ${f(T(13) + .1)}); up('#pst-k', ${f(T(13) + .3)}, 12);
  ${FEAT.map(([, n], i) => `pop('#pst-${i}', ${f(T(n) + (i === 0 ? .5 : .1))});`).join(' ')} pop('#pst-ok', ${f(T(18) + .3)});` });

add({ id: 'p-ideas', s: T(28), e: T(32) - 0.2, html: `
  <div id="pid-c" class="ovc side">
    ${pill('pid-k', '나에게 필요한 앱을 만들어요', C.lav, 'pill-soft pill-sm')}
    <div id="pid-0" class="flow"><span class="fnum ok2">${ICON.check('#ffffff')}</span><span><b>하루 일과</b> 기록 앱</span></div>
    <div id="pid-1" class="flow"><span class="fnum">${ICON.brief('#7d62c0')}</span><span><b>업무</b>에 필요한 앱</span></div>
    <div id="pid-2" class="flow"><span class="fnum">${ICON.book('#7d62c0')}</span><span><b>학습</b>에 필요한 앱</span></div>
  </div>`, anim: `rise('#pid-c', ${f(T(28) + .1)}); up('#pid-k', ${f(T(28) + .3)}, 12);
  slide('#pid-0', ${f(T(28) + .5)}, 30); slide('#pid-1', ${f(T(30))}, 30); slide('#pid-2', ${f(T(31))}, 30);` });

add({ id: 'p-ai', s: T(33), e: T(36) - 0.15, html: `
  <div id="pai-c" class="ovc side">
    <div class="ovhead">${ico('pai-i', 'sparkle', '#ffffff', C.lav, 'xxs')}<span class="stept">AI 맞춤 조언</span></div>
    <div id="pai-0" class="flow"><span class="fnum">1</span><span>내 <b>일과 기록</b></span></div>
    <div id="pai-1" class="flow"><span class="fnum">2</span><span>AI가 <b>분석</b></span></div>
    <div id="pai-2" class="flow"><span class="fnum">3</span><span><b>조언</b>까지 척척</span></div>
  </div>`, anim: `rise('#pai-c', ${f(T(33) + .1)}); pop('#pai-i', ${f(T(33) + .4)});
  slide('#pai-0', ${f(T(33) + .8)}, 30); slide('#pai-1', ${f(T(34) + .2)}, 30); slide('#pai-2', ${f(T(35) + .2)}, 30);` });

// ============ ① 요약 + 로드맵 (T36 ~ T44) ===========================================
add({ id: 'c-recap', layer: 'full', s: T(36), e: T(38), html: `
  <div class="center-col" style="top:140px">
    <h2 id="cr-h" class="h2">아주 짧은 시간 안에</h2>
  </div>
  <div class="route" style="top:360px">
    <div id="cr-0" class="card rstep big">${ico('cr-i0', 'chat', C.lav, BG.lav, 'sm')}<span>프롬프트 <b>한 줄</b></span></div>
    ${arrowR('cr-a1', 'arrow-lg')}
    <div id="cr-1" class="card rstep big hot">${ico('cr-i1', 'timer', '#ffffff', C.coral, 'sm')}<span><b>7분 57초</b></span></div>
    ${arrowR('cr-a2', 'arrow-lg')}
    <div id="cr-2" class="card rstep big">${ico('cr-i2', 'phone', C.mint, BG.mint, 'sm')}<span>나만의 <b>앱 완성</b></span></div>
  </div>`, anim: `
  up('#cr-h', ${f(T(36) + .3)}, 28);
  rise('#cr-0', ${f(T(36) + .6)}); draw('#cr-a1 path', ${f(T(36) + 1.4)}, .35); rise('#cr-1', ${f(T(37))}); pop('#cr-i1', ${f(T(37) + .3)});
  draw('#cr-a2 path', ${f(T(37) + 1.0)}, .35); rise('#cr-2', ${f(T(37) + 1.3)}); confetti('cr-2', ${f(T(37) + 1.7)});` });

add({ id: 'c-what', layer: 'full', s: T(38), e: T(41), html: `
  <div class="center-col" style="top:110px">
    ${pill('cw-k', '그걸 어떻게 하는지 알려드릴게요', C.coral, 'pill-soft')}
    <h2 id="cw-h" class="h2">${hl('바이브 코딩', 'var(--hl-y)')}이란?</h2>
  </div>
  <div class="route" style="top:420px">
    <div id="cw-0" class="card rstep big">${ico('cw-i0', 'chat', '#ffffff', C.lav, 'sm')}<span>만들고 싶은 걸<br><b>말로 설명</b></span></div>
    ${arrowR('cw-a1', 'arrow-lg')}
    <div id="cw-1" class="card rstep big">${ico('cw-i1', 'code', '#ffffff', C.sky, 'sm')}<span>코드는<br><b>AI가 작성</b></span></div>
    ${arrowR('cw-a2', 'arrow-lg')}
    <div id="cw-2" class="card rstep big">${ico('cw-i2', 'phone', '#ffffff', C.mint, 'sm')}<span>나는<br><b>앱을 받기만</b></span></div>
  </div>`, anim: `
  up('#cw-k', ${f(T(38) + .2)}, 14); up('#cw-h', ${f(T(38) + .6)}, 30); sweep('#cw-h .hl', ${f(T(39))});
  rise('#cw-0', ${f(T(39) + .4)}); draw('#cw-a1 path', ${f(T(39) + 1.0)}, .3); rise('#cw-1', ${f(T(39) + 1.3)});
  draw('#cw-a2 path', ${f(T(40))}, .3); rise('#cw-2', ${f(T(40) + .3)});` });

const ROAD = [['globe', '구글 AI 스튜디오<br><b>접속하기</b>', C.sky, BG.sky], ['chat', '만들고 싶은 앱<br><b>설명하기</b>', C.lav, BG.lav], ['rocket', '공유 · 배포<br><b>하기</b>', C.mint, BG.mint]];
add({ id: 'c-road', layer: 'full', s: T(41), e: T(44), html: `
  <div class="center-col" style="top:90px">
    <h2 id="cd-h" class="h2">왕초보를 위한 ${hl('가장 쉬운 방법', 'var(--hl-m)')}</h2>
  </div>
  <div class="tips" style="top:270px">${ROAD.map(([ic, t, c, b], i) => `<div id="cd-${i}" class="card tip short"><span class="tnum">${i + 1}</span>${ico(`cd-i${i}`, ic, c, b)}<div class="tt">${t}</div></div>`).join('')}</div>
  <div id="cd-end" class="endrib" style="top:690px">${ICON.heart('#ffffff')}<span>부담 없이, 이대로만 해 보세요</span></div>`, anim: `
  up('#cd-h', ${f(T(41) + .2)}, 28); sweep('#cd-h .hl', ${f(T(41) + .9)});
  ${ROAD.map((_, i) => `rise('#cd-${i}', ${f(T(42) - .6 + i * .45)}); pop('#cd-i${i}', ${f(T(42) - .4 + i * .45)});`).join(' ')}
  pop('#cd-end', ${f(T(43) + .3)});` });

// ============ ② STEP 1 — 접속 =======================================================
add({ id: 'p-s1', s: T(44) + 0.15, e: T(50) - 0.3, html: `
  <div id="ps1-c" class="ovc side" style="top:175px">
    <div class="stephead"><span class="stepn">STEP 1</span><span class="stept">AI 스튜디오 접속</span></div>
    <div id="ps1-0" class="flow"><span class="fnum">1</span><span>구글에서 검색</span></div>
    <div id="ps1-q" class="searchbox">${ICON.search('#6b6880')}<span>google ai studio</span></div>
    <div id="ps1-1" class="flow"><span class="fnum">2</span><span>이 사이트를 클릭</span></div>
    <div id="ps1-u" class="urlbox" style="font-size:25px">aistudio.google.com</div>
  </div>`, anim: `rise('#ps1-c', ${f(T(44) + .25)});
  slide('#ps1-0', ${f(T(44) + .6)}, 30); pop('#ps1-q', ${f(T(44) + 1.0)});
  slide('#ps1-1', ${f(T(45))}, 30); pop('#ps1-u', ${f(T(45) + .3)});
  tl.to('#ps1-u', {scale:1.06, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(46) + .2)});` });

add({ id: 'p-new', s: T(50), e: T(56) + 1.2, html: `
  <div id="pnw-c" class="ovc side narrow">
    <div class="stephead"><span class="stepn">STEP 1</span><span class="stept sm">New app 누르기</span></div>
    <div id="pnw-b" class="appbtn">${ICON.plus('#2c2a3d')}<span>New app</span>${ICON.cursor('#e0607f')}</div>
    <div id="pnw-l" class="noteline">${ICON.key('#b8923a')}<span><b>구글 아이디</b>로 로그인 먼저!</span></div>
  </div>`, anim: `rise('#pnw-c', ${f(T(50) + .1)}); pop('#pnw-b', ${f(T(52) + .1)});
  tl.to('#pnw-b', {scale:1.08, duration:.2, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(53) + .2)});
  up('#pnw-l', ${f(T(54) + .2)}, 10);` });

const GAL = [['앱 갤러리 열기', 59], ['마음에 드는 앱 고르기', 63], ['Remix → Apply', 64], ['원하는 기능 추가', 72]];
add({ id: 'p-gal', s: T(59), e: T(74) - 0.3, html: `
  <div id="pgl-c" class="ovc side">
    <div class="ovhead">${ico('pgl-i', 'game', '#ffffff', C.yellow, 'xxs')}<span class="tipb">TIP</span><span class="stept sm">남이 만든 앱 리믹스</span></div>
    ${GAL.map(([t], i) => `<div id="pgl-${i}" class="flow"><span class="fnum">${i + 1}</span><span>${i === 2 ? `${kbd('Remix')} → ${kbd('Apply')}` : t}</span></div>`).join('')}
  </div>`, anim: `rise('#pgl-c', ${f(T(59) + .1)}); pop('#pgl-i', ${f(T(59) + .4)});
  ${GAL.map(([, n], i) => `slide('#pgl-${i}', ${f(T(n) + .1)}, 30);`).join(' ')}` });

// ============ ② STEP 2 — 설명하기 (홈 화면: 오른쪽 위 x≥1540, y≤410 만 비어 있음) =============
add({ id: 'p-s2a', s: T(75) + 0.2, e: T(83) - 0.2, html: `
  <div id="ps2-c" class="ovc side narrow">
    <div class="stephead"><span class="stepn">STEP 2</span><span class="stept sm">앱 설명하기</span></div>
    <div id="ps2-t" class="noteline">${ICON.bulb('#b8923a')}<span>처음엔 <b>아주 간단하게</b></span></div>
    <div id="ps2-p" class="bubble">“영어 단어 학습 앱을<br>만들어 주세요”</div>
  </div>`, anim: `rise('#ps2-c', ${f(T(75) + .3)}); up('#ps2-t', ${f(T(76) + .3)}, 10); pop('#ps2-p', ${f(T(78) + .2)});` });

add({ id: 'p-s2b', s: T(83), e: T(89) - 0.2, html: `
  <div id="ps2b-c" class="ovc side narrow">
    <div class="stephead"><span class="stepn">STEP 2</span><span class="stept sm">이렇게 보내요</span></div>
    <div id="ps2b-0" class="keyrow">${kbd('Tab ↹')}<span>AI <b>추천 프롬프트</b> 받기</span></div>
    <div id="ps2b-1" class="keyrow">${kbd('Enter ⏎')}<span><b>Send Prompt</b></span></div>
  </div>`, anim: `rise('#ps2b-c', ${f(T(83) + .1)}); slide('#ps2b-0', ${f(T(83) + .4)}, 30); slide('#ps2b-1', ${f(T(85) + .1)}, 30);
  tl.to('#ps2b-1 .kbd', {y:4, boxShadow:'0 1px 0 #c9c3dc', duration:.12, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(86) + .6)});` });

add({ id: 'p-wait', s: T(89), e: T(92) - 0.1, html: `
  <div id="pwt-c" class="ovc side narrow">
    <div class="ovhead">${ico('pwt-i', 'hourglass', '#ffffff', C.sky, 'xxs')}<span class="stept sm">앱 만드는 중…</span></div>
    <div id="pwt-s" class="ovs2"><b>몇 분</b>만 기다리면<br>앱이 생겨요</div>
  </div>`, anim: `rise('#pwt-c', ${f(T(89) + .1)}); up('#pwt-s', ${f(T(90) + .3)}, 10);
  tl.fromTo('#pwt-i svg', {rotation:0}, {rotation:180, duration:.6, ease:'power2.inOut', immediateRender:false}, ${f(T(90) + 1.0)});` });

add({ id: 'p-wow', layer: 'pop', s: T(92), e: T(94) - 0.1, html: `
  <div id="pww-c" class="card impact">
    <div id="pww-i" class="imico" style="background:#6aa3e6">${ICON.code('#ffffff')}</div>
    <div class="imtx"><small>와..! 이 많은 코드를</small><b><span class="grn">AI가</span> 순식간에</b></div>
  </div>`, anim: `tl.fromTo('#pww-c', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.8)'}, ${f(T(92) + .05)}); confetti('pww', ${f(T(93) + .2)});` });

// ============ ② STEP 3 — 공유·배포 (오른쪽 절반은 공유 패널 → 카드는 왼쪽) ==================
add({ id: 'p-s3', s: T(95), e: T(103) - 0.1, html: `
  <div id="ps3-c" class="ovc lside">
    <div class="stephead"><span class="stepn">STEP 3</span><span class="stept">공유 · 배포</span></div>
    <div id="ps3-0" class="keyrow">${kbd('Share')}<span>링크로 <b>공유</b></span></div>
    <div id="ps3-1" class="keyrow">${kbd('Publish')}<span>인터넷에 <b>배포</b></span></div>
    <div id="ps3-w" class="noteline warn">${ICON.card('#c4486c')}<span>배포하려면 <b>결제 카드가 연결된<br>프로젝트</b>가 필요해요</span></div>
    ${ok('ps3-ok', '배포 완료 → 내 사이트 주소!', 'ok-xs')}
  </div>`, anim: `rise('#ps3-c', ${f(T(95) + .1)}); slide('#ps3-0', ${f(T(95) + .5)}, -30); slide('#ps3-1', ${f(T(97) + .1)}, -30);
  up('#ps3-w', ${f(T(99) + .2)}, 10); pop('#ps3-ok', ${f(T(101) + .2)});` });

add({ id: 'p-done', layer: 'pop', s: T(105), e: T(107) - 0.1, html: `
  <div id="pdn-c" class="card impact">
    <div id="pdn-i" class="imico" style="background:#3fa877">${ICON.rocket('#ffffff')}</div>
    <div class="imtx"><small>아주 간단하게</small><b>배포까지 <span class="grn">끝!</span></b></div>
  </div>`, anim: `tl.fromTo('#pdn-c', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.55, ease:'back.out(1.8)'}, ${f(T(105) + .05)}); confetti('pdn', ${f(T(105) + .5)});
  tl.fromTo('#pdn-i svg', {y:0}, {y:-10, duration:.2, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(T(106))});` });

// ============ ① 아웃트로 (T107 ~ 끝) ================================================
const SUM = [['globe', '접속'], ['chat', '설명'], ['rocket', '배포']];
add({ id: 'o-sum', layer: 'full', s: T(107), e: T(112), html: `
  <div class="center-col" style="top:110px">
    ${pill('os-k', '구글 AI 스튜디오 · Gemini', C.sky, 'pill-soft')}
    <h1 id="os-h" class="h1 center">가장 ${hl('간단한', 'var(--hl-y)')} 바이브 코딩</h1>
  </div>
  <div class="sumrow">${SUM.map(([ic, t], i) => `${i ? `<span id="os-p${i}" class="plus">→</span>` : ''}<div id="os-${i}" class="card sumc">${ico(`os-i${i}`, ic, '#ffffff', [C.sky, C.lav, C.mint][i], 'xs')}<b>${t}</b><span id="os-t${i}" class="tick">${ICON.check('#ffffff')}</span></div>`).join('')}</div>
  <div id="os-go" class="endrib" style="top:720px;left:610px;width:700px">${ICON.sparkle('#ffffff')}<span>꼭 한번 시도해 보세요!</span></div>`, anim: `
  up('#os-k', ${f(T(107) + .2)}, 14); up('#os-h', ${f(T(108))}, 30); sweep('#os-h .hl', ${f(T(110))});
  ${SUM.map((_, i) => `${i ? `pop('#os-p${i}', ${f(T(108) + .3 + i * .5)});` : ''} rise('#os-${i}', ${f(T(108) + .5 + i * .5)}); pop('#os-t${i}', ${f(T(110) + .2 + i * .25)});`).join(' ')}
  pop('#os-go', ${f(T(111) + .2)});` });

const STAIR = [['직면하기', 115, C.lav], ['계속 공부하기', 116, C.sky], ['한 걸음씩 나아가기', 118, C.mint]];
add({ id: 'o-grow', layer: 'full', s: T(112), e: T(119), html: `
  <div class="center-col" style="top:100px">
    <h2 id="og-h" class="h2">AI로 인해 ${hl('많은 것들이 바뀌고', 'var(--hl-p)')} 있어요</h2>
  </div>
  <div class="stairs">${STAIR.map(([t, , c], i) => `<div id="og-${i}" class="stair" style="left:${330 + i * 420}px;height:${170 + i * 120}px;background:${c}"><span>${t}</span></div>`).join('')}
    <img id="og-ph" class="stairph" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
  </div>`, anim: `
  up('#og-h', ${f(T(112) + .2)}, 28); sweep('#og-h .hl', ${f(T(113) + .3)});
  ${STAIR.map(([, n], i) => `tl.fromTo('#og-${i}', {opacity:0, scaleY:0}, {opacity:1, scaleY:1, duration:.6, ease:'back.out(1.4)'}, ${f(T(n) + .1)});`).join(' ')}
  tl.fromTo('#og-ph', {opacity:0, x:-840, y:240}, {opacity:1, x:-840, y:240, duration:.4}, ${f(T(115) + .4)});
  tl.to('#og-ph', {x:-420, y:120, duration:.6, ease:'power2.out'}, ${f(T(116) + .5)});
  tl.to('#og-ph', {x:0, y:0, duration:.6, ease:'power2.out'}, ${f(T(118) + .4)});` });

add({ id: 'o-end', layer: 'full', s: T(119), e: DUR, html: `
  <div id="oe-ph" class="phwrap" style="top:190px"><img class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="oe-c" class="card titlecard" style="top:170px">
    ${pill('oe-k', '필로소피 AI 교육 · 왕초보 바이브 코딩', C.lav, 'pill-soft')}
    <div id="oe-h" class="h1 center" style="font-size:96px">${hl('함께', 'var(--hl-y)')} 공부해요</div>
    <div class="endbtns">
      <div id="oe-l" class="ebtn like">${ICON.thumb('#ffffff')}<span>좋아요</span></div>
      <div id="oe-s" class="ebtn sub">${ICON.bell('#ffffff')}<span>구독</span></div>
    </div>
    <div id="oe-t" class="thanks">감사합니다 ${ICON.heart('#e8708f')}</div>
  </div>`, anim: `
  tl.fromTo('#oe-ph', {opacity:0, y:200}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, ${f(T(119) + .1)});
  rise('#oe-c', ${f(T(119) + .2)}); up('#oe-k', ${f(T(119) + .4)}, 14); up('#oe-h', ${f(T(119) + .6)}, 28); sweep('#oe-h .hl', ${f(T(119) + 1.3)});
  pop('#oe-t', ${f(T(120))}); pop('#oe-l', ${f(T(120) + 1.2)}); pop('#oe-s', ${f(T(120) + 1.8)});
  tl.to('#oe-l', {scale:1.12, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(120) + 3.0)});
  tl.to('#oe-s', {scale:1.12, duration:.25, ease:'power2.out', yoyo:true, repeat:1}, ${f(T(120) + 3.6)});` });

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
<title>왕초보 바이브코딩 — 나만의 앱 만들기</title>
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
.cap span { display: block; max-width: 1820px; padding: 10px 26px 14px; background: #000; color: #fff;
  font-size: 86px; font-weight: 800; line-height: 1.2; text-align: center; word-break: keep-all; letter-spacing: -.01em; }

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
