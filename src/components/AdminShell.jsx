import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Wordmark from './Wordmark';
import { ADMIN_NAV_KEYS } from '../data/leads';
import { signOut, useLeadTotal, useListingTotal } from '../lib/queries';

const NAV_PATHS = {
  Leads: '/admin',
  Listings: '/admin/listings',
  Settings: '#',
};

export default function AdminShell({ children }) {
  const t = useTheme();
  const a = t.admin;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeKey = pathname.startsWith('/admin/listings') ? 'Listings' : 'Leads';

  // Count-only round-trips (HEAD requests) — no row payload. Avoids
  // re-pulling both tables on every admin navigation just for the sidebar
  // badges.
  const leadTotal = useLeadTotal();
  const listingTotal = useListingTotal();
  const navCounts = {
    Leads: leadTotal || null,
    Listings: listingTotal || null,
  };

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="tw-admin-root" style={{
      height: '100dvh', background: t.bgPage,
      fontFamily: t.fonts.body, color: t.fgPage, display: 'flex',
      overflow: 'hidden',
    }}>
      {/* sidebar */}
      <aside className="tw-admin-sidebar" style={{
        width: 240, flexShrink: 0,
        background: a.sidebarBg, color: a.sidebarFg,
        borderRight: `1px solid transparent`,
        padding: '32px 24px',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={18} light={true} sub={false} color={a.sidebarFg} />
        </Link>
        <div style={{
          fontFamily: t.eyebrowFont,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: a.sidebarSubLabel,
          marginTop: 10,
        }}>The Studio · Private</div>

        <nav style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ADMIN_NAV_KEYS.map(key => {
            const isActive = key === activeKey;
            const label = a.navLabels[key] || key;
            const count = navCounts[key];
            const path = NAV_PATHS[key] || '#';
            return (
              <Link key={key} to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px',
                  background: isActive ? a.sidebarActiveBg : 'transparent',
                  border: `1px solid ${isActive ? a.sidebarActiveBorder : 'transparent'}`,
                  transition: 'background 0.15s',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: a.sidebarFg }}>{label}</span>
                  </span>
                  {count && (
                    <span style={{
                      fontFamily: t.fonts.display, fontStyle: 'italic',
                      fontSize: 14, color: a.sidebarBadge,
                    }}>{count}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${a.sidebarDivider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: a.avatarBg, color: a.avatarFg,
              display: 'grid', placeItems: 'center', flexShrink: 0,
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 15, fontWeight: 500,
            }}>TW</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, color: a.sidebarFg }}>Tawny Walker</div>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  marginTop: 2,
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: t.eyebrowFont,
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: a.sidebarSubLabel,
                }}
              >Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="tw-admin-main" style={{
        flex: 1, padding: 'clamp(24px, 3.5vw, 40px) clamp(24px, 4vw, 56px) 64px',
        minWidth: 0, minHeight: 0,
        overflowY: 'auto',
      }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .tw-admin-root    { flex-direction: column !important; }
          .tw-admin-sidebar {
            width: 100% !important;
            flex-direction: row !important;
            align-items: center !important;
            padding: 16px 20px !important;
            border-right: none !important;
            border-bottom: 1px solid ${a.sidebarDivider} !important;
            gap: 16px !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            flex-shrink: 0;
          }
          .tw-admin-sidebar > a:first-child { flex-shrink: 0; }
          .tw-admin-sidebar > div:nth-child(2) { display: none !important; }
          .tw-admin-sidebar nav {
            margin-top: 0 !important;
            flex-direction: row !important;
            flex: 1;
            gap: 4px !important;
          }
          .tw-admin-sidebar nav > a > div { padding: 8px 12px !important; }
          .tw-admin-sidebar > div:last-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
            border-top: none !important;
            flex-shrink: 0;
          }
          .tw-admin-sidebar > div:last-child > div > div:last-child { display: none; }
        }
        @media (max-width: 600px) {
          .tw-admin-sidebar nav > a > div span:last-child { display: none; }
        }
      `}</style>
    </div>
  );
}
