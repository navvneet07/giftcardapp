const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Stationery', 'Gifts', 'Greeting Cards'],
  },
  subcategory: {
    type: String,
    required: true,
  },
  images: [{
    url: String,
    public_id: String,
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  tags: [{
    type: String,
  }],
  ratings: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  specifications: {
    type: Map,
    of: String,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm',
    },
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg'],
      default: 'g',
    },
  },
}, {
  timestamps: true,
});

// Add index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
