import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/profile', { replace: true });
    });
  }, [navigate]);

  async function handleLogin() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError('אימייל או סיסמה שגויים'); return; }
    navigate('/');
  }

  async function handleGoogle() {
    setError('');
    console.log('[Auth] Starting Google OAuth, redirectTo:', window.location.origin);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, skipBrowserRedirect: true },
    });
    console.log('[Auth] signInWithOAuth result:', { url: data?.url, error });
    if (error) { setError('שגיאה: ' + error.message); return; }
    if (data?.url) {
      setError('מועבר לגוגל...');
      window.location.href = data.url;
    } else {
      setError('לא התקבל URL — בדקי את הגדרות הספק בסופבייס');
    }
  }

  async function handleRegister() {
    if (!email || !password) { setError('יש להזין אימייל וסיסמה להרשמה'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setError('נשלח אימייל אימות — בדוק את תיבת הדואר שלך');
  }

  return (
    <div className="login-page">

      <div className="login-hero">
        <span className="login-hero__icon">🔧</span>
        <h1 className="login-hero__name">FixIt</h1>
        <p className="login-hero__tagline">תיקונים ביתיים בקלות</p>
      </div>

      <div className="login-card">
        {error && <p className="login-error">{error}</p>}

        <div className="login-field">
          <label className="login-field__label" htmlFor="email">אימייל</label>
          <input
            id="email"
            className="login-field__input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            autoComplete="email"
          />
        </div>

        <div className="login-field">
          <label className="login-field__label" htmlFor="password">סיסמה</label>
          <input
            id="password"
            className="login-field__input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            autoComplete="current-password"
          />
        </div>

        <button className="login-btn login-btn--primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'טוען...' : 'כניסה'}
        </button>

        <div className="login-divider">
          <span className="login-divider__line" />
          <span className="login-divider__text">או</span>
          <span className="login-divider__line" />
        </div>

        <button className="login-btn login-btn--google" onClick={handleGoogle}>
          <svg className="login-btn__google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          המשך עם Google
        </button>

        <p className="login-register" dir="rtl">
          אין לך חשבון?{' '}
          <button className="login-register__link" onClick={handleRegister}>
            הירשם
          </button>
        </p>
      </div>
    </div>
  );
}
