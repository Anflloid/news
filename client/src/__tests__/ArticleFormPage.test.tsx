import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as api from '../api/api';
import ArticleFormPage from '../pages/ArticleFormPage';
import { categories, makeArticle } from '../test/testData';

jest.mock('../api/api', () => ({
  getCategories: jest.fn(),
  getArticle: jest.fn(),
  createArticle: jest.fn(),
  updateArticle: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

function renderForm(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/admin/new" element={<ArticleFormPage />} />
        <Route path="/admin/edit/:id" element={<ArticleFormPage />} />
        <Route path="/article/:id" element={<h1>Сторінка статті</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillTextFields() {
  await userEvent.type(screen.getByLabelText('Заголовок'), 'Нова тестова стаття');
  await userEvent.type(screen.getByLabelText('Короткий опис'), 'Опис нової тестової статті');
  await userEvent.type(screen.getByLabelText('Текст статті'), 'Текст нової тестової статті для перевірки');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getCategories.mockResolvedValue(categories);
});

describe('ArticleFormPage', () => {
  test('створює статтю і переходить на її сторінку', async () => {
    mockedApi.createArticle.mockResolvedValue(makeArticle(15, 'Нова тестова стаття'));
    renderForm('/admin/new');

    expect(screen.getByRole('heading', { name: 'Нова стаття' })).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Технології' });

    await fillTextFields();
    await userEvent.selectOptions(screen.getByLabelText('Категорія'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(await screen.findByRole('heading', { name: 'Сторінка статті' })).toBeInTheDocument();
    expect(mockedApi.createArticle).toHaveBeenCalledWith({
      title: 'Нова тестова стаття',
      summary: 'Опис нової тестової статті',
      content: 'Текст нової тестової статті для перевірки',
      categoryId: 1,
    });
  });

  test('не дозволяє зберегти статтю без категорії', async () => {
    renderForm('/admin/new');
    await screen.findByRole('option', { name: 'Технології' });

    await fillTextFields();
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Оберіть категорію');
    expect(mockedApi.createArticle).not.toHaveBeenCalled();
  });

  test('показує помилку, яку повернув сервер', async () => {
    mockedApi.createArticle.mockRejectedValue(new Error('Текст статті занадто короткий'));
    renderForm('/admin/new');
    await screen.findByRole('option', { name: 'Технології' });

    await fillTextFields();
    await userEvent.selectOptions(screen.getByLabelText('Категорія'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Текст статті занадто короткий');
  });

  test('у режимі редагування заповнює форму і зберігає зміни', async () => {
    mockedApi.getArticle.mockResolvedValue(makeArticle(7, 'Стара назва статті'));
    mockedApi.updateArticle.mockResolvedValue(makeArticle(7, 'Оновлена назва статті'));
    renderForm('/admin/edit/7');

    const title = await screen.findByDisplayValue('Стара назва статті');
    expect(screen.getByRole('heading', { name: 'Редагування статті' })).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Технології' });

    await userEvent.clear(title);
    await userEvent.type(title, 'Оновлена назва статті');
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(await screen.findByRole('heading', { name: 'Сторінка статті' })).toBeInTheDocument();
    expect(mockedApi.getArticle).toHaveBeenCalledWith(7);
    expect(mockedApi.updateArticle).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ title: 'Оновлена назва статті', categoryId: 1 }),
    );
  });
});
