document.addEventListener('DOMContentLoaded', () => {
// 2. ЕДИНСТВЕННЫЙ COOKIE-БАННЕР (создается через JS строго в 1 экземпляре)
  const isDismissed = localStorage.getItem('bycraft_cookie_closed') === 'true' ||
                      document.cookie.indexOf('bycraft_cookie_closed=true') !== -1;

  if (!isDismissed) {
    const isEn = window.location.pathname.indexOf('/en/') !== -1;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', isEn ? 'Cookie notice' : 'Уведомление о cookie');
    banner.id = 'cookieBanner';

    const policyUrl = isEn ? '/en/privacy/' : '/privacy/';
    const textMsg = isEn
      ? 'This site uses cookies. Learn more in our <a href="' + policyUrl + '" style="text-decoration: underline; color: inherit;">Policy</a>.'
      : 'Сайт использует файлы cookie. Подробнее — в <a href="' + policyUrl + '" style="text-decoration: underline; color: inherit;">Политике</a>.';
    const btnLabel = isEn ? 'Accept' : 'Понятно';

    banner.innerHTML = '<div>' + textMsg + '</div><button class="cookie-btn-accept" id="cookieAccept" type="button">' + btnLabel + '</button>';
    document.body.appendChild(banner);

    const btn = banner.querySelector('#cookieAccept');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        banner.remove(); // Полное удаление баннера из DOM
        try { localStorage.setItem('bycraft_cookie_closed', 'true'); } catch(err) {}
        document.cookie = 'bycraft_cookie_closed=true; max-age=31536000; path=/';
      });
    }
  }

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

