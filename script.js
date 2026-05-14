/* ===== POCKET TOON — MAIN JAVASCRIPT ===== */

// ===================== CART STATE =====================
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

function formatPrice(n) { return 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

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
        <div class="cart-item__img"><img src="${item.img}" alt="${item.name}" loading="lazy"></div>
        <div>
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__vendor">${item.vendor || ''}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
          <div class="cart-item__qty">
            <button onclick="updateQty('${item.id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${item.id}',1)">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" title="Remove">×</button>
      </div>`).join('');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (footer) { footer.style.display = ''; document.getElementById('cartSubtotal').textContent = formatPrice(total); }
  }
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
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
  document.getElementById('pmDesc').textContent    = product.desc || 'Authentic imported product. 100% original.';
  document.getElementById('pmMainImg').src         = product.img;
  document.getElementById('pmQtyInput').value      = 1;
  const thumbsEl = document.getElementById('pmThumbs');
  thumbsEl.innerHTML = '';
  const imgs = product.images && product.images.length ? product.images : [product.img];
  imgs.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'product-modal__thumb' + (i === 0 ? ' active' : '');
    div.innerHTML = `<img src="${src}" alt="">`;
    div.addEventListener('click', () => { document.getElementById('pmMainImg').src = src; thumbsEl.querySelectorAll('.product-modal__thumb').forEach(t => t.classList.remove('active')); div.classList.add('active'); });
    thumbsEl.appendChild(div);
  });
}

function closeProductModal() { document.getElementById('productModalOverlay')?.classList.remove('open'); document.body.style.overflow = ''; currentProduct = null; }

function initProductModal() {
  const overlay = document.getElementById('productModalOverlay'); if (!overlay) return;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeProductModal(); });
  document.getElementById('pmClose')?.addEventListener('click', closeProductModal);
  document.getElementById('pmCloseBtn')?.addEventListener('click', closeProductModal);
  document.getElementById('pmQtyMinus')?.addEventListener('click', () => { const i = document.getElementById('pmQtyInput'); i.value = Math.max(1, parseInt(i.value) - 1); });
  document.getElementById('pmQtyPlus')?.addEventListener('click',  () => { const i = document.getElementById('pmQtyInput'); i.value = parseInt(i.value) + 1; });
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
  document.addEventListener('click', e => { if (!e.target.closest('.mega-menu')) document.querySelectorAll('details.mega-menu[open]').forEach(d => d.open = false); });
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

  // Legacy animate-in for old cards
  const legacyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('animate-in'); legacyObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });

  // Reveal observer for .reveal, .reveal-left, .reveal-right, .reveal-scale elements
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Apply reveal to section headings and key elements
  document.querySelectorAll('.section-title-row').forEach((el, i) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
  document.querySelectorAll('.hero-banner__subtitle, .hero-banner__title, .hero-banner__desc, .btn-hero').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
  document.querySelectorAll('.multicolumn-card').forEach((el, i) => {
    el.classList.add('reveal-scale');
    el.style.transitionDelay = `${i * 0.1}s`;
    revealObserver.observe(el);
  });
  document.querySelectorAll('.blog-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.1}s`;
    revealObserver.observe(el);
  });
  document.querySelectorAll('.footer-brand').forEach(el => {
    el.classList.add('reveal-left');
    revealObserver.observe(el);
  });
  document.querySelectorAll('.footer-col').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(el);
  });

  // Cards get stagger via legacy observer
  document.querySelectorAll('.collection-card, .product-card').forEach(el => {
    el.style.opacity = '0';
    legacyObserver.observe(el);
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

// ===================== CATEGORIES DATA =====================
function getStorefrontCategories() {
  const stored = localStorage.getItem('pt_categories');
  if (stored) return JSON.parse(stored);
  return [
    { id: 'cat_bey1', name: 'Plastic Gen',  type: 'beyblade', img: 'https://placehold.co/750x750/29abe2/ffffff?text=Plastic+Gen',  caption: 'Classic plastic generation Beyblades' },
    { id: 'cat_bey2', name: 'Metal Gen',    type: 'beyblade', img: 'https://placehold.co/750x750/1565c0/ffffff?text=Metal+Gen',    caption: 'Authentic Takara Tomy Metal Fusion' },
    { id: 'cat_bey3', name: 'Burst Gen',    type: 'beyblade', img: 'https://placehold.co/750x750/0c2461/ffffff?text=Burst+Gen',    caption: 'Authentic Takara Tomy Beyblade Burst' },
    { id: 'cat_bey4', name: 'Beyblade X',  type: 'beyblade', img: 'https://placehold.co/750x750/0d47a1/ffffff?text=Beyblade+X',  caption: 'The most powerful Beyblade X series' },
    { id: 'cat_ani1',  name: 'One Piece',         type: 'anime', img: 'https://placehold.co/750x750/e65100/ffffff?text=One+Piece',        caption: 'Official One Piece figures' },
    { id: 'cat_ani2',  name: 'Demon Slayer',      type: 'anime', img: 'https://placehold.co/750x750/b71c1c/ffffff?text=Demon+Slayer',     caption: 'Official Demon Slayer figures' },
    { id: 'cat_ani6',  name: 'Waifu Figures',     type: 'anime', img: 'https://placehold.co/750x750/c62828/ffffff?text=Waifu+Figures',    caption: 'Premium waifu anime figures' },
    { id: 'cat_ani8',  name: 'TenSura',           type: 'anime', img: 'https://placehold.co/750x750/7b1fa2/ffffff?text=TenSura',          caption: 'That Time I Got Reincarnated as a Slime' },
  ];
}

// Build a collection card HTML string
function buildCollectionCard(cat) {
  const img     = cat.img || ('https://placehold.co/750x750/7c3aed/ffffff?text=' + encodeURIComponent(cat.name));
  const caption = cat.caption || ('Shop the ' + cat.name + ' collection');
  const url     = 'products.html?cat=' + encodeURIComponent(cat.name);
  return `
    <li>
      <a href="${url}" class="collection-card glow-card">
        <div class="collection-card__image"><img src="${img}" alt="${cat.name}" loading="lazy"></div>
        <div class="collection-card__info">
          <div class="collection-card__title">${cat.name} <svg class="arrow-icon" fill="none" viewBox="0 0 14 10"><path fill="currentColor" fill-rule="evenodd" d="M8.537.808a.5.5 0 0 1 .817-.162l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L11.793 5.5H1a.5.5 0 0 1 0-1h10.793L8.646 1.354a.5.5 0 0 1-.109-.546" clip-rule="evenodd"/></svg></div>
          <div class="collection-card__caption">${caption}</div>
        </div>
      </a>
    </li>`;
}

function renderCategoryCollections() {
  const allCats = getStorefrontCategories();
  const beyCats = allCats.filter(c => c.type === 'beyblade');
  const aniCats = allCats.filter(c => c.type === 'anime');

  const beyList = document.getElementById('beybladeCollectionList');
  const aniList = document.getElementById('animeCollectionList');

  if (beyList) beyList.innerHTML = beyCats.map(buildCollectionCard).join('');
  if (aniList) aniList.innerHTML = aniCats.slice(0, 8).map(buildCollectionCard).join('');
}

// ===================== PRODUCTS FROM STORAGE =====================
function getProducts() {
  const stored = localStorage.getItem('pt_products');
  if (stored) return JSON.parse(stored);
  return [
    { id: 'p1', name: 'Takaratomy Beyblade Burst B-193 Astral Spriggan', vendor: 'TAKARA TOMY', price: 1299, category: 'Burst Gen',   img: 'https://placehold.co/400x400/29abe2/ffffff?text=Burst+Spriggan', images: [], desc: 'Authentic Takara Tomy Beyblade Burst.', inStock: true },
    { id: 'p2', name: 'Monkey D. Luffy Gear 5 — One Piece Banpresto Figure', vendor: 'BANPRESTO', price: 2499, category: 'One Piece', img: 'https://placehold.co/400x400/e65100/ffffff?text=Luffy', images: [], desc: 'Official Banpresto One Piece figure.', inStock: true },
    { id: 'p3', name: 'Tanjiro Kamado Demon Slayer Figure',               vendor: 'BANPRESTO',   price: 1999, category: 'Demon Slayer', img: 'https://placehold.co/400x400/b71c1c/ffffff?text=Tanjiro', images: [], desc: 'Official Banpresto Demon Slayer.', inStock: true },
    { id: 'p4', name: 'Beyblade X BX-11 Dran Sword 3-60F',               vendor: 'TAKARA TOMY', price:  849, category: 'Beyblade X', img: 'https://placehold.co/400x400/0d47a1/ffffff?text=Dran+Sword', images: [], desc: 'Latest Beyblade X series.', inStock: true },
    { id: 'p5', name: 'Rimuru Tempest Vol.3 TenSura Figure',              vendor: 'BANPRESTO',   price: 2299, category: 'TenSura', img: 'https://placehold.co/400x400/7b1fa2/ffffff?text=Rimuru', images: [], desc: 'Official Banpresto TenSura figure.', inStock: true },
    { id: 'p6', name: 'Anya Forger — SPY x FAMILY Figure',                vendor: 'BANPRESTO',   price: 1799, category: 'Spy x Family', img: 'https://placehold.co/400x400/e91e63/ffffff?text=Anya', images: [], desc: 'Official Banpresto Spy x Family.', inStock: true },
    { id: 'p7', name: 'Metal Beyblade BB-47 Earth Eagle Original',        vendor: 'TAKARA TOMY', price:  699, category: 'Metal Gen', img: 'https://placehold.co/400x400/37474f/ffffff?text=Earth+Eagle', images: [], desc: 'Original Takara Tomy Metal Fusion.', inStock: false },
    { id: 'p8', name: 'Deku My Hero Academia Battle Figure',               vendor: 'BANPRESTO',   price: 2199, category: 'My Hero Academia', img: 'https://placehold.co/400x400/1565c0/ffffff?text=Deku', images: [], desc: 'Official Banpresto MHA figure.', inStock: true },
  ];
}

function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId); if (!container) return;
  container.innerHTML = products.slice(0, 8).map(p => `
    <div class="product-card" onclick="openProductModal(${JSON.stringify(p).replace(/"/g,'&quot;')})">
      <div class="product-card__media">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        ${!p.inStock ? '<span class="product-card__badge sold-out">Sold Out</span>' : ''}
      </div>
      <div class="product-card__info">
        <div class="product-card__vendor">${p.vendor || ''}</div>
        <div class="product-card__title">${p.name}</div>
        <div class="product-card__price">${formatPrice(p.price)}</div>
        <div class="qty-control">
          <button class="qty-control__btn" onclick="event.stopPropagation();this.nextElementSibling.value=Math.max(1,+this.nextElementSibling.value-1)">−</button>
          <input class="qty-control__input" type="number" value="1" min="1" onclick="event.stopPropagation()">
          <button class="qty-control__btn" onclick="event.stopPropagation();this.previousElementSibling.value=+this.previousElementSibling.value+1">+</button>
        </div>
        <button class="btn-add-cart" ${!p.inStock?'disabled':''} onclick="event.stopPropagation();addToCart({...${JSON.stringify(p)},qty:+this.closest('.product-card__info').querySelector('.qty-control__input').value})">${p.inStock ? 'Add to Cart' : 'Sold Out'}</button>
      </div>
    </div>`).join('');
}

// ===================== USER MANAGEMENT =====================
function getUsers()        { return JSON.parse(localStorage.getItem('pt_users') || '[]'); }
function saveUsers(users)  { localStorage.setItem('pt_users', JSON.stringify(users)); }
function getCurrentUser()  { return JSON.parse(localStorage.getItem('pt_current_user') || 'null'); }
function setCurrentUser(u) { localStorage.setItem('pt_current_user', JSON.stringify(u)); }

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
    <div class="checkout-summary-title">🛍️ Order Summary (${cart.length} item${cart.length!==1?'s':''})</div>
    ${cart.map(i => `
      <div class="checkout-summary-item">
        <img src="${i.img}" alt="${i.name}">
        <div class="checkout-summary-info">
          <div class="checkout-summary-name">${i.name}</div>
          <div class="checkout-summary-qty">Qty: ${i.qty}</div>
        </div>
        <div class="checkout-summary-price">${formatPrice(i.price * i.qty)}</div>
      </div>`).join('')}
    <div class="checkout-summary-total"><span>Total</span><strong>${formatPrice(total)}</strong></div>`;
}

function openCheckoutModal() {
  // Always open the checkout modal when checkout is clicked
  const overlay = document.getElementById('checkoutModalOverlay'); if (!overlay) return;
  const currentUser = getCurrentUser();
  if (currentUser) {
    // Pre-fill with existing user data
    const n = document.getElementById('regName');    if (n) n.value = currentUser.name    || '';
    const e = document.getElementById('regEmail');   if (e) e.value = currentUser.email   || '';
    const p = document.getElementById('regPhone');   if (p) p.value = currentUser.phone   || '';
    const a = document.getElementById('regAddress'); if (a) a.value = currentUser.address || '';
    document.getElementById('registerSubmitBtn').textContent = '🎉 Place Order';
    switchCheckoutTab('register');
  } else {
    switchCheckoutTab('login');
  }
  renderCheckoutOrderSummary();
  // Close cart drawer first
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.body.style.overflow = 'hidden';
  overlay.classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function handleLogin() {
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) { showToast('Please enter email and password.', '⚠️'); return; }
  const users = getUsers();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) { showToast('Invalid email or password.', '❌'); return; }
  setCurrentUser(user);
  showToast('Welcome back, ' + user.name + '!', '👋');
  const n = document.getElementById('regName');    if (n) n.value = user.name    || '';
  const e = document.getElementById('regEmail');   if (e) e.value = user.email   || '';
  const p = document.getElementById('regPhone');   if (p) p.value = user.phone   || '';
  const a = document.getElementById('regAddress'); if (a) a.value = user.address || '';
  document.getElementById('registerSubmitBtn').textContent = '🎉 Place Order';
  switchCheckoutTab('register');
}

function handleRegisterAndOrder() {
  const name    = document.getElementById('regName')?.value.trim();
  const email   = document.getElementById('regEmail')?.value.trim();
  const phone   = document.getElementById('regPhone')?.value.trim();
  const address = document.getElementById('regAddress')?.value.trim();
  const password= document.getElementById('regPassword')?.value;
  if (!name || !email || !phone || !address) { showToast('Please fill all required fields.', '⚠️'); return; }
  if (password && password.length < 6)        { showToast('Password must be at least 6 characters.', '⚠️'); return; }
  const users   = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  let user;
  if (existing) {
    existing.address = address; existing.phone = phone;
    if (password) existing.password = password;
    existing.orders   = (existing.orders || 0) + 1;
    existing.lastOrder = new Date().toISOString();
    saveUsers(users); user = existing;
  } else {
    user = { id: 'u_' + Date.now(), name, email, phone, address, password: password || '', registered: new Date().toISOString(), orders: 1, lastOrder: new Date().toISOString() };
    users.push(user); saveUsers(users);
  }
  setCurrentUser(user);
  const orders = JSON.parse(localStorage.getItem('pt_orders') || '[]');
  orders.push({ id: 'ord_' + Date.now(), userId: user.id, userName: user.name, userEmail: user.email, items: cart.map(i => ({...i})), total: cart.reduce((s,i) => s+i.price*i.qty, 0), date: new Date().toISOString(), address });
  localStorage.setItem('pt_orders', JSON.stringify(orders));
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
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearch();
  initCart();
  initProductModal();
  initMegaMenu();
  initScrollAnimations();
  initHeroParticles();
  initCheckoutModal();
  updateCartCount();

  // Render dynamic category collections from localStorage
  renderCategoryCollections();

  // Render product grids
  const products = getProducts();
  const beybladeKeywords = ['plastic gen', 'metal gen', 'burst gen', 'beyblade x', 'beyblade'];
  renderProductGrid('beybladeProducts', products.filter(p => beybladeKeywords.some(k => p.category.toLowerCase().includes(k))));
  renderProductGrid('animeProducts', products.filter(p => !beybladeKeywords.some(k => p.category.toLowerCase().includes(k))));

  // Checkout button — always opens login modal
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
});
