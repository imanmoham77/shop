/* =====================================================
   منطق صفحه فروشگاه
   فیلتر دسته‌بندی، نمایش ماتریس ۳ در ۳، جزئیات و افزودن به سبد
   ===================================================== */


/* ---------- ۱) وضعیت صفحه ----------
   دسته و زیردسته از آدرس صفحه خوانده می‌شود (مثلاً shop.html?cat=wood) */
const params = new URLSearchParams(location.search);
const state = {
  cat: params.get("cat") || "",
  sub: params.get("sub") || "",
  page: 1
};
const PER_PAGE = 9; // هر صفحه ۹ محصول = ماتریس ۳ در ۳


/* ---------- ۲) نوار فیلتر دسته‌بندی و زیردسته ---------- */
function renderFilters() {
  const root = document.getElementById("filters");

  let html = `<div class="filters">
    <button class="chip ${!state.cat ? "active" : ""}" data-cat="">همه</button>
    ${CATEGORIES.map((c) =>
      `<button class="chip ${state.cat === c.id ? "active" : ""}" data-cat="${c.id}">${c.name}</button>`
    ).join("")}
  </div>`;

  /* زیردسته‌ها فقط وقتی یک دسته مادر انتخاب شده نمایش داده می‌شوند */
  const parent = CATEGORIES.find((c) => c.id === state.cat);
  if (parent) {
    html += `<div class="filters">
      <button class="chip chip-sub ${!state.sub ? "active" : ""}" data-sub="">همه ${parent.name}</button>
      ${parent.sub.map((s) =>
        `<button class="chip chip-sub ${state.sub === s ? "active" : ""}" data-sub="${s}">${s}</button>`
      ).join("")}
    </div>`;
  }
  root.innerHTML = html;
}


/* ---------- ۳) کارت محصول ----------
   قیمت، موجودی و عکس؛ دکمه افزودن به سبد با هاور ظاهر می‌شود */
function stockLabel(p) {
  if (p.stock === 0) return `<span class="stock out">ناموجود</span>`;
  if (p.stock <= 5) return `<span class="stock low">فقط ${toFa(p.stock)} عدد مانده</span>`;
  return `<span class="stock">موجودی: ${toFa(p.stock)} عدد</span>`;
}

function priceLabel(p) {
  return p.discount
    ? `<span class="price">${money(finalPrice(p))}</span><span class="old-price">${money(p.price)}</span>`
    : `<span class="price">${money(p.price)}</span>`;
}

function productCard(p) {
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media" data-open="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="add-btn" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
          ${p.stock === 0 ? "ناموجود" : "افزودن به سبد خرید"}
        </button>
      </div>
      <div class="product-info">
        <h3 data-open="${p.id}">${p.name}</h3>
        <div class="price-row">${priceLabel(p)}</div>
        ${stockLabel(p)}
      </div>
    </article>`;
}


/* ---------- ۴) نمایش شبکه محصولات و صفحه‌بندی ---------- */
function renderProducts() {
  const list = PRODUCTS.filter((p) =>
    (!state.cat || p.category === state.cat) && (!state.sub || p.sub === state.sub)
  );

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  state.page = Math.min(state.page, pages);
  const visible = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

  document.getElementById("result-count").textContent = `${toFa(list.length)} محصول`;
  document.getElementById("product-grid").innerHTML = visible.length
    ? visible.map(productCard).join("")
    : `<p class="empty">محصولی در این دسته‌بندی پیدا نشد. دسته دیگری را امتحان کنید.</p>`;

  document.getElementById("pagination").innerHTML = pages > 1
    ? Array.from({ length: pages }, (_, i) =>
        `<button class="page-btn ${state.page === i + 1 ? "active" : ""}" data-page="${i + 1}">${toFa(i + 1)}</button>`
      ).join("")
    : "";
}

/* به‌روزرسانی آدرس مرورگر بدون بارگذاری مجدد صفحه */
function syncUrl() {
  const q = new URLSearchParams();
  if (state.cat) q.set("cat", state.cat);
  if (state.sub) q.set("sub", state.sub);
  history.replaceState(null, "", q.toString() ? "?" + q : location.pathname);
}


/* ---------- ۵) پیام کوتاه بعد از افزودن به سبد ---------- */
let toastTimer;
function showToast(text) {
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

function handleAdd(id) {
  const ok = addToCart(id);
  showToast(ok ? "به سبد خرید اضافه شد" : "به حداکثر موجودی این محصول رسیده‌اید");
}


/* ---------- ۶) پنجره جزئیات محصول ----------
   توضیحات، رنگ‌ها و موجودی کامل محصول */
function openProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const cat = CATEGORIES.find((c) => c.id === p.category);

  const dlg = document.getElementById("product-modal");
  dlg.innerHTML = `
    <button class="modal-close" data-close aria-label="بستن">×</button>
    <div class="modal-body">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <h2>${p.name}</h2>
        <div class="price-row">${priceLabel(p)}</div>
        <p>${p.description}</p>
        <ul class="meta">
          <li><span>دسته‌بندی:</span>${cat ? cat.name : ""} / ${p.sub}</li>
          <li><span>رنگ:</span><div class="color-dots">${p.colors.map((c) => `<em>${c}</em>`).join("")}</div></li>
          <li><span>موجودی:</span>${p.stock === 0 ? "ناموجود" : toFa(p.stock) + " عدد"}</li>
        </ul>
        <button class="btn" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
          ${p.stock === 0 ? "ناموجود" : "افزودن به سبد خرید"}
        </button>
      </div>
    </div>`;
  dlg.showModal();
}


/* ---------- ۷) رویدادهای کلیک ----------
   یک شنونده برای کل صفحه (کلیک روی چیپ‌ها، دکمه‌ها، عکس‌ها و صفحه‌بندی) */
document.addEventListener("click", (e) => {
  const t = e.target;

  const cat = t.closest("[data-cat]");
  if (cat) { state.cat = cat.dataset.cat; state.sub = ""; state.page = 1; syncUrl(); renderFilters(); renderProducts(); return; }

  const sub = t.closest("[data-sub]");
  if (sub) { state.sub = sub.dataset.sub; state.page = 1; syncUrl(); renderFilters(); renderProducts(); return; }

  const page = t.closest("[data-page]");
  if (page) { state.page = Number(page.dataset.page); renderProducts(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

  const add = t.closest("[data-add]");
  if (add) { handleAdd(Number(add.dataset.add)); return; }

  const open = t.closest("[data-open]");
  if (open) { openProduct(Number(open.dataset.open)); return; }

  /* بستن پنجره با دکمه × یا کلیک روی پس‌زمینه تیره */
  if (t.closest("[data-close]") || t.id === "product-modal") {
    document.getElementById("product-modal").close();
  }
});


/* ---------- ۸) شروع ----------
   اگر آدرس شامل ?id= بود (مثلاً از اسلایدر)، جزئیات همان محصول باز می‌شود */
renderNavbar("shop");
renderFilters();
renderProducts();
renderFooter();

const initialId = Number(params.get("id"));
if (initialId) openProduct(initialId);
