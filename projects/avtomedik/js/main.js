export function normalizePhone(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '8') digits = `7${digits.slice(1)}`;
  if (digits.length !== 11 || digits[0] !== '7') return null;
  return `+${digits}`;
}

export function validateBooking({ name, phone, consent } = {}) {
  const errors = {};
  if (!String(name ?? '').trim()) errors.name = 'Укажите имя';
  if (!String(phone ?? '').trim()) errors.phone = 'Укажите телефон';
  else if (!normalizePhone(phone)) errors.phone = 'Введите телефон в формате +7 XXX XXX-XX-XX';
  if (!consent) errors.consent = 'Нужно согласие на обработку персональных данных';
  return errors;
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

function initBookingForm(form, { endpoint } = {}) {
  const status = form.querySelector('[role="status"]');
  const fields = ['name', 'phone', 'consent'];

  const showStatus = (html, isError = false) => {
    status.innerHTML = html;
    status.classList.toggle('is-error', isError);
  };

  const showErrors = (errors) => {
    for (const f of fields) {
      const input = form.elements[f];
      const msg = document.getElementById(`f-${f}-error`);
      if (errors[f]) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', msg.id);
        msg.textContent = errors[f];
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        msg.textContent = '';
      }
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    const errors = validateBooking(data);
    showErrors(errors);
    if (Object.keys(errors).length) {
      showStatus('Проверьте поля формы.', true);
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    data.phone = normalizePhone(data.phone);

    if (!endpoint) {
      // TODO: подставить реальный телефон
      showStatus('Это демонстрационная форма. Для примера записи позвоните <a href="tel:+70001234567">+7 (000) 123-45-67</a> — контакты для макета.');
      return;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      showStatus('Спасибо! Заявка отправлена, мы скоро свяжемся с вами.');
    } catch {
      showStatus('Не удалось отправить заявку. Пожалуйста, позвоните нам: <a href="tel:+70001234567">+7 (000) 123-45-67</a>.', true);
    }
  });
}

if (typeof document !== 'undefined') {
  initNav();
  const form = document.getElementById('booking-form');
  if (form) initBookingForm(form, { endpoint: form.dataset.endpoint || '' });
}
