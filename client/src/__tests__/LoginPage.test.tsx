import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as api from '../api/api';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

// Замість справжнього сервера - мок модуля api
jest.mock('../api/api', () => ({
  TOKEN_KEY: 'news_token',
  login: jest.fn(),
  getMe: jest.fn(),
}));

const mockedLogin = api.login as jest.Mock;

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Головна сторінка</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  mockedLogin.mockReset();
});

describe('LoginPage', () => {
  test('показує помилку, якщо поля порожні', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Введіть email та пароль');
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  test('успішний вхід зберігає токен і переходить на головну', async () => {
    mockedLogin.mockResolvedValue({
      token: 'test-token',
      user: { id: 1, name: 'Адмін', email: 'admin@news.ua', role: 'admin' },
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'admin@news.ua');
    await userEvent.type(screen.getByLabelText('Пароль'), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(await screen.findByText('Головна сторінка')).toBeInTheDocument();
    expect(mockedLogin).toHaveBeenCalledWith('admin@news.ua', 'admin123');
    expect(localStorage.getItem('news_token')).toBe('test-token');
  });

  test('показує повідомлення сервера при невірному паролі', async () => {
    mockedLogin.mockRejectedValue(new Error('Невірний email або пароль'));
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'admin@news.ua');
    await userEvent.type(screen.getByLabelText('Пароль'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Невірний email або пароль');
  });
});
