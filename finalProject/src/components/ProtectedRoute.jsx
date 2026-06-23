import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Subscribe first so we catch the PKCE code exchange that fires SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Also do an immediate session check in case the listener fires before mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((prev) => (prev === undefined ? (session?.user ?? null) : prev));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) return null;
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}
