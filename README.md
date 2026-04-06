# audiox

Фронт (HTML/CSS/JS) + **ЛР4: PHP + MySQL** (OpenServer / любой хостинг с PHP).

## Страницы (статика + демо localStorage)
- `index.html` — главная
- `form.html` — форма альбома (только в браузере, `localStorage`)
- `list.html` / `detail.html` — старый вариант списка/деталей через JS

## ЛР4 — PHP и база
1. Установи **OpenServer** (Apache + PHP + MySQL).
2. Скопируй проект в папку домена (например `domains/audiox.local`).
3. Создай БД и таблицы: импорт **`schema.sql`** (phpMyAdmin или консоль MySQL).
4. Скопируй **`config.example.php` → `config.php`**, при необходимости поправь логин/пароль MySQL.
5. Открой в браузере:
   - **`list.php`** — список из БД, строки через `foreach` + подключение **`script.php`**
   - **`form.php`** — сохранение альбома в таблицу **`albums`**
   - **`feedback.php`** — форма обратной связи → таблица **`feedback`**
   - **`detail.php?id=…`** — карточка альбома из БД

### Файлы ЛР4
| Файл | Назначение |
|------|------------|
| `schema.sql` | Создание БД `audiox`, таблицы `albums`, `feedback`, тестовые альбомы |
| `config.example.php` | Шаблон настроек подключения (копия → `config.php`) |
| `script.php` | Подключение к MySQL (PDO), функции выборки/вставки |
| `list.php` | Список из БД |
| `form.php` | Форма → INSERT в `albums` |
| `feedback.php` | Форма → INSERT в `feedback` |

> **GitHub Pages** PHP не выполняет — для сдачи ЛР4 показывай сайт на **OpenServer** или хостинге с PHP/MySQL.

## Технологии
- Bootstrap 5 (CDN)
- Свои стили: `styles.css`
- Клиент: `main.js` (`localStorage` на статических страницах; на `list.php` таблица не перезаписывается)
