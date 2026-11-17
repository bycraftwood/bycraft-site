/* BYCRAFT: global currency switcher BYN / RUB with RU timezone auto-detect */
(function () {
  'use strict';

  var STORAGE_KEY = 'bc_currency';
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
  }

  function init() {
    applyCurrency(detectCurrency());
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-bc-curr]') : null;
    if (!btn) return;
    var curr = btn.getAttribute('data-bc-curr');
    if (curr !== 'BYN' && curr !== 'RUB') return;
    try { window.localStorage.setItem(STORAGE_KEY, curr); } catch (err) {}
    applyCurrency(curr);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
