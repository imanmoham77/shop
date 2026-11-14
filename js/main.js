/* =====================================================
   فایل جاوااسکریپت مشترک سایت HOMEZEE
   این فایل بعد از data.js در همه صفحات بارگذاری می‌شود.
   ===================================================== */


/* ---------- ۱) توابع کمکی ----------
   تبدیل اعداد به فارسی، قالب‌بندی قیمت و محاسبه قیمت بعد از تخفیف */
const toFa = (n) => Number(n).toLocaleString("fa-IR");
const money = (n) => toFa(n) + " " + STORE.currency;
const finalPrice = (p) =>
  p.discount ? Math.round((p.price * (100 - p.discount)) / 100) : p.price;


/* ---------- ۲) سبد خرید ----------
   سبد در حافظه مرورگر (localStorage) ذخیره می‌شود.
   هر آیتم: { id: شناسه محصول, qty: تعداد } */
const CART_KEY = "homezee_cart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product || product.stock === 0) return false;
  if (item) {
    if (item.qty >= product.stock) return false; // بیشتر از موجودی نمی‌شود
    item.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart(cart);
  return true;
}

/* به‌روزرسانی عدد کنار آیکون سبد خرید در منو */
function updateCartBadge() {
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = toFa(total);
  });
}


/* ---------- ۳) نوار منوی سایت ----------
   در همه صفحات با همین تابع ساخته می‌شود تا یک‌جا قابل ویرایش باشد.
   پارامتر active مشخص می‌کند کدام لینک پررنگ شود. */
function renderNavbar(active = "") {
  const link = (href, key, text) =>
    `<a href="${href}" class="${active === key ? "active" : ""}">${text}</a>`;
  document.getElementById("site-header").innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="logo">HOME<span>ZEE</span></a>
        <div class="nav-links" id="nav-links">
          ${link("index.html", "home", "صفحه اصلی")}
          ${link("shop.html", "shop", "فروشگاه")}
          ${link("about.html", "about", "درباره ما")}
          ${link("contact.html", "contact", "تماس با ما")}
        </div>
        <a href="cart.html" class="cart-link">سبد خرید
          <span class="cart-count" data-cart-count>۰</span></a>
        <button class="menu-toggle" id="menu-toggle" aria-label="باز کردن منو">☰</button>
      </div>
    </nav>`;
  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("nav-links").classList.toggle("open");
  });
  updateCartBadge();
}


/* ---------- ۴) فوتر و اطلاعات تماس ---------- */
function renderFooter() {
  const c = STORE.contact;
  document.getElementById("site-footer").innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="logo">HOME<span>ZEE</span></a>
            <p>${STORE.slogan}</p>
          </div>
          <ul class="contact-list">
            <li><span>موبایل</span><a href="tel:${c.mobile}" dir="ltr">${c.mobile}</a></li>
            <li><span>تلفن ثابت</span><a href="tel:${c.phone}" dir="ltr">${c.phone}</a></li>
            <li><span>ایمیل</span><a href="mailto:${c.email}" dir="ltr">${c.email}</a></li>
            <li><span>اینستاگرام</span><a href="${c.instagram}" target="_blank" rel="noopener" dir="ltr">@homzee</a></li>
            <li><span>ایتا</span><a href="${c.eitaa}" target="_blank" rel="noopener" dir="ltr">@zarfomarfeli</a></li>
            <li><span>تلگرام</span><a href="${c.telegram}" target="_blank" rel="noopener" dir="ltr">@homzee</a></li>
            <li><span>روبیکا</span><a href="${c.rubika}" target="_blank" rel="noopener" dir="ltr">@homzee</a></li>
          </ul>
        </div>
        <p class="copyright">© ${STORE.name} — همه حقوق محفوظ است.</p>
      </div>
    </footer>`;
}


/* ---------- ۵) اسلایدر جدیدترین محصولات ----------
   ۵ محصول جدید (isNew) را نمایش می‌دهد و هر ۵ ثانیه خودکار عوض می‌شود */
function renderHeroSlider() {
  const root = document.getElementById("hero");
  if (!root) return;

  const newest = PRODUCTS.filter((p) => p.isNew)
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  root.innerHTML = `
    <div class="hero-track">
      ${newest.map((p, i) => `
        <article class="slide ${i === 0 ? "active" : ""}">
          <div class="slide-text">
            <span class="tag">جدید</span>
            <h2>${p.name}</h2>
            <p>${p.description}</p>
            <span class="slide-price">${money(finalPrice(p))}</span>
            <a class="btn btn-light" href="shop.html?id=${p.id}">مشاهده محصول</a>
          </div>
          <img src="${p.image}" alt="${p.name}">
        </article>`).join("")}
    </div>
    <div class="hero-nav">
      ${newest.map((_, i) => `<button class="hero-dot ${i === 0 ? "active" : ""}" aria-label="اسلاید ${toFa(i + 1)}"></button>`).join("")}
    </div>`;

  const slides = root.querySelectorAll(".slide");
  const dots = root.querySelectorAll(".hero-dot");
  let current = 0, timer;

  function show(n) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }
  function start() { timer = setInterval(() => show(current + 1), 5000); }

  dots.forEach((d, i) => d.addEventListener("click", () => {
    clearInterval(timer); show(i); start();
  }));
  start();
}


/* ---------- ۶) محصولات تخفیف‌خورده با شمارنده معکوس ---------- */
function renderDeals() {
  const root = document.getElementById("deals");
  if (!root) return;

  const deals = PRODUCTS.filter((p) => p.discount && p.discountEnds);
  root.innerHTML = deals.map((p) => `
    <article class="deal-card">
      <a href="shop.html?id=${p.id}" class="deal-img">
        <img src="${p.image}" alt="${p.name}">
        <span class="badge">${toFa(p.discount)}٪ تخفیف</span>
      </a>
      <div class="deal-body">
        <h3>${p.name}</h3>
        <span class="old-price">${money(p.price)}</span><br>
        <span class="new-price">${money(finalPrice(p))}</span>
        <div class="countdown" data-end="${p.discountEnds}"></div>
      </div>
    </article>`).join("");

  /* هر ثانیه زمان باقی‌مانده همه کارت‌ها را به‌روز می‌کند */
  function tick() {
    document.querySelectorAll(".countdown").forEach((el) => {
      const left = Number(el.dataset.end) - Date.now();
      if (left <= 0) { el.outerHTML = `<p class="cd-ended">زمان تخفیف تمام شد</p>`; return; }
      const d = Math.floor(left / 86400000);
      const h = Math.floor((left % 86400000) / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      const box = (v, label) => `<div class="cd-box"><b>${toFa(String(v).padStart(2, "0"))}</b><small>${label}</small></div>`;
      el.innerHTML = box(s, "ثانیه") + box(m, "دقیقه") + box(h, "ساعت") + box(d, "روز");
    });
  }
  tick();
  setInterval(tick, 1000);
}


/* ---------- ۷) دسته‌بندی‌های مادر (ماتریس ۳ در ۳) ----------
   ۸ دسته + یک خانه «همه محصولات» = ۹ خانه */
function renderCategories() {
  const root = document.getElementById("categories");
  if (!root) return;

  const avatar = (c) => /\.(png|jpe?g|webp|svg)$/i.test(c.avatar)
    ? `<img src="${c.avatar}" alt="${c.name}">` : c.avatar;

  root.innerHTML = CATEGORIES.map((c) => `
    <a class="cat-card" href="shop.html?cat=${c.id}">
      <div class="cat-avatar">${avatar(c)}</div>
      <h3>${c.name}</h3>
      <small>${toFa(c.sub.length)} زیردسته</small>
    </a>`).join("") + `
    <a class="cat-card cat-all" href="shop.html">
      <div class="cat-avatar">🛍️</div>
      <h3>همه محصولات</h3>
    </a>`;
}
