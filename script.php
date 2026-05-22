<?php
/**
 * ЛР4: подключение к БД и выгрузка / запись данных.
 * Подключается из list.php, form.php, detail.php, feedback.php, register.php.
 */
declare(strict_types=1);

if (!is_readable(__DIR__ . '/config.php')) {
    throw new RuntimeException(
        'Создай файл config.php из config.example.php и задай доступ к MySQL.'
    );
}

require_once __DIR__ . '/config.php';

/** Экранирование вывода в HTML */
function audiox_h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Подпись статуса альбома для таблицы */
function audiox_human_status(string $value): string
{
    switch ($value) {
        case 'planned':
            return 'В планах';
        case 'listening':
            return 'Слушаю';
        case 'completed':
            return 'Прослушан';
        default:
            return '—';
    }
}

/** Подключение PDO (один раз на запрос) */
function audiox_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    if (defined('AUDIOX_DB_SOCKET') && AUDIOX_DB_SOCKET !== '') {
        $dsn = sprintf(
            'mysql:unix_socket=%s;dbname=%s;charset=%s',
            AUDIOX_DB_SOCKET,
            AUDIOX_DB_NAME,
            AUDIOX_DB_CHARSET
        );
    } else {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            AUDIOX_DB_HOST,
            AUDIOX_DB_NAME,
            AUDIOX_DB_CHARSET
        );
        if (defined('AUDIOX_DB_PORT') && (int) AUDIOX_DB_PORT > 0) {
            $dsn .= ';port=' . (int) AUDIOX_DB_PORT;
        }
    }

    $pdo = new PDO($dsn, AUDIOX_DB_USER, AUDIOX_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');

    return $pdo;
}

/** Список альбомов для страницы коллекции (для foreach в list.php) */
function get_albums_for_list(): array
{
    $sql = 'SELECT id, title, artist, country, genre, year, status, rating, review, cover_url
            FROM albums ORDER BY id DESC';
    return audiox_pdo()->query($sql)->fetchAll();
}

/** Одна запись для detail.php */
function get_album_by_id(int $id): ?array
{
    $stmt = audiox_pdo()->prepare(
        'SELECT id, title, artist, country, genre, year, status, rating, review, cover_url
         FROM albums WHERE id = :id LIMIT 1'
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Вставка альбома из формы (POST).
 * @param array<string, mixed> $row
 */
function insert_album(array $row): int
{
    $sql = 'INSERT INTO albums (title, artist, country, genre, year, status, rating, review, cover_url)
            VALUES (:title, :artist, :country, :genre, :year, :status, :rating, :review, :cover_url)';
    $stmt = audiox_pdo()->prepare($sql);
    $stmt->execute([
        'title' => $row['title'],
        'artist' => $row['artist'],
        'country' => $row['country'],
        'genre' => $row['genre'],
        'year' => $row['year'],
        'status' => $row['status'],
        'rating' => $row['rating'],
        'review' => $row['review'],
        'cover_url' => $row['cover_url'] ?? null,
    ]);
    return (int) audiox_pdo()->lastInsertId();
}

function insert_feedback(string $name, string $email, string $phone, string $message): void
{
    $stmt = audiox_pdo()->prepare(
        'INSERT INTO feedback (name, email, phone, message) VALUES (:name, :email, :phone, :message)'
    );
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message,
    ]);
}

/** Телефон: цифры, +, скобки, пробел, дефис; 10–11 цифр. */
function audiox_validate_phone(string $raw): ?string
{
    $phone = trim($raw);
    if ($phone === '') {
        return 'Укажи номер телефона.';
    }
    if (strlen($phone) > 32) {
        return 'Номер слишком длинный.';
    }
    if (!preg_match('/^[0-9+\s().\-]+$/u', $phone)) {
        return 'В номере допустимы только цифры, +, скобки, пробел и дефис.';
    }
    preg_match_all('/\d/', $phone, $m);
    $digits = isset($m[0]) ? implode('', $m[0]) : '';
    $n = strlen($digits);
    if ($n < 10 || $n > 11) {
        return 'В номере должно быть от 10 до 11 цифр.';
    }

    return null;
}

/** Логин: латиница, цифры, подчёркивание, 3–32 символа. */
function audiox_validate_register_username(string $raw): ?string
{
    $name = trim($raw);
    if ($name === '') {
        return 'Укажи имя пользователя.';
    }
    if (strlen($name) < 3 || strlen($name) > 32) {
        return 'Логин: от 3 до 32 символов.';
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $name)) {
        return 'Логин: только латиница, цифры и подчёркивание.';
    }

    return null;
}

/** Email (базовая проверка, до 255 символов). */
function audiox_validate_register_email(string $raw): ?string
{
    $email = trim($raw);
    if ($email === '') {
        return 'Укажи email.';
    }
    if (strlen($email) > 255) {
        return 'Email слишком длинный.';
    }
    if (preg_match('/\s/u', $email)) {
        return 'Email не должен содержать пробелы.';
    }
    $at = strpos($email, '@');
    if ($at === false || $at === 0 || strrpos($email, '@') !== $at) {
        return 'Некорректный email.';
    }
    $domain = substr($email, $at + 1);
    if ($domain === '' || strpos($domain, '.') === false) {
        return 'Некорректный email.';
    }
    if ($domain[0] === '.' || substr($domain, -1) === '.' || strpos($domain, '..') !== false) {
        return 'Некорректный email.';
    }

    return null;
}

/** Пароль: 8–128 символов. */
function audiox_validate_register_password(string $raw): ?string
{
    $len = strlen($raw);
    if ($len < 8 || $len > 128) {
        return 'Пароль: от 8 до 128 символов.';
    }

    return null;
}

/** @return 'username'|'email'|null */
function audiox_register_conflict(string $username, string $email): ?string
{
    $stmt = audiox_pdo()->prepare(
        'SELECT username, email FROM users WHERE username = :username OR email = :email LIMIT 1'
    );
    $stmt->execute(['username' => $username, 'email' => $email]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }
    if (strcasecmp((string) $row['username'], $username) === 0) {
        return 'username';
    }

    return 'email';
}

function insert_user(string $username, string $email, string $phone, string $passwordPlain): int
{
    $hash = password_hash($passwordPlain, PASSWORD_DEFAULT);
    if ($hash === false) {
        throw new RuntimeException('Не удалось захешировать пароль.');
    }

    $stmt = audiox_pdo()->prepare(
        'INSERT INTO users (username, email, phone, password_hash)
         VALUES (:username, :email, :phone, :password_hash)'
    );
    $stmt->execute([
        'username' => $username,
        'email' => $email,
        'phone' => $phone,
        'password_hash' => $hash,
    ]);

    return (int) audiox_pdo()->lastInsertId();
}
