const Event = require('../../models/Event');
const Feedback = require('../../models/Feedback');
const Alert = require('../../models/Alert');
const sentimentAnalyzer = require('../nlp/sentimentAnalyzer');
const alertGenerator = require('../alert/alertGenerator');
const logger = require('../../utils/logger');

const connectedClients = new Map();


exports.setupEventHandlers = (io, socket) => {
  socket.on('join-event', async (data) => {
    try {
      const { eventId, userId } = data;
      
      if (!eventId) {
        return socket.emit('error', { message: 'Event ID is required' });
      }
      
      const event = await Event.findById(eventId);
      if (!event) {
        return socket.emit('error', { message: 'Event not found' });
      }
      
      socket.join(`event:${eventId}`);
      
      if (!connectedClients.has(eventId)) {
        connectedClients.set(eventId, new Set());
      }
      connectedClients.get(eventId).add(socket.id);
      
      socket.emit('joined-event', {
        eventId,
        active: event.isActive,
        name: event.name
      });
      
      logger.info(`Socket ${socket.id} joined event: ${eventId}`, { userId, eventId });
      
      io.to(`event:${eventId}`).emit('connection-count', {
        count: connectedClients.get(eventId).size
      });
    } catch (error) {
      logger.error(`Join event error: ${error.message}`, { error, socketId: socket.id });
      socket.emit('error', { message: 'Failed to join event' });
    }
  });
  
  socket.on('leave-event', (data) => {
    try {
      const { eventId } = data;
      
      if (!eventId) {
        return socket.emit('error', { message: 'Event ID is required' });
      }
      
      socket.leave(`event:${eventId}`);
      
      if (connectedClients.has(eventId)) {
        connectedClients.get(eventId).delete(socket.id);
        
        io.to(`event:${eventId}`).emit('connection-count', {
          count: connectedClients.get(eventId).size
        });
      }
      
      socket.emit('left-event', { eventId });
      
      logger.info(`Socket ${socket.id} left event: ${eventId}`);
    } catch (error) {
      logger.error(`Leave event error: ${error.message}`, { error, socketId: socket.id });
      socket.emit('error', { message: 'Failed to leave event' });
    }
  });
  
  socket.on('submit-feedback', async (data) => {
    try {
      const { eventId, text, source = 'app_chat', location, userId } = data;
      
      if (!eventId || !text) {
        return socket.emit('error', { message: 'Event ID and feedback text are required' });
      }
      
      const feedbackData = {
        event: eventId,
        source,
        text,
        issueDetails: {
          location
        },
        metadata: {
          userId,
          username: data.username || 'Anonymous'
        }
      };
      
 
      const processedFeedback = await sentimentAnalyzer.processFeedback(feedbackData);
      const feedback = await Feedback.create(processedFeedback);
      

      io.to(`event:${eventId}`).emit('new-feedback', feedback);
      

      const alerts = await alertGenerator.generateAlerts(feedback);
      

      if (alerts && alerts.length > 0) {
        io.to(`event:${eventId}`).emit('new-alerts', alerts);
      }
      

      socket.emit('feedback-received', { 
        success: true, 
        feedbackId: feedback._id 
      });
      
      logger.info(`Feedback submitted via socket: ${feedback._id}`, { eventId, source });
    } catch (error) {
      logger.error(`Submit feedback error: ${error.message}`, { error, socketId: socket.id });
      socket.emit('error', { message: 'Failed to submit feedback' });
    }
  });
  

  socket.on('subscribe-alerts', async (data) => {
    try {
      const { eventId } = data;
      
      if (!eventId) {
        return socket.emit('error', { message: 'Event ID is required' });
      }
      

      socket.join(`alerts:${eventId}`);
      

      socket.emit('subscribed-alerts', { eventId });
      
      logger.info(`Socket ${socket.id} subscribed to alerts for event: ${eventId}`);
    } catch (error) {
      logger.error(`Subscribe alerts error: ${error.message}`, { error, socketId: socket.id });
      socket.emit('error', { message: 'Failed to subscribe to alerts' });
    }
  });
  

  socket.on('update-alert', async (data) => {
    try {
      const { alertId, status, note, userId } = data;
      
      if (!alertId || !status) {
        return socket.emit('error', { message: 'Alert ID and status are required' });
      }
      

      const alert = await Alert.findById(alertId);
      if (!alert) {
        return socket.emit('error', { message: 'Alert not found' });
      }
      

      alert.status = status;
      

      alert.statusUpdates.push({
        status,
        note: note || '',
        updatedBy: userId,
        timestamp: new Date()
      });
      

      if (status === 'resolved' && !alert.resolvedAt) {
        alert.resolvedAt = new Date();
      }
      
      await alert.save();
      

      io.to(`alerts:${alert.event}`).emit('alert-updated', alert);
      

      socket.emit('alert-update-confirmed', { 
        success: true, 
        alertId: alert._id, 
        status 
      });
      
      logger.info(`Alert ${alertId} status updated to ${status}`, { userId });
    } catch (error) {
      logger.error(`Update alert error: ${error.message}`, { error, socketId: socket.id });
      socket.emit('error', { message: 'Failed to update alert' });
    }
  });
  

  socket.on('disconnect', () => {
    handleSocketDisconnect(io, socket);
  });
};


const handleSocketDisconnect = (io, socket) => {
  try {

    for (const [eventId, clients] of connectedClients.entries()) {
      if (clients.has(socket.id)) {
 
        clients.delete(socket.id);
        
        io.to(`event:${eventId}`).emit('connection-count', {
          count: clients.size
        });
      }
    }
    
    logger.info(`Socket disconnected: ${socket.id}`);
  } catch (error) {
    logger.error(`Socket disconnect error: ${error.message}`, { error, socketId: socket.id });
  }
};


exports.broadcastFeedback = (io, feedback) => {
  try {
    if (!feedback || !feedback.event) {
      return;
    }
    
    io.to(`event:${feedback.event}`).emit('new-feedback', feedback);
  } catch (error) {
    logger.error(`Broadcast feedback error: ${error.message}`, { error, feedbackId: feedback._id });
  }
};

exports.broadcastAlert = (io, alert) => {
  try {
    if (!alert || !alert.event) {
      return;
    }
    
    io.to(`alerts:${alert.event}`).emit('new-alert', alert);
  } catch (error) {
    logger.error(`Broadcast alert error: ${error.message}`, { error, alertId: alert._id });
  }
};

exports.getConnectionCount = (eventId) => {
  if (!connectedClients.has(eventId)) {
    return 0;
  }
  
  return connectedClients.get(eventId).size;
};