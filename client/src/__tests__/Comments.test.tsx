import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../api/api';
import Comments from '../components/Comments';
import { useAuth } from '../context/AuthContext';

jest.mock('../api/api', () => ({
  getComments: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
}));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockedUseAuth = useAuth as jest.Mock;
const mockedApi = api as jest.Mocked<typeof api>;

const comments = [
  {
    id: 1,
    articleId: 5,
    userId: 2,
    userName: 'Олена Коваль',
    text: 'Перший коментар',
    createdAt: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 2,
    articleId: 5,
    userId: 3,
    userName: 'Андрій Мельник',
    text: 'Другий коментар',
    createdAt: '2026-11-10T11:00:00.000Z',
  },
];
const olena = { id: 2, name: 'Олена Коваль', email: 'olena@news.ua', role: 'user' };

function renderComments() {
  return render(
    <MemoryRouter>
      <Comments articleId={5} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getComments.mockResolvedValue(comments);
  mockedUseAuth.mockReturnValue({ user: null, isAdmin: false });
});

describe('Comments', () => {
  test('завантажує і показує коментарі статті', async () => {
    renderComments();

    expect(await screen.findByText('Перший коментар')).toBeInTheDocument();
    expect(screen.getByText('Другий коментар')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Коментарі (2)' })).toBeInTheDocument();
    expect(mockedApi.getComments).toHaveBeenCalledWith(5);
  });

  test('якщо коментарів немає, пропонує стати першим', async () => {
    mockedApi.getComments.mockResolvedValue([]);
    renderComments();
    expect(await screen.findByText(/Коментарів ще немає/)).toBeInTheDocument();
  });

  test('гість бачить пропозицію увійти замість форми', async () => {
    renderComments();
    await screen.findByText('Перший коментар');

    expect(screen.getByRole('link', { name: 'Увійдіть' })).toHaveAttribute('href', '/login');
    expect(screen.queryByLabelText('Ваш коментар')).not.toBeInTheDocument();
  });

  test('користувач додає коментар, і він зʼявляється у списку', async () => {
    mockedUseAuth.mockReturnValue({ user: olena, isAdmin: false });
    mockedApi.addComment.mockResolvedValue({
      id: 3,
      articleId: 5,
      userId: 2,
      userName: 'Олена Коваль',
      text: 'Новий коментар',
      createdAt: '2026-11-10T12:00:00.000Z',
    });
    renderComments();
    await screen.findByText('Перший коментар');

    await userEvent.type(screen.getByLabelText('Ваш коментар'), 'Новий коментар');
    await userEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

    expect(await screen.findByText('Новий коментар')).toBeInTheDocument();
    expect(mockedApi.addComment).toHaveBeenCalledWith(5, 'Новий коментар');
    expect(screen.getByLabelText('Ваш коментар')).toHaveValue('');
  });

  test('занадто короткий коментар не надсилається', async () => {
    mockedUseAuth.mockReturnValue({ user: olena, isAdmin: false });
    renderComments();
    await screen.findByText('Перший коментар');

    await userEvent.type(screen.getByLabelText('Ваш коментар'), 'а');
    await userEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Коментар занадто короткий');
    expect(mockedApi.addComment).not.toHaveBeenCalled();
  });

  test('користувач може видалити лише свій коментар', async () => {
    mockedUseAuth.mockReturnValue({ user: olena, isAdmin: false });
    mockedApi.deleteComment.mockResolvedValue(undefined);
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderComments();
    await screen.findByText('Перший коментар');

    const deleteButtons = screen.getAllByRole('button', { name: 'Видалити' });
    expect(deleteButtons).toHaveLength(1); // лише біля коментаря Олени

    await userEvent.click(deleteButtons[0]);
    await waitFor(() => expect(screen.queryByText('Перший коментар')).not.toBeInTheDocument());
    expect(mockedApi.deleteComment).toHaveBeenCalledWith(1);
    confirmSpy.mockRestore();
  });

  test('адміністратор може видаляти будь-які коментарі', async () => {
    mockedUseAuth.mockReturnValue({ user: { id: 1, name: 'Адміністратор', role: 'admin' }, isAdmin: true });
    renderComments();
    await screen.findByText('Перший коментар');
    expect(screen.getAllByRole('button', { name: 'Видалити' })).toHaveLength(2);
  });
});
