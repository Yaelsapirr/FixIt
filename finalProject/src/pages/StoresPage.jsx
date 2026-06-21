import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './StoresPage.css';

function StoreCard({ store }) {
  return (
    <div className="store-card">
      <div className="store-card__body">
        <div className="store-card__header">
          <span className="store-card__name">{store.name}</span>
          <span className="store-card__distance">📍</span>
        </div>
        <p className="store-card__address">{store.address}</p>
        <p className="store-card__hours">🕐 {store.hours}</p>
      </div>
      {store.waze_link ? (
        <a
          className="navigation-btn"
          href={store.waze_link}
          target="_blank"
          rel="noreferrer"
        >
          נווט עם Waze 🧭
        </a>
      ) : (
        <button className="navigation-btn" disabled>
          נווט עם Waze 🧭
        </button>
      )}
    </div>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('stores')
      .select('*')
      .then(({ data }) => {
        setStores(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container stores-page">
      <AppHeader title="חנויות ציוד קרובות" showBack={true} />

      <main className="stores-page__content">

        <div className="map-placeholder">
          <span className="map-placeholder__text">
            🗺️ מפה (תתחבר ל-Google Maps בשלב הבא)
          </span>
        </div>

        {loading ? (
          <p className="loading-text">טוען חנויות...</p>
        ) : (
          <div className="store-list">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}

      </main>

      <Navbar />
    </div>
  );
}
