const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use the Admin model if it exists, otherwise use User model
async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Try to load Admin model, fall back to User model
    let AdminModel;
    try {
      AdminModel = require('./models/Admin');
      console.log('Using Admin model (separate collection)');
    } catch {
      AdminModel = require('./models/User');
      console.log('Using User model');
    }

    const email = 'qcu.coop.admin@gmail.com';
    const password = 'Admin#1234';

    // Delete any existing admin with this email first
    await AdminModel.deleteOne({ email });
    console.log('Cleaned up any existing admin account');

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new AdminModel({
      student_id: 'admin-001',   // required by User schema
      first_name: 'Admin',
      last_name: 'QCU Coop',
      email: email,
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('   Email:', email);
    console.log('   Password: Admin#1234');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();