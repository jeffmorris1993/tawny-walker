import { useTheme } from '../theme/DirectionContext';

// Stylized photo placeholder — each direction maps the same tone keys onto its
// own palette, so the same `tone="dusk"` reads warm in A and emerald in B.
export default function Photo({ label = 'PHOTOGRAPHY', tone = 'warm', ratio, style, height }) {
  const t = useTheme();
  const p = t.photoPalettes[tone] || t.photoPalettes.warm;
  return (
    <div style={{
      position: 'relative', width: '100%',
      height: height || (ratio ? undefined : '100%'),
      aspectRatio: ratio,
      background: `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 55%, ${p[2]} 100%)`,
      overflow: 'hidden', flexShrink: 0, ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 6px)',
        mixBlendMode: 'overlay',
      }} />
      {/* B-direction: soft top-right vignette adds a couture, hand-printed quality */}
      {t.key === 'B' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)',
        }} />
      )}
      {label && (
        <div style={{
          position: 'absolute', left: 14, bottom: 12,
          fontFamily: t.photoLabelFont,
          fontWeight: t.key === 'B' ? 500 : 400,
          fontSize: 9.5, letterSpacing: t.key === 'B' ? '0.24em' : '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)',
        }}>◌ {label}</div>
      )}
    </div>
  );
}
