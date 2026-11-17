/* BYCRAFT: страница работы (генерируется update_work_pages.py) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var track = function (name, params) {
    try {
      var o = { event: name };
      for (var k in params) o[k] = params[k];
      (window.dataLayer = window.dataLayer || []).push(o);
    } catch (e) {}
  };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var work = document.body.getAttribute('data-work') || '';

  /* ---------- Навигация ---------- */
  var nav = $('.bc-nav');
  if (nav) {
    var btn = $('.bc-nav__toggle', nav);
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      if (btn) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      }
    };
    setOpen(false);
    window.addEventListener('pageshow', function () { setOpen(false); });
    if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!nav.classList.contains('is-open')); });
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

  /* ---------- Режимы просмотра ---------- */
  var box = $('.bk-box');
  var tabs = $$('.bk-mode');
  var panes = $$('.bk-pane');
  var capEl = $('.bk-cap');
  var strips = $$('.bk-strip');

  var updateCaption = function () {
    var mode = (tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || {}).dataset;
    mode = mode ? mode.mode : 'look';
    if (!capEl) return;
    if (mode === 'trace') {
      var s = $('.bk-pane--trace .bk-strip');
      var i = s ? Math.round(s.scrollLeft / Math.max(1, s.clientWidth)) : 0;
      var caps = (s && s.getAttribute('data-caps') || '').split('|');
      capEl.textContent = caps[i] || '';
    } else if (mode === 'scale') {
      capEl.textContent = capEl.getAttribute('data-scale') || '';
    } else {
      capEl.textContent = '';
    }
  };

  var setMode = function (m, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.mode === m;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panes.forEach(function (p) { p.hidden = p.dataset.mode !== m; });
    if (box) box.classList.remove('is-zoom');
    updateCaption();
    track('mode_switch', { work: work, mode: m });
  };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setMode(t.dataset.mode, false); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = -1;
      if (k === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (j >= 0) { e.preventDefault(); setMode(tabs[j].dataset.mode, true); }
    });
  });

  /* ---------- Ленты фото ---------- */
  strips.forEach(function (s) {
    var pane = s.closest('.bk-pane');
    var cnt = $('.bk-count', pane);
    var n = s.children.length;
    s.addEventListener('scroll', function () {
      var i = Math.min(n - 1, Math.round(s.scrollLeft / Math.max(1, s.clientWidth)));
      if (cnt) cnt.textContent = (i + 1) + '/' + n;
      updateCaption();
    }, { passive: true });
    $$('.bk-arrow', pane).forEach(function (a) {
      a.addEventListener('click', function () {
        var dir = a.classList.contains('bk-arrow--next') ? 1 : -1;
        s.scrollBy({ left: dir * s.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    s.setAttribute('tabindex', '0');
    s.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
      if (!dir) return;
      e.preventDefault();
      s.scrollBy({ left: dir * s.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Свет и увеличение ---------- */
  var aimLight = function (el, e) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    el.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  };
  if (box) {
    box.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      aimLight(box, e);
      if (box.classList.contains('is-zoom')) {
        var r = box.getBoundingClientRect();
        box.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        box.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }
    }, { passive: true });
    var look = $('.bk-pane--look', box);
    if (look) look.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('img')) return;
      var on = !box.classList.contains('is-zoom');
      box.classList.toggle('is-zoom', on);
      if (on) {
        var r = box.getBoundingClientRect();
        box.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        box.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        track('zoom', { work: work });
      }
    });
  }
  var macro = $('.bk-macro');
  if (macro) macro.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'touch') aimLight(macro, e);
  }, { passive: true });

  /* ---------- Поделиться ---------- */
  var shareBtn = $('[data-share]');
  var shareNote = $('.bk-share-note');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    var url = location.href.split('#')[0];
    track('share', { work: work });
    if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
    var done = function () { if (shareNote) shareNote.textContent = 'Ссылка скопирована'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () {});
    else done();
  });

  /* ---------- Окно запроса ----------
     Отправка: POST /api/request, JSON: { name, contact, role, comment, website (ловушка), work, page }
     Ответ при успехе: JSON { ok: true } */
  var dlg = $('#bk-dialog');
  var form = $('#bk-form');
  var done = $('#bk-done');
  var msg = $('.bk-msg', dlg || document);
  var lastOpener = null;
  var openDlg = function (opener) {
    if (!dlg) return;
    lastOpener = opener || null;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    track('request_start', { work: work });
    var first = $('input[name="name"]', dlg);
    if (first) setTimeout(function () { first.focus(); }, 30);
  };
  var closeDlg = function () {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    if (lastOpener) lastOpener.focus();
  };
  $$('[data-open-request]').forEach(function (b) {
    b.addEventListener('click', function () { openDlg(b); });
  });
  if (dlg) {
    $$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', closeDlg); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });
  }
  if (form) form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (form.reportValidity && !form.reportValidity()) return;
    var submit = $('button[type="submit"]', form);
    var label = submit ? submit.querySelector('span') : null;
    var old = label ? label.textContent : '';
    if (submit) submit.disabled = true;
    if (label) label.textContent = 'Отправляем…';
    msg.textContent = '';
    var fd = new FormData(form);
    var data = {
      name: fd.get('name') || '', contact: fd.get('contact') || '', role: fd.get('role') || '',
      comment: fd.get('comment') || '', website: fd.get('website') || '',
      work: form.getAttribute('data-work') || work, page: location.href.split('#')[0]
    };
    try {
      var r = await fetch('/api/request', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data)
      });
      var j = {};
      try { j = await r.json(); } catch (err) {}
      if (r.ok && j && j.ok) {
        form.hidden = true;
        if (done) { done.hidden = false; var h = $('h2', done); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
        track('request_submit', { work: work });
        form.reset();
        return;
      }
      throw new Error('send');
    } catch (err) {
      msg.innerHTML = 'Не удалось отправить. Напишите нам напрямую: <a href="https://t.me/bycraft">Telegram</a> или <a href="tel:+375295507250">+375 (29) 550-72-50</a>.';
      track('request_error', { work: work });
    }
    if (submit) submit.disabled = false;
    if (label) label.textContent = old;
  });

  /* ---------- Контакты ---------- */
  $$('[data-contact]').forEach(function (a) {
    a.addEventListener('click', function () { track('contact_click', { work: work, channel: a.getAttribute('data-contact') }); });
  });
  track('work_view', { work: work });
})();
