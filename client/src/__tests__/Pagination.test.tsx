import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../components/Pagination';

describe('Pagination', () => {
  test('нічого не показує, якщо сторінка одна', () => {
    const { container } = render(<Pagination page={1} pages={1} onChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('кнопка "Назад" неактивна на першій сторінці', () => {
    render(<Pagination page={1} pages={3} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /Назад/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Далі/ })).toBeEnabled();
  });

  test('позначає поточну сторінку і перемикає на іншу', async () => {
    const onChange = jest.fn();
    render(<Pagination page={2} pages={3} onChange={onChange} />);

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
