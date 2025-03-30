const Queue = require('bull');
const sentimentAnalyzer = require('../nlp/sentimentAnalyzer');
const alertGenerator = require('../alert/alertGenerator');
const socketHandler = require('./socketHandler');
const SentimentRecord = require('../../models/SentimentRecord');
const Feedback = require('../../models/Feedback');
const logger = require('../../utils/logger');

// Define InMemoryQueue class for fallback when Redis is not available
class InMemoryQueue {
  constructor() {
    this._jobs = [];
    this._processCallback = null;
    this._eventCallbacks = {};
    logger.warn('Using in-memory queue (Redis not available)');
  }

  add(data, options = {}) {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job = { id, data };
    
    this._jobs.push(job);
    logger.info(`Added job ${id} to in-memory queue`);
    
    // Process immediately if a processor is registered
    if (this._processCallback) {
      setTimeout(() => {
        try {
          Promise.resolve(this._processCallback(job))
            .then(result => {
              if (this._eventCallbacks['completed']) {
                this._eventCallbacks['completed'](job, result);
              }
            })
            .catch(error => {
              if (this._eventCallbacks['failed']) {
                this._eventCallbacks['failed'](job, error);
              }
            });
        } catch (error) {
          if (this._eventCallbacks['failed']) {
            this._eventCallbacks['failed'](job, error);
          }
        }
      }, 100);
    }
    
    return Promise.resolve(job);
  }

  process(callback) {
    this._processCallback = callback;
  }

  on(event, callback) {
    this._eventCallbacks[event] = callback;
  }

  getJobCounts() {
    return Promise.resolve({ 
      waiting: this._jobs.length, 
      active: 0, 
      completed: 0, 
      failed: 0 
    });
  }

  getCompleted() {
    return Promise.resolve([]);
  }

  getFailed() {
    return Promise.resolve([]);
  }

  getDelayed() {
    return Promise.resolve([]);
  }

  getActive() {
    return Promise.resolve([]);
  }
}

// Use a try-catch to handle Redis connection errors
let feedbackQueue;

try {
  if (process.env.REDIS_URL || (process.env.NODE_ENV === 'production')) {
    // Use real Bull queue with Redis in production or when Redis URL is specified
    feedbackQueue = new Queue('feedback-processing', process.env.REDIS_URL || 'redis://localhost:6379');
    logger.info('Connected to Redis for feedback queue');
  } else {
    // Use in-memory queue implementation for development
    feedbackQueue = new InMemoryQueue();
  }
} catch (error) {
  logger.error(`Failed to connect to Redis: ${error.message}`);
  // Fallback to in-memory queue
  feedbackQueue = new InMemoryQueue();
}

exports.addToQueue = async (feedbackData) => {
  try {
    const job = await feedbackQueue.add(feedbackData, {
      priority: 2,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    });
    
    logger.info(`Added feedback to processing queue: ${job.id}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error(`Add to queue error: ${error.message}`, { error, feedbackData });
    throw error;
  }
};

exports.addWithHighPriority = async (feedbackData) => {
  try {
    const job = await feedbackQueue.add(feedbackData, {
      priority: 1,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    });
    
    logger.info(`Added high-priority feedback to queue: ${job.id}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error(`Add with high priority error: ${error.message}`, { error, feedbackData });
    throw error;
  }
};

exports.startProcessing = (io) => {
  feedbackQueue.process(async (job) => {
    try {
      const feedbackData = job.data;
      
      const processedFeedback = await sentimentAnalyzer.processFeedback(feedbackData);
      
      const feedback = await Feedback.create(processedFeedback);
      
      await updateSentimentRecords(feedback);
      
      const alerts = await alertGenerator.generateAlerts(feedback);
      
      socketHandler.broadcastFeedback(io, feedback);
      
      if (alerts && alerts.length > 0) {
        alerts.forEach(alert => {
          socketHandler.broadcastAlert(io, alert);
        });
      }
      
      return {
        success: true,
        feedbackId: feedback._id,
        alertsGenerated: alerts ? alerts.length : 0
      };
    } catch (error) {
      logger.error(`Process feedback error: ${error.message}`, { error, jobId: job.id });
      throw error;
    }
  });
  
  feedbackQueue.on('failed', (job, err) => {
    logger.error(`Feedback job failed: ${err.message}`, { error: err, jobId: job.id });
  });
  
  feedbackQueue.on('completed', (job, result) => {
    logger.info(`Feedback job completed: ${job.id}`, { result });
  });
  
  logger.info('Feedback processing queue started');
};

const updateSentimentRecords = async (feedback) => {
  try {
    await SentimentRecord.updateRecord(
      feedback.event,
      'minute',
      feedback.createdAt,
      feedback
    );
    
    await SentimentRecord.updateRecord(
      feedback.event,
      'hour',
      feedback.createdAt,
      feedback
    );
    
    await SentimentRecord.updateRecord(
      feedback.event,
      'day',
      feedback.createdAt,
      feedback
    );
  } catch (error) {
    logger.error(`Update sentiment records error: ${error.message}`, { error, feedbackId: feedback._id });
  }
};

exports.getQueueStatus = async () => {
  try {
    const [
      jobCounts,
      completedJobs,
      failedJobs,
      delayedJobs,
      activeJobs
    ] = await Promise.all([
      feedbackQueue.getJobCounts(),
      feedbackQueue.getCompleted(),
      feedbackQueue.getFailed(),
      feedbackQueue.getDelayed(),
      feedbackQueue.getActive()
    ]);
    
    return {
      counts: jobCounts,
      completed: completedJobs.length,
      failed: failedJobs.length,
      delayed: delayedJobs.length,
      active: activeJobs.length
    };
  } catch (error) {
    logger.error(`Get queue status error: ${error.message}`, { error });
    throw error;
  }
};

exports.cleanFailedJobs = async () => {
  try {
    const failedJobs = await feedbackQueue.getFailed();
    
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    let cleanedCount = 0;
    for (const job of failedJobs) {
      if (job.attemptsMade >= 3 || job.timestamp < oneDayAgo) {
        await job.remove();
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  } catch (error) {
    logger.error(`Clean failed jobs error: ${error.message}`, { error });
    return 0;
  }
};