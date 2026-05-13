import { useNavigate } from 'react-router-dom';
import './AppHeader.css';

export default function AppHeader({ title, showBack = false }) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      {showBack ? (
        <button
          className="app-header__back"
          onClick={() => navigate(-1)}
          aria-label="חזור"
        >
          ‹
        </button>
      ) : (
        <span className="app-header__logo">🔩</span>
      )}

      <span className="app-header__title">
        {title ?? 'FixIt'}
      </span>

      {/* spacer keeps title centered when back button is shown */}
      <span className="app-header__spacer" aria-hidden="true" />
    </header>
  );
}
