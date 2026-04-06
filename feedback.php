<?php
declare(strict_types=1);

$message = '';
$ok = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        require_once __DIR__ . '/script.php';
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = trim((string) ($_POST['email'] ?? ''));
        $text = trim((string) ($_POST['message'] ?? ''));

        if ($name === '' || strlen($name) > 120) {
            $message = 'Укажи имя (до 120 символов).';
        } elseif ($email === '' || strlen($email) > 255) {
            $message = 'Укажи email.';
        } elseif ($text === '') {
            $message = 'Напиши сообщение.';
        } else {
            insert_feedback($name, $email, $text);
            $ok = true;
            $message = 'Сообщение сохранено. Спасибо!';
        }
    } catch (Throwable $e) {
        $message = 'Ошибка БД: проверь config.php и таблицу feedback в schema.sql.';
    }
}
?>
<!doctype html>
<html lang="ru" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Обратная связь — audiox</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" href="./styles.css" />
    <link rel="icon" href="./logo.png" type="image/png" />
  </head>
  <body class="d-flex flex-column min-vh-100">
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
                <a class="nav-link active" href="./feedback.php" aria-current="page">Обратная связь</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./register.html">Регистрация</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main id="content" class="container flex-grow-1 py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-secondary bg-dark shadow-lg">
            <div class="card-body p-4">
              <h1 class="h3 panel__title">Обратная связь</h1>
              <p class="small text-white-50">Данные пишутся в таблицу <code>feedback</code> (ЛР4).</p>

              <?php if ($message !== '') : ?>
                <div class="alert <?= $ok ? 'alert-success' : 'alert-warning' ?> mt-3" role="alert">
                  <?= htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>
                </div>
              <?php endif; ?>

              <form class="row g-3 mt-2" method="post" action="feedback.php">
                <div class="col-12">
                  <label class="form-label" for="fb-name">Имя</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="fb-name"
                    name="name"
                    type="text"
                    maxlength="120"
                    required
                  />
                </div>
                <div class="col-12">
                  <label class="form-label" for="fb-email">Email</label>
                  <input
                    class="form-control bg-dark text-white border-secondary"
                    id="fb-email"
                    name="email"
                    type="email"
                    maxlength="255"
                    required
                  />
                </div>
                <div class="col-12">
                  <label class="form-label" for="fb-message">Сообщение</label>
                  <textarea
                    class="form-control bg-dark text-white border-secondary"
                    id="fb-message"
                    name="message"
                    rows="5"
                    required
                  ></textarea>
                </div>
                <div class="col-12">
                  <button class="btn btn-primary" type="submit">Отправить</button>
                </div>
              </form>
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
  </body>
</html>
