import { useTheme } from '../theme/DirectionContext';

// Stylized photo placeholder — each direction maps the same tone keys onto its
// own palette, so the same `tone="dusk"` reads warm in A and emerald in B.
//
// When `src` is provided, a real image is rendered on top of the colored fill
// using objectFit=fit. Pass `bg` to set the underlying container colour
// (useful for transparent portraits — bone in A, white in B).
export default function Photo({
  label = 'PHOTOGRAPHY', tone = 'warm',
  ratio, style, height, src, fit = 'cover', bg,
}) {
  const t = useTheme();
  const p = t.photoPalettes[tone] || t.photoPalettes.warm;
  return (
    <div style={{
      position: 'relative', width: '100%',
      height: height || (ratio ? undefined : '100%'),
      aspectRatio: ratio,
      background: src ? (bg || t.palette.ink || '#1B1B1A')
                      : `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 55%, ${p[2]} 100%)`,
      overflow: 'hidden', flexShrink: 0, ...style,
    }}>
      {src && (
        <img src={src} alt={label} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: fit, display: 'block',
        }} />
      )}
      {!src && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 6px)',
            mixBlendMode: 'overlay',
          }} />
          {t.key === 'B' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }} />
          )}
        </>
      )}
      {label && (
        <div style={{
          position: 'absolute', left: 14, bottom: 12,
          fontFamily: t.photoLabelFont,
          fontWeight: t.key === 'B' ? 500 : 400,
          fontSize: 9.5, letterSpacing: t.key === 'B' ? '0.24em' : '0.18em',
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
