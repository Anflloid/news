import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/api';
import Loader from '../components/Loader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { formatDate } from '../utils/format';
import styles from './Pages.module.css';

export default function AdminPage() {
  useDocumentTitle('Адмін-панель');
  const { data, setData, loading, error } = useFetch(() => api.getArticles({ limit: 50 }), []);

  const stats = useMemo(() => {
    const items = data?.items || [];
    return {
      articles: items.length,
      views: items.reduce((sum, a) => sum + a.views, 0),
      comments: items.reduce((sum, a) => sum + a.commentsCount, 0),
    };
  }, [data]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Видалити статтю «${title}»?`)) return;
    try {
      await api.deleteArticle(id);
      if (data) setData({ ...data, items: data.items.filter((a) => a.id !== id), total: data.total - 1 });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <div className={styles.adminHeader}>
        <h1>Адмін-панель</h1>
        <Link to="/admin/new" className="btn">
          + Нова стаття
        </Link>
      </div>

      <div className={styles.stats}>
        <div className="card">
          <strong>{stats.articles}</strong>
          <span>статей</span>
        </div>
        <div className="card">
          <strong>{stats.views}</strong>
          <span>переглядів</span>
        </div>
        <div className="card">
          <strong>{stats.comments}</strong>
          <span>коментарів</span>
        </div>
      </div>

      <div className={`card ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Заголовок</th>
              <th scope="col">Категорія</th>
              <th scope="col">Дата</th>
              <th scope="col">Перегляди</th>
              <th scope="col">Рейтинг</th>
              <th scope="col">
                <span className="sr-only">Дії</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link to={`/article/${a.id}`}>{a.title}</Link>
                </td>
                <td>{a.category?.name}</td>
                <td>{formatDate(a.createdAt)}</td>
                <td>{a.views}</td>
                <td>⭐ {a.rating.average || '-'}</td>
                <td>
                  <div className={styles.actions}>
                    <Link to={`/admin/edit/${a.id}`} className="btn btn-outline btn-small">
                      Редагувати
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(a.id, a.title)}
                    >
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
