const ChatMessage = require('../models/Chat');
const Event = require('../models/Event');
const sentimentAnalyzer = require('../services/nlp/sentimentAnalyzer');
const alertGenerator = require('../services/alert/alertGenerator');
const socketHandler = require('../services/realtime/socketHandler');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { message, user, userId, metadata } = req.body;
  
  if (!message || !user) {
    return res.status(400).json({
      success: false,
      message: 'Message and user name are required'
    });
  }
  
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  const chatMessage = new ChatMessage({
    event: eventId,
    user,
    userId: userId || null,
    message,
    metadata: {
      ...metadata,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    }
  });
  
  try {
    const sentimentResult = await sentimentAnalyzer.analyzeSentiment(message);
    chatMessage.sentiment = sentimentResult.sentiment;
    chatMessage.sentimentScore = sentimentResult.score;
    chatMessage.isProcessed = true;
  } catch (error) {
    logger.error(`Chat sentiment analysis error: ${error.message}`, { error, eventId, message });
 
  }
  
  await chatMessage.save();
  

  if (chatMessage.sentiment === 'negative') {
    try {
      const feedbackData = {
        event: eventId,
        source: 'app_chat',
        text: message,
        metadata: {
          username: user,
          userId: userId,
          platform: 'chat'
        }
      };
      
      const processedFeedback = await sentimentAnalyzer.processFeedback(feedbackData);
      processedFeedback.sourceId = chatMessage._id.toString();
      
      const feedback = await Feedback.create(processedFeedback);
      
      // Generate alerts if sentiment is negative
      const alerts = await alertGenerator.generateAlerts(feedback);
      
      // Broadcast via socket if io is available
      if (req.io) {
        // Broadcast the feedback
        socketHandler.broadcastFeedback(req.io, feedback);
        
        // Broadcast any generated alerts
        if (alerts && alerts.length > 0) {
          alerts.forEach(alert => {
            socketHandler.broadcastAlert(req.io, alert);
          });
        }
      }
      
      logger.info(`Created feedback from chat message: ${feedback._id}`, {
        chatId: chatMessage._id,
        sentiment: feedback.sentiment,
        alertsGenerated: alerts ? alerts.length : 0
      });
    } catch (error) {
      logger.error(`Error creating feedback from chat: ${error.message}`, { error, chatId: chatMessage._id });
    }
  }
  
  // Broadcast the message to all clients in the chat room
  if (req.io) {
    req.io.to(`chat:${eventId}`).emit('new-message', chatMessage);
  }
  
  res.status(201).json({
    success: true,
    data: chatMessage
  });
});

exports.getEventMessages = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { limit = 50, before } = req.query;
  
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  // Build query
  const query = { event: eventId };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  // Get messages
  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10));
  
  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages.reverse() // Return in chronological order
  });
});

exports.getChatStats = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  // Get chat stats
  const total = await ChatMessage.countDocuments({ event: eventId });
  
  const sentimentStats = await ChatMessage.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Format sentiment stats
  const sentiment = {
    positive: 0,
    neutral: 0,
    negative: 0,
    unprocessed: 0
  };
  
  sentimentStats.forEach(stat => {
    if (stat._id === null) {
      sentiment.unprocessed = stat.count;
    } else {
      sentiment[stat._id] = stat.count;
    }
  });
  
  // Get user stats
  const userCount = await ChatMessage.distinct('user', { event: eventId }).then(users => users.length);
  
  res.status(200).json({
    success: true,
    data: {
      total,
      sentiment,
      userCount
    }
  });
});