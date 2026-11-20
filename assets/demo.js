// Общая пометка для публичных демонстрационных копий проектов.
const style = document.createElement('style');
style.textContent = '.portfolio-demo{position:fixed;z-index:2147483646;bottom:16px;left:16px;right:16px;display:flex;align-items:center;gap:16px;max-width:640px;padding:10px 12px 10px 18px;background:#20251f;color:#fff;border:1px solid #ffffff40;border-radius:8px;box-shadow:0 4px 24px #0002;font:13px/1.5 Arial,sans-serif}.portfolio-demo a{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px;white-space:nowrap}.portfolio-demo button{margin-left:auto;background:transparent;color:#fff;border:1px solid #ffffff70;border-radius:4px;min-width:44px;min-height:44px;cursor:pointer;font:20px Arial}.portfolio-demo a:focus-visible,.portfolio-demo button:focus-visible{outline:3px solid #d9e7b1;outline-offset:3px}@media(max-width:540px){.portfolio-demo{bottom:8px;left:8px;right:8px;gap:10px;font-size:12px;padding-left:12px}.portfolio-demo span{max-width:210px}}';
document.head.append(style);
const banner = document.createElement('aside');
banner.className = 'portfolio-demo';
banner.setAttribute('aria-label', 'Демонстрационная версия');
const note = document.createElement('span');
note.textContent = 'Демонстрационный проект. Заявки не отправляются.';
note.setAttribute('role','status');
const back = document.createElement('a');
back.href = '../../index.html#projects';
back.textContent = 'В портфолио';
const close = document.createElement('button');
close.type = 'button';
close.textContent = '×';
close.setAttribute('aria-label', 'Скрыть пометку демонстрационной версии');
close.addEventListener('click', () => banner.remove());
banner.append(note, back, close);
document.body.append(banner);
document.addEventListener('submit', event => {
  event.preventDefault();
  event.stopImmediatePropagation();
  note.textContent = 'Это демо: данные не отправлены. Для своего сайта напишите createyourownsites@gmail.com.';
  if (!banner.isConnected) document.body.append(banner);
}, true);
