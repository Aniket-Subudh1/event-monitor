import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.connectedEvents = new Set();
    this.socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  }

  /**
   * Initialize the socket connection
   * @returns {Promise} Promise resolving to a socket instance
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        return resolve(this.socket);
      }

      // Disconnect existing socket if it exists
      if (this.socket) {
        this.socket.disconnect();
      }

      const token = localStorage.getItem('token');
      
      this.socket = io(this.socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
        resolve(this.socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (!this.isConnected) {
          reject(error);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        this.connectedEvents.clear();
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Setup heartbeat response
      this.socket.on('heartbeat', (data) => {
        console.log('Heartbeat received:', data.timestamp);
      });
    });
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectedEvents.clear();
    }
  }

  /**
   * Join an event channel
   * @param {string} eventId - Event ID to join
   */
  joinEvent(eventId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected when trying to join event:', eventId);
      return;
    }

    if (!eventId) {
      console.warn('Attempted to join event with undefined ID');
      return;
    }

    console.log('Joining event:', eventId);
    this.socket.emit('join-event', { eventId, userId: this.getUserId() });
    this.connectedEvents.add(eventId);
  }

  /**
   * Leave an event channel
   * @param {string} eventId - Event ID to leave
   */
  leaveEvent(eventId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    if (!eventId) {
      console.warn('Attempted to leave event with undefined ID');
      return;
    }

    this.socket.emit('leave-event', { eventId });
    this.connectedEvents.delete(eventId);
  }

  /**
   * Subscribe to alerts for an event
   * @param {string} eventId - Event ID
   */
  subscribeToAlerts(eventId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected when trying to subscribe to alerts for event:', eventId);
      return;
    }

    if (!eventId) {
      console.warn('Attempted to subscribe to alerts with undefined event ID');
      return;
    }

    console.log('Subscribing to alerts for event:', eventId);
    this.socket.emit('subscribe-alerts', { eventId });
  }

  /**
   * Submit feedback via socket
   * @param {Object} feedback - Feedback data
   */
  submitFeedback(feedback) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      return Promise.reject('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('submit-feedback', feedback);
      
      // Set up one-time listener for feedback confirmation
      this.socket.once('feedback-received', (data) => {
        resolve(data);
      });
      
      // Set up one-time listener for errors
      this.socket.once('error', (error) => {
        reject(error);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject('Timeout while submitting feedback');
      }, 5000);
    });
  }

  /**
   * Update an alert via socket
   * @param {string} alertId - Alert ID
   * @param {string} status - New status
   * @param {string} note - Optional note
   */
  updateAlert(alertId, status, note = '') {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      return Promise.reject('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('update-alert', { 
        alertId, 
        status, 
        note,
        userId: this.getUserId()
      });
      
      // Set up one-time listener for confirmation
      this.socket.once('alert-update-confirmed', (data) => {
        resolve(data);
      });
      
      // Set up one-time listener for errors
      this.socket.once('error', (error) => {
        reject(error);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject('Timeout while updating alert');
      }, 5000);
    });
  }

  /**
   * Get the current user ID from localStorage
   * @returns {string|null} User ID
   */
  getUserId() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user._id;
      }
      return null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Add a listener for a socket event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    // Store the callback in our listeners map
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    this.socket.on(event, callback);
  }

  /**
   * Remove a listener for a socket event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove (optional)
   */
  off(event, callback) {
    if (!this.socket) {
      return;
    }

    if (callback && this.listeners[event]) {
      // Remove specific callback
      const index = this.listeners[event].indexOf(callback);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
        this.socket.off(event, callback);
      }
    } else if (this.listeners[event]) {
      // Remove all callbacks for this event
      this.listeners[event].forEach(cb => {
        this.socket.off(event, cb);
      });
      this.listeners[event] = [];
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;