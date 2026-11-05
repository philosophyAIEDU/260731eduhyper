import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 교수님들을 위한 Claude Code CLI 4편 (중급 실습 · 반복 업무 자동화) — generator for index.html.
//
// Picture + sound: assets/media/src.mp4 (원본 녹화, 하단에 검정 박스 자막이 이미 박혀 있음)
// 구간 (사용자 요청):
//   0:00 ~ 1:33   모션그래픽만     — 원본 화면을 덮음 (큐 1–43, 큐 44 시작에 스냅)
//   1:34 ~ 8:50   실습 화면 위주   — 원본 그대로 + 핵심에만 작은 카드 (큐 44–279)
//   8:51 ~ 끝     모션그래픽만     — 원본 화면을 덮음 (큐 280– + 아웃트로)
// 덮는 구간은 원본에 박힌 자막도 가려지므로, 같은 모양(검정 박스 흰 글씨)의 자막을 다시 올린다.
// 모든 시각은 원본 SRT 큐 번호에 고정: T(cue) = 큐 시작초, TE(cue) = 큐 끝초.
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 602.2;

// ---------- SRT --------------------------------------------------------------
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const CUES = {};
fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .forEach((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); CUES[+l[0]] = { s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }; });
const LAST = Math.max(...Object.keys(CUES).map(Number));
const T = (n, off = 0) => +(CUES[n].s + off).toFixed(3);
const TE = (n, off = 0) => +(CUES[n].e + off).toFixed(3);

// covered spans (motion graphics only)
const COVER = [
  { id: 'cov1', s: 0, e: T(44, 0.2), fin: 0, fout: 0.45, cues: [1, 43] },
  { id: 'cov2', s: T(280, -0.35), e: DUR, fin: 0.4, fout: 0, cues: [280, LAST] },
];
const CAPFIX = {};

// ---------- icons ----------------------------------------------------------
const S = (c, body, w = 4) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  terminal: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="6"/><path d="M18 26l8 6-8 6M30 40h14"/>`),
  folder: (c) => S(c, `<path d="M8 18a4 4 0 0 1 4-4h12l6 6h22a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"/>`),
  files: (c) => S(c, `<path d="M20 8h18l10 10v30H20z"/><path d="M38 8v10h10"/><path d="M14 16v40h28"/>`),
  doc: (c) => S(c, `<path d="M16 8h22l12 12v36H16z"/><path d="M38 8v12h12"/><path d="M23 32h18M23 40h18M23 48h11"/>`),
  check: (c) => S(c, `<path d="M18 33l9 9 19-20"/>`, 7),
  x: (c) => S(c, `<path d="M20 20l24 24M44 20L20 44"/>`, 7),
  chat: (c) => S(c, `<path d="M10 14h44v28H30l-12 10V42h-8z"/><path d="M20 26h24M20 33h14"/>`),
  repeat: (c) => S(c, `<path d="M14 30a18 18 0 0 1 32-11l4 4"/><path d="M50 13v10H40"/><path d="M50 34a18 18 0 0 1-32 11l-4-4"/><path d="M14 51V41h10"/>`),
  sparkle: (c) => S(c, `<path d="M28 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${c}" stroke-width="2"/><path d="M50 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="${c}" stroke-width="1.5"/>`),
  warn: (c) => S(c, `<path d="M32 8l26 46H6z"/><path d="M32 26v12"/><circle cx="32" cy="45" r="1.5" fill="${c}"/>`),
  play: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M27 22l15 10-15 10z" fill="${c}"/>`),
  bolt: (c) => S(c, `<path d="M36 6L14 36h16l-4 22 22-30H32z" fill="${c}" stroke-width="2"/>`),
  pen: (c) => S(c, `<path d="M14 50l4-14 26-26 10 10-26 26z"/><path d="M38 16l10 10"/>`),
  heart: (c) => S(c, `<path d="M32 52C18 42 10 34 10 24c0-7 5-12 11-12 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 5 11 12 0 10-8 18-22 28z" fill="${c}"/>`, 2),
  bell: (c) => S(c, `<path d="M18 44V30a14 14 0 0 1 28 0v14l4 6H14z"/><path d="M27 54a5 5 0 0 0 10 0"/>`),
  user: (c) => S(c, `<circle cx="32" cy="22" r="10"/><path d="M12 54c2-11 10-17 20-17s18 6 20 17"/>`),
  eye: (c) => S(c, `<path d="M6 32s10-16 26-16 26 16 26 16-10 16-26 16S6 32 6 32z"/><circle cx="32" cy="32" r="7"/>`),
  clock: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M32 18v14l10 6"/>`),
  shield: (c) => S(c, `<path d="M32 6l22 8v16c0 14-9 24-22 28C19 54 10 44 10 30V14z"/><path d="M22 31l7 7 13-14"/>`),
  lock: (c) => S(c, `<rect x="12" y="28" width="40" height="28" rx="6"/><path d="M20 28v-8a12 12 0 0 1 24 0v8"/><circle cx="32" cy="42" r="3" fill="${c}"/>`),
  table: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="5"/><path d="M8 24h48M8 38h48M24 12v40M40 12v40"/>`),
  copies: (c) => S(c, `<rect x="22" y="8" width="30" height="38" rx="4"/><path d="M16 14v36a4 4 0 0 0 4 4h26"/><path d="M10 20v36"/><path d="M29 20h16M29 28h16M29 36h10"/>`),
  calendar: (c) => S(c, `<rect x="8" y="12" width="48" height="42" rx="6"/><path d="M8 24h48M20 6v12M44 6v12"/><path d="M18 34h6M30 34h6M42 34h6M18 44h6M30 44h6"/>`),
  wand: (c) => S(c, `<path d="M10 54L40 24"/><path d="M36 20l8 8"/><path d="M46 8v8M42 12h8M54 22v6M51 25h6M28 8v5M25.5 10.5h5"/>`),
  scale: (c) => S(c, `<path d="M32 8v46M18 54h28M12 16h40"/><path d="M12 16L4 34h16zM52 16l-8 18h16z"/>`),
  students: (c) => S(c, `<circle cx="22" cy="22" r="8"/><circle cx="44" cy="24" r="7"/><path d="M6 52c1-10 7-15 16-15s15 5 16 15M38 38c8 0 14 4 15 14"/>`),
  link: (c) => S(c, `<path d="M28 36a10 10 0 0 0 14 0l8-8a10 10 0 0 0-14-14l-3 3"/><path d="M36 28a10 10 0 0 0-14 0l-8 8a10 10 0 0 0 14 14l3-3"/>`),
  download: (c) => S(c, `<path d="M32 8v32M20 28l12 12 12-12"/><path d="M10 46v8h44v-8"/>`),
  plan: (c) => S(c, `<rect x="12" y="8" width="40" height="48" rx="5"/><path d="M22 6h20v8H22z"/><path d="M20 26l4 4 7-7M20 40l4 4 7-7M36 28h10M36 42h10"/>`),
};

const C = { coral: '#ef8a6f', mint: '#4fb489', lav: '#9a8be6', sky: '#6aa3e6', pink: '#e8708f', yellow: '#e7a92c', ink: '#34314a' };
const BG = { peach: '#ffe6dc', mint: '#dcf3e8', lav: '#ebe6ff', sky: '#e2eeff', pink: '#ffe3ea', yellow: '#fff1cc' };

const ico = (id, name, color, bg, cls = '') => `<div id="${id}" class="ico ${cls}" style="background:${bg}">${ICON[name](color)}</div>`;
const pill = (id, txt, dot = C.coral, cls = '') => `<div id="${id}" class="pill ${cls}"><span class="pdot" style="background:${dot}"></span><span>${txt}</span></div>`;
const ok = (id, txt, cls = '') => `<div id="${id}" class="okpill ${cls}"><span class="okc">${ICON.check('#ffffff')}</span><span>${txt}</span></div>`;
const no = (id, txt, cls = '') => `<div id="${id}" class="okpill nopill ${cls}"><span class="okc">${ICON.x('#ffffff')}</span><span>${txt}</span></div>`;
const hl = (txt, color = 'var(--hl-y)') => `<span class="hl" style="--hlc:${color}">${txt}</span>`;
const arrowR = (id, cls = '') => `<svg id="${id}" class="arrow ${cls}" viewBox="0 0 120 24" fill="none" stroke="#5b5873" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M4 12h108M98 2l14 10-14 10"/></svg>`;
const f = (t) => t.toFixed(2);

// ---------- graphics -------------------------------------------------------
// { id, s, e, html, anim, layer } — times are seconds in the source video.
// layer: 'full' = 덮는 구간의 장면, 'ov' = 실습 화면 위 작은 카드
const G = [];
const add = (g) => G.push({ layer: 'ov', ...g });

// ===== 1. 인트로 · 개념 (0:00 ~ 1:33) — 원본 화면을 덮는다 ===================
add({ id: 's-title', layer: 'full', s: 0, e: T(3), html: `
  <div id="st-ph" class="phwrap"><img id="st-img" class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="st-c" class="card titlecard">
    ${pill('st-k', '필로소피 AI 교육 · 교수님들을 위한', C.coral, 'pill-soft')}
    <h1 id="st-h" class="h1 center">${hl('Claude Code', 'var(--hl-p)')}<br>CLI 수업</h1>
    <div id="st-term" class="term"><span class="tprompt">&gt;</span><span id="st-tt">claude</span><span id="st-cur" class="tcur"></span></div>
  </div>`, anim: `
  tl.fromTo('#st-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, .15);
  rise('#st-c', .3); up('#st-k', .55, 16); up('#st-h', .7, 34); sweep('#st-h .hl', 1.3);
  up('#st-term', 1.4, 20); type('#st-tt', 'claude', 1.65, .6); blink('#st-cur', 1.4, ${f(T(3))});` });

const ROAD = [['1편', '설치', 'play', C.coral, BG.peach], ['2편', '기초', 'terminal', C.sky, BG.sky], ['3편', '폴더 정리', 'folder', C.mint, BG.mint], ['4편', '반복 업무 자동화', 'bolt', C.lav, BG.lav]];
add({ id: 's-road', layer: 'full', s: T(3), e: T(7), html: `
  <div class="center-col" style="top:120px">
    ${pill('sr-k', '교수님들을 위한 Claude Code CLI', C.lav, 'pill-soft')}
    <h2 id="sr-h" class="h2">${hl('네 번째 시간', 'var(--hl-y)')} · 중급 실습</h2>
  </div>
  <div class="road">
    ${ROAD.map(([n, t, ic, c, b], i) => `<div id="sr-${i}" class="rcard ${i === 3 ? 'first' : ''}">${ico(`sr-i${i}`, ic, c, b, 'sm')}<div class="rn" style="color:${c}">${n}</div><div class="rt">${t}</div>${i === 3 ? `<div id="sr-now" class="nowtag">오늘</div>` : ''}${i < 3 ? `<span id="sr-t${i}" class="rtick">${ICON.check('#ffffff')}</span>` : ''}</div>${i < 3 ? arrowR(`sr-a${i}`, 'rarrow') : ''}`).join('')}
  </div>
  <div class="center-col" style="top:790px"><div id="sr-sub" class="subline">오늘은 <b>반복 업무</b>를 해결해 가는 과정을 보여 드려요</div></div>`, anim: `
  up('#sr-k', ${f(T(3, 0.1))}, 16); up('#sr-h', ${f(T(4, 0))}, 30); sweep('#sr-h .hl', ${f(T(4, 0.5))});
  ${ROAD.map((_, i) => `rise('#sr-${i}', ${f(T(3, 0.35 + i * 0.22))}); ${i ? `draw('#sr-a${i - 1} path', ${f(T(3, 0.25 + i * 0.22))}, .3);` : ''} ${i < 3 ? `pop('#sr-t${i}', ${f(T(4, 0.3 + i * 0.15))});` : ''}`).join('\n  ')}
  tl.to(['#sr-0','#sr-1','#sr-2'], {opacity:.55, duration:.5, ease:'power2.out'}, ${f(T(5, 0.3))});
  tl.to('#sr-3', {scale:1.08, duration:.5, ease:'back.out(2)'}, ${f(T(5, 0.3))});
  pop('#sr-now', ${f(T(5, 0.6))});
  up('#sr-sub', ${f(T(6, 0.1))}, 20);` });

const GOOD = [['files', C.coral, BG.peach, '파일 이름 정리', 11], ['check', C.mint, BG.mint, '제출 여부 확인', 12], ['table', C.sky, BG.sky, '표 만들기', 13], ['copies', C.lav, BG.lav, '같은 형식 문서<br>여러 개 만들기', 14]];
add({ id: 's-good', layer: 'full', s: T(7), e: T(18), html: `
  <div class="center-col" style="top:100px">
    ${pill('sg-k', '자동화하기 좋은 일은 무엇일까요?', C.mint, 'pill-soft')}
    <h2 id="sg-h" class="h2">규칙이 ${hl('분명', 'var(--hl-m)')}하고 ${hl('반복', 'var(--hl-y)')}되는 일</h2>
  </div>
  <div id="sg-q" class="bigq">?</div>
  <div class="tiles">
    ${GOOD.map(([ic, c, b, t], i) => `<div id="sg-${i}" class="card tile">${ico(`sg-i${i}`, ic, c, b, 'sm')}<div class="tt">${t}</div><span id="sg-r${i}" class="rep">${ICON.repeat(c)}</span></div>`).join('')}
  </div>
  <div class="center-col" style="top:770px">${ok('sg-ok', 'Claude Code CLI로 하면 좋은 작업들')}</div>`, anim: `
  up('#sg-k', ${f(T(7, 0.1))}, 16);
  tl.fromTo('#sg-q', {opacity:0, scale:.4, rotation:-30}, {opacity:1, scale:1, rotation:0, duration:.7, ease:'back.out(2)'}, ${f(T(7, 0.3))});
  tl.fromTo('#sg-q', {y:0}, {y:-18, duration:.6, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(7, 1.0))});
  tl.to('#sg-q', {opacity:0, scale:.6, duration:.35, ease:'power2.in'}, ${f(T(10, 0.3))});
  up('#sg-h', ${f(T(9, 0.2))}, 30); sweep('#sg-h .hl:nth-of-type(1)', ${f(T(10, 0.2))}); sweep('#sg-h .hl:nth-of-type(2)', ${f(T(10, 1.0))});
  ${GOOD.map((g, i) => `rise('#sg-${i}', ${f(T(g[4], 0.05))}); pop('#sg-i${i}', ${f(T(g[4], 0.25))}); tl.fromTo('#sg-r${i}', {opacity:0, rotation:-180}, {opacity:1, rotation:0, duration:.7, ease:'back.out(1.6)'}, ${f(T(15, i * 0.15))});`).join('\n  ')}
  pop('#sg-ok', ${f(T(16, 0.3))});` });

const CHECK = [['calendar', C.yellow, BG.yellow, '지각을 인정할지 말지', 19], ['eye', C.sky, BG.sky, '예외 사정 확인', 20], ['chat', C.pink, BG.pink, '공지문의 톤 · 말투 · 내용', 22]];
add({ id: 's-check', layer: 'full', s: T(18), e: T(26), html: `
  <div class="center-col" style="top:100px">
    ${pill('sc-k', '자동화하더라도', C.yellow, 'pill-soft')}
    <h2 id="sc-h" class="h2">사람이 ${hl('꼭 확인', 'var(--hl-y)')}해야 할 일</h2>
  </div>
  <div class="tiles three">
    ${CHECK.map(([ic, c, b, t], i) => `<div id="sc-${i}" class="card tile wide">${ico(`sc-i${i}`, ic, c, b, 'sm')}<div class="tt">${t}</div><span id="sc-s${i}" class="seal">사람 확인</span></div>`).join('')}
  </div>
  <div id="sc-w" class="card warnbar">${ico('sc-wi', 'warn', C.pink, BG.pink, 'xs')}<span>무조건 자동화하면 <b>나중에 문제</b>가 생길 수 있어요</span></div>`, anim: `
  up('#sc-k', ${f(T(18, 0.1))}, 16); up('#sc-h', ${f(T(18, 0.4))}, 30); sweep('#sc-h .hl', ${f(T(18, 1.2))});
  ${CHECK.map((g, i) => `rise('#sc-${i}', ${f(T(g[4], 0.05))}); pop('#sc-i${i}', ${f(T(g[4], 0.25))}); stamp('#sc-s${i}', ${f(T(g[4] + 1, 0))});`).join('\n  ')}
  rise('#sc-w', ${f(T(24, 0.1))}); shake('#sc-wi', ${f(T(25, 0.1))});` });

add({ id: 's-split', layer: 'full', s: T(26), e: T(30), html: `
  <div class="center-col" style="top:110px">
    <h2 id="sp-h" class="h2">AI에게 맡기되, ${hl('사람의 몫', 'var(--hl-p)')}은 분명히</h2>
  </div>
  <div class="duo2">
    <div id="sp-a" class="card dcard">
      ${ico('sp-ai', 'sparkle', C.coral, BG.peach)}
      <div class="dt"><b>AI</b>에게 맡기기</div>
      <div class="ds">반복되고 규칙이 분명한 일</div>
    </div>
    <div id="sp-plus" class="bigop">+</div>
    <div id="sp-b" class="card dcard">
      ${ico('sp-bi', 'user', C.lav, BG.lav)}
      <div class="dt"><b>사람</b>이 신경 쓰기</div>
      <div class="ds">확인 · 판단이 필요한 일</div>
    </div>
  </div>`, anim: `
  up('#sp-h', ${f(T(26, 0.1))}, 30); sweep('#sp-h .hl', ${f(T(29, 0))});
  rise('#sp-a', ${f(T(26, 0.6))}); pop('#sp-ai', ${f(T(27, 0))});
  pop('#sp-plus', ${f(T(28, 0.3))});
  rise('#sp-b', ${f(T(29, 0))}); pop('#sp-bi', ${f(T(29, 0.2))});` });

add({ id: 's-never', layer: 'full', s: T(30), e: T(36), html: `
  <div class="center-col" style="top:96px">
    ${pill('sn-k', '특히', C.pink, 'pill-soft')}
    <h2 id="sn-h" class="h2">${hl('자동화하면 안 되는', 'var(--hl-p)')} 일</h2>
  </div>
  <div id="sn-c" class="card nevercard">
    <div class="nhead">${ico('sn-ci', 'scale', C.pink, BG.pink, 'sm')}<div class="nt">학생을 판단하는 <b>최종 결정</b></div></div>
    <div class="nrow">
      <div id="sn-0" class="nchip">${ico('sn-l0', 'lock', C.pink, BG.pink, 'xxs')}<span>성적</span></div>
      <div id="sn-1" class="nchip">${ico('sn-l1', 'lock', C.pink, BG.pink, 'xxs')}<span>부정행위 판단</span></div>
    </div>
    <div id="sn-st" class="bigstamp">교수님이 <b>직접</b></div>
  </div>`, anim: `
  up('#sn-k', ${f(T(30, 0.1))}, 16); up('#sn-h', ${f(T(30, 0.4))}, 30); sweep('#sn-h .hl', ${f(T(30, 1.3))});
  rise('#sn-c', ${f(T(31, 0))}); pop('#sn-ci', ${f(T(31, 0.3))});
  slide('#sn-0', ${f(T(32, 0))}, -40); slide('#sn-1', ${f(T(33, 0))}, -40);
  tl.fromTo('#sn-st', {opacity:0, scale:1.8, rotation:-20}, {opacity:1, scale:1, rotation:-6, duration:.5, ease:'back.out(2)'}, ${f(T(35, 0.3))});` });

add({ id: 's-human', layer: 'full', s: T(36), e: T(40), html: `
  <div class="center-col" style="top:220px">
    ${ico('sh-i', 'heart', C.pink, BG.pink)}
    <h2 id="sh-h" class="h2">학생과의 관계에서 나오는 <br>${hl('피드백 · 이야기', 'var(--hl-p)')}는</h2>
    <div id="sh-s" class="subline">교수님이 <b>따로 작성</b>하셔야겠죠</div>
  </div>`, anim: `
  pop('#sh-i', ${f(T(36, 0.1))}); tl.fromTo('#sh-i', {scale:1}, {scale:1.1, duration:.45, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(37, 0))});
  up('#sh-h', ${f(T(36, 0.4))}, 30); sweep('#sh-h .hl', ${f(T(37, 0.2))}); up('#sh-s', ${f(T(38, 0.2))}, 20);` });

const FLOW = [['sparkle', C.coral, BG.peach, 'AI', '반복되는 일 처리', 40], ['pen', C.lav, BG.lav, '교수님', '세심한 피드백 추가', 42], ['students', C.mint, BG.mint, '학생', '마음이 닿는 피드백', 43]];
add({ id: 's-flow', layer: 'full', s: T(40), e: T(44, 0.2), html: `
  <div class="center-col" style="top:120px">
    ${pill('sf-k', '이렇게 나눠 주세요', C.lav, 'pill-soft')}
  </div>
  <div class="flow">
    ${FLOW.map(([ic, c, b, who, t], i) => `<div id="sf-${i}" class="card fcard">${ico(`sf-i${i}`, ic, c, b, 'sm')}<div class="fw" style="color:${c}">${who}</div><div class="ft">${t}</div></div>${i < 2 ? arrowR(`sf-a${i}`) : ''}`).join('')}
  </div>
  <div class="center-col" style="top:770px"><div id="sf-s" class="subline">마지막 한 줄은 <b>교수님</b>이 더해 주세요</div></div>`, anim: `
  up('#sf-k', ${f(T(40, 0.1))}, 16);
  ${FLOW.map((g, i) => `${i ? `draw('#sf-a${i - 1} path', ${f(T(g[5], -0.3))}, .4);` : ''} rise('#sf-${i}', ${f(T(g[5], 0.05))}); pop('#sf-i${i}', ${f(T(g[5], 0.25))});`).join('\n  ')}
  tl.to('#sf-1', {scale:1.06, duration:.5, ease:'back.out(2)'}, ${f(T(43, 0.8))});
  up('#sf-s', ${f(T(43, 1.0))}, 18);` });

// ===== 2. 실습 화면 (1:34 ~ 8:50) — 빈 곳에 작고 짧은 카드 =====================
// lane = 왼쪽 Explorer 아래 빈 칸 (Explorer 가 펼쳐지기 전, 큐 ~96 까지)
// top  = 위쪽 편집기 탭 줄 오른쪽 (터미널 내용을 가리지 않는 띠)
add({ id: 'o-file', s: T(52), e: T(60), html: `
  <div id="of-c" class="ovc lane">
    ${pill('of-k', '실습 프롬프트 텍스트 파일', C.yellow, 'pill-soft pill-sm')}
    <div class="row">${ico('of-i', 'link', C.sky, BG.sky, 'xs')}<div id="of-t" class="ovt">고정 댓글 링크에서<br><b>다운로드</b></div></div>
    ${ok('of-ok', '내 상황에 맞게 고쳐 써도 좋아요', 'ok-xs')}
  </div>`, anim: `rise('#of-c', ${f(T(52, 0.1))}); up('#of-k', ${f(T(52, 0.3))}, 12); pop('#of-i', ${f(T(53, 0))}); up('#of-t', ${f(T(53, 0.1))}, 14); tl.fromTo('#of-i', {y:0}, {y:-6, duration:.3, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(T(55, 0))}); pop('#of-ok', ${f(T(58, 0.1))});` });

add({ id: 'o-custom', s: T(65), e: T(76), html: `
  <div id="ou-c" class="ovc lane">
    ${pill('ou-k', '교수님만을 위한 프롬프트로', C.lav, 'pill-soft pill-sm')}
    <div class="chain"><span id="ou-0" class="chip">텍스트 파일</span><span id="ou-g0" class="cg">+</span><span id="ou-1" class="chip">할 작업 자세히</span><span id="ou-g1" class="cg">›</span><span id="ou-2" class="chip hot">Claude · ChatGPT · Gemini</span></div>
    <div id="ou-t" class="ovs2">프롬프트의 ${hl('로직 · 순서는 그대로', 'var(--hl-y)')}, 내용만 바꾸기</div>
  </div>`, anim: `rise('#ou-c', ${f(T(65, 0.1))}); up('#ou-k', ${f(T(65, 0.3))}, 12); pop('#ou-0', ${f(T(66, 0.1))}); pop('#ou-g0', ${f(T(68, 0))}); pop('#ou-1', ${f(T(68, 0.15))}); pop('#ou-g1', ${f(T(70, 0))}); pop('#ou-2', ${f(T(70, 0.15))}); up('#ou-t', ${f(T(72, 0.1))}, 12); sweep('#ou-t .hl', ${f(T(73, 0))});` });

add({ id: 'o-step', s: T(79), e: T(85), html: `
  <div id="os-c" class="ovc lane">
    <div class="stephead"><span class="stepn">STEP 1</span><span class="stept">빈 작업 폴더 열기</span></div>
    <div class="crumbs">${['File', 'Open Folder', '새 폴더', 'Select Folder'].map((t, i) => `${i ? `<span id="os-g${i}" class="cg">›</span>` : ''}<span id="os-b${i}" class="crumb">${t}</span>`).join('')}</div>
  </div>`, anim: `rise('#os-c', ${f(T(79, 0.1))}); ${[79, 80, 82, 83].map((n, i) => `${i ? `pop('#os-g${i}', ${f(T(n, 0))}); ` : ''}pop('#os-b${i}', ${f(T(n, 0.15))});`).join(' ')} ok2('#os-b3', ${f(T(84, 0))});` });

add({ id: 'o-fake', s: T(88), e: T(96), html: `
  <div id="ok-c" class="ovc lane">
    <div class="stephead"><span class="stepn">프롬프트 1</span><span class="stept">가상 수업 자료 만들기</span></div>
    ${no('ok-n', '실제 사람 이름은 절대 쓰지 않기', 'ok-xs')}
    <div class="chain"><span id="ok-0" class="chip mono">roster.csv</span><span id="ok-1" class="chip">수강생 30명</span><span id="ok-g" class="cg">›</span><span id="ok-2" class="chip hot">학생01 ~ 학생30</span></div>
  </div>`, anim: `rise('#ok-c', ${f(T(88, 0.1))}); pop('#ok-n', ${f(T(89, 0.2))}); pop('#ok-0', ${f(T(90, 0.2))}); pop('#ok-1', ${f(T(91, 0))}); pop('#ok-g', ${f(T(94, 0))}); pop('#ok-2', ${f(T(94, 0.15))});` });

add({ id: 'o-messy', s: T(105), e: T(117), html: `
  <div id="om-c" class="ovc top row">
    <div class="messy"><span id="om-0" class="fchip bad" style="--r:-4deg">과제 제출합니다.txt</span><span id="om-1" class="fchip bad" style="--r:3deg">학생07 과제.txt</span><span id="om-2" class="fchip bad" style="--r:-2deg">과제1_최종(2).txt</span></div>
    ${arrowR('om-a')}
    <div id="om-t" class="ovt">반복되고 규칙 있는 일<br>= ${hl('자동화', 'var(--hl-y)')}하기 좋은 일</div>
  </div>`, anim: `rise('#om-c', ${f(T(105, 0.1))}); ${[0, 1, 2].map((i) => `tl.fromTo('#om-${i}', {opacity:0, y:-30, rotation:0}, {opacity:1, y:0, rotation:${[-4, 3, -2][i]}, duration:.5, ease:'back.out(2)'}, ${f(T(106, 0.2 + i * 0.5))});`).join(' ')} draw('#om-a path', ${f(T(112, 0))}, .4); up('#om-t', ${f(T(112, 0.2))}, 14); sweep('#om-t .hl', ${f(T(114, 0))});` });

add({ id: 'o-plan', s: T(143), e: T(155), html: `
  <div id="op-c" class="ovc top row">
    <div id="op-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code id="op-tt">/plan</code><span id="op-cur" class="tcur"></span></div>
    <div class="col">
      <div class="duoline">${no('op-n', '바로 실행', 'ok-xs')}${arrowR('op-a', 'arrow-sm')}<div id="op-t" class="ovt"><b>계획을 먼저</b> 보여 줘요</div></div>
      ${ok('op-ok', '계획을 보고 진행할지 내가 결정', 'ok-xs')}
    </div>
  </div>`, anim: `rise('#op-c', ${f(T(143, 0.1))}); type('#op-tt', '/plan', ${f(T(143, 0.4))}, .5); blink('#op-cur', ${f(T(143, 0.2))}, ${f(T(151, 0))}); pop('#op-n', ${f(T(151, 0.1))}); draw('#op-a path', ${f(T(152, 0))}, .35); up('#op-t', ${f(T(152, 0.2))}, 12); pop('#op-ok', ${f(T(154, 0.2))});` });

add({ id: 'o-rename', s: T(155), e: T(162), html: `
  <div id="or-c" class="ovc top row">
    ${ico('or-i', 'plan', C.lav, BG.lav, 'xs')}
    <div class="col">
      <div class="chain"><span id="or-0" class="chip mono">roster.csv</span><span class="cg">대조</span><span id="or-g" class="cg">›</span><span id="or-1" class="chip mono hot">학번_이름_과제1.txt</span></div>
      ${ok('or-ok', '원본은 백업 폴더에 먼저 넣어 두기', 'ok-xs')}
    </div>
  </div>`, anim: `rise('#or-c', ${f(T(155, 0.1))}); pop('#or-i', ${f(T(155, 0.3))}); pop('#or-0', ${f(T(157, 0))}); pop('#or-g', ${f(T(157, 0.8))}); pop('#or-1', ${f(T(157, 1.0))}); pop('#or-ok', ${f(T(159, 0.1))});` });

add({ id: 'o-done', s: T(166), e: T(175), html: `
  <div id="od-c" class="ovc top row done">
    ${ico('od-i', 'check', '#ffffff', '#3fa877', 'xs')}
    <div class="ovt">파일 이름 <b class="num"><span id="od-n">0</span>개</b> 같은 형식으로 통일</div>
    <div id="od-r" class="chain"><span class="chip">미제출</span><span class="chip">지각</span><span class="chip">중복 제출</span><span class="cg">체크까지</span></div>
  </div>`, anim: `rise('#od-c', ${f(T(166, 0.1))}); tl.fromTo('#od-i', {opacity:0, scale:.3, rotation:-90}, {opacity:1, scale:1, rotation:0, duration:.6, ease:'back.out(2)'}, ${f(T(167, 0))}); count('#od-n', 27, ${f(T(167, 0.1))}, 1.2); confetti('od', ${f(T(167, 1.3))}); slide('#od-r', ${f(T(174, 0.1))}, 30);` });

add({ id: 'o-skill', s: T(178), e: T(185), html: `
  <div id="ok2-c" class="ovc top row">
    ${ico('ok2-i', 'wand', C.coral, BG.peach, 'xs')}
    <div class="ovt"><b>스킬</b> = 반복하는 업무를<br>${hl('명령어 하나', 'var(--hl-y)')}로 정리해 두기</div>
    <div id="ok2-s" class="tagbadge">척하면 척!</div>
  </div>`, anim: `rise('#ok2-c', ${f(T(178, 0.1))}); pop('#ok2-i', ${f(T(178, 0.3))}); sweep('#ok2-c .hl', ${f(T(179, 0.6))}); tl.fromTo('#ok2-i', {rotation:0}, {rotation:-18, duration:.2, ease:'sine.inOut', yoyo:true, repeat:3, immediateRender:false}, ${f(T(180, 0))}); stamp('#ok2-s', ${f(T(181, 0.1))});` });

add({ id: 'o-weekly', s: T(185), e: T(197), html: `
  <div id="ow-c" class="ovc top row">
    <div id="ow-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code id="ow-tt">/weekly-notice 3</code></div>
    <div class="chain"><span id="ow-0" class="chip mono">syllabus.md</span><span class="cg">읽고</span><span id="ow-g" class="cg">›</span><span id="ow-1" class="chip mono hot">3주차 공지문.md</span></div>
    <div id="ow-s" class="bigstamp sm">스킬 = <b>약속</b></div>
  </div>`, anim: `rise('#ow-c', ${f(T(185, 0.1))}); type('#ow-tt', '/weekly-notice 3', ${f(T(185, 0.3))}, 1.0); pop('#ow-0', ${f(T(186, 0.1))}); pop('#ow-g', ${f(T(187, 0))}); pop('#ow-1', ${f(T(187, 0.2))}); tl.fromTo('#ow-s', {opacity:0, scale:1.8, rotation:-20}, {opacity:1, scale:1, rotation:-6, duration:.5, ease:'back.out(2)'}, ${f(T(193, 0.2))});` });

add({ id: 'o-15', s: T(201), e: T(205), html: `
  <div id="o15-c" class="ovc top row">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="o15-tt">/weekly-notice 15</code></div>
    ${ok('o15-ok', '15만 쳐도 약속한 작업을 쭉', 'ok-xs')}
  </div>`, anim: `rise('#o15-c', ${f(T(201, 0.1))}); type('#o15-tt', '/weekly-notice 15', ${f(T(201, 0.3))}, 1.0); pop('#o15-ok', ${f(T(203, 0.1))});` });

add({ id: 'o-tip', s: T(207), e: T(218), html: `
  <div id="ot-c" class="ovc top row tipcard">
    <span id="ot-b" class="tipbadge">TIP</span>
    <div class="col">
      <div class="ovt">작업이 끝나면 꼭 → “${hl('스킬로 만들어 줘', 'var(--hl-y)')}”</div>
      <div id="ot-s" class="ovs2">스킬 이름도 알아서 정해 달라고 하면 돼요</div>
    </div>
  </div>`, anim: `rise('#ot-c', ${f(T(207, 0.1))}); pop('#ot-b', ${f(T(207, 0.3))}); sweep('#ot-c .hl', ${f(T(208, 0.3))}); up('#ot-s', ${f(T(216, 0))}, 12);` });

const CRIT = [['① 주장이 분명한가', 230], ['② 근거가 있는가', 231], ['③ 반론을 고려했는가', 232]];
add({ id: 'o-daily', s: T(224), e: T(236), html: `
  <div id="oy-c" class="ovc top row">
    <div id="oy-clk" class="clock"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#fff7ee" stroke="#e7a92c" stroke-width="5"/><path id="oy-h" d="M32 32V19" stroke="#34314a" stroke-width="5" stroke-linecap="round"/><path id="oy-m" d="M32 32V12" stroke="#ef8a6f" stroke-width="4" stroke-linecap="round"/></svg></div>
    <div class="col">
      <div class="ovt">매일 아침 <b>8시</b> · 새 제출물 → <b>피드백 초안</b></div>
      <div class="chain">${CRIT.map(([t], i) => `<span id="oy-${i}" class="chip">${t}</span>`).join('')}${no('oy-n', '점수는 매기지 않기', 'ok-xs')}</div>
    </div>
  </div>`, anim: `rise('#oy-c', ${f(T(224, 0.1))}); tl.fromTo('#oy-m', {rotation:0, svgOrigin:'32 32'}, {rotation:720, svgOrigin:'32 32', duration:1.4, ease:'power2.inOut'}, ${f(T(225, 0))}); tl.fromTo('#oy-h', {rotation:-60, svgOrigin:'32 32'}, {rotation:-120, svgOrigin:'32 32', duration:1.4, ease:'power2.inOut'}, ${f(T(225, 0))}); ${CRIT.map(([, n], i) => `pop('#oy-${i}', ${f(T(n, 0.1))});`).join(' ')} pop('#oy-n', ${f(T(235, 0.1))});` });

add({ id: 'o-prof', s: T(237), e: T(243), html: `
  <div id="opf-c" class="ovc top row">
    ${ico('opf-i', 'pen', C.lav, BG.lav, 'xs')}
    <div class="col">
      <div class="ovt">맨 아래 “<b>교수님 한마디</b>” = ${hl('교수님의 몫', 'var(--hl-p)')}</div>
      <div id="opf-s" class="ovs2">오해가 생길 수 있는 주관적인 내용은 AI에게 맡기지 않기</div>
    </div>
  </div>`, anim: `rise('#opf-c', ${f(T(237, 0.1))}); pop('#opf-i', ${f(T(237, 0.3))}); sweep('#opf-c .hl', ${f(T(238, 0))}); up('#opf-s', ${f(T(241, 0))}, 12);` });

add({ id: 'o-drop', s: T(250), e: T(256), html: `
  <div id="odr-c" class="ovc top row">
    <div class="dropbox"><span id="odr-f" class="fchip">과제.txt</span>${ICON.folder('#e7a92c')}</div>
    <div class="ovt"><code class="mono-in">submissions</code> 폴더에 <b>넣기만</b> 하면<br>→ 매일 8시에 피드백 초안</div>
  </div>`, anim: `rise('#odr-c', ${f(T(250, 0.1))}); tl.fromTo('#odr-f', {opacity:0, x:-80, y:-50}, {opacity:1, x:0, y:0, duration:.8, ease:'power2.inOut'}, ${f(T(251, 0.3))}); tl.to('#odr-f', {opacity:0, y:22, scale:.7, duration:.4, ease:'power2.in'}, ${f(T(251, 1.2))}); tl.fromTo('#odr-f', {opacity:0, x:-80, y:-50, scale:1}, {opacity:1, x:0, y:0, duration:.8, ease:'power2.inOut', immediateRender:false}, ${f(T(254, 0.2))}); tl.to('#odr-f', {opacity:0, y:22, scale:.7, duration:.4, ease:'power2.in'}, ${f(T(254, 1.1))});` });

add({ id: 'o-notice', s: T(266), e: T(274), html: `
  <div id="on-c" class="ovc top row done">
    <div class="bigcmd"><span class="tprompt">&gt;</span><code id="on-tt">/weekly-notice 15</code></div>
    ${arrowR('on-a', 'arrow-sm')}
    <div class="col"><span id="on-0" class="chip mono hot">notices/week15_notice.md</span>${ok('on-ok', '학생들에게 올릴 공지문 완성', 'ok-xs')}</div>
  </div>`, anim: `rise('#on-c', ${f(T(266, 0.1))}); type('#on-tt', '/weekly-notice 15', ${f(T(267, 0))}, 1.0); draw('#on-a path', ${f(T(270, 0))}, .35); pop('#on-0', ${f(T(270, 0.3))}); pop('#on-ok', ${f(T(271, 0.1))});` });

add({ id: 'o-auto', s: T(277), e: T(280, -0.4), html: `
  <div id="oa-c" class="ovc top row">
    ${ico('oa-i', 'bolt', C.yellow, BG.yellow, 'xs')}
    <div class="ovt">자주 하는 업무는 <b>Claude Code CLI</b>로 ${hl('자동화', 'var(--hl-y)')}</div>
  </div>`, anim: `rise('#oa-c', ${f(T(277, 0.1))}); pop('#oa-i', ${f(T(277, 0.3))}); sweep('#oa-c .hl', ${f(T(279, 0))});` });

// ===== 3. 마무리 (8:51 ~) — 원본 화면을 덮는다 ===============================
const RECAP = [['files', C.coral, BG.peach, '가상 수업 자료'], ['plan', C.lav, BG.lav, '/plan → 이름 통일'], ['wand', C.sky, BG.sky, '스킬 /weekly-notice'], ['clock', C.yellow, BG.yellow, '매일 8시 피드백 초안']];
add({ id: 's-recap', layer: 'full', s: T(280), e: T(285), html: `
  <div class="center-col" style="top:90px">${pill('se-k', '오늘 해 본 실습', C.coral, 'pill-soft')}</div>
  <div class="recap">
    ${RECAP.map(([ic, c, b, t], i) => `<div id="se-${i}" class="card rtile">${ico(`se-i${i}`, ic, c, b, 'xs')}<span>${t}</span></div>`).join('')}
  </div>
  <div class="duo2" style="top:500px">
    <div id="se-a" class="card ocard">${ico('se-ai', 'play', C.mint, BG.mint, 'xs')}<div class="dt">프롬프트 <b>그대로</b></div></div>
    <div id="se-or" class="bigop vs">또는</div>
    <div id="se-b" class="card ocard">${ico('se-bi', 'pen', C.lav, BG.lav, 'xs')}<div class="dt">원하는 방향으로 <b>고쳐서</b></div></div>
  </div>`, anim: `
  up('#se-k', ${f(T(280, 0.1))}, 16);
  ${RECAP.map((_, i) => `rise('#se-${i}', ${f(T(280, 0.4 + i * 0.3))});`).join(' ')}
  rise('#se-a', ${f(T(281, 0.1))}); pop('#se-ai', ${f(T(281, 0.3))});
  pop('#se-or', ${f(T(283, 0))}); rise('#se-b', ${f(T(283, 0.2))}); pop('#se-bi', ${f(T(283, 0.4))});` });

const HOW = [['download', C.sky, BG.sky, '텍스트 파일 받기', '고정 댓글 링크', 285], ['chat', C.coral, BG.peach, 'AI에게 주고 설명', 'Claude · ChatGPT · Gemini에<br>할 작업을 자세히', 289], ['terminal', '#ffffff', '#34314a', '내 작업에 맞게<br>고쳐 달라', 'Claude Code에서 직접 실행', 293]];
add({ id: 's-how', layer: 'full', s: T(285), e: T(300), html: `
  <div class="center-col" style="top:96px">
    ${pill('sh2-k', '나만의 프롬프트 만드는 법', C.sky, 'pill-soft')}
  </div>
  <div class="flow" style="top:250px">
    ${HOW.map(([ic, c, b, t, d], i) => `<div id="sh2-${i}" class="card fcard tall"><span class="fnum">${i + 1}</span>${ico(`sh2-i${i}`, ic, c, b, 'sm')}<div class="ft big">${t}</div><div class="fd">${d}</div></div>${i < 2 ? arrowR(`sh2-a${i}`) : ''}`).join('')}
  </div>
  <div class="center-col" style="top:780px">${ok('sh2-ok', '로직은 그대로 · 내용은 교수님 방향대로')}</div>`, anim: `
  up('#sh2-k', ${f(T(285, 0.1))}, 16);
  ${HOW.map((g, i) => `${i ? `draw('#sh2-a${i - 1} path', ${f(T(g[5], -0.3))}, .4);` : ''} rise('#sh2-${i}', ${f(T(g[5], 0.05))}); pop('#sh2-i${i}', ${f(T(g[5], 0.25))});`).join('\n  ')}
  tl.to('#sh2-2', {scale:1.05, duration:.5, ease:'back.out(2)'}, ${f(T(296, 0))});
  pop('#sh2-ok', ${f(T(298, 0.2))});` });

add({ id: 's-privacy', layer: 'full', s: T(300), e: T(304), html: `
  <div class="center-col" style="top:150px">
    ${pill('sv-k', '그리고 중요한 것', C.pink, 'pill-soft')}
    ${ico('sv-i', 'shield', C.mint, BG.mint)}
    <h2 id="sv-h" class="h2">학생의 ${hl('개인 정보', 'var(--hl-p)')}는<br>AI에 넣지 않기</h2>
    <div class="row">${no('sv-n', '실제 이름', 'ok-xs')}${no('sv-n2', '개인 정보', 'ok-xs')}${ok('sv-o', '가상 데이터로 작업', 'ok-xs')}</div>
  </div>`, anim: `
  up('#sv-k', ${f(T(300, 0.1))}, 16); pop('#sv-i', ${f(T(301, 0))}); up('#sv-h', ${f(T(301, 0.3))}, 30); sweep('#sv-h .hl', ${f(T(301, 1.0))});
  pop('#sv-n', ${f(T(302, 0.1))}); pop('#sv-n2', ${f(T(302, 0.5))}); pop('#sv-o', ${f(T(303, 0.2))});` });

const SERIES = [['1편', '설치'], ['2편', '기초'], ['3편', '폴더 정리'], ['4편', '반복 업무 자동화']];
add({ id: 's-end', layer: 'full', s: T(304), e: DUR, html: `
  <div id="sx-ph" class="phwrap end"><img class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="sx-c" class="card endcard">
    ${pill('sx-k', '교수님들을 위한 Claude Code CLI', C.lav, 'pill-soft')}
    <div id="sx-h" class="endbig">4편 · 반복 업무 자동화 <span class="endok">완료</span></div>
    <div class="series">${SERIES.map(([n, t], i) => `<div id="sx-${i}" class="sitem done"><span class="sn">${n}</span><span class="st"><b>${t}</b></span><span id="sx-t${i}" class="tick">${ICON.check('#ffffff')}</span></div>`).join('')}</div>
    <div id="sx-sub" class="subrow">${ico('sx-hh', 'heart', C.pink, BG.pink, 'xxs')}<span>좋아요</span>${ico('sx-bb', 'bell', C.yellow, BG.yellow, 'xxs')}<span>구독</span></div>
    <div id="sx-ty" class="thanks">감사합니다</div>
  </div>`, anim: `
  tl.fromTo('#sx-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, ${f(T(304, 0.15))});
  rise('#sx-c', ${f(T(304, 0.3))}); up('#sx-k', ${f(T(304, 0.5))}, 14); up('#sx-h', ${f(T(304, 0.7))}, 26);
  ${SERIES.map((_, i) => `slide('#sx-${i}', ${f(T(304, 1.0 + i * 0.2))}, 30); pop('#sx-t${i}', ${f(T(304, 1.3 + i * 0.25))});`).join(' ')}
  rise('#sx-sub', ${f(T(306, 0))}); pop('#sx-hh', ${f(T(306, 0.3))}); pop('#sx-bb', ${f(T(306, 0.6))});
  up('#sx-ty', ${f(T(307, 0))}, 20);
  tl.fromTo('#sx-ph', {y:0}, {y:-14, duration:1.6, ease:'sine.inOut', yoyo:true, repeat:${Math.max(0, Math.floor((DUR - T(305)) / 1.6) - 1)}, immediateRender:false}, ${f(T(305, 0))});` });

// sanity
for (const g of G) if (!(g.e > g.s + 0.5)) throw new Error(`bad span ${g.id}: ${g.s} → ${g.e}`);

// ---------- captions in covered spans ----------------------------------------
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const caps = [];
for (const cv of COVER) for (let n = cv.cues[0]; n <= cv.cues[1]; n++) {
  const c = CUES[n]; caps.push({ n, s: c.s, e: Math.min(c.e, CUES[n + 1] ? CUES[n + 1].s : c.e), text: (CAPFIX[n] ?? c.text).trim() });
}

// ---------- assemble ---------------------------------------------------------
const gHTML = G.map((g) => `
<div id="${g.id}" class="scene ${g.layer} clip" data-start="${g.s.toFixed(3)}" data-duration="${(g.e - g.s).toFixed(3)}" data-track-index="${g.layer === 'full' ? 3 : 4}">
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

const capHTML = caps.map((c, i) =>
  `<div id="cap${i}" class="cap clip" data-start="${c.s.toFixed(3)}" data-duration="${Math.max(0.2, c.e - c.s).toFixed(3)}" data-track-index="8"><span>${esc(c.text)}</span></div>`).join('\n');

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
<title>교수님들을 위한 Claude Code CLI 4편 (반복 업무 자동화)</title>
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

/* cover (motion-graphics-only spans) */
.cover { position: absolute; inset: 0; z-index: 2; }
.cov-in { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(135deg, #fff6ee 0%, #fdf1f4 45%, #f1f0ff 100%); }
.blob { position: absolute; border-radius: 50%; opacity: .75; filter: blur(30px); }
.dc { position: absolute; display: block; }
.dc-dot { border-radius: 50%; background: var(--c); opacity: .75; }
.dc-ring { border-radius: 50%; border: 4px solid var(--c); opacity: .8; }
.dc-dia { background: var(--c); opacity: .7; border-radius: 4px; transform: rotate(45deg); }

/* captions in covered spans — same look as the burned-in captions */
.cap { position: absolute; left: 0; right: 0; bottom: 56px; z-index: 8; display: flex; justify-content: center; pointer-events: none; }
.cap span { display: block; max-width: 1500px; padding: 6px 22px 10px; background: #000; color: #fff;
  font-size: 54px; font-weight: 700; line-height: 1.3; text-align: center; word-break: keep-all; letter-spacing: -.01em; }

.scene { position: absolute; inset: 0; }
.scene.full { z-index: 3; }
.scene.ov { z-index: 4; }
.sc { position: absolute; inset: 0; opacity: 0; }

/* shared pieces */
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
.okc { display: block; width: 48px; height: 48px; border-radius: 50%; background: #3fa877; padding: 7px; }
.okc svg { display: block; width: 100%; height: 100%; }
.nopill { background: #fde8ec; color: #8a3550; box-shadow: 0 10px 24px rgba(200, 80, 110, .12); }
.nopill .okc { background: #e0607f; }
.ok-xs { font-size: 24px; padding: 6px 18px 6px 6px; gap: 10px; align-self: flex-start; }
.ok-xs .okc { width: 34px; height: 34px; padding: 5px; }
.h1 { font-size: 104px; font-weight: 900; line-height: 1.12; letter-spacing: -.035em; word-break: keep-all; }
.h1.center { text-align: center; }
.h2 { font-size: 70px; font-weight: 850; line-height: 1.22; letter-spacing: -.03em; word-break: keep-all; text-align: center; }
.hl { background-image: linear-gradient(var(--hlc), var(--hlc)); background-repeat: no-repeat; background-position: 0 88%; background-size: 0% 38%; padding: 0 4px; }
.ico { display: flex; align-items: center; justify-content: center; width: 150px; height: 150px; border-radius: 50%; padding: 34px; flex: 0 0 auto;
  box-shadow: 0 12px 26px rgba(120, 92, 80, .12), inset 0 0 0 6px rgba(255, 255, 255, .7); }
.ico svg { display: block; width: 100%; height: 100%; }
.ico.sm { width: 120px; height: 120px; padding: 27px; }
.ico.xs { width: 70px; height: 70px; padding: 15px; }
.ico.xxs { width: 46px; height: 46px; padding: 10px; box-shadow: inset 0 0 0 3px rgba(255, 255, 255, .7); }
.arrow { display: block; width: 90px; height: 24px; flex: 0 0 auto; }
.arrow path { stroke-dasharray: 1; stroke-dashoffset: 1; }
.arrow-sm { width: 60px; }
.subline { padding: 16px 36px; border-radius: 999px; background: rgba(255, 255, 255, .9); box-shadow: 0 12px 30px rgba(80, 60, 70, .12); font-size: 40px; font-weight: 600; letter-spacing: -.02em; }
.subline b { font-weight: 900; color: #d0603f; }
.row { display: flex; align-items: center; gap: 18px; }
.col { display: flex; flex-direction: column; gap: 12px; }

/* title */
.phwrap { position: absolute; left: 110px; top: 170px; width: 480px; }
.phwrap.end { left: 90px; top: 200px; width: 430px; }
.phimg { display: block; width: 100%; height: auto; filter: drop-shadow(0 24px 30px rgba(80, 60, 90, .22)); }
.titlecard { left: 660px; top: 170px; width: 1120px; display: flex; flex-direction: column; align-items: center; gap: 34px; padding: 60px 60px 64px; }
.term { display: flex; align-items: center; gap: 16px; min-width: 420px; padding: 18px 30px; border-radius: 20px; background: #2c2a3d;
  font-family: Consolas, "Courier New", monospace; font-size: 40px; font-weight: 700; color: #f4efe6; box-shadow: 0 14px 30px rgba(44, 42, 61, .3); }
.tprompt { color: #ef8a6f; }
.tcur { display: inline-block; width: 18px; height: 40px; background: #f4efe6; }

/* roadmap */
.road { position: absolute; left: 0; right: 0; top: 380px; display: flex; justify-content: center; align-items: center; gap: 18px; }
.rcard { position: relative; width: 320px; height: 330px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: rgba(255, 255, 255, .95); border-radius: 40px; box-shadow: 0 24px 56px rgba(80, 60, 70, .16); padding: 0 16px; }
.rcard.first { box-shadow: 0 0 0 8px rgba(200, 186, 255, .6), 0 26px 60px rgba(154, 139, 230, .3); }
.rn { font-size: 32px; font-weight: 850; letter-spacing: .04em; }
.rt { font-size: 40px; font-weight: 900; letter-spacing: -.03em; text-align: center; line-height: 1.15; word-break: keep-all; }
.rarrow { width: 50px; }
.rtick { position: absolute; top: 20px; right: 20px; display: block; width: 44px; height: 44px; border-radius: 50%; background: #3fa877; padding: 8px; }
.rtick svg { display: block; width: 100%; height: 100%; }
.nowtag { position: absolute; top: -26px; right: -14px; padding: 8px 22px; border-radius: 999px; background: #9a8be6; color: #fff; font-size: 28px; font-weight: 850; }

/* tiles */
.tiles { position: absolute; left: 0; right: 0; top: 360px; display: flex; justify-content: center; gap: 36px; }
.tile { position: relative; width: 360px; height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; padding: 24px; }
.tile.wide { width: 470px; }
.tt { font-size: 40px; font-weight: 850; letter-spacing: -.03em; text-align: center; line-height: 1.22; word-break: keep-all; }
.rep { position: absolute; top: 22px; right: 22px; width: 50px; height: 50px; opacity: 0; }
.rep svg { display: block; width: 100%; height: 100%; }
.seal { position: absolute; top: -20px; right: 24px; padding: 8px 20px; border-radius: 14px; background: #e7a92c; color: #fff; font-size: 26px; font-weight: 900; box-shadow: 0 10px 22px rgba(231, 169, 44, .35); }
.warnbar { left: 360px; top: 760px; width: 1200px; display: flex; align-items: center; justify-content: center; gap: 24px; padding: 18px 40px; border-radius: 999px; font-size: 40px; font-weight: 650; letter-spacing: -.02em; }
.warnbar b { font-weight: 900; color: #c4486c; }

/* duo cards */
.duo2 { position: absolute; left: 0; right: 0; top: 330px; display: flex; justify-content: center; align-items: center; gap: 46px; }
.dcard { position: relative; width: 640px; height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; padding: 30px; }
.dt { font-size: 52px; font-weight: 750; letter-spacing: -.03em; }
.dt b { font-weight: 900; }
.ds { font-size: 34px; font-weight: 600; color: var(--ink-soft); text-align: center; line-height: 1.3; }
.bigop { font-size: 80px; font-weight: 900; color: #c9a8e8; }
.bigop.vs { font-size: 44px; color: #7d62c0; }

/* never */
.nevercard { left: 380px; top: 340px; width: 1160px; padding: 44px 60px 50px; display: flex; flex-direction: column; gap: 30px; }
.nhead { display: flex; align-items: center; gap: 30px; }
.nt { font-size: 56px; font-weight: 700; letter-spacing: -.03em; }
.nt b { font-weight: 900; color: #c4486c; }
.nrow { display: flex; gap: 24px; padding-left: 150px; }
.nchip { display: flex; align-items: center; gap: 14px; padding: 12px 28px 12px 12px; border-radius: 999px; background: #fdf0f3; box-shadow: inset 0 0 0 2px #f6d3dc; font-size: 40px; font-weight: 850; }
.bigstamp { position: absolute; right: 50px; bottom: 40px; padding: 14px 30px; border: 5px solid #e0607f; border-radius: 18px; color: #c4486c; font-size: 44px; font-weight: 700; background: rgba(255, 255, 255, .9); }
.bigstamp b { font-weight: 900; }
.bigstamp.sm { position: relative; right: auto; bottom: auto; font-size: 30px; padding: 8px 18px; border-width: 4px; flex: 0 0 auto; }

/* flow */
.flow { position: absolute; left: 0; right: 0; top: 290px; display: flex; justify-content: center; align-items: center; gap: 26px; }
.fcard { position: relative; width: 440px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 30px; }
.fcard.tall { height: 450px; }
.fw { font-size: 34px; font-weight: 900; letter-spacing: .02em; }
.ft { font-size: 40px; font-weight: 850; letter-spacing: -.03em; text-align: center; word-break: keep-all; }
.ft.big { font-size: 42px; margin-top: 6px; }
.fd { font-size: 28px; font-weight: 600; color: var(--ink-soft); text-align: center; line-height: 1.35; word-break: keep-all; }
.fnum { position: absolute; left: 28px; top: 24px; width: 56px; height: 56px; border-radius: 50%; background: #ebe6ff; color: #6a55c0; font-size: 32px; font-weight: 900; display: flex; align-items: center; justify-content: center; }

/* recap */
.recap { position: absolute; left: 0; right: 0; top: 220px; display: flex; justify-content: center; gap: 24px; }
.rtile { position: relative; display: flex; align-items: center; gap: 16px; padding: 18px 30px 18px 18px; border-radius: 30px; font-size: 32px; font-weight: 850; letter-spacing: -.02em; white-space: nowrap; }
.ocard { position: relative; width: 640px; height: 220px; display: flex; align-items: center; justify-content: center; gap: 24px; padding: 30px; }
.ocard .dt { font-size: 46px; }

/* end */
.endcard { left: 600px; top: 120px; width: 1220px; padding: 50px 60px; display: flex; flex-direction: column; align-items: flex-start; gap: 26px; }
.endbig { font-size: 66px; font-weight: 900; letter-spacing: -.04em; }
.endok { color: #3fa877; }
.series { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; }
.sitem { position: relative; display: flex; align-items: center; gap: 18px; padding: 16px 22px; border-radius: 22px; background: #f0faf5; box-shadow: inset 0 0 0 2px #bfe6d1; }
.sn { font-size: 28px; font-weight: 900; color: #7d62c0; width: 56px; }
.st { font-size: 34px; }
.st b { font-weight: 900; }
.tick { position: absolute; right: 18px; top: 50%; margin-top: -21px; display: block; width: 42px; height: 42px; border-radius: 50%; background: #3fa877; padding: 7px; }
.tick svg { display: block; width: 100%; height: 100%; }
.subrow { display: flex; align-items: center; gap: 12px; padding: 12px 26px; border-radius: 999px; background: #fff7ee; box-shadow: inset 0 0 0 2px #f6e8da; font-size: 32px; font-weight: 850; }
.thanks { font-size: 44px; font-weight: 800; color: var(--ink-soft); }

/* overlay cards on the practice screen */
.ovc { position: absolute; display: flex; flex-direction: column; gap: 12px; padding: 18px 26px; border-radius: 26px; background: rgba(255, 255, 255, .97);
  box-shadow: 0 22px 50px rgba(10, 8, 20, .45), inset 0 0 0 2px #f3ebe2; }
.ovc.row { flex-direction: row; align-items: center; gap: 20px; }
.ovc.lane { left: 70px; top: 690px; width: 600px; }
.ovc.top .chain { flex-wrap: nowrap; }
.bigq { position: absolute; left: 860px; top: 330px; width: 200px; height: 260px; text-align: center; font-size: 240px; line-height: 260px; font-weight: 900; color: #4fb489; text-shadow: 0 20px 40px rgba(79, 180, 137, .3); }
.ovc.top { right: 40px; top: 74px; max-width: 1180px; }
.ovc.done { box-shadow: 0 22px 50px rgba(10, 8, 20, .45), inset 0 0 0 3px #9fdcbc; }
.ovt { display: block; font-size: 32px; font-weight: 650; line-height: 1.28; letter-spacing: -.02em; word-break: keep-all; white-space: nowrap; }
.ovt b { font-weight: 900; }
.ovt b.num { color: #2f8a5f; }
.ovs2 { font-size: 24px; font-weight: 600; color: var(--ink-soft); line-height: 1.35; white-space: nowrap; }
.ovs2 b { color: var(--ink); font-weight: 850; }
.chain { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.chip { padding: 7px 16px; border-radius: 14px; background: #f4f1fa; box-shadow: inset 0 0 0 2px #e4def0; font-size: 24px; font-weight: 800; white-space: nowrap; }
.chip.hot { background: #fff1cc; box-shadow: inset 0 0 0 2px #f3d98a; color: #7a5410; }
.chip.mono, .mono-in { font-family: Consolas, "Courier New", monospace; font-weight: 700; }
.mono-in { font-size: 30px; color: #9a4f35; }
.cg { font-size: 24px; font-weight: 900; color: #7d6fb0; white-space: nowrap; }
.stephead { display: flex; align-items: center; gap: 14px; }
.stepn { padding: 5px 14px; border-radius: 12px; background: #c9583c; color: #fff; font-size: 22px; font-weight: 900; letter-spacing: .04em; white-space: nowrap; }
.stept { font-size: 32px; font-weight: 900; letter-spacing: -.03em; white-space: nowrap; }
.crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.crumb { padding: 7px 16px; border-radius: 14px; background: #f4f1fa; box-shadow: inset 0 0 0 2px #e4def0; font-size: 24px; font-weight: 800; white-space: nowrap; }
.bigcmd { display: flex; align-items: center; gap: 12px; padding: 12px 22px; border-radius: 18px; background: #2c2a3d; flex: 0 0 auto;
  font-family: Consolas, "Courier New", monospace; font-size: 36px; font-weight: 700; color: #f4efe6; white-space: nowrap; }
.bigcmd code { font-family: inherit; }
.bigcmd .tcur { height: 32px; width: 15px; }
.duoline { display: flex; align-items: center; gap: 14px; }
.messy { position: relative; display: flex; flex-direction: column; gap: 6px; }
.fchip { display: inline-block; padding: 6px 16px; border-radius: 12px; background: #f1f8f4; box-shadow: inset 0 0 0 2px #cfeedd; font-size: 22px; font-weight: 750; color: #2d6b51; white-space: nowrap; font-family: Consolas, "Courier New", monospace; }
.fchip.bad { background: #fdf0f3; box-shadow: inset 0 0 0 2px #f6d3dc; color: #8a3550; transform: rotate(var(--r)); }
.tagbadge { padding: 10px 20px; border-radius: 14px; background: #ef8a6f; color: #fff; font-size: 28px; font-weight: 900; white-space: nowrap; transform: rotate(-4deg); }
.tipbadge { padding: 10px 18px; border-radius: 14px; background: #e7a92c; color: #fff; font-size: 30px; font-weight: 900; letter-spacing: .06em; }
.clock { width: 84px; height: 84px; flex: 0 0 auto; }
.clock svg { display: block; width: 100%; height: 100%; }
.dropbox { position: relative; width: 110px; height: 90px; flex: 0 0 auto; }
.dropbox > svg { position: absolute; left: 14px; top: 12px; width: 84px; height: 76px; }
.dropbox .fchip { position: absolute; left: 0; top: -6px; z-index: 2; font-size: 18px; padding: 4px 10px; }
.cf { position: absolute; display: block; width: 14px; height: 14px; border-radius: 3px; opacity: 0; }
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
  const ok2 = (sel, t) => tl.to(sel, { backgroundColor: '#e3f6ec', boxShadow: 'inset 0 0 0 2px #9fdcbc', duration: .4, ease: 'power2.out' }, t);
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
console.log(`Built ${G.length} graphics (${G.filter((g) => g.layer === 'full').length} full scenes), ${caps.length} captions, duration ${DUR}s`);
