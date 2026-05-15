import { TW } from '../tokens';

export default function Eyebrow({ children, color = TW.bronze, style }) {
  return (
    <div style={{
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase',
      color, ...style,
    }}>{children}</div>
  );
}
