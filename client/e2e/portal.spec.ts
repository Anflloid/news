import { expect, test } from '@playwright/test';

test('гість бачить новини і може відкрити статтю', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Останні новини' })).toBeVisible();
  await expect(page.locator('article')).toHaveCount(6);

  await page.locator('article h2 a').first().click();
  await expect(page).toHaveURL(/\/article\/\d+/);
  await expect(page.getByText('Увійдіть')).toBeVisible();
});

test('фільтр за категорією показує лише новини цієї категорії', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Спорт' }).click();
  await expect(page).toHaveURL(/category=sport/);
  await expect(page.getByRole('heading', { name: 'Спорт', level: 1 })).toBeVisible();
  await expect(page.locator('article')).toHaveCount(2);
});

test('пошук знаходить статтю за словом', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Пошук новин').fill('марафон');
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.locator('article h2')).toContainText('марафон');
});

test('користувач входить, ставить оцінку і пише коментар', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('andrii@news.ua');
  await page.getByLabel('Пароль').fill('user123');
  await page.getByRole('button', { name: 'Увійти' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/article/3');
  await page.getByLabel('Оцінити на 4 з 5').click();
  await expect(page.getByText('Дякуємо за оцінку!')).toBeVisible();

  const text = `Тестовий коментар ${Date.now()}`;
  await page.getByLabel('Ваш коментар').fill(text);
  await page.getByRole('button', { name: 'Надіслати' }).click();
  await expect(page.getByText(text)).toBeVisible();
});

test('звичайного користувача не пускає в адмін-панель', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});
