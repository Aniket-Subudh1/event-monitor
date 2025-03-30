const { pipeline } = require('@xenova/transformers');
const logger = require('../../utils/logger');


let sentimentPipeline = null;
let zeroShotClassificationPipeline = null;

exports.initializeNLP = async () => {
  try {
    logger.info('Initializing NLP pipelines...');
    
    if (!sentimentPipeline) {
      logger.info('Loading sentiment analysis model...');
      sentimentPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      logger.info('Sentiment analysis model loaded successfully');
    }
    
    // Load zero-shot classification model for issue detection
    if (!zeroShotClassificationPipeline) {
      logger.info('Loading zero-shot classification model...');
      zeroShotClassificationPipeline = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
      logger.info('Zero-shot classification model loaded successfully');
    }
    
    return {
      sentimentPipeline,
      zeroShotClassificationPipeline
    };
  } catch (error) {
    logger.error(`Error initializing NLP pipelines: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Analyze sentiment of text
 * @param {String} text - Text to analyze
 * @returns {Object} Sentiment analysis result
 */
exports.analyzeSentiment = async (text) => {
  try {
    // Initialize pipeline if not already loaded
    if (!sentimentPipeline) {
      await this.initializeNLP();
    }
    
    // Run sentiment analysis
    const result = await sentimentPipeline(text);
    
    // Convert to our application's format
    let sentiment, score;
    
    if (result[0].label === 'POSITIVE') {
      sentiment = 'positive';
      score = result[0].score;
    } else if (result[0].label === 'NEGATIVE') {
      sentiment = 'negative';
      score = -result[0].score; // Convert to negative value for our scale
    } else {
      sentiment = 'neutral';
      score = 0;
    }
    
    // Normalize to -1 to 1 scale
    const normalizedScore = sentiment === 'negative' ? -result[0].score : result[0].score;
    
    return {
      sentiment,
      score: normalizedScore,
      original: result[0]
    };
  } catch (error) {
    logger.error(`Sentiment analysis error: ${error.message}`, { error, text });
    // Return neutral sentiment on error
    return {
      sentiment: 'neutral',
      score: 0,
      error: error.message
    };
  }
};

exports.detectIssueType = async (text) => {
  try {
    // Initialize pipeline if not already loaded
    if (!zeroShotClassificationPipeline) {
      await this.initializeNLP();
    }
    
    // Define issue categories
    const issueCategories = [
      'queue', 'waiting in line', 
      'audio problems', 'sound issues',
      'video problems', 'display issues',
      'overcrowding', 'crowded space',
      'food and drink', 'bathroom facilities',
      'presentation content', 'speaker quality',
      'room temperature', 'air conditioning',
      'safety concerns'
    ];
    
    // Run zero-shot classification
    const result = await zeroShotClassificationPipeline(text, issueCategories);
    
    // Map results to our issue types
    const issueMap = {
      'queue': 'queue',
      'waiting in line': 'queue',
      'audio problems': 'audio',
      'sound issues': 'audio',
      'video problems': 'video',
      'display issues': 'video',
      'overcrowding': 'crowding',
      'crowded space': 'crowding',
      'food and drink': 'amenities',
      'bathroom facilities': 'amenities',
      'presentation content': 'content',
      'speaker quality': 'content',
      'room temperature': 'temperature',
      'air conditioning': 'temperature',
      'safety concerns': 'safety'
    };
    
    // Get the most likely issue
    const topIssue = result.labels[0];
    const topScore = result.scores[0];
    
    // Only return an issue if the score is above threshold
    if (topScore > 0.6) {
      return {
        issueType: issueMap[topIssue] || 'other',
        score: topScore,
        original: {
          label: topIssue,
          score: topScore
        }
      };
    }
    
    // If no strong match, return 'other'
    return {
      issueType: 'other',
      score: 0,
      original: {
        label: topIssue,
        score: topScore
      }
    };
  } catch (error) {
    logger.error(`Issue detection error: ${error.message}`, { error, text });
    // Return 'other' on error
    return {
      issueType: 'other',
      score: 0,
      error: error.message
    };
  }
};