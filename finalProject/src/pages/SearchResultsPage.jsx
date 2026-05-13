import { useSearchParams, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './SearchResultsPage.css';

const DIFFICULTY_LABELS = {
  easy:     'קל',
  medium:   'בינוני',
  advanced: 'מתקדם',
};

const DUMMY_RESULTS = [
  {
    id: 'faucet-drip',
    icon: '🔧',
    title: 'ברז מטפטף — תיקון בסיסי',
    difficulty: 'easy',
    time: '20 דקות',
  },
  {
    id: 'outlet-dead',
    icon: '⚡',
    title: 'שקע חשמל לא עובד — בדיקה ואיפוס',
    difficulty: 'medium',
    time: '30 דקות',
  },
  {
    id: 'door-stuck',
    icon: '🪟',
    title: 'דלת לא נסגרת — כיוול צירים',
    difficulty: 'easy',
    time: '15 דקות',
  },
  {
    id: 'ac-filter',
    icon: '❄️',
    title: 'מיזוג לא מקרר — ניקוי פילטר',
    difficulty: 'advanced',
    time: '45 דקות',
  },
];

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
          <span className="result-card__time">⏱ {result.time}</span>
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
        לא נמצאו תוצאות עבור
        <strong> "{query}"</strong>
      </p>
      <p className="empty-state__hint">נסה מילות חיפוש אחרות או עיין בקטגוריות</p>
    </div>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || searchParams.get('cat') || '';

  const hasResults = DUMMY_RESULTS.length > 0 && query.length > 0;

  return (
    <div className="page-container search-results-page">
      <AppHeader title="תוצאות חיפוש" showBack={true} />

      <main className="search-results-page__content">
        {query && (
          <p className="search-results-page__subtitle" dir="rtl">
            תוצאות עבור: <strong>{query}</strong>
          </p>
        )}

        {hasResults ? (
          <div className="results-list">
            {DUMMY_RESULTS.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <EmptyState query={query} />
        )}
      </main>

      <Navbar />
    </div>
  );
}
