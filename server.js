const express = require("express");
const cors    = require("cors");
const path    = require("path");
const https   = require("https");
const cron    = require("node-cron");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── 100 US Stocks ─────────────────────────────────────────────────────────────
const STOCKS = [
  { ticker:"AAPL",  name:"Apple",               sector:"Technology" },
  { ticker:"AMD",   name:"AMD",                  sector:"Technology" },
  { ticker:"GOOGL", name:"Alphabet",             sector:"Technology" },
  { ticker:"CRM",   name:"Salesforce",           sector:"Technology" },
  { ticker:"ADBE",  name:"Adobe",                sector:"Technology" },
  { ticker:"ORCL",  name:"Oracle",               sector:"Technology" },
  { ticker:"INTC",  name:"Intel",                sector:"Technology" },
  { ticker:"QCOM",  name:"Qualcomm",             sector:"Technology" },
  { ticker:"AMAT",  name:"Applied Materials",    sector:"Technology" },
  { ticker:"MU",    name:"Micron Technology",    sector:"Technology" },
  { ticker:"SNOW",  name:"Snowflake",            sector:"Technology" },
  { ticker:"NOW",   name:"ServiceNow",           sector:"Technology" },
  { ticker:"SHOP",  name:"Shopify",              sector:"Technology" },
  { ticker:"DDOG",  name:"Datadog",              sector:"Technology" },
  { ticker:"NET",   name:"Cloudflare",           sector:"Technology" },
  { ticker:"JPM",   name:"JPMorgan Chase",       sector:"Financials" },
  { ticker:"BAC",   name:"Bank of America",      sector:"Financials" },
  { ticker:"GS",    name:"Goldman Sachs",        sector:"Financials" },
  { ticker:"MS",    name:"Morgan Stanley",       sector:"Financials" },
  { ticker:"WFC",   name:"Wells Fargo",          sector:"Financials" },
  { ticker:"V",     name:"Visa",                 sector:"Financials" },
  { ticker:"MA",    name:"Mastercard",           sector:"Financials" },
  { ticker:"AXP",   name:"American Express",     sector:"Financials" },
  { ticker:"BLK",   name:"BlackRock",            sector:"Financials" },
  { ticker:"SCHW",  name:"Charles Schwab",       sector:"Financials" },
  { ticker:"PYPL",  name:"PayPal",               sector:"Financials" },
  { ticker:"SQ",    name:"Block Inc",            sector:"Financials" },
  { ticker:"JNJ",   name:"Johnson & Johnson",    sector:"Healthcare" },
  { ticker:"UNH",   name:"UnitedHealth",         sector:"Healthcare" },
  { ticker:"LLY",   name:"Eli Lilly",            sector:"Healthcare" },
  { ticker:"PFE",   name:"Pfizer",               sector:"Healthcare" },
  { ticker:"ABBV",  name:"AbbVie",               sector:"Healthcare" },
  { ticker:"MRK",   name:"Merck",                sector:"Healthcare" },
  { ticker:"TMO",   name:"Thermo Fisher",        sector:"Healthcare" },
  { ticker:"DHR",   name:"Danaher",              sector:"Healthcare" },
  { ticker:"AMGN",  name:"Amgen",                sector:"Healthcare" },
  { ticker:"GILD",  name:"Gilead Sciences",      sector:"Healthcare" },
  { ticker:"ISRG",  name:"Intuitive Surgical",   sector:"Healthcare" },
  { ticker:"MRNA",  name:"Moderna",              sector:"Healthcare" },
  { ticker:"AMZN",  name:"Amazon",               sector:"Consumer" },
  { ticker:"TSLA",  name:"Tesla",                sector:"Consumer" },
  { ticker:"WMT",   name:"Walmart",              sector:"Consumer" },
  { ticker:"HD",    name:"Home Depot",           sector:"Consumer" },
  { ticker:"NKE",   name:"Nike",                 sector:"Consumer" },
  { ticker:"SBUX",  name:"Starbucks",            sector:"Consumer" },
  { ticker:"MCD",   name:"McDonald's",           sector:"Consumer" },
  { ticker:"COST",  name:"Costco",               sector:"Consumer" },
  { ticker:"TGT",   name:"Target",               sector:"Consumer" },
  { ticker:"LOW",   name:"Lowe's",               sector:"Consumer" },
  { ticker:"BKNG",  name:"Booking Holdings",     sector:"Consumer" },
  { ticker:"ABNB",  name:"Airbnb",               sector:"Consumer" },
  { ticker:"XOM",   name:"ExxonMobil",           sector:"Energy" },
  { ticker:"CVX",   name:"Chevron",              sector:"Energy" },
  { ticker:"COP",   name:"ConocoPhillips",       sector:"Energy" },
  { ticker:"SLB",   name:"Schlumberger",         sector:"Energy" },
  { ticker:"EOG",   name:"EOG Resources",        sector:"Energy" },
  { ticker:"MPC",   name:"Marathon Petroleum",   sector:"Energy" },
  { ticker:"VLO",   name:"Valero Energy",        sector:"Energy" },
  { ticker:"OXY",   name:"Occidental Pete",      sector:"Energy" },
  { ticker:"DVN",   name:"Devon Energy",         sector:"Energy" },
  { ticker:"HAL",   name:"Halliburton",          sector:"Energy" },
  { ticker:"CAT",   name:"Caterpillar",          sector:"Industrials" },
  { ticker:"BA",    name:"Boeing",               sector:"Industrials" },
  { ticker:"HON",   name:"Honeywell",            sector:"Industrials" },
  { ticker:"UPS",   name:"UPS",                  sector:"Industrials" },
  { ticker:"RTX",   name:"Raytheon",             sector:"Industrials" },
  { ticker:"LMT",   name:"Lockheed Martin",      sector:"Industrials" },
  { ticker:"DE",    name:"Deere & Co",           sector:"Industrials" },
  { ticker:"GE",    name:"GE Aerospace",         sector:"Industrials" },
  { ticker:"MMM",   name:"3M",                   sector:"Industrials" },
  { ticker:"FDX",   name:"FedEx",                sector:"Industrials" },
  { ticker:"NFLX",  name:"Netflix",              sector:"Communication" },
  { ticker:"DIS",   name:"Disney",               sector:"Communication" },
  { ticker:"SPOT",  name:"Spotify",              sector:"Communication" },
  { ticker:"TTD",   name:"The Trade Desk",       sector:"Communication" },
  { ticker:"SNAP",  name:"Snap Inc",             sector:"Communication" },
  { ticker:"PINS",  name:"Pinterest",            sector:"Communication" },
  { ticker:"ROKU",  name:"Roku",                 sector:"Communication" },
  { ticker:"UBER",  name:"Uber",                 sector:"Communication" },
  { ticker:"LYFT",  name:"Lyft",                 sector:"Communication" },
  { ticker:"RBLX",  name:"Roblox",               sector:"Communication" },
  { ticker:"MSTR",  name:"MicroStrategy",        sector:"AI & Growth" },
  { ticker:"ARM",   name:"ARM Holdings",         sector:"AI & Growth" },
  { ticker:"SMCI",  name:"Super Micro",          sector:"AI & Growth" },
  { ticker:"AI",    name:"C3.ai",                sector:"AI & Growth" },
  { ticker:"SOUN",  name:"SoundHound AI",        sector:"AI & Growth" },
  { ticker:"IONQ",  name:"IonQ",                 sector:"AI & Growth" },
  { ticker:"RGTI",  name:"Rigetti Computing",    sector:"AI & Growth" },
  { ticker:"RIVN",  name:"Rivian",               sector:"AI & Growth" },
  { ticker:"LCID",  name:"Lucid Group",          sector:"AI & Growth" },
  { ticker:"BBAI",  name:"BigBear.ai",           sector:"AI & Growth" },
  { ticker:"NEM",   name:"Newmont Mining",       sector:"Materials" },
  { ticker:"FCX",   name:"Freeport-McMoRan",     sector:"Materials" },
  { ticker:"BHP",   name:"BHP Group ADR",        sector:"Materials" },
  { ticker:"RIO",   name:"Rio Tinto ADR",        sector:"Materials" },
  { ticker:"VALE",  name:"Vale ADR",             sector:"Materials" },
  { ticker:"CLF",   name:"Cleveland-Cliffs",     sector:"Materials" },
  { ticker:"X",     name:"US Steel",             sector:"Materials" },
  { ticker:"AA",    name:"Alcoa",                sector:"Materials" },
  { ticker:"MP",    name:"MP Materials",         sector:"Materials" },
];

const INDEX_TICKERS = ["SPY","QQQ","^VIX","GLD","UUP"];

// ── Cache ─────────────────────────────────────────────────────────────────────
let cachedResults  = null;
let cacheTime      = null;
let scanInProgress = false;

// ── Rotating user agents — mimics different real browsers ────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ── Random delay between requests (1.5s–4s) ───────────────────────────────────
function randomDelay() {
  const ms = 1500 + Math.random() * 2500;
  return new Promise(r => setTimeout(r, ms));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Yahoo Finance fetch with retry ────────────────────────────────────────────
function fetchYahoo(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (triesLeft) => {
      const headers = {
        "User-Agent":      getRandomUA(),
        "Accept":          "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control":   "no-cache",
        "Pragma":          "no-cache",
        "Sec-Fetch-Dest":  "empty",
        "Sec-Fetch-Mode":  "cors",
        "Sec-Fetch-Site":  "same-site",
      };

      // Alternate between query1 and query2 to distribute requests
      const finalUrl = url.replace(
        "query1.finance.yahoo.com",
        Math.random() > 0.5 ? "query1.finance.yahoo.com" : "query2.finance.yahoo.com"
      );

      const req = https.get(finalUrl, { headers }, (res) => {
        // Handle redirect
        if (res.statusCode === 301 || res.statusCode === 302) {
          if (res.headers.location) {
            return fetchYahoo(res.headers.location, triesLeft - 1).then(resolve).catch(reject);
          }
        }
        if (res.statusCode === 429 || res.statusCode === 503) {
          if (triesLeft > 1) {
            console.log(`    Rate limited (${res.statusCode}), waiting 5s before retry...`);
            return setTimeout(() => attempt(triesLeft - 1), 5000);
          }
          return reject(new Error(`Rate limited: ${res.statusCode}`));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => {
          try {
            const raw  = Buffer.concat(chunks).toString("utf8");
            const json = JSON.parse(raw);
            resolve(json);
          } catch(e) {
            reject(new Error("JSON parse error"));
          }
        });
      });
      req.on("error", (e) => {
        if (triesLeft > 1) {
          setTimeout(() => attempt(triesLeft - 1), 2000);
        } else {
          reject(e);
        }
      });
      req.setTimeout(20000, () => { req.destroy(); reject(new Error("Timeout")); });
    };
    attempt(retries);
  });
}

// ── Fetch 6 months of daily OHLCV ────────────────────────────────────────────
async function fetchHistory(ticker) {
  const to   = Math.floor(Date.now() / 1000);
  const from = to - 180 * 24 * 3600;
  const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&period1=${from}&period2=${to}`;
  const data = await fetchYahoo(url);
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${ticker}`);
  const q    = result.indicators.quote[0];
  const meta = result.meta;
  const closes  = (q.close  || []).map((v,i) => ({ v, h: q.high[i], l: q.low[i], vol: q.volume[i] })).filter(x => x.v != null);
  if (closes.length < 20) throw new Error(`Insufficient history (${closes.length} bars)`);
  return {
    closes:    closes.map(x => x.v),
    highs:     closes.map(x => x.h || x.v),
    lows:      closes.map(x => x.l || x.v),
    volumes:   closes.map(x => x.vol || 0),
    currentPrice:  meta.regularMarketPrice || closes[closes.length-1].v,
    previousClose: meta.chartPreviousClose || closes[closes.length-2]?.v,
    week52High:    meta.fiftyTwoWeekHigh   || null,
    week52Low:     meta.fiftyTwoWeekLow    || null,
  };
}

// ── Indicators ────────────────────────────────────────────────────────────────
function calcRSI(c, n=14) {
  if (c.length < n+1) return null;
  let g=0, l=0;
  for (let i=c.length-n; i<c.length; i++) { const d=c[i]-c[i-1]; d>0?g+=d:l-=d; }
  return 100 - 100/(1+g/(l||.001));
}
function calcEMA(c, n) {
  if (c.length < n) return null;
  const k=2/(n+1); let e=c.slice(0,n).reduce((a,b)=>a+b,0)/n;
  for (let i=n; i<c.length; i++) e=c[i]*k+e*(1-k); return e;
}
function calcMACD(c) { const e12=calcEMA(c,12), e26=calcEMA(c,26); return e12&&e26?e12-e26:null; }
function calcATR(h,l,c,n=14) {
  if (c.length<n+1) return null;
  const tr=[];
  for (let i=c.length-n; i<c.length; i++) tr.push(Math.max(h[i]-l[i],Math.abs(h[i]-c[i-1]),Math.abs(l[i]-c[i-1])));
  return tr.reduce((a,b)=>a+b,0)/n;
}
function calcVS(v) {
  if (v.length<21) return 1;
  const avg=v.slice(-21,-1).reduce((a,b)=>a+b,0)/20; return v[v.length-1]/(avg||1);
}

// ── Score ─────────────────────────────────────────────────────────────────────
function scoreStock(stock, data) {
  const {closes:c, highs:h, lows:l, volumes:v, currentPrice, previousClose, week52High, week52Low} = data;
  const price  = currentPrice;
  const dayChg = previousClose ? ((price-previousClose)/previousClose)*100 : 0;
  const mom5   = c.length>=6 ? ((price-c[c.length-6])/c[c.length-6])*100 : 0;
  const rsi    = calcRSI(c);
  const macd   = calcMACD(c);
  const sma20  = c.slice(-20).reduce((a,b)=>a+b,0)/20;
  const sma50  = c.length>=50 ? c.slice(-50).reduce((a,b)=>a+b,0)/50 : null;
  const ema9   = calcEMA(c,9);
  const atr    = calcATR(h,l,c);
  const vs     = calcVS(v);
  const w52H   = week52High || Math.max(...c);
  const w52L   = week52Low  || Math.min(...c);
  const w52P   = w52H>w52L ? ((price-w52L)/(w52H-w52L))*100 : 50;

  let score=0; const signals=[];
  if (rsi!=null) {
    if      (rsi<30){score+=35;signals.push(`RSI deeply oversold (${rsi.toFixed(0)})`);}
    else if (rsi<40){score+=25;signals.push(`RSI oversold (${rsi.toFixed(0)})`);}
    else if (rsi<50){score+=10;signals.push(`RSI recovering (${rsi.toFixed(0)})`);}
  }
  if (macd>0)            {score+=20;signals.push("MACD bullish");}
  if (price>sma20)       {score+=10;signals.push("Above SMA20");}
  if (sma50&&price>sma50){score+=10;signals.push("Above SMA50");}
  if (sma50&&sma20>sma50){score+=10;signals.push("Golden cross (SMA20>SMA50)");}
  if (ema9&&price>ema9)  {score+=10;signals.push("Above EMA9");}
  if (vs>2)              {score+=20;signals.push(`Volume surge ${vs.toFixed(1)}x`);}
  else if (vs>1.5)       {score+=10;signals.push(`Volume ${vs.toFixed(1)}x avg`);}
  if (mom5>5)            {score+=15;signals.push(`+${mom5.toFixed(1)}% 5-day momentum`);}
  else if (mom5>2)       {score+=8; signals.push(`+${mom5.toFixed(1)}% 5-day move`);}
  if (dayChg>1.5)        {score+=10;signals.push(`Up ${dayChg.toFixed(1)}% today`);}
  if (w52P<25)           {score+=15;signals.push("Near 52-week low (value zone)");}
  else if (w52P<40)      {score+=8; signals.push("Below 52-week midpoint");}

  const stopBuf  = atr?atr*1.2:price*0.04;
  const targBuf  = atr?atr*2.2:price*0.08;
  const fmt = v => parseFloat(v.toFixed(v>=100?2:v>=10?2:3));

  return {
    ...stock,
    week52High:    fmt(w52H), week52Low: fmt(w52L),
    dividendYield: null,
    score, signals: signals.slice(0,5),
    confidence: Math.min(97,Math.round(score*1.05)),
    price: fmt(price), entry: fmt(price),
    target: fmt(price+targBuf), stop: fmt(price-stopBuf),
    upside:   ((targBuf/price)*100).toFixed(1),
    downside: ((stopBuf/price)*100).toFixed(1),
    rr:       (targBuf/stopBuf).toFixed(1),
    rsi:      rsi?parseFloat(rsi.toFixed(1)):null,
    dayChg:   parseFloat(dayChg.toFixed(2)),
    mom5:     parseFloat(mom5.toFixed(1)),
    volSpike: parseFloat(vs.toFixed(1)),
    w52Pos:   parseFloat(w52P.toFixed(1)),
  };
}

// ── Core scan ─────────────────────────────────────────────────────────────────
async function runScan() {
  if (scanInProgress) { console.log("⏳ Already scanning..."); return; }
  scanInProgress = true;
  console.log(`\n🔍 Scanning ${STOCKS.length} stocks — ${new Date().toISOString()}`);

  const results=[], failed=[];

  for (let i=0; i<STOCKS.length; i++) {
    const stock = STOCKS[i];
    try {
      const data   = await fetchHistory(stock.ticker);
      const scored = scoreStock(stock, data);
      if (scored) {
        results.push(scored);
        console.log(`  ✅ [${i+1}/${STOCKS.length}] ${stock.ticker} $${scored.price} score:${scored.score}`);
      }
    } catch(e) {
      console.log(`  ❌ [${i+1}/${STOCKS.length}] ${stock.ticker}: ${e.message}`);
      failed.push(stock.ticker);
    }
    // Random delay 1.5–4s between stocks to avoid rate limiting
    if (i < STOCKS.length-1) await randomDelay();
  }

  if (results.length > 0) {
    cachedResults = {
      success: true,
      results: results.sort((a,b)=>b.score-a.score),
      failed, total: STOCKS.length,
      scannedAt: new Date().toISOString(),
    };
    cacheTime = new Date();
    console.log(`✅ Done — ${results.length} scored, ${failed.length} failed`);
  } else {
    console.log("❌ No results returned");
  }
  scanInProgress = false;
}

// ── Scheduler: 1:00 AM AEST = 3:00 PM UTC weekdays ───────────────────────────
cron.schedule("0 15 * * 1-5", () => {
  console.log("⏰ Auto-scan triggered — 1:00 AM AEST");
  runScan();
}, { timezone: "UTC" });

// ── /api/scan ─────────────────────────────────────────────────────────────────
app.get("/api/scan", async (req, res) => {
  const force = req.query.refresh === "true";
  if (cachedResults && cacheTime && !force) {
    const age = (new Date()-cacheTime)/(1000*60*60);
    if (age < 23) {
      return res.json({ ...cachedResults, fromCache:true, cacheAgeHours: parseFloat(age.toFixed(1)) });
    }
  }
  try {
    await runScan();
    if (cachedResults) res.json({ ...cachedResults, fromCache:false });
    else res.status(500).json({ success:false, error:"Scan failed — Yahoo Finance may be blocking. Wait a few minutes and try again." });
  } catch(err) {
    res.status(500).json({ success:false, error:err.message });
  }
});

// ── /api/indices ──────────────────────────────────────────────────────────────
app.get("/api/indices", async (req, res) => {
  const data = {};
  for (const sym of INDEX_TICKERS) {
    try {
      const to=Math.floor(Date.now()/1000), from=to-5*24*3600;
      const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&period1=${from}&period2=${to}`;
      const json = await fetchYahoo(url);
      const meta = json?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) {
        data[sym] = { price: meta.regularMarketPrice, changePct: meta.regularMarketChangePercent||0, label: sym };
      }
      await sleep(500);
    } catch(e) { console.log(`Index ${sym}: ${e.message}`); }
  }
  res.json({ success:true, data });
});

// ── /api/status ───────────────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  const age = cacheTime ? ((new Date()-cacheTime)/(1000*60*60)).toFixed(1) : null;
  res.json({
    status: "ok", stocks: STOCKS.length, scanInProgress,
    lastScan: cacheTime ? cacheTime.toISOString() : "Never",
    cacheAgeHours: age, nextScheduled: "1:00 AM AEST Mon–Fri",
    dataSource: "Yahoo Finance direct (free, no key)",
  });
});

app.get("/api/health", (req,res) => res.json({ status:"ok" }));

app.get("*", (req,res) => res.sendFile(path.join(__dirname,"public","index.html")));

app.listen(PORT, () => {
  console.log(`\n⚡ AggressiveAlpha-100 on port ${PORT}`);
  console.log(`   100 stocks · Yahoo Finance · rotating UA · random delays\n`);
});
