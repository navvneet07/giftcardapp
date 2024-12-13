const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { body, validationResult } = require('express-validator');

// Create new order with validation
router.post('/',
  auth,
  [
    body('items').isArray().notEmpty(),
    body('items.*.product').isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shippingAddress').notEmpty(),
    body('paymentInfo.method').isIn(['razorpay', 'cod'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        items,
        shippingAddress,
        paymentInfo,
        shippingCost,
      } = req.body;

      // Calculate total amount
      let totalAmount = 0;
      for (let item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
        totalAmount += product.price * item.quantity;
      }

      // Add shipping cost if provided
      if (shippingCost) {
        totalAmount += shippingCost;
      }

      // Create order
      const order = new Order({
        user: req.user.id,
        items,
        shippingAddress,
        totalAmount,
        paymentInfo,
        status: paymentInfo.method === 'cod' ? 'pending' : 'processing'
      });

      await order.save();

      // Update product quantities
      for (let item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: -item.quantity }
        });
      }

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Error creating order' });
    }
  }
);

// Get user's orders with pagination and filtering
router.get('/my-orders',
  auth,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const query = { user: req.user.id };
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.product', 'name price images')
        .lean();

      const total = await Order.countDocuments(query);

      res.json({
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  }
);

// Get single order details
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id
      })
      .populate('items.product', 'name price images')
      .populate('user', 'name email');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Error fetching order details' });
    }
  }
);

// Update order status (admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Cancel order
router.put('/:id/cancel',
  auth,
  async (req, res) => {
    try {
      const { reason } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user is authorized to cancel this order
      if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Check if order can be cancelled
      if (!['pending', 'processing'].includes(order.status)) {
        return res.status(400).json({ message: 'Order cannot be cancelled' });
      }

      // Restore stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }

      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = Date.now();

      await order.save();
      res.json(order);
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Error cancelling order' });
    }
  }
);

// Get all orders (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
