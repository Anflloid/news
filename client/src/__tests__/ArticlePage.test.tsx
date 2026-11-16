import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as api from '../api/api';
import { useAuth } from '../context/AuthContext';
import ArticlePage from '../pages/ArticlePage';
import { makeArticle } from '../test/testData';

jest.mock('../api/api', () => ({
  getArticle: jest.fn(),
  rateArticle: jest.fn(),
  getComments: jest.fn(),
}));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedUseAuth = useAuth as jest.Mock;
const olena = { id: 2, name: 'Олена Коваль', email: 'olena@news.ua', role: 'user' };

function renderArticle() {
  return render(
    <MemoryRouter initialEntries={['/article/7']}>
      <Routes>
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/login" element={<h1>Сторінка входу</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getArticle.mockResolvedValue(makeArticle(7, 'Тестова стаття', { myRating: 0 }));
  mockedApi.getComments.mockResolvedValue([]);
  mockedUseAuth.mockReturnValue({ user: null, isAdmin: false });
});

describe('ArticlePage', () => {
  test('показує заголовок, автора і текст статті по абзацах', async () => {
    renderArticle();

    expect(await screen.findByRole('heading', { level: 1, name: 'Тестова стаття' })).toBeInTheDocument();
    expect(screen.getByText('Адміністратор')).toBeInTheDocument();
    expect(screen.getByText('Перший абзац статті.')).toBeInTheDocument();
    expect(screen.getByText('Другий абзац статті.')).toBeInTheDocument();
    expect(screen.getByText('4 / 5 (2)')).toBeInTheDocument();
    expect(mockedApi.getArticle).toHaveBeenCalledWith(7);
    expect(document.title).toBe('Тестова стаття - Новини');
  });

  test('гостя при спробі оцінити перенаправляє на вхід', async () => {
    renderArticle();
    await userEvent.click(await screen.findByRole('button', { name: 'Оцінити на 5 з 5' }));
    expect(await screen.findByRole('heading', { name: 'Сторінка входу' })).toBeInTheDocument();
    expect(mockedApi.rateArticle).not.toHaveBeenCalled();
  });

  test('користувач ставить оцінку, і рейтинг оновлюється', async () => {
    mockedUseAuth.mockReturnValue({ user: olena, isAdmin: false });
    mockedApi.rateArticle.mockResolvedValue({ average: 4.3, count: 3, myRating: 5 });
    renderArticle();

    await userEvent.click(await screen.findByRole('button', { name: 'Оцінити на 5 з 5' }));

    expect(await screen.findByText('Дякуємо за оцінку!')).toBeInTheDocument();
    expect(screen.getByText('4.3 / 5 (3)')).toBeInTheDocument();
    expect(mockedApi.rateArticle).toHaveBeenCalledWith(7, 5);
  });

  test('якщо сервер не прийняв оцінку, показує помилку', async () => {
    mockedUseAuth.mockReturnValue({ user: olena, isAdmin: false });
    mockedApi.rateArticle.mockRejectedValue(new Error('Помилка сервера'));
    renderArticle();

    await userEvent.click(await screen.findByRole('button', { name: 'Оцінити на 3 з 5' }));

    expect(await screen.findByText('Помилка сервера')).toBeInTheDocument();
    expect(screen.getByText('4 / 5 (2)')).toBeInTheDocument();
  });

  test('якщо статтю не знайдено, показує помилку і посилання на головну', async () => {
    mockedApi.getArticle.mockRejectedValue(new Error('Статтю не знайдено'));
    renderArticle();

    expect(await screen.findByText('Статтю не знайдено')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← На головну' })).toHaveAttribute('href', '/');
  });
});
