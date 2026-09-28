// =============================================================================
// 필로소피 AI 봉사단 2기 모집 — 파스텔 모션그래픽 빌더
//
// 원본 초고 영상은 블로그 화면 녹화라, 오디오(내레이션)만 쓰고 화면은 전부
// 이 파일이 만드는 모션그래픽으로 덮는다. 씬 경계와 비트는 제공된 SRT
// (public/captions.srt)의 실제 발화 시각에 맞췄다.
//
//   node build.mjs  →  index.html 재생성
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const AUDIO_DUR = 312.38;
const DUR = 314.0; // 끝 카드를 1.6초 더 붙잡는다

// ---------------------------------------------------------------------------
// 팔레트
// ---------------------------------------------------------------------------
const INK = '#3a3150';
const INK2 = '#6f6685';
const PAL = {
  peach: ['#ffe2d6', '#f2a48f'],
  lav: ['#e8e0ff', '#a795ec'],
  mint: ['#d6f2e6', '#72c7a0'],
  butter: ['#fff1c9', '#ebbb4f'],
  sky: ['#dcebff', '#86b0ea'],
  rose: ['#ffe1ea', '#ee97b0'],
};
const PK = Object.keys(PAL);
const CORAL = '#ef8e7c';

// ---------------------------------------------------------------------------
// 마크업 헬퍼
// ---------------------------------------------------------------------------
const esc = (s = '') => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
// 단어 단위로 줄바꿈을 막고, 글자마다 span 을 씌워 한 글자씩 등장시킨다
const W = (text, cls = '') =>
  text.split(' ').map((w) => `<span class="w ${cls}">${[...w].map((c) => `<span class="ch">${esc(c)}</span>`).join('')}</span>`).join(' ');
// 형광펜 강조
const M = (inner, color = PAL.peach[0]) =>
  `<span class="mk-w"><span class="mk" style="background:${color}"></span><span class="mk-t">${inner}</span></span>`;
const box = (l, t, w, h) => `left:${l}px;top:${t}px;${w != null ? `width:${w}px;` : ''}${h != null ? `height:${h}px;` : ''}`;

// ---------------------------------------------------------------------------
// 아이콘 (viewBox 0 0 100 100, 듀오톤)
// ---------------------------------------------------------------------------
const ICON = {
  laptop: (c) => `<rect x="16" y="20" width="68" height="48" rx="7" fill="${c}"/><rect x="22" y="26" width="56" height="36" rx="3" fill="#fff" opacity=".9"/><path d="M30 50l10-10 8 7 12-13" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 73h90l-6 9H11z" fill="${c}"/>`,
  heart: (c) => `<path d="M50 86C21 64 9 48 9 33 9 21 19 12 31 12c8 0 15 5 19 12 4-7 11-12 19-12 12 0 22 9 22 21 0 15-12 31-41 53z" fill="${c}"/><path d="M28 28c-5 1-8 5-8 10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`,
  sparkle: (c) => `<path d="M46 8c4 26 12 34 38 38-26 4-34 12-38 38-4-26-12-34-38-38 26-4 34-12 38-38z" fill="${c}"/><path d="M80 66c2 9 4 11 13 13-9 2-11 4-13 13-2-9-4-11-13-13 9-2 11-4 13-13z" fill="${c}" opacity=".6"/>`,
  screen: (c) => `<rect x="8" y="12" width="84" height="58" rx="8" fill="${c}"/><rect x="15" y="19" width="70" height="44" rx="4" fill="#fff" opacity=".92"/><rect x="25" y="44" width="9" height="12" rx="2" fill="${c}"/><rect x="40" y="36" width="9" height="20" rx="2" fill="${c}"/><rect x="55" y="28" width="9" height="28" rx="2" fill="${c}"/><rect x="70" y="38" width="7" height="18" rx="2" fill="${c}" opacity=".6"/><path d="M50 70v14M34 91l16-7 16 7" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  calendar: (c) => `<rect x="10" y="16" width="80" height="74" rx="12" fill="#fff"/><path d="M10 28a12 12 0 0 1 12-12h56a12 12 0 0 1 12 12v12H10z" fill="${c}"/><rect x="28" y="8" width="8" height="18" rx="4" fill="${INK}"/><rect x="64" y="8" width="8" height="18" rx="4" fill="${INK}"/><g fill="${c}" opacity=".55"><circle cx="28" cy="56" r="5"/><circle cx="50" cy="56" r="5"/><circle cx="72" cy="56" r="5"/><circle cx="28" cy="74" r="5"/><circle cx="50" cy="74" r="5"/></g><circle cx="72" cy="74" r="7" fill="${CORAL}"/>`,
  book: (c) => `<path d="M50 24C39 16 23 14 8 16v64c15-2 31 0 42 8 11-8 27-10 42-8V16c-15-2-31 0-42 8z" fill="${c}"/><path d="M50 24v64" stroke="#fff" stroke-width="4"/><path d="M18 32c9-1 17 0 24 4M18 46c9-1 17 0 24 4M58 36c7-4 15-5 24-4M58 50c7-4 15-5 24-4" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>`,
  camera: (c) => `<rect x="6" y="26" width="62" height="50" rx="12" fill="${c}"/><path d="M68 44l26-14v42L68 58z" fill="${c}"/><circle cx="26" cy="42" r="7" fill="#fff"/><rect x="36" y="56" width="22" height="8" rx="4" fill="#fff" opacity=".6"/>`,
  play: (c) => `<rect x="6" y="16" width="88" height="68" rx="20" fill="${c}"/><path d="M41 34v32l27-16z" fill="#fff"/>`,
  mail: (c) => `<rect x="8" y="20" width="84" height="60" rx="12" fill="${c}"/><path d="M14 28l36 27 36-27" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  doc: (c) => `<path d="M20 6h42l20 20v68H20z" fill="#fff"/><path d="M62 6v20h20" fill="${c}" opacity=".6"/><rect x="30" y="38" width="42" height="6" rx="3" fill="${c}"/><rect x="30" y="52" width="42" height="6" rx="3" fill="${c}" opacity=".7"/><rect x="30" y="66" width="28" height="6" rx="3" fill="${c}" opacity=".5"/>`,
  coin: (c) => `<circle cx="50" cy="50" r="42" fill="${c}"/><circle cx="50" cy="50" r="31" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/><text x="50" y="64" text-anchor="middle" font-family="Pretendard" font-weight="800" font-size="40" fill="#fff">₩</text>`,
  gift: (c) => `<rect x="14" y="42" width="72" height="48" rx="7" fill="${c}"/><rect x="9" y="28" width="82" height="18" rx="6" fill="${c}"/><rect x="45" y="28" width="10" height="62" fill="#fff" opacity=".85"/><path d="M50 28c-7-15-28-18-28-5 0 7 14 7 28 5zM50 28c7-15 28-18 28-5 0 7-14 7-28 5z" fill="${CORAL}"/>`,
  bubble: (c) => `<path d="M16 14h68a10 10 0 0 1 10 10v42a10 10 0 0 1-10 10H46L26 92V76H16A10 10 0 0 1 6 66V24a10 10 0 0 1 10-10z" fill="${c}"/><circle cx="32" cy="45" r="6" fill="#fff"/><circle cx="50" cy="45" r="6" fill="#fff"/><circle cx="68" cy="45" r="6" fill="#fff"/>`,
  mega: (c) => `<path d="M10 38h16l44-22v68L26 62H10a4 4 0 0 1-4-4V42a4 4 0 0 1 4-4z" fill="${c}"/><path d="M26 62l7 24h12l-5-24" fill="${c}" opacity=".7"/><path d="M80 36c6 5 6 23 0 28M88 28c10 9 10 35 0 44" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  mic: (c) => `<rect x="36" y="6" width="28" height="52" rx="14" fill="${c}"/><path d="M22 44c0 17 12 28 28 28s28-11 28-28" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M50 72v16M34 92h32" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
  people: (c) => `<circle cx="30" cy="36" r="12" fill="${c}" opacity=".65"/><path d="M8 80c0-16 10-26 22-26s22 10 22 26z" fill="${c}" opacity=".65"/><circle cx="70" cy="36" r="12" fill="${c}" opacity=".65"/><path d="M48 80c0-16 10-26 22-26s22 10 22 26z" fill="${c}" opacity=".65"/><circle cx="50" cy="30" r="15" fill="${c}"/><path d="M22 92c0-20 12-32 28-32s28 12 28 32z" fill="${c}"/>`,
  person: (c) => `<circle cx="50" cy="32" r="18" fill="${c}"/><path d="M14 94c0-26 16-42 36-42s36 16 36 42z" fill="${c}"/>`,
  check: (c) => `<circle cx="50" cy="50" r="44" fill="${c}"/><path d="M29 51l14 14 29-30" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  bulb: (c) => `<path d="M50 8c-18 0-30 13-30 29 0 12 7 19 12 25 3 4 4 8 4 12h28c0-4 1-8 4-12 5-6 12-13 12-25 0-16-12-29-30-29z" fill="${c}"/><rect x="36" y="80" width="28" height="7" rx="3.5" fill="${c}" opacity=".7"/><rect x="40" y="90" width="20" height="6" rx="3" fill="${c}" opacity=".5"/><path d="M40 40c0-6 4-10 10-10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  rotate: (c) => `<path d="M80 50a30 30 0 1 1-9-21" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M84 14v22H62z" fill="${c}"/>`,
  funnel: (c) => `<path d="M8 12h84L60 52v30l-20 12V52z" fill="${c}"/>`,
  flag: (c) => `<rect x="18" y="8" width="7" height="86" rx="3.5" fill="${INK}"/><path d="M25 12h56l-12 17 12 17H25z" fill="${c}"/>`,
  star: (c) => `<path d="M50 8l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill="${c}"/>`,
  film: (c) => `<rect x="6" y="18" width="88" height="64" rx="10" fill="${c}"/><g fill="#fff" opacity=".85"><rect x="12" y="24" width="8" height="8" rx="2"/><rect x="12" y="46" width="8" height="8" rx="2"/><rect x="12" y="68" width="8" height="8" rx="2"/><rect x="80" y="24" width="8" height="8" rx="2"/><rect x="80" y="46" width="8" height="8" rx="2"/><rect x="80" y="68" width="8" height="8" rx="2"/></g><path d="M42 38v24l20-12z" fill="#fff"/>`,
  folder: (c) => `<path d="M8 22a8 8 0 0 1 8-8h22l10 10h36a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8z" fill="${c}"/><path d="M8 38h84" stroke="#fff" stroke-width="4" opacity=".6"/>`,
  child: (c) => `<circle cx="50" cy="38" r="22" fill="${c}"/><path d="M20 96c0-22 13-34 30-34s30 12 30 34z" fill="${c}"/><circle cx="50" cy="14" r="7" fill="${c}"/>`,
};
const svg = (name, c, size = 100, extra = '') =>
  `<svg class="ic" viewBox="0 0 100 100" width="${size}" height="${size}" ${extra}>${ICON[name](c)}</svg>`;
// 원형 배지 안의 아이콘
const badge = (name, pal, size = 140, id = '', cls = '') =>
  `<div ${id ? `id="${id}"` : ''} class="badge ${cls}" style="width:${size}px;height:${size}px;background:${PAL[pal][0]}">${svg(name, PAL[pal][1], Math.round(size * 0.56))}</div>`;
// 아바타
const av = (pi, size = 110, id = '', cls = '', style = '') => {
  const [bg, fg] = PAL[PK[pi % PK.length]];
  return `<div ${id ? `id="${id}"` : ''} class="av ${cls}" style="width:${size}px;height:${size}px;background:${bg};${style}"><svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="40" r="17" fill="${fg}"/><path d="M16 102c0-24 15-38 34-38s34 14 34 38z" fill="${fg}"/></svg></div>`;
};
const kick = (id, text, dot = CORAL) => `<div id="${id}" class="kick"><i style="background:${dot}"></i>${esc(text)}</div>`;

// ---------------------------------------------------------------------------
// 타임라인 헬퍼 — 전부 GSAP 코드 문자열을 돌려준다
// ---------------------------------------------------------------------------
const f = (n) => (+n).toFixed(3);
const q = (s) => `'${s}'`;
const opt = (o) => (o.st ? `,stagger:${o.st}` : '');
const A = {
  rise: (s, t, o = {}) => `tl.fromTo(${q(s)},{opacity:0,y:${o.y ?? 44}},{opacity:1,y:0,duration:${o.d ?? 0.8},ease:'${o.e ?? 'power3.out'}'${opt(o)}},${f(t)});`,
  drop: (s, t, o = {}) => `tl.fromTo(${q(s)},{opacity:0,y:${o.y ?? -60}},{opacity:1,y:0,duration:${o.d ?? 0.7},ease:'${o.e ?? 'back.out(1.6)'}'${opt(o)}},${f(t)});`,
  pop: (s, t, o = {}) => `tl.fromTo(${q(s)},{opacity:0,scale:${o.s ?? 0.4}},{opacity:1,scale:1,duration:${o.d ?? 0.7},ease:'back.out(${o.b ?? 1.8})'${opt(o)}},${f(t)});`,
  fade: (s, t, o = {}) => `tl.fromTo(${q(s)},{opacity:0},{opacity:${o.to ?? 1},duration:${o.d ?? 0.6},ease:'power1.out'${opt(o)}},${f(t)});`,
  slideX: (s, t, x, o = {}) => `tl.fromTo(${q(s)},{opacity:0,x:${x}},{opacity:1,x:0,duration:${o.d ?? 0.8},ease:'${o.e ?? 'power3.out'}'${opt(o)}},${f(t)});`,
  chars: (s, t, o = {}) => `tl.fromTo(${q(s + ' .ch')},{opacity:0,y:${o.y ?? 70},rotation:${o.r ?? 8}},{opacity:1,y:0,rotation:0,duration:${o.d ?? 0.8},ease:'power4.out',stagger:${o.st ?? 0.035}},${f(t)});`,
  mark: (s, t, o = {}) => `tl.fromTo(${q(s + ' .mk')},{scaleX:0},{scaleX:1,duration:${o.d ?? 0.7},ease:'power2.inOut'${opt(o)}},${f(t)});`,
  draw: (s, t, o = {}) => `tl.fromTo(${q(s)},{strokeDashoffset:1},{strokeDashoffset:0,duration:${o.d ?? 1},ease:'${o.e ?? 'power2.inOut'}'${opt(o)}},${f(t)});`,
  to: (s, t, props) => `tl.to(${q(s)},${props},${f(t)});`,
  set: (s, t, props) => `tl.set(${q(s)},${props},${f(t)});`,
  // 유한 반복 (repeat:-1 금지)
  loop: (s, t0, t1, from, to, per, o = {}) => {
    const n = Math.max(0, Math.floor((t1 - t0) / per) - 1);
    return `tl.fromTo(${q(s)},${from},{...${to},duration:${per},ease:'${o.e ?? 'sine.inOut'}',yoyo:${o.yoyo ?? true},repeat:${n},immediateRender:false${opt(o)}},${f(t0)});`;
  },
  bob: (s, t0, t1, amp = 12, per = 1.8, o = {}) => A.loop(s, t0, t1, '{y:0}', `{y:${-amp}}`, per, o),
  spin: (s, t0, t1, per = 6) => {
    const n = Math.max(0, Math.floor((t1 - t0) / per) - 1);
    return `tl.fromTo(${q(s)},{rotation:0},{rotation:360,duration:${per},ease:'none',repeat:${n}},${f(t0)});`;
  },
  count: (s, t, from, to, d) => {
    const out = [];
    for (let i = from; i <= to; i++) out.push(`tl.set(${q(s)},{textContent:'${i}'},${f(t + ((i - from) / Math.max(1, to - from)) * d)});`);
    return out.join('');
  },
};

// ---------------------------------------------------------------------------
// 씬 정의 — start 는 SRT 큐 시각. end 는 다음 씬의 start.
// ---------------------------------------------------------------------------
const scenes = [];
const S = (id, start, chapter, html, anim) => scenes.push({ id, start, chapter, html, anim });

// 공통: 상단 제목 블록 (kicker + h2)
const head = (id, k, h, o = {}) => `
  <div class="head" style="top:${o.top ?? 150}px">
    ${kick(`${id}-k`, k, o.dot)}
    <div id="${id}-h" class="h2" style="${o.size ? `font-size:${o.size}px` : ''}">${h}</div>
  </div>`;
const headAnim = (id, t, t2) => [A.rise(`#${id}-k`, t, { y: 24, d: 0.6 }), A.chars(`#${id}-h`, t2 ?? t + 0.15, { st: 0.028 })];

// 연결선이 있는 흐름 노드
const flowNode = (id, icon, pal, label, sub, l, t, w = 400) => `
  <div id="${id}" class="card fnode" style="${box(l, t, w, 330)}">
    <div class="fl">${badge(icon, pal, 150)}</div>
    <div class="fn-label">${label}</div>
    ${sub ? `<div class="fn-sub">${sub}</div>` : ''}
  </div>`;
const arrow = (id, l, t, w = 110) =>
  `<svg id="${id}" class="arrow" style="${box(l, t, w, 60)}" viewBox="0 0 ${w} 60"><path class="dr" pathLength="1" d="M6 30H${w - 14}" stroke="${INK2}" stroke-width="5" stroke-linecap="round" fill="none"/><path id="${id}-hd" d="M${w - 30} 14l18 16-18 16" stroke="${INK2}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
const arrowAnim = (id, t) => [A.draw(`#${id} .dr`, t, { d: 0.5 }), A.fade(`#${id}-hd`, t + 0.35, { d: 0.25 })];

// 결정적 의사난수 (빌드 시점에만 사용, 런타임에는 값만 박힘)
let seed = 27;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ─── S01 · 타이틀 (0.00 – 6.19) ───────────────────────────────────────────
S('s01', 0, '모집 공고', `
  <div class="ring-deco" id="s01-ring" style="${box(560, 90, 800, 800)}"></div>
  <div class="ring-deco thin" id="s01-ring2" style="${box(460, -10, 1000, 1000)}"></div>
  <div class="orb-ic" id="s01-o1" style="${box(250, 250)}"><div class="fl">${badge('laptop', 'lav', 170)}</div></div>
  <div class="orb-ic" id="s01-o2" style="${box(1500, 220)}"><div class="fl">${badge('heart', 'rose', 150)}</div></div>
  <div class="orb-ic" id="s01-o3" style="${box(330, 600)}"><div class="fl">${badge('sparkle', 'butter', 130)}</div></div>
  <div class="orb-ic" id="s01-o4" style="${box(1470, 580)}"><div class="fl">${badge('people', 'mint', 170)}</div></div>
  <div class="center-col" style="top:120px;bottom:210px">
    ${kick('s01-k', '2026 · 봉사단원 모집')}
    <div id="s01-t1" class="h1" style="margin-top:34px">${W('필로소피 AI 봉사단')}</div>
    <div id="s01-t2" class="h1 t2">${W('2기', 'coral')} ${W('모집')}
      <svg id="s01-sw" class="swoosh" viewBox="0 0 600 60" style="${box(-20, 120, 560, 50)}"><path class="dr" pathLength="1" d="M8 40C120 12 300 8 590 30" stroke="${CORAL}" stroke-width="10" fill="none" stroke-linecap="round"/></svg>
    </div>
    <div id="s01-q" class="p" style="margin-top:44px">AI로 교육자를 돕는 사람들을 찾습니다</div>
  </div>`,
  (e) => [
    A.fade('#s01-ring', 0.05, { d: 1.2 }), A.fade('#s01-ring2', 0.2, { d: 1.2 }),
    A.spin('#s01-ring', 0, e, 40), A.spin('#s01-ring2', 0, e, 60),
    A.rise('#s01-k', 0.15, { y: 20 }),
    A.chars('#s01-t1', 0.3, { st: 0.045 }),
    A.chars('#s01-t2', 0.95, { st: 0.07, y: 90 }),
    A.draw('#s01-sw .dr', 1.5, { d: 0.9 }),
    A.pop('#s01-o1', 0.7), A.pop('#s01-o2', 0.9), A.pop('#s01-o3', 1.1), A.pop('#s01-o4', 1.3),
    A.bob('#s01-o1 .fl', 1.5, e, 14, 2.2), A.bob('#s01-o2 .fl', 1.7, e, 12, 1.9), A.bob('#s01-o3 .fl', 1.9, e, 10, 2.4), A.bob('#s01-o4 .fl', 2.1, e, 14, 2.0),
    A.rise('#s01-q', 2.9, { y: 24 }),
  ]);

// ─── S02 · 신청 대상 (6.19 – 12.22) ───────────────────────────────────────
S('s02', 6.19, '신청 대상', `
  ${head('s02', '신청 대상', W('이런 분을 모십니다'))}
  <div id="s02-a" class="card tcard" style="${box(250, 390, 620, 420)}">
    ${badge('sparkle', 'lav', 130)}
    <div class="h3" style="margin-top:28px">AI <span style="color:${PAL.lav[1]}">Advanced</span> 레벨</div>
    <div class="p sm">AI를 능숙하게 다루시는 분</div>
    <div class="meter">${[1, 2, 3, 4, 5].map((i) => `<span id="s02-m${i}"></span>`).join('')}</div>
    <div class="meter-l"><span>Beginner</span><span>Advanced</span></div>
  </div>
  <div id="s02-plus" class="op" style="${box(905, 540, 110, 110)}">+</div>
  <div id="s02-b" class="card tcard" style="${box(1050, 390, 620, 420)}">
    <div id="s02-hb">${badge('heart', 'rose', 130)}</div>
    <div class="h3" style="margin-top:28px">돕는 <span style="color:${PAL.rose[1]}">마음</span></div>
    <div class="p sm">누군가를 돕는 일에 뜻이 있으신 분</div>
    <div class="hands">${[0, 1, 2].map((i) => av(i + 3, 76, `s02-av${i}`)).join('')}</div>
  </div>`,
  (e) => [
    ...headAnim('s02', 6.25),
    A.rise('#s02-a', 6.5, { y: 70 }),
    ...[1, 2, 3, 4, 5].map((i) => `tl.fromTo('#s02-m${i}',{scaleY:.2,background:'#ece7f5'},{scaleY:1,background:'${PAL.lav[1]}',duration:.35,ease:'back.out(2)'},${f(7.1 + i * 0.2)});`),
    A.pop('#s02-plus', 8.45),
    A.rise('#s02-b', 8.6, { y: 70 }),
    A.pop('#s02-av0,#s02-av1,#s02-av2', 9.3, { st: 0.12 }),
    A.loop('#s02-hb', 9.6, e, '{scale:1}', '{scale:1.1}', 0.45),
  ]);

// ─── S03 · 교육자가 아니어도 OK (12.22 – 22.81) ───────────────────────────
S('s03', 12.22, '신청 대상', `
  <div id="s03-stamp" class="stamp" style="${box(360, 190, 330, 330)}">
    <div class="stamp-in"><span>OK</span><small>누구나</small></div>
  </div>
  <div id="s03-t" class="h2 lcol" style="${box(150, 570, 750)}">${W('꼭 교육자가')}<br>${W('아니어도')} ${M(W('괜찮아요'), PAL.mint[0])}</div>
  <div id="s03-card" class="card" style="${box(980, 190, 790, 640)}">
    ${kick('s03-k', '단, 이것만 부탁드려요', PAL.butter[1])}
    <div class="flow3">
      <div id="s03-scr" class="fl-item">${badge('screen', 'sky', 180)}<span>AI 발표</span></div>
      ${arrow('s03-ar', 0, 0, 120).replace('style="left:0px;top:0px;width:120px;height:60px;"', 'style="position:relative;width:120px;height:60px;flex:0 0 auto"')}
      <div id="s03-edu" class="fl-item"><div class="avs">${[0, 1, 2].map((i) => av([0, 2, 4][i], 96, `s03-a${i}`)).join('')}</div><span>교육자</span></div>
    </div>
    <div id="s03-h" class="h3 c" style="margin-top:36px">교육자분들께 ${M('도움이 되는 발표', PAL.butter[0])}</div>
    <div id="s03-pill" class="pill ok">${svg('check', PAL.mint[1], 44)}<span>준비해 주시면 됩니다</span></div>
  </div>`,
  (e) => [
    `tl.fromTo('#s03-stamp',{opacity:0,scale:1.8,rotation:-24},{opacity:1,scale:1,rotation:-8,duration:.55,ease:'power4.in'},12.3);`,
    `tl.fromTo('#s03-stamp',{scale:1},{scale:1.06,duration:.12,yoyo:true,repeat:1,ease:'power1.out'},12.87);`,
    A.chars('#s03-t', 12.55, { st: 0.03 }),
    A.mark('#s03-t', 13.6),
    A.slideX('#s03-card', 13.9, 90),
    A.rise('#s03-k', 14.94, { y: 20 }),
    A.pop('#s03-scr', 15.6),
    ...arrowAnim('s03-ar', 17.2),
    A.pop('#s03-a0,#s03-a1,#s03-a2', 18.76, { st: 0.12 }),
    A.fade('#s03-edu span', 19.1),
    A.rise('#s03-h', 19.0, { y: 24 }),
    A.mark('#s03-h', 19.7),
    A.pop('#s03-pill', 20.95, { s: 0.7 }),
  ]);

// ─── S04 · 지원 가능 공식 (22.81 – 30.67) ─────────────────────────────────
const confetti = Array.from({ length: 18 }, (_, i) => {
  const ang = (i / 18) * Math.PI * 2 + rnd() * 0.3;
  const dist = 150 + rnd() * 120;
  return { i, x: Math.cos(ang) * dist, y: Math.sin(ang) * dist * 0.75, c: PAL[PK[i % 6]][1], r: rnd() * 180, s: 12 + Math.round(rnd() * 12) };
});
S('s04', 22.81, '신청 대상', `
  ${head('s04', '지원 자격 한눈에', W('이런 분이라면 지원 가능해요'))}
  <div class="eq" style="top:440px">
    <div id="s04-p1" class="card eqc">${badge('person', 'sky', 110)}<div><small>꼭</small>교육자가 아니어도</div></div>
    <div id="s04-op1" class="op">+</div>
    <div id="s04-p2" class="card eqc">${badge('screen', 'butter', 110)}<div><small>교육자분들께</small>도움이 될 발표</div></div>
    <div id="s04-op2" class="op">=</div>
    <div id="s04-p3" class="eqc res">
      ${confetti.map((c) => `<span class="cf" id="s04-cf${c.i}" style="background:${c.c};width:${c.s}px;height:${c.s * 0.6}px"></span>`).join('')}
      ${svg('check', 'rgba(255,255,255,.35)', 84)}<div>지원 가능!</div>
    </div>
  </div>
  <div id="s04-note" class="p c abs" style="${box(0, 720, 1920)}">본인이 교육자가 아니어도, <b>교육자를 도울 수 있다면</b> 충분합니다</div>`,
  (e) => [
    ...headAnim('s04', 22.9),
    A.rise('#s04-p1', 23.1, { y: 60 }),
    A.pop('#s04-op1', 25.4),
    A.rise('#s04-p2', 25.6, { y: 60 }),
    A.pop('#s04-op2', 27.9),
    A.pop('#s04-p3', 28.1, { s: 0.3, b: 2.2 }),
    ...confetti.map((c) => `tl.fromTo('#s04-cf${c.i}',{x:0,y:0,opacity:1,rotation:0},{x:${f(c.x)},y:${f(c.y)},opacity:0,rotation:${f(c.r)},duration:1.3,ease:'power3.out'},28.25);`),
    A.rise('#s04-note', 28.9, { y: 20 }),
  ]);

// ─── S05 · 2주에 한 번 (30.67 – 40.89) ────────────────────────────────────
const cal = Array.from({ length: 35 }, (_, i) => i);
const hot = [3, 17, 31];
const ringAv = Array.from({ length: 6 }, (_, i) => {
  const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
  return { i, x: Math.cos(a) * 210, y: Math.sin(a) * 210 };
});
S('s05', 30.67, '활동 내용', `
  ${head('s05', '활동 ① · 격주 AI 발표', `${M(W('2주에 한 번'), PAL.peach[0])} ${W('AI 발표')}`)}
  <div id="s05-cal" class="card" style="${box(230, 380, 700, 450)}">
    <div class="cal-h"><b>격주 발표</b><span>MON TUE WED THU FRI SAT SUN</span></div>
    <div class="cal-g">${cal.map((i) => `<span id="s05-c${i}" class="${hot.includes(i) ? 'hot' : ''}">${hot.includes(i) ? svg('mic', '#fff', 30) : ''}</span>`).join('')}</div>
  </div>
  <div id="s05-ring" class="rring" style="${box(1130, 360, 520, 520)}">
    <div class="rring-line"></div>
    <div id="s05-spot" class="spot" style="left:${260 + ringAv[0].x - 72}px;top:${260 + ringAv[0].y - 72}px"></div>
    ${ringAv.map((p) => av(p.i, 110, `s05-a${p.i}`, 'abs', `left:${260 + p.x - 55}px;top:${260 + p.y - 55}px`)).join('')}
    <div id="s05-rc" class="rring-c">${svg('rotate', PAL.peach[1], 70)}<b>돌아가며<br>발표</b></div>
  </div>`,
  (e) => [
    ...headAnim('s05', 30.75),
    A.mark('#s05-h', 31.6),
    A.rise('#s05-cal', 31.2, { y: 60 }),
    A.fade('#s05-cal .cal-g span', 31.5, { st: 0.012, d: 0.3 }),
    ...hot.map((h, k) => A.pop(`#s05-c${h}`, 32.4 + k * 0.7, { s: 0.2, b: 2.4 })),
    A.loop('#s05-cal .cal-g .hot', 35, 40.5, '{scale:1}', '{scale:1.12}', 0.6),
    A.fade('#s05-ring .rring-line', 34.0, { d: 0.8 }),
    A.pop('#s05-ring .av', 34.2, { st: 0.1 }),
    A.pop('#s05-rc', 36.64),
    A.fade('#s05-spot', 36.8, { d: 0.3 }),
    ...[1, 2, 3, 4, 5].map((k) => A.to('#s05-spot', 36.8 + k * 0.72, `{x:${f(ringAv[k].x - ringAv[0].x)},y:${f(ringAv[k].y - ringAv[0].y)},duration:.5,ease:'power2.inOut'}`)),
    A.spin('#s05-rc svg', 36.64, e, 4),
  ]);

// ─── S06 · 이슈와 기술을 모아서 (40.89 – 52.14) ────────────────────────────
const issueChips = ['새로운 AI 모델', 'AI 교육 정책', 'AI 윤리 이슈'];
const techChips = ['프롬프트 활용', '업무 자동화', 'AI 에이전트'];
S('s06', 40.89, '활동 내용', `
  ${head('s06', '활동 ① · 발표 준비', W('모으고, 정리하고, 나눕니다'))}
  <div class="chip-col" style="${box(150, 360, 330)}">
    <div id="s06-ha" class="col-h" style="color:${PAL.lav[1]}">최신 AI 이슈</div>
    ${issueChips.map((c, i) => `<div id="s06-i${i}" class="chip" style="background:${PAL.lav[0]}">${c}</div>`).join('')}
  </div>
  <div class="chip-col" style="${box(520, 360, 330)}">
    <div id="s06-hb" class="col-h" style="color:${PAL.mint[1]}">AI 기술</div>
    ${techChips.map((c, i) => `<div id="s06-t${i}" class="chip" style="background:${PAL.mint[0]}">${c}</div>`).join('')}
  </div>
  <svg id="s06-lines" class="abs" style="${box(0, 0, 1920, 1080)}" viewBox="0 0 1920 1080">
    ${[480, 572, 664].map((y, i) => `<path class="dr" pathLength="1" d="M860 ${y + 26}C940 ${y + 26} 960 600 1040 600" stroke="${PAL.lav[1]}" stroke-width="4" fill="none" opacity=".55"/>`).join('')}
  </svg>
  <div id="s06-lens" class="lens" style="${box(1000, 510, 180, 180)}">${svg('bulb', PAL.butter[1], 100)}</div>
  ${[0, 1, 2].map((i) => `<span id="s06-d${i}" class="dot" style="left:1180px;top:593px"></span>`).join('')}
  <div id="s06-out" class="card slide" style="${box(1250, 350, 520, 480)}">
    <div class="slide-top"><i></i><i></i><i></i></div>
    <div class="slide-body">
      ${badge('screen', 'peach', 120)}
      <div class="h3" style="font-size:44px;margin-top:22px">교육자를 위한<br>AI 발표</div>
      <div id="s06-rot" class="pill" style="margin-top:22px">${svg('rotate', PAL.peach[1], 36)}<span>돌아가며 진행</span></div>
    </div>
  </div>`,
  (e) => [
    ...headAnim('s06', 40.95),
    A.rise('#s06-ha', 41.0, { y: 20 }),
    A.slideX('#s06-i0,#s06-i1,#s06-i2', 41.3, -60, { st: 0.35 }),
    A.rise('#s06-hb', 44.78, { y: 20 }),
    A.slideX('#s06-t0,#s06-t1,#s06-t2', 45.0, -60, { st: 0.3 }),
    A.draw('#s06-lines .dr', 46.2, { d: 0.9, st: 0.12 }),
    A.pop('#s06-lens', 46.7),
    A.loop('#s06-lens', 47.5, e, '{boxShadow:"0 0 0 0px rgba(235,187,79,.35)"}', '{boxShadow:"0 0 0 26px rgba(235,187,79,0)"}', 1.2, { yoyo: false }),
    ...[0, 1, 2].map((i) => A.loop(`#s06-d${i}`, 47.4 + i * 0.4, e, '{x:0,opacity:1}', '{x:70,opacity:0}', 1.2, { yoyo: false, e: 'power1.in' })),
    A.slideX('#s06-out', 47.3, 80),
    A.pop('#s06-rot', 50.1, { s: 0.7 }),
    A.spin('#s06-rot svg', 50.1, e, 3),
  ]);

// ─── S07 · 3~4개월마다 오프라인 행사 (52.14 – 57.66) ──────────────────────
const tlDots = Array.from({ length: 17 }, (_, i) => 220 + i * 92);
const pins = [{ x: 590, t: 54.2 }, { x: 1050, t: 54.7 }, { x: 1510, t: 55.3 }];
S('s07', 52.14, '활동 내용', `
  ${head('s07', '활동 ② · 오프라인 행사', `${M(W('3~4개월'), PAL.mint[0])}${W('마다 오프라인 행사')}`)}
  <svg id="s07-axis" class="abs" style="${box(0, 0, 1920, 1080)}" viewBox="0 0 1920 1080">
    <path class="dr" pathLength="1" d="M200 700H1720" stroke="${INK2}" stroke-width="5" stroke-linecap="round" opacity=".45"/>
  </svg>
  ${tlDots.map((x, i) => `<span id="s07-d${i}" class="tdot" style="left:${x - 11}px;top:689px"></span>`).join('')}
  ${pins.map((p, i) => `<div id="s07-p${i}" class="pin" style="left:${p.x - 110}px;top:400px">${badge('people', ['mint', 'peach', 'lav'][i], 130)}<b>오프라인 행사</b><i></i></div>`).join('')}
  <div id="s07-leg" class="legend" style="${box(200, 760)}"><span class="tdot st"></span>2주마다 AI 발표 <span class="gap"></span>${svg('people', PAL.mint[1], 34)} 발표 내용을 모은 오프라인 행사</div>`,
  (e) => [
    ...headAnim('s07', 52.2),
    A.mark('#s07-h', 53.2),
    A.draw('#s07-axis .dr', 52.5, { d: 1.3 }),
    A.pop(tlDots.map((_, i) => `#s07-d${i}`).join(','), 52.7, { st: 0.07, s: 0 }),
    ...pins.map((p, i) => A.drop(`#s07-p${i}`, p.t, { y: -80 })),
    A.rise('#s07-leg', 55.8, { y: 16 }),
  ]);

// ─── S08 · 교육자들이 AI를 배우는 자리 (57.66 – 67.89) ─────────────────────
const seat = [];
[[5, 610], [6, 690], [7, 770]].forEach(([n, y], r) => {
  for (let i = 0; i < n; i++) seat.push({ x: 1290 - ((n - 1) * 104) / 2 + i * 104, y, k: seat.length });
});
S('s08', 57.66, '활동 내용', `
  <div class="lcol" style="${box(150, 250, 700)}">
    ${kick('s08-k', '활동 ② · 오프라인 행사')}
    <div id="s08-h1" class="h2" style="margin-top:28px">${W('교육자분들이')}</div>
    <div id="s08-h2" class="h2">${M(W('AI 기술'), PAL.sky[0])}${W('을 배우는')}</div>
    <div id="s08-h3" class="h2">${W('자리를 만듭니다')}</div>
    <div id="s08-p" class="p" style="margin-top:26px">함께 모여, 함께 배우는 오프라인 행사</div>
  </div>
  <div id="s08-stage" class="card stage" style="${box(930, 200, 720, 360)}">
    <div class="stage-scr">
      <div class="bars">${[40, 62, 50, 86, 72].map((h, i) => `<i id="s08-b${i}" style="height:${h}%"></i>`).join('')}</div>
      <div class="stage-ai">AI</div>
    </div>
  </div>
  ${seat.map((s) => av(s.k, 92, `s08-s${s.k}`, 'abs seat', `left:${s.x - 46}px;top:${s.y - 46}px`)).join('')}
  ${[0, 1, 2, 3].map((i) => `<div id="s08-sp${i}" class="abs" style="left:${1000 + i * 190}px;top:540px">${svg(i % 2 ? 'heart' : 'sparkle', i % 2 ? PAL.rose[1] : PAL.butter[1], 44)}</div>`).join('')}`,
  (e) => [
    A.rise('#s08-k', 57.75, { y: 20 }),
    A.chars('#s08-h1', 59.62),
    A.chars('#s08-h2', 63.0), A.mark('#s08-h2', 63.7),
    A.chars('#s08-h3', 65.61),
    A.rise('#s08-p', 66.3, { y: 16 }),
    A.rise('#s08-stage', 58.0, { y: 60 }),
    `tl.fromTo('#s08-stage .bars i',{scaleY:0},{scaleY:1,duration:.6,ease:'back.out(1.6)',stagger:.1},58.7);`,
    A.pop('#s08-stage .stage-ai', 59.3),
    A.pop('.seat', 60.0, { st: 0.12, s: 0.2 }),
    ...[0, 1, 2, 3].map((i) => A.loop(`#s08-sp${i}`, 63.2 + i * 0.5, e, '{y:0,opacity:0,scale:.6}', '{y:-120,opacity:1,scale:1.1}', 1.6, { yoyo: false, e: 'power1.out' })),
  ]);

// ─── S09 · 촬영·편집해서 유튜브로 (67.89 – 74.68) ─────────────────────────
S('s09', 67.89, '활동 내용', `
  ${head('s09', '기록하고 나눕니다', W('발표와 행사를 영상으로'))}
  ${flowNode('s09-n1', 'mic', 'peach', 'AI 발표 · 오프라인 행사', '', 170, 420, 440)}
  ${arrow('s09-ar1', 640, 555)}
  ${flowNode('s09-n2', 'camera', 'lav', '촬영 · 편집', '', 780, 420, 380)}
  <span id="s09-rec" class="rec" style="left:1090px;top:448px">REC</span>
  ${arrow('s09-ar2', 1190, 555)}
  ${flowNode('s09-n3', 'play', 'rose', '유튜브 채널 업로드', '', 1330, 420, 420)}
  <div id="s09-bar" class="pbar" style="left:1400px;top:710px;width:280px"><i></i></div>`,
  (e) => [
    ...headAnim('s09', 67.95),
    A.rise('#s09-n1', 68.1, { y: 60 }),
    ...arrowAnim('s09-ar1', 70.4),
    A.rise('#s09-n2', 70.76, { y: 60 }),
    A.fade('#s09-rec', 71.3, { d: 0.2 }),
    `tl.to('#s09-rec',{opacity:.25,duration:.5,yoyo:true,repeat:${Math.max(0, Math.floor((e - 71.6) / 0.5) - 1)},ease:'sine.inOut'},71.6);`,
    ...arrowAnim('s09-ar2', 72.0),
    A.rise('#s09-n3', 72.38, { y: 60 }),
    A.fade('#s09-bar', 72.9, { d: 0.3 }),
    `tl.fromTo('#s09-bar i',{scaleX:0},{scaleX:1,duration:1.6,ease:'power1.inOut'},73.0);`,
  ]);

// ─── S10 · 모집 안내 (74.68 – 88.40) ──────────────────────────────────────
const months = ['11', '12', '1', '2', '3', '4', '5', '6'];
S('s10', 74.68, '모집 안내', `
  <div id="s10-card" class="card info" style="${box(230, 150, 1460, 700)}">
    ${kick('s10-k', '모집 안내')}
    <div id="s10-r1" class="irow">
      ${badge('calendar', 'peach', 110)}
      <div class="ilab">모집 기간</div>
      <div class="ival">~ 2026년 <b>10월 31일</b>까지</div>
    </div>
    <div id="s10-r2" class="irow">
      ${badge('flag', 'mint', 110)}
      <div class="ilab">활동 기간</div>
      <div class="ival">2026년 11월 ~ 2027년 6월
        <div class="mbar">${months.map((m, i) => `<span id="s10-m${i}"><i></i>${m}월</span>`).join('')}</div>
      </div>
    </div>
    <div id="s10-r3" class="irow">
      ${badge('mail', 'lav', 110)}
      <div class="ilab">신청 방법</div>
      <div class="ival"><span class="email">dearname27@naver.com</span><small>으로 메일을 보내주세요</small></div>
    </div>
  </div>
  <div id="s10-env" class="abs" style="left:1560px;top:640px">${svg('mail', CORAL, 110)}</div>`,
  (e) => [
    A.rise('#s10-card', 74.72, { y: 50 }),
    A.rise('#s10-k', 74.9, { y: 16 }),
    A.slideX('#s10-r1', 75.0, -60),
    A.slideX('#s10-r2', 78.29, -60),
    `tl.fromTo('#s10-card .mbar i',{scaleX:0},{scaleX:1,duration:.3,ease:'power2.out',stagger:.14},79.3);`,
    A.slideX('#s10-r3', 82.69, -60),
    `tl.fromTo('#s10-card .email',{backgroundSize:'0% 38%'},{backgroundSize:'100% 38%',duration:.8,ease:'power2.inOut'},83.6);`,
    `tl.fromTo('#s10-env',{opacity:0,x:-700,y:40,rotation:-12},{opacity:1,x:0,y:0,rotation:8,duration:1.1,ease:'power3.out'},84.2);`,
    A.bob('#s10-env', 85.4, e, 10, 1.4),
  ]);

// ─── S11 · 1기 이야기 (88.40 – 100.24) ────────────────────────────────────
S('s11', 88.4, '1기 이야기', `
  ${head('s11', '2026 상반기 · 봉사단 1기', W('1기가 함께 만든 변화'))}
  <div id="s11-a" class="card stat" style="${box(200, 380, 480, 440)}">
    ${badge('book', 'sky', 120)}
    <div class="num"><span id="s11-n1">0</span><small>회</small></div>
    <div class="p sm">스터디 개최</div>
  </div>
  <div id="s11-b" class="card stat" style="${box(720, 380, 480, 440)}">
    ${badge('laptop', 'lav', 120)}
    <div class="num"><span id="s11-n2">0</span><small>대</small></div>
    <div class="p sm">참가비로 리퍼 노트북 구매</div>
  </div>
  <div id="s11-c" class="card stat hi" style="${box(1240, 380, 480, 440)}">
    <div id="s11-hb">${badge('heart', 'rose', 120)}</div>
    <div class="num word">전달</div>
    <div class="p sm">보육원 · 지역아동센터<br>아동들에게</div>
  </div>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<div id="s11-h${i}" class="abs" style="left:${1320 + i * 58}px;top:400px">${svg('heart', PAL.rose[1], 34)}</div>`).join('')}`,
  (e) => [
    ...headAnim('s11', 88.45),
    A.rise('#s11-a', 92.2, { y: 60 }),
    A.count('#s11-n1', 92.6, 0, 3, 0.6),
    A.rise('#s11-b', 94.4, { y: 60 }),
    A.count('#s11-n2', 94.8, 0, 5, 0.9),
    A.rise('#s11-c', 96.5, { y: 60 }),
    A.loop('#s11-hb', 97.3, e, '{scale:1}', '{scale:1.1}', 0.45),
    ...[0, 1, 2, 3, 4, 5].map((i) => A.loop(`#s11-h${i}`, 97.4 + i * 0.25, e, '{y:0,opacity:0}', '{y:-110,opacity:1}', 1.5, { yoyo: false, e: 'power1.out' })),
  ]);

// ─── S12 · 논문 인용 (100.24 – 109.43) ─────────────────────────────────────
S('s12', 100.24, '왜 시작하나요', `
  <div id="s12-paper" class="paper" style="${box(230, 230, 460, 580)}">
    <div class="paper-t"></div><div class="paper-t s"></div>
    ${Array.from({ length: 9 }, (_, i) => `<div class="paper-l" style="width:${[92, 86, 90, 70, 94, 88, 60, 90, 78][i]}%"></div>`).join('')}
    <div id="s12-hl" class="paper-hl"></div>
    <div class="paper-badge">${svg('book', PAL.sky[1], 64)}</div>
  </div>
  <div class="lcol" style="${box(800, 220, 950)}">
    ${kick('s12-k', '손정배 교수님의 논문에서', PAL.sky[1])}
    <div class="quote-mark" data-layout-allow-overlap>“</div>
    <div id="s12-q1" class="h2 q">${W('앞으로 교육자는')}</div>
    <div id="s12-q2" class="h2 q">${W('AI를')} ${M(W('계속 공부해야 하는'), PAL.sky[0])}</div>
    <div id="s12-q3" class="h2 q">${W('세상이 옵니다')}</div>
  </div>`,
  (e) => [
    `tl.fromTo('#s12-paper',{opacity:0,y:80,rotation:-10},{opacity:1,y:0,rotation:-4,duration:1,ease:'power3.out'},100.3);`,
    `tl.fromTo('#s12-paper .paper-l',{scaleX:0},{scaleX:1,duration:.4,ease:'power2.out',stagger:.06},100.8);`,
    `tl.fromTo('#s12-hl',{scaleX:0},{scaleX:1,duration:.7,ease:'power2.inOut'},104.4);`,
    A.rise('#s12-k', 100.4, { y: 20 }),
    A.pop('#s12-paper .quote-mark, .quote-mark', 100.9, { s: 0.3 }),
    A.chars('#s12-q1', 102.44),
    A.chars('#s12-q2', 104.19),
    A.mark('#s12-q2', 105.3),
    A.chars('#s12-q3', 107.47),
  ]);

// ─── S13 · 공유하는 커뮤니티 (109.43 – 120.06) ────────────────────────────
const net = Array.from({ length: 6 }, (_, i) => {
  const a = -Math.PI / 2 + (i / 6) * Math.PI * 2 + Math.PI / 6;
  return { i, x: 960 + Math.cos(a) * 520, y: 590 + Math.sin(a) * 215 };
});
S('s13', 109.43, '왜 시작하나요', `
  ${head('s13', '논문이 말하는 해법', `${W('서로')} ${M(W('공유하고, 알려주는'), PAL.mint[0])} ${W('커뮤니티')}`, { size: 70 })}
  <svg id="s13-net" class="abs" style="${box(0, 0, 1920, 1080)}" viewBox="0 0 1920 1080">
    ${net.map((n) => `<path class="dr sp" pathLength="1" d="M960 590L${f(n.x)} ${f(n.y)}" stroke="${PAL.mint[1]}" stroke-width="4" opacity=".6" fill="none"/>`).join('')}
    ${net.map((n, i) => { const m = net[(i + 1) % 6]; return `<path class="dr rim" pathLength="1" d="M${f(n.x)} ${f(n.y)}L${f(m.x)} ${f(m.y)}" stroke="${PAL.lav[1]}" stroke-width="3" stroke-dasharray="1" opacity=".35" fill="none"/>`; }).join('')}
  </svg>
  ${net.map((n) => `<span id="s13-pd${n.i}" class="dot big" style="left:951px;top:581px"></span>`).join('')}
  <div id="s13-c" class="hub" style="${box(830, 460, 260, 260)}">${svg('people', CORAL, 96)}<b>교육자<br>AI 커뮤니티</b></div>
  ${net.map((n) => av(n.i, 116, `s13-n${n.i}`, 'abs node', `left:${f(n.x - 58)}px;top:${f(n.y - 58)}px`)).join('')}
  <div id="s13-src" class="src" style="${box(0, 830, 1920)}">— 손정배 교수님 논문 중</div>`,
  (e) => [
    ...headAnim('s13', 109.5),
    A.mark('#s13-h', 110.6),
    A.pop('#s13-c', 109.8, { s: 0.3 }),
    A.pop('#s13-net ~ .node, .node', 110.1, { st: 0.12, s: 0.2 }),
    A.draw('#s13-net .sp', 110.8, { d: 0.8, st: 0.1 }),
    A.draw('#s13-net .rim', 111.8, { d: 0.8, st: 0.08 }),
    ...net.map((n) => A.loop(`#s13-pd${n.i}`, 113.6 + n.i * 0.18, e, '{x:0,y:0,opacity:1}', `{x:${f(n.x - 960)},y:${f(n.y - 590)},opacity:.2}`, 1.3, { yoyo: false, e: 'power1.inOut' })),
    A.loop('#s13-c', 116.2, e, '{scale:1}', '{scale:1.06}', 0.8),
    A.rise('#s13-src', 118.7, { y: 12 }),
  ]);

// ─── S14 · 그래서 만듭니다 (120.06 – 123.55) ──────────────────────────────
S('s14', 120.06, '왜 시작하나요', `
  ${[0, 1, 2].map((i) => `<div id="s14-r${i}" class="ripple" style="${box(560, 140, 800, 800)}"></div>`).join('')}
  <div class="center-col" style="top:130px;bottom:220px">
    <div id="s14-a" class="p" style="font-size:44px;font-weight:700">그래서,</div>
    <div id="s14-t1" class="h1" style="font-size:108px;margin-top:18px">${W('교육자를 위한')}</div>
    <div id="s14-t2" class="h1 t2" style="font-size:108px">${W('AI 커뮤니티', 'coral')}${W('를 만듭니다')}
      <svg id="s14-sw" class="swoosh" viewBox="0 0 600 60" style="${box(0, 108, 560, 46)}"><path class="dr" pathLength="1" d="M8 40C120 12 300 8 590 30" stroke="${PAL.butter[1]}" stroke-width="10" fill="none" stroke-linecap="round"/></svg>
    </div>
  </div>`,
  (e) => [
    ...[0, 1, 2].map((i) => `tl.fromTo('#s14-r${i}',{scale:.2,opacity:.8},{scale:1.4,opacity:0,duration:2.2,ease:'power2.out'},${f(120.1 + i * 0.5)});`),
    A.rise('#s14-a', 120.1, { y: 20 }),
    A.chars('#s14-t1', 120.4, { st: 0.04 }),
    A.chars('#s14-t2', 121.0, { st: 0.04 }),
    A.draw('#s14-sw .dr', 121.9, { d: 0.7 }),
  ]);

// ─── S15 · 운영 방식 3단계 (123.55 – 143.37) ──────────────────────────────
const steps = [
  { n: '01', ic: 'sparkle', p: 'lav', t: '고급 AI 활용자', d: 'AI를 잘 다루시는<br>Advanced 레벨 분들과', at: 123.6 },
  { n: '02', ic: 'rotate', p: 'peach', t: '격주 순환 발표', d: '2주에 한 번씩<br>돌아가며 AI 발표', at: 125.9 },
  { n: '03', ic: 'heart', p: 'mint', t: '교육자를 위한 내용', d: '교육 현장에 도움이 되는<br>방향으로 진행', at: 135.4 },
];
S('s15', 123.55, '활동 계획', `
  ${head('s15', '커뮤니티 운영 방식', W('이렇게 함께합니다'))}
  ${steps.map((s, i) => `
  <div id="s15-c${i}" class="card step" style="${box(170 + i * 550, 380, 480, 430)}">
    <div id="s15-g${i}" class="glow" style="box-shadow:0 0 0 6px ${PAL[s.p][1]}"></div>
    <div class="step-n" style="color:${PAL[s.p][1]}">${s.n}</div>
    <div id="s15-i${i}" class="fl">${badge(s.ic, s.p, 130)}</div>
    <div class="h3" style="font-size:46px;margin-top:26px">${s.t}</div>
    <div class="p sm">${s.d}</div>
  </div>`).join('')}
  ${[0, 1].map((i) => arrow(`s15-ar${i}`, 650 + i * 550, 565, 70)).join('')}`,
  (e) => [
    ...headAnim('s15', 123.6),
    ...steps.map((s, i) => A.rise(`#s15-c${i}`, s.at + 0.1, { y: 70 })),
    ...arrowAnim('s15-ar0', 125.7), ...arrowAnim('s15-ar1', 135.2),
    A.fade('#s15-g0', 124.0, { d: 0.4 }), A.to('#s15-g0', 125.9, '{opacity:0,duration:.4}'),
    A.fade('#s15-g1', 126.2, { d: 0.4 }), A.to('#s15-g1', 135.4, '{opacity:0,duration:.4}'),
    A.fade('#s15-g2', 135.7, { d: 0.4 }),
    A.spin('#s15-i1 svg', 126.3, e, 3),
    A.bob('#s15-i0', 124.4, e, 8, 1.6), A.loop('#s15-i2', 136.2, e, '{scale:1}', '{scale:1.08}', 0.5),
    A.to('#s15-g0,#s15-g1', 140.6, '{opacity:1,duration:.5,stagger:.15}'),
  ]);

// ─── S16 · 발표 → 행사 → 영상 → 알림 (143.37 – 159.65) ─────────────────────
const pipe = [
  { ic: 'doc', p: 'sky', t: '발표 내용', at: 143.45, x: 300, y: 560 },
  { ic: 'people', p: 'mint', t: '3개월마다<br>오프라인 행사', at: 144.7, x: 760, y: 470 },
  { ic: 'camera', p: 'lav', t: '촬영 · 편집', at: 152.81, x: 1200, y: 560 },
  { ic: 'mega', p: 'peach', t: '채널로<br>널리 알리기', at: 154.75, x: 1630, y: 470 },
];
const seg = (a, b) => `M${a.x} ${a.y}C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
S('s16', 143.37, '활동 계획', `
  ${head('s16', '발표, 그 다음', W('발표가 행사로, 행사가 영상으로'))}
  <svg id="s16-path" class="abs" style="${box(0, 0, 1920, 1080)}" viewBox="0 0 1920 1080">
    ${[0, 1, 2].map((i) => `<path id="s16-s${i}" class="dr" pathLength="1" d="${seg(pipe[i], pipe[i + 1])}" stroke="${CORAL}" stroke-width="6" stroke-linecap="round" fill="none" opacity=".6"/>`).join('')}
  </svg>
  ${pipe.map((p, i) => `<div id="s16-n${i}" class="pnode" style="left:${p.x - 90}px;top:${p.y - 90}px"><div class="fl">${badge(p.ic, p.p, 180)}</div><b>${p.t}</b></div>`).join('')}
  ${[0, 1, 2].map((i) => `<div id="s16-w${i}" class="wave" style="left:${1630 - 90}px;top:${470 - 90}px"></div>`).join('')}`,
  (e) => [
    ...headAnim('s16', 143.45),
    ...pipe.map((p, i) => A.pop(`#s16-n${i}`, p.at, { s: 0.3 })),
    A.draw('#s16-s0', 144.2, { d: 0.8 }),
    A.draw('#s16-s1', 152.2, { d: 0.8 }),
    A.draw('#s16-s2', 154.2, { d: 0.7 }),
    A.bob('#s16-n0 .fl', 144.2, e, 8, 1.7), A.bob('#s16-n1 .fl', 145.5, e, 8, 1.9),
    A.bob('#s16-n2 .fl', 153.6, e, 8, 1.6),
    ...[0, 1, 2].map((i) => A.loop(`#s16-w${i}`, 156.4 + i * 0.5, e, '{scale:1,opacity:.7}', '{scale:2.2,opacity:0}', 1.5, { yoyo: false, e: 'power1.out' })),
  ]);

// ─── S17 · 여러 분야의 교육자 (159.65 – 166.35) ───────────────────────────
const fields = ['초등', '중등', '고등', '대학', '연구', '평생교육'];
const fpos = [[330, 330], [250, 620], [540, 780], [1380, 780], [1670, 620], [1590, 330]];
S('s17', 159.65, '활동 계획', `
  <div class="center-col" style="top:150px;bottom:230px">
    ${kick('s17-k', '오프라인 행사에는')}
    <div id="s17-t1" class="h2" style="margin-top:30px">${W('여러 분야의 교육자분들이')}</div>
    <div id="s17-t2" class="h2">${M(W('AI를 배우러'), PAL.butter[0])} ${W('오십니다')}</div>
  </div>
  ${fields.map((fl, i) => `<div id="s17-f${i}" class="field" style="left:${fpos[i][0] - 80}px;top:${fpos[i][1] - 80}px"><div class="fl">${av(i, 130)}<span>${fl}</span></div></div>`).join('')}`,
  (e) => [
    A.rise('#s17-k', 159.7, { y: 20 }),
    A.chars('#s17-t1', 159.9),
    A.pop('.field', 160.86, { st: 0.18, s: 0.2 }),
    ...fields.map((_, i) => A.bob(`#s17-f${i} .fl`, 162.2 + i * 0.1, e, 10, 1.6 + (i % 3) * 0.3)),
    A.chars('#s17-t2', 163.32),
    A.mark('#s17-t2', 164.1),
  ]);

// ─── S18 · 바쁜 교육자 (166.35 – 177.52) ──────────────────────────────────
const papers = ['공문 처리', '수업 준비', '평가 · 채점', '학부모 상담', '행정 보고', '회의'];
S('s18', 166.35, '교육자의 고민', `
  ${head('s18', '교육 현장의 현실', `${W('바쁜 하루, AI 공부는')} ${M(W('부담'), PAL.rose[0])}`)}
  <div id="s18-clock" class="clock" style="${box(210, 400, 380, 380)}">
    ${Array.from({ length: 12 }, (_, i) => `<i style="transform:rotate(${i * 30}deg)"></i>`).join('')}
    <div id="s18-hh" class="hand h"></div><div id="s18-mh" class="hand m"></div><b></b>
  </div>
  <div class="stack" style="${box(720, 360, 440, 470)}">
    ${papers.map((p, i) => `<div id="s18-p${i}" class="sheet" style="bottom:${i * 62}px;transform:rotate(${[-3, 2, -1.5, 3, -2.5, 1][i]}deg)">${svg('doc', PAL[PK[i]][1], 44)}<span>${p}</span></div>`).join('')}
  </div>
  <div id="s18-th" class="thought" style="${box(1260, 390, 480, 290)}">
    <div class="th-in">${svg('laptop', PAL.lav[1], 90)}<b>AI 공부는<br>언제 하지…?</b></div>
    <span class="tb1"></span><span class="tb2"></span>
  </div>
  <div id="s18-w" class="weight" style="${box(1370, 720, 260, 110)}">부담감</div>`,
  (e) => [
    ...headAnim('s18', 166.4),
    A.pop('#s18-clock', 166.6, { s: 0.4 }),
    A.spin('#s18-mh', 166.8, e, 1.2),
    A.spin('#s18-hh', 166.8, e, 14.4),
    ...papers.map((_, i) => A.drop(`#s18-p${i}`, 170.14 + i * 0.42, { y: -260, e: 'bounce.out', d: 0.8 })),
    A.pop('#s18-th', 173.2, { s: 0.5 }),
    A.drop('#s18-w', 175.11, { y: -200, e: 'bounce.out', d: 0.9 }),
    A.mark('#s18-h', 175.3),
    A.loop('#s18-th', 176.0, e, '{rotation:-1.5}', '{rotation:1.5}', 0.25),
  ]);

// ─── S19 · 쏟아지는 AI 툴 (177.52 – 188.37) ───────────────────────────────
const tools = ['대화형 AI', '이미지 생성', '영상 생성', '음성 AI', 'AI 검색', '코딩 AI', '슬라이드 AI', '노트 요약', 'AI 에이전트', '번역 AI', '음악 생성', '수업 설계'];
const toolIc = ['bubble', 'sparkle', 'film', 'mic', 'bulb', 'screen', 'doc', 'book', 'star', 'bubble', 'play', 'calendar'];
S('s19', 177.52, '교육자의 고민', `
  ${head('s19', '교육자분들의 목소리', `${W('AI 툴이')} ${M(W('너무 빠르게'), PAL.lav[0])} ${W('쏟아져요')}`)}
  <div class="tgrid" style="${box(110, 370, 1080, 460)}">
    ${tools.map((t, i) => `<div id="s19-t${i}" class="tool"><div class="tool-ic" style="background:${PAL[PK[i % 6]][0]}">${svg(toolIc[i], PAL[PK[i % 6]][1], 50)}</div><span>${t}</span><em>NEW</em></div>`).join('')}
  </div>
  <div id="s19-sp" class="speaker" style="${box(1230, 400, 540, 420)}">
    <div id="s19-bub" class="sbub">“다 따라잡기<br>${M('부담스러워요', PAL.rose[0])}”</div>
    ${av(0, 150, 's19-av', '', 'margin:30px 0 0 40px')}
  </div>`,
  (e) => [
    ...headAnim('s19', 177.6),
    A.mark('#s19-h', 179.3),
    A.pop('.tool', 179.1, { st: 0.18, s: 0.3 }),
    A.pop('.tool em', 179.4, { st: 0.18, s: 0.2 }),
    A.rise('#s19-sp', 181.5, { y: 50 }),
    A.pop('#s19-bub', 182.4, { s: 0.6 }),
    A.mark('#s19-bub', 184.3),
    A.loop('.tool', 184.6, e, '{rotation:-1.2}', '{rotation:1.2}', 0.22, { st: 0.03 }),
  ]);

// ─── S20 · 함께 연구해서 추려 드립니다 (188.37 – 200.89) ─────────────────
S('s20', 188.37, '우리의 해법', `
  ${head('s20', '그래서 우리는', `${W('함께 연구하고,')} ${M(W('꼭 필요한 것만'), PAL.mint[0])} ${W('추려서')}`, { size: 72 })}
  <div id="s20-team" class="card team" style="${box(150, 380, 470, 440)}">
    <div class="avs lg">${[1, 2, 3].map((i) => av(i, 116, `s20-a${i}`)).join('')}</div>
    <div id="s20-sp" class="abs" style="left:360px;top:30px">${svg('sparkle', PAL.butter[1], 70)}</div>
    <div class="h3" style="font-size:44px;margin-top:30px">함께 연구</div>
    <div class="p sm">AI를 잘 다루시는 분들과</div>
  </div>
  <div class="sieve" style="${box(700, 380, 420, 440)}">
    ${Array.from({ length: 10 }, (_, i) => `<span id="s20-q${i}" class="mini" style="left:${60 + (i % 5) * 64}px;background:${PAL[PK[i % 6]][0]}"></span>`).join('')}
    <div id="s20-fn">${svg('funnel', PAL.lav[1], 260)}</div>
  </div>
  <div class="picks" style="${box(1200, 380, 560, 440)}">
    ${['수업에 바로 쓰는 AI', '업무를 줄이는 AI', '꼭 알아야 할 AI 이슈'].map((t, i) => `<div id="s20-k${i}" class="card pick">${svg('check', PAL.mint[1], 52)}<span>${t}</span></div>`).join('')}
  </div>
  <div id="s20-pill" class="pill big" style="position:absolute;left:50%;top:840px;transform:translateX(-50%)">${svg('people', CORAL, 44)}<span>오프라인 행사에서 전해드려요</span></div>`,
  (e) => [
    ...headAnim('s20', 188.45),
    A.rise('#s20-team', 188.8, { y: 60 }),
    A.pop('#s20-a1,#s20-a2,#s20-a3', 189.1, { st: 0.12 }),
    A.pop('#s20-sp', 191.98), A.spin('#s20-sp', 192.3, e, 5),
    A.mark('#s20-h', 194.0),
    A.fade('#s20-fn', 193.9, { d: 0.5 }),
    ...Array.from({ length: 10 }, (_, i) => `tl.fromTo('#s20-q${i}',{opacity:0,y:-40},{opacity:1,y:${130 + (i % 2) * 30},duration:.6,ease:'power2.in'},${f(194.1 + i * 0.12)});tl.to('#s20-q${i}',{opacity:0,x:${f(170 - (60 + (i % 5) * 64))},y:260,scale:.4,duration:.5,ease:'power2.in'},${f(194.8 + i * 0.12)});`),
    A.slideX('#s20-k0,#s20-k1,#s20-k2', 195.8, 60, { st: 0.35 }),
    A.pop('#s20-pill', 197.95, { s: 0.7 }),
  ]);

// ─── S21 · 행사를 여는 이유 (200.89 – 208.30) ─────────────────────────────
const stairs = Array.from({ length: 7 }, (_, i) => ({ x: 560 + i * 118, h: 40 + i * 30 }));
S('s21', 200.89, '우리의 해법', `
  <div class="center-col" style="top:140px;bottom:520px">
    ${kick('s21-k', '이 행사를 주최하는 큰 이유')}
    <div id="s21-t1" class="h2" style="margin-top:26px">${W('교육자분들이 AI를')}</div>
    <div id="s21-t2" class="h2">${M(W('꾸준히'), PAL.peach[0])} ${W('공부하실 수 있도록')}</div>
  </div>
  ${stairs.map((s, i) => `<div id="s21-s${i}" class="stair" style="left:${s.x}px;top:${830 - s.h}px;height:${s.h}px;background:${PAL[PK[i % 6]][0]}"></div>`).join('')}
  <div id="s21-walker" class="abs" style="left:${stairs[0].x + 14}px;top:${830 - stairs[0].h - 80}px">${av(1, 80)}</div>
  <div id="s21-flag" class="abs" style="left:${stairs[6].x + 20}px;top:${830 - stairs[6].h - 110}px">${svg('flag', CORAL, 100)}</div>`,
  (e) => [
    A.rise('#s21-k', 200.95, { y: 20 }),
    A.chars('#s21-t1', 203.25),
    A.chars('#s21-t2', 204.4),
    A.mark('#s21-t2', 205.1),
    `tl.fromTo('.stair',{scaleY:0},{scaleY:1,duration:.5,ease:'back.out(1.6)',stagger:.1},201.4);`,
    A.pop('#s21-walker', 202.4),
    ...stairs.slice(1).map((s, i) => A.to('#s21-walker', 205.4 + i * 0.35, `{x:${s.x - stairs[0].x},y:${stairs[0].h - s.h},duration:.3,ease:'power2.out'}`)),
    A.drop('#s21-flag', 207.6, { y: -80 }),
  ]);

// ─── S22 · 참가비 → 노트북 → 아이들 (208.30 – 217.21) ─────────────────────
const give = [
  { ic: 'coin', p: 'butter', t: '오프라인 행사<br>참가비', at: 209.53, x: 380 },
  { ic: 'laptop', p: 'lav', t: '리퍼 노트북<br>구매', at: 211.59, x: 960 },
  { ic: 'gift', p: 'rose', t: '보육원 아동들에게<br>선물', at: 213.26, x: 1540 },
];
S('s22', 208.3, '나눔', `
  ${head('s22', '나눔으로 이어집니다', `${W('참가비가')} ${M(W('아이들의 노트북'), PAL.butter[0])}${W('으로')}`)}
  <svg id="s22-ln" class="abs" style="${box(0, 0, 1920, 1080)}" viewBox="0 0 1920 1080">
    ${[0, 1].map((i) => `<path class="dr" pathLength="1" d="M${give[i].x + 150} 560H${give[i + 1].x - 150}" stroke="${INK2}" stroke-width="5" stroke-linecap="round" opacity=".35" fill="none"/>`).join('')}
  </svg>
  ${give.map((g, i) => `<div id="s22-n${i}" class="gnode" style="left:${g.x - 130}px;top:${560 - 130}px"><div class="fl">${badge(g.ic, g.p, 260)}</div><b>${g.t}</b></div>`).join('')}
  ${[0, 1].map((i) => `<div id="s22-c${i}" class="abs" style="left:${give[i].x + 130}px;top:532px">${svg(i ? 'laptop' : 'coin', i ? PAL.lav[1] : PAL.butter[1], 56)}</div>`).join('')}
  ${Array.from({ length: 8 }, (_, i) => `<div id="s22-h${i}" class="abs" style="left:${1520}px;top:${440}px">${svg('heart', PAL.rose[1], 40)}</div>`).join('')}`,
  (e) => [
    ...headAnim('s22', 208.4),
    A.set('#s22-c0,#s22-c1', 208.3, '{opacity:0}'),
    A.pop('#s22-n0', 209.53, { s: 0.3 }), A.bob('#s22-n0 .fl', 210.3, e, 10, 1.6),
    A.draw('#s22-ln .dr:nth-of-type(1)', 210.6, { d: 0.9 }),
    A.loop('#s22-c0', 211.0, e, '{x:0,opacity:1}', '{x:250,opacity:0}', 1.1, { yoyo: false, e: 'power1.in' }),
    A.pop('#s22-n1', 211.59, { s: 0.3 }), A.bob('#s22-n1 .fl', 212.4, e, 10, 1.8),
    A.draw('#s22-ln .dr:nth-of-type(2)', 212.6, { d: 0.9 }),
    A.loop('#s22-c1', 213.0, e, '{x:0,opacity:1}', '{x:250,opacity:0}', 1.1, { yoyo: false, e: 'power1.in' }),
    A.pop('#s22-n2', 213.26, { s: 0.3 }),
    ...Array.from({ length: 8 }, (_, i) => { const a = -Math.PI / 2 + (i - 3.5) * 0.32; return `tl.fromTo('#s22-h${i}',{x:0,y:0,opacity:0,scale:.4},{x:${f(Math.cos(a) * 190)},y:${f(Math.sin(a) * 170)},opacity:1,scale:1,duration:1,ease:'power3.out'},${f(214.7 + i * 0.05)});tl.to('#s22-h${i}',{opacity:0,duration:.8},${f(216.0 + i * 0.05)});`; }),
  ]);

// ─── S23 · AI 실력만 보지 않습니다 (217.21 – 224.19) ──────────────────────
S('s23', 217.21, '이런 분을 찾아요', `
  <div class="head" style="top:150px">
    ${kick('s23-k', 'Advanced 레벨 분들을 모집하지만')}
    <div id="s23-h" class="h2">${W('AI 실력만')} ${M(W('보지 않습니다'), PAL.mint[0])}</div>
  </div>
  <div id="s23-scale" class="scale">
    <div class="post"></div><div class="base"></div>
    <div id="s23-beam" class="beam"><i></i></div>
    <div id="s23-l" class="pan" style="left:${510 - 150}px"><div class="str"></div><div class="bowl">${badge('sparkle', 'lav', 120)}<span>AI 실력</span></div></div>
    <div id="s23-r" class="pan" style="left:${1410 - 150}px"><div class="str"></div><div class="bowl"><div id="s23-heart">${badge('heart', 'rose', 120)}</div><span>돕는 마음</span></div></div>
  </div>`,
  (e) => [
    A.rise('#s23-k', 217.3, { y: 20 }),
    A.fade('#s23-scale', 217.5, { d: 0.6 }),
    `tl.fromTo('#s23-beam',{rotation:0},{rotation:-8,duration:1,ease:'power2.inOut'},218.0);`,
    `tl.fromTo('#s23-l',{y:0},{y:63,duration:1,ease:'power2.inOut'},218.0);`,
    `tl.fromTo('#s23-r',{y:0},{y:-63,duration:1,ease:'power2.inOut'},218.0);`,
    `tl.set('#s23-heart',{opacity:0},217.21);`,
    A.chars('#s23-h', 222.0),
    `tl.fromTo('#s23-heart',{opacity:0,y:-300},{opacity:1,y:0,duration:.6,ease:'power2.in'},222.3);`,
    `tl.to('#s23-beam',{rotation:0,duration:1.2,ease:'elastic.out(1,.5)'},222.9);`,
    `tl.to('#s23-l',{y:0,duration:1.2,ease:'elastic.out(1,.5)'},222.9);`,
    `tl.to('#s23-r',{y:0,duration:1.2,ease:'elastic.out(1,.5)'},222.9);`,
    A.mark('#s23-h', 223.0),
  ]);

// ─── S24 · 선한 영향력 · 결이 비슷한 분 (224.19 – 237.97) ─────────────────
const wave = (amp, per, len) => {
  let d = `M0 ${amp}`;
  for (let x = 0; x < len; x += per) d += ` q${per / 4} ${-amp} ${per / 2} 0 t${per / 2} 0`;
  return d;
};
S('s24', 224.19, '이런 분을 찾아요', `
  ${head('s24', '필로소피 AI 교육 채널의 목표', `${W('AI로 세상에')} ${M(W('선한 영향력'), PAL.rose[0])}${W('을')}`)}
  <div id="s24-wv" class="waves" style="${box(260, 400, 1400, 250)}">
    <div class="wv-lab" id="s24-l1" style="top:34px;color:${CORAL}">채널의 목표</div>
    <div class="wv-lab" id="s24-l2" style="top:128px;color:${PAL.lav[1]}">나의 뜻</div>
    <div class="wv-clip">
      <svg id="s24-w1" viewBox="0 0 1600 80" width="1600" height="80" style="top:30px"><path d="${wave(28, 200, 1600)}" stroke="${CORAL}" stroke-width="7" fill="none" stroke-linecap="round"/></svg>
      <svg id="s24-w2" viewBox="0 0 1600 80" width="1600" height="80" style="top:122px"><path d="${wave(28, 200, 1600)}" stroke="${PAL.lav[1]}" stroke-width="7" fill="none" stroke-linecap="round"/></svg>
    </div>
    <div id="s24-same" class="same">결이 비슷한 분</div>
  </div>
  <div id="s24-cta" class="card cta" style="${box(360, 690, 1200, 140)}">
    ${badge('mail', 'peach', 90)}
    <div><b>누군가를 돕는 일에 뜻이 있다면</b><span>연락 주시면 감사하겠습니다</span></div>
  </div>`,
  (e) => [
    ...headAnim('s24', 224.25),
    A.mark('#s24-h', 225.6),
    A.fade('#s24-wv', 228.3, { d: 0.5 }),
    A.rise('#s24-l1', 228.4, { y: 12 }), A.rise('#s24-l2', 228.8, { y: 12 }),
    `tl.fromTo('#s24-w1',{x:-200},{x:0,duration:4,ease:'none'},228.3);`,
    `tl.fromTo('#s24-w2',{x:-100,y:0},{x:0,y:-40,duration:2.2,ease:'power2.inOut'},229.2);`,
    `tl.to('#s24-w1,#s24-w2',{x:-200,duration:${f(e - 232.3)},ease:'none'},232.3);`,
    A.pop('#s24-same', 231.2, { s: 0.6 }),
    A.rise('#s24-cta', 232.56, { y: 50 }),
    A.fade('#s24-cta span', 235.5, { d: 0.6 }),
  ]);

// ─── S25 · 2026년 11월 시작 (237.97 – 253.33) ─────────────────────────────
const mX = (i) => 250 + i * 203;
const bi = Array.from({ length: 16 }, (_, i) => ({ i, x: mX(0) + 20 + i * 96 }));
S('s25', 237.97, '활동 방식', `
  ${head('s25', '활동 안내', `${M(W('2026년 11월'), PAL.peach[0])}${W(', 봉사단 활동 시작')}`)}
  <div id="s25-track" class="track" style="${box(200, 580, 1520, 16)}"><i></i></div>
  ${months.map((m, i) => `<div id="s25-m${i}" class="mlab" style="left:${mX(i) - 50}px;top:620px">${m}월${i === 0 ? '<small>2026</small>' : i === 2 ? '<small>2027</small>' : ''}</div>`).join('')}
  <div id="s25-flag" class="abs" style="left:${mX(0) - 30}px;top:440px">${svg('flag', CORAL, 120)}</div>
  <div id="s25-start" class="tag" style="left:${mX(0) + 70}px;top:462px">시작!</div>
  ${bi.map((b) => `<span id="s25-d${b.i}" class="bdot" style="left:${b.x - 13}px;top:575px;background:${PAL[PK[b.i % 4]][1]}"></span>`).join('')}
  <div id="s25-l1" class="pill" style="position:absolute;left:560px;top:420px">${svg('mic', PAL.peach[1], 38)}<span>2주에 한 번 AI 발표</span></div>
  <div id="s25-l2" class="pill" style="position:absolute;left:1030px;top:420px">${svg('heart', PAL.mint[1], 38)}<span>교육자분들을 위한 발표</span></div>
  <div id="s25-rot" class="rotrow" style="${box(560, 730, 800)}">${[0, 1, 2, 3].map((i) => av(i, 84, `s25-a${i}`)).join(`<span class="rar">→</span>`)}<b>순서대로 돌아가며</b></div>`,
  (e) => [
    ...headAnim('s25', 238.0),
    A.mark('#s25-h', 238.9),
    `tl.fromTo('#s25-track i',{scaleX:0},{scaleX:1,duration:1.4,ease:'power2.inOut'},238.4);`,
    A.rise('.mlab', 238.6, { y: 16, st: 0.08 }),
    A.drop('#s25-flag', 239.0, { y: -100 }),
    A.pop('#s25-start', 239.6),
    A.pop('.bdot', 241.4, { st: 0.1, s: 0 }),
    A.rise('#s25-l1', 241.6, { y: 20 }),
    A.rise('#s25-l2', 245.03, { y: 20 }),
    A.rise('#s25-rot', 250.16, { y: 30 }),
    `tl.fromTo('#s25-rot .av',{scale:1},{scale:1.18,duration:.3,yoyo:true,repeat:1,ease:'power2.out',stagger:.45},250.9);`,
  ]);

// ─── S26 · 한 번의 모임 구성 (253.33 – 284.43) ────────────────────────────
S('s26', 253.33, '활동 방식', `
  ${head('s26', '한 번의 모임은 이렇게', W('발표 + 토론'), { top: 130 })}
  <div class="sbar" style="${box(200, 330, 1520, 84)}">
    <div id="s26-sa" class="seg a" style="width:61%"><span>${svg('mic', '#fff', 40)} 발표 · 20~30분</span></div>
    <div id="s26-sb" class="seg b" style="width:39%"><span>${svg('bubble', '#fff', 40)} 토론 · 10~20분</span></div>
  </div>
  <div id="s26-pa" class="card panel" style="${box(200, 450, 900, 390)}">
    <div class="ph" style="color:${CORAL}">발표</div>
    ${[['sparkle', '나의 도메인과 관련된 AI 이슈 발표'], ['heart', '교육자분들께 도움이 될 방향성 제시'], ['rotate', '순서대로 돌아가며 발표']].map(([ic, t], i) => `<div id="s26-a${i}" class="li">${badge(ic, ['lav', 'rose', 'peach'][i], 64)}<span>${t}</span></div>`).join('')}
  </div>
  <div id="s26-pb" class="card panel" style="${box(1140, 450, 580, 390)}">
    <div class="ph" style="color:${PAL.lav[1]}">토론</div>
    <div id="s26-who" class="who">${['교육자', '연구원', '선생님'].map((w, i) => `<span style="background:${PAL[PK[i + 2]][0]}">${w}</span>`).join('')}</div>
    ${['AI를 어떻게 사용하고 계신가요?', 'AI에 대해 어떻게 느끼시나요?', 'AI를 어떻게 생각하시나요?'].map((t, i) => `<div id="s26-q${i}" class="qb ${i % 2 ? 'r' : ''}">${t}</div>`).join('')}
  </div>`,
  (e) => [
    ...headAnim('s26', 253.4),
    `tl.fromTo('#s26-sa',{clipPath:'inset(0 100% 0 0 round 42px)'},{clipPath:'inset(0 0% 0 0 round 42px)',duration:1.1,ease:'power2.inOut'},253.8);`,
    A.rise('#s26-pa', 254.6, { y: 50 }),
    A.slideX('#s26-a0', 255.24, -40), A.slideX('#s26-a1', 259.83, -40), A.slideX('#s26-a2', 265.86, -40),
    A.spin('#s26-a2 .badge svg', 266.3, 267.8, 1.5),
    `tl.fromTo('#s26-sb',{clipPath:'inset(0 100% 0 0 round 42px)'},{clipPath:'inset(0 0% 0 0 round 42px)',duration:1,ease:'power2.inOut'},267.4);`,
    A.to('#s26-pa', 268.0, '{opacity:.55,duration:.6}'),
    A.to('#s26-sa', 268.0, '{opacity:.6,duration:.6}'),
    A.rise('#s26-pb', 267.9, { y: 50 }),
    A.pop('#s26-who span', 268.6, { st: 0.25 }),
    A.pop('#s26-q0', 277.02, { s: 0.6 }), A.pop('#s26-q1', 280.07, { s: 0.6 }), A.pop('#s26-q2', 281.58, { s: 0.6 }),
    A.to('#s26-pa,#s26-sa', 283.0, '{opacity:1,duration:.5}'),
  ]);

// ─── S27 · 영상으로 채널에 (284.43 – 289.38) ──────────────────────────────
S('s27', 284.43, '활동 방식', `
  ${head('s27', '모든 과정은 기록으로', `${W('발표 및 토론 영상은')} ${M(W('유튜브 채널'), PAL.rose[0])}${W('에')}`)}
  <div class="strip-clip" style="${box(0, 470, 1920, 220)}">
    <div id="s27-strip" class="strip">${Array.from({ length: 16 }, (_, i) => `<div class="frm" style="background:${PAL[PK[i % 6]][0]}">${svg(['mic', 'bubble', 'people', 'screen'][i % 4], PAL[PK[i % 6]][1], 70)}</div>`).join('')}</div>
  </div>
  <div id="s27-player" class="card player" style="${box(710, 400, 500, 360)}">
    <div class="pscr">${svg('play', CORAL, 150)}</div>
    <div class="pbar" style="width:420px;margin-top:22px"><i id="s27-pb"></i></div>
    <b>편집 후 업로드</b>
  </div>`,
  (e) => [
    ...headAnim('s27', 284.5),
    A.mark('#s27-h', 285.9),
    `tl.fromTo('#s27-strip',{x:0},{x:-1000,duration:${f(e - 284.6)},ease:'none'},284.6);`,
    A.fade('#s27-strip', 284.6, { d: 0.5 }),
    A.pop('#s27-player', 286.0, { s: 0.6, b: 1.4 }),
    `tl.fromTo('#s27-pb',{scaleX:0},{scaleX:1,duration:2,ease:'power1.inOut'},286.8);`,
  ]);

// ─── S28 · 3개월마다 오프라인 모임 (289.38 – 301.15) ──────────────────────
const seat2 = [];
[[4, 650], [5, 740]].forEach(([n, y]) => { for (let i = 0; i < n; i++) seat2.push({ x: 1330 - ((n - 1) * 110) / 2 + i * 110, y, k: seat2.length + 2 }); });
S('s28', 289.38, '활동 방식', `
  ${head('s28', '3개월마다', `${W('교육자분들을 위한')} ${M(W('오프라인 모임'), PAL.mint[0])}`)}
  <div class="collect" style="${box(180, 380, 560, 460)}">
    ${Array.from({ length: 6 }, (_, i) => `<div id="s28-s${i}" class="mslide" style="left:${40 + (i % 3) * 160}px;top:${i < 3 ? 10 : 110}px">${svg('screen', PAL[PK[i]][1], 70)}</div>`).join('')}
    <div id="s28-fd" class="abs" style="left:150px;top:230px">${svg('folder', PAL.butter[1], 240)}</div>
    <div id="s28-fl" class="flab">발표 내용 모음</div>
  </div>
  ${arrow('s28-ar', 790, 590, 130)}
  <div id="s28-stage" class="card stage sm" style="${box(1000, 380, 660, 210)}"><div class="stage-scr"><div class="stage-ai" style="font-size:80px">AI</div></div></div>
  ${seat2.map((s) => av(s.k, 96, `s28-a${s.k}`, 'abs seat2', `left:${s.x - 48}px;top:${s.y - 48}px`)).join('')}
  <div id="s28-lab" class="src" style="${box(1000, 810, 660)}">여러 분야의 교육자분들이 함께 듣는 자리</div>`,
  (e) => [
    ...headAnim('s28', 289.45),
    A.mark('#s28-h', 291.9),
    A.pop('.mslide', 289.9, { st: 0.12, s: 0.3 }),
    A.pop('#s28-fd', 291.4, { s: 0.5 }),
    ...Array.from({ length: 6 }, (_, i) => `tl.to('#s28-s${i}',{x:${230 - (40 + (i % 3) * 160)},y:${260 - (i < 3 ? 10 : 110)},scale:.3,opacity:0,duration:.6,ease:'power2.in'},${f(292.2 + i * 0.12)});`),
    A.rise('#s28-fl', 293.2, { y: 16 }),
    ...arrowAnim('s28-ar', 293.8),
    A.rise('#s28-stage', 294.3, { y: 40 }),
    A.pop('.seat2', 295.9, { st: 0.13, s: 0.2 }),
    A.rise('#s28-lab', 298.46, { y: 16 }),
  ]);

// ─── S29 · 나눔 다시 한 번 (301.15 – 308.70) ─────────────────────────────
S('s29', 301.15, '나눔', `
  ${head('s29', '그리고, 나눔', `${W('참가비로 모은')} ${M(W('리퍼 노트북'), PAL.lav[0])}${W('을 아이들에게')}`, { size: 74 })}
  <div class="lrow" style="${box(170, 470, 900, 200)}">
    ${Array.from({ length: 5 }, (_, i) => `<div id="s29-l${i}" class="lap">${svg('laptop', PAL[PK[i]][1], 150)}</div>`).join('')}
  </div>
  <div id="s29-gift" class="abs" style="left:1150px;top:410px">${badge('gift', 'rose', 260)}</div>
  <div id="s29-kids" class="kids" style="${box(1440, 450, 330, 240)}">${[0, 1, 2].map((i) => `<div id="s29-k${i}" class="kid" style="background:${PAL[PK[i + 1]][0]}">${svg('child', PAL[PK[i + 1]][1], 90)}</div>`).join('')}</div>
  ${Array.from({ length: 6 }, (_, i) => `<div id="s29-h${i}" class="abs" style="left:${1470 + i * 50}px;top:430px">${svg('heart', PAL.rose[1], 36)}</div>`).join('')}
  <div id="s29-lab" class="src" style="${box(0, 780, 1920)}">보육원 아동들에게 전달할 예정입니다</div>`,
  (e) => [
    ...headAnim('s29', 301.2),
    A.mark('#s29-h', 302.6),
    A.drop('.lap', 303.3, { st: 0.12, y: -120 }),
    A.pop('#s29-gift', 304.6, { s: 0.3 }),
    `tl.to('.lap',{x:(i)=>1060-i*180,scale:.3,opacity:0,duration:.45,ease:'power2.in',stagger:.05},305.0);`, A.set('.lap', 305.65, '{opacity:0}'),
    `tl.fromTo('#s29-gift',{rotation:0},{rotation:8,duration:.12,yoyo:true,repeat:5,ease:'sine.inOut'},305.6);`,
    A.pop('#s29-k0,#s29-k1,#s29-k2', 305.65, { st: 0.15 }),
    ...Array.from({ length: 6 }, (_, i) => A.loop(`#s29-h${i}`, 306.3 + i * 0.2, e, '{y:0,opacity:0}', '{y:-120,opacity:1}', 1.4, { yoyo: false, e: 'power1.out' })),
    A.rise('#s29-lab', 306.0, { y: 16 }),
  ]);

// ─── S30 · 아웃트로 (308.70 – end) ────────────────────────────────────────
S('s30', 308.7, '지원하기', `
  ${[0, 1].map((i) => `<div id="s30-r${i}" class="ripple" style="${box(560, 90, 800, 800)}"></div>`).join('')}
  <div class="center-col" style="top:120px;bottom:210px">
    ${kick('s30-k', '관심 있으신 분들은')}
    <div id="s30-card" class="card mailc">
      <div id="s30-env">${svg('mail', CORAL, 120)}</div>
      <div><small>메일로 연락 주세요</small><b>dearname27@naver.com</b></div>
    </div>
    <div id="s30-ty" class="h1" style="font-size:112px;margin-top:40px">${W('감사합니다')}</div>
    <div id="s30-br" class="brand">필로소피 AI 봉사단 <b>2기</b></div>
  </div>`,
  (e) => [
    ...[0, 1].map((i) => `tl.fromTo('#s30-r${i}',{scale:.3,opacity:.7},{scale:1.4,opacity:0,duration:2.6,ease:'power2.out'},${f(308.8 + i * 0.8)});`),
    A.rise('#s30-k', 308.8, { y: 20 }),
    A.pop('#s30-card', 309.2, { s: 0.7, b: 1.4 }),
    `tl.fromTo('#s30-env',{rotation:-14,x:-40},{rotation:0,x:0,duration:.8,ease:'back.out(2)'},309.4);`,
    A.chars('#s30-ty', 311.93, { st: 0.06 }),
    A.rise('#s30-br', 312.5, { y: 16 }),
  ]);

// ---------------------------------------------------------------------------
// 조립
// ---------------------------------------------------------------------------
scenes.forEach((s, i) => (s.end = i < scenes.length - 1 ? scenes[i + 1].start : DUR));

const chapters = [];
scenes.forEach((s) => { if (!chapters.includes(s.chapter)) chapters.push(s.chapter); });

// 배경 블롭 — 씬마다 위치를 천천히 옮겨 공간감을 준다
const blobs = [
  { c: 'rgba(255,196,176,.55)', s: 1100, x: -240, y: -320 },
  { c: 'rgba(214,200,255,.55)', s: 1000, x: 1180, y: -260 },
  { c: 'rgba(190,236,214,.50)', s: 1050, x: 1100, y: 520 },
  { c: 'rgba(255,232,170,.45)', s: 900, x: -200, y: 560 },
];
seed = 11;
const blobMoves = scenes.map((s) => blobs.map(() => ({ x: Math.round((rnd() - 0.5) * 360), y: Math.round((rnd() - 0.5) * 260), sc: (0.9 + rnd() * 0.25).toFixed(3) })));

// 떠다니는 작은 입자
seed = 5;
const parts = Array.from({ length: 22 }, (_, i) => ({
  i, x: Math.round(rnd() * 1880), y: Math.round(rnd() * 1000), s: 8 + Math.round(rnd() * 16),
  c: Object.values(PAL)[i % 6][1], shape: i % 3, per: 5 + rnd() * 5, dy: 40 + rnd() * 60, dx: (rnd() - 0.5) * 60,
}));

function srtSec(t) { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; }
const caps = fs.readFileSync(path.join(root, 'public/captions.srt'), 'utf8').replace(/\r/g, '').split(/\n\n+/).map((b) => b.trim()).filter(Boolean).map((b) => {
  const L = b.split('\n'); const m = L[1].match(/(\S+)\s*-->\s*(\S+)/);
  return { start: srtSec(m[1]), end: srtSec(m[2]), text: L.slice(2).join(' ') };
});

const sceneHost = (s) => {
  const hostDur = s.end - s.start + 0.25;
  return `<div id="${s.id}" class="scene clip" data-start="${f(s.start)}" data-duration="${f(Math.min(hostDur, DUR - s.start))}" data-track-index="2">
  <div class="inner">${s.html}
  </div>
</div>`;
};

const sceneTl = scenes.map((s, i) => {
  const lines = s.anim(s.end);
  const len = s.end - s.start;
  lines.unshift(`tl.fromTo('#${s.id} .inner',{scale:1.0},{scale:1.028,duration:${f(len + 0.25)},ease:'none'},${f(s.start)});`);
  if (i < scenes.length - 1) lines.push(`tl.to('#${s.id} .inner',{opacity:0,y:-26,duration:.42,ease:'power2.in'},${f(s.end - 0.3)});`);
  else lines.push(`tl.to('#${s.id} .inner',{opacity:0,duration:.6,ease:'power1.in'},${f(DUR - 0.6)});`);
  // 배경 블롭 이동
  blobMoves[i].forEach((m, k) => lines.push(`tl.to('#blob${k}',{x:${m.x},y:${m.y},scale:${m.sc},duration:3.2,ease:'sine.inOut'},${f(s.start)});`));
  // 챕터 라벨
  const ci = chapters.indexOf(s.chapter);
  if (i === 0) lines.push(`tl.fromTo('#chap${ci}',{opacity:0,y:10},{opacity:1,y:0,duration:.6},0.4);`);
  else if (scenes[i - 1].chapter !== s.chapter) {
    const pi = chapters.indexOf(scenes[i - 1].chapter);
    lines.push(`tl.to('#chap${pi}',{opacity:0,y:-10,duration:.35},${f(s.start - 0.2)});`);
    lines.push(`tl.fromTo('#chap${ci}',{opacity:0,y:10},{opacity:1,y:0,duration:.5,immediateRender:false},${f(s.start + 0.15)});`);
  }
  return `// ${s.id}\n    ` + lines.join('\n    ');
}).join('\n    ');

const partTl = parts.map((p) => {
  const n = Math.max(0, Math.floor(DUR / p.per) - 1);
  return `tl.fromTo('#pt${p.i}',{y:0,x:0},{y:${-p.dy.toFixed(0)},x:${p.dx.toFixed(0)},duration:${p.per.toFixed(2)},ease:'sine.inOut',yoyo:true,repeat:${n}},0);`;
}).join('\n    ');

const capHosts = caps.map((c, i) => `<div id="cap${i}" class="cap clip" data-start="${f(c.start)}" data-duration="${f(Math.max(0.05, c.end - c.start))}" data-track-index="5"><span>${esc(c.text)}</span></div>`).join('\n');

const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>필로소피 AI 봉사단 2기 모집</title>
<style>
@font-face{font-family:"Pretendard";src:url("public/fonts/PretendardVariable.woff2") format("woff2-variations");font-weight:45 920;font-style:normal;font-display:block}
${css}
</style>
</head>
<body>
<div id="stage" data-composition-id="volunteer-2nd" data-start="0" data-duration="${f(DUR)}" data-fps="30" data-width="1920" data-height="1080">
<audio id="narration" src="public/narration.m4a" data-start="0" data-duration="${f(AUDIO_DUR)}" data-track-index="10" data-volume="1"></audio>

<div id="bg" data-layout-ignore>
  ${blobs.map((b, k) => `<div id="blob${k}" class="blob" style="left:${b.x}px;top:${b.y}px;width:${b.s}px;height:${b.s}px;background:radial-gradient(circle, ${b.c} 0%, rgba(255,255,255,0) 68%)"></div>`).join('\n  ')}
  ${parts.map((p) => `<span id="pt${p.i}" class="pt s${p.shape}" style="left:${p.x}px;top:${p.y}px;width:${p.s}px;height:${p.s}px;--c:${p.c}"></span>`).join('\n  ')}
  <div id="paper"></div>
</div>

<div id="hud" data-layout-ignore>
  <div id="brand"><i></i>필로소피 AI 봉사단 <b>2기 모집</b></div>
  <div id="chaps">${chapters.map((c, i) => `<div id="chap${i}" class="chap"><b>${String(i + 1).padStart(2, '0')}</b>${esc(c)}</div>`).join('')}</div>
  <div id="prog"><i></i></div>
</div>

${scenes.map(sceneHost).join('\n')}

${capHosts}

<script src="public/vendor/gsap.min.js"></script>
<script>
(function(){
  const tl = gsap.timeline({ paused: true });
  tl.fromTo('#prog i',{scaleX:0},{scaleX:1,duration:${f(DUR)},ease:'none'},0);
  tl.fromTo('#brand',{opacity:0,y:-12},{opacity:1,y:0,duration:.7,ease:'power2.out'},0.2);
  ${partTl}
  ${sceneTl}
  window.__timelines = window.__timelines || {};
  window.__timelines['volunteer-2nd'] = tl;
})();
</script>
</div>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html);
fs.writeFileSync(path.join(root, 'metadata.json'), JSON.stringify({ duration: DUR, width: 1920, height: 1080, fps: 30, source: 'narration.m4a (초고 영상의 오디오만 사용 — 화면은 전부 모션그래픽으로 대체)' }, null, 2));
console.log(`scenes=${scenes.length} captions=${caps.length} chapters=${chapters.length}`);
console.log(scenes.map((s) => `${s.id} ${s.start.toFixed(2)}-${s.end.toFixed(2)} (${(s.end - s.start).toFixed(1)}s) ${s.chapter}`).join('\n'));
