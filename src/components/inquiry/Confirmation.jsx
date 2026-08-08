import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';
import Photo, { PHOTOS } from '../Photo';
import { visibleAnswers } from '../../lib/inquirySchema';

// Reads as a reply, not a receipt. Shows back exactly what was sent, so the
// person has a record without needing an email to arrive first.
export default function Confirmation({ service, values }) {
  const t = useTheme();
  const rows = visibleAnswers(service, values).filter(r => r.answer);
  const email = String(values.email || '').trim();

  return (
    <div>
      <div style={{
        background: t.palette.emeraldDeep, color: '#F8F5EE',
        padding: 'clamp(44px, 8vw, 96px) clamp(20px, 5vw, 72px)', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Eyebrow color={t.accentSoft} style={{ textAlign: 'center' }}>
            Inquiry received · {service ? service.short : 'Inquiry'}
          </Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(34px, 5.2vw, 60px)', lineHeight: 1.06,
            letterSpacing: '-0.02em', color: '#F8F5EE', margin: '22px 0 0',
          }}>
            Thank you. We’ve <em style={{ fontStyle: 'italic', color: t.accentSoft }}>received your inquiry.</em>
          </h1>
          <p style={{
            fontSize: 'clamp(14.5px, 1.6vw, 16.5px)', lineHeight: 1.8,
            color: 'rgba(248,245,238,0.82)', marginTop: 24,
          }}>
            Tawny will review the details you shared and follow up with thoughtful
            next steps based on your goals.
          </p>
          <div className="tcf-dark tw-confirm-actions" style={{
            display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap',
          }}>
            <Link to="/listings" className="tcf-btn" style={{ textDecoration: 'none' }}>
              Explore current properties →
            </Link>
            <Link
              to="/" className="tcf-btn tcf-btn-ghost"
              style={{ textDecoration: 'none', borderColor: 'rgba(248,245,238,0.4)', color: '#F8F5EE', background: 'transparent' }}
            >
              Return to the homepage
            </Link>
          </div>
        </div>
      </div>

      <div className="tw-confirm-body" style={{
        padding: 'clamp(36px, 6vw, 72px) clamp(20px, 5vw, 72px)',
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(32px, 5vw, 64px)',
        maxWidth: 1296, margin: '0 auto',
      }}>
        <div>
          <Eyebrow>What you sent</Eyebrow>
          <div style={{
            marginTop: 16, border: `1px solid ${t.line}`,
            padding: 'clamp(18px, 2.5vw, 26px) clamp(20px, 3vw, 32px)', background: t.bgPanel,
          }}>
            {rows.map(r => (
              <div key={r.name} className="tw-confirm-row" style={{
                display: 'grid', gridTemplateColumns: '190px 1fr', gap: 20,
                padding: '11px 0', borderBottom: `1px solid ${t.lineSoft}`,
              }}>
                <span style={{
                  fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint,
                }}>{r.label}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: t.palette.emerald, wordBreak: 'break-word' }}>
                  {r.answer}
                </span>
              </div>
            ))}
            <p style={{
              fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16,
              lineHeight: 1.6, color: t.fgMuted, marginTop: 20,
            }}>
              {email
                ? <>Tawny will reply to {email} directly.</>
                : <>Tawny will be in touch on the number you left.</>}
            </p>
          </div>
        </div>

        <div>
          <Photo src={PHOTOS.kitchenMarbleIsl} label="BIRMINGHAM RESIDENCE" tone="bloom" height={300} />
          <div style={{ marginTop: 26, paddingTop: 24, borderTop: `1px solid ${t.line}` }}>
            <Eyebrow>One more thing</Eyebrow>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: t.fgMuted, marginTop: 12 }}>
              You’ve also been added to Tawny’s contact list, so you’ll hear about
              new and off-market listings as they come up. Ask any time and she’ll
              take you off it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
