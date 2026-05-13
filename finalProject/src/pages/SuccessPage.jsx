import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './SuccessPage.css';

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container success-page">
      <AppHeader title="תיקון הצליח! 🎉" />

      <main className="success-page__content">

        {/* Illustration */}
        <section className="success-hero">
          <span className="success-hero__emoji">🎉</span>
          <h1 className="success-hero__title">כל הכבוד! תיקנת לבד</h1>
          <p className="success-hero__subtitle">חסכת בקריאת טכנאי</p>
        </section>

        {/* Savings card */}
        <div className="savings-card">
          <span className="savings-card__amount">💰 חסכת כ-₪250 בממוצע</span>
          <p className="savings-card__sub">מחיר ממוצע לביקור טכנאי</p>
        </div>

        {/* Actions */}
        <div className="success-page__actions">
          <button
            className="success-btn success-btn--primary"
            onClick={() => navigate('/')}
          >
            חזור לבית
          </button>
          <button className="success-btn success-btn--secondary">
            שתף עם חבר
          </button>
        </div>

      </main>

      <Navbar />
    </div>
  );
}
