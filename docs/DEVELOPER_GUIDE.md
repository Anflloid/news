# Посібник розробника

## Як влаштований проєкт
- **client** - SPA на React. Сторінки в `src/pages`, спільні компоненти в `src/components`.
- **server** - Express API. Кожна група маршрутів в окремому файлі `src/routes/*.js`.
- Фронтенд звертається до сервера лише через функції з `client/src/api/api.ts`.
- Глобальний стан: `AuthContext` (користувач і токен) та `ThemeContext` (тема).
- Завантаження даних - власний хук `useFetch`, який повертає `{ data, loading, error, reload }`.

## Як додати нову сторінку
1. Створіть компонент у `client/src/pages/NewPage.tsx`.
2. Додайте маршрут у `client/src/App.tsx` через `lazy(() => import('./pages/NewPage'))`.
3. Якщо сторінка тільки для адміністратора - оберніть її в `<ProtectedRoute>`.

## Як додати новий маршрут API
1. Додайте обробник у відповідний файл `server/src/routes/`.
2. Для захисту використовуйте `requireAuth` (потрібен вхід) і `requireAdmin` (тільки адмін).
3. Після зміни даних викликайте `save()`.
4. Додайте функцію-обгортку в `client/src/api/api.ts` і тест у `server/tests/api.test.js`.

## Правила коду
- Стиль - Airbnb (ESLint), форматування - Prettier. Перед комітом Husky запускає lint-staged.
- Повідомлення комітів за Conventional Commits: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`.
- Робота в окремих гілках (`feature/comments`), злиття в `main` через Pull Request після проходження CI.

## Подальший розвиток
- Замінити JSON-файл на PostgreSQL (наприклад, через Prisma).
- Перейти з polling на WebSocket для миттєвих коментарів.
- Додати завантаження власних зображень і серверний рендеринг (Next.js) для кращого SEO.
- Додати refresh-токени та зберігання токена в httpOnly cookie.
