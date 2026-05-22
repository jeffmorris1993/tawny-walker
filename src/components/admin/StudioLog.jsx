import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';
import { useLeadEvents } from '../../lib/queries';

// Self-contained studio log feed for a single lead. Renders inside a
// bounded scroll container so the parent page never grows past
// MAX_HEIGHT — events load incrementally via an IntersectionObserver on a
// sentinel near the bottom of the container.
//
// Props:
//   leadId          uuid (required)
//   leadCreatedAt   ISO string — used to synthesize the "Intake received"
//                   entry that headers the log.
//   leadWhen        already-formatted relative string for the intake entry
//   bumpKey         monotonic counter the parent increments after writing
//                   a new event; passed through to useLeadEvents to force
//                   a page-0 refetch so the new event appears immediately.
const MAX_HEIGHT = 440;

export default function StudioLog({ leadId, leadCreatedAt, leadWhen, bumpKey = 0 }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const { events, hasMore, loading, loadMore } = useLeadEvents(leadId, { pageSize: 15, bumpKey });

  // Synthesize the "Intake received" entry from the lead's birth.
  const intakeItem = useMemo(() => ({
    kind: 'intake',
    headline: 'Intake received',
    when: leadWhen || (leadCreatedAt ? formatStamp(leadCreatedAt) : ''),
    timestamp: leadCreatedAt,
    highlight: true,
  }), [leadCreatedAt, leadWhen]);

  const items = useMemo(() => {
    const ev = events.map(e => ({
      id: e.id,
      kind: e.kind,                         // 'note' | 'status'
      headline: e.kind === 'status'
        ? `Status: ${e.previous_value || '—'} → ${e.next_value}`
        : 'Studio note edited — TW',
      when: formatStamp(e.created_at),
      timestamp: e.created_at,
      previous: e.previous_value,
      next: e.next_value,
    }));
    // Newest events first; intake always sits at the bottom as the
    // historical anchor.
    return [...ev, intakeItem];
  }, [events, intakeItem]);

  // Infinite-scroll: observe a sentinel inside the scrollable container.
  const sentinelRef = useRef(null);
  const scrollRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { root: scrollRef.current, rootMargin: '120px' });
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  const [active, setActive] = useState(null);  // selected item for modal

  return (
    <div>
      <Eyebrow>Studio log</Eyebrow>
      <div style={{
        fontFamily: t.fonts.display, fontStyle: 'italic',
        fontSize: 14, color: t.fgFaint, marginTop: 6, lineHeight: 1.5,
      }}>Only what's happened inside the studio.</div>

      <div
        ref={scrollRef}
        style={{
          marginTop: 14,
          maxHeight: MAX_HEIGHT,
          overflowY: 'auto',
          border: `1px solid ${t.line}`,
          background: t.bgPage,
        }}
      >
        {items.map((a, i) => (
          <button
            key={a.id || `intake-${i}`}
            type="button"
            onClick={() => setActive(a)}
            style={{
              display: 'flex', gap: 14, padding: '12px 16px',
              borderBottom: `1px solid ${t.lineSoft}`,
              width: '100%', textAlign: 'left',
              background: 'transparent', border: 'none',
              borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = t.bgPanel}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: a.highlight ? t.accent : t.fgFaint,
              marginTop: 6, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, color: isB ? t.palette.emerald : t.fgPage,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{a.headline}</div>
              <div style={{
                fontSize: 10.5, color: t.fgFaint,
                letterSpacing: '0.06em', marginTop: 2,
              }}>{a.when}</div>
            </div>
          </button>
        ))}

        {hasMore && (
          <div
            ref={sentinelRef}
            style={{
              padding: '12px 16px', textAlign: 'center',
              fontFamily: t.eyebrowFont,
              fontSize: 10, fontWeight: isB ? 600 : 400,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: t.fgFaint,
            }}
          >{loading ? 'Loading…' : '·'}</div>
        )}
      </div>

      {active && (
        <LogModal item={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function LogModal({ item, onClose }) {
  const t = useTheme();
  const isB = t.key === 'B';

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const fullStamp = item.timestamp ? new Date(item.timestamp).toLocaleString([], {
    weekday: 'short', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }) : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15, 15, 12, 0.55)',
        display: 'grid', placeItems: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          background: t.bgPage, border: `1px solid ${t.line}`,
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
          padding: '28px 32px 32px',
        }}
      >
        <div style={{
          fontFamily: t.eyebrowFont,
          fontSize: isB ? 10 : 10.5, fontWeight: isB ? 600 : 400,
          letterSpacing: isB ? '0.28em' : '0.22em',
          textTransform: 'uppercase', color: t.fgFaint,
        }}>{item.kind === 'status' ? 'Status Change' : item.kind === 'note' ? 'Note Edit' : 'Intake'}</div>

        <h2 style={{
          fontFamily: t.fonts.display, fontWeight: 400,
          fontSize: 'clamp(22px, 2.4vw, 28px)', margin: '12px 0 0',
          letterSpacing: '-0.012em', color: headlineColor, lineHeight: 1.2,
        }}>{item.headline}</h2>

        <div style={{
          fontSize: 12, color: t.fgFaint,
          letterSpacing: '0.06em', marginTop: 8,
        }}>{fullStamp}</div>

        {item.kind === 'note' && (
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <NoteBlock label="Previous" body={item.previous} t={t} isB={isB} muted />
            <NoteBlock label="Current"  body={item.next}     t={t} isB={isB} />
          </div>
        )}

        {item.kind === 'status' && (
          <div style={{
            marginTop: 22, padding: '18px 20px',
            background: t.bgPanel, border: `1px solid ${t.line}`,
            fontFamily: t.fonts.display, fontSize: 17, color: headlineColor,
            lineHeight: 1.5,
          }}>
            Status changed from <em style={{ fontStyle: 'italic' }}>{item.previous || '—'}</em>
            {' '}to <em style={{ fontStyle: 'italic' }}>{item.next}</em>.
          </div>
        )}

        {item.kind === 'intake' && (
          <p style={{
            marginTop: 22,
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 16, color: t.fgMuted, lineHeight: 1.55,
          }}>The lead arrived from the public inquiry form. The full intake
            answers and mandate notes are on the page behind this dialog.</p>
        )}

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 22px',
              background: 'transparent',
              border: `1px solid ${isB ? t.palette.emerald : t.palette.ink}`,
              color: isB ? t.palette.emerald : t.palette.ink,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 11, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.22em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function NoteBlock({ label, body, t, isB, muted }) {
  return (
    <div>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: isB ? 600 : 400,
        letterSpacing: isB ? '0.28em' : '0.22em',
        textTransform: 'uppercase', color: t.fgFaint, marginBottom: 6,
      }}>{label}</div>
      <div style={{
        padding: '14px 16px',
        background: muted ? t.bgPanel : t.bgPage,
        border: `1px solid ${t.line}`,
        fontFamily: t.fonts.display, fontStyle: 'italic',
        fontSize: 15, lineHeight: 1.55,
        color: body ? (muted ? t.fgMuted : (isB ? t.palette.emerald : t.fgPage)) : t.fgFaint,
        whiteSpace: 'pre-wrap',
      }}>{body && body.trim() ? body : '(empty)'}</div>
    </div>
  );
}

// Short, human-readable stamp: "May 22 · 10:08 AM".
function formatStamp(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}
