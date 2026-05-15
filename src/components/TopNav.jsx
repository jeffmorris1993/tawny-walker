import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TW } from '../tokens';
import Wordmark from './Wordmark';

const NAV_ITEMS = ['Listings', 'Buyers', 'Sellers', 'Investors', 'About', 'Journal'];

export default function TopNav({ active, dark = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const fg = dark ? '#FFFFFF' : TW.ink;
  const muted = dark ? 'rgba(255,255,255,0.62)' : TW.ink2;
  const line = dark ? 'rgba(255,255,255,0.14)' : TW.line;

  const navItemPath = (item) => {
    if (item === 'Listings') return '/listings';
    if (item === 'Buyers' || item === 'Sellers' || item === 'Investors') return '/inquiry';
    return '#';
  };

  return (
    <>
      {/* Desktop nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 64px',
        borderBottom: `1px solid ${line}`,
      }} className="tw-desktop-nav">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={22} color={fg} sub={false} />
        </Link>
        <nav style={{ display: 'flex', gap: 36 }}>
          {NAV_ITEMS.map(it => (
            <Link key={it} to={navItemPath(it)} style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 11.5, letterSpacing: '0.22em', textTransform: 'uppercase',
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
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: 11.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted,
          }}>morristechnologies1@gmail.com</span>
          <Link to="/inquiry" style={{ textDecoration: 'none' }}>
            <span style={{
              padding: '10px 18px', border: `1px solid ${fg}`, color: fg,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>Consultation →</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <style>{`
        @media (max-width: 768px) {
          .tw-desktop-nav { display: none !important; }
          .tw-mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .tw-mobile-nav { display: none !important; }
        }
      `}</style>
      <div className="tw-mobile-nav" style={{
        display: 'none',
        justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px',
        borderBottom: mobileOpen ? 'none' : `1px solid ${line}`,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={16} color={fg} sub={false} />
        </Link>
        <button onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ width: 22, height: 1.5, background: fg, display: 'block' }} />
          <span style={{ width: 22, height: 1.5, background: fg, display: 'block' }} />
        </button>
      </div>
      {mobileOpen && (
        <div style={{ background: dark ? 'rgba(27,27,26,0.96)' : TW.bone, padding: '24px', borderBottom: `1px solid ${line}` }}
          className="tw-mobile-nav">
          {NAV_ITEMS.map(it => (
            <Link key={it} to={navItemPath(it)} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <div style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: fg, padding: '14px 0', borderBottom: `1px solid ${line}`,
              }}>{it}</div>
            </Link>
          ))}
          <Link to="/inquiry" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
            <div style={{ marginTop: 20, padding: '14px 0', textAlign: 'center', border: `1px solid ${fg}`,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: fg }}>
              Start Your Inquiry →
            </div>
          </Link>
        </div>
      )}
    </>
  );
}
