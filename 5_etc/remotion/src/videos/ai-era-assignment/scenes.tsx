import React from 'react';
import { draw, grow, count, mx, pop, pulse, rise, shake, slam, slide, spin, stamp, sweep, up, prog, yoyo, E } from '../../kit/anim';
import { useT, type Timing } from '../../kit/time';
import { Burst, Flash, Kinetic, kineticEnd, Ring, Sparkles } from '../../kit/fx';
import type { Kind } from '../../kit/stage';
import { Arrow, BG, C, Chip, Flow, HL, Hl, Ico, Ok, Pill, Svg } from '../../kit/ui';

// AI 시대의 과제 — 34 scenes, a port of videos/ai-era-assignment/build.mjs (HyperFrames).
// Times are absolute seconds pinned to SRT cues: T(12) = start of cue 12, T(12, .3) = 0.3s later.
// kind 'say'  → the character stands on the left, the card (.scard) sits on the right
// kind 'full' → the character steps out, wide card (.fcard) or impact typography (.mega)

type S = React.FC<{ T: Timing['T'] }>;
export type SceneDef = { name: string; from: number; kind: Kind; El: S };

const Stepper: React.FC<{ act: number; style?: React.CSSProperties }> = ({ act, style }) => (
  <div className="stepper" style={style}>
    {['첫 프롬프트', '과정 캡처', '10회 개선', '차별점 발표'].map((l, i) =>
      <div key={l} className={`stp${i + 1 === act ? ' on' : i + 1 < act ? ' done' : ''}`}><b>{i + 1}</b><span>{l}</span></div>)}
  </div>
);
const Swot: React.FC<{ t: number; at: number; sm?: boolean; style?: React.CSSProperties }> = ({ t, at, sm, style }) => (
  <div className={`swot ${sm ? 'sm' : ''}`} style={style}>{['S', 'W', 'O', 'T'].map((x, i) => <div key={x} className={`sw sw${i}`} style={mx(pop(t, at + i * 0.2))}>{x}</div>)}</div>
);

// ---- 01 교수님들의 고민 ------------------------------------------------------
const Open: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <Pill dot={C.coral} style={mx(up(t, 0.3, 16))}>AI 시대의 과제</Pill>
      <Kinetic t={t} at={T(3)} parts={['과제를 ', { hl: 'AI로' }, ' 한다면']} />
      <div className="mt"><Kinetic inline className="" t={t} at={T(4)} parts={['평가는 ', { em: '어떻게' }, ' 해야 할까요']} /><span className="qm" style={mx(stamp(t, T(4, 1.2)))}>?</span></div>
      <div className="sub" style={mx(up(t, 1.0, 16))}>요즘 교수님들의 가장 큰 고민</div>
      <Ring t={t} at={T(4, 1.25)} x={1520} y={560} r={300} color="rgba(255,224,138,.95)" />
    </div>
  );
};

const Survey: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(5)))}>
      <Pill dot={C.lav} style={mx(up(t, T(6), 16))}>교육자 · 교수님 대상 사전 설문</Pill>
      <div className="row gap">
        <Ico name="doc" color={C.lav} bg={BG.lav} style={mx(pop(t, T(7)))} />
        <div className="qbub" style={mx(slide(t, T(9)))}>교수님들, 요즘 <b>AI와 관련해서</b><br />어떤 고민이 있으신가요?</div>
      </div>
      <div className="ans">
        <div className="abub" style={mx(pop(t, T(11, 0.3)))}>과제를 AI로 해 와요…</div>
        <div className="abub b2" style={mx(pop(t, T(11, 1.1)))}>평가를 어떻게 하죠?</div>
        <div className="abub b3" style={mx(pop(t, T(11, 1.9)))}>AI를 막아야 할까요?</div>
      </div>
    </div>
  );
};

const Whose: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(12)))}>
      <Pill dot={C.sky} style={mx(up(t, T(12, 0.3), 16))}>학생들이 AI를 써서 과제를 낸다</Pill>
      <Flow t={t} nodes={[['student', C.sky, BG.sky, '학생', T(12, 0.9)], ['robot', C.lav, BG.lav, 'AI가 작성', T(13, 0.6)], ['doc', C.coral, BG.peach, '과제 제출', T(14, 0.5)]]} />
      <div className="h2" style={mx(up(t, T(15, 0.3), 26))}>이 점수, <Hl c={HL.p} style={sweep(t, T(16, 0.6))}>누구의 것</Hl>일까요?</div>
    </div>
  );
};

const ThreeQ: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="sub" style={mx(up(t, T(18, 0.1), 16))}>저도 고민을 많이 해봤습니다</div>
      <div className="qstack">
        <div className="qline" style={mx(slam(t, T(20)))}><Ico name="lock" color={C.coral} bg={BG.peach} size="xs" /><span>AI를 <b>막을 수</b> 있을까?</span></div>
        <div className="qline" style={mx(slam(t, T(21)))}><Ico name="x" color={C.pink} bg={BG.pink} size="xs" /><span>AI를 <b>안 쓰게 할 수</b> 있을까?</span></div>
        <div className="qline hot" style={mx(slam(t, T(22)), shake(t, T(23), 0.06, 5, 10))}><Ico name="question" color={C.lav} bg={BG.lav} size="xs" /><span>안 쓰게 하는 게 <b>맞을까?</b></span></div>
      </div>
      <Ring t={t} at={T(20, 0.05)} x={960} y={360} r={520} />
      <Ring t={t} at={T(21, 0.05)} x={960} y={490} r={560} />
      <Ring t={t} at={T(22, 0.05)} x={960} y={620} r={640} color="rgba(255,224,138,.95)" />
      <Flash t={t} at={T(22, 0.02)} strength={0.35} />
    </div>
  );
};

const World: S = ({ T }) => {
  const t = useT();
  const chips: [Parameters<typeof Chip>[0]['name'], string, string, string][] = [
    ['code', C.mint, BG.mint, '개발'], ['pen', C.coral, BG.peach, '글쓰기'], ['palette', C.pink, BG.pink, '디자인'],
    ['trend', C.sky, BG.sky, '금융'], ['book', C.lav, BG.lav, '교육'], ['heart', C.pink, BG.pink, '의료']];
  return (
    <div className="card scard say" style={mx(rise(t, T(24)))}>
      <Pill dot={C.mint} style={mx(up(t, T(24, 0.3), 16))}>학생들이 살아갈 앞으로의 세상</Pill>
      <div className="row gap">
        <Ico name="globe" color={C.mint} bg={BG.mint} style={mx(pop(t, T(25)))} />
        <div className="h2 sm" style={mx(up(t, T(25, 0.2), 20))}>AI가 <Hl c={HL.m} style={sweep(t, T(25, 0.8))}>꼭 필요</Hl>합니다</div>
      </div>
      <div className="chips5">{chips.map(([n, c, b, l], i) => <Chip key={l} name={n} color={c} bg={b} style={mx(pop(t, T(26, i * 0.35)))}>{l}</Chip>)}</div>
      <div className="sub" style={mx(up(t, T(27), 16))}>AI가 없는 분야가 거의 없고, <b>너무 빠르게</b> 퍼지는 중</div>
    </div>
  );
};

const Dilemma: S = ({ T }) => {
  const t = useT();
  const red = prog(t, T(31), 0.3);
  return (
    <div className="card scard say" style={mx(rise(t, T(28)))}>
      <Pill dot={C.pink} style={mx(up(t, T(28, 0.3), 16))}>딜레마</Pill>
      <div className="duo2">
        <div className="dcol" style={mx(slide(t, T(28, 0.7), -50))}><Ico name="lock" color={C.coral} bg={BG.peach} size="sm" /><div className="dct">무조건 금지?</div><div className="dcs">앞으로의 세상엔<br />AI가 필요한데…</div></div>
        <div className="vs">VS</div>
        <div className="dcol" style={mx(slide(t, T(29)))}><Ico name="sparkle" color={C.yellow} bg={BG.yellow} size="sm" /><div className="dct">자유롭게 허용?</div>
          <div className="dcs" style={{ color: `rgb(${91 + (176 - 91) * red},${88 + (74 - 88) * red},${115 + (108 - 115) * red})` }}>답은 <b>Claude</b>·<b>ChatGPT</b>가<br />주는 거니까…</div></div>
      </div>
      <div className="stampbox" style={mx(stamp(t, T(30, 1.0)), { tf: 'rotate(-3deg)' })}>평가가 무의미해진다</div>
    </div>
  );
};

const Flip: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(34)))}>
      <Pill dot={C.yellow} style={mx(up(t, T(34, 0.3), 16))}>AI 활용 능력의 역전</Pill>
      <div className="bars">
        <div className="barrow" style={mx(slide(t, T(35)))}><Ico name="student" color={C.sky} bg={BG.sky} size="xs" /><span className="blab">젊은 세대</span>
          <div className="bar"><span className="barf" style={{ background: '#8fc0f0', ...grow(t, [[T(35, 0.4), 0.92, 1.2]]) }} /></div><b className="bnum">뛰어남</b></div>
        <div className="barrow" style={mx(slide(t, T(36, 0.5)))}><Ico name="book" color={C.coral} bg={BG.peach} size="xs" /><span className="blab">교수님</span>
          <div className="bar"><span className="barf" style={{ background: '#f3a48e', ...grow(t, [[T(36, 0.9), 0.45, 1.0], [T(38), 0.95, 1.2]]) }} /></div><b className="bnum">?</b></div>
      </div>
      <div className="h2 sm" style={mx(up(t, T(37), 24))}>평가하려면 교수님도<br /><Hl style={sweep(t, T(37, 1.4))}>AI를 굉장히 잘 아셔야</Hl> 합니다</div>
    </div>
  );
};

const Harder: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(39)))}>
      <Pill dot={C.grey} style={mx(up(t, T(41), 16))}>옛날 관점 그대로 평가한다면</Pill>
      <div className="chartbox">
        <svg viewBox="0 0 900 300" fill="none"><path d="M20 280H880M20 20V280" stroke="#d9d4e4" strokeWidth={4} />
          <path pathLength={1} d="M40 60C220 70 360 110 480 160S740 250 860 268" stroke="#e8708f" strokeWidth={10} strokeLinecap="round" style={{ strokeDasharray: 1, ...draw(t, T(40), 2.6) }} /></svg>
        <div className="ctagr" style={mx(pop(t, T(40, 2.4)))}>평가의 정확도 ↓</div>
      </div>
      <div className="h2 sm" style={mx(up(t, T(42), 24))}>과제 평가가 <Hl c={HL.p} style={sweep(t, T(42, 1.2))}>점점 어려워진다</Hl></div>
    </div>
  );
};

const NewWay: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <Ico name="bulb" color={C.yellow} bg={BG.yellow} style={mx(pop(t, T(43, 0.1)), spin(t, T(43, 1.8), 0.15, 3, 12))} />
      <Kinetic className="mt xl" t={t} at={T(43, 0.9)} stagger={0.05} parts={[{ hl: '새로운 방식' }, '이\n필요합니다']} />
      <Burst t={t} at={T(43, 0.95)} x={960} y={520} n={34} seed="nw" />
      <Ring t={t} at={T(43, 0.95)} x={960} y={520} r={700} />
      <Sparkles t={t} at={T(43, 1.6)} x={960} y={500} spread={560} seed="nw" />
    </div>
  );
};

// ---- 02 새로운 접근 ----------------------------------------------------------
const UseIt: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="sub" style={mx(up(t, T(44, 0.1), 20))}>AI 쓰는 것을 막기 어렵다면?</div>
      <div className="mt xxl"><span style={mx(slam(t, T(46, 0.9)))}>AI,</span> <span style={mx(slam(t, T(47, 0.2)))}>최대한</span><br />
        <Kinetic inline className="" t={t} at={T(47, 0.7)} stagger={0.07} parts={[{ hl: '잘 써봐라' }]} /></div>
      <Ring t={t} at={T(46, 0.95)} x={700} y={380} r={360} />
      <Ring t={t} at={T(47, 0.25)} x={1150} y={380} r={360} />
      <Burst t={t} at={T(47, 1.0)} x={960} y={560} n={40} power={1.2} seed="ui" />
      <Flash t={t} at={T(47, 0.95)} strength={0.4} />
      <div className="note" style={mx(up(t, T(48, 0.2), 16))}>물론 이것도 정답은 아닙니다 · 여러 방안 중 하나</div>
    </div>
  );
};

const Harder2: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(49)))}>
      <Pill dot={C.mint} style={mx(up(t, T(49, 0.3), 16))}>못 막는다면, 이렇게</Pill>
      <div className="row gap"><Ok size="big" style={mx(pop(t, T(50)))}>AI 자유롭게 사용</Ok></div>
      <div className="plus" style={mx(pop(t, T(51, -0.3)))}>+</div>
      <div className="meter" style={mx(up(t, T(51), 20))}><span className="mlab">대신 과제 난이도</span>
        <div className="mbar"><span className="mfill" style={grow(t, [[T(51, 0.4), 0.9, 1.1]])} /></div><b className="mup" style={mx(stamp(t, T(51, 1.2)))}>UP</b></div>
    </div>
  );
};

// ---- 03 과거의 과제 ----------------------------------------------------------
const Old: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(52)))}>
      <Pill dot={C.grey} style={mx(up(t, T(52, 0.3), 16))}>예를 들어, 과거의 과제</Pill>
      <div className="paper">
        <div className="pline" style={mx(slide(t, T(53)))}><span className="nb">1</span><span><b>SWOT 분석</b>의 개념을 설명하고</span></div>
        <div className="pline" style={mx(slide(t, T(54)))}><span className="nb">2</span><span><b>엔비디아 vs AMD</b>를 SWOT 관점에서 비교하는 리포트</span></div>
        <div className="pline" style={mx(slide(t, T(56)))}><span className="nb">3</span><span>A4 5쪽 이내 · <b>워드</b>로 제출</span></div>
      </div>
      <Swot t={t} at={T(53, 0.5)} />
    </div>
  );
};

const Search: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(58)))}>
      <Pill dot={C.sky} style={mx(up(t, T(58, 0.3), 16))}>옛날에는 — 구글 · 네이버 검색</Pill>
      <div className="sbar"><Svg name="search" color="#6aa3e6" /><span style={mx(up(t, T(60, 0.3), 12))}>딱 맞는 리포트는 많지 않죠</span></div>
      <div className="row gap">
        <Chip name="search" color={C.sky} bg={BG.sky} style={mx(pop(t, T(61)))}>SWOT이란?</Chip>
        <Chip name="search" color={C.mint} bg={BG.mint} style={mx(pop(t, T(62)))}>엔비디아</Chip>
        <Chip name="search" color={C.coral} bg={BG.peach} style={mx(pop(t, T(63)))}>AMD</Chip>
      </div>
      <div className="row gap">
        <Chip name="book" color={C.lav} bg={BG.lav} style={mx(slide(t, T(65, 0.3), -40))}>그 전엔 책을 찾아보며</Chip>
        <div className="h3" style={mx(up(t, T(64), 20))}>→ 그 <Hl style={sweep(t, T(64, 0.8))}>과정 속에서 학습</Hl></div>
      </div>
    </div>
  );
};

const Now: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card fcard" style={mx(rise(t, T(68)))}>
      <Pill dot={C.lav} style={mx(up(t, T(68, 0.3), 16))}>이제는 — 이 문장만 AI에게</Pill>
      <div className="row gap big">
        <div className="promptbox" style={mx(slide(t, T(68, 0.9), -50))}><div className="pbh"><Svg name="chat" color="#9a8be6" /><span>프롬프트</span></div>
          <div className="pbt">SWOT 개념을 설명하고 엔비디아와 AMD를 비교하는 리포트를 써줘</div></div>
        <Arrow pathStyle={draw(t, T(69, 0.3), 0.5)} />
        <div className="pages">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="pg" style={{ left: i * 34, top: i * 22, ...mx(pop(t, T(69, 0.7 + i * 0.35))) }}><i /><i /><i /><i /><i className="s" /></div>)}
          <div className="pgn" style={mx(pop(t, T(69, 0.7)))}>{count(t, T(69, 0.7), 1.75, 5)}쪽</div>
        </div>
      </div>
      <div className="row gap">
        <Chip name="palette" color={C.pink} bg={BG.pink} style={mx(pop(t, T(71, 0.4)))}>원하는 스타일</Chip>
        <Chip name="music" color={C.sky} bg={BG.sky} style={mx(pop(t, T(72, 0.6)))}>원하는 톤</Chip>
        <div className="docx" style={mx(stamp(t, T(74)))}>W<span>보고서.docx</span></div>
      </div>
    </div>
  );
};

const Detect: S = ({ T }) => {
  const t = useT();
  // needle swings up to 50°, then wavers between 50° and -30° — the detector can't make up its mind
  const needle = -80 + 130 * prog(t, T(84, 0.3), 0.9, E.p2) - 80 * yoyo(t, T(84, 1.3), 0.5, 3);
  return (
    <div className="card scard say" style={mx(rise(t, T(75)))}>
      <Pill dot={C.coral} style={mx(up(t, T(75, 0.3), 16))}>이런 과제는 평가하기 어렵다</Pill>
      <div className="row gap">
        <div className="dcol sm2" style={mx(slide(t, T(76, 0.2), -50))}><Svg name="doc" color="#9a8be6" /><span>톤만 살짝 다른 과제</span><b>AI 썼을까? 안 썼을까?</b></div>
        <div className="gauge" style={mx(up(t, T(84), 24))}>
          <svg viewBox="0 0 220 130" fill="none"><path d="M20 120a90 90 0 0 1 180 0" stroke="#efe9f6" strokeWidth={22} strokeLinecap="round" />
            <path pathLength={1} d="M20 120a90 90 0 0 1 180 0" stroke="#f3c25b" strokeWidth={22} strokeLinecap="round" style={{ strokeDasharray: 1, strokeDashoffset: 1 - 0.5 * prog(t, T(84, 0.3), 0.8, E.p2) }} />
            <g transform={`rotate(${needle} 110 120)`}><path d="M110 120L110 46" stroke="#34314a" strokeWidth={7} strokeLinecap="round" /></g><circle cx={110} cy={120} r={11} fill="#34314a" /></svg>
          <span>AI 탐지기</span><b style={mx(pop(t, T(85)))}>정확할까?</b>
        </div>
      </div>
      <div className="h2 sm" style={mx(up(t, T(86), 24))}>AI로 <Hl c={HL.p} style={sweep(t, T(86, 0.9))}>해결하기 쉬운</Hl> 과제였다면</div>
    </div>
  );
};

// ---- 04 AI 시대의 과제 -------------------------------------------------------
const Chap: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="cc-n" style={mx(up(t, T(87, 0.3), 16))}>제가 생각해 본</div>
      <Kinetic className="mt xxl" t={t} at={T(87, 0.6)} stagger={0.06} parts={['AI ', { hl: '시대' }, '의 과제']} />
      <div className="sub" style={mx(up(t, T(89), 16))}>이런 식으로 과제를 내주면 어떨까요?</div>
      <Flash t={t} at={T(87, 0.6)} strength={0.5} />
      <Ring t={t} at={T(87, 0.62)} x={960} y={450} r={820} />
      <Burst t={t} at={T(87, 1.0)} x={960} y={450} n={44} power={1.3} seed="ch" />
      <Sparkles t={t} at={T(87, 1.4)} x={960} y={440} spread={700} seed="ch" />
    </div>
  );
};

const Task: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card fcard" style={mx(rise(t, T(90)))}>
      <Pill dot={C.coral} style={mx(up(t, T(90, 0.2), 16))}>AI 시대의 과제</Pill>
      <Flow t={t} wide nodes={[
        ['app', C.lav, BG.lav, <>차별점 있는<br />SWOT 앱 직접 만들기</>, T(90, 0.5)],
        ['target', C.mint, BG.mint, <>그 앱으로<br />NVIDIA vs AMD 비교</>, T(91)],
        ['camera', C.coral, BG.peach, <>비교 결과를<br />캡처해서 제출</>, T(92)]]} />
    </div>
  );
};

const Diff: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(93)))}>
      <Pill dot={C.lav} style={mx(up(t, T(93, 0.3), 16))}>“차별점이 있는” SWOT 앱이란?</Pill>
      <div className="apps">
        <div className="appc" style={mx(pop(t, T(94)))}><Svg name="trend" color="#4fb489" /><b>애널리스트만을 위한</b><span>SWOT 분석 앱</span></div>
        <div className="appc" style={mx(pop(t, T(95)))}><Svg name="code" color="#6aa3e6" /><b>개발자를 위한</b><span>SWOT 분석 앱</span></div>
        <div className="appc ghost2" style={mx(pop(t, T(96)))}><Svg name="sparkle" color="#e7a92c" /><b>나만의 ???</b><span>SWOT 분석 앱</span></div>
      </div>
      <div className="h3" style={mx(up(t, T(96, 0.6), 20))}>다른 사람이 <Hl style={sweep(t, T(96, 1.4))}>만들지 않을 만한</Hl> 앱</div>
    </div>
  );
};

const Rule: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(98)))}>
      <Pill dot={C.mint} style={mx(up(t, T(98, 0.3), 16))}>규칙</Pill>
      <div className="row gap"><Ok size="big" style={mx(pop(t, T(98, 0.5)))}>AI 사용해도 됩니다</Ok><Ok size="big" style={mx(pop(t, T(99, 0.3)))}>적극 사용!</Ok></div>
      <div className="advice" style={mx(up(t, T(100, 0.5), 20))}><span className="adk">단,</span><b>AI를 사용한 과정은 전부 캡처해서 제출</b></div>
      <div className="meter" style={mx(up(t, T(102), 20))}><span className="mlab">과정이 자세할수록 점수</span>
        <div className="mbar"><span className="mfill mint" style={grow(t, [[T(102, 0.3), 0.95, 2.2]])} /></div><b className="mup mint" style={mx(stamp(t, T(103, 0.8)))}>A+</b></div>
      <Sparkles t={t} at={T(103, 0.9)} x={1150} y={180} spread={260} seed="ap" />
    </div>
  );
};

const E1: S = ({ T }) => {
  const t = useT();
  const widths = [86, 72, 92, 64, 80, 70, 88, 58, 76, 66];
  return (
    <div className="card scard say top" style={mx(rise(t, T(104)))}>
      <Stepper act={1} style={mx(up(t, T(104, 0.2), 14))} />
      <div className="h3" style={mx(up(t, T(105), 20))}>첫 프롬프트는 <Hl style={sweep(t, T(105, 0.7))}>10줄 이상</Hl></div>
      <div className="lines">{widths.map((w, i) => { const p = prog(t, T(106, i * 0.45), 0.25, E.p2);
        return <div key={i} className="ln" style={{ opacity: p, transform: `translateX(${-20 * (1 - p)}px)` }}><em>{i + 1}</em><i style={{ width: `${w}%` }} /></div>; })}</div>
      <div className="row gap">
        <Ok size="ok-sm" style={mx(pop(t, T(108)))}>직접 입력 OK</Ok>
        <Ok size="ok-sm" style={mx(pop(t, T(109)))}>프롬프트도 AI로 OK</Ok>
        <div className="mini" style={mx(pop(t, T(110, 0.5)))}><Svg name="camera" color="#9a6a12" /><span>그 과정도 캡처</span></div>
      </div>
    </div>
  );
};

const E2: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say top" style={mx(rise(t, T(112)))}>
      <Stepper act={2} style={mx(up(t, T(112, 0.2), 14))} />
      <div className="h3" style={mx(up(t, T(112, 0.5), 20))}>앱을 만드는 <Hl style={sweep(t, T(112, 1.3))}>과정을 모두 캡처</Hl></div>
      <div className="row gap">
        <div className="tools" style={mx(up(t, T(113), 16))}>
          <span className="tl1" style={mx(pop(t, T(113, 0.1)))}>Claude Code</span><span className="tl2" style={mx(pop(t, T(114)))}>Codex</span><span className="tl3" style={mx(pop(t, T(115)))}>Antigravity</span></div>
        <Arrow sm pathStyle={draw(t, T(116), 0.4)} />
        <div className="tbox" style={mx(pop(t, T(116, 0.4)))}><Svg name="git" color="#34314a" /><span>GitHub</span></div>
        <Arrow sm pathStyle={draw(t, T(117), 0.4)} />
        <div className="tools" style={mx(up(t, T(118), 16))}><span className="tl4" style={mx(pop(t, T(118, 0.1)))}>Netlify</span><span className="tl5" style={mx(pop(t, T(119)))}>Vercel</span></div>
      </div>
      <div className="mini" style={mx(pop(t, T(121, 0.3)))}><Svg name="clock" color="#9a6a12" /><span>앱 만드는 데 걸린 시간도 적기</span></div>
    </div>
  );
};

const E3: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say top" style={mx(rise(t, T(123)))}>
      <Stepper act={3} style={mx(up(t, T(123, 0.2), 14))} />
      <div className="row gap">
        <div className="bignum" style={mx(pop(t, T(124)))}><span>{count(t, T(124, 0.2), 2.6, 10)}</span><small>회+</small></div>
        <div className="h3 left" style={mx(up(t, T(124, 0.3), 20))}>완성된 앱을<br /><Hl c={HL.m} style={sweep(t, T(125))}>10회 이상 개선</Hl></div>
      </div>
      <div className="commits"><div className="cline" />{Array.from({ length: 10 }, (_, i) => {
        const g = prog(t, T(131, i * 0.08), 0.4);
        return <span key={i} className="cdot" style={{ left: 30 + i * 98, background: `rgb(${154 + (79 - 154) * g},${139 + (180 - 139) * g},${230 + (137 - 230) * g})`, ...mx(pop(t, T(124, 0.2 + i * 0.26))) }} />; })}</div>
      <div className="mini" style={mx(pop(t, T(126)))}><Svg name="git" color="#9a6a12" /><span>GitHub 커밋 기록 제출 → 진짜 AI로 수정했는지 확인</span></div>
      <Sparkles t={t} at={T(124, 2.8)} x={500} y={130} spread={160} seed="ten" />
    </div>
  );
};

const E4: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say top" style={mx(rise(t, T(134)))}>
      <Stepper act={4} style={mx(up(t, T(134, 0.2), 14))} />
      <div className="row gap">
        <Ico name="present" color={C.lav} bg={BG.lav} style={mx(pop(t, T(134, 0.5)))} />
        <div className="h3 left" style={mx(up(t, T(135), 20))}>내 앱은 <Hl style={sweep(t, T(135, 0.8))}>무엇이 다른가</Hl><br />학생들 앞에서 발표</div>
      </div>
      <div className="row gap">
        <div className="timer" style={mx(pop(t, T(136)))}><Svg name="clock" color="#e8708f" /><b>5:00</b></div>
        <Chip name="zap" color={C.yellow} bg={BG.yellow} style={mx(pop(t, T(137, 0.4)))}>강점</Chip>
        <Chip name="target" color={C.mint} bg={BG.mint} style={mx(pop(t, T(138, 0.2)))}>차별점</Chip>
      </div>
    </div>
  );
};

// ---- 05 왜 이 방식일까? -------------------------------------------------------
const Vs: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card fcard" style={mx(rise(t, T(140)))}>
      <Pill dot={C.coral} style={mx(up(t, T(140, 0.3), 16))}>이런 과제를 내주면</Pill>
      <div className="duo2 wide">
        <div className="cmp2 bad col" style={mx(slide(t, T(142), -60))}><Ico name="robot" color={C.grey} bg={BG.grey} size="sm" /><b>“SWOT 앱 만들어 줘”</b><span>AI에게 간단히 부탁한 학생</span></div>
        <div className="vs">VS</div>
        <div className="cmp2 good col" style={mx(slide(t, T(143)), pulse(t, T(145, 0.4), 0.3, 1, 0.05))}><Ico name="brain" color={C.mint} bg={BG.mint} size="sm" /><b>“어떤 차별점을 줄까?”</b><span>스스로 고민한 학생</span></div>
      </div>
      <div className="h2 sm" style={mx(up(t, T(145), 24))}>결과물이 <Hl c={HL.m} style={sweep(t, T(145, 1.2))}>다를 수밖에</Hl> 없습니다</div>
    </div>
  );
};

const Sure: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <Kinetic className="mt xl" t={t} at={T(146, 0.1)} stagger={0.045} parts={['AI 쓸 거면 ', { hl: '확실하게' }]} />
      <Kinetic className="mt md" t={t} at={T(147, 0.2)} parts={['그리고 고민 많이 해보기']} />
      <Ring t={t} at={kineticEnd(T(146, 0.1), ['AI 쓸 거면 ', { hl: '확실하게' }], 0.045)} x={1180} y={400} r={420} color="rgba(255,224,138,.95)" />
    </div>
  );
};

const Build: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(148)))}>
      <Pill dot={C.sky} style={mx(up(t, T(148, 0.3), 16))}>제가 직접 AI로 이것저것 만들어 보니</Pill>
      <div className="bars">
        <div className="barrow" style={mx(slide(t, T(150)))}><Ico name="chat" color={C.grey} bg={BG.grey} size="xs" /><span className="blab w2">텍스트로 질문 → 답</span>
          <div className="bar"><span className="barf" style={{ background: '#c9c4d6', ...grow(t, [[T(151), 0.22, 0.8]]) }} /></div></div>
        <div className="barrow" style={mx(slide(t, T(152)))}><Ico name="app" color={C.lav} bg={BG.lav} size="xs" /><span className="blab w2">직접 빌드해 보기</span>
          <div className="bar"><span className="barf" style={{ background: '#9a8be6', ...grow(t, [[T(153), 0.96, 1.6]]) }} /></div></div>
      </div>
      <div className="row gap">
        <Ico name="brain" color={C.pink} bg={BG.pink} size="sm" style={mx(pop(t, T(154)), pulse(t, T(154, 0.9), 0.25, 3, 0.18))} />
        <div className="h3" style={mx(up(t, T(154, 0.2), 20))}>머리를 <Hl c={HL.p} style={sweep(t, T(154, 0.8))}>상당히 쓰게</Hl> 됩니다</div>
      </div>
    </div>
  );
};

const Paradox: S = ({ T }) => {
  const t = useT();
  const dim = prog(t, T(158, 2.0), 0.5, E.p2);
  return (
    <div className="mega">
      <div className="qbub wide" style={mx(up(t, T(156), 20), { o: 1 - 0.55 * dim, tf: `scale(${1 - 0.06 * dim})` })}>학생들이 사고력·논리력을 키워야 하는데 <b>AI 때문에 어렵다</b></div>
      <div className="cc-n" style={mx(up(t, T(158, 1.0), 16))}>그렇다면 역설적으로</div>
      <Kinetic className="mt xl" t={t} at={T(158, 2.2)} stagger={0.045} parts={['AI를 ', { hl: '최대한' }, ' 써서\n뭔가를 만들어봐라']} />
      <div className="sub" style={mx(up(t, T(159), 16))}>그 과정에서 <b>머리를 써보도록</b></div>
      <Flash t={t} at={T(158, 2.2)} strength={0.3} />
      <Sparkles t={t} at={T(158, 3.0)} x={960} y={520} spread={640} seed="px" />
    </div>
  );
};

const FlowAI: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(161)))}>
      <Pill dot={C.grey} style={mx(up(t, T(161, 0.3), 16))}>정답은 아닙니다 · 하나의 방법일 뿐</Pill>
      <div className="row gap">
        <Ico name="wave" color={C.sky} bg={BG.sky} style={mx(pop(t, T(163)))} />
        <div className="h3 left" style={mx(up(t, T(164), 20))}>AI는 이제 막을 수 없는<br /><Hl style={sweep(t, T(165, 0.3))}>큰 흐름</Hl>이 됐습니다</div>
      </div>
      <div className="eq hot" style={mx(slide(t, T(166)))}><Ico name="student" color={C.coral} bg={BG.peach} size="xs" /><span>학생들이</span><b>유리하게 AI를 쓰도록 유도</b></div>
      <div className="sub" style={mx(up(t, T(169), 16))}>그게 <b>교육자의 역할</b>이라고 생각합니다</div>
    </div>
  );
};

const Sum: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card fcard" style={mx(rise(t, T(170)))}>
      <Pill dot={C.coral} style={mx(up(t, T(170, 0.2), 16))}>정리하면</Pill>
      <Flow t={t} wide nodes={[
        ['sparkle', C.yellow, BG.yellow, 'AI를 활용해서', T(171)],
        ['app', C.lav, BG.lav, <>무언가를<br />만들어내는 과제</>, T(172, 0.3)],
        ['brain', C.mint, BG.mint, <>사고력 · 논리력<br />UP</>, T(174)]]} />
      <div className="h2 sm" style={mx(up(t, T(170, 0.5), 20))}>이것이 <Hl style={sweep(t, T(170, 1.2))}>AI 시대만의 과제</Hl></div>
    </div>
  );
};

// ---- 06 교육자분들께 ---------------------------------------------------------
const Comment: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(175)))}>
      <Pill dot={C.mint} style={mx(up(t, T(175, 0.3), 16))}>여러분의 생각을 들려주세요</Pill>
      <div className="row gap">
        <Ico name="chat" color={C.mint} bg={BG.mint} style={mx(pop(t, T(176)))} />
        <div className="h3 left" style={mx(up(t, T(176, 0.3), 20))}>또 다른 아이디어 ·<br />지금 하고 계신 <Hl c={HL.m} style={sweep(t, T(177, 0.6))}>좋은 방법</Hl></div>
      </div>
      <div className="cta mintc" style={mx(stamp(t, T(178)))}><Svg name="chat" color="#ffffff" /><span>댓글로 알려주세요</span></div>
    </div>
  );
};

const Thanks: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <Ico name="heart" color={C.pink} bg={BG.pink} style={mx(pop(t, T(179, 0.2)), pulse(t, T(180, 1.2), 0.3, 5, 0.15))} />
      <div className="sub" style={mx(up(t, T(179, 0.4), 16))}>우리 교수님들, 선생님들</div>
      <Kinetic className="mt xl" t={t} at={T(180)} stagger={0.05} parts={['AI 시대에\n', { hl: '고생 많으십니다', c: HL.p }]} />
      <Sparkles t={t} at={T(180, 0.9)} x={960} y={560} spread={620} seed="th" />
      <Burst t={t} at={T(180, 0.8)} x={960} y={600} n={30} power={0.8} seed="th" />
    </div>
  );
};

const Pioneer: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(181)))}>
      <Pill dot={C.lav} style={mx(up(t, T(181, 0.3), 16))}>교육자분들은</Pill>
      <div className="row gap">
        <Ico name="wind" color={C.sky} bg={BG.sky} style={mx(pop(t, T(182)), shake(t, T(182, 0.4), 0.4, 7, 6))} />
        <div className="h3 left" style={mx(up(t, T(182, 0.3), 20))}>늘 앞선에서 바람을 맞는<br /><Hl style={sweep(t, T(183, 0.8))}>선구자</Hl></div>
      </div>
      <div className="sub" style={mx(up(t, T(184), 16))}>변화가 너무 큰 AI 시대 — 학생들이 <b>잘 적응하도록</b> 애쓰고 계십니다</div>
    </div>
  );
};

const Me: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(189)))}>
      <Pill dot={C.coral} style={mx(up(t, T(189, 0.3), 16))}>필로소피 AI 교육</Pill>
      <div className="h2 sm" style={mx(up(t, T(189, 1.0), 24))}>교육자분들의 고민을<br /><Hl c={HL.m} style={sweep(t, T(189, 2.5))}>함께 해결</Hl>하고 싶습니다</div>
      <div className="sub" style={mx(up(t, T(191), 16))}>그 고민의 일환으로 만든 영상입니다</div>
    </div>
  );
};

const Next: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(193)))}>
      <Pill dot={C.yellow} style={mx(up(t, T(193, 0.3), 16))}>다음 영상 예고</Pill>
      <div className="row gap">
        <div className="mock" style={mx(pop(t, T(193, 0.8)))}><div className="mbarh"><i /><i /><i /><span>SWOT Analyzer</span></div><Swot t={t} at={T(193, 1.4)} sm /></div>
        <div className="h3 left" style={mx(up(t, T(193, 1.2), 20))}>SWOT 분석 앱<br /><Hl style={sweep(t, T(193, 2.2))}>직접 만들어 보기</Hl></div>
      </div>
      <div className="sub" style={mx(up(t, T(194), 16))}>어떻게 만드는지 교수님들께 알려드릴게요</div>
    </div>
  );
};

export const SCENES: SceneDef[] = [
  { name: '오프닝 질문', from: 1, kind: 'full', El: Open },
  { name: '사전 설문', from: 5, kind: 'say', El: Survey },
  { name: '누구의 점수?', from: 12, kind: 'say', El: Whose },
  { name: '세 가지 질문', from: 18, kind: 'full', El: ThreeQ },
  { name: 'AI가 필요한 세상', from: 24, kind: 'say', El: World },
  { name: '딜레마', from: 28, kind: 'say', El: Dilemma },
  { name: '활용 능력의 역전', from: 34, kind: 'say', El: Flip },
  { name: '평가가 어려워진다', from: 39, kind: 'say', El: Harder },
  { name: '새로운 방식', from: 43, kind: 'full', El: NewWay },
  { name: 'AI 최대한 잘 써봐라', from: 44, kind: 'full', El: UseIt },
  { name: '대신 과제 난이도 UP', from: 49, kind: 'say', El: Harder2 },
  { name: '과거의 과제', from: 52, kind: 'say', El: Old },
  { name: '옛날 검색', from: 58, kind: 'say', El: Search },
  { name: '이제는 AI에게', from: 68, kind: 'full', El: Now },
  { name: 'AI 탐지기', from: 75, kind: 'say', El: Detect },
  { name: 'AI 시대의 과제', from: 87, kind: 'full', El: Chap },
  { name: '새 과제', from: 90, kind: 'full', El: Task },
  { name: '차별점', from: 93, kind: 'say', El: Diff },
  { name: '규칙', from: 98, kind: 'say', El: Rule },
  { name: '평가 1', from: 104, kind: 'say', El: E1 },
  { name: '평가 2', from: 112, kind: 'say', El: E2 },
  { name: '평가 3', from: 123, kind: 'say', El: E3 },
  { name: '평가 4', from: 134, kind: 'say', El: E4 },
  { name: '결과물 비교', from: 140, kind: 'full', El: Vs },
  { name: '확실하게', from: 146, kind: 'full', El: Sure },
  { name: '빌드의 힘', from: 148, kind: 'say', El: Build },
  { name: '역설', from: 155, kind: 'full', El: Paradox },
  { name: '큰 흐름', from: 161, kind: 'say', El: FlowAI },
  { name: '정리', from: 170, kind: 'full', El: Sum },
  { name: '댓글', from: 175, kind: 'say', El: Comment },
  { name: '고생 많으십니다', from: 179, kind: 'full', El: Thanks },
  { name: '선구자', from: 181, kind: 'say', El: Pioneer },
  { name: '필로소피', from: 189, kind: 'say', El: Me },
  { name: '다음 영상', from: 193, kind: 'say', El: Next },
];
