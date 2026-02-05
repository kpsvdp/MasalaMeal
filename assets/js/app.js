/* MasalaMeal modern menu (vanilla JS) */

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const state = {
  items: [],
  q: '',
  category: 'All',
  dietary: 'all',
  cart: loadJSON('mm_cart', {}),
  theme: loadJSON('mm_theme', null), // 'day'|'night'
};

init();

async function init(){
  // Theme boot
  const preferred = state.theme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
  setTheme(preferred);

  // UI hooks
  $('#themeToggle').addEventListener('click', () => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'night' ? 'day' : 'night');
  });

  $('#search').addEventListener('input', (e) => {
    state.q = e.target.value.trim();
    render();
  });

  // Keyboard: Ctrl/Cmd+K focuses search
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      $('#search').focus();
    }
    if (e.key === 'Escape') closeModal();
  });

  // Filters
  $('#chipAll').addEventListener('click', () => {state.dietary='all'; render(); highlightChips();});
  $('#chipVeg').addEventListener('click', () => {state.dietary='veg'; render(); highlightChips();});
  $('#chipNonVeg').addEventListener('click', () => {state.dietary='nonveg'; render(); highlightChips();});

  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartClear').addEventListener('click', () => {
    state.cart = {};
    saveJSON('mm_cart', state.cart);
    syncCartUI();
    toast('Cart cleared');
  });

  $('#checkoutBtn').addEventListener('click', () => {
    if (cartCount() === 0){
      toast('Your cart is empty');
      return;
    }
    toast('This is a demo checkout. Wire this to your real payment/delivery flow.');
  });

  // Modal
  $('#modalBackdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modalBackdrop') closeModal();
  });
  $('#modalClose').addEventListener('click', closeModal);

  // Load menu from PHP API (falls back to JSON if PHP not running)
  await loadMenu();

  buildCategories();
  syncCartUI();
  render();
  highlightChips();

  // If background videos missing, quietly pause them (avoid console noise on some hosts)
  safePlay($('#bgVideoDay'));
  safePlay($('#bgVideoNight'));
}

async function loadMenu(){
  const candidates = ['api/menu.php', 'data/menu.json'];
  for (const url of candidates){
    try{
      const res = await fetch(url, {cache:'no-store'});
      if (!res.ok) continue;
      const json = await res.json();
      if (!json?.items?.length) continue;
      state.items = json.items;
      return;
    } catch(_){}
  }
  state.items = [];
}

function buildCategories(){
  const cats = ['All', ...Array.from(new Set(state.items.map(i => i.category))).sort()];
  const nav = $('#catNav');
  nav.innerHTML = '';

  for (const c of cats){
    const b = document.createElement('button');
    b.className = 'cat-btn';
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => {
      state.category = c;
      $$('.cat-btn', nav).forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      render();
    });
    b.setAttribute('aria-pressed', c === 'All' ? 'true' : 'false');
    nav.appendChild(b);
  }
}

function render(){
  const list = $('#grid');
  const empty = $('#emptyState');

  const filtered = state.items
    .filter(i => state.category === 'All' ? true : i.category === state.category)
    .filter(i => state.dietary === 'all' ? true : i.dietary === state.dietary)
    .filter(i => {
      if (!state.q) return true;
      const q = state.q.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.tags||[]).join(' ').toLowerCase().includes(q)
      );
    });

  list.innerHTML = '';

  if (filtered.length === 0){
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const item of filtered){
    list.appendChild(card(item));
  }
}

function card(item){
  const el = document.createElement('article');
  el.className = 'card';

  const img = document.createElement('img');
  img.className = 'card-img';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = item.image;
  img.alt = item.name;
  img.addEventListener('click', () => openModal(item));

  const body = document.createElement('div');
  body.className = 'card-body';

  const top = document.createElement('div');
  top.className = 'row';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.name;

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = gbp(item.price_gbp);

  top.appendChild(title);
  top.appendChild(price);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = item.description;

  const tags = document.createElement('div');
  tags.className = 'tag-row';
  tags.appendChild(tagPill(item.dietary === 'veg' ? 'Veg' : 'Non‑Veg', item.dietary === 'veg' ? 'veg' : 'nonveg'));
  (item.tags||[]).forEach(t => {
    if (t === 'veg' || t === 'nonveg') return;
    if (t === 'bestseller') tags.appendChild(tagPill('Bestseller', 'bestseller'));
    if (t === 'gluten_free') tags.appendChild(tagPill('GF', 'gf'));
    if (t === 'spicy') tags.appendChild(tagPill('Spicy', 'spicy'));
  });

  const actions = document.createElement('div');
  actions.className = 'actions';

  const add = document.createElement('button');
  add.className = 'btn btn-primary';
  add.type = 'button';
  add.textContent = 'Add';
  add.addEventListener('click', () => {
    addToCart(item.id);
    toast(`${item.name} added`);
  });

  const details = document.createElement('button');
  details.className = 'btn btn-ghost';
  details.type = 'button';
  details.textContent = 'Details';
  details.addEventListener('click', () => openModal(item));

  actions.appendChild(details);
  actions.appendChild(add);

  body.appendChild(top);
  body.appendChild(tags);
  body.appendChild(desc);
  body.appendChild(actions);

  el.appendChild(img);
  el.appendChild(body);
  return el;
}

function tagPill(label, cls){
  const s = document.createElement('span');
  s.className = `tag ${cls}`;
  s.textContent = label;
  return s;
}

// Modal
function openModal(item){
  const b = $('#modalBackdrop');
  $('#modalImg').src = item.image;
  $('#modalImg').alt = item.name;
  $('#modalTitle').textContent = item.name;
  $('#modalDesc').textContent = item.description;
  $('#modalPrice').textContent = gbp(item.price_gbp);

  const meta = $('#modalMeta');
  meta.innerHTML = '';
  meta.appendChild(tagPill(item.category, 'cat'));
  meta.appendChild(tagPill(item.dietary === 'veg' ? 'Veg' : 'Non‑Veg', item.dietary === 'veg' ? 'veg' : 'nonveg'));
  (item.tags||[]).forEach(t => {
    if (t === 'bestseller') meta.appendChild(tagPill('Bestseller','bestseller'));
    if (t === 'gluten_free') meta.appendChild(tagPill('GF','gf'));
    if (t === 'spicy') meta.appendChild(tagPill('Spicy','spicy'));
  });

  const add = $('#modalAdd');
  add.onclick = () => {
    addToCart(item.id);
    toast(`${item.name} added`);
  };

  b.hidden = false;
  document.body.classList.add('no-scroll');
  $('#modalClose').focus();
}

function closeModal(){
  const b = $('#modalBackdrop');
  if (b.hidden) return;
  b.hidden = true;
  document.body.classList.remove('no-scroll');
}

// Cart
function addToCart(id){
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveJSON('mm_cart', state.cart);
  syncCartUI();
}

function removeFromCart(id){
  if (!state.cart[id]) return;
  state.cart[id] -= 1;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveJSON('mm_cart', state.cart);
  syncCartUI();
}

function cartCount(){
  return Object.values(state.cart).reduce((a,b) => a + b, 0);
}

function cartTotal(){
  let total = 0;
  for (const [id, qty] of Object.entries(state.cart)){
    const item = state.items.find(i => i.id === id);
    if (!item) continue;
    total += (item.price_gbp || 0) * qty;
  }
  return total;
}

function syncCartUI(){
  $('#cartCount').textContent = String(cartCount());
  $('#cartTotal').textContent = gbp(cartTotal());

  const wrap = $('#cartItems');
  wrap.innerHTML = '';

  const entries = Object.entries(state.cart);
  if (entries.length === 0){
    wrap.innerHTML = '<div class="cart-empty">No items yet. Add something tasty.</div>';
    return;
  }

  for (const [id, qty] of entries){
    const item = state.items.find(i => i.id === id);
    if (!item) continue;

    const row = document.createElement('div');
    row.className = 'cart-row';

    const left = document.createElement('div');
    left.className = 'cart-left';

    const t = document.createElement('div');
    t.className = 'cart-title';
    t.textContent = item.name;

    const s = document.createElement('div');
    s.className = 'cart-sub';
    s.textContent = `${qty} × ${gbp(item.price_gbp)}`;

    left.appendChild(t);
    left.appendChild(s);

    const right = document.createElement('div');
    right.className = 'cart-right';

    const minus = document.createElement('button');
    minus.className = 'step';
    minus.type = 'button';
    minus.textContent = '−';
    minus.addEventListener('click', () => removeFromCart(id));

    const plus = document.createElement('button');
    plus.className = 'step';
    plus.type = 'button';
    plus.textContent = '+';
    plus.addEventListener('click', () => addToCart(id));

    right.appendChild(minus);
    right.appendChild(plus);

    row.appendChild(left);
    row.appendChild(right);
    wrap.appendChild(row);
  }
}

function openCart(){
  $('#cartDrawer').classList.add('open');
  $('#cartBackdrop').hidden = false;
  $('#cartClose').focus();
}

function closeCart(){
  $('#cartDrawer').classList.remove('open');
  $('#cartBackdrop').hidden = true;
}

$('#cartBackdrop').addEventListener('click', closeCart);

// Theme + background video switching
function setTheme(mode){
  document.documentElement.setAttribute('data-theme', mode === 'night' ? 'night' : 'day');
  saveJSON('mm_theme', mode);

  // Swap videos (we keep both in DOM to avoid rebuffer flicker)
  const day = $('#bgVideoDay');
  const night = $('#bgVideoNight');
  if (mode === 'night'){
    day.classList.remove('active');
    night.classList.add('active');
  } else {
    night.classList.remove('active');
    day.classList.add('active');
  }
}

function highlightChips(){
  const map = {all:'#chipAll', veg:'#chipVeg', nonveg:'#chipNonVeg'};
  Object.values(map).forEach(sel => $(sel).setAttribute('aria-pressed','false'));
  $(map[state.dietary]).setAttribute('aria-pressed','true');
}

// Helpers
function gbp(n){
  const v = Number(n || 0);
  return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(v);
}

function loadJSON(key, fallback){
  try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveJSON(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1600);
}

function safePlay(video){
  if (!video) return;
  video.muted = true;
  video.playsInline = true;
  const p = video.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}
