import { TW } from '../tokens';

export default function Wordmark({ size = 16, color = TW.ink, sub = true }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.005em',
        color,
      }}>
        Tawny <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Walker</em>
      </span>
      {sub && (
        <span style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: Math.max(7.5, size * 0.36),
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: TW.ink3,
          marginTop: size * 0.32,
        }}>
          Private Real Estate
        </span>
      )}
    </div>
  );
}
