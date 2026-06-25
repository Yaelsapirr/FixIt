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
  if (km < 1) return Math.round(km * 1000) + " m'";
  return km.toFixed(1) + ' km';
}

function StoreCard({ store }) {
  const wazeLink =
    store.latitude && store.longitude
      ? 'https://waze.com/ul?ll=' + store.latitude + ',' + store.longitude + '&navigate=yes'
      : store.waze_link;

  return (
    <div className="store-card">
      <div className="store-card__body">
        <div className="store-card__header">
          <span className="store-card__name">{store.name}</span>
          {store.distKm != null && (
            <span className="store-card__distance">{formatDist(store.distKm)}</span>
          )}
        </div>
        <p className="store-card__address">{store.address}</p>
        <p className="store-card__hours">{store.hours}</p>
      </div>
      {wazeLink ? (
        <a className="navigation-btn" href={wazeLink} target="_blank" rel="noreferrer">
          Waze
        </a>
      ) : (
        <button className="navigation-btn" disabled>Waze</button>
      )}
    </div>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locStatus, setLocStatus] = useState('loading');

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
        function(pos) {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const withDist = rawStores
            .map(function(s) {
              return Object.assign({}, s, {
                distKm:
                  s.latitude && s.longitude
                    ? haversineKm(lat, lon, Number(s.latitude), Number(s.longitude))
                    : null,
              });
            })
            .sort(function(a, b) {
              return (a.distKm !== null ? a.distKm : Infinity) -
                     (b.distKm !== null ? b.distKm : Infinity);
            });
          setStores(withDist);
          setLocStatus('ok');
          setLoading(false);
        },
        function() {
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
      <AppHeader title="stores" showBack={true} />
      <main className="stores-page__content">
        {locStatus === 'denied' && (
          <p className="stores-loc-note">location denied</p>
        )}
        {locStatus === 'unavailable' && (
          <p className="stores-loc-note">location unavailable</p>
        )}
        {loading ? (
          <p className="loading-text">loading...</p>
        ) : (
          <div className="store-list">
            {stores.map(function(store) {
              return <StoreCard key={store.id} store={store} />;
            })}
          </div>
        )}
      </main>
      <Navbar />
    </div>
  );
}
