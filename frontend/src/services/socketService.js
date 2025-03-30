import { io } from 'socket.io-client';

let socket = null;

const socketService = {
  // Initialize socket connection
  initSocket: (token, userId) => {
    if (socket) {
      socket.disconnect();
    }
    
    socket = io(process.env.REACT_APP_SOCKET_URL || '', {
      auth: {
        token,
        userId
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // Setup basic event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    return socket;
  },
  
  // Get existing socket instance
  getSocket: () => {
    return socket;
  },
  
  // Join event room
  joinEvent: (eventId, userId) => {
    if (!socket) return false;
    
    socket.emit('join-event', { eventId, userId });
    return true;
  },
  
  // Leave event room
  leaveEvent: (eventId) => {
    if (!socket) return false;
    
    socket.emit('leave-event', { eventId });
    return true;
  },
  
  // Subscribe to alerts for event
  subscribeToAlerts: (eventId) => {
    if (!socket) return false;
    
    socket.emit('subscribe-alerts', { eventId });
    return true;
  },
  
  // Submit feedback via socket
  submitFeedback: (feedbackData) => {
    if (!socket) {
      return Promise.reject(new Error('Socket not connected'));
    }
    
    return new Promise((resolve, reject) => {
      socket.emit('submit-feedback', feedbackData);
      
      // Listen for confirmation
      socket.once('feedback-received', (response) => {
        resolve(response);
      });
      
      // Listen for error
      socket.once('error', (error) => {
        reject(error);
      });
      
      // Timeout
      setTimeout(() => {
        reject(new Error('Socket feedback submission timed out'));
      }, 5000);
    });
  },
  
  // Update alert status via socket
  updateAlertStatus: (alertId, status, note, userId) => {
    if (!socket) {
      return Promise.reject(new Error('Socket not connected'));
    }
    
    return new Promise((resolve, reject) => {
      socket.emit('update-alert', {
        alertId,
        status,
        note,
        userId
      });
      
      // Listen for confirmation
      socket.once('alert-update-confirmed', (response) => {
        resolve(response);
      });
      
      // Listen for error
      socket.once('error', (error) => {
        reject(error);
      });
      
      // Timeout
      setTimeout(() => {
        reject(new Error('Socket alert update timed out'));
      }, 5000);
    });
  },
  
  // Add custom event listener
  on: (event, callback) => {
    if (!socket) return false;
    
    socket.on(event, callback);
    return true;
  },
  
  // Remove event listener
  off: (event, callback) => {
    if (!socket) return false;
    
    socket.off(event, callback);
    return true;
  },
  
  // Disconnect socket
  disconnect: () => {
    if (!socket) return false;
    
    socket.disconnect();
    socket = null;
    return true;
  }
};

export default socketService;