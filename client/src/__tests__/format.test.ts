import { plural, readingTime } from '../utils/format';
import { validateRegister } from '../pages/RegisterPage';

describe('plural - відмінювання слів після числа', () => {
  const forms: [string, string, string] = ['коментар', 'коментарі', 'коментарів'];

  test.each([
    [1, 'коментар'],
    [2, 'коментарі'],
    [5, 'коментарів'],
    [11, 'коментарів'],
    [21, 'коментар'],
    [24, 'коментарі'],
  ])('%i → %s', (n, expected) => {
    expect(plural(n, forms)).toBe(expected);
  });
});

describe('readingTime - час читання', () => {
  test('короткий текст - мінімум 1 хвилина', () => {
    expect(readingTime('Кілька слів')).toBe(1);
  });

  test('360 слів - 2 хвилини', () => {
    expect(readingTime('слово '.repeat(360))).toBe(2);
  });
});

describe('validateRegister - перевірка форми реєстрації', () => {
  test('коректні дані - без помилки', () => {
    expect(validateRegister('Іван', 'ivan@test.ua', '123456', '123456')).toBe('');
  });

  test('некоректний email', () => {
    expect(validateRegister('Іван', 'ivan', '123456', '123456')).toMatch(/email/);
  });

  test('короткий пароль', () => {
    expect(validateRegister('Іван', 'ivan@test.ua', '123', '123')).toMatch(/6 символів/);
  });

  test('паролі не збігаються', () => {
    expect(validateRegister('Іван', 'ivan@test.ua', '123456', '654321')).toBe('Паролі не збігаються');
  });
});
