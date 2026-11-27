// Fast Food Dibra – menu tabs + hover background photos
(() => {
  const menu = document.querySelector('.dm');
  if (!menu) return;

  // ----- Tabs -----
  const tabs = [...menu.querySelectorAll('.dm-tab')];
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (step) { e.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length], true); }
    });
  });

  // Open a category from the URL, e.g. menu.html#burgers
  const fromHash = () => {
    const tab = tabs.find(t => t.getAttribute('aria-controls') === location.hash.slice(1));
    if (tab) { select(tab); menu.scrollIntoView(); }
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // ----- Background photo on hover / focus / tap -----
  const layers = [...menu.querySelectorAll('.dm-bg__img')];
  const loaded = {};   // url -> true (ok) / false (missing)
  let front = 0, current = null, active = null;

  const show = url => {
    if (url === current) return;
    current = url;
    const apply = () => {
      if (current !== url) return;            // user already moved on
      front = 1 - front;
      layers[front].style.backgroundImage = url ? `url("${url}")` : '';
      layers[front].classList.toggle('is-on', !!url);
      layers[1 - front].classList.remove('is-on');
    };
    if (!url || loaded[url]) return apply();
    if (loaded[url] === false) { current = null; return; } // photo missing: keep what's shown
    const img = new Image();
    img.onload = () => { loaded[url] = true; apply(); };
    img.onerror = () => { loaded[url] = false; if (current === url) current = null; };
    img.src = url;
  };

  const activate = item => {
    if (active) active.classList.remove('is-active');
    active = item;
    if (item) item.classList.add('is-active');
    show(item ? item.dataset.img : null);
  };

  menu.querySelectorAll('.dm-item').forEach(item => {
    item.addEventListener('mouseenter', () => activate(item));
    item.addEventListener('focus', () => activate(item));
    item.addEventListener('click', () => activate(item)); // phones have no hover
  });
  menu.querySelectorAll('.dm-list').forEach(list =>
    list.addEventListener('mouseleave', () => activate(null)));
})();
