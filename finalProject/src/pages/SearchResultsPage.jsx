import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './SearchResultsPage.css';

const DIFFICULTY_LABELS = {
  easy:     'קל',
  medium:   'בינוני',
  advanced: 'מתקדם',
};

function DifficultyBadge({ level }) {
  return (
    <span className={`difficulty-badge difficulty-badge--${level}`}>
      {DIFFICULTY_LABELS[level]}
    </span>
  );
}

function ResultCard({ result }) {
  const navigate = useNavigate();
  return (
    <div className="result-card">
      <div className="result-card__top">
        <span className="result-card__icon">{result.icon}</span>
        <div className="result-card__meta">
          <DifficultyBadge level={result.difficulty} />
          <span className="result-card__time">⏱ {result.time_estimate}</span>
        </div>
      </div>
      <h3 className="result-card__title">{result.title}</h3>
      <button
        className="result-card__btn"
        onClick={() => navigate(`/guide/${result.id}`)}
      >
        צפה במדריך
      </button>
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="empty-state">
      <span className="empty-state__emoji">🔍</span>
      <p className="empty-state__message">
        לא נמצאו תוצאות עבור <strong>"{query}"</strong>
      </p>
      <p className="empty-state__hint">נסה מילות חיפוש אחרות או עיין בקטגוריות</p>
    </div>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';
  const displayQuery = query || cat;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      if (cat) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', `%${cat}%`)
          .maybeSingle();

        if (catData) {
          const { data } = await supabase
            .from('repair_guides')
            .select('id, title, difficulty, time_estimate, icon')
            .eq('category_id', catData.id);
          setResults(data || []);
        } else {
          setResults([]);
        }
      } else if (query) {
        const { data } = await supabase
          .from('repair_guides')
          .select('id, title, difficulty, time_estimate, icon')
          .ilike('title', `%${query}%`);
        setResults(data || []);
      } else {
        const { data } = await supabase
          .from('repair_guides')
          .select('id, title, difficulty, time_estimate, icon');
        setResults(data || []);
      }

      setLoading(false);
    }
    fetchResults();
  }, [query, cat]);

  return (
    <div className="page-container search-results-page">
      <AppHeader title="תוצאות חיפוש" showBack={true} />

      <main className="search-results-page__content">
        {displayQuery && (
          <p className="search-results-page__subtitle" dir="rtl">
            תוצאות עבור: <strong>{displayQuery}</strong>
          </p>
        )}

        {loading ? (
          <p className="loading-text">טוען...</p>
        ) : results.length > 0 ? (
          <div className="results-list">
            {results.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <EmptyState query={displayQuery} />
        )}
      </main>

      <Navbar />
    </div>
  );
}
