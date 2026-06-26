import { NavLink } from 'react-router-dom';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/home',            icon: 'home',   label: 'בית'     },
  { to: '/technicians', icon: 'wrench', label: 'טכנאים'  },
  { to: '/ai',          icon: 'robot',  label: 'עוזר AI' },
  { to: '/stores',      icon: 'store',  label: 'חנויות'  },
  { to: '/profile',     icon: 'user',   label: 'פרופיל'  },
];

const ICON_MAP = {
  home:   '🏠',
  wrench: '🔧',
  robot:  '🤖',
  store:  '🏪',
  user:   '👤',
};

export default function Navbar() {
  return (
    <nav className="navbar">
      {NAV_ITEMS.map(function({ to, icon, label }) {
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/home'}
            className={function({ isActive }) {
              return 'navbar__item' + (isActive ? ' navbar__item--active' : '');
            }}
          >
            <span className="navbar__icon">{ICON_MAP[icon]}</span>
            <span className="navbar__label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
