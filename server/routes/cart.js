const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Get cart items from request body middleware
const getCartItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid cart items' });
    }

    const cartItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      cartItems.push({
        product,
        quantity: item.quantity,
        price: product.price * item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    req.cartItems = cartItems;
    req.totalAmount = totalAmount;
    next();
  } catch (error) {
    console.error('Error processing cart items:', error);
    res.status(500).json({ message: 'Error processing cart items' });
  }
};

// Calculate cart total
router.post('/calculate', auth, getCartItems, async (req, res) => {
  try {
    res.json({
      items: req.cartItems,
      totalAmount: req.totalAmount
    });
  } catch (error) {
    console.error('Error calculating cart total:', error);
    res.status(500).json({ message: 'Error calculating cart total' });
  }
});

module.exports = router;
