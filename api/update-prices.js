const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/funds.db' 
  : path.join(process.cwd(), 'data', 'funds.db');

async function ensureDatabase() {
  if (!fs.existsSync(dbPath)) {
    const { default: initHandler } = await import('./init-db.js');
    const mockReq = { method: 'POST' };
    const mockRes = {
      status: () => mockRes,
      json: () => mockRes,
      setHeader: () => mockRes,
      end: () => mockRes
    };
    await initHandler(mockReq, mockRes);
  }
}

// Yahoo Finance API helper
async function fetchStockData(symbol) {
  try {
    const cleanSymbol = symbol.replace('.L', '.LON'); // Handle LSE stocks
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const result = response.data.chart.result[0];
    const quote = result.meta;
    const currentPrice = quote.regularMarketPrice || quote.previousClose;
    
    return {
      symbol: symbol,
      price: currentPrice,
      marketCap: quote.marketCap || 0,
      volume: quote.regularMarketVolume || 0,
      change: quote.regularMarketPrice - quote.previousClose,
      changePercent: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return null;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    await ensureDatabase();
    const db = new sqlite3.Database(dbPath);
    
    return new Promise(async (resolve, reject) => {
      try {
        // Get all active funds
        db.all('SELECT symbol FROM funds WHERE is_active = 1', [], async (err, funds) => {
          if (err) {
            db.close();
            res.status(500).json({ error: err.message });
            resolve();
            return;
          }

          console.log(`Starting price update for ${funds.length} funds...`);
          let updateCount = 0;
          
          // Update prices for each fund
          for (const fund of funds) {
            const stockData = await fetchStockData(fund.symbol);
            
            if (stockData) {
              const currentDate = new Date().toISOString().split('T')[0];
              
              db.run(`
                INSERT OR REPLACE INTO price_data 
                (fund_symbol, date, price, market_cap, volume, nav, premium_discount, aum, dividend_yield)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                fund.symbol,
                currentDate,
                stockData.price,
                stockData.marketCap,
                stockData.volume,
                null, // NAV would need additional data source
                null, // Premium/discount calculation
                null, // AUM would need additional data source
                null  // Dividend yield would need additional data source
              ], (err) => {
                if (err) {
                  console.error(`Error updating ${fund.symbol}:`, err);
                } else {
                  updateCount++;
                  console.log(`Updated ${fund.symbol}: $${stockData.price}`);
                }
              });
            }
            
            // Rate limiting - delay between API calls
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Wait a moment for all database operations to complete
          setTimeout(() => {
            db.close();
            res.status(200).json({ 
              message: `Price update completed for ${updateCount}/${funds.length} funds`,
              updateCount,
              totalFunds: funds.length
            });
            resolve();
          }, 1000);
        });
      } catch (error) {
        db.close();
        res.status(500).json({ error: error.message });
        resolve();
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}