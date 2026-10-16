const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const db = require('./src/config/db');

const shopRoutes = require('./src/routes/shopRoutes');
app.use('/api/shops', shopRoutes);

const menuRoutes = require('./src/routes/menuRoutes');
app.use('/api/menu', menuRoutes);

const orderRoutes = require('./src/routes/orderRoutes');
app.use('/orders', orderRoutes);

// const routes = require('./routes/index');

// app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
