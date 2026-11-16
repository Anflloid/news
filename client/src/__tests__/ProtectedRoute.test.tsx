import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockedUseAuth = useAuth as jest.Mock;

function renderAdminRoute(auth: object) {
  mockedUseAuth.mockReturnValue(auth);
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <h1>Адмінка</h1>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<h1>Сторінка входу</h1>} />
        <Route path="/" element={<h1>Головна</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  test('поки перевіряється токен, показує індикатор завантаження', () => {
    renderAdminRoute({ user: null, isAdmin: false, loading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('гостя перенаправляє на сторінку входу', async () => {
    renderAdminRoute({ user: null, isAdmin: false, loading: false });
    expect(await screen.findByRole('heading', { name: 'Сторінка входу' })).toBeInTheDocument();
  });

  test('звичайного користувача перенаправляє на головну', async () => {
    renderAdminRoute({ user: { id: 2, role: 'user' }, isAdmin: false, loading: false });
    expect(await screen.findByRole('heading', { name: 'Головна' })).toBeInTheDocument();
  });

  test('адміністратор бачить захищену сторінку', () => {
    renderAdminRoute({ user: { id: 1, role: 'admin' }, isAdmin: true, loading: false });
    expect(screen.getByRole('heading', { name: 'Адмінка' })).toBeInTheDocument();
  });
});
