import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 교수님들을 위한 Claude Code CLI 2편 (기초) — generator for index.html.
//
// Picture + sound: assets/media/src.mp4 (원본 녹화, 하단에 검정 박스 자막이 이미 박혀 있음)
// 구간 (사용자 요청):
//   0:00 ~ 0:38.7  인트로      — 파스텔 배경 + 모션그래픽만 (원본 화면을 덮음, 큐 1–16)
//   0:38.7 ~ 끝    실습 화면   — 원본 그대로 + 꼭 필요한 내용에만 작은 카드
// 덮는 구간은 원본에 박힌 자막도 가려지므로, 같은 모양(검정 박스 흰 글씨)의 자막을 다시 올린다.
// 카드 자리: 'tr' = 오른쪽 위 (IDE 로고 화면의 빈 영역), 'lane' = 왼쪽 Explorer 아래 빈 칸.
// 모든 시각은 원본 SRT 큐 번호에 고정: T(cue) = 큐 시작초.
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 747.0;

// ---------- SRT --------------------------------------------------------------
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const CUES = {};
fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .forEach((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); CUES[+l[0]] = { s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }; });
const T = (n, off = 0) => +(CUES[n].s + off).toFixed(3);
const TE = (n, off = 0) => +(CUES[n].e + off).toFixed(3);

// covered spans (motion graphics only)
const COVER = [
  { id: 'cov1', s: 0, e: T(17), fin: 0, fout: 0.45, cues: [1, 16] },
];
const CAPFIX = {};

// ---------- icons ----------------------------------------------------------
const S = (c, body, w = 4) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  terminal: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="6"/><path d="M18 26l8 6-8 6M30 40h14"/>`),
  window: (c) => S(c, `<rect x="8" y="12" width="48" height="40" rx="6"/><path d="M8 22h48"/><circle cx="15" cy="17" r="1.5" fill="${c}"/><circle cx="21" cy="17" r="1.5" fill="${c}"/><path d="M18 32h28M18 40h18"/>`),
  folder: (c) => S(c, `<path d="M8 18a4 4 0 0 1 4-4h12l6 6h22a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"/>`),
  files: (c) => S(c, `<path d="M20 8h18l10 10v30H20z"/><path d="M38 8v10h10"/><path d="M14 16v40h28"/>`),
  doc: (c) => S(c, `<path d="M16 8h22l12 12v36H16z"/><path d="M38 8v12h12"/><path d="M23 32h18M23 40h18M23 48h11"/>`),
  check: (c) => S(c, `<path d="M18 33l9 9 19-20"/>`, 7),
  x: (c) => S(c, `<path d="M20 20l24 24M44 20L20 44"/>`, 7),
  chat: (c) => S(c, `<path d="M10 14h44v28H30l-12 10V42h-8z"/><path d="M20 26h24M20 33h14"/>`),
  repeat: (c) => S(c, `<path d="M14 30a18 18 0 0 1 32-11l4 4"/><path d="M50 13v10H40"/><path d="M50 34a18 18 0 0 1-32 11l-4-4"/><path d="M14 51V41h10"/>`),
  hand: (c) => S(c, `<path d="M22 34V16a4 4 0 0 1 8 0v14M30 28V12a4 4 0 0 1 8 0v18M38 28v-12a4 4 0 0 1 8 0v22c0 10-6 16-15 16-6 0-10-3-13-8l-6-10a4 4 0 0 1 7-4l3 4"/>`),
  key: (c) => S(c, `<circle cx="20" cy="40" r="10"/><path d="M27 33l22-22M41 19l6 6M35 25l5 5"/>`),
  mouse: (c) => S(c, `<rect x="18" y="8" width="28" height="48" rx="14"/><path d="M32 8v16"/>`),
  keyboard: (c) => S(c, `<rect x="6" y="18" width="52" height="30" rx="5"/><path d="M14 27h2M22 27h2M30 27h2M38 27h2M46 27h2M18 35h2M26 35h2M34 35h2M42 35h2M20 42h24"/>`),
  sparkle: (c) => S(c, `<path d="M28 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${c}" stroke-width="2"/><path d="M50 40c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="${c}" stroke-width="1.5"/>`),
  warn: (c) => S(c, `<path d="M32 8l26 46H6z"/><path d="M32 26v12"/><circle cx="32" cy="45" r="1.5" fill="${c}"/>`),
  dice: (c) => S(c, `<rect x="10" y="10" width="44" height="44" rx="9"/><circle cx="22" cy="22" r="3" fill="${c}"/><circle cx="42" cy="22" r="3" fill="${c}"/><circle cx="32" cy="32" r="3" fill="${c}"/><circle cx="22" cy="42" r="3" fill="${c}"/><circle cx="42" cy="42" r="3" fill="${c}"/>`),
  trash: (c) => S(c, `<path d="M12 18h40M26 18v-6h12v6M16 18l3 36h26l3-36"/><path d="M27 28v16M37 28v16"/>`),
  play: (c) => S(c, `<circle cx="32" cy="32" r="24"/><path d="M27 22l15 10-15 10z" fill="${c}"/>`),
  rocket: (c) => S(c, `<path d="M32 8c10 8 13 20 9 34H23C19 28 22 16 32 8z"/><circle cx="32" cy="24" r="4"/><path d="M23 36l-8 8v8l9-6M41 36l8 8v8l-9-6M28 46l4 10 4-10"/>`),
  coin: (c) => S(c, `<circle cx="32" cy="32" r="22"/><path d="M38 24c-1-3-4-4-6-4-4 0-7 2-7 5 0 7 14 4 14 11 0 3-3 5-7 5-3 0-6-1-7-4M32 16v4M32 44v4"/>`),
  plug: (c) => S(c, `<path d="M24 8v12M40 8v12M18 20h28v10a14 14 0 0 1-28 0z"/><path d="M32 44v12"/>`),
  bolt: (c) => S(c, `<path d="M36 6L14 36h16l-4 22 22-30H32z" fill="${c}" stroke-width="2"/>`),
  pen: (c) => S(c, `<path d="M14 50l4-14 26-26 10 10-26 26z"/><path d="M38 16l10 10"/>`),
  code: (c) => S(c, `<path d="M22 20L10 32l12 12M42 20l12 12-12 12M36 14l-8 36"/>`),
  heart: (c) => S(c, `<path d="M32 52C18 42 10 34 10 24c0-7 5-12 11-12 5 0 8 3 11 7 3-4 6-7 11-7 6 0 11 5 11 12 0 10-8 18-22 28z" fill="${c}"/>`, 2),
  bell: (c) => S(c, `<path d="M18 44V30a14 14 0 0 1 28 0v14l4 6H14z"/><path d="M27 54a5 5 0 0 0 10 0"/>`),
  cafe: (c) => S(c, `<path d="M12 22h34v16a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z"/><path d="M46 26h4a6 6 0 0 1 0 12h-5"/><path d="M22 8v6M30 8v6M38 8v6"/>`),
  pin: (c) => S(c, `<path d="M32 56s18-17 18-30a18 18 0 0 0-36 0c0 13 18 30 18 30z"/><circle cx="32" cy="26" r="6"/>`),
  user: (c) => S(c, `<circle cx="32" cy="22" r="10"/><path d="M12 54c2-11 10-17 20-17s18 6 20 17"/>`),
  ko: (c) => S(c, `<path d="M14 16h16c0 10-6 16-16 18M14 44h16v10M40 12v42M40 32h10"/>`),
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
const kv = (id, cmd, label) => `<div id="${id}" class="kv"><code>${cmd}</code><span>${label}</span></div>`;
const pathc = (id, html) => `<div id="${id}" class="pathc">${html}</div>`;

// ===== 1. 인트로 (0:00 ~ 0:38.7) — 원본 화면을 덮는다 ===========================
add({ id: 's-title', layer: 'full', s: 0, e: T(4), html: `
  <div id="st-ph" class="phwrap"><img id="st-img" class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="st-c" class="card titlecard">
    ${pill('st-k', '필로소피 AI 교육 · 교수님들을 위한', C.coral, 'pill-soft')}
    <h1 id="st-h" class="h1 center">${hl('Claude Code', 'var(--hl-p)')}<br>CLI 수업</h1>
    <div id="st-term" class="term"><span class="tprompt">&gt;</span><span id="st-tt">claude</span><span id="st-cur" class="tcur"></span></div>
    <div id="st-s" class="ep"><b>2편</b><span>기초</span></div>
  </div>`, anim: `
  tl.fromTo('#st-ph', {opacity:0, y:220}, {opacity:1, y:0, duration:.8, ease:'back.out(1.4)'}, .15);
  rise('#st-c', .3); up('#st-k', .55, 16); up('#st-h', .7, 34); sweep('#st-h .hl', 1.35);
  up('#st-term', ${f(T(2))}, 20); type('#st-tt', 'claude', ${f(T(2) + 0.25)}, .6); blink('#st-cur', ${f(T(2))}, ${f(T(4))});
  pop('#st-s', ${f(T(2, 1.0))});` });

add({ id: 's-room', layer: 'full', s: T(4), e: T(8), html: `
  <div id="sr-q" class="center-col" style="top:400px">
    <h2 id="sr-qh" class="h2 big">왜 ${hl('기초편', 'var(--hl-p)')}부터 할까요?</h2>
  </div>
  <div class="center-col" style="top:110px">
    ${pill('sr-k', '왜 기초편부터 할까요?', C.lav, 'pill-soft')}
    <h2 id="sr-h" class="h2">Claude Code는 ${hl('터미널을 연 폴더', 'var(--hl-y)')}를<br>자기 작업실로 생각해요</h2>
  </div>
  <div class="inside" style="top:470px">
    <div id="sr-term" class="card ibox">
      ${ico('sr-ti', 'terminal', '#ffffff', '#34314a')}
      <div class="ibl">터미널 실행</div>
    </div>
    ${arrowR('sr-a1')}
    <div id="sr-fold" class="card ibox big">
      <div class="fold">${ICON.folder('#e7a92c')}<div id="sr-cl" class="clin">${ico('sr-ci', 'sparkle', C.coral, BG.peach, 'xs')}</div></div>
      <div class="ibl">그 폴더 = 작업실</div>
    </div>
    ${arrowR('sr-a2')}
    <div id="sr-out" class="card ibox">
      <div class="outfiles"><span id="sr-f0" class="fchip">과제.docx</span><span id="sr-f1" class="fchip">논문.md</span><span id="sr-f2" class="fchip">정리.xlsx</span></div>
      <div class="ibl">만든 파일이 여기에</div>
    </div>
  </div>`, anim: `
  up('#sr-q', ${f(T(4, 0.1))}, 30); sweep('#sr-qh .hl', ${f(T(4, 0.7))});
  tl.to('#sr-q', {opacity:0, y:-30, duration:.35, ease:'power2.in'}, ${f(T(5, -0.4))});
  up('#sr-k', ${f(T(5, -0.1))}, 16); up('#sr-h', ${f(T(5, 0))}, 30); sweep('#sr-h .hl', ${f(T(6, 0.2))});
  rise('#sr-term', ${f(T(6, 0))}); pop('#sr-ti', ${f(T(6, 0.2))});
  draw('#sr-a1 path', ${f(T(6, 0.9))}, .4); rise('#sr-fold', ${f(T(6, 1.2))});
  tl.fromTo('#sr-cl', {opacity:0, y:-120, scale:.6}, {opacity:1, y:0, scale:1, duration:.7, ease:'back.out(1.6)'}, ${f(T(7, 0.2))});
  tl.fromTo('#sr-cl', {rotation:0}, {rotation:12, duration:.3, ease:'sine.inOut', yoyo:true, repeat:5, immediateRender:false}, ${f(T(7, 1.0))});
  draw('#sr-a2 path', ${f(T(7, 1.4))}, .4); rise('#sr-out', ${f(T(7, 1.6))});
  pop('#sr-f0', ${f(T(7, 1.9))}); pop('#sr-f1', ${f(T(7, 2.15))}); pop('#sr-f2', ${f(T(7, 2.4))});` });

add({ id: 's-pick', layer: 'full', s: T(8), e: T(13), html: `
  <div class="center-col" style="top:120px">
    <h2 id="sp-h" class="h2">그래서 처음에<br>${hl('작업할 폴더를 지정', 'var(--hl-m)')}해 주는 게 좋아요</h2>
  </div>
  <div class="duo2" style="top:430px">
    <div id="sp-a" class="card dcard" style="height:360px">
      ${ico('sp-ai', 'terminal', '#ffffff', '#34314a')}
      <div class="dt">CLI가 처음이면</div>
      <div class="ds">조금 <b>낯설</b> 수 있어요</div>
    </div>
    <div id="sp-op" class="bigop">→</div>
    <div id="sp-b" class="card dcard glow" style="height:360px">
      ${ico('sp-bi', 'check', '#ffffff', '#3fa877')}
      <div class="dt">하지만</div>
      <div class="ds"><b>어려운 개념은 아니에요</b></div>
    </div>
  </div>`, anim: `
  up('#sp-h', ${f(T(8, 0.1))}, 30); sweep('#sp-h .hl', ${f(T(8, 1.0))});
  rise('#sp-a', ${f(T(9, 0))}); pop('#sp-ai', ${f(T(9, 0.2))});
  pop('#sp-op', ${f(T(11, -0.2))}); rise('#sp-b', ${f(T(11, 0))}); pop('#sp-bi', ${f(T(11, 0.2))});` });

const TODAY = [['folder', C.yellow, BG.yellow, '작업 폴더 지정'], ['terminal', '#ffffff', '#34314a', 'cd · cd .. · mkdir'], ['doc', C.mint, BG.mint, 'claude.md'], ['sparkle', C.lav, BG.lav, '/model · /help']];
add({ id: 's-easy', layer: 'full', s: T(13), e: T(17), html: `
  <div class="center-col" style="top:120px">
    <h2 id="se-h" class="h2">안 해본 건 낯설 뿐,<br>${hl('해보면 어렵지 않아요', 'var(--hl-y)')}</h2>
  </div>
  <div id="se-c" class="card todaycard">
    ${pill('se-k', '오늘 배울 것', C.coral, 'pill-soft')}
    <div class="today">${TODAY.map(([ic, c, b, t], i) => `<div id="se-${i}" class="tditem">${ico(`se-i${i}`, ic, c, b, 'xs')}<span>${t}</span></div>`).join('')}</div>
  </div>`, anim: `
  up('#se-h', ${f(T(13, 0.1))}, 30); sweep('#se-h .hl', ${f(T(16, 0.1))});
  rise('#se-c', ${f(T(14, 0))}); up('#se-k', ${f(T(14, 0.2))}, 14);
  ${TODAY.map((x, i) => `up('#se-${i}', ${f(T(14, 0.5 + i * 0.35))}, 24);`).join(' ')}` });

// ===== 2. 실습 화면 (0:38.7 ~) =================================================
// 2-1. Antigravity IDE 화면 (오른쪽 위가 비어 있음) — 'tr'
add({ id: 'o-s1', s: T(18, 0.1), e: T(23, -0.2), html: `
  <div id="o1-c" class="ovc tr">
    <div class="stephead"><span class="stepn">STEP 1</span><span id="o1-t" class="stept">Antigravity IDE 열기</span></div>
    <div id="o1-d" class="ovs2">오른쪽 <b>AI 에이전트 패널</b>은<br>Claude Code를 쓸 거라 밀어서 닫았어요</div>
  </div>`, anim: `rise('#o1-c', ${f(T(18, 0.15))}); up('#o1-t', ${f(T(18, 0.35))}, 12); up('#o1-d', ${f(T(20, 0.2))}, 12);` });

const stepCard = (id, s, e, step, title, crumbs, extra = '', extraAnim = '', slot = 'tr') => add({ id, s, e, html: `
  <div id="${id}-c" class="ovc ${slot}">
    <div class="stephead"><span class="stepn">STEP ${step}</span><span id="${id}-t" class="stept">${title}</span></div>
    <div class="crumbs">${crumbs.map(([txt], i) => `${i ? `<span id="${id}-g${i}" class="cg">›</span>` : ''}<span id="${id}-b${i}" class="crumb">${txt}</span>`).join('')}</div>
    ${extra}
  </div>`, anim: `rise('#${id}-c', ${f(s + 0.05)}); up('#${id}-t', ${f(s + 0.25)}, 12);
  ${crumbs.map(([, t], i) => `${i ? `pop('#${id}-g${i}', ${f(t - 0.1)}); ` : ''}pop('#${id}-b${i}', ${f(t)});`).join(' ')} ${extraAnim}` });

stepCard('o-s2', T(27), T(40, -0.2), 2, '작업 폴더 지정',
  [['File', T(29, 0.1)], ['Open Folder', T(30, 0.1)], ['새 폴더', T(32, 0.1)], ['Select Folder', T(34, 0.1)]],
  `<div id="o-s2-n" class="namebox"><span>왼쪽 위 폴더명</span><code>261030claude</code></div>`,
  `up('#o-s2-n', ${f(T(38, 0.1))}, 14); ok2('#o-s2-n', ${f(T(39, 0))});`);

stepCard('o-s3', T(40), T(44, -0.2), 3, '터미널 열기',
  [['Terminal', T(41, 0.1)], ['New Terminal', T(42, 0.1)]],
  `<div id="o-s3-n" class="ovs2">아래쪽에 작업할 공간이 열려요</div>`, `up('#o-s3-n', ${f(T(43, 0.1))}, 12);`);

add({ id: 'o-where', s: T(44), e: T(56, -0.2), html: `
  <div id="ow-c" class="ovc tr">
    ${pill('ow-k', '여기를 주목! · 지금 내 위치', C.coral, 'pill-soft pill-sm')}
    ${pathc('ow-p', 'C:\\Users\\user\\<b id="ow-pb">261030claude</b>')}
    <div id="ow-t" class="ovt sm">이 방에서 claude를 시작해야<br>만든 파일이 ${hl('이 방에', 'var(--hl-y)')} 쌓여요</div>
    ${no('ow-n', '더 윗단(user)에서 시작하면 뒤섞여요', 'ok-xs')}
  </div>`, anim: `rise('#ow-c', ${f(T(44, 0.1))}); up('#ow-k', ${f(T(44, 0.3))}, 12); up('#ow-p', ${f(T(45, 0))}, 14);
  tl.fromTo('#ow-pb', {color:'#f4efe6'}, {color:'#ffd27a', duration:.4, ease:'power2.out', immediateRender:false}, ${f(T(47, 0))});
  up('#ow-t', ${f(T(48, 0))}, 14); sweep('#ow-t .hl', ${f(T(50, 0))}); pop('#ow-n', ${f(T(52, 0.2))});` });

add({ id: 'o-key', s: T(56), e: T(64, -0.2), html: `
  <div id="ok-c" class="ovc tr done">
    <div class="row">${ico('ok-i', 'pin', C.coral, BG.peach, 'xs')}<div class="ovt">오늘 제일 중요한 것<br><b>작업할 방(폴더) 지정하기</b></div></div>
    <div id="ok-s" class="ovs2">File › Open Folder 로 지정 → 터미널에 <b>claude</b> 입력</div>
  </div>`, anim: `rise('#ok-c', ${f(T(56, 0.1))}); pop('#ok-i', ${f(T(56, 0.3))}); up('#ok-s', ${f(T(59, 0.1))}, 12);` });

// 2-2. PowerShell · 터미널 구간부터 — 왼쪽 Explorer 아래 빈 칸 'lane'
add({ id: 'o-ps', s: T(64, 0.2), e: T(78, -0.2), html: `
  <div id="op-c" class="ovc lane">
    ${pill('op-k', 'PowerShell · Mac 터미널', C.sky, 'pill-soft pill-sm')}
    ${pathc('op-p', 'C:\\Users\\user&gt;')}
    <div id="op-t" class="ovs2">지금 위치 = <b>user 폴더</b><br>파일이 아주 많은 곳이에요</div>
    ${no('op-n', '여기서 바로 claude', 'ok-xs')}
  </div>`, anim: `rise('#op-c', ${f(T(64, 0.3))}); up('#op-k', ${f(T(64, 0.5))}, 12); up('#op-p', ${f(T(66, 0))}, 14); up('#op-t', ${f(T(68, 0))}, 12); pop('#op-n', ${f(T(70, 0.1))});` });

add({ id: 'o-exit', s: T(78), e: T(82, -0.2), html: `
  <div id="ox-c" class="ovc lane">
    <div id="ox-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code>/exit</code></div>
    <div id="ox-s" class="ovs2">Claude Code에서 <b>나가기</b></div>
  </div>`, anim: `rise('#ox-c', ${f(T(78, 0.1))}); up('#ox-cmd', ${f(T(78, 0.3))}, 12); up('#ox-s', ${f(T(78, 0.6))}, 12);` });

add({ id: 'o-mkdir', s: T(83), e: T(92, -0.2), html: `
  <div id="om-c" class="ovc lane">
    <div class="stephead"><span class="stepn">명령어 1</span><span class="stept">폴더 만들기</span></div>
    <div id="om-cmd" class="bigcmd"><code>mkdir <i>폴더명</i></code></div>
    <div id="om-e" class="ovs2">예) mkdir <b>261030claude2</b><br>mkdir 다음에 <b>한 칸 띄우기</b></div>
    ${ok('om-ok', '폴더명은 숫자 + 영어로', 'ok-xs')}
  </div>`, anim: `rise('#om-c', ${f(T(83, 0.1))}); up('#om-cmd', ${f(T(84, 0))}, 14); up('#om-e', ${f(T(85, 0.1))}, 12); pop('#om-ok', ${f(T(89, 0.1))});` });

add({ id: 'o-cd', s: T(92), e: T(103, -0.2), html: `
  <div id="od-c" class="ovc lane">
    <div class="stephead"><span class="stepn">명령어 2</span><span class="stept">폴더 들어가기</span></div>
    <div id="od-cmd" class="bigcmd"><code>cd <i>폴더명</i></code></div>
    <div id="od-e" class="ovs2">예) cd <b>261030claude2</b></div>
    <div id="od-n" class="nextrow"><span>그 다음</span><code>claude</code></div>
    <div id="od-s" class="ovs2">→ 만든 파일이 이 폴더로!</div>
  </div>`, anim: `rise('#od-c', ${f(T(92, 0.1))}); up('#od-cmd', ${f(T(92, 0.4))}, 14); up('#od-e', ${f(T(93, 0.2))}, 12); pop('#od-n', ${f(T(98, 0.1))}); up('#od-s', ${f(T(100, 0.1))}, 12);` });

add({ id: 'o-out', s: T(105), e: T(114, -0.2), html: `
  <div id="oo-c" class="ovc lane">
    ${pill('oo-k', '나왔다 · 들어갔다', C.lav, 'pill-soft pill-sm')}
    ${kv('oo-1', 'cd ..', '밖으로 나오기')}
    ${kv('oo-2', 'cd 폴더명', '다시 들어가기')}
  </div>`, anim: `rise('#oo-c', ${f(T(105, 0.1))}); up('#oo-k', ${f(T(105, 0.3))}, 12); slide('#oo-1', ${f(T(106, 0.1))}, -30); slide('#oo-2', ${f(T(109, 0.1))}, -30);` });

const MK3 = [['01practice', '실습', 121], ['02foldercleanup', '폴더 정리', 128], ['03auto', '자동화', 135]];
add({ id: 'o-mk3', s: T(119), e: T(148, -0.2), html: `
  <div id="o3-c" class="ovc lane">
    ${pill('o3-k', '다음 시간을 위한 폴더 3개', C.mint, 'pill-soft pill-sm')}
    <div class="series">${MK3.map(([n, d], i) => `<div id="o3-${i}" class="fitem">${ico(`o3-i${i}`, 'folder', C.yellow, BG.yellow, 'xxs')}<span class="fn"><code>${n}</code><small>${d}</small></span><span id="o3-t${i}" class="tick">${ICON.check('#ffffff')}</span></div>`).join('')}</div>
  </div>`, anim: `rise('#o3-c', ${f(T(119, 0.1))}); up('#o3-k', ${f(T(119, 0.3))}, 12);
  ${MK3.map((x, i) => `slide('#o3-${i}', ${f(T(x[2], 0))}, -30);`).join(' ')}
  ${MK3.map((x, i) => `pop('#o3-t${i}', ${f(T(141, 0.1 + i * 0.2))});`).join(' ')}` });

add({ id: 'o-plus', s: T(148), e: T(168, -0.2), html: `
  <div id="ou-c" class="ovc lane">
    ${pill('ou-k', '명령어 대신 마우스로도 OK', C.coral, 'pill-soft pill-sm')}
    <div id="ou-d" class="ovs2">폴더명에 마우스를 올리면<br><b>+ 버튼</b>이 나와요</div>
    <div class="ovrow">
      <div id="ou-f" class="mbtn">${ICON.doc(C.sky)}<span>① 새 파일</span></div>
      <div id="ou-g" class="mbtn">${ICON.folder(C.yellow)}<span>② 새 폴더</span></div>
    </div>
  </div>`, anim: `rise('#ou-c', ${f(T(148, 0.1))}); up('#ou-k', ${f(T(148, 0.3))}, 12); up('#ou-d', ${f(T(151, 0.1))}, 12);
  pop('#ou-f', ${f(T(153, 0.1))}); pop('#ou-g', ${f(T(153, 0.3))});
  tl.to('#ou-g', {backgroundColor:'#fff4d6', boxShadow:'inset 0 0 0 3px #f2c75c', duration:.35, ease:'power2.out'}, ${f(T(164, 0))});
  tl.to('#ou-f', {backgroundColor:'#e6f0ff', boxShadow:'inset 0 0 0 3px #8fb6ee', duration:.35, ease:'power2.out'}, ${f(T(165, 0))});` });

add({ id: 'o-nest', s: T(172), e: T(181, -0.2), html: `
  <div id="on-c" class="ovc lane">
    <div id="on-cmd" class="bigcmd sm"><code>cd 01practice</code></div>
    <div class="nest">
      <div id="on-1" class="nrow">${ICON.folder(C.yellow)}<span>261030claude</span></div>
      <div id="on-2" class="nrow in">${ICON.folder(C.coral)}<span><b>01practice</b></span><em>지금 여기</em></div>
    </div>
    <div id="on-s" class="ovs2">폴더 안의 폴더로 들어갔어요</div>
  </div>`, anim: `rise('#on-c', ${f(T(172, 0.1))}); up('#on-cmd', ${f(T(173, 0))}, 12); slide('#on-1', ${f(T(176, 0))}, -24); slide('#on-2', ${f(T(177, 0))}, -24); up('#on-s', ${f(T(177, 0.6))}, 12);` });

add({ id: 'o-cheat', s: T(186), e: T(199, -0.2), html: `
  <div id="oc-c" class="ovc lane">
    ${pill('oc-k', '이 정도만 알면 충분해요', C.lav, 'pill-soft pill-sm')}
    ${kv('oc-1', 'cd ..', '나오기')}
    ${kv('oc-2', 'cd 폴더명', '들어가기')}
    ${kv('oc-3', 'mkdir 폴더명', '만들기')}
  </div>`, anim: `rise('#oc-c', ${f(T(186, 0.1))}); up('#oc-k', ${f(T(186, 0.3))}, 12); slide('#oc-1', ${f(T(190, 0))}, -30); slide('#oc-2', ${f(T(191, 0))}, -30); slide('#oc-3', ${f(T(193, 0.1))}, -30);` });

add({ id: 'o-claude', s: T(199), e: T(207, -0.2), html: `
  <div id="ol-c" class="ovc lane">
    <div class="stephead"><span class="stepn">START</span><span class="stept">Claude 부르기</span></div>
    <div id="ol-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code id="ol-tt">claude</code><span id="ol-cur" class="tcur"></span></div>
    <div id="ol-s" class="ovs2">01practice 안에서 시작<br>MCP 질문 → 일단 <b>없이</b> 시작</div>
  </div>`, anim: `rise('#ol-c', ${f(T(199, 0.1))}); up('#ol-cmd', ${f(T(201, 0))}, 12); type('#ol-tt', 'claude', ${f(T(201, 0.3))}, .6); blink('#ol-cur', ${f(T(201, 0))}, ${f(T(203, 0))}); up('#ol-s', ${f(T(203, 0.1))}, 12);` });

add({ id: 'o-md', s: T(210), e: T(223, -0.2), html: `
  <div id="oh-c" class="ovc lane">
    <div class="ovhead">${ico('oh-i', 'doc', C.mint, BG.mint, 'xxs')}<code class="mdname">claude.md</code></div>
    <div id="oh-t" class="ovt">Claude에게는<br>${hl('헌법', 'var(--hl-p)')}과도 같은 파일</div>
    ${ok('oh-1', '작업 전에 꼭 읽어요', 'ok-xs')}
    <div id="oh-2" class="ovs2">내가 <b>어떤 사람</b>인지,<br><b>무엇이 필요한지</b> 적어 두기</div>
  </div>`, anim: `rise('#oh-c', ${f(T(210, 0.1))}); pop('#oh-i', ${f(T(211, 0))}); up('#oh-t', ${f(T(212, 0))}, 14); sweep('#oh-t .hl', ${f(T(212, 0.6))}); pop('#oh-1', ${f(T(214, 0.1))}); up('#oh-2', ${f(T(215, 0.1))}, 12);` });

add({ id: 'o-prompt', s: T(223), e: T(237, -0.2), html: `
  <div id="oq-c" class="ovc lane">
    ${pill('oq-k', 'claude.md 만들기 · 예시', C.coral, 'pill-soft pill-sm')}
    <div id="oq-1" class="qrow"><span class="qk">나</span><span>교육학과 교수</span></div>
    <div id="oq-2" class="qrow"><span class="qk">할 일</span><span>과제 · 논문 작성</span></div>
    <div id="oq-3" class="qrow"><span class="qk">톤</span><span>부드럽고 프로페셔널</span></div>
    <div id="oq-s" class="ovs2">한국어로 그대로 써도 돼요</div>
  </div>`, anim: `rise('#oq-c', ${f(T(223, 0.1))}); up('#oq-k', ${f(T(223, 0.3))}, 12); slide('#oq-1', ${f(T(226, 0))}, -30); slide('#oq-2', ${f(T(228, 0))}, -30); slide('#oq-3', ${f(T(233, 0))}, -30); up('#oq-s', ${f(T(235, 0))}, 12);` });

add({ id: 'o-made', s: T(237), e: T(253, -0.2), html: `
  <div id="oa-c" class="ovc lane done">
    <div class="row">${ico('oa-i', 'check', '#ffffff', '#3fa877', 'xs')}<div class="ovt"><b>CLAUDE.md</b><br>완성!</div></div>
    <div class="crumbs"><span id="oa-b0" class="crumb">01practice</span><span id="oa-g" class="cg">›</span><span id="oa-b1" class="crumb">CLAUDE.md</span></div>
    <div id="oa-s" class="ovs2">사용자 소개 · 할 일 · 톤<br>Claude가 따를 <b>기본 지침</b></div>
  </div>`, anim: `rise('#oa-c', ${f(T(237, 0.1))}); tl.fromTo('#oa-i', {opacity:0, scale:.3, rotation:-90}, {opacity:1, scale:1, rotation:0, duration:.6, ease:'back.out(2)'}, ${f(T(237, 0.3))});
  up('#oa-s', ${f(T(244, 0))}, 12); pop('#oa-b0', ${f(T(248, 0))}); pop('#oa-g', ${f(T(248, 0.2))}); pop('#oa-b1', ${f(T(249, 0))}); confetti('oa', ${f(T(249, 0.3))});` });

add({ id: 'o-ide', s: T(255), e: T(260, -0.2), html: `
  <div id="oi-c" class="ovc lane">
    ${pill('oi-k', 'IDE를 쓰는 이유', C.lav, 'pill-soft pill-sm')}
    <div id="oi-t" class="ovt sm">Claude가 만든 파일을<br>${hl('눈으로 바로', 'var(--hl-y)')} 확인해요</div>
  </div>`, anim: `rise('#oi-c', ${f(T(255, 0.1))}); up('#oi-k', ${f(T(255, 0.3))}, 12); up('#oi-t', ${f(T(256, 0.1))}, 14); sweep('#oi-t .hl', ${f(T(257, 0.2))});` });

add({ id: 'o-promise', s: T(262), e: T(270, -0.2), html: `
  <div id="or-c" class="ovc lane">
    ${pill('or-k', 'Claude의 장점', C.coral, 'pill-soft pill-sm')}
    <div id="or-1" class="flow"><span class="fnum">1</span><span>사용자와 <b>약속</b>을 잘 세팅</span></div>
    <div id="or-2" class="flow"><span class="fnum">2</span><span>약속에 <b>기반해서</b> 답해요</span></div>
    ${ok('or-ok', '만족스러운 결과', 'ok-xs')}
  </div>`, anim: `rise('#or-c', ${f(T(262, 0.1))}); up('#or-k', ${f(T(262, 0.3))}, 12); slide('#or-1', ${f(T(263, 0.1))}, -30); slide('#or-2', ${f(T(265, 0))}, -30); pop('#or-ok', ${f(T(266, 0.3))});` });

const MODELS = [['Opus 5.5', C.coral], ['Sonnet 5.5', C.sky], ['Fable 5.1', C.lav], ['Haiku 5.5', C.mint]];
add({ id: 'o-model', s: T(271), e: T(278, -0.2), html: `
  <div id="oy-c" class="ovc lane">
    <div id="oy-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code>/model</code></div>
    <div id="oy-s" class="ovs2">모델을 골라요</div>
    <div class="chips">${MODELS.map(([m, c], i) => `<span id="oy-${i}" class="chip" style="--cc:${c}">${m}</span>`).join('')}</div>
  </div>`, anim: `rise('#oy-c', ${f(T(271, 0.1))}); up('#oy-cmd', ${f(T(271, 0.3))}, 12); up('#oy-s', ${f(T(272, 0.1))}, 12);
  pop('#oy-0', ${f(T(274, 0.3))}); pop('#oy-1', ${f(T(274, 1.6))}); pop('#oy-2', ${f(T(275, 0.1))}); pop('#oy-3', ${f(T(275, 0.9))});` });

add({ id: 'o-plan', s: T(278), e: T(292, -0.2), html: `
  <div id="oz-c" class="ovc lane">
    ${pill('oz-k', '요금제별 모델 고르기', C.yellow, 'pill-soft pill-sm')}
    <div id="oz-1" class="grow"><span class="gk">Pro $20</span><span>→ <b>Sonnet 5.5</b></span></div>
    <div id="oz-2" class="grow"><span class="gk">Pro · 가볍게</span><span>→ <b>Opus 5.5</b></span></div>
    <div id="oz-3" class="grow"><span class="gk">Max</span><span>→ <b>Opus 5.5</b></span></div>
    <div id="oz-w" class="warnrow">${ICON.warn('#c4486c')}<span>토큰이 빨리 닳아요 · 관리하며 쓰기</span></div>
  </div>`, anim: `rise('#oz-c', ${f(T(278, 0.1))}); up('#oz-k', ${f(T(278, 0.3))}, 12); slide('#oz-1', ${f(T(279, 0.2))}, -30); slide('#oz-2', ${f(T(282, 0.3))}, -30); slide('#oz-3', ${f(T(285, 0))}, -30); up('#oz-w', ${f(T(287, 0.2))}, 12);` });

add({ id: 'o-help', s: T(292), e: T(306, -0.2), html: `
  <div id="oe2-c" class="ovc lane">
    <div id="oe2-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code>/help</code></div>
    <div id="oe2-s" class="ovs2">사용할 수 있는 <b>명령어 목록</b></div>
    <div class="chips">
      <span id="oe2-0" class="chip" style="--cc:${C.sky}">General</span>
      <span id="oe2-1" class="chip" style="--cc:${C.coral}">Commands</span>
      <span id="oe2-2" class="chip" style="--cc:${C.lav}">Custom commands</span>
    </div>
  </div>`, anim: `rise('#oe2-c', ${f(T(292, 0.1))}); up('#oe2-cmd', ${f(T(292, 0.3))}, 12); up('#oe2-s', ${f(T(295, 0.1))}, 12);
  pop('#oe2-0', ${f(T(296, 0.1))}); pop('#oe2-1', ${f(T(297, 0.3))}); pop('#oe2-2', ${f(T(299, 0.5))});` });

add({ id: 'o-nl', s: T(306), e: T(320, -0.2), html: `
  <div id="ov-c" class="ovc lane">
    <div class="row">${ico('ov-i', 'chat', C.coral, BG.peach, 'xs')}<div id="ov-t" class="ovt sm">명령어를 다<br>외우지 않아도 돼요</div></div>
    <div id="ov-d" class="ovs2">${hl('자연어(한국어)', 'var(--hl-y)')}로 요청해도<br>Claude가 알아들어요</div>
    ${ok('ov-ok', '부담 없이 CLI 쓰기가 먼저', 'ok-xs')}
  </div>`, anim: `rise('#ov-c', ${f(T(306, 0.1))}); pop('#ov-i', ${f(T(306, 0.3))}); up('#ov-d', ${f(T(309, 0.1))}, 12); sweep('#ov-d .hl', ${f(T(310, 0))}); pop('#ov-ok', ${f(T(315, 0.1))});` });

add({ id: 'o-skill', s: T(320), e: T(334, -0.2), html: `
  <div id="os-c" class="ovc lane">
    ${pill('os-k', 'Custom commands = 스킬', C.lav, 'pill-soft pill-sm')}
    <div id="os-d" class="ovs2">Anthropic 스킬 + <b>내가 만든 스킬</b><br>CLI에서도 그대로 써요</div>
    <div id="os-t" class="ovt sm">자주 하는 반복 작업을<br>${hl('약속', 'var(--hl-p)')}해 둔 것</div>
  </div>`, anim: `rise('#os-c', ${f(T(320, 0.1))}); up('#os-k', ${f(T(320, 0.3))}, 12); up('#os-d', ${f(T(322, 0.1))}, 12); up('#os-t', ${f(T(328, 0))}, 14); sweep('#os-t .hl', ${f(T(328, 0.8))});` });

const GROW = [['자연어(한국어)로 많이', 338], ['명령어 몇 개 더', 341], ['스킬도 불러서', 342]];
add({ id: 'o-grow', s: T(336), e: T(346, -0.2), html: `
  <div id="og-c" class="ovc lane">
    ${pill('og-k', '명령어는 천천히 늘려가요', C.mint, 'pill-soft pill-sm')}
    ${GROW.map(([t], i) => `<div id="og-${i}" class="flow"><span class="fnum">${i + 1}</span><span>${t}</span></div>`).join('')}
  </div>`, anim: `rise('#og-c', ${f(T(336, 0.1))}); up('#og-k', ${f(T(336, 0.3))}, 12); ${GROW.map(([, c], i) => `slide('#og-${i}', ${f(T(c, 0))}, -30);`).join(' ')}` });

// 2-3. 마무리 — 왼쪽에 손그림 필기가 있어서 오른쪽 위 'tr'
add({ id: 'o-sum', s: T(346), e: T(362, -0.2), html: `
  <div id="om2-c" class="ovc tr">
    ${pill('om2-k', '오늘 배운 것', C.coral, 'pill-soft pill-sm')}
    ${kv('om2-1', 'cd 폴더명', '들어가기')}
    ${kv('om2-2', 'cd ..', '나오기')}
    ${kv('om2-3', 'mkdir 폴더명', '만들기')}
    ${ok('om2-ok', '새 작업 = 새 폴더 → 그 안에서 claude', 'ok-xs')}
  </div>`, anim: `rise('#om2-c', ${f(T(346, 0.1))}); up('#om2-k', ${f(T(346, 0.3))}, 12);
  slide('#om2-1', ${f(T(347, 0))}, 30); slide('#om2-2', ${f(T(347, 0.8))}, 30); slide('#om2-3', ${f(T(348, 0.3))}, 30); pop('#om2-ok', ${f(T(359, 0))});` });

// 오로라 아웃트로 위 엔드카드
const END0 = TE(365, 0.4);
add({ id: 'o-end', s: END0, e: DUR, html: `
  <div class="center-col" style="top:250px">
    ${pill('oe-k', '필로소피 AI 교육 · 교수님들을 위한 Claude Code CLI', C.lav, 'pill-glass')}
    <div id="oe-h" class="endbig">2편 · 기초 <span class="endok">완료</span></div>
    <div id="oe-n" class="endnext"><span>다음 편</span><b>3편 · 중급 실습</b><span class="endarr">→</span></div>
  </div>`, anim: `up('#oe-k', ${f(END0 + 0.4)}, 16); up('#oe-h', ${f(END0 + 0.7)}, 30); rise('#oe-n', ${f(END0 + 1.6)});` });

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
  tl.to('#${cv.id}-in', {opacity:0, duration:${cv.fout}, ease:'power2.in'}, ${f(cv.e - cv.fout)});
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
<title>교수님들을 위한 Claude Code CLI 2편 (기초)</title>
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
.pill-sm { font-size: 24px; padding: 10px 20px; gap: 10px; align-self: flex-start; }
.pill-sm .pdot { width: 12px; height: 12px; }
.pill-glass { background: rgba(255, 255, 255, .16); color: #fff; box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .3); }
.pdot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; }
.okpill { display: inline-flex; align-items: center; gap: 16px; padding: 14px 30px 14px 16px; border-radius: 999px; background: #e3f6ec;
  font-size: 34px; font-weight: 750; color: #24533f; box-shadow: 0 10px 24px rgba(60, 140, 100, .14); white-space: nowrap; }
.okc { display: block; width: 48px; height: 48px; border-radius: 50%; background: #3fa877; padding: 7px; }
.okc svg { display: block; width: 100%; height: 100%; }
.nopill { background: #fde8ec; color: #8a3550; box-shadow: 0 10px 24px rgba(200, 80, 110, .12); }
.nopill .okc { background: #e0607f; }
.ok-xs { font-size: 25px; padding: 8px 20px 8px 8px; gap: 12px; align-self: flex-start; }
.ok-xs .okc { width: 36px; height: 36px; padding: 5px; }
.h1 { font-size: 104px; font-weight: 900; line-height: 1.12; letter-spacing: -.035em; word-break: keep-all; }
.h1.center { text-align: center; }
.h2 { font-size: 70px; font-weight: 850; line-height: 1.22; letter-spacing: -.03em; word-break: keep-all; text-align: center; }
.h2.big { font-size: 92px; }
.hl { background-image: linear-gradient(var(--hlc), var(--hlc)); background-repeat: no-repeat; background-position: 0 88%; background-size: 0% 38%; padding: 0 4px; }
.ico { display: flex; align-items: center; justify-content: center; width: 150px; height: 150px; border-radius: 50%; padding: 34px; flex: 0 0 auto;
  box-shadow: 0 12px 26px rgba(120, 92, 80, .12), inset 0 0 0 6px rgba(255, 255, 255, .7); }
.ico svg { display: block; width: 100%; height: 100%; }
.ico.sm { width: 120px; height: 120px; padding: 27px; }
.ico.xs { width: 76px; height: 76px; padding: 17px; }
.ico.xxs { width: 50px; height: 50px; padding: 11px; box-shadow: inset 0 0 0 3px rgba(255, 255, 255, .7); }
.arrow { display: block; width: 90px; height: 24px; flex: 0 0 auto; }
.arrow path { stroke-dasharray: 1; stroke-dashoffset: 1; }
.arrow-sm { width: 70px; }
.tagc { display: inline-block; margin-top: 10px; padding: 8px 20px; border-radius: 999px; background: #eef4ff; box-shadow: inset 0 0 0 2px #cfe0fb; font-size: 26px; font-weight: 800; color: #3d64a8; white-space: nowrap; }

/* title */
.phwrap { position: absolute; left: 110px; top: 170px; width: 480px; }
.phimg { display: block; width: 480px; height: auto; filter: drop-shadow(0 24px 30px rgba(80, 60, 90, .22)); }
.titlecard { left: 660px; top: 130px; width: 1120px; display: flex; flex-direction: column; align-items: center; gap: 30px; padding: 56px 60px 60px; }
.term { display: flex; align-items: center; gap: 16px; min-width: 420px; padding: 18px 30px; border-radius: 20px; background: #2c2a3d;
  font-family: Consolas, "Courier New", monospace; font-size: 40px; font-weight: 700; color: #f4efe6; box-shadow: 0 14px 30px rgba(44, 42, 61, .3); }
.tprompt { color: #ef8a6f; }
.tcur { display: inline-block; width: 18px; height: 40px; background: #f4efe6; }
.ep { display: flex; align-items: center; gap: 18px; padding: 14px 34px; border-radius: 999px; background: #ffe6dc; font-size: 40px; font-weight: 700; color: #9a4f35; }
.ep b { font-weight: 900; color: #d0603f; }

/* roadmap */
.road { position: absolute; left: 0; right: 0; top: 400px; display: flex; justify-content: center; align-items: center; gap: 22px; }
.rcard { position: relative; width: 330px; height: 330px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: rgba(255, 255, 255, .95); border-radius: 40px; box-shadow: 0 24px 56px rgba(80, 60, 70, .16); }
.rcard.first { box-shadow: 0 0 0 8px rgba(255, 199, 180, .55), 0 26px 60px rgba(239, 138, 111, .25); }
.rn { font-size: 32px; font-weight: 850; letter-spacing: .04em; }
.rt { font-size: 50px; font-weight: 900; letter-spacing: -.03em; }
.rarrow { width: 56px; }
.nowtag { position: absolute; top: -26px; right: -14px; padding: 8px 22px; border-radius: 999px; background: #e7a92c; color: #fff; font-size: 28px; font-weight: 850; }

/* duo cards */
.duo2 { position: absolute; left: 0; right: 0; top: 220px; display: flex; justify-content: center; align-items: center; gap: 46px; }
.dcard { position: relative; width: 640px; height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; padding: 30px; }
.dcard.glow { box-shadow: 0 0 0 10px rgba(255, 228, 160, .6), 0 30px 70px rgba(231, 169, 44, .22); }
.dt { font-size: 52px; font-weight: 750; letter-spacing: -.03em; }
.dt b { font-weight: 900; }
.ds { font-size: 32px; font-weight: 600; color: var(--ink-soft); text-align: center; line-height: 1.3; }
.bigop { font-size: 70px; font-weight: 900; color: #c9a8e8; }
.bigop.vs { font-size: 54px; color: #7d62c0; }
.meter { width: 460px; height: 30px; border-radius: 999px; background: #f3eee4; overflow: hidden; }
.mfill { display: block; height: 100%; width: 0%; border-radius: 999px; background: linear-gradient(90deg, #ffd27a, #ef8a6f); }
.ribbon { position: absolute; left: -22px; top: 28px; padding: 10px 26px; border-radius: 14px; background: #ef8a6f; color: #fff; font-size: 34px; font-weight: 900; box-shadow: 0 10px 22px rgba(239, 138, 111, .35); }
.bars { left: 410px; top: 680px; width: 1100px; padding: 26px 46px; border-radius: 34px; display: flex; flex-direction: column; gap: 14px; }
.bhead { font-size: 26px; font-weight: 800; color: var(--ink-soft); letter-spacing: .08em; }
.brow { display: flex; align-items: center; gap: 22px; }
.bl { width: 200px; font-size: 30px; font-weight: 700; }
.bl b { font-weight: 900; }
.btrack { flex: 1 1 auto; height: 26px; border-radius: 999px; background: #f2eff6; overflow: hidden; }
.bfill { display: block; height: 100%; width: 0%; border-radius: 999px; }
.bmax { font-size: 28px; font-weight: 900; color: #d0603f; }

/* list of pros */
.listcard { left: 330px; top: 80px; width: 1260px; padding: 50px 64px; display: flex; flex-direction: column; gap: 26px; }
.listcard .pill { align-self: flex-start; }
.plist { display: flex; flex-direction: column; gap: 18px; }
.pro { display: flex; align-items: center; gap: 26px; padding: 14px 26px; border-radius: 28px; background: #faf8fd; box-shadow: inset 0 0 0 2px #efebf5; }
.pnum { font-size: 40px; font-weight: 900; width: 30px; text-align: center; }
.ptxt { font-size: 42px; font-weight: 600; letter-spacing: -.02em; }
.ptxt b { font-weight: 900; }

/* inside folder */
.inside { position: absolute; left: 0; right: 0; top: 400px; display: flex; justify-content: center; align-items: center; gap: 30px; }
.ibox { position: relative; width: 400px; height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
.ibox.big { width: 460px; height: 420px; }
.ibl { font-size: 38px; font-weight: 850; }
.stamp { position: absolute; right: 40px; top: 40px; width: 74px; height: 74px; border-radius: 50%; background: #e0607f; padding: 14px; box-shadow: 0 10px 22px rgba(224, 96, 127, .35); }
.stamp svg { display: block; width: 100%; height: 100%; }
.fold { position: relative; width: 220px; height: 200px; }
.fold > svg { display: block; width: 100%; height: 100%; }
.clin { position: absolute; left: 72px; top: 70px; }
.outfiles { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.fchip { display: inline-block; padding: 10px 24px; border-radius: 16px; background: #f1f8f4; box-shadow: inset 0 0 0 2px #cfeedd; font-size: 30px; font-weight: 750; color: #2d6b51; }

/* more + quote */
.burst { display: flex; gap: 26px; margin-top: 10px; }
.quote { left: 360px; top: 480px; width: 1200px; padding: 40px 70px 46px; display: flex; flex-direction: column; gap: 12px; }
.qmark { position: absolute; right: 54px; top: -10px; font-size: 200px; line-height: 1; font-weight: 900; color: #f6dccf; }
.qpre { font-size: 32px; font-weight: 600; color: var(--ink-soft); }
.qbody { font-size: 62px; font-weight: 900; line-height: 1.25; letter-spacing: -.03em; }

/* plans */
.plans { position: absolute; left: 0; right: 0; top: 380px; display: flex; justify-content: center; gap: 60px; }
.plan { position: relative; width: 460px; height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
.plan .ok-xs { align-self: center; font-size: 30px; }
.plan.hot { box-shadow: 0 0 0 10px rgba(255, 199, 180, .55), 0 30px 70px rgba(239, 138, 111, .25); }
.pname { font-size: 44px; font-weight: 900; color: var(--ink-soft); letter-spacing: .02em; }
.pprice { font-size: 64px; font-weight: 700; }
.pprice b { font-size: 96px; font-weight: 900; color: #d0603f; }

/* warnings */
.warns { position: absolute; left: 0; right: 0; top: 210px; display: flex; justify-content: center; gap: 50px; }
.wcard { position: relative; width: 700px; height: 560px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; padding: 40px; }
.wnum { position: absolute; left: 34px; top: 26px; width: 66px; height: 66px; border-radius: 50%; background: #ffe3ea; color: #c4486c; font-size: 38px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.wicons { display: flex; gap: 20px; }
.wt { font-size: 46px; font-weight: 700; line-height: 1.3; text-align: center; letter-spacing: -.02em; }
.wt b { font-weight: 900; color: #c4486c; }
.ws { font-size: 30px; font-weight: 700; color: var(--ink-soft); text-align: center; }

/* overlay cards on the practice screen */
.ovc { position: absolute; display: flex; flex-direction: column; gap: 16px; padding: 26px 32px; border-radius: 30px; background: rgba(255, 255, 255, .97);
  box-shadow: 0 22px 50px rgba(30, 24, 40, .32), inset 0 0 0 2px #f3ebe2; }
.ovc.row { flex-direction: row; align-items: center; gap: 22px; }
.ovc.lowleft { left: 70px; top: 610px; max-width: 780px; }
.ovc.side { right: 50px; top: 340px; width: 540px; }
.ovc.side.wide { width: 780px; }
.ovc.done { box-shadow: 0 22px 50px rgba(30, 24, 40, .32), inset 0 0 0 3px #9fdcbc; }
.ovt { display: block; font-size: 36px; font-weight: 650; line-height: 1.28; letter-spacing: -.02em; word-break: keep-all; }
.ovt b { font-weight: 900; }
.ovs { display: block; margin-top: 6px; font-size: 24px; font-weight: 600; color: var(--ink-soft); }
.ovs2 { font-size: 26px; font-weight: 600; color: var(--ink-soft); line-height: 1.35; }
.ovs2 b { color: var(--ink); font-weight: 850; }
.ovbig { font-size: 50px; font-weight: 650; letter-spacing: -.03em; }
.ovbig b { font-weight: 900; color: #7d62c0; }
.ovhead { display: flex; align-items: center; gap: 18px; }
.abbr { padding: 6px 18px; border-radius: 14px; color: #fff; font-size: 40px; font-weight: 900; letter-spacing: .04em; }
.full { font-size: 30px; font-weight: 500; color: var(--ink-soft); }
.full b { font-weight: 900; color: var(--ink); }
.ovd { font-size: 36px; font-weight: 700; letter-spacing: -.02em; }
.ovrow { display: flex; gap: 12px; flex-wrap: wrap; }
.row { display: flex; align-items: center; gap: 18px; }
.cmdrow { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 18px; background: #2c2a3d; }
.cmdrow code { font-family: Consolas, "Courier New", monospace; font-size: 20px; font-weight: 700; color: #f4efe6; min-width: 0; word-break: break-all; }
.os { flex: 0 0 auto; padding: 4px 14px; border-radius: 10px; background: #e9e4f7; color: #5a4aa8; font-size: 22px; font-weight: 850; }
.os.win { background: #dceaff; color: #2f5fa8; }
.stephead { display: flex; align-items: center; gap: 16px; }
.stepn { padding: 6px 16px; border-radius: 12px; background: #d2603f; color: #fff; font-size: 24px; font-weight: 900; letter-spacing: .06em; }
.stept { font-size: 38px; font-weight: 900; letter-spacing: -.03em; }
.crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.crumb { padding: 8px 18px; border-radius: 14px; background: #f4f1fa; box-shadow: inset 0 0 0 2px #e4def0; font-size: 26px; font-weight: 800; white-space: nowrap; }
.cg { font-size: 30px; font-weight: 900; color: #b4a9d3; }
.namebox { display: flex; align-items: center; gap: 14px; padding: 10px 16px; border-radius: 16px; background: #fff7ee; box-shadow: inset 0 0 0 2px #f6e2cc; font-size: 24px; font-weight: 700; color: var(--ink-soft); align-self: flex-start; }
.namebox code { font-family: Consolas, "Courier New", monospace; font-size: 28px; font-weight: 700; color: #9a4f35; }
.bigcmd { display: flex; align-items: center; gap: 14px; padding: 14px 24px; border-radius: 18px; background: #2c2a3d; align-self: flex-start;
  font-family: Consolas, "Courier New", monospace; font-size: 40px; font-weight: 700; color: #f4efe6; }
.bigcmd code { font-family: inherit; }
.bigcmd .tcur { height: 34px; width: 16px; }
.rolelist { display: flex; flex-direction: column; gap: 10px; }
.role { display: flex; align-items: center; gap: 14px; font-size: 28px; font-weight: 800; }
.series { display: flex; flex-direction: column; gap: 12px; }
.sitem { position: relative; display: flex; align-items: center; gap: 18px; padding: 14px 20px; border-radius: 20px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; }
.sitem.done { background: #f0faf5; box-shadow: inset 0 0 0 2px #bfe6d1; }
.sn { font-size: 26px; font-weight: 900; color: #7d62c0; width: 50px; }
.st { display: flex; flex-direction: column; gap: 2px; font-size: 32px; }
.st b { font-weight: 900; }
.st small { font-size: 22px; font-weight: 600; color: var(--ink-soft); }
.tick { position: absolute; right: 18px; top: 50%; margin-top: -21px; display: block; width: 42px; height: 42px; border-radius: 50%; background: #3fa877; padding: 7px; }
.tick svg { display: block; width: 100%; height: 100%; }
.subrow { position: absolute; right: 50px; top: 330px; display: flex; align-items: center; gap: 12px; padding: 14px 26px; border-radius: 999px; background: rgba(255, 255, 255, .97);
  box-shadow: 0 22px 50px rgba(30, 24, 40, .32); font-size: 30px; font-weight: 850; }
.cf { position: absolute; display: block; width: 14px; height: 14px; border-radius: 3px; opacity: 0; }

/* episode 2 — card slots + pieces */
.ovc.tr { right: 50px; top: 74px; width: 540px; gap: 14px; padding: 24px 28px; }
.ovc.lane { left: 46px; top: 520px; width: 380px; gap: 12px; padding: 22px 24px; border-radius: 26px; }
.ovc.lane .pill-sm { font-size: 22px; padding: 8px 16px; }
.ovc.lane .stept { font-size: 32px; }
.ovc.lane .stepn { font-size: 20px; padding: 5px 12px; }
.ovc.lane .ovt { font-size: 32px; }
.ovc.lane .ovs2 { font-size: 24px; }
.ovc.lane .ok-xs { font-size: 22px; white-space: normal; }
.ovt.sm { font-size: 30px; }
.ovc .ok-xs { white-space: normal; }
.pathc { align-self: flex-start; padding: 10px 16px; border-radius: 14px; background: #2c2a3d; color: #f4efe6;
  font-family: Consolas, "Courier New", monospace; font-size: 26px; font-weight: 700; }
.pathc b { font-weight: 700; color: #f4efe6; }
.bigcmd i { font-style: normal; color: #ffd27a; }
.bigcmd.sm { font-size: 32px; }
.ovc.lane .bigcmd { font-size: 34px; padding: 12px 20px; }
.nextrow { display: flex; align-items: center; gap: 12px; align-self: flex-start; font-size: 24px; font-weight: 800; color: var(--ink-soft); }
.nextrow code { padding: 6px 16px; border-radius: 12px; background: #2c2a3d; color: #f4efe6; font-family: Consolas, "Courier New", monospace; font-size: 28px; font-weight: 700; }
.kv { display: flex; align-items: center; gap: 14px; padding: 8px 10px; border-radius: 16px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; }
.kv code { flex: 0 0 auto; padding: 6px 14px; border-radius: 12px; background: #2c2a3d; color: #f4efe6; font-family: Consolas, "Courier New", monospace; font-size: 26px; font-weight: 700; }
.kv span { font-size: 26px; font-weight: 850; }
.fitem { position: relative; display: flex; align-items: center; gap: 12px; padding: 10px 58px 10px 14px; border-radius: 18px; background: #fbf8ef; box-shadow: inset 0 0 0 2px #f1e7cc; }
.fn { display: flex; flex-direction: column; gap: 2px; }
.fn code { font-family: Consolas, "Courier New", monospace; font-size: 24px; font-weight: 700; color: var(--ink); }
.fn small { font-size: 20px; font-weight: 700; color: var(--ink-soft); }
.fitem .tick { width: 36px; height: 36px; margin-top: -18px; right: 14px; padding: 6px; }
.mbtn { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 16px; background: #f8f6fb; box-shadow: inset 0 0 0 2px #ece8f3; font-size: 24px; font-weight: 850; }
.mbtn svg { display: block; width: 34px; height: 34px; }
.nest { display: flex; flex-direction: column; gap: 8px; }
.nrow { display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 700; }
.nrow svg { display: block; width: 34px; height: 34px; }
.nrow.in { margin-left: 34px; padding: 6px 12px; border-radius: 14px; background: #fff1ea; box-shadow: inset 0 0 0 2px #f6cdbd; }
.nrow em { font-style: normal; font-size: 18px; font-weight: 850; color: #fff; background: #ef8a6f; padding: 3px 10px; border-radius: 999px; }
.mdname { font-family: Consolas, "Courier New", monospace; font-size: 34px; font-weight: 700; color: #2d6b51; }
.qrow { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 750; }
.qk { flex: 0 0 auto; min-width: 72px; text-align: center; padding: 4px 10px; border-radius: 10px; background: #ffe6dc; color: #9a4f35; font-size: 20px; font-weight: 900; }
.flow { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 650; }
.flow b { font-weight: 900; }
.fnum { flex: 0 0 auto; width: 36px; height: 36px; border-radius: 50%; background: #ebe6ff; color: #7d62c0; font-size: 22px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 6px 14px; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 2px var(--cc); color: var(--ink); font-size: 23px; font-weight: 850; white-space: nowrap; }
.grow { display: flex; align-items: center; gap: 10px; font-size: 25px; font-weight: 650; }
.grow b { font-weight: 900; }
.gk { flex: 0 0 auto; min-width: 128px; padding: 4px 10px; border-radius: 10px; background: #fff1cc; color: #8a6414; font-size: 20px; font-weight: 900; text-align: center; }
.warnrow { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 14px; background: #fde8ec; color: #8a3550; font-size: 21px; font-weight: 800; }
.warnrow svg { display: block; flex: 0 0 auto; width: 30px; height: 30px; }
.todaycard { left: 360px; top: 470px; width: 1200px; padding: 40px 50px; display: flex; flex-direction: column; gap: 26px; }
.todaycard .pill { align-self: flex-start; }
.today { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.tditem { display: flex; align-items: center; gap: 20px; padding: 14px 22px; border-radius: 26px; background: #faf8fd; box-shadow: inset 0 0 0 2px #efebf5; font-size: 40px; font-weight: 850; letter-spacing: -.02em; }

/* end card over the aurora */
.endbig { font-size: 110px; font-weight: 900; letter-spacing: -.04em; color: #fff; text-shadow: 0 10px 40px rgba(0, 0, 0, .45); }
.endok { color: #9ff0c8; }
.endnext { display: flex; align-items: center; gap: 22px; padding: 22px 44px; border-radius: 999px; background: rgba(255, 255, 255, .95); box-shadow: 0 24px 60px rgba(0, 0, 0, .35);
  font-size: 34px; font-weight: 650; color: var(--ink-soft); }
.endnext b { font-size: 48px; font-weight: 900; color: var(--ink); }
.endarr { font-size: 44px; font-weight: 900; color: #ef8a6f; }
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
  const type = (sel, text, t, d) => {
    const el = document.querySelector(sel); const st = { n: 0 };
    tl.fromTo(st, { n: 0 }, { n: text.length, duration: d, ease: 'none', onUpdate: () => { el.textContent = text.slice(0, Math.round(st.n)); } }, t);
  };
  const blink = (sel, t0, t1) => {
    const cyc = .9, n = Math.max(0, Math.floor((t1 - t0) / cyc) - 1);
    tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: cyc / 2, ease: 'steps(1)', yoyo: true, repeat: n * 2 + 1, immediateRender: false }, t0);
  };
  const confetti = (pre, t) => {
    const host = document.getElementById(pre + '-c'); const cols = ['#ef8a6f', '#e7a92c', '#4fb489', '#9a8be6', '#e8708f', '#6aa3e6'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span'); p.className = 'cf'; p.style.background = cols[i % 6];
      p.style.left = '60px'; p.style.top = '60px'; host.appendChild(p);
      const a = (i / 18) * Math.PI * 2, r = 90 + (i % 4) * 30;
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
