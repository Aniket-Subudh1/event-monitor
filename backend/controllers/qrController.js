const QRCode = require('qrcode');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

exports.generateEventQR = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  try {
    // Generate URL for the landing page
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const landingUrl = `${baseUrl}/feedback/${eventId}`;
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(landingUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300
    });
    
    // Update event with QR data
    event.qrCode = {
      url: qrDataUrl,
      landingUrl,
      generatedAt: new Date()
    };
    
    await event.save();
    
    res.json({
      success: true,
      data: {
        qrCode: qrDataUrl,
        landingUrl,
        eventName: event.name
      }
    });
  } catch (error) {
    logger.error(`QR generation error: ${error.message}`, { error, eventId });
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
});

exports.getEventQR = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  if (!event.qrCode || !event.qrCode.url) {
    return res.status(404).json({
      success: false,
      message: 'QR code not found for this event'
    });
  }
  
  res.json({
    success: true,
    data: {
      qrCode: event.qrCode.url,
      landingUrl: event.qrCode.landingUrl,
      eventName: event.name,
      generatedAt: event.qrCode.generatedAt
    }
  });
});