// Supabase Storage exposes an on-the-fly image transform endpoint at
// /storage/v1/render/image/public/... — the same path as the public
// object endpoint but with `/render/image/` instead of `/object/`.
// Hitting it with `width=…&quality=…` returns a resized, re-encoded
// JPEG that's 10–20× smaller than the original phone-camera upload, so
// card grids don't pull megabytes per tile.
//
// Returns the input URL untouched when it's not a Supabase Storage URL
// (legacy bundled photos, external URLs) so the helper is safe to wrap
// blindly around every `src`.
const OBJECT_PATH    = '/storage/v1/object/public/';
const TRANSFORM_PATH = '/storage/v1/render/image/public/';

export function transformedPhotoUrl(url, { width, height, quality = 70, resize = 'cover' } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes(OBJECT_PATH)) return url;
  if (!width && !height) return url;
  const [base, search] = url.split('?');
  const params = new URLSearchParams(search || '');
  if (width)   params.set('width',   String(width));
  if (height)  params.set('height',  String(height));
  if (resize)  params.set('resize',  resize);
  if (quality) params.set('quality', String(quality));
  return base.replace(OBJECT_PATH, TRANSFORM_PATH) + '?' + params.toString();
}

// Convenience wrapper that derives `height` from `width` + an aspect
// ratio (width:height). Necessary because the Supabase render endpoint
// only preserves aspect when BOTH dimensions are passed — supplying just
// `width` returns a vertically-squished image that CSS object-fit:cover
// then zooms into. Default aspect is 3:2 — the shape of the listing
// photography we host.
export function thumbUrl(src, width, aspect = 1.5, quality = 70) {
  if (!src || !width) return src;
  const height = Math.max(1, Math.round(width / aspect));
  return transformedPhotoUrl(src, { width, height, quality, resize: 'cover' });
}
