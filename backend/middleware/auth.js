const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - checking authentication');
    console.log('🔐 Request headers:', req.headers);
    
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token found in Authorization header');
    }
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    console.log('🔐 Token found, verifying...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Token verified, user ID:', decoded.id);
    
    // Check database connection before querying
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database not connected in auth middleware, attempting to reconnect...');
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000,
          heartbeatFrequencyMS: 10000,
          retryWrites: true,
          retryReads: true
        });
        console.log('✅ Database reconnected in auth middleware');
      } catch (dbErr) {
        console.error('❌ Failed to reconnect to database in auth middleware:', dbErr);
        return res.status(503).json({
          success: false,
          message: 'Database connection failed'
        });
      }
    }
    
    // Get user from token
    console.log('🔐 Fetching user from database...');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }
    
    console.log('✅ User found:', user.email);
    
    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }
    
    req.user = user;
    console.log('✅ Auth middleware passed for user:', user.email);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    console.error('❌ Error details:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};