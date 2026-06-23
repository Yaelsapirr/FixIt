import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './ProfilePage.css';

function EditModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ display_name: name });
    setSaving(false);
  }

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="edit-modal__title">ערוך פרופיל</h2>
        <div className="edit-field">
          <label className="edit-field__label" htmlFor="edit-name">שם תצוגה</label>
          <input
            id="edit-name"
            className="edit-field__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הכנס שם"
            dir="rtl"
          />
        </div>
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
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      setUserId(user.id);

      // Ensure a users row exists (important for Google OAuth sign-ins)
      await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email }, { onConflict: 'id', ignoreDuplicates: true });

      const [{ data: profileData }, { data: historyData }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
        supabase
          .from('repair_history')
          .select('id, completed_at, savings, repair_guides(title)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
      ]);

      setProfile({ ...profileData, email: user.email });
      setHistory(historyData || []);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  async function handleSaveProfile(updates) {
    const { error } = await supabase
      .from('users')
      .upsert({ id: userId, ...updates });
    if (!error) {
      setProfile((p) => ({ ...p, ...updates }));
      setEditing(false);
    }
  }

  const totalSavings = history.reduce((sum, h) => sum + Number(h.savings || 0), 0);

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2)
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

        <section className="profile-user">
          <div className="profile-user__avatar">{initials}</div>
          <div className="profile-user__details">
            <span className="profile-user__name">{profile?.display_name || 'משתמש'}</span>
            <span className="profile-user__email">{profile?.email}</span>
          </div>
          <button className="profile-edit-btn" onClick={() => setEditing(true)}>ערוך פרופיל</button>
        </section>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card__value">{history.length}</span>
            <span className="stat-card__label">תיקונים מוצלחים</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">₪{totalSavings}</span>
            <span className="stat-card__label">נחסכו</span>
          </div>
        </div>

        <section className="profile-section">
          <h2 className="profile-section__title">היסטוריית תיקונים</h2>
          {history.length === 0 ? (
            <p className="profile-empty">עדיין לא השלמת תיקונים</p>
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

        <button className="logout-btn" onClick={handleLogout}>
          התנתק
        </button>

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
