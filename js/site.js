// Fast Food Dibra – header, scroll reveal, hero parallax, active nav link
(() => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade sections in as they scroll into view
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('is-in'));
  }

  // Gentle parallax on the hero photo
  const heroImg = document.querySelector('.hero__bg img');
  if (heroImg && !reduce) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) heroImg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    }, { passive: true });
  }

  // Phones: close the slide-out menu after tapping a section link
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  document.querySelectorAll('.nav .nav__link, .nav .btn').forEach(a => a.addEventListener('click', () => {
    if (nav && nav.classList.contains('open')) toggle.click();
  }));

  // Highlight the nav link of the section on screen
  const links = [...document.querySelectorAll('.nav__link[href^="#"]')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }
})();
