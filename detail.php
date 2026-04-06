<?php
declare(strict_types=1);

function audiox_detail_h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$album = null;
$dbError = null;

try {
    require_once __DIR__ . '/script.php';
    if ($id > 0) {
        $album = get_album_by_id($id);
    }
} catch (Throwable $e) {
    $dbError = 'База недоступна: проверь config.php и schema.sql.';
}

$titleText = $album ? (string) $album['title'] : 'Нет записи';
$metaHtml = '';
if ($album) {
    $metaHtml =
        'Исполнитель: <strong>' .
        audiox_detail_h((string) $album['artist']) .
        '</strong> • Страна: <strong>' .
        audiox_detail_h((string) $album['country']) .
        '</strong>';
}
$genre = $album ? audiox_detail_h((string) $album['genre']) : '—';
$year = $album ? (string) (int) $album['year'] : '—';
$status = $album ? audiox_detail_h(audiox_human_status((string) $album['status'])) : '—';
$rating = $album ? audiox_detail_h('Оценка ' . number_format((float) $album['rating'], 1, '.', '')) : '—';
$review = $album ? audiox_detail_h((string) $album['review']) : '';
$coverUrl = $album && !empty($album['cover_url']) ? (string) $album['cover_url'] : '';
$dataAlbum = $album ? audiox_detail_h((string) $album['artist'] . ' — ' . (string) $album['title']) : '';
?>
<!doctype html>
<html lang="ru" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Детали — audiox</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" href="./styles.css" />
    <link rel="icon" href="./logo.png" type="image/png" />
  </head>
  <body class="d-flex flex-column min-vh-100" data-page="detail" data-php-rendered-detail="1">
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
                <a class="nav-link" href="./register.html">Регистрация</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main id="content" class="container flex-grow-1 py-4">
      <?php if ($dbError !== null) : ?>
        <div class="alert alert-danger"><?= htmlspecialchars($dbError, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></div>
      <?php endif; ?>
      <div class="card border-secondary bg-dark shadow-lg">
        <div class="card-body p-4">
          <div class="row g-4 align-items-start">
            <div class="col-md-4">
              <div class="detail__cover cover" data-album="<?= $dataAlbum ?>" id="detail-cover">
                <?php if ($coverUrl !== '') : ?>
                  <img
                    src="<?= audiox_detail_h($coverUrl) ?>"
                    alt="Обложка альбома"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    id="detail-cover-img"
                  />
                <?php else : ?>
                  <img src="" alt="" id="detail-cover-img" />
                <?php endif; ?>
              </div>
            </div>
            <div class="col-md-8">
              <h1 class="panel__title h3" id="detail-title"><?= audiox_detail_h($titleText) ?></h1>
              <p class="panel__text" id="detail-meta"><?= $metaHtml ?></p>

              <div class="chips" id="detail-chips">
                <span class="audiox-badge" id="detail-genre"><?= $genre ?></span>
                <span class="audiox-badge" id="detail-year"><?= $year ?></span>
                <span class="audiox-badge" id="detail-status"><?= $status ?></span>
                <span class="audiox-badge" id="detail-rating"><?= $rating ?></span>
              </div>

              <p class="tile__text" id="detail-review"><?= $review ?></p>
              <a class="btn btn-primary" href="./list.php">К коллекции</a>
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
