/* =====================================================
   منطق پنل مدیریت HOMEZEE (بدون سرور)
   - محصولات و دسته‌ها در مرورگر شما ویرایش می‌شوند (پیش‌نویس)
   - با دکمه «دانلود data.js» فایل جدید ساخته می‌شود
   - آن فایل را جایگزین js/data.js در گیت‌هاب کنید تا سایت به‌روز شود
   ===================================================== */


/* ---------- ۱) توابع کمکی ---------- */
const $ = (id) => document.getElementById(id);
const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* تبدیل ارقام فارسی/عربی به انگلیسی و عدد کردن ورودی */
const enDigits = (s) => String(s)
  .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
  .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const toNum = (v) => Number(enDigits(v).replace(/[,٬\s]/g, ""));
const fa = (n) => Number(n).toLocaleString("fa-IR");


/* ---------- ۲) پایگاه داده پیش‌نویس ----------
   اگر قبلاً تغییری ذخیره کرده باشید از پیش‌نویس خوانده می‌شود،
   وگرنه از فایل data.js فعلی سایت */
const DRAFT_KEY = "homezee_admin_draft";
let db;
let tab = "products";
let search = "";
let editingId = null; // شناسه محصول یا دسته‌ای که در پنجره باز است

const liveData = () => ({ STORE: clone(STORE), CATEGORIES: clone(CATEGORIES), PRODUCTS: clone(PRODUCTS) });

function loadDb() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      /* اگر پیش‌نویس با سایت فعلی یکی شده (یعنی فایل را آپلود کرده‌اید)، پاک می‌شود */
      if (JSON.stringify(draft) === JSON.stringify(liveData())) {
        localStorage.removeItem(DRAFT_KEY);
      } else {
        db = draft;
        return;
      }
    }
  } catch (e) { /* پیش‌نویس خراب است؛ نادیده گرفته می‌شود */ }
  db = liveData();
}

function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(db)); } catch (e) {
    alert("ذخیره پیش‌نویس در مرورگر ممکن نشد. فوراً فایل data.js را دانلود کنید.");
  }
  renderBanner();
}

const hasDraft = () => !!localStorage.getItem(DRAFT_KEY);


/* ---------- ۳) پیام وضعیت بالای صفحه ---------- */
function renderBanner() {
  $("admin-banner").innerHTML = hasDraft()
    ? `<div class="banner warn">
         <span>تغییرات شما هنوز روی سایت اعمال نشده است. فایل <b dir="ltr">data.js</b> را دانلود کنید و در گیت‌هاب جایگزین کنید.</span>
         <span class="banner-btns">
           <button class="btn btn-sm" data-export>دانلود data.js</button>
           <button class="btn btn-outline btn-sm" data-discard>حذف تغییرات</button>
         </span>
       </div>`
    : `<div class="banner ok">اطلاعات نمایش‌داده‌شده همان نسخه فعلی سایت است.</div>`;
}


/* ---------- ۴) تب محصولات ---------- */
const catName = (id) => (db.CATEGORIES.find((c) => c.id === id) || {}).name || "—";

function renderProducts() {
  const q = search.trim();
  const list = db.PRODUCTS.filter((p) => !q || p.name.includes(q));
  $("admin-root").innerHTML = `
    <div class="toolbar">
      <input id="search" class="search" placeholder="جستجوی نام محصول..." value="${esc(search)}">
      <button class="btn" data-new-product>+ افزودن محصول</button>
    </div>
    <p class="result-count">${fa(list.length)} محصول</p>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>عکس</th><th>نام</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>تخفیف</th><th></th></tr></thead>
        <tbody>
          ${list.map((p) => `
            <tr>
              <td><img src="${esc(p.image)}" alt="" class="thumb"></td>
              <td>${esc(p.name)}${p.isNew ? ' <span class="tag mini">جدید</span>' : ""}</td>
              <td>${esc(catName(p.category))}<br><small>${esc(p.sub)}</small></td>
              <td>${fa(p.price)}</td>
              <td>${p.stock === 0 ? '<b class="out">ناموجود</b>' : fa(p.stock)}</td>
              <td>${p.discount ? fa(p.discount) + "٪" : "—"}</td>
              <td class="row-btns">
                <button class="btn btn-outline btn-sm" data-edit-product="${p.id}">ویرایش</button>
                <button class="btn btn-danger btn-sm" data-del-product="${p.id}">حذف</button>
              </td>
            </tr>`).join("") || `<tr><td colspan="7" class="empty">محصولی پیدا نشد.</td></tr>`}
        </tbody>
      </table>
    </div>`;
}


/* ---------- ۵) فرم افزودن/ویرایش محصول ---------- */
const subOptions = (catId, selected) =>
  ((db.CATEGORIES.find((c) => c.id === catId) || { sub: [] }).sub)
    .map((s) => `<option ${s === selected ? "selected" : ""}>${esc(s)}</option>`).join("");

/* تبدیل زمان (میلی‌ثانیه) به مقدار فیلد تاریخ و ساعت */
const toLocalInput = (ms) => new Date(ms - new Date(ms).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function openProductForm(id) {
  const p = id ? db.PRODUCTS.find((x) => x.id === id) : null;
  editingId = id || null;
  if (!db.CATEGORIES.length) { alert("ابتدا یک دسته‌بندی بسازید."); return; }
  const cat = p ? p.category : db.CATEGORIES[0].id;
  const realImage = p && !p.image.startsWith("data:") ? p.image : "";

  $("admin-dialog").innerHTML = `
    <button class="modal-close" data-close aria-label="بستن" type="button">×</button>
    <form id="product-form" class="dlg-form" novalidate>
      <h2>${p ? "ویرایش محصول" : "افزودن محصول"}</h2>
      <div class="form-grid">
        <label class="field full"><span>نام محصول</span>
          <input name="pname" value="${p ? esc(p.name) : ""}"></label>
        <label class="field"><span>دسته‌بندی مادر</span>
          <select name="pcat" id="pcat">
            ${db.CATEGORIES.map((c) => `<option value="${esc(c.id)}" ${c.id === cat ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
          </select></label>
        <label class="field"><span>زیردسته</span>
          <select name="psub" id="psub">${subOptions(cat, p && p.sub)}</select></label>
        <label class="field"><span>قیمت (تومان)</span>
          <input name="pprice" inputmode="numeric" value="${p ? p.price : ""}"></label>
        <label class="field"><span>موجودی (تعداد)</span>
          <input name="pstock" inputmode="numeric" value="${p ? p.stock : ""}"></label>
        <label class="field full"><span>رنگ‌ها (با ویرگول جدا کنید)</span>
          <input name="pcolors" placeholder="سفید، مشکی" value="${p ? esc(p.colors.join("، ")) : ""}"></label>
        <label class="field"><span>درصد تخفیف (خالی = بدون تخفیف)</span>
          <input name="pdiscount" inputmode="numeric" value="${p && p.discount ? p.discount : ""}"></label>
        <label class="field"><span>پایان تخفیف</span>
          <input name="pends" type="datetime-local" value="${p && p.discountEnds ? toLocalInput(p.discountEnds) : ""}"></label>
        <label class="field full"><span>مسیر عکس (خالی = تصویر موقت)</span>
          <input name="pimage" dir="ltr" placeholder="images/products/plate.jpg" value="${esc(realImage)}">
          <input type="file" id="pfile" accept="image/*" class="file-pick">
          <small class="hint">پس از انتخاب فایل، فقط مسیر نوشته می‌شود؛ خود عکس را باید در گیت‌هاب داخل پوشه <b dir="ltr">images/products</b> آپلود کنید.</small></label>
        <label class="field full"><span>توضیحات</span>
          <textarea name="pdesc">${p ? esc(p.description) : ""}</textarea></label>
        <label class="check full"><input type="checkbox" name="pnew" ${p && p.isNew ? "checked" : ""}> نمایش در اسلایدر «جدیدترین‌ها»</label>
      </div>
      <p class="form-error" id="form-error"></p>
      <div class="dlg-actions">
        <button class="btn" type="submit">ذخیره</button>
        <button class="btn btn-outline" type="button" data-close>انصراف</button>
      </div>
    </form>`;
  $("admin-dialog").showModal();
}

function saveProduct(form) {
  const f = form.elements;
  const errors = [];

  const name = f.pname.value.trim();
  const price = toNum(f.pprice.value);
  const stock = toNum(f.pstock.value);
  const discount = f.pdiscount.value.trim() ? toNum(f.pdiscount.value) : 0;
  const colors = f.pcolors.value.split(/[,،]/).map((c) => c.trim()).filter(Boolean);

  if (name.length < 2) errors.push("نام محصول را وارد کنید.");
  if (!Number.isInteger(price) || price <= 0) errors.push("قیمت باید یک عدد صحیح بزرگ‌تر از صفر باشد.");
  if (!Number.isInteger(stock) || stock < 0) errors.push("موجودی باید عدد صحیح و صفر یا بیشتر باشد.");
  if (!Number.isInteger(discount) || discount < 0 || discount > 90) errors.push("تخفیف باید بین ۰ تا ۹۰ باشد.");
  if (discount > 0 && !f.pends.value) errors.push("برای تخفیف، زمان پایان را مشخص کنید (برای شمارنده لازم است).");

  if (errors.length) { $("form-error").innerHTML = errors.join("<br>"); return; }

  const image = f.pimage.value.trim() || placeholderImg(name);
  const product = {
    id: editingId || Math.max(0, ...db.PRODUCTS.map((p) => p.id)) + 1,
    name,
    category: f.pcat.value,
    sub: f.psub.value,
    price,
    stock,
    colors: colors.length ? colors : ["—"],
    description: f.pdesc.value.trim(),
    image,
    isNew: f.pnew.checked
  };
  if (discount > 0) {
    product.discount = discount;
    product.discountEnds = new Date(f.pends.value).getTime();
  }

  const i = db.PRODUCTS.findIndex((p) => p.id === product.id);
  if (i >= 0) db.PRODUCTS[i] = product; else db.PRODUCTS.push(product);
  saveDraft();
  $("admin-dialog").close();
  renderProducts();
}

function deleteProduct(id) {
  const p = db.PRODUCTS.find((x) => x.id === id);
  if (p && confirm(`محصول «${p.name}» حذف شود؟`)) {
    db.PRODUCTS = db.PRODUCTS.filter((x) => x.id !== id);
    saveDraft();
    renderProducts();
  }
}


/* ---------- ۶) تب دسته‌بندی‌ها ---------- */
const isImagePath = (a) => /\.(png|jpe?g|webp|svg)$/i.test(a);
const usedCount = (catId, sub) =>
  db.PRODUCTS.filter((p) => p.category === catId && (sub === undefined || p.sub === sub)).length;

function renderCategories() {
  $("admin-root").innerHTML = `
    <div class="toolbar">
      <p class="hint">دسته مادر جدید بسازید و برای هر کدام زیردسته اضافه کنید.</p>
      <button class="btn" data-new-cat>+ دسته مادر جدید</button>
    </div>
    <div class="cat-admin-grid">
      ${db.CATEGORIES.map((c) => `
        <div class="cat-admin">
          <div class="cat-admin-head">
            <div class="cat-avatar sm">${isImagePath(c.avatar) ? `<img src="${esc(c.avatar)}" alt="">` : esc(c.avatar)}</div>
            <div><b>${esc(c.name)}</b><br><small dir="ltr">${esc(c.id)} · ${fa(usedCount(c.id))} محصول</small></div>
          </div>
          <div class="filters">
            ${c.sub.map((s, i) => `<span class="chip chip-sub">${esc(s)}
              <button class="x" data-rm-sub="${esc(c.id)}" data-idx="${i}" aria-label="حذف زیردسته">×</button></span>`).join("")}
          </div>
          <div class="sub-add">
            <input data-sub-input="${esc(c.id)}" placeholder="زیردسته جدید...">
            <button class="btn btn-sm" data-add-sub="${esc(c.id)}">افزودن</button>
          </div>
          <div class="row-btns">
            <button class="btn btn-outline btn-sm" data-edit-cat="${esc(c.id)}">ویرایش</button>
            <button class="btn btn-danger btn-sm" data-del-cat="${esc(c.id)}">حذف</button>
          </div>
        </div>`).join("")}
    </div>`;
}

function openCatForm(id) {
  const c = id ? db.CATEGORIES.find((x) => x.id === id) : null;
  editingId = id || null;
  $("admin-dialog").innerHTML = `
    <button class="modal-close" data-close aria-label="بستن" type="button">×</button>
    <form id="cat-form" class="dlg-form" novalidate>
      <h2>${c ? "ویرایش دسته مادر" : "دسته مادر جدید"}</h2>
      <div class="form-grid">
        <label class="field full"><span>نام دسته</span>
          <input name="cname" value="${c ? esc(c.name) : ""}"></label>
        <label class="field"><span>شناسه انگلیسی (بدون فاصله)</span>
          <input name="cid" dir="ltr" placeholder="glass" value="${c ? esc(c.id) : ""}" ${c ? "disabled" : ""}></label>
        <label class="field"><span>آواتار (ایموجی یا مسیر عکس)</span>
          <input name="cavatar" placeholder="🍽️" value="${c ? esc(c.avatar) : ""}"></label>
      </div>
      <p class="form-error" id="form-error"></p>
      <div class="dlg-actions">
        <button class="btn" type="submit">ذخیره</button>
        <button class="btn btn-outline" type="button" data-close>انصراف</button>
      </div>
    </form>`;
  $("admin-dialog").showModal();
}

function saveCategory(form) {
  const f = form.elements;
  const name = f.cname.value.trim();
  const avatar = f.cavatar.value.trim() || "📦";
  const id = editingId || f.cid.value.trim().toLowerCase();
  const errors = [];

  if (name.length < 2) errors.push("نام دسته را وارد کنید.");
  if (!editingId) {
    if (!/^[a-z0-9-]+$/.test(id)) errors.push("شناسه فقط می‌تواند حروف انگلیسی کوچک، عدد و خط تیره باشد.");
    else if (db.CATEGORIES.some((c) => c.id === id)) errors.push("این شناسه قبلاً استفاده شده است.");
  }
  if (errors.length) { $("form-error").innerHTML = errors.join("<br>"); return; }

  if (editingId) {
    const c = db.CATEGORIES.find((x) => x.id === editingId);
    c.name = name; c.avatar = avatar;
  } else {
    db.CATEGORIES.push({ id, name, avatar, sub: [] });
  }
  saveDraft();
  $("admin-dialog").close();
  renderCategories();
}

function deleteCategory(id) {
  const n = usedCount(id);
  if (n) { alert(`این دسته ${fa(n)} محصول دارد. ابتدا محصولاتش را حذف یا به دسته دیگری منتقل کنید.`); return; }
  if (confirm("این دسته مادر حذف شود؟")) {
    db.CATEGORIES = db.CATEGORIES.filter((c) => c.id !== id);
    saveDraft();
    renderCategories();
  }
}

function addSub(catId) {
  const input = document.querySelector(`[data-sub-input="${catId}"]`);
  const val = input.value.trim();
  const c = db.CATEGORIES.find((x) => x.id === catId);
  if (!val || !c) return;
  if (c.sub.includes(val)) { alert("این زیردسته قبلاً وجود دارد."); return; }
  c.sub.push(val);
  saveDraft();
  renderCategories();
}

function removeSub(catId, idx) {
  const c = db.CATEGORIES.find((x) => x.id === catId);
  const sub = c.sub[idx];
  const n = usedCount(catId, sub);
  if (n) { alert(`زیردسته «${sub}» ${fa(n)} محصول دارد و حذف نمی‌شود.`); return; }
  c.sub.splice(idx, 1);
  saveDraft();
  renderCategories();
}


/* ---------- ۷) تب تنظیمات فروشگاه ---------- */
const SETTING_FIELDS = [
  ["name", "نام فروشگاه"], ["slogan", "شعار"],
  ["mobile", "موبایل"], ["phone", "تلفن ثابت"], ["email", "ایمیل"],
  ["instagram", "آدرس اینستاگرام"], ["eitaa", "آدرس صفحه ایتا"],
  ["telegram", "آدرس تلگرام"], ["rubika", "آدرس روبیکا"]
];

function renderSettings() {
  const s = db.STORE;
  const val = (k) => esc(k in s ? s[k] : s.contact[k]);
  $("admin-root").innerHTML = `
    <form id="settings-form" class="settings" novalidate>
      <div class="form-grid">
        ${SETTING_FIELDS.map(([k, label]) => `
          <label class="field"><span>${label}</span>
            <input name="${k}" value="${val(k)}" ${k === "name" || k === "slogan" ? "" : 'dir="ltr"'}></label>`).join("")}
      </div>
      <button class="btn" type="submit">ذخیره تنظیمات</button>
      <span class="saved" id="saved"></span>
    </form>`;
}

function saveSettings(form) {
  SETTING_FIELDS.forEach(([k]) => {
    const v = form.elements[k].value.trim();
    if (k === "name" || k === "slogan") db.STORE[k] = v; else db.STORE.contact[k] = v;
  });
  saveDraft();
  $("saved").textContent = "ذخیره شد ✓";
}


/* ---------- ۸) ساخت فایل data.js ----------
   فایل جدید کامل است و جایگزین js/data.js می‌شود */
const js = (v) => JSON.stringify(v);

/* عکس‌های موقت (SVG) را دوباره به صورت placeholderImg("...") می‌نویسد تا فایل کوتاه بماند */
function imageExpr(img) {
  if (img.startsWith("data:image/svg+xml")) {
    try {
      const svg = decodeURIComponent(img.split(",")[1]);
      const t = svg.match(/>([^<]*)<\/text>/);
      const c = svg.match(/<rect[^>]*fill="([^"]+)"/);
      if (t) return `placeholderImg(${js(t[1])}, ${js(c ? c[1] : "#7c3aed")})`;
    } catch (e) { /* اگر خوانده نشد، رشته کامل نوشته می‌شود */ }
  }
  return js(img);
}

/* زمان پایان تخفیف با اختلاف ساعت محلی، تا برای همه بازدیدکنندگان یکسان باشد */
function isoWithOffset(ms) {
  const off = -new Date(ms).getTimezoneOffset();
  const p = (n) => String(Math.abs(n)).padStart(2, "0");
  const local = new Date(ms + off * 60000).toISOString().slice(0, 19);
  return `${local}${off >= 0 ? "+" : "-"}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)}`;
}

function buildDataJs() {
  const s = db.STORE, c = s.contact;
  const cats = db.CATEGORIES.map((x) =>
    `  { id: ${js(x.id)}, name: ${js(x.name)}, avatar: ${js(x.avatar)}, sub: ${js(x.sub)} }`).join(",\n");

  const prods = db.PRODUCTS.map((p) => {
    let o = `  { id: ${p.id}, name: ${js(p.name)}, category: ${js(p.category)}, sub: ${js(p.sub)},\n` +
            `    price: ${p.price}, stock: ${p.stock}, colors: ${js(p.colors)},\n` +
            `    description: ${js(p.description)},\n` +
            `    image: ${imageExpr(p.image)}, isNew: ${!!p.isNew}`;
    if (p.discount) {
      o += `,\n    discount: ${p.discount}, discountEnds: new Date(${js(isoWithOffset(p.discountEnds))}).getTime()`;
    }
    return o + " }";
  }).join(",\n\n");

  return `/* =====================================================
   فایل داده‌های فروشگاه ${s.name}
   این فایل توسط «پنل مدیریت» ساخته شده است.
   برای تغییر، از admin.html استفاده کنید (یا همین‌جا ویرایش کنید).
   ===================================================== */


/* ---------- ۱) تنظیمات عمومی فروشگاه ---------- */
const STORE = {
  name: ${js(s.name)},
  slogan: ${js(s.slogan)},
  currency: ${js(s.currency || "تومان")},
  contact: {
    mobile: ${js(c.mobile)},
    phone: ${js(c.phone)},
    email: ${js(c.email)},
    instagram: ${js(c.instagram)},
    eitaa: ${js(c.eitaa)},
    telegram: ${js(c.telegram)},
    rubika: ${js(c.rubika)}
  }
};


/* ---------- ۲) دسته‌بندی‌های مادر و زیردسته‌ها ---------- */
const CATEGORIES = [
${cats}
];


/* ---------- ۳) تابع ساخت عکس موقت ---------- */
function placeholderImg(text, color = "#7c3aed") {
  const safe = String(text).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
  const svg =
    \`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
       <rect width="600" height="600" fill="\${color}"/>
       <text x="300" y="320" font-size="48" fill="#fff"
             text-anchor="middle" font-family="sans-serif">\${safe}</text>
     </svg>\`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}


/* ---------- ۴) محصولات ---------- */
const PRODUCTS = [
${prods}
];
`;
}

function exportDataJs() {
  const blob = new Blob([buildDataJs()], { type: "text/javascript;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}


/* ---------- ۹) نمایش تب فعال ---------- */
function renderTab() {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  ({ products: renderProducts, categories: renderCategories, settings: renderSettings })[tab]();
}


/* ---------- ۱۰) رویدادها ---------- */
document.addEventListener("click", (e) => {
  const t = e.target;
  const get = (attr) => { const el = t.closest(`[${attr}]`); return el ? el.getAttribute(attr) : null; };

  const tabBtn = get("data-tab");
  if (tabBtn) { tab = tabBtn; renderTab(); return; }

  if (t.closest("[data-export]")) { exportDataJs(); return; }
  if (t.closest("[data-discard]")) {
    if (confirm("همه تغییرات ذخیره‌نشده حذف شود و به نسخه فعلی سایت برگردید؟")) {
      localStorage.removeItem(DRAFT_KEY); loadDb(); renderBanner(); renderTab();
    }
    return;
  }

  if (t.closest("[data-new-product]")) { openProductForm(); return; }
  const ep = get("data-edit-product"); if (ep) { openProductForm(Number(ep)); return; }
  const dp = get("data-del-product");  if (dp) { deleteProduct(Number(dp)); return; }

  if (t.closest("[data-new-cat]")) { openCatForm(); return; }
  const ec = get("data-edit-cat"); if (ec) { openCatForm(ec); return; }
  const dc = get("data-del-cat");  if (dc) { deleteCategory(dc); return; }
  const as = get("data-add-sub");  if (as) { addSub(as); return; }
  const rs = t.closest("[data-rm-sub]");
  if (rs) { removeSub(rs.dataset.rmSub, Number(rs.dataset.idx)); return; }

  /* بستن پنجره با × ، انصراف یا کلیک روی پس‌زمینه */
  if (t.closest("[data-close]") || t.id === "admin-dialog") $("admin-dialog").close();
});

document.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = e.target.id;
  if (id === "product-form") saveProduct(e.target);
  else if (id === "cat-form") saveCategory(e.target);
  else if (id === "settings-form") saveSettings(e.target);
});

document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    const pos = e.target.selectionStart;
    search = e.target.value;
    renderProducts();
    const box = $("search");
    box.focus();
    box.setSelectionRange(pos, pos); // مکان نشانگر هنگام تایپ حفظ شود
  }
});

document.addEventListener("change", (e) => {
  /* با عوض شدن دسته مادر، زیردسته‌ها هم عوض می‌شوند */
  if (e.target.id === "pcat") $("psub").innerHTML = subOptions(e.target.value);
  /* انتخاب فایل عکس: فقط مسیرش در فیلد نوشته می‌شود */
  if (e.target.id === "pfile" && e.target.files[0]) {
    const safe = e.target.files[0].name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
    document.querySelector('[name="pimage"]').value = "images/products/" + safe;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.dataset.subInput) { e.preventDefault(); addSub(e.target.dataset.subInput); }
});


/* ---------- ۱۱) شروع ---------- */
loadDb();
renderBanner();
renderTab();
