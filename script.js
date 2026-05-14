/* ===== POCKET TOON — MAIN JAVASCRIPT (Supabase Edition) ===== */

// ===================== SUPABASE HELPERS =====================
// db is window.db initialised by supabase-config.js
function getDB() {
  if (!window.db) { console.error('Supabase client not ready'); return null; }
  return window.db;
}

// ===================== CART STATE =====================
// Cart stays in localStorage — it is session-level, not server data.
let cart = JSON.parse(localStorage.getItem('pt_cart') || '[]');

function saveCart() { localStorage.setItem('pt_cart', JSON.stringify(cart)); updateCartCount(); }

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => { el.textContent = total; });
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty += (product.qty || 1);
  else cart.push({ ...product, qty: product.qty || 1 });
  saveCart(); renderCart();
  showToast('Added: ' + product.name, '🛒');
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); renderCart(); }

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id); if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) removeFromCart(id); else { saveCart(); renderCart(); }
}

function formatPrice(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderCart() {
  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-drawer__empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p>Your cart is empty</p></div>`;
    if (footer) footer.style.display = 'none';
  } else {
    body.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__img"><img src="${escHtml(item.img)}" alt="${escHtml(item.name)}" loading="lazy"></div>
        <div>
          <div class="cart-item__name">${escHtml(item.name)}</div>
          <div class="cart-item__vendor">${escHtml(item.vendor || '')}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
          <div class="cart-item__qty">
            <button onclick="updateQty('${escHtml(item.id)}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${escHtml(item.id)}',1)">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart('${escHtml(item.id)}')" title="Remove">×</button>
      </div>`).join('');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (footer) { footer.style.display = ''; document.getElementById('cartSubtotal').textContent = formatPrice(total); }
  }
}

// ===================== UTIL =====================
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===================== MOBILE MENU =====================
function initMobileMenu() {
  const overlay = document.getElementById('menuOverlay');
  const drawer  = document.getElementById('menuDrawer');
  const closeBtn = document.getElementById('menuClose');
  function openMenu()  { overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; }
  document.querySelectorAll('.header__icon--hamburger').forEach(b => b.addEventListener('click', openMenu));
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  document.querySelectorAll('.menu-drawer__submenu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target); if (!target) return;
      const isOpen = target.classList.contains('open');
      document.querySelectorAll('.menu-drawer__sub.open').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.menu-drawer__submenu-btn.open').forEach(b => b.classList.remove('open'));
      if (!isOpen) { target.classList.add('open'); btn.classList.add('open'); }
    });
  });
}

// ===================== SEARCH =====================
function initSearch() {
  const overlay  = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  function openSearch()  { if (overlay) { overlay.classList.add('open'); overlay.querySelector('input')?.focus(); } }
  function closeSearch() { if (overlay) overlay.classList.remove('open'); }
  document.querySelectorAll('.header__icon--search').forEach(b => b.addEventListener('click', openSearch));
  closeBtn?.addEventListener('click', closeSearch);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearch(); closeProductModal(); closeCheckoutModal(); } });
}

// ===================== CART DRAWER =====================
function initCart() {
  const overlay  = document.getElementById('cartOverlay');
  const drawer   = document.getElementById('cartDrawer');
  const closeBtn = document.getElementById('cartClose');
  function openCart()  { overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; renderCart(); }
  function closeCart() { overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; }
  document.querySelectorAll('.header__icon--cart').forEach(b => b.addEventListener('click', openCart));
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
}

// ===================== PRODUCT MODAL =====================
let currentProduct = null;

function openProductModal(product) {
  currentProduct = product;
  const overlay = document.getElementById('productModalOverlay'); if (!overlay) return;
  overlay.classList.add('open'); document.body.style.overflow = 'hidden';
  document.getElementById('pmTitle').textContent   = product.name;
  document.getElementById('pmVendor').textContent  = product.vendor || '';
  document.getElementById('pmPrice').textContent   = formatPrice(product.price);
  document.getElementById('pmDesc').textContent    = product.desc || product.description || 'Authentic imported product. 100% original.';
  document.getElementById('pmMainImg').src         = product.img;
  document.getElementById('pmQtyInput').value      = 1;
  const thumbsEl = document.getElementById('pmThumbs');
  thumbsEl.innerHTML = '';
  const imgs = (product.images && product.images.length) ? product.images : [product.img];
  imgs.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'product-modal__thumb' + (i === 0 ? ' active' : '');
    const img = document.createElement('img'); img.src = src; img.alt = '';
    div.appendChild(img);
    div.addEventListener('click', () => {
      document.getElementById('pmMainImg').src = src;
      thumbsEl.querySelectorAll('.product-modal__thumb').forEach(t => t.classList.remove('active'));
      div.classList.add('active');
    });
    thumbsEl.appendChild(div);
  });
}

function closeProductModal() {
  document.getElementById('productModalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
}

function initProductModal() {
  const overlay = document.getElementById('productModalOverlay'); if (!overlay) return;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeProductModal(); });
  document.getElementById('pmClose')?.addEventListener('click', closeProductModal);
  document.getElementById('pmCloseBtn')?.addEventListener('click', closeProductModal);
  document.getElementById('pmQtyMinus')?.addEventListener('click', () => {
    const i = document.getElementById('pmQtyInput'); i.value = Math.max(1, parseInt(i.value) - 1);
  });
  document.getElementById('pmQtyPlus')?.addEventListener('click', () => {
    const i = document.getElementById('pmQtyInput'); i.value = parseInt(i.value) + 1;
  });
  document.getElementById('pmAddCart')?.addEventListener('click', () => {
    if (!currentProduct) return;
    addToCart({ ...currentProduct, qty: parseInt(document.getElementById('pmQtyInput').value) || 1 });
    closeProductModal();
  });
}

// ===================== MEGA MENU =====================
function initMegaMenu() {
  document.querySelectorAll('details.mega-menu').forEach(details => {
    let timeout;
    details.addEventListener('mouseenter', () => { clearTimeout(timeout); details.open = true; });
    details.addEventListener('mouseleave', () => { timeout = setTimeout(() => { details.open = false; }, 200); });
    details.querySelector('summary')?.addEventListener('click', e => { e.preventDefault(); details.open = !details.open; });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.mega-menu')) document.querySelectorAll('details.mega-menu[open]').forEach(d => d.open = false);
  });
}

// ===================== TOAST =====================
function showToast(msg, icon) {
  const toast = document.getElementById('toast'); if (!toast) return;
  toast.querySelector('.toast__icon').textContent = icon || '✓';
  toast.querySelector('.toast__msg').textContent  = msg;
  toast.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ===================== SCROLL ANIMATIONS =====================
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;
  const legacyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('animate-in'); legacyObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.section-title-row').forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });
  document.querySelectorAll('.hero-banner__subtitle, .hero-banner__title, .hero-banner__desc, .btn-hero').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`; el.classList.add('reveal'); revealObserver.observe(el);
  });
  document.querySelectorAll('.multicolumn-card').forEach((el, i) => {
    el.classList.add('reveal-scale'); el.style.transitionDelay = `${i * 0.1}s`; revealObserver.observe(el);
  });
  document.querySelectorAll('.blog-card').forEach((el, i) => {
    el.classList.add('reveal'); el.style.transitionDelay = `${i * 0.1}s`; revealObserver.observe(el);
  });
  document.querySelectorAll('.footer-brand').forEach(el => { el.classList.add('reveal-left'); revealObserver.observe(el); });
  document.querySelectorAll('.footer-col').forEach((el, i) => {
    el.classList.add('reveal'); el.style.transitionDelay = `${i * 0.08}s`; revealObserver.observe(el);
  });
  document.querySelectorAll('.collection-card, .product-card').forEach(el => {
    el.style.opacity = '0'; legacyObserver.observe(el);
  });
}

// ===================== HERO PARTICLES =====================
function initHeroParticles() {
  const container = document.getElementById('heroParticles'); if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${2+Math.random()*7}px;height:${2+Math.random()*7}px;animation-delay:${Math.random()*7}s;animation-duration:${4+Math.random()*8}s;opacity:${0.1+Math.random()*0.5};`;
    container.appendChild(p);
  }
}

// ===================== SUPABASE — PRODUCTS =====================
const PT_DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Takaratomy Beyblade Burst B-193 Astral Spriggan', vendor: 'TAKARA TOMY', price: 1299, category: 'Burst Gen',        img: 'https://placehold.co/400x400/29abe2/ffffff?text=Burst+Spriggan', images: [], description: 'Authentic Takara Tomy Beyblade Burst.', in_stock: true },
  { id: 'p2', name: 'Monkey D. Luffy Gear 5 — One Piece Figure',       vendor: 'BANPRESTO',   price: 2499, category: 'One Piece',        img: 'https://placehold.co/400x400/e65100/ffffff?text=Luffy',          images: [], description: 'Official Banpresto One Piece figure.',   in_stock: true },
  { id: 'p3', name: 'Tanjiro Kamado Demon Slayer Figure',               vendor: 'BANPRESTO',   price: 1999, category: 'Demon Slayer',    img: 'https://placehold.co/400x400/b71c1c/ffffff?text=Tanjiro',        images: [], description: 'Official Banpresto Demon Slayer figure.', in_stock: true },
  { id: 'p4', name: 'Beyblade X BX-11 Dran Sword 3-60F',               vendor: 'TAKARA TOMY', price:  849, category: 'Beyblade X',      img: 'https://placehold.co/400x400/0d47a1/ffffff?text=Dran+Sword',     images: [], description: 'Latest Beyblade X series.',                in_stock: true },
  { id: 'p5', name: 'Rimuru Tempest Vol.3 TenSura Figure',              vendor: 'BANPRESTO',   price: 2299, category: 'TenSura',         img: 'https://placehold.co/400x400/7b1fa2/ffffff?text=Rimuru',         images: [], description: 'Official Banpresto TenSura figure.',      in_stock: true },
  { id: 'p6', name: 'Anya Forger — SPY x FAMILY Figure',               vendor: 'BANPRESTO',   price: 1799, category: 'Spy x Family',    img: 'https://placehold.co/400x400/e91e63/ffffff?text=Anya',           images: [], description: 'Official Banpresto Spy x Family figure.', in_stock: true },
  { id: 'p7', name: 'Metal Beyblade BB-47 Earth Eagle Original',        vendor: 'TAKARA TOMY', price:  699, category: 'Metal Gen',       img: 'https://placehold.co/400x400/37474f/ffffff?text=Earth+Eagle',   images: [], description: 'Original Takara Tomy Metal Fusion.',       in_stock: false },
  { id: 'p8', name: 'Deku My Hero Academia Battle Figure',              vendor: 'BANPRESTO',   price: 2199, category: 'My Hero Academia',img: 'https://placehold.co/400x400/1565c0/ffffff?text=Deku',           images: [], description: 'Official Banpresto MHA figure.',            in_stock: true  },
];

async function getProducts() {
  const db = getDB();
  if (!db) return normaliseProducts(PT_DEFAULT_PRODUCTS);
  try {
    const { data, error } = await db.from('pt_products').select('*').order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return normaliseProducts(PT_DEFAULT_PRODUCTS);
    return normaliseProducts(data);
  } catch (e) {
    console.warn('Supabase getProducts failed, using defaults:', e);
    return normaliseProducts(PT_DEFAULT_PRODUCTS);
  }
}

// Normalise Supabase snake_case to the camelCase the UI expects
function normaliseProducts(rows) {
  return rows.map(p => ({
    id:          p.id,
    name:        p.name        || '',
    vendor:      p.vendor      || '',
    price:       Number(p.price) || 0,
    category:    p.category    || '',
    img:         p.img         || '',
    images:      Array.isArray(p.images) ? p.images : [],
    desc:        p.description || p.desc || '',
    description: p.description || p.desc || '',
    inStock:     p.in_stock !== undefined ? p.in_stock : p.inStock !== undefined ? p.inStock : true,
  }));
}

// ===================== SUPABASE — CATEGORIES =====================
const PT_DEFAULT_CATEGORIES = [
  { id: 'cat_bey1', name: 'Plastic Gen',      type: 'beyblade', img: 'https://placehold.co/750x750/29abe2/ffffff?text=Plastic+Gen',     caption: 'Classic plastic generation Beyblades' },
  { id: 'cat_bey2', name: 'Metal Gen',        type: 'beyblade', img: 'https://placehold.co/750x750/1565c0/ffffff?text=Metal+Gen',       caption: 'Authentic Takara Tomy Metal Fusion' },
  { id: 'cat_bey3', name: 'Burst Gen',        type: 'beyblade', img: 'https://placehold.co/750x750/0c2461/ffffff?text=Burst+Gen',       caption: 'Authentic Takara Tomy Beyblade Burst' },
  { id: 'cat_bey4', name: 'Beyblade X',       type: 'beyblade', img: 'https://placehold.co/750x750/0d47a1/ffffff?text=Beyblade+X',      caption: 'The most powerful Beyblade X series' },
  { id: 'cat_ani1', name: 'One Piece',        type: 'anime',    img: 'https://placehold.co/750x750/e65100/ffffff?text=One+Piece',        caption: 'Official One Piece figures' },
  { id: 'cat_ani2', name: 'Demon Slayer',     type: 'anime',    img: 'https://placehold.co/750x750/b71c1c/ffffff?text=Demon+Slayer',    caption: 'Official Demon Slayer figures' },
  { id: 'cat_ani3', name: 'Spy x Family',     type: 'anime',    img: 'https://placehold.co/750x750/e91e63/ffffff?text=Spy+x+Family',    caption: 'Official Spy x Family figures' },
  { id: 'cat_ani4', name: 'My Hero Academia', type: 'anime',    img: 'https://placehold.co/750x750/1565c0/ffffff?text=My+Hero',          caption: 'Official My Hero Academia figures' },
  { id: 'cat_ani5', name: 'Tokyo Revengers',  type: 'anime',    img: 'https://placehold.co/750x750/37474f/ffffff?text=Tokyo+Revengers', caption: 'Official Tokyo Revengers figures' },
  { id: 'cat_ani6', name: 'Waifu Figures',    type: 'anime',    img: 'https://placehold.co/750x750/c62828/ffffff?text=Waifu+Figures',   caption: 'Premium waifu anime figures' },
  { id: 'cat_ani8', name: 'TenSura',          type: 'anime',    img: 'https://placehold.co/750x750/7b1fa2/ffffff?text=TenSura',          caption: 'That Time I Got Reincarnated as a Slime' },
];

async function getStorefrontCategories() {
  const db = getDB();
  if (!db) return PT_DEFAULT_CATEGORIES;
  try {
    const { data, error } = await db.from('pt_categories').select('*').order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return PT_DEFAULT_CATEGORIES;
    return data;
  } catch (e) {
    console.warn('Supabase getStorefrontCategories failed:', e);
    return PT_DEFAULT_CATEGORIES;
  }
}

// Build a collection card HTML string
function buildCollectionCard(cat) {
  const img     = cat.img || ('https://placehold.co/750x750/7c3aed/ffffff?text=' + encodeURIComponent(cat.name));
  const caption = cat.caption || ('Shop the ' + cat.name + ' collection');
  const url     = 'products.html?cat=' + encodeURIComponent(cat.name);
  return `
    <li>
      <a href="${url}" class="collection-card glow-card">
        <div class="collection-card__image"><img src="${escHtml(img)}" alt="${escHtml(cat.name)}" loading="lazy"></div>
        <div class="collection-card__info">
          <div class="collection-card__title">${escHtml(cat.name)} <svg class="arrow-icon" fill="none" viewBox="0 0 14 10"><path fill="currentColor" fill-rule="evenodd" d="M8.537.808a.5.5 0 0 1 .817-.162l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L11.793 5.5H1a.5.5 0 0 1 0-1h10.793L8.646 1.354a.5.5 0 0 1-.109-.546" clip-rule="evenodd"/></svg></div>
          <div class="collection-card__caption">${escHtml(caption)}</div>
        </div>
      </a>
    </li>`;
}

async function renderCategoryCollections() {
  const allCats = await getStorefrontCategories();
  const beyCats = allCats.filter(c => c.type === 'beyblade');
  const aniCats = allCats.filter(c => c.type === 'anime');
  const beyList = document.getElementById('beybladeCollectionList');
  const aniList = document.getElementById('animeCollectionList');
  if (beyList) beyList.innerHTML = beyCats.map(buildCollectionCard).join('');
  if (aniList) aniList.innerHTML = aniCats.slice(0, 8).map(buildCollectionCard).join('');
}

// ===================== PRODUCTS GRID =====================
function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId); if (!container) return;
  if (products.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#666">No products found.</div>';
    return;
  }
  container.innerHTML = '';
  products.slice(0, 8).forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-card__media">
        <img src="${escHtml(p.img)}" alt="${escHtml(p.name)}" loading="lazy">
        ${!p.inStock ? '<span class="product-card__badge sold-out">Sold Out</span>' : ''}
      </div>
      <div class="product-card__info">
        <div class="product-card__vendor">${escHtml(p.vendor || '')}</div>
        <div class="product-card__title">${escHtml(p.name)}</div>
        <div class="product-card__price">${formatPrice(p.price)}</div>
        <div class="qty-control">
          <button class="qty-control__btn qty-minus">−</button>
          <input class="qty-control__input" type="number" value="1" min="1">
          <button class="qty-control__btn qty-plus">+</button>
        </div>
        <button class="btn-add-cart" ${!p.inStock ? 'disabled' : ''}>${p.inStock ? 'Add to Cart' : 'Sold Out'}</button>
      </div>`;
    const qtyInput = card.querySelector('.qty-control__input');
    card.querySelector('.qty-minus').addEventListener('click', e => { e.stopPropagation(); qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1); });
    card.querySelector('.qty-plus').addEventListener('click', e => { e.stopPropagation(); qtyInput.value = parseInt(qtyInput.value) + 1; });
    card.querySelector('.btn-add-cart').addEventListener('click', e => {
      e.stopPropagation();
      addToCart({ ...p, qty: parseInt(qtyInput.value) || 1 });
    });
    card.addEventListener('click', () => openProductModal(p));
    container.appendChild(card);
  });
  initScrollAnimations();
}

// ===================== SUPABASE — USERS =====================
async function getUsers() {
  const db = getDB(); if (!db) return [];
  try {
    const { data, error } = await db.from('pt_users').select('*').order('registered', { ascending: false });
    if (error) { console.warn('getUsers error:', error); return []; }
    return (data || []).map(u => ({
      ...u,
      orders:   u.orders   || 0,
      lastOrder: u.last_order,
    }));
  } catch (e) { console.warn('getUsers failed:', e); return []; }
}

async function upsertUser(user) {
  const db = getDB(); if (!db) return;
  try {
    const row = {
      id:         user.id,
      name:       user.name       || '',
      email:      user.email      || '',
      phone:      user.phone      || '',
      address:    user.address    || '',
      password:   user.password   || '',
      orders:     user.orders     || 0,
      last_order: user.lastOrder  || user.last_order || null,
      registered: user.registered || new Date().toISOString(),
    };
    const { error } = await db.from('pt_users').upsert(row, { onConflict: 'id' });
    if (error) console.warn('upsertUser error:', error);
  } catch (e) { console.warn('upsertUser failed:', e); }
}

function getCurrentUser()  { return JSON.parse(sessionStorage.getItem('pt_current_user') || 'null'); }
function setCurrentUser(u) { sessionStorage.setItem('pt_current_user', JSON.stringify(u)); }

// ===================== CHECKOUT / LOGIN MODAL =====================
function switchCheckoutTab(tab) {
  const loginForm = document.getElementById('checkoutLoginForm');
  const regForm   = document.getElementById('checkoutRegisterForm');
  const tabLogin  = document.getElementById('tabLogin');
  const tabReg    = document.getElementById('tabRegister');
  if (!loginForm || !regForm) return;
  if (tab === 'login') {
    loginForm.style.display = ''; regForm.style.display = 'none';
    tabLogin.classList.add('active'); tabReg.classList.remove('active');
  } else {
    loginForm.style.display = 'none'; regForm.style.display = '';
    tabLogin.classList.remove('active'); tabReg.classList.add('active');
  }
}

function renderCheckoutOrderSummary() {
  const el = document.getElementById('checkoutOrderSummary'); if (!el) return;
  if (cart.length === 0) { el.innerHTML = ''; return; }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  el.innerHTML = `
    <div class="checkout-summary-title">🛍️ Order Summary (${cart.length} item${cart.length !== 1 ? 's' : ''})</div>
    ${cart.map(i => `
      <div class="checkout-summary-item">
        <img src="${escHtml(i.img)}" alt="${escHtml(i.name)}">
        <div class="checkout-summary-info">
          <div class="checkout-summary-name">${escHtml(i.name)}</div>
          <div class="checkout-summary-qty">Qty: ${i.qty}</div>
        </div>
        <div class="checkout-summary-price">${formatPrice(i.price * i.qty)}</div>
      </div>`).join('')}
    <div class="checkout-summary-total"><span>Total</span><strong>${formatPrice(total)}</strong></div>`;
}

function openCheckoutModal() {
  const overlay = document.getElementById('checkoutModalOverlay'); if (!overlay) return;
  const currentUser = getCurrentUser();
  if (currentUser) {
    const n = document.getElementById('regName');    if (n) n.value = currentUser.name    || '';
    const e = document.getElementById('regEmail');   if (e) e.value = currentUser.email   || '';
    const p = document.getElementById('regPhone');   if (p) p.value = currentUser.phone   || '';
    const a = document.getElementById('regAddress'); if (a) a.value = currentUser.address || '';
    const sb = document.getElementById('registerSubmitBtn'); if (sb) sb.textContent = '🎉 Place Order';
    switchCheckoutTab('register');
  } else {
    switchCheckoutTab('login');
  }
  renderCheckoutOrderSummary();
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.body.style.overflow = 'hidden';
  overlay.classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

async function handleLogin() {
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) { showToast('Please enter email and password.', '⚠️'); return; }
  const db = getDB();
  let user = null;
  if (db) {
    try {
      const { data } = await db.from('pt_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password', password)
        .maybeSingle();
      user = data;
    } catch (e) { console.warn('Login query failed:', e); }
  }
  if (!user) { showToast('Invalid email or password.', '❌'); return; }
  setCurrentUser(user);
  showToast('Welcome back, ' + user.name + '!', '👋');
  const n = document.getElementById('regName');    if (n) n.value = user.name    || '';
  const e = document.getElementById('regEmail');   if (e) e.value = user.email   || '';
  const p = document.getElementById('regPhone');   if (p) p.value = user.phone   || '';
  const a = document.getElementById('regAddress'); if (a) a.value = user.address || '';
  const sb = document.getElementById('registerSubmitBtn'); if (sb) sb.textContent = '🎉 Place Order';
  switchCheckoutTab('register');
}

async function handleRegisterAndOrder() {
  const name     = document.getElementById('regName')?.value.trim();
  const email    = document.getElementById('regEmail')?.value.trim();
  const phone    = document.getElementById('regPhone')?.value.trim();
  const address  = document.getElementById('regAddress')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  if (!name || !email || !phone || !address) { showToast('Please fill all required fields.', '⚠️'); return; }
  if (password && password.length < 6)        { showToast('Password must be at least 6 characters.', '⚠️'); return; }

  const db = getDB();
  let user;
  const now = new Date().toISOString();

  if (db) {
    try {
      const { data: existing } = await db.from('pt_users').select('*').eq('email', email.toLowerCase()).maybeSingle();
      if (existing) {
        const updated = {
          ...existing,
          name,
          phone,
          address,
          password:   password || existing.password,
          orders:     (existing.orders || 0) + 1,
          last_order: now,
        };
        await db.from('pt_users').upsert(updated, { onConflict: 'id' });
        user = { ...updated, lastOrder: now };
      } else {
        const newUser = {
          id:         'u_' + Date.now(),
          name,
          email:      email.toLowerCase(),
          phone,
          address,
          password:   password || '',
          orders:     1,
          last_order: now,
          registered: now,
        };
        await db.from('pt_users').insert(newUser);
        user = { ...newUser, lastOrder: now };
      }
    } catch (e) {
      console.warn('Register/order Supabase error:', e);
      user = { id: 'u_' + Date.now(), name, email: email.toLowerCase(), phone, address, password: password || '', orders: 1, registered: now, lastOrder: now };
    }
  } else {
    user = { id: 'u_' + Date.now(), name, email: email.toLowerCase(), phone, address, password: password || '', orders: 1, registered: now, lastOrder: now };
  }
  setCurrentUser(user);

  const order = {
    id:         'ord_' + Date.now(),
    user_id:    user.id,
    user_name:  user.name,
    user_email: user.email,
    items:      cart.map(i => ({ ...i })),
    total:      cart.reduce((s, i) => s + i.price * i.qty, 0),
    address,
    status:     'pending',
    created_at: now,
  };
  if (db) {
    try { await db.from('pt_orders').insert(order); } catch (e) { console.warn('Order insert error:', e); }
  }

  cart = []; saveCart(); renderCart();
  closeCheckoutModal();
  showToast('Order placed! Thank you, ' + user.name + '! 🎉', '🎉');
}

function initCheckoutModal() {
  const overlay = document.getElementById('checkoutModalOverlay'); if (!overlay) return;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeCheckoutModal(); });
  document.getElementById('checkoutModalClose')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('loginSubmitBtn')?.addEventListener('click', handleLogin);
  document.getElementById('registerSubmitBtn')?.addEventListener('click', handleRegisterAndOrder);
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', async () => {
  initMobileMenu();
  initSearch();
  initCart();
  initProductModal();
  initMegaMenu();
  initScrollAnimations();
  initHeroParticles();
  initCheckoutModal();
  updateCartCount();

  // Render dynamic category collections from Supabase
  await renderCategoryCollections();

  // Render product grids
  const products = await getProducts();
  const beybladeKeywords = ['plastic gen', 'metal gen', 'burst gen', 'beyblade x', 'beyblade'];
  renderProductGrid('beybladeProducts', products.filter(p => beybladeKeywords.some(k => p.category.toLowerCase().includes(k))));
  renderProductGrid('animeProducts', products.filter(p => !beybladeKeywords.some(k => p.category.toLowerCase().includes(k))));

  // Checkout button
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);

  // Re-run scroll animations after dynamic content loaded
  initScrollAnimations();
});
