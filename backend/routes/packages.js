const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Package = require('../models/Package');
const { protect } = require('../middleware/auth');

// @desc    Get all active packages
// @route   GET /api/packages
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Packages request received');
    console.log('Database connection state:', mongoose.connection.readyState);
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, attempting to reconnect...');
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    const packages = await Package.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 });
    
    console.log(`Found ${packages.length} packages`);
    
    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
});

// @desc    Get single package by ID
// @route   GET /api/packages/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const packageId = req.params.id;
    
    console.log('🔍 Fetching package with ID:', packageId);
    
    // Validate packageId
    if (!packageId || packageId === 'undefined' || packageId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }
    
    // Check if packageId is a valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(packageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID format'
      });
    }
    
    const packageData = await Package.findById(packageId);
    
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    console.log('✅ Package found:', packageData.name);
    
    res.json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package'
    });
  }
});

// @desc    Create new package (Admin only)
// @route   POST /api/packages
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const packageData = await Package.create(req.body);
    
    res.status(201).json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package'
    });
  }
});

// @desc    Update package (Admin only)
// @route   PUT /api/packages/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const packageData = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package'
    });
  }
});

// @desc    Delete package (Admin only)
// @route   DELETE /api/packages/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const packageData = await Package.findByIdAndDelete(req.params.id);
    
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package'
    });
  }
});

module.exports = router;