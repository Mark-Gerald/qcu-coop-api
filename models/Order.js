const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  student_id:    { type: String, required: true },
  student_name:  { type: String, required: true },
  student_email: { type: String, required: true },
  items: [{
    product_id:   { type: String },
    product_name: { type: String },
    product_image:{ type: String },
    price:        { type: Number },
    quantity:     { type: Number },
    subtotal:     { type: Number },
  }],
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Declined', 'Accepted', 'Cancelled', 'Completed'],default: 'Pending'}, actionToken: { type: String, default: '' },
  admin_note:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);