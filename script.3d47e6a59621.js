const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
function filterProjects(category) {
  let visible = 0;
  for (const project of projects) {
    project.hidden = category !== 'all' && project.dataset.category !== category;
    if (!project.hidden) visible++;
  }
  for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  document.querySelector('.project-grid').dataset.count = String(visible);
  document.getElementById('filter-status').textContent = `Показано проектов: ${visible}`;
}
for (const button of filters) button.addEventListener('click', () => filterProjects(button.dataset.filter));
function revealLinkedProject() {
  const id = location.hash.slice(1);
  const project = projects.find(project => project.id === id);
  if (project) {
    filterProjects('all');
    requestAnimationFrame(() => project.scrollIntoView({block:'start'}));
  }
}
window.addEventListener('hashchange', revealLinkedProject);
revealLinkedProject();
document.getElementById('copy-email').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('createyourownsites@gmail.com');
    status.textContent = 'Адрес скопирован';
  } catch {
    status.textContent = 'Выделите адрес выше и скопируйте его вручную.';
  }
});
