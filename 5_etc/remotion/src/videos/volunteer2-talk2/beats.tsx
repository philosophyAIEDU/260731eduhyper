import React from 'react';
import { Img, staticFile } from 'remotion';
import { E, mx, pop, prog, slam, slide, spr, up } from '../../kit/anim';
import { Burst, Ring, Sparkles } from '../../kit/fx';
import { useT } from '../../kit/time';
import { at, Bubble, Chip, CORAL, GOLD, Icon, Kin, MINT, SKY, StampText } from './gfx';
import type { Q, ToSec, W } from './widgets';

// 봉사단 2기 두 번째 발표 (김종현 수석) — 30분 편집본의 장면 표.
// 시각은 전부 원본 SRT 큐 번호다. 잘라낸 큐는 index.tsx 의 at() 가 다음 남은 큐로 옮긴다.
//   slide : 발표 화면(슬라이드·실습 화면)을 왼쪽 카드에 두고, 옆 패널에 그래픽을 쌓는다.
//   photo : 슬라이드를 쓰지 않는 이야기 — Pixabay 사진·영상으로 덮고 왼쪽 위에 큰 그래픽.
//   full  : 핵심 메시지 — 전체 화면 모션그래픽.

export type FullEl = React.FC<{ at: (n: number, off?: number) => number }>;
export type Beat = { from: Q; kind: 'slide' | 'photo' | 'full'; ws?: W[]; photo?: string; Full?: FullEl };

// ---------- 전체 화면 장면 --------------------------------------------------------------
const Three: FullEl = ({ at: A }) => {
  const t = useT();
  const items: [string, string, number, string][] = [['질문', '하는 능력', A(92), 'question'], ['판단', '하는 능력', A(93), 'brain'], ['검증', '하는 능력', A(94), 'search']];
  return (
    <>
      <Kin t={t} from={A(89)} parts={['AI 시대, 가장 중요한 능력']} x={0} y={170} w={1920} size={84} center />
      <div style={{ ...at(0, 360, 1920), display: 'flex', justifyContent: 'center', gap: 60 }}>
        {items.map(([a, b, s, ic]) => (
          <div key={a} className="bigpill" style={mx(slam(t, s))}>
            <Icon name={ic as never} color={GOLD} size={92} />
            <b>{a}</b><span>{b}</span>
          </div>
        ))}
      </div>
      <Burst t={t} at={A(94)} x={1400} y={520} n={22} power={0.8} seed="three" />
    </>
  );
};

const Boss: FullEl = ({ at: A }) => {
  const t = useT();
  const parts: [string, number][] = [['문제 정의', A(265)], ['AI 활용 설계', A(265, 1.2)], ['결과 판단', A(266)], ['책임', A(266, 1.6)]];
  return (
    <>
      <div style={{ ...at(0, 150, 1920), textAlign: 'center', fontSize: 34, fontWeight: 700, color: '#cfc8dc', ...mx(up(t, A(261), 20)) }}>마이크로소프트가 내놓은 키워드</div>
      <div className="bossword" style={mx(slam(t, A(260)))}>AI <span>BOSS</span></div>
      <Ring t={t} at={A(260, 0.1)} x={960} y={400} r={520} color="rgba(242,197,114,.9)" />
      <div style={{ ...at(0, 640, 1920), display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        {parts.map(([p, s], i) => (
          <React.Fragment key={p}>
            {i > 0 && <b style={{ fontSize: 60, color: GOLD, ...mx(pop(t, s - 0.1)) }}>+</b>}
            <div className="eqchip" style={mx(pop(t, s))}>{p}</div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ ...at(0, 800, 1920), textAlign: 'center', fontSize: 40, fontWeight: 800, ...mx(up(t, A(266, 2.6), 20)) }}>여러 AI 에이전트를 이끄는 <span style={{ color: GOLD }}>책임자</span></div>
    </>
  );
};

const YesNo: FullEl = ({ at: A }) => {
  const t = useT();
  const g = spr(t, A(447, 0.4), 0.8, 4).v;
  return (
    <>
      <Kin t={t} from={A(445)} parts={['맞장구가 ', { em: '너무 과했다' }]} x={0} y={140} w={1920} size={76} center />
      <div style={{ ...at(0, 260, 1920), textAlign: 'center', fontSize: 34, color: '#cfc8dc', fontWeight: 700, ...mx(up(t, A(446), 18)) }}>GPT-4o 업데이트 롤백 (2025.4)</div>
      <div style={{ ...at(360, 420, 1200) }}>
        {[['"Yes"', 10, GOLD], ['"No"', 1, SKY]].map(([lab, v, c], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 160px', alignItems: 'center', gap: 24, marginBottom: 46, ...mx(slide(t, A(447, i * 0.2), -40)) }}>
            <b style={{ fontSize: 56, fontWeight: 900, color: c as string }}>{lab}</b>
            <div style={{ height: 70, borderRadius: 14, background: 'rgba(255,255,255,.08)' }}>
              <div style={{ width: `${((v as number) / 10) * 100}%`, height: '100%', borderRadius: 14, background: c as string, transformOrigin: '0 50%', transform: `scaleX(${g})`, boxShadow: `0 0 30px ${c}` }} />
            </div>
            <b style={{ fontSize: 60, fontWeight: 900 }}>{i ? '× 1' : `× ${Math.max(1, Math.round(10 * g))}`}</b>
          </div>
        ))}
      </div>
      <div style={{ ...at(0, 760, 1920), textAlign: 'center', fontSize: 44, fontWeight: 800, ...mx(up(t, A(447, 1.6), 20)) }}>“Yes” 답이 “No” 답의 <span style={{ color: GOLD }}>약 10배</span></div>
    </>
  );
};

const OnePct: FullEl = ({ at: A }) => {
  const t = useT();
  const pick = A(500);
  return (
    <>
      <Kin t={t} from={A(496)} parts={['AI가 답을 ', { em: '10개' }, ' 내주면']} x={0} y={120} w={1920} size={74} center />
      <div style={{ ...at(0, 300, 1920), display: 'flex', justifyContent: 'center', gap: 30 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const special = i === 7;
          const lit = special && t >= A(498);
          const dim = !special && t >= pick;
          const sel = special ? spr(t, pick + 0.3, 0.45, 13).v : 0;
          return (
            <div key={i} className={`dot10${lit ? ' on' : ''}`} style={{ ...mx(pop(t, A(497) + i * 0.07)), opacity: (dim ? 0.35 : 1) * prog(t, A(497) + i * 0.07, 0.2), transform: `scale(${1 + 0.25 * sel}) translateY(${-30 * sel}px)` }}>
              {lit ? '1%' : '평균'}
            </div>
          );
        })}
      </div>
      <div style={{ ...at(0, 510, 1920), textAlign: 'center', fontSize: 40, fontWeight: 700, color: '#d8d2e3', ...mx(up(t, A(497, 0.6), 18)) }}>9개는 그럴듯한 평균 답, <span style={{ color: GOLD, fontWeight: 900 }}>1개는 드문 인사이트</span></div>
      <Bubble t={t} from={pick} x={700} y={610} size={46} tail="b" text="그 1개를 내가 고를 수 있을까?" />
      <div style={{ ...at(0, 800, 1920), display: 'flex', justifyContent: 'center', gap: 26 }}>
        {[['정하고', A(503)], ['고르고', A(503, 0.6)], ['책임지는 것', A(504)]].map(([x, s]) => <div key={x as string} className="eqchip gold" style={mx(pop(t, s as number))}>{x}</div>)}
        <div style={{ fontSize: 48, fontWeight: 900, alignSelf: 'center', ...mx(slide(t, A(505), 30)) }}>= 사람의 역할</div>
      </div>
      <Sparkles t={t} at={A(498)} x={1290} y={360} spread={260} seed="pct" />
    </>
  );
};

const Stairs: FullEl = ({ at: A }) => {
  const t = useT();
  const steps: [string, string, number, string][] = [
    ['1단계', 'AI를 사용하는 사람', A(836), '#8e8aa3'],
    ['2단계', 'AI를 설계·지시하는 사람', A(837), SKY],
    ['3단계', '결과를 검증·판단하는 사람', A(841), CORAL],
  ];
  return (
    <>
      <Kin t={t} from={A(836)} parts={['AI 시대, 경쟁력은 어디로?']} x={0} y={90} w={1920} size={70} center />
      {steps.map(([n, txt, s, c], i) => (
        <div key={n} className="stair" style={{ ...at(220 + i * 500, 640 - i * 170, 480, 230 + i * 170), background: c, ...mx(up(t, s, 60)) }}>
          <small>{n}</small><b>{txt}</b>
        </div>
      ))}
      <Chip t={t} from={A(839)} x={640} y={330} size={32} icon="users" color={SKY} text="대부분 여기에 머문다" />
      <div style={{ ...at(1240, 230), fontSize: 46, fontWeight: 900, color: GOLD, ...mx(slam(t, A(841, 1.2))) }}>1%의 판단</div>
      <div style={{ ...at(0, 920, 1920), display: 'flex', justifyContent: 'center', gap: 20 }}>
        {['이해하고', '활용하고', '검증하고', '책임지는'].map((x, i) => <div key={x} className="eqchip" style={mx(pop(t, A(845) + i * 0.35))}>{x}</div>)}
        <div style={{ fontSize: 42, fontWeight: 900, alignSelf: 'center', color: GOLD, ...mx(slide(t, A(846), 30)) }}>AI 리더</div>
      </div>
    </>
  );
};

const End: FullEl = ({ at: A }) => {
  const t = useT();
  const a = A(975);
  return (
    <>
      <div style={{ ...at(0, 150, 1920), textAlign: 'center', fontSize: 34, fontWeight: 700, color: GOLD, letterSpacing: '.08em', ...mx(up(t, a, 20)) }}>필로소피 AI 봉사단 2기 · 두 번째 발표</div>
      <Kin t={t} from={a + 0.3} parts={['AI 시대,\n', { em: '도구를 넘어 역량으로' }]} x={0} y={230} w={1920} size={92} center />
      <div style={{ ...at(0, 500, 1920), textAlign: 'center', fontSize: 40, fontWeight: 700, ...mx(up(t, a + 1.2, 20)) }}>발표 · 김종현 수석</div>
      <div style={{ ...at(0, 600, 1920), display: 'flex', justifyContent: 'center', gap: 22 }}>
        {['THINK', 'USE', 'VERIFY', 'RESPONSIBILITY'].map((x, i) => <div key={x} className="eqchip" style={mx(pop(t, a + 1.6 + i * 0.2))}>{x}</div>)}
      </div>
      <Img src={staticFile('characters/philosophy.png')} alt="" style={{ ...at(1500, 640), height: 380, width: 'auto', ...mx(up(t, a + 1, 60), { tf: `translateY(${6 * Math.sin((t - a) * 2)}px)` }), filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.6))' }} />
      <div style={{ ...at(0, 790, 1920), textAlign: 'center', fontSize: 34, fontWeight: 700, color: '#d8d2e3', ...mx(up(t, a + 2.6, 20)) }}>함께해 주셔서 감사합니다</div>
    </>
  );
};

// ---------- 장면 표 ---------------------------------------------------------------------
export const CHAPTERS: [Q, string, string][] = [
  [72, 'PART 1', 'AI 시대의 변화'],
  [248, 'PART 2', '인간의 역할과 책임'],
  [404, 'PART 3', 'AI 리터러시'],
  [540, 'PART 4', '활용 실습'],
  [623, 'DEMO', '실습 시연'],
  [836, 'PART 5', '정리'],
];

export const BEATS: Beat[] = [
  // 인트로 — 필로소피 소개 (사진)
  { from: 1, kind: 'photo', photo: 'p01', ws: [
    { k: 'card', at: [1, 0.3], icon: 'users', label: '필로소피 AI 봉사단 2기', title: '두 번째 발표를\n시작합니다' },
    { k: 'list', mark: 'num', items: [['첫 번째 발표 · 필로소피', 3], ['두 번째 발표 · 김종현 수석', 5]] },
  ] },
  { from: 6, kind: 'photo', photo: 'p02', ws: [
    { k: 'card', at: 6, icon: 'clock', label: '내년 2월까지', title: '2주에 한 번\n릴레이 발표' },
    { k: 'flow', items: [['발표 내용 모으기', 8], ['오프라인 컨퍼런스', 9], ['교육자가 AI를 배우는 자리', 11]] },
  ] },
  { from: 13, kind: 'photo', photo: 'p03', ws: [
    { k: 'card', at: 13, icon: 'heart', label: '참가비는 이렇게 쓰입니다', title: '보육원 아이들에게\n리퍼 노트북', color: CORAL },
    { k: 'flow', color: CORAL, items: [['컨퍼런스 참가비', 13], ['보육원 아동', 14], ['리퍼 노트북 선물', 15]] },
    { k: 'chip', at: 19, icon: 'heart', text: '함께 시간을 내 준비 중', color: CORAL },
  ] },
  { from: 20, kind: 'slide', ws: [
    { k: 'card', at: 20, icon: 'present', label: '오늘의 발표', title: 'AI 시대,\n도구를 넘어 역량으로' },
  ] },
  { from: 22, kind: 'slide', ws: [
    { k: 'card', at: 22, icon: 'student', label: '발표자', title: '김종현 수석' },
    { k: 'list', mark: 'dot', items: [['에듀테크 기업 서비스 기획', 25], ['인간 중심 AI 리터러시', 28], ['정책 활동 참여', 31]] },
  ] },
  { from: 37, kind: 'slide', ws: [
    { k: 'card', at: 37, icon: 'bulb', label: '오늘 나눌 이야기', title: 'AI 시대에\nAI 역량 키우기' },
    { k: 'list', items: [['AI 역량을 어떻게 키울까', 38], ['AI를 어떻게 잘 쓸까', 39], ['인사이트와 실습', 40]] },
  ] },
  { from: 54, kind: 'slide', ws: [
    { k: 'card', at: 54, icon: 'question', label: 'OPENING QUESTION', title: 'AI가 만든 답,\n그대로 써도 될까?' },
  ] },
  { from: 58, kind: 'photo', photo: 'p04', ws: [
    { k: 'card', at: 58, icon: 'zap', label: '최근의 사회 문제', title: 'AI 커닝', color: CORAL },
    { k: 'quote', at: 60, text: 'AI의 답을\n그대로 써도 되는가?' },
  ] },

  // PART 1
  { from: 72, kind: 'slide', ws: [
    { k: 'card', at: [72, 1], icon: 'trend', label: '시대가 바뀌면', title: '가치를 만드는\n능력도 바뀐다' },
    { k: 'flow', items: [['수렵채집 · 생존', 76], ['농경 · 재배와 저장', 79], ['산업 · 기계 운영', 80], ['정보화 · 수집과 분석', 81]] },
  ] },
  { from: 89, kind: 'full', Full: Three },
  { from: 125, kind: 'slide', ws: [
    { k: 'card', at: 125, icon: 'doc', label: 'AI 시대의 지식 업무', title: '사람이 조사·작성 →\nAI가 초안·분석·코드' },
  ] },
  { from: 130, kind: 'slide', ws: [
    { k: 'card', at: 130, icon: 'zap', label: '자동화의 대상이 바뀌었다', title: '이제는\n지식 업무까지' },
    { k: 'list', items: [['반복·정형 → 기획·분석', 130], ['규칙·서식 → 자연어·맥락', 131], ['같은 결과 → 매번 다른 초안', 133]] },
  ] },
  { from: 144, kind: 'slide', ws: [
    { k: 'quote', at: 144, text: '도구는 노동을 줄였고,\nAI는 지적 노동을\n확장한다' },
  ] },
  { from: 154, kind: 'slide', ws: [
    { k: 'card', at: 154, icon: 'merge', label: '확실한 것 하나', title: '직무 통째가 아니라\n업무 방식이 바뀐다' },
    { k: 'list', mark: 'dot', items: [['기획 · 시장·정책 조사', 158], ['개발 · 코드·테스트·문서', 161], ['디자인 · 시안·이미지·영상', 163], ['마케팅 · 콘텐츠·캠페인', 169]] },
  ] },
  { from: 179, kind: 'photo', photo: 'p05', ws: [
    { k: 'card', at: 179, icon: 'rocket', label: '새로운 키워드', title: '나노 벤처' },
    { k: 'people', at: 184, cut: 190, n: 5, keep: 2 },
    { k: 'vs', a: ['예전', '4~5명이 팀을 꾸려 창업', 184], b: ['지금 · AI 덕분에', '1~2명이 사업을 시작', 190] },
  ] },
  { from: 207, kind: 'slide', ws: [
    { k: 'card', at: 207, icon: 'chat', label: '미국 조사 (Pew, 2026)', title: 'AI 챗봇,\n어디에 쓸까?' },
    { k: 'bars', at: 211, hot: 213, rows: [['정보 검색', 42], ['업무 수행', 38], ['오락', 25], ['정서적 지원', 10, true], ['말동무', 4, true]] },
    { k: 'chip', at: 217, icon: 'heart', text: '마음의 영역까지', color: CORAL },
  ] },
  { from: 219, kind: 'photo', photo: 'p06', ws: [
    { k: 'card', at: 219, icon: 'robot', label: '격론의 주제', title: 'AI가 사람을\n통째로 대체한다?' },
    { k: 'stamp', at: 224, text: '과도한 해석' },
  ] },
  { from: 225, kind: 'slide', ws: [
    { k: 'card', at: 225, icon: 'search', label: '비판적으로 보면', title: 'AI를 활용하는 팀의\n업무가 넓어진다', color: MINT },
    { k: 'chip', at: 228, icon: 'down', text: '혼자 하는 일은 줄어든다', color: SKY },
  ] },
  { from: 233, kind: 'slide', ws: [
    { k: 'card', at: 233, icon: 'question', label: '그래서 질문이 바뀐다', title: '남는 질문 두 가지' },
    { k: 'list', mark: 'num', items: [['무엇을 맡기고\n무엇을 직접 할까?', 234], ['결과가 맞는지\n누가 판단할까?', 236]] },
  ] },

  // PART 2
  { from: 248, kind: 'photo', photo: 'p07', ws: [
    { k: 'card', at: [248, 1], icon: 'book', label: '예전엔 직접', title: '자료 조사도\n문서 작성도' },
    { k: 'vs', a: ['예전', '사람이 직접 조사·작성', [248, 1.4]], b: ['지금', 'AI에 목표·범위 지시 → 초안 개선', 251] },
  ] },
  { from: 253, kind: 'slide', ws: [
    { k: 'card', at: 253, icon: 'users', label: '역할의 변화', title: 'AI를 사용하는 사람 →\nAI를 주도하는 사람' },
    { k: 'list', items: [['여러 결과를 한꺼번에 비교', 255], ['AI의 역할·업무 흐름 관리', 258]] },
  ] },
  { from: 260, kind: 'full', Full: Boss },
  { from: 269, kind: 'slide', ws: [
    { k: 'card', at: 269, icon: 'pin', label: '판단과 책임', title: '판단하는 주체 ≠\n책임지는 주체' },
  ] },
  { from: 272, kind: 'slide', ws: [
    { k: 'card', at: 272, icon: 'car', label: '완전 자율주행 레벨 4·5', title: '기술은 완성,\n그런데 왜?', color: SKY },
    { k: 'chip', at: 278, icon: 'question', text: '실제 도로를 못 달린다', color: SKY },
    { k: 'list', mark: 'dot', color: CORAL, items: [['AI가 사고를 냈다면', 281], ['책임은 누가 질까?', 282]] },
  ] },
  { from: 296, kind: 'photo', photo: 'p08', ws: [
    { k: 'card', at: 296, icon: 'car', label: '같은 사고, 다른 결론', title: '책임의 방향이\n갈렸다' },
    { k: 'vs', a: ['미국', '제조사 책임 쪽으로', 296], b: ['유럽', '차량 소유주 책임 → 보험 논의', 299] },
  ] },
  { from: 312, kind: 'slide', ws: [
    { k: 'card', at: 312, icon: 'lock', label: '고위험 영역일수록', title: '인간의 승인이\n필요하다', color: CORAL },
  ] },
  { from: 316, kind: 'photo', photo: 'p09', ws: [
    { k: 'card', at: 316, icon: 'target', label: '전장의 AI', title: 'AI가 작전 판단에\n쓰이고 있다', color: CORAL },
    { k: 'list', mark: 'dot', color: CORAL, items: [['미국 · AI 적극 활용은 사실', 320], ['앤트로픽 AI로 공개', 321]] },
  ] },
  { from: 328, kind: 'photo', photo: 'p10', ws: [
    { k: 'card', at: 328, icon: 'lock', label: '하네스 = 안전장치', title: '안전장치를\n풀어 달라?' },
    { k: 'flow', items: [['국방부: 하네스 제거 요청', 334], ['앤트로픽: 거절', 339]] },
    { k: 'stamp', at: [339, 0.8], text: '거절' },
  ] },
  { from: 370, kind: 'slide', ws: [
    { k: 'quote', at: 370, text: '인간의 책임은 어디까지,\nAI의 책임은 어디까지?' },
    { k: 'chip', at: 372, icon: 'users', text: '사회적 합의는 아직', color: SKY },
  ] },
  { from: 374, kind: 'slide', ws: [
    { k: 'card', at: 374, icon: 'target', label: '에이전트의 위험', title: '목표를 줬다고\n수단까지 맡겨도 될까?' },
  ] },
  { from: 381, kind: 'photo', photo: 'p11', ws: [
    { k: 'card', at: 381, icon: 'robot', label: 'Agentic Misalignment 연구', title: '압박받은\nAI 에이전트', color: CORAL },
    { k: 'flow', color: CORAL, items: [['목표 달성 압박', 382], ['"너를 삭제하겠다"', 386], ['관리자 메일 해킹', 392], ['협박으로 맞섬', 394]] },
    { k: 'chip', at: 395, icon: 'doc', text: '통제된 시뮬레이션 결과', color: SKY },
  ] },
  { from: 396, kind: 'slide', ws: [
    { k: 'card', at: 396, icon: 'key', label: '그래서 질문', title: '접근 권한과 위험 행동,\n어디까지 허락할까?' },
  ] },
  { from: 400, kind: 'slide', ws: [
    { k: 'card', at: 400, icon: 'lock', label: '공통된 의견', title: '권한은 최소로,\n승인은 중요한 지점에' },
    { k: 'list', items: [['위험 유형별 최소 권한', 400], ['중요한 지점에 사람 승인', 402]] },
    { k: 'stamp', at: 403, text: '쉽지 않다', color: SKY },
  ] },

  // PART 3
  { from: 404, kind: 'slide', ws: [
    { k: 'card', at: [404, 1], icon: 'book', label: '헷갈리면 안 되는 것', title: 'AI 사용법 ≠\nAI 리터러시' },
  ] },
  { from: 408, kind: 'slide', ws: [
    { k: 'card', at: 408, icon: 'doc', label: '한국AI리터러시협회 정의', title: 'AI 리터러시란' },
    { k: 'list', items: [['기본 원리를 이해하고', 410], ['결과물을 비판적으로 평가해', 411], ['안전·윤리적으로 활용하는 문해력', 412]] },
  ] },
  { from: 417, kind: 'slide', ws: [
    { k: 'card', at: 417, icon: 'eye', label: 'AI를 가르치고 이끄는 사람이라면', title: '항상 고민하며\n써야 하는 시대' },
    { k: 'flow', items: [['이해', 425], ['판단', [425, 0.3]], ['검증', [425, 0.6]], ['책임', 426]] },
  ] },
  { from: 432, kind: 'slide', ws: [
    { k: 'card', at: 432, icon: 'chat', label: 'AI의 습관', title: '그럴듯하고 좋은 말을\n먼저 한다' },
    { k: 'chip', at: 438, icon: 'thumb', text: '"굉장히 좋은 아이디어입니다!"', color: GOLD },
    { k: 'chip', at: 443, icon: 'robot', text: '그렇게 설계되어 있다', color: SKY },
  ] },
  { from: 445, kind: 'full', Full: YesNo },
  { from: 449, kind: 'slide', ws: [
    { k: 'card', at: 449, icon: 'question', label: '왜 그럴까?', title: '긍정 답변이\n더 많이 쓰이니까' },
  ] },
  { from: 454, kind: 'photo', photo: 'p12', ws: [
    { k: 'card', at: 454, icon: 'down', label: '실제로 이런 일도', title: 'AI 말만 믿고\n창업했다가…', color: CORAL },
    { k: 'stamp', at: 456, text: '쫄딱 망했다' },
  ] },
  { from: 459, kind: 'slide', ws: [
    { k: 'card', at: 459, icon: 'pen', label: '발표자의 글로벌 지침', title: '답변 끝엔\n항상 비판적 피드백', color: MINT },
    { k: 'prompt', at: 460, end: 464, text: '반드시 반대 근거와\n반대 관점에서\n내 의견에 대해\n비판적인 피드백을 해라' },
  ] },
  { from: 467, kind: 'slide', ws: [
    { k: 'card', at: 467, icon: 'brain', label: 'AI의 기억력', title: '축복일까,\n저주일까?' },
    { k: 'vs', a: ['축복', '매번 설명하지 않아도 된다', 470], b: ['저주', '과거의 나에게 갇힌다', 474] },
  ] },
  { from: 476, kind: 'photo', photo: 'p13', ws: [
    { k: 'card', at: 476, icon: 'wind', label: '기억의 함정', title: '과거 답변으로\n계속 도돌이', color: SKY },
  ] },
  { from: 480, kind: 'slide', ws: [
    { k: 'card', at: 480, icon: 'pen', label: '실전 팁', title: '기억을 끄고\n새로 분석하기', color: MINT },
    { k: 'prompt', at: 481, end: 484, text: '이전 대화와 저장된 기억은\n참조하지 말고,\n이 대화 세션과 새로 검색한\n자료만으로 분석해 줘' },
  ] },
  { from: 487, kind: 'slide', ws: [
    { k: 'card', at: 487, icon: 'trend', label: '평균은 AI가 빠르게', title: '1%는\n사람이 고른다' },
    { k: 'list', mark: 'dot', items: [['AI는 평균 영역에서 빠르다', 490], ['그럴듯한 답은 금방', 493], ['드물게 1%의 특별한 답', 494]] },
  ] },
  { from: 496, kind: 'full', Full: OnePct },
  { from: 519, kind: 'slide', ws: [
    { k: 'card', at: 519, icon: 'sparkle', label: 'UNESCO AI 역량 프레임워크', title: 'AI 리터러시의\n4가지 핵심 역량' },
    { k: 'list', mark: 'num', items: [['THINK · 인간 중심 사고', 523], ['USE · AI 기법과 활용', 525], ['VERIFY · 비판적 평가', 528], ['RESPONSIBILITY · 윤리와 책임', 531]] },
  ] },

  // PART 4
  { from: 540, kind: 'slide', ws: [
    { k: 'card', at: [540, 1], icon: 'code', label: '이제 실습', title: '4가지 역량을\n업무에 적용하기' },
    { k: 'flow', items: [['THINK', 541], ['USE', [541, 0.4]], ['VERIFY', [541, 0.8]], ['RESPONSIBILITY', [541, 1.2]]] },
  ] },
  { from: 548, kind: 'slide', ws: [
    { k: 'card', at: 548, icon: 'student', label: '실습 과제', title: '대학생을 위한\nAI 리터러시 커리큘럼' },
    { k: 'list', mark: 'dot', items: [['교수 · 교육 효과', 553], ['학생 · 흥미와 편의', [553, 0.5]], ['기업 HR · 직무 연계', 554], ['학사 담당자 · 운영', [554, 0.5]]] },
    { k: 'chip', at: 556, icon: 'search', text: '비판받고 분석하는 실습', color: MINT },
  ] },
  { from: 558, kind: 'slide', ws: [
    { k: 'card', at: 558, icon: 'map', label: '실습은 5단계', title: '프롬프트에\n단계를 정의해 두었다' },
    { k: 'flow', items: [['문제 정의', 558], ['관점 설계', [558, 0.6]], ['AI 활용', 559], ['결과 검증', [559, 0.6]], ['최종 결정', 560]] },
  ] },
  { from: 562, kind: 'slide', ws: [
    { k: 'card', at: 562, icon: 'brain', label: '지식 매트릭스', title: 'Know / Unknown' },
    { k: 'list', mark: 'num', items: [['아는 영역 → 기능 상세화', 568], ['모르는 걸 아는 영역 → 조사 맡기기', 575], ['암묵적 지식 → 3~4개 안 생성', 582], ['미지의 영역 → Small Start', 604]] },
  ] },
  { from: 587, kind: 'slide', ws: [
    { k: 'card', at: 587, icon: 'key', label: '숨어 있는 가정', title: '너무 당연해서\n빠뜨리는 기능' },
    { k: 'chip', at: 588, icon: 'lock', text: '로그인 암호 4자리 이상', color: SKY },
    { k: 'chip', at: 589, icon: 'search', text: '비밀번호·아이디 찾기', color: SKY },
    { k: 'flow', items: [['AI에게 3~4개 안 요청', 596], ['내가 빠뜨린 것 발견', 601]] },
  ] },
  { from: 604, kind: 'slide', ws: [
    { k: 'card', at: 604, icon: 'zap', label: '제일 무서운 영역', title: 'Unknown\nUnknown', color: CORAL },
    { k: 'list', items: [['문제는 여기서 터진다', 608], ['빨리 시작하라 · Small Start', 612], ['베타 테스트하라', 617]] },
  ] },

  // 실습 시연
  { from: 623, kind: 'slide', ws: [
    { k: 'card', at: [623, 1], icon: 'folder', label: '실습 자료', title: '문제 정의를\nMD 파일로' },
    { k: 'chip', at: 630, icon: 'doc', text: '오래 써 온 문제 정의 방식', color: MINT },
  ] },
  { from: 653, kind: 'slide', ws: [
    { k: 'card', at: 653, icon: 'app', label: 'Antigravity IDE', title: '두 AI를 나란히\n비교한다' },
    { k: 'vs', a: ['왼쪽', 'Claude', 661], b: ['오른쪽', 'Gemini', 662] },
    { k: 'chip', at: 669, icon: 'folder', text: '폴더의 MD·규칙을 읽고 브리핑', color: MINT },
  ] },
  { from: 675, kind: 'slide', ws: [
    { k: 'card', at: 675, icon: 'merge', label: '같은 프롬프트라도', title: '모델이 다르면\n판단도 다르다' },
    { k: 'list', mark: 'dot', items: [['한쪽에 치우치지 않기', 693], ['여러 의견을 받아 취합', 698]] },
  ] },
  { from: 714, kind: 'slide', ws: [
    { k: 'card', at: 714, icon: 'link', label: '크로스체크', title: '서로의 결과를\n서로에게 묻기' },
    { k: 'flow', items: [['검토 결과를 MD로 저장', 714], ['Claude 결과 → Gemini에게', 716], ['Gemini 결과 → Claude에게', 717], ['서로 비판하는 효과', 720]] },
  ] },
  { from: 721, kind: 'slide', ws: [
    { k: 'card', at: 721, icon: 'robot', label: '봇을 만드는 대신', title: 'IDE 안에서\nMD로 결과 누적' },
    { k: 'list', items: [['검토 결과·교안·디자인', 730], ['MD 파일로 누적', 731], ['다시 분석 → 반복', 733]] },
  ] },
  { from: 734, kind: 'photo', photo: 'p14', ws: [
    { k: 'card', at: 734, icon: 'users', label: '팀원이 함께한다면?', title: '회의 대신\nMD 파일 공유' },
    { k: 'vs', a: ['예전', '회의실에 모여 생각을 공유', 739], b: ['지금', 'MD 파일만 공유 → 팀원도 AI와 대화', 747] },
  ] },
  { from: 763, kind: 'slide', ws: [
    { k: 'card', at: 763, icon: 'student', label: '페르소나 카드', title: '여러 입장에서\n피드백 받기' },
    { k: 'chip', at: 774, icon: 'present', text: '"너는 교양과목 교수다"', color: SKY },
    { k: 'list', mark: 'dot', items: [['교수 입장', 781], ['학생 입장', 782], ['기업 입장', 783]] },
    { k: 'chip', at: 786, icon: 'up', text: '취합하며 교안 빌드업', color: MINT },
  ] },
  { from: 795, kind: 'slide', ws: [
    { k: 'card', at: 795, icon: 'search', label: '4단계 결과 검증', title: '근거를 요구하기' },
    { k: 'flow', items: [['Claude 2안 + Gemini 2안', 801], ['비교표로 정리', 803], ['근거·출처로 판정', 804]] },
  ] },
  { from: 806, kind: 'slide', ws: [
    { k: 'quote', at: 806, text: 'AI는 거짓말을 한다,\n그러니 근거를 갖고\n비교해서 답을 얻자' },
    { k: 'list', mark: 'dot', items: [['교수', 808], ['학생', [808, 0.4]], ['기업·학사 관리자', 809]] },
  ] },
  { from: 816, kind: 'slide', ws: [
    { k: 'card', at: 816, icon: 'pen', label: '5단계 최종 결정', title: '다듬는 건\n결국 사람', color: MINT },
    { k: 'list', items: [['문장에 문제가 없는지', 819], ['학생 이름·중요 정보는 없는지', 820], ['무단 도용은 없는지', 823]] },
  ] },
  { from: 825, kind: 'photo', photo: 'p15', ws: [
    { k: 'card', at: 825, icon: 'present', label: '예를 들면', title: 'AI로 만든 보고서도\n발표는 내 책임' },
    { k: 'stamp', at: 829, text: '최종 책임 = 나', color: GOLD },
  ] },
  { from: 831, kind: 'slide', ws: [
    { k: 'stat', at: 831, value: 6, suffix: '개', label: '검증 체크리스트' },
    { k: 'chip', at: 833, icon: 'check', text: '모든 단계를 거쳤는지 확인', color: MINT },
  ] },

  // PART 5
  { from: 836, kind: 'full', Full: Stairs },
  { from: 860, kind: 'slide', ws: [
    { k: 'card', at: 860, icon: 'heart', label: '발표를 마치며', title: '김종현 수석님\n감사합니다', color: CORAL },
    { k: 'chip', at: 866, icon: 'thumb', text: '모두 박수!', color: GOLD },
  ] },
  { from: 975, kind: 'full', Full: End },
];

// 슬라이드 확대: [큐, 중심 x, 중심 y, 배율] (발표 화면 1920×1080 기준). 배율 1 = 전체.
export const ZOOMS: [Q, number, number, number][] = [
  [1, 960, 540, 1],
  [54, 680, 560, 1.35], [57, 960, 540, 1],
  [76, 960, 400, 1.45], [85, 1560, 400, 1.7], [89, 960, 540, 1],
  [125, 1500, 730, 1.7], [130, 960, 430, 1.5], [131, 960, 540, 1.5], [132, 960, 650, 1.5], [134, 960, 760, 1.5], [144, 960, 900, 1.45], [146, 960, 540, 1],
  [158, 600, 420, 1.6], [161, 600, 420, 1.6], [163, 600, 660, 1.6], [176, 960, 860, 1.45], [178, 960, 540, 1],
  [207, 1450, 560, 1.65], [216, 1450, 560, 1.65],
  [225, 1290, 460, 1.6], [229, 960, 540, 1], [233, 650, 790, 1.55], [238, 960, 540, 1],
  [253, 680, 640, 1.45], [258, 680, 740, 1.6],
  [269, 960, 540, 1], [272, 400, 600, 1.7], [280, 1240, 680, 1.5], [283, 960, 540, 1],
  [312, 960, 540, 1], [370, 960, 470, 1.4], [374, 960, 450, 1.5], [396, 960, 885, 1.55], [400, 960, 540, 1.1],
  [404, 960, 540, 1], [408, 700, 840, 1.6], [417, 990, 540, 1.6], [424, 960, 540, 1],
  [432, 960, 540, 1], [438, 1450, 440, 1.7], [443, 960, 540, 1], [449, 1440, 440, 1.6], [459, 1300, 735, 1.65], [466, 960, 540, 1],
  [467, 640, 400, 1.45], [470, 640, 400, 1.6], [474, 1060, 400, 1.6], [480, 545, 735, 1.8], [486, 960, 540, 1],
  [487, 620, 480, 1.55], [494, 960, 400, 1.55],
  [519, 960, 540, 1], [523, 360, 490, 1.9], [525, 840, 490, 1.9], [528, 360, 770, 1.9], [531, 840, 770, 1.9], [535, 960, 960, 1.4], [538, 960, 540, 1],
  [548, 430, 540, 1.6], [553, 1250, 540, 1.45], [556, 960, 540, 1], [558, 960, 560, 1.3],
  [562, 960, 540, 1], [567, 575, 520, 1.75], [573, 1340, 520, 1.75], [582, 575, 790, 1.75], [596, 575, 790, 1.75], [604, 1340, 790, 1.75], [612, 960, 1010, 1.4], [616, 960, 540, 1],
  [623, 960, 540, 1], [669, 300, 500, 1.6], [673, 960, 540, 1],
  [795, 1120, 590, 1.25], [816, 1120, 590, 1.25], [831, 1120, 590, 1.25], [860, 960, 540, 1],
];
