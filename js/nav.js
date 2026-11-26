const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.setAttribute('aria-controls', 'primary-navigation');
  nav.id = 'primary-navigation';

  const closeNav = () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');

    document.querySelectorAll('.nav__item.open').forEach(item => {
      item.classList.remove('open');
      item.querySelector('.nav__link')?.setAttribute('aria-expanded', 'false');
    });
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  document.querySelectorAll('.nav__item--parent').forEach((item, index) => {
    const link = item.querySelector('.nav__link');
    const dropdown = item.querySelector('.dropdown');

    if (!link || !dropdown) return;

    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');
    dropdown.id = `primary-dropdown-${index + 1}`;
    link.setAttribute('aria-controls', dropdown.id);

    link.addEventListener('click', event => {
      if (window.matchMedia('(max-width: 900px)').matches) {
        if (!item.classList.contains('open')) {
          event.preventDefault();
          item.classList.add('open');
          link.setAttribute('aria-expanded', 'true');

          document.querySelectorAll('.nav__item--parent').forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('open');
              otherItem.querySelector('.nav__link')?.setAttribute('aria-expanded', 'false');
            }
          });
        }
      }
    });
  });

  nav.querySelectorAll('a').forEach(link => {
    if (!link.classList.contains('nav__link')) {
      link.addEventListener('click', closeNav);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeNav();
      navToggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !nav.contains(event.target) && !navToggle.contains(event.target)) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 900px)').matches) closeNav();
  });
}