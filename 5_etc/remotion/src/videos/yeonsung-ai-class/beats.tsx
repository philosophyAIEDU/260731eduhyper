import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { E, mx, pop, prog, slide, spr, stamp, up } from '../../kit/anim';
import { Burst, Ring, type Sfx, Sparkles } from '../../kit/fx';
import { useT } from '../../kit/time';
import type { IconName } from '../../kit/icons';
import { at, Bar, barValue, bob, Bubble, CheckList, CheckMark, Chip, CORAL, FlowRow, GOLD, Head, Hero, Icon, Kin, MINT, Rays, SKY, SOFT, StampText, Strike } from '../ai-thinking-build/gfx';

// 연성대학교 AI 교육 후기 — 장면별 모션그래픽. 모든 타이밍은 SRT 큐에 고정한다: T(큐) = 말이 시작되는 초.
// 비트의 끝은 다음 비트의 시작. dim = 사진을 얼마나 어둡게 할지, side = 어두운 쪽 ('l' 왼쪽, 'r' 오른쪽, 'c' 전체).
// 자막(화면 아래 y≈945~1024)을 가리지 않도록 그래픽은 y 900 위에만 둔다.

export type T2 = { T: (n: number, off?: number) => number; TE: (n: number, off?: number) => number };
type El = React.FC<T2>;
type Beat = { name: string; from: number; dim?: number; side?: 'l' | 'r' | 'c'; El: El };

export const CHAPTERS: { from: number; to?: number; n: string; title: string }[] = [
  { from: 8, n: '01', title: '닫히는 문, 열리는 문' },
  { from: 29, n: '02', title: '3시간의 AI 수업' },
  { from: 94, to: 105, n: '03', title: 'AI로 빌드하라' },
];

// ---------- 공통 조각 --------------------------------------------------------------
const P: React.FC<{ s: React.CSSProperties; children?: React.ReactNode }> = ({ s, children }) => <div className="pn" style={s}>{children}</div>;
const fade = (t: number, a: number, b: number, d = 0.3) => prog(t, a, d) * (1 - prog(t, b - d, d));
const photo = (id: string) => staticFile(`yeonsung-ai-class/visuals/${id}.jpg`);

/** 큰 아이콘 원 */
const Orb: React.FC<{ t: number; from: number; icon: IconName; x: number; y: number; size?: number; color?: string; label?: string; hot?: boolean }> = ({ t, from, icon, x, y, size = 170, color = GOLD, label, hot }) => (
  <div style={{ ...at(x, y, size), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...mx(pop(t, from)) }}>
    <div style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hot ? color : 'rgba(14,12,22,.82)', border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}66` }}>
      <Icon name={icon} color={hot ? '#1a1420' : color} size={size * 0.52} />
    </div>
    {label && <div style={{ fontSize: 40, fontWeight: 850, whiteSpace: 'nowrap', textShadow: '0 4px 18px #000' }}>{label}</div>}
  </div>
);

/** 따옴표 카드 — 학생의 말 */
const Quote: React.FC<{ t: number; from: number; x: number; y: number; w: number; text: React.ReactNode; who?: string; size?: number }> = ({ t, from, x, y, w, text, who, size = 58 }) => (
  <div style={{ ...at(x, y, w), padding: '34px 48px 38px', borderRadius: 26, background: 'rgba(14,12,22,.84)', border: `2px solid ${GOLD}88`, boxShadow: '0 22px 60px rgba(0,0,0,.55)', ...mx(up(t, from, 40)) }}>
    <div style={{ position: 'absolute', left: 26, top: -46, fontSize: 150, fontWeight: 900, color: GOLD, lineHeight: 1 }}>“</div>
    <div style={{ fontSize: size, fontWeight: 850, letterSpacing: '-.03em', lineHeight: 1.3, wordBreak: 'keep-all' }}>{text}</div>
    {who && <div style={{ marginTop: 14, fontSize: 32, fontWeight: 700, color: SOFT }}>— {who}</div>}
  </div>
);

/** 사진 액자(폴라로이드) */
const Polaroid: React.FC<{ t: number; from: number; id: string; x: number; y: number; w?: number; rot?: number }> = ({ t, from, id, x, y, w = 520, rot = 0 }) => {
  const { v } = spr(t, from, 0.55, 10);
  return (
    <div style={{ ...at(x, y, w), padding: '16px 16px 54px', background: '#f7f3ea', borderRadius: 6, boxShadow: '0 26px 60px rgba(0,0,0,.6)', opacity: prog(t, from, 0.15),
      transform: `translateY(${(1 - v) * 220}px) rotate(${rot * v + (1 - v) * rot * 3}deg) scale(${0.8 + 0.2 * v})` }}>
      <Img src={photo(id)} alt="" style={{ width: '100%', height: w * 0.5625, objectFit: 'cover', display: 'block' }} />
    </div>
  );
};

// ---------- 인트로: 연성대로 ---------------------------------------------------------
const Title: El = ({ T }) => {
  const t = useT();
  const sw = prog(t, 1.2, 1.0, E.p2io);
  return (
    <>
      <Chip t={t} from={0.25} x={96} y={500} text="2026. 11. 24 · 연성대학교" icon="pin" size={36} />
      <Kin t={t} from={0.45} parts={[{ em: '연성대학교' }, '\nAI 교육 후기']} x={96} y={600} size={104} stagger={0.045} />
      <div style={{ ...at(100, 880, 560, 8), borderRadius: 4, background: GOLD, boxShadow: `0 0 26px ${GOLD}`, transformOrigin: '0 50%', transform: `scaleX(${sw})` }} />
      <Sparkles t={t} at={T(1, 1.3)} x={400} y={700} spread={380} seed="title" />
    </>
  );
};

const PrevVideo: El = ({ T }) => {
  const t = useT();
  const a = T(2), b = T(3);
  return (
    <>
      <Chip t={t} from={a} x={90} y={90} text="얼마 전에 올린 영상" icon="clock" size={38} />
      <div style={{ ...at(96, 200, 560, 315), ...mx(up(t, b - 0.1, 40)) }}>
        <P s={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(140deg, #2a2140, #151020)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 120, height: 84, borderRadius: 22, background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(255,59,48,.5)', ...mx(pop(t, b + 0.3)) }}>
              <div style={{ width: 0, height: 0, marginLeft: 8, borderLeft: '36px solid #fff', borderTop: '22px solid transparent', borderBottom: '22px solid transparent' }} />
            </div>
            <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-.03em' }}>동신대학교 AI 교육</div>
          </div>
          <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: '100%', background: 'rgba(255,255,255,.2)' }}>
            <div style={{ height: '100%', background: '#ff3b30', width: `${100 * prog(t, b + 0.4, 3.5)}%` }} />
          </div>
        </P>
      </div>
    </>
  );
};

const Request: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <FlowRow t={t} x={90} y={70} nodeW={330} gapW={80} size={38} h={140} nodes={[
        { text: '동신대 영상', at: T(4), icon: 'eye' },
        { text: '교수학습센터', at: T(4, 1.6), icon: 'users' },
        { text: '수업 요청', at: T(6), icon: 'chat', hot: true },
      ]} />
      <div style={{ ...at(0, 690, 1920), display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '22px 52px 26px', borderRadius: 22, background: GOLD, color: '#1a1420', fontSize: 68, fontWeight: 900, letterSpacing: '-.04em', whiteSpace: 'nowrap', boxShadow: `0 0 60px ${GOLD}77`, ...mx(stamp(t, T(6, 0.5))) }}>
          <Icon name="app" color="#1a1420" size={74} />AI로 나만의 앱 만들기
        </div>
      </div>
      <Burst t={t} at={T(6, 0.55)} x={960} y={750} n={26} seed="req" />
    </>
  );
};

const Thoughts: El = ({ T }) => {
  const t = useT();
  const a = T(7);
  return (
    <>
      <Head t={t} from={a} parts={['연성대에 가면서\n', { em: '여러 생각' }, '이 들었습니다']} size={70} lines={2} y={90} />
      {[0, 1, 2].map((i) => <div key={i} style={{ ...at(130 + i * 70, 300 - i * 18, 40 + i * 14, 40 + i * 14), borderRadius: '50%', background: '#fff', opacity: 0.85, ...mx(pop(t, a + 0.7 + i * 0.25)) }} />)}
    </>
  );
};

// ---------- 01 닫히는 문, 열리는 문 ------------------------------------------------------
const Exam: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(8)} parts={['얼마 전 ', { em: '수능' }, ' 때']} size={80} />
      <div style={{ ...at(122, 230), display: 'flex', gap: 22 }}>
        <Chip t={t} from={T(9)} x={0} y={0} text="AI 안경" icon="eye" size={50} color={CORAL} enter={(a, b) => pop(a, b)} extra={{ css: { position: 'relative' } }} />
        <Chip t={t} from={T(10)} x={0} y={0} text="AI 컨닝" icon="robot" size={50} color={CORAL} enter={(a, b) => pop(a, b)} extra={{ css: { position: 'relative' } }} />
      </div>
      <StampText t={t} from={T(11, 0.4)} text="대한민국이 난리!" x={130} y={420} size={78} rot={-6} />
    </>
  );
};

const Cheat: El = ({ T }) => {
  const t = useT();
  const a = T(12), b = T(13);
  return (
    <>
      <Kin t={t} from={a} parts={['지금도 ', { em: '여러 시험' }, '에서']} x={96} y={96} size={74} />
      <P s={{ ...at(100, 230, 700, 150), display: 'flex', alignItems: 'center', gap: 26, padding: '0 40px', borderColor: `${CORAL}aa`, ...mx(up(t, b, 30)) }}>
        <Icon name="zap" color={CORAL} size={80} />
        <div style={{ fontSize: 60, fontWeight: 900 }}>AI 컨닝 = <span className="coral">큰 문제</span></div>
      </P>
      <Ring t={t} at={b + 0.9} x={450} y={305} r={420} color={CORAL} />
    </>
  );
};

const World: El = ({ T }) => {
  const t = useT();
  const qs = [[260, 170, 130, 0], [1580, 220, 110, 0.3], [380, 640, 90, 0.5], [1480, 600, 120, 0.7]];
  return (
    <>
      <Kin t={t} from={T(14)} parts={['우리 학생들이 살아갈 세상은\n', { em: '어떻게 바뀔까요?' }]} x={0} y={330} w={1920} size={86} center />
      {qs.map(([x, y, s, d], i) => <div key={i} style={{ ...at(x, y), fontSize: s, fontWeight: 900, color: GOLD, textShadow: `0 0 30px ${GOLD}aa`, ...mx(pop(t, T(14, 0.6 + d)), bob(t, `wq${i}`, 16)) }}>?</div>)}
    </>
  );
};

const Crumble: El = ({ T }) => {
  const t = useT();
  const fall = T(18, 0.5);
  const blocks: [string, IconName, number][] = [['제도', 'house', T(15, 0.6)], ['평가 방식', 'doc', T(16)], ['기회', 'key', T(17)]];
  return (
    <>
      <Kin t={t} from={T(15)} parts={['우리가 ', { em: '정답' }, '으로 알고 있던 것들']} x={0} y={110} w={1920} size={70} center />
      {blocks.map(([w, ic, a], i) => {
        const f = prog(t, fall + i * 0.22, 1.1, E.p2in);
        const shake = t > fall - 0.6 && t < fall + i * 0.22 ? Math.sin(t * 60 + i) * 5 : 0;
        return (
          <div key={w} style={{ ...at(330 + i * 440, 330, 380, 380), ...mx(up(t, a, 60)) }}>
            <div className="pn" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, fontSize: 60, fontWeight: 900,
              background: 'rgba(30,26,44,.92)', borderColor: `${GOLD}66`, transform: `translate(${shake}px, ${f * 900}px) rotate(${f * (i - 1 || 0.6) * 38}deg)`, opacity: 1 - prog(t, fall + i * 0.22 + 0.7, 0.4) }}>
              <Icon name={ic} size={110} />{w}
            </div>
          </div>
        );
      })}
      {[0, 1, 2].map((i) => <Burst key={i} t={t} at={fall + i * 0.22 + 0.05} x={520 + i * 440} y={600} n={14} power={0.6} seed={`cr${i}`} />)}
      <Kin t={t} from={fall + 0.4} parts={['조금씩 ', { em: '무너져 내리고' }, ' 있습니다']} x={0} y={540} w={1920} size={84} center />
    </>
  );
};

const Formula: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(19)} parts={[{ em: '10년, 15년, 20년' }, ' 전만 해도']} size={70} />
      <FlowRow t={t} x={96} y={220} nodeW={300} gapW={80} size={42} h={150} nodes={[
        { text: '대학 졸업', at: T(20), icon: 'student' },
        { text: '취직', at: T(20, 1.1), icon: 'doc' },
        { text: '일정한 공식', at: T(21), icon: 'check', hot: true },
      ]} />
    </>
  );
};

const Closing: El = ({ T }) => {
  const t = useT();
  const v = barValue(t, [[T(22, 0.6), 0.92, 0.6], [T(23), 0.28, 1.3]]);
  return (
    <>
      <Kin t={t} from={T(22)} parts={['열려 있던 문들이\n', { em: '닫히고' }, ' 있습니다']} x={96} y={96} size={78} />
      <P s={{ ...at(100, 340, 720, 210), padding: '28px 36px', ...mx(up(t, T(22, 0.6), 30)) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 44, fontWeight: 850 }}>
          <span>공채</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: CORAL, opacity: prog(t, T(23, 0.4), 0.3) }}><Icon name="down" color={CORAL} size={50} />많이 줄었습니다</span>
        </div>
        <Bar x={36} y={130} w={648} h={38} v={v} color={t > T(23) ? CORAL : GOLD} />
      </P>
    </>
  );
};

const Door: React.FC<{ t: number; x: number; y: number; w: number; h: number; close: number; lockAt?: number; open?: number; gold?: boolean }> = ({ t, x, y, w, h, close, lockAt, open = 0, gold }) => {
  const c = Math.min(1, Math.max(0, close));
  const lit = Math.max(1 - c * 0.85, open);
  return (
    <div style={{ ...at(x, y, w, h), perspective: 1200 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '10px 10px 0 0', border: `6px solid ${gold ? GOLD : 'rgba(255,255,255,.55)'}`, overflow: 'hidden',
        background: `radial-gradient(circle at 50% 60%, rgba(255,236,190,${0.95 * lit}), rgba(242,197,114,${0.4 * Math.max(1 - c, open)}) 55%, rgba(20,16,30,.9))` }} />
      <div style={{ position: 'absolute', inset: 6, borderRadius: '6px 6px 0 0', background: gold ? 'linear-gradient(160deg, #f8d88f, #c9953e)' : 'linear-gradient(160deg, #4a4560, #2a2638)', transformOrigin: '0 50%',
        transform: `rotateY(${-100 * (1 - c) - 100 * open}deg)`, boxShadow: 'inset 0 0 0 3px rgba(0,0,0,.25)' }}>
        <div style={{ position: 'absolute', right: '12%', top: '52%', width: w * 0.08, height: w * 0.08, borderRadius: '50%', background: gold ? '#7a5520' : '#cfc8dc' }} />
      </div>
      {lockAt !== undefined && <div style={{ position: 'absolute', left: w / 2 - 38, top: h / 2 - 38, ...mx(pop(t, lockAt)) }}><Icon name="lock" color={CORAL} size={76} /></div>}
    </div>
  );
};

const Doors: El = ({ T }) => {
  const t = useT();
  const a = T(24), b = T(25);
  return (
    <>
      <Kin t={t} from={a} parts={['학생들이 보고 있던 ', { em: '많은 문들' }]} x={0} y={100} w={1920} size={72} center />
      {Array.from({ length: 5 }, (_, i) => (
        <Door key={i} t={t} x={230 + i * 300} y={330} w={240} h={420} close={prog(t, a + 0.8 + i * 0.3, 0.5, E.p2in)} lockAt={b + 0.3 + i * 0.15} />
      ))}
      <Kin t={t} from={b + 0.2} parts={['이미 ', { em: '닫힌' }, ' 경우가 많습니다']} x={0} y={790} w={1920} size={64} center />
    </>
  );
};

const NewDoor: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Rays t={t} x={75} y={40} o={0.55 * prog(t, T(26), 1)} />
      <Kin t={t} from={T(26)} parts={['그렇지만\n', { em: '새로운 문' }, '도 열리고 있습니다']} x={96} y={96} size={78} />
      <div style={{ ...at(100, 380), display: 'flex', flexDirection: 'column', gap: 22 }}>
        {([['1인 기업', 'rocket', T(27)], ['1인 크리에이터', 'camera', T(28)]] as [string, IconName, number][]).map(([w, ic, f]) => (
          <div key={w} className="chip" style={{ fontSize: 54, ...mx(slide(t, f, -40)) }}>
            <Icon name={ic} size={62} />{w}<span style={{ display: 'flex', alignItems: 'center', gap: 4, color: MINT, fontSize: 44, ...mx(pop(t, f + 0.6)) }}><Icon name="up" color={MINT} size={50} />늘고 있습니다</span>
          </div>
        ))}
      </div>
    </>
  );
};

// ---------- 02 3시간의 AI 수업 ---------------------------------------------------------
const Prepare: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(29)} parts={['AI로 ', { em: '내가 원하는 앱' }, '을\n만드는 법']} size={74} lines={2} y={560} />
      <Chip t={t} from={T(30)} x={1180} y={620} text="수업 준비 완료" icon="check" size={46} />
    </>
  );
};

const Majors: El = ({ T }) => {
  const t = useT();
  const items: [string, IconName, number][] = [['간호학과', 'heart', T(31)], ['세무학과', 'doc', T(32)], ['소프트웨어학과', 'code', T(33)], ['식품영양학과', 'sparkle', T(34)], ['경영학과', 'trend', T(35)]];
  return (
    <>
      <div style={{ ...at(90, 70), display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        {items.map(([w, ic, f]) => (
          <div key={w} className="chip" style={{ fontSize: 46, ...mx(slide(t, f, -40)) }}><Icon name={ic} size={52} />{w}</div>
        ))}
      </div>
      <Kin t={t} from={T(36)} parts={[{ em: '다양한 전공' }, '의 학생들이\nAI 수업을 들으러 왔습니다']} x={96} y={600} size={62} />
    </>
  );
};

const Doubt: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Chip t={t} from={T(38)} x={90} y={90} text="수업 시간 전" icon="clock" size={42} />
      <Chip t={t} from={T(39)} x={90} y={190} text="간호학과 학생 한 명" icon="heart" size={42} />
      <Bubble t={t} from={T(41)} x={96} y={330} text="“이거 내가 할 수 있는 게 맞을까?”" size={58} tail="b" />
      {[[820, 520, 90, 0], [960, 470, 70, 0.25], [1060, 540, 60, 0.45]].map(([x, y, s, d], i) => <div key={i} style={{ ...at(x, y), fontSize: s, fontWeight: 900, color: SKY, textShadow: '0 0 20px #000', ...mx(pop(t, T(41, 0.6 + d)), bob(t, `dq${i}`, 10)) }}>?</div>)}
    </>
  );
};

const Answer: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Hero t={t} from={T(44)} x={1460} y={470} h={420} />
      <Bubble t={t} from={T(45)} x={520} y={560} text={<span>“학생, <span style={{ color: '#c8871f' }}>분명히 할 수 있습니다.</span>”</span>} size={58} tail="r" />
      <Sparkles t={t} at={T(45, 0.5)} x={900} y={600} spread={380} seed="ans" />
    </>
  );
};

const ThreeHours: El = ({ T }) => {
  const t = useT();
  const v = barValue(t, [[T(46), 1, 1.6]]);
  return (
    <>
      <P s={{ ...at(90, 80, 640, 170), padding: '26px 34px', ...mx(up(t, T(46), 30)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 48, fontWeight: 900 }}><Icon name="clock" size={56} />3시간의 AI 수업<span style={{ marginLeft: 'auto', color: GOLD }}>{Math.round(180 * v)}분</span></div>
        <Bar x={34} y={112} w={572} h={24} v={v} />
      </P>
      <Kin t={t} from={T(49)} parts={['눈이 ', { em: '반짝' }, '였습니다']} x={96} y={300} size={96} />
      <Sparkles t={t} at={T(49, 0.4)} x={360} y={380} spread={320} seed="eye1" />
    </>
  );
};

const Fun: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(50)} parts={['정말 ', { em: '재미있어' }, ' 했던 그 학생']} x={0} y={140} w={1920} size={70} center />
      <Quote t={t} from={T(52)} x={360} y={380} w={1200} size={70} who="간호학과 학생" text={<>진짜 <span className="gold">너무너무 재미있습니다</span><br />정말 감사합니다.</>} />
      <Sparkles t={t} at={T(52, 0.6)} x={960} y={420} spread={560} seed="fun" />
    </>
  );
};

/** 간호 실습 도우미 앱 화면 */
const Phone: React.FC<{ t: number; from: number; ask: number; ans: number }> = ({ t, from, ask, ans }) => {
  const msg = '체온 36.5~37.5℃, 맥박 60~100회/분이 성인 정상 범위예요.';
  const shown = msg.slice(0, Math.round(msg.length * prog(t, ans + 0.3, 1.1)));
  return (
    <div style={{ ...at(1170, 110, 520, 800), borderRadius: 56, background: '#0c0b12', border: '10px solid #2b2838', boxShadow: '0 30px 80px rgba(0,0,0,.6)', overflow: 'hidden', ...mx(up(t, from, 80)) }}>
      <div style={{ height: 120, background: 'linear-gradient(135deg, #7fe3b6, #4fb489)', color: '#0e2a1d', display: 'flex', alignItems: 'center', gap: 16, padding: '24px 30px 0', fontSize: 36, fontWeight: 900 }}>
        <Icon name="heart" color="#0e2a1d" size={46} />간호 실습 도우미
      </div>
      <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ alignSelf: 'flex-end', maxWidth: '82%', padding: '16px 22px', borderRadius: 22, borderTopRightRadius: 6, background: GOLD, color: '#1a1420', fontSize: 30, fontWeight: 750, ...mx(up(t, ask, 20)) }}>활력징후 정상 범위 알려줘</div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', display: 'flex', gap: 12, ...mx(up(t, ans, 20)) }}>
          <div style={{ width: 50, height: 50, flex: 'none', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkle" color="#4a7bd8" size={34} /></div>
          <div style={{ padding: '16px 22px', borderRadius: 22, borderTopLeftRadius: 6, background: '#fff', color: '#1a1420', fontSize: 30, fontWeight: 650, lineHeight: 1.35, minHeight: 60 }}>{shown || '…'}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 26px', background: 'rgba(255,255,255,.06)', fontSize: 26, color: SOFT, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="key" color={MINT} size={34} />Gemini API · 무료 티어
      </div>
    </div>
  );
};

const NurseApp: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(54)} parts={['간호 실습에 ', { em: '도움이 될 앱' }]} size={66} y={110} />
      <CheckList t={t} x={120} y={270} size={44} gap={22} items={[['간호 실습용 앱', T(55)], ['+ 제미나이 API', T(56)], ['+ 무료 티어 API 키', T(57)], ['= 무료로 답해 주는 앱', T(58)]]} />
      <Phone t={t} from={T(54, 0.4)} ask={T(57)} ans={T(58)} />
      <Burst t={t} at={T(59, 1.6)} x={1430} y={520} n={24} seed="app" />
    </>
  );
};

const Shine: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(60)} parts={['흥미로 가득 차서\n', { em: '반짝반짝' }, ' 빛나던 눈']} x={0} y={250} w={1920} size={92} center />
      <Kin t={t} from={T(62, 0.3)} parts={['저는 그 눈을 ', { em: '정말 좋아합니다' }]} x={0} y={560} w={1920} size={64} center />
      <Sparkles t={t} at={T(61)} x={960} y={330} spread={620} seed="sh1" />
      <Sparkles t={t} at={T(62, 0.8)} x={960} y={600} spread={560} seed="sh2" />
    </>
  );
};

const TaxApps: El = ({ T }) => {
  const t = useT();
  const card = (x: number, f: number, n: string) => (
    <P s={{ ...at(x, 330, 300, 250), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: GOLD, color: '#1a1420', ...mx(pop(t, f)) }}>
      <Icon name="app" color="#1a1420" size={100} /><div style={{ fontSize: 46, fontWeight: 900 }}>세무 앱 {n}</div>
    </P>
  );
  return (
    <>
      <Head t={t} from={T(63)} parts={[{ em: '세무학과' }, ' 학생도']} size={70} />
      <Chip t={t} from={T(65)} x={120} y={210} text="너무너무 재미있어 했습니다" icon="heart" size={40} />
      <Chip t={t} from={T(66)} x={120} y={330} text="3시간 만에" icon="clock" size={46} />
      {card(560, T(67, 0.3), '①')}
      {card(900, T(67, 1.0), '②')}
      <Burst t={t} at={T(67, 1.1)} x={900} y={450} n={26} seed="tax" />
    </>
  );
};

const OpenDoor: El = ({ T }) => {
  const t = useT();
  const o = prog(t, T(69, 0.6), 1.2, E.p2io);
  return (
    <>
      <Kin t={t} from={T(68)} parts={['기존의 문들은 ', { em: '많이 닫혔지만' }]} x={0} y={90} w={1920} size={64} center />
      {[0, 1, 2, 3].map((i) => <Door key={i} t={t} x={110 + i * 150} y={420 + (i % 2) * 20} w={120} h={230} close={1} lockAt={T(68, 0.6 + i * 0.15)} />)}
      <Rays t={t} x={64.6} y={49} o={0.9 * o} />
      <AbsoluteFill style={{ opacity: o * 0.8, background: 'radial-gradient(circle at 1240px 520px, rgba(255,226,170,.55), rgba(255,226,170,0) 420px)' }} />
      <div style={mx(up(t, T(69), 50))}><Door t={t} x={1060} y={250} w={360} h={560} close={1} open={o} gold /></div>
      <Ring t={t} at={T(69, 1.6)} x={1240} y={530} r={560} color={GOLD} />
      <Kin t={t} from={T(70)} parts={['3시간 만에 ', { em: '새로운 문' }, '을\n직접 열었습니다']} x={100} y={690} size={60} />
    </>
  );
};

const Smile: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Chip t={t} from={T(71)} x={90} y={90} text="세무학과 학생" icon="student" size={42} />
      <Chip t={t} from={T(72)} x={90} y={200} text="너무 밝게 웃으면서" icon="sparkle" size={42} />
      <Quote t={t} from={T(73)} x={96} y={350} w={980} size={64} text={<>진짜 <span className="gold">재미있었고</span><br /><span className="gold">유익했어요!</span></>} />
      {[0, 1, 2].map((i) => <div key={i} style={{ ...at(1000 + i * 70, 330 - i * 40), ...mx(pop(t, T(73, 0.8 + i * 0.2)), bob(t, `ht${i}`, 10)) }}><Icon name="heart" color={CORAL} size={60 + i * 10} /></div>)}
    </>
  );
};

const Business: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Head t={t} from={T(74)} parts={['새로운 ', { em: '세무 지식' }, '이 생길 때마다']} size={64} />
      <FlowRow t={t} x={96} y={250} nodeW={310} gapW={80} size={44} h={160} nodes={[
        { text: '세무 지식', at: T(75), icon: 'book' },
        { text: '앱', at: T(76), icon: 'app' },
        { text: '비즈니스?', at: T(77, 0.6), icon: 'rocket', hot: true },
      ]} />
      <Burst t={t} at={T(77, 0.8)} x={96 + 2 * 390 + 155} y={330} n={22} seed="biz" />
    </>
  );
};

const AtHome: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Chip t={t} from={T(78)} x={90} y={90} text="집에 가서도 혼자 해 볼 가능성" icon="house" size={44} />
      <div style={{ ...at(96, 200, 600, 70), ...mx(up(t, T(79), 20)) }}>
        <Bar x={0} y={20} w={560} h={30} v={barValue(t, [[T(79), 0.86, 1.2]])} />
        <div style={{ position: 'absolute', left: 580, top: 4, fontSize: 46, fontWeight: 900, color: GOLD }}>큼</div>
      </div>
      <Kin t={t} from={T(80)} parts={['그 ', { em: '반짝이는 눈' }, '을\n잊을 수 없습니다']} x={96} y={360} size={84} />
      <Sparkles t={t} at={T(80, 0.6)} x={440} y={420} spread={360} seed="home" />
    </>
  );
};

const Reward: El = ({ T }) => {
  const t = useT();
  const v = barValue(t, [[T(81, 0.6), 0.6, 1], [T(83), 1, 1]]);
  return (
    <>
      <Head t={t} from={T(81)} parts={['다수의 학생들이 ', { em: '눈을 반짝' }]} size={64} y={80} />
      <P s={{ ...at(96, 620, 760, 220), padding: '26px 36px', ...mx(up(t, T(81, 0.4), 30)) }}>
        {([['재미', T(81, 0.6), v], ['보람', T(83), prog(t, T(83), 1.2, E.p2io)]] as [string, number, number][]).map(([w, f, val], i) => (
          <div key={w} style={{ position: 'relative', height: 70, display: 'flex', alignItems: 'center', gap: 24, marginTop: i ? 20 : 0, opacity: prog(t, f, 0.3) }}>
            <span style={{ width: 90, fontSize: 42, fontWeight: 900 }}>{w}</span>
            <div style={{ position: 'relative', flex: 1, height: 30 }}><Bar x={0} y={0} w={560} h={30} v={val} color={i ? CORAL : GOLD} /></div>
          </div>
        ))}
      </P>
      <StampText t={t} from={T(83, 1.2)} text="정말 큰 보람" x={980} y={680} size={74} rot={-6} color={GOLD} />
    </>
  );
};

const Anyone: El = ({ T }) => {
  const t = useT();
  const a = T(84), b = T(85), c = T(86);
  return (
    <>
      <Kin t={t} from={a} parts={['앱을 만들 수 있는 사람']} x={0} y={100} w={1920} size={66} center />
      <P s={{ ...at(220, 280, 640, 380), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, ...mx(up(t, a + 0.4, 40)) }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: SOFT }}>예전</div>
        <Icon name="code" size={110} color={SOFT} />
        <div style={{ position: 'relative', width: 480, height: 72 }}><Strike t={t} from={a + 0.5} strikeAt={b + 0.4} text="개발자 · 엔지니어만" size={52} x={0} y={0} /></div>
      </P>
      <P s={{ ...at(1060, 280, 640, 380), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, borderColor: GOLD, boxShadow: `0 0 60px ${GOLD}55`, ...mx(up(t, b, 40)) }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: GOLD }}>지금</div>
        <Icon name="student" size={110} />
        <div style={{ fontSize: 60, fontWeight: 900 }}>학생들도!</div>
      </P>
      <div style={{ ...at(0, 720, 1920), display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 46px 22px', borderRadius: 20, background: GOLD, color: '#1a1420', fontSize: 58, fontWeight: 900, whiteSpace: 'nowrap', ...mx(stamp(t, c + 0.8)) }}>
          <Icon name="sparkle" color="#1a1420" size={62} />AI로 충분히 만드는 시대
        </div>
      </div>
      <Burst t={t} at={c + 0.85} x={960} y={780} n={28} seed="any" />
    </>
  );
};

const Grow: El = ({ T }) => {
  const t = useT();
  const bars: [string, number, number][] = [['처음 만든 앱', 0.3, T(87, 0.8)], ['고치고', 0.55, T(87, 1.5)], ['또 발전', 0.8, T(87, 2.2)]];
  return (
    <>
      <Head t={t} from={T(87)} parts={['계속 ', { em: '발전' }, '시키다 보면']} size={66} />
      <div style={{ ...at(120, 220, 760, 520) }}>
        {bars.map(([w, h, f], i) => (
          <div key={w} style={{ position: 'absolute', left: i * 190, bottom: 60, width: 140, height: 440 * h * prog(t, f, 0.6, E.p3), borderRadius: '12px 12px 0 0', background: `rgba(242,197,114,${0.45 + i * 0.2})`, boxShadow: `0 0 26px ${GOLD}66` }}>
            <div style={{ position: 'absolute', left: -20, right: -20, bottom: -54, textAlign: 'center', fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap', opacity: prog(t, f, 0.3) }}>{w}</div>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 3 * 190 - 10, bottom: 60, width: 200, height: 460 * prog(t, T(88, 0.6), 0.8, E.p3), borderRadius: '12px 12px 0 0', background: GOLD, boxShadow: `0 0 50px ${GOLD}` }} />
        <div style={{ position: 'absolute', left: 3 * 190 - 40, top: -10 }}><Chip t={t} from={T(88, 1.3)} x={0} y={0} text="비즈니스" icon="rocket" size={44} enter={(a, b) => pop(a, b)} /></div>
      </div>
    </>
  );
};

const NoReason: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Chip t={t} from={T(89)} x={90} y={90} text="다른 사람들도 그렇게 하는데" icon="users" size={44} />
      <Kin t={t} from={T(90)} parts={['우리 학생들은\n', { em: '못하란 법은 없다' }]} x={96} y={220} size={92} />
      <Burst t={t} at={T(90, 1.6)} x={600} y={400} n={24} seed="nr" />
    </>
  );
};

const Joy: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(91)} parts={['눈을 ', { em: '반짝반짝' }, '이며']} x={96} y={90} size={72} />
      <Chip t={t} from={T(92)} x={100} y={210} text="결과물을 신나서 이야기하던 학생들" icon="chat" size={42} />
      <div style={{ ...at(100, 330), display: 'flex', alignItems: 'center', gap: 20, padding: '20px 44px 24px', borderRadius: 20, background: GOLD, color: '#1a1420', fontSize: 58, fontWeight: 900, whiteSpace: 'nowrap', ...mx(stamp(t, T(93, 0.4))) }}>
        <Icon name="heart" color="#1a1420" size={62} />저도 너무너무 기쁩니다
      </div>
      <Burst t={t} at={T(93, 0.5)} x={450} y={380} n={26} seed="joy" />
    </>
  );
};

// ---------- 03 AI로 빌드하라 -----------------------------------------------------------
const AiEra: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Kin t={t} from={T(94)} parts={[{ em: 'AI 시대' }]} x={96} y={90} size={120} />
      <div style={{ ...at(100, 290), display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
        <div className="chip" style={{ fontSize: 50, ...mx(slide(t, T(95), -40)) }}><Icon name="wave" size={56} />많은 것들이 변하고 있고</div>
        <div className="chip" style={{ fontSize: 50, ...mx(slide(t, T(96), -40)) }}><Icon name="down" color={CORAL} size={56} /><span className="coral">많은 것들이 무너지고 있습니다</span></div>
      </div>
    </>
  );
};

const Build: El = ({ T }) => {
  const t = useT();
  const a = T(97), b = T(98), c = T(99), d = T(100);
  const p1 = fade(t, a - 0.1, c + 0.1);
  const letters = 'BUILD'.split('');
  return (
    <>
      <div style={{ opacity: p1 }}>
        <Kin t={t} from={a} parts={['AI를 ', { em: '질문에 답만 하는 챗봇' }, '으로 쓰면']} x={0} y={110} w={1920} size={64} center />
        <div style={{ ...at(560, 300, 800), display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ alignSelf: 'flex-end', padding: '18px 30px', borderRadius: 24, borderTopRightRadius: 6, background: GOLD, color: '#1a1420', fontSize: 42, fontWeight: 800, ...mx(up(t, a + 0.6, 20)) }}>이거 뭐야?</div>
          <div style={{ alignSelf: 'flex-start', padding: '18px 30px', borderRadius: 24, borderTopLeftRadius: 6, background: '#fff', color: '#1a1420', fontSize: 42, fontWeight: 700, ...mx(up(t, a + 1.2, 20)) }}>그건 이런 뜻이에요.</div>
        </div>
        <StampText t={t} from={b + 0.4} text="제대로 활용 못 함" x={660} y={600} size={70} rot={-5} />
      </div>
      <Kin t={t} from={c} parts={['AI로 무언가를 ', { em: '만들어 봐야' }, ' 합니다']} x={0} y={170} w={1920} size={74} center />
      <div style={{ ...at(0, 330, 1920), display: 'flex', justifyContent: 'center', gap: 18 }}>
        {letters.map((l, i) => {
          const { v, vel } = spr(t, d + 0.2 + i * 0.1, 0.45, 12);
          return <div key={l} style={{ fontSize: 300, fontWeight: 900, color: GOLD, letterSpacing: '-.02em', lineHeight: 1, textShadow: `0 0 60px ${GOLD}aa`, opacity: prog(t, d + 0.2 + i * 0.1, 0.1),
            transform: `translateY(${(1 - v) * -260}px) scale(${0.6 + 0.4 * v})`, filter: vel > 0.03 ? `blur(${Math.min(8, vel * 9).toFixed(1)}px)` : undefined }}>{l}</div>;
        })}
      </div>
      <Ring t={t} at={d + 0.8} x={960} y={480} r={760} color={GOLD} />
      <Burst t={t} at={d + 0.75} x={960} y={480} n={36} power={1.2} seed="build" />
    </>
  );
};

const Wrap: El = ({ T }) => {
  const t = useT();
  return (
    <>
      <Polaroid t={t} from={T(101, 0.2)} id="u14" x={1000} y={90} w={480} rot={-6} />
      <Polaroid t={t} from={T(101, 0.6)} id="u15" x={1380} y={180} w={440} rot={5} />
      <Polaroid t={t} from={T(102, 0.2)} id="u17" x={1060} y={450} w={480} rot={3} />
      <Polaroid t={t} from={T(103)} id="u11" x={1420} y={520} w={420} rot={-4} />
      <Kin t={t} from={T(101)} parts={['오늘 ', { em: '연성대 학생들' }, '은\nAI로 무언가를\n빌드해 봤습니다']} x={96} y={110} size={78} />
      <Chip t={t} from={T(103)} x={100} y={520} text="아마 굉장히 재미있었을 겁니다" icon="sparkle" size={42} />
      <Chip t={t} from={T(104)} x={100} y={630} text="집에서도 계속 해 보고 있을 것 같아요" icon="house" size={42} />
    </>
  );
};

const End: El = ({ T }) => {
  const t = useT();
  const a = T(106);
  return (
    <>
      <Hero t={t} from={T(105, 0.1)} x={740} y={110} h={430} />
      <Kin t={t} from={T(105, 0.3)} parts={['학생들도 ', { em: 'AI로 빌드' }, '하는 법을 배우면 좋습니다']} x={0} y={570} w={1920} size={66} center />
      <div style={{ ...at(0, 700, 1920), display: 'flex', justifyContent: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 46px 20px', borderRadius: 18, background: GOLD, color: '#1a1420', fontSize: 58, fontWeight: 900, ...mx(pop(t, a + 0.1)) }}><Icon name="thumb" color="#1a1420" size={64} />좋아요</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 46px 20px', borderRadius: 18, background: '#fff', color: '#1a1420', fontSize: 58, fontWeight: 900, ...mx(pop(t, a + 0.5)) }}><Icon name="bell" color="#1a1420" size={64} />구독</div>
      </div>
      <Burst t={t} at={a + 0.6} x={960} y={750} n={36} power={1.1} seed="end" />
      <Sparkles t={t} at={a + 1} x={760} y={400} spread={860} seed="end" />
    </>
  );
};

export const BEATS: Beat[] = [
  { name: '제목', from: 1, dim: 0.28, El: Title },
  { name: '지난 영상', from: 2, dim: 0.38, El: PrevVideo },
  { name: '수업 요청', from: 4, dim: 0.4, side: 'c', El: Request },
  { name: '여러 생각', from: 7, dim: 0.4, El: Thoughts },
  { name: '수능', from: 8, dim: 0.44, El: Exam },
  { name: 'AI 컨닝', from: 12, dim: 0.44, El: Cheat },
  { name: '세상은?', from: 14, dim: 0.5, side: 'c', El: World },
  { name: '무너짐', from: 15, dim: 0, side: 'c', El: Crumble },
  { name: '공식', from: 19, dim: 0.44, El: Formula },
  { name: '닫히는 문', from: 22, dim: 0.42, El: Closing },
  { name: '문들', from: 24, dim: 0, side: 'c', El: Doors },
  { name: '새로운 문', from: 26, dim: 0.42, El: NewDoor },
  { name: '수업 준비', from: 29, dim: 0.36, side: 'c', El: Prepare },
  { name: '전공', from: 31, dim: 0.42, El: Majors },
  { name: '할 수 있을까', from: 38, dim: 0.42, El: Doubt },
  { name: '할 수 있습니다', from: 44, dim: 0.3, side: 'c', El: Answer },
  { name: '3시간', from: 46, dim: 0.4, El: ThreeHours },
  { name: '재미있습니다', from: 50, dim: 0.42, side: 'c', El: Fun },
  { name: '간호 앱', from: 54, dim: 0, side: 'c', El: NurseApp },
  { name: '반짝이는 눈', from: 60, dim: 0.36, side: 'c', El: Shine },
  { name: '세무 앱', from: 63, dim: 0.44, El: TaxApps },
  { name: '새 문을 열다', from: 68, dim: 0, side: 'c', El: OpenDoor },
  { name: '유익했다', from: 71, dim: 0.46, El: Smile },
  { name: '비즈니스', from: 74, dim: 0.5, El: Business },
  { name: '집에서도', from: 78, dim: 0.42, El: AtHome },
  { name: '보람', from: 81, dim: 0.36, side: 'c', El: Reward },
  { name: '누구나', from: 84, dim: 0, side: 'c', El: Anyone },
  { name: '발전', from: 87, dim: 0.44, El: Grow },
  { name: '못하란 법', from: 89, dim: 0.46, El: NoReason },
  { name: '기쁩니다', from: 91, dim: 0.42, El: Joy },
  { name: 'AI 시대', from: 94, dim: 0.4, El: AiEra },
  { name: 'BUILD', from: 97, dim: 0, side: 'c', El: Build },
  { name: '정리', from: 101, dim: 0, side: 'c', El: Wrap },
  { name: '엔드카드', from: 105, dim: 0, side: 'c', El: End },
];

// 카메라가 펀치 인 하는 순간 (말이 가장 센 곳)
export const KICKS = ({ T }: T2): number[] => [T(6, 0.5), T(11, 0.4), T(18, 0.5), T(25, 0.3), T(45, 0.3), T(52), T(59), T(67, 1.0), T(69, 1.6), T(83, 1.2), T(86, 0.8), T(90, 0.8), T(100, 0.75)];

// 작은 효과음. 목소리를 가리지 않도록 아주 작게 넣는다.
export const SFX = ({ T }: T2): Sfx[] => {
  const pops = [T(3, 0.3), T(4), T(4, 1.6), T(9), T(10), T(20), T(20, 1.1), T(27), T(28), T(31), T(32), T(33), T(34), T(35), T(41), T(55), T(56), T(57), T(58), T(67, 0.3), T(67, 1.0),
    T(75), T(76), T(87, 0.8), T(87, 1.5), T(87, 2.2), T(101, 0.2), T(101, 0.6), T(102, 0.2), T(103), T(106, 0.1), T(106, 0.5)];
  const dings = [T(6, 0.5), T(21), T(45), T(49), T(52), T(59, 1.6), T(70), T(77, 0.6), T(83, 1.2), T(86, 0.8), T(93, 0.4), T(100, 0.75)];
  return [
    ...pops.map((at0) => ({ at: at0, name: 'pop' as const, vol: 0.13 })),
    ...dings.map((at0) => ({ at: at0, name: 'ding' as const, vol: 0.16 })),
  ];
};
