import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeButton />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('ThemeContext', () => {
  test('за замовчуванням вмикається світла тема', () => {
    renderWithTheme();
    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  test('перемикає тему і запамʼятовує вибір у localStorage', async () => {
    renderWithTheme();
    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('бере збережену тему з localStorage', () => {
    localStorage.setItem('theme', 'dark');
    renderWithTheme();
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });

  test('useTheme поза провайдером кидає зрозумілу помилку', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeButton />)).toThrow('useTheme потрібно використовувати всередині ThemeProvider');
    spy.mockRestore();
  });
});
