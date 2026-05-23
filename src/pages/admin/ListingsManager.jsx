import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import PaginationBar from '../../components/PaginationBar';
import { SkeletonStyles } from '../../components/SkeletonCard';
import { usePagedListings, useListingCounts } from '../../lib/queries';

const PAGE_SIZE = 12;

// Status pills shown in the facet bar. Order matches the design — Active /
// Pending / Sold / Draft. Labels resolve through theme.statusLabels so
// Direction B can swap copy without touching this file.
const STATUS_FACETS = [
  { key: 'Active',  dot: '#3E6B52' },
  { key: 'Pending', dot: '#B59568' },
  { key: 'Sold',    dot: '#8A877E' },
  { key: 'Draft',   dot: '#C7C2B6' },
];

// Tawny's service area, in the order she gave (Metro Detroit → West
// Bloomfield). Each entry maps to the substring the DB `loc` field is
// matched against; a value like "Birmingham, MI" or "Bloomfield Hills"
// counts the same way regardless of whether the state suffix was typed.
const NEIGHBORHOOD_FACETS = [
  { key: 'metro',             label: 'Metro Detroit',     match: 'Metro Detroit',     dot: '#3B3B38' },
  { key: 'birmingham',        label: 'Birmingham',        match: 'Birmingham',        dot: '#C9A266' },
  { key: 'bloomfield',        label: 'Bloomfield Hills',  match: 'Bloomfield Hills',  dot: '#0E3A2C' },
  { key: 'royal-oak',         label: 'Royal Oak',         match: 'Royal Oak',         dot: '#A86C4E' },
  { key: 'ferndale',          label: 'Ferndale',          match: 'Ferndale',          dot: '#4A5B6E' },
  { key: 'novi',              label: 'Novi',              match: 'Novi',              dot: '#B8633F' },
  { key: 'northville',        label: 'Northville',        match: 'Northville',        dot: '#86825F' },
  { key: 'farmington-hills',  label: 'Farmington Hills',  match: 'Farmington Hills',  dot: '#7A7368' },
  { key: 'west-bloomfield',   label: 'West Bloomfield',   match: 'West Bloomfield',   dot: '#6E8B7A' },
];

// Sortable columns → DB sort_order key + default direction on first click.
const SORT_COLUMNS = {
  property: { col: 'addr',        defaultAsc: true  },
  price:    { col: 'price_value', defaultAsc: false },
  status:   { col: 'status_rank', defaultAsc: true  },
  listed:   { col: 'created_at',  defaultAsc: false },
};

export default function ListingsManager() {
  const t = useTheme();
  const isB = t.key === 'B';
  const filterRef = useRef(null);

  const [statusSel, setStatusSel] = useState(() => new Set());
  const [hoodSel, setHoodSel]     = useState(() => new Set());
  const [query, setQuery]         = useState('');
  const [sort, setSort]           = useState({ key: 'status', dir: 'asc' });
  const [page, setPage]           = useState(1);

  // Debounce text input so we don't fire a query on every keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(id);
  }, [query]);

  const statusKey = Array.from(statusSel).sort().join(',');
  const hoodKey   = Array.from(hoodSel).sort().join(',');
  // Bring the page back to 1 anytime the filter set changes — otherwise the
  // user could be stranded on a now-empty page.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [statusKey, hoodKey, debouncedQuery]);

  const { counts: rawCounts, locCounts } = useListingCounts();
  const counts = {
    Active:  rawCounts.Active  || 0,
    Pending: rawCounts.Pending || 0,
    Sold:    rawCounts.Sold    || 0,
    Draft:   rawCounts.Draft   || 0,
  };

  // Sum per-neighborhood counts via case-insensitive substring match against
  // the seeded loc strings. Same logic the DB query uses for filtering.
  const hoodCounts = useMemo(() => {
    const out = {};
    for (const facet of NEIGHBORHOOD_FACETS) {
      let n = 0;
      const needle = facet.match.toLowerCase();
      for (const [loc, c] of Object.entries(locCounts)) {
        if (loc.toLowerCase().includes(needle)) n += c;
      }
      out[facet.key] = n;
    }
    return out;
  }, [locCounts]);

  const statusIn = Array.from(statusSel);
  const locContains = Array.from(hoodSel)
    .map(k => NEIGHBORHOOD_FACETS.find(f => f.key === k)?.match)
    .filter(Boolean);

  const sortMeta = SORT_COLUMNS[sort.key];

  const { data: paged, total, pageCount, loading } = usePagedListings({
    statusIn: statusIn.length ? statusIn : undefined,
    locContains: locContains.length ? locContains : undefined,
    query: debouncedQuery || undefined,
    page,
    pageSize: PAGE_SIZE,
    sort: { column: sortMeta.col, ascending: sort.dir === 'asc' },
  });

  function goToPage(p) {
    setPage(p);
    if (filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function toggleStatus(key) {
    setStatusSel(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }
  function toggleHood(key) {
    setHoodSel(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }
  function clearAll() {
    setStatusSel(new Set());
    setHoodSel(new Set());
    setQuery('');
  }
  function onSortClick(key) {
    setSort(prev => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: SORT_COLUMNS[key].defaultAsc ? 'asc' : 'desc' };
    });
  }

  const totalFilters = statusSel.size + hoodSel.size;
  const totalListings = rawCounts.All || 0;
  const helperText = debouncedQuery
    ? `${total} ${total === 1 ? 'match' : 'matches'} in ${totalListings} ${totalListings === 1 ? 'residence' : 'residences'}`
    : (totalFilters > 0
        ? `${total} of ${totalListings} ${totalListings === 1 ? 'residence' : 'residences'}`
        : `${totalListings} ${totalListings === 1 ? 'residence' : 'residences'}`);

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const primaryBg = isB ? t.palette.emerald : t.palette.ink;
  const primaryFg = isB ? '#fff' : t.palette.bone;
  const accentGold = '#B59568';

  return (
    <AdminShell>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>The Index · {counts.Active} active · {counts.Pending} {isB ? 'in contract' : 'pending'} · {counts.Sold} {isB ? 'closed' : 'sold'} YTD</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', color: headlineColor,
          }}>{t.admin.indexHeadline}</h1>
        </div>
        <Link to="/admin/listings/add" style={{ textDecoration: 'none' }}>
          <span style={{
            display: 'inline-block', padding: '14px 22px',
            background: primaryBg, color: primaryFg,
            fontFamily: t.eyebrowFont,
            fontSize: 11, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>{t.admin.addCta}</span>
        </Link>
      </div>

      {/* Search row — quiet, line-only input + italic helper. Matches the
          design's editorial query treatment. */}
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
          placeholder="Search a residence by name, address, or neighborhood…"
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

      {/* Facet block — Status + Neighborhood pill rows. Multi-select per row;
          single "clear all filters" link only visible when something is on. */}
      <div style={{
        position: 'relative',
        marginTop: 20, padding: '20px 0 24px',
        borderTop: `1px solid ${t.lineSoft}`,
        borderBottom: `1px solid ${t.line}`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <FacetRow
          label="Status"
          facets={STATUS_FACETS.map(s => ({
            key: s.key,
            label: t.statusLabels[s.key] || s.key,
            count: counts[s.key] || 0,
            dot: s.dot,
          }))}
          selected={statusSel}
          onToggle={toggleStatus}
        />
        <FacetRow
          label="Neighborhood"
          facets={NEIGHBORHOOD_FACETS.map(n => ({
            key: n.key,
            label: n.label,
            count: hoodCounts[n.key] || 0,
            dot: n.dot,
          }))}
          selected={hoodSel}
          onToggle={toggleHood}
        />
        {(totalFilters > 0 || query) && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              position: 'absolute', top: 20, right: 0,
              background: 'none', border: 0,
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 14, color: t.fgFaint, cursor: 'pointer',
              padding: '4px 2px', borderBottom: '1px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = isB ? t.palette.emerald : t.palette.ink; e.currentTarget.style.borderBottomColor = isB ? t.palette.emerald : t.palette.ink; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.fgFaint; e.currentTarget.style.borderBottomColor = 'transparent'; }}
          >— clear all filters</button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 820 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1.4fr 1fr 110px 110px 110px 60px',
            gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', color: t.fgFaint,
            alignItems: 'center',
          }}>
            <span>Image</span>
            <SortHeader label="Property" k="property" sort={sort} onClick={onSortClick} gold={accentGold} headlineColor={headlineColor} />
            <span>Specs</span>
            <SortHeader label="Price" k="price" sort={sort} onClick={onSortClick} align="right" gold={accentGold} headlineColor={headlineColor} />
            <SortHeader label="Status" k="status" sort={sort} onClick={onSortClick} gold={accentGold} headlineColor={headlineColor} />
            <SortHeader label="Listed" k="listed" sort={sort} onClick={onSortClick} align="right" gold={accentGold} headlineColor={headlineColor} />
            <span style={{ textAlign: 'right' }}> </span>
          </div>

          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ListingSkeletonRow key={`s-${i}`} />
              ))
            : paged.map((l) => (
                <Link
                  key={l.id}
                  to={`/admin/listings/${l.id}/edit`}
                  className="tw-listing-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1.4fr 1fr 110px 110px 110px 60px',
                    gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
                    alignItems: 'center',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{ width: 64, height: 48 }}>
                    <Photo label="" tone={l.tone} height="100%" src={l.img} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: 19,
                      color: isB ? t.palette.emerald : t.fgPage,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{highlight(l.addr, debouncedQuery, accentGold)}</div>
                    <div style={{ fontSize: 11, color: t.fgFaint }}>
                      {highlight(l.street, debouncedQuery, accentGold)}{l.street && l.loc ? ', ' : ''}{highlight(l.loc, debouncedQuery, accentGold)}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: t.fgMuted, letterSpacing: '0.04em' }}>{l.specs}</span>
                  <span style={{
                    fontFamily: t.fonts.display, fontSize: 18, textAlign: 'right',
                    color: isB ? t.palette.emerald : t.fgPage,
                  }}>{l.price}</span>
                  <StatusChip status={l.status} />
                  <span style={{ fontSize: 11, color: t.fgFaint, textAlign: 'right' }}>{l.listedAt || '—'}</span>
                  <span style={{
                    textAlign: 'right',
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: isB ? 600 : 400,
                    letterSpacing: isB ? '0.24em' : '0.2em',
                    textTransform: 'uppercase',
                    color: isB ? t.palette.emerald : t.palette.ink,
                  }}>Edit →</span>
                </Link>
              ))}

          {!loading && total === 0 && (
            <div style={{
              padding: '40px 0', textAlign: 'center',
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 18, color: t.fgFaint,
            }}>
              No residences match this combination.
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
        .tw-listing-row { transition: background 0.12s ease; }
        .tw-listing-row:hover { background: ${t.bgPanel}; }
        .tw-listing-mark {
          background: ${accentGold}33;
          color: inherit;
          padding: 0 2px;
        }
      `}</style>
      <SkeletonStyles />
    </AdminShell>
  );
}

function FacetRow({ label, facets, selected, onToggle }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '110px 1fr', gap: 18, alignItems: 'center',
    }}>
      <span style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgFaint,
      }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {facets.map(f => {
          const isVacant = f.count === 0;
          const isActive = selected.has(f.key);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => !isVacant && onToggle(f.key)}
              disabled={isVacant}
              aria-pressed={isActive}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                height: 32, padding: '0 14px',
                background: isActive ? (isB ? t.palette.emerald : t.palette.ink) : t.bgPage,
                border: `1px solid ${isActive ? (isB ? t.palette.emerald : t.palette.ink) : t.line}`,
                color: isActive ? '#fff' : t.fgMuted,
                fontFamily: t.eyebrowFont,
                fontSize: 11, fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: isVacant ? 'default' : 'pointer',
                opacity: isVacant ? 0.45 : 1,
                userSelect: 'none',
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isActive ? '#B59568' : (isVacant ? t.line : f.dot),
              }} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortHeader({ label, k, sort, onClick, align, gold, headlineColor }) {
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
          color: active ? gold : 'inherit',
          fontSize: 10, lineHeight: 1,
        }}>{arrow}</span>
      </button>
    </span>
  );
}

// Wraps every occurrence of `q` in the source string with a styled <mark>.
// Returned as a React fragment so the table cells can keep their styling.
function highlight(text, q, gold) {
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
        className="tw-listing-mark"
        style={{ background: `${gold}33`, color: 'inherit' }}
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

function ListingSkeletonRow() {
  const t = useTheme();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1.4fr 1fr 110px 110px 110px 60px',
      gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
      alignItems: 'center',
    }}>
      <ShimmerBar width={64} height={48} />
      <ShimmerBar width="80%" height={18} />
      <ShimmerBar width="70%" height={11} />
      <ShimmerBar width={86} height={16} />
      <ShimmerBar width={70} height={11} />
      <ShimmerBar width={64} height={10} />
      <ShimmerBar width={32} height={10} />
    </div>
  );
}
