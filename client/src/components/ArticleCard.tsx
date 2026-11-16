import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { formatDate, plural } from '../utils/format';
import styles from './ArticleCard.module.css';

interface Props {
  article: Article;
}

function ArticleCard({ article }: Props) {
  const { id, title, summary, image, category, createdAt, views, rating, commentsCount } = article;

  return (
    <article className={`card ${styles.card}`}>
      <Link to={`/article/${id}`} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        <img src={image} alt="" loading="lazy" width={400} height={225} className={styles.image} />
      </Link>
      <div className={styles.body}>
        {category && (
          <span className={styles.category} style={{ background: category.color }}>
            {category.name}
          </span>
        )}
        <h2 className={styles.title}>
          <Link to={`/article/${id}`}>{title}</Link>
        </h2>
        <p className={styles.summary}>{summary}</p>
        <div className={styles.meta}>
          <time dateTime={createdAt}>{formatDate(createdAt)}</time>
          <span title="Перегляди">👁 {views}</span>
          <span title="Рейтинг">⭐ {rating.average || '-'}</span>
          <span>
            💬 {commentsCount} {plural(commentsCount, ['коментар', 'коментарі', 'коментарів'])}
          </span>
        </div>
      </div>
    </article>
  );
}

// memo: картка не перерендерюється, якщо її дані не змінилися
export default memo(ArticleCard);
