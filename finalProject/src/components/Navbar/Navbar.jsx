import { NavLink } from 'react-router-dom';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/',            icon: '🏠', label: 'בית'       },
  { to: '/technicians', icon: '🔧', label: 'טכנאים'    },
  { to: '/stores',      icon: '🏪', label: 'חנויות'    },
  { to: '/profile',     icon: '👤', label: 'פרופיל'    },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            'navbar__item' + (isActive ? ' navbar__item--active' : '')
          }
        >
          <span className="navbar__icon">{icon}</span>
          <span className="navbar__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
