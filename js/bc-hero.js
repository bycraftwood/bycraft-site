/* BYCRAFT: Вход + Hero (генерируется update_site.py) */
(function () {
  'use strict';
  var root = document.documentElement;
  var hero = document.querySelector('.bc-hero');
  if (!hero) return;
  var nav = document.querySelector('.bc-nav');
  var media = hero.querySelector('.bc-hero__media');
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Убираем оверлей входа после анимации */
  var entry = document.querySelector('.bc-entry');
  if (entry) setTimeout(function () { if (entry.parentNode) entry.parentNode.removeChild(entry); }, 2400);

  /* Навигация */
  if (nav) {
    var btn = nav.querySelector('.bc-nav__toggle');
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      if (btn) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Закрыть' : 'Меню';
      }
    };
    if (btn) btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.bc-nav__menu a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); if (btn) btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setOpen(false); });
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.pageYOffset > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Свет: курсор = источник света */
  if (!media) return;
  var HOME = { x: 38, y: 40 };
  var lx = HOME.x, ly = HOME.y, tx = lx, ty = ly;
  var lastMove = 0, running = false, inView = true, raf = 0;

  var paint = function () {
    media.style.setProperty('--lx', lx.toFixed(2) + '%');
    media.style.setProperty('--ly', ly.toFixed(2) + '%');
  };
  var clamp = function (v) { return Math.max(-10, Math.min(110, v)); };

  var aim = function (e) {
    var r = media.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tx = clamp((e.clientX - r.left) / r.width * 100);
    ty = clamp((e.clientY - r.top) / r.height * 100);
    lastMove = performance.now();
    if (reduced) { lx = tx; ly = ty; paint(); }
  };

  var frame = function (t) {
    if (!running) return;
    if (t - lastMove > 3000) {            /* пауза: свет медленно дрейфует */
      tx = 38 + 20 * Math.sin(t / 4300);
      ty = 36 + 14 * Math.cos(t / 5100);
    }
    lx += (tx - lx) * 0.06;
    ly += (ty - ly) * 0.06;
    paint();
    raf = requestAnimationFrame(frame);
  };
  var start = function () { if (!running && !reduced && inView && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
  var stop = function () { running = false; cancelAnimationFrame(raf); };

  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') aim(e); }, { passive: true });
  media.addEventListener('pointerdown', aim, { passive: true });

  /* Клавиатура: стрелки двигают свет, Esc возвращает */
  media.addEventListener('keydown', function (e) {
    var step = 6, used = true;
    if (e.key === 'ArrowLeft') tx = clamp(tx - step);
    else if (e.key === 'ArrowRight') tx = clamp(tx + step);
    else if (e.key === 'ArrowUp') ty = clamp(ty - step);
    else if (e.key === 'ArrowDown') ty = clamp(ty + step);
    else if (e.key === 'Escape') { tx = HOME.x; ty = HOME.y; lastMove = 0; }
    else used = false;
    if (used) {
      e.preventDefault();
      if (e.key !== 'Escape') lastMove = performance.now();
      if (reduced) { lx = tx; ly = ty; paint(); }
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      if (inView) start(); else stop();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });

  paint();
  start();
})();
