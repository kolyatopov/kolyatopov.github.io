/**
 * audiox — клиентская логика без бэкенда.
 * Данные альбомов: localStorage (ключ STORAGE_KEY). Стили и цвета — в styles.css (:root).
 */

/** Вкладки на главной (ARIA tabs): синхронизация .is-active и aria-selected. */
function setActiveTab(tabId) {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  for (const tab of tabs) {
    const isActive = tab.id === tabId;
    tab.classList.toggle("is-active", isActive);
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
    tab.tabIndex = isActive ? 0 : -1;
  }

  for (const panel of panels) {
    const isActive = panel.getAttribute("aria-labelledby") === tabId;
    panel.classList.toggle("is-active", isActive);
  }
}

/** Подписки на клики и стрелки для role="tablist". */
function initTabs() {
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) return;

  for (const tab of tabs) {
    tab.addEventListener("click", () => setActiveTab(tab.id));
    tab.addEventListener("keydown", (e) => {
      const idx = tabs.findIndex((t) => t.id === tab.id);
      if (idx < 0) return;

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = (idx + dir + tabs.length) % tabs.length;
        const nextTab = tabs[next];
        nextTab.focus();
        setActiveTab(nextTab.id);
      }
    });
  }
}

/** Ключ в localStorage для массива альбомов. Очистка хранилища = сброс к seedAlbums при следующем заходе. */
const STORAGE_KEY = "audiox_albums_v1";

/** Стартовые записи, если в хранилище ещё ничего нет. */
const seedAlbums = [
  {
    id: "am-2013",
    title: "AM",
    artist: "Arctic Monkeys",
    country: "Великобритания",
    genre: "Rock",
    year: 2013,
    status: "completed",
    rating: 9.1,
    review: "Плотный ночной вайб, сильные гитарные хуки и очень цельный звук.",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/0/04/Arctic_Monkeys_-_AM.png",
    createdAt: Date.now() - 4000
  },
  {
    id: "discovery-2001",
    title: "Discovery",
    artist: "Daft Punk",
    country: "Франция",
    genre: "Electronic",
    year: 2001,
    status: "completed",
    rating: 9.4,
    review: "Классика французской электроники, которую удобно слушать целиком.",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg",
    createdAt: Date.now() - 3000
  },
  {
    id: "damn-2017",
    title: "DAMN.",
    artist: "Kendrick Lamar",
    country: "США",
    genre: "Hip-Hop",
    year: 2017,
    status: "listening",
    rating: 9.2,
    review: "Сильная лирика, продакшн и баланс между хитовостью и глубиной.",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png",
    createdAt: Date.now() - 2000
  }
];

/** Читает альбомы из localStorage; при пустом хранилище записывает seed и возвращает его копию. */
function getAlbums() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAlbums));
    return [...seedAlbums];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function saveAlbums(albums) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

/** Подписи статуса для таблицы и карточек (значения полей status в данных). */
function humanStatus(value) {
  if (value === "planned") return "В планах";
  if (value === "listening") return "Слушаю";
  if (value === "completed") return "Прослушан";
  return "—";
}

/** Защита от XSS при вставке пользовательских строк в innerHTML шаблонов. */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Миниатюра в строке таблицы: img или буква-заглушка. */
function getCoverCellHtml(album) {
  if (album.coverUrl) {
    return `<img class="album-thumb__img" src="${escapeHtml(album.coverUrl)}" alt="Обложка ${escapeHtml(album.title)}" loading="lazy" referrerpolicy="no-referrer" />`;
  }
  return `<div class="album-thumb__fallback" aria-hidden="true">${escapeHtml((album.title || "?").slice(0, 1).toUpperCase())}</div>`;
}

/** Валидация регистрации (только клиент): логин, email, пароль. */
function validateRegisterUsername(value) {
  const name = String(value || "").trim();
  if (name.length < 3 || name.length > 32) return { ok: false };
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return { ok: false };
  return { ok: true };
}

function validateRegisterEmail(value) {
  const email = String(value || "").trim();
  if (!email) return { ok: false };

  const at = email.indexOf("@");
  if (at <= 0) return { ok: false };
  if (email.indexOf("@", at + 1) !== -1) return { ok: false };

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || !domain) return { ok: false };
  if (domain.includes(",")) return { ok: false };
  if (domain.startsWith(".")) return { ok: false };
  if (domain.endsWith(".")) return { ok: false };
  if (domain.includes("..")) return { ok: false };
  if (!domain.includes(".")) return { ok: false };
  // Сразу после @ домен должен начинаться с буквы (не ".", ",", цифра и т.д.).
  if (!/^[a-zA-Zа-яА-ЯёЁ]/.test(domain)) return { ok: false };

  const labels = domain.split(".");
  for (const label of labels) {
    if (!label.length) return { ok: false };
    if (!/^[a-zA-Zа-яА-ЯёЁ]/.test(label)) return { ok: false };
  }

  const afterLastDot = domain.slice(domain.lastIndexOf(".") + 1);
  if (afterLastDot.length < 2) return { ok: false };

  if (local.startsWith(".") || local.endsWith(".")) return { ok: false };
  if (local.includes("..")) return { ok: false };
  if (/\s/.test(email)) return { ok: false };

  return { ok: true };
}

function validateRegisterPassword(value) {
  const password = String(value || "");
  if (password.length < 8 || password.length > 128) return { ok: false };
  return { ok: true };
}

/** Телефон: цифры, +, скобки, пробел, дефис; 10–11 цифр. */
function validateRegisterPhone(value) {
  const phone = String(value || "").trim();
  if (!phone) return { ok: false };
  if (phone.length > 32) return { ok: false };
  if (!/^[0-9+(). \-]+$/u.test(phone)) return { ok: false };
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) return { ok: false };
  return { ok: true };
}

/** Починка «кракозябр», если UTF-8 когда-то прочитали как Latin-1. */
function repairUtf8Text(value) {
  const text = String(value ?? "");
  if (!text) return "";
  if (/[\u0400-\u04FF]/.test(text)) return text;
  try {
    const fixed = decodeURIComponent(escape(text));
    if (/[\u0400-\u04FF]/.test(fixed)) return fixed;
    return fixed;
  } catch (_err) {
    return text;
  }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Обновляет размытый фон .cover после смены src у img. */
function bindCoverBackground(img) {
  const cover = img.closest(".cover");
  if (!cover) return;

  const apply = () => {
    const src = img.currentSrc || img.src;
    if (src) {
      cover.style.setProperty("--cover-image", `url("${src}")`);
      cover.classList.add("cover--has-img");
    }
  };

  apply();
  img.addEventListener("load", apply, { once: false });
  img.addEventListener("error", () => {
    cover.style.removeProperty("--cover-image");
    cover.classList.remove("cover--has-img");
  });
}

/** URL обложки для главной: lite JSON + отдельный cover.php для больших data:URL. */
function resolveHomeCoverUrl(album) {
  const direct = String(album?.cover_url || "").trim();
  if (direct) return direct;
  if (album?.has_cover && album?.id) {
    return new URL(`cover.php?id=${Number(album.id)}`, window.location.href).href;
  }
  return "";
}

function preloadCoverImage(url, maxMs = 2000) {
  const src = String(url || "").trim();
  if (!src) return Promise.resolve(false);

  const loaded = new Promise((resolve) => {
    const probe = new Image();
    probe.referrerPolicy = "no-referrer";
    probe.decoding = "async";
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = src;
  });

  return Promise.race([loaded, sleep(maxMs).then(() => false)]);
}

function nextPaintFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/** Ждём, пока заставка снимет intro-pending и плитки станут видимы (иначе transition не играет). */
function whenHomeContentVisible() {
  return new Promise((resolve) => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-pending")) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!root.classList.contains("intro-pending")) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 2800);
  });
}

/** Обложка из файла → data URL для сохранения в localStorage вместе с альбомом. */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл обложки."));
    reader.readAsDataURL(file);
  });
}

/** Страница формы альбома: загрузка файла, валидация, unshift в коллекцию. */
function initAlbumForm() {
  const form = document.querySelector("#album-form");
  if (!form) return;
  if (form.hasAttribute("data-php-handled")) return;

  const message = document.querySelector("#form-message");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const coverFile = data.get("coverFile");
    let coverData = "";

    if (coverFile instanceof File && coverFile.size > 0) {
      if (!coverFile.type.startsWith("image/")) {
        if (message) message.textContent = "Файл обложки должен быть изображением.";
        return;
      }
      try {
        coverData = await readFileAsDataUrl(coverFile);
      } catch (_err) {
        if (message) message.textContent = "Не получилось загрузить файл обложки.";
        return;
      }
    }

    const album = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: String(data.get("title") || "").trim(),
      artist: String(data.get("artist") || "").trim(),
      country: String(data.get("country") || "").trim(),
      genre: String(data.get("genre") || "").trim(),
      year: Number(data.get("year")),
      status: String(data.get("status") || "planned"),
      rating: Number(data.get("rating")),
      review: String(data.get("review") || "").trim(),
      coverUrl: coverData,
      createdAt: Date.now()
    };

    const isValid =
      album.title &&
      album.artist &&
      album.country &&
      album.genre &&
      album.review &&
      Number.isFinite(album.year) &&
      album.year >= 1900 &&
      album.year <= 2100 &&
      Number.isFinite(album.rating) &&
      album.rating >= 1 &&
      album.rating <= 10;

    if (!isValid) {
      if (message) message.textContent = "Проверь поля: год 1900-2100, рейтинг 1-10, текстовые поля не пустые.";
      return;
    }

    const albums = getAlbums();
    albums.unshift(album);
    saveAlbums(albums);
    form.reset();
    if (message) message.textContent = "Сохранено в коллекции.";
  });
}

/** Регистрация: клиентские проверки; при data-php-handled форма уходит POST в register.php. */
function initRegisterForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const phpHandled = form.hasAttribute("data-php-handled");
  const messageEl = document.querySelector("#register-message");
  const user = form.querySelector("#reg-username");
  const email = form.querySelector("#reg-email");
  const phone = form.querySelector("#reg-phone");
  const pass = form.querySelector("#reg-password");
  const pass2 = form.querySelector("#reg-password-confirm");

  const inputs = [user, email, phone, pass, pass2].filter(Boolean);

  function clearFieldErrors() {
    for (const el of inputs) el.classList.remove("is-invalid");
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.textContent = "";
    messageEl.classList.remove("register-message--err", "register-message--ok");
  }

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      clearFieldErrors();
      clearMessage();
    }, 0);
  });

  form.addEventListener("submit", (event) => {
    clearFieldErrors();
    clearMessage();

    function fail(msg, fields) {
      event.preventDefault();
      for (const el of fields) {
        if (el) el.classList.add("is-invalid");
      }
      if (messageEl) {
        messageEl.textContent = msg;
        messageEl.classList.add("register-message--err");
      }
    }

    if (!validateRegisterUsername(user?.value).ok) {
      fail("Не получилось: логин не подходит.", [user]);
      return;
    }

    if (!validateRegisterEmail(email?.value).ok) {
      fail("Не получилось: email не подходит.", [email]);
      return;
    }

    if (!validateRegisterPhone(phone?.value).ok) {
      fail(
        "Не получилось: телефон — только цифры, +, скобки, пробел и дефис, от 10 до 11 цифр.",
        [phone]
      );
      return;
    }

    if (!validateRegisterPassword(pass?.value).ok) {
      fail("Не получилось: пароль не подходит.", [pass]);
      return;
    }

    if (String(pass.value) !== String(pass2.value)) {
      fail("Не получилось: пароли не совпадают.", [pass, pass2]);
      return;
    }

    if (phpHandled) {
      return;
    }

    event.preventDefault();
    messageEl.textContent = "Получилось: форма прошла, на сервер ничего не ушло.";
    messageEl.classList.add("register-message--ok");
  });
}

/** Страница коллекции: фильтры, статистика, перерисовка tbody. */
function renderList() {
  const tableBody = document.querySelector("#albums-table-body");
  if (!tableBody) return;
  if (document.body?.dataset.serverRenderedAlbums === "1") return;

  const filterStatus = document.querySelector("#filter-status");
  const filterSearch = document.querySelector("#filter-search");
  const emptyBlock = document.querySelector("#list-empty");

  const statTotal = document.querySelector("#stat-total");
  const statCompleted = document.querySelector("#stat-completed");
  const statListening = document.querySelector("#stat-listening");
  const statRating = document.querySelector("#stat-rating");

  const paint = () => {
    const statusValue = filterStatus ? filterStatus.value : "all";
    const query = (filterSearch ? filterSearch.value : "").trim().toLowerCase();
    const albums = getAlbums();

    if (statTotal) statTotal.textContent = String(albums.length);
    if (statCompleted) statCompleted.textContent = String(albums.filter((a) => a.status === "completed").length);
    if (statListening) statListening.textContent = String(albums.filter((a) => a.status === "listening").length);
    const avg = albums.length ? albums.reduce((sum, a) => sum + Number(a.rating || 0), 0) / albums.length : 0;
    if (statRating) statRating.textContent = avg.toFixed(1);

    const filtered = albums.filter((album) => {
      const statusOk = statusValue === "all" || album.status === statusValue;
      const searchOk =
        query.length === 0 ||
        album.title.toLowerCase().includes(query) ||
        album.artist.toLowerCase().includes(query);
      return statusOk && searchOk;
    });

    if (emptyBlock) emptyBlock.hidden = filtered.length > 0;

    tableBody.innerHTML = filtered
      .map(
        (album) => `
          <tr
            class="album-row"
            data-album-id="${escapeHtml(album.id)}"
            tabindex="0"
            role="button"
            aria-label="Открыть ${escapeHtml(album.title)} — ${escapeHtml(album.artist)}"
          >
            <td>
              <span class="album-cell">
                <span class="album-thumb">${getCoverCellHtml(album)}</span>
                <span class="album-meta">
                  <span class="album-title">${escapeHtml(album.title)}</span>
                  <span class="album-artist">${escapeHtml(album.artist)}</span>
                </span>
              </span>
            </td>
            <td>${escapeHtml(album.genre)}</td>
            <td>${escapeHtml(album.year)}</td>
            <td><span class="status-pill">${humanStatus(album.status)}</span></td>
            <td><span class="rating-pill">${Number(album.rating).toFixed(1)}</span></td>
          </tr>
        `
      )
      .join("");
  };

  if (filterStatus) filterStatus.addEventListener("change", paint);
  if (filterSearch) filterSearch.addEventListener("input", paint);
  paint();
}

/** Клик по строке таблицы → модалка с полными полями альбома, Escape/оверлей закрывают. */
function initListAlbumModal() {
  const tableBody = document.querySelector("#albums-table-body");
  const modalEl = document.getElementById("album-modal");
  if (!tableBody || !modalEl || typeof bootstrap === "undefined") return;

  const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const titleEl = document.getElementById("modal-album-title");
  const metaEl = document.getElementById("modal-album-meta");
  const genreEl = document.getElementById("modal-album-genre");
  const yearEl = document.getElementById("modal-album-year");
  const statusEl = document.getElementById("modal-album-status");
  const ratingEl = document.getElementById("modal-album-rating");
  const reviewEl = document.getElementById("modal-album-review");
  const cover = document.getElementById("modal-detail-cover");
  const coverImg = document.getElementById("modal-detail-cover-img");

  function openModal(albumId) {
    const album = getAlbums().find((a) => a.id === albumId);
    if (!album) return;

    if (titleEl) titleEl.textContent = album.title;
    if (metaEl)
      metaEl.innerHTML = `Исполнитель: <strong>${escapeHtml(album.artist)}</strong> • Страна: <strong>${escapeHtml(album.country)}</strong>`;
    if (genreEl) genreEl.textContent = album.genre;
    if (yearEl) yearEl.textContent = String(album.year);
    if (statusEl) statusEl.textContent = humanStatus(album.status);
    if (ratingEl) ratingEl.textContent = `Оценка ${Number(album.rating).toFixed(1)}`;
    if (reviewEl) reviewEl.textContent = album.review;
    if (cover) cover.setAttribute("data-album", `${album.artist} — ${album.title}`);
    if (coverImg) {
      if (album.coverUrl) {
        coverImg.src = album.coverUrl;
        coverImg.alt = `Обложка альбома ${album.title}`;
        if (cover) cover.style.setProperty("--cover-image", `url("${album.coverUrl}")`);
      } else {
        coverImg.removeAttribute("src");
        coverImg.alt = "";
        if (cover) cover.style.removeProperty("--cover-image");
      }
    }

    // Требование: отдельная страница элемента списка.
    // Раньше здесь открывалась модалка, но детальная информация должна быть по URL.
    window.location.href = `./detail.html?id=${encodeURIComponent(albumId)}`;
  }

  tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-album-id]");
    if (!row) return;
    openModal(row.getAttribute("data-album-id"));
  });

  tableBody.addEventListener("keydown", (event) => {
    const row = event.target.closest("tr[data-album-id]");
    if (!row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(row.getAttribute("data-album-id"));
    }
  });
}

/** Старая страница detail.html?id=… — заполняет поля, если альбом найден. */
function initDetailPage() {
  if (document.body?.dataset.phpRenderedDetail === "1") return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const albums = getAlbums();
  const album = albums.find((item) => item.id === id);
  if (!album) return;

  const title = document.querySelector("#detail-title");
  const meta = document.querySelector("#detail-meta");
  const genre = document.querySelector("#detail-genre");
  const year = document.querySelector("#detail-year");
  const status = document.querySelector("#detail-status");
  const rating = document.querySelector("#detail-rating");
  const review = document.querySelector("#detail-review");
  const cover = document.querySelector("#detail-cover");
  const coverImg = document.querySelector("#detail-cover-img");

  if (title) title.textContent = album.title;
  if (meta) meta.innerHTML = `Исполнитель: <strong>${escapeHtml(album.artist)}</strong> • Страна: <strong>${escapeHtml(album.country)}</strong>`;
  if (genre) genre.textContent = album.genre;
  if (year) year.textContent = String(album.year);
  if (status) status.textContent = humanStatus(album.status);
  if (rating) rating.textContent = `Оценка ${Number(album.rating).toFixed(1)}`;
  if (review) review.textContent = album.review;
  if (cover) cover.setAttribute("data-album", `${album.artist} — ${album.title}`);
  if (coverImg && album.coverUrl) {
    coverImg.src = album.coverUrl;
    coverImg.alt = `Обложка альбома ${album.title}`;
  }
}

/** Плитки жанров меняют src embed-плейлиста Spotify (data-spotify-playlist на плитке). */
function initGenreSpotify() {
  const panel = document.getElementById("panel-genres");
  if (!panel) return;

  const iframe = document.getElementById("genre-spotify-iframe");
  const heading = document.getElementById("genre-spotify-heading");
  if (!iframe) return;

  function genreTiles() {
    return Array.from(panel.querySelectorAll(".tile--genre-selectable"));
  }

  function selectGenre(tile) {
    const playlistId = tile.getAttribute("data-spotify-playlist");
    const label = tile.getAttribute("data-spotify-label") || "Spotify";
    if (!playlistId) return;

    const tiles = genreTiles();
    if (tiles.length === 0) return;

    for (const t of tiles) {
      const on = t === tile;
      t.classList.toggle("is-genre-selected", on);
      t.setAttribute("aria-pressed", on ? "true" : "false");
    }

    iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
    iframe.title = `Spotify — ${label}`;
    if (heading) heading.textContent = `Spotify: ${label}`;
  }

  panel.addEventListener("click", (event) => {
    const tile = event.target.closest(".tile--genre-selectable");
    if (!tile || !panel.contains(tile)) return;
    selectGenre(tile);
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const tile = event.target.closest(".tile--genre-selectable");
    if (!tile || !panel.contains(tile)) return;
    event.preventDefault();
    selectGenre(tile);
  });
}

function cancelTileAnimations(tileList) {
  for (const tile of tileList) {
    tile.getAnimations().forEach((anim) => anim.cancel());
    tile.classList.remove("is-album-fading", "is-album-reveal");
    tile.style.removeProperty("opacity");
    tile.style.removeProperty("transform");
  }
}

/** Главная: плитки жанров — альбомы из MySQL, смена каждые 20 с (lite JSON + Web Animations API). */
function initHomeAlbumRotation() {
  const panel = document.getElementById("panel-genres");
  if (!panel) return;

  const tiles = Array.from(panel.querySelectorAll(".tile--genre-selectable"));
  if (tiles.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canAnimate = !reducedMotion && typeof tiles[0].animate === "function";
  const albumsUrl = new URL("albums-json.php?lite=1", window.location.href).href;
  const ROTATE_MS = 20000;

  let albums = [];
  let offset = 0;
  let isAnimating = false;
  let rotateTimer = null;

  function applyAlbumToTile(tile, album) {
    if (!album) return;

    const cover = tile.querySelector(".cover");
    const img = tile.querySelector(".cover img");
    const kicker = tile.querySelector(".tile__kicker");
    const titleEl = tile.querySelector(".tile__title");
    const textEl = tile.querySelector(".tile__text");

    const title = repairUtf8Text(album.title);
    const artist = repairUtf8Text(album.artist);
    const genre = repairUtf8Text(album.genre);
    const review = repairUtf8Text(album.review);
    const label = `${artist} — ${title}`;
    const coverUrl = resolveHomeCoverUrl(album);

    if (cover) cover.setAttribute("data-album", label);
    if (kicker) kicker.textContent = genre || "—";
    if (titleEl) titleEl.textContent = `${artist} · ${title}`;
    if (textEl) {
      textEl.textContent = review.length > 140 ? `${review.slice(0, 137)}…` : review;
    }

    if (!img) return;

    img.alt = `Обложка ${title}`;
    img.referrerPolicy = "no-referrer";

    const applyCover = (loaded) => {
      if (!cover) return;
      if (loaded && coverUrl) {
        img.src = coverUrl;
        img.style.removeProperty("opacity");
        img.style.removeProperty("visibility");
        bindCoverBackground(img);
        return;
      }
      img.removeAttribute("src");
      img.style.opacity = "0";
      img.style.visibility = "hidden";
      cover.classList.remove("cover--has-img");
      cover.style.removeProperty("--cover-image");
    };

    if (!coverUrl) {
      applyCover(false);
      return;
    }

    void preloadCoverImage(coverUrl, 2500).then(applyCover);
  }

  async function runTileMotion(out) {
    if (!canAnimate) return;
    cancelTileAnimations(tiles);
    const keyframes = out
      ? [
          { opacity: 1, transform: "translateY(0) scale(1)" },
          { opacity: 0, transform: "translateY(12px) scale(0.98)" },
        ]
      : [
          { opacity: 0, transform: "translateY(12px) scale(0.98)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ];
    const options = { duration: 520, easing: "ease", fill: "forwards" };
    const runs = tiles.map((tile) => tile.animate(keyframes, options));
    await Promise.all(runs.map((run) => run.finished.catch(() => {})));
  }

  async function paint() {
    const n = albums.length;
    if (n === 0 || isAnimating) return;
    if (!panel.classList.contains("is-active")) return;

    isAnimating = true;
    try {
      await runTileMotion(true);
      tiles.forEach((tile, index) => applyAlbumToTile(tile, albums[(offset + index) % n]));
      offset = (offset + 1) % Math.max(n, 1);
      await runTileMotion(false);
    } finally {
      cancelTileAnimations(tiles);
      isAnimating = false;
    }
  }

  function scheduleRotation() {
    if (rotateTimer) window.clearInterval(rotateTimer);
    rotateTimer = window.setInterval(() => {
      void paint();
    }, ROTATE_MS);
  }

  async function bootstrap() {
    try {
      const response = await fetch(albumsUrl, {
        headers: { Accept: "application/json; charset=UTF-8" },
      });
      if (!response.ok) throw new Error("albums fetch failed");
      const data = JSON.parse(await response.text());
      if (!Array.isArray(data) || data.length === 0) return;

      albums = data;
      await whenHomeContentVisible();
      await nextPaintFrame();
      await paint();
      scheduleRotation();
    } catch (_err) {
      /* без PHP/БД ротация недоступна */
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && albums.length > 0) {
      void paint();
    }
  });

  void bootstrap();
}

/** Выставляет --cover-image для .cover с загруженной картинкой (размытый фон под обложкой). */
function initCoverArt() {
  const coverImages = Array.from(document.querySelectorAll(".cover img"));
  for (const img of coverImages) {
    const cover = img.closest(".cover");
    if (!cover) continue;

    const srcAttr = img.getAttribute("src");
    if (!srcAttr || srcAttr.trim() === "") continue;

    const applyCoverBackground = () => {
      const src = img.currentSrc || img.src;
      if (!src) return;
      cover.style.setProperty("--cover-image", `url("${src}")`);
    };

    if (img.complete && img.naturalWidth === 0) {
      cover.style.removeProperty("--cover-image");
      cover.classList.remove("cover--has-img");
      continue;
    }

    applyCoverBackground();
    img.addEventListener("load", applyCoverBackground);
    img.addEventListener("error", () => {
      cover.style.removeProperty("--cover-image");
      cover.classList.remove("cover--has-img");
    });
  }
}

/**
 * Заставка с логотипом: только главная, один раз за сессию (sessionStorage),
 * уважает prefers-reduced-motion. Убирает class intro-pending с html.
 */
function initLogoIntro() {
  const brandMark = document.querySelector(".brand__mark");
  const pathname = window.location.pathname;
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (_e) {}
  const isHomePage =
    decodedPath === "/" ||
    /\/index\.html$/i.test(decodedPath) ||
    decodedPath.endsWith("/audiox/") ||
    decodedPath.endsWith("/audiox-web/") ||
    /audiox\/index\.html$/i.test(decodedPath) ||
    /audiox-web\/index\.html$/i.test(decodedPath);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const introAlreadySeen = sessionStorage.getItem("logoIntroPlayed") === "1";

  if (!brandMark || !isHomePage || reducedMotion || introAlreadySeen) {
    document.documentElement.classList.remove("intro-pending");
    return;
  }

  const introLogo = document.createElement("div");
  introLogo.className = "logo-intro";
  introLogo.innerHTML =
    '<div class="logo-intro__mark" aria-hidden="true"></div><div class="logo-intro__text">audio<span class="logo-intro__text-x">x</span></div>';

  document.body.classList.add("logo-intro-active");
  document.body.appendChild(introLogo);
  sessionStorage.setItem("logoIntroPlayed", "1");

  window.setTimeout(() => {
    introLogo.style.opacity = "0";
    document.body.classList.remove("logo-intro-active");
    document.documentElement.classList.remove("intro-pending");
    window.setTimeout(() => introLogo.remove(), 820);
  }, 2000);
}

/** Вызывает initLogoIntro после DOMContentLoaded, если документ ещё грузился. */
function runLogoIntro() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogoIntro, { once: true });
  } else {
    initLogoIntro();
  }
}

runLogoIntro();

/* Инициализация по страницам: лишние вызовы безопасно no-op, если нет нужных узлов в DOM. */
initTabs();
initGenreSpotify();
initHomeAlbumRotation();
initAlbumForm();
initRegisterForm();
renderList();
initListAlbumModal();
initDetailPage();
initCoverArt();

