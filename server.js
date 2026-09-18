// eFootball Hub Auto Backend
// Node.js 18+
// npm install express cors cheerio
const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

const SOURCES = [
  {type:"news", url:"https://www.konami.com/efootball/en/topic/news/list"},
  {type:"news_ar", url:"https://www.konami.com/efootball/ar/topic/news/list"}
];

let cache = {updatedAt:null, items:[]};

async function fetchSource(source){
  const r = await fetch(source.url, {headers:{"User-Agent":"eFootballHub/1.0"}});
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  const html = await r.text();
  const $ = cheerio.load(html);
  const items=[];
  $("a").each((_,a)=>{
    const title=$(a).text().replace(/\s+/g," ").trim();
    const href=$(a).attr("href");
    if(!title || !href) return;
    if(/maintenance|update|news|pack|campaign|announcement|صيانة|تحديث|بكج|أخبار|إعلان/i.test(title)){
      const url=new URL(href,source.url).href;
      if(url.includes("konami.com/efootball")) items.push({title,url,type:/maintenance|صيانة/i.test(title)?"maintenance":"news"});
    }
  });
  return items;
}

async function refresh(){
  const all=[];
  for(const s of SOURCES){
    try { all.push(...await fetchSource(s)); } catch(e) { console.error(s.url,e.message); }
  }
  const seen=new Set();
  cache.items=all.filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true}).slice(0,50);
  cache.updatedAt=new Date().toISOString();
  return cache;
}

app.get("/api/health",(req,res)=>res.json({ok:true,updatedAt:cache.updatedAt}));
app.get("/api/news",(req,res)=>res.json(cache));

app.post("/api/refresh",async(req,res)=>{
  try { res.json(await refresh()); }
  catch(e){res.status(500).json({error:e.message});}
});

refresh().catch(console.error);
// فحص دوري كل 15 دقيقة
setInterval(()=>refresh().catch(console.error),15*60*1000);

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`eFootball Hub API listening on ${PORT}`));
