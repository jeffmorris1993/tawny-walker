import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/DirectionContext';
import { thumbUrl } from '../lib/photo';

// Stylized photo placeholder — each direction maps the same tone keys onto its
// own palette, so the same `tone="dusk"` reads warm in A and emerald in B.
//
// When `src` is provided, a real image is rendered on top of the colored fill
// using objectFit=fit. Pass `bg` to set the underlying container colour
// (useful for transparent portraits — bone in A, white in B). The tone
// gradient is kept visible until the image has loaded, then the <img>
// fades in over the top — so first paint never lands on a dark/blank box
// while bytes are still on the wire.
export default function Photo({
  label = 'PHOTOGRAPHY', tone = 'warm',
  ratio, style, height, src, fit = 'cover', bg, objectPosition, eager = false,
  width, aspect = 1.5, quality = 70,
}) {
  const t = useTheme();
  const p = t.photoPalettes[tone] || t.photoPalettes.warm;
  const [loaded, setLoaded] = useState(!src);
  const imgRef = useRef(null);

  // Run Supabase Storage URLs through the on-the-fly transform endpoint
  // when a width is specified, so the browser pulls a card-sized JPEG
  // instead of the multi-megabyte phone-camera original. Aspect drives
  // the height so the cropped thumbnail keeps a usable ratio; default
  // 3:2 matches the listing photography we host. No-ops for non-Supabase
  // URLs (bundled assets, external photos).
  const resolvedSrc = width ? thumbUrl(src, width, aspect, quality) : src;

  // Reset the fade-in whenever src changes (paging, switching listings),
  // but skip straight to "loaded" if the browser already has the bytes —
  // cached images can finish before React attaches the onLoad listener,
  // and we don't want the fade to stall in the off state.
  useEffect(() => {
    if (!resolvedSrc) { setLoaded(true); return; }
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
    else setLoaded(false);
  }, [resolvedSrc]);

  const placeholderBg = `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 55%, ${p[2]} 100%)`;
  const settledBg = bg || t.palette.ink || '#1B1B1A';

  return (
    <div style={{
      position: 'relative', width: '100%',
      height: height || (ratio ? undefined : '100%'),
      aspectRatio: ratio,
      background: src && loaded ? settledBg : placeholderBg,
      overflow: 'hidden', flexShrink: 0, ...style,
    }}>
      {src && (
        <img
          ref={imgRef}
          src={resolvedSrc}
          alt={label}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: fit, objectPosition, display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
          }}
        />
      )}
      {!src && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 6px)',
            mixBlendMode: 'overlay',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)',
          }} />
        </>
      )}
      {label && (
        <div style={{
          position: 'absolute', left: 14, bottom: 12,
          fontFamily: t.photoLabelFont,
          fontWeight: 500,
          fontSize: 9.5, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)',
          textShadow: src ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
          pointerEvents: 'none',
        }}>◌ {label}</div>
      )}
    </div>
  );
}

// Re-usable photo path catalog (mirrors TW_PHOTOS in the design source).
export const PHOTOS = {
  portraitHeadshot:  '/photos/tawny-portrait-headshot.png',
  portraitFireplace: '/photos/tawny-portrait-fireplace.png',
  portraitWhite:     '/photos/tawny-portrait-white.png',
  portraitBeige:     '/photos/tawny-portrait-beige-new.png',
  portraitCouch:     '/photos/tawny-portrait-couch.png',
  livingMarble:      '/photos/interior-living-marble.png',
  kitchenWhite:      '/photos/interior-kitchen-white.png',
  kitchenModernWood: '/photos/interior-kitchen-modern-wood.png',
  kitchenMarbleIsl:  '/photos/interior-kitchen-marble-island.png',
  deck:              '/photos/exterior-deck.png',
};
