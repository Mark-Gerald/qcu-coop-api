const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('./auth');
const { sendOrderApprovalEmail, sendOrderDeclineEmail } = require('../config/mailer');
const crypto = require('crypto');

// POST place an order (student)
router.post('/', verifyToken, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET my orders (student - filtered by student_id)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ student_id: req.user.student_id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// NEW: Handle email action clicks (Accept/Decline from email)
router.get('/action', async (req, res) => {
  const { token, action } = req.query;
  console.log('Action route hit — token:', token, 'action:', action);

  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL}/order-action?error=invalid`);
  }

  try {
    const order = await Order.findOne({ actionToken: token });
    console.log('Found order:', order ? order._id : 'NOT FOUND');

    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/order-action?error=invalid`);
    }

    if (order.status !== 'Approved') {
      return res.redirect(`${process.env.FRONTEND_URL}/order-action?error=already_processed`);
    }

    const newStatus = action === 'accept' ? 'Accepted' : 'Cancelled';
    await Order.findByIdAndUpdate(order._id, { status: newStatus, actionToken: '' });

    console.log('Order updated to:', newStatus);
    res.redirect(`${process.env.FRONTEND_URL}/order-action?status=${newStatus}&orderId=${order._id}`);
  } catch (err) {
    console.error('Action route error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/order-action?error=server_error`);
  }
});

// GET all orders (admin only)
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// NEW: Admin mark as completed or cancel
router.put('/:id/complete', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { returnDocument: 'after' }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete order' });
  }
});


// Update the PUT /:id route:
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status, admin_note } = req.body;

  try {
    let updateData = { status, admin_note };

    if (status === 'Approved') {
      updateData.actionToken = crypto.randomBytes(32).toString('hex');
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );

    console.log('Order updated. Status:', order.status, '| Token:', order.actionToken || 'none');

    if (status === 'Approved') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, { $inc: { stock: -item.quantity } }, { returnDocument: 'after' });
      }
      try {
        await sendOrderApprovalEmail(order, order.actionToken);
        console.log('Approval email sent to:', order.student_email);
      } catch (emailErr) {
        console.error('Approval email failed:', emailErr.message);
      }
    }

    if (status === 'Declined') {
      try {
        await sendOrderDeclineEmail(order);
        console.log('Decline email sent to:', order.student_email);
      } catch (emailErr) {
        console.error('Decline email failed:', emailErr.message);
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;