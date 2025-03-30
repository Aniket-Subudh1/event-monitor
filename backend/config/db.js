// backend/config/db.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-sentiment-monitor';
    
    console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error(`Error connecting to MongoDB: ${error.message}`, { error });
    
    // Don't exit in development mode, allow server to start without DB for testing
    if (process.env.NODE_ENV === 'production') {
      console.error('Production mode - exiting due to MongoDB connection failure');
      process.exit(1);
    } else {
      console.warn('Running in development mode without MongoDB connection. Some features will not work.');
      logger.warn('Running in development mode without MongoDB connection. Some features will not work.');
      
      // Create a fake mongoose-like interface
      return {
        connection: { 
          host: 'mock-database',
          on: () => {},
          once: () => {},
        }
      };
    }
  }
};

module.exports = connectDB;