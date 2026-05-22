<?php
declare(strict_types=1);

$message = '';
$ok = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        require_once __DIR__ . '/script.php';

        $username = trim((string) ($_POST['username'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $passwordConfirm = (string) ($_POST['passwordConfirm'] ?? '');

        if (($err = audiox_validate_register_username($username)) !== null) {
            $message = $err;
        } elseif (($err = audiox_validate_register_email($email)) !== null) {
            $message = $err;
        } elseif (($err = audiox_validate_phone($phone)) !== null) {
            $message = $err;
        } elseif (($err = audiox_validate_register_password($password)) !== null) {
            $message = $err;
        } elseif ($password !== $passwordConfirm) {
            $message = 'Пароли не совпадают.';
        } else {
            $conflict = audiox_register_conflict($username, $email);
            if ($conflict === 'username') {
                $message = 'Такой логин уже занят.';
            } elseif ($conflict === 'email') {
                $message = 'Такой email уже зарегистрирован.';
            } else {
                insert_user($username, $email, $phone, $password);
                $ok = true;
                $message = 'Регистрация успешна. Данные сохранены в базе.';
            }
        }
    } catch (Throwable $e) {
        $message = 'Ошибка БД: проверь config.php. Если таблицы users нет — импортируй migrate-users.sql в phpMyAdmin (база audiox).';
        if (defined('AUDIOX_DEBUG') && AUDIOX_DEBUG) {
            $message .= ' ' . htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }
    }
}
?>
<!doctype html>
<html lang="ru" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Регистрация — audiox</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" href="./styles.css" />
    <link rel="icon" href="./logo.png" type="image/png" />
  </head>
  <body class="d-flex flex-column min-vh-100" data-page="register">
    <header class="audiox-top">
      <nav class="navbar navbar-expand-md navbar-dark audiox-navbar sticky-top">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center gap-2" href="./index.html" aria-label="audiox — на главную">
            <span class="brand__mark flex-shrink-0" aria-hidden="true"></span>
            <span class="brand__text text-start">
              <span class="brand__title d-block lh-sm">audio<span class="brand__accent">x</span></span>
              <span class="brand__subtitle small text-white-50">музыка и коллекция</span>
            </span>
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#audioxNav"
            aria-controls="audioxNav"
            aria-expanded="false"
            aria-label="Открыть меню"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="audioxNav">
            <ul class="navbar-nav ms-auto mb-2 mb-md-0 gap-md-1">
              <li class="nav-item">
                <a class="nav-link" href="./index.html">Главная</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./form.php">Новый альбом</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./list.php">Коллекция</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./feedback.php">Обратная связь</a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" href="./register.php" aria-current="page">Регистрация</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main id="content" class="container flex-grow-1 py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-7">
          <div class="card border-secondary bg-dark shadow-lg">
            <div class="card-body p-4 p-md-5">
              <h1 class="h3 panel__title">Регистрация</h1>

              <?php if ($message !== '') : ?>
                <div class="alert <?= $ok ? 'alert-success' : 'alert-warning' ?> mt-3" role="alert">
                  <?= htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>
                </div>
              <?php endif; ?>

              <form
                class="music-form row g-3 mt-2"
                id="register-form"
                data-php-handled="1"
                method="post"
                action="register.php"
                novalidate
                autocomplete="on"
              >
                <div class="col-md-6">
                  <label class="form-label" for="reg-username">Имя пользователя</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="reg-username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    minlength="3"
                    maxlength="32"
                    required
                    placeholder="music_fan"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label" for="reg-email">Email</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="reg-email"
                    name="email"
                    type="text"
                    autocomplete="email"
                    maxlength="255"
                    required
                    placeholder="example@mail.com"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label" for="reg-phone">Телефон</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="reg-phone"
                    name="phone"
                    type="text"
                    maxlength="32"
                    autocomplete="tel"
                    inputmode="tel"
                    placeholder="+7 (999) 123-45-67"
                    pattern="[0-9+(). \-]+"
                    title="Только цифры, +, скобки, пробел и дефис"
                    required
                  />
                  <div class="form-text text-white-50 small">10–11 цифр; без букв и лишних символов.</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label" for="reg-password">Пароль</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="reg-password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    maxlength="128"
                    required
                    placeholder="Минимум 8 символов"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label" for="reg-password-confirm">Подтверждение</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="reg-password-confirm"
                    name="passwordConfirm"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    maxlength="128"
                    required
                    placeholder="Повтори пароль"
                  />
                </div>

                <div class="col-12 actions">
                  <button class="btn btn-primary" type="submit">Зарегистрироваться</button>
                  <button class="btn btn-outline-secondary" type="reset">Очистить</button>
                </div>
              </form>
              <p class="register-message mt-3 mb-0" id="register-message" aria-live="polite"></p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <div class="muted">© audiox</div>
      </div>
    </footer>
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
      crossorigin="anonymous"
    ></script>
    <script src="./main.js" defer></script>
  </body>
</html>
