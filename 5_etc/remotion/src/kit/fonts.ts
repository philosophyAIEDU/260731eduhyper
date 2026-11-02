import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// Pretendard Variable (SIL OFL 1.1, public/fonts/OFL.txt) — one file, weights 45–920.
// Rendering waits until the font is loaded so no frame is captured with a fallback font.
const handle = delayRender('Loading Pretendard');
const face = new FontFace('Pretendard', `url(${staticFile('fonts/PretendardVariable.woff2')}) format('woff2-variations')`, { weight: '45 920' });
face.load().then(() => { document.fonts.add(face); continueRender(handle); }).catch((err) => cancelRender(err));
