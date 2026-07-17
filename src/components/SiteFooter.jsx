import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { STUDIO } from '../data/listings';
import Wordmark from './Wordmark';

const INSTAGRAM_URL = 'https://www.instagram.com/tawny2walker/';
const FACEBOOK_URL  = 'https://www.facebook.com/TawnyThieuWalker';
const LINKEDIN_URL  = 'https://www.linkedin.com/in/tawnythieuwalker/';

export default function SiteFooter() {
  const t = useTheme();

  // Emerald-deep slab, ivory text.
  const bg = t.palette.emeraldDeep;
  const fg = 'rgba(248,245,238,0.7)';
  const labelColor = t.accentSoft;
  const ruleColor = 'rgba(248,245,238,0.14)';

  const columns = [
    {
      h: 'Office',
      items: [
        ...STUDIO.address.map(line => ({ label: line })),
        { label: STUDIO.phone, href: `tel:${STUDIO.phone.replace(/[^\d+]/g, '')}` },
        { label: STUDIO.email, href: `mailto:${STUDIO.email}` },
      ],
    },
    { h: 'Explore', items: [
      { label: 'Active Listings', to: '/listings' },
      { label: 'Sold', to: '/listings/sold' },
    ] },
    { h: 'Follow', items: [
      { label: 'Instagram', href: INSTAGRAM_URL },
      { label: 'Facebook', href: FACEBOOK_URL },
      { label: 'LinkedIn', href: LINKEDIN_URL },
    ] },
  ];

  return (
    <footer style={{
      padding: '64px 64px 40px',
      borderTop: 'none',
      background: bg, color: fg,
      fontFamily: t.fonts.body,
    }}>
      <div className="tw-footer-grid" style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48,
        maxWidth: 1296, margin: '0 auto',
      }}>
        <div>
          <Wordmark size={26} light={true} sub={false} />
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 17, color: 'rgba(248,245,238,0.78)',
            marginTop: 24, maxWidth: 380, lineHeight: 1.55, fontWeight: 400,
          }}>
            I partner with the best in the business, experts who have your back from day one to closing day. I&apos;m more than a salesperson; I&apos;m your trusted advisor and advocate, here to guide you, protect your interests, and make every step of your real estate journey seamless.
          </p>
        </div>
        {columns.map(col => (
          <div key={col.h}>
            <div style={{
              fontFamily: t.eyebrowFont,
              fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: labelColor, marginBottom: 16,
            }}>{col.h}</div>
            {col.items.map(item => {
              const itemStyle = {
                fontFamily: t.fonts.body, fontSize: 13,
                color: fg, marginBottom: 8, lineHeight: 1.5,
              };
              if (item.href) {
                const isExternal = /^https?:/i.test(item.href);
                return (
                  <a key={item.label} href={item.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    style={{ ...itemStyle, display: 'block', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                );
              }
              if (item.to) {
                return (
                  <Link key={item.label} to={item.to}
                    style={{ ...itemStyle, display: 'block', textDecoration: 'none' }}>
                    {item.label}
                  </Link>
                );
              }
              return <div key={item.label} style={itemStyle}>{item.label}</div>;
            })}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        maxWidth: 1296, margin: '32px auto 0',
        paddingTop: 24, borderTop: `1px solid ${ruleColor}`,
        fontFamily: t.eyebrowFont,
        fontSize: 10.5, fontWeight: 500,
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: 'rgba(248,245,238,0.45)',
      }}>
        <span>© 2026 Tawny & Co. · {STUDIO.brokeredBy}</span>
        <Link to="/privacy" style={{
          color: 'inherit', textDecoration: 'none', letterSpacing: 'inherit',
        }}>Privacy Policy</Link>
        <span>Equal Housing Opportunity</span>
      </div>

      <div style={{
        maxWidth: 1296, margin: '16px auto 0',
        textAlign: 'left',
        fontFamily: t.eyebrowFont,
        fontSize: 10.5, fontWeight: 500,
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: 'rgba(248,245,238,0.45)',
      }}>
        Designed by{' '}
        <a href="https://sirromstudios.com" target="_blank" rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'none', letterSpacing: 'inherit' }}>
          Sirrom Studios
        </a>
      </div>

      {/* Reserve space so the floating direction toggle never overlaps text */}
      <div style={{ height: 56, opacity: 0, pointerEvents: 'none' }} aria-hidden="true" />

      <style>{`
        @media (max-width: 900px) {
          .tw-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
