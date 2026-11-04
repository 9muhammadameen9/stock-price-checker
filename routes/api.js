'use strict';

const crypto = require('crypto');
const { MongoClient } = require('mongodb');

module.exports = function (app) {
  const client = new MongoClient(process.env.DB);

  // Connect to DB at startup
  client.connect()
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => console.error('MongoDB error:', err));

  // Anonymize IP by hashing it
  function anonymize(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex');
  }

  app.route('/api/stock-prices').get(async (req, res) => {
    try {
      // Get the collection inside the route to ensure it's ready
      const likes = client.db('stockchecker').collection('likes');
      
      const { stock, like } = req.query;
      const ip = anonymize(req.ip || req.headers['x-forwarded-for'] || 'unknown');

      async function getStockData(symbol) {
        const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
        const response = await fetch(url); // Node 24 has fetch built-in
        const data = await response.json();
        return {
          stock: data.symbol,
          price: data.latestPrice,
        };
      }

      // --- Handle single stock ---
      if (typeof stock === 'string') {
        const stockData = await getStockData(stock);

        if (like === 'true') {
          const existing = await likes.findOne({ stock: stockData.stock, ip });
          if (!existing) {
            await likes.insertOne({ stock: stockData.stock, ip });
          }
        }

        const count = await likes.countDocuments({ stock: stockData.stock });
        stockData.likes = count;

        return res.json({ stockData });
      }

      // --- Handle two stocks ---
      if (Array.isArray(stock)) {
        const stockData = await Promise.all([
          getStockData(stock[0]),
          getStockData(stock[1]),
        ]);

        if (like === 'true') {
          for (const s of stockData) {
            const existing = await likes.findOne({ stock: s.stock, ip });
            if (!existing) {
              await likes.insertOne({ stock: s.stock, ip });
            }
          }
        }

        const counts = await Promise.all(
          stockData.map((s) => likes.countDocuments({ stock: s.stock }))
        );

        stockData[0].rel_likes = counts[0] - counts[1];
        stockData[1].rel_likes = counts[1] - counts[0];

        return res.json({ stockData });
      }

      return res.status(400).json({ error: 'Invalid request' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};