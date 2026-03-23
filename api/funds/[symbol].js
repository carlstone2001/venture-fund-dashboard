const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'funds.db');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { symbol } = req.query;
    const db = new sqlite3.Database(dbPath);
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM funds WHERE symbol = ?', [symbol], (err, fund) => {
        if (err) {
          db.close();
          res.status(500).json({ error: err.message });
          resolve();
          return;
        }
        
        if (!fund) {
          db.close();
          res.status(404).json({ error: 'Fund not found' });
          resolve();
          return;
        }
        
        // Get latest price data
        db.get(
          'SELECT * FROM price_data WHERE fund_symbol = ? ORDER BY date DESC LIMIT 1',
          [symbol],
          (err, priceData) => {
            if (err) {
              db.close();
              res.status(500).json({ error: err.message });
              resolve();
              return;
            }
            
            // Get management data
            db.get(
              'SELECT * FROM management_data WHERE fund_symbol = ? ORDER BY report_date DESC LIMIT 1',
              [symbol],
              (err, managementData) => {
                db.close();
                
                if (err) {
                  res.status(500).json({ error: err.message });
                  resolve();
                  return;
                }
                
                const fundDetails = {
                  ...fund,
                  priceData,
                  managementData
                };
                
                res.status(200).json(fundDetails);
                resolve();
              }
            );
          }
        );
      });
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}