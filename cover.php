<?php
declare(strict_types=1);

require_once __DIR__ . '/script.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id || $id < 1) {
    http_response_code(400);
    exit;
}

$stmt = audiox_pdo()->prepare('SELECT cover_url FROM albums WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$url = trim((string) ($row['cover_url'] ?? ''));

if ($url === '') {
    http_response_code(404);
    exit;
}

if (preg_match('#^data:image/(png|jpe?g|webp|gif);base64,(.+)$#i', $url, $m)) {
    $raw = base64_decode($m[2], true);
    if ($raw === false) {
        http_response_code(500);
        exit;
    }
    $type = strtolower($m[1]);
    if ($type === 'jpg') {
        $type = 'jpeg';
    }
    header('Content-Type: image/' . $type);
    header('Cache-Control: public, max-age=86400');
    echo $raw;
    exit;
}

if (preg_match('#^https?://#i', $url)) {
    header('Location: ' . $url, true, 302);
    exit;
}

http_response_code(404);
