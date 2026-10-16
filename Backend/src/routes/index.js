const express = require('express');
const router = express.Router();

const menuRoutes = require('./menuRoutes');
const shopsRoutes = require('./shopRoutes');

// Add other routes as needed

router.use('/menu', menuRoutes);
router.use('/shops', shopsRoutes);

module.exports = router;
