/* BYCRAFT: live BYN/RUB currency switcher with RU timezone auto-detect */
(function () {
  'use strict';

  var STORAGE_KEY = 'bc_currency';
  var RATE_CACHE_KEY = 'bc_rate_cache_v1';
  var CACHE_TTL_MS = 6 * 3600 * 1000;

  var RU_TZ = {
    'Europe/Moscow': 1, 'Europe/Kaliningrad': 1, 'Europe/Samara': 1,
    'Europe/Volgograd': 1, 'Europe/Saratov': 1, 'Europe/Astrakhan': 1,
    'Europe/Ulyanovsk': 1, 'Europe/Kirov': 1, 'W-SU': 1,
    'Asia/Yekaterinburg': 1, 'Asia/Omsk': 1, 'Asia/Novosibirsk': 1,
    'Asia/Barnaul': 1, 'Asia/Tomsk': 1, 'Asia/Novokuznetsk': 1,
    'Asia/Krasnoyarsk': 1, 'Asia/Irkutsk': 1, 'Asia/Chita': 1,
    'Asia/Yakutsk': 1, 'Asia/Khandyga': 1, 'Asia/Vladivostok': 1,
    'Asia/Ust-Nera': 1, 'Asia/Magadan': 1, 'Asia/Sakhalin': 1,
    'Asia/Srednekolymsk': 1, 'Asia/Kamchatka': 1, 'Asia/Anadyr': 1
  };

  var activeRate = null;
  var activeDate = '';

  function detectCurrency() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'BYN' || saved === 'RUB') return saved;
    } catch (e) {}

    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && RU_TZ[tz]) return 'RUB';
    } catch (e) {}

    return 'BYN';
  }

  function formatIsoDate(iso) {
    var m = String(iso || '').match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[3] + '.' + m[2] + '.' + m[1]) : '';
  }

  function formatUnixDate(sec) {
    if (!sec) return '';
    var d = new Date(sec * 1000);
    var dd = String(d.getDate());
    var mm = String(d.getMonth() + 1);
    if (dd.length < 2) dd = '0' + dd;
    if (mm.length < 2) mm = '0' + mm;
    return dd + '.' + mm + '.' + d.getFullYear();
  }

  function formatRubAmount(bynAmount, rate) {
    var raw = bynAmount * rate;
    var rounded = Math.round(raw / 100) * 100;
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  }

  function updateDynamicRubAttributes(rate, dateStr) {
    if (!rate || !isFinite(rate) || rate <= 10 || rate >= 100) return;
    activeRate = rate;
    activeDate = dateStr || '';

    var els = document.querySelectorAll('.bc-price[data-byn][data-rub]');
    for (var i = 0; i < els.length; i++) {
      var bynText = els[i].getAttribute('data-byn') || '';
      var clean = bynText.replace(/[\u00a0\s]/g, '');
      var m = clean.match(/(\d+)/);
      if (!m) continue;
      var bynVal = parseInt(m[1], 10);
      if (!bynVal) continue;

      var formatted = formatRubAmount(bynVal, rate);
      var newRub = (bynText.indexOf('Забронировать') === 0)
        ? ('Забронировать · ≈ ' + formatted + '\u00a0₽')
        : ('≈ ' + formatted + '\u00a0₽');
      els[i].setAttribute('data-rub', newRub);
    }

    if (activeDate) {
      var notes = document.querySelectorAll('[data-bc-rub-note]');
      for (var k = 0; k < notes.length; k++) {
        notes[k].textContent = 'по курсу на ' + activeDate;
      }
    }
  }

  function textRight(el) {
    if (!el) return null;
    if (el.firstChild && el.firstChild.nodeType === 3 && document.createRange) {
      var r = document.createRange();
      r.selectNodeContents(el.firstChild);
      return r.getBoundingClientRect().right;
    }
    return el.getBoundingClientRect().right;
  }

  function alignCurrencyToLang() {
    var bars = document.querySelectorAll('.bc-curr-bar:not(.bc-curr-bar--detail)');
    if (!bars.length) return;
    if (window.innerWidth < 900) {
      for (var i = 0; i < bars.length; i++) bars[i].style.paddingRight = '';
      return;
    }
    var langEnd = document.querySelector('.bc-nav .bc-lang > :last-child');
    if (!langEnd) return;
    var ruRight = textRight(langEnd);
    for (var j = 0; j < bars.length; j++) {
      var bar = bars[j];
      bar.style.paddingRight = '';
      var rubBtn = bar.querySelector('[data-bc-curr="RUB"]');
      if (!rubBtn) continue;
      var rubRight = textRight(rubBtn);
      var diff = rubRight - ruRight;
      if (Math.abs(diff) > 0.4 && diff > -30 && diff < 120) {
        var curPad = parseFloat(window.getComputedStyle(bar).paddingRight) || 0;
        var nextPad = Math.max(0, curPad + diff);
        bar.style.paddingRight = nextPad.toFixed(1) + 'px';
      }
    }
  }

  function applyCurrency(curr) {
    var attr = (curr === 'RUB') ? 'data-rub' : 'data-byn';
    var prices = document.querySelectorAll('.bc-price[data-byn][data-rub]');
    for (var i = 0; i < prices.length; i++) {
      var val = prices[i].getAttribute(attr);
      if (val !== null) prices[i].textContent = val;
    }

    var btns = document.querySelectorAll('[data-bc-curr]');
    for (var j = 0; j < btns.length; j++) {
      var on = btns[j].getAttribute('data-bc-curr') === curr;
      btns[j].classList.toggle('is-active', on);
      btns[j].setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    var notes = document.querySelectorAll('[data-bc-rub-note]');
    for (var k = 0; k < notes.length; k++) {
      notes[k].hidden = (curr !== 'RUB');
    }

    alignCurrencyToLang();
  }

  function readCachedRate() {
    try {
      var raw = window.localStorage.getItem(RATE_CACHE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.rate && data.ts && (Date.now() - data.ts) < CACHE_TTL_MS) {
        return data;
      }
    } catch (e) {}
    return null;
  }

  function saveCachedRate(rate, dateStr) {
    try {
      window.localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({
        rate: rate,
        date: dateStr,
        ts: Date.now()
      }));
    } catch (e) {}
  }

  function fetchJson(url) {
    var opts = { method: 'GET' };
    var timer = null;
    if (typeof AbortController !== 'undefined') {
      var ctrl = new AbortController();
      opts.signal = ctrl.signal;
      timer = setTimeout(function () { ctrl.abort(); }, 4500);
    }
    return fetch(url, opts).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function fetchLiveRate() {
    if (typeof fetch !== 'function') return;

    var sources = [
      function () {
        return fetchJson('https://api.nbrb.by/exrates/rates/RUB?parammode=2').then(function (d) {
          if (!d || !d.Cur_OfficialRate || !d.Cur_Scale) throw new Error('bad nbrb');
          return {
            rate: d.Cur_Scale / d.Cur_OfficialRate,
            date: formatIsoDate(d.Date)
          };
        });
      },
      function () {
        return fetchJson('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/byn.min.json').then(function (d) {
          if (!d || !d.byn || !d.byn.rub) throw new Error('bad jsdelivr');
          return {
            rate: d.byn.rub,
            date: formatIsoDate(d.date)
          };
        });
      },
      function () {
        return fetchJson('https://latest.currency-api.pages.dev/v1/currencies/byn.min.json').then(function (d) {
          if (!d || !d.byn || !d.byn.rub) throw new Error('bad pages.dev');
          return {
            rate: d.byn.rub,
            date: formatIsoDate(d.date)
          };
        });
      },
      function () {
        return fetchJson('https://open.er-api.com/v6/latest/BYN').then(function (d) {
          if (!d || !d.rates || !d.rates.RUB) throw new Error('bad er-api');
          return {
            rate: d.rates.RUB,
            date: formatUnixDate(d.time_last_update_unix)
          };
        });
      }
    ];

    var idx = 0;
    function next() {
      if (idx >= sources.length) return;
      sources[idx++]().then(function (res) {
        if (!res || !isFinite(res.rate) || res.rate <= 10 || res.rate >= 100) {
          next();
          return;
        }
        saveCachedRate(res.rate, res.date);
        updateDynamicRubAttributes(res.rate, res.date);
        applyCurrency(detectCurrency());
      }).catch(function () {
        next();
      });
    }
    next();
  }

  function init() {
    var cached = readCachedRate();
    if (cached) {
      updateDynamicRubAttributes(cached.rate, cached.date);
    }
    applyCurrency(detectCurrency());
    if (!cached) {
      fetchLiveRate();
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(alignCurrencyToLang);
    }
    window.addEventListener('load', alignCurrencyToLang);
    window.addEventListener('resize', alignCurrencyToLang);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-bc-curr]') : null;
    if (!btn) return;
    var curr = btn.getAttribute('data-bc-curr');
    if (curr !== 'BYN' && curr !== 'RUB') return;
    try { window.localStorage.setItem(STORAGE_KEY, curr); } catch (err) {}
    if (activeRate) updateDynamicRubAttributes(activeRate, activeDate);
    applyCurrency(curr);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
