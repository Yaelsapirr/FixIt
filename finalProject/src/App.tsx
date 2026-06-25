import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchResultsPage from './pages/SearchResultsPage';
import RepairGuidePage from './pages/RepairGuidePage';
import SuccessPage from './pages/SuccessPage';
import TechniciansPage from './pages/TechniciansPage';
import StoresPage from './pages/StoresPage';
import ProfilePage from './pages/ProfilePage';
import { supabase } from './lib/supabase';

// Redirects to /profile after a fresh sign-in (email or Google OAuth)
function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Read current path at event time (avoids stale closure)
        const path = window.location.pathname;
        if (path === '/' || path === '/login') {
          navigate('/profile', { replace: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/guide/:id" element={<RepairGuidePage />} />
        <Route path="/repair/:id" element={<RepairGuidePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/technicians" element={<TechniciansPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
