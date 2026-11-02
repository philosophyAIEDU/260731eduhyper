import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });

// ---------------------------------------------------------------------------
// Audio-only rebuild: the source recording is a desktop screen capture (not
// footage meant to be shown publicly), so only its narration audio is used.
// The entire visual track is generated pastel motion graphics.
// ---------------------------------------------------------------------------

const duration = 430.677333; // public/narration.m4a duration

const cards = [
  { id:'card-01', startSec:0.0, variant:'hero', accentIndex:0, kicker:'AI 시대의 새로운 능력', title:'AI 구독료 관리', detail:'비싼 Max와 부족한 Pro 사이, 현명하게 쓰는 방법' },
  { id:'card-02', startSec:13.9, variant:'stat', accentIndex:1, kicker:'CLAUDE MAX', title:'월 $110', detail:'약 13만 5천 원 · 충분히 활용하지 못하면 부담', barPct:100 },
  { id:'card-03', startSec:25.92, variant:'stat', accentIndex:2, kicker:'CLAUDE PRO', title:'월 $19', detail:'약 2만 5천 원 · 요금 차이는 거의 5배', barPct:17 },
  { id:'card-04', startSec:40.92, variant:'hero', accentIndex:3, kicker:'직접 써보고 정리한', title:'7가지 절약 팁', detail:'Pro 요금제를 알뜰하게 쓰는 실전 노하우' },
  { id:'card-05', startSec:52.67, variant:'tip', accentIndex:0, number:'01', kicker:'TIP 01', title:'3개 AI를 모두 써보세요', detail:'ChatGPT · Claude · Gemini는 강점이 다릅니다' },
  { id:'card-06', startSec:61.95, variant:'note', accentIndex:2, kicker:'CLAUDE', title:'글쓰기와 코드 작성', detail:'특히 Claude Code가 유용합니다' },
  { id:'card-07', startSec:68.25, variant:'note', accentIndex:3, kicker:'GEMINI', title:'이미지 · 영상 · 음악', detail:'다양한 생성 작업과 구글 생태계에 강점' },
  { id:'card-08', startSec:77.59, variant:'note', accentIndex:1, kicker:'CHATGPT', title:'두 장점을 두루두루', detail:'코드 작성과 이미지 생성을 함께 활용' },
  { id:'card-09', startSec:87.01, variant:'tip', accentIndex:1, number:'02', kicker:'TIP 02', title:'유료는 1~2개만', detail:'주력 AI만 결제하고 나머지는 무료로 활용하세요' },
  { id:'card-10', startSec:96.28, variant:'compare', accentIndex:0, kicker:'추천 조합', title:'유료 1 + 무료 2', detail:'사용량과 작업 종류에 맞춰 섞는 것이 핵심' },
  { id:'card-11', startSec:116.87, variant:'note', accentIndex:2, kicker:'코드 작업이 많다면', title:'Claude 유료', detail:'ChatGPT와 Gemini는 무료 역할로 분배' },
  { id:'card-12', startSec:138.27, variant:'stat', accentIndex:3, kicker:'GEMINI 선택지', title:'월 약 7,500원', detail:'20달러 요금제보다 저렴한 요금제도 있습니다' },
  { id:'card-13', startSec:143.66, variant:'tip', accentIndex:2, number:'03', kicker:'TIP 03', title:'모바일 앱을 활용하세요', detail:'토큰이 다시 열리는 시간을 생활 속에서 활용' },
  { id:'card-14', startSec:159.86, variant:'note', accentIndex:0, kicker:'핵심 포인트', title:'몇 시간 후 다시 사용', detail:'한 번 끊겨도 사용 가능 시간이 다시 돌아옵니다' },
  { id:'card-15', startSec:179.86, variant:'note', accentIndex:1, kicker:'모바일 루틴', title:'출근길에 작업 이어가기', detail:'"전에 요청한 작업을 마무리해 주세요"' },
  { id:'card-16', startSec:215.98, variant:'compare', accentIndex:3, kicker:'Max가 부담스럽다면', title:'Pro + 모바일', detail:'틈틈이 이어 쓰면 토큰 부족을 보완할 수 있습니다' },
  { id:'card-17', startSec:249.49, variant:'tip', accentIndex:3, number:'04', kicker:'TIP 04', title:'모델을 바꿔 쓰세요', detail:'어려운 시작은 Opus, 보통 작업은 Sonnet' },
  { id:'card-18', startSec:259.27, variant:'compare', accentIndex:1, kicker:'모델 분배', title:'Opus → 뼈대', detail:'Sonnet → 대부분의 일반 작업' },
  { id:'card-19', startSec:282.92, variant:'note', accentIndex:2, kicker:'PRO 요금제 추천', title:'대부분은 Sonnet', detail:'토큰을 아끼면서도 웬만한 코드를 작성합니다' },
  { id:'card-20', startSec:292.95, variant:'tip', accentIndex:0, number:'05', kicker:'TIP 05', title:'작업을 분배하세요', detail:'일주일 단위로 계획하면 몰아서 쓰는 일을 줄입니다' },
  { id:'card-21', startSec:306.15, variant:'note', accentIndex:1, kicker:'실행 방법', title:'하루에 한 작업', detail:'또는 이틀에 한 작업씩 달력에 나눠 적기' },
  { id:'card-22', startSec:323.35, variant:'compare', accentIndex:2, kicker:'현실적인 선택', title:'전업은 Max · 절약은 Pro', detail:'사용량에 맞는 요금제를 선택하세요' },
  { id:'card-23', startSec:333.49, variant:'tip', accentIndex:1, number:'06', kicker:'TIP 06', title:'구독 기록을 남기세요', detail:'메모장이나 앱에 결제 내역을 한곳에 모으기' },
  { id:'card-24', startSec:351.44, variant:'note', accentIndex:0, kicker:'구독이 늘수록', title:'기록이 더 중요해집니다', detail:'무엇을 결제했는지 한눈에 확인하세요' },
  { id:'card-25', startSec:358.19, variant:'image', accentIndex:3, kicker:'AI 구독 관리 앱', title:'구독료를 한눈에', detail:'고정 댓글의 링크에서 활용할 수 있습니다', image:'app.png' },
  { id:'card-26', startSec:365.98, variant:'tip', accentIndex:2, number:'07', kicker:'TIP 07', title:'결제 카드는 하나만', detail:'카드 사용 내역만 봐도 AI 구독을 확인할 수 있습니다' },
  { id:'card-27', startSec:388.47, variant:'recap', accentIndex:0, kicker:'AI 구독료 관리', title:'비싼 요금제보다 사용 습관', detail:'7가지 팁으로 Pro 요금제를 알뜰하게 써보세요' }
];

// Fill every gap: each scene stays on screen until the next one begins, so
// the visual track never drops to a blank stage even where the storyboard's
// original beats were more sparsely spaced than the narration.
for (let i = 0; i < cards.length; i++) {
  cards[i].endSec = i < cards.length - 1 ? cards[i + 1].startSec : duration;
}

const accentHex = ['#b8f2e6','#ffa69e','#bde0fe','#c8b6ff','#faedcd'];
const tintHex   = ['#eef9f6','#fff1ef','#eef6ff','#f4efff','#fdf7e8'];
const accentVars = ['var(--accent-0)','var(--accent-1)','var(--accent-2)','var(--accent-3)','var(--accent-4)'];

function esc(s='') { return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function chipsOrParagraph(id, detail) {
  const parts = detail.split('·').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return `<div id="${id}-detail" class="detail">${esc(detail)}</div>`;
  return `<div id="${id}-detail" class="chip-row">${parts.map(p => `<span class="chip">${esc(p)}</span>`).join('')}</div>`;
}

function sceneHTML(c) {
  const accent = accentVars[c.accentIndex];
  const tint = tintHex[c.accentIndex];
  const inner = (() => {
    if (c.variant === 'tip') {
      const idx = Number(c.number);
      const dots = Array.from({length:7}, (_,i) => `<span class="dot-step${i < idx ? ' filled' : ''}"></span>`).join('');
      return `
        <div id="${c.id}-panel" class="panel panel-tip">
          <div id="${c.id}-number" class="tip-number">${esc(c.number)}</div>
          <div class="tip-copy">
            <div class="eyebrow"><span class="dot"></span>${esc(c.kicker)}</div>
            <h2 id="${c.id}-title" class="title">${esc(c.title)}</h2>
            <div id="${c.id}-detail" class="detail">${esc(c.detail)}</div>
            <div class="tip-steps">${dots}</div>
          </div>
        </div>`;
    }
    if (c.variant === 'image') {
      return `
        <div id="${c.id}-panel" class="panel panel-image">
          <div class="image-copy">
            <div class="eyebrow"><span class="dot"></span>${esc(c.kicker)}</div>
            <h2 id="${c.id}-title" class="title">${esc(c.title)}</h2>
            <div id="${c.id}-detail" class="detail">${esc(c.detail)}</div>
          </div>
          <div class="image-frame">
            <img id="${c.id}-image" class="app-shot" src="${c.image}" alt="AI 구독 관리 앱 화면">
          </div>
        </div>`;
    }
    if (c.variant === 'stat') {
      const bar = c.barPct ? `<div class="stat-bar"><div class="stat-bar-fill" id="${c.id}-bar" style="width:0%"></div></div>` : '';
      return `
        <div id="${c.id}-panel" class="panel panel-center panel-stat">
          <div class="eyebrow"><span class="dot"></span>${esc(c.kicker)}</div>
          <h2 id="${c.id}-title" class="title">${esc(c.title)}</h2>
          ${bar}
          ${chipsOrParagraph(c.id, c.detail)}
        </div>`;
    }
    if (c.variant === 'recap') {
      return `
        <div id="${c.id}-panel" class="panel panel-center panel-recap">
          <div class="eyebrow"><span class="dot"></span>${esc(c.kicker)}</div>
          <h2 id="${c.id}-title" class="title">${esc(c.title)}</h2>
          <div id="${c.id}-detail" class="detail">${esc(c.detail)}</div>
          <div id="${c.id}-chips" class="recap-chips">
            <span class="chip">역할 분배</span><span class="chip">모바일 활용</span><span class="chip">기록 습관</span>
          </div>
        </div>`;
    }
    // hero / note / compare share the same centered template at different sizes
    return `
      <div id="${c.id}-panel" class="panel panel-center panel-${c.variant}">
        <div class="eyebrow"><span class="dot"></span>${esc(c.kicker)}</div>
        <h2 id="${c.id}-title" class="title">${esc(c.title)}</h2>
        ${c.variant === 'compare' ? chipsOrParagraph(c.id, c.detail) : `<div id="${c.id}-detail" class="detail">${esc(c.detail)}</div>`}
      </div>`;
  })();

  return `<div class="scene" data-variant="${c.variant}" style="--scene-accent:${accent};--scene-tint:${tint}">
    <div class="scene-ink-border"></div>
    ${inner}
  </div>`;
}

// Per-scene element choreography (panel slide-in, title/detail fade, and any
// variant-specific extras), scheduled relative to each scene's own startSec.
function sceneElementTimeline(c) {
  const t = (off) => (c.startSec + off).toFixed(4);
  const lines = [];
  const slideFrom = c.variant === 'tip' || c.variant === 'image' ? { x: 70 } : { y: 50 };
  lines.push(`tl.fromTo('#${c.id}-panel',{opacity:0,${slideFrom.x !== undefined ? `x:${slideFrom.x}` : `y:${slideFrom.y}`}},{opacity:1,${slideFrom.x !== undefined ? 'x:0' : 'y:0'},duration:.5,ease:'power3.out'},${t(0.06)});`);
  lines.push(`tl.fromTo('#${c.id}-title',{opacity:0,y:18},{opacity:1,y:0,duration:.42,ease:'power2.out'},${t(0.28)});`);
  if (c.variant === 'recap') {
    lines.push(`tl.fromTo('#${c.id}-detail',{opacity:0,y:14},{opacity:1,y:0,duration:.42,ease:'power2.out'},${t(0.46)});`);
    lines.push(`tl.fromTo('#${c.id}-chips',{opacity:0,y:14},{opacity:1,y:0,duration:.4,ease:'power2.out'},${t(0.62)});`);
  } else {
    lines.push(`tl.fromTo('#${c.id}-detail',{opacity:0,y:14},{opacity:1,y:0,duration:.42,ease:'power2.out'},${t(0.5)});`);
  }
  if (c.number) lines.push(`tl.fromTo('#${c.id}-number',{opacity:0,scale:.6},{opacity:1,scale:1,duration:.5,ease:'back.out(1.7)'},${t(0.12)});`);
  if (c.image) lines.push(`tl.fromTo('#${c.id}-image',{opacity:0,scale:.94},{opacity:1,scale:1,duration:.55,ease:'power2.out'},${t(0.34)});`);
  if (c.barPct) lines.push(`tl.fromTo('#${c.id}-bar',{width:'0%'},{width:'${c.barPct}%',duration:.7,ease:'power2.out'},${t(0.52)});`);
  return lines.join('\n    ');
}

// ---------------------------------------------------------------------------
// Captions — parsed from the confirmed-matching public/captions.srt so the
// narration is always readable now that the desktop recording is not shown.
// ---------------------------------------------------------------------------

function srtTimeToSec(t) {
  const [h, m, rest] = t.split(':');
  const [s, ms] = rest.split(',');
  return (+h) * 3600 + (+m) * 60 + (+s) + (+ms) / 1000;
}

function parseSRT(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const blocks = raw.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;
    const timeLine = lines[1].includes('-->') ? lines[1] : lines[0];
    const textLines = lines.slice(lines[0].includes('-->') ? 1 : 2);
    const m = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!m) continue;
    const text = textLines.join(' ').trim();
    if (!text) continue;
    cues.push({ start: srtTimeToSec(m[1]), end: srtTimeToSec(m[2]), text });
  }
  return cues;
}

const captions = parseSRT(path.join(publicDir, 'captions.srt'));

const captionHosts = captions.map((cap, i) =>
  `<div class="caption clip" id="cap-${i}" data-start="${cap.start.toFixed(3)}" data-duration="${Math.max(0.05,(cap.end-cap.start)).toFixed(3)}" data-track-index="5" style="opacity:0"><span>${esc(cap.text)}</span></div>`
).join('\n');

const captionTimeline = captions.map((cap, i) =>
  `tl.set('#cap-${i}',{opacity:1},${cap.start.toFixed(3)});\n    tl.set('#cap-${i}',{opacity:0},${cap.end.toFixed(3)});`
).join('\n    ');

// ---------------------------------------------------------------------------
// Assemble scenes + timeline
// ---------------------------------------------------------------------------

const sceneHosts = cards.map(c => `<div id="${c.id}-host" class="scene-host clip" data-card-id="${c.id}" data-start="${c.startSec.toFixed(4)}" data-duration="${(c.endSec-c.startSec).toFixed(4)}" data-track-index="2" style="opacity:0">${sceneHTML(c)}</div>`).join('\n');

const sceneTimeline = cards.map(c => {
  const exitAt = Math.max(c.startSec + 0.8, c.endSec - 0.35);
  const hardKillAt = (exitAt + 0.35).toFixed(4);
  return `
    tl.fromTo('.scene-host[data-card-id="${c.id}"]',{opacity:0},{opacity:1,duration:.4,ease:'power2.out'},${c.startSec.toFixed(4)});
    ${sceneElementTimeline(c)}
    tl.to('.scene-host[data-card-id="${c.id}"]',{opacity:0,duration:.35,ease:'power2.in'},${exitAt.toFixed(4)});
    tl.set('.scene-host[data-card-id="${c.id}"]',{opacity:0},${hardKillAt});`;
}).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <style>
    @font-face{font-family:'Malgun Gothic';src:url('fonts/malgun.ttf') format('truetype');font-weight:400;font-display:block;}
    @font-face{font-family:'Malgun Gothic';src:url('fonts/malgunbd.ttf') format('truetype');font-weight:700 900;font-display:block;}
    *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#f9f4eb;font-family:'Malgun Gothic',sans-serif}
    :root{--ink:#27324a;--ink-soft:#46516a;--accent-0:#b8f2e6;--accent-1:#ffa69e;--accent-2:#bde0fe;--accent-3:#c8b6ff;--accent-4:#faedcd;--paper:#faf3dd}
    #stage{position:relative;width:1920px;height:1080px;overflow:hidden;background:#f9f4eb}
    .ambient{position:absolute;z-index:1;pointer-events:none;border-radius:50%;filter:blur(1px)}
    #orb-a{right:-90px;top:-100px;width:320px;height:320px;background:rgba(200,182,255,.22)}
    #orb-b{left:-70px;bottom:130px;width:220px;height:220px;background:rgba(184,242,230,.2)}

    .scene-host{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;overflow:hidden;z-index:3}
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:var(--scene-tint);color:var(--ink);font-family:'Malgun Gothic',sans-serif}
    .scene-ink-border{position:absolute;inset:22px;border:3px solid rgba(39,50,74,.32);border-radius:26px;pointer-events:none}

    .eyebrow{display:inline-flex;align-items:center;gap:12px;font-size:26px;font-weight:700;letter-spacing:.08em;color:var(--ink-soft);text-transform:uppercase}
    .dot{width:16px;height:16px;border-radius:50%;background:var(--scene-accent);border:2px solid var(--ink)}
    .title{margin:22px 0 18px;line-height:1.14;letter-spacing:-.03em;font-weight:900;color:var(--ink);word-break:keep-all}
    .detail{font-size:34px;line-height:1.48;font-weight:700;color:var(--ink-soft);word-break:keep-all;max-width:1240px}
    .chip-row{display:flex;flex-wrap:wrap;gap:14px;margin-top:6px}
    .chip{padding:14px 26px;border:3px solid var(--ink);border-radius:999px;background:var(--scene-accent);font-size:28px;font-weight:800;color:var(--ink)}

    .panel{position:absolute;border:5px solid var(--ink);border-radius:44px;background:rgba(255,255,255,.72);box-shadow:16px 18px 0 var(--scene-accent)}
    .panel-center{left:200px;right:200px;top:230px;bottom:270px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:80px 100px}
    .panel-hero .title{font-size:104px}
    .panel-note .title{font-size:64px}
    .panel-compare .title{font-size:68px}
    .panel-stat .title{font-size:126px;letter-spacing:-.02em}
    .panel-recap .title{font-size:80px}
    .panel-recap .detail{font-size:36px}
    .recap-chips{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
    .recap-chips .chip{background:var(--scene-accent)}

    .stat-bar{width:100%;max-width:900px;height:34px;border:3px solid var(--ink);border-radius:999px;background:#fff;overflow:hidden;margin:8px 0 22px}
    .stat-bar-fill{height:100%;background:var(--scene-accent);border-radius:999px}

    .panel-tip{left:170px;right:170px;top:210px;bottom:250px;display:flex;align-items:center;gap:72px;padding:0 100px}
    .tip-number{flex:0 0 auto;width:230px;height:230px;display:grid;place-items:center;border-radius:56px;border:5px solid var(--ink);background:var(--scene-accent);font-size:104px;font-weight:900;box-shadow:12px 14px 0 rgba(39,50,74,.22)}
    .tip-copy{flex:1 1 auto;min-width:0}
    .tip-copy .title{font-size:72px}
    .tip-copy .detail{font-size:36px}
    .tip-steps{display:flex;gap:14px;margin-top:32px}
    .dot-step{width:20px;height:20px;border-radius:50%;border:3px solid var(--ink);background:#fff}
    .dot-step.filled{background:var(--scene-accent)}

    .panel-image{left:150px;right:150px;top:200px;bottom:250px;display:grid;grid-template-columns:minmax(0,1fr) 780px;gap:64px;align-items:center;padding:70px 90px}
    .panel-image .title{font-size:64px}
    .panel-image .detail{font-size:34px;max-width:640px}
    .image-frame{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
    .app-shot{width:100%;max-height:620px;object-fit:contain;border:5px solid var(--ink);border-radius:28px;background:#fff;box-shadow:14px 16px 0 rgba(39,50,74,.2)}

    .caption{position:absolute;left:50%;bottom:56px;transform:translateX(-50%);max-width:1720px;z-index:10;pointer-events:none}
    .caption span{display:block;background:rgba(39,50,74,.92);color:#faf3dd;font-size:42px;font-weight:800;line-height:1.35;padding:18px 40px;border-radius:20px;text-align:center;word-break:keep-all;box-shadow:0 8px 0 rgba(0,0,0,.08)}
  </style>
</head>
<body>
<div id="stage" data-composition-id="ai-subscription-pastel" data-start="0" data-duration="${duration}" data-fps="30" data-width="1920" data-height="1080">
  <audio id="narration-audio" src="narration.m4a" data-start="0" data-duration="${duration}" data-track-index="10" data-volume="1"></audio>
  <div id="orb-a" class="ambient" data-layout-ignore></div><div id="orb-b" class="ambient" data-layout-ignore></div>
  ${sceneHosts}
  ${captionHosts}
  <script src="vendor/gsap.min.js"></script>
  <script>
  (function(){
    const tl=window.gsap.timeline({paused:true});
    tl.to('#orb-a',{scale:1.12,x:-24,y:18,duration:4,ease:'sine.inOut',repeat:106,yoyo:true},0);
    tl.to('#orb-b',{scale:1.14,x:20,y:-16,duration:5,ease:'sine.inOut',repeat:85,yoyo:true},0);
    ${sceneTimeline}
    ${captionTimeline}
    window.__timelines=window.__timelines||{};
    window.__timelines['ai-subscription-pastel']=tl;
  })();
  </script>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), html);
fs.writeFileSync(
  path.join(root, 'index.html'),
  html
    .replaceAll('src="narration.m4a"', 'src="public/narration.m4a"')
    .replace('src="app.png"', 'src="public/app.png"')
    .replaceAll('src="vendor/gsap.min.js"', 'src="public/vendor/gsap.min.js"')
    .replaceAll("url('fonts/", "url('public/fonts/")
);

fs.writeFileSync(path.join(root, 'metadata.json'), JSON.stringify({ duration, width:1920, height:1080, fps:30, source:'narration.m4a (audio only — desktop-capture video not used)' }, null, 2));

const storyboard = {
  schemaVersion: 3,
  composition: { fps:30, width:1920, height:1080, durationSeconds:duration, layout:'landscape', themeId:'pastel-soft', seed:263 },
  audioTrack: { sourcePath:'public/narration.m4a', startSec:0, endSec:duration },
  subtitles: { enabled:true, source:'public/captions.srt', note:'원본 화면 녹화(데스크탑 노출)를 쓰지 않기로 하여, 오디오만 사용하고 전체 자막을 하단 안전 영역에 표시함' },
  scenes: cards.map(c => ({ id:c.id, intent:c.title, startSec:c.startSec, endSec:c.endSec, accentIndex:c.accentIndex, contentHints:{ kicker:c.kicker, title:c.title, detail:c.detail, image:c.image ?? null }, archetype:c.variant }))
};
fs.writeFileSync(path.join(root, 'storyboard.json'), JSON.stringify(storyboard, null, 2));

console.log(`Built ${cards.length} full-bleed scenes and ${captions.length} captions -> public/index.html`);
