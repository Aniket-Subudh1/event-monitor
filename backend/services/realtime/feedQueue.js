const Queue = require('bull');
const sentimentAnalyzer = require('../nlp/sentimentAnalyzer');
const alertGenerator = require('../alert/alertGenerator');
const socketHandler = require('./socketHandler');
const SentimentRecord = require('../../models/SentimentRecord');
const Feedback = require('../../models/Feedback');
const logger = require('../../utils/logger');

const feedbackQueue = new Queue('feedback-processing', process.env.REDIS_URL || 'redis://localhost:6379');


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