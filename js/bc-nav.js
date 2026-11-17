/* BYCRAFT: global navigation toggle for inner pages */
(function () {
  'use strict';
  if (document.querySelector('.bc-hero')) return;
  var nav = document.querySelector('.bc-nav');
  if (!nav || nav.dataset.bcNavInit) return;
  nav.dataset.bcNavInit = '1';

  var isEn = document.documentElement.lang === 'en';
  var btn = nav.querySelector('.bc-nav__toggle');
  var setOpen = function (open) {
    nav.classList.toggle('is-open', open);
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        open ? (isEn ? 'Close menu' : 'Закрыть меню') : (isEn ? 'Open menu' : 'Открыть меню')
      );
    }
  };

  setOpen(false);
  window.addEventListener('pageshow', function () { setOpen(false); });
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('is-open'));
    });
  }
  nav.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.bc-nav__menu a')) setOpen(false);
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      if (btn) btn.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900) setOpen(false);
  });
  var onScroll = function () {
    nav.classList.toggle('is-scrolled', window.pageYOffset > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
