
// === BYCRAFT COOKIE CONSENT ===
(function () {
  var KEY = "bycraft_cookie_prefs";
  function getPrefs() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }
  function savePrefs(prefs) {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      localStorage.setItem("bycraft_cookie_closed", "true");
    } catch (e) {}
    document.cookie = "bycraft_cookie_closed=true; max-age=31536000; path=/";
  }
  function applyPrefs(prefs) {
    // Analytics / marketing load hooks (extend when scripts are connected)
    window.__bycraftCookie = prefs;
    if (prefs && prefs.analytics) {
      document.dispatchEvent(new CustomEvent("bycraft:cookie-analytics"));
    }
    if (prefs && prefs.marketing) {
      document.dispatchEvent(new CustomEvent("bycraft:cookie-marketing"));
    }
  }

  function removeEl(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  function openSettings() {
    removeEl("cookieSettings");
    var panel = document.createElement("div");
    panel.id = "cookieSettings";
    panel.className = "cookie-settings";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Настройки файлов cookie");
    panel.innerHTML =
      '<div class="cookie-settings__overlay" data-close="1"></div>' +
      '<div class="cookie-settings__box">' +
      '<button type="button" class="cookie-settings__x" data-close="1" aria-label="Закрыть">&times;</button>' +
      "<h2>Настройки файлов cookie</h2>" +
      "<p>Мы используем файлы cookie, чтобы помочь пользователям эффективно ориентироваться и выполнять определенные функции. Подробную информацию обо всех файлах cookie, соответствующих каждой категории согласия, можно найти ниже.</p>" +
      '<p class="cookie-settings__policy">Подробнее читайте в <a href="/privacy/">политике обработки персональных данных</a>.</p>' +
      '<div class="cookie-cat">' +
      '<div class="cookie-cat__row"><span class="cookie-cat__name">Обязательные (технические) файлы</span>' +
      '<span class="cookie-cat__badge">Всегда разрешено</span></div></div>' +
      '<div class="cookie-cat">' +
      '<div class="cookie-cat__row"><span class="cookie-cat__name">Аналитические файлы</span>' +
      '<label class="cookie-switch"><input type="checkbox" id="ck-analytics"><span class="cookie-switch__ui"></span></label></div>' +
      '<div class="cookie-cat__status" id="st-analytics">Запрещено</div></div>' +
      '<div class="cookie-cat">' +
      '<div class="cookie-cat__row"><span class="cookie-cat__name">Маркетинговые файлы</span>' +
      '<label class="cookie-switch"><input type="checkbox" id="ck-marketing"><span class="cookie-switch__ui"></span></label></div>' +
      '<div class="cookie-cat__status" id="st-marketing">Запрещено</div></div>' +
      '<div class="cookie-settings__actions">' +
      '<button type="button" class="cookie-btn cookie-btn--ghost" id="ck-save-reject">Только обязательные</button>' +
      '<button type="button" class="cookie-btn cookie-btn--primary" id="ck-save-accept">Сохранить</button>' +
      "</div></div>";
    document.body.appendChild(panel);

    function syncStatus() {
      var a = document.getElementById("ck-analytics");
      var m = document.getElementById("ck-marketing");
      var sa = document.getElementById("st-analytics");
      var sm = document.getElementById("st-marketing");
      if (sa) sa.textContent = a && a.checked ? "Разрешено" : "Запрещено";
      if (sm) sm.textContent = m && m.checked ? "Разрешено" : "Запрещено";
    }
    var a = document.getElementById("ck-analytics");
    var m = document.getElementById("ck-marketing");
    if (a) a.addEventListener("change", syncStatus);
    if (m) m.addEventListener("change", syncStatus);
    syncStatus();

    panel.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        removeEl("cookieSettings");
      });
    });
    var saveReject = document.getElementById("ck-save-reject");
    var saveAccept = document.getElementById("ck-save-accept");
    if (saveReject) {
      saveReject.addEventListener("click", function () {
        var prefs = { necessary: true, analytics: false, marketing: false };
        savePrefs(prefs);
        applyPrefs(prefs);
        removeEl("cookieSettings");
        removeEl("cookieBanner");
      });
    }
    if (saveAccept) {
      saveAccept.addEventListener("click", function () {
        var prefs = {
          necessary: true,
          analytics: !!(document.getElementById("ck-analytics") || {}).checked,
          marketing: !!(document.getElementById("ck-marketing") || {}).checked
        };
        savePrefs(prefs);
        applyPrefs(prefs);
        removeEl("cookieSettings");
        removeEl("cookieBanner");
      });
    }
  }

  function showBanner() {
    if (document.getElementById("cookieBanner")) return;
    var banner = document.createElement("div");
    banner.id = "cookieBanner";
    banner.className = "cookie-banner cookie-banner--v2";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Уведомление о cookie");
    banner.innerHTML =
      '<div class="cookie-banner__text">' +
      "<strong>Мы используем файлы cookie</strong>" +
      "<p>Они помогают улучшать пользовательский опыт. Продолжая, вы соглашаетесь на их использование.</p>" +
      "</div>" +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="cookie-btn cookie-btn--primary" id="cookieAcceptAll">Принять все</button>' +
      '<button type="button" class="cookie-btn cookie-btn--ghost" id="cookieConfigure">Настроить</button>' +
      "</div>";
    document.body.appendChild(banner);

    var accept = document.getElementById("cookieAcceptAll");
    var conf = document.getElementById("cookieConfigure");
    if (accept) {
      accept.addEventListener("click", function () {
        var prefs = { necessary: true, analytics: true, marketing: true };
        savePrefs(prefs);
        applyPrefs(prefs);
        removeEl("cookieBanner");
      });
    }
    if (conf) {
      conf.addEventListener("click", function () {
        openSettings();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var prefs = getPrefs();
    if (prefs) {
      applyPrefs(prefs);
      return;
    }
    // legacy dismiss without prefs → show banner again once with new UI
    showBanner();
  });

  // footer link helper
  window.bycraftOpenCookieSettings = openSettings;
})();

document.addEventListener('DOMContentLoaded', () => {
// 3. Автозапуск видео
  const allVideos = document.querySelectorAll('video');
  allVideos.forEach(v => {
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.muted = true;
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const touchPlay = () => {
          v.play();
          document.removeEventListener('touchstart', touchPlay);
          document.removeEventListener('scroll', touchPlay);
        };
        document.addEventListener('touchstart', touchPlay, { once: true });
        document.addEventListener('scroll', touchPlay, { once: true });
      });
    }
  });

  // 4. Модальные окна событий (поп-апы)
  const modalCards = document.querySelectorAll('[data-modal="true"]');
  const modalOverlay = document.getElementById('eventModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalBody = document.getElementById('modalBody');

  if (modalCards.length > 0 && modalOverlay) {
    modalCards.forEach(card => {
      card.addEventListener('click', () => {
        const title = card.getAttribute('data-title') || '';
        const date = card.getAttribute('data-date') || '';
        const desc = card.getAttribute('data-desc') || '';
        
        if (modalTitle) modalTitle.innerHTML = title;
        if (modalDate) modalDate.innerHTML = date;
        if (modalBody) modalBody.innerHTML = desc.replace(/\n/g, '<br>');
        modalOverlay.classList.add('active');
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // 5. Лайтбокс увеличения фото
  const zoomImages = document.querySelectorAll('.zoomable-photo');
  const lightbox = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (zoomImages.length > 0 && lightbox && lightboxImg) {
    zoomImages.forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        lightbox.removeAttribute('hidden');
        lightbox.setAttribute('aria-hidden', 'false');
        if (lightboxImg) { lightboxImg.removeAttribute('hidden'); }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.setAttribute('hidden', '');
        if (lightboxImg) { lightboxImg.removeAttribute('src'); lightboxImg.setAttribute('hidden', ''); }
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.setAttribute('hidden', '');
        if (lightboxImg) { lightboxImg.removeAttribute('src'); lightboxImg.setAttribute('hidden', ''); }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.setAttribute('hidden', '');
        if (lightboxImg) { lightboxImg.removeAttribute('src'); lightboxImg.setAttribute('hidden', ''); }
      }
    });
  }
});

/* === MOBILE NAV HARD FIX v3 === */
(function () {
  function initMobileNav() {
    var toggleBtn = document.querySelector(".mobile-toggle");
    var mainNav = document.querySelector(".main-nav");
    if (!toggleBtn || !mainNav) return;

    function isEn() {
      return window.location.pathname.indexOf("/en/") !== -1;
    }
    function setLabel(open) {
      toggleBtn.textContent = open ? "✕" : (isEn() ? "Menu" : "Меню");
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function toggleNav(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      var open = !mainNav.classList.contains("open");
      mainNav.classList.toggle("open", open);
      setLabel(open);
    }

    toggleBtn.addEventListener("click", toggleNav);
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "main-nav");
    mainNav.id = mainNav.id || "main-nav";

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        setLabel(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (!mainNav.classList.contains("open")) return;
      if (mainNav.contains(e.target) || toggleBtn.contains(e.target)) return;
      mainNav.classList.remove("open");
      setLabel(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNav);
  } else {
    initMobileNav();
  }
})();

