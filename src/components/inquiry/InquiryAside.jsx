import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';
import Photo, { PHOTOS } from '../Photo';
import { STEPS } from '../../data/inquiryServices';

// The dark editorial half of the split screen. Its copy answers whichever
// direction has been chosen, so the page keeps talking back as you move
// through it rather than sitting as static decoration.
export default function InquiryAside({ service, step }) {
  const t = useTheme();

  return (
    <div
      className="tcf-dark tw-inquiry-aside"
      style={{
        background: t.palette.emeraldDeep,
        color: '#F8F5EE',
        padding: 'clamp(30px, 5vw, 72px) clamp(24px, 4vw, 64px) clamp(34px, 4vw, 56px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Eyebrow color={t.accentSoft}>Private inquiry · Reviewed personally</Eyebrow>

      <h1 style={{
        fontFamily: t.fonts.display, fontWeight: 400,
        fontSize: 'clamp(38px, 4.6vw, 62px)', lineHeight: 1.06,
        letterSpacing: '-0.018em', color: '#F8F5EE', margin: 'clamp(14px, 2vw, 24px) 0 0',
      }}>
        Let’s start with<br />
        <em style={{ fontStyle: 'italic', color: t.accentSoft }}>your goals.</em>
      </h1>

      <p style={{
        fontSize: 'clamp(14px, 1.4vw, 15.5px)', lineHeight: 1.75,
        color: 'rgba(248,245,238,0.78)', margin: '20px 0 0', maxWidth: 430,
      }}>
        Tell us a little about what you’re looking to accomplish, and we’ll help
        guide the next step.
      </p>

      <div className="tw-inquiry-aside-photo" style={{ marginTop: 40 }}>
        <Photo src={PHOTOS.livingMarble} label="BIRMINGHAM RESIDENCE · LIVING ROOM" tone="dusk" height={300} />
      </div>

      <div style={{
        marginTop: 'clamp(20px, 3vw, 34px)', paddingTop: 'clamp(20px, 2.5vw, 30px)',
        borderTop: '1px solid rgba(248,245,238,0.16)',
      }}>
        <Eyebrow color={t.accent}>{service ? service.tagline : 'Before you begin'}</Eyebrow>
        <p style={{
          fontSize: 'clamp(13.5px, 1.3vw, 14.5px)', lineHeight: 1.75,
          color: 'rgba(248,245,238,0.8)', marginTop: 14,
        }}>
          {service
            ? service.ctx
            : 'A few short questions, then a conversation. Nothing you share is passed to a third party.'}
        </p>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 'clamp(17px, 1.8vw, 20px)', lineHeight: 1.5,
          color: '#F8F5EE', marginTop: 22,
        }}>
          {service
            ? service.quote
            : '“Every good conversation about a house begins with what you actually want from it.”'}
          <span style={{
            display: 'block', fontFamily: t.eyebrowFont, fontStyle: 'normal',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.28em',
            color: t.accentSoft, marginTop: 14,
          }}>TAWNY WALKER</span>
        </p>
      </div>

      <div className="tw-inquiry-aside-foot" style={{
        marginTop: 'auto', paddingTop: 42,
        display: 'flex', justifyContent: 'space-between', gap: 16,
        fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 500,
        letterSpacing: '0.26em', textTransform: 'uppercase',
        color: 'rgba(248,245,238,0.5)',
      }}>
        <span>Reply within 1 business day</span>
        <span>Step {step + 1} / {STEPS.length}</span>
      </div>
    </div>
  );
}
