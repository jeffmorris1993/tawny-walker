import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Listings from './pages/Listings';
import Inquiry from './pages/Inquiry';
import LeadsInbox from './pages/admin/LeadsInbox';
import LeadDetail from './pages/admin/LeadDetail';
import ListingsManager from './pages/admin/ListingsManager';
import AddListing from './pages/admin/AddListing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/admin" element={<LeadsInbox />} />
        <Route path="/admin/lead/:id" element={<LeadDetail />} />
        <Route path="/admin/listings" element={<ListingsManager />} />
        <Route path="/admin/listings/add" element={<AddListing />} />
      </Routes>
    </BrowserRouter>
  );
}
