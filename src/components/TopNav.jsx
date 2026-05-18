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
  const isB = t.key === 'B';
  const [mobileOpen, setMobileOpen] = useState(false);

  const fg = dark ? '#FFFFFF' : (isB ? t.palette.emerald : t.palette.ink);
  const muted = dark ? 'rgba(255,255,255,0.62)' : t.fgMuted;
  const line = dark ? 'rgba(255,255,255,0.16)' : t.line;
  const bg = dark ? 'transparent' : t.bgPage;

  return (
    <>
      <div className="tw-desktop-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isB ? '28px 72px' : '24px 64px',
        borderBottom: `1px solid ${line}`,
        background: bg,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={isB ? 24 : 22} light={dark} sub={false} />
        </Link>
        <nav style={{ display: 'flex', gap: isB ? 40 : 36 }}>
          {t.navItems.map(it => (
            <Link key={it} to={pathFor(it)} style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: t.eyebrowFont,
                fontSize: isB ? 11 : 11.5,
                fontWeight: isB ? 500 : 400,
                letterSpacing: isB ? '0.24em' : '0.22em',
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
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 11 : 11.5,
            fontWeight: isB ? 500 : 400,
            letterSpacing: isB ? '0.18em' : '0.2em',
            textTransform: 'uppercase',
            color: muted,
          }}>{STUDIO.phone}</span>
          <Link to="/#inquiry" style={{ textDecoration: 'none' }}>
            <span style={{
              padding: isB ? '11px 22px' : '10px 18px',
              background: dark ? '#fff' : (isB ? t.palette.emerald : 'transparent'),
              color: dark ? (isB ? t.palette.emerald : t.palette.ink) : (isB ? '#fff' : fg),
              border: isB && !dark ? 'none' : `1px solid ${fg}`,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 10.5 : 11,
              fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.24em' : '0.22em',
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
                fontFamily: t.eyebrowFont, fontWeight: isB ? 500 : 400,
                fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: fg, padding: '14px 0', borderBottom: `1px solid ${line}`,
              }}>{it}</div>
            </Link>
          ))}
          <Link to="/#inquiry" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
            <div style={{
              marginTop: 20, padding: '14px 0', textAlign: 'center',
              border: `1px solid ${fg}`,
              background: isB ? t.palette.emerald : 'transparent',
              color: isB ? '#fff' : fg,
              fontFamily: t.eyebrowFont, fontWeight: isB ? 600 : 400,
              fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
            }}>{t.ctaPrimary} →</div>
          </Link>
        </div>
      )}
    </>
  );
}
