import { useTheme } from '../theme/DirectionContext';

export default function Eyebrow({ children, color, style }) {
  const t = useTheme();
  return (
    <div style={{
      fontFamily: t.eyebrowFont,
      fontSize: t.eyebrowSize,
      fontWeight: t.eyebrowWeight,
      letterSpacing: t.eyebrowSpacing,
      textTransform: 'uppercase',
      color: color || t.accent,
      ...style,
    }}>{children}</div>
  );
}
