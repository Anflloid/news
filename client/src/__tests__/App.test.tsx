import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../api/api';
import App from '../App';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { categories, makeArticle } from '../test/testData';

jest.mock('../api/api', () => ({
  getCategories: jest.fn(),
  getArticles: jest.fn(),
}));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedUseAuth = useAuth as jest.Mock;

function renderApp(url: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[url]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  mockedUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: false, logout: jest.fn(), login: jest.fn() });
  mockedApi.getCategories.mockResolvedValue(categories);
  mockedApi.getArticles.mockResolvedValue({ items: [makeArticle(1, 'Перша новина')], total: 1, page: 1, pages: 1 });
});

describe('App (маршрути)', () => {
  test('головна сторінка відкривається разом із шапкою та футером', async () => {
    renderApp('/');

    expect(screen.getByRole('heading', { name: 'Останні новини' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Перейти до вмісту' })).toHaveAttribute('href', '#main');
    expect(screen.getByText(/Усі права захищено/)).toBeInTheDocument();
    expect(await screen.findByText('Перша новина')).toBeInTheDocument();
  });

  test('сторінка входу завантажується ліниво', async () => {
    renderApp('/login');
    expect(await screen.findByRole('heading', { name: 'Вхід' })).toBeInTheDocument();
  });

  test('гостя з адмін-панелі перенаправляє на вхід', async () => {
    renderApp('/admin');
    expect(await screen.findByRole('heading', { name: 'Вхід' })).toBeInTheDocument();
  });

  test('невідома адреса показує сторінку 404', async () => {
    renderApp('/такої-сторінки-немає');
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'На головну' })).toHaveAttribute('href', '/');
  });
});
