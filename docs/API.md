# Документація REST API

Базова адреса: `http://localhost:4000/api`. Формат даних - JSON.
Для захищених маршрутів потрібен заголовок `Authorization: Bearer <token>`.

| Метод | Адреса | Доступ | Опис |
|---|---|---|---|
| POST | /auth/register | усі | Реєстрація. Тіло: `{ name, email, password }` → `{ token, user }` |
| POST | /auth/login | усі | Вхід. Тіло: `{ email, password }` → `{ token, user }` |
| GET | /auth/me | користувач | Дані поточного користувача |
| GET | /categories | усі | Список категорій з кількістю статей |
| POST | /categories | адмін | Створити категорію `{ name, slug, color }` |
| DELETE | /categories/:id | адмін | Видалити порожню категорію |
| GET | /articles | усі | Список статей. Параметри: `category`, `search`, `sort` (new / popular / rating), `page`, `limit` → `{ items, total, page, pages }` |
| GET | /articles/:id | усі | Стаття (+1 перегляд). Для користувача додається `myRating` |
| POST | /articles | адмін | Створити статтю `{ title, summary, content, categoryId }` |
| PUT | /articles/:id | адмін | Редагувати статтю |
| DELETE | /articles/:id | адмін | Видалити статтю разом з коментарями та оцінками |
| GET | /articles/:id/comments | усі | Коментарі статті (нові зверху) |
| POST | /articles/:id/comments | користувач | Додати коментар `{ text }` (2-1000 символів) |
| DELETE | /comments/:id | автор / адмін | Видалити коментар |
| POST | /articles/:id/rating | користувач | Оцінка `{ value: 1..5 }` → `{ average, count, myRating }` |
| GET | /health | усі | Перевірка роботи сервера |

## Коди відповідей

| Код | Значення |
|---|---|
| 200 / 201 / 204 | Успіх / створено / успіх без тіла |
| 400 | Помилка валідації (текст у полі `message`) |
| 401 | Немає токена або токен недійсний |
| 403 | Недостатньо прав |
| 404 | Не знайдено |
| 409 | Конфлікт (email вже зайнятий) |
| 500 | Помилка сервера |

## Приклад

```http
POST /api/articles/3/rating
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{ "value": 5 }
```

```json
{ "average": 4.5, "count": 2, "myRating": 5 }
```
