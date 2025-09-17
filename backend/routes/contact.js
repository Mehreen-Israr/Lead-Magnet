const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');
const { protect } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, message, service } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields'
      });
    }

    // Check if contact already exists (optional - for duplicate prevention)
    const existingContact = await Contact.findOne({ 
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'A contact form has already been submitted with this email in the last 24 hours'
      });
    }

    // Create new contact
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim(),
      phone: phone?.trim(),
      message: message.trim(),
      service: service || ''
    });

    await contact.save();

    // Send confirmation email to user
    const userEmailOptions = {
      email: contact.email,
      subject: 'Thank you for contacting LeadMagnet!',
      message: `
        Dear ${contact.name},
        
        Thank you for reaching out to LeadMagnet! We have received your message and will get back to you within 24 hours.
        
        Here's a summary of your submission:
        - Name: ${contact.name}
        - Email: ${contact.email}
        - Company: ${contact.company || 'Not provided'}
        - Service Interest: ${contact.service || 'Not specified'}
        - Message: ${contact.message}
        
        Our team of lead generation experts will review your inquiry and respond shortly.
        
        Best regards,
        The LeadMagnet Team
        
        ---
        This is an automated confirmation email. Please do not reply to this email.
      `
    };

    // Send notification email to admin
    const adminEmailOptions = {
      email: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      subject: `New Contact Form Submission - ${contact.name}`,
      message: `
        New contact form submission received:
        
        Name: ${contact.name}
        Email: ${contact.email}
        Company: ${contact.company || 'Not provided'}
        Phone: ${contact.phone || 'Not provided'}
        Service Interest: ${contact.service || 'Not specified'}
        
        Message:
        ${contact.message}
        
        Submitted at: ${new Date(contact.createdAt).toLocaleString()}
        Contact ID: ${contact._id}
        
        Please follow up within 24 hours.
      `
    };

    // Send emails (don't wait for completion to avoid delays)
    Promise.all([
      sendEmail(userEmailOptions),
      sendEmail(adminEmailOptions)
    ]).catch(error => {
      console.error('Email sending failed:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contacts (Admin only)
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'firstName lastName email');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact status/notes (Admin only)
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes, assignedTo, followUpDate } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;
    if (assignedTo) contact.assignedTo = assignedTo;
    if (followUpDate) contact.followUpDate = followUpDate;
    if (!contact.isRead) contact.isRead = true;

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;