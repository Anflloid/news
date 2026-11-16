import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../api/api';
import AdminPage from '../pages/AdminPage';
import { makeArticle } from '../test/testData';

jest.mock('../api/api', () => ({
  getArticles: jest.fn(),
  deleteArticle: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getArticles.mockResolvedValue({
    items: [
      makeArticle(1, 'Перша новина', { views: 100, commentsCount: 4 }),
      makeArticle(2, 'Друга новина', { views: 250, commentsCount: 7 }),
    ],
    total: 2,
    page: 1,
    pages: 1,
  });
});

describe('AdminPage', () => {
  test('показує статистику: перегляди і коментарі всіх статей', async () => {
    renderAdmin();

    expect(await screen.findByText('350')).toBeInTheDocument(); // 100 + 250 переглядів
    expect(screen.getByText('11')).toBeInTheDocument(); // 4 + 7 коментарів
    expect(mockedApi.getArticles).toHaveBeenCalledWith({ limit: 50 });
  });

  test('показує таблицю статей з посиланнями на редагування', async () => {
    renderAdmin();

    expect(await screen.findByRole('link', { name: 'Перша новина' })).toHaveAttribute('href', '/article/1');
    const editLinks = screen.getAllByRole('link', { name: 'Редагувати' });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[1]).toHaveAttribute('href', '/admin/edit/2');
    expect(screen.getByRole('link', { name: '+ Нова стаття' })).toHaveAttribute('href', '/admin/new');
  });

  test('видаляє статтю після підтвердження', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockedApi.deleteArticle.mockResolvedValue(undefined);
    renderAdmin();
    await screen.findByText('Перша новина');

    await userEvent.click(screen.getAllByRole('button', { name: 'Видалити' })[0]);

    await waitFor(() => expect(screen.queryByText('Перша новина')).not.toBeInTheDocument());
    expect(mockedApi.deleteArticle).toHaveBeenCalledWith(1);
    confirmSpy.mockRestore();
  });

  test('не видаляє статтю, якщо адміністратор натиснув «Скасувати»', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderAdmin();
    await screen.findByText('Перша новина');

    await userEvent.click(screen.getAllByRole('button', { name: 'Видалити' })[0]);

    expect(mockedApi.deleteArticle).not.toHaveBeenCalled();
    expect(screen.getByText('Перша новина')).toBeInTheDocument();
    confirmSpy.mockRestore();
  });
});
