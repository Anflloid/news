import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Сторінку не знайдено');
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>
      <p className="muted">Такої сторінки не існує.</p>
      <Link to="/" className="btn">
        На головну
      </Link>
    </div>
  );
}
