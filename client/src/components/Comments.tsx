import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';
import { formatDate } from '../utils/format';
import styles from './Comments.module.css';

// Нові коментарі підвантажуються кожні 15 секунд
const REFRESH_INTERVAL = 15000;

export default function Comments({ articleId }: { articleId: number }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = () =>
      api
        .getComments(articleId)
        .then(setComments)
        .catch(() => {});
    load();
    const timer = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(timer); // зупиняємо при виході зі сторінки
  }, [articleId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 2) {
      setError('Коментар занадто короткий');
      return;
    }
    setSending(true);
    setError('');
    try {
      const created = await api.addComment(articleId, text.trim());
      setComments((prev) => [created, ...prev]);
      setText('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити коментар?')) return;
    try {
      await api.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="comments-title">
      <h2 id="comments-title">Коментарі ({comments.length})</h2>

      {user ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="comment-text" className="sr-only">
            Ваш коментар
          </label>
          <textarea
            id="comment-text"
            className="input"
            rows={3}
            maxLength={1000}
            placeholder="Напишіть коментар..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn" disabled={sending}>
            {sending ? 'Надсилання...' : 'Надіслати'}
          </button>
        </form>
      ) : (
        <p className={styles.loginHint}>
          <Link to="/login">Увійдіть</Link>, щоб залишити коментар.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="muted">Коментарів ще немає. Будьте першим!</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((c) => (
            <li key={c.id} className={styles.item}>
              <div className={styles.head}>
                <span className={styles.avatar} aria-hidden="true">
                  {c.userName.charAt(0)}
                </span>
                <strong>{c.userName}</strong>
                <time className="muted" dateTime={c.createdAt}>
                  {formatDate(c.createdAt)}
                </time>
                {(user?.id === c.userId || isAdmin) && (
                  <button type="button" className={styles.delete} onClick={() => handleDelete(c.id)}>
                    Видалити
                  </button>
                )}
              </div>
              <p className={styles.text}>{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
