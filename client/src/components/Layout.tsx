import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Loader from './Loader';

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Перейти до вмісту
      </a>
      <Header />
      <main id="main" className="container">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="container muted" style={{ padding: '24px 16px', borderTop: '1px solid var(--color-border)' }}>
        © {new Date().getFullYear()} Новини. Усі права захищено.
      </footer>
    </>
  );
}
