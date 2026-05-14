/* ===== POCKET TOON — ADMIN JAVASCRIPT ===== */

// ===================== STATE =====================
let products = [];
let editingProductId = null;
let deleteProductId  = null;
let productImages    = [];
let editingCatImgId  = null;

// ===================== DEFAULT CATEGORIES =====================
const DEFAULT_CATEGORIES = [
  { id: 'cat_bey1', name: 'Plastic Gen',  type: 'beyblade', img: 'https://placehold.co/750x750/29abe2/ffffff?text=Plastic+Gen',  caption: 'Classic plastic generation Beyblades' },
  { id: 'cat_bey2', name: 'Metal Gen',    type: 'beyblade', img: 'https://placehold.co/750x750/1565c0/ffffff?text=Metal+Gen',    caption: 'Authentic Takara Tomy Metal Fusion Beyblades' },
  { id: 'cat_bey3', name: 'Burst Gen',    type: 'beyblade', img: 'https://placehold.co/750x750/0c2461/ffffff?text=Burst+Gen',    caption: 'Authentic Takara Tomy Beyblade Burst collection' },
  { id: 'cat_bey4', name: 'Beyblade X',  type: 'beyblade', img: 'https://placehold.co/750x750/0d47a1/ffffff?text=Beyblade+X',  caption: 'The most powerful Beyblade X series' },
  { id: 'cat_ani1',  name: 'One Piece',         type: 'anime', img: 'https://placehold.co/750x750/e65100/ffffff?text=One+Piece',        caption: 'Official One Piece figures' },
  { id: 'cat_ani2',  name: 'Demon Slayer',      type: 'anime', img: 'https://placehold.co/750x750/b71c1c/ffffff?text=Demon+Slayer',     caption: 'Official Demon Slayer figures' },
  { id: 'cat_ani3',  name: 'Spy x Family',      type: 'anime', img: 'https://placehold.co/750x750/e91e63/ffffff?text=Spy+x+Family',     caption: 'Official Spy x Family figures' },
  { id: 'cat_ani4',  name: 'My Hero Academia',  type: 'anime', img: 'https://placehold.co/750x750/1565c0/ffffff?text=My+Hero',           caption: 'Official My Hero Academia figures' },
  { id: 'cat_ani5',  name: 'Tokyo Revengers',   type: 'anime', img: 'https://placehold.co/750x750/37474f/ffffff?text=Tokyo+Revengers',  caption: 'Official Tokyo Revengers figures' },
  { id: 'cat_ani6',  name: 'Waifu Figures',     type: 'anime', img: 'https://placehold.co/750x750/c62828/ffffff?text=Waifu+Figures',    caption: 'Premium waifu anime figures' },
  { id: 'cat_ani7',  name: 'Anime Figures',     type: 'anime', img: 'https://placehold.co/750x750/e65100/ffffff?text=Anime+Figures',    caption: 'Browse the full anime figure collection' },
  { id: 'cat_ani8',  name: 'TenSura',           type: 'anime', img: 'https://placehold.co/750x750/7b1fa2/ffffff?text=TenSura',          caption: 'That Time I Got Reincarnated as a Slime' },
  { id: 'cat_ani9',  name: "Kuroko's Basketball", type: 'anime', img: 'https://placehold.co/750x750/1b5e20/ffffff?text=Kuroko',        caption: 'Original Kuroko Basketball figures' },
  { id: 'cat_ani10', name: 'Game Characters',   type: 'anime', img: 'https://placehold.co/750x750/263238/ffffff?text=Game+Characters', caption: 'Gaming character figures' },
];

// ===================== PERSISTENCE =====================
function loadProducts() {
  const stored = localStorage.getItem('pt_products');
  if (stored) { products = JSON.parse(stored); return; }
  products = [
    { id: 'p1', name: 'Takaratomy Beyblade Burst B-193 Astral Spriggan', vendor: 'TAKARA TOMY', price: 1299, category: 'Burst Gen',   img: 'https://placehold.co/400x400/29abe2/ffffff?text=Burst+Spriggan', images: [], desc: 'Authentic Takara Tomy Beyblade Burst.', inStock: true },
    { id: 'p2', name: 'Monkey D. Luffy Gear 5 — One Piece Figure',        vendor: 'BANPRESTO',   price: 2499, category: 'One Piece',   img: 'https://placehold.co/400x400/e65100/ffffff?text=Luffy',           images: [], desc: 'Official Banpresto One Piece figure.',   inStock: true },
    { id: 'p3', name: 'Tanjiro Kamado Demon Slayer Figure',                vendor: 'BANPRESTO',   price: 1999, category: 'Demon Slayer', img: 'https://placehold.co/400x400/b71c1c/ffffff?text=Tanjiro',       images: [], desc: 'Official Banpresto Demon Slayer figure.', inStock: true },
    { id: 'p4', name: 'Beyblade X BX-11 Dran Sword 3-60F',                vendor: 'TAKARA TOMY', price:  849, category: 'Beyblade X', img: 'https://placehold.co/400x400/0d47a1/ffffff?text=Dran+Sword',      images: [], desc: 'Latest Beyblade X series.',                inStock: true },
    { id: 'p5', name: 'Rimuru Tempest Vol.3 TenSura Figure',               vendor: 'BANPRESTO',   price: 2299, category: 'TenSura',    img: 'https://placehold.co/400x400/7b1fa2/ffffff?text=Rimuru',          images: [], desc: 'Official Banpresto TenSura figure.',      inStock: true },
    { id: 'p6', name: 'Anya Forger — SPY x FAMILY Figure',                 vendor: 'BANPRESTO',   price: 1799, category: 'Spy x Family', img: 'https://placehold.co/400x400/e91e63/ffffff?text=Anya',          images: [], desc: 'Official Banpresto Spy x Family figure.', inStock: true },
    { id: 'p7', name: 'Metal Beyblade BB-47 Earth Eagle Original',         vendor: 'TAKARA TOMY', price:  699, category: 'Metal Gen',  img: 'https://placehold.co/400x400/37474f/ffffff?text=Earth+Eagle',    images: [], desc: 'Original Takara Tomy Metal Fusion.',       inStock: false },
    { id: 'p8', name: 'Deku My Hero Academia Battle Figure',                vendor: 'BANPRESTO',   price: 2199, category: 'My Hero Academia', img: 'https://placehold.co/400x400/1565c0/ffffff?text=Deku',   images: [], desc: 'Official Banpresto MHA figure.',            inStock: true },
  ];
  saveProducts();
}

function saveProducts() { localStorage.setItem('pt_products', JSON.stringify(products)); }

function loadCategories() {
  const stored = localStorage.getItem('pt_categories');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('pt_categories', JSON.stringify(DEFAULT_CATEGORIES));
  return [...DEFAULT_CATEGORIES];
}
function saveCategories(cats) { localStorage.setItem('pt_categories', JSON.stringify(cats)); }

function getUsers()       { return JSON.parse(localStorage.getItem('pt_users') || '[]'); }
function saveUsers(users) { localStorage.setItem('pt_users', JSON.stringify(users)); }

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
  if (viewId === 'categories') renderCategories();
  if (viewId === 'users')      renderUsersTable();
  document.getElementById('adminSidebar')?.classList.remove('open');
}

// ===================== DASHBOARD =====================
function renderDashboard() {
  const inStock = products.filter(p => p.inStock).length;
  const cats  = loadCategories();
  const users = getUsers();
  document.getElementById('stat-products').textContent    = products.length;
  document.getElementById('stat-in-stock').textContent    = inStock;
  document.getElementById('stat-out-stock').textContent   = products.length - inStock;
  document.getElementById('stat-categories').textContent  = cats.length;
  const su = document.getElementById('stat-users'); if (su) su.textContent = users.length;
  const recentList = document.getElementById('recentProductsList');
  if (recentList) { recentList.innerHTML = products.slice(0,5).map(p => renderProductRow(p)).join(''); attachRowListeners(recentList); }
}

// ===================== PRODUCTS TABLE =====================
function renderProductsTable() {
  const filterText   = document.getElementById('productSearch')?.value   || '';
  const filterCat    = document.getElementById('categoryFilter')?.value   || '';
  const filterStatus = document.getElementById('statusFilter')?.value     || '';
  const list = document.getElementById('productsList');
  if (!list) return;
  let filtered = [...products];
  if (filterText) { const q = filterText.toLowerCase(); filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.vendor||'').toLowerCase().includes(q)); }
  if (filterCat)            filtered = filtered.filter(p => p.category === filterCat);
  if (filterStatus === 'in')  filtered = filtered.filter(p =>  p.inStock);
  if (filterStatus === 'out') filtered = filtered.filter(p => !p.inStock);
  if (filtered.length === 0) { list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__title">No Products Found</div><div class="empty-state__desc">Try adjusting your search or add a new product.</div></div>`; return; }
  list.innerHTML = filtered.map(p => renderProductRow(p)).join('');
  attachRowListeners(list);
  const catFilter = document.getElementById('categoryFilter');
  if (catFilter && catFilter.options.length <= 1) {
    loadCategories().forEach(c => { const o = document.createElement('option'); o.value = c.name; o.textContent = c.name; catFilter.appendChild(o); });
  }
}

function renderProductRow(p) {
  return `<div class="product-row" data-id="${p.id}">
    <div class="drag-handle" title="Reorder"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>
    <div class="product-row__img"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div><div class="product-row__name">${p.name}</div><div class="product-row__vendor">${p.vendor||''}</div></div>
    <div class="product-row__price">₹${Number(p.price).toLocaleString('en-IN')}</div>
    <div class="product-row__category">${p.category}</div>
    <span class="badge ${p.inStock ? 'badge-in-stock' : 'badge-out-of-stock'}">${p.inStock ? 'In Stock' : 'Out of Stock'}</span>
    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer"><input type="checkbox" class="toggle-stock" data-id="${p.id}" ${p.inStock?'checked':''} style="accent-color:var(--success);width:1.5rem;height:1.5rem;cursor:pointer"></label>
    <div class="row-actions">
      <button class="action-btn edit-btn" data-id="${p.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="action-btn danger delete-btn" data-id="${p.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
    </div>
  </div>`;
}

function attachRowListeners(container) {
  container.querySelectorAll('.edit-btn').forEach(btn   => btn.addEventListener('click', () => startEditProduct(btn.dataset.id)));
  container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.id)));
  container.querySelectorAll('.toggle-stock').forEach(chk => chk.addEventListener('change', () => {
    const p = products.find(p => p.id === chk.dataset.id);
    if (p) { p.inStock = chk.checked; saveProducts(); notify(p.inStock ? 'Marked as In Stock' : 'Marked as Out of Stock', 'success'); renderProductsTable(); }
  }));
}

// ===================== ADD / EDIT PRODUCT =====================
function populateCategoryDropdown() {
  const select = document.getElementById('fieldCategory'); if (!select) return;
  const cats = loadCategories(); const current = select.value;
  select.innerHTML = '<option value="">Select Category</option>';
  cats.forEach(c => { const o = document.createElement('option'); o.value = c.name; o.textContent = c.name + (c.type==='beyblade'?' 🪀':' 🎌'); select.appendChild(o); });
  if (current) select.value = current;
}

function resetProductForm() {
  ['fieldName','fieldVendor','fieldPrice','fieldCategory','fieldDesc'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
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
  populateCategoryDropdown();
  document.getElementById('fieldCategory').value = p.category;
  productImages = p.images && p.images.length ? [...p.images] : p.img ? [p.img] : [];
  renderImagePreviews(); showView('add-product');
}

function saveProduct() {
  const name     = document.getElementById('fieldName').value.trim();
  const vendor   = document.getElementById('fieldVendor').value.trim();
  const price    = parseFloat(document.getElementById('fieldPrice').value);
  const category = document.getElementById('fieldCategory').value;
  const inStock  = document.getElementById('fieldInStock').checked;
  const desc     = document.getElementById('fieldDesc').value.trim();
  if (!name)                     { notify('Product name is required.', 'error'); return; }
  if (isNaN(price) || price < 0) { notify('Please enter a valid price.', 'error'); return; }
  if (!category)                 { notify('Please select a category.', 'error'); return; }
  const img = productImages[0] || 'https://placehold.co/400x400/29abe2/ffffff?text=Product';
  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx > -1) products[idx] = { ...products[idx], name, vendor, price, category, inStock, desc, img, images: [...productImages] };
    notify('Product updated!', 'success');
  } else {
    products.unshift({ id: 'p_' + Date.now(), name, vendor, price, category, inStock, desc, img, images: [...productImages] });
    notify('Product added!', 'success');
  }
  saveProducts(); resetProductForm(); showView('products');
}

// ===================== IMAGES =====================
function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid'); if (!grid) return;
  grid.innerHTML = productImages.map((src, i) => `
    <div class="image-preview-item" data-idx="${i}">
      <img src="${src}" alt="Image ${i+1}">
      <button class="remove-img" data-idx="${i}" title="Remove">×</button>
      ${i===0?'<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(21,101,192,0.75);color:#fff;font-size:1rem;text-align:center;padding:0.2rem">Main</div>':''}
    </div>`).join('');
  grid.querySelectorAll('.remove-img').forEach(btn => btn.addEventListener('click', () => { productImages.splice(parseInt(btn.dataset.idx),1); renderImagePreviews(); }));
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
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) { productImages.push(url); renderImagePreviews(); urlInput.value = ''; }
    else notify('Please enter a valid image URL.', 'error');
  });
}

function handleFiles(files) {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => { productImages.push(e.target.result); renderImagePreviews(); };
    reader.readAsDataURL(file);
  });
}

// ===================== DELETE PRODUCT =====================
function openDeleteConfirm(id) {
  const p = products.find(p => p.id === id); if (!p) return;
  deleteProductId = id;
  document.getElementById('deleteProductName').textContent = p.name;
  document.getElementById('confirmDeleteModal').classList.add('open');
}
function closeDeleteConfirm() { document.getElementById('confirmDeleteModal').classList.remove('open'); deleteProductId = null; }
function confirmDelete() {
  if (!deleteProductId) return;
  products = products.filter(p => p.id !== deleteProductId);
  saveProducts(); closeDeleteConfirm();
  notify('Product deleted.', 'success'); renderProductsTable(); renderDashboard();
}

// ===================== CATEGORIES =====================
function renderCategories() {
  const cats = loadCategories();
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
  const count = products.filter(p => p.category === c.name).length;
  const imgSrc = c.img || ('https://placehold.co/200x200/29abe2/ffffff?text=' + encodeURIComponent(c.name));
  return `
    <div class="category-card" data-id="${c.id}">
      <div class="category-card__img-wrap">
        <img class="category-card__img" src="${imgSrc}" alt="${c.name}" loading="lazy">
        <button class="category-card__img-overlay-btn cat-img-btn" data-id="${c.id}" title="Change image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Change Image
        </button>
      </div>
      <div class="category-card__body">
        <div class="category-card__name">${c.name}</div>
        <div class="category-card__count">${count} product${count!==1?'s':''} &bull; ${c.type==='beyblade'?'🪀 Beyblade':'🎌 Anime'}</div>
        <div class="category-card__caption">${c.caption || ''}</div>
        <div class="category-card__actions">
          <button class="btn btn-outline cat-rename-btn" data-id="${c.id}">Rename</button>
          <button class="btn cat-img-btn" data-id="${c.id}" style="background:var(--blue-primary);color:white;border:none">📷 Image</button>
          <button class="btn btn-danger cat-delete-btn" data-id="${c.id}">Delete</button>
        </div>
      </div>
    </div>`;
}

function addCategory() {
  const nameInput  = document.getElementById('newCategoryName');
  const typeSelect = document.getElementById('newCategoryType');
  const name = nameInput.value.trim();
  if (!name) { notify('Please enter a category name.', 'error'); return; }
  const cats = loadCategories();
  if (cats.find(c => c.name.toLowerCase() === name.toLowerCase())) { notify('Category already exists.', 'error'); return; }
  cats.push({ id: 'cat_' + Date.now(), name, type: typeSelect.value, img: 'https://placehold.co/750x750/29abe2/ffffff?text=' + encodeURIComponent(name), caption: 'Shop ' + name + ' collection' });
  saveCategories(cats); nameInput.value = '';
  renderCategories(); populateCategoryDropdown(); notify('Category added!', 'success');
}

function renameCategory(id) {
  const cats = loadCategories(); const cat = cats.find(c => c.id === id); if (!cat) return;
  const newName = prompt('Rename "' + cat.name + '" to:', cat.name);
  if (!newName || newName.trim() === cat.name) return;
  const trimmed = newName.trim();
  if (cats.find(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== id)) { notify('Another category with that name already exists.', 'error'); return; }
  products.forEach(p => { if (p.category === cat.name) p.category = trimmed; });
  saveProducts(); cat.name = trimmed; saveCategories(cats);
  renderCategories(); populateCategoryDropdown(); notify('Category renamed!', 'success');
}

function deleteCategory(id) {
  const cats = loadCategories(); const cat = cats.find(c => c.id === id); if (!cat) return;
  const count = products.filter(p => p.category === cat.name).length;
  if (count > 0) { notify('Cannot delete — ' + count + ' product(s) use this category.', 'error'); return; }
  saveCategories(cats.filter(c => c.id !== id));
  renderCategories(); populateCategoryDropdown(); notify('Category deleted.', 'success');
}

// ===================== CATEGORY IMAGE MODAL =====================
function openCatImgModal(id) {
  editingCatImgId = id;
  const cats = loadCategories(); const cat = cats.find(c => c.id === id); if (!cat) return;
  document.getElementById('catImgModalTitle').textContent = 'Change Image — ' + cat.name;
  document.getElementById('catImgUrlInput').value   = cat.img || '';
  document.getElementById('catImgCaption').value    = cat.caption || '';
  document.getElementById('catImgPreview').src      = cat.img || '';
  document.getElementById('catImgPreview').style.display = cat.img ? 'block' : 'none';
  document.getElementById('catImgModal').classList.add('open');
}

function closeCatImgModal() {
  document.getElementById('catImgModal').classList.remove('open');
  editingCatImgId = null;
}

function saveCatImage() {
  if (!editingCatImgId) return;
  const cats    = loadCategories();
  const cat     = cats.find(c => c.id === editingCatImgId); if (!cat) return;
  const url     = document.getElementById('catImgUrlInput').value.trim();
  const caption = document.getElementById('catImgCaption').value.trim();
  if (!url) { notify('Please enter an image URL.', 'error'); return; }
  cat.img     = url;
  cat.caption = caption;
  saveCategories(cats); closeCatImgModal(); renderCategories();
  notify('Category image updated!', 'success');
}

function previewCatImg() {
  const url = document.getElementById('catImgUrlInput').value.trim();
  const preview = document.getElementById('catImgPreview');
  if (url) { preview.src = url; preview.style.display = 'block'; preview.onerror = () => { preview.src=''; preview.style.display='none'; notify('Could not load image from that URL.','error'); }; }
  else { preview.src = ''; preview.style.display = 'none'; }
}

function initCatImgFileUpload() {
  const fileInput = document.getElementById('catImgFileInput');
  if (!fileInput) return;
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('catImgUrlInput').value = e.target.result;
      const preview = document.getElementById('catImgPreview');
      preview.src = e.target.result; preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });
}

// ===================== USERS =====================
function renderUsersTable() {
  const filterText = document.getElementById('userSearch')?.value || '';
  const list = document.getElementById('usersList'); if (!list) return;
  let users = getUsers();
  const countEl = document.getElementById('usersCount'); if (countEl) countEl.textContent = users.length + ' user' + (users.length!==1?'s':'');
  if (filterText) { const q = filterText.toLowerCase(); users = users.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q) || (u.phone||'').toLowerCase().includes(q)); }
  if (users.length === 0) { list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__title">No Users Yet</div><div class="empty-state__desc">Users who checkout on the store will appear here.</div></div>`; return; }
  list.innerHTML = users.map((u, i) => `
    <div class="user-row" data-id="${u.id}">
      <div class="user-row__num">${i+1}</div>
      <div class="user-row__name">${u.name||'—'}</div>
      <div class="user-row__email">${u.email||'—'}</div>
      <div class="user-row__phone">${u.phone||'—'}</div>
      <div class="user-row__date">${u.registered ? new Date(u.registered).toLocaleDateString('en-IN') : '—'}</div>
      <div class="user-row__orders">${u.orders||0}</div>
      <div class="row-actions">
        <button class="action-btn view-user-btn" data-id="${u.id}" title="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="action-btn danger delete-user-btn" data-id="${u.id}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
      </div>
    </div>`).join('');
  list.querySelectorAll('.view-user-btn').forEach(btn   => btn.addEventListener('click', () => openUserDetail(btn.dataset.id)));
  list.querySelectorAll('.delete-user-btn').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.id)));
}

function openUserDetail(id) {
  const users = getUsers(); const user = users.find(u => u.id === id); if (!user) return;
  const allOrders  = JSON.parse(localStorage.getItem('pt_orders') || '[]');
  const userOrders = allOrders.filter(o => o.userId === id);
  document.getElementById('userDetailBody').innerHTML = `
    <div class="user-detail-grid">
      <div class="user-detail-avatar">${(user.name||'U')[0].toUpperCase()}</div>
      <div class="user-detail-info">
        <div class="user-detail-name">${user.name||'—'}</div>
        <div class="user-detail-meta">📧 ${user.email||'—'}</div>
        <div class="user-detail-meta">📱 ${user.phone||'—'}</div>
        <div class="user-detail-meta">📅 Registered: ${user.registered ? new Date(user.registered).toLocaleString('en-IN') : '—'}</div>
        <div class="user-detail-meta">🛒 Total Orders: <strong>${user.orders||0}</strong></div>
      </div>
    </div>
    <div class="user-detail-section">
      <div class="user-detail-section-title">Delivery Address</div>
      <div class="user-detail-address">${user.address||'No address on file.'}</div>
    </div>
    ${userOrders.length > 0 ? `
      <div class="user-detail-section">
        <div class="user-detail-section-title">Order History (${userOrders.length})</div>
        ${userOrders.map(o => `
          <div class="user-order-card">
            <div class="user-order-header">
              <span class="user-order-id">#${o.id.split('_')[1]||o.id}</span>
              <span class="user-order-date">${new Date(o.date).toLocaleString('en-IN')}</span>
              <span class="user-order-total">₹${Number(o.total).toLocaleString('en-IN')}</span>
            </div>
            <div class="user-order-items">${o.items.map(i => i.name+' ×'+i.qty).join(' • ')}</div>
          </div>`).join('')}
      </div>` : '<p style="color:var(--text-light);font-size:1.4rem;margin-top:1.5rem">No orders placed yet.</p>'}`;
  document.getElementById('deleteUserFromModalBtn').dataset.id = id;
  document.getElementById('userDetailModal').classList.add('open');
}

function deleteUser(id) {
  if (!confirm('Delete this user? This cannot be undone.')) return;
  saveUsers(getUsers().filter(u => u.id !== id));
  document.getElementById('userDetailModal')?.classList.remove('open');
  renderUsersTable(); renderDashboard(); notify('User deleted.', 'success');
}

// ===================== NOTIFICATION =====================
function notify(msg, type) {
  const el = document.getElementById('notification'); if (!el) return;
  el.textContent = msg;
  el.className = 'notification show' + (type==='success'?' success':type==='error'?' error':'');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  document.querySelectorAll('.sidebar-link[data-view]').forEach(link => link.addEventListener('click', () => showView(link.dataset.view)));
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
  document.getElementById('clearAllUsersBtn')?.addEventListener('click', () => {
    if (confirm('Delete ALL users? Cannot be undone.')) { saveUsers([]); renderUsersTable(); renderDashboard(); notify('All users deleted.', 'success'); }
  });
  document.getElementById('closeUserDetailBtn')?.addEventListener('click',       () => document.getElementById('userDetailModal').classList.remove('open'));
  document.getElementById('closeUserDetailBtnFooter')?.addEventListener('click', () => document.getElementById('userDetailModal').classList.remove('open'));
  document.getElementById('deleteUserFromModalBtn')?.addEventListener('click', e => deleteUser(e.currentTarget.dataset.id));
  document.getElementById('userDetailModal')?.addEventListener('click', e => { if (e.target === document.getElementById('userDetailModal')) document.getElementById('userDetailModal').classList.remove('open'); });
  document.getElementById('mobileMenuToggle')?.addEventListener('click', () => document.getElementById('adminSidebar')?.classList.toggle('open'));

  // Category Image Modal
  document.getElementById('saveCatImgBtn')?.addEventListener('click', saveCatImage);
  document.getElementById('cancelCatImgBtn')?.addEventListener('click', closeCatImgModal);
  document.getElementById('catImgUrlInput')?.addEventListener('input', previewCatImg);
  document.getElementById('catImgModal')?.addEventListener('click', e => { if (e.target === document.getElementById('catImgModal')) closeCatImgModal(); });
  initCatImgFileUpload();

  initImageUpload();
  populateCategoryDropdown();
  showView('dashboard');
});
