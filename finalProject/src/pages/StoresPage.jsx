import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './StoresPage.css';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} מ'`;
  return `${km.toFixed(1)} ק"מ`;
}

function StoreCard({ store }) {
  const wazeLink =
    store.latitude && store.longitude
      ? `https://waze.com/ul?ll=${store.latitude},${store.longitude}&navigate=yes`
      : store.waze_link;

  return (
    <div className="store-card">
      <div className="store-card__body">
        <div className="store-card__header">
          <span className="store-card__name">{store.name}</span>
          {store.distKm != null && (
            <span className="store-card__distance">📍 {formatDist(store.distKm)}</span>
          )}
        </div>
        <p className="store-card__address">{store.address}</p>
        <p className="store-card__hours">🕐 {store.hours}</p>
      </div>
      {wazeLink ? (
        <a className="navigation-btn" href={wazeLink} target="_blank" rel="noreferrer">
          נווט עם Waze 🧭
        </a>
      ) : (
        <button className="navigation-btn" disabled>נווט עם Waze 🧭</button>
      )}
    </div>
  );
}

export default function StoresPage() {
  const [stores,      setStores]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [locStatus,   setLocStatus]   = useState('loading'); // loading | ok | denied | unavailable

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from('stores').select('*');
      const rawStores = data || [];

      if (!navigator.geolocation) {
        setLocStatus('unavailable');
        setStores(rawStores);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const withDist = rawStores
            .map((s) => ({
              ...s,
              distKm:
                s.latitude && s.longitude
                  ? haversineKm(latitude, longitude, Number(s.latitude), Number(s.longitude))
                  : null,
            }))
            .sort((a, b) => (a.distKm ?? Infinity) - (b.distKm ?? Infinity));
          setStores(withDist);
          setLocStatus('ok');
          setLoading(false);
        },
        () => {
          setLocStatus('denied');
          setStores(rawStores);
          setLoading(false);
        },
        { timeout: 8000 }
      );
    }
    init();
  }, []);

  return (
    <div className="page-container stores-page">
      <AppHeader title="חנויות ציוד קרובות" showBack={true} />

      <main className="stores-page__content">

        {locStatus === 'denied' && (
          <p className="stores-loc-note">⚠️ לא ניתן לגשת למיקום — מציג את כל החנויות</p>
        )}
        {locStatus === 'unavailable' && (
          <p className="stores-loc-note">📍 מיקום לא זמין בדפדפן זה</p>
        )}

        {loading ? (
          <p className="loading-text">מאתר חנויות קרובות...</p>
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
