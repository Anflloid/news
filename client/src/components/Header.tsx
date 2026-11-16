import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          Новини
        </Link>

        <button
          type="button"
          className={styles.burger}
          aria-label="Відкрити меню"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>

        <nav id="main-menu" className={`${styles.nav} ${menuOpen ? styles.open : ''}`} aria-label="Головне меню">
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')} onClick={closeMenu}>
            Головна
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? styles.active : '')} onClick={closeMenu}>
              Адмін-панель
            </NavLink>
          )}

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className={styles.user}>
              <span className={styles.userName}>{user.name}</span>
              <button type="button" className="btn btn-outline btn-small" onClick={handleLogout}>
                Вийти
              </button>
            </div>
          ) : (
            <div className={styles.user}>
              <Link to="/login" className="btn btn-outline btn-small" onClick={closeMenu}>
                Увійти
              </Link>
              <Link to="/register" className="btn btn-small" onClick={closeMenu}>
                Реєстрація
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
