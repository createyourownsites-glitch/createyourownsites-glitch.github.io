import { CATEGORIES, PRODUCTS } from './products.js';

const priceFormat = new Intl.NumberFormat('ru-RU');

/**
 * Чистая функция: возвращает новый массив.
 * sort: 'default' (исходный порядок) | 'price-asc' | 'price-desc'
 */
export function filterAndSort(products, { category = 'all', sort = 'default' } = {}) {
  const list = category === 'all' ? [...products] : products.filter((p) => p.category === category);
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  return list;
}

export function formatPrice(price) {
  return `от ${priceFormat.format(price)} ₽`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** @returns {HTMLLIElement} */
export function createProductCard(p) {
  const li = el('li', 'product-card');
  li.dataset.productId = p.id;
  li.dataset.category = p.category;
  li.dataset.price = String(p.price);

  const img = el('img');
  img.src = p.image;
  img.alt = p.name;
  img.width = 400;
  img.height = 300;
  img.loading = 'lazy';

  const body = el('div', 'product-body');
  body.append(
    el('h3', '', p.name),
    el('p', 'product-meta', p.material),
    el('p', 'product-meta', p.size),
    el('p', 'product-price', formatPrice(p.price)),
  );
  const btn = el('a', 'btn', 'Заказать');
  btn.href = `contacts.html?product=${encodeURIComponent(p.id)}#request`;
  btn.setAttribute('aria-label', `Заказать: ${p.name}`);
  body.append(btn);

  li.append(img, body);
  return li;
}

export function renderProducts(container, items) {
  container.replaceChildren(...items.map(createProductCard));
}

function initFeatured(container) {
  renderProducts(container, PRODUCTS.filter((p) => p.featured).slice(0, 4));
}

function initFullCatalog(container) {
  const filters = document.querySelectorAll('[data-filter]');
  const sortSelect = document.getElementById('sort');
  const empty = document.querySelector('[data-empty]');
  const valid = new Set(['all', ...CATEGORIES.map((c) => c.id)]);

  const fromUrl = new URLSearchParams(location.search).get('cat');
  const state = { category: valid.has(fromUrl) ? fromUrl : 'all', sort: 'default' };

  const render = () => {
    const items = filterAndSort(PRODUCTS, state);
    renderProducts(container, items);
    if (empty) empty.hidden = items.length > 0;
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.category)));
    const url = new URL(location.href);
    if (state.category === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', state.category);
    history.replaceState(null, '', url);
  };

  filters.forEach((b) =>
    b.addEventListener('click', () => {
      state.category = b.dataset.filter;
      render();
    }),
  );
  sortSelect?.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });
  render();
}

export function initCatalog() {
  const container = document.querySelector('[data-products]');
  if (!container) return;
  if (container.dataset.products === 'featured') initFeatured(container);
  else initFullCatalog(container);
}
