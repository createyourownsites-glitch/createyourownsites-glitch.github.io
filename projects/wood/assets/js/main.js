import { initNav } from './nav.js';
import { initCatalog } from './catalog.js';
import { initForms } from './form.js';

initNav();
document.querySelectorAll('[data-year]').forEach((n) => {
  n.textContent = String(new Date().getFullYear());
});
if (document.querySelector('[data-products]')) initCatalog();
if (document.querySelector('form[data-request-form]')) initForms();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.section-head, .workshop-layout, .stats, .cta-block').forEach((element) => {
    element.classList.add('reveal');
    observer.observe(element);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('is-visible');
    });
  });
}
