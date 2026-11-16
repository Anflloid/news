import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} - Новини` : 'Новини - новинний портал';
  }, [title]);
}
