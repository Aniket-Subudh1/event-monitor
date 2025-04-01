const transformersService = require('./transformersService');
const natural = require('natural');
const logger = require('../../utils/logger');
const textProcessing = require('../../utils/textProcessing');

const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

exports.analyzeSentiment = async (text) => {
  try {
    if (!text || text.trim() === '') {
      return { sentiment: 'neutral', score: 0, method: 'default' };
    }
    
    const cleanedText = textProcessing.cleanText(text);
    
    if (cleanedText.length < 3) {
      return { sentiment: 'neutral', score: 0, method: 'short-text' };
    }
    
    // Try transformers-based analysis first
    const transformersResult = await transformersService.analyzeSentiment(cleanedText);
    
    if (!transformersResult.error) {
      return {
        sentiment: transformersResult.sentiment,
        score: transformersResult.score,
        method: 'transformers'
      };
    }
    
    // Fallback to AFINN if transformers fail
    const tokens = textProcessing.tokenize(cleanedText);
    const filteredTokens = textProcessing.removeStopwords(tokens);
    
    // Extract hashtags and consider them in sentiment
    const hashtags = textProcessing.extractHashtags(text);
    const hashtagBoost = hashtags.reduce((acc, tag) => {
      const lowerTag = tag.toLowerCase();
      if (positiveHashtags.includes(lowerTag)) return acc + 0.3;
      if (negativeHashtags.includes(lowerTag)) return acc - 0.3;
      return acc;
    }, 0);
    
    const afinnScore = analyzer.getSentiment(filteredTokens) + hashtagBoost;
    
    let sentiment, score;
    // Adjusted thresholds for social media text
    if (afinnScore > 0.1) {
      sentiment = 'positive';
      score = Math.min(afinnScore / 2, 1); // Adjusted scaling
    } else if (afinnScore < -0.1) {
      sentiment = 'negative';
      score = Math.max(afinnScore / 2, -1); // Adjusted scaling
    } else {
      sentiment = 'neutral';
      score = afinnScore;
    }
    
    return {
      sentiment,
      score,
      method: 'afinn'
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

// Simple hashtag sentiment dictionary (expand as needed)
const positiveHashtags = ['awesome', 'great', 'love', 'amazing', 'happy', 'best'];
const negativeHashtags = ['terrible', 'bad', 'hate', 'awful', 'worst', 'fail'];

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
        keywords,
        analysisMethod: sentimentResult.method // Add method for debugging
      },
      processed: true
    };
  } catch (error) {
    logger.error(`Feedback processing error: ${error.message}`, { 
      error, 
      feedback: { text: feedback.text, source: feedback.source, sourceId: feedback.sourceId } 
    });
    
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
    
    // Log summary for batch processing
    const summary = {
      total: processedItems.length,
      positive: processedItems.filter(item => item.sentiment === 'positive').length,
      negative: processedItems.filter(item => item.sentiment === 'negative').length,
      neutral: processedItems.filter(item => item.sentiment === 'neutral').length,
      errors: processedItems.filter(item => item.processingError).length
    };
    logger.info('Batch processing completed', { summary });
    
    return processedItems;
  } catch (error) {
    logger.error(`Batch processing error: ${error.message}`, { error, itemCount: feedbackItems.length });
    throw error;
  }
};