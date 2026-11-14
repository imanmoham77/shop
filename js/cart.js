/* =====================================================
   منطق صفحه سبد خرید
   نمایش کالاها، تغییر تعداد، فرم مشخصات، ساخت فاکتور PDF
   و هدایت به صفحه ایتا
   ===================================================== */


/* ---------- ۱) توابع کمکی ----------
   تبدیل ارقام انگلیسی به فارسی برای متن‌هایی که از کاربر می‌گیریم */
const faDigits = (s) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/* تبدیل ارقام فارسی/عربی به انگلیسی برای اعتبارسنجی فرم */
const enDigits = (s) => String(s)
  .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
  .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

/* جلوگیری از تزریق کد HTML از طریق فرم */
const esc = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* آیتم‌های سبد همراه با اطلاعات کامل محصول (آیتم‌های حذف‌شده از داده، نادیده گرفته می‌شوند) */
function cartLines() {
  return getCart()
    .map((i) => ({ ...i, p: PRODUCTS.find((x) => x.id === i.id) }))
    .filter((l) => l.p);
}
const cartTotal = () => cartLines().reduce((s, l) => s + finalPrice(l.p) * l.qty, 0);


/* ---------- ۲) نمایش سبد خرید ---------- */
function renderCart() {
  const root = document.getElementById("cart-root");
  const lines = cartLines();

  if (!lines.length) {
    root.innerHTML = `
      <div class="cart-empty">
        <p>سبد خرید شما خالی است.</p>
        <a class="btn" href="shop.html">رفتن به فروشگاه</a>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="cart-layout">
      <div>
        ${lines.map((l) => `
          <div class="cart-item">
            <img src="${l.p.image}" alt="${l.p.name}">
            <div>
              <h3>${l.p.name}</h3>
              <span class="stock">${money(finalPrice(l.p))}</span>
              <div class="qty">
                <button data-inc="${l.id}" aria-label="افزایش">+</button>
                <span>${toFa(l.qty)}</span>
                <button data-dec="${l.id}" aria-label="کاهش">−</button>
              </div>
            </div>
            <div class="item-side">
              <div class="item-total">${money(finalPrice(l.p) * l.qty)}</div>
              <button class="remove-btn" data-remove="${l.id}">حذف</button>
            </div>
          </div>`).join("")}
      </div>

      <aside class="summary">
        <h2>مشخصات و نهایی‌کردن خرید</h2>
        <div class="sum-row"><span>تعداد کالا</span><span>${toFa(lines.reduce((s, l) => s + l.qty, 0))}</span></div>
        <div class="sum-row total"><span>جمع کل</span><span>${money(cartTotal())}</span></div>

        <form id="checkout-form" novalidate>
          <label class="field"><span>نام و نام خانوادگی</span>
            <input name="name" autocomplete="name"><small class="field-error"></small></label>
          <label class="field"><span>شماره موبایل</span>
            <input name="mobile" inputmode="numeric" placeholder="09123456789" dir="ltr" autocomplete="tel"><small class="field-error"></small></label>
          <label class="field"><span>آدرس</span>
            <textarea name="address" autocomplete="street-address"></textarea><small class="field-error"></small></label>
          <label class="field"><span>کد پستی</span>
            <input name="postal" inputmode="numeric" placeholder="۱۰ رقم" dir="ltr" autocomplete="postal-code"><small class="field-error"></small></label>
          <button class="btn" type="submit" id="submit-btn">نهایی کردن خرید و دریافت فاکتور</button>
          <p class="hint">فاکتور PDF روی دستگاه شما ذخیره می‌شود و سپس به صفحه ایتا فروشگاه منتقل می‌شوید؛ فایل را همان‌جا برای ما بفرستید.</p>
        </form>
      </aside>
    </div>`;
}


/* ---------- ۳) تغییر تعداد و حذف کالا ---------- */
function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  const product = PRODUCTS.find((p) => p.id === id);
  if (!item || !product) return;
  item.qty = Math.min(product.stock, item.qty + delta); // بیشتر از موجودی نمی‌شود
  saveCart(cart.filter((i) => i.qty > 0));
  renderCart();
}

function removeItem(id) {
  saveCart(getCart().filter((i) => i.id !== id));
  renderCart();
}


/* ---------- ۴) اعتبارسنجی فرم مشخصات ----------
   موبایل: ۱۱ رقم و شروع با 09 | کد پستی: ۱۰ رقم */
function validateForm(form) {
  const v = (n) => form.elements[n].value.trim();
  const rules = {
    name:   [v("name").length >= 3, "نام و نام خانوادگی را کامل وارد کنید."],
    mobile: [/^09\d{9}$/.test(enDigits(v("mobile"))), "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود."],
    address:[v("address").length >= 10, "آدرس را کامل‌تر وارد کنید."],
    postal: [/^\d{10}$/.test(enDigits(v("postal"))), "کد پستی باید ۱۰ رقم باشد."]
  };
  let ok = true;
  Object.entries(rules).forEach(([name, [valid, msg]]) => {
    const input = form.elements[name];
    input.classList.toggle("invalid", !valid);
    input.parentElement.querySelector(".field-error").textContent = valid ? "" : msg;
    if (!valid) ok = false;
  });
  return ok;
}


/* ---------- ۵) ساخت فاکتور (قالب HTML) ----------
   این قالب پنهان است و فقط برای تبدیل به PDF استفاده می‌شود */
function buildInvoiceHtml(customer, invoiceNo) {
  const c = STORE.contact;
  const date = new Date().toLocaleDateString("fa-IR");
  const rows = cartLines().map((l, i) => `
    <tr>
      <td>${toFa(i + 1)}</td>
      <td>${l.p.name}</td>
      <td>${toFa(l.qty)}</td>
      <td>${money(finalPrice(l.p))}</td>
      <td>${money(finalPrice(l.p) * l.qty)}</td>
    </tr>`).join("");

  return `
    <div class="invoice">
      <div class="inv-head">
        <h1>HOME<span>ZEE</span></h1>
        <div class="inv-meta">
          <div>شماره فاکتور: ${faDigits(invoiceNo)}</div>
          <div>تاریخ: ${date}</div>
        </div>
      </div>

      <div class="inv-box">
        <div><b>نام مشتری:</b>${esc(customer.name)}</div>
        <div><b>شماره موبایل:</b>${faDigits(esc(customer.mobile))}</div>
        <div><b>کد پستی:</b>${faDigits(esc(customer.postal))}</div>
        <div><b>آدرس:</b>${esc(customer.address)}</div>
      </div>

      <table class="inv-table">
        <thead><tr><th>ردیف</th><th>کالا</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="inv-total">جمع کل: ${money(cartTotal())}</div>

      <div class="inv-foot">
        ${STORE.name} | موبایل: ${faDigits(c.mobile)} | ایتا: @zarfomarfeli<br>
        این فاکتور پیش‌فاکتور ثبت سفارش است و هماهنگی پرداخت از طریق ایتا انجام می‌شود.
      </div>
    </div>`;
}


/* ---------- ۶) تبدیل فاکتور به PDF ----------
   ابتدا با html2canvas از فاکتور عکس می‌گیریم (برای نمایش درست فارسی)
   سپس با jsPDF داخل صفحه A4 قرار می‌دهیم. اگر طولانی بود چند صفحه می‌شود. */
async function createInvoicePdf(customer, invoiceNo) {
  const host = document.createElement("div");
  host.className = "invoice-host";
  host.innerHTML = buildInvoiceHtml(customer, invoiceNo);
  document.body.appendChild(host);

  try {
    await document.fonts.ready; // صبر تا فونت فارسی کامل بارگذاری شود
    const canvas = await html2canvas(host.firstElementChild, { scale: 2, backgroundColor: "#ffffff" });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297;
    const imgH = (canvas.height * pageW) / canvas.width;
    const img = canvas.toDataURL("image/jpeg", 0.95);

    let offset = 0;
    pdf.addImage(img, "JPEG", 0, offset, pageW, imgH);
    while (imgH + offset > pageH) {
      offset -= pageH;
      pdf.addPage();
      pdf.addImage(img, "JPEG", 0, offset, pageW, imgH);
    }
    pdf.save(`HOMEZEE-${invoiceNo}.pdf`);
  } finally {
    host.remove();
  }
}


/* ---------- ۷) ثبت نهایی سفارش ----------
   اعتبارسنجی ← ساخت و دانلود PDF ← خالی کردن سبد ← هدایت به ایتا */
async function handleCheckout(form) {
  if (!validateForm(form)) return;

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "در حال ساخت فاکتور...";

  const customer = {
    name: form.elements.name.value.trim(),
    mobile: enDigits(form.elements.mobile.value.trim()),
    address: form.elements.address.value.trim(),
    postal: enDigits(form.elements.postal.value.trim())
  };
  const d = new Date();
  const invoiceNo = "HZ" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);

  try {
    if (!window.html2canvas || !window.jspdf) throw new Error("libs");
    await createInvoicePdf(customer, invoiceNo);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "نهایی کردن خرید و دریافت فاکتور";
    alert("ساخت فاکتور انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.");
    return;
  }

  saveCart([]); // سبد بعد از صدور فاکتور خالی می‌شود
  document.getElementById("cart-root").innerHTML = `
    <div class="success">
      <h2>فاکتور شما ساخته شد ✅</h2>
      <p>فایل PDF فاکتور روی دستگاه شما ذخیره شد. تا چند ثانیه دیگر به صفحه ایتا فروشگاه منتقل می‌شوید؛ لطفاً فایل فاکتور را همان‌جا برای ما ارسال کنید.</p>
      <a class="btn" href="${STORE.contact.eitaa}">رفتن به صفحه ایتا</a>
    </div>`;
  setTimeout(() => { location.href = STORE.contact.eitaa; }, 4000);
}


/* ---------- ۸) رویدادها و شروع ---------- */
document.addEventListener("click", (e) => {
  const t = e.target;
  const inc = t.closest("[data-inc]");   if (inc) return changeQty(Number(inc.dataset.inc), 1);
  const dec = t.closest("[data-dec]");   if (dec) return changeQty(Number(dec.dataset.dec), -1);
  const rem = t.closest("[data-remove]"); if (rem) return removeItem(Number(rem.dataset.remove));
});

document.addEventListener("submit", (e) => {
  if (e.target.id === "checkout-form") {
    e.preventDefault();
    handleCheckout(e.target);
  }
});

renderNavbar("cart");
renderCart();
renderFooter();
