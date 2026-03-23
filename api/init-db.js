const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// For Vercel, create a temporary database in /tmp
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/funds.db' 
  : path.join(process.cwd(), 'data', 'funds.db');

// Sample fund data
const sampleFunds = [
  {
    symbol: 'PSEC',
    name: 'Prospect Capital Corporation',
    management_company: 'Prospect Capital Management',
    fund_type: 'BDC',
    exchange: 'NASDAQ',
    price: 7.25,
    market_cap: 2800000000,
    nav: 8.15,
    premium_discount: -11.04,
    dividend_yield: 12.5,
    management_fee: 2.0,
    aum: 8500000000
  },
  {
    symbol: 'ARCC',
    name: 'Ares Capital Corporation',
    management_company: 'Ares Management',
    fund_type: 'BDC',
    exchange: 'NASDAQ',
    price: 19.85,
    market_cap: 10200000000,
    nav: 20.50,
    premium_discount: -3.17,
    dividend_yield: 9.2,
    management_fee: 1.75,
    aum: 21000000000
  },
  {
    symbol: 'MAIN',
    name: 'Main Street Capital Corporation',
    management_company: 'Main Street Capital',
    fund_type: 'BDC',
    exchange: 'NYSE',
    price: 42.15,
    market_cap: 3100000000,
    nav: 28.75,
    premium_discount: 46.61,
    dividend_yield: 6.1,
    management_fee: 2.0,
    aum: 2100000000
  },
  {
    symbol: 'FSK',
    name: 'FS KKR Capital Corp',
    management_company: 'FS Investments / KKR',
    fund_type: 'BDC',
    exchange: 'NYSE',
    price: 18.92,
    market_cap: 5400000000,
    nav: 19.25,
    premium_discount: -1.71,
    dividend_yield: 14.8,
    management_fee: 1.75,
    aum: 5500000000
  },
  {
    symbol: 'BXSL',
    name: 'Blackstone Secured Lending Fund',
    management_company: 'Blackstone',
    fund_type: 'BDC',
    exchange: 'NYSE',
    price: 28.45,
    market_cap: 4700000000,
    nav: 28.90,
    premium_discount: -1.56,
    dividend_yield: 10.2,
    management_fee: 1.4,
    aum: 4800000000
  },
  {
    symbol: 'HTGC',
    name: 'Hercules Capital Inc',
    management_company: 'Hercules Capital',
    fund_type: 'BDC',
    exchange: 'NYSE',
    price: 17.28,
    market_cap: 2200000000,
    nav: 17.45,
    premium_discount: -0.97,
    dividend_yield: 9.7,
    management_fee: 2.0,
    aum: 2400000000
  },
  {
    symbol: 'BIZD',
    name: 'VanEck BDC Income ETF',
    management_company: 'VanEck',
    fund_type: 'ETF',
    exchange: 'NYSE',
    price: 16.85,
    market_cap: 890000000,
    nav: 16.92,
    premium_discount: -0.41,
    dividend_yield: 8.9,
    management_fee: 0.4,
    aum: 900000000
  },
  {
    symbol: 'VCTR',
    name: 'Victory Capital Holdings Inc',
    management_company: 'Victory Capital',
    fund_type: 'Public VC',
    exchange: 'NASDAQ',
    price: 54.32,
    market_cap: 4100000000,
    nav: null,
    premium_discount: null,
    dividend_yield: 2.1,
    management_fee: null,
    aum: 173000000000
  },
  {
    symbol: 'GAIN',
    name: 'Gladstone Investment Corporation',
    management_company: 'Gladstone Companies',
    fund_type: 'BDC',
    exchange: 'NASDAQ',
    price: 15.67,
    market_cap: 580000000,
    nav: 16.25,
    premium_discount: -3.57,
    dividend_yield: 7.3,
    management_fee: 2.0,
    aum: 600000000
  },
  {
    symbol: 'TPVG',
    name: 'TriplePoint Venture Growth BDC Corp',
    management_company: 'TriplePoint Capital',
    fund_type: 'BDC',
    exchange: 'NYSE',
    price: 11.45,
    market_cap: 380000000,
    nav: 12.10,
    premium_discount: -5.37,
    dividend_yield: 12.9,
    management_fee: 2.0,
    aum: 400000000
  }
];

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create tables
      db.serialize(() => {
        // Funds table
        db.run(`
          CREATE TABLE IF NOT EXISTS funds (
            symbol TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            management_company TEXT,
            fund_type TEXT,
            exchange TEXT,
            inception_date DATE,
            investment_strategy TEXT,
            category TEXT,
            is_active INTEGER DEFAULT 1
          )
        `);

        // Price data table
        db.run(`
          CREATE TABLE IF NOT EXISTS price_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fund_symbol TEXT,
            date DATE,
            price REAL,
            market_cap REAL,
            volume INTEGER,
            nav REAL,
            premium_discount REAL,
            aum REAL,
            dividend_yield REAL,
            FOREIGN KEY (fund_symbol) REFERENCES funds (symbol)
          )
        `);

        // Management data table
        db.run(`
          CREATE TABLE IF NOT EXISTS management_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fund_symbol TEXT,
            report_date DATE,
            management_fee REAL,
            performance_fee REAL,
            management_ownership_pct REAL,
            leverage_ratio REAL,
            FOREIGN KEY (fund_symbol) REFERENCES funds (symbol)
          )
        `);

        // Insert sample data
        const insertFund = db.prepare(`
          INSERT OR REPLACE INTO funds 
          (symbol, name, management_company, fund_type, exchange, category, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `);

        const insertPriceData = db.prepare(`
          INSERT OR REPLACE INTO price_data 
          (fund_symbol, date, price, market_cap, nav, premium_discount, dividend_yield, aum)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertManagementData = db.prepare(`
          INSERT OR REPLACE INTO management_data 
          (fund_symbol, report_date, management_fee)
          VALUES (?, ?, ?)
        `);

        const currentDate = new Date().toISOString().split('T')[0];

        sampleFunds.forEach(fund => {
          insertFund.run([
            fund.symbol,
            fund.name,
            fund.management_company,
            fund.fund_type,
            fund.exchange,
            fund.fund_type // Use fund_type as category for now
          ]);

          if (fund.price) {
            insertPriceData.run([
              fund.symbol,
              currentDate,
              fund.price,
              fund.market_cap,
              fund.nav,
              fund.premium_discount,
              fund.dividend_yield,
              fund.aum
            ]);
          }

          if (fund.management_fee) {
            insertManagementData.run([
              fund.symbol,
              currentDate,
              fund.management_fee
            ]);
          }
        });

        insertFund.finalize();
        insertPriceData.finalize();
        insertManagementData.finalize();
      });

      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(dbPath);
        }
      });
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const dbPath = await initializeDatabase();
      res.status(200).json({ 
        success: true, 
        message: 'Database initialized successfully',
        dbPath: process.env.NODE_ENV === 'production' ? '/tmp/funds.db' : dbPath
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}