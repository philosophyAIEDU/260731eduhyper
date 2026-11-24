// videos/yeonsung-ai-class/shots.json 과 같은 샷 구성. from = SRT 큐 번호, 끝은 다음 샷의 시작.
// u.. = 사용자 사진(1~17번, 16번 제외) / x.. = Pixabay 사진·영상 / m.. = 전체 모션 장면.
// vd = 영상 소재 길이(초), ss = 소재 앞부분 건너뛰기(초, 어두운 시작 구간 제거).
type K = 'image' | 'video' | 'motion';
export type Shot = { id: string; from: number; kind: K; vd?: number; ss?: number };
const v = (id: string, from: number, vd: number, ss = 0): Shot => ({ id, from, kind: 'video', vd, ss });
const m = (id: string, from: number): Shot => ({ id, from, kind: 'motion' });
const p = (id: string, from: number): Shot => ({ id, from, kind: 'image' });

export const SHOTS: Shot[] = [
  p('u01', 1), p('u02', 2), p('u03', 4), p('u13', 5), p('u04', 7),
  p('x01', 8), v('x02', 12, 14.7), v('x03', 14, 13.6), m('m-crumble', 15), p('x04', 19), p('x05', 22), m('m-doors', 24), v('x06', 26, 19),
  p('u05', 29), p('u06', 31), p('u07', 33), p('u08', 35), p('u09', 38), p('u10', 41), p('u14', 44), p('u15', 46),
  v('x07', 50, 38.6, 3.6), m('m-app', 54), p('x08', 60), p('u11', 63), m('m-newdoor', 68), p('x09', 71), p('x10', 74), v('x11', 78, 69.7),
  p('u12', 81), m('m-anyone', 84), p('x12', 87), v('x13', 89, 14.6), p('u17', 91), v('x14', 94, 8.3), m('m-build', 97), m('m-wrap', 101), m('end', 105),
];
