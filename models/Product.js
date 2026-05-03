const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, default: '' },
  image_url:   { type: String, default: '' },
  category:    { type: String, enum: ['Uniforms', 'School Supplies', 'ID & Lanyards'], required: true },
  stock:       { type: Number, default: 0 },
  is_active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);