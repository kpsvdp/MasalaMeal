
let FILTER_VEG = 'all'; // 'all' | 'veg' | 'nonveg'
let MAX_SPICE = 3; // 0..3

async function fetchMenu() {
  // Try API, fall back to static JSON
  try {
    const r = await fetch('menu.json');
    if (r.ok) return await r.json();
    throw new Error('api failed');
  } catch {
    const r2 = await fetch('menu.json');
    return await r2.json();
  }
}

function spiceIcons(n){
  const c = '🌶️';
  return c.repeat(n);
}

function fromPrice(m){
  if (m.sizes) {
    const min = Math.min(...Object.values(m.sizes));
    return `from ${MENU.restaurant.currency}${min.toFixed(2)}`;
  }
  return `${MENU.restaurant.currency}${m.price.toFixed(2)}`;
}


let FILTER_TYPE = 'all'; // all|veg|non

function passesFilter(m){
  if (FILTER_TYPE==='veg') return !!m.veg;
  if (FILTER_TYPE==='non') return m.veg===false;
  return true;
}

let MENU = null;
let CART = []; // {id, size, qty}

const el = (q) => document.querySelector(q);
const els = (q) => [...document.querySelectorAll(q)];
const currencyFmt = (sym, n) => `${sym}${n.toFixed(2)}`;


function loadMenux() {
  // Try backend API first, then fallback to static JSON for GitHub Pages.
  return fetch('menu.json')
    .then(r => {
      if (!r.ok) throw new Error('API not available');
      return r.json();
    })
    .catch(() => fetch('/menu.json').then(r => r.json()));
}




function buildSideNav(categories) {
  const nav = el('#sideNav');
  nav.innerHTML = '';

  // Filter controls
  const controls = document.createElement('div');
  controls.className = 'filters mb-3';
  controls.innerHTML = `
    <button class="toggle" data-veg="all">All</button>
    <button class="toggle" data-veg="veg">Veg</button>
    <button class="toggle" data-veg="nonveg">Non‑veg</button>
    <div class="flex items-center gap-2">
      <span class="text-xs text-stone-500">Max spice</span>
      <input id="spiceRange" type="range" min="0" max="3" value="${MAX_SPICE}" class="slider"/>
      <span id="spiceVal" class="chili">${'🌶️'.repeat(MAX_SPICE)}</span>
    </div>
  `;
  nav.appendChild(controls);

  controls.querySelectorAll('button[data-veg]').forEach(btn=>{
    btn.onclick = () => {
      FILTER_VEG = btn.dataset.veg;
      controls.querySelectorAll('button[data-veg]').forEach(b=>b.classList.remove('bg-stone-900','text-white','border-stone-900'));
      btn.classList.add('bg-stone-900','text-white','border-stone-900');
      renderSections();
    };
  });
  // default highlight
  controls.querySelector('button[data-veg="all"]').classList.add('bg-stone-900','text-white','border-stone-900');

  const spice = controls.querySelector('#spiceRange');
  const sval = controls.querySelector('#spiceVal');
  spice.oninput = () => {
    MAX_SPICE = parseInt(spice.value, 10);
    sval.textContent = '🌶️'.repeat(MAX_SPICE);
    renderSections();
  };

  const entries = Object.entries(categories);
  entries.forEach(([cat, items], i) => {
    const section = document.createElement('section');
    section.id = `cat-${i}`;
    section.innerHTML = `<h3 class="section-title">${cat}${priceRangeFor(items, MENU?.restaurant?.currency || '£')}</h3>`;
    // Compact list: Name • Calories • Price
    const table = document.createElement('div');
    table.className = 'overflow-hidden rounded-2xl border border-stone-200 bg-white';
    const header = document.createElement('div');
    header.className = 'grid grid-cols-[1fr_100px_120px] gap-2 px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-50 border-b border-stone-200';
    header.innerHTML = `<div>Item</div><div class="text-right">Calories</div><div class="text-right">Price</div>`;
    table.appendChild(header);
    items.forEach(m => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[1fr_100px_120px] gap-2 px-4 py-2 text-sm hover:bg-stone-50';
      const cals = (m.calories != null) ? `${m.calories} kcal` : '-';
      const price = displayPrice(m, MENU.restaurant.currency);
      row.innerHTML = `<div class="truncate">${m.name}</div><div class="text-right">${cals}</div><div class="text-right font-medium">${price}</div>`;
      table.appendChild(row);
    });
    section.appendChild(table);

    const list = document.createElement('div');
    list.className = 'grid sm:grid-cols-2 xl:grid-cols-2 gap-4 section-wrap';

    // Apply filters and sort
    let filtered = items.filter(m => {
      if (FILTER_VEG === 'veg' && !m.veg) return false;
      if (FILTER_VEG === 'nonveg' && m.veg) return false;
      if (typeof m.spice === 'number' && m.spice > MAX_SPICE) return false;
      return true;
    }).sort((a,b)=> (b.bestseller?1:0)-(a.bestseller?1:0) || a.name.localeCompare(b.name));

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card';
      const badges = [];
      if (m.bestseller) badges.push('<span class="badge border-amber-300">Bestseller</span>');
      if (m.spice>0) badges.push(`<span class="badge border-red-300">${spiceIcons(m.spice)}</span>`);
      if (m.veg) badges.push('<span class="badge border-green-300">Veg</span>');
      else badges.push('<span class="badge border-stone-300">Non‑veg</span>');
      if (m.gluten_free) badges.push('<span class="badge border-sky-300">GF</span>');

      let priceBlock = '';
      if (m.sizes) {
        const opts = Object.entries(m.sizes).map(([sz, p]) => `<option value="${sz}" ${m.defaultSize===sz?'selected':''}>${sz} — ${MENU.restaurant.currency}${p.toFixed(2)}</option>`).join('');
        priceBlock = `
          <div class="from-price">${fromPrice(m)}</div>
          <label class="text-xs text-stone-600">Choose</label>
          <select class="size-select" data-id="${m.id}">${opts}</select>
        `;
      } else {
        priceBlock = `<div class="price">${MENU.restaurant.currency}${m.price.toFixed(2)}</div>`;
      }

      const allergens = (m.allergens||[]).filter(a=>a!=='none').join(', ');
      const allergenTxt = allergens? `<div class="text-xs text-stone-500 mt-1">Allergens: ${allergens}</div>` : '';

      card.innerHTML = `
        <div class="imgwrap mb-3">${m.image ? `<img src="${m.image}" alt="${m.name}">` : ''}</div>
        <div class="item-head">
          <div class="grow">
            <div class="item-title">${m.name}</div>
            <div class="item-sub">${m.description}</div>
            <div class="mt-2 flex gap-2 flex-wrap">${badges.join('')}</div>
            <div class="mt-2">${priceBlock}</div>
            ${allergenTxt}
            <div class="mt-2 qty">
              <button class="dec" aria-label="Decrease">-</button>
              <span class="q">1</span>
              <button class="inc" aria-label="Increase">+</button>
            </div>
            <button class="add-btn" data-id="${m.id}">Add to Cart</button>
          </div>
        </div>
      `;
      list.appendChild(card);

      const qty = card.querySelector('.q');
      card.querySelector('.inc').onclick = () => qty.textContent = +qty.textContent + 1;
      card.querySelector('.dec').onclick = () => qty.textContent = Math.max(1, +qty.textContent - 1);
      card.querySelector('.add-btn').onclick = () => {
        const sizeSel = card.querySelector('.size-select');
        const size = sizeSel ? sizeSel.value : null;
        addToCart(m.id, size, +qty.textContent);
      };
    });
    section.appendChild(list);
    wrap.appendChild(section);
  });
}


function flatMenu() {
  return Object.values(MENU.categories).flat();
}

function addToCart(id, size, qty) {
  const key = `${id}::${size||''}`;
  const found = CART.find(c => `${c.id}::${c.size||''}` === key);
  if (found) found.qty += qty;
  else CART.push({ id, size, qty });
  saveCart();
  renderCart();
}

function removeFromCart(id, size) {
  const key = `${id}::${size||''}`;
  CART = CART.filter(c => `${c.id}::${c.size||''}` !== key);
  saveCart();
  renderCart();
}

function updateQty(id, size, delta) {
  const key = `${id}::${size||''}`;
  const it = CART.find(c => `${c.id}::${c.size||''}` === key);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart();
  renderCart();
}

function renderCart() {
  const cartEl = el('#cart');
  cartEl.innerHTML = '';
  let subtotal = 0;
  const fm = flatMenu();
  CART.forEach(c => {
    const m = fm.find(x => x.id === c.id);
    if (!m) return;
    const unit = m.sizes ? m.sizes[c.size || m.defaultSize] : m.price;
    const line = unit * c.qty; subtotal += line;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="grow">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">${m.name}${c.size?` • ${c.size}`:''}</div>
              <div class="text-xs text-stone-600">Unit: ${currencyFmt(MENU.restaurant.currency, unit)}</div>
            </div>
            <div class="font-semibold">${currencyFmt(MENU.restaurant.currency, line)}</div>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <button class="dec border border-stone-300 rounded-lg h-7 w-7">-</button>
            <span class="q">${c.qty}</span>
            <button class="inc border border-stone-300 rounded-lg h-7 w-7">+</button>
            <button class="remove ms-auto text-sm text-red-600">Remove</button>
          </div>
        </div>
      </div>
    `;
    row.querySelector('.inc').onclick = () => updateQty(c.id, c.size, +1);
    row.querySelector('.dec').onclick = () => updateQty(c.id, c.size, -1);
    row.querySelector('.remove').onclick = () => removeFromCart(c.id, c.size);
    cartEl.appendChild(row);
  });

  const taxes = +(subtotal * 0.05).toFixed(2);
  const delivery = subtotal >= 25 ? 0 : 2.5;
  const total = +(subtotal + taxes + delivery).toFixed(2);

  el('#summary').innerHTML = `
    <div class="flex justify-between"><span>Subtotal</span><span>${currencyFmt(MENU.restaurant.currency, subtotal)}</span></div>
    <div class="flex justify-between"><span>Taxes</span><span>${currencyFmt(MENU.restaurant.currency, taxes)}</span></div>
    <div class="flex justify-between"><span>Delivery</span><span>${currencyFmt(MENU.restaurant.currency, delivery)}</span></div>
    <div class="flex justify-between font-semibold text-stone-900 border-t pt-2 mt-2"><span>Total</span><span>${currencyFmt(MENU.restaurant.currency, total)}</span></div>
  `;

  el('#cartCount').textContent = CART.reduce((a,b)=>a+b.qty,0);
}

function saveCart(){ localStorage.setItem('MM_CART', JSON.stringify(CART)); }
function loadCart(){ try{ CART = JSON.parse(localStorage.getItem('MM_CART')||'[]'); }catch{ CART = []; } }

function setupSearch() {
  const input = el('#search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const cards = els('#menuSections .card');
    cards.forEach(c => {
      const name = c.querySelector('h4').textContent.toLowerCase();
      c.style.display = name.includes(q) ? '' : 'none';
    });
  });
  // Quick ⌘K focus
  window.addEventListener('keydown', (e)=>{
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k'){
      e.preventDefault(); input.focus();
    }
  });
}

function setupCartButton() {
  el('#cartBtn').onclick = () => {
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
  };
}

window.addEventListener('DOMContentLoaded', async () => {
  MENU = await fetchMenu();
  el('#currency').textContent = `${MENU.restaurant.currency}`;
  el('#year').textContent = new Date().getFullYear();
  buildSideNav(MENU.categories);
  renderSections();
  loadCart();
  renderCart();
  setupSearch();
  setupCartButton();
  // Veg filter buttons
  const fAll = el('#fAll'), fVeg = el('#fVeg'), fNonVeg = el('#fNonVeg');
  if (fAll && fVeg && fNonVeg){
    const apply = (t)=>{ FILTER_TYPE=t; renderSections(); renderCart(); fAll.classList.remove('bg-stone-900','text-white'); fVeg.classList.remove('bg-stone-900','text-white'); fNonVeg.classList.remove('bg-stone-900','text-white'); if(t==='all') fAll.classList.add('bg-stone-900','text-white'); if(t==='veg') fVeg.classList.add('bg-stone-900','text-white'); if(t==='non') fNonVeg.classList.add('bg-stone-900','text-white'); };
    apply('all');
    fAll.onclick=()=>apply('all');
    fVeg.onclick=()=>apply('veg');
    fNonVeg.onclick=()=>apply('non');
  }
});


function priceRangeFor(items, currency) {
  let min = Infinity, max = 0;
  for (const m of items) {
    if (m.sizes) {
      for (const p of Object.values(m.sizes)) {
        if (p < min) min = p;
        if (p > max) max = p;
      }
    } else if (typeof m.price === 'number') {
      if (m.price < min) min = m.price;
      if (m.price > max) max = m.price;
    }
  }
  if (!isFinite(min) || max === 0) return '';
  if (min === max) return ` (£${min.toFixed(2)})`;
  return ` (£${min.toFixed(2)}–£${max.toFixed(2)})`;
}

function minPriceOf(m){
  if (m.sizes) {
    let vals = Object.values(m.sizes);
    return Math.min(...vals);
  }
  return m.price || 0;
}
