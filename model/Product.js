const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer_id: {
    type: Number, 
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price_per_kg: {
    type: Number,
    required: true
  },
  quantity_kg: {
    type: Number,
    required: true
  },
  images: [String],
  category: {
    type: String,
    default: 'General'
  },
  location: String,
  available: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
