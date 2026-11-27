// Fast Food Dibra – Albanian (default) / English switch
// Albanian is written in the HTML. English lives in data-en (text) and data-en-<attr> (alt, aria-label, title, content).
(() => {
  const KEY = 'dibra-lang';
  const ATTRS = ['alt', 'aria-label', 'title', 'content', 'placeholder'];

  const apply = lang => {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(el => {
      if (!('sq' in el.dataset)) el.dataset.sq = el.textContent;     // remember the Albanian once
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.sq;
    });

    ATTRS.forEach(attr => {
      document.querySelectorAll(`[data-en-${attr}]`).forEach(el => {
        const keep = `data-sq-${attr}`;
        if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(attr) || '');
        el.setAttribute(attr, lang === 'en' ? el.getAttribute(`data-en-${attr}`) : el.getAttribute(keep));
      });
    });

    document.querySelectorAll('.lang [data-lang]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

    try { localStorage.setItem(KEY, lang); } catch (e) { /* private mode: just don't remember */ }
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  };

  // Albanian first. English only if the visitor chose it before, or the link says ?lang=en
  let lang = 'sq';
  try { if (localStorage.getItem(KEY) === 'en') lang = 'en'; } catch (e) {}
  const param = new URLSearchParams(location.search).get('lang');
  if (param === 'en' || param === 'sq') lang = param;
  if (lang !== 'sq') apply(lang);

  document.querySelectorAll('.lang [data-lang]').forEach(b =>
    b.addEventListener('click', () => apply(b.dataset.lang)));
})();
