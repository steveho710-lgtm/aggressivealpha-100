const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const https      = require("https");
const cron       = require("node-cron");
const { createClient } = require("@supabase/supabase-js");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Supabase ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://dfzdestrmsxbtsealnra.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmemRlc3RybXN4YnRzZWFsbnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzYzNjQsImV4cCI6MjA5NTAxMjM2NH0.pI7fhvfI7GaHX-GhnSCBgCnndTupRdfsm3mQw_K2h3s";
const supabase   = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// ── Cache & state ─────────────────────────────────────────────────────────────
let cachedResults  = null;
let cacheTime      = null;
let scanInProgress = false;
let scanProgress   = 0;

// ── Rotating user agents ──────────────────────────────────────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];
function getUA() { return USER_AGENTS[Math.floor(Math.random()*USER_AGENTS.length)]; }
function randomDelay() { return new Promise(r => setTimeout(r, 1500+Math.random()*2500)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Yahoo Finance fetch ───────────────────────────────────────────────────────
function fetchYahoo(url, retries=3) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      const headers = {
        "User-Agent": getUA(),
        "Accept": "application/json, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      };
      const finalUrl = url.replace("query1.finance.yahoo.com",
        Math.random()>0.5 ? "query1.finance.yahoo.com" : "query2.finance.yahoo.com");
      const req = https.get(finalUrl, {headers}, (res) => {
        if (res.statusCode===429||res.statusCode===503) {
          if (left>1) return setTimeout(()=>attempt(left-1), 6000);
          return reject(new Error(`Rate limited ${res.statusCode}`));
        }
        if (res.statusCode!==200) return reject(new Error(`HTTP ${res.statusCode}`));
        const chunks=[];
        res.on("data", c=>chunks.push(c));
        res.on("end", ()=>{
          try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
          catch(e) { reject(new Error("JSON parse error")); }
        });
      });
      req.on("error", e=>{ if(left>1) setTimeout(()=>attempt(left-1),2000); else reject(e); });
      req.setTimeout(20000, ()=>{ req.destroy(); reject(new Error("Timeout")); });
    };
    attempt(retries);
  });
}

// ── Fetch 6 months OHLCV ─────────────────────────────────────────────────────
async function fetchHistory(ticker) {
  const to=Math.floor(Date.now()/1000), from=to-180*24*3600;
  const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&period1=${from}&period2=${to}`;
  const data=await fetchYahoo(url);
  const result=data?.chart?.result?.[0];
  if (!result) throw new Error("No data");
  const q=result.indicators.quote[0], meta=result.meta;
  const rows=(q.close||[]).map((v,i)=>({v,h:q.high[i],l:q.low[i],vol:q.volume[i]})).filter(x=>x.v!=null);
  if (rows.length<20) throw new Error("Insufficient history");
  return {
    closes:  rows.map(x=>x.v),
    highs:   rows.map(x=>x.h||x.v),
    lows:    rows.map(x=>x.l||x.v),
    volumes: rows.map(x=>x.vol||0),
    currentPrice:  meta.regularMarketPrice||rows[rows.length-1].v,
    previousClose: meta.chartPreviousClose||rows[rows.length-2]?.v,
    week52High:    meta.fiftyTwoWeekHigh||null,
    week52Low:     meta.fiftyTwoWeekLow||null,
    // Latest bar OHLC for verification
    latestOpen:    q.open?.[q.open.length-1]||null,
    latestHigh:    q.high?.[q.high.length-1]||null,
    latestLow:     q.low?.[q.low.length-1]||null,
    latestClose:   q.close?.[q.close.length-1]||null,
  };
}

// ── Indicators ────────────────────────────────────────────────────────────────
const calcRSI=(c,n=14)=>{if(c.length<n+1)return null;let g=0,l=0;for(let i=c.length-n;i<c.length;i++){const d=c[i]-c[i-1];d>0?g+=d:l-=d;}return 100-100/(1+g/(l||.001));};
const calcEMA=(c,n)=>{if(c.length<n)return null;const k=2/(n+1);let e=c.slice(0,n).reduce((a,b)=>a+b,0)/n;for(let i=n;i<c.length;i++)e=c[i]*k+e*(1-k);return e;};
const calcMACD=c=>{const e12=calcEMA(c,12),e26=calcEMA(c,26);return e12&&e26?e12-e26:null;};
const calcATR=(h,l,c,n=14)=>{if(c.length<n+1)return null;const tr=[];for(let i=c.length-n;i<c.length;i++)tr.push(Math.max(h[i]-l[i],Math.abs(h[i]-c[i-1]),Math.abs(l[i]-c[i-1])));return tr.reduce((a,b)=>a+b,0)/n;};
const calcVS=v=>{if(v.length<21)return 1;const avg=v.slice(-21,-1).reduce((a,b)=>a+b,0)/20;return v[v.length-1]/(avg||1);};

// ── Score ─────────────────────────────────────────────────────────────────────
function scoreStock(stock, data) {
  const {closes:c,highs:h,lows:l,volumes:v,currentPrice,previousClose,week52High,week52Low}=data;
  const price=currentPrice,dayChg=previousClose?((price-previousClose)/previousClose)*100:0;
  const mom5=c.length>=6?((price-c[c.length-6])/c[c.length-6])*100:0;
  const rsi=calcRSI(c),macd=calcMACD(c),sma20=c.slice(-20).reduce((a,b)=>a+b,0)/20;
  const sma50=c.length>=50?c.slice(-50).reduce((a,b)=>a+b,0)/50:null;
  const ema9=calcEMA(c,9),atr=calcATR(h,l,c),vs=calcVS(v);
  const w52H=week52High||Math.max(...c),w52L=week52Low||Math.min(...c);
  const w52P=w52H>w52L?((price-w52L)/(w52H-w52L))*100:50;

  let score=0;const signals=[];
  if(rsi!=null){if(rsi<30){score+=35;signals.push(`RSI deeply oversold (${rsi.toFixed(0)})`);}else if(rsi<40){score+=25;signals.push(`RSI oversold (${rsi.toFixed(0)})`);}else if(rsi<50){score+=10;signals.push(`RSI recovering (${rsi.toFixed(0)})`);}}
  if(macd>0){score+=20;signals.push("MACD bullish");}
  if(price>sma20){score+=10;signals.push("Above SMA20");}
  if(sma50&&price>sma50){score+=10;signals.push("Above SMA50");}
  if(sma50&&sma20>sma50){score+=10;signals.push("Golden cross (SMA20>SMA50)");}
  if(ema9&&price>ema9){score+=10;signals.push("Above EMA9");}
  if(vs>2){score+=20;signals.push(`Volume surge ${vs.toFixed(1)}x`);}else if(vs>1.5){score+=10;signals.push(`Volume ${vs.toFixed(1)}x avg`);}
  if(mom5>5){score+=15;signals.push(`+${mom5.toFixed(1)}% 5-day momentum`);}else if(mom5>2){score+=8;signals.push(`+${mom5.toFixed(1)}% 5-day move`);}
  if(dayChg>1.5){score+=10;signals.push(`Up ${dayChg.toFixed(1)}% today`);}
  if(w52P<25){score+=15;signals.push("Near 52-week low (value zone)");}else if(w52P<40){score+=8;signals.push("Below 52-week midpoint");}

  const stopBuf=atr?atr*1.2:price*0.04,targBuf=atr?atr*2.2:price*0.08;
  const fmt=v=>parseFloat(v.toFixed(v>=100?2:v>=10?2:3));
  return {
    ...stock,week52High:fmt(w52H),week52Low:fmt(w52L),dividendYield:null,
    score,signals:signals.slice(0,5),confidence:Math.min(97,Math.round(score*1.05)),
    price:fmt(price),entry:fmt(price),target:fmt(price+targBuf),stop:fmt(price-stopBuf),
    upside:((targBuf/price)*100).toFixed(1),downside:((stopBuf/price)*100).toFixed(1),
    rr:(targBuf/stopBuf).toFixed(1),rsi:rsi?parseFloat(rsi.toFixed(1)):null,
    dayChg:parseFloat(dayChg.toFixed(2)),mom5:parseFloat(mom5.toFixed(1)),
    volSpike:parseFloat(vs.toFixed(1)),w52Pos:parseFloat(w52P.toFixed(1)),
  };
}

// ── Save Top 10 signals to Supabase ──────────────────────────────────────────
async function saveSignalsToSupabase(top10, scanDate) {
  try {
    const rows = top10.map(s => ({
      scan_date:    scanDate,
      ticker:       s.ticker,
      company_name: s.name,
      sector:       s.sector,
      entry_price:  s.entry,
      target_price: s.target,
      stop_price:   s.stop,
      confidence:   s.confidence,
      score:        s.score,
      signals:      s.signals.join(" | "),
    }));
    const { error } = await supabase.from("signal_history").insert(rows);
    if (error) console.log("❌ Supabase save error:", error.message);
    else console.log(`✅ Saved ${rows.length} signals to Supabase for ${scanDate}`);
  } catch(e) {
    console.log("❌ Supabase save failed:", e.message);
  }
}

// ── Verify signals after market close ────────────────────────────────────────
async function runVerification() {
  console.log("\n📊 Running signal verification...");
  const today = new Date().toISOString().split("T")[0];

  // Get today's signals from Supabase
  const { data: signals, error } = await supabase
    .from("signal_history")
    .select("*")
    .eq("scan_date", today);

  if (error || !signals?.length) {
    console.log("❌ No signals found for today to verify");
    return;
  }

  console.log(`📡 Verifying ${signals.length} signals for ${today}...`);
  const verifications = [];

  for (const sig of signals) {
    try {
      const data = await fetchHistory(sig.ticker);
      const high  = data.latestHigh;
      const low   = data.latestLow;
      const open  = data.latestOpen;
      const close = data.latestClose;

      // Determine if entry/target/stop were hit during the day
      const entryHit  = low  <= sig.entry_price;  // price dipped to entry
      const targetHit = high >= sig.target_price; // price rose to target
      const stopHit   = low  <= sig.stop_price;   // price fell to stop

      // Determine overall result
      let result = "OPEN";
      if (targetHit && !stopHit)        result = "TARGET_HIT";
      else if (stopHit && !targetHit)   result = "STOP_HIT";
      else if (targetHit && stopHit)    result = "MIXED"; // both hit same day
      else if (entryHit)                result = "ENTRY_HIT";
      else                              result = "NO_ENTRY";

      verifications.push({
        scan_date:   today,
        ticker:      sig.ticker,
        entry_price: sig.entry_price,
        target_price:sig.target_price,
        stop_price:  sig.stop_price,
        day_open:    open,
        day_high:    high,
        day_low:     low,
        day_close:   close,
        entry_hit:   entryHit,
        target_hit:  targetHit,
        stop_hit:    stopHit,
        result,
      });
      console.log(`  ✅ ${sig.ticker}: ${result} (H:${high} L:${low} Entry:${sig.entry_price} Target:${sig.target_price} Stop:${sig.stop_price})`);
      await sleep(500);
    } catch(e) {
      console.log(`  ❌ ${sig.ticker}: ${e.message}`);
    }
  }

  if (verifications.length > 0) {
    const { error: vError } = await supabase.from("signal_verification").insert(verifications);
    if (vError) console.log("❌ Supabase verification save error:", vError.message);
    else console.log(`✅ Saved ${verifications.length} verifications to Supabase`);
  }
}

// ── Core scan with 3-pass retry ───────────────────────────────────────────────
async function runScan() {
  if (scanInProgress) { console.log("⏳ Already scanning"); return; }
  scanInProgress=true; scanProgress=0;
  console.log(`\n🔍 Scan started — ${STOCKS.length} stocks — ${new Date().toISOString()}`);

  const results=[], failedStocks=[];

  // PASS 1
  console.log("📡 Pass 1: scanning all stocks...");
  for (let i=0;i<STOCKS.length;i++) {
    const stock=STOCKS[i];
    try {
      const data=await fetchHistory(stock.ticker);
      const scored=scoreStock(stock,data);
      if(scored){results.push(scored);console.log(`  ✅ [${i+1}/${STOCKS.length}] ${stock.ticker} $${scored.price}`);}
    } catch(e) {
      console.log(`  ❌ [${i+1}/${STOCKS.length}] ${stock.ticker}: ${e.message}`);
      failedStocks.push(stock);
    }
    scanProgress=i+1;
    if(i<STOCKS.length-1) await randomDelay();
  }
  console.log(`\n📊 Pass 1 done — ${results.length} ok, ${failedStocks.length} failed`);

  // PASS 2
  if (failedStocks.length>0) {
    console.log(`\n🔄 Pass 2: retrying ${failedStocks.length} in 15s...`);
    await sleep(15000);
    const stillFailed=[];
    for (let i=0;i<failedStocks.length;i++) {
      const stock=failedStocks[i];
      try {
        const data=await fetchHistory(stock.ticker);
        const scored=scoreStock(stock,data);
        if(scored){results.push(scored);console.log(`  ✅ RETRY ${stock.ticker}`);}
      } catch(e) {
        console.log(`  ❌ RETRY ${stock.ticker}: ${e.message}`);
        stillFailed.push(stock);
      }
      if(i<failedStocks.length-1) await randomDelay();
    }
    console.log(`\n📊 Pass 2 done — recovered ${failedStocks.length-stillFailed.length}`);

    // PASS 3
    if (stillFailed.length>0&&stillFailed.length<=20) {
      console.log(`\n🔄 Pass 3: final retry for ${stillFailed.length} in 20s...`);
      await sleep(20000);
      for (let i=0;i<stillFailed.length;i++) {
        const stock=stillFailed[i];
        try {
          const data=await fetchHistory(stock.ticker);
          const scored=scoreStock(stock,data);
          if(scored){results.push(scored);console.log(`  ✅ FINAL ${stock.ticker}`);}
        } catch(e) {
          console.log(`  ❌ FINAL ${stock.ticker}: ${e.message}`);
        }
        if(i<stillFailed.length-1) await randomDelay();
      }
    }
  }

  if (results.length>0) {
    const sorted=results.sort((a,b)=>b.score-a.score);
    const failedTickers=STOCKS.map(s=>s.ticker).filter(t=>!results.find(r=>r.ticker===t));
    cachedResults={success:true,results:sorted,failed:failedTickers,total:STOCKS.length,scannedAt:new Date().toISOString()};
    cacheTime=new Date();
    console.log(`\n✅ Scan complete — ${results.length}/${STOCKS.length} scored`);

    // Save top 10 to Supabase
    const scanDate=new Date().toISOString().split("T")[0];
    await saveSignalsToSupabase(sorted.slice(0,10), scanDate);
  } else {
    console.log("❌ No results");
  }
  scanInProgress=false;
}

// ── Schedulers ────────────────────────────────────────────────────────────────
// Daily scan: 1:00 AM AEST = 3:00 PM UTC Mon–Fri
cron.schedule("0 15 * * 1-5", ()=>{ console.log("⏰ Auto-scan triggered"); runScan(); }, {timezone:"UTC"});

// Verification: 8:30 AM AEST = 10:30 PM UTC (30 min after NYSE closes at 4PM ET = 8AM AEST)
cron.schedule("30 22 * * 1-5", ()=>{ console.log("⏰ Verification triggered"); runVerification(); }, {timezone:"UTC"});

console.log("⏰ Scan scheduled: 1:00 AM AEST (Mon–Fri)");
console.log("⏰ Verification scheduled: 8:30 AM AEST (Mon–Fri)");

// ── API Routes ────────────────────────────────────────────────────────────────

// Trigger scan / return cache
app.get("/api/scan", (req, res) => {
  const force=req.query.refresh==="true";
  if (cachedResults&&cacheTime&&!force) {
    const age=(new Date()-cacheTime)/(1000*60*60);
    if (age<23) return res.json({...cachedResults,fromCache:true,cacheAgeHours:parseFloat(age.toFixed(1))});
  }
  if (!scanInProgress) runScan().catch(e=>console.error(e));
  res.json({success:false,scanning:true,progress:0,message:"Scan started. Poll /api/results."});
});

// Poll for results
app.get("/api/results", (req, res) => {
  if (scanInProgress) {
    const pct=Math.round((scanProgress/STOCKS.length)*100);
    return res.json({ready:false,scanning:true,progress:pct,scanned:scanProgress,total:STOCKS.length});
  }
  if (cachedResults) {
    const age=(new Date()-cacheTime)/(1000*60*60);
    return res.json({ready:true,...cachedResults,fromCache:age>0.1,cacheAgeHours:parseFloat(age.toFixed(1))});
  }
  res.json({ready:false,scanning:false,message:"No results yet."});
});

// Market indices
app.get("/api/indices", async (req,res)=>{
  const data={};
  for (const sym of INDEX_TICKERS) {
    try {
      const to=Math.floor(Date.now()/1000),from=to-5*24*3600;
      const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&period1=${from}&period2=${to}`;
      const json=await fetchYahoo(url);
      const meta=json?.chart?.result?.[0]?.meta;
      if(meta?.regularMarketPrice) data[sym]={price:meta.regularMarketPrice,changePct:meta.regularMarketChangePercent||0,label:sym};
      await sleep(500);
    } catch(e){console.log(`Index ${sym}: ${e.message}`);}
  }
  res.json({success:true,data});
});

// Signal history from Supabase
app.get("/api/history", async (req,res)=>{
  try {
    const days=parseInt(req.query.days)||7;
    const since=new Date(Date.now()-days*24*3600*1000).toISOString().split("T")[0];
    const {data,error}=await supabase
      .from("signal_history")
      .select("*")
      .gte("scan_date",since)
      .order("scan_date",{ascending:false})
      .order("score",{ascending:false});
    if(error) throw new Error(error.message);
    res.json({success:true,data:data||[]});
  } catch(e){res.status(500).json({success:false,error:e.message});}
});

// Verification results from Supabase
app.get("/api/verification", async (req,res)=>{
  try {
    const days=parseInt(req.query.days)||7;
    const since=new Date(Date.now()-days*24*3600*1000).toISOString().split("T")[0];
    const {data,error}=await supabase
      .from("signal_verification")
      .select("*")
      .gte("scan_date",since)
      .order("scan_date",{ascending:false});
    if(error) throw new Error(error.message);
    res.json({success:true,data:data||[]});
  } catch(e){res.status(500).json({success:false,error:e.message});}
});

// Manual verification trigger (for testing)
app.get("/api/verify-now", async (req,res)=>{
  res.json({success:true,message:"Verification started in background."});
  runVerification().catch(e=>console.error(e));
});

// Status
app.get("/api/status",(req,res)=>{
  const age=cacheTime?((new Date()-cacheTime)/(1000*60*60)).toFixed(1):null;
  res.json({status:"ok",stocks:STOCKS.length,scanInProgress,scanProgress,lastScan:cacheTime?cacheTime.toISOString():"Never",cacheAgeHours:age,supabase:"connected",scheduledScan:"1:00 AM AEST Mon–Fri",scheduledVerification:"8:30 AM AEST Mon–Fri"});
});

app.get("/api/health",(req,res)=>res.json({status:"ok",message:"AggressiveAlpha with Supabase!"}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

app.listen(PORT,()=>{
  console.log(`\n⚡ AggressiveAlpha-100 on port ${PORT}`);
  console.log(`   ${STOCKS.length} stocks · Yahoo Finance · Supabase signal history + verification`);
  console.log(`   Scan: 1:00 AM AEST | Verify: 8:30 AM AEST | Both Mon–Fri\n`);
});
