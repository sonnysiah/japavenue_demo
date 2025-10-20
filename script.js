
// Mobile nav
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if(hamburger){
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Year
const year = document.getElementById('year');
if(year){ year.textContent = new Date().getFullYear(); }

// CART (localStorage)
const CART_KEY = 'japavenue_cart_v1';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

function updateCartCount(){
  const countEl = document.getElementById('cartCount');
  if(!countEl) return;
  const items = getCart();
  const totalQty = items.reduce((a,i)=>a+i.qty,0);
  countEl.textContent = String(totalQty);
}
updateCartCount();

function addItem(item){
  const items = getCart();
  const idx = items.findIndex(i => i.sku === item.sku);
  if(idx >= 0){ items[idx].qty += 1; }
  else{ items.push({...item, qty:1}); }
  saveCart(items);
  updateCartCount();
}

// Bind Add buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const {name, price, sku} = btn.dataset;
    addItem({name, price: Number(price), sku});
    openCart();
  });
});

// Cart drawer
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartBackdrop = document.getElementById('cartBackdrop');

function openCart(){
  if(!cartDrawer) return;
  cartDrawer.classList.add('open');
  renderCart();
}
function closeCart(){
  if(!cartDrawer) return;
  cartDrawer.classList.remove('open');
}
if(openCartBtn) openCartBtn.addEventListener('click', openCart);
if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if(cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

function renderCart(){
  const items = getCart();
  const wrap = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  if(!wrap) return;
  wrap.innerHTML = items.map(i => `
    <div class="cart-item">
      <img src="images/products/${i.sku?.toLowerCase() || 'placeholder'}.jpg" alt="${i.name}">
      <div>
        <div><strong>${i.name}</strong></div>
        <div class="muted tiny">SKU: ${i.sku}</div>
        <div class="qty">
          <button data-action="dec" data-sku="${i.sku}">−</button>
          <span>${i.qty}</span>
          <button data-action="inc" data-sku="${i.sku}">+</button>
          <button data-action="rm" data-sku="${i.sku}" title="Remove">Remove</button>
        </div>
      </div>
      <div>¥${(i.price * i.qty).toLocaleString('ja-JP')}</div>
    </div>
  `).join('') || '<p class="muted">Your cart is empty.</p>';
  const subtotal = items.reduce((a,i)=>a+i.price*i.qty,0);
  if(subtotalEl) subtotalEl.textContent = '¥' + subtotal.toLocaleString('ja-JP');

  wrap.querySelectorAll('button[data-sku]').forEach(b => {
    b.addEventListener('click', () => {
      const sku = b.dataset.sku;
      const action = b.dataset.action;
      const items = getCart();
      const idx = items.findIndex(i => i.sku === sku);
      if(idx < 0) return;
      if(action === 'inc') items[idx].qty += 1;
      if(action === 'dec') items[idx].qty = Math.max(1, items[idx].qty - 1);
      if(action === 'rm') items.splice(idx,1);
      saveCart(items); renderCart(); updateCartCount();
    });
  });
}

// Shop filters & search
const searchInput = document.getElementById('searchInput');
const chips = document.querySelectorAll('.chip');
const shopGrid = document.getElementById('shopGrid');

function applyFilters(){
  if(!shopGrid) return;
  const q = (searchInput?.value || '').toLowerCase();
  const activeChip = document.querySelector('.chip.active');
  const tag = activeChip ? activeChip.dataset.filter : 'all';
  shopGrid.querySelectorAll('.product').forEach(card => {
    const tags = (card.dataset.tags || '').toLowerCase();
    const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const matchesTag = tag === 'all' || tags.includes(tag);
    const matchesText = !q || name.includes(q) || tags.includes(q);
    card.style.display = (matchesTag && matchesText) ? '' : 'none';
  });
}

chips.forEach(c => {
  c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    applyFilters();
  });
});

if(searchInput) searchInput.addEventListener('input', applyFilters);

// Checkout placeholder on shop page
const summaryItems = document.getElementById('summaryItems');
const summarySubtotal = document.getElementById('summarySubtotal');
function renderSummary(){
  if(!summaryItems) return;
  const items = getCart();
  summaryItems.innerHTML = items.map(i => `
    <div class="line"><span>${i.name} × ${i.qty}</span><span>¥${(i.price*i.qty).toLocaleString('ja-JP')}</span></div>
  `).join('') || '<p class="muted">No items yet.</p>';
  const subtotal = items.reduce((a,i)=>a+i.price*i.qty,0);
  if(summarySubtotal) summarySubtotal.textContent = '¥' + subtotal.toLocaleString('ja-JP');
}
renderSummary();

const placeOrderBtn = document.getElementById('placeOrder');
if(placeOrderBtn){
  placeOrderBtn.addEventListener('click', () => {
    saveCart([]);
    renderCart(); renderSummary(); updateCartCount();
    alert('Demo order placed! (No real charge)');
  });
}

// Contact form demo
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! This is a front-end demo. Connect a backend to receive messages.');
    contactForm.reset();
  });
}
