// eFootball Hub Auto Backend
const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

// إضافة مسار الصفحة الرئيسية لحل خطأ Cannot GET /
app.get("/", (req, res) => {
  res.status(200).send(`
    <div style="text-align: center; font-family: sans-serif; padding: 50px;">
      <h1>⚽ eFootball Hub API Ready</h1>
      <p>السيرفر يعمل بنجاح بدون مشاكل!</p>
    </div>
  `);
});

const SOURCES = [
  { type: "news", url: "https://www.konami.com/efootball/en/" },
  { type: "news_ar", url: "https://www.konami.com/efootball/ar/" }
];

let cache = { updatedAt: null, items: [] };

async function fetchSource(source) {
  const r = await fetch(source.url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const html = await r.text();
  const $ = cheerio.load(html);
  const items = [];
  $("a").each((_, a) => {
    const title = $(a).text().replace(/\s+/g, " ").trim();
    const href = $(a).attr("href");
    if (!title || !href) return;
    if (/(maintenance|update|news|pack|campaign|announce)/i.test(href)) {
      const url = new URL(href, source.url).href;
      if (url.includes("konami.com/efootball")) items.push({ title, url, type: source.type });
    }
  });
  return items;
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`eFootball Hub API listening on port ${PORT}`);
});
