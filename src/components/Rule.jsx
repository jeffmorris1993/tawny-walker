import { useTheme } from '../theme/DirectionContext';

// Direction B's signature divider: a hairline with a centered italic ampersand.
// Direction A doesn't use it; render a quiet 1px line instead so callers don't
// have to branch.
export default function Rule({ color, width = 220, style }) {
  const t = useTheme();
  const c = color || t.line;
  if (!t.rule) {
    return <div style={{ width, height: 1, background: c, ...style }} />;
  }
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
