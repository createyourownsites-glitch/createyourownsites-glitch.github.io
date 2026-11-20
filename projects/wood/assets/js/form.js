import { FORM_ENDPOINT, CONTACTS } from './config.js';
import { PRODUCTS } from './products.js';

/** '+7XXXXXXXXXX' или null. Принимает 8…, +7…, 7…, а также 10 цифр без кода страны. */
export function normalizePhone(raw) {
  if (typeof raw !== 'string' || /[^\d\s()+\-.]/.test(raw)) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) digits = digits.slice(1);
  else if (digits.length !== 10) return null;
  return `+7${digits}`;
}

const NAME_RE = /^[\p{L}\s-]{2,60}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** @returns {{valid:boolean, errors:Record<string,string>}} */
export function validateForm(data) {
  const errors = {};
  const name = String(data.name ?? '').trim();
  if (!NAME_RE.test(name)) errors.name = 'Введите имя (2–60 букв)';
  if (!normalizePhone(String(data.phone ?? ''))) errors.phone = 'Введите телефон, например +7 900 123-45-67';
  const email = String(data.email ?? '').trim();
  if (email && !EMAIL_RE.test(email)) errors.email = 'Проверьте адрес электронной почты';
  if (data.consent !== true) errors.consent = 'Необходимо согласие на обработку данных';
  return { valid: Object.keys(errors).length === 0, errors };
}

function collect(form) {
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) data[k] = typeof v === 'string' ? v : v.name;
  data.consent = form.elements.consent ? form.elements.consent.checked : true;
  return { fd, data };
}

function showErrors(form, errors) {
  for (const el of form.elements) {
    if (!el.name) continue;
    const box = form.querySelector(`#${el.id}-error`);
    if (!box) continue;
    const msg = errors[el.name];
    box.textContent = msg ?? '';
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }
}

function clearStatus(form) {
  form.querySelectorAll('.form-success, .form-error').forEach((n) => n.remove());
}

function showStatus(form, className, role, text) {
  clearStatus(form);
  const div = document.createElement('div');
  div.className = className;
  div.setAttribute('role', role);
  div.textContent = text;
  form.append(div);
}

async function submit(form) {
  const { fd, data } = collect(form);
  const { valid, errors } = validateForm(data);
  showErrors(form, errors);
  clearStatus(form);
  if (!valid) {
    const first = [...form.elements].find((el) => el.name && errors[el.name]);
    first?.focus();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Отправка…';
  try {
    if (!data.website) {
      const endpoint = window.__FORM_ENDPOINT__ ?? FORM_ENDPOINT;
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        await new Promise((r) => setTimeout(r, 600));
        console.info('[demo] заявка', data);
      }
    }
    form.reset();
    applyProduct(form);
    showStatus(form, 'form-success', 'status', 'Спасибо! Мы перезвоним в течение рабочего дня.');
  } catch {
    showStatus(form, 'form-error', 'alert', `Не удалось отправить заявку. Позвоните нам: ${CONTACTS.phone}`);
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function applyProduct(form) {
  const field = form.elements.product;
  if (!field) return;
  const id = new URLSearchParams(location.search).get('product');
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  field.value = product.name;
  const msg = form.elements.message;
  if (msg && !msg.value) msg.value = `Интересует: ${product.name}`;
}

export function initForms() {
  document.querySelectorAll('form[data-request-form]').forEach((form) => {
    form.noValidate = true;
    applyProduct(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(form);
    });
  });
}
