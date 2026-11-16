import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterPage from '../pages/RegisterPage';

jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockedUseAuth = useAuth as jest.Mock;
const register = jest.fn();

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<h1>Головна сторінка</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillForm(password = '123456', confirm = '123456') {
  await userEvent.type(screen.getByLabelText('Імʼя'), 'Іван');
  await userEvent.type(screen.getByLabelText('Email'), 'ivan@test.ua');
  await userEvent.type(screen.getByLabelText('Пароль'), password);
  await userEvent.type(screen.getByLabelText('Повторіть пароль'), confirm);
}

beforeEach(() => {
  register.mockReset();
  mockedUseAuth.mockReturnValue({ register });
});

describe('RegisterPage', () => {
  test('показує помилку, якщо форма порожня', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    expect(screen.getByRole('alert')).toHaveTextContent('щонайменше 2 символи');
    expect(register).not.toHaveBeenCalled();
  });

  test('показує помилку, якщо паролі не збігаються', async () => {
    renderRegister();
    await fillForm('123456', '654321');
    await userEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Паролі не збігаються');
  });

  test('успішна реєстрація переводить на головну сторінку', async () => {
    register.mockResolvedValue(undefined);
    renderRegister();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    expect(await screen.findByRole('heading', { name: 'Головна сторінка' })).toBeInTheDocument();
    expect(register).toHaveBeenCalledWith('Іван', 'ivan@test.ua', '123456');
  });

  test('показує повідомлення сервера, якщо email зайнятий', async () => {
    register.mockRejectedValue(new Error('Користувач з таким email вже існує'));
    renderRegister();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Зареєструватися' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Користувач з таким email вже існує');
  });
});
