import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import AuthContext from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [lastPing, setLastPing] = useState(null);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const socketInstance = io(process.env.REACT_APP_SOCKET_URL || '', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Set up socket event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socketInstance.on('connection-count', (data) => {
        setConnectionCount(data.count);
      });

      socketInstance.on('heartbeat', (data) => {
        setLastPing(data.timestamp);
      });

      // Save socket instance
      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    } else if (socket) {
      // Disconnect socket if user logs out
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, user]);

  // Join event room
  const joinEvent = (eventId) => {
    if (socket && isConnected) {
      socket.emit('join-event', { eventId, userId: user?.id });
    }
  };

  // Leave event room
  const leaveEvent = (eventId) => {
    if (socket && isConnected) {
      socket.emit('leave-event', { eventId });
    }
  };

  // Submit feedback via socket
  const submitFeedback = (data) => {
    if (socket && isConnected) {
      return new Promise((resolve, reject) => {
        socket.emit('submit-feedback', {
          ...data,
          userId: user?.id
        });

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
    } else {
      return Promise.reject(new Error('Socket not connected'));
    }
  };

  // Update alert via socket
  const updateAlert = (alertId, status, note) => {
    if (socket && isConnected) {
      return new Promise((resolve, reject) => {
        socket.emit('update-alert', {
          alertId,
          status,
          note,
          userId: user?.id
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
    } else {
      return Promise.reject(new Error('Socket not connected'));
    }
  };

  const value = {
    socket,
    isConnected,
    connectionCount,
    lastPing,
    joinEvent,
    leaveEvent,
    submitFeedback,
    updateAlert
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;