import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockedUseAuth = useAuth as jest.Mock;
const logout = jest.fn();

const guest = { user: null, isAdmin: false, loading: false, logout };
const reader = {
  user: { id: 2, name: 'Олена Коваль', email: 'olena@news.ua', role: 'user' },
  isAdmin: false,
  loading: false,
  logout,
};
const admin = {
  user: { id: 1, name: 'Адміністратор', email: 'admin@news.ua', role: 'admin' },
  isAdmin: true,
  loading: false,
  logout,
};

function renderHeader() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  logout.mockClear();
});

describe('Header', () => {
  test('гість бачить кнопки входу та реєстрації', () => {
    mockedUseAuth.mockReturnValue(guest);
    renderHeader();

    expect(screen.getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Реєстрація' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: 'Адмін-панель' })).not.toBeInTheDocument();
  });

  test('користувач бачить своє імʼя і може вийти', async () => {
    mockedUseAuth.mockReturnValue(reader);
    renderHeader();

    expect(screen.getByText('Олена Коваль')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Адмін-панель' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Вийти' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  test('адміністратор бачить посилання на адмін-панель', () => {
    mockedUseAuth.mockReturnValue(admin);
    renderHeader();
    expect(screen.getByRole('link', { name: 'Адмін-панель' })).toHaveAttribute('href', '/admin');
  });

  test('кнопка теми перемикає світлу і темну тему', async () => {
    mockedUseAuth.mockReturnValue(guest);
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Увімкнути темну тему' }));
    expect(screen.getByRole('button', { name: 'Увімкнути світлу тему' })).toBeInTheDocument();
  });

  test('кнопка меню відкриває навігацію на мобільних пристроях', async () => {
    mockedUseAuth.mockReturnValue(guest);
    renderHeader();

    const burger = screen.getByRole('button', { name: 'Відкрити меню' });
    expect(burger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(burger);
    expect(burger).toHaveAttribute('aria-expanded', 'true');
  });
});
