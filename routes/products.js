const router = require('express').Router();
const Product = require('../models/Product');
const { verifyToken } = require('./auth');
const { upload } = require('../config/cloudinary');

// GET all active products (public)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = { is_active: true };
  if (category) filter.category = category;
  const products = await Product.find(filter).sort({ name: 1 });
  res.json(products);
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST create product (admin only)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

// PUT update product (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

// DELETE product (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

router.post('/upload-image', verifyToken, upload.single('image'), (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;