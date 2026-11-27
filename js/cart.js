// Fast Food Dibra – basket + order by WhatsApp
// Every .dm-item in the menu gets an "add" button. The order is sent as an Albanian WhatsApp message.
// The basket is only emptied after the customer confirms they pressed Send in WhatsApp.
(() => {
  const WHATSAPP_NUMBER = '355695570477';   // 069 557 0477 in international format, no + or spaces
  const KEY = 'dibra-cart';

  const cartEl = document.getElementById('cart');
  const fab = document.querySelector('.cart-fab');
  if (!cartEl || !fab) return;

  const listEl = cartEl.querySelector('.cart__list');
  const emptyEl = cartEl.querySelector('.cart__empty');
  const form = cartEl.querySelector('.cart__form');
  const sumEl = cartEl.querySelector('.cart__sum');
  const errEl = cartEl.querySelector('.cart__error');
  const deliveryBox = cartEl.querySelector('.cart__delivery');
  const gpsBtn = cartEl.querySelector('.cart__gps-btn');
  const gpsStatus = cartEl.querySelector('.cart__gps-status');
  const sentEl = cartEl.querySelector('.cart__sent');
  let sentUrl = null;   // WhatsApp link of the order just opened, while we wait for the customer to confirm
  let gps = null;   // { lat, lng, acc } once the customer shares their location
  const toast = document.querySelector('.cart-toast');

  const isEn = () => document.documentElement.lang === 'en';
  const T = {
    add:     ['Shto në shportë', 'Add to basket'],
    added:   ['u shtua në shportë', 'added to basket'],
    less:    ['Një më pak', 'One less'],
    more:    ['Një më shumë', 'One more'],
    remove:  ['Hiq', 'Remove'],
    needName:['Ju lutem shkruani emrin tuaj.', 'Please write your name.'],
    needAddr:['Ju lutem shkruani adresën ose dërgoni vendndodhjen GPS.', 'Please write your address or share your GPS location.'],
    gpsWait: ['Po gjejmë vendndodhjen tuaj…', 'Finding your location…'],
    gpsOk:   ['✓ Vendndodhja u shtua në porosi', '✓ Location added to your order'],
    gpsAcc:  ['saktësia rreth', 'accuracy about'],
    gpsAgain:['Përditëso vendndodhjen', 'Update my location'],
    gpsDenied:['Nuk dhatë leje për vendndodhjen. Lejoni atë te cilësimet e shfletuesit ose shkruani adresën.', 'Location permission was denied. Allow it in your browser settings or write your address.'],
    gpsFail: ['Vendndodhja nuk u gjet. Provoni përsëri ose shkruani adresën.', 'Could not find your location. Try again or write your address.'],
    gpsNone: ['Ky shfletues nuk e mbështet GPS-in. Ju lutem shkruani adresën.', 'This browser does not support GPS. Please write your address.'],
    empty:   ['Shporta është bosh.', 'Your basket is empty.'],
    thanks:  ['✓ Faleminderit! Restoranti do t\'ju konfirmojë porosinë.', '✓ Thank you! The restaurant will confirm your order.'],
  };
  const t = k => T[k][isEn() ? 1 : 0];
  const money = n => `${n.toLocaleString('de-DE')} L`;

  // Text of an element in a given language (Albanian is in the HTML, English in data-en)
  const textIn = (el, lang) => {
    const c = el.cloneNode(true);
    [c, ...c.querySelectorAll('[data-en]')].forEach(n => {
      if (!n.dataset || !('en' in n.dataset)) return;
      n.textContent = lang === 'en' ? n.dataset.en : (n.dataset.sq ?? n.textContent);
    });
    c.querySelectorAll('.dm-tag').forEach(tag => { tag.textContent = `(${tag.textContent.trim()})`; }); // "Patate (e madhe)"
    return c.textContent.replace(/\s+/g, ' ').trim();
  };

  // ----- Read the menu -----
  const products = {};
  document.querySelectorAll('.dm-item').forEach(item => {
    const h3 = item.querySelector('h3');
    const priceEl = item.querySelector('.dm-price');
    const price = parseInt((priceEl?.textContent || '').replace(/\D/g, ''), 10);
    if (!h3 || !price) return;
    const id = item.dataset.id || (item.dataset.img || '').split('/').pop().replace(/\.\w+$/, '') || h3.textContent.trim();
    products[id] = { id, price, h3 };

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dm-add';
    btn.innerHTML = '<span aria-hidden="true">+</span>';
    btn.dataset.id = id;
    priceEl.after(btn);
    btn.addEventListener('click', e => { e.stopPropagation(); add(id); });
  });
  const nameOf = (p, lang) => textIn(p.h3, lang || (isEn() ? 'en' : 'sq'));

  // ----- State -----
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  Object.keys(cart).forEach(id => { if (!products[id] || !(cart[id] > 0)) delete cart[id]; });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const lines = () => Object.entries(cart).map(([id, qty]) => ({ p: products[id], qty }));
  const count = () => lines().reduce((s, l) => s + l.qty, 0);
  const total = () => lines().reduce((s, l) => s + l.qty * l.p.price, 0);

  function add(id) {
    cart[id] = (cart[id] || 0) + 1;
    save(); render();
    fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    showToast(`${nameOf(products[id])} ${t('added')}`);
  }
  function setQty(id, qty) {
    if (qty > 0) cart[id] = qty; else delete cart[id];
    save(); render();
  }

  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 1800);
  }

  // ----- Render -----
  function render() {
    const n = count();
    fab.hidden = n === 0 && cartEl.hidden;
    fab.querySelector('.cart-fab__count').textContent = n;
    fab.querySelector('.cart-fab__total').textContent = n ? money(total()) : '';
    document.querySelectorAll('.dm-add').forEach(b => {
      b.setAttribute('aria-label', `${t('add')}: ${nameOf(products[b.dataset.id])}`);
      b.classList.toggle('in-cart', !!cart[b.dataset.id]);
    });

    const waiting = !!sentUrl && n > 0;
    if (sentEl) sentEl.hidden = !waiting;
    listEl.hidden = waiting;
    emptyEl.hidden = n > 0;
    form.hidden = n === 0 || waiting;
    sumEl.textContent = money(total());
    listEl.innerHTML = '';
    lines().forEach(({ p, qty }) => {
      const li = document.createElement('li');
      li.className = 'cart__line';
      li.innerHTML = `
        <div class="cart__info"><span class="cart__name"></span><span class="cart__price"></span></div>
        <div class="cart__qty">
          <button type="button" data-act="minus">−</button>
          <span>${qty}</span>
          <button type="button" data-act="plus">+</button>
        </div>
        <button type="button" class="cart__remove" data-act="remove">✕</button>`;
      li.querySelector('.cart__name').textContent = nameOf(p);
      li.querySelector('.cart__price').textContent = money(p.price * qty);
      li.querySelector('[data-act="minus"]').setAttribute('aria-label', t('less'));
      li.querySelector('[data-act="plus"]').setAttribute('aria-label', t('more'));
      li.querySelector('[data-act="remove"]').setAttribute('aria-label', t('remove'));
      li.addEventListener('click', e => {
        const act = e.target.closest('button')?.dataset.act;
        if (act === 'minus') setQty(p.id, qty - 1);
        if (act === 'plus') setQty(p.id, qty + 1);
        if (act === 'remove') setQty(p.id, 0);
      });
      listEl.append(li);
    });
  }

  // ----- Open / close -----
  let lastFocus;
  function open() {
    lastFocus = document.activeElement;
    cartEl.hidden = false;
    document.body.classList.add('cart-open');
    requestAnimationFrame(() => cartEl.classList.add('is-open'));
    cartEl.querySelector('.cart__close').focus();
  }
  function close() {
    sentUrl = null;   // reopening the basket shows the order form again
    cartEl.classList.remove('is-open');
    document.body.classList.remove('cart-open');
    setTimeout(() => { cartEl.hidden = true; render(); }, 250);
    lastFocus?.focus?.();
  }
  fab.addEventListener('click', open);
  cartEl.querySelectorAll('[data-cart-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !cartEl.hidden) close(); });

  // Pick-up / delivery
  form.addEventListener('change', e => {
    if (e.target.name === 'mode') deliveryBox.hidden = e.target.value !== 'delivery';
  });

  // ----- GPS location -----
  const showGps = () => {
    if (!gps) return;
    gpsStatus.textContent = `${t('gpsOk')} (${t('gpsAcc')} ${Math.round(gps.acc)} m)`;
    gpsStatus.className = 'cart__gps-status is-ok';
    gpsBtn.querySelector('.cart__gps-label').textContent = t('gpsAgain');
  };
  gpsBtn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      gpsStatus.textContent = t('gpsNone'); gpsStatus.className = 'cart__gps-status is-err'; return;
    }
    gpsBtn.disabled = true;
    gpsStatus.textContent = t('gpsWait'); gpsStatus.className = 'cart__gps-status';
    navigator.geolocation.getCurrentPosition(pos => {
      gpsBtn.disabled = false;
      gps = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
      errEl.hidden = true;
      showGps();
    }, err => {
      gpsBtn.disabled = false;
      gpsStatus.textContent = err.code === 1 ? t('gpsDenied') : t('gpsFail');
      gpsStatus.className = 'cart__gps-status is-err';
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
  document.addEventListener('langchange', showGps);

  // ----- Send to WhatsApp (always in Albanian) -----
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const mode = data.get('mode');
    const address = (data.get('address') || '').trim();
    const notes = (data.get('notes') || '').trim();

    let error = '';
    if (!count()) error = t('empty');
    else if (!name) error = t('needName');
    else if (mode === 'delivery' && !address && !gps) error = t('needAddr');
    errEl.hidden = !error;
    errEl.textContent = error;
    if (error) { form.querySelector(!name ? '[name="name"]' : '[name="address"]')?.focus(); return; }

    const msg = [
      'Përshëndetje Fast Food Dibra! 👋',
      'Dëshiroj të bëj një porosi:',
      '',
      ...lines().map(({ p, qty }) => `• ${qty} × ${nameOf(p, 'sq')} – ${money(p.price * qty)}`),
      '',
      `*Totali: ${money(total())}*`,
      '',
      `Mënyra: ${mode === 'delivery' ? 'Dërgesë në adresë' : 'Marr me vete'}`,
      mode === 'delivery' && address ? `Adresa: ${address}` : null,
      mode === 'delivery' && gps ? `📍 Vendndodhja (GPS): https://maps.google.com/?q=${gps.lat.toFixed(6)},${gps.lng.toFixed(6)}` : null,
      `Emri: ${name}`,
      notes ? `Shënime: ${notes}` : null,
      '',
      'Faleminderit!',
    ].filter(l => l !== null).join('\n');

    sentUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(sentUrl, '_blank', 'noopener');
    render();                                   // shows "Did you press Send?"
    sentEl?.querySelector('.cart__sent-yes')?.focus();
  });

  // ----- After WhatsApp opened -----
  function finish() {
    cart = {};
    save();
    form.reset();
    deliveryBox.hidden = true;
    gps = null;
    gpsStatus.textContent = '';
    gpsStatus.className = 'cart__gps-status';
    gpsBtn.querySelector('.cart__gps-label').textContent = isEn() ? 'Share my location (GPS)' : 'Dërgo vendndodhjen time (GPS)';
    errEl.hidden = true;
    close();
    showToast(t('thanks'));
  }
  sentEl?.querySelector('.cart__sent-yes')?.addEventListener('click', finish);
  sentEl?.querySelector('.cart__sent-again')?.addEventListener('click', () => {
    if (sentUrl) window.open(sentUrl, '_blank', 'noopener');
  });
  sentEl?.querySelector('.cart__sent-edit')?.addEventListener('click', () => { sentUrl = null; render(); });

  document.addEventListener('langchange', render);
  render();
})();
