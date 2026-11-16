# Новинний портал

Курсова робота з дисципліни «Веб-дизайн та веб-програмування».
Виконав студент групи 3ПР, Киселевич Андрій Юрійович
Тема: **«Створення новинного порталу з категоріями, коментарями та рейтинговою системою»**.

## Можливості

- Стрічка новин з пагінацією, сортуванням (нові / популярні / з найвищим рейтингом) і пошуком
- Категорії новин (фільтр зберігається в адресі сторінки)
- Сторінка статті з лічильником переглядів і часом читання
- Реєстрація та вхід (JWT-токени, паролі зберігаються у вигляді bcrypt-хешу)
- Коментарі з автооновленням кожні 15 секунд; видалити можна свій коментар (адмін - будь-який)
- Рейтинг статей від 1 до 5 зірок (один користувач - одна оцінка)
- Адмін-панель: статистика, створення, редагування та видалення статей
- Світла / темна тема, адаптивний дизайн (телефон, планшет, комп'ютер)
- PWA: Service Worker кешує сайт, прочитані новини доступні без інтернету

## Технології

| Частина | Технології |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router 6, Context API, CSS Modules |
| Backend | Node.js, Express 4, JSON Web Token, bcryptjs |
| Тестування | Jest, React Testing Library, Supertest, Playwright |
| Якість коду | ESLint (Airbnb), Prettier, Husky + lint-staged, GitHub Actions |

## Запуск

Потрібен **Node.js 20** або новіший.

```bash
# 1. Встановити залежності (корінь, сервер і клієнт)
npm run install:all

# 2. Запустити сервер (порт 4000) і клієнт (порт 5173) одночасно
npm run dev
```

Відкрийте http://localhost:5173

Тестові акаунти:

| Роль | Email | Пароль |
|---|---|---|
| Адміністратор | admin@news.ua | admin123 |
| Користувач | olena@news.ua | user123 |
| Користувач | andrii@news.ua | user123 |

Скинути базу до початкових даних: `npm run seed --prefix server`.

## Тести

```bash
npm test --prefix server              # тести API (Jest + Supertest)
npm test --prefix client              # тести компонентів (Jest + React Testing Library)
npm run test:coverage --prefix client # звіт про покриття коду (client/coverage/index.html)
npx playwright install chromium       # один раз - завантажити браузер для e2e
npm run test:e2e --prefix client      # end-to-end тести (Playwright)
```

## Production

```bash
npm run build   # збірка фронтенду в client/dist
npm start       # Express віддає і API, і зібраний фронтенд на порту 4000
```

Змінні оточення сервера: `PORT` (за замовчуванням 4000), `JWT_SECRET` (обов'язково змініть у production).

## Структура проєкту

```
news-portal/
├── client/                 # React-застосунок
│   ├── public/             # іконка, manifest, Service Worker
│   ├── src/
│   │   ├── api/            # усі запити до сервера
│   │   ├── components/     # повторно використовувані компоненти
│   │   ├── context/        # глобальний стан (авторизація, тема)
│   │   ├── hooks/          # власні хуки (useFetch, useDebounce...)
│   │   ├── pages/          # сторінки
│   │   ├── utils/          # допоміжні функції
│   │   └── __tests__/      # тести компонентів
│   └── e2e/                # Playwright-тести
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # маршрути API
│   │   ├── middleware/     # перевірка JWT і ролі
│   │   ├── db.js           # робота з JSON-базою
│   │   └── seed.js         # тестові дані
│   ├── public/images/      # обкладинки статей
│   └── tests/              # тести API
└── docs/                   # документація
```

Детальніше: [API](docs/API.md) · [Інструкція користувача](docs/USER_MANUAL.md) · [Посібник розробника](docs/DEVELOPER_GUIDE.md)
