import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './HomePage.css';

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
  const [query,      setQuery]      = useState('');
  const [categories, setCategories] = useState([]);
  const [history,    setHistory]    = useState([]);
  const [firstName,  setFirstName]  = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const meta = user.user_metadata || {};
      const googleFirst = (meta.full_name || meta.name || '').split(' ')[0];

      supabase.from('users').select('first_name').eq('id', user.id).maybeSingle()
        .then(({ data }) => {
          setFirstName(data?.first_name || googleFirst || '');
        });

      supabase
        .from('repair_history')
        .select('id, repair_guides(id, title, icon)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(3)
        .then(({ data }) => { if (data) setHistory(data); });
    });
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="page-container home-page">
      <AppHeader />

      <main className="home-page__content">
        {firstName && (
          <p className="home-greeting">שלום, {firstName}! 👋</p>
        )}

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

        <section className="home-section">
          <h2 className="home-section__title">קטגוריות</h2>
          <div className="category-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} emoji={cat.emoji} name={cat.name} />
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="home-section">
            <h2 className="home-section__title">פעילות אחרונה</h2>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className="history-item__icon">{item.repair_guides?.icon}</span>
                  <span className="history-item__title">{item.repair_guides?.title}</span>
                  <Link
                    className="history-item__link"
                    to={`/guide/${item.repair_guides?.id}`}
                  >
                    הצג מדריך
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Navbar />
    </div>
  );
}
