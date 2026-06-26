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
import AiChatPage from './pages/AiChatPage';
import { supabase } from './lib/supabase';

function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const path = window.location.pathname;
        if (path === '/' || path === '/login') {
          navigate('/home', { replace: true });
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
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
        <Route path="/guide/:id" element={<ProtectedRoute><RepairGuidePage /></ProtectedRoute>} />
        <Route path="/repair/:id" element={<ProtectedRoute><RepairGuidePage /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
        <Route path="/technicians" element={<ProtectedRoute><TechniciansPage /></ProtectedRoute>} />
        <Route path="/stores" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AiChatPage /></ProtectedRoute>} />
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
