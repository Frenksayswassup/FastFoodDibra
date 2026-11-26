// Footer year
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// Menu page: Food / Drinks tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.menu-panel').forEach(p => p.hidden = p.id !== tab.dataset.panel);
  });
});

// Open the right tab if the URL is menu.html#drinks etc.
const hash = location.hash.slice(1);
const target = hash && document.getElementById(hash);
if (target) {
  const panel = target.closest('.menu-panel') || target;
  document.querySelector(`.tab[data-panel="${panel.id}"]`)?.click();
  target.scrollIntoView();
}

// Missing images: hide the broken icon, keep the placeholder gradient behind it
document.querySelectorAll('img').forEach(img => {
  const hide = () => { img.style.visibility = 'hidden'; };
  img.addEventListener('error', hide);
  if (img.complete && img.naturalWidth === 0) hide();
});