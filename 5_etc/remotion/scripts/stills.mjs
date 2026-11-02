// Render several stills with one bundle: node scripts/stills.mjs <composition> <sec,sec,...> [outDir]
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [id, list, out = 'out/stills'] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id, inputProps: {} });
for (const s of list.split(',').map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = path.join(out, `at-${s}s.jpg`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 85, inputProps: composition.props });
  console.log(output);
}
