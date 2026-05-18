import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import AdminShell from '../../components/AdminShell';
import StatusChanger from '../../components/admin/StatusChanger';
import StudioLog from '../../components/admin/StudioLog';
import AttachedListings from '../../components/admin/AttachedListings';
import { LEAD_DETAIL } from '../../data/leads';

// Demo only renders LEAD_DETAIL (Marisol Vega). In production `:id` would
// resolve to a detail of the same shape.

export default function LeadDetail() {
  const t = useTheme();
  const isB = t.key === 'B';
  const d = LEAD_DETAIL;

  const [note, setNote] = useState(d.studioNote);
  const [status, setStatus] = useState(d.status);
  const [attached, setAttached] = useState(d.attached);

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const currentLabel = (t.statusLabels[status] || status).toLowerCase();

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
          <Eyebrow>Lead № {d.number} · {d.type} Intake · received {d.receivedAt}</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 3.9vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', color: headlineColor,
          }}>
            {d.firstName} <em style={{ fontStyle: 'italic' }}>{d.lastName}</em>
          </h1>
          <div style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 20, color: t.fgMuted, marginTop: 6,
          }}>{d.entity} · {d.city}</div>
          <div style={{ marginTop: 18, display: 'flex', gap: 18, fontSize: 12, color: t.fgMuted, flexWrap: 'wrap' }}>
            <span>{d.email}</span>
            <span style={{ color: t.fgFaint }}>·</span>
            <span>{d.phone}</span>
            <span style={{ color: t.fgFaint }}>·</span>
            <span>Referred by — {d.referredBy}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end' }}>
          <div style={{
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 9.5 : 9.5,
            fontWeight: isB ? 600 : 400,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: t.fgFaint,
          }}>Currently — <span style={{ color: headlineColor }}>{currentLabel}</span></div>
          <StatusChanger value={status} onChange={setStatus} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button style={{
              padding: '10px 16px', border: `1px solid ${t.line}`,
              background: 'transparent', color: t.fgMuted,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10 : 10.5,
              fontWeight: isB ? 600 : 400,
              letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer',
            }}>Archive</button>
          </div>
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
            <p style={{
              marginTop: 16, padding: '20px 24px',
              background: t.bgPanel, border: `1px solid ${t.line}`,
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 19, lineHeight: 1.55,
              color: isB ? t.palette.emerald : t.fgPage,
            }}>{d.mandateNotes}</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          <div style={{ padding: 24, background: t.bgPanel, border: `1px solid ${t.line}` }}>
            <Eyebrow color={t.accent}>Studio note</Eyebrow>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{
                width: '100%', marginTop: 14, padding: 0,
                background: 'transparent', border: 'none',
                fontFamily: t.fonts.display, fontStyle: 'italic',
                fontSize: 16, color: isB ? t.palette.emerald : t.fgPage,
                lineHeight: 1.5, minHeight: 110, resize: 'none', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.line}`,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 9.5 : 10, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.2em',
              textTransform: 'uppercase', color: t.fgFaint,
            }}>Saved · {d.studioNoteSavedAt}</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <StudioLog items={d.studioLog} />
          </div>

          <AttachedListings
            attached={attached}
            onRemove={id => setAttached(list => list.filter(a => a.id !== id))}
          />
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
