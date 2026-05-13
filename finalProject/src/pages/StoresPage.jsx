import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './StoresPage.css';

const STORES = [
  {
    id: 1,
    name: 'פריקט חיפה',
    address: 'רחוב הנמל 14, חיפה',
    distance: '1.2 ק״מ ממך',
    hours: 'א׳–ה׳ 08:00–19:00 | ו׳ 08:00–14:00',
  },
  {
    id: 2,
    name: 'בית אל-על חומרי בניין',
    address: 'שד׳ מוריה 82, חיפה',
    distance: '2.7 ק״מ ממך',
    hours: 'א׳–ה׳ 07:30–18:30 | ו׳ 07:30–13:00',
  },
  {
    id: 3,
    name: 'סנטר שיפוצים',
    address: 'רחוב חסן שוקרי 5, חיפה',
    distance: '3.5 ק״מ ממך',
    hours: 'א׳–ה׳ 09:00–20:00 | ו׳ 09:00–14:00',
  },
];

function StoreCard({ store }) {
  return (
    <div className="store-card">
      <div className="store-card__body">
        <div className="store-card__header">
          <span className="store-card__name">{store.name}</span>
          <span className="store-card__distance">📍 {store.distance}</span>
        </div>
        <p className="store-card__address">{store.address}</p>
        <p className="store-card__hours">🕐 {store.hours}</p>
      </div>
      <a className="navigation-btn" href="#" onClick={(e) => e.preventDefault()}>
        נווט עם Waze 🧭
      </a>
    </div>
  );
}

export default function StoresPage() {
  return (
    <div className="page-container stores-page">
      <AppHeader title="חנויות ציוד קרובות" showBack={true} />

      <main className="stores-page__content">

        {/* Map placeholder */}
        <div className="map-placeholder">
          <span className="map-placeholder__text">
            🗺️ מפה (תתחבר ל-Google Maps בשלב הבא)
          </span>
        </div>

        {/* Store list */}
        <div className="store-list">
          {STORES.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>

      </main>

      <Navbar />
    </div>
  );
}
