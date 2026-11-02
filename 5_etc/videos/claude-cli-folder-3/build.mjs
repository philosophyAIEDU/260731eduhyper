import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 교수님들을 위한 Claude Code CLI 3편 (폴더 정리 실습) — generator for index.html.
//
// Picture + sound: assets/media/src.mp4 (원본 녹화, 하단에 검정 박스 자막이 이미 박혀 있음 — 그대로 둔다)
// 사용자 요청: 실습 화면과 검정 자막은 그대로, 포인트에만 깔끔한 모션그래픽. 캐릭터는 처음·끝에만.
//   0 ~ 큐 5       인트로 — 실습 화면을 어둡게 깔고 타이틀 + 캐릭터 (자막 띠는 가리지 않음)
//   큐 23 ~ 188    제목 표시줄 위 '폴더 정리 순서' 진행 바 (가상 자료 → /plan → 정리 → 검증 → 로그 → CLAUDE.md)
//   실습 구간      작은 카드 (lane / br / tr)
//   334.4s ~ 끝    오로라 아웃트로 위 엔드카드 + 캐릭터
// 모든 시각은 원본 SRT 큐 번호에 고정: T(cue) = 큐 시작초.
//
// 수정: 아래 G 배열 → node build.mjs → npx hyperframes check
// ---------------------------------------------------------------------------

const root = process.cwd();
const DUR = 352.76;

// ---------- SRT --------------------------------------------------------------
const srtSec = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };
const CUES = {};
fs.readFileSync(path.join(root, 'assets/source.srt'), 'utf8').replace(/^﻿/, '').replace(/\r/g, '')
  .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
  .forEach((l) => { const m = l[1].match(/(\S+)\s*-->\s*(\S+)/); CUES[+l[0]] = { s: srtSec(m[1]), e: srtSec(m[2]), text: l.slice(2).join(' ') }; });
const T = (n, off = 0) => +(CUES[n].s + off).toFixed(3);
const TE = (n, off = 0) => +(CUES[n].e + off).toFixed(3);

// covered spans (motion graphics only) — 이번 편은 없음 (인트로도 원본 자막 띠를 가리지 않는다)
const COVER = [];
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
// layer: 'full' = 인트로(어둡게 깐 실습 화면 위 타이틀), 'ov' = 실습 화면 위 작은 카드
// 카드 자리: 'lane' = 왼쪽 Explorer 아래 빈 칸 (~2:52, Explorer 가 펼쳐지기 전까지)
//           'br'   = 오른쪽 아래 (자막 위) / 'tr' = 오른쪽 위 (손글씨 필기가 아래쪽에 있을 때)
//           'trk'  = 제목 표시줄 위 '폴더 정리 순서' 진행 바
const G = [];
const add = (g) => G.push({ layer: 'ov', ...g });
const kv = (id, cmd, label) => `<div id="${id}" class="kv"><code>${cmd}</code><span>${label}</span></div>`;
const pathc = (id, html) => `<div id="${id}" class="pathc">${html}</div>`;

// ===== 1. 인트로 (0 ~ 큐 5) — 실습 화면을 어둡게 깔고 타이틀 + 캐릭터 (원본 자막 띠는 그대로 보이게) =====
add({ id: 's-title', layer: 'full', s: 0, e: T(5), html: `
  <div id="st-scrim" class="scrim"></div>
  <div id="st-ph" class="phwrap"><img id="st-img" class="phimg" src="assets/media/philosophy.png" alt="필로소피 캐릭터"></div>
  <div id="st-c" class="card titlecard">
    ${pill('st-k', '필로소피 AI 교육 · 교수님들을 위한', C.coral, 'pill-soft')}
    <h1 id="st-h" class="h1 center">${hl('Claude Code', 'var(--hl-p)')}<br>CLI 수업</h1>
    <div id="st-s" class="ep"><b>3편</b><span>폴더 정리 실습</span></div>
    <div id="st-fl" class="miniflow">
      ${['가상 자료', '/plan 계획', '정리', '검증', '기록', 'CLAUDE.md'].map((t, i) => `${i ? `<span id="st-a${i}" class="mfa">›</span>` : ''}<span id="st-f${i}" class="mf">${t}</span>`).join('')}
    </div>
  </div>`, anim: `
  tl.fromTo('#st-scrim', {opacity:0}, {opacity:1, duration:.5, ease:'power2.out'}, 0);
  tl.fromTo('#st-ph', {opacity:0, x:-160}, {opacity:1, x:0, duration:.8, ease:'back.out(1.4)'}, .2);
  rise('#st-c', .35); up('#st-k', .6, 16); up('#st-h', .75, 34); sweep('#st-h .hl', 1.4);
  pop('#st-s', ${f(T(2, 0.3))});
  ${[0, 1, 2, 3, 4, 5].map((i) => `${i ? `pop('#st-a${i}', ${f(T(3, 0.1 + i * 0.22))}); ` : ''}pop('#st-f${i}', ${f(T(3, 0.15 + i * 0.22))});`).join(' ')}` });

// ===== 2. 진행 바 — 지금 몇 번째 단계인지 (제목 표시줄 위) ======================
const STEPS = ['가상 자료', '/plan 계획', '정리', '검증', '정리 로그', 'CLAUDE.md'];
const ACT = [T(24), T(59), T(91), T(116), T(128), T(139)];
const RECAP = [T(157), T(161), T(168), T(168, 0.6), T(171), T(174)];
add({ id: 'trk', s: T(23), e: T(188), html: `
  <div id="tk" class="trk">
    <span id="tk-h" class="tkh">폴더 정리 순서</span>
    ${STEPS.map((t, i) => `<span id="tk-${i}" class="tks"><i>${i + 1}</i>${t}</span>`).join('')}
  </div>`, anim: `
  tl.fromTo('#tk', {opacity:0, y:-24}, {opacity:1, y:0, duration:.5, ease:'power3.out'}, ${f(T(23, 0.1))});
  ${ACT.map((t, i) => `act('#tk-${i}', ${f(t)});${i ? ` done('#tk-${i - 1}', ${f(t)});` : ''}`).join('\n  ')}
  done('#tk-5', ${f(T(152))});
  ${STEPS.map((x, i) => `idle('#tk-${i}', ${f(T(156, 0.4))});`).join(' ')}
  ${RECAP.map((t, i) => `act('#tk-${i}', ${f(t)});${i ? ` done('#tk-${i - 1}', ${f(t)});` : ''}`).join('\n  ')}
  done('#tk-5', ${f(T(176))});
  tl.fromTo('#tk', {boxShadow:'0 10px 26px rgba(0,0,0,.35), 0 0 0 0px rgba(159,220,188,0)'}, {boxShadow:'0 10px 26px rgba(0,0,0,.35), 0 0 0 6px rgba(159,220,188,.85)', duration:.4, ease:'power2.out', yoyo:true, repeat:1, immediateRender:false}, ${f(T(176, 0.2))});` });

// ===== 3. 실습 화면 — 왼쪽 Explorer 아래 빈 칸 'lane' (~ 큐 92) =================
add({ id: 'o-go', s: T(9), e: T(22, -0.2), html: `
  <div id="og-c" class="ovc lane">
    <div class="stephead"><span class="stepn">START</span><span class="stept">작업 폴더로 이동</span></div>
    <div id="og-cmd" class="bigcmd xs"><span class="tprompt">&gt;</span><code>cd 02foldercleanup</code></div>
    <div id="og-n" class="nextrow"><span>그 다음</span><code>claude</code></div>
    ${pathc('og-p', '~\\<b id="og-pb">02foldercleanup</b>')}
    ${ok('og-ok', '처음에 폴더 지정이 가장 중요!', 'ok-xs')}
  </div>`, anim: `rise('#og-c', ${f(T(9, 0.1))}); up('#og-cmd', ${f(T(10, 0.2))}, 14); pop('#og-n', ${f(T(12, 0.2))});
  up('#og-p', ${f(T(14, 0.2))}, 12); tl.fromTo('#og-pb', {color:'#f4efe6'}, {color:'#ffd27a', duration:.4, ease:'power2.out', immediateRender:false}, ${f(T(17, 0))});
  pop('#og-ok', ${f(T(20, 0.2))});` });

add({ id: 'o-fake', s: T(23), e: T(33, -0.2), html: `
  <div id="of-c" class="ovc lane">
    ${pill('of-k', '프롬프트 ① 실습용 가상 자료', C.coral, 'pill-soft pill-sm')}
    <div id="of-w" class="warnrow">${ICON.warn('#c4486c')}<span>Claude는 파일을 실제로<br><b>삭제·수정</b>할 수 있어요</span></div>
    ${ok('of-ok', '그래서 가짜 자료로 연습', 'ok-xs')}
    <div id="of-f" class="fbox">${ico('of-i', 'folder', C.yellow, BG.yellow, 'xxs')}<div class="fbt"><code>lecture-materials/</code><span>강의자료 <b id="of-n">0</b>개</span></div></div>
  </div>`, anim: `rise('#of-c', ${f(T(24, -0.3))}); up('#of-k', ${f(T(24, 0))}, 12); up('#of-w', ${f(T(27, 0.1))}, 12);
  pop('#of-ok', ${f(T(29, 0.1))}); slide('#of-f', ${f(T(30, 0.2))}, -30); count('#of-n', 40, ${f(T(31, 0.3))}, 1.4);` });

add({ id: 'o-cafe', s: T(33), e: T(43, -0.2), html: `
  <div id="oc-c" class="ovc lane">
    ${pill('oc-k', '프롬프트 텍스트 파일 제공', C.lav, 'pill-soft pill-sm')}
    <div class="row">${ico('oc-i', 'doc', C.sky, BG.sky, 'xs')}<div id="oc-t" class="ovt sm">고정 댓글 링크 →<br><b>필로소피 AI 교육</b><br>네이버 카페</div></div>
    <div id="oc-s" class="ovs2">아래 요청을 <b>그대로 붙여 넣기</b></div>
    ${ok('oc-ok', '다른 프롬프트도 파일 안에', 'ok-xs')}
  </div>`, anim: `rise('#oc-c', ${f(T(33, 0.1))}); up('#oc-k', ${f(T(33, 0.3))}, 12); pop('#oc-i', ${f(T(34, 0))}); up('#oc-t', ${f(T(35, 0))}, 12);
  up('#oc-s', ${f(T(38, 0))}, 12); pop('#oc-ok', ${f(T(41, 0.1))});` });

const MESS = [
  ['최종_진짜최종_5주.txt', 8, 12, -5], ['week3_slides_final_v2.txt', 70, 50, 4], ['새 텍스트 문서 (2).txt', 4, 96, 3],
  ['6주차강의안.hwp.txt', 130, 138, -5], ['4wk_quiz_answers.txt', 20, 180, 6], ['공리주의 퀴즈(수정).txt', 110, 222, -3],
];
add({ id: 'o-mess', s: T(46), e: T(58, -0.2), html: `
  <div id="om-c" class="ovc lane">
    ${pill('om-k', '정리 전 · 한 폴더에 40개', C.pink, 'pill-soft pill-sm')}
    <div id="om-box" class="mess">${MESS.map(([t, x, y, r], i) => `<span id="om-${i}" class="mchip" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)">${t}</span>`).join('')}</div>
    <div id="om-t" class="ovt sm">살짝 <b>정신이 없죠?</b></div>
    <div class="chips"><span id="om-d0" class="chip" style="--cc:${C.coral}">내용 같은 중복</span><span id="om-d1" class="chip" style="--cc:${C.lav}">내용 다른 비슷한 이름</span></div>
  </div>`, anim: `rise('#om-c', ${f(T(46, 0.1))}); up('#om-k', ${f(T(46, 0.3))}, 12);
  ${MESS.map((m, i) => `tl.fromTo('#om-${i}', {opacity:0, scale:.5}, {opacity:1, scale:1, duration:.4, ease:'back.out(2)'}, ${f(T(47, 0.1 + i * 0.28))});`).join(' ')}
  tl.fromTo('#om-box', {x:0}, {x:6, duration:.07, ease:'none', yoyo:true, repeat:7, immediateRender:false}, ${f(T(49, 0.1))});
  up('#om-t', ${f(T(49, 0))}, 12); pop('#om-d0', ${f(T(55, 0))}); pop('#om-d1', ${f(T(56, 0.1))});` });

add({ id: 'o-plan', s: T(58), e: T(68, -0.2), html: `
  <div id="op-c" class="ovc lane key">
    <div class="stephead"><span class="stepn">KEY</span><span class="stept">계획부터 세우기</span></div>
    <div id="op-cmd" class="bigcmd"><span class="tprompt">&gt;</span><code id="op-tt">/plan</code><span id="op-cur" class="tcur"></span></div>
    <div id="op-s" class="ovs2">한 칸 띄우고 →<br>"정리 <b>계획을 먼저</b> 세워 주세요"</div>
    ${no('op-n', '바로 "정리해 줘" → 알아서 삭제·수정할 수도', 'ok-xs')}
    ${ok('op-ok', '계획을 보고 → 그다음 허락', 'ok-xs')}
  </div>`, anim: `rise('#op-c', ${f(T(58, 0.1))}); up('#op-cmd', ${f(T(59, 0))}, 12); type('#op-tt', '/plan', ${f(T(59, 0.2))}, .5); blink('#op-cur', ${f(T(59, 0))}, ${f(T(62, 0))});
  up('#op-s', ${f(T(60, 0.1))}, 12); pop('#op-n', ${f(T(63, 0.4))}); pop('#op-ok', ${f(T(67, 0.2))});` });

const RULES = [['<b>주차별</b>로 정리', 75], ['<b>이름 규칙</b> 통일', 76], ['중복·옛 버전은 <b>지우지 않고</b> 보관', 77], ['되돌릴 수 있게 <b>기록</b> 남기기', 79]];
add({ id: 'o-rule', s: T(69), e: T(81, -0.2), html: `
  <div id="or-c" class="ovc lane">
    ${pill('or-k', 'Claude가 세운 정리 계획', C.mint, 'pill-soft pill-sm')}
    <div id="or-s" class="ovs2">15주 수업 자료 <b>40개</b>가<br>한 폴더에 섞여 있음</div>
    ${RULES.map(([t], i) => `<div id="or-${i}" class="flow"><span class="fnum">${i + 1}</span><span>${t}</span></div>`).join('')}
  </div>`, anim: `rise('#or-c', ${f(T(69, 0.1))}); up('#or-k', ${f(T(69, 0.3))}, 12); up('#or-s', ${f(T(72, 0))}, 12);
  ${RULES.map(([, c], i) => `slide('#or-${i}', ${f(T(c, 0.1))}, -30);`).join(' ')}` });

const TREE = [['folder', C.yellow, '01주차 … 15주차', 0], ['folder', C.coral, '_중복보관/', 0.9], ['folder', C.lav, '_이전버전/', 1.3], ['doc', C.mint, '정리기록.csv', 2.4]];
add({ id: 'o-tree', s: T(81), e: T(86, -0.2), html: `
  <div id="ot-c" class="ovc lane">
    ${pill('ot-k', '정리 후 구조', C.sky, 'pill-soft pill-sm')}
    <div class="nest">
      <div id="ot-r" class="nrow">${ICON.folder(C.yellow)}<span><b>lecture-materials</b></span></div>
      ${TREE.map(([ic, c, t], i) => `<div id="ot-${i}" class="nrow sub">${ICON[ic](c)}<span>${t}</span></div>`).join('')}
    </div>
  </div>`, anim: `rise('#ot-c', ${f(T(81, 0.1))}); up('#ot-k', ${f(T(81, 0.3))}, 12); slide('#ot-r', ${f(T(81, 0.5))}, -24);
  ${TREE.map(([, , , d], i) => `slide('#ot-${i}', ${f(T(81, 0.9 + d))}, -24);`).join(' ')}` });

add({ id: 'o-name', s: T(86), e: T(92, -0.2), html: `
  <div id="on-c" class="ovc lane">
    ${pill('on-k', '파일 이름 규칙', C.yellow, 'pill-soft pill-sm')}
    <div id="on-cmd" class="bigcmd xs"><code><i>NN주차</i>_자료종류_주제.txt</code></div>
    <div id="on-b" class="fname before"><span>최종_진짜최종_5주.txt</span><s></s></div>
    <div id="on-ar" class="downar">↓</div>
    <div id="on-a" class="fname after">05주차_강의안_비형식적오류1.txt</div>
  </div>`, anim: `rise('#on-c', ${f(T(86, 0.1))}); up('#on-k', ${f(T(86, 0.3))}, 12); up('#on-cmd', ${f(T(86, 0.6))}, 12);
  slide('#on-b', ${f(T(87, 0.1))}, -24); tl.fromTo('#on-b s', {width:'0%'}, {width:'100%', duration:.4, ease:'power2.out', immediateRender:false}, ${f(T(88, -0.2))});
  pop('#on-ar', ${f(T(88, 0))}); pop('#on-a', ${f(T(88, 0.3))});` });

// ===== 4. Explorer 가 펼쳐진 뒤 — 오른쪽 아래 'br' ================================
add({ id: 'o-csv', s: T(104), e: T(114, -0.2), html: `
  <div id="ov-c" class="ovc br">
    <div class="ovhead">${ico('ov-i', 'doc', C.mint, BG.mint, 'xxs')}<code class="mdname">정리기록.csv</code><span id="ov-tag" class="tagc">되돌리기 장부</span></div>
    <div id="ov-r" class="csvrow"><span class="cl">원래 이름</span><span class="cv">week3_slides_final_v2.txt</span></div>
    <div id="ov-r2" class="csvrow"><span class="cl new">새 경로</span><span class="cv">03주차/03주차_슬라이드_….txt</span></div>
    ${ok('ov-ok', '"원래대로 돌려 줘" → 이름 복구 가능', 'ok-xs')}
  </div>`, anim: `rise('#ov-c', ${f(T(104, 0.1))}); pop('#ov-i', ${f(T(105, 0))}); pop('#ov-tag', ${f(T(109, 0))});
  slide('#ov-r', ${f(T(106, 0.2))}, 30); slide('#ov-r2', ${f(T(106, 0.7))}, 30); pop('#ov-ok', ${f(T(111, 0))});` });

const CHK = [['파일 개수가 같은가?', 119], ['사라진 파일은 없는가?', 120], ['이름 규칙을 지켰는가?', 124]];
add({ id: 'o-check', s: T(115), e: T(128, -0.2), html: `
  <div id="ok-c" class="ovc br">
    ${pill('ok-k', '정리 결과 검증하기', C.sky, 'pill-soft pill-sm')}
    ${CHK.map(([t], i) => `<div id="ok-${i}" class="chk"><span class="cbox"><span id="ok-t${i}" class="tick">${ICON.check('#ffffff')}</span></span><span>${t}</span></div>`).join('')}
    <div id="ok-res" class="res"><span>백업</span><b>40</b><em>=</em><span>정리 후</span><b>40</b></div>
  </div>`, anim: `rise('#ok-c', ${f(T(115, 0.1))}); up('#ok-k', ${f(T(116, 0))}, 12);
  ${CHK.map(([, c], i) => `slide('#ok-${i}', ${f(T(c, 0.1))}, 30);`).join(' ')}
  tl.fromTo('#ok-1', {backgroundColor:'#f8f6fb'}, {backgroundColor:'#fde8ec', duration:.3, ease:'power2.out', yoyo:true, repeat:3, immediateRender:false}, ${f(T(121, 0))});
  pop('#ok-res', ${f(T(126, 0))}); ${CHK.map((x, i) => `pop('#ok-t${i}', ${f(T(126, 0.5 + i * 0.25))});`).join(' ')} confetti('ok', ${f(T(126, 0.4))}, 300, 360);` });

const LOG = [['날짜 · 정리 규칙', 129], ['바뀐 파일 목록', 130], ['내가 확인할 파일 목록', 131]];
add({ id: 'o-log', s: T(128), e: T(138, -0.2), html: `
  <div id="ol-c" class="ovc br">
    <div class="ovhead">${ico('ol-i', 'doc', C.lav, BG.lav, 'xxs')}<code class="mdname">cleanup-log.md</code></div>
    <div id="ol-s" class="ovs2">이번 정리 내역을 <b>문서로 남기기</b></div>
    ${LOG.map(([t], i) => `<div id="ol-${i}" class="flow"><span class="fnum">${i + 1}</span><span>${t}</span></div>`).join('')}
  </div>`, anim: `rise('#ol-c', ${f(T(128, 0.1))}); pop('#ol-i', ${f(T(128, 0.3))}); up('#ol-s', ${f(T(128, 0.6))}, 12);
  ${LOG.map(([, c], i) => `slide('#ol-${i}', ${f(T(c, 0))}, 30);`).join(' ')}` });

add({ id: 'o-const', s: T(138), e: T(152, -0.2), html: `
  <div id="oq-c" class="ovc br done">
    <div id="oq-fl" class="mdflow"><span id="oq-a" class="mdchip">cleanup-log 규칙</span>${arrowR('oq-ar', 'arrow-sm')}<span id="oq-b" class="mdchip main">CLAUDE.md</span></div>
    <div id="oq-t" class="ovt sm">CLAUDE.md = Claude의 ${hl('헌법', 'var(--hl-p)')}</div>
    <div id="oq-q" class="qline">"폴더 정리해 줘" → <b>이 규칙대로</b></div>
    ${ok('oq-ok', '다른 규칙도 적어 두면 AI가 참고해요', 'ok-xs')}
  </div>`, anim: `rise('#oq-c', ${f(T(138, 0.1))}); pop('#oq-a', ${f(T(139, 0))}); draw('#oq-ar path', ${f(T(139, 0.6))}, .4); pop('#oq-b', ${f(T(139, 1.0))});
  up('#oq-t', ${f(T(141, 0))}, 12); sweep('#oq-t .hl', ${f(T(141, 0.6))}); up('#oq-q', ${f(T(145, 0))}, 12); pop('#oq-ok', ${f(T(147, 0.2))});` });

// ===== 5. 정리 — 아래쪽에 손글씨 필기가 있어 오른쪽 위 'tr' =======================
add({ id: 'o-allow', s: T(163), e: T(168, -0.2), html: `
  <div id="oa-c" class="ovc tr">
    ${pill('oa-k', '플랜이 마음에 들면 허락하기', C.coral, 'pill-soft pill-sm')}
    <div class="ovrow">
      <div id="oa-m" class="mbtn">${ICON.hand(C.coral)}<span>매뉴얼 · 하나씩</span></div>
      <div id="oa-o" class="mbtn">${ICON.bolt(C.yellow)}<span>오토 · 알아서</span></div>
    </div>
  </div>`, anim: `rise('#oa-c', ${f(T(163, 0.1))}); up('#oa-k', ${f(T(163, 0.3))}, 12); pop('#oa-m', ${f(T(164, 0.3))}); pop('#oa-o', ${f(T(165, 0.2))});` });

add({ id: 'o-why', s: T(177), e: T(188, -0.2), html: `
  <div id="ow-c" class="ovc tr">
    ${pill('ow-k', '왜 순서(로직)대로 할까요?', C.lav, 'pill-soft pill-sm')}
    <div id="ow-1" class="grow"><span class="gk">간단한 작업</span><span>이렇게 저렇게 해도 OK</span></div>
    <div id="ow-2" class="grow"><span class="gk hot">복잡·큰 작업</span><span><b>로직대로</b> 해야</span></div>
    ${ok('ow-ok', '깔끔한 결과물 + 효율성 ↑', 'ok-xs')}
  </div>`, anim: `rise('#ow-c', ${f(T(177, 0.1))}); up('#ow-k', ${f(T(178, 0))}, 12); slide('#ow-1', ${f(T(181, 0.2))}, 30); slide('#ow-2', ${f(T(182, 0.1))}, 30); pop('#ow-ok', ${f(T(184, 0))});` });

// 오로라 아웃트로 위 엔드카드 (+ 캐릭터)
const END0 = 334.4;
add({ id: 'o-end', s: END0, e: DUR, html: `
  <div class="center-col" style="top:120px">
    <img id="oe-ph" class="endph" src="assets/media/philosophy.png" alt="필로소피 캐릭터">
    ${pill('oe-k', '필로소피 AI 교육 · 교수님들을 위한 Claude Code CLI', C.lav, 'pill-glass')}
    <div id="oe-h" class="endbig">3편 · 폴더 정리 <span class="endok">완료</span></div>
    <div id="oe-n" class="endnext"><span>다음 편</span><b>4편에서 만나요</b><span class="endarr">→</span></div>
  </div>`, anim: `tl.fromTo('#oe-ph', {opacity:0, y:80, scale:.9}, {opacity:1, y:0, scale:1, duration:.8, ease:'back.out(1.5)'}, ${f(END0 + 0.3)});
  up('#oe-k', ${f(END0 + 0.8)}, 16); up('#oe-h', ${f(END0 + 1.1)}, 30); rise('#oe-n', ${f(END0 + 2.0)});` });

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
<title>교수님들을 위한 Claude Code CLI 3편 (폴더 정리 실습)</title>
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

/* episode 3 — intro scrim, step tracker, slots, pieces */
.scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18,16,30,.82) 0%, rgba(18,16,30,.8) 80%, rgba(18,16,30,0) 87%); }
.phwrap { left: 120px; top: 210px; width: 440px; }
.phimg { width: 440px; filter: drop-shadow(0 24px 40px rgba(0, 0, 0, .45)); }
.titlecard { left: 640px; top: 150px; width: 1160px; gap: 28px; padding: 50px 56px 54px; }
.miniflow { display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; }
.mf { padding: 10px 18px; border-radius: 14px; background: #f4f1fa; box-shadow: inset 0 0 0 2px #e4def0; font-size: 28px; font-weight: 800; white-space: nowrap; }
.mfa { font-size: 30px; font-weight: 900; color: #b4a9d3; }
.trk { position: absolute; left: 650px; top: 8px; height: 56px; display: flex; align-items: center; gap: 6px; padding: 6px 10px 6px 18px; border-radius: 999px;
  background: rgba(255, 255, 255, .97); box-shadow: 0 10px 26px rgba(0, 0, 0, .35); }
.tkh { font-size: 19px; font-weight: 850; color: #7d62c0; margin-right: 6px; white-space: nowrap; }
.tks { display: flex; align-items: center; gap: 7px; padding: 6px 13px 6px 7px; border-radius: 999px; font-size: 20px; font-weight: 800; color: #8d89a3; white-space: nowrap; background: rgba(255,255,255,0); }
.tks i { font-style: normal; width: 26px; height: 26px; border-radius: 50%; background: rgba(0, 0, 0, .08); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; }
.ovc.lane { left: 52px; top: 470px; width: 390px; }
.ovc.lane.key { box-shadow: 0 22px 50px rgba(30, 24, 40, .32), inset 0 0 0 3px #f2b49e; }
.ovc.br { right: 40px; bottom: 140px; width: 480px; gap: 12px; padding: 22px 26px; border-radius: 26px; }
.ovc.tr { right: 46px; top: 84px; width: 540px; gap: 12px; padding: 22px 26px; border-radius: 26px; }
.ovc.br .ovs2, .ovc.tr .ovs2 { font-size: 24px; }
.bigcmd.xs { font-size: 26px; padding: 10px 16px; }
.ovc.lane .bigcmd.xs { font-size: 23px; white-space: nowrap; }
.warnrow b { font-weight: 900; }
.fbox { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-radius: 18px; background: #fbf8ef; box-shadow: inset 0 0 0 2px #f1e7cc; }
.fbt { display: flex; flex-direction: column; gap: 2px; }
.fbt code { font-family: Consolas, "Courier New", monospace; font-size: 24px; font-weight: 700; }
.fbt span { font-size: 22px; font-weight: 700; color: var(--ink-soft); }
.fbt b { font-size: 30px; font-weight: 900; color: #d0603f; }
.mess { position: relative; height: 262px; border-radius: 18px; background: #f7f5fa; box-shadow: inset 0 0 0 2px #ece8f3; overflow: hidden; }
.mchip { position: absolute; padding: 6px 12px; border-radius: 10px; background: #fff; box-shadow: 0 4px 10px rgba(60, 50, 80, .14); font-size: 19px; font-weight: 750; white-space: nowrap; }
.nrow.sub { margin-left: 30px; font-size: 24px; }
.fname { position: relative; align-self: flex-start; padding: 8px 14px; border-radius: 12px; font-size: 22px; font-weight: 800; white-space: nowrap; }
.fname.before { background: #fde8ec; color: #8a3550; }
.fname.before s { position: absolute; left: 10px; top: 50%; height: 3px; width: 0%; max-width: calc(100% - 20px); background: #e0607f; display: block; }
.fname.after { background: #e3f6ec; color: #24533f; box-shadow: inset 0 0 0 2px #9fdcbc; font-size: 21px; }
.downar { align-self: flex-start; margin-left: 20px; font-size: 28px; font-weight: 900; color: #4fb489; line-height: 1; }
.csvrow { display: flex; align-items: center; gap: 12px; }
.cl { flex: 0 0 auto; min-width: 96px; text-align: center; padding: 4px 10px; border-radius: 10px; background: #fde8ec; color: #8a3550; font-size: 19px; font-weight: 900; }
.cl.new { background: #e3f6ec; color: #24533f; }
.cv { font-family: Consolas, "Courier New", monospace; font-size: 22px; font-weight: 700; white-space: nowrap; }
.ovhead .tagc { margin-top: 0; font-size: 20px; padding: 5px 14px; }
.chk { display: flex; align-items: center; gap: 14px; padding: 8px 12px; border-radius: 16px; background: #f8f6fb; font-size: 26px; font-weight: 800; }
.cbox { position: relative; flex: 0 0 auto; width: 36px; height: 36px; border-radius: 10px; box-shadow: inset 0 0 0 3px #cfc8e0; }
.chk .tick { right: 0; top: 0; margin-top: 0; width: 36px; height: 36px; padding: 6px; }
.res { position: relative; display: flex; align-items: baseline; justify-content: center; gap: 12px; padding: 10px 16px; border-radius: 18px; background: #2c2a3d; color: #f4efe6; font-size: 24px; font-weight: 700; }
.res b { font-size: 46px; font-weight: 900; color: #9ff0c8; }
.res em { font-style: normal; font-size: 40px; font-weight: 900; color: #ffd27a; }
.mdflow { display: flex; align-items: center; gap: 10px; }
.mdchip { padding: 8px 14px; border-radius: 14px; background: #ebe6ff; color: #5a4aa8; font-size: 22px; font-weight: 850; white-space: nowrap; }
.mdchip.main { background: #2c2a3d; color: #9ff0c8; font-family: Consolas, "Courier New", monospace; font-size: 26px; }
.qline { font-size: 25px; font-weight: 650; }
.qline b { font-weight: 900; color: #d0603f; }
.gk.hot { background: #ffe6dc; color: #9a4f35; }
.endph { width: 230px; height: auto; filter: drop-shadow(0 20px 36px rgba(0, 0, 0, .5)); }
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
  const act = (sel, t) => tl.to(sel, { backgroundColor: '#d2603f', color: '#ffffff', scale: 1.06, duration: .35, ease: 'back.out(2)' }, t);
  const done = (sel, t) => tl.to(sel, { backgroundColor: '#e3f6ec', color: '#24533f', scale: 1, duration: .35, ease: 'power2.out' }, t);
  const idle = (sel, t) => tl.to(sel, { backgroundColor: 'rgba(255,255,255,0)', color: '#8d89a3', scale: 1, duration: .35, ease: 'power2.out' }, t);
  const count = (sel, to, t, d) => {
    const el = document.querySelector(sel); const st = { n: 0 };
    tl.fromTo(st, { n: 0 }, { n: to, duration: d, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(st.n)); } }, t);
  };
  const confetti = (pre, t, cx = 60, cy = 60) => {
    const host = document.getElementById(pre + '-c'); const cols = ['#ef8a6f', '#e7a92c', '#4fb489', '#9a8be6', '#e8708f', '#6aa3e6'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span'); p.className = 'cf'; p.style.background = cols[i % 6];
      p.style.left = cx + 'px'; p.style.top = cy + 'px'; host.appendChild(p);
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
