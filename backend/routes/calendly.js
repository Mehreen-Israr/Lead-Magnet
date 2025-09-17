const express = require('express');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Calendly Webhook Handler
router.post('/webhook', async (req, res) => {
  try {
    // Verify Calendly webhook signature
    const signature = req.headers['calendly-webhook-signature'];
    const timestamp = req.headers['calendly-webhook-timestamp'];
    
    if (!verifyCalendlyWebhook(req.body, signature, timestamp)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }
    
    const { event, payload } = req.body;
    
    switch (event) {
      case 'invitee.created':
        await handleBookingCreated(payload);
        break;
      case 'invitee.canceled':
        await handleBookingCanceled(payload);
        break;
      case 'invitee_no_show.created':
        await handleNoShow(payload);
        break;
      default:
        console.log(`Unhandled Calendly event: ${event}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Calendly webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Get all bookings (Admin only)
router.get('/bookings', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      meetingType,
      startDate,
      endDate,
      search
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (meetingType) query.meetingType = meetingType;
    
    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) query.scheduledTime.$gte = new Date(startDate);
      if (endDate) query.scheduledTime.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { 'attendee.name': { $regex: search, $options: 'i' } },
        { 'attendee.email': { $regex: search, $options: 'i' } },
        { 'attendee.company': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const bookings = await Booking.find(query)
      .sort({ scheduledTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Get booking analytics (Admin only)
router.get('/analytics', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Aggregate booking statistics
    const analytics = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedMeetings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledMeetings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Meeting type breakdown
    const meetingTypeStats = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$meetingType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Daily booking trends
    const dailyTrends = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: analytics[0] || {
          totalBookings: 0,
          completedMeetings: 0,
          cancelledMeetings: 0,
          noShows: 0
        },
        meetingTypes: meetingTypeStats,
        dailyTrends
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Update booking status (Admin only)
router.put('/bookings/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

// Helper Functions
function verifyCalendlyWebhook(payload, signature, timestamp) {
  if (!process.env.CALENDLY_WEBHOOK_SECRET) {
    console.warn('CALENDLY_WEBHOOK_SECRET not set, skipping verification');
    return true; // Skip verification in development
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CALENDLY_WEBHOOK_SECRET)
    .update(timestamp + JSON.stringify(payload))
    .digest('base64');
  
  return signature === expectedSignature;
}

async function handleBookingCreated(payload) {
  try {
    const { event, invitee } = payload;
    
    // Determine meeting type from event name
    const meetingType = determineMeetingType(event.name);
    
    // Create booking record
    const booking = new Booking({
      calendlyEventId: event.uuid,
      calendlyEventUri: event.uri,
      meetingType,
      meetingTitle: event.name,
      scheduledTime: new Date(event.start_time),
      duration: event.event_type.duration,
      timezone: invitee.timezone,
      attendee: {
        name: invitee.name,
        email: invitee.email,
        phone: getAnswerValue(invitee.questions_and_answers, 'phone'),
        company: getAnswerValue(invitee.questions_and_answers, 'company'),
        notes: getAnswerValue(invitee.questions_and_answers, 'notes')
      },
      meetingUrl: event.location?.join_url,
      rescheduleUrl: invitee.reschedule_url,
      cancelUrl: invitee.cancel_url,
      utm: extractUTMFromPayload(payload)
    });
    
    await booking.save();
    
    // Send notification emails
    await sendBookingNotifications(booking);
    
    console.log(`New booking created: ${booking._id}`);
  } catch (error) {
    console.error('Handle booking created error:', error);
  }
}

async function handleBookingCanceled(payload) {
  try {
    const { event } = payload;
    
    await Booking.findOneAndUpdate(
      { calendlyEventId: event.uuid },
      { status: 'cancelled' }
    );
    
    console.log(`Booking cancelled: ${event.uuid}`);
  } catch (error) {
    console.error('Handle booking canceled error:', error);
  }
}

async function handleNoShow(payload) {
  try {
    const { invitee } = payload;
    
    await Booking.findOneAndUpdate(
      { calendlyEventId: invitee.event.uuid },
      { status: 'no_show' }
    );
    
    console.log(`No show recorded: ${invitee.event.uuid}`);
  } catch (error) {
    console.error('Handle no show error:', error);
  }
}

function determineMeetingType(eventName) {
  const name = eventName.toLowerCase();
  if (name.includes('demo')) return 'demo';
  if (name.includes('consultation')) return 'consultation';
  if (name.includes('strategy')) return 'strategy';
  return 'demo'; // default
}

function getAnswerValue(questionsAndAnswers, questionKey) {
  if (!questionsAndAnswers) return null;
  
  const answer = questionsAndAnswers.find(qa => 
    qa.question.toLowerCase().includes(questionKey)
  );
  
  return answer ? answer.answer : null;
}

function extractUTMFromPayload(payload) {
  // Extract UTM parameters from Calendly payload if available
  const utm = {};
  
  if (payload.tracking && payload.tracking.utm_campaign) {
    utm.campaign = payload.tracking.utm_campaign;
  }
  if (payload.tracking && payload.tracking.utm_source) {
    utm.source = payload.tracking.utm_source;
  }
  if (payload.tracking && payload.tracking.utm_medium) {
    utm.medium = payload.tracking.utm_medium;
  }
  
  return utm;
}

async function sendBookingNotifications(booking) {
  try {
    // Send admin notification
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@leadmagnet.ai',
      subject: `New ${booking.meetingType} booking scheduled`,
      html: `
        <h2>New Meeting Booked</h2>
        <p><strong>Meeting Type:</strong> ${booking.meetingType}</p>
        <p><strong>Attendee:</strong> ${booking.attendee.name}</p>
        <p><strong>Email:</strong> ${booking.attendee.email}</p>
        <p><strong>Company:</strong> ${booking.attendee.company || 'Not provided'}</p>
        <p><strong>Scheduled Time:</strong> ${booking.scheduledTime}</p>
        <p><strong>Duration:</strong> ${booking.duration} minutes</p>
        ${booking.attendee.notes ? `<p><strong>Notes:</strong> ${booking.attendee.notes}</p>` : ''}
        <p><strong>Meeting URL:</strong> <a href="${booking.meetingUrl}">${booking.meetingUrl}</a></p>
      `
    });
    
    // Send confirmation to attendee
    await sendEmail({
      to: booking.attendee.email,
      subject: `Your ${booking.meetingType} with LeadMagnet is confirmed`,
      html: `
        <h2>Meeting Confirmed!</h2>
        <p>Hi ${booking.attendee.name},</p>
        <p>Thank you for scheduling a ${booking.meetingType} with LeadMagnet!</p>
        <p><strong>Meeting Details:</strong></p>
        <ul>
          <li><strong>Date & Time:</strong> ${booking.scheduledTime}</li>
          <li><strong>Duration:</strong> ${booking.duration} minutes</li>
          <li><strong>Meeting Link:</strong> <a href="${booking.meetingUrl}">Join Meeting</a></li>
        </ul>
        <p>We're excited to show you how LeadMagnet can transform your lead generation!</p>
        <p>If you need to reschedule or cancel, you can do so <a href="${booking.rescheduleUrl}">here</a>.</p>
        <p>Best regards,<br>The LeadMagnet Team</p>
      `
    });
  } catch (error) {
    console.error('Send booking notifications error:', error);
  }
}

module.exports = router;