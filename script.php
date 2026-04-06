<?php
/**
 * ЛР4: подключение к БД и выгрузка / запись данных.
 * Подключается из list.php, form.php, detail.php, feedback.php.
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

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        AUDIOX_DB_HOST,
        AUDIOX_DB_NAME,
        AUDIOX_DB_CHARSET
    );

    $pdo = new PDO($dsn, AUDIOX_DB_USER, AUDIOX_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

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

function insert_feedback(string $name, string $email, string $message): void
{
    $stmt = audiox_pdo()->prepare(
        'INSERT INTO feedback (name, email, message) VALUES (:name, :email, :message)'
    );
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'message' => $message,
    ]);
}
