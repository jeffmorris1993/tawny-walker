import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../../components/Eyebrow';
import StatusChip from '../../components/StatusChip';
import AdminShell from '../../components/AdminShell';
import { LEAD_DETAIL } from '../../data/leads';

// Note: `:id` deep-link is supported by the route but the demo only renders
// LEAD_DETAIL (Marisol Vega). In production a fetch would resolve `id` to a
// detail object of the same shape.

export default function LeadDetail() {
  const t = useTheme();
  const isB = t.key === 'B';
  const d = LEAD_DETAIL;
  const [note, setNote] = useState(d.studioNote);

  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const primaryBg = isB ? t.palette.emerald : t.palette.ink;
  const primaryFg = isB ? '#fff' : t.palette.bone;
  const secondaryBorder = isB ? t.palette.emerald : t.palette.ink;
  const secondaryFg = isB ? t.palette.emerald : t.fgPage;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
          <StatusChip status={d.status} size="lg" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{
              padding: '12px 18px', border: `1px solid ${secondaryBorder}`,
              color: secondaryFg,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 10.5, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>Mark Contacted</span>
            <span style={{
              padding: '12px 18px', background: primaryBg, color: primaryFg,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 10.5, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>Reply →</span>
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
            <Eyebrow>Activity</Eyebrow>
            <div style={{ marginTop: 18 }}>
              {d.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: `1px solid ${t.lineSoft}` }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: a.highlight ? t.accent : t.fgFaint,
                    marginTop: 6, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: isB ? t.palette.emerald : t.fgPage }}>{a.t}</div>
                    <div style={{
                      fontSize: 10.5, color: t.fgFaint,
                      letterSpacing: '0.06em', marginTop: 2,
                    }}>{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32, padding: 24, border: `1px solid ${t.line}` }}>
            <Eyebrow>Suggested listings to surface</Eyebrow>
            <div style={{ marginTop: 16 }}>
              {d.suggested.map(s => (
                <div key={s.t} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '12px 0', borderBottom: `1px solid ${t.lineSoft}`,
                }}>
                  <div>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: 17,
                      color: isB ? t.palette.emerald : t.fgPage,
                    }}>{s.t}</div>
                    <div style={{ fontSize: 10.5, color: t.fgFaint, letterSpacing: '0.06em' }}>
                      {s.sub} · {t.statusLabels[s.subStatus] || s.subStatus}
                    </div>
                  </div>
                  <span style={{ fontFamily: t.fonts.display, fontSize: 16, color: t.fgMuted }}>{s.price}</span>
                </div>
              ))}
            </div>
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
