import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { DirectionProvider } from './theme/DirectionContext';
import Landing from './pages/Landing';
import Listings from './pages/Listings';
import SoldArchive from './pages/SoldArchive';
import ListingDetail from './pages/ListingDetail';
import Inquiry from './pages/Inquiry';
import About from './pages/About';
import Privacy from './pages/Privacy';
import LeadsInbox from './pages/admin/LeadsInbox';
import LeadDetail from './pages/admin/LeadDetail';
import ListingsManager from './pages/admin/ListingsManager';
import AddListing from './pages/admin/AddListing';
import Login from './pages/admin/Login';
import { useIsAdmin } from './lib/queries';

function RequireAdmin({ children }) {
  const isAdmin = useIsAdmin();
  if (isAdmin === 'checking') {
    // Neutral loader — doesn't paint anything that could leak admin chrome
    // before the session check resolves.
    return (
      <div style={{
        minHeight: '100dvh', display: 'grid', placeItems: 'center',
        background: '#FFFFFF', color: '#97A095',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase',
      }}>Checking session…</div>
    );
  }
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

// Scroll to the hash target after every navigation event (React Router doesn't
// by default). Polls briefly because the target may render after the route
// mounts (e.g. embedded InquiryWidget hydrates after Landing's first paint).
//
// Keys on `location.key` (not just hash/pathname) so clicking the same hash
// link twice still triggers a scroll.
function HashScroller() {
  const location = useLocation();
  const { hash, pathname, key } = location;
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = hash.slice(1);
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 20) {
        requestAnimationFrame(tick);
      } else {
        console.warn(`[tw] HashScroller: no element found for #${id} after 20 frames`);
      }
    };
    requestAnimationFrame(tick);
  }, [hash, pathname, key]);
  return null;
}

export default function App() {
  return (
    <DirectionProvider>
      <BrowserRouter>
        <HashScroller />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/sold" element={<SoldArchive />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RequireAdmin><LeadsInbox /></RequireAdmin>} />
          <Route path="/admin/lead/:id" element={<RequireAdmin><LeadDetail /></RequireAdmin>} />
          <Route path="/admin/listings" element={<RequireAdmin><ListingsManager /></RequireAdmin>} />
          <Route path="/admin/listings/add" element={<RequireAdmin><AddListing /></RequireAdmin>} />
          <Route path="/admin/listings/:id/edit" element={<RequireAdmin><AddListing /></RequireAdmin>} />
          <Route path="/studio/preview/:id" element={<RequireAdmin><ListingDetail /></RequireAdmin>} />
        </Routes>
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </DirectionProvider>
  );
}
