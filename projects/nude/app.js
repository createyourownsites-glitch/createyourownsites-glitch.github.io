'use strict';

const serviceData = {
  hair: {
    kicker: 'ФОРМА. ЦВЕТ. ХАРАКТЕР.',
    title: 'Волосы, которые<br>хочется <em>касаться.</em>',
    description: 'Точная форма, живой цвет и бережный уход. Собираем образ, который останется вашим и за пределами салона.',
    caption: 'HAIR AS AN ART',
    alt: 'Мягкие волны на длинных каштановых волосах',
    master: 'Анастасия',
    prices: [['Стрижка и укладка', '60–90 минут', '3 500'], ['Окрашивание', '120–180 минут', '6 500'], ['Восстанавливающий уход', '45–60 минут', '2 800']]
  },
  nails: {
    kicker: 'АККУРАТНОСТЬ В КАЖДОЙ ДЕТАЛИ.',
    title: 'Красота —<br>на <em>кончиках пальцев.</em>',
    description: 'Тонкое покрытие, любимый оттенок и форма, которая подходит именно вам. Маленькая деталь, меняющая настроение.',
    caption: 'BEAUTY IN DETAILS',
    alt: 'Ухоженные руки с нежным розовым маникюром на травертине',
    master: 'Екатерина',
    prices: [['Маникюр с покрытием', '90 минут', '2 900'], ['Педикюр с покрытием', '90–120 минут', '3 900'], ['Уход для рук', '30 минут', '1 200']]
  },
  skin: {
    kicker: 'ПРИКОСНОВЕНИЕ К СЕБЕ.',
    title: 'Выдохните.<br>И просто <em>почувствуйте.</em>',
    description: 'Мягкие прикосновения и индивидуально подобранный уход. Время замедлиться и вернуть коже ощущение комфорта.',
    caption: 'THE ART OF SLOW BEAUTY',
    alt: 'Расслабляющий массаж лица в светлом кабинете',
    master: 'Мария',
    prices: [['Массаж лица', '45 минут', '3 200'], ['Увлажняющий уход', '60 минут', '4 500'], ['Уход для сияния кожи', '75 минут', '5 200']]
  }
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const panels = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('js-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  panels.forEach(panel => observer.observe(panel));
}
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) panels.forEach(panel => panel.classList.add('is-visible'));
});

const tabs = [...document.querySelectorAll('[data-service]')];
let activeService = 'hair';
let imageRequest = 0;
const serviceImage = document.getElementById('service-image');
const servicePanel = document.getElementById('service-panel');
const priceList = document.getElementById('price-list');

async function selectService(id) {
  if (id === activeService) return;
  activeService = id;
  const data = serviceData[id];
  tabs.forEach(tab => {
    const selected = tab.dataset.service === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  servicePanel.setAttribute('aria-labelledby', 'tab-' + id);
  document.getElementById('service-title').innerHTML = data.title;
  document.getElementById('service-kicker').textContent = data.kicker;
  document.getElementById('service-description').textContent = data.description;
  document.getElementById('service-caption').textContent = data.caption;
  priceList.replaceChildren(...data.prices.map(([name, duration, price]) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'price-row';
    row.dataset.book = '';
    row.dataset.bookService = name;
    const text = document.createElement('span');
    text.textContent = name;
    const time = document.createElement('small');
    time.textContent = duration;
    text.append(time);
    const amount = document.createElement('span');
    amount.textContent = 'от ' + price + ' ₽';
    row.append(text, amount);
    return row;
  }));
  const request = ++imageRequest;
  const image = new Image();
  image.src = 'assets/' + id + '.webp';
  try {
    await image.decode();
    if (request !== imageRequest) return;
    serviceImage.src = image.src;
    serviceImage.alt = data.alt;
    if (!reducedMotion.matches) {
      serviceImage.animate([{ opacity: .3, transform: 'scale(1.035)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 500, easing: 'ease-out' });
    }
  } catch {
    if (request === imageRequest) serviceImage.alt = data.alt;
  }
}
tabs.forEach(tab => {
  tab.addEventListener('click', () => selectService(tab.dataset.service));
  tab.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    let next;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    selectService(tabs[next].dataset.service);
  });
});

const booking = document.getElementById('booking');
const menu = document.getElementById('menu');
const form = document.getElementById('booking-form');
const success = document.getElementById('booking-success');
const intro = document.getElementById('booking-intro');
const phone = form.elements.phone;
const dateField = form.elements.date;

function dateValue(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function setDates() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  dateField.min = dateValue(date);
  if (!dateField.value || dateField.value < dateField.min) dateField.value = dateField.min;
  date.setMonth(date.getMonth() + 3);
  dateField.max = dateValue(date);
}
setDates();

document.querySelector('.menu-toggle').addEventListener('click', () => menu.showModal());
document.addEventListener('click', event => {
  const close = event.target.closest('[data-close]');
  if (close) close.closest('dialog').close();
  const book = event.target.closest('[data-book]');
  if (!book) return;
  if (menu.open) menu.close();
  intro.hidden = false;
  form.hidden = false;
  success.hidden = true;
  setDates();
  if (book.dataset.bookService) form.elements.service.value = book.dataset.bookService;
  else if (book.id === 'service-book') form.elements.service.value = serviceData[activeService].prices[0][0];
  else form.elements.service.value = 'Консультация мастера';
  if (book.dataset.master) {
    form.elements.master.value = book.dataset.master;
    const matching = Object.values(serviceData).find(service => service.master === book.dataset.master);
    form.elements.service.value = matching.prices[0][0];
  } else form.elements.master.value = 'Любой мастер';
  booking.showModal();
  booking.scrollTop = 0;
});
menu.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => menu.close()));
for (const dialog of [menu, booking]) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      dialog.close();
    }
  });
}
phone.addEventListener('input', () => phone.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length !== 11 || !['7', '8'].includes(digits[0])) {
    phone.setCustomValidity('Укажите номер из 11 цифр, начиная с +7 или 8.');
    phone.reportValidity();
    return;
  }
  if (form.elements.name.value.trim().length < 2) {
    form.elements.name.setCustomValidity('Укажите имя, минимум 2 символа.');
    form.elements.name.reportValidity();
    return;
  }
  if (!form.reportValidity()) return;
  const name = form.elements.name.value.trim();
  const date = new Date(dateField.value + 'T12:00:00');
  const formatted = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const master = form.elements.master.value === 'Любой мастер' ? 'на ваш выбор' : form.elements.master.value;
  document.getElementById('booking-summary').textContent =
    name + ', вы выбрали «' + form.elements.service.value + '» на ' + formatted + ', ' + form.elements.time.value + '. Мастер — ' + master + '.';
  form.hidden = true;
  intro.hidden = true;
  success.hidden = false;
  booking.scrollTop = 0;
  success.querySelector('button').focus();
});
form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
