import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';

// A direction-aware editorial button.
// variants: 'primary' (filled), 'secondary' (outlined), 'ghost-light' (outlined on dark bg)
export default function Button({
  to, onClick, children, variant = 'primary', arrow = true, full = false, size = 'md', style,
}) {
  const t = useTheme();

  const sizing = size === 'sm'
    ? { padX: 20, padY: 14, fz: 10.5 }
    : size === 'lg'
      ? { padX: 36, padY: 22, fz: 12 }
      : { padX: 32, padY: 18, fz: 11.5 };

  const variants = {
    primary: { bg: t.primary, fg: t.primaryFg, border: t.primary },
    secondary: { bg: 'transparent', fg: t.primary, border: t.primary },
    'on-dark-primary': { bg: t.palette.white || '#fff', fg: t.primary, border: t.palette.white || '#fff' },
    'on-dark-outline': { bg: 'transparent', fg: '#fff', border: 'rgba(255,255,255,0.5)' },
  };
  const v = variants[variant] || variants.primary;

  const node = (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : 'auto',
      padding: `${sizing.padY}px ${sizing.padX}px`,
      background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
      fontFamily: t.eyebrowFont,
      fontSize: sizing.fz,
      fontWeight: 600,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      textAlign: 'center',
      cursor: to || onClick ? 'pointer' : 'default',
      ...style,
    }}>
      {children}{arrow && <span style={{ marginLeft: 6 }}>→</span>}
    </span>
  );

  if (to) return <Link to={to} style={{ textDecoration: 'none', width: full ? '100%' : 'auto' }}>{node}</Link>;
  if (onClick) return <button onClick={onClick} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', width: full ? '100%' : 'auto' }}>{node}</button>;
  return node;
}
