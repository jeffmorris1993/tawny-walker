import { useTheme } from '../theme/DirectionContext';

// "TAWNY & CO." — same letterforms across both directions, different display family.
// A: Cormorant Garamond throughout. B: Playfair Display with a Cormorant italic ampersand.
export default function Wordmark({ size = 22, color, sub = false, light = false }) {
  const t = useTheme();
  const fg = color || (light ? '#FFFFFF' : t.palette.ink || t.fgPage);
  const subColor = light ? 'rgba(255,255,255,0.6)' : t.fgFaint;

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', color: fg, whiteSpace: 'nowrap', lineHeight: 1 }}>
        <span style={{ fontFamily: t.wordmark.family, fontWeight: 500, fontSize: size, letterSpacing: '0.04em' }}>TAWNY</span>
        <span style={{
          fontFamily: t.wordmark.ampersandFamily, fontStyle: 'italic', fontWeight: 400,
          fontSize: size * 1.55, margin: `0 ${size * 0.06}px`,
          position: 'relative', top: size * 0.12, display: 'inline-block',
        }}>&</span>
        <span style={{ fontFamily: t.wordmark.family, fontWeight: 500, fontSize: size, letterSpacing: '0.04em' }}>CO.</span>
      </span>
      {sub && (
        <span style={{
          fontFamily: t.eyebrowFont,
          fontSize: Math.max(7.5, size * 0.36),
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: subColor, marginTop: size * 0.5, fontWeight: t.eyebrowWeight,
        }}>Private Real Estate</span>
      )}
    </span>
  );
}
