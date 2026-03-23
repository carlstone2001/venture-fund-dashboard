const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Database connection
const db = new sqlite3.Database('./data/funds.db');

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

// Alpha Vantage fallback (if needed)
async function fetchAlphaVantageData(symbol) {
  if (!process.env.ALPHA_VANTAGE_API_KEY) return null;
  
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    const response = await axios.get(url);
    
    const quote = response.data['Global Quote'];
    if (!quote) return null;
    
    return {
      symbol: symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
    };
  } catch (error) {
    console.error(`Alpha Vantage error for ${symbol}:`, error.message);
    return null;
  }
}

// API Routes

// Get all funds with latest data
app.get('/api/funds', (req, res) => {
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
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Calculate additional metrics
    const funds = rows.map(fund => ({
      ...fund,
      mnav: fund.market_cap && fund.nav ? fund.market_cap / (fund.nav * 1000000) : null,
      expenseRatio: fund.management_fee || 0,
      totalReturn1Y: Math.random() * 20 - 10, // Placeholder - would calculate from historical data
      beta: Math.random() * 2 + 0.5 // Placeholder
    }));
    
    res.json(funds);
  });
});

// Get fund details
app.get('/api/funds/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  
  db.get('SELECT * FROM funds WHERE symbol = ?', [symbol], (err, fund) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!fund) {
      res.status(404).json({ error: 'Fund not found' });
      return;
    }
    
    // Get latest price data
    db.get(
      'SELECT * FROM price_data WHERE fund_symbol = ? ORDER BY date DESC LIMIT 1',
      [symbol],
      (err, priceData) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Get holdings
        db.all(
          'SELECT * FROM holdings WHERE fund_symbol = ? ORDER BY percentage DESC',
          [symbol],
          (err, holdings) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            
            res.json({
              fund,
              priceData,
              holdings
            });
          }
        );
      }
    );
  });
});

// Update fund prices
app.post('/api/update-prices', async (req, res) => {
  try {
    db.all('SELECT symbol FROM funds WHERE is_active = 1', [], async (err, funds) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const updates = [];
      const today = new Date().toISOString().split('T')[0];
      
      for (const fund of funds) {
        console.log(`Fetching data for ${fund.symbol}...`);
        
        let data = await fetchStockData(fund.symbol);
        if (!data) {
          data = await fetchAlphaVantageData(fund.symbol);
        }
        
        if (data) {
          // Insert/update price data
          db.run(
            `INSERT OR REPLACE INTO price_data 
             (fund_symbol, date, price, market_cap, volume) 
             VALUES (?, ?, ?, ?, ?)`,
            [fund.symbol, today, data.price, data.marketCap, data.volume],
            function(err) {
              if (err) {
                console.error(`Error updating ${fund.symbol}:`, err.message);
              } else {
                console.log(`Updated ${fund.symbol}: $${data.price}`);
              }
            }
          );
          
          updates.push({
            symbol: fund.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      res.json({ 
        message: `Updated ${updates.length} funds`,
        updates 
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Auto-update prices every 5 minutes during market hours
cron.schedule('*/5 9-16 * * 1-5', async () => {
  console.log('Auto-updating fund prices...');
  try {
    await axios.post(`http://localhost:${PORT}/api/update-prices`);
  } catch (error) {
    console.error('Auto-update failed:', error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Venture Fund Dashboard running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${path.resolve('./data/funds.db')}`);
  
  // Initial data fetch
  setTimeout(() => {
    console.log('🔄 Performing initial data fetch...');
    axios.post(`http://localhost:${PORT}/api/update-prices`).catch(err => {
      console.log('Initial fetch will be attempted when first accessed');
    });
  }, 2000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📱 Shutting down dashboard...');
  db.close();
  process.exit(0);
});