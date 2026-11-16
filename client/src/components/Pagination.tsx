interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;

  const numbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Сторінки"
      style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}
    >
      <button
        type="button"
        className="btn btn-outline btn-small"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ← Назад
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className={`btn btn-small ${n === page ? '' : 'btn-outline'}`}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-outline btn-small"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
      >
        Далі →
      </button>
    </nav>
  );
}
