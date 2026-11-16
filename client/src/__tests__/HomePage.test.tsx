import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../api/api';
import HomePage from '../pages/HomePage';
import { categories, makeArticle } from '../test/testData';

jest.mock('../api/api', () => ({
  getCategories: jest.fn(),
  getArticles: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

const page = {
  items: [makeArticle(1, 'Перша новина'), makeArticle(2, 'Друга новина', { categoryId: 3, category: categories[1] })],
  total: 2,
  page: 1,
  pages: 1,
};

function renderHome(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getCategories.mockResolvedValue(categories);
  mockedApi.getArticles.mockResolvedValue(page);
});

describe('HomePage', () => {
  test('показує заголовок, категорії та список статей', async () => {
    renderHome();

    expect(screen.getByRole('heading', { level: 1, name: 'Останні новини' })).toBeInTheDocument();
    expect(await screen.findByText('Перша новина')).toBeInTheDocument();
    expect(screen.getByText('Друга новина')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Спорт' })).toBeInTheDocument();
  });

  test('запитує першу сторінку з сортуванням «спочатку нові»', async () => {
    renderHome();
    await screen.findByText('Перша новина');
    expect(mockedApi.getArticles).toHaveBeenCalledWith({ category: '', sort: 'new', page: 1, search: '', limit: 6 });
  });

  test('кнопка категорії фільтрує новини', async () => {
    renderHome();
    await userEvent.click(await screen.findByRole('button', { name: 'Спорт' }));

    await waitFor(() =>
      expect(mockedApi.getArticles).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'sport' })),
    );
    expect(await screen.findByRole('heading', { level: 1, name: 'Спорт' })).toBeInTheDocument();
  });

  test('зміна сортування робить новий запит', async () => {
    renderHome();
    await screen.findByText('Перша новина');

    await userEvent.selectOptions(screen.getByLabelText('Сортування'), 'popular');

    await waitFor(() =>
      expect(mockedApi.getArticles).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'popular' })),
    );
  });

  test('пошук відправляється після паузи у введенні', async () => {
    renderHome();
    await screen.findByText('Перша новина');

    await userEvent.type(screen.getByLabelText('Пошук новин'), 'спорт');

    await waitFor(() =>
      expect(mockedApi.getArticles).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'спорт' })),
    );
  });

  test('якщо нічого не знайдено, показує відповідне повідомлення', async () => {
    mockedApi.getArticles.mockResolvedValue({ items: [], total: 0, page: 1, pages: 1 });
    renderHome();
    expect(await screen.findByText(/Нічого не знайдено/)).toBeInTheDocument();
  });

  test('при помилці показує повідомлення і кнопку повтору', async () => {
    mockedApi.getArticles.mockRejectedValueOnce(new Error('Сервер недоступний'));
    renderHome();

    expect(await screen.findByRole('alert')).toHaveTextContent('Сервер недоступний');

    await userEvent.click(screen.getByRole('button', { name: 'Спробувати ще раз' }));
    expect(await screen.findByText('Перша новина')).toBeInTheDocument();
    expect(mockedApi.getArticles).toHaveBeenCalledTimes(2);
  });

  test('категорію з адреси сторінки застосовує одразу', async () => {
    renderHome('/?category=tech');
    expect(await screen.findByRole('heading', { level: 1, name: 'Технології' })).toBeInTheDocument();
    expect(mockedApi.getArticles).toHaveBeenCalledWith(expect.objectContaining({ category: 'tech' }));
  });
});
