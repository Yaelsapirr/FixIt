import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './TechniciansPage.css';

const FILTERS = ['הכל', 'אינסטלציה', 'חשמל', 'כללי'];

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`דירוג ${count} מתוך 5`}>
      {'⭐'.repeat(Math.floor(count))}
      {'☆'.repeat(5 - Math.floor(count))}
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
            <AvailabilityTag status={tech.availability} />
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
        <a className="contact-btn contact-btn--call" href={`tel:${tech.phone}`}>
          📞 שיחה
        </a>
      </div>
    </div>
  );
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [activeFilter, setActiveFilter] = useState('הכל');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('technicians')
      .select('*, categories(name)')
      .then(({ data }) => {
        setTechnicians(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = activeFilter === 'הכל'
    ? technicians
    : technicians.filter((t) => t.categories?.name?.includes(activeFilter));

  return (
    <div className="page-container technicians-page">
      <AppHeader title="בחר איש מקצוע" showBack={true} />

      <main className="technicians-page__content">

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

        {loading ? (
          <p className="loading-text">טוען...</p>
        ) : filtered.length > 0 ? (
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
