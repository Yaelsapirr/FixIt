import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './ProfilePage.css';

function savingsMessage(amount) {
  if (amount < 50)   return `כבר ${Math.max(1, Math.floor(amount / 18))} כוסות קפה בדרך ☕`;
  if (amount < 200)  return 'מספיק לארוחת צהריים זוגית עם קפה ☀️';
  if (amount < 500)  return 'כבר מספיק לזוג כרטיסים לסרט עם פופקורן 🎬';
  if (amount < 900)  return 'אפשר לקנות אוזניות אלחוטיות חדשות 🎧';
  if (amount < 2000) return 'מספיק לסוף שבוע זוגי עם לינה 🌴';
  return 'כבר מספיק לכרטיס טיסה! ✈️';
}

function EditModal({ profile, onSave, onClose }) {
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName,  setLastName]  = useState(profile?.last_name  || '');
  const [city,      setCity]      = useState(profile?.city       || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ first_name: firstName, last_name: lastName, city });
    setSaving(false);
  }

  const fields = [
    { id: 'edit-first', label: 'שם פרטי',    value: firstName, set: setFirstName },
    { id: 'edit-last',  label: 'שם משפחה',   value: lastName,  set: setLastName  },
    { id: 'edit-city',  label: 'עיר מגורים', value: city,      set: setCity      },
  ];

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="edit-modal__title">ערוך פרופיל</h2>
        {fields.map(({ id, label, value, set }) => (
          <div key={id} className="edit-field">
            <label className="edit-field__label" htmlFor={id}>{label}</label>
            <input
              id={id}
              className="edit-field__input"
              type="text"
              value={value}
              onChange={(e) => set(e.target.value)}
              dir="rtl"
            />
          </div>
        ))}
        <div className="edit-modal__actions">
          <button className="edit-modal__save" onClick={handleSave} disabled={saving}>
            {saving ? 'שומר...' : 'שמור'}
          </button>
          <button className="edit-modal__cancel" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('he-IL');
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile,    setProfile]    = useState(null);
  const [userId,     setUserId]     = useState(null);
  const [googleMeta, setGoogleMeta] = useState(null);
  const [history,    setHistory]    = useState([]);
  const [saved,      setSaved]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      setUserId(user.id);
      const meta = user.user_metadata || {};
      setGoogleMeta(meta);

      const googleName = meta.full_name || meta.name || null;
      const gFirst = googleName ? googleName.split(' ')[0] : null;
      const gLast  = googleName ? googleName.split(' ').slice(1).join(' ') || null : null;

      await supabase.from('users').upsert(
        {
          id: user.id,
          email: user.email,
          ...(googleName ? { display_name: googleName, first_name: gFirst, last_name: gLast } : {}),
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      const [{ data: profileData }, { data: historyData }, { data: savedData }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
        supabase
          .from('repair_history')
          .select('id, completed_at, savings, repair_guides(title)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
        supabase
          .from('saved_repairs')
          .select('guide_id, saved_at, repair_guides(title)')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false }),
      ]);

      setProfile({ ...profileData, email: user.email });
      setHistory(historyData || []);
      setSaved(savedData || []);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  async function handleSaveProfile(updates) {
    const { error } = await supabase.from('users').upsert({ id: userId, ...updates });
    if (!error) {
      setProfile((p) => ({ ...p, ...updates }));
      setEditing(false);
    }
  }

  const totalSavings = history.reduce((sum, h) => sum + Number(h.savings || 0), 0);

  const firstName    = profile?.first_name || googleMeta?.full_name?.split(' ')[0] || '';
  const lastName     = profile?.last_name  || '';
  const fullName     = [firstName, lastName].filter(Boolean).join(' ') || profile?.display_name || 'משתמש';
  const googleAvatar = googleMeta?.picture || googleMeta?.avatar_url || null;
  const initials     = fullName !== 'משתמש'
    ? fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || '?';

  if (loading) {
    return (
      <div className="page-container profile-page">
        <AppHeader title="הפרופיל שלי" />
        <main className="profile-page__content">
          <p className="loading-text">טוען...</p>
        </main>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <AppHeader title="הפרופיל שלי" />

      <main className="profile-page__content">

        {/* כרטיס משתמש */}
        <section className="profile-user">
          {googleAvatar
            ? <img className="profile-user__avatar profile-user__avatar--img" src={googleAvatar} alt={fullName} referrerPolicy="no-referrer" />
            : <div className="profile-user__avatar">{initials}</div>
          }
          <div className="profile-user__details">
            <span className="profile-user__greeting">שלום, {firstName || fullName}!</span>
            <span className="profile-user__name">{fullName}</span>
            {profile?.city && (
              <span className="profile-user__city">📍 {profile.city}</span>
            )}
            <span className="profile-user__email">{profile?.email}</span>
          </div>
          <button className="profile-edit-btn" onClick={() => setEditing(true)}>ערוך פרופיל</button>
        </section>

        {/* סטטיסטיקות */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card__value">{history.length}</span>
            <span className="stat-card__label">תיקונים מוצלחים</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">₪{totalSavings}</span>
            <span className="stat-card__label">חסכון כולל</span>
          </div>
        </div>

        {/* תקלות שמורות */}
        <section className="profile-section">
          <h2 className="profile-section__title">🔖 תקלות ששמרתי</h2>
          {saved.length === 0 ? (
            <p className="profile-empty">לא שמרת תקלות עדיין</p>
          ) : (
            <div className="history-list">
              {saved.map((item) => (
                <div key={item.guide_id} className="history-row">
                  <span className="history-row__done">🔖</span>
                  <span className="history-row__repair">{item.repair_guides?.title}</span>
                  <span className="history-row__date">{formatDate(item.saved_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* תיקונים שבוצעו */}
        <section className="profile-section">
          <h2 className="profile-section__title">✅ תיקונים שביצעתי</h2>
          {history.length === 0 ? (
            <p className="profile-empty">עדיין לא ביצעת תיקונים</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-row">
                  <span className="history-row__done">✅</span>
                  <span className="history-row__repair">{item.repair_guides?.title}</span>
                  {item.savings > 0 && (
                    <span className="history-row__savings">₪{item.savings}</span>
                  )}
                  <span className="history-row__date">{formatDate(item.completed_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* משפט חיסכון */}
        {totalSavings > 0 && (
          <div className="savings-message">
            <p className="savings-message__label">עם החיסכון שלך אפשר —</p>
            <p className="savings-message__text">{savingsMessage(totalSavings)}</p>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>התנתק</button>

      </main>

      {editing && (
        <EditModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setEditing(false)}
        />
      )}

      <Navbar />
    </div>
  );
}
