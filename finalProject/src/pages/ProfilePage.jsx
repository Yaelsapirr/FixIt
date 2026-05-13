import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './ProfilePage.css';

const USER = {
  initials: 'יס',
  name: 'יעל ספיר',
  email: 'yael@example.com',
};

const HISTORY = [
  { id: 1, date: '12.05.2026', repair: 'ברז מטפטף' },
  { id: 2, date: '03.04.2026', repair: 'שקע חשמל לא עובד' },
  { id: 3, date: '18.02.2026', repair: 'דלת לא נסגרת' },
];

const STATS = [
  { value: '3', label: 'תיקונים מוצלחים' },
  { value: '₪750', label: 'נחסכו' },
];

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="page-container profile-page">
      <AppHeader title="הפרופיל שלי" />

      <main className="profile-page__content">

        {/* User info */}
        <section className="profile-user">
          <div className="profile-user__avatar">{USER.initials}</div>
          <div className="profile-user__details">
            <span className="profile-user__name">{USER.name}</span>
            <span className="profile-user__email">{USER.email}</span>
          </div>
          <button className="profile-edit-btn">ערוך פרופיל</button>
        </section>

        {/* Stats row */}
        <div className="stats-row">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Repair history */}
        <section className="profile-section">
          <h2 className="profile-section__title">היסטוריית תיקונים</h2>
          <div className="history-list">
            {HISTORY.map((item) => (
              <div key={item.id} className="history-row">
                <span className="history-row__done">✅</span>
                <span className="history-row__repair">{item.repair}</span>
                <span className="history-row__date">{item.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Logout */}
        <button
          className="logout-btn"
          onClick={() => navigate('/login')}
        >
          התנתק
        </button>

      </main>

      <Navbar />
    </div>
  );
}
