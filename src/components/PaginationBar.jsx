import { useTheme } from '../theme/DirectionContext';

// Builds a compact page list with leading / trailing ellipsis once the
// page count gets large. Always shows page 1, page N, and a 3-wide
// window around the current page.
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const list = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) list.push('…');
  for (let i = left; i <= right; i++) list.push(i);
  if (right < total - 1) list.push('…');
  list.push(total);
  return list;
}

export default function PaginationBar({ page, pageCount, onChange }) {
  const t = useTheme();
  const isB = t.key === 'B';
  if (pageCount <= 1) return null;
  const pages = buildPageList(page, pageCount);
  const accent = isB ? t.palette.emerald : t.fgPage;

  const baseBtn = {
    minWidth: 40, padding: '8px 14px',
    background: 'transparent', border: `1px solid ${t.line}`,
    fontFamily: t.eyebrowFont,
    fontSize: 11, fontWeight: isB ? 600 : 400,
    letterSpacing: isB ? '0.22em' : '0.18em',
    textTransform: 'uppercase', cursor: 'pointer',
    color: t.fgMuted,
  };

  const activeBtn = {
    ...baseBtn,
    background: accent,
    color: isB ? '#fff' : t.bgPage,
    border: `1px solid ${accent}`,
    cursor: 'default',
  };

  const navBtn = (disabled) => ({
    ...baseBtn,
    padding: '8px 18px',
    color: disabled ? t.fgFaint : accent,
    borderColor: disabled ? t.line : accent,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <div className="tw-pagination" style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: 8, flexWrap: 'wrap', marginTop: 'clamp(40px, 5vw, 64px)',
    }}>
      <button
        type="button"
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        style={navBtn(page <= 1)}
      ><span aria-hidden="true">←</span><span className="tw-pagination-label"> Previous</span></button>
      {pages.map((p, i) => (
        p === '…'
          ? <span key={`e${i}`} style={{ color: t.fgFaint, padding: '0 4px' }}>…</span>
          : (
            <button
              key={p}
              type="button"
              onClick={() => p !== page && onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              style={p === page ? activeBtn : baseBtn}
            >{p}</button>
          )
      ))}
      <button
        type="button"
        onClick={() => page < pageCount && onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        style={navBtn(page >= pageCount)}
      ><span className="tw-pagination-label">Next </span><span aria-hidden="true">→</span></button>
      <style>{`
        @media (max-width: 600px) {
          .tw-pagination-label { display: none; }
        }
      `}</style>
    </div>
  );
}
