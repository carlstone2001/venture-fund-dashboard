const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// For Vercel, create database in /tmp if in production
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/funds.db' 
  : path.join(process.cwd(), 'data', 'funds.db');

// Initialize database if it doesn't exist
async function ensureDatabase() {
  if (!fs.existsSync(dbPath)) {
    // Initialize database by calling init-db
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    await ensureDatabase();
    const db = new sqlite3.Database(dbPath);
    
    const query = `
      SELECT 
        f.*,
        pd.price,
        pd.market_cap,
        pd.nav,
        pd.premium_discount,
        pd.volume,
        pd.aum,
        pd.dividend_yield,
        pd.date as price_date,
        md.management_fee,
        md.performance_fee,
        md.management_ownership_pct,
        md.leverage_ratio
      FROM funds f
      LEFT JOIN (
        SELECT fund_symbol, price, market_cap, nav, premium_discount, volume, aum, dividend_yield, date,
               ROW_NUMBER() OVER (PARTITION BY fund_symbol ORDER BY date DESC) as rn
        FROM price_data
      ) pd ON f.symbol = pd.fund_symbol AND pd.rn = 1
      LEFT JOIN (
        SELECT fund_symbol, management_fee, performance_fee, management_ownership_pct, leverage_ratio,
               ROW_NUMBER() OVER (PARTITION BY fund_symbol ORDER BY report_date DESC) as rn
        FROM management_data
      ) md ON f.symbol = md.fund_symbol AND md.rn = 1
      WHERE f.is_active = 1
      ORDER BY pd.market_cap DESC NULLS LAST
    `;

    return new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        db.close();
        
        if (err) {
          res.status(500).json({ error: err.message });
          resolve();
          return;
        }
        
        // Calculate additional metrics
        const funds = rows.map(fund => ({
          ...fund,
          mnav: fund.market_cap && fund.nav ? fund.market_cap / (fund.nav * 1000000) : null,
          expenseRatio: fund.management_fee || 0,
          totalReturn1Y: Math.random() * 20 - 10, // Placeholder
          beta: Math.random() * 2 + 0.5 // Placeholder
        }));
        
        res.status(200).json(funds);
        resolve();
      });
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}