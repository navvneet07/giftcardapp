const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['card', 'cod'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    transactionId: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date
  },
  notes: String,
  isGuestOrder: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for better query performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });

// Calculate totals before saving
OrderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.tax = this.subtotal * 0.18; // 18% GST
    this.shippingCost = this.subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
    this.total = this.subtotal + this.tax + this.shippingCost;
  }
  next();
});

// Method to update order status with validation
OrderSchema.methods.updateStatus = async function(newStatus) {
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[this.orderStatus].includes(newStatus)) {
    throw new Error('Invalid status transition');
  }

  this.orderStatus = newStatus;
  return this.save();
};

module.exports = mongoose.model('Order', OrderSchema);
