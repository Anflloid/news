import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api/api';
import ArticleCard from '../components/ArticleCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import type { SortType } from '../types';
import styles from './Pages.module.css';

const PAGE_SIZE = 6;

export default function HomePage() {
  // Фільтри зберігаються в адресі сторінки: ?category=sport&page=2
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = (params.get('sort') as SortType) || 'new';
  const page = Number(params.get('page')) || 1;

  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search);

  const { data: categories } = useFetch(api.getCategories, []);
  const { data, loading, error, reload } = useFetch(
    () => api.getArticles({ category, sort, page, search: debouncedSearch, limit: PAGE_SIZE }),
    [category, sort, page, debouncedSearch],
  );

  const currentCategory = categories?.find((c) => c.slug === category);
  useDocumentTitle(currentCategory ? currentCategory.name : '');

  // При зміні фільтра повертаємось на першу сторінку
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    if ((params.get('search') || '') !== debouncedSearch) updateParam('search', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const changePage = (p: number) => {
    updateParam('page', String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className={styles.hero}>
        <h1>{currentCategory ? currentCategory.name : 'Останні новини'}</h1>
        <p className="muted">Технології, наука, спорт, культура та економіка - коротко і зрозуміло.</p>
      </section>

      <div className={styles.toolbar}>
        <label htmlFor="search" className="sr-only">
          Пошук новин
        </label>
        <input
          id="search"
          type="search"
          className={`input ${styles.search}`}
          placeholder="🔍 Пошук новин..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label htmlFor="sort" className="sr-only">
          Сортування
        </label>
        <select
          id="sort"
          className={`input ${styles.sort}`}
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
        >
          <option value="new">Спочатку нові</option>
          <option value="popular">Найпопулярніші</option>
          <option value="rating">З найвищим рейтингом</option>
        </select>
      </div>

      <nav className={styles.categories} aria-label="Категорії">
        <button
          type="button"
          className={`btn btn-small ${category ? 'btn-outline' : ''}`}
          onClick={() => updateParam('category', '')}
        >
          Усі
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn btn-small ${category === c.slug ? '' : 'btn-outline'}`}
            onClick={() => updateParam('category', c.slug)}
          >
            {c.name}
          </button>
        ))}
      </nav>

      {loading && <Loader />}

      {error && (
        <div className="error" role="alert">
          {error}{' '}
          <button type="button" className="btn btn-small" onClick={reload}>
            Спробувати ще раз
          </button>
        </div>
      )}

      {!loading && data && data.items.length === 0 && <p className={styles.empty}>Нічого не знайдено 🤷</p>}

      {!loading && data && data.items.length > 0 && (
        <>
          <div className={styles.grid}>
            {data.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={changePage} />
        </>
      )}
    </>
  );
}
