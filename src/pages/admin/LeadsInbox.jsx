import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import PaginationBar from '../../components/PaginationBar';
import { SkeletonStyles } from '../../components/SkeletonCard';
import { usePagedLeads } from '../../lib/queries';

const PAGE_SIZE = 12;

const ROLES = [
  { key: 'Buyer',    label: 'Buyer' },
  { key: 'Seller',   label: 'Seller' },
  { key: 'Investor', label: 'Investor' },
  { key: 'Agent',    label: 'Agent / Renter' },
];

const STATUSES = [
  { key: 'New',       label: 'New Lead' },
  { key: 'Contacted', label: 'Contacted' },
  { key: 'Qualified', label: 'Qualified' },
  { key: 'Cold',      label: 'Cold' },
];

const SORT_TABS = [
  { l: 'By Status', key: 'status' },
  { l: 'By Date',   key: 'date' },
  { l: 'By Type',   key: 'type' },
];

// Each sort key has a default direction that "feels right" — newest dates
// first, alphabetical types, statuses in workflow order. Clicking the same
// tab flips direction; switching tabs returns to the default.
const SORT_DEFAULT_DIR = { status: 'asc', date: 'desc', type: 'asc' };

// Both directions share the same data + filtering logic. Visual surface is
// driven entirely by the theme primitives plus a few inline color reads.

export default function LeadsInbox() {
  const t = useTheme();
  const isB = t.key === 'B';
  // Multi-select facet filters — empty set means "all" for that dimension.
  const [roleSel, setRoleSel] = useState(() => new Set());
  const [statusSel, setStatusSel] = useState(() => new Set());
  const [sort, setSort] = useState('status');
  const [sortDir, setSortDir] = useState(SORT_DEFAULT_DIR.status);
  const [page, setPage] = useState(1);
  const filterRef = useRef(null);

  function goToPage(p) {
    setPage(p);
    if (filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function changeSort(nextKey) {
    if (nextKey === sort) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(nextKey);
      setSortDir(SORT_DEFAULT_DIR[nextKey] || 'asc');
    }
  }

  const { data: paged, total, pageCount, loading } = usePagedLeads({
    roleIn: Array.from(roleSel),
    statusIn: Array.from(statusSel),
    page,
    pageSize: PAGE_SIZE,
    sort,
    sortDir,
  });

  // Snap back to page 1 whenever a filter/sort changes the result set.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [roleSel, statusSel, sort, sortDir]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const togglePill = (kind, key) => {
    const setter = kind === 'role' ? setRoleSel : setStatusSel;
    setter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const clearAll = () => { setRoleSel(new Set()); setStatusSel(new Set()); };
  const anyActive = roleSel.size + statusSel.size > 0;

  return (
    <AdminShell>
      {/* Header — sort sits next to the title so the row doesn't move when
          filter pills wrap. */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>The Studio Inbox · {today}</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em',
            color: isB ? t.palette.emerald : t.fgPage,
          }}>Leads</h1>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {SORT_TABS.map(s => {
            const active = sort === s.key;
            const arrow = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
            return (
              <span
                key={s.key}
                onClick={() => changeSort(s.key)}
                style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: 11, fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.26em' : '0.22em',
                  textTransform: 'uppercase',
                  color: active ? (isB ? t.palette.emerald : t.fgPage) : t.fgFaint,
                  borderBottom: active ? `1px solid ${isB ? t.palette.emerald : t.fgPage}` : '1px solid transparent',
                  paddingBottom: 4, cursor: 'pointer',
                }}>{s.l}{arrow}</span>
            );
          })}
        </div>
      </div>

      {/* Facet pills — Role + Status, multi-select. Single clear-all in the
          top-right corner. */}
      <div ref={filterRef} style={{
        position: 'relative',
        marginTop: 24, paddingTop: 20, paddingBottom: 24,
        borderBottom: `1px solid ${t.line}`,
        display: 'flex', flexDirection: 'column', gap: 14,
        scrollMarginTop: 24,
      }}>
        {anyActive && (
          <button
            type="button"
            onClick={clearAll}
            className="tw-clear-all"
            style={{
              position: 'absolute', top: 16, right: 0,
              background: 'transparent', border: 0,
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 14, color: t.fgFaint,
              padding: '4px 2px', cursor: 'pointer',
              borderBottom: '1px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = isB ? t.palette.emerald : t.fgPage;
              e.currentTarget.style.borderBottomColor = isB ? t.palette.emerald : t.fgPage;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = t.fgFaint;
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >— clear all filters</button>
        )}

        <FacetRow
          label="Role"
          options={ROLES}
          selection={roleSel}
          onToggle={key => togglePill('role', key)}
          dotFor={(key) => roleDot(t, key)}
        />
        <FacetRow
          label="Status"
          options={STATUSES}
          selection={statusSel}
          onToggle={key => togglePill('status', key)}
          dotFor={(key) => t.statusDots[key] || t.fgFaint}
        />
      </div>

      {/* Lead table */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 720 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 140px',
            gap: 20, padding: '18px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>
            <span>Name</span><span>Type</span><span>Summary</span>
            <span>Status</span><span style={{ textAlign: 'right' }}>Received</span>
          </div>

          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <LeadSkeletonRow key={`s-${i}`} />
              ))
            : paged.map((lead) => (
                <Link key={lead.id} to={`/admin/lead/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    style={{
                      display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 140px',
                      gap: 20, padding: '20px 0', borderBottom: `1px solid ${t.lineSoft}`,
                      alignItems: 'center', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bgPanel}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      fontFamily: t.fonts.display, fontSize: 17,
                      color: isB ? t.palette.emerald : t.fgPage,
                    }}>{lead.name}</span>
                    <span style={{
                      fontFamily: t.eyebrowFont,
                      fontSize: 10.5, fontWeight: isB ? 600 : 400,
                      letterSpacing: isB ? '0.26em' : '0.22em',
                      textTransform: 'uppercase', color: t.fgMuted,
                    }}>{lead.type}</span>
                    <span style={{ fontSize: 13, color: t.fgMuted, lineHeight: 1.5 }}>{lead.summary}</span>
                    <StatusChip status={lead.status} />
                    <span style={{ fontSize: 11, color: t.fgFaint, textAlign: 'right', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {lead.when}
                    </span>
                  </div>
                </Link>
              ))}

          {!loading && total === 0 && (
            <div style={{
              padding: '48px 0', textAlign: 'center',
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 16, color: t.fgFaint,
            }}>No leads match this combination. Try clearing one of the filters.</div>
          )}
        </div>
      </div>

      <PaginationBar page={page} pageCount={pageCount} onChange={goToPage} />

      <div style={{
        marginTop: 18, textAlign: 'center',
        fontFamily: t.eyebrowFont,
        fontSize: 10.5, fontWeight: isB ? 500 : 400,
        color: t.fgFaint,
        letterSpacing: isB ? '0.24em' : '0.18em',
        textTransform: 'uppercase',
      }}>
        {loading
          ? 'Loading…'
          : total === 0
            ? 'No results'
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + paged.length} of ${total}`}
      </div>

      <SkeletonStyles />
    </AdminShell>
  );
}

const SHIMMER = 'linear-gradient(90deg, #ECE6D8 0%, #F4EFE2 50%, #ECE6D8 100%)';

function ShimmerBar({ width, height }) {
  return (
    <span className="tw-skel-bar" style={{
      display: 'inline-block',
      width, height,
      background: SHIMMER, backgroundSize: '200% 100%',
    }} />
  );
}

// Mimics the lead table row layout so the page doesn't jump when data arrives.
function LeadSkeletonRow() {
  const t = useTheme();
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 140px',
      gap: 20, padding: '20px 0', borderBottom: `1px solid ${t.lineSoft}`,
      alignItems: 'center',
    }}>
      <ShimmerBar width={150} height={16} />
      <ShimmerBar width={70} height={10} />
      <ShimmerBar width="92%" height={12} />
      <ShimmerBar width={92} height={14} />
      <ShimmerBar width={104} height={10} />
    </div>
  );
}

// ─── Facet row + pill ──────────────────────────────────────────────────────
function FacetRow({ label, options, selection, onToggle, dotFor }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div className="tw-facet-row" style={{
      display: 'grid', gridTemplateColumns: '96px 1fr', gap: 18, alignItems: 'center',
    }}>
      <span style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: isB ? 600 : 500,
        letterSpacing: isB ? '0.32em' : '0.28em',
        textTransform: 'uppercase', color: t.fgFaint,
      }}>
        <span>{label}</span>
        <span style={{ flex: 1, height: 1, background: t.line, display: 'inline-block', minWidth: 8 }} />
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => (
          <FacetPill
            key={o.key}
            active={selection.has(o.key)}
            dot={dotFor(o.key)}
            label={o.label}
            onClick={() => onToggle(o.key)}
          />
        ))}
      </div>
    </div>
  );
}

function FacetPill({ active, dot, label, onClick }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const inkActive = isB ? '#FFFFFF' : t.palette.bone;
  const activeBg = isB ? t.palette.emerald : t.palette.ink;
  const activeDot = isB ? t.palette.gold : t.accent;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        height: 32, padding: '0 14px',
        background: active ? activeBg : t.bgPage,
        border: `1px solid ${active ? activeBg : t.line}`,
        fontFamily: t.eyebrowFont,
        fontSize: 11, fontWeight: active ? 600 : 500,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: active ? inkActive : t.fgMuted,
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        userSelect: 'none',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: active ? activeDot : dot,
        transition: 'background 0.15s',
      }} />
      <span>{label}</span>
    </button>
  );
}

// Role dot colors — pick from the theme palette so they look on-brand in
// both directions. (No equivalent map exists in the theme so it lives here.)
function roleDot(t, key) {
  const isB = t.key === 'B';
  if (isB) {
    return {
      Buyer:    t.palette.gold,
      Seller:   t.palette.moss,
      Investor: t.palette.emerald,
      Agent:    t.palette.goldSoft,
    }[key] || t.palette.gold;
  }
  return {
    Buyer:    t.palette.bronze,
    Seller:   t.palette.amber,
    Investor: t.palette.ink2,
    Agent:    t.palette.green,
  }[key] || t.palette.bronze;
}
