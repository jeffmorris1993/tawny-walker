import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import PaginationBar from '../../components/PaginationBar';
import { SkeletonStyles } from '../../components/SkeletonCard';
import { usePagedLeads, useLeadTotal } from '../../lib/queries';

const PAGE_SIZE = 12;

const ROLES = [
  { key: 'Buyer',    label: 'Buyer' },
  { key: 'Seller',   label: 'Seller' },
  { key: 'Investor', label: 'Investor' },
  { key: 'Agent',    label: 'Agent / Broker' },
];

const STATUSES = [
  { key: 'New',       label: 'New' },
  { key: 'Contacted', label: 'Contacted' },
  { key: 'Active',    label: 'Active' },
  { key: 'Closed',    label: 'Closed' },
  { key: 'Cold',      label: 'Cold' },
];

// Sortable columns → default direction on first click.
const SORT_DEFAULT_DIR = {
  name:     'asc',
  type:     'asc',
  status:   'asc',
  received: 'desc',  // newest first
};

// The DB sort key the hook expects, keyed by column header label.
const SORT_HOOK_KEY = {
  name:     'name',
  type:     'type',
  status:   'status',
  received: 'date',
};

const ACCENT_GOLD = '#B59568';

export default function LeadsInbox() {
  const t = useTheme();
  const isB = t.key === 'B';

  const [roleSel, setRoleSel] = useState(() => new Set());
  const [statusSel, setStatusSel] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'status', dir: 'asc' });
  const [page, setPage] = useState(1);
  const filterRef = useRef(null);

  // Debounced query so PostgREST doesn't get hit on every keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(id);
  }, [query]);

  function goToPage(p) {
    setPage(p);
    if (filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function onSortClick(key) {
    setSort(prev => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: SORT_DEFAULT_DIR[key] || 'asc' };
    });
  }

  const { data: paged, total, pageCount, loading } = usePagedLeads({
    roleIn: Array.from(roleSel),
    statusIn: Array.from(statusSel),
    query: debouncedQuery || undefined,
    page,
    pageSize: PAGE_SIZE,
    sort: SORT_HOOK_KEY[sort.key] || 'status',
    sortDir: sort.dir,
  });
  const unfilteredTotal = useLeadTotal();

  const roleKey = Array.from(roleSel).sort().join(',');
  const statusKey = Array.from(statusSel).sort().join(',');
  // Snap back to page 1 whenever filters/search change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [roleKey, statusKey, debouncedQuery]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const togglePill = (kind, key) => {
    const setter = kind === 'role' ? setRoleSel : setStatusSel;
    setter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const clearAll = () => { setRoleSel(new Set()); setStatusSel(new Set()); setQuery(''); };
  const anyActive = roleSel.size + statusSel.size + (debouncedQuery ? 1 : 0) > 0;

  const helperText = debouncedQuery
    ? `${total} ${total === 1 ? 'match' : 'matches'} in ${unfilteredTotal} ${unfilteredTotal === 1 ? 'lead' : 'leads'}`
    : (roleSel.size + statusSel.size > 0
        ? `${total} of ${unfilteredTotal} ${unfilteredTotal === 1 ? 'lead' : 'leads'}`
        : `${unfilteredTotal} ${unfilteredTotal === 1 ? 'lead' : 'leads'}`);

  const headlineColor = isB ? t.palette.emerald : t.fgPage;

  return (
    <AdminShell>
      {/* Header — title + meta. Sort tabs are gone; sorting lives on the
          column headers now. */}
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
      </div>

      {/* Search row — quiet, line-only input with magnifier + italic helper. */}
      <div ref={filterRef} style={{
        display: 'flex', alignItems: 'flex-end', gap: 16,
        marginTop: 28, scrollMarginTop: 24,
      }}>
        <span style={{ color: t.fgFaint, paddingBottom: 14, display: 'grid', placeItems: 'center' }} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="10" cy="10" r="6.5" />
            <path d="M19 19l-4.5-4.5" />
          </svg>
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a lead by name, email, or anything in the summary…"
          autoComplete="off"
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 0, outline: 'none',
            padding: '6px 0 10px',
            borderBottom: `1px solid ${t.line}`,
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(20px, 2vw, 26px)',
            color: isB ? t.palette.emerald : t.fgPage,
          }}
          onFocus={e => { e.currentTarget.style.borderBottomColor = isB ? t.palette.emerald : t.palette.ink; }}
          onBlur={e => { e.currentTarget.style.borderBottomColor = t.line; }}
        />
        <span style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 14, color: t.fgFaint,
          paddingBottom: 14, whiteSpace: 'nowrap',
        }}>{helperText}</span>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            style={{
              background: 'none', border: 0, color: t.fgFaint, fontSize: 20,
              cursor: 'pointer', padding: '4px 6px 10px', lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* Facet pills — Role + Status, multi-select. Single clear-all in the
          top-right corner. */}
      <div style={{
        position: 'relative',
        marginTop: 20, padding: '20px 0 24px',
        borderTop: `1px solid ${t.lineSoft}`,
        borderBottom: `1px solid ${t.line}`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {anyActive && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              position: 'absolute', top: 20, right: 0,
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
          dotFor={(key) => t.leadStatusDots[key] || t.fgFaint}
        />
      </div>

      {/* Lead table — column headers double as sort triggers. */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 720 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 140px',
            gap: 20, padding: '18px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', color: t.fgFaint,
            alignItems: 'center',
          }}>
            <SortHeader label="Name" k="name" sort={sort} onClick={onSortClick} headlineColor={headlineColor} />
            <SortHeader label="Type" k="type" sort={sort} onClick={onSortClick} headlineColor={headlineColor} />
            <span>Summary</span>
            <SortHeader label="Status" k="status" sort={sort} onClick={onSortClick} headlineColor={headlineColor} />
            <SortHeader label="Received" k="received" sort={sort} onClick={onSortClick} align="right" headlineColor={headlineColor} />
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
                    }}>{highlight(lead.name, debouncedQuery)}</span>
                    <span style={{
                      fontFamily: t.eyebrowFont,
                      fontSize: 10.5, fontWeight: isB ? 600 : 400,
                      letterSpacing: isB ? '0.26em' : '0.22em',
                      textTransform: 'uppercase', color: t.fgMuted,
                    }}>{lead.type}</span>
                    <span style={{ fontSize: 13, color: t.fgMuted, lineHeight: 1.5 }}>{highlight(lead.summary, debouncedQuery)}</span>
                    <StatusChip status={lead.status} kind="lead" />
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
              fontSize: 18, color: t.fgFaint,
            }}>
              No leads match this combination.
              <div style={{
                marginTop: 8,
                fontFamily: t.eyebrowFont, fontSize: 10.5,
                letterSpacing: '0.22em', textTransform: 'uppercase',
              }}>Try clearing the search or a filter</div>
            </div>
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

      <style>{`
        .tw-lead-mark {
          background: ${ACCENT_GOLD}33;
          color: inherit;
          padding: 0 2px;
        }
      `}</style>
      <SkeletonStyles />
    </AdminShell>
  );
}

function SortHeader({ label, k, sort, onClick, align, headlineColor }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const active = sort.key === k;
  const arrow = active ? (sort.dir === 'asc' ? '↓' : '↑') : '↕';
  const justify = align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <span style={{ textAlign: align || 'left' }}>
      <button
        type="button"
        onClick={() => onClick(k)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 0, padding: 0,
          fontFamily: t.eyebrowFont,
          fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
          letterSpacing: isB ? '0.28em' : '0.24em',
          textTransform: 'uppercase',
          color: active ? headlineColor : t.fgFaint,
          cursor: 'pointer',
          justifyContent: justify,
          width: align === 'right' ? '100%' : 'auto',
        }}
      >
        <span>{label}</span>
        <span style={{
          opacity: active ? 1 : 0.35,
          color: active ? ACCENT_GOLD : 'inherit',
          fontSize: 10, lineHeight: 1,
        }}>{arrow}</span>
      </button>
    </span>
  );
}

// Wraps every occurrence of `q` in the source string with a styled <mark>.
function highlight(text, q) {
  if (!text) return text;
  const s = String(text);
  if (!q) return s;
  const lower = s.toLowerCase();
  const needle = q.toLowerCase();
  const out = [];
  let i = 0;
  let n = 0;
  while (i < s.length) {
    const idx = lower.indexOf(needle, i);
    if (idx === -1) { out.push(s.slice(i)); break; }
    if (idx > i) out.push(s.slice(i, idx));
    out.push(
      <mark
        key={`m-${n++}`}
        className="tw-lead-mark"
      >{s.slice(idx, idx + needle.length)}</mark>
    );
    i = idx + needle.length;
  }
  return out;
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
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: isB ? 600 : 500,
        letterSpacing: isB ? '0.32em' : '0.28em',
        textTransform: 'uppercase', color: t.fgFaint,
      }}>{label}</span>
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
