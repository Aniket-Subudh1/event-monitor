const transformersService = require('./transformersService');
const natural = require('natural');
const logger = require('../../utils/logger');
const textProcessing = require('../../utils/textProcessing');

const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');


exports.analyzeSentiment = async (text) => {
  try {
    if (!text || text.trim() === '') {
      return { sentiment: 'neutral', score: 0 };
    }
    
    const cleanedText = textProcessing.cleanText(text);
    
    if (cleanedText.length < 3) {
      return { sentiment: 'neutral', score: 0 };
    }
    
    const transformersResult = await transformersService.analyzeSentiment(cleanedText);
    
    if (transformersResult.error) {
      // Tokenize and stem
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
      
      return {
        sentiment,
        score,
        method: 'afinn'
      };
    }
    
    return {
      sentiment: transformersResult.sentiment,
      score: transformersResult.score,
      method: 'transformers'
    };
  } catch (error) {
    logger.error(`Sentiment analysis error: ${error.message}`, { error, text });
    
    return {
      sentiment: 'neutral',
      score: 0,
      method: 'fallback',
      error: error.message
    };
  }
};

exports.processFeedback = async (feedback) => {
  try {
    const { text } = feedback;
    
    const sentimentResult = await this.analyzeSentiment(text);
    
    let issueResult = { issueType: null };
    if (sentimentResult.sentiment === 'negative') {
      issueResult = await transformersService.detectIssueType(text);
    }
    
    const hashtags = textProcessing.extractHashtags(text);
    const mentions = textProcessing.extractMentions(text);
    const keywords = textProcessing.extractKeywords(text);
    
    return {
      ...feedback,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      issueType: issueResult.issueType,
      metadata: {
        ...feedback.metadata,
        hashTags: hashtags,
        mentions,
        keywords
      },
      processed: true
    };
  } catch (error) {
    logger.error(`Feedback processing error: ${error.message}`, { error, feedback });
    

    return {
      ...feedback,
      sentiment: 'neutral',
      sentimentScore: 0,
      issueType: null,
      processed: false,
      processingError: error.message
    };
  }
};

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