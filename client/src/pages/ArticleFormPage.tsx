import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../api/api';
import Loader from '../components/Loader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import type { ArticleFormData } from '../types';
import styles from './Pages.module.css';

const emptyForm: ArticleFormData = { title: '', summary: '', content: '', categoryId: 0 };

export default function ArticleFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: categories } = useFetch(api.getCategories, []);
  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [loadingArticle, setLoadingArticle] = useState(isEdit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useDocumentTitle(isEdit ? 'Редагування статті' : 'Нова стаття');

  useEffect(() => {
    if (!id) return;
    api
      .getArticle(Number(id))
      .then((a) => setForm({ title: a.title, summary: a.summary, content: a.content || '', categoryId: a.categoryId }))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingArticle(false));
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'categoryId' ? Number(value) : value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      setError('Оберіть категорію');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = isEdit ? await api.updateArticle(Number(id), form) : await api.createArticle(form);
      navigate(`/article/${saved.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  if (loadingArticle) return <Loader />;

  return (
    <div className={`card ${styles.formCard}`}>
      <h1>{isEdit ? 'Редагування статті' : 'Нова стаття'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Заголовок</label>
          <input
            id="title"
            name="title"
            className="input"
            value={form.title}
            onChange={handleChange}
            required
            minLength={5}
          />
        </div>
        <div className="form-group">
          <label htmlFor="categoryId">Категорія</label>
          <select
            id="categoryId"
            name="categoryId"
            className="input"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            <option value={0} disabled>
              - Оберіть категорію -
            </option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="summary">Короткий опис</label>
          <textarea
            id="summary"
            name="summary"
            className="input"
            rows={2}
            value={form.summary}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Текст статті</label>
          <textarea
            id="content"
            name="content"
            className="input"
            rows={12}
            value={form.content}
            onChange={handleChange}
            required
          />
          <small className="muted">Абзаци розділяйте порожнім рядком.</small>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}
