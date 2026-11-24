import {eveningTimes, localDate, lastDate, validateReservation} from './reservation.17a883d9cf2a.mjs';

const navigation = document.querySelector('#nav');
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('is-open', expanded);
});
navigation.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  toggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
});

for (const button of document.querySelectorAll('[data-filter]')) {
  button.addEventListener('click', () => {
    for (const item of document.querySelectorAll('[data-group]')) item.hidden = item.dataset.group !== button.dataset.filter;
    for (const tab of document.querySelectorAll('[data-filter]')) tab.setAttribute('aria-pressed', String(tab === button));
    document.querySelector('#menu-status').textContent = `Открыт раздел: ${button.textContent}`;
  });
}

const dialog = document.querySelector('#reservation');
const form = document.querySelector('#reservation-form');
const content = document.querySelector('#reservation-content');
const success = document.querySelector('#reservation-success');
for (const value of eveningTimes) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  form.elements.time.append(option);
}
function dateLimits() {
  form.elements.date.min = localDate();
  form.elements.date.max = lastDate();
}
function clearErrors() {
  for (const name of ['name', 'phone', 'date', 'time', 'guests', 'demo']) {
    document.getElementById(`${name}-error`).textContent = '';
    form.elements[name].removeAttribute('aria-invalid');
  }
}
for (const button of document.querySelectorAll('[data-reserve]')) {
  button.addEventListener('click', () => {
    form.reset();
    clearErrors();
    dateLimits();
    content.hidden = false;
    success.hidden = true;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
}
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('#reservation-done').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); form.reset(); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
form.addEventListener('input', event => {
  const error = document.getElementById(`${event.target.name}-error`);
  if (error) { error.textContent = ''; event.target.removeAttribute('aria-invalid'); }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  clearErrors();
  dateLimits();
  const data = Object.fromEntries(new FormData(form));
  data.demo = form.elements.demo.checked;
  const errors = validateReservation(data);
  for (const [name, message] of Object.entries(errors)) {
    document.getElementById(`${name}-error`).textContent = message;
    form.elements[name].setAttribute('aria-invalid', 'true');
  }
  if (Object.keys(errors).length) { form.elements[Object.keys(errors)[0]].focus(); return; }
  const date = new Date(data.date + 'T12:00:00').toLocaleDateString('ru-RU', {day:'numeric', month:'long'});
  document.querySelector('#reservation-summary').textContent = `Вы выбрали ${date}, ${data.time}. Гостей: ${data.guests}.`;
  form.reset();
  content.hidden = true;
  success.hidden = false;
  success.focus();
});
