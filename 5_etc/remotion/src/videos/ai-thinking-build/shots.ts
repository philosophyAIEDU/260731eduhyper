// videos/ai-thinking-build/shots.json 과 같은 샷 구성. from = SRT 큐 번호, 끝은 다음 샷의 시작.
// 영상 소재의 vd = 소재 길이(초). 샷이 소재보다 길면 천천히 재생해 끝까지 채운다.
type K = 'image' | 'video' | 'motion';
export type Shot = { id: string; from: number; kind: K; vd?: number };
const v = (id: string, from: number, vd: number): Shot => ({ id, from, kind: 'video', vd });
const m = (id: string, from: number): Shot => ({ id, from, kind: 'motion' });
const p = (id: string, from: number): Shot => ({ id, from, kind: 'image' });

export const SHOTS: Shot[] = [
  p('s01', 1), p('s02', 5), p('s03', 7), v('s04', 10, 15.2), p('s05', 13), p('s06', 15), v('s07', 19, 24), m('m-time', 22),
  p('s08', 25), v('s09', 28, 24.4), p('s10', 34), p('s11', 39), p('s12', 43), v('s13', 49, 8), p('s14', 50), p('s15', 55),
  m('m-sub', 57), p('s16', 62), p('s17', 65), p('s18', 68), p('s19', 70), v('s20', 76, 8.6), v('s21', 79, 57), p('s22', 81),
  p('s23', 84), m('m-cmp', 88), p('s24', 98), p('s25', 100), p('s26', 103), p('s27', 109), m('m-build', 118), p('s28', 125),
  p('s29', 128), p('s30', 133), p('s31', 139), v('s32', 143, 15), p('s33', 148), m('m-machine', 150), p('s34', 158),
  v('s35', 160, 9.4), p('s36', 166), v('s37', 171, 14.4), p('s38', 178), p('s39', 181), m('m-loop', 184), p('s40', 190),
  v('s41', 193, 11.1), m('end', 198),
];
