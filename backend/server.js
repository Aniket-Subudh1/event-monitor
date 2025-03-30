// backend/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Set up environment variables early
dotenv.config();

// Import after environment setup
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  try {
    fs.mkdirSync(path.join(__dirname, 'logs'));
    console.log('Created logs directory');
  } catch (error) {
    console.warn('Could not create logs directory:', error.message);
  }
}

// Log environment information
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`SKIP_NLP_MODELS: ${process.env.SKIP_NLP_MODELS}`);

// Gracefully handle uncaught exceptions 
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  logger.error('UNCAUGHT EXCEPTION:', { error: err.stack || err.message || err });
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Import routes and middleware after setting up the app
const errorHandler = require('./middleware/errorHandler');
const indexRoutes = require('./routes/index');

// Connect to the database
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Set up socket handlers after MongoDB connection
    try {
      // Import dynamically to avoid early initialization issues
      const socketManager = require('./config/socketManager');
      socketManager(io);
      console.log('Socket.IO handlers initialized');
    } catch (error) {
      console.error('Socket initialization error:', error.message);
      logger.error('Socket initialization error:', { error });
    }

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(morgan('dev'));

    // Routes
    app.use('/api', indexRoutes);

    // Production client files
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
      });
    }

    // Error handler
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server initialization error: ${error.message}`);
    logger.error('Server initialization error:', { error });
    
    // Don't stop server startup even if there are errors
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (with initialization errors)`);
      logger.info(`Server running on port ${PORT} (with initialization errors)`);
    });
  }
};

// Start server initialization
initializeServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  logger.error('UNHANDLED REJECTION:', { error: err.stack || err.message || err });
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

module.exports = { app, server, io };