import { useTheme } from '../theme/DirectionContext';
import Eyebrow from './Eyebrow';
import Rule from './Rule';
import ListSignup from './ListSignup';

// "Join the Tawny & Co. List" — the quiet paper section that replaced the
// emerald inquiry block on the home page. Design §5.2, minimal paper section,
// centred: a narrow column of centred type above a left-aligned form.
//
// The clarifier line at the bottom matters. This section sits where a lead
// capture used to be, and it should never be mistaken for one.
export default function ListSection({ id = 'list' }) {
  const t = useTheme();

  return (
    <div
      id={id}
      style={{
        background: t.bgPanel,
        padding: 'clamp(56px, 8vw, 104px) clamp(20px, 5vw, 72px)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <Rule width={320} />
        </div>

        <Eyebrow>The Tawny &amp; Co. List</Eyebrow>

        <h2 style={{
          fontFamily: t.fonts.display, fontWeight: 400,
          fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1,
          letterSpacing: '-0.018em', color: t.palette.emerald,
          margin: '20px 0 0',
        }}>
          Join the <em style={{ fontStyle: 'italic' }}>Tawny &amp; Co.</em> List
        </h2>

        <p style={{
          fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: 1.8,
          color: t.fgMuted, margin: '20px auto 0', maxWidth: 560,
        }}>
          Occasional notes from Tawny. New listings, off-market opportunities,
          and what’s happening in the market.
        </p>

        {/* Left-aligned inside the centred column: centred labels and inputs
            read as a poster, not a form you can fill in. */}
        <div style={{ maxWidth: 560, margin: '40px auto 0', textAlign: 'left' }}>
          <ListSignup source="home-list" />
        </div>
      </div>
    </div>
  );
}
