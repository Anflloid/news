import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import type { Article } from '../types';

const article: Article = {
  id: 7,
  title: 'Тестова новина',
  summary: 'Короткий опис тестової новини',
  image: '/images/tech.svg',
  categoryId: 1,
  category: { id: 1, name: 'Технології', slug: 'tech', color: '#2563eb' },
  authorName: 'Адміністратор',
  views: 120,
  createdAt: '2026-11-10T10:00:00.000Z',
  rating: { average: 4.2, count: 5 },
  commentsCount: 3,
};

function renderCard() {
  return render(
    <MemoryRouter>
      <ArticleCard article={article} />
    </MemoryRouter>,
  );
}

describe('ArticleCard', () => {
  test('показує заголовок, опис і категорію', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Тестова новина' })).toBeInTheDocument();
    expect(screen.getByText('Короткий опис тестової новини')).toBeInTheDocument();
    expect(screen.getByText('Технології')).toBeInTheDocument();
  });

  test('заголовок веде на сторінку статті', () => {
    renderCard();
    expect(screen.getByRole('link', { name: 'Тестова новина' })).toHaveAttribute('href', '/article/7');
  });

  test('показує перегляди, рейтинг і правильну форму слова "коментарі"', () => {
    renderCard();
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/4.2/)).toBeInTheDocument();
    expect(screen.getByText(/3 коментарі/)).toBeInTheDocument();
  });
});
