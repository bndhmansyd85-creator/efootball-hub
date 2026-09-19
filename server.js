// eFootball Hub Auto Backend
const express = require("express");
const path = require("path");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// دالة جلب الأخبار من موقع كونامي
async function fetchKonamiNews() {
    try {
        const sourceUrl = "https://www.konami.com/efootball/en/";
        const r = await fetch(sourceUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        
        const html = await r.text();
        const $ = cheerio.load(html);
        const items = [];

        $("a").each((_, a) => {
            const title = $(a).text().replace(/\s+/g, " ").trim();
            const href = $(a).attr("href");
            
            if (!title || !href) return;

            if (/(maintenance|update|news|pack|campaign|announce)/i.test(href)) {
                const url = new URL(href, sourceUrl).href;
                if (url.includes("konami.com/efootball")) {
                    items.push({ title, url, type: "news" });
                }
            }
        });

        return items;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

// الرابط المخصص لجلب الأخبار
app.get("/api/news", async (req, res) => {
    const newsData = await fetchKonamiNews();
    res.json(newsData);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`eFootball Hub API listening on port ${PORT}`);
});
