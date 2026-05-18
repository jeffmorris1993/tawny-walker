import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DirectionProvider } from './theme/DirectionContext';
import DirectionToggle from './components/DirectionToggle';
import Landing from './pages/Landing';
import Listings from './pages/Listings';
import Inquiry from './pages/Inquiry';
import About from './pages/About';
import LeadsInbox from './pages/admin/LeadsInbox';
import LeadDetail from './pages/admin/LeadDetail';
import ListingsManager from './pages/admin/ListingsManager';
import AddListing from './pages/admin/AddListing';

// Show the A/B toggle on public routes only — admin is intentionally fixed.
function PublicChrome() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <DirectionToggle />;
}

// Scroll to the hash target after route changes (React Router doesn't by default).
// Polls briefly because the target section may render after the route mounts
// (e.g. embedded InquiryWidget hydrates after Landing's first paint).
function HashScroller() {
  const { hash, pathname } = useLocation();
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
      }
    };
    requestAnimationFrame(tick);
  }, [hash, pathname]);
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
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<LeadsInbox />} />
          <Route path="/admin/lead/:id" element={<LeadDetail />} />
          <Route path="/admin/listings" element={<ListingsManager />} />
          <Route path="/admin/listings/add" element={<AddListing />} />
        </Routes>
        <PublicChrome />
      </BrowserRouter>
    </DirectionProvider>
  );
}
