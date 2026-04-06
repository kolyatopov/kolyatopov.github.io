<?php
declare(strict_types=1);

$dbError = null;
$albums = [];

try {
    require_once __DIR__ . '/script.php';
    $albums = get_albums_for_list();
} catch (Throwable $e) {
    $dbError = 'База недоступна: создай config.php, импортируй schema.sql, запусти MySQL (OpenServer).';
}

$n = count($albums);
$completed = 0;
$listening = 0;
$sumRating = 0.0;
foreach ($albums as $a) {
    if (($a['status'] ?? '') === 'completed') {
        $completed++;
    }
    if (($a['status'] ?? '') === 'listening') {
        $listening++;
    }
    $sumRating += (float) ($a['rating'] ?? 0);
}
$avgRating = $n > 0 ? $sumRating / $n : 0.0;
?>
<!doctype html>
<html lang="ru" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Коллекция — audiox</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="stylesheet" href="./styles.css" />
    <link rel="icon" href="./logo.png" type="image/png" />
  </head>
  <!-- data-server-rendered-albums: main.js не перезаписывает таблицу из localStorage -->
  <body class="d-flex flex-column min-vh-100" data-page="list" data-server-rendered-albums="1">
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
                <a class="nav-link active" href="./list.php" aria-current="page">Коллекция</a>
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
      <section class="card border-secondary bg-dark shadow-lg">
        <div class="card-body p-4">
          <h1 class="panel__title h3">Коллекция</h1>

          <?php if ($dbError !== null) : ?>
            <div class="alert alert-danger mt-3" role="alert"><?= htmlspecialchars($dbError, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></div>
          <?php endif; ?>

          <div class="row row-cols-2 row-cols-lg-4 g-3 stats my-3">
            <div class="col">
              <div class="card stat-card h-100 border-secondary">
                <div class="card-body py-3">
                  <span class="stat__label">Всего</span>
                  <span class="stat__value d-block"><?= (int) $n ?></span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card stat-card h-100 border-secondary">
                <div class="card-body py-3">
                  <span class="stat__label">Прослушано</span>
                  <span class="stat__value d-block"><?= (int) $completed ?></span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card stat-card h-100 border-secondary">
                <div class="card-body py-3">
                  <span class="stat__label">Слушаю</span>
                  <span class="stat__value d-block"><?= (int) $listening ?></span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card stat-card h-100 border-secondary">
                <div class="card-body py-3">
                  <span class="stat__label">Средняя оценка</span>
                  <span class="stat__value d-block"><?= number_format($avgRating, 1, '.', '') ?></span>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive rounded border border-secondary">
            <table class="table table-dark table-hover table-striped music-table mb-0 align-middle">
              <thead>
                <tr>
                  <th scope="col">Альбом</th>
                  <th scope="col">Жанр</th>
                  <th scope="col">Год</th>
                  <th scope="col">Статус</th>
                  <th scope="col">Рейтинг</th>
                </tr>
              </thead>
              <tbody id="albums-table-body">
                <?php foreach ($albums as $album) : ?>
                  <?php
                  $id = (int) $album['id'];
                  $title = (string) $album['title'];
                  $artist = (string) $album['artist'];
                  $genre = (string) $album['genre'];
                  $year = (int) $album['year'];
                  $statusLabel = audiox_human_status((string) $album['status']);
                  $rating = number_format((float) $album['rating'], 1, '.', '');
                  $coverUrl = (string) ($album['cover_url'] ?? '');
                  ?>
                  <tr class="album-row">
                    <td>
                      <a class="album-cell text-decoration-none text-reset d-flex align-items-center" href="./detail.php?id=<?= $id ?>">
                        <span class="album-thumb">
                          <?php if ($coverUrl !== '') : ?>
                            <img
                              class="album-thumb__img"
                              src="<?= audiox_h($coverUrl) ?>"
                              alt="Обложка <?= audiox_h($title) ?>"
                              loading="lazy"
                              referrerpolicy="no-referrer"
                            />
                          <?php else : ?>
                            <div class="album-thumb__fallback" aria-hidden="true"><?= audiox_h(strtoupper(substr($title, 0, 1))) ?></div>
                          <?php endif; ?>
                        </span>
                        <span class="album-meta">
                          <span class="album-title"><?= audiox_h($title) ?></span>
                          <span class="album-artist"><?= audiox_h($artist) ?></span>
                        </span>
                      </a>
                    </td>
                    <td><?= audiox_h($genre) ?></td>
                    <td><?= $year ?></td>
                    <td><span class="status-pill"><?= audiox_h($statusLabel) ?></span></td>
                    <td><span class="rating-pill"><?= audiox_h($rating) ?></span></td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
          <?php if ($n === 0 && $dbError === null) : ?>
            <p class="panel__text mt-3 mb-0">Записей пока нет.</p>
          <?php endif; ?>
        </div>
      </section>
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
