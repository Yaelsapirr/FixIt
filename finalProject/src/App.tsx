import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchResultsPage from './pages/SearchResultsPage';
import RepairGuidePage from './pages/RepairGuidePage';
import SuccessPage from './pages/SuccessPage';
import TechniciansPage from './pages/TechniciansPage';
import StoresPage from './pages/StoresPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/guide/:id" element={<RepairGuidePage />} />
        <Route path="/repair/:id" element={<RepairGuidePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/technicians" element={<TechniciansPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
