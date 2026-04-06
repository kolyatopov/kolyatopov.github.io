<?php
/**
 * Скопируй в config.php и при необходимости поправь доступ к MySQL (OpenServer).
 * cp config.example.php config.php
 */
declare(strict_types=1);

define('AUDIOX_DB_HOST', '127.0.0.1');
define('AUDIOX_DB_NAME', 'audiox');
define('AUDIOX_DB_USER', 'root');
define('AUDIOX_DB_PASS', '');
define('AUDIOX_DB_CHARSET', 'utf8mb4');
