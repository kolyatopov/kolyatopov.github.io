<?php
/**
 * Скопируй в config.php и при необходимости поправь доступ к MySQL.
 * cp config.example.php config.php
 *
 * MAMP (macOS / Windows):
 *  - MySQL часто на порту 8889 (смотри в окне MAMP «MySQL Port»), не на 3306.
 *  - Логин/пароль по умолчанию часто root / root.
 *  - Альтернатива TCP: unix_socket (путь к .sock смотри в MAMP → настройки MySQL).
 */
declare(strict_types=1);

define('AUDIOX_DB_HOST', '127.0.0.1');
/** 0 = порт по умолчанию клиента (3306). Для MAMP обычно нужно 8889 */
define('AUDIOX_DB_PORT', 0);
/** Пустая строка = не использовать. Пример MAMP: '/Applications/MAMP/tmp/mysql/mysql.sock' */
define('AUDIOX_DB_SOCKET', '');
define('AUDIOX_DB_NAME', 'audiox');
define('AUDIOX_DB_USER', 'root');
/** MAMP: чаще всего 'root'; OpenServer: часто '' */
define('AUDIOX_DB_PASS', '');
define('AUDIOX_DB_CHARSET', 'utf8mb4');

/** true — на form.php в сообщении об ошибке покажется текст исключения (только для отладки) */
define('AUDIOX_DEBUG', false);
