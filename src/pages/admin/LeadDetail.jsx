import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import AdminShell from '../../components/AdminShell';
import StatusChanger from '../../components/admin/StatusChanger';
import StudioLog from '../../components/admin/StudioLog';
import { useLead, updateLeadStatus, updateLeadNote } from '../../lib/queries';

export default function LeadDetail() {
  const t = useTheme();
  const isB = t.key === 'B';
  const { id } = useParams();
  const { data: d, loading, refresh } = useLead(id);

  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState('');
  const [status, setStatus] = useState('New');
  // Bump after every event write so StudioLog refetches and the new entry
  // appears immediately.
  const [logBump, setLogBump] = useState(0);

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

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const currentLabel = (t.leadStatusLabels[status] || status).toLowerCase();

  return (
    <AdminShell>
      {/* Breadcrumb */}
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: isB ? 10 : 10.5,
        fontWeight: isB ? 600 : 400,
        letterSpacing: isB ? '0.28em' : '0.22em',
        textTransform: 'uppercase',
        color: t.fgFaint, marginBottom: 24,
      }}>
        <Link to="/admin" style={{ color: t.fgFaint, textDecoration: 'none' }}>Leads</Link>
        {' / '}{d.type}s{' / '}
        <span style={{ color: headlineColor }}>{d.name}</span>
      </div>

      {/* Header */}
      <div className="tw-lead-header" style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 48,
        paddingBottom: 32, borderBottom: `1px solid ${t.line}`,
      }}>
        <div>
          <Eyebrow>{d.type} Intake · received {d.receivedAt}</Eyebrow>
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
            fontSize: isB ? 9.5 : 9.5,
            fontWeight: isB ? 600 : 400,
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
                  fontSize: isB ? 10 : 10.5,
                  fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.28em' : '0.22em',
                  textTransform: 'uppercase', color: t.fgFaint,
                }}>{r.q}</span>
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 19,
                  color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.4,
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
                  color: hasNotes ? (isB ? t.palette.emerald : t.fgPage) : t.fgFaint,
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
                fontSize: 16, color: isB ? t.palette.emerald : t.fgPage,
                lineHeight: 1.5, minHeight: 110, resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 9.5 : 10, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.2em',
              textTransform: 'uppercase', color: t.fgFaint,
            }}>{noteSaving ? 'Saving…' : (noteSaved ? `Saved · ${noteSaved}` : 'Click out to save')}</div>
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
