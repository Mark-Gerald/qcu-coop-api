const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  student_id:  { type: String, required: true, unique: true },
  first_name:  { type: String, required: true },
  last_name:   { type: String, required: true },
  email:       { type: String, required: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

// ✅ Completely avoid pre-save hook — hash manually in the route instead
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);