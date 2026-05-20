import { useTheme } from '../theme/DirectionContext';

// Animated shimmer placeholders that mimic the real listing cards so the
// grid doesn't shift size or position while data is fetching.

const SHIMMER = {
  light: 'linear-gradient(90deg, #ECE6D8 0%, #F4EFE2 50%, #ECE6D8 100%)',
  emerald: 'linear-gradient(90deg, #DDE6E0 0%, #ECEEE9 50%, #DDE6E0 100%)',
};

function Bar({ width, height, color }) {
  return (
    <span
      className="tw-skel-bar"
      style={{
        display: 'block',
        width, height,
        background: color,
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function SkeletonCardA() {
  const t = useTheme();
  const color = SHIMMER.light;
  return (
    <div style={{ display: 'block' }}>
      <Bar width="100%" height={280} color={color} />
      <div style={{ marginTop: 20 }}>
        <Bar width="70%" height={18} color={color} />
        <div style={{ height: 8 }} />
        <Bar width="50%" height={13} color={color} />
        <div style={{ height: 4 }} />
        <Bar width="35%" height={13} color={color} />
      </div>
      <div style={{
        marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <Bar width={84} height={18} color={color} />
        <Bar width={70} height={10} color={color} />
      </div>
    </div>
  );
}

export function SkeletonCardB() {
  const t = useTheme();
  const color = SHIMMER.emerald;
  return (
    <div style={{ background: '#fff', border: `1px solid ${t.line}` }}>
      <Bar width="100%" height={260} color={color} />
      <div style={{ padding: '20px 24px 24px' }}>
        <Bar width="70%" height={20} color={color} />
        <div style={{ height: 8 }} />
        <Bar width="50%" height={13} color={color} />
        <div style={{ height: 4 }} />
        <Bar width="40%" height={13} color={color} />
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <Bar width={80} height={18} color={color} />
          <Bar width={70} height={10} color={color} />
        </div>
      </div>
    </div>
  );
}

// Renders `count` shimmer cards inside a passed-in grid wrapper.
export function SkeletonGrid({ count = 12, Card }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <Card key={i} />)}
      <SkeletonStyles />
    </>
  );
}

// Shared keyframes — included once next to whichever grid renders the
// skeleton set.
export function SkeletonStyles() {
  return (
    <style>{`
      .tw-skel-bar { animation: tw-skel 1.4s ease-in-out infinite; background-size: 200% 100% !important; }
      @keyframes tw-skel {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .tw-skel-bar { animation: none; }
      }
    `}</style>
  );
}
