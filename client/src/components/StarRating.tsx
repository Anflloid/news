import { useState } from 'react';
import styles from './StarRating.module.css';

interface Props {
  value: number; // 0 - ще не оцінював
  average: number;
  count: number;
  onRate?: (value: number) => void;
  disabled?: boolean;
}

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({ value, average, count, onRate, disabled }: Props) {
  const [hover, setHover] = useState(0);
  const shown = hover || value || Math.round(average);

  return (
    <div className={styles.wrapper}>
      <div className={styles.stars} role="group" aria-label="Оцініть статтю" onMouseLeave={() => setHover(0)}>
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${star <= shown ? styles.filled : ''}`}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => onRate && setHover(star)}
            disabled={!onRate || disabled}
            aria-label={`Оцінити на ${star} з 5`}
            aria-pressed={value === star}
          >
            ★
          </button>
        ))}
      </div>
      <span className={styles.info}>
        {average ? `${average} / 5` : 'Ще немає оцінок'} ({count})
      </span>
    </div>
  );
}
