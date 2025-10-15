const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const router = express.Router();

// Middleware: verify JWT
function authenticateFarmer(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'farmer') return res.status(403).json({ message: 'Access forbidden' });
    req.farmer_id = decoded.id; // attach farmer_id to request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

// 🟢 Add new product
router.post('/dashboard/add', authenticateFarmer, async (req, res) => {
  try {
    const { title, description, price, available } = req.body;
    const product = await Product.create({
      farmer_id: req.farmer_id,
      title,
      description,
      price,
      available
    });
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// 🟡 Edit existing product
router.put('/dashboard/:id', authenticateFarmer, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: id, farmer_id: req.farmer_id }, // ensure only owner can edit
      updates,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

module.exports = router;
