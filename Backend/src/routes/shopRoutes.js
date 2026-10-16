const express = require('express');
const router = express.Router();
const shopsController = require('../controllers/shopsController');

router.get('/', shopsController.getAllShops);

router.get('/:shopId', shopsController.getShopDetails);

module.exports = router;