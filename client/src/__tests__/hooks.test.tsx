import { act, renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('повертає нове значення лише після затримки', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'с' },
    });
    expect(result.current).toBe('с');

    rerender({ value: 'спорт' });
    expect(result.current).toBe('с');

    act(() => {
      jest.advanceTimersByTime(399);
    });
    expect(result.current).toBe('с');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('спорт');
  });
});

describe('useFetch', () => {
  test('спочатку показує завантаження, потім повертає дані', async () => {
    const fetcher = jest.fn().mockResolvedValue([1, 2, 3]);
    const { result } = renderHook(() => useFetch(fetcher, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.error).toBeNull();
  });

  test('повертає текст помилки, якщо запит не вдався', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('Сервер недоступний'));
    const { result } = renderHook(() => useFetch(fetcher, []));

    await waitFor(() => expect(result.current.error).toBe('Сервер недоступний'));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('reload виконує запит повторно', async () => {
    const fetcher = jest.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useFetch(fetcher, []));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test('при зміні залежностей завантажує нові дані', async () => {
    const fetcher = jest.fn((id: number) => Promise.resolve(`стаття ${id}`));
    const { result, rerender } = renderHook(({ id }) => useFetch(() => fetcher(id), [id]), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.data).toBe('стаття 1'));

    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe('стаття 2'));
  });
});

describe('useDocumentTitle', () => {
  test('змінює заголовок вкладки браузера', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Спорт' },
    });
    expect(document.title).toBe('Спорт - Новини');

    rerender({ title: '' });
    expect(document.title).toBe('Новини - новинний портал');
  });
});
