(function () {
  'use strict';

  /* ===== Данные ===== */
  const PACKS = [
    { id: 0, name: 'Тёплый контур', rate: 42000 },
    { id: 1, name: 'Предчистовая', rate: 54000 },
    { id: 2, name: 'Под ключ', rate: 68000 }
  ];

  const OPTIONS = {
    foundation: { label: 'Фундамент на сваях', price: 280000 },
    terrace: { label: 'Терраса 15 м²', price: 240000 },
    sauna: { label: 'Сауна', price: 390000 },
    delivery: { label: 'Доставка до 150 км', price: 120000 }
  };

  const AREA_MIN = 25, AREA_MAX = 200, RANGE_SPREAD = 0.10, ROUND_STEP = 10000;

  // Точка подключения бэкенда: URL приёма заявок. null — имитация отправки.
  const LEAD_ENDPOINT = null;

  const PROJECTS = [
    { id: 'mini', name: 'Мини', area: 28, bedrooms: 1, bathrooms: 1, modules: 1, priceFrom: 1180000 },
    { id: 'skandi', name: 'Сканди', area: 45, bedrooms: 1, bathrooms: 1, modules: 2, priceFrom: 1890000 },
    { id: 'duet', name: 'Дуэт', area: 58, bedrooms: 2, bathrooms: 1, modules: 2, priceFrom: 2440000 },
    { id: 'semeyny', name: 'Семейный', area: 72, bedrooms: 2, bathrooms: 1, modules: 3, priceFrom: 3020000 },
    { id: 'komfort', name: 'Комфорт', area: 86, bedrooms: 3, bathrooms: 1, modules: 3, priceFrom: 3610000 },
    { id: 'lesnoy', name: 'Лесной', area: 98, bedrooms: 3, bathrooms: 2, modules: 4, priceFrom: 4120000 },
    { id: 'prostor', name: 'Простор', area: 120, bedrooms: 4, bathrooms: 2, modules: 4, priceFrom: 5040000 },
    { id: 'rezidenciya', name: 'Резиденция', area: 150, bedrooms: 4, bathrooms: 2, modules: 5, priceFrom: 6300000 }
  ];

  /* ===== Чистое ядро ===== */
  const numberFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const rubFmt = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

  function getCategory(area) {
    if (area < 60) return 'small';
    if (area < 100) return 'medium';
    return 'large';
  }

  function filterProjects(list, filter) {
    if (filter !== 'small' && filter !== 'medium' && filter !== 'large') return list.slice();
    return list.filter(function (p) { return getCategory(p.area) === filter; });
  }

  function plural(n, forms) {
    const m100 = Math.abs(n) % 100;
    const m10 = m100 % 10;
    if (m100 >= 11 && m100 <= 14) return forms[2];
    if (m10 === 1) return forms[0];
    if (m10 >= 2 && m10 <= 4) return forms[1];
    return forms[2];
  }

  function roundTo(n, step) {
    return Math.round(n / step) * step;
  }

  function calcEstimate(input) {
    const src = input || {};
    let area = Number(src.area);
    if (Number.isNaN(area)) area = AREA_MIN;
    area = Math.min(AREA_MAX, Math.max(AREA_MIN, area));

    let pack = Number(src.pack);
    if (!PACKS[pack]) pack = 0;

    const keys = [];
    (Array.isArray(src.options) ? src.options : []).forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(OPTIONS, k) && keys.indexOf(k) === -1) keys.push(k);
    });

    const base = area * PACKS[pack].rate;
    const extras = keys.reduce(function (sum, k) { return sum + OPTIONS[k].price; }, 0);
    const total = base + extras;
    return {
      area: area,
      pack: pack,
      base: base,
      extras: extras,
      total: total,
      min: roundTo(total * (1 - RANGE_SPREAD), ROUND_STEP),
      max: roundTo(total * (1 + RANGE_SPREAD), ROUND_STEP),
      perM2: Math.round(total / area)
    };
  }

  function formatNumber(n) { return numberFmt.format(n); }
  function formatRub(n) { return rubFmt.format(n); }
  function formatRange(min, max) { return 'от ' + formatNumber(min) + ' до ' + formatRub(max); }

  function phoneDigits(value) {
    let d = String(value == null ? '' : value).replace(/\D/g, '');
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    else if (d[0] !== '7') d = '7' + d;
    return d.slice(0, 11);
  }

  function formatPhone(digits) {
    const d = String(digits || '');
    if (!d) return '';
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length > 4) out += ') ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }

  function isPhoneComplete(value) {
    return phoneDigits(value).length === 11;
  }

  function validateLead(data) {
    const src = data || {};
    const errors = {};
    const name = typeof src.name === 'string' ? src.name.trim() : '';
    if (name.length < 2 || name.length > 60) errors.name = 'Укажите имя';
    if (!isPhoneComplete(src.phone)) errors.phone = 'Введите номер полностью';
    if (src.consent !== true) errors.consent = 'Нужно согласие на обработку данных';
    return { valid: Object.keys(errors).length === 0, errors: errors };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function houseSvg(modules) {
    const n = Math.max(1, Math.floor(modules) || 1);
    const bottom = Math.min(n, 3);
    const top = Math.max(0, n - 3);
    const h = 52, slab = 6, groundY = 150;
    const w = Math.min(110, 260 / bottom);
    const x0 = (320 - bottom * w) / 2;
    const bottomY = groundY - h;          // верх нижнего ряда
    const topY = bottomY - slab - h;      // верх верхнего ряда
    const parts = [];

    function row(count, y, withDoor) {
      parts.push('<rect x="' + x0 + '" y="' + (y - slab) + '" width="' + count * w + '" height="' + slab + '" fill="var(--ink)"/>');
      for (let i = 0; i < count; i++) {
        const x = x0 + i * w;
        parts.push('<rect data-module x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (i % 2 === 0 ? 'var(--graphite)' : 'var(--wood)') + '"/>');
        parts.push('<rect x="' + (x + w * 0.5) + '" y="' + (y + h * 0.2) + '" width="' + w * 0.4 + '" height="' + h * 0.45 + '" fill="var(--glass)"/>');
        if (withDoor && i === 0) {
          parts.push('<rect x="' + (x + w * 0.12) + '" y="' + (y + h - 36) + '" width="' + w * 0.2 + '" height="36" fill="var(--wood-dark)"/>');
        }
      }
    }

    row(bottom, bottomY, true);
    if (top > 0) row(top, topY, false);

    const label = 'Схема дома: ' + n + ' ' + plural(n, ['модуль', 'модуля', 'модулей']);
    return '<svg class="project__svg" viewBox="0 0 320 200" role="img" aria-label="' + label + '" preserveAspectRatio="xMidYMax meet">' +
      '<path d="M0 160 Q80 135 160 150 T320 145 V200 H0Z" fill="var(--hill)"/>' +
      parts.join('') +
      '<rect x="' + (x0 - 10) + '" y="' + groundY + '" width="' + (bottom * w + 20) + '" height="8" fill="var(--ink)" opacity=".85"/>' +
      '</svg>';
  }

  function projectCardHtml(p) {
    const name = escapeHtml(p.name);
    return '<article class="project" data-category="' + getCategory(p.area) + '" data-id="' + escapeHtml(p.id) + '">' +
      '<div class="project__media"><img class="project__image" src="assets/' + escapeHtml(p.id) +
      '.webp" alt="Визуализация проекта «' + name + '»" width="960" height="600" loading="lazy" decoding="async"></div>' +
      '<span class="project__tag">' + p.modules + ' ' + plural(p.modules, ['модуль', 'модуля', 'модулей']) + '</span>' +
      '<div class="project__body">' +
      '<h3 class="project__title">«' + name + '»</h3>' +
      '<ul class="project__meta">' +
      '<li><b>' + p.area + '</b> м²</li>' +
      '<li>' + p.bedrooms + ' ' + plural(p.bedrooms, ['спальня', 'спальни', 'спален']) + '</li>' +
      '<li>' + p.bathrooms + ' ' + plural(p.bathrooms, ['санузел', 'санузла', 'санузлов']) + '</li>' +
      '</ul>' +
      '<div class="project__foot">' +
      '<p class="project__price">от ' + formatRub(p.priceFrom) + '</p>' +
      '<a href="#contacts" class="btn btn--ghost btn--sm project__cta" data-project="' + name + '">Обсудить проект</a>' +
      '</div></div></article>';
  }

  function leadSummaryFromCalc(est, optionKeys) {
    const extras = (optionKeys || [])
      .filter(function (k) { return Object.prototype.hasOwnProperty.call(OPTIONS, k); })
      .map(function (k) { return OPTIONS[k].label; });
    const parts = [est.area + ' м²', PACKS[est.pack].name].concat(extras.length ? ['+ ' + extras.join(', ')] : []);
    return 'Расчёт: ' + parts.join(', ') + '. Ориентир: ' + formatRange(est.min, est.max);
  }

  /* ===== DOM-инициализация ===== */
  function initNav() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!burger || !nav) return;
    const header = document.querySelector('.header');

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    }
    function isOpen() { return nav.classList.contains('is-open'); }

    burger.addEventListener('click', function () { setOpen(!isOpen()); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        burger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && header && !header.contains(e.target)) setOpen(false);
    });
    if (window.matchMedia) {
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
        if (e.matches) setOpen(false);
      });
    }
  }

  function initProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const filters = document.querySelector('.filters');
    const message = document.getElementById('message');

    grid.innerHTML = PROJECTS.map(projectCardHtml).join('');

    if (filters) {
      filters.addEventListener('click', function (e) {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        const filter = chip.dataset.filter;
        let visible = 0;
        grid.querySelectorAll('.project').forEach(function (card) {
          const show = filter === 'all' || card.dataset.category === filter;
          card.hidden = !show;
          if (show) visible++;
        });
        filters.querySelectorAll('.chip').forEach(function (c) {
          const active = c === chip;
          c.classList.toggle('is-active', active);
          c.setAttribute('aria-pressed', String(active));
        });
        let empty = grid.querySelector('.projects__empty');
        if (visible === 0) {
          if (!empty) {
            empty = document.createElement('p');
            empty.className = 'projects__empty';
            empty.textContent = 'Нет проектов в этой категории';
            grid.appendChild(empty);
          }
        } else if (empty) {
          empty.remove();
        }
      });
    }

    grid.addEventListener('click', function (e) {
      const cta = e.target.closest('.project__cta');
      if (cta && message && !message.value.trim()) {
        message.value = 'Интересует проект «' + cta.dataset.project + '»';
      }
    });
  }

  function initCalc() {
    const form = document.getElementById('calcForm');
    if (!form) return;
    const area = document.getElementById('area');
    const areaOut = document.getElementById('areaOut');
    const total = document.getElementById('calcTotal');
    const sub = document.getElementById('calcSub');
    const cta = document.getElementById('calcCta');
    const message = document.getElementById('message');

    function read() {
      const packEl = form.querySelector('[name=pack]:checked');
      return {
        area: +area.value,
        pack: packEl ? packEl.value : 0,
        options: Array.prototype.map.call(form.querySelectorAll('[name=opt]:checked'), function (el) { return el.value; })
      };
    }

    function update() {
      const input = read();
      const est = calcEstimate(input);
      areaOut.textContent = est.area;
      total.textContent = formatRange(est.min, est.max);
      sub.textContent = '≈ ' + formatNumber(est.perM2) + ' ₽/м² · ' + PACKS[est.pack].name + ' · ' + est.area + ' м²';
      return { est: est, options: input.options };
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    if (cta) {
      cta.addEventListener('click', function () {
        if (message && !message.value.trim()) {
          const r = update();
          message.value = leadSummaryFromCalc(r.est, r.options);
        }
      });
    }
    update();
  }

  function initPhoneMask(input) {
    if (!input) return;
    let prev = '';

    input.addEventListener('focus', function () {
      if (!input.value) {
        input.value = '+7 ';
        prev = '7';
      }
      const end = input.value.length;
      setTimeout(function () { input.setSelectionRange(end, end); }, 0);
    });

    input.addEventListener('input', function (e) {
      const deleting = typeof e.inputType === 'string' && e.inputType.indexOf('delete') === 0;
      let raw = input.value.replace(/\D/g, '');
      // первая 7 — от маски; если за ней идёт введённая 7/8 (8…, +7…, 7…), маскину 7 отбрасываем
      if (!deleting && (prev === '' || prev === '7') && raw.length >= 2 && raw[0] === '7' && (raw[1] === '7' || raw[1] === '8')) {
        raw = raw.slice(1);
      }
      let d = phoneDigits(raw);
      if (deleting && d === prev) d = d.slice(0, -1);
      if (deleting && d === '7') d = '';
      input.value = formatPhone(d);
      prev = d;
    });

    input.addEventListener('blur', function () {
      if (phoneDigits(input.value).length <= 1) {
        input.value = '';
        prev = '';
      }
    });
  }

  async function sendLead(data) {
    if (LEAD_ENDPOINT) {
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return;
    }
    return new Promise(function (resolve) { setTimeout(resolve, 800); });
  }

  function initLeadForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    const success = document.getElementById('formSuccess');
    const error = document.getElementById('formError');
    const btn = form.querySelector('button[type=submit]');
    const consentLabel = form.querySelector('.consent');
    const nameEl = form.elements.name;
    const phoneEl = form.elements.phone;
    const consentEl = form.elements.consent;
    let submitted = false;

    function collect() {
      return {
        name: nameEl.value,
        phone: phoneEl.value,
        message: form.elements.message.value,
        consent: consentEl.checked
      };
    }

    function setInvalid(input, bad) {
      input.closest('.field').classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', String(bad));
    }

    // only: список ключей, которые нужно обновить (по умолчанию все)
    function showErrors(errors, only) {
      const keys = only || ['name', 'phone', 'consent'];
      keys.forEach(function (k) {
        const bad = Boolean(errors[k]);
        if (k === 'name') setInvalid(nameEl, bad);
        else if (k === 'phone') setInvalid(phoneEl, bad);
        else if (k === 'consent') {
          consentLabel.classList.toggle('is-invalid', bad);
          consentEl.setAttribute('aria-invalid', String(bad));
        }
      });
    }

    function isShownInvalid(k) {
      if (k === 'name') return nameEl.closest('.field').classList.contains('is-invalid');
      if (k === 'phone') return phoneEl.closest('.field').classList.contains('is-invalid');
      return consentLabel.classList.contains('is-invalid');
    }

    function recheck(only) {
      const res = validateLead(collect());
      if (submitted) showErrors(res.errors);
      else showErrors(res.errors, only.filter(isShownInvalid));
    }

    function keyOf(el) { return el === consentEl ? 'consent' : el.name; }

    form.addEventListener('input', function (e) {
      if (success) success.hidden = true;
      if (keyOf(e.target) in { name: 1, phone: 1, consent: 1 }) recheck([keyOf(e.target)]);
    });
    form.addEventListener('change', function (e) {
      if (keyOf(e.target) in { name: 1, phone: 1, consent: 1 }) recheck([keyOf(e.target)]);
    });
    form.addEventListener('focusout', function (e) {
      if (keyOf(e.target) in { name: 1, phone: 1 }) recheck([keyOf(e.target)]);
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      submitted = true;
      const data = collect();
      const res = validateLead(data);
      showErrors(res.errors);
      if (!res.valid) {
        if (res.errors.name) nameEl.focus();
        else if (res.errors.phone) phoneEl.focus();
        else consentEl.focus();
        return;
      }
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      if (error) error.hidden = true;
      try {
        await sendLead(data);
        form.reset();
        submitted = false;
        showErrors({});
        if (success) success.hidden = false;
      } catch (err) {
        if (error) error.hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ===== Экспорт и запуск ===== */
  const api = {
    PACKS, OPTIONS, PROJECTS, AREA_MIN, AREA_MAX,
    getCategory, filterProjects, plural, roundTo, calcEstimate,
    formatNumber, formatRub, formatRange,
    phoneDigits, formatPhone, isPhoneComplete, validateLead,
    houseSvg, projectCardHtml, escapeHtml, leadSummaryFromCalc
  };
  if (typeof module === 'object' && module.exports) module.exports = api;

  if (typeof document !== 'undefined') {
    initNav();
    initProjects();
    initCalc();
    initPhoneMask(document.getElementById('phone'));
    initLeadForm();
    initYear();
  }
})();
