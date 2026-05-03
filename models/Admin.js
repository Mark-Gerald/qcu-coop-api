const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  student_id:  { type: String, default: 'admin' },
  first_name:  { type: String, default: 'Admin' },
  last_name:   { type: String, default: '' },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  role:        { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);