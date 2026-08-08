import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import AdminShell from '../../components/AdminShell';
import StatusChanger from '../../components/admin/StatusChanger';
import StudioLog from '../../components/admin/StudioLog';
import { useLead, updateLeadStatus, updateLeadNote, setListMembership } from '../../lib/queries';

export default function LeadDetail() {
  const t = useTheme();
  const { id } = useParams();
  const { data: d, loading, refresh } = useLead(id);

  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState('');
  const [status, setStatus] = useState('New');
  // Bump after every event write so StudioLog refetches and the new entry
  // appears immediately.
  const [logBump, setLogBump] = useState(0);
  const [listSaving, setListSaving] = useState(false);

  // Sync local edit state when the loaded lead changes.
  useEffect(() => {
    if (d) {
      setNote(d.studioNote || '');
      setStatus(d.status || 'New');
      setNoteSaved(d.studioNoteSavedAt ? formatStamp(d.studioNoteSavedAt) : '');
    }
  }, [d]);

  async function handleStatusChange(next) {
    if (!d) return;
    const previous = d.status || status;
    setStatus(next);
    await updateLeadStatus(d.id, next, previous);
    // Refresh the lead row + bump the studio log so the new event appears.
    refresh();
    setLogBump(b => b + 1);
  }

  // There is no self-serve unsubscribe link yet — nothing sends to the list
  // — so this toggle is how a "please take me off" request gets honored.
  async function handleListToggle() {
    if (!d || listSaving) return;
    setListSaving(true);
    await setListMembership(d.id, !d.onList);
    setListSaving(false);
    refresh();
  }

  async function handleNoteBlur() {
    if (!d) return;
    const previous = d.studioNote || '';
    if (note === previous) return;
    setNoteSaving(true);
    await updateLeadNote(d.id, note, previous);
    setNoteSaving(false);
    setNoteSaved(formatStamp(new Date()));
    refresh();
    setLogBump(b => b + 1);
  }

  if (loading && !d) {
    return (
      <AdminShell>
        <div style={{ padding: 80, color: t.fgFaint, fontFamily: t.fonts.body, textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 12 }}>
          Loading…
        </div>
      </AdminShell>
    );
  }
  if (!d) {
    return (
      <AdminShell>
        <div style={{ padding: 80, color: t.fgFaint, fontFamily: t.fonts.body, textAlign: 'center' }}>
          Lead not found.{' '}
          <Link to="/admin" style={{ color: t.fgPage }}>Back to inbox</Link>
        </div>
      </AdminShell>
    );
  }

  const headlineColor = t.palette.emerald;
  const currentLabel = (t.leadStatusLabels[status] || status).toLowerCase();

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: t.fgFaint, marginBottom: 24,
      }}>
        <Link to="/admin" style={{ color: t.fgFaint, textDecoration: 'none' }}>Leads</Link>
        {' / '}{t.leadRolePlural?.[d.type] || `${d.type}s`}{' / '}
        <span style={{ color: headlineColor }}>{d.name}</span>
      </div>

      {/* Header */}
      <div className="tw-lead-header" style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 48,
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`,
      }}>
        <div>
          <Eyebrow>{t.leadRoleLabels?.[d.type] || d.type} Intake · received {d.receivedAt}</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', color: headlineColor,
          }}>
            {d.firstName} <em style={{ fontStyle: 'italic' }}>{d.lastName}</em>
          </h1>
          <div style={{ marginTop: 18, display: 'flex', gap: 18, fontSize: 14, color: t.fgPage, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={`mailto:${d.email}`} style={{ fontWeight: 600, color: headlineColor, textDecoration: 'none' }}>{d.email}</a>
            <span style={{ color: t.fgFaint }}>·</span>
            <a href={`tel:${d.phone}`} style={{ fontWeight: 600, color: headlineColor, textDecoration: 'none' }}>{d.phone}</a>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end' }}>
          <div style={{
            fontFamily: t.eyebrowFont,
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: t.fgFaint,
          }}>Currently · <span style={{ color: headlineColor }}>{currentLabel}</span></div>
          <StatusChanger value={status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* Body */}
      <div className="tw-lead-body" style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 56, marginTop: 40,
      }}>
        {/* Intake answers */}
        <div>
          <Eyebrow color={t.accent}>The intake</Eyebrow>
          <div style={{ marginTop: 20 }}>
            {d.intake.map((r, i) => (
              <div key={i} className="tw-intake-row" style={{
                display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32,
                padding: '16px 0', borderBottom: `1px solid ${t.lineSoft}`,
              }}>
                <span style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: t.fgFaint,
                }}>{r.q}</span>
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 19,
                  color: t.palette.emerald, lineHeight: 1.4,
                }}>{r.a}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <Eyebrow color={t.accent}>Mandate notes</Eyebrow>
            {(() => {
              const hasNotes = d.mandateNotes && d.mandateNotes.trim().length > 0;
              return (
                <p style={{
                  marginTop: 16, padding: '20px 24px',
                  background: t.bgPanel, border: `1px solid ${t.line}`,
                  fontFamily: t.fonts.display, fontStyle: 'italic',
                  fontSize: 19, lineHeight: 1.55,
                  color: hasNotes ? t.palette.emerald : t.fgFaint,
                }}>{hasNotes ? d.mandateNotes : 'None'}</p>
              );
            })()}
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          <div style={{ padding: 24, background: t.bgPanel, border: `1px solid ${t.line}` }}>
            <Eyebrow color={t.accent}>Studio note</Eyebrow>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Add a private note about this lead…"
              style={{
                width: '100%', marginTop: 14, padding: 0,
                background: 'transparent', border: 'none',
                fontFamily: t.fonts.display, fontStyle: 'italic',
                fontSize: 16, color: t.palette.emerald,
                lineHeight: 1.5, minHeight: 110, resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`,
              fontFamily: t.eyebrowFont,
              fontSize: 9.5, fontWeight: 600,
              letterSpacing: '0.26em',
              textTransform: 'uppercase', color: t.fgFaint,
            }}>{noteSaving ? 'Saving…' : (noteSaved ? `Saved · ${noteSaved}` : 'Click out to save')}</div>
          </div>

          {/* The Tawny & Co. list — membership, and where it came from. */}
          <div style={{ marginTop: 32, padding: 24, background: t.bgPanel, border: `1px solid ${t.line}` }}>
            <Eyebrow color={t.accent}>The Tawny &amp; Co. list</Eyebrow>
            <p style={{
              marginTop: 14, fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 18, lineHeight: 1.5,
              color: d.onList ? t.palette.emerald : t.fgFaint,
            }}>
              {d.onList
                ? (d.listJoinedAt ? `On the list since ${formatStamp(d.listJoinedAt)}` : 'On the list')
                : (d.listUnsubscribedAt ? `Removed ${formatStamp(d.listUnsubscribedAt)}` : 'Not on the list')}
            </p>

            {/* On the list, but the unsubscribe stamp is still set: they were
                put back on by a public form submission rather than by the
                studio. Nothing verifies that whoever filled the form owns the
                address, so this is worth seeing before sending to them. */}
            {d.onList && d.listUnsubscribedAt && (
              <p style={{
                marginTop: 12, padding: '10px 12px',
                background: t.bgPage, border: `1px solid ${t.line}`,
                borderLeft: `2px solid ${t.accent}`,
                fontSize: 12.5, lineHeight: 1.55, color: t.fgMuted,
              }}>
                Re-joined through the form after asking to be removed on{' '}
                {formatStamp(d.listUnsubscribedAt)}. Confirm they meant to before
                including them in anything.
              </p>
            )}

            {d.onList && d.listSource && (
              <div style={{
                marginTop: 12, fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600,
                letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint,
              }}>Joined via {d.listSource.replace(/-/g, ' ')}</div>
            )}

            {!!d.listInterests?.length && (
              <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {d.listInterests.map(i => (
                  <span key={i} style={{
                    fontFamily: t.eyebrowFont, fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: t.fgMuted, border: `1px solid ${t.line}`,
                    background: t.bgPage, padding: '4px 8px', lineHeight: 1.2,
                  }}>{i}</span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleListToggle}
              disabled={listSaving}
              style={{
                marginTop: 18, padding: '9px 0', background: 'none', border: 'none',
                borderBottom: `1px solid ${t.line}`,
                fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600,
                letterSpacing: '0.24em', textTransform: 'uppercase',
                color: listSaving ? t.fgFaint : t.fgMuted,
                cursor: listSaving ? 'default' : 'pointer',
              }}
              onMouseEnter={e => { if (!listSaving) e.currentTarget.style.color = t.palette.emerald; }}
              onMouseLeave={e => { if (!listSaving) e.currentTarget.style.color = t.fgMuted; }}
            >
              {listSaving ? 'Saving…' : (d.onList ? 'Remove from list' : 'Add to list')}
            </button>
          </div>

          <div style={{ marginTop: 32 }}>
            <StudioLog
              leadId={d.id}
              leadCreatedAt={d.createdAt}
              leadWhen={d.when}
              bumpKey={logBump}
            />
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tw-lead-header  { grid-template-columns: 1fr !important; }
          .tw-lead-body    { grid-template-columns: 1fr !important; }
          .tw-intake-row   { grid-template-columns: 1fr !important; gap: 4px !important; }
        }
      `}</style>
    </AdminShell>
  );
}

// "May 22 · 10:08 AM" — short, human-readable; copes with both ISO strings
// and Date objects.
function formatStamp(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString([], {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}
