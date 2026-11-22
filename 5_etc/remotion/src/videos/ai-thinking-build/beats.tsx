import React from 'react';
import { E, mx, pop, prog, slam, slide, spr, stamp, up } from '../../kit/anim';
import { Burst, Ring, type Sfx, Sparkles } from '../../kit/fx';
import { useT } from '../../kit/time';
import type { IconName } from '../../kit/icons';
import { at, Bar, barValue, bob, Bubble, CheckList, CheckMark, Chip, CORAL, FlowRow, GOLD, Head, Hero, Icon, Kin, Line, MINT, Rays, SKY, SOFT, StampText, Strike, Svg1080 } from './gfx';

// AI로 사고력을 향상시키는 방법 — 장면별 모션그래픽. 모든 타이밍은 SRT 큐에 고정한다: T(큐) = 말이 시작되는 초.
// 비트의 끝은 다음 비트의 시작. dim = 사진을 얼마나 어둡게 할지, side = 어두운 쪽 ('l' 왼쪽, 'r' 오른쪽, 'c' 전체).

export type T2 = { T: (n: number, off?: number) => number; TE: (n: number, off?: number) => number };
type El = React.FC<T2>;
type Beat = { name: string; from: number; dim?: number; side?: 'l' | 'r' | 'c'; El: El };

export const CHAPTERS: { from: number; to?: number; n: string; title: string }[] = [
  { from: 3, n: '01', title: '사고력이란' },
  { from: 19, n: '02', title: 'AI 시대, 왜 사고력인가' },
  { from: 100, to: 198, n: '03', title: 'AI로 사고력 키우기' },
];

// ---------- 공통 조각 --------------------------------------------------------------
const P: React.FC<{ s: React.CSSProperties; children?: React.ReactNode }> = ({ s, children }) => <div className="pn" style={s}>{children}</div>;
const fade = (t: number, a: number, b: number, d = 0.25) => prog(t, a, d) * (1 - prog(t, b - d, d));

/** 채팅 말풍선: me = 오른쪽 금색, ai = 왼쪽 흰색. */
const Msg: React.FC<{ t: number; from: number; who: 'me' | 'ai'; text: React.ReactNode; x: number; y: number; size?: number; w?: number }> = ({ t, from, who, text, x, y, size = 40, w }) => (
  <div style={{ ...at(x, y, w), display: 'flex', alignItems: 'flex-start', gap: 16, flexDirection: who === 'me' ? 'row-reverse' : 'row', ...mx(up(t, from, 24)) }}>
    <div style={{ width: 66, height: 66, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: who === 'me' ? GOLD : '#fff' }}>
      <Icon name={who === 'me' ? 'users' : 'robot'} color="#1a1420" size={40} />
    </div>
    <div style={{ padding: '16px 28px 19px', borderRadius: 24, borderTopRightRadius: who === 'me' ? 6 : 24, borderTopLeftRadius: who === 'ai' ? 6 : 24, fontSize: size, fontWeight: 750, letterSpacing: '-.02em', lineHeight: 1.32,
      background: who === 'me' ? GOLD : 'rgba(255,255,255,.95)', color: '#1a1420', boxShadow: '0 16px 44px rgba(0,0,0,.45)' }}>{text}</div>
  </div>
);

/** 타자 치듯 글자가 나온다. */
const typed = (t: number, a: number, d: number, s: string) => s.slice(0, Math.round(s.length * prog(t, a, d)));
const Caret: React.FC<{ t: number }> = ({ t }) => <span style={{ display: 'inline-block', width: 4, height: '1em', marginLeft: 4, verticalAlign: '-0.12em', background: GOLD, opacity: Math.sin(t * 9) > 0 ? 1 : 0 }} />;

/** 큰 아이콘 원 */
const Orb: React.FC<{ t: number; from: number; icon: IconName; x: number; y: number; size?: number; color?: string; label?: string; hot?: boolean }> = ({ t, from, icon, x, y, size = 170, color = GOLD, label, hot }) => (
  <div style={{ ...at(x, y, size), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...mx(pop(t, from)) }}>
    <div style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hot ? color : 'rgba(14,12,22,.82)', border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}66` }}>
      <Icon name={icon} color={hot ? '#1a1420' : color} size={size * 0.52} />
    </div>
    {label && <div style={{ fontSize: 40, fontWeight: 850, whiteSpace: 'nowrap', textShadow: '0 4px 18px #000' }}>{label}</div>}
  </div>
);

// ---------- 01 사고력이란 -------------------------------------------------------------
const Title: El = () => {
  const t = useT();
  const sw = prog(t, 1.4, 1.2, E.p2io);
  return (
    <>
      <Kin t={t} from={0.35} parts={['AI로\n', { em: '사고력' }, '을\n향상시키는 방법']} x={100} y={250} size={108} stagger={0.04} />
      <div style={{ ...at(104, 680, 600, 8), borderRadius: 4, background: GOLD, boxShadow: `0 0 26px ${GOLD}`, transformOrigin: '0 50%', transform: `scaleX(${sw})` }} />
      <Sparkles t={t} at={1.6} x={420} y={420} spread={460} seed="title" />
    </>
  );
};

const Define: El = ({ T }) => {
  const t = useT();
  const a = T(5), b = T(6);
  const card = (x: number, f: number, word: string, icon: IconName) => (
    <P s={{ ...at(x, 420, 340, 250), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, ...mx(up(t, f, 40)) }}>
      <Icon name={icon} size={86} /><div style={{ fontSize: 64, fontWeight: 900 }}>{word}</div>
    </P>
  );
  return (
    <>
      <Head t={t} from={a} parts={[{ em: '사고력' }, '이란?']} size={84} />
      {card(150, a + 0.6, '생각', 'brain')}
      <div style={{ ...at(520, 480), fontSize: 110, fontWeight: 900, color: GOLD, ...mx(pop(t, a + 1.2)) }}>+</div>
      {card(610, b - 0.15, '궁리', 'search')}
      <div style={{ ...at(985, 470), fontSize: 110, fontWeight: 900, color: GOLD, ...mx(pop(t, b + 0.25)) }}>=</div>
      <div style={{ ...at(1100, 430), padding: '40px 60px 46px', borderRadius: 26, background: GOLD, color: '#1a1420', fontSize: 104, fontWeight: 900, letterSpacing: '-.04em', whiteSpace: 'nowrap', boxShadow: `0 0 60px ${GOLD}88`, ...mx(stamp(t, b + 0.5)) }}>하는 힘</div>
      <Burst t={t} at={b + 0.55} x={1330} y={530} n={22} seed="def" />
    </>
  );
};

const Puzzle: El = ({ T }) => {
  const t = useT();
  const a = T(7), b = T(8), c = T(9);
  return (
    <>
      <Chip t={t} from={a} x={90} y={90} text="어떤 문제를 해결하기 위해" icon="target" size={42} />
      <Bubble t={t} from={b} x={96} y={200} text="곰곰이…" size={64} tail="b" />
      <Kin t={t} from={c} parts={['바로 그때 발휘되는 힘\n= ', { em: '사고력' }]} x={0} y={540} w={1920} size={100} center />
      <Ring t={t} at={c + 0.6} x={960} y={640} r={560} color={GOLD} />
    </>
  );
};

const Problems: El = ({ T }) => {
  const t = useT();
  const items: [string, number, number, IconName][] = [['일', 1080, 250, 'doc'], ['관계', 1460, 200, 'users'], ['진로', 1250, 430, 'map'], ['선택', 1580, 470, 'dice'], ['배움', 1020, 600, 'book']];
  return (
    <>
      <Kin t={t} from={T(10)} parts={['사고력은\n', { em: '굉장히 중요' }, '합니다']} x={90} y={180} size={96} />
      <Chip t={t} from={T(12)} x={96} y={490} text="살면서 마주하는 여러 문제들" icon="question" size={42} />
      {items.map(([w, x, y, ic], i) => (
        <div key={w} className="chip" style={{ ...at(x, y), fontSize: 46, ...mx(pop(t, T(12, 0.3 + i * 0.18)), bob(t, `pb${i}`, 14)) }}><Icon name={ic} size={50} />{w}</div>
      ))}
    </>
  );
};

const NotChoice: El = ({ T }) => {
  const t = useT();
  const a = T(13), b = T(14);
  return (
    <>
      <P s={{ ...at(90, 150, 760, 560), ...mx(up(t, a - 0.05, 40)) }} />
      <div style={{ ...at(140, 180), fontSize: 40, fontWeight: 800, color: SOFT, ...mx(up(t, a, 10)) }}>세상의 문제는…</div>
      {['객관식', '오지선다형'].map((w, i) => {
        const f = i ? b : a;
        return (
          <div key={w} style={{ ...at(140, 270 + i * 200), display: 'flex', alignItems: 'center', gap: 26, ...mx(slide(t, f, -30)) }}>
            <div style={{ display: 'flex', gap: 10 }}>{['①', '②', '③', '④', '⑤'].slice(0, i ? 5 : 4).map((n) => <span key={n} style={{ fontSize: 50, fontWeight: 800, color: '#fff' }}>{n}</span>)}</div>
            <span style={{ fontSize: 58, fontWeight: 900 }}>{w}</span>
            <CheckMark t={t} from={f + 0.6} size={70} color={CORAL} no />
          </div>
        );
      })}
      <StampText t={t} from={b + 1} text="정답이 정해져 있지 않다" x={150} y={640} size={56} rot={-4} color={GOLD} />
    </>
  );
};

const Ponder: El = ({ T }) => {
  const t = useT();
  const a = T(15), b = T(17), c = T(18);
  const lit = prog(t, c, 0.5);
  return (
    <>
      <Kin t={t} from={a} parts={[{ em: '골똘하게' }, ' 고민해 봐야 합니다']} x={90} y={110} size={76} />
      <Bubble t={t} from={b} x={96} y={260} text="이 문제는 어떻게 해야 해결이 될까?" size={50} tail="b" />
      <div style={{ ...at(300, 450), filter: `drop-shadow(0 0 ${10 + 50 * lit}px ${GOLD})`, opacity: 0.35 + 0.65 * lit, ...mx(pop(t, b + 0.6)) }}><Icon name="bulb" color={lit > 0.5 ? GOLD : '#bbb'} size={230} /></div>
      <Chip t={t} from={c + 0.2} x={560} y={540} text="그 순간, 사고력이 큰 도움" icon="sparkle" size={46} />
      <Burst t={t} at={c} x={415} y={560} n={20} seed="bulb" />
    </>
  );
};

// ---------- 02 AI 시대, 왜 사고력인가 ---------------------------------------------------
const Why: El = ({ T }) => {
  const t = useT();
  const qs = [[300, 200, 140, 0], [1560, 260, 110, 0.3], [420, 640, 90, 0.5], [1450, 620, 120, 0.7]];
  return (
    <>
      <Kin t={t} from={T(21)} parts={['AI 시대에 왜 갑자기\n', { em: '사고력' }, ' 이야기를?']} x={0} y={330} w={1920} size={100} center />
      {qs.map(([x, y, s, d], i) => <div key={i} style={{ ...at(x, y), fontSize: s, fontWeight: 900, color: GOLD, textShadow: `0 0 30px ${GOLD}aa`, ...mx(pop(t, T(21, 0.6 + d)), bob(t, `wq${i}`, 16)) }}>?</div>)}
    </>
  );
};

const Timeline: El = ({ T }) => {
  const t = useT();
  const a = T(22), b = T(23), c = T(24);
  const L = 260, W = 1400, Y = 560;
  const years = [2022, 2023, 2024, 2025, 2026];
  const px = (i: number) => L + (W * i) / 4;
  const run = barValue(t, [[c, 1, 1.4]]);
  return (
    <>
      <Kin t={t} from={a + 0.1} parts={['많은 분들이 AI를 쓰기 시작한 지 ', { em: '약 4년' }]} x={0} y={120} w={1920} size={70} center />
      <div style={{ ...at(L, Y - 4, W, 8), borderRadius: 4, background: 'rgba(255,255,255,.22)', transformOrigin: '0 50%', transform: `scaleX(${prog(t, a + 0.3, 0.8, E.p3)})` }} />
      <div style={{ ...at(L, Y - 6, W, 12), borderRadius: 6, background: GOLD, boxShadow: `0 0 22px ${GOLD}`, transformOrigin: '0 50%', transform: `scaleX(${run})` }} />
      {years.map((y, i) => (
        <React.Fragment key={y}>
          <div style={{ ...at(px(i) - 14, Y - 14, 28, 28), borderRadius: '50%', background: run * 4 >= i - 0.01 && t > c ? GOLD : '#fff', ...mx(pop(t, a + 0.4 + i * 0.12)) }} />
          <div style={{ ...at(px(i) - 100, Y + 40, 200), textAlign: 'center', fontSize: 46, fontWeight: 800, color: i === 4 && run > 0.98 ? GOLD : SOFT, ...mx(up(t, a + 0.45 + i * 0.12, 10)) }}>{y}</div>
        </React.Fragment>
      ))}
      <div style={{ ...at(px(0) - 40, Y - 290), ...mx(up(t, b, 30)) }}>
        <P s={{ padding: '22px 34px 26px', position: 'relative' }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: SOFT }}>2022년 11월 30일</div>
          <div style={{ fontSize: 56, fontWeight: 900 }}>챗GPT 출시</div>
        </P>
      </div>
      <Svg1080><Line t={t} from={b + 0.2} d={0.3} w={5} path={`M${px(0)} ${Y - 100}V${Y - 22}`} /></Svg1080>
      <div style={{ ...at(px(4) - 200, Y - 330, 400), textAlign: 'center', fontSize: 150, fontWeight: 900, color: GOLD, letterSpacing: '-.04em', textShadow: `0 0 50px ${GOLD}88`, opacity: prog(t, c + 0.3, 0.3) }}>
        {Math.max(0, Math.round(4 * run))}<small style={{ fontSize: 70 }}>년</small>
      </div>
      <Burst t={t} at={c + 1.4} x={px(4)} y={Y - 250} n={22} seed="yr" />
    </>
  );
};

const LessUse: El = ({ T }) => {
  const t = useT();
  const a = T(25), b = T(26), c = T(27);
  const v = barValue(t, [[a, 0.92, 0.6], [c, 0.22, 1.6]]);
  return (
    <>
      <Head t={t} from={a} parts={['AI에게 ', { em: '많은 것' }, '을 맡기니']} size={72} />
      <div style={{ ...at(122, 200), display: 'flex', gap: 18 }}>
        <Chip t={t} from={a + 0.3} x={0} y={0} text="업무" icon="doc" size={42} />
        <div style={{ width: 210 }} />
        <Chip t={t} from={a + 0.8} x={210} y={0} text="일상생활" icon="house" size={42} />
      </div>
      <Chip t={t} from={b} x={122} y={300} text="AI에게 맡기기" icon="robot" size={42} color={SKY} />
      <P s={{ ...at(122, 440, 820, 260), padding: '30px 40px', ...mx(up(t, a + 0.4, 30)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 46, fontWeight: 850 }}><Icon name="brain" size={56} />머리 쓸 일</div>
        <Bar x={40} y={130} w={600} h={40} v={v} color={t > c ? CORAL : GOLD} />
        <div style={{ ...at(660, 112), opacity: prog(t, c + 0.4, 0.3) }}><Icon name="down" color={CORAL} size={80} /></div>
      </P>
    </>
  );
};

const Navi: El = ({ T }) => {
  const t = useT();
  const a = T(28), b = T(30), c = T(33);
  const people = 10;
  const left = Math.round(10 - 7 * prog(t, c - 0.6, 1.6, E.p2io));
  return (
    <>
      <Kin t={t} from={a} parts={['길을 안내해 주는 ', { em: '내비게이션' }]} x={90} y={100} size={72} />
      <Svg1080>
        <Line t={t} from={a + 0.4} d={1.6} w={10} path="M1180 820C1180 660 1420 700 1440 560S1260 380 1360 260S1660 230 1700 160" />
      </Svg1080>
      <div style={{ ...at(1652, 64), ...mx(pop(t, a + 1.9)) }}><Icon name="pin" color={CORAL} size={110} /></div>
      <div style={{ ...at(96, 260), ...mx(up(t, b, 20)) }}><div className="chip" style={{ fontSize: 44 }}><Icon name="map" size={50} />내비 없이 직접 길을 찾는 분</div></div>
      <div style={{ ...at(100, 380, 820), display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {Array.from({ length: people }, (_, i) => (
          <div key={i} style={{ width: 80, height: 80, opacity: prog(t, b + 0.4 + i * 0.06, 0.2) * (i < left ? 1 : 0.18), transform: `scale(${i < left ? 1 : 0.8})` }}>
            <Icon name="users" color={i < left ? GOLD : '#777'} size={80} />
          </div>
        ))}
      </div>
      <div style={{ ...at(100, 600), fontSize: 64, fontWeight: 900, color: CORAL, textShadow: '0 6px 24px #000', ...mx(stamp(t, c + 0.3)) }}>정말 많이 줄었습니다</div>
    </>
  );
};

const Analogy: El = ({ T }) => {
  const t = useT();
  const row = (y: number, f: number, icon: IconName, a: string, b: string, hot: boolean) => (
    <div style={{ ...at(150, y), display: 'flex', alignItems: 'center', gap: 30, ...mx(slide(t, f, -40)) }}>
      <div className="chip" style={{ fontSize: 54, background: hot ? GOLD : undefined, color: hot ? '#1a1420' : undefined }}><Icon name={icon} color={hot ? '#1a1420' : GOLD} size={62} />{a}</div>
      <span style={{ fontSize: 60, fontWeight: 900, color: SOFT }}>→</span>
      <span style={{ fontSize: 60, fontWeight: 900, textShadow: '0 6px 24px #000' }}>{b}</span>
      <div style={{ ...mx(pop(t, f + 0.7)) }}><Icon name="down" color={CORAL} size={80} /></div>
    </div>
  );
  return (
    <>
      <Kin t={t} from={T(34)} parts={['AI도 ', { em: '비슷' }, '할 겁니다']} x={90} y={110} size={84} />
      {row(330, T(34, 0.5), 'map', '내비게이션', '길 찾기 능력', false)}
      {row(520, T(37), 'robot', 'AI', '혼자 생각하고 판단하는 힘', true)}
    </>
  );
};

const Adults: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(39)} parts={['어른들이 학교 다닐 때']} size={70} />
      <CheckList t={t} x={96} y={230} size={50} items={[['책도 보고', T(40)], ['글도 쓰고', T(41)], ['토론도 하고', T(41, 0.75)]]} />
      <div style={{ ...at(96, 610), ...mx(up(t, T(42), 20)) }}><div className="chip" style={{ fontSize: 50, background: GOLD, color: '#1a1420' }}><Icon name="brain" color="#1a1420" size={58} />AI 없이 머리 쓸 일이 많았다</div></div>
    </>
  );
};

const Kids: El = ({ T }) => {
  const t = useT();
  const a = T(43), b = T(45), c = T(47);
  const think = barValue(t, [[a + 0.5, 0.8, 0.6], [b, 0.2, 1.5]]);
  const dep = barValue(t, [[a + 0.5, 0.2, 0.6], [c, 0.92, 1.5]]);
  return (
    <>
      <Head t={t} from={a} parts={['AI 시대의 ', { em: '어린 학생들' }]} size={72} />
      <P s={{ ...at(90, 230, 900, 420), padding: '34px 44px', ...mx(up(t, a + 0.3, 30)) }}>
        <div style={{ fontSize: 42, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="brain" size={50} />머리 쓸 시간</div>
        <Bar x={44} y={110} w={800} h={36} v={think} color={t > b ? CORAL : GOLD} />
        <div style={{ ...at(44, 200), fontSize: 42, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="robot" color={SKY} size={50} />AI 의존</div>
        <Bar x={44} y={280} w={800} h={36} v={dep} color={SKY} />
      </P>
      <div style={{ ...at(100, 700), fontSize: 56, fontWeight: 900, textShadow: '0 6px 24px #000', ...mx(pop(t, T(48))) }}>그렇게 쓰게 될 <span className="coral">확률 ↑</span></div>
    </>
  );
};

const Native: El = ({ T }) => {
  const t = useT();
  const a = T(49);
  return (
    <>
      <Rays t={t} y={46} o={0.35 * prog(t, a, 0.5)} />
      <StampText t={t} from={a + 0.3} text="AI 네이티브 세대" x={560} y={380} size={110} rot={-5} color={GOLD} />
      <Burst t={t} at={a + 0.35} x={960} y={460} n={26} seed="nat" />
    </>
  );
};

const Create: El = ({ T }) => {
  const t = useT();
  const a = T(50), b = T(51), c = T(52), d = T(54);
  const past = barValue(t, [[d, 0.86, 1]]);
  const now = barValue(t, [[d + 0.5, 0.34, 1]]);
  return (
    <>
      <Head t={t} from={a} parts={['AI를 활용해서']} size={70} />
      <div style={{ ...at(120, 210), display: 'flex', gap: 26, opacity: 1 - 0.55 * prog(t, d, 0.4) }}>
        <Orb t={t} from={b} icon="pen" x={0} y={0} size={150} label="글" />
        <div style={{ width: 160 }} />
        <Orb t={t} from={c} icon="palette" x={190} y={0} size={150} label="그림" />
        <div style={{ width: 160 }} />
        <Orb t={t} from={c + 0.7} icon="camera" x={380} y={0} size={150} label="영상" />
      </div>
      <P s={{ ...at(1040, 250, 780, 400), padding: '34px 44px', ...mx(up(t, d, 40)) }}>
        <div style={{ fontSize: 42, fontWeight: 850, marginBottom: 26 }}>머리 쓸 일</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: SOFT }}>전 세대</div>
        <Bar x={44} y={170} w={680} h={34} v={past} color={GOLD} />
        <div style={{ ...at(44, 240), fontSize: 34, fontWeight: 700, color: SOFT }}>AI 네이티브 세대</div>
        <Bar x={44} y={300} w={680} h={34} v={now} color={CORAL} />
      </P>
    </>
  );
};

const Warn: El = ({ T }) => {
  const t = useT();
  const a = T(55), b = T(56);
  return (
    <>
      <Chip t={t} from={a} x={90} y={150} text="의도적으로 사고력 향상에 힘쓰지 않으면" icon="zap" size={44} color={CORAL} />
      <Kin t={t} from={b + 0.4} parts={['AI 없이 혼자\n', { em: '사고조차' }, ' 못하게 될 수도']} x={90} y={330} size={104} />
    </>
  );
};

const Depend: El = ({ T }) => {
  const t = useT();
  const a = T(57), b = T(58), c = T(59), d = T(60), e = T(61);
  const price = Math.round(99 * prog(t, d + 0.3, 1.6, E.p2));
  return (
    <>
      <Kin t={t} from={a + 0.1} parts={['그런데 이것이 ', { em: '왜 문제' }, '일까요?']} x={0} y={110} w={1920} size={80} center />
      <FlowRow t={t} x={40} y={340} nodeW={400} gapW={60} size={36} h={170} nodes={[
        { text: 'AI 없이 생각이 어려움', at: b, icon: 'brain' },
        { text: 'AI에 의존', at: c, icon: 'link' },
        { text: '구독료가 얼마든', at: d, icon: 'key' },
        { text: '쓸 수밖에 없다', at: e, icon: 'lock', hot: true },
      ]} />
      <div style={{ ...at(900, 600, 1000), textAlign: 'center', whiteSpace: 'nowrap', fontSize: 92, fontWeight: 900, color: CORAL, letterSpacing: '-.03em', opacity: prog(t, d + 0.3, 0.3) * (t < e + 0.2 ? 1 : 0.5), textShadow: `0 0 40px ${CORAL}66` }}>
        월 ₩{price},000{t > d + 1.9 ? '+' : ''}
      </div>
    </>
  );
};

const Work: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(62)} parts={['사고력이 없는 상태에서']} x={90} y={110} size={70} />
      <div style={{ ...at(96, 260), display: 'flex', flexDirection: 'column', gap: 30 }}>
        {[['AI 없이 회사에서 일을', T(63), 'doc'], ['AI 없이 생활을', T(64), 'house']].map(([w, f, ic]) => (
          <div key={w as string} className="chip" style={{ fontSize: 58, alignSelf: 'flex-start', ...mx(slide(t, f as number, -30)) }}><Icon name={ic as IconName} size={66} />{w}<span className="gold" style={{ fontSize: 76 }}>?</span></div>
        ))}
      </div>
    </>
  );
};

const Doubt: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Chip t={t} from={T(65)} x={90} y={110} text="지금 이 시점에서 상상해 보면" icon="eye" size={42} />
      <Bubble t={t} from={T(66)} x={96} y={250} text="에이, 설마 그렇게까지 되겠어?" size={66} tail="b" />
    </>
  );
};

const Replace: El = ({ T }) => {
  const t = useT();
  const a = T(68), b = T(69);
  return (
    <>
      <Strike t={t} from={a} strikeAt={a + 1.2} text="길 찾는 능력" x={140} y={220} size={84} />
      <div style={{ ...at(720, 236), ...mx(pop(t, a + 1.4)) }}><div className="chip" style={{ fontSize: 50 }}><Icon name="map" size={56} />내비게이션이 대체</div></div>
      <Strike t={t} from={b} strikeAt={b + 2.2} text="우리의 사고력" x={140} y={440} size={96} />
      <div style={{ ...at(800, 460), ...mx(pop(t, b + 2.4)) }}><div className="chip" style={{ fontSize: 56, background: CORAL, color: '#1a1420' }}><Icon name="robot" color="#1a1420" size={62} />AI가 대체?</div></div>
    </>
  );
};

const Must: El = ({ T }) => {
  const t = useT();
  const a = T(70), b = T(72), c = T(74);
  const o1 = 1 - prog(t, b - 0.2, 0.3);
  return (
    <>
      <div style={{ opacity: o1 }}>
        <Kin t={t} from={a} parts={['그렇기 때문에 AI를 활용해서\n', { em: '사고력' }, '을 충분히 향상시켜야']} x={0} y={260} w={1920} size={88} center />
      </div>
      <div style={{ opacity: prog(t, b, 0.3) }}>
        <div style={{ ...at(0, 230, 1920), display: 'flex', justifyContent: 'center' }}>
          <div className="chip" style={{ fontSize: 50, ...mx(up(t, b, 20)) }}><CheckMark t={t} from={b + 0.6} size={58} color={CORAL} no />AI를 안 쓰기는 쉽지 않다</div>
        </div>
        <Kin t={t} from={c} parts={['그러니 ', { em: 'AI로 사고력을 키우는 법' }, '을\n알아야 합니다']} x={0} y={400} w={1920} size={86} center />
      </div>
    </>
  );
};

const Muscle: El = ({ T }) => {
  const t = useT();
  const a = T(76), b = T(77), c = T(78);
  return (
    <>
      <Kin t={t} from={a} parts={[{ em: '사고력' }, ' 향상 = 근력 운동']} x={90} y={100} size={80} />
      <div style={{ ...at(96, 250), display: 'flex', gap: 16 }}>
        {['팔', '다리', '가슴'].map((w, i) => <div key={w} className="chip" style={{ fontSize: 50, ...mx(pop(t, b + 0.5 + i * 0.4)) }}>{w}</div>)}
        <div className="chip" style={{ fontSize: 50, background: GOLD, color: '#1a1420', ...mx(pop(t, b + 1.9)) }}><Icon name="brain" color="#1a1420" size={56} />사고력</div>
      </div>
      <div style={{ ...at(96, 400), fontSize: 50, fontWeight: 850, textShadow: '0 6px 24px #000', ...mx(up(t, c, 20)) }}>요즘 운동 열심히 하시죠?</div>
    </>
  );
};

const Train: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(79)} parts={['꾸준히 ', { em: '단련' }, '합니다']} size={72} />
      <CheckList t={t} x={96} y={230} size={50} items={[['헬스', T(79, 0.5)], ['달리기', T(79, 1.6)], ['몸을 꾸준히 단련', T(80)]]} />
    </>
  );
};

const Benefit: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(81)} parts={['얻을 수 있는 ', { em: '장점' }]} size={72} />
      <CheckList t={t} x={96} y={240} size={50} color={MINT} items={[['회사에서 일을 더 잘하고', T(82)], ['일상을 더 기분 좋게', T(83)]]} />
    </>
  );
};

const Same: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(84)} parts={['사고력도 ', { em: '마찬가지' }]} x={90} y={110} size={86} />
      <Chip t={t} from={T(85)} x={96} y={250} text="AI를 쓰더라도, 사고력이 충분한 사람은" icon="brain" size={42} />
      <CheckList t={t} x={96} y={380} size={54} items={[['AI를 더 잘 쓸 수 있고', T(86, 0.6)], ['능력 발휘를 더 잘합니다', T(87)]]} />
    </>
  );
};

const Compare: El = ({ T }) => {
  const t = useT();
  const L = 140, R = 1000, W = 780;
  const lane = (x: number, f: number, color: string, title: string, icon: IconName, steps: [string, number][], end: React.ReactNode, endAt: number) => (
    <>
      <div className="pn" style={{ ...at(x, 230, W, 600), borderTop: `10px solid ${color}`, ...mx(up(t, f, 40)) }} />
      <div style={{ ...at(x + 40, 262), display: 'flex', alignItems: 'center', gap: 16, fontSize: 52, fontWeight: 900, color, ...mx(up(t, f + 0.1, 12)) }}><Icon name={icon} color={color} size={62} />{title}</div>
      <div style={{ ...at(x + 30, 420, W - 60), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {steps.map(([s, a], i) => (
          <React.Fragment key={s}>
            {i > 0 && <span style={{ fontSize: 50, fontWeight: 900, color, opacity: prog(t, a - 0.1, 0.2) }}>›</span>}
            <div className="chip" style={{ fontSize: 38, padding: '18px 22px', ...mx(pop(t, a)) }}>{s}</div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ ...at(x + 40, 600, W - 80), fontSize: 50, fontWeight: 900, textAlign: 'center', ...mx(stamp(t, endAt)) }}>{end}</div>
    </>
  );
  return (
    <>
      <Kin t={t} from={T(88, 0.1)} parts={['사고력 없이 AI만 쓴다면?']} x={0} y={90} w={1920} size={74} center />
      {lane(L, T(89), CORAL, '사고력이 부족하면', 'x', [['간단한 질문', T(91)], ['답만 받고', T(92)], ['끝', T(93)]], <span className="coral">AI를 제대로 쓰기 어렵다</span>, T(93, 0.6))}
      {lane(R, T(94), GOLD, '사고력이 충분하면', 'brain', [['AI 활용', T(95)], ['기획', T(96)], ['실제 해결', T(97)]], <span className="gold">많은 일을 해낸다</span>, T(97, 1))}
      <Burst t={t} at={T(97, 1)} x={R + W / 2} y={640} n={22} seed="cmp" />
    </>
  );
};

const Key: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Rays t={t} y={42} o={0.28} />
      <Kin t={t} from={T(99)} parts={['AI로 ', { em: '사고력' }, '을 향상시키는 것이\n중요합니다']} x={0} y={300} w={1920} size={100} center />
    </>
  );
};

// ---------- 03 AI로 사고력 키우기 ------------------------------------------------------
const How: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(102)} parts={['AI로 사고력을\n', { em: '어떻게' }, ' 향상시킬 수 있을까?']} x={0} y={300} w={1920} size={100} center />
    </>
  );
};

const MyQ: El = ({ T }) => {
  const t = useT();
  const a = T(103), b = T(104), c = T(105);
  return (
    <>
      <Head t={t} from={a} parts={['저도 ', { em: '늘' }, ' 고민합니다']} size={72} />
      <div style={{ ...at(96, 250), ...mx(slide(t, b, -30)) }}><div className="chip" style={{ fontSize: 50 }}><CheckMark t={t} from={b + 0.3} size={56} color={CORAL} no />AI를 안 쓸 수는 없고</div></div>
      <div style={{ ...at(96, 390), ...mx(slide(t, c, -30)) }}><div className="chip" style={{ fontSize: 50 }}><CheckMark t={t} from={c + 0.3} size={56} />AI를 쓰되, 사고력에 도움이 되게</div></div>
      <div style={{ ...at(100, 540), fontSize: 66, fontWeight: 900, color: GOLD, textShadow: '0 6px 24px #000', ...mx(pop(t, T(107))) }}>어떻게?</div>
    </>
  );
};

const AskOnly: El = ({ T }) => {
  const t = useT();
  const a = T(109), b = T(110), c = T(112), d = T(114), e = T(115), f = T(116);
  return (
    <>
      <Head t={t} from={a} parts={['제 나름의 ', { em: '답' }]} size={72} />
      <Chip t={t} from={b} x={122} y={190} text="간단한 질문 → 답변 용도로만 쓰면?" icon="chat" size={40} />
      <P s={{ ...at(1000, 140, 820, 640), ...mx(up(t, c - 0.3, 40)) }} />
      <Msg t={t} from={c} who="me" text="이거 뭡니까?" x={1040} y={200} w={740} size={46} />
      <Msg t={t} from={d} who="ai" text="네, 그것은 바로…" x={1040} y={360} w={740} size={46} />
      <div style={{ ...at(1040, 540, 740), textAlign: 'center', fontSize: 46, fontWeight: 850, color: SOFT, ...mx(up(t, e, 14)) }}>그 답을 그대로 활용</div>
      <StampText t={t} from={f + 0.6} text="사고력 향상은 어렵다" x={140} y={560} size={70} rot={-5} />
    </>
  );
};

const Build: El = ({ T }) => {
  const t = useT();
  const a = T(118), b = T(119), c = T(120), e = T(124);
  const steps = 5;
  const o1 = 1 - prog(t, e - 0.3, 0.3);
  return (
    <>
      <div style={{ opacity: o1 }}>
        <Kin t={t} from={a + 0.1} parts={['사고력을 키우려면']} x={0} y={140} w={1920} size={64} center />
        <Kin t={t} from={b} parts={['AI를 ', { em: '뭔가 만드는 데' }, ' 활용']} x={0} y={240} w={1920} size={86} center />
        <div style={{ ...at(0, 420, 1920), textAlign: 'center', fontSize: 260, fontWeight: 900, letterSpacing: '.02em', color: GOLD, textShadow: `0 0 70px ${GOLD}99`, ...mx(slam(t, c)) }}>BUILD</div>
        <Ring t={t} at={c} x={960} y={560} r={700} color={GOLD} />
        <Burst t={t} at={c + 0.05} x={960} y={560} n={34} power={1.2} seed="build" />
      </div>
      <div style={{ opacity: prog(t, e - 0.1, 0.3) }}>
        <Kin t={t} from={e} parts={['문제가 ', { em: '고차원적' }, '으로 바뀝니다']} x={0} y={130} w={1920} size={86} center />
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} style={{ ...at(460 + i * 200, 820 - (i + 1) * 100, 190, (i + 1) * 100), borderRadius: '14px 14px 0 0', background: i === steps - 1 ? GOLD : `rgba(242,197,114,${0.2 + i * 0.12})`, transformOrigin: '50% 100%', transform: `scaleY(${spr(t, e + 0.3 + i * 0.15, 0.6, 10).v})` }} />
        ))}
        <div style={{ ...at(1265, 270), ...mx(pop(t, e + 1.2)) }}><Icon name="up" size={120} /></div>
      </div>
    </>
  );
};

const Word: El = ({ T }) => {
  const t = useT();
  const a = T(125), b = T(126), c = T(127);
  return (
    <>
      <P s={{ ...at(90, 140, 900, 470), ...mx(up(t, a - 0.1, 40)) }} />
      <Msg t={t} from={a + 0.2} who="me" text="이 영어 단어가 무슨 뜻인지 알려줘" x={130} y={190} w={820} size={42} />
      <Msg t={t} from={b} who="ai" text="그 단어의 뜻은 …입니다" x={130} y={360} w={820} size={42} />
      <StampText t={t} from={c} text="그걸로 끝" x={1100} y={330} size={100} rot={-7} />
    </>
  );
};

const PROMPT = ['나는 지금 영어 공부를 하고 있는데, ', 'AI를 활용해서 영어 공부를 하고 싶어. ', '내가 만들 수 있는 영어 학습 앱에 대해서 아이디어를 줘.'];
const Prompt: El = ({ T }) => {
  const t = useT();
  const a = T(128);
  const txt = PROMPT.map((p, i) => typed(t, T(130 + i), (T(131 + i) - T(130 + i)) * 0.85, p)).join('');
  return (
    <>
      <Head t={t} from={a} parts={['사고력을 키우는 ', { em: '방향' }, '으로']} size={72} />
      <P s={{ ...at(90, 230, 1100, 440), padding: '34px 44px', ...mx(up(t, a + 0.4, 40)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 800, color: GOLD, marginBottom: 20 }}><Icon name="chat" size={40} />AI에게 보내는 프롬프트</div>
        <div style={{ fontSize: 46, fontWeight: 650, lineHeight: 1.5, wordBreak: 'keep-all' }}>{txt}<Caret t={t} /></div>
      </P>
    </>
  );
};

const Ideas: El = ({ T }) => {
  const t = useT();
  const a = T(133), b = T(136), c = T(137), d = T(138);
  const ideas: [string, string, IconName, number][] = [['A', '단어 퀴즈 앱', 'app', 0], ['B', '발음 연습 앱', 'music', 1], ['C', '영어 일기 앱', 'pen', 2], ['D', '회화 챗봇 앱', 'chat', 3]];
  return (
    <>
      <Head t={t} from={a} parts={['AI가 준 ', { em: '여러 아이디어' }]} size={70} />
      {ideas.map(([k, w, ic, i]) => {
        const x = 110 + (i % 2) * 560, y = 230 + Math.floor(i / 2) * 210;
        const yes = i === 0 && t > b, no = i === 2 && t > c;
        return (
          <div key={k} className="pn" style={{ ...at(x, y, 520, 170), display: 'flex', alignItems: 'center', gap: 20, padding: '0 30px', border: yes ? `3px solid ${GOLD}` : no ? `3px solid ${CORAL}` : undefined, opacity: no ? 0.55 + 0.45 * (1 - prog(t, c + 0.5, 0.4)) : 1, ...mx(pop(t, a + 0.4 + i * 0.25)) }}>
            <div style={{ width: 74, height: 74, borderRadius: 18, background: GOLD, color: '#1a1420', fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</div>
            <span style={{ fontSize: 44, fontWeight: 850 }}>{w}</span>
            {i === 0 && <div style={{ marginLeft: 'auto' }}><CheckMark t={t} from={b} size={60} /></div>}
            {i === 2 && <div style={{ marginLeft: 'auto' }}><CheckMark t={t} from={c} size={60} color={CORAL} no /></div>}
          </div>
        );
      })}
      <Bubble t={t} from={b + 0.1} x={1220} y={250} text="나한테 필요할 것 같은데?" size={38} />
      <Bubble t={t} from={c + 0.1} x={1220} y={420} text="이건 안 필요할 것 같은데?" size={38} />
      <div style={{ ...at(1220, 610), ...mx(pop(t, d)) }}><div className="chip" style={{ fontSize: 48, background: GOLD, color: '#1a1420' }}><Icon name="brain" color="#1a1420" size={56} />생각을 하게 됩니다</div></div>
    </>
  );
};

const Choose: El = ({ T }) => {
  const t = useT();
  const a = T(139), b = T(141), c = T(142);
  return (
    <>
      <Msg t={t} from={a + 0.1} who="me" text={<>그럼 나는 <b style={{ fontWeight: 900 }}>A라는 앱</b>을 만들고 싶어</>} x={90} y={130} w={1000} size={50} />
      <div style={{ ...at(96, 330), fontSize: 44, fontWeight: 850, color: SOFT, ...mx(up(t, T(140), 14)) }}>딱 집어서 얘기해 주면, AI가</div>
      <div style={{ ...at(96, 420), display: 'flex', gap: 26 }}>
        <div className="chip" style={{ fontSize: 50, ...mx(pop(t, b)) }}><Icon name="chat" size={58} />바이브 코딩 프롬프트</div>
        <div style={{ fontSize: 50, fontWeight: 800, alignSelf: 'center', color: SOFT, ...mx(pop(t, c - 0.2)) }}>또는</div>
        <div className="chip" style={{ fontSize: 50, ...mx(pop(t, c)) }}><Icon name="code" size={58} />코드</div>
      </div>
    </>
  );
};

const Pipeline: El = ({ T }) => {
  const t = useT();
  const a = T(143), b = T(144), c = T(145), d = T(147);
  return (
    <>
      <Kin t={t} from={a} parts={['직접 ', { em: '만들면서' }]} x={0} y={110} w={1920} size={80} center />
      <FlowRow t={t} x={150} y={330} nodeW={330} gapW={100} size={44} h={180} nodes={[
        { text: '프롬프트', at: a + 0.5, icon: 'chat' },
        { text: '바이브 코딩', at: b, icon: 'code' },
        { text: 'GitHub', at: c, icon: 'git' },
        { text: '배포', at: c + 1.2, icon: 'rocket', hot: true },
      ]} />
      <div style={{ ...at(0, 620, 1920), display: 'flex', justifyContent: 'center', ...mx(pop(t, d)) }}><div className="chip" style={{ fontSize: 54, background: GOLD, color: '#1a1420' }}><Icon name="brain" color="#1a1420" size={62} />우리는 머리를 쓰게 됩니다</div></div>
      <Burst t={t} at={d + 0.1} x={960} y={660} n={20} seed="pipe" />
    </>
  );
};

const Iterate: El = ({ T }) => {
  const t = useT();
  const a = T(148), b = T(149);
  return (
    <>
      <Head t={t} from={a} parts={['앱이 만들어지면']} size={70} />
      <P s={{ ...at(1140, 110, 560, 760), padding: 30, ...mx(up(t, a + 0.3, 40)) }}>
        <div style={{ height: 60, borderRadius: 14, background: 'rgba(242,197,114,.28)', marginBottom: 22 }} />
        {[0, 1, 2].map((i) => <div key={i} style={{ height: 96, borderRadius: 16, background: 'rgba(255,255,255,.1)', marginBottom: 18 }} />)}
        <div style={{ height: 96, borderRadius: 16, border: `3px dashed ${MINT}`, marginBottom: 18, opacity: prog(t, b + 0.6, 0.3), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: MINT }}>+ 새 기능</div>
        <div style={{ height: 96, borderRadius: 16, background: 'rgba(255,138,115,.25)', opacity: 1 - 0.7 * prog(t, b + 1.4, 0.4), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: CORAL, textDecoration: t > b + 1.4 ? 'line-through' : undefined }}>필요 없는 기능</div>
      </P>
      <div style={{ ...at(96, 250), display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div className="chip" style={{ fontSize: 52, alignSelf: 'flex-start', ...mx(slide(t, b + 0.4, -30)) }}><span className="mint" style={{ fontSize: 64 }}>＋</span>추가할 기능</div>
        <div className="chip" style={{ fontSize: 52, alignSelf: 'flex-start', ...mx(slide(t, b + 1.2, -30)) }}><span className="coral" style={{ fontSize: 64 }}>－</span>뺄 기능</div>
      </div>
      <div style={{ ...at(100, 560), fontSize: 56, fontWeight: 900, textShadow: '0 6px 24px #000', ...mx(up(t, b + 2, 16)) }}>→ <span className="gold">고민</span>하게 됩니다</div>
    </>
  );
};

const Machine: El = ({ T }) => {
  const t = useT();
  const a = T(150), b = T(152), c = T(153), d = T(155), e = T(157);
  const o1 = 1 - prog(t, c - 0.2, 0.3);
  const v = barValue(t, [[d, 0.3, 0.6], [e, 0.92, 1.4]]);
  return (
    <>
      <div style={{ opacity: o1 }}>
        <Strike t={t} from={a} strikeAt={a + 1.4} text="단순히 답만 받고 끝" x={560} y={250} size={92} />
        <Kin t={t} from={b} parts={[{ em: '사고력' }, '을 키우게 됩니다']} x={0} y={470} w={1920} size={100} center />
        <Sparkles t={t} at={b + 0.4} x={960} y={540} spread={700} seed="mc" />
      </div>
      <div style={{ opacity: prog(t, c, 0.3) }}>
        <div style={{ ...at(0, 120, 1920), display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, ...mx(up(t, c, 20)) }}>
          <Icon name="robot" size={110} color={SKY} />
          <span style={{ fontSize: 76, fontWeight: 900 }}>AI는 <span style={{ color: SKY }}>질문 기계</span>가</span>
        </div>
        <StampText t={t} from={T(154)} text="아닙니다" x={780} y={260} size={110} rot={-6} />
        <div style={{ opacity: prog(t, d, 0.3) }}>
          <Kin t={t} from={d} parts={['AI로 ', { em: '뭔가를 만들다' }, ' 보면']} x={0} y={490} w={1920} size={72} center />
          <div style={{ ...at(560, 640), display: 'flex', alignItems: 'center', gap: 14, fontSize: 42, fontWeight: 850 }}><Icon name="brain" size={50} />머리를 쓸 가능성</div>
          <Bar x={560} y={720} w={800} h={40} v={v} color={GOLD} />
          <div style={{ ...at(1380, 690), ...mx(pop(t, e + 1.2)) }}><Icon name="trend" size={90} /></div>
        </div>
      </div>
    </>
  );
};

const Toys: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(158)} parts={['아이들도 ', { em: '그렇습니다' }]} x={90} y={110} size={84} />
      <Chip t={t} from={T(159)} x={96} y={260} text="형태가 정해진 장난감보다" icon="lock" size={46} color={SOFT} />
    </>
  );
};

const Clay: El = ({ T }) => {
  const t = useT();
  const a = T(160), b = T(161), c = T(162), d = T(164), e = T(165);
  const ball = spr(t, c + 0.3, 0.5, 6).v;
  return (
    <>
      <Kin t={t} from={a} parts={[{ em: '찰흙' }, '·클레이처럼\n형태가 정해지지 않은 것']} x={90} y={110} size={76} />
      <Chip t={t} from={b} x={96} y={330} text="머리를 더 쓰게 됩니다" icon="brain" size={46} />
      <div style={{ opacity: prog(t, c, 0.3) }}>
        <div style={{ ...at(1300, 260, 300, 300), borderRadius: `${50 * ball}% ${30 + 20 * ball}% ${50 * ball}% ${40 + 10 * ball}%`, background: 'radial-gradient(circle at 35% 30%, #ffb59c, #d9603f 70%)', boxShadow: '0 30px 60px rgba(0,0,0,.5)', transform: `rotate(${(1 - ball) * 40}deg)` }} />
        <div style={{ ...at(1220, 590, 460), textAlign: 'center', fontSize: 46, fontWeight: 850, textShadow: '0 4px 18px #000' }}>그냥 동그랗게 뭉치기</div>
        <div style={{ ...at(1240, 660, 420), textAlign: 'center', fontSize: 42, fontWeight: 800, color: CORAL, ...mx(pop(t, d)) }}>머리 쓸 일이 별로 없다</div>
      </div>
      <div style={{ ...at(96, 480), display: 'flex', alignItems: 'center', gap: 20, ...mx(up(t, e, 20)) }}>
        <div className="chip" style={{ fontSize: 46 }}>동그랗게 뭉치기</div>
        <span style={{ fontSize: 60, fontWeight: 900, color: CORAL }}>≈</span>
        <div className="chip" style={{ fontSize: 46, borderColor: CORAL }}><Icon name="chat" color={CORAL} size={52} />AI에게 단순한 질문만</div>
      </div>
    </>
  );
};

const Shapes: El = ({ T }) => {
  const t = useT();
  const a = T(166), b = T(167), c = T(168), d = T(169), e = T(170);
  const items: [string, IconName, number][] = [['사람', 'users', a + 0.6], ['자동차', 'car', b], ['꽃', 'sparkle', b + 1], ['집', 'house', c]];
  return (
    <>
      <Kin t={t} from={a} parts={['찰흙으로 ', { em: '무언가를 만든다면' }]} x={90} y={100} size={76} />
      <div style={{ ...at(96, 230), display: 'flex', gap: 22 }}>
        {items.map(([w, ic, f]) => <div key={w} className="chip" style={{ fontSize: 46, ...mx(pop(t, f)) }}><Icon name={ic} size={54} />{w}</div>)}
      </div>
      <div style={{ ...at(100, 370), fontSize: 56, fontWeight: 900, textShadow: '0 6px 24px #000', ...mx(up(t, d, 16)) }}>아이들은 머리를 <span className="gold">더</span> 쓰게 되겠죠</div>
      <div style={{ ...at(96, 500), display: 'flex', alignItems: 'center', gap: 20, ...mx(up(t, e, 20)) }}>
        <div className="chip" style={{ fontSize: 46 }}>모양 만들기</div>
        <span style={{ fontSize: 60, fontWeight: 900, color: GOLD }}>≈</span>
        <div className="chip" style={{ fontSize: 46, background: GOLD, color: '#1a1420' }}><Icon name="rocket" color="#1a1420" size={52} />AI로 뭔가를 만들어내기</div>
      </div>
    </>
  );
};

const Sand: El = ({ T }) => {
  const t = useT();
  const a = T(171), b = T(176), c = T(177);
  return (
    <>
      <Kin t={t} from={a + 0.2} parts={['옛날 ', { em: '모래 놀이터' }]} x={90} y={100} size={80} />
      <Chip t={t} from={T(173)} x={96} y={240} text="아이들이 모래를 가지고 한참 놀던 곳" icon="clock" size={42} />
      <div style={{ ...at(96, 370), display: 'flex', gap: 20 }}>
        {[['성 쌓기', 'house', b], ['땅 파기', 'down', b + 0.9], ['별의별 것', 'sparkle', c]].map(([w, ic, f]) => (
          <div key={w as string} className="chip" style={{ fontSize: 48, ...mx(pop(t, f as number)) }}><Icon name={ic as IconName} size={56} />{w}</div>
        ))}
      </div>
    </>
  );
};

const Castle: El = ({ T }) => {
  const t = useT();
  const a = T(178), b = T(179), c = T(180);
  return (
    <>
      <Kin t={t} from={a} parts={['모래로 만들어 보는 과정']} x={90} y={110} size={70} />
      <Kin t={t} from={b} parts={['= ', { em: '빌드' }, '하는 과정']} x={90} y={220} size={96} />
      <div style={{ ...at(96, 400), ...mx(slam(t, c)) }}><div className="chip" style={{ fontSize: 60, background: GOLD, color: '#1a1420' }}><Icon name="brain" color="#1a1420" size={70} />머리를 엄청 씁니다</div></div>
      <Burst t={t} at={c + 0.05} x={420} y={460} n={24} seed="cst" />
    </>
  );
};

const Advice: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Rays t={t} y={46} o={0.28} />
      <Kin t={t} from={T(181)} parts={['그래서 제 생각에는']} x={0} y={210} w={1920} size={60} center />
      <Kin t={t} from={T(182)} parts={['AI를 활용해서\n', { em: '무언가를 만들어' }, ' 보세요']} x={0} y={320} w={1920} size={110} center />
    </>
  );
};

const Loop: El = ({ T }) => {
  const t = useT();
  const a = T(184), b = T(185), c = T(186), d = T(187), e = T(188), f = T(189);
  const cx = 620, cy = 500, r = 250;
  const nodes: [string, IconName, number][] = [['만들기', 'rocket', a + 0.4], ['고민', 'brain', b + 0.3], ['개선', 'up', c]];
  const spin = t > d ? (t - d) * 120 : 0;
  const lvl = barValue(t, [[e, 0.85, 1.2]]);
  const out = barValue(t, [[f + 0.3, 0.9, 1.2]]);
  return (
    <>
      <Kin t={t} from={a} parts={['이 과정을 ', { em: '반복' }, '하다 보면']} x={0} y={70} w={1920} size={70} center />
      <svg viewBox="-300 -300 600 600" style={{ ...at(cx - 300, cy - 300, 600, 600), overflow: 'visible', transform: `rotate(${spin}deg)` }} fill="none">
        <circle r={r} stroke="rgba(242,197,114,.25)" strokeWidth={14} />
        <circle r={r} stroke={GOLD} strokeWidth={14} pathLength={1} strokeDasharray={1} strokeLinecap="round" style={{ strokeDashoffset: 1 - prog(t, a + 0.3, 2.6, E.p2io), filter: `drop-shadow(0 0 12px ${GOLD})` }} transform="rotate(-90)" />
      </svg>
      {nodes.map(([w, ic, f0], i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + (spin * Math.PI) / 180;
        return (
          <div key={w} style={{ ...at(cx + Math.cos(ang) * r - 110, cy + Math.sin(ang) * r - 70, 220, 140), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 24, background: 'rgba(14,12,22,.92)', border: `3px solid ${GOLD}`, fontSize: 40, fontWeight: 900, ...mx(pop(t, f0)) }}>
            <Icon name={ic} size={52} />{w}
          </div>
        );
      })}
      <div style={{ ...at(cx - 120, cy - 50, 240), textAlign: 'center', fontSize: 64, fontWeight: 900, color: GOLD, ...mx(pop(t, d)) }}>반복</div>
      <P s={{ ...at(1080, 290, 740, 400), padding: '36px 44px', ...mx(up(t, e - 0.2, 40)) }}>
        <div style={{ fontSize: 44, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="brain" size={52} />사고력</div>
        <Bar x={44} y={120} w={650} h={38} v={lvl} color={GOLD} />
        <div style={{ ...at(44, 200), fontSize: 44, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(t, f, 0.3) }}><Icon name="sparkle" color={MINT} size={52} />더 좋은 결과물</div>
        <Bar x={44} y={290} w={650} h={38} v={out} color={MINT} o={prog(t, f, 0.3)} />
      </P>
      <Burst t={t} at={f + 1.5} x={1450} y={500} n={24} seed="loop" />
    </>
  );
};

const Wrap: El = ({ T }) => {
  const t = useT();
  const a = T(190), b = T(191), c = T(192);
  return (
    <>
      <Kin t={t} from={a + 0.1} parts={['오늘 이야기, ', { em: '한 줄로' }]} x={90} y={110} size={70} />
      <div style={{ ...at(96, 240), display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="chip" style={{ fontSize: 50, alignSelf: 'flex-start', ...mx(slide(t, b, -30)) }}><CheckMark t={t} from={b + 0.3} size={58} color={CORAL} no />질문만 하는 AI</div>
        <div className="chip" style={{ fontSize: 50, alignSelf: 'flex-start', ...mx(slide(t, b + 1.2, -30)) }}><CheckMark t={t} from={b + 1.5} size={58} />AI와 함께 만들기</div>
      </div>
      <div style={{ ...at(100, 500), fontSize: 46, fontWeight: 800, color: SOFT, textShadow: '0 4px 18px #000', ...mx(up(t, c, 14)) }}>앞으로도 계속 고민할 주제입니다</div>
    </>
  );
};

const Comment: El = ({ T }) => {
  const t = useT();
  const a = T(193), b = T(195), c = T(197);
  const txt = '저는 이렇게 하고 있어요…';
  return (
    <>
      <Kin t={t} from={a} parts={['선생님들은 ', { em: '어떻게' }, '\n해결하고 계신가요?']} x={90} y={110} size={80} />
      <P s={{ ...at(96, 400, 900, 250), padding: '28px 36px', ...mx(up(t, b, 40)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 36, fontWeight: 800, color: GOLD }}><Icon name="chat" size={46} />댓글</div>
        <div style={{ marginTop: 22, padding: '18px 24px', borderRadius: 14, background: 'rgba(255,255,255,.1)', fontSize: 40, fontWeight: 650 }}>{typed(t, b + 0.6, 1.6, txt)}<Caret t={t} /></div>
      </P>
      <div style={{ ...at(100, 690), ...mx(pop(t, c)) }}><div className="chip" style={{ fontSize: 48, background: GOLD, color: '#1a1420' }}><Icon name="heart" color="#1a1420" size={54} />댓글로 남겨 주세요</div></div>
    </>
  );
};

const End: El = ({ T }) => {
  const t = useT();
  const a = T(199), z = T(201);
  return (
    <>
      <Hero t={t} from={T(198, 0.2)} x={740} y={110} h={430} />
      <Kin t={t} from={T(198, 0.4)} parts={['AI로 ', { em: '사고력' }, '을 향상시키는 방법']} x={0} y={570} w={1920} size={72} center />
      <div style={{ ...at(0, 700, 1920), display: 'flex', justifyContent: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 46px 20px', borderRadius: 18, background: GOLD, color: '#1a1420', fontSize: 58, fontWeight: 900, ...mx(pop(t, a + 0.3)) }}><Icon name="thumb" color="#1a1420" size={64} />좋아요</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 46px 20px', borderRadius: 18, background: '#fff', color: '#1a1420', fontSize: 58, fontWeight: 900, ...mx(pop(t, a + 0.8)) }}><Icon name="bell" color="#1a1420" size={64} />구독</div>
      </div>
      <Burst t={t} at={a + 0.9} x={960} y={750} n={36} power={1.1} seed="end" />
      <Sparkles t={t} at={z} x={760} y={400} spread={860} seed="end" />
    </>
  );
};

export const BEATS: Beat[] = [
  { name: '제목', from: 1, dim: 0.3, El: Title },
  { name: '사고력이란', from: 5, dim: 0.5, side: 'c', El: Define },
  { name: '문제 해결', from: 7, dim: 0.42, side: 'c', El: Puzzle },
  { name: '여러 문제', from: 10, dim: 0.4, El: Problems },
  { name: '객관식 아님', from: 13, dim: 0.46, El: NotChoice },
  { name: '골똘히', from: 15, dim: 0.4, El: Ponder },
  { name: '왜 사고력?', from: 19, dim: 0.46, side: 'c', El: Why },
  { name: '4년', from: 22, dim: 0, side: 'c', El: Timeline },
  { name: '맡기니', from: 25, dim: 0.42, El: LessUse },
  { name: '내비게이션', from: 28, dim: 0.42, El: Navi },
  { name: 'AI도 비슷', from: 34, dim: 0.5, El: Analogy },
  { name: '어른들', from: 39, dim: 0.42, El: Adults },
  { name: '어린 학생들', from: 43, dim: 0.46, El: Kids },
  { name: 'AI 네이티브', from: 49, dim: 0.4, side: 'c', El: Native },
  { name: '글·그림·영상', from: 50, dim: 0.5, side: 'c', El: Create },
  { name: '경고', from: 55, dim: 0.42, El: Warn },
  { name: '의존', from: 57, dim: 0, side: 'c', El: Depend },
  { name: '회사·생활', from: 62, dim: 0.44, El: Work },
  { name: '설마', from: 65, dim: 0.36, El: Doubt },
  { name: '대체', from: 68, dim: 0.5, El: Replace },
  { name: '향상시켜야', from: 70, dim: 0.5, side: 'c', El: Must },
  { name: '근력', from: 76, dim: 0.44, El: Muscle },
  { name: '단련', from: 79, dim: 0.4, El: Train },
  { name: '장점', from: 81, dim: 0.44, El: Benefit },
  { name: '마찬가지', from: 84, dim: 0.46, El: Same },
  { name: '비교', from: 88, dim: 0, side: 'c', El: Compare },
  { name: '중요', from: 98, dim: 0.46, side: 'c', El: Key },
  { name: '어떻게', from: 101, dim: 0.5, side: 'c', El: How },
  { name: '고민', from: 103, dim: 0.42, El: MyQ },
  { name: '질문만', from: 109, dim: 0.5, side: 'c', El: AskOnly },
  { name: 'BUILD', from: 118, dim: 0, side: 'c', El: Build },
  { name: '영어 단어', from: 125, dim: 0.5, side: 'c', El: Word },
  { name: '프롬프트', from: 128, dim: 0.5, El: Prompt },
  { name: '아이디어', from: 133, dim: 0.56, side: 'c', El: Ideas },
  { name: 'A 앱', from: 139, dim: 0.5, El: Choose },
  { name: '만들기 흐름', from: 143, dim: 0.56, side: 'c', El: Pipeline },
  { name: '기능 고민', from: 148, dim: 0.46, El: Iterate },
  { name: '질문 기계', from: 150, dim: 0, side: 'c', El: Machine },
  { name: '장난감', from: 158, dim: 0.4, El: Toys },
  { name: '찰흙', from: 160, dim: 0.46, El: Clay },
  { name: '모양 만들기', from: 166, dim: 0.42, El: Shapes },
  { name: '모래 놀이터', from: 171, dim: 0.4, El: Sand },
  { name: '빌드', from: 178, dim: 0.42, El: Castle },
  { name: '만들어 보세요', from: 181, dim: 0.5, side: 'c', El: Advice },
  { name: '반복', from: 184, dim: 0, side: 'c', El: Loop },
  { name: '정리', from: 190, dim: 0.44, El: Wrap },
  { name: '댓글', from: 193, dim: 0.46, El: Comment },
  { name: '엔드카드', from: 198, dim: 0, side: 'c', El: End },
];

// 카메라가 펀치 인 하는 순간 (말이 가장 센 곳)
export const KICKS = ({ T }: T2): number[] => [T(9), T(18), T(24, 1.4), T(33, 0.3), T(49, 0.3), T(56, 0.4), T(69, 2.2), T(93, 0.6), T(99), T(117, 0.6), T(120), T(127), T(147), T(154), T(165), T(180), T(182), T(188)];

// 작은 효과음. 목소리를 가리지 않도록 아주 작게 넣는다.
export const SFX = ({ T }: T2): Sfx[] => {
  const pops = [T(6), T(12, 0.3), T(13, 0.6), T(14, 0.6), T(23), T(40), T(41), T(41, 0.75), T(51), T(52), T(52, 0.7), T(58), T(59), T(60), T(61), T(63), T(64), T(66), T(82), T(83), T(86, 0.6), T(87),
    T(91), T(92), T(93), T(95), T(96), T(97), T(112), T(114), T(126), T(136), T(137), T(141), T(142), T(144), T(145), T(149, 0.4), T(149, 1.2), T(167), T(168), T(176), T(177), T(184, 0.4), T(185, 0.3), T(186), T(199, 0.3), T(199, 0.8)];
  const dings = [T(6, 0.85), T(18), T(24, 1.4), T(99), T(120), T(138), T(147), T(152), T(170), T(180), T(189, 1.5)];
  return [
    ...pops.map((at0) => ({ at: at0, name: 'pop' as const, vol: 0.13 })),
    ...dings.map((at0) => ({ at: at0, name: 'ding' as const, vol: 0.16 })),
  ];
};
