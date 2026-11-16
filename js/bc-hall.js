/* BYCRAFT: «Зал» на главной (генерируется update_hall.py) */
(function () {
  'use strict';
  var items = [].slice.call(document.querySelectorAll('.bh-item'));
  if (!items.length) return;
  var showAll = function () { items.forEach(function (it) { it.classList.add('is-in'); }); };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) { showAll(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  items.forEach(function (it) { io.observe(it); });
  setTimeout(showAll, 6000);
})();
