import React from 'react';
import { count, draw, grow, mx, pop, prog, rise, slam, slide, spin, stamp, sweep, up, E } from '../../kit/anim';
import { Burst, Flash, Kinetic, Ring, Sparkles } from '../../kit/fx';
import type { IconName } from '../../kit/icons';
import type { Kind } from '../../kit/stage';
import { useT, type Timing } from '../../kit/time';
import { BG, C, Chip, Flow, HL, Hl, Ico, Ok, Pill, Svg } from '../../kit/ui';

// AI 시대의 과제 — 직접 해보기 편: the motion-graphic scenes around the practice screens (shot.tsx).
// Same beats as videos/ai-era-assignment-practice/build.mjs (HyperFrames), re-staged for the dark cinematic theme.
// Times are absolute seconds pinned to SRT cues: T(12) = start of cue 12, T(12, .3) = 0.3s later.

type S = React.FC<{ T: Timing['T'] }>;
export type SceneDef = { name: string; from: number; kind: Kind; El: S };

const Stepper: React.FC<{ act: number; style?: React.CSSProperties }> = ({ act, style }) => (
  <div className="stepper" style={style}>
    {['첫 프롬프트', '과정 캡처', '10회 개선', '차별점 시연'].map((l, i) =>
      <div key={l} className={`stp${i + 1 === act ? ' on' : i + 1 < act ? ' done' : ''}`}><b>{i + 1}</b><span>{l}</span></div>)}
  </div>
);
const Swot: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <div className="swot">{['S', 'W', 'O', 'T'].map((x, i) => <div key={x} className={`sw sw${i}`} style={mx(pop(t, at + i * 0.18))}>{x}</div>)}</div>
);

// ---- 01 들어가며 ------------------------------------------------------------
const Open: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <Pill dot={C.coral} style={mx(up(t, 0.3, 16))}>필로소피 AI 교육 · 지난 시간에 이어서</Pill>
      <Kinetic className="mt xxl" t={t} at={T(3)} stagger={0.06} parts={['AI ', { hl: '시대' }, '의 과제']} />
      <div className="sub" style={mx(up(t, T(3, 1.4), 16))}>과제를 내고, <b>직접 해 보기</b>까지</div>
      <Flash t={t} at={T(3, 0.1)} strength={0.35} />
      <Sparkles t={t} at={T(3, 0.9)} x={960} y={420} spread={620} seed="op" />
    </div>
  );
};

const Worry: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(4)))}>
      <Pill dot={C.sky} style={mx(up(t, T(4, 0.3), 16))}>많은 교수님들의 고민</Pill>
      <Flow t={t} nodes={[['student', C.sky, BG.sky, '학생', T(5)], ['robot', C.lav, BG.lav, 'AI 활용', T(5, 0.9)], ['doc', C.coral, BG.peach, '과제 제출', T(6)]]} />
      <div className="h2" style={mx(up(t, T(7), 26))}>이 과제, <Hl c={HL.p} style={sweep(t, T(7, 1.2))}>어떻게 평가</Hl>할까요?</div>
    </div>
  );
};

const UseIt: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <Kinetic className="mt xl" t={t} at={T(8, 0.2)} stagger={0.045} parts={['“AI를 쓸 거면\n', { hl: '제대로' }, ' 써봐라”']} />
      <div className="sub" style={mx(up(t, T(11), 20))}>그렇다면 과제는 <b>어떻게</b> 내 주면 좋을까?</div>
      <div className="note" style={mx(up(t, T(13), 16))}>그 과제를 제가 <b>직접 해 본 과정</b>까지 보여드립니다</div>
      <Burst t={t} at={T(8, 1.0)} x={960} y={400} n={34} seed="ui" />
    </div>
  );
};

// ---- 02 AI 시대의 과제 -------------------------------------------------------
const Old: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(14)))}>
      <Pill dot={C.grey} style={mx(up(t, T(14, 0.3), 16))}>옛날식 과제</Pill>
      <div className="paper">
        <div className="pline" style={mx(slide(t, T(15)))}><span className="nb">1</span><span><b>SWOT</b>의 개념을 설명하고</span></div>
        <div className="pline" style={mx(slide(t, T(16)))}><span className="nb">2</span><span><b>엔비디아 vs AMD</b>를 비교한 글을</span></div>
        <div className="pline" style={mx(slide(t, T(17)))}><span className="nb">3</span><span><b>A4 다섯 장</b> 이내로 작성해 와라</span></div>
      </div>
      <Swot t={t} at={T(15, 0.5)} />
    </div>
  );
};

const New: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card fcard" style={mx(rise(t, T(19)))}>
      <Pill dot={C.coral} style={mx(up(t, T(19, 0.2), 16))}>요즘식 과제</Pill>
      <Flow t={t} wide nodes={[['app', C.lav, BG.lav, <>차별점이 있는<br />SWOT 분석 앱 만들기</>, T(19, 0.8)], ['target', C.mint, BG.mint, <>그 앱으로<br />NVIDIA vs AMD 비교</>, T(21)],
        ['camera', C.coral, BG.peach, <>과정을 캡처해서<br />제출</>, T(21, 1.6)]]} />
      <Ring t={t} at={T(19, 0.8)} x={960} y={420} r={600} color="rgba(185,166,255,.8)" />
    </div>
  );
};

const Diff: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(22)))}>
      <Pill dot={C.lav} style={mx(up(t, T(22, 0.3), 16))}>“차별점이 있는” 앱이란?</Pill>
      <div className="apps">
        <div className="appc" style={mx(pop(t, T(23)))}><Svg name="trend" color="#4fb489" /><b>애널리스트를 위한</b><span>SWOT 분석 앱</span></div>
        <div className="appc" style={mx(pop(t, T(24)))}><Svg name="code" color="#6aa3e6" /><b>개발자를 위한</b><span>SWOT 분석 앱</span></div>
        <div className="appc ghost2" style={mx(pop(t, T(25)), spin(t, T(26), 0.12, 3, 4))}><Svg name="sparkle" color="#e7a92c" /><b>나만의 ???</b><span>SWOT 분석 앱</span></div>
      </div>
      <div className="h3" style={mx(up(t, T(25, 0.8), 20))}>다른 사람이 <Hl style={sweep(t, T(26))}>만들지 않았을 법한</Hl> 앱</div>
    </div>
  );
};

const Capture: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(27)))}>
      <Ok size="big" style={mx(pop(t, T(27, 0.3)))}>AI, 적극 사용해도 됩니다</Ok>
      <div className="row gap" style={mx(up(t, T(28), 24))}><Ico name="camera" color={C.coral} bg={BG.peach} style={mx(pop(t, T(28, 0.2)))} />
        <div className="h3 left">AI를 쓴 과정은<br /><Hl style={sweep(t, T(29))}>전부 캡처해서 제출</Hl></div></div>
      <div className="meter" style={mx(up(t, T(30), 20))}><span className="mlab">과정이 자세할수록</span><div className="mbar"><span className="mfill mint" style={grow(t, [[T(30, 0.3), 0.95, 1.4]])} /></div>
        <b className="mup mint" style={mx(stamp(t, T(31, 0.3)))}>고득점</b></div>
    </div>
  );
};

// ---- 03 평가 항목 4가지 -------------------------------------------------------
const E1: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(32)))}>
      <Stepper act={1} style={mx(up(t, T(32, 0.3), 16))} />
      <div className="h2 sm" style={mx(up(t, T(34), 22))}>첫 프롬프트는 <Hl style={sweep(t, T(34, 0.9))}>10줄 이상</Hl></div>
      <div className="lines" style={mx(up(t, T(33), 20))}>{[92, 76, 84, 60, 88, 70, 80, 66, 90, 54].map((w, i) =>
        <div key={i} className="ln"><em>{i + 1}</em><i style={{ width: `${w}%`, transformOrigin: '0 50%', ...grow(t, [[T(34, 0.2 + i * 0.12), 1, 0.35]]) }} /></div>)}</div>
      <div className="row gap"><Ok size="ok-sm" style={mx(pop(t, T(35)))}>직접 써도 OK</Ok><Ok size="ok-sm" style={mx(pop(t, T(36)))}>AI로 만들어도 OK</Ok>
        <div className="tagbox" style={mx(stamp(t, T(37, 0.6)))}>만든 과정은 캡처!</div></div>
    </div>
  );
};

const E2: S = ({ T }) => {
  const t = useT();
  const tool = (cls: string, at: number, label: string) => <span className={cls} style={mx(pop(t, at))}>{label}</span>;
  return (
    <div className="card scard say" style={mx(rise(t, T(39)))}>
      <Stepper act={2} style={mx(up(t, T(39, 0.3), 16))} />
      <div className="h2 sm" style={mx(up(t, T(39, 0.7), 22))}>앱 만드는 과정을 <Hl style={sweep(t, T(40))}>하나하나 캡처</Hl></div>
      <div className="row gap tops">
        <div className="tbox2"><div className="tbk">어떤 AI 툴?</div><div className="tools">{tool('tl3', T(42), 'Claude Code')}{tool('tl2', T(43), '안티그래비티')}{tool('tl4', T(44), 'Codex')}</div></div>
        <div className="tbox2"><div className="tbk">얼마나, 어떻게?</div><div className="tools">{tool('tl1', T(45), '총 소요 시간')}{tool('tl5', T(46), 'GitHub 업로드')}{tool('tl3', T(47), '커밋 횟수')}</div></div>
        <div className="tbox2"><div className="tbk">어디에 배포?</div><div className="tools">{tool('tl4', T(49), 'Netlify')}{tool('tl5', T(50), 'Vercel')}</div></div>
      </div>
    </div>
  );
};

const E3: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(52)))}>
      <Stepper act={3} style={mx(up(t, T(52, 0.3), 16))} />
      <div className="row gap big">
        <div className="bignum" style={mx(pop(t, T(53)))}><span>{count(t, T(53), 1.6, 10)}</span><small>회+</small></div>
        <div className="h3 left" style={mx(up(t, T(53, 0.4), 20))}>완성된 앱을<br /><Hl c={HL.m} style={sweep(t, T(53, 1.2))}>10회 이상 개선</Hl></div>
      </div>
      <div className="commits" style={mx(up(t, T(54), 16))}><div className="cline" />{Array.from({ length: 10 }, (_, i) =>
        <span key={i} className="cdot" style={{ left: 30 + i * 98, ...mx(pop(t, T(57, i * 0.16))) }} />)}</div>
      <div className="sub" style={mx(up(t, T(55, 0.3), 16))}>커밋 기록 = 코드를 바꾸고 올릴 때마다 <b>남는 기록</b></div>
    </div>
  );
};

const E4: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(62)))}>
      <Stepper act={4} style={mx(up(t, T(62, 0.3), 16))} />
      <div className="row gap"><Ico name="present" color={C.sky} bg={BG.sky} style={mx(pop(t, T(63)))} />
        <div className="h3 left" style={mx(up(t, T(63, 0.2), 20))}>내 SWOT 앱은<br /><Hl style={sweep(t, T(63, 1.4))}>무엇이 다른가?</Hl></div></div>
      <div className="row gap"><Chip name="users" color={C.coral} bg={BG.peach} style={mx(pop(t, T(64)))}>다른 사람들 앞에서</Chip>
        <Chip name="present" color={C.lav} bg={BG.lav} style={mx(pop(t, T(65)))}>TV · 컴퓨터에 띄워</Chip>
        <div className="tagbox" style={mx(stamp(t, T(67)))}>직접 시연!</div></div>
    </div>
  );
};

const Vs: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(68)))}>
      <Pill dot={C.pink} style={mx(up(t, T(68, 0.2), 16))}>같은 AI를 써도</Pill>
      <div className="eqs">
        <div className="cmp2 bad" style={mx(slide(t, T(68, 0.6), -50))}><Ico name="chat" color={C.grey} bg={BG.grey} size="xs" /><div><b>단 한 줄로</b><span>“이런 앱 만들어 줘” 하고 끝</span></div></div>
        <div className="ne" style={mx(pop(t, T(69)))}>≠</div>
        <div className="cmp2 good" style={mx(slide(t, T(69, 0.5)))}><Ico name="brain" color={C.mint} bg={BG.mint} size="xs" /><div><b>여러 차례 바꿔 보고 고민</b><span>AI를 썼지만 <em>생각을 더한</em> 앱</span></div></div>
      </div>
      <div className="h3" style={mx(up(t, T(70), 20))}><Hl c={HL.p} style={sweep(t, T(70, 0.5))}>큰 차이</Hl>가 납니다</div>
    </div>
  );
};

const Think: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="sub" style={mx(up(t, T(71), 20))}>아주 간단하게 만들지 말고</div>
      <div className="mt xl">
        <Kinetic inline className="" t={t} at={T(72)} stagger={0.05} parts={['고민은 ', { hl: '많이' }, ',']} /><br />
        <Kinetic inline className="" t={t} at={T(73)} stagger={0.05} parts={['머리도 ', { hl: '많이' }]} />
      </div>
      <div className="note" style={mx(up(t, T(75), 16))}>AI는 <b>많이 써도</b> 됩니다</div>
      <Ring t={t} at={T(73, 0.3)} x={960} y={440} r={560} />
    </div>
  );
};

const Chap: S = ({ T }) => {
  const t = useT();
  const road: [IconName, string][] = [['chat', '프롬프트'], ['code', 'Claude Code'], ['git', 'GitHub'], ['globe', 'Netlify 배포'], ['app', '앱 완성'], ['up', '개선 × 3']];
  return (
    <div className="mega">
      <div className="cc-n" style={mx(up(t, T(76, 0.2), 16))}>이게 제가 생각한 AI 시대의 과제</div>
      <Kinetic className="mt xl" t={t} at={T(77)} stagger={0.05} parts={['제가 ', { hl: '직접' }, ' 해 봤습니다']} />
      <div className="road">{road.map(([n, l], i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="rdash" style={{ transform: `scaleX(${prog(t, T(77, 1.1 + i * 0.28 - 0.14), 0.2)})` }} />}
          <div className="rnode" style={mx(pop(t, T(77, 1.1 + i * 0.28)))}><Ico name={n} color={Object.values(C)[i]} bg={Object.values(BG)[i]} size="xs" /><span>{l}</span></div>
        </React.Fragment>))}</div>
      <Flash t={t} at={T(77, 0.05)} strength={0.4} />
      <Burst t={t} at={T(77, 0.4)} x={960} y={400} n={40} power={1.2} seed="ch" />
    </div>
  );
};

// ---- 04 실습 사이사이 -------------------------------------------------------
const Pr: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(108)))}>
      <Pill dot={C.lav} style={mx(up(t, T(108, 0.3), 16))}>이 정도 용어는 알아 두세요</Pill>
      <div className="flow wide xp3">
        {([['code', C.sky, BG.sky, <>내가 짠 코드</>, T(109)], ['git', C.lav, BG.lav, <><b className="term">PR</b><br />Pull Request<br /><small>“올려도 될까요?”</small></>, T(108, 1.2)],
          ['merge', C.mint, BG.mint, <><b className="term">Merge</b><br />병합<br /><small>기존 코드와 합치기</small></>, T(117)]] as const).map(([n, c, b, l, at], i) => (
          <React.Fragment key={i}>
            {i > 0 && <svg className="arrow" viewBox="0 0 120 24" fill="none" stroke="#b8b1da" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path pathLength={1} d="M4 12h108M98 2l14 10-14 10" style={draw(t, at - 0.35, 0.45)} /></svg>}
            <div className="node"><Ico name={n} color={c} bg={b} style={mx(pop(t, at))} /><div className="nlabel" style={mx(up(t, at + 0.15, 16))}>{l}</div></div>
          </React.Fragment>))}
      </div>
      <div className="h3" style={mx(up(t, T(122), 20))}>Claude Code에게 <Hl style={sweep(t, T(122, 0.7))}>“PR 만들고 merge 해줘”</Hl></div>
    </div>
  );
};

const Learn: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(142)))}>
      <Pill dot={C.mint} style={mx(up(t, T(142, 0.3), 16))}>이런 앱을 만들면서 학생이 배웁니다</Pill>
      <div className="eqs">
        <div className="cmp2 bad" style={mx(slide(t, T(142, 0.8), -50), { o: 1 - 0.45 * prog(t, T(149), 0.4) })}><Ico name="doc" color={C.grey} bg={BG.grey} size="xs" />
          <div><b>예전 — 워드로 SWOT 설명문 작성</b><span>요즘은 AI가 너무 잘 써서 <em>사고할 필요가 없어짐</em></span></div></div>
        <div className="cmp2 good" style={mx(slide(t, T(149)))}><Ico name="app" color={C.mint} bg={BG.mint} size="xs" />
          <div><b>지금 — 앱을 만들고 직접 고치면서</b><span>그 과정에서 <em>SWOT를 공부</em>하게 된다</span></div></div>
      </div>
    </div>
  );
};

const Free: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(165)))}>
      <Pill dot={C.yellow} style={mx(up(t, T(165, 0.2), 16))}>여기서 중요한 것</Pill>
      <div className="row gap"><Ico name="zap" color={C.yellow} bg={BG.yellow} style={mx(pop(t, T(166)))} />
        <div className="h3 left" style={mx(up(t, T(166, 0.2), 20))}>Gemini API는<br /><Hl style={sweep(t, T(167))}>무료 티어</Hl>로도 쓸 수 있어요</div></div>
      <div className="vlist">
        <div className="numrow" style={mx(slide(t, T(167, 0.4)))}><span className="nb">1</span><span>1분에 몇 회 정도는 <b>무료</b></span></div>
        <div className="numrow" style={mx(slide(t, T(168)))}><span className="nb">2</span><span>API 키 <b>테스트할 때</b>는 무료로 먼저 써 보기</span></div>
        <div className="numrow" style={mx(slide(t, T(171)))}><span className="nb">3</span><span><b>가장 최신 모델</b>을 빼면 무료 — 모델 목록 확인!</span></div>
      </div>
    </div>
  );
};

const Loop: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(226)))}>
      <Pill dot={C.coral} style={mx(up(t, T(226, 0.3), 16))}>개선 ① — 다시 Claude Code로</Pill>
      <div className="promptbox wide" style={mx(slide(t, T(228), -50))}><div className="pbh"><Svg name="chat" color="#b9a6ff" /><span>추가 요청</span></div><div className="pbt">SWOT의 개념을 쉽게 설명해서 사이트에 적어 줘</div></div>
      <Flow t={t} nodes={[['app', C.sky, BG.sky, '앱 살펴보기', T(231)], ['search', C.pink, BG.pink, '부족한 점 깨닫기', T(232)], ['chat', C.lav, BG.lav, '추가 요청', T(232, 1.2)]]} />
    </div>
  );
};

const Trace: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(246)))}>
      <Pill dot={C.lav} style={mx(up(t, T(246, 0.2), 16))}>고민한 흔적이 곧 평가 근거</Pill>
      <div className="qbub wide" style={mx(pop(t, T(246, 0.6)))}>“내 사이트, <b>뭐가 부족하지?</b>”</div>
      <Flow t={t} wide nodes={[['brain', C.pink, BG.pink, '머리를 쓰고', T(247)], ['camera', C.coral, BG.peach, <>과정을 캡처해<br />과제로 제출</>, T(248)], ['eye', C.mint, BG.mint, <>얼마나 고민했는지<br />확인 가능</>, T(250)]]} />
    </div>
  );
};

const Commit10: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(282)))}>
      <Pill dot={C.mint} style={mx(up(t, T(282, 0.2), 16))}>커밋 10회, 생각보다 어렵지 않아요</Pill>
      <div className="commits" style={mx(up(t, T(282, 0.4), 16))}><div className="cline" />{Array.from({ length: 10 }, (_, i) => {
        const lit = i < 7 ? 1 : prog(t, T(285, (i - 7) * 0.4), 0.3);
        return <span key={i} className="cdot" style={{ left: 30 + i * 98, background: lit >= 1 ? undefined : `rgba(63,168,119,${0.15 + 0.85 * lit})`, ...mx(pop(t, T(282, 0.6 + i * 0.1))) }} />;
      })}</div>
      <div className="vlist">
        <div className="numrow" style={mx(slide(t, T(282, 1)))}><span className="nb">1</span><span><b>merge</b>도 커밋으로 셉니다</span></div>
        <div className="numrow" style={mx(slide(t, T(284)))}><span className="nb">2</span><span>한 번 수정해도 커밋이 <b>세 번</b>쯤 생기기도</span></div>
        <div className="numrow" style={mx(slide(t, T(289)))}><span className="nb">3</span><span><b>10회가 된 화면</b>을 캡처해서 제출</span></div>
      </div>
    </div>
  );
};

const OneGo: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="sub" style={mx(up(t, T(292, 0.1), 16))}>커밋 기록을 보면 알 수 있어요</div>
      <div className="qstack">
        <div className="qline" style={mx(slam(t, T(295)), { o: 1 - 0.5 * prog(t, T(297), 0.4) })}><Ico name="x" color={C.grey} bg={BG.grey} size="xs" /><span>AI로 <b>한 번에</b> 만든 앱</span></div>
        <div className="qline hot" style={mx(slam(t, T(297)))}><Ico name="check" color={C.mint} bg={BG.mint} size="xs" /><span>고민하고 <b>머리를 많이 쓴</b> 앱</span></div>
      </div>
      <Burst t={t} at={T(297, 0.1)} x={960} y={560} n={30} seed="og" />
    </div>
  );
};

const Matrix: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card fcard" style={mx(rise(t, T(364)))}>
      <Pill dot={C.lav} style={mx(up(t, T(364, 0.2), 16))}>SWOT, 한 장으로 정리</Pill>
      <div className="mtx">
        <div />
        <div className="mhd good2" style={mx(up(t, T(365), 20))}>😊 좋은 일</div>
        <div className="mhd bad2" style={mx(up(t, T(366), 20))}>😟 걱정되는 일</div>
        <div className="mrow" style={mx(slide(t, T(371), -40))}>안<small>내부</small></div>
        <div className="mcell sw0" style={mx(pop(t, T(367)))}>S<span>잘하는 점</span></div>
        <div className="mcell sw1" style={mx(pop(t, T(368, 0.4)))}>W<span>아쉬운 점</span></div>
        <div className="mrow" style={mx(slide(t, T(373), -40))}>밖<small>외부</small></div>
        <div className="mcell sw2" style={mx(pop(t, T(372, 0.6)))}>O<span>기회</span></div>
        <div className="mcell sw3" style={mx(pop(t, T(373, 0.6)))}>T<span>조심할 점</span></div>
      </div>
    </div>
  );
};

// ---- 05 정리 ---------------------------------------------------------------
const Recap0: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(422)))}>
      <Pill dot={C.coral} style={mx(up(t, T(422, 0.3), 16))}>교수님들을 위해 오늘 보여 드린 것</Pill>
      <div className="row gap"><Ok style={mx(pop(t, T(423)))}>AI 시대의 과제 제안</Ok><Ok style={mx(pop(t, T(424)))}>직접 해 본 과정</Ok></div>
      <Flow t={t} wide nodes={[['camera', C.coral, BG.peach, <>과정을 캡처해서<br />보내고</>, T(425)], ['present', C.sky, BG.sky, <>결과물 앱을<br />들고 나와 시연</>, T(426, 0.3)]]} />
    </div>
  );
};

const Recap: S = ({ T }) => {
  const t = useT();
  const rows: [number, string, string][] = [[T(428, 0.6), '첫 프롬프트 10줄 이상', 'Claude Code에 넣은 첫 요청'], [T(431), '과정을 전부 캡처', '툴 · 시간 · GitHub · 배포'],
    [T(433), '10회 이상 개선', 'GitHub 커밋 기록 제출'], [T(440), '차별점을 직접 시연', '장점 · 특이점을 설명']];
  return (
    <div className="card scard say" style={mx(rise(t, T(428)))}>
      <Pill dot={C.lav} style={mx(up(t, T(428, 0.2), 16))}>평가 항목 다시 보기</Pill>
      <div className="evals">{rows.map(([at, b, em], i) => <div key={b} className="evl" style={mx(slide(t, at))}><span className="nb">{i + 1}</span><b>{b}</b><em>{em}</em></div>)}</div>
      <div className="h3" style={mx(up(t, T(448), 20))}>학생은 <Hl style={sweep(t, T(448, 0.8))}>생각할 수밖에</Hl> 없습니다</div>
    </div>
  );
};

const Why: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(449)))}>
      <Pill dot={C.pink} style={mx(up(t, T(449, 0.2), 16))}>AI 시대의 어려움</Pill>
      <Flow t={t} wide nodes={[['robot', C.lav, BG.lav, <>AI가 글을<br />너무 잘 쓴다</>, T(450)], ['doc', C.coral, BG.peach, <>과제를<br />대신 써 준다</>, T(451)]]} />
      <div className="stampbox" style={mx(stamp(t, T(454)))}>평가하기가 너무 어려웠다</div>
    </div>
  );
};

const Answer: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="sub" style={mx(up(t, T(455), 16))}>그래서 아예</div>
      <Kinetic className="mt xl" t={t} at={T(455, 0.8)} stagger={0.05} parts={['AI를 ', { hl: '제대로, 많이, 잘' }]} />
      <div className="row gap">
        <Chip name="app" color={C.lav} bg={BG.lav} style={mx(pop(t, T(456)))}>앱을 만들고</Chip>
        <Chip name="up" color={C.mint} bg={BG.mint} style={mx(pop(t, T(456, 1.4)))}>많이 고쳐 보고</Chip>
        <Chip name="present" color={C.coral} bg={BG.peach} style={mx(pop(t, T(457)))}>시연까지</Chip>
      </div>
      <Flash t={t} at={T(455, 0.85)} strength={0.35} />
      <Burst t={t} at={T(455, 1.2)} x={960} y={420} n={36} seed="an" />
    </div>
  );
};

const Alt: S = ({ T }) => {
  const t = useT();
  return (
    <div className="card scard say" style={mx(rise(t, T(459)))}>
      <div className="h2 sm" style={mx(up(t, T(460), 24))}>하나의 <Hl style={sweep(t, T(460, 0.9))}>대안</Hl>일 뿐,<br />정답은 아닙니다</div>
      <div className="row gap" style={mx(up(t, T(461, 0.5), 24))}><Ico name="chat" color={C.sky} bg={BG.sky} style={mx(pop(t, T(461, 0.7)))} />
        <div className="qbub">아이디어가 있으신 교수님,<br />이미 <b>나만의 방식</b>이 있으신 분은<br /><b>댓글로 공유</b>해 주세요</div></div>
    </div>
  );
};

const Respect: S = ({ T }) => {
  const t = useT();
  return (
    <div className="mega">
      <div className="sub" style={mx(up(t, T(467), 16))}>AI 시대, 변화가 정말 큽니다</div>
      <Kinetic className="mt" t={t} at={T(469)} stagger={0.045} parts={['늘 노력하시는\n', { hl: '교육자분들' }]} />
      <div className="row gap" style={mx(up(t, T(472), 20))}><Ico name="heart" color={C.pink} bg={BG.pink} size="xs" style={mx(pop(t, T(472, 0.2)), { tf: `scale(${1 + 0.15 * Math.abs(Math.sin(Math.max(0, t - T(472, 0.8)) * 6)) * (1 - prog(t, T(472, 0.8), 1.2))})` })} />
        <div className="h3">존경합니다</div></div>
      <Sparkles t={t} at={T(472, 0.3)} x={960} y={600} spread={420} seed="rs" />
      <Ring t={t} at={T(470, 0.4)} x={960} y={420} r={600} color="rgba(255,224,138,.9)" />
    </div>
  );
};

export const SCENES: SceneDef[] = [
  { name: '오프닝', from: 1, kind: 'full', El: Open },
  { name: '교수님들의 고민', from: 4, kind: 'say', El: Worry },
  { name: '제대로 써봐라', from: 8, kind: 'full', El: UseIt },
  { name: '옛날식 과제', from: 14, kind: 'say', El: Old },
  { name: '요즘식 과제', from: 19, kind: 'full', El: New },
  { name: '차별점', from: 22, kind: 'say', El: Diff },
  { name: '과정 캡처', from: 27, kind: 'say', El: Capture },
  { name: '평가 1', from: 32, kind: 'say', El: E1 },
  { name: '평가 2', from: 39, kind: 'say', El: E2 },
  { name: '평가 3', from: 52, kind: 'say', El: E3 },
  { name: '평가 4', from: 62, kind: 'say', El: E4 },
  { name: '한 줄 vs 고민', from: 68, kind: 'say', El: Vs },
  { name: '고민 많이', from: 71, kind: 'full', El: Think },
  { name: '직접 해 봤습니다', from: 76, kind: 'full', El: Chap },
  { name: 'PR · Merge', from: 108, kind: 'say', El: Pr },
  { name: '앱으로 배운다', from: 142, kind: 'say', El: Learn },
  { name: '무료 티어', from: 165, kind: 'say', El: Free },
  { name: '개선 루프', from: 226, kind: 'say', El: Loop },
  { name: '고민의 흔적', from: 246, kind: 'say', El: Trace },
  { name: '커밋 10회', from: 282, kind: 'say', El: Commit10 },
  { name: '한 번에 vs 고민', from: 292, kind: 'full', El: OneGo },
  { name: 'SWOT 매트릭스', from: 364, kind: 'full', El: Matrix },
  { name: '오늘 보여 드린 것', from: 422, kind: 'say', El: Recap0 },
  { name: '평가 항목 다시 보기', from: 428, kind: 'say', El: Recap },
  { name: 'AI 시대의 어려움', from: 449, kind: 'say', El: Why },
  { name: '제대로 많이 잘', from: 455, kind: 'full', El: Answer },
  { name: '하나의 대안', from: 459, kind: 'say', El: Alt },
  { name: '존경합니다', from: 467, kind: 'full', El: Respect },
];
