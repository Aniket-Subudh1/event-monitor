const Alert = require('../../models/Alert');
const Issue = require('../../models/Issue');
const Event = require('../../models/Event');
const SentimentRecord = require('../../models/SentimentRecord');
const issueClassifier = require('../nlp/issueClassifier');
const logger = require('../../utils/logger');
const notificationService = require('./notificationService');

exports.generateAlerts = async (feedbackData) => {
  try {
    if (!feedbackData || !feedbackData.event) {
      logger.warn('Invalid feedback data for alert generation', { feedbackData });
      return null;
    }
    
    const generatedAlerts = [];
    
    const event = await Event.findById(feedbackData.event);
    if (!event) {
      logger.warn(`Event not found for alert generation: ${feedbackData.event}`);
      return null;
    }
    
    if (feedbackData.sentiment === 'negative' && 
        feedbackData.sentimentScore <= event.alertSettings.negativeSentimentThreshold) {
      const issueType = feedbackData.issueType || 'other';
      const location = feedbackData.issueDetails?.location || null;
      
      const existingIssues = await Issue.find({
        event: feedbackData.event,
        type: issueType,
        location: location,
        status: { $in: ['detected', 'confirmed', 'inProgress'] }
      });
      
      if (existingIssues.length > 0) {
        const issue = existingIssues[0];
        issue.feedback.push(feedbackData._id);
        issue.metadata.feedbackCount += 1;
        issue.metadata.lastMentionedAt = new Date();
        await issue.save();
        
        if (issue.metadata.feedbackCount >= event.alertSettings.issueAlertThreshold && 
            !await hasActiveAlertForIssue(issue._id)) {
          const alert = await createIssueAlert(issue, feedbackData);
          generatedAlerts.push(alert);
        }
      } else {
        const severity = issueClassifier.detectSeverity(
          feedbackData.text, 
          feedbackData.sentimentScore
        ).severity;
        
        const newIssue = await Issue.create({
          event: feedbackData.event,
          type: issueType,
          title: `${issueType.charAt(0).toUpperCase() + issueType.slice(1)} issue detected`,
          description: `Issue detected from feedback: "${feedbackData.text}"`,
          location: location,
          severity: severity,
          feedback: [feedbackData._id],
          metadata: {
            feedbackCount: 1,
            firstDetectedAt: new Date(),
            lastMentionedAt: new Date(),
            keywords: feedbackData.metadata?.keywords || [],
            sentimentAverage: feedbackData.sentimentScore
          }
        });
        
        if (severity === 'high' || severity === 'critical') {
          const alert = await createIssueAlert(newIssue, feedbackData);
          generatedAlerts.push(alert);
        }
      }
    }
    
    await checkForSentimentTrendAlert(feedbackData.event);
    
    return generatedAlerts;
  } catch (error) {
    logger.error(`Alert generation error: ${error.message}`, { error, feedbackData });
    return null;
  }
};


const hasActiveAlertForIssue = async (issueId) => {
  const alertCount = await Alert.countDocuments({
    'relatedFeedback': issueId,
    'status': { $in: ['new', 'acknowledged', 'inProgress'] }
  });
  
  return alertCount > 0;
};

const createIssueAlert = async (issue, feedbackData) => {
  try {
    let alertSeverity = issue.severity;
    
    const alert = await Alert.create({
      event: issue.event,
      type: 'issue',
      severity: alertSeverity,
      title: `${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} issue detected`,
      description: `Multiple attendees have reported issues with ${issue.type}${issue.location ? ` in ${issue.location}` : ''}. Latest feedback: "${feedbackData.text}"`,
      category: issue.type,
      location: issue.location,
      relatedFeedback: [...issue.feedback],
      metadata: {
        issueCount: issue.metadata.feedbackCount,
        sentimentAverage: issue.metadata.sentimentAverage || feedbackData.sentimentScore,
        detectionMethod: 'automatic',
        keywords: issue.metadata.keywords || [],
        autoResolveDue: new Date(Date.now() + (60 * 60 * 1000)) // 1 hour auto-resolve
      }
    });
    
    issue.alerts.push(alert._id);
    await issue.save();
    
    await notificationService.sendAlertNotification(alert);
    
    return alert;
  } catch (error) {
    logger.error(`Create issue alert error: ${error.message}`, { error, issue });
    throw error;
  }
};

const checkForSentimentTrendAlert = async (eventId) => {
  try {
    const lastHourTimestamp = new Date(Date.now() - (60 * 60 * 1000)); 
    
    const records = await SentimentRecord.find({
      event: eventId,
      timeframe: 'minute',
      timestamp: { $gte: lastHourTimestamp }
    }).sort({ timestamp: -1 }).limit(30);
    
    if (records.length < 10) {
    
      return null;
    }
    
  
    let negativeCount = 0;
    let totalMessages = 0;
    let negativeTrend = false;

    const recentRecords = records.slice(0, 10);
    for (const record of recentRecords) {
      negativeCount += record.data.negative.count;
      totalMessages += record.data.total;
    }
    

    const negativePercentage = totalMessages > 0 ? (negativeCount / totalMessages) * 100 : 0;
    

    if (negativePercentage >= 60 && totalMessages >= 5) {
      negativeTrend = true;
    }
    
    const olderRecords = records.slice(10);
    let olderNegativeCount = 0;
    let olderTotalMessages = 0;
    
    for (const record of olderRecords) {
      olderNegativeCount += record.data.negative.count;
      olderTotalMessages += record.data.total;
    }
    
    const olderNegativePercentage = olderTotalMessages > 0 
      ? (olderNegativeCount / olderTotalMessages) * 100 
      : 0;
    
    if (negativePercentage - olderNegativePercentage >= 20 && totalMessages >= 5) {
      negativeTrend = true;
    }
    
    if (negativeTrend) {
      const existingAlert = await Alert.findOne({
        event: eventId,
        type: 'trend',
        status: { $in: ['new', 'acknowledged', 'inProgress'] },
        createdAt: { $gte: lastHourTimestamp }
      });
      
      if (existingAlert) {
        existingAlert.description = `Negative feedback trend detected: ${negativePercentage.toFixed(1)}% of recent feedback is negative.`;
        existingAlert.metadata.sentimentAverage = negativePercentage;
        await existingAlert.save();
        return existingAlert;
      } else {
        const alert = await Alert.create({
          event: eventId,
          type: 'trend',
          severity: negativePercentage >= 75 ? 'high' : 'medium',
          title: 'Negative feedback trend detected',
          description: `Negative feedback trend detected: ${negativePercentage.toFixed(1)}% of recent feedback is negative.`,
          category: 'general',
          metadata: {
            sentimentAverage: negativePercentage,
            detectionMethod: 'trend',
            autoResolveDue: new Date(Date.now() + (2 * 60 * 60 * 1000)) // 2 hour auto-resolve
          }
        });
        
        await notificationService.sendAlertNotification(alert);
        
        return alert;
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Sentiment trend alert error: ${error.message}`, { error, eventId });
    return null;
  }
};

exports.createManualAlert = async (alertData) => {
  try {
    const alert = await Alert.create({
      ...alertData,
      metadata: {
        ...alertData.metadata,
        detectionMethod: 'manual',
        autoResolveDue: alertData.metadata?.autoResolveDue || new Date(Date.now() + (4 * 60 * 60 * 1000)) // 4 hour auto-resolve by default
      }
    });

    await notificationService.sendAlertNotification(alert);
    
    return alert;
  } catch (error) {
    logger.error(`Create manual alert error: ${error.message}`, { error, alertData });
    throw error;
  }
};

exports.autoResolveAlerts = async () => {
  try {
    const now = new Date();

    const alerts = await Alert.find({
      status: { $in: ['new', 'acknowledged', 'inProgress'] },
      'metadata.autoResolveDue': { $lte: now }
    });
    
    if (alerts.length === 0) {
      return 0;
    }
    
    await Alert.updateMany(
      {
        _id: { $in: alerts.map(a => a._id) }
      },
      {
        status: 'resolved',
        resolvedAt: now,
        $push: {
          statusUpdates: {
            status: 'resolved',
            note: 'Automatically resolved due to time threshold',
            timestamp: now
          }
        }
      }
    );
    
    logger.info(`Auto-resolved ${alerts.length} expired alerts`);
    return alerts.length;
  } catch (error) {
    logger.error(`Auto-resolve alerts error: ${error.message}`, { error });
    return 0;
  }
};