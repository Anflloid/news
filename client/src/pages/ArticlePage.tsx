import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api/api';
import Comments from '../components/Comments';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { formatDate, readingTime } from '../utils/format';
import styles from './Pages.module.css';

export default function ArticlePage() {
  const { id } = useParams();
  const articleId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rateMessage, setRateMessage] = useState('');

  // user?.id - щоб після входу підтягнулась власна оцінка
  const { data: article, setData, loading, error } = useFetch(() => api.getArticle(articleId), [articleId, user?.id]);

  useDocumentTitle(article ? article.title : '');

  const handleRate = async (value: number) => {
    if (!user) {
      navigate('/login', { state: { from: `/article/${articleId}` } });
      return;
    }
    if (!article) return;

    // Оптимістичне оновлення: показуємо оцінку, не чекаючи сервера
    const previous = article;
    setData({ ...article, myRating: value });
    try {
      const result = await api.rateArticle(articleId, value);
      setData({ ...article, myRating: result.myRating, rating: { average: result.average, count: result.count } });
      setRateMessage('Дякуємо за оцінку!');
    } catch (err) {
      setData(previous); // відкат при помилці
      setRateMessage((err as Error).message);
    }
  };

  if (loading && !article) return <Loader />;
  if (error) {
    return (
      <div className={styles.empty}>
        <p className="error">{error}</p>
        <Link to="/">← На головну</Link>
      </div>
    );
  }
  if (!article) return null;

  const paragraphs = (article.content || '').split('\n\n');

  return (
    <article className={styles.article}>
      <Link to="/" className={styles.back}>
        ← Усі новини
      </Link>

      {article.category && (
        <Link
          to={`/?category=${article.category.slug}`}
          className={styles.badge}
          style={{ background: article.category.color }}
        >
          {article.category.name}
        </Link>
      )}

      <h1 className={styles.articleTitle}>{article.title}</h1>
      <p className={styles.lead}>{article.summary}</p>

      <div className={styles.articleMeta}>
        <span>{article.authorName}</span>
        <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
        <span>⏱ {readingTime(article.content || '')} хв читання</span>
        <span>👁 {article.views} переглядів</span>
      </div>

      <img src={article.image} alt={article.title} className={styles.cover} width={800} height={450} />

      <div className={styles.content}>
        {paragraphs.map((p, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <p key={index}>{p}</p>
        ))}
      </div>

      <section className={`card ${styles.rating}`} aria-label="Рейтинг статті">
        <h2>Оцініть статтю</h2>
        <StarRating
          value={article.myRating || 0}
          average={article.rating.average}
          count={article.rating.count}
          onRate={handleRate}
        />
        {!user && <p className="muted">Щоб поставити оцінку, потрібно увійти.</p>}
        {rateMessage && (
          <p className="muted" role="status">
            {rateMessage}
          </p>
        )}
      </section>

      <Comments articleId={article.id} />
    </article>
  );
}
