import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

function BrokenComponent(): JSX.Element {
  throw new Error('Тестова помилка');
}

describe('ErrorBoundary', () => {
  test('показує запасний інтерфейс замість "білого екрана"', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Щось пішло не так/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Оновити сторінку' })).toBeInTheDocument();
    spy.mockRestore();
  });

  test('без помилок просто показує дочірні компоненти', () => {
    render(
      <ErrorBoundary>
        <p>Все працює</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Все працює')).toBeInTheDocument();
  });
});
