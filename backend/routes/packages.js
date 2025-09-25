const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// GET /api/packages - Get all active packages (public)
router.get('/', async (req, res) => {
  try {
    const { platform, popular, billingCycle } = req.query;
    let query = { isActive: true };
    
    if (platform) {
      query.platform = platform;
    }
    
    if (popular === 'true') {
      query.popular = true;
    }
    
    const packages = await Package.find(query)
      .sort({ popular: -1, sortOrder: 1 })
      .select('-createdBy -updatedBy');
    
    // Transform packages for frontend consumption
    const transformedPackages = packages.map(pkg => ({
      _id: pkg._id,
      name: pkg.name,
      platform: pkg.platform.toLowerCase(),
      pricing: pkg.pricing,
      discount: pkg.discount ? parseInt(pkg.discount.replace(/\D/g, '')) : 0,
      isPopular: pkg.popular,
      trialDays: pkg.trialDays,
      features: pkg.features,
      logo: pkg.logo,
      description: pkg.description,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder
    }));
    
    // Return as array directly (not wrapped in object)
    res.json(transformedPackages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
});

// GET /api/packages/popular - Get popular packages only
router.get('/popular', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true, popular: true })
      .sort({ sortOrder: 1 })
      .select('-createdBy -updatedBy');
    
    const transformedPackages = packages.map(pkg => ({
      _id: pkg._id,
      name: pkg.name,
      platform: pkg.platform.toLowerCase(),
      pricing: pkg.pricing,
      discount: pkg.discount ? parseInt(pkg.discount.replace(/\D/g, '')) : 0,
      isPopular: pkg.popular,
      trialDays: pkg.trialDays,
      features: pkg.features,
      logo: pkg.logo,
      description: pkg.description
    }));
    
    res.json(transformedPackages);
  } catch (error) {
    console.error('Get popular packages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popular packages' });
  }
});

// GET /api/packages/platform/:platform - Get packages by platform
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const packages = await Package.find({ 
      isActive: true, 
      platform: { $regex: new RegExp(platform, 'i') }
    })
      .sort({ popular: -1, sortOrder: 1 })
      .select('-createdBy -updatedBy');
    
    const transformedPackages = packages.map(pkg => ({
      _id: pkg._id,
      name: pkg.name,
      platform: pkg.platform.toLowerCase(),
      pricing: pkg.pricing,
      discount: pkg.discount ? parseInt(pkg.discount.replace(/\D/g, '')) : 0,
      isPopular: pkg.popular,
      trialDays: pkg.trialDays,
      features: pkg.features,
      logo: pkg.logo,
      description: pkg.description
    }));
    
    res.json(transformedPackages);
  } catch (error) {
    console.error('Get packages by platform error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch packages by platform' });
  }
});

module.exports = router;