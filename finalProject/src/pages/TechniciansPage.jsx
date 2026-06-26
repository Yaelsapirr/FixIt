import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './TechniciansPage.css';

const CATEGORIES = [
  {
    id: 'plumbing',
    icon: '🔧',
    name: 'אינסטלטורים',
    desc: 'תיקון ברזים, צינורות, אסלות ונזילות',
    url: 'https://www.midrag.co.il/Content/SectorPortal/4',
    reviews: '319,491',
  },
  {
    id: 'electric',
    icon: '⚡',
    name: 'חשמלאים',
    desc: 'שקעים, מפסקים, לוח חשמל ותאורה',
    url: 'https://www.midrag.co.il/Content/SectorPortal/5',
    reviews: '197,927',
  },
  {
    id: 'ac',
    icon: '❄️',
    name: 'טכנאי מזגנים',
    desc: 'תיקון, ניקוי והתקנת מזגנים',
    url: 'https://www.midrag.co.il/Content/SectorPortal/18',
    reviews: '190,481',
  },
  {
    id: 'renovation',
    icon: '🏗️',
    name: 'שיפוצניקים',
    desc: 'ריצוף, גבס, צבע, דלתות וחלונות',
    url: 'https://www.midrag.co.il/Content/SectorPortal/11',
    reviews: '35,613',
  },
  {
    id: 'sealing',
    icon: '💧',
    name: 'קבלני איטום',
    desc: 'איטום גגות, מרפסות ורטיבות בקיר',
    url: 'https://www.midrag.co.il/Content/SectorPortal/16',
    reviews: '33,115',
  },
  {
    id: 'locksmith',
    icon: '🔑',
    name: 'מנעולנים',
    desc: 'פתיחת דלתות, החלפת מנעולים ואבטחה',
    url: 'https://www.midrag.co.il/Search/InSector',
    reviews: '',
  },
];

function CategoryCard({ cat }) {
  return (
    <a
      className="midrag-card"
      href={cat.url}
      target="_blank"
      rel="noreferrer"
    >
      <span className="midrag-card__icon">{cat.icon}</span>
      <div className="midrag-card__body">
        <span className="midrag-card__name">{cat.name}</span>
        <span className="midrag-card__desc">{cat.desc}</span>
        {cat.reviews && (
          <span className="midrag-card__reviews">{cat.reviews} חוות דעת</span>
        )}
      </div>
      <span className="midrag-card__arrow">›</span>
    </a>
  );
}

export default function TechniciansPage() {
  return (
    <div className="page-container technicians-page">
      <AppHeader title="בחר איש מקצוע" showBack={true} />

      <main className="technicians-page__content">
        <div className="midrag-header">
          <img
            src="https://www.midrag.co.il/Content/Images/Logo_home.png?v2"
            alt="מידרג"
            className="midrag-logo"
            onError={function(e) { e.target.style.display = 'none'; }}
          />
          <p className="midrag-subtitle">בעלי מקצוע מומלצים עם חוות דעת אמיתיות</p>
        </div>

        <div className="midrag-list">
          {CATEGORIES.map(function(cat) {
            return <CategoryCard key={cat.id} cat={cat} />;
          })}
        </div>
      </main>

      <Navbar />
    </div>
  );
}
