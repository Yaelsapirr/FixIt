import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './HomePage.css';

const CATEGORIES = [
  { emoji: '🔧', name: 'אינסטלציה' },
  { emoji: '⚡', name: 'חשמל' },
  { emoji: '🪟', name: 'חלונות ודלתות' },
  { emoji: '🧱', name: 'ריצוף וטיח' },
  { emoji: '❄️', name: 'מיזוג ותרמוסטט' },
  { emoji: '🪛', name: 'כלי עבודה כלליים' },
];

const HISTORY = [
  { id: 1, icon: '🔧', title: 'ברז מטפטף' },
  { id: 2, icon: '⚡', title: 'שקע לא עובד' },
  { id: 3, icon: '🪟', title: 'דלת לא נסגרת' },
];

function CategoryCard({ emoji, name }) {
  const navigate = useNavigate();
  return (
    <button
      className="category-card"
      onClick={() => navigate(`/search?cat=${encodeURIComponent(name)}`)}
    >
      <span className="category-card__emoji">{emoji}</span>
      <span className="category-card__name">{name}</span>
    </button>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="page-container home-page">
      <AppHeader />

      <main className="home-page__content">
        {/* Search */}
        <section className="home-section">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              className="search-bar__input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="מה התקלה? (לדוג׳: ברז מטפטף)"
              dir="rtl"
            />
            <button className="search-bar__btn" type="submit" aria-label="חיפוש">
              🔍
            </button>
          </form>
        </section>

        {/* Categories */}
        <section className="home-section">
          <h2 className="home-section__title">קטגוריות</h2>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.name} emoji={cat.emoji} name={cat.name} />
            ))}
          </div>
        </section>

        {/* Recent History */}
        <section className="home-section">
          <h2 className="home-section__title">פעילות אחרונה</h2>
          <div className="history-list">
            {HISTORY.map((item) => (
              <div key={item.id} className="history-item">
                <span className="history-item__icon">{item.icon}</span>
                <span className="history-item__title">{item.title}</span>
                <Link
                  className="history-item__link"
                  to={`/search?q=${encodeURIComponent(item.title)}`}
                >
                  הצג מדריך
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Navbar />
    </div>
  );
}
