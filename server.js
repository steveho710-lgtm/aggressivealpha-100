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

// ── 100 US Stocks across 9 sectors ───────────────────────────────────────────
const STOCKS = [
  // TECHNOLOGY (15)
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
  // FINANCIALS (12)
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
  // HEALTHCARE (12)
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
  // CONSUMER (12)
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
  // ENERGY (10)
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
  // INDUSTRIALS (10)
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
  // COMMUNICATION (10)
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
  // AI & GROWTH (10)
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
  // MATERIALS (9)
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

// ── Yahoo Finance direct HTTP fetch ──────────────────────────────────────────
// Mimics a browser request — works perfectly server-side, no CORS issues
const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json,text/html,application/xhtml+xml,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
};

function fetchYahoo(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: YF_HEADERS }, (res) => {
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
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Fetch 6 months of daily OHLCV from Yahoo Finance ────────────────────────
async function fetchHistory(ticker) {
  const to   = Math.floor(Date.now() / 1000);
  const from = to - 180 * 24 * 3600; // 6 months back
  const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&period1=${from}&period2=${to}`;
  const data = await fetchYahoo(url);
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${ticker}`);
  const q = result.indicators.quote[0];
  const meta = result.meta;
  // Filter out null values
  const closes  = q.close.filter(Boolean);
  const highs   = q.high.filter(Boolean);
  const lows    = q.low.filter(Boolean);
  const volumes = q.volume.filter(v => v != null);
  if (closes.length < 20) throw new Error(`Insufficient history for ${ticker}`);
  return {
    closes, highs, lows, volumes,
    currentPrice:  meta.regularMarketPrice || closes[closes.length-1],
    previousClose: meta.chartPreviousClose || closes[closes.length-2],
    week52High:    meta.fiftyTwoWeekHigh   || null,
    week52Low:     meta.fiftyTwoWeekLow    || null,
  };
}

// ── Fetch dividend yield from Yahoo Finance quote summary ────────────────────
async function fetchDividendYield(ticker) {
  try {
    const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const data = await fetchYahoo(url);
    const meta = data?.chart?.result?.[0]?.meta;
    return meta?.dividendRate && meta?.regularMarketPrice
      ? (meta.dividendRate / meta.regularMarketPrice) * 100
      : null;
  } catch { return null; }
}

// ── Technical Indicators ──────────────────────────────────────────────────────
function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let g = 0, l = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  return 100 - 100 / (1 + g / (l || 0.001));
}
function calcEMA(closes, period) {
  if (closes.length < period) return null;
  const k = 2 / (period + 1);
  let e = closes.slice(0, period).reduce((a,b) => a+b, 0) / period;
  for (let i = period; i < closes.length; i++) e = closes[i]*k + e*(1-k);
  return e;
}
function calcMACD(closes) {
  const e12 = calcEMA(closes,12), e26 = calcEMA(closes,26);
  return e12 && e26 ? e12 - e26 : null;
}
function calcATR(h, l, c, n = 14) {
  if (c.length < n+1) return null;
  const tr = [];
  for (let i = c.length-n; i < c.length; i++)
    tr.push(Math.max(h[i]-l[i], Math.abs(h[i]-c[i-1]), Math.abs(l[i]-c[i-1])));
  return tr.reduce((a,b) => a+b, 0) / n;
}
function calcVolSpike(volumes) {
  if (volumes.length < 21) return 1;
  const avg = volumes.slice(-21,-1).reduce((a,b) => a+b, 0) / 20;
  return volumes[volumes.length-1] / (avg || 1);
}

// ── Score engine ──────────────────────────────────────────────────────────────
function scoreStock(stock, data, divYield) {
  const { closes, highs, lows, volumes, currentPrice, previousClose, week52High, week52Low } = data;
  const price   = currentPrice;
  const dayChg  = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;
  const mom5    = closes.length >= 6 ? ((price - closes[closes.length-6]) / closes[closes.length-6]) * 100 : 0;
  const rsi     = calcRSI(closes);
  const macdVal = calcMACD(closes);
  const sma20   = closes.slice(-20).reduce((a,b) => a+b, 0) / 20;
  const sma50   = closes.length >= 50 ? closes.slice(-50).reduce((a,b) => a+b, 0) / 50 : null;
  const ema9    = calcEMA(closes, 9);
  const atr     = calcATR(highs, lows, closes);
  const vs      = calcVolSpike(volumes);
  const w52High = week52High || Math.max(...closes);
  const w52Low  = week52Low  || Math.min(...closes);
  const w52Range= w52High - w52Low;
  const w52Pos  = w52Range > 0 ? ((price - w52Low) / w52Range) * 100 : 50;

  let score = 0; const signals = [];

  if (rsi != null) {
    if      (rsi < 30) { score += 35; signals.push(`RSI deeply oversold (${rsi.toFixed(0)})`); }
    else if (rsi < 40) { score += 25; signals.push(`RSI oversold (${rsi.toFixed(0)})`); }
    else if (rsi < 50) { score += 10; signals.push(`RSI recovering (${rsi.toFixed(0)})`); }
  }
  if (macdVal > 0)           { score += 20; signals.push("MACD bullish"); }
  if (price > sma20)         { score += 10; signals.push("Above SMA20"); }
  if (sma50 && price > sma50){ score += 10; signals.push("Above SMA50"); }
  if (sma50 && sma20 > sma50){ score += 10; signals.push("Golden cross (SMA20>SMA50)"); }
  if (ema9  && price > ema9) { score += 10; signals.push("Above EMA9"); }
  if (vs > 2)                { score += 20; signals.push(`Volume surge ${vs.toFixed(1)}x`); }
  else if (vs > 1.5)         { score += 10; signals.push(`Volume ${vs.toFixed(1)}x avg`); }
  if (mom5 > 5)              { score += 15; signals.push(`+${mom5.toFixed(1)}% 5-day momentum`); }
  else if (mom5 > 2)         { score +=  8; signals.push(`+${mom5.toFixed(1)}% 5-day move`); }
  if (dayChg > 1.5)          { score += 10; signals.push(`Up ${dayChg.toFixed(1)}% today`); }
  if (w52Pos < 25)           { score += 15; signals.push("Near 52-week low (value zone)"); }
  else if (w52Pos < 40)      { score +=  8; signals.push("Below 52-week midpoint"); }

  const stopBuf   = atr ? atr * 1.2 : price * 0.04;
  const targetBuf = atr ? atr * 2.2 : price * 0.08;
  const fmt = v => parseFloat(v.toFixed(v >= 100 ? 2 : v >= 10 ? 2 : 3));

  return {
    ...stock,
    week52High:    fmt(w52High),
    week52Low:     fmt(w52Low),
    dividendYield: divYield ? parseFloat(divYield.toFixed(2)) : null,
    score,
    signals:    signals.slice(0, 5),
    confidence: Math.min(97, Math.round(score * 1.05)),
    price:      fmt(price),
    entry:      fmt(price),
    target:     fmt(price + targetBuf),
    stop:       fmt(price - stopBuf),
    upside:     ((targetBuf / price) * 100).toFixed(1),
    downside:   ((stopBuf  / price) * 100).toFixed(1),
    rr:         (targetBuf / stopBuf).toFixed(1),
    rsi:        rsi ? parseFloat(rsi.toFixed(1)) : null,
    dayChg:     parseFloat(dayChg.toFixed(2)),
    mom5:       parseFloat(mom5.toFixed(1)),
    volSpike:   parseFloat(vs.toFixed(1)),
    w52Pos:     parseFloat(w52Pos.toFixed(1)),
  };
}

// ── Core scan function ────────────────────────────────────────────────────────
async function runScan() {
  if (scanInProgress) {
    console.log("⏳ Scan already in progress, skipping...");
    return;
  }
  scanInProgress = true;
  console.log(`\n🔍 Starting scan of ${STOCKS.length} stocks — ${new Date().toISOString()}`);

  const results = [], failed = [];

  for (let i = 0; i < STOCKS.length; i++) {
    const stock = STOCKS[i];
    try {
      const data    = await fetchHistory(stock.ticker);
      const divYield= await fetchDividendYield(stock.ticker);
      const scored  = scoreStock(stock, data, divYield);
      if (scored) {
        results.push(scored);
        console.log(`  ✅ [${i+1}/${STOCKS.length}] ${stock.ticker} $${scored.price} | score:${scored.score}`);
      }
    } catch(e) {
      console.log(`  ❌ [${i+1}/${STOCKS.length}] ${stock.ticker}: ${e.message}`);
      failed.push(stock.ticker);
    }
    // Small delay to be polite to Yahoo Finance — 300ms between stocks
    if (i < STOCKS.length - 1) await sleep(300);
  }

  if (results.length > 0) {
    cachedResults = {
      success:   true,
      results:   results.sort((a,b) => b.score - a.score),
      failed,
      total:     STOCKS.length,
      scannedAt: new Date().toISOString(),
      scheduled: true,
    };
    cacheTime = new Date();
    console.log(`✅ Scan done — ${results.length} scored, ${failed.length} failed — cached at ${cacheTime.toISOString()}`);
  } else {
    console.log("❌ No results — Yahoo Finance may be blocking. Cache not updated.");
  }
  scanInProgress = false;
}

// ── Scheduler: 1:00 AM AEST = 3:00 PM UTC, weekdays only ────────────────────
cron.schedule("0 15 * * 1-5", () => {
  console.log("⏰ Scheduled scan triggered — 1:00 AM AEST");
  runScan();
}, { timezone: "UTC" });

console.log("⏰ Auto-scan scheduled: 1:00 AM AEST (3:00 PM UTC), Mon–Fri");

// ── /api/scan ─────────────────────────────────────────────────────────────────
app.get("/api/scan", async (req, res) => {
  const forceRefresh = req.query.refresh === "true";

  // Return cache if fresh (< 23 hours) and not forcing refresh
  if (cachedResults && cacheTime && !forceRefresh) {
    const ageHours = (new Date() - cacheTime) / (1000 * 60 * 60);
    if (ageHours < 23) {
      console.log(`📦 Serving cache (${ageHours.toFixed(1)}h old)`);
      return res.json({ ...cachedResults, fromCache: true, cacheAgeHours: parseFloat(ageHours.toFixed(1)) });
    }
  }

  // Run fresh scan
  try {
    await runScan();
    if (cachedResults) {
      res.json({ ...cachedResults, fromCache: false });
    } else {
      res.status(500).json({ success: false, error: "Scan failed — Yahoo Finance may be temporarily blocking. Try again in a few minutes." });
    }
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── /api/indices ──────────────────────────────────────────────────────────────
app.get("/api/indices", async (req, res) => {
  try {
    const data = {};
    for (const sym of INDEX_TICKERS) {
      try {
        const to   = Math.floor(Date.now() / 1000);
        const from = to - 5 * 24 * 3600;
        const url  = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&period1=${from}&period2=${to}`;
        const json = await fetchYahoo(url);
        const meta = json?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          data[sym] = {
            price:     meta.regularMarketPrice,
            changePct: meta.regularMarketChangePercent || 0,
            label:     sym,
          };
        }
        await sleep(200);
      } catch(e) {
        console.log(`Index ${sym} failed: ${e.message}`);
      }
    }
    res.json({ success: true, data });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── /api/status ───────────────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  const ageHours = cacheTime ? ((new Date() - cacheTime) / (1000*60*60)).toFixed(1) : null;
  res.json({
    status:        "ok",
    stocks:        STOCKS.length,
    scanInProgress,
    lastScan:      cacheTime ? cacheTime.toISOString() : "Never",
    cacheAgeHours: ageHours,
    nextScheduled: "Daily 1:00 AM AEST (Mon–Fri)",
    dataSource:    "Yahoo Finance (direct, free, unlimited)",
    watchlist:     STOCKS.map(s => s.ticker),
  });
});

// ── /api/health ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AggressiveAlpha — Yahoo Finance direct, 100 stocks!" });
});

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n⚡ AggressiveAlpha on port ${PORT}`);
  console.log(`   ${STOCKS.length} stocks · Yahoo Finance direct · No API key needed`);
  console.log(`   Auto-scan: 1:00 AM AEST daily (Mon–Fri)\n`);
});
