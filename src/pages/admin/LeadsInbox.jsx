import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
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

  const [roleSel, setRoleSel] = useState(() => new Set());
  const [statusSel, setStatusSel] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'status', dir: 'asc' });
  const [page, setPage] = useState(1);
  const filterRef = useRef(null);

  // Debounced query — page-1 reset piggy-backs on the same timer so the
  // paged query never fires twice (once at the old page, once at page 1)
  // for a single search change.
  const debouncedQuery = useDebouncedValue(query.trim(), 200, () => setPage(1));

  // Facet definitions need the live theme for their dot colors, so they're
  // built inside the component.
  const ROLE_FACETS = ROLES.map(r => ({ key: r.key, label: r.label, dot: roleDot(t, r.key) }));
  const STATUS_FACETS_LEAD = STATUSES.map(s => ({
    key: s.key,
    label: s.label,
    dot: t.leadStatusDots[s.key] || t.fgFaint,
  }));

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
    setPage(1);
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

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  // Toggles + clear-all jump back to page 1 *in the same render* as the
  // filter change, so the paged query never fires once at the old page and
  // again at page 1.
  const togglePill = (kind, key) => {
    const setter = kind === 'role' ? setRoleSel : setStatusSel;
    setter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setPage(1);
  };
  const clearAll = () => {
    setRoleSel(new Set());
    setStatusSel(new Set());
    setQuery('');
    setPage(1);
  };
  const anyActive = roleSel.size + statusSel.size + (debouncedQuery ? 1 : 0) > 0;

  const helperText = debouncedQuery
    ? `${total} ${total === 1 ? 'match' : 'matches'} in ${unfilteredTotal} ${unfilteredTotal === 1 ? 'lead' : 'leads'}`
    : (roleSel.size + statusSel.size > 0
        ? `${total} of ${unfilteredTotal} ${unfilteredTotal === 1 ? 'lead' : 'leads'}`
        : `${unfilteredTotal} ${unfilteredTotal === 1 ? 'lead' : 'leads'}`);

  const headlineColor = t.palette.emerald;

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
            color: t.palette.emerald,
          }}>Leads</h1>
        </div>
      </div>

      {/* Search row — quiet, line-only input with magnifier + italic helper. */}
      <SearchBar
        ref={filterRef}
        value={query}
        onChange={setQuery}
        placeholder="Search a lead by name, email, or anything in the summary…"
        helperText={helperText}
        onClear={() => setQuery('')}
      />

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
              e.currentTarget.style.color = t.palette.emerald;
              e.currentTarget.style.borderBottomColor = t.palette.emerald;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = t.fgFaint;
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >— clear all filters</button>
        )}

        <FacetRow
          label="Role"
          facets={ROLE_FACETS}
          selected={roleSel}
          onToggle={key => togglePill('role', key)}
        />
        <FacetRow
          label="Status"
          facets={STATUS_FACETS_LEAD}
          selected={statusSel}
          onToggle={key => togglePill('status', key)}
        />
      </div>

      {/* Lead table — column headers double as sort triggers. */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 720 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '220px 120px 1fr 140px 140px',
            gap: 20, padding: '18px 0', borderBottom: `1px solid ${t.line}`,
            fontFamily: t.eyebrowFont,
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.28em',
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
                      color: t.palette.emerald,
                    }}>{highlight(lead.name, debouncedQuery, 'tw-lead-mark')}</span>
                    <span style={{
                      fontFamily: t.eyebrowFont,
                      fontSize: 10.5, fontWeight: 600,
                      letterSpacing: '0.26em',
                      textTransform: 'uppercase', color: t.fgMuted,
                    }}>{lead.type}</span>
                    <span style={{ fontSize: 13, color: t.fgMuted, lineHeight: 1.5 }}>{highlight(lead.summary, debouncedQuery, 'tw-lead-mark')}</span>
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

// Role dot colors — pick from the theme palette so they look on-brand in
// both directions. (No equivalent map exists in the theme so it lives here.)
function roleDot(t, key) {
  return {
    Buyer:    t.palette.gold,
    Seller:   t.palette.moss,
    Investor: t.palette.emerald,
    Agent:    t.palette.goldSoft,
  }[key] || t.palette.gold;
}
