import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { STUDIO } from '../data/listings';
import Wordmark from './Wordmark';

function pathFor(item) {
  const key = item.toLowerCase();
  if (key === 'listings' || key === 'residences') return '/listings';
  if (key === 'about') return '/about';
  return '/';
}

export default function TopNav({ active, dark = false }) {
  const t = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const fg = dark ? '#FFFFFF' : t.palette.emerald;
  const muted = dark ? 'rgba(255,255,255,0.62)' : t.fgMuted;
  const line = dark ? 'rgba(255,255,255,0.16)' : t.line;
  const bg = dark ? 'transparent' : t.bgPage;

  return (
    <>
      <div className="tw-desktop-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 72px',
        borderBottom: `1px solid ${line}`,
        background: bg,
        position: 'relative', zIndex: 10,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={24} light={dark} sub={false} />
        </Link>
        <nav style={{ display: 'flex', gap: 40 }}>
          {t.navItems.map(it => (
            <Link key={it} to={pathFor(it)} style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: t.eyebrowFont,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: active === it ? fg : muted,
                borderBottom: active === it ? `1px solid ${fg}` : '1px solid transparent',
                paddingBottom: 4,
                cursor: 'pointer',
              }}>{it}</span>
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href={`tel:${STUDIO.phone.replace(/[^\d+]/g, '')}`} style={{
            fontFamily: t.eyebrowFont,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: muted,
            textDecoration: 'none',
          }}>{STUDIO.phone}</a>
          <Link to="/#inquiry" style={{ textDecoration: 'none' }}>
            <span style={{
              padding: '11px 22px',
              background: dark ? '#fff' : t.palette.emerald,
              color: dark ? t.palette.emerald : '#fff',
              border: !dark ? 'none' : `1px solid ${fg}`,
              fontFamily: t.eyebrowFont,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>{t.ctaNav} →</span>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tw-desktop-nav { display: none !important; }
          .tw-mobile-nav  { display: flex   !important; }
        }
        @media (min-width: 901px) {
          .tw-mobile-nav  { display: none   !important; }
        }
      `}</style>

      <div className="tw-mobile-nav" style={{
        display: 'none',
        justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px',
        borderBottom: mobileOpen ? 'none' : `1px solid ${line}`,
        background: bg,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={16} light={dark} sub={false} />
        </Link>
        <button onClick={() => setMobileOpen(o => !o)} aria-label="menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ width: 22, height: 1.5, background: fg }} />
          <span style={{ width: 22, height: 1.5, background: fg }} />
        </button>
      </div>
      {mobileOpen && (
        <div style={{
          background: dark ? 'rgba(11,11,10,0.96)' : t.bgPage,
          padding: '24px', borderBottom: `1px solid ${line}`,
        }}>
          {t.navItems.map(it => (
            <Link key={it} to={pathFor(it)} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <div style={{
                fontFamily: t.eyebrowFont, fontWeight: 500,
                fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: fg, padding: '14px 0', borderBottom: `1px solid ${line}`,
              }}>{it}</div>
            </Link>
          ))}
          <Link to="/#inquiry" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
            <div style={{
              marginTop: 20, padding: '14px 0', textAlign: 'center',
              border: `1px solid ${fg}`,
              background: t.palette.emerald,
              color: '#fff',
              fontFamily: t.eyebrowFont, fontWeight: 600,
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
            }}>{t.ctaPrimary} →</div>
          </Link>
        </div>
      )}
    </>
  );
}
