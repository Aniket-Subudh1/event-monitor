const { TwitterApi } = require('twitter-api-v2');
const Event = require('../../models/Event');
const Feedback = require('../../models/Feedback');
const axios = require('axios');
const socketHandler = require('../realtime/socketHandler');
const logger = require('../../utils/logger');

let activeStreams = new Map();

const getTwitterClient = () => {
  const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} not configured in environment variables`);
    }
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
};

// const fetchSentimentFromWeb = async (texts) => {
//   try {
//     if (!process.env.SENTIMENT_API_URL) {
//       throw new Error('SENTIMENT_API_URL not configured in environment variables');
//     }
    
//     const response = await axios.post(process.env.SENTIMENT_API_URL, {
//       texts: texts
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': process.env.SENTIMENT_API_KEY ? `Bearer ${process.env.SENTIMENT_API_KEY}` : undefined
//       }
//     });
//     return response.data;
//   } catch (error) {
//     logger.error(`Sentiment API error: ${error.message}`, { error });
//     throw error;
//   }
// };



// exports.searchTweets = async (eventId) => {
//   try {
//     console.log(`Searching tweets for event: ${eventId}`);
//     const event = await Event.findById(eventId);
//     if (!event || !event.socialTracking.hashtags.length) {
//       throw new Error('Event not found or no hashtags configured');
//     }

//     const client = getTwitterClient();
//     const query = event.socialTracking.hashtags.join(' OR ');
//     console.log(`Using query: ${query}`);

//     const response = await client.v2.search(query, {
//       'tweet.fields': ['text', 'created_at'],
//       max_results: 10
//     });

//     console.log(`Found ${response.data.data.length} tweets`);
//     return {
//       query,
//       totalPosts: response.data.data.length,
//       detailed: response.data.data.map(tweet => ({ text: tweet.text }))
//     };
//   } catch (error) {
//     logger.error(`Search tweets error: ${error.message}`, { error, eventId });
//     throw error;
//   }
// };


const calculateMockScore = (text) => {
  if (text.toLowerCase().includes('hate') || text.toLowerCase().includes('disrespect')) return -5;
  if (text.toLowerCase().includes('amazing') || text.toLowerCase().includes('king')) return 2;
  if (text.toLowerCase().includes('happy') || text.toLowerCase().includes('great')) return 3;
  if (text.toLowerCase().includes('love')) return 5;
  return 0;
};

const mapScoreToEmotion = (score) => {
  if (score <= -5) return 'angry';
  if (score > 0 && score <= 2) return 'positive';
  if (score > 2) return 'happy';
  return 'neutral';
};



exports.searchTweets = async (eventId, query) => {
  try {
    console.log(`Searching tweets for event: ${eventId}`);
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.socialTracking || !event.socialTracking.hashtags || !event.socialTracking.hashtags.length) {
      throw new Error('No hashtags configured for the event');
    }
    // Use provided query or fall back to event hashtags
    const searchQuery = query && typeof query === 'string'
      ? query
      : event.socialTracking.hashtags.length
        ? event.socialTracking.hashtags.join(' OR ')
        : null;


    const client = getTwitterClient();
    console.log(`Using query: ${searchQuery}`);

    const response = await client.v2.search(searchQuery, {
      'tweet.fields': ['text', 'created_at', 'author_id', 'public_metrics'],
      'user.fields': ['username'],
      'expansions': ['author_id'],
      max_results: 20
    });

    const tweets = response.data.data || [];
    console.log(`Found ${tweets.length} tweets`);

    const detailed = tweets.map(tweet => {
      const score = calculateMockScore(tweet.text);
      const emotion = mapScoreToEmotion(score);
      return {
        text: tweet.text,
        score,
        emotion
      };
    });

    const summary = {
      neutral: detailed.filter(d => d.emotion === 'neutral').length,
      angry: detailed.filter(d => d.emotion === 'angry').length,
      positive: detailed.filter(d => d.emotion === 'positive').length,
      happy: detailed.filter(d => d.emotion === 'happy').length
    };

    const feedbackPromises = detailed.map(async (entry) => {
      const tweet = tweets.find(t => t.text === entry.text);
      const user = response.data.includes.users.find(u => u.id === tweet.author_id);
      const feedback = {
        event: eventId,
        source: 'twitter',
        sourceId: tweet.id,
        text: entry.text,
        sentiment: entry.score,
        metadata: {
          username: user?.username,
          emotion: entry.emotion,
          hashtag: searchQuery,
          createdAt: tweet.created_at,
          publicMetrics: tweet.public_metrics
        }
      };
      return Feedback.findOneAndUpdate(
        { sourceId: tweet.id, event: eventId },
        feedback,
        { upsert: true, new: true }
      );
    });

    await Promise.all(feedbackPromises);

    return {
      query: searchQuery,
      totalPosts: tweets.length,
      summary,
      detailed
    };
  } catch (error) {
    logger.error(`Search tweets error: ${error.message}`, { error, eventId });
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset ? new Date(error.rateLimit.reset * 1000).toLocaleString() : 'unknown';
      return {
        success: false,
        message: `Rate limit exceeded. Try again after ${resetTime}`,
        error: 'Request failed with code 429'
      };
    }
    throw error;
  }
};

const processTweet = async (tweetData, eventId) => {
  try {
    const tweet = tweetData.data;
    const user = tweetData.includes?.users?.find(u => u.id === tweet.author_id);
    const score = calculateMockScore(tweet.text);
    const emotion = mapScoreToEmotion(score);

    const feedback = {
      event: eventId,
      source: 'twitter',
      sourceId: tweet.id,
      text: tweet.text,
      sentiment: score,
      metadata: {
        username: user?.username,
        emotion,
        hashtag: (await Event.findById(eventId)).socialTracking.hashtags.find(h => tweet.text.includes(h)),
        createdAt: tweet.created_at,
        publicMetrics: tweet.public_metrics
      }
    };

    const savedFeedback = await Feedback.findOneAndUpdate(
      { sourceId: tweet.id, event: eventId },
      feedback,
      { upsert: true, new: true }
    );

    const io = global.io;
    if (io) {
      socketHandler.broadcastFeedback(io, savedFeedback);
    }

    return savedFeedback;
  } catch (error) {
    logger.error(`Process tweet error: ${error.message}`, { error, tweetId: tweetData?.data?.id });
    return null;
  }
};

exports.startEventStream = async (eventId) => {
  try {
    if (activeStreams.has(eventId)) {
      return { success: true, message: 'Stream already running', isActive: true };
    }

    const event = await Event.findById(eventId);
    if (!event || !event.socialTracking.hashtags.length) {
      throw new Error('Event not found or no hashtags configured');
    }

    const client = getTwitterClient();
    const streamClient = client.v2;
    const rules = event.socialTracking.hashtags.map(term => ({
      value: term,
      tag: `event:${eventId}`
    }));

    await streamClient.updateStreamRules({ delete: { ids: await getStreamRuleIds(streamClient) } });
    await streamClient.updateStreamRules({ add: rules });

    const stream = await streamClient.searchStream({
      'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'entities'],
      'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics'],
      'expansions': ['author_id']
    });

    activeStreams.set(eventId, { stream, rules, startTime: new Date() });

    stream.on('data', async (tweet) => {
      await processTweet(tweet, eventId);
    });

    stream.on('error', (error) => {
      logger.error(`Twitter stream error: ${error.message}`, { error, eventId });
    });

    return {
      success: true,
      message: 'Twitter stream started successfully',
      isActive: true,
      trackingTerms: event.socialTracking.hashtags
    };
  } catch (error) {
    logger.error(`Start Twitter stream error: ${error.message}`, { error, eventId });
    if (activeStreams.has(eventId)) {
      activeStreams.get(eventId).stream.destroy();
      activeStreams.delete(eventId);
    }
    throw error;
  }
};

exports.stopEventStream = async (eventId) => {
  try {
    if (!activeStreams.has(eventId)) {
      return { success: true, message: 'No active stream found', isActive: false };
    }

    const activeStream = activeStreams.get(eventId);
    activeStream.stream.destroy();
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
  return runtime < 60 ? `${runtime} seconds` :
         runtime < 3600 ? `${Math.floor(runtime / 60)} minutes` :
         `${Math.floor(runtime / 3600)} hours ${Math.floor((runtime % 3600) / 60)} minutes`;
};

exports.getStreamStatus = (eventId) => {
  try {
    const isActive = activeStreams.has(eventId);
    if (!isActive) return { isActive: false, message: 'No active stream' };
    
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
    return { isActive: false, error: error.message };
  }
};