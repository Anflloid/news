import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from '../components/StarRating';

describe('StarRating', () => {
  test('показує середню оцінку та кількість голосів', () => {
    render(<StarRating value={0} average={4.5} count={10} />);
    expect(screen.getByText('4.5 / 5 (10)')).toBeInTheDocument();
  });

  test('показує текст, якщо оцінок ще немає', () => {
    render(<StarRating value={0} average={0} count={0} />);
    expect(screen.getByText(/Ще немає оцінок/)).toBeInTheDocument();
  });

  test('викликає onRate з номером натиснутої зірки', async () => {
    const onRate = jest.fn();
    render(<StarRating value={0} average={0} count={0} onRate={onRate} />);

    await userEvent.click(screen.getByRole('button', { name: 'Оцінити на 4 з 5' }));

    expect(onRate).toHaveBeenCalledWith(4);
  });

  test('без onRate зірки неактивні (режим лише перегляду)', () => {
    render(<StarRating value={0} average={3} count={2} />);
    screen.getAllByRole('button').forEach((star) => expect(star).toBeDisabled());
  });
});
