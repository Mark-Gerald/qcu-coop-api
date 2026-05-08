const router = require('express').Router();
const Feedback = require('../models/Feedback');
const { verifyToken } = require('./auth');

// POST submit feedback (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const feedback = new Feedback({ name, email, subject, message });
    await feedback.save();
    res.json({ message: 'Feedback received! Thank you for reaching out.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET all feedback (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

// GET feedback count (admin only)
router.get('/count/unread', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const count = await Feedback.countDocuments({ status: 'Unread' });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// PUT mark feedback as read (admin only)
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: 'Read' },
      { new: true }
    );
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// DELETE feedback (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

module.exports = router;