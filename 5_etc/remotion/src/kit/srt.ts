import { staticFile } from 'remotion';

export type Cue = { n: number; s: number; e: number; text: string };

const sec = (t: string) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return +h * 3600 + +m * 60 + +s + +ms / 1000; };

/** Parse an SRT file; `fix` corrects recurring transcription mistakes ([pattern, replacement]). */
export const parseSrt = (src: string, fix: [RegExp, string][] = []): Cue[] =>
  src.replace(/^﻿/, '').replace(/\r/g, '')
    .split(/\n\n+/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 3)
    .map((l) => {
      const m = l[1].match(/(\S+)\s*-->\s*(\S+)/);
      if (!m) throw new Error(`bad SRT block: ${l.join(' / ')}`);
      return { n: +l[0], s: sec(m[1]), e: sec(m[2]), text: fix.reduce((t, [a, b]) => t.replace(a, b), l.slice(2).join(' ')) };
    });

/** Load public/<path> as cues — use inside calculateMetadata so scenes get them as props. */
export const loadSrt = async (path: string, fix: [RegExp, string][] = []) =>
  parseSrt(await (await fetch(staticFile(path))).text(), fix);
