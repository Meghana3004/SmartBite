const db = require('../config/db');

exports.getAllShops = (req, res) => {
  db.connection.query(
    'SELECT id, name, description, address, rating, avgPrice, imageUrl FROM shops',
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      res.json(results);
    }
  );
};


exports.getShopDetails = (req, res) => {
  const shopId = req.params.shopId;
  db.connection.query(
    'SELECT id as shop_id, name AS vendor, rating AS ratings, avgPrice AS avgPrice, description FROM shops WHERE id = ?',
    [shopId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      res.json(results[0]);
    }
  );
};