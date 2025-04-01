const transformersService = require('./transformersService');
const natural = require('natural');
const logger = require('../../utils/logger');
const textProcessing = require('../../utils/textProcessing');
const SentimentRecord = require('../../models/SentimentRecord');

// Initialize AFINN sentiment analyzer
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

/**
 * Analyze sentiment of text
 * @param {String} text - Text to analyze
 * @returns {Object} Sentiment analysis result
 */
exports.analyzeSentiment = async (text) => {
  try {
    if (!text || text.trim() === '') {
      return { sentiment: 'neutral', score: 0 };
    }
    
    const cleanedText = textProcessing.cleanText(text);
    
    if (cleanedText.length < 3) {
      return { sentiment: 'neutral', score: 0 };
    }
    
    // Try transformers service first
    try {
      const transformersResult = await transformersService.analyzeSentiment(cleanedText);
      
      if (!transformersResult.error) {
        logger.debug(`Sentiment analyzed with Transformers: ${transformersResult.sentiment}`, {
          score: transformersResult.score,
          method: transformersResult.method
        });
        
        return {
          sentiment: transformersResult.sentiment,
          score: transformersResult.score,
          method: 'transformers'
        };
      }
    } catch (transformersError) {
      logger.warn(`Transformers sentiment analysis failed: ${transformersError.message}, falling back to AFINN`);
    }
    
    // Fall back to AFINN 
    const tokens = textProcessing.tokenize(cleanedText);
    const filteredTokens = textProcessing.removeStopwords(tokens);
    
    const afinnScore = analyzer.getSentiment(filteredTokens);
    
    let sentiment, score;
    
    if (afinnScore > 0.2) {
      sentiment = 'positive';
      score = Math.min(afinnScore / 2.5, 1); 
    } else if (afinnScore < -0.2) {
      sentiment = 'negative';
      score = Math.max(afinnScore / 2.5, -1); 
    } else {
      sentiment = 'neutral';
      score = afinnScore;
    }
    
    logger.debug(`Sentiment analyzed with AFINN: ${sentiment}`, {
      score,
      afinnScore
    });
    
    return {
      sentiment,
      score,
      method: 'afinn'
    };
  } catch (error) {
    logger.error(`Sentiment analysis error: ${error.message}`, { error, text });
    
    // If all else fails, use simple keyword matching as last resort
    const lowerText = text.toLowerCase();
    const sentiment = lowerText.match(/good|great|excellent|amazing|love|happy|positive/i) ? 'positive' :
                      lowerText.match(/bad|terrible|awful|hate|poor|negative|issue|problem/i) ? 'negative' : 
                      'neutral';
    const score = sentiment === 'positive' ? 0.7 : 
                  sentiment === 'negative' ? -0.7 : 0;
                      
    return { 
      sentiment, 
      score, 
      method: 'fallback-keywords'
    };
  }
};

/**
 * Process feedback through sentiment analysis and issue detection
 * @param {Object} feedback - Feedback data
 * @returns {Object} Processed feedback data
 */
exports.processFeedback = async (feedback) => {
  try {
    const { text } = feedback;
    
    // Ensure we have text to analyze
    if (!text || text.trim() === '') {
      return {
        ...feedback,
        sentiment: 'neutral',
        sentimentScore: 0,
        issueType: null,
        processed: true
      };
    }
    
    // Analyze sentiment
    const sentimentResult = await this.analyzeSentiment(text);
    
    // Detect issue type for negative sentiment
    let issueResult = { issueType: null };
    
    if (sentimentResult.sentiment === 'negative') {
      try {
        // Try transformers service first
        if (transformersService && typeof transformersService.detectIssueType === 'function') {
          issueResult = await transformersService.detectIssueType(text);
          logger.debug(`Issue detected with Transformers: ${issueResult.issueType}`, {
            score: issueResult.score,
            method: issueResult.method
          });
        } else {
          // Fall back to simpler methods
          issueResult = fallbackIssueDetection(text);
        }
      } catch (issueError) {
        logger.warn(`Issue detection error: ${issueError.message}, using fallback`);
        issueResult = fallbackIssueDetection(text);
      }
    }
    
    // Extract metadata from text
    const hashtags = textProcessing.extractHashtags(text);
    const mentions = textProcessing.extractMentions(text);
    const keywords = textProcessing.extractKeywords(text, 10);
    
    // Merge metadata with existing metadata if provided
    const mergedMetadata = {
      ...(feedback.metadata || {}),
      keywords: [...new Set([...(feedback.metadata?.keywords || []), ...keywords])],
      hashTags: [...new Set([...(feedback.metadata?.hashTags || []), ...hashtags])],
      mentions: [...new Set([...(feedback.metadata?.mentions || []), ...mentions])]
    };
    
    // Log the processing result
    logger.info(`Processed feedback sentiment: ${sentimentResult.sentiment} (${sentimentResult.score.toFixed(2)})`, {
      feedbackSource: feedback.source,
      issueType: issueResult.issueType,
      textLength: text.length
    });
    
    const processedFeedback = {
      ...feedback,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      issueType: issueResult.issueType,
      metadata: mergedMetadata,
      processed: true
    };
    
    // Update sentiment records asynchronously if needed
    try {
      if (feedback.event) {
        await updateSentimentRecords(processedFeedback);
      }
    } catch (recordError) {
      logger.error(`Error updating sentiment records: ${recordError.message}`, { error: recordError });
      // Don't let this stop the feedback from being processed
    }
    
    return processedFeedback;
  } catch (error) {
    logger.error(`Feedback processing error: ${error.message}`, { error, feedbackText: feedback.text });
    
    // Ensure we return something valid even on error
    return {
      ...feedback,
      sentiment: 'neutral', // Default to neutral on error
      sentimentScore: 0,
      issueType: null,
      processed: false,
      processingError: error.message
    };
  }
};

/**
 * Process multiple feedback items in batch
 * @param {Array} feedbackItems - Array of feedback data
 * @returns {Array} Processed feedback items
 */
exports.batchProcessFeedback = async (feedbackItems) => {
  try {
    const processedItems = await Promise.all(
      feedbackItems.map(item => this.processFeedback(item))
    );
    
    return processedItems;
  } catch (error) {
    logger.error(`Batch processing error: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Fallback issue detection using keyword matching
 * @param {String} text - Text to analyze
 * @returns {Object} Issue detection result
 */
const fallbackIssueDetection = (text) => {
  const lowerText = text.toLowerCase();
  
  const issuePatterns = {
    'queue': ['queue', 'line', 'wait', 'long', 'slow', 'entry', 'enter', 'registration', 'check-in'],
    'audio': ['audio', 'sound', 'hear', 'loud', 'quiet', 'volume', 'mic', 'speaker', 'noise'],
    'video': ['video', 'screen', 'see', 'visible', 'projection', 'display', 'slides', 'visibility', 'projector'],
    'crowding': ['crowd', 'space', 'room', 'full', 'packed', 'cramped', 'busy', 'overcrowded', 'capacity'],
    'amenities': ['food', 'drink', 'bathroom', 'toilet', 'wifi', 'chair', 'seat', 'internet', 'water'],
    'content': ['boring', 'presentation', 'speaker', 'talk', 'content', 'session', 'information', 'lecture'],
    'temperature': ['hot', 'cold', 'temp', 'air', 'ac', 'heat', 'warm', 'stuffy', 'freezing', 'ventilation'],
    'safety': ['safe', 'danger', 'emergency', 'security', 'hazard', 'exit', 'unsafe', 'accident']
  };
  
  let bestMatch = 'other';
  let bestScore = 0;
  
  Object.entries(issuePatterns).forEach(([issue, keywords]) => {
    const matchCount = keywords.filter(kw => lowerText.includes(kw)).length;
    const score = matchCount / keywords.length;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = issue;
    }
  });
  
  return {
    issueType: bestScore > 0.1 ? bestMatch : 'other',
    score: bestScore,
    method: 'keyword-fallback'
  };
};

/**
 * Update sentiment records for trend analysis
 * @param {Object} feedback - Processed feedback data
 */
const updateSentimentRecords = async (feedback) => {
  try {
    if (!feedback.event || !feedback.sentiment) {
      return;
    }
    
    await SentimentRecord.updateRecord(
      feedback.event,
      'minute',
      feedback.createdAt || new Date(),
      feedback
    );
    
    await SentimentRecord.updateRecord(
      feedback.event,
      'hour',
      feedback.createdAt || new Date(),
      feedback
    );
    
    await SentimentRecord.updateRecord(
      feedback.event,
      'day',
      feedback.createdAt || new Date(),
      feedback
    );
    
    logger.debug(`Updated sentiment records for event: ${feedback.event}`, {
      sentiment: feedback.sentiment,
      source: feedback.source
    });
  } catch (error) {
    logger.error(`Update sentiment records error: ${error.message}`, { error, feedbackId: feedback._id });
    // Don't throw - this is a background process that shouldn't disrupt the main flow
  }
};