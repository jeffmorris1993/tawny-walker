import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Photo from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import PaginationBar from '../../components/PaginationBar';
import { SkeletonStyles } from '../../components/SkeletonCard';
import SearchBar from '../../components/admin/SearchBar';
import SortHeader from '../../components/admin/SortHeader';
import FacetRow from '../../components/admin/FacetRow';
import ShimmerBar from '../../components/admin/ShimmerBar';
import { highlight } from '../../lib/highlight';
import useDebouncedValue from '../../lib/useDebouncedValue';
import { dashIfBlank, formatSpecs, listingStatusDate, formatListingDate } from '../../lib/format';
import { usePagedListings, useListingCounts } from '../../lib/queries';

const PAGE_SIZE = 12;

// Short eyebrow label that pairs with the Date column value in each row,
// so "JUL 10" reads as e.g. "LISTED · JUL 10" or "SOLD · JUL 10" without
// having to glance back at the Status column.
const ROW_DATE_BADGE = {
  'Coming Soon': 'Coming Soon',
  Active:        'Listed',
  Pending:       'Pending',
  Sold:          'Sold',
};

// Status pills shown in the facet bar. Order matches the design — Active /
// Pending / Sold / Draft. Labels resolve through theme.statusLabels so
// Direction B can swap copy without touching this file.
const STATUS_FACETS = [
  { key: 'Coming Soon', dot: '#D4B888' },
  { key: 'Active',      dot: '#3E6B52' },
  { key: 'Pending',     dot: '#B59568' },
  { key: 'Sold',        dot: '#8A877E' },
  { key: 'Draft',       dot: '#C7C2B6' },
];

// Tawny's service area, in the order she gave (Metro Detroit → West
// Bloomfield). Each entry maps to the substring the DB `loc` field is
// matched against; a value like "Birmingham, MI" or "Bloomfield Hills"
// counts the same way regardless of whether the state suffix was typed.
// Tawny's named service areas. Each entry maps to the substring the DB
// `loc` field is matched against; a value like "Birmingham, MI" counts
// the same way regardless of whether the state suffix was typed. The
// special 'other' facet at the end captures anything that doesn't match
// one of the named areas.
const NEIGHBORHOOD_FACETS = [
  { key: 'metro',             label: 'Metro Detroit',     match: 'Metro Detroit',     dot: '#3B3B38' },
  { key: 'birmingham',        label: 'Birmingham',        match: 'Birmingham',        dot: '#C9A266' },
  { key: 'bloomfield',        label: 'Bloomfield Hills',  match: 'Bloomfield Hills',  dot: '#0E3A2C' },
  { key: 'beverly',           label: 'Beverly Hills',     match: 'Beverly Hills',     dot: '#7A4F6E' },
  { key: 'royal-oak',         label: 'Royal Oak',         match: 'Royal Oak',         dot: '#A86C4E' },
  { key: 'troy',              label: 'Troy',              match: 'Troy',              dot: '#4A5B6E' },
  { key: 'novi',              label: 'Novi',              match: 'Novi',              dot: '#B8633F' },
  { key: 'northville',        label: 'Northville',        match: 'Northville',        dot: '#86825F' },
  { key: 'west-bloomfield',   label: 'West Bloomfield',   match: 'West Bloomfield',   dot: '#6E8B7A' },
  { key: 'other',             label: 'Other',             match: null,                dot: '#A89E84' },
];
// Substrings used to define what "Other" means — anything not matching
// any of these falls into the Other bucket.
const KNOWN_AREA_MATCHES = NEIGHBORHOOD_FACETS
  .filter(n => n.match)
  .map(n => n.match);

// Sortable columns → DB sort_order key + default direction on first click.
// The DATE column sorts on `status_date` (the per-row generated column that
// resolves to whichever of coming_soon_at / active_at / pending_at /
// sold_at matches the row's current status) so the order matches the date
// actually shown in each row.
const SORT_COLUMNS = {
  property: { col: 'addr',        defaultAsc: true  },
  price:    { col: 'price_value', defaultAsc: false },
  status:   { col: 'status_rank', defaultAsc: true  },
  listed:   { col: 'status_date', defaultAsc: false },
};

export default function ListingsManager() {
  const t = useTheme();
  const filterRef = useRef(null);

  const [statusSel, setStatusSel] = useState(() => new Set());
  const [hoodSel, setHoodSel]     = useState(() => new Set());
  const [query, setQuery]         = useState('');
  const [sort, setSort]           = useState({ key: 'status', dir: 'asc' });
  const [page, setPage]           = useState(1);

  // Debounce text input — page-1 reset piggy-backs on the same timer so a
  // single keystroke never causes two paged fetches (old page → page 1).
  const debouncedQuery = useDebouncedValue(query.trim(), 200, () => setPage(1));

  const { counts: rawCounts, locCounts } = useListingCounts();
  const counts = {
    'Coming Soon': rawCounts['Coming Soon'] || 0,
    Active:        rawCounts.Active  || 0,
    Pending:       rawCounts.Pending || 0,
    Sold:          rawCounts.Sold    || 0,
    Draft:         rawCounts.Draft   || 0,
  };

  // Sum per-area counts via case-insensitive substring match against
  // the seeded loc strings. Same logic the DB query uses for filtering.
  // The 'other' bucket is total minus everything that matches a named area.
  const hoodCounts = useMemo(() => {
    const out = {};
    let namedTotal = 0;
    for (const facet of NEIGHBORHOOD_FACETS) {
      if (!facet.match) continue;
      let n = 0;
      const needle = facet.match.toLowerCase();
      for (const [loc, c] of Object.entries(locCounts)) {
        if (loc.toLowerCase().includes(needle)) n += c;
      }
      out[facet.key] = n;
      namedTotal += n;
    }
    out.other = Math.max(0, (rawCounts.All || 0) - namedTotal);
    return out;
  }, [locCounts, rawCounts.All]);

  const statusIn = Array.from(statusSel);
  // Split the area selection into named substrings and the 'other'
  // sentinel. The query hook OR's the named substrings together; if
  // 'other' is on, an additional NOT-IN-ALL-KNOWN clause is OR-ed in.
  const locContains = Array.from(hoodSel)
    .map(k => NEIGHBORHOOD_FACETS.find(f => f.key === k)?.match)
    .filter(Boolean);
  const includeOther = hoodSel.has('other');

  const sortMeta = SORT_COLUMNS[sort.key];

  const { data: paged, total, pageCount, loading } = usePagedListings({
    statusIn: statusIn.length ? statusIn : undefined,
    locContains: locContains.length ? locContains : undefined,
    locNotInAll: includeOther ? KNOWN_AREA_MATCHES : undefined,
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

  // Filter/sort toggles also reset the page in the same render so the
  // paged query never fires twice (old page → page 1).
  function toggleStatus(key) {
    setStatusSel(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setPage(1);
  }
  function toggleHood(key) {
    setHoodSel(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setPage(1);
  }
  function clearAll() {
    setStatusSel(new Set());
    setHoodSel(new Set());
    setQuery('');
    setPage(1);
  }
  function onSortClick(key) {
    setSort(prev => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: SORT_COLUMNS[key].defaultAsc ? 'asc' : 'desc' };
    });
    setPage(1);
  }

  const totalFilters = statusSel.size + hoodSel.size;
  const totalListings = rawCounts.All || 0;
  const helperText = debouncedQuery
    ? `${total} ${total === 1 ? 'match' : 'matches'} in ${totalListings} ${totalListings === 1 ? 'residence' : 'residences'}`
    : (totalFilters > 0
        ? `${total} of ${totalListings} ${totalListings === 1 ? 'residence' : 'residences'}`
        : `${totalListings} ${totalListings === 1 ? 'residence' : 'residences'}`);

  const headlineColor = t.palette.emerald;
  const primaryBg = t.palette.emerald;
  const primaryFg = '#fff';
  const accentGold = '#B59568';

  return (
    <AdminShell>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow>The Index · {counts.Active} active · {counts.Pending} in contract · {counts.Sold} closed YTD</Eyebrow>
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
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>{t.admin.addCta}</span>
        </Link>
      </div>

      {/* Search row — quiet, line-only input + italic helper. Matches the
          design's editorial query treatment. */}
      <SearchBar
        ref={filterRef}
        value={query}
        onChange={setQuery}
        placeholder="Search a residence by name, address, or neighborhood…"
        helperText={helperText}
        onClear={() => setQuery('')}
      />

      {/* Facet block — Status + Area pill rows. Multi-select per row;
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
          showCounts
        />
        <FacetRow
          label="Area"
          facets={NEIGHBORHOOD_FACETS.map(n => ({
            key: n.key,
            label: n.label,
            count: hoodCounts[n.key] || 0,
            dot: n.dot,
          }))}
          selected={hoodSel}
          onToggle={toggleHood}
          showCounts
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
            onMouseEnter={e => { e.currentTarget.style.color = t.palette.emerald; e.currentTarget.style.borderBottomColor = t.palette.emerald; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.fgFaint; e.currentTarget.style.borderBottomColor = 'transparent'; }}
          >— clear all filters</button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 930 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1.4fr 1fr 110px 110px 110px 110px 60px',
            gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase', color: t.fgFaint,
            alignItems: 'center',
          }}>
            <span>Image</span>
            <SortHeader label="Property" k="property" sort={sort} onClick={onSortClick} gold={accentGold} headlineColor={headlineColor} />
            <span>Specs</span>
            <SortHeader label="Price" k="price" sort={sort} onClick={onSortClick} align="right" gold={accentGold} headlineColor={headlineColor} />
            <SortHeader label="Status" k="status" sort={sort} onClick={onSortClick} gold={accentGold} headlineColor={headlineColor} />
            <span>Represented By</span>
            <SortHeader label="Date" k="listed" sort={sort} onClick={onSortClick} align="right" gold={accentGold} headlineColor={headlineColor} />
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
                    gridTemplateColumns: '80px 1.4fr 1fr 110px 110px 110px 110px 60px',
                    gap: 18, padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
                    alignItems: 'center',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{ width: 64, height: 48 }}>
                    <Photo label="" tone={l.tone} height="100%" src={l.img} width={240} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: 19,
                      color: t.palette.emerald,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{highlight(dashIfBlank(l.addr), debouncedQuery, 'tw-listing-mark')}</div>
                    <div style={{ fontSize: 11, color: t.fgFaint }}>
                      {l.street || l.loc
                        ? <>
                            {highlight(l.street, debouncedQuery, 'tw-listing-mark')}
                            {l.street && l.loc ? ', ' : ''}
                            {highlight(l.loc, debouncedQuery, 'tw-listing-mark')}
                          </>
                        : '—'}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: t.fgMuted, letterSpacing: '0.04em' }}>{dashIfBlank(formatSpecs(l.specs))}</span>
                  <span style={{
                    fontFamily: t.fonts.display, fontSize: 18, textAlign: 'right',
                    color: t.palette.emerald,
                  }}>{dashIfBlank(l.price)}</span>
                  <StatusChip status={l.status} />
                  <span style={{
                    fontFamily: t.fonts.body, fontSize: 12,
                    color: l.representedBy ? t.fgMuted : t.fgFaint,
                  }}>{dashIfBlank(l.representedBy)}</span>
                  <div style={{ textAlign: 'right' }}>
                    {ROW_DATE_BADGE[l.status] && (
                      <div style={{
                        fontFamily: t.eyebrowFont,
                        fontSize: 9, fontWeight: 600,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: t.fgFaint,
                        marginBottom: 2,
                      }}>{ROW_DATE_BADGE[l.status]}</div>
                    )}
                    <div style={{ fontSize: 11, color: t.fgFaint }}>{dashIfBlank(formatListingDate(listingStatusDate(l)))}</div>
                  </div>
                  <span style={{
                    textAlign: 'right',
                    fontFamily: t.eyebrowFont,
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: t.palette.emerald,
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
        fontSize: 10.5, fontWeight: 500,
        color: t.fgFaint,
        letterSpacing: '0.24em',
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
      <ShimmerBar width={50} height={11} />
      <ShimmerBar width={64} height={10} />
      <ShimmerBar width={32} height={10} />
    </div>
  );
}
