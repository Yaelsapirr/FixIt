import { useState } from 'react';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './TechniciansPage.css';

const FILTERS = ['הכל', 'אינסטלציה', 'חשמל', 'כללי'];

const TECHNICIANS = [
  {
    id: 1,
    initials: 'מכ',
    name: 'מיכאל כהן',
    specialty: 'אינסטלטור מוסמך',
    category: 'אינסטלציה',
    stars: 5,
    available: 'now',
    phone: '0501234567',
  },
  {
    id: 2,
    initials: 'יל',
    name: 'יוסי לוי',
    specialty: 'חשמלאי מוסמך',
    category: 'חשמל',
    stars: 4,
    available: 'tomorrow',
    phone: '0527654321',
  },
  {
    id: 3,
    initials: 'דמ',
    name: 'דני מזרחי',
    specialty: 'איש תחזוקה כללי',
    category: 'כללי',
    stars: 4,
    available: 'now',
    phone: '0541112233',
  },
];

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`דירוג ${count} מתוך 5`}>
      {'⭐'.repeat(count)}
      {'☆'.repeat(5 - count)}
    </span>
  );
}

function AvailabilityTag({ status }) {
  return (
    <span className={`availability-tag availability-tag--${status}`}>
      {status === 'now' ? 'זמין עכשיו' : 'פנוי מחר'}
    </span>
  );
}

function ProCard({ tech }) {
  return (
    <div className="pro-card">
      <div className="pro-card__top">
        <div className="pro-card__avatar">{tech.initials}</div>
        <div className="pro-card__info">
          <div className="pro-card__name-row">
            <span className="pro-card__name">{tech.name}</span>
            <AvailabilityTag status={tech.available} />
          </div>
          <span className="pro-card__specialty">{tech.specialty}</span>
          <Stars count={tech.stars} />
        </div>
      </div>
      <div className="pro-card__actions">
        <a
          className="contact-btn contact-btn--whatsapp"
          href={`https://wa.me/972${tech.phone.slice(1)}`}
          target="_blank"
          rel="noreferrer"
        >
          📱 WhatsApp
        </a>
        <a
          className="contact-btn contact-btn--call"
          href={`tel:${tech.phone}`}
        >
          📞 שיחה
        </a>
      </div>
    </div>
  );
}

export default function TechniciansPage() {
  const [activeFilter, setActiveFilter] = useState('הכל');

  const filtered = activeFilter === 'הכל'
    ? TECHNICIANS
    : TECHNICIANS.filter((t) => t.category === activeFilter);

  return (
    <div className="page-container technicians-page">
      <AppHeader title="בחר איש מקצוע" showBack={true} />

      <main className="technicians-page__content">

        {/* Filter bar */}
        <div className="filter-bar" role="group" aria-label="סינון לפי קטגוריה">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn${activeFilter === f ? ' filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Technician cards */}
        {filtered.length > 0 ? (
          <div className="pro-list">
            {filtered.map((tech) => (
              <ProCard key={tech.id} tech={tech} />
            ))}
          </div>
        ) : (
          <div className="technicians-empty">
            <span>😔</span>
            <p>אין אנשי מקצוע זמינים בקטגוריה זו כרגע</p>
          </div>
        )}

      </main>

      <Navbar />
    </div>
  );
}
