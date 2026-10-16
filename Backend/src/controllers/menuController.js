const db = require('../config/db');

exports.getMenu = (req, res) => {
  db.connection.query(
    'SELECT id, shop_id, name, description, price, image_url, isVeg, rating, reviewCount, Customizable, vendor FROM menu',
    (error, rows) => {
      if (error) {
        res.status(500).json({ error: 'DB error', details: error });
      } else {
        res.json(rows);
      }
    }
  );
};