import { useTheme } from '../theme/DirectionContext';

// Signature divider: a hairline with a centered italic ampersand.
export default function Rule({ color, width = 220, style }) {
  const t = useTheme();
  const c = color || t.line;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width, ...style }}>
      <span style={{ flex: 1, height: 1, background: c }} />
      <span style={{
        fontFamily: t.wordmark.ampersandFamily, fontStyle: 'italic',
        fontSize: 22, color: t.accent, lineHeight: 1, fontWeight: 400,
      }}>&</span>
      <span style={{ flex: 1, height: 1, background: c }} />
    </div>
  );
}
