/* BYCRAFT: страница «Работы» (генерируется update_works.py) */
(function () {
  'use strict';
  var track = function (name, params) {
    try {
      var o = { event: name };
      for (var k in params) o[k] = params[k];
      (window.dataLayer = window.dataLayer || []).push(o);
    } catch (e) {}
  };

  /* ---------- Навигация ---------- */
  var nav = document.querySelector('.bc-nav');
  if (nav) {
    var btn = nav.querySelector('.bc-nav__toggle');
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      if (btn) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      }
    };
    setOpen(false);
    window.addEventListener('pageshow', function () { setOpen(false); });
    if (btn) btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.bc-nav__menu a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); if (btn) btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setOpen(false); });
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.pageYOffset > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Зал ---------- */
  var list = document.querySelector('.bw-list');
  if (!list) return;
  var items = [].slice.call(list.querySelectorAll('.bw-item'));
  var chips = [].slice.call(document.querySelectorAll('.bw-chip'));
  var viewBtns = [].slice.call(document.querySelectorAll('.bw-view'));
  var resets = [].slice.call(document.querySelectorAll('.bw-reset'));
  var emptyEl = document.querySelector('.bw-empty');
  var live = document.getElementById('bw-live');
  var desk = window.matchMedia('(min-width: 900px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = { status: 'all', size: 'all', year: 'all' };
  var userView = 'corridor';
  var forced = false;

  var hasChip = function (g, v) {
    return chips.some(function (c) { return c.dataset.group === g && c.dataset.value === v; });
  };
  try {
    var q = new URLSearchParams(location.search);
    ['status', 'size', 'year'].forEach(function (g) {
      var v = q.get(g);
      if (v && hasChip(g, v)) state[g] = v;
    });
    var vv = q.get('view');
    if (vv === 'grid' || vv === 'corridor') { userView = vv; forced = true; }
  } catch (e) {}

  /* --- глубина коридора --- */
  var raf = 0;
  var corridorOn = function () { return desk.matches && list.dataset.view === 'corridor'; };
  var clearDepth = function () { items.forEach(function (it) { it.style.removeProperty('--d'); }); };
  var depth = function () {
    raf = 0;
    if (!corridorOn() || reduced) { clearDepth(); return; }
    var lr = list.getBoundingClientRect();
    var cx = lr.left + lr.width / 2;
    items.forEach(function (it) {
      if (it.hidden) return;
      var r = it.getBoundingClientRect();
      if (!r.width) return;
      var d = Math.min(1, Math.abs(r.left + r.width / 2 - cx) / (r.width * 2.4));
      it.style.setProperty('--d', d.toFixed(3));
    });
  };
  var schedule = function () { if (!raf) raf = requestAnimationFrame(depth); };
  list.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (desk.addEventListener) desk.addEventListener('change', schedule);

  /* --- движение коридора: колесо, клавиши --- */
  var target = 0, anim = 0, settleT = 0;
  var maxScroll = function () { return Math.max(0, list.scrollWidth - list.clientWidth); };
  var clampX = function (x) { return Math.max(0, Math.min(maxScroll(), x)); };
  var visibleItems = function () {
    return items.filter(function (it) { return !it.hidden && it.offsetParent !== null; });
  };
  var centerOf = function (it) { return it.offsetLeft + it.offsetWidth / 2 - list.clientWidth / 2; };
  var nearest = function (x) {
    var best = x, bd = 1e9;
    visibleItems().forEach(function (it) {
      var c = clampX(centerOf(it));
      var d = Math.abs(c - x);
      if (d < bd) { bd = d; best = c; }
    });
    return best;
  };
  var restoreT = 0;
  var snapOff = function () { clearTimeout(restoreT); list.style.scrollSnapType = 'none'; };
  var snapOnLater = function () {
    clearTimeout(restoreT);
    restoreT = setTimeout(function () { list.style.scrollSnapType = ''; }, 250);
  };
  var stepAnim = function () {
    var diff = target - list.scrollLeft;
    if (Math.abs(diff) < 0.6) { list.scrollLeft = target; anim = 0; snapOnLater(); return; }
    var d = diff * 0.16;
    if (Math.abs(d) < 1) d = diff > 0 ? 1 : -1;
    list.scrollLeft += d;
    anim = requestAnimationFrame(stepAnim);
  };
  var goTo = function (x) {
    target = clampX(x);
    if (reduced) { list.scrollLeft = target; return; }
    snapOff();
    if (!anim) anim = requestAnimationFrame(stepAnim);
  };
  var stopAnim = function () { if (anim) { cancelAnimationFrame(anim); anim = 0; } snapOnLater(); };
  list.addEventListener('pointerdown', stopAnim, { passive: true });
  list.addEventListener('touchstart', stopAnim, { passive: true });

  list.addEventListener('wheel', function (e) {
    if (!corridorOn() || e.ctrlKey) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;       /* горизонтальный жест: родная прокрутка */
    var dy = e.deltaY * (e.deltaMode === 1 ? 32 : 1);
    var base = anim ? target : list.scrollLeft;
    if ((dy > 0 && base >= maxScroll() - 1) || (dy < 0 && base <= 1)) return;   /* край коридора: страница едет дальше */
    e.preventDefault();
    clearTimeout(settleT);
    goTo(base + dy);
    settleT = setTimeout(function () { goTo(nearest(target)); }, 140);
  }, { passive: false });

  list.addEventListener('keydown', function (e) {
    if (!corridorOn()) return;
    var k = e.key;
    if (k !== 'ArrowRight' && k !== 'ArrowLeft' && k !== 'Home' && k !== 'End') return;
    var links = visibleItems().filter(function (it) { return it.querySelector('a.bw-link'); });
    if (!links.length) return;
    var cur = e.target.closest ? e.target.closest('.bw-item') : null;
    var i = links.indexOf(cur);
    if (k === 'ArrowRight') i = Math.min(links.length - 1, i + 1);
    else if (k === 'ArrowLeft') i = Math.max(0, i < 0 ? 0 : i - 1);
    else if (k === 'Home') i = 0;
    else i = links.length - 1;
    e.preventDefault();
    var a = links[i].querySelector('a.bw-link');
    try { a.focus({ preventScroll: true }); } catch (err) { a.focus(); }
    goTo(centerOf(links[i]));
  });
  list.addEventListener('focusin', function (e) {
    if (!corridorOn()) return;
    var it = e.target.closest ? e.target.closest('.bw-item') : null;
    if (it) goTo(centerOf(it));
  });

  /* --- счётчик фото на карточке (телефон) --- */
  items.forEach(function (it) {
    var strip = it.querySelector('.bw-photos');
    var cnt = it.querySelector('.bw-count');
    if (!strip || !cnt) return;
    var n = strip.children.length;
    strip.addEventListener('scroll', function () {
      var i = Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth));
      cnt.textContent = (Math.min(n, i + 1)) + '/' + n;
    }, { passive: true });
  });

  /* --- фильтры и вид --- */
  var updateUrl = function () {
    try {
      var p = [];
      ['status', 'size', 'year'].forEach(function (g) {
        if (state[g] !== 'all') p.push(g + '=' + encodeURIComponent(state[g]));
      });
      if (forced) p.push('view=' + userView);
      history.replaceState(null, '', location.pathname + (p.length ? '?' + p.join('&') : ''));
    } catch (e) {}
  };

  var render = function (announce) {
    var anyFilter = state.status !== 'all' || state.size !== 'all' || state.year !== 'all';
    var view = forced ? userView : (anyFilter ? 'grid' : userView);
    list.dataset.view = view;
    var n = 0;
    items.forEach(function (it) {
      var ok = (state.status === 'all' || it.dataset.status === state.status) &&
               (state.size === 'all' || it.dataset.size === state.size) &&
               (state.year === 'all' || it.dataset.year === state.year);
      it.hidden = !ok;
      if (ok && !(view === 'corridor' && it.classList.contains('bw-item--nophoto'))) n++;
    });
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', state[c.dataset.group] === c.dataset.value ? 'true' : 'false');
    });
    viewBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false');
    });
    if (emptyEl) emptyEl.hidden = n > 0;
    if (announce && live) live.textContent = n ? ('Показано работ: ' + n) : 'По выбранным условиям работ нет';
    stopAnim();
    list.scrollLeft = 0;
    target = 0;
    schedule();
  };

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      state[c.dataset.group] = c.dataset.value;
      render(true);
      updateUrl();
      track('filter_use', { group: c.dataset.group, value: c.dataset.value });
    });
  });
  viewBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      userView = b.dataset.view;
      forced = true;
      render(true);
      updateUrl();
      track('view_mode_switch', { view: userView });
    });
  });
  resets.forEach(function (r) {
    r.addEventListener('click', function () {
      state = { status: 'all', size: 'all', year: 'all' };
      forced = false;
      render(true);
      updateUrl();
    });
  });

  /* --- переход к работе: остальные уходят в размытие --- */
  list.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a.bw-link') : null;
    if (!a) return;
    track('work_open', { work: a.dataset.work || '' });
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
    if (reduced) return;
    e.preventDefault();
    list.classList.add('is-entering');
    var it = a.closest('.bw-item');
    if (it) it.classList.add('is-chosen');
    setTimeout(function () { location.href = a.href; }, 420);
  });
  window.addEventListener('pageshow', function () {
    list.classList.remove('is-entering');
    items.forEach(function (it) { it.classList.remove('is-chosen'); });
  });

  track('works_view', {});
  render(false);
})();
