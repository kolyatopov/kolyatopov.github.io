<?php
declare(strict_types=1);

$formMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        require_once __DIR__ . '/script.php';

        $title = trim((string) ($_POST['title'] ?? ''));
        $artist = trim((string) ($_POST['artist'] ?? ''));
        $country = trim((string) ($_POST['country'] ?? ''));
        $genre = trim((string) ($_POST['genre'] ?? ''));
        $year = (int) ($_POST['year'] ?? 0);
        $status = (string) ($_POST['status'] ?? 'planned');
        $rating = (float) ($_POST['rating'] ?? 0);
        $review = trim((string) ($_POST['review'] ?? ''));
        $coverUrl = null;

        if (
            $title === '' || $artist === '' || $country === '' || $genre === '' || $review === ''
            || $year < 1900 || $year > 2100
            || $rating < 1 || $rating > 10
            || !in_array($status, ['planned', 'listening', 'completed'], true)
        ) {
            $formMessage = 'Проверь поля: год 1900–2100, оценка 1–10, текстовые поля не пустые.';
        } else {
            if (!empty($_FILES['coverFile']['tmp_name']) && is_uploaded_file($_FILES['coverFile']['tmp_name'])) {
                $mime = mime_content_type($_FILES['coverFile']['tmp_name']) ?: '';
                if (strpos($mime, 'image/') !== 0) {
                    $formMessage = 'Файл обложки должен быть изображением.';
                } else {
                    $bin = file_get_contents($_FILES['coverFile']['tmp_name']);
                    if ($bin === false) {
                        $formMessage = 'Не получилось прочитать файл обложки.';
                    } else {
                        $coverUrl = 'data:' . $mime . ';base64,' . base64_encode($bin);
                    }
                }
            }

            if ($formMessage === '') {
                insert_album([
                    'title' => $title,
                    'artist' => $artist,
                    'country' => $country,
                    'genre' => $genre,
                    'year' => $year,
                    'status' => $status,
                    'rating' => $rating,
                    'review' => $review,
                    'cover_url' => $coverUrl,
                ]);
                header('Location: list.php', true, 303);
                exit;
            }
        }
    } catch (Throwable $e) {
        $formMessage = 'Ошибка БД: проверь config.php и импорт schema.sql.';
    }
}
?>
<!doctype html>
<html lang="ru" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Новый альбом — audiox</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" href="./styles.css" />
    <link rel="icon" href="./logo.png" type="image/png" />
  </head>
  <body class="d-flex flex-column min-vh-100" data-page="form">
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
                <a class="nav-link active" href="./form.php" aria-current="page">Новый альбом</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./list.php">Коллекция</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./feedback.php">Обратная связь</a>
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
      <div class="card border-secondary bg-dark shadow-lg">
        <div class="card-body p-4">
          <h1 class="h3 panel__title">Новый альбом</h1>
          <p class="small text-white-50">Данные сохраняются в MySQL (ЛР4).</p>

          <form
            class="music-form row g-3 mt-2"
            id="album-form"
            data-php-handled="1"
            method="post"
            action="form.php"
            enctype="multipart/form-data"
          >
            <div class="col-md-6">
              <label class="form-label" for="album-title">Название альбома</label>
              <input
                class="form-control bg-dark text-white border-secondary"
                id="album-title"
                name="title"
                type="text"
                placeholder="Например: Discovery"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label" for="album-artist">Исполнитель</label>
              <input
                class="form-control bg-dark text-white border-secondary"
                id="album-artist"
                name="artist"
                type="text"
                placeholder="Например: Daft Punk"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label" for="album-year">Год</label>
              <input
                class="form-control bg-dark text-white border-secondary"
                id="album-year"
                name="year"
                type="number"
                min="1900"
                max="2100"
                placeholder="2001"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label" for="album-country">Страна</label>
              <select class="form-select bg-dark text-white border-secondary" id="album-country" name="country" required>
                <option>Франция</option>
                <option>США</option>
                <option>Великобритания</option>
                <option>Япония</option>
                <option>Другое</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label" for="album-genre">Жанр</label>
              <select class="form-select bg-dark text-white border-secondary" id="album-genre" name="genre" required>
                <option>Electronic</option>
                <option>Rock</option>
                <option>Hip-Hop</option>
                <option>World</option>
                <option>Pop</option>
                <option>Jazz</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label" for="album-status">Статус</label>
              <select class="form-select bg-dark text-white border-secondary" id="album-status" name="status" required>
                <option value="planned">В планах</option>
                <option value="listening">Слушаю</option>
                <option value="completed">Прослушан</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label" for="album-rating">Оценка (1–10)</label>
              <input
                class="form-control bg-dark text-white border-secondary"
                id="album-rating"
                name="rating"
                type="number"
                min="1"
                max="10"
                step="0.1"
                placeholder="9.3"
                required
              />
            </div>

            <div class="col-12">
              <label class="form-label" for="album-cover">Обложка (файл)</label>
              <input
                class="form-control bg-dark text-white border-secondary"
                id="album-cover"
                name="coverFile"
                type="file"
                accept="image/*"
              />
            </div>

            <div class="col-12">
              <label class="form-label" for="album-review">Рецензия</label>
              <textarea
                class="form-control bg-dark text-white border-secondary"
                id="album-review"
                name="review"
                rows="5"
                placeholder="Что понравилось, любимые треки, общее впечатление"
                required
              ></textarea>
            </div>

            <div class="col-12 actions">
              <button class="btn btn-primary" type="submit">Сохранить</button>
              <button class="btn btn-outline-secondary" type="reset">Очистить</button>
            </div>
          </form>
          <?php if ($formMessage !== '') : ?>
            <p class="panel__text mt-3 mb-0 text-warning" id="form-message" role="alert"><?= htmlspecialchars($formMessage, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></p>
          <?php endif; ?>
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
