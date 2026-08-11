// Generates WebP derivatives of the static photos in public/photos/.
//
// Why this exists: photos under public/photos/ are served raw. The
// thumbUrl() transform in src/lib/photo.js only rewrites Supabase Storage
// URLs, so bundled photos bypass image optimization entirely — the inquiry
// aside was pulling a 2.9 MB PNG into a 300px-tall box.
//
// Run manually, NOT as part of `npm run build`: this shells out to `cwebp`
// (Homebrew: `brew install webp`), which isn't present in the Vercel build
// image. The .webp output is committed alongside the .png source, and the
// PNGs stay as the <picture> fallback. Re-run after adding a photo:
//
//   npm run photos
//
// Safe to re-run — it overwrites its own output and never touches the PNGs.

import { readdir, stat } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTO_DIR = join(ROOT, 'public', 'photos');

// Widest we ever render a static photo is the listing-detail hero, which
// asks for 1800px. 1600 covers it and every smaller use site; sources
// narrower than this are encoded at their natural width rather than
// upscaled, which would add bytes for no detail.
const MAX_WIDTH = 1600;
const QUALITY = 78;

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function pngWidth(file) {
  // `sips` ships with macOS; identify is the fallback for anyone on Linux.
  try {
    const { stdout } = await run('sips', ['-g', 'pixelWidth', file]);
    const m = stdout.match(/pixelWidth:\s*(\d+)/);
    if (m) return Number(m[1]);
  } catch {
    /* fall through */
  }
  const { stdout } = await run('magick', ['identify', '-format', '%w', file]);
  return Number(stdout.trim());
}

const files = (await readdir(PHOTO_DIR)).filter(f => f.endsWith('.png')).sort();
if (!files.length) {
  console.log('No PNGs in public/photos — nothing to do.');
  process.exit(0);
}

let before = 0;
let after = 0;

for (const file of files) {
  const src = join(PHOTO_DIR, file);
  const out = join(PHOTO_DIR, `${basename(file, '.png')}.webp`);

  const srcBytes = (await stat(src)).size;
  const width = await pngWidth(src);
  const target = Math.min(width, MAX_WIDTH);

  // -resize W 0 keeps the aspect ratio. -q is lossy but preserves alpha,
  // which the cut-out portraits rely on.
  const args = ['-quiet', '-q', String(QUALITY)];
  if (target < width) args.push('-resize', String(target), '0');
  args.push(src, '-o', out);
  await run('cwebp', args);

  const outBytes = (await stat(out)).size;
  before += srcBytes;
  after += outBytes;

  const saved = ((1 - outBytes / srcBytes) * 100).toFixed(0);
  console.log(
    `${basename(file, '.png').padEnd(32)} ${String(width).padStart(4)}px → ` +
    `${String(target).padStart(4)}px   ${kb(srcBytes).padStart(8)} → ${kb(outBytes).padStart(8)}  (−${saved}%)`
  );
}

console.log(
  `\n${files.length} photos   ${kb(before)} → ${kb(after)}   ` +
  `(−${((1 - after / before) * 100).toFixed(0)}% overall)`
);
