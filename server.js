// eFootball Hub Auto Backend
const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());app.use(express.static('public'));app.use(express.static('public'));





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
