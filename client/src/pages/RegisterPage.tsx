import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Pages.module.css';

export function validateRegister(name: string, email: string, password: string, confirm: string): string {
  if (name.trim().length < 2) return "Ім'я має містити щонайменше 2 символи";
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Введіть коректний email';
  if (password.length < 6) return 'Пароль має містити щонайменше 6 символів';
  if (password !== confirm) return 'Паролі не збігаються';
  return '';
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useDocumentTitle('Реєстрація');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateRegister(form.name, form.email, form.password, form.confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card ${styles.authCard}`}>
      <h1>Реєстрація</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Імʼя</label>
          <input
            id="name"
            name="name"
            className="input"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Повторіть пароль</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.confirm}
            onChange={handleChange}
          />
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Реєстрація...' : 'Зареєструватися'}
        </button>
      </form>
      <p className="muted">
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </p>
    </div>
  );
}
