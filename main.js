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
  if (domain.startsWith(".")) return { ok: false };
  if (domain.endsWith(".")) return { ok: false };
  if (domain.includes("..")) return { ok: false };
  if (!domain.includes(".")) return { ok: false };

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

/** Регистрация: проверки и сообщения в #register-message (на сервер не отправляется). */
function initRegisterForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const messageEl = document.querySelector("#register-message");
  const user = form.querySelector("#reg-username");
  const email = form.querySelector("#reg-email");
  const pass = form.querySelector("#reg-password");
  const pass2 = form.querySelector("#reg-password-confirm");

  const inputs = [user, email, pass, pass2].filter(Boolean);

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
    event.preventDefault();
    clearFieldErrors();
    clearMessage();

    if (!validateRegisterUsername(user?.value).ok) {
      user.classList.add("is-invalid");
      messageEl.textContent = "Не получилось: логин не подходит.";
      messageEl.classList.add("register-message--err");
      return;
    }

    if (!validateRegisterEmail(email?.value).ok) {
      email.classList.add("is-invalid");
      messageEl.textContent = "Не получилось: email не подходит.";
      messageEl.classList.add("register-message--err");
      return;
    }

    if (!validateRegisterPassword(pass?.value).ok) {
      pass.classList.add("is-invalid");
      messageEl.textContent = "Не получилось: пароль не подходит.";
      messageEl.classList.add("register-message--err");
      return;
    }

    if (String(pass.value) !== String(pass2.value)) {
      pass.classList.add("is-invalid");
      pass2.classList.add("is-invalid");
      messageEl.textContent = "Не получилось: пароли не совпадают.";
      messageEl.classList.add("register-message--err");
      return;
    }

    messageEl.textContent = "Получилось: форма прошла, на сервер ничего не ушло.";
    messageEl.classList.add("register-message--ok");
  });
}

/** Страница коллекции: фильтры, статистика, перерисовка tbody. */
function renderList() {
  const tableBody = document.querySelector("#albums-table-body");
  if (!tableBody) return;

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
  const modal = document.getElementById("album-modal");
  if (!tableBody || !modal) return;

  const backdrop = modal.querySelector("[data-modal-close]");
  const closeBtn = modal.querySelector(".modal__close");
  const titleEl = document.getElementById("modal-album-title");
  const metaEl = document.getElementById("modal-album-meta");
  const genreEl = document.getElementById("modal-album-genre");
  const yearEl = document.getElementById("modal-album-year");
  const statusEl = document.getElementById("modal-album-status");
  const ratingEl = document.getElementById("modal-album-rating");
  const reviewEl = document.getElementById("modal-album-review");
  const cover = document.getElementById("modal-detail-cover");
  const coverImg = document.getElementById("modal-detail-cover-img");

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDocKeydown);
  }

  function onDocKeydown(event) {
    if (event.key === "Escape") closeModal();
  }

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

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onDocKeydown);
    if (closeBtn) closeBtn.focus();
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

  if (backdrop)
    backdrop.addEventListener("click", () => {
      closeModal();
    });
  if (closeBtn) closeBtn.addEventListener("click", () => closeModal());
}

/** Старая страница detail.html?id=… — заполняет поля, если альбом найден. */
function initDetailPage() {
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
      img.remove();
      continue;
    }

    applyCoverBackground();
    img.addEventListener("load", applyCoverBackground);
    img.addEventListener("error", () => {
      img.remove();
      cover.style.removeProperty("--cover-image");
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
    /audiox\/index\.html$/i.test(decodedPath);

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
initAlbumForm();
initRegisterForm();
renderList();
initListAlbumModal();
initDetailPage();
initCoverArt();

