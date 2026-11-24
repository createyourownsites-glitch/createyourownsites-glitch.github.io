export const eveningTimes = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];

export function localDate(value = new Date()) {
  return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-');
}

export function lastDate(today = localDate()) {
  const date = new Date(today + 'T12:00:00');
  date.setDate(date.getDate() + 60);
  return localDate(date);
}

export function validateReservation(data, today = localDate()) {
  const errors = {};
  if (String(data.name || '').trim().length < 2) errors.name = 'Укажите имя, минимум 2 символа.';
  const digits = String(data.phone || '').replace(/\D/g, '');
  if (!/^[78]\d{10}$/.test(digits)) errors.phone = 'Введите номер из 11 цифр, начиная с +7 или 8.';
  const date = String(data.date || '');
  const parsed = new Date(date + 'T12:00:00');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || localDate(parsed) !== date || date < today || date > lastDate(today)) {
    errors.date = 'Выберите дату в ближайшие 60 дней.';
  }
  if (!eveningTimes.includes(data.time)) errors.time = 'Выберите время из списка.';
  const guests = Number(data.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) errors.guests = 'Выберите от 1 до 8 гостей.';
  if (data.demo !== true) errors.demo = 'Подтвердите, что это демонстрационная бронь.';
  return errors;
}
