<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/script.php';

/** Корректная UTF-8 строка для JSON (на случай битой кодировки в старых записях). */
function audiox_json_str(string $value): string
{
    if ($value === '') {
        return $value;
    }
    if (mb_check_encoding($value, 'UTF-8')) {
        return $value;
    }

    $fixed = mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
    return is_string($fixed) ? $fixed : $value;
}

/** Для главной: не отдавать гигантские data:URL в JSON (ломает fetch и анимацию). */
function audiox_json_cover_for_home(string $url, bool $lite): array
{
    $url = trim($url);
    if ($url === '') {
        return ['cover_url' => '', 'has_cover' => false];
    }
    if (!$lite) {
        return ['cover_url' => $url, 'has_cover' => true];
    }
    if (preg_match('#^https?://#i', $url) && strlen($url) < 4096) {
        return ['cover_url' => $url, 'has_cover' => true];
    }
    if (str_starts_with(strtolower($url), 'data:') || strlen($url) > 4096) {
        return ['cover_url' => '', 'has_cover' => true];
    }

    return ['cover_url' => $url, 'has_cover' => true];
}

try {
    $lite = isset($_GET['lite']) && (string) $_GET['lite'] === '1';
    $rows = get_albums_for_list();
    $out = [];
    foreach ($rows as $row) {
        $coverRaw = (string) ($row['cover_url'] ?? '');
        $cover = audiox_json_cover_for_home($coverRaw, $lite);
        $out[] = [
            'id' => (int) ($row['id'] ?? 0),
            'title' => audiox_json_str((string) ($row['title'] ?? '')),
            'artist' => audiox_json_str((string) ($row['artist'] ?? '')),
            'genre' => audiox_json_str((string) ($row['genre'] ?? '')),
            'year' => (int) ($row['year'] ?? 0),
            'rating' => (float) ($row['rating'] ?? 0),
            'review' => audiox_json_str((string) ($row['review'] ?? '')),
            'cover_url' => $cover['cover_url'],
            'has_cover' => $cover['has_cover'],
        ];
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'database'], JSON_UNESCAPED_UNICODE);
}
