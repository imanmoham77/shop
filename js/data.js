/* =====================================================
   فایل داده‌های فروشگاه HOMEZEE
   این فایل توسط «پنل مدیریت» ساخته شده است.
   برای تغییر، از admin.html استفاده کنید (یا همین‌جا ویرایش کنید).
   ===================================================== */


/* ---------- ۱) تنظیمات عمومی فروشگاه ---------- */
const STORE = {
  name: "HOMEZEE",
  slogan: "خانه‌ات را زیباتر کن",
  currency: "تومان",
  contact: {
    mobile: "09153314070",
    phone: "05157724569",
    email: "info@homzee.com",
    instagram: "https://instagram.com/homzee1595",
    eitaa: "https://eitaa.com/homeeli64",
    telegram: "https://t.me/homzee",
    rubika: "https://rubika.ir/homzee"
  }
};


/* ---------- ۲) دسته‌بندی‌های مادر و زیردسته‌ها ---------- */
const CATEGORIES = [
  { id: "ceramic", name: "سرامیکی", avatar: "🏺", sub: ["بشقاب","کاسه","لیوان و ماگ"] },
  { id: "porcelain", name: "چینی", avatar: "🍵", sub: ["سرویس غذاخوری","سرویس چای‌خوری"] },
  { id: "crystal", name: "بلور", avatar: "🥂", sub: ["لیوان و جام","پارچ","شکلات‌خوری"] },
  { id: "wood", name: "چوبی", avatar: "🪵", sub: ["تخته سرو","قاشق و چنگال","جاادویه‌ای"] },
  { id: "stone", name: "سنگ مصنوعی", avatar: "🪨", sub: ["سینی","زیرلیوانی"] },
  { id: "metal", name: "فلزی", avatar: "🍴", sub: ["قابلمه و تابه","سرویس قاشق و چنگال"] },
  { id: "fabric", name: "پارچه‌ای", avatar: "🧵", sub: ["رومیزی","دستمال و پیش‌بند"] },
  { id: "other", name: "سایر", avatar: "✨", sub: ["اکسسوری خانه","متفرقه"] },
  { id: "mesi", name: "مسی", avatar: "📦", sub: [] }
];


/* ---------- ۳) تابع ساخت عکس موقت ---------- */
function placeholderImg(text, color = "#7c3aed") {
  const safe = String(text).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
       <rect width="600" height="600" fill="${color}"/>
       <text x="300" y="320" font-size="48" fill="#fff"
             text-anchor="middle" font-family="sans-serif">${safe}</text>
     </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}


/* ---------- ۴) محصولات ---------- */
const PRODUCTS = [
  { id: 1, name: "بشقاب سرامیکی ساده", category: "ceramic", sub: "بشقاب",
    price: 180000, stock: 25, colors: ["سفید","طوسی"],
    description: "بشقاب سرامیکی مقاوم با طراحی مینیمال.",
    image: placeholderImg("بشقاب سرامیکی", "#7c3aed"), isNew: true,
    discount: 20, discountEnds: new Date("2026-11-07T02:02:16+03:30").getTime() },

  { id: 2, name: "ماگ سرامیکی بنفش", category: "ceramic", sub: "لیوان و ماگ",
    price: 120000, stock: 40, colors: ["بنفش","مشکی"],
    description: "ماگ دسته‌دار مناسب چای و قهوه.",
    image: placeholderImg("ماگ سرامیکی", "#6d28d9"), isNew: true },

  { id: 3, name: "سرویس چای‌خوری ۶ نفره", category: "porcelain", sub: "سرویس چای‌خوری",
    price: 1450000, stock: 8, colors: ["سفید"],
    description: "سرویس ۲۴ پارچه چینی با لبه طلایی.",
    image: placeholderImg("سرویس چای‌خوری", "#5b21b6"), isNew: true,
    discount: 15, discountEnds: new Date("2026-11-06T06:02:16+03:30").getTime() },

  { id: 4, name: "جام بلور دسته‌دار", category: "crystal", sub: "لیوان و جام",
    price: 320000, stock: 15, colors: ["شفاف"],
    description: "جام بلور شفاف، بسته ۶ عددی.",
    image: placeholderImg("جام بلور", "#8b5cf6"), isNew: true },

  { id: 5, name: "تخته سرو چوبی", category: "wood", sub: "تخته سرو",
    price: 260000, stock: 12, colors: ["قهوه‌ای"],
    description: "تخته سرو چوب طبیعی با دسته چرمی.",
    image: placeholderImg("تخته سرو", "#4c1d95"), isNew: true,
    discount: 10, discountEnds: new Date("2026-11-08T00:02:16+03:30").getTime() },

  { id: 6, name: "سینی سنگ مصنوعی", category: "stone", sub: "سینی",
    price: 390000, stock: 0, colors: ["مشکی","سفید"],
    description: "سینی مقاوم و ضدلک.",
    image: placeholderImg("سینی سنگی", "#111827"), isNew: false },

  { id: 7, name: "تابه فلزی ۲۶ سانتی", category: "metal", sub: "قابلمه و تابه",
    price: 850000, stock: 6, colors: ["مشکی"],
    description: "تابه گرانیتی با دسته مقاوم در برابر حرارت.",
    image: placeholderImg("تابه فلزی", "#1f2937"), isNew: false,
    discount: 25, discountEnds: new Date("2026-11-06T01:02:16+03:30").getTime() },

  { id: 8, name: "رومیزی کتان", category: "fabric", sub: "رومیزی",
    price: 310000, stock: 18, colors: ["بژ","بنفش"],
    description: "رومیزی کتان ضدلک ۶ نفره.",
    image: placeholderImg("رومیزی", "#a78bfa"), isNew: false },

  { id: 9, name: "شمعدان فلزی", category: "other", sub: "اکسسوری خانه",
    price: 210000, stock: 20, colors: ["مشکی","طلایی"],
    description: "شمعدان مینیمال برای دکوراسیون.",
    image: placeholderImg("شمعدان", "#374151"), isNew: false },

  { id: 10, name: "وردنه بزرگ 1", category: "wood", sub: "تخته سرو",
    price: 150000, stock: 10, colors: ["قهوه ای روشن"],
    description: "ندارد",
    image: placeholderImg("وردنه بزرگ 1", "#7c3aed"), isNew: false }
];
