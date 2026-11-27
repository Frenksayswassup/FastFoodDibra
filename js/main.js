// Footer year
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// Old one-page links (index.html#menu, #visit …) now live on their own pages: send visitors there
(() => {
  if (!document.body.classList.contains('page-home')) return;
  const moved = {
    menu: 'menu.html', about: 'rreth-nesh.html', gallery: 'rreth-nesh.html#gallery',
    faq: 'kontakt.html#faq', visit: 'kontakt.html',
  };
  const to = moved[location.hash.slice(1)];
  if (to) location.replace(to);
})();

// Missing images: hide the broken icon, keep the placeholder gradient behind it
document.querySelectorAll('img').forEach(img => {
  const hide = () => { img.style.visibility = 'hidden'; };
  img.addEventListener('error', hide);
  if (img.complete && img.naturalWidth === 0) hide();
});
