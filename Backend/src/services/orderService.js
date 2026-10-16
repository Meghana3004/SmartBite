const db = require('../config/db');

const createOrder = async (orderData, items) => {
  const connection = await db.connection.getConnection();
  try {
    await connection.beginTransaction();

    // Insert the order into the `orders` table
    const [orderResult] = await connection.query(
      'INSERT INTO orders (status, total_price) VALUES (?, ?)',
      ['pending', 0] // Initial status is 'pending', total_price will be updated later
    );

    const orderId = orderResult.insertId;

    // Insert items into the `order_items` table
    let totalPrice = 0;
    for (const item of items) {
      const { menu_item_id, quantity, price } = item;
      totalPrice += quantity * price;

      await connection.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, menu_item_id, quantity, price]
      );
    }

    // Update the total price in the `orders` table
    await connection.query(
      'UPDATE orders SET total_price = ? WHERE id = ?',
      [totalPrice, orderId]
    );

    await connection.commit();
    return { id: orderId, status: 'pending', total_price: totalPrice };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getOrderById = async (orderId) => {
  try {
    // Fetch the order details
    const [orderResults] = await db.connection.query(
      'SELECT id, status, total_price FROM orders WHERE id = ?',
      [orderId]
    );

    if (orderResults.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResults[0];

    // Fetch the order items
    const [orderItems] = await db.connection.query(
      'SELECT id, order_id, menu_item_id, quantity, price FROM order_items WHERE order_id = ?',
      [orderId]
    );

    return { ...order, items: orderItems };
  } catch (error) {
    throw error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    // Update the order status
    const [result] = await db.connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Order not found');
    }

    return { id: orderId, status };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
};