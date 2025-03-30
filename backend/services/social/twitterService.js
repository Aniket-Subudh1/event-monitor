const { TwitterApi } = require('twitter-api-v2');
const Event = require('../../models/Event');
const Feedback = require('../../models/Feedback');
const sentimentAnalyzer = require('../nlp/sentimentAnalyzer');
const logger = require('../../utils/logger');

const activeStreams = new Map();


const getTwitterClient = () => {
  if (!process.env.TWITTER_BEARER_TOKEN) {
    throw new Error('Twitter API keys not configured');
  }
  
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
  
  return client;
};

exports.startEventStream = async (eventId) => {
  try {
    if (activeStreams.has(eventId)) {
      return {
        success: true,
        message: 'Stream already running',
        isActive: true
      };
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }
    
    const trackingTerms = [
      ...event.socialTracking.hashtags,
      ...event.socialTracking.mentions,
      ...event.socialTracking.keywords
    ];
    
    if (trackingTerms.length === 0) {
      throw new Error('No tracking terms configured for event');
    }
    
    const client = getTwitterClient();
    
    const rules = trackingTerms.map(term => ({
      value: term,
      tag: `event:${eventId}`
    }));
    
    const streamClient = client.readOnly;
    
    await streamClient.v2.updateStreamRules({
      delete: { ids: await getStreamRuleIds(streamClient) }
    });
    
    await streamClient.v2.updateStreamRules({
      add: rules
    });
    
    logger.info(`Starting Twitter stream for event ${eventId} with rules:`, { rules });
    
    const stream = await streamClient.v2.searchStream({
      'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'entities'],
      'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics'],
      'expansions': ['author_id', 'referenced_tweets.id']
    });
    
    activeStreams.set(eventId, {
      stream,
      rules,
      startTime: new Date()
    });
    
    stream.on('data', async (tweet) => {
      try {
        await processTweet(tweet, eventId);
      } catch (error) {
        logger.error(`Error processing tweet: ${error.message}`, { error, tweet });
      }
    });
    
    stream.on('error', (error) => {
      logger.error(`Twitter stream error: ${error.message}`, { error, eventId });
    });
    
    return {
      success: true,
      message: 'Twitter stream started successfully',
      isActive: true,
      trackingTerms
    };
  } catch (error) {
    logger.error(`Start Twitter stream error: ${error.message}`, { error, eventId });
    
    if (activeStreams.has(eventId)) {
      const activeStream = activeStreams.get(eventId);
      if (activeStream.stream) {
        activeStream.stream.destroy();
      }
      activeStreams.delete(eventId);
    }
    
    throw error;
  }
};

exports.stopEventStream = async (eventId) => {
  try {
    if (!activeStreams.has(eventId)) {
      return {
        success: true,
        message: 'No active stream found',
        isActive: false
      };
    }
    
    const activeStream = activeStreams.get(eventId);
    
    activeStream.stream.destroy();
    
    try {
      const client = getTwitterClient();
      const streamClient = client.readOnly;
      await streamClient.v2.updateStreamRules({
        delete: { ids: await getStreamRuleIds(streamClient) }
      });
    } catch (cleanupError) {
      logger.warn(`Error cleaning up Twitter stream rules: ${cleanupError.message}`, { cleanupError });
    }
    
    activeStreams.delete(eventId);
    
    return {
      success: true,
      message: 'Twitter stream stopped successfully',
      isActive: false,
      runTime: getStreamRuntime(activeStream.startTime)
    };
  } catch (error) {
    logger.error(`Stop Twitter stream error: ${error.message}`, { error, eventId });
    throw error;
  }
};

exports.getStreamStatus = (eventId) => {
  try {
    const isActive = activeStreams.has(eventId);
    
    if (!isActive) {
      return {
        isActive: false,
        message: 'No active stream'
      };
    }
    
    const activeStream = activeStreams.get(eventId);
    
    return {
      isActive: true,
      startTime: activeStream.startTime,
      runTime: getStreamRuntime(activeStream.startTime),
      rules: activeStream.rules,
      message: 'Stream is active'
    };
  } catch (error) {
    logger.error(`Get stream status error: ${error.message}`, { error, eventId });
    return {
      isActive: false,
      error: error.message
    };
  }
};

const processTweet = async (tweetData, eventId) => {
  try {
    const tweet = tweetData.data;
    const user = tweetData.includes?.users?.[0];
    
    if (!tweet || !tweet.text) {
      logger.warn('Tweet missing critical data', { tweetData });
      return null;
    }
    
    const existingFeedback = await Feedback.findOne({
      event: eventId,
      source: 'twitter',
      sourceId: tweet.id
    });
    
    if (existingFeedback) {
      logger.debug(`Tweet already processed: ${tweet.id}`);
      return existingFeedback;
    }
    
    const feedbackData = {
      event: eventId,
      source: 'twitter',
      sourceId: tweet.id,
      text: tweet.text,
      metadata: {
        username: user?.username || 'unknown',
        platform: 'twitter',
        profileUrl: user ? `https://twitter.com/${user.username}` : null,
        followerCount: user?.public_metrics?.followers_count || 0,
        hashTags: tweet.entities?.hashtags?.map(h => h.tag) || [],
        mentions: tweet.entities?.mentions?.map(m => m.username) || []
      }
    };
    
    const processedFeedback = await sentimentAnalyzer.processFeedback(feedbackData);
    const feedback = await Feedback.create(processedFeedback);
    
    logger.info(`Processed tweet as feedback: ${feedback._id}`, { 
      tweetId: tweet.id, 
      sentiment: feedback.sentiment,
      issueType: feedback.issueType
    });
    
    return feedback;
  } catch (error) {
    logger.error(`Process tweet error: ${error.message}`, { error, tweetId: tweetData?.data?.id });
    return null;
  }
};

exports.searchTweets = async (searchParams) => {
  try {
    const { query, eventId, maxResults = 100 } = searchParams;
    
    if (!query) {
      throw new Error('Search query is required');
    }
    
    const client = getTwitterClient();
    
    const results = await client.v2.search(query, {
      'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'entities'],
      'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics'],
      'expansions': ['author_id'],
      'max_results': Math.min(maxResults, 100) 
    });
    
    if (eventId) {
      const processPromises = results.data.data.map(tweet => {
        const tweetData = {
          data: tweet,
          includes: {
            users: results.data.includes.users.filter(u => u.id === tweet.author_id)
          }
        };
        
        return processTweet(tweetData, eventId);
      });
      
      await Promise.all(processPromises);
    }
    
    return {
      success: true,
      results: results.data,
      meta: results.data.meta
    };
  } catch (error) {
    logger.error(`Search tweets error: ${error.message}`, { error, searchParams });
    throw error;
  }
};

const getStreamRuleIds = async (streamClient) => {
  try {
    const rules = await streamClient.v2.streamRules();
    return rules.data?.map(rule => rule.id) || [];
  } catch (error) {
    logger.error(`Get stream rule IDs error: ${error.message}`, { error });
    return [];
  }
};


const getStreamRuntime = (startTime) => {
  if (!startTime) return 'unknown';
  
  const runtime = Math.floor((new Date() - startTime) / 1000);
  
  if (runtime < 60) {
    return `${runtime} seconds`;
  } else if (runtime < 3600) {
    return `${Math.floor(runtime / 60)} minutes`;
  } else {
    const hours = Math.floor(runtime / 3600);
    const minutes = Math.floor((runtime % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
  }
};