/* =====================================================
   فایل داده‌های فروشگاه HOMEZEE
   همه اطلاعات سایت (تنظیمات، دسته‌بندی‌ها، محصولات)
   فقط از همین فایل خوانده می‌شود؛ برای تغییر، همین‌جا ویرایش کنید.
   ===================================================== */


/* -----------------------------------------------------
   ۱) تنظیمات عمومی فروشگاه
   نام فروشگاه، اطلاعات تماس و آدرس‌های شبکه‌های اجتماعی
   (آیدی‌ها نمونه هستند و باید با آیدی واقعی جایگزین شوند)
   ----------------------------------------------------- */
const STORE = {
  name: "HOMEZEE",
  slogan: "خانه‌ات را زیباتر کن",
  currency: "تومان",
  contact: {
    mobile: "09153314070",
    phone: "051-00000000",            // تلفن ثابت (نمونه)
    email: "info@homzee.com",         // ایمیل (نمونه)
    instagram: "https://instagram.com/homzee",
    eitaa: "https://eitaa.com/zarfomarfeli", // صفحه ایتا برای ارسال فاکتور
    telegram: "https://t.me/homzee",
    rubika: "https://rubika.ir/homzee"
  }
};


/* -----------------------------------------------------
   ۲) دسته‌بندی‌های مادر و زیردسته‌ها
   - id: شناسه یکتا (انگلیسی و بدون فاصله)
   - avatar: آواتار دسته؛ فعلاً ایموجی است.
     برای عکس واقعی بنویسید: "images/categories/ceramic.png"
   - sub: لیست زیردسته‌ها؛ هر تعداد که بخواهید اضافه کنید
   برای افزودن دسته مادر جدید، یک آبجکت مشابه به آخر لیست اضافه کنید.
   ----------------------------------------------------- */
const CATEGORIES = [
  { id: "ceramic",  name: "سرامیکی",     avatar: "🏺", sub: ["بشقاب", "کاسه", "لیوان و ماگ"] },
  { id: "porcelain",name: "چینی",        avatar: "🍵", sub: ["سرویس غذاخوری", "سرویس چای‌خوری"] },
  { id: "crystal",  name: "بلور",        avatar: "🥂", sub: ["لیوان و جام", "پارچ", "شکلات‌خوری"] },
  { id: "wood",     name: "چوبی",        avatar: "🪵", sub: ["تخته سرو", "قاشق و چنگال", "جاادویه‌ای"] },
  { id: "stone",    name: "سنگ مصنوعی",  avatar: "🪨", sub: ["سینی", "زیرلیوانی"] },
  { id: "metal",    name: "فلزی",        avatar: "🍴", sub: ["قابلمه و تابه", "سرویس قاشق و چنگال"] },
  { id: "fabric",   name: "پارچه‌ای",    avatar: "🧵", sub: ["رومیزی", "دستمال و پیش‌بند"] },
  { id: "other",    name: "سایر",        avatar: "✨", sub: ["اکسسوری خانه", "متفرقه"] }
];


/* -----------------------------------------------------
   ۳) تابع ساخت عکس موقت
   تا زمانی که عکس واقعی ندارید، یک تصویر بنفش ساده می‌سازد.
   بعداً در هر محصول به‌جای آن، مسیر عکس واقعی را بنویسید.
   ----------------------------------------------------- */
function placeholderImg(text, color = "#7c3aed") {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
       <rect width="600" height="600" fill="${color}"/>
       <text x="300" y="320" font-size="48" fill="#fff"
             text-anchor="middle" font-family="sans-serif">${text}</text>
     </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* تابع کمکی: زمان پایان تخفیف را «چند ساعت دیگر» تنظیم می‌کند
   (فقط برای نمایش آزمایشی شمارنده؛ بعداً می‌توانید تاریخ ثابت بدهید) */
function hoursFromNow(h) {
  return Date.now() + h * 60 * 60 * 1000;
}


/* -----------------------------------------------------
   ۴) محصولات
   - category / sub: باید با id و نام زیردسته بالا یکی باشد
   - price: قیمت به تومان
   - stock: موجودی (۰ یعنی ناموجود)
   - colors: رنگ‌های موجود
   - discount: درصد تخفیف (اختیاری)
   - discountEnds: زمان پایان تخفیف برای شمارنده معکوس (اختیاری)
   - isNew: اگر true باشد در اسلایدر «جدیدترین‌ها» نمایش داده می‌شود
   ----------------------------------------------------- */
const PRODUCTS = [
  { id: 1,  name: "بشقاب سرامیکی ساده",   category: "ceramic",   sub: "بشقاب",
    price: 180000, stock: 25, colors: ["سفید", "طوسی"],
    description: "بشقاب سرامیکی مقاوم با طراحی مینیمال.",
    image: placeholderImg("بشقاب سرامیکی"), isNew: true,
    discount: 20, discountEnds: hoursFromNow(30) },

  { id: 2,  name: "ماگ سرامیکی بنفش",     category: "ceramic",   sub: "لیوان و ماگ",
    price: 120000, stock: 40, colors: ["بنفش", "مشکی"],
    description: "ماگ دسته‌دار مناسب چای و قهوه.",
    image: placeholderImg("ماگ سرامیکی", "#6d28d9"), isNew: true },

  { id: 3,  name: "سرویس چای‌خوری ۶ نفره", category: "porcelain", sub: "سرویس چای‌خوری",
    price: 1450000, stock: 8, colors: ["سفید"],
    description: "سرویس ۲۴ پارچه چینی با لبه طلایی.",
    image: placeholderImg("سرویس چای‌خوری", "#5b21b6"), isNew: true,
    discount: 15, discountEnds: hoursFromNow(10) },

  { id: 4,  name: "جام بلور دسته‌دار",    category: "crystal",   sub: "لیوان و جام",
    price: 320000, stock: 15, colors: ["شفاف"],
    description: "جام بلور شفاف، بسته ۶ عددی.",
    image: placeholderImg("جام بلور", "#8b5cf6"), isNew: true },

  { id: 5,  name: "تخته سرو چوبی",        category: "wood",      sub: "تخته سرو",
    price: 260000, stock: 12, colors: ["قهوه‌ای"],
    description: "تخته سرو چوب طبیعی با دسته چرمی.",
    image: placeholderImg("تخته سرو", "#4c1d95"), isNew: true,
    discount: 10, discountEnds: hoursFromNow(52) },

  { id: 6,  name: "سینی سنگ مصنوعی",      category: "stone",     sub: "سینی",
    price: 390000, stock: 0,  colors: ["مشکی", "سفید"],
    description: "سینی مقاوم و ضدلک.",
    image: placeholderImg("سینی سنگی", "#111827") },

  { id: 7,  name: "تابه فلزی ۲۶ سانتی",   category: "metal",     sub: "قابلمه و تابه",
    price: 850000, stock: 6,  colors: ["مشکی"],
    description: "تابه گرانیتی با دسته مقاوم در برابر حرارت.",
    image: placeholderImg("تابه فلزی", "#1f2937"),
    discount: 25, discountEnds: hoursFromNow(5) },

  { id: 8,  name: "رومیزی کتان",          category: "fabric",    sub: "رومیزی",
    price: 310000, stock: 18, colors: ["بژ", "بنفش"],
    description: "رومیزی کتان ضدلک ۶ نفره.",
    image: placeholderImg("رومیزی", "#a78bfa") },

  { id: 9,  name: "شمعدان فلزی",          category: "other",     sub: "اکسسوری خانه",
    price: 210000, stock: 20, colors: ["مشکی", "طلایی"],
    description: "شمعدان مینیمال برای دکوراسیون.",
    image: placeholderImg("شمعدان", "#374151") }
];
