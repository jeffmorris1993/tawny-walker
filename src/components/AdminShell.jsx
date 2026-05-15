import { Link, useLocation } from 'react-router-dom';
import { TW } from '../tokens';
import Wordmark from './Wordmark';

const NAV_ITEMS = [
  { l: 'Leads', path: '/admin', n: '12', dot: TW.bronze },
  { l: 'Listings', path: '/admin/listings', n: '9' },
  { l: 'Sold Archive', path: '#', n: '184' },
  { l: 'Journal', path: '#' },
  { l: 'Settings', path: '#' },
];

export default function AdminShell({ children }) {
  const location = useLocation();

  const active = NAV_ITEMS.find(i => i.path !== '#' && location.pathname === i.path)?.l
    || (location.pathname === '/admin' ? 'Leads' : 'Listings');

  return (
    <div style={{ minHeight: '100vh', background: TW.bone, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: TW.ink, display: 'flex' }}>
      {/* sidebar */}
      <aside style={{ width: 240, borderRight: `1px solid ${TW.line}`, background: TW.paper, padding: '32px 24px', display: 'flex', flexDirection: 'column', flexShrink: 0 }} className="tw-admin-sidebar">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={18} sub={false} />
        </Link>
        <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: TW.ink3, marginTop: 4 }}>The Studio · Private</div>

        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(it => (
            <Link key={it.l} to={it.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: active === it.l ? TW.bone : 'transparent',
                border: active === it.l ? `1px solid ${TW.line}` : '1px solid transparent',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {it.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: it.dot }} />}
                  <span style={{ fontSize: 13, color: TW.ink }}>{it.l}</span>
                </span>
                {it.n && <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 14, color: TW.ink3 }}>{it.n}</span>}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${TW.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: TW.ink, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              color: TW.bone, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 15,
            }}>TW</div>
            <div>
              <div style={{ fontSize: 12, color: TW.ink }}>Tawny Walker</div>
              <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: TW.ink3 }}>Principal</div>
            </div>
          </div>
        </div>
      </aside>

      {/* main */}
      <main style={{ flex: 1, padding: '40px 56px 64px', minWidth: 0 }} className="tw-admin-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .tw-admin-sidebar { width: 200px !important; padding: 24px 16px !important; }
          .tw-admin-main { padding: 24px 24px 48px !important; }
        }
        @media (max-width: 600px) {
          .tw-admin-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
