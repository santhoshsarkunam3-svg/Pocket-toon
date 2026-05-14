/* ===== POCKET TOON — ADMIN JAVASCRIPT (Supabase Edition) ===== */

// ===================== SUPABASE HELPER =====================
function getDB() {
  if (!window.db) { console.error('Supabase client not ready'); return null; }
  return window.db;
}

// ===================== STATE =====================
let products = [];
let editingProductId = null;
let deleteProductId  = null;
let productImages    = [];
let editingCatImgId  = null;

// ===================== DEFAULT DATA =====================
const DEFAULT_CATEGORIES = [
  { id: 'cat_bey1', name: 'Plastic Gen',      type: 'beyblade', img: 'https://placehold.co/750x750/29abe2/ffffff?text=Plastic+Gen',     caption: 'Classic plastic generation Beyblades',                sort_order: 1 },
  { id: 'cat_bey2', name: 'Metal Gen',        type: 'beyblade', img: 'https://placehold.co/750x750/1565c0/ffffff?text=Metal+Gen',       caption: 'Authentic Takara Tomy Metal Fusion Beyblades',          sort_order: 2 },
  { id: 'cat_bey3', name: 'Burst Gen',        type: 'beyblade', img: 'https://placehold.co/750x750/0c2461/ffffff?text=Burst+Gen',       caption: 'Authentic Takara Tomy Beyblade Burst collection',       sort_order: 3 },
  { id: 'cat_bey4', name: 'Beyblade X',       type: 'beyblade', img: 'https://placehold.co/750x750/0d47a1/ffffff?text=Beyblade+X',      caption: 'The most powerful Beyblade X series',                  sort_order: 4 },
  { id: 'cat_ani1', name: 'One Piece',        type: 'anime',    img: 'https://placehold.co/750x750/e65100/ffffff?text=One+Piece',        caption: 'Official One Piece figures',                            sort_order: 5 },
  { id: 'cat_ani2', name: 'Demon Slayer',     type: 'anime',    img: 'https://placehold.co/750x750/b71c1c/ffffff?text=Demon+Slayer',    caption: 'Official Demon Slayer figures',                         sort_order: 6 },
  { id: 'cat_ani3', name: 'Spy x Family',     type: 'anime',    img: 'https://placehold.co/750x750/e91e63/ffffff?text=Spy+x+Family',    caption: 'Official Spy x Family figures',                         sort_order: 7 },
  { id: 'cat_ani4', name: 'My Hero Academia', type: 'anime',    img: 'https://placehold.co/750x750/1565c0/ffffff?text=My+Hero',          caption: 'Official My Hero Academia figures',                     sort_order: 8 },
  { id: 'cat_ani5', name: 'Tokyo Revengers',  type: 'anime',    img: 'https://placehold.co/750x750/37474f/ffffff?text=Tokyo+Revengers', caption: 'Official Tokyo Revengers figures',                      sort_order: 9 },
  { id: 'cat_ani6', name: 'Waifu Figures',    type: 'anime',    img: 'https://placehold.co/750x750/c62828/ffffff?text=Waifu+Figures',   caption: 'Premium waifu anime figures',                           sort_order: 10 },
  { id: 'cat_ani8', name: 'TenSura',          type: 'anime',    img: 'https://placehold.co/750x750/7b1fa2/ffffff?text=TenSura',          caption: 'That Time I Got Reincarnated as a Slime',               sort_order: 11 },
];

// ===================== SUPABASE — PRODUCTS =====================
async function loadProducts() {
  const db = getDB();
  if (!db) { products = []; renderDashboard(); return; }
  try {
    const { data, error } = await db.from('pt_products').select('*').order('sort_order', { ascending: true });
    if (error) { console.warn('loadProducts error:', error); products = []; }
    else products = (data || []).map(p => ({
      id:       p.id,
      name:     p.name        || '',
      vendor:   p.vendor      || '',
      price:    Number(p.price) || 0,
      category: p.category    || '',
      img:      p.img         || '',
      images:   Array.isArray(p.images) ? p.images : [],
      desc:     p.description || p.desc || '',
      inStock:  p.in_stock !== undefined ? p.in_stock : true,
      sort_order: p.sort_order || 0,
    }));
  } catch (e) { console.warn('loadProducts failed:', e); products = []; }
  renderDashboard();
}

async function saveProductToDB(product) {
  const db = getDB(); if (!db) return false;
  const row = {
    id:          product.id,
    name:        product.name,
    vendor:      product.vendor      || '',
    price:       product.price,
    category:    product.category,
    img:         product.img         || '',
    images:      product.images      || [],
    description: product.desc        || '',
    in_stock:    product.inStock,
    sort_order:  product.sort_order  || 0,
  };
  const { error } = await db.from('pt_products').upsert(row, { onConflict: 'id' });
  if (error) { console.warn('saveProductToDB error:', error); return false; }
  return true;
}

async function deleteProductFromDB(id) {
  const db = getDB(); if (!db) return false;
  const { error } = await db.from('pt_products').delete().eq('id', id);
  if (error) { console.warn('deleteProductFromDB error:', error); return false; }
  return true;
}

// ===================== SUPABASE — CATEGORIES =====================
async function loadCategories() {
  const db = getDB();
  if (!db) return [...DEFAULT_CATEGORIES];
  try {
    const { data, error } = await db.from('pt_categories').select('*').order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return [...DEFAULT_CATEGORIES];
    return data;
  } catch (e) { return [...DEFAULT_CATEGORIES]; }
}

async function saveCategory(cat) {
  const db = getDB(); if (!db) return false;
  const { error } = await db.from('pt_categories').upsert(cat, { onConflict: 'id' });
  if (error) { console.warn('saveCategory error:', error); return false; }
  return true;
}

async function deleteCategoryFromDB(id) {
  const db = getDB(); if (!db) return false;
  const { error } = await db.from('pt_categories').delete().eq('id', id);
  if (error) { console.warn('deleteCategoryFromDB error:', error); return false; }
  return true;
}

// ===================== SUPABASE — USERS =====================
async function getUsers() {
  const db = getDB(); if (!db) return [];
  try {
    const { data, error } = await db.from('pt_users').select('*').order('registered', { ascending: false });
    if (error) { console.warn('getUsers error:', error); return []; }
    return (data || []).map(u => ({ ...u, orders: u.orders || 0, lastOrder: u.last_order }));
  } catch (e) { return []; }
}

async function deleteUserFromDB(id) {
  const db = getDB(); if (!db) return false;
  const { error } = await db.from('pt_users').delete().eq('id', id);
  if (error) { console.warn('deleteUserFromDB error:', error); return false; }
  return true;
}

async function clearAllUsersFromDB() {
  const db = getDB(); if (!db) return false;
  const { error } = await db.from('pt_users').delete().neq('id', '');
  if (error) { console.warn('clearAllUsersFromDB error:', error); return false; }
  return true;
}

// ===================== SUPABASE — ORDERS =====================
async function getUserOrders(userId) {
  const db = getDB(); if (!db) return [];
  try {
    const { data, error } = await db.from('pt_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { console.warn('getUserOrders error:', error); return []; }
    return data || [];
  } catch (e) { return []; }
}

// ===================== SUPABASE — STORAGE (Images) =====================
async function uploadImageToStorage(file) {
  const db = getDB(); if (!db) return null;
  const ext  = file.name.split('.').pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  try {
    const { data, error } = await db.storage.from('pocket-toon-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) { console.warn('Storage upload error:', error); return null; }
    const { data: pub } = db.storage.from('pocket-toon-images').getPublicUrl(path);
    return pub?.publicUrl || null;
  } catch (e) { console.warn('uploadImageToStorage failed:', e); return null; }
}

async function uploadCatImageToStorage(file) {
  const db = getDB(); if (!db) return null;
  const ext  = file.name.split('.').pop();
  const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  try {
    const { data, error } = await db.storage.from('pocket-toon-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) { console.warn('Cat image upload error:', error); return null; }
    const { data: pub } = db.storage.from('pocket-toon-images').getPublicUrl(path);
    return pub?.publicUrl || null;
  } catch (e) { console.warn('uploadCatImageToStorage failed:', e); return null; }
}

// ===================== NAVIGATION =====================
function showView(viewId) {
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sidebar-link[data-view]').forEach(l => l.classList.remove('active'));
  document.getElementById('view-' + viewId)?.classList.add('active');
  document.querySelector('.sidebar-link[data-view="' + viewId + '"]')?.classList.add('active');
  const titles = { dashboard: 'Dashboard', products: 'Products', 'add-product': editingProductId ? 'Edit Product' : 'Add New Product', categories: 'Categories', users: 'Users' };
  const titleEl = document.querySelector('.topbar-title');
  if (titleEl) titleEl.textContent = titles[viewId] || 'Admin';
  if (viewId === 'dashboard')  renderDashboard();
  if (viewId === 'products')   renderProductsTable();
  if (viewId === 'categories') renderCategoriesView();
  if (viewId === 'users')      renderUsersTable();
  document.getElementById('adminSidebar')?.classList.remove('open');
}

// ===================== DASHBOARD =====================
function renderDashboard() {
  const inStock = products.filter(p => p.inStock).length;
  loadCategories().then(cats => {
    document.getElementById('stat-categories').textContent = cats.length;
  });
  getUsers().then(users => {
    const su = document.getElementById('stat-users'); if (su) su.textContent = users.length;
  });
  document.getElementById('stat-products').textContent    = products.length;
  document.getElementById('stat-in-stock').textContent    = inStock;
  document.getElementById('stat-out-stock').textContent   = products.length - inStock;
  const recentList = document.getElementById('recentProductsList');
  if (recentList) { recentList.innerHTML = products.slice(0, 5).map(p => renderProductRow(p)).join(''); attachRowListeners(recentList); }
}

// ===================== PRODUCTS TABLE =====================
function renderProductsTable() {
  const filterText   = document.getElementById('productSearch')?.value   || '';
  const filterCat    = document.getElementById('categoryFilter')?.value   || '';
  const filterStatus = document.getElementById('statusFilter')?.value     || '';
  const list = document.getElementById('productsList');
  if (!list) return;
  let filtered = [...products];
  if (filterText) { const q = filterText.toLowerCase(); filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.vendor || '').toLowerCase().includes(q)); }
  if (filterCat)              filtered = filtered.filter(p => p.category === filterCat);
  if (filterStatus === 'in')  filtered = filtered.filter(p =>  p.inStock);
  if (filterStatus === 'out') filtered = filtered.filter(p => !p.inStock);
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__title">No Products Found</div><div class="empty-state__desc">Try adjusting your search or add a new product.</div></div>`;
    return;
  }
  list.innerHTML = filtered.map(p => renderProductRow(p)).join('');
  attachRowListeners(list);

  // populate category filter
  const catFilter = document.getElementById('categoryFilter');
  if (catFilter && catFilter.options.length <= 1) {
    loadCategories().then(cats => {
      cats.forEach(c => {
        if (![...catFilter.options].some(o => o.value === c.name)) {
          const o = document.createElement('option'); o.value = c.name; o.textContent = c.name; catFilter.appendChild(o);
        }
      });
    });
  }
}

function renderProductRow(p) {
  return `<div class="product-row" data-id="${p.id}">
    <div class="drag-handle" title="Reorder"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>
    <div class="product-row__img"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/60x60/eee/aaa?text=?'"></div>
    <div><div class="product-row__name">${p.name}</div><div class="product-row__vendor">${p.vendor || ''}</div></div>
    <div class="product-row__price">₹${Number(p.price).toLocaleString('en-IN')}</div>
    <div class="product-row__category">${p.category}</div>
    <span class="badge ${p.inStock ? 'badge-in-stock' : 'badge-out-of-stock'}">${p.inStock ? 'In Stock' : 'Out of Stock'}</span>
    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer"><input type="checkbox" class="toggle-stock" data-id="${p.id}" ${p.inStock ? 'checked' : ''} style="accent-color:var(--success);width:1.5rem;height:1.5rem;cursor:pointer"></label>
    <div class="row-actions">
      <button class="action-btn edit-btn"   data-id="${p.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="action-btn danger delete-btn" data-id="${p.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
    </div>
  </div>`;
}

function attachRowListeners(container) {
  container.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => startEditProduct(btn.dataset.id))
  );
  container.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.id))
  );
  container.querySelectorAll('.toggle-stock').forEach(chk =>
    chk.addEventListener('change', async () => {
      const p = products.find(p => p.id === chk.dataset.id); if (!p) return;
      p.inStock = chk.checked;
      const ok = await saveProductToDB(p);
      if (ok) notify(p.inStock ? 'Marked as In Stock' : 'Marked as Out of Stock', 'success');
      else    notify('Failed to update stock status.', 'error');
      renderProductsTable();
    })
  );
}

// ===================== ADD / EDIT PRODUCT =====================
async function populateCategoryDropdown() {
  const select = document.getElementById('fieldCategory'); if (!select) return;
  const cats    = await loadCategories();
  const current = select.value;
  select.innerHTML = '<option value="">Select Category</option>';
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c.name; o.textContent = c.name + (c.type === 'beyblade' ? ' 🪀' : ' 🎌');
    select.appendChild(o);
  });
  if (current) select.value = current;
}

function resetProductForm() {
  ['fieldName', 'fieldVendor', 'fieldPrice', 'fieldCategory', 'fieldDesc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const inStock = document.getElementById('fieldInStock'); if (inStock) inStock.checked = true;
  productImages = []; renderImagePreviews(); editingProductId = null;
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('saveProductBtn').textContent = 'Save Product';
}

function startEditProduct(id) {
  const p = products.find(p => p.id === id); if (!p) return;
  editingProductId = id;
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('saveProductBtn').textContent = 'Update Product';
  document.getElementById('fieldName').value    = p.name;
  document.getElementById('fieldVendor').value  = p.vendor || '';
  document.getElementById('fieldPrice').value   = p.price;
  document.getElementById('fieldInStock').checked = p.inStock;
  document.getElementById('fieldDesc').value    = p.desc || '';
  populateCategoryDropdown().then(() => {
    document.getElementById('fieldCategory').value = p.category;
  });
  productImages = (p.images && p.images.length) ? [...p.images] : p.img ? [p.img] : [];
  renderImagePreviews(); showView('add-product');
}

async function saveProduct() {
  const name     = document.getElementById('fieldName').value.trim();
  const vendor   = document.getElementById('fieldVendor').value.trim();
  const price    = parseFloat(document.getElementById('fieldPrice').value);
  const category = document.getElementById('fieldCategory').value;
  const inStock  = document.getElementById('fieldInStock').checked;
  const desc     = document.getElementById('fieldDesc').value.trim();
  if (!name)                     { notify('Product name is required.', 'error'); return; }
  if (isNaN(price) || price < 0) { notify('Please enter a valid price.', 'error'); return; }
  if (!category)                 { notify('Please select a category.', 'error'); return; }

  const saveBtn = document.getElementById('saveProductBtn');
  saveBtn.disabled = true; saveBtn.textContent = 'Saving…';

  const img = productImages[0] || 'https://placehold.co/400x400/29abe2/ffffff?text=Product';
  let product;
  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx > -1) {
      product = { ...products[idx], name, vendor, price, category, inStock, desc, img, images: [...productImages] };
      products[idx] = product;
    }
  } else {
    product = { id: 'p_' + Date.now(), name, vendor, price, category, inStock, desc, img, images: [...productImages], sort_order: products.length + 1 };
    products.unshift(product);
  }

  const ok = await saveProductToDB(product);
  saveBtn.disabled = false; saveBtn.textContent = editingProductId ? 'Update Product' : 'Save Product';
  if (ok) notify(editingProductId ? 'Product updated!' : 'Product added!', 'success');
  else    notify('Saved locally — check DB connection.', 'error');
  resetProductForm(); showView('products');
}

// ===================== IMAGES =====================
function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid'); if (!grid) return;
  grid.innerHTML = productImages.map((src, i) => `
    <div class="image-preview-item" data-idx="${i}">
      <img src="${src}" alt="Image ${i + 1}" onerror="this.src='https://placehold.co/100x100/eee/aaa?text=?'">
      <button class="remove-img" data-idx="${i}" title="Remove">×</button>
      ${i === 0 ? '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(21,101,192,0.75);color:#fff;font-size:1rem;text-align:center;padding:0.2rem">Main</div>' : ''}
    </div>`).join('');
  grid.querySelectorAll('.remove-img').forEach(btn =>
    btn.addEventListener('click', () => { productImages.splice(parseInt(btn.dataset.idx), 1); renderImagePreviews(); })
  );
}

function initImageUpload() {
  const area = document.getElementById('imageUploadArea'); if (!area) return;
  const fileInput = area.querySelector('input[type=file]');
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('dragover'); handleFiles(Array.from(e.dataTransfer.files)); });
  fileInput?.addEventListener('change', () => { handleFiles(Array.from(fileInput.files)); fileInput.value = ''; });

  document.getElementById('addImgUrlBtn')?.addEventListener('click', () => {
    const urlInput = document.getElementById('fieldImgUrl');
    const url = urlInput.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      productImages.push(url); renderImagePreviews(); urlInput.value = '';
    } else {
      notify('Please enter a valid image URL (https://…).', 'error');
    }
  });
}

async function handleFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    if (file.size > 10 * 1024 * 1024) { notify('Image too large (max 10 MB).', 'error'); continue; }
    notify('Uploading image…', '');
    const publicUrl = await uploadImageToStorage(file);
    if (publicUrl) {
      productImages.push(publicUrl); renderImagePreviews();
      notify('Image uploaded!', 'success');
    } else {
      // Fallback: store as base64 locally if storage fails
      const reader = new FileReader();
      reader.onload = e => { productImages.push(e.target.result); renderImagePreviews(); };
      reader.readAsDataURL(file);
      notify('Storage unavailable — image stored locally. Set up Supabase Storage bucket for cloud hosting.', 'error');
    }
  }
}

// ===================== DELETE PRODUCT =====================
function openDeleteConfirm(id) {
  const p = products.find(p => p.id === id); if (!p) return;
  deleteProductId = id;
  document.getElementById('deleteProductName').textContent = p.name;
  document.getElementById('confirmDeleteModal').classList.add('open');
}
function closeDeleteConfirm() { document.getElementById('confirmDeleteModal').classList.remove('open'); deleteProductId = null; }

async function confirmDelete() {
  if (!deleteProductId) return;
  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true; btn.textContent = 'Deleting…';
  const ok = await deleteProductFromDB(deleteProductId);
  products = products.filter(p => p.id !== deleteProductId);
  closeDeleteConfirm();
  btn.disabled = false; btn.textContent = 'Delete';
  if (ok) notify('Product deleted.', 'success');
  else    notify('Removed locally — check DB connection.', 'error');
  renderProductsTable(); renderDashboard();
}

// ===================== CATEGORIES =====================
async function renderCategoriesView() {
  const cats    = await loadCategories();
  const beyCats = cats.filter(c => c.type === 'beyblade');
  const aniCats = cats.filter(c => c.type === 'anime');
  buildCatGrid(document.getElementById('beybladeCategories'), beyCats);
  buildCatGrid(document.getElementById('animeCategories'),    aniCats);
}

function buildCatGrid(container, catList) {
  if (!container) return;
  container.innerHTML = catList.length === 0
    ? '<p style="color:var(--text-light);font-size:1.4rem">No categories yet.</p>'
    : catList.map(c => renderCategoryCard(c)).join('');
  container.querySelectorAll('.cat-rename-btn').forEach(btn => btn.addEventListener('click', () => renameCategory(btn.dataset.id)));
  container.querySelectorAll('.cat-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteCategory(btn.dataset.id)));
  container.querySelectorAll('.cat-img-btn').forEach(btn    => btn.addEventListener('click', () => openCatImgModal(btn.dataset.id)));
}

function renderCategoryCard(c) {
  const count  = products.filter(p => p.category === c.name).length;
  const imgSrc = c.img || ('https://placehold.co/200x200/29abe2/ffffff?text=' + encodeURIComponent(c.name));
  return `
    <div class="category-card" data-id="${c.id}">
      <div class="category-card__img-wrap">
        <img class="category-card__img" src="${imgSrc}" alt="${c.name}" loading="lazy" onerror="this.src='https://placehold.co/200x200/eee/aaa?text=?'">
        <button class="category-card__img-overlay-btn cat-img-btn" data-id="${c.id}" title="Change image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Change Image
        </button>
      </div>
      <div class="category-card__body">
        <div class="category-card__name">${c.name}</div>
        <div class="category-card__count">${count} product${count !== 1 ? 's' : ''} &bull; ${c.type === 'beyblade' ? '🪀 Beyblade' : '🎌 Anime'}</div>
        <div class="category-card__caption">${c.caption || ''}</div>
        <div class="category-card__actions">
          <button class="btn btn-outline cat-rename-btn" data-id="${c.id}">Rename</button>
          <button class="btn cat-img-btn" data-id="${c.id}" style="background:var(--blue-primary);color:white;border:none">📷 Image</button>
          <button class="btn btn-danger cat-delete-btn" data-id="${c.id}">Delete</button>
        </div>
      </div>
    </div>`;
}

async function addCategory() {
  const nameInput  = document.getElementById('newCategoryName');
  const typeSelect = document.getElementById('newCategoryType');
  const name = nameInput.value.trim();
  if (!name) { notify('Please enter a category name.', 'error'); return; }
  const cats = await loadCategories();
  if (cats.find(c => c.name.toLowerCase() === name.toLowerCase())) { notify('Category already exists.', 'error'); return; }
  const newCat = {
    id:         'cat_' + Date.now(),
    name,
    type:       typeSelect.value,
    img:        'https://placehold.co/750x750/29abe2/ffffff?text=' + encodeURIComponent(name),
    caption:    'Shop ' + name + ' collection',
    sort_order: cats.length + 1,
  };
  const ok = await saveCategory(newCat);
  nameInput.value = '';
  await renderCategoriesView();
  await populateCategoryDropdown();
  if (ok) notify('Category added!', 'success');
  else    notify('Category saved locally — check DB connection.', 'error');
}

async function renameCategory(id) {
  const cats = await loadCategories();
  const cat  = cats.find(c => c.id === id); if (!cat) return;
  const newName = prompt('Rename "' + cat.name + '" to:', cat.name);
  if (!newName || newName.trim() === cat.name) return;
  const trimmed = newName.trim();
  if (cats.find(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== id)) {
    notify('Another category with that name already exists.', 'error'); return;
  }
  // Update all products with old category name
  for (const p of products) {
    if (p.category === cat.name) {
      p.category = trimmed;
      await saveProductToDB(p);
    }
  }
  cat.name = trimmed;
  await saveCategory(cat);
  await renderCategoriesView();
  await populateCategoryDropdown();
  notify('Category renamed!', 'success');
}

async function deleteCategory(id) {
  const cats  = await loadCategories();
  const cat   = cats.find(c => c.id === id); if (!cat) return;
  const count = products.filter(p => p.category === cat.name).length;
  if (count > 0) { notify('Cannot delete — ' + count + ' product(s) use this category.', 'error'); return; }
  const ok = await deleteCategoryFromDB(id);
  await renderCategoriesView();
  await populateCategoryDropdown();
  if (ok) notify('Category deleted.', 'success');
  else    notify('Removed locally — check DB connection.', 'error');
}

// ===================== CATEGORY IMAGE MODAL =====================
let _catImgPendingFile = null;

async function openCatImgModal(id) {
  editingCatImgId  = id;
  _catImgPendingFile = null;
  const cats = await loadCategories();
  const cat  = cats.find(c => c.id === id); if (!cat) return;
  document.getElementById('catImgModalTitle').textContent = 'Change Image — ' + cat.name;
  document.getElementById('catImgUrlInput').value  = cat.img || '';
  document.getElementById('catImgCaption').value   = cat.caption || '';
  const preview = document.getElementById('catImgPreview');
  preview.src = cat.img || ''; preview.style.display = cat.img ? 'block' : 'none';
  document.getElementById('catImgModal').classList.add('open');
}

function closeCatImgModal() {
  document.getElementById('catImgModal').classList.remove('open');
  editingCatImgId  = null;
  _catImgPendingFile = null;
}

async function saveCatImage() {
  if (!editingCatImgId) return;
  const cats    = await loadCategories();
  const cat     = cats.find(c => c.id === editingCatImgId); if (!cat) return;
  const caption = document.getElementById('catImgCaption').value.trim();
  const btn     = document.getElementById('saveCatImgBtn');
  btn.disabled  = true; btn.textContent = 'Saving…';

  let url = document.getElementById('catImgUrlInput').value.trim();
  if (_catImgPendingFile) {
    const uploaded = await uploadCatImageToStorage(_catImgPendingFile);
    if (uploaded) url = uploaded;
  }
  if (!url) { notify('Please enter an image URL or upload a file.', 'error'); btn.disabled = false; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:1.6rem;height:1.6rem"><polyline points="20 6 9 17 4 12"/></svg>Save Image'; return; }

  cat.img     = url;
  cat.caption = caption;
  const ok = await saveCategory(cat);
  btn.disabled = false; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:1.6rem;height:1.6rem"><polyline points="20 6 9 17 4 12"/></svg>Save Image';
  closeCatImgModal();
  await renderCategoriesView();
  if (ok) notify('Category image updated!', 'success');
  else    notify('Saved locally — check DB connection.', 'error');
}

function previewCatImg() {
  const url     = document.getElementById('catImgUrlInput').value.trim();
  const preview = document.getElementById('catImgPreview');
  if (url) {
    preview.src = url; preview.style.display = 'block';
    preview.onerror = () => { preview.src = ''; preview.style.display = 'none'; notify('Could not load image from that URL.', 'error'); };
  } else { preview.src = ''; preview.style.display = 'none'; }
}

function initCatImgFileUpload() {
  const fileInput = document.getElementById('catImgFileInput'); if (!fileInput) return;
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]; if (!file) return;
    _catImgPendingFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('catImgUrlInput').value = '';
      const preview = document.getElementById('catImgPreview');
      preview.src = e.target.result; preview.style.display = 'block';
      notify('Image selected — click "Save Image" to upload.', 'success');
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });
}

// ===================== USERS =====================
async function renderUsersTable() {
  const filterText = document.getElementById('userSearch')?.value || '';
  const list = document.getElementById('usersList'); if (!list) return;
  list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-light)">Loading…</div>';
  let users = await getUsers();
  const countEl = document.getElementById('usersCount');
  if (countEl) countEl.textContent = users.length + ' user' + (users.length !== 1 ? 's' : '');
  if (filterText) {
    const q = filterText.toLowerCase();
    users = users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q));
  }
  if (users.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__title">No Users Yet</div><div class="empty-state__desc">Users who checkout on the store will appear here.</div></div>`;
    return;
  }
  list.innerHTML = users.map((u, i) => `
    <div class="user-row" data-id="${u.id}">
      <div class="user-row__num">${i + 1}</div>
      <div class="user-row__name">${u.name || '—'}</div>
      <div class="user-row__email">${u.email || '—'}</div>
      <div class="user-row__phone">${u.phone || '—'}</div>
      <div class="user-row__date">${u.registered ? new Date(u.registered).toLocaleDateString('en-IN') : '—'}</div>
      <div class="user-row__orders">${u.orders || 0}</div>
      <div class="row-actions">
        <button class="action-btn view-user-btn" data-id="${u.id}" title="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="action-btn danger delete-user-btn" data-id="${u.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
      </div>
    </div>`).join('');
  list.querySelectorAll('.view-user-btn').forEach(btn   => btn.addEventListener('click', () => openUserDetail(btn.dataset.id, users)));
  list.querySelectorAll('.delete-user-btn').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.id)));
}

async function openUserDetail(id, cachedUsers) {
  const users = cachedUsers || await getUsers();
  const user  = users.find(u => u.id === id); if (!user) return;
  const userOrders = await getUserOrders(id);
  document.getElementById('userDetailBody').innerHTML = `
    <div class="user-detail-grid">
      <div class="user-detail-avatar">${(user.name || 'U')[0].toUpperCase()}</div>
      <div class="user-detail-info">
        <div class="user-detail-name">${user.name || '—'}</div>
        <div class="user-detail-meta">📧 ${user.email || '—'}</div>
        <div class="user-detail-meta">📱 ${user.phone || '—'}</div>
        <div class="user-detail-meta">📅 Registered: ${user.registered ? new Date(user.registered).toLocaleString('en-IN') : '—'}</div>
        <div class="user-detail-meta">🛒 Total Orders: <strong>${user.orders || 0}</strong></div>
      </div>
    </div>
    <div class="user-detail-section">
      <div class="user-detail-section-title">Delivery Address</div>
      <div class="user-detail-address">${user.address || 'No address on file.'}</div>
    </div>
    ${userOrders.length > 0 ? `
      <div class="user-detail-section">
        <div class="user-detail-section-title">Order History (${userOrders.length})</div>
        ${userOrders.map(o => `
          <div class="user-order-card">
            <div class="user-order-header">
              <span class="user-order-id">#${o.id}</span>
              <span class="user-order-date">${new Date(o.created_at).toLocaleString('en-IN')}</span>
              <span class="user-order-total">₹${Number(o.total).toLocaleString('en-IN')}</span>
            </div>
            <div class="user-order-items">${(o.items || []).map(i => i.name + ' ×' + i.qty).join(' • ')}</div>
          </div>`).join('')}
      </div>` : '<p style="color:var(--text-light);font-size:1.4rem;margin-top:1.5rem">No orders placed yet.</p>'}`;
  document.getElementById('deleteUserFromModalBtn').dataset.id = id;
  document.getElementById('userDetailModal').classList.add('open');
}

async function deleteUser(id) {
  if (!confirm('Delete this user? This cannot be undone.')) return;
  const ok = await deleteUserFromDB(id);
  document.getElementById('userDetailModal')?.classList.remove('open');
  await renderUsersTable(); renderDashboard();
  if (ok) notify('User deleted.', 'success');
  else    notify('Error deleting user — check DB connection.', 'error');
}

// ===================== NOTIFICATION =====================
function notify(msg, type) {
  const el = document.getElementById('notification'); if (!el) return;
  el.textContent = msg;
  el.className = 'notification show' + (type === 'success' ? ' success' : type === 'error' ? ' error' : '');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await populateCategoryDropdown();
  showView('dashboard');

  document.querySelectorAll('.sidebar-link[data-view]').forEach(link =>
    link.addEventListener('click', () => showView(link.dataset.view))
  );
  document.getElementById('topbarAddProduct')?.addEventListener('click', () => { resetProductForm(); showView('add-product'); });
  document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);
  document.getElementById('cancelProductBtn')?.addEventListener('click', () => { resetProductForm(); showView('products'); });
  document.getElementById('addCategoryBtn')?.addEventListener('click', addCategory);
  document.getElementById('newCategoryName')?.addEventListener('keydown', e => { if (e.key === 'Enter') addCategory(); });
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteConfirm);
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
  document.getElementById('confirmDeleteModal')?.addEventListener('click', e => { if (e.target === document.getElementById('confirmDeleteModal')) closeDeleteConfirm(); });
  document.getElementById('productSearch')?.addEventListener('input',  renderProductsTable);
  document.getElementById('categoryFilter')?.addEventListener('change', renderProductsTable);
  document.getElementById('statusFilter')?.addEventListener('change',  renderProductsTable);
  document.getElementById('userSearch')?.addEventListener('input', () => renderUsersTable());
  document.getElementById('clearAllUsersBtn')?.addEventListener('click', async () => {
    if (!confirm('Delete ALL users? Cannot be undone.')) return;
    const ok = await clearAllUsersFromDB();
    await renderUsersTable(); renderDashboard();
    if (ok) notify('All users deleted.', 'success');
    else    notify('Error — check DB connection.', 'error');
  });
  document.getElementById('closeUserDetailBtn')?.addEventListener('click',       () => document.getElementById('userDetailModal').classList.remove('open'));
  document.getElementById('closeUserDetailBtnFooter')?.addEventListener('click', () => document.getElementById('userDetailModal').classList.remove('open'));
  document.getElementById('deleteUserFromModalBtn')?.addEventListener('click', e => deleteUser(e.currentTarget.dataset.id));
  document.getElementById('userDetailModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('userDetailModal')) document.getElementById('userDetailModal').classList.remove('open');
  });
  document.getElementById('mobileMenuToggle')?.addEventListener('click', () =>
    document.getElementById('adminSidebar')?.classList.toggle('open')
  );
  document.getElementById('saveCatImgBtn')?.addEventListener('click', saveCatImage);
  document.getElementById('cancelCatImgBtn')?.addEventListener('click', closeCatImgModal);
  document.getElementById('cancelCatImgBtnHeader')?.addEventListener('click', closeCatImgModal);
  document.getElementById('catImgUrlInput')?.addEventListener('input', previewCatImg);
  document.getElementById('catImgModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('catImgModal')) closeCatImgModal();
  });
  initCatImgFileUpload();
  initImageUpload();
});
