const router = require('express').Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { student_id, first_name, last_name, email, password } = req.body;

    const idPattern = /^\d{2}-\d{4}$/;
    if (!idPattern.test(student_id))
      return res.status(400).json({ error: 'Invalid Student ID format. Use YY-NNNN (e.g. 25-0169)' });

    const exists = await User.findOne({ student_id });
    if (exists)
      return res.status(400).json({ error: 'Student ID already registered' });

    // ✅ Hash password manually before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      student_id,
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.json({ message: 'Registered successfully! You can now log in.' });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body;
  const user = await User.findOne({ student_id });
  if (!user) return res.status(400).json({ error: 'Student ID not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Incorrect password' });

  const token = jwt.sign(
    { id: user._id, role: user.role, student_id: user.student_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      student_id: user.student_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    }
  });
});

// GET current user (protected)
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// ADMIN LOGIN (email-based)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Admin collection first
    let adminUser = await Admin.findOne({ email });

    // Fallback: check users collection for role=admin
    if (!adminUser) {
      adminUser = await User.findOne({ email, role: 'admin' });
    }

    if (!adminUser) {
      return res.status(400).json({ error: 'No admin account found with that email' });
    }

    const match = await bcrypt.compare(password, adminUser.password);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: adminUser._id,
        role: 'admin',
        student_id: adminUser.student_id || 'admin',
        email: adminUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: adminUser._id,
        student_id: adminUser.student_id || 'admin',
        first_name: adminUser.first_name || 'Admin',
        last_name: adminUser.last_name || '',
        email: adminUser.email,
        role: 'admin',
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// TEMPORARY — remove after creating admin account
router.post('/create-admin', async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const { email, password, first_name, last_name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword, first_name, last_name });
    await admin.save();
    res.json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
module.exports.verifyToken = verifyToken;