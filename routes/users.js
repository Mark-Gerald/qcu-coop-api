const router = require('express').Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const { verifyToken } = require('./auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const students = await User.find().select('-password').sort({ createdAt: -1 });
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    // Merge both, tag admins clearly
    const adminsMapped = admins.map(a => ({
      ...a.toObject(),
      role: 'admin',
      student_id: a.student_id || 'admin',
    }));
    res.json([...adminsMapped, ...students]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;