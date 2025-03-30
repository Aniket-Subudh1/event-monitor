const axios = require('axios');
const Event = require('../../models/Event');
const Feedback = require('../../models/Feedback');
const sentimentAnalyzer = require('../nlp/sentimentAnalyzer');
const logger = require('../../utils/logger');

let instagramAccessToken = {
  token: process.env.INSTAGRAM_ACCESS_TOKEN,
  expiresAt: null
};

const activePolls = new Map();

const getInstagramClient = async () => {
  if (!instagramAccessToken.token) {
    throw new Error('Instagram access token not configured');
  }
  
  if (instagramAccessToken.expiresAt && new Date() >= instagramAccessToken.expiresAt) {
    await refreshAccessToken();
  }
  
  return {
    baseURL: 'https://graph.instagram.com/v12.0',
    headers: {
      'Authorization': `Bearer ${instagramAccessToken.token}`
    }
  };
};


const refreshAccessToken = async () => {
  try {
   
    logger.info('Would refresh Instagram access token here');
    
    instagramAccessToken.expiresAt = new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)); // 60 days
    
    return {
      success: true,
      expiresAt: instagramAccessToken.expiresAt
    };
  } catch (error) {
    logger.error(`Refresh Instagram token error: ${error.message}`, { error });
    throw error;
  }
};


exports.startEventPolling = async (eventId) => {
  try {
    if (activePolls.has(eventId)) {
      return {
        success: true,
        message: 'Instagram polling already active',
        isActive: true
      };
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }
    
    const trackingHashtags = event.socialTracking.hashtags
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.substring(1)); 
    
    if (trackingHashtags.length === 0) {
      throw new Error('No Instagram hashtags configured for event');
    }
    
  
    const pollInterval = setInterval(async () => {
      try {
        await pollInstagramHashtags(trackingHashtags, eventId);
      } catch (error) {
        logger.error(`Instagram poll error: ${error.message}`, { error });
      }
    }, 5 * 60 * 1000); 
    
    activePolls.set(eventId, {
      pollInterval,
      hashtags: trackingHashtags,
      startTime: new Date(),
      lastPollTime: null,
      lastResults: null
    });
    
    await pollInstagramHashtags(trackingHashtags, eventId);
    
    return {
      success: true,
      message: 'Instagram polling started successfully',
      isActive: true,
      trackingHashtags
    };
  } catch (error) {
    logger.error(`Start Instagram polling error: ${error.message}`, { error, eventId });
    
    if (activePolls.has(eventId)) {
      const activePoll = activePolls.get(eventId);
      if (activePoll.pollInterval) {
        clearInterval(activePoll.pollInterval);
      }
      activePolls.delete(eventId);
    }
    
    throw error;
  }
};


exports.stopEventPolling = async (eventId) => {
  try {
    if (!activePolls.has(eventId)) {
      return {
        success: true,
        message: 'No active Instagram polling found',
        isActive: false
      };
    }
    
    const activePoll = activePolls.get(eventId);
    
    clearInterval(activePoll.pollInterval);
    
    activePolls.delete(eventId);
    
    return {
      success: true,
      message: 'Instagram polling stopped successfully',
      isActive: false,
      runtime: getPollRuntime(activePoll.startTime)
    };
  } catch (error) {
    logger.error(`Stop Instagram polling error: ${error.message}`, { error, eventId });
    throw error;
  }
};

const pollInstagramHashtags = async (hashtags, eventId) => {
  try {
 
    logger.info(`Polling Instagram hashtags: ${hashtags.join(', ')}`);
    
    if (activePolls.has(eventId)) {
      activePolls.get(eventId).lastPollTime = new Date();
    }
    
    const mockPosts = generateMockInstagramPosts(hashtags, 5);
    
    const processPromises = mockPosts.map(post => processInstagramPost(post, eventId));
    const results = await Promise.all(processPromises);
    
    if (activePolls.has(eventId)) {
      activePolls.get(eventId).lastResults = {
        count: results.filter(Boolean).length,
        timestamp: new Date()
      };
    }
    
    return results.filter(Boolean);
  } catch (error) {
    logger.error(`Poll Instagram hashtags error: ${error.message}`, { error, hashtags });
    throw error;
  }
};

const processInstagramPost = async (post, eventId) => {
  try {
    const existingFeedback = await Feedback.findOne({
      event: eventId,
      source: 'instagram',
      sourceId: post.id
    });
    
    if (existingFeedback) {
      logger.debug(`Instagram post already processed: ${post.id}`);
      return existingFeedback;
    }
    
    const feedbackData = {
      event: eventId,
      source: 'instagram',
      sourceId: post.id,
      text: post.caption,
      metadata: {
        username: post.username,
        platform: 'instagram',
        profileUrl: post.userUrl,
        followerCount: post.userFollowers,
        mediaUrls: [post.mediaUrl],
        hashTags: post.hashtags,
        mentions: post.mentions
      }
    };
    
    const processedFeedback = await sentimentAnalyzer.processFeedback(feedbackData);
    const feedback = await Feedback.create(processedFeedback);
    
    logger.info(`Processed Instagram post as feedback: ${feedback._id}`, { 
      postId: post.id, 
      sentiment: feedback.sentiment,
      issueType: feedback.issueType
    });
    
    return feedback;
  } catch (error) {
    logger.error(`Process Instagram post error: ${error.message}`, { error, postId: post.id });
    return null;
  }
};

const generateMockInstagramPosts = (hashtags, count = 5) => {
  const posts = [];
  
  const sentiments = [
    'Loving the event! Best speakers ever! #awesome',
    'Great session but the room is too crowded #needbiggerspace',
    'Audio issues in the main hall making it hard to hear #fixit',
    'Perfect organization and amazing food #impressed',
    'Line for registration is way too long #frustrated',
    'The presentations are brilliant but it\'s freezing in here #cold',
    'Networking opportunities have been fantastic #connections',
    'Can\'t see the slides from the back of the room #projectorissues',
    'Wifi keeps dropping, hard to share content #techproblems',
    'Amazing keynote speech, totally worth attending #inspired'
  ];
  
  for (let i = 0; i < count; i++) {
    const randomHashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    posts.push({
      id: `mock_ig_${Date.now()}_${i}`,
      caption: `${randomSentiment} #${randomHashtag}`,
      username: `user${Math.floor(Math.random() * 1000)}`,
      userUrl: 'https://instagram.com/user',
      userFollowers: Math.floor(Math.random() * 5000),
      mediaUrl: 'https://example.com/mock-image.jpg',
      hashtags: [randomHashtag, ...randomSentiment.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []],
      mentions: [],
      createdAt: new Date()
    });
  }
  
  return posts;
};

exports.getPollStatus = (eventId) => {
  try {
    const isActive = activePolls.has(eventId);
    
    if (!isActive) {
      return {
        isActive: false,
        message: 'No active Instagram polling'
      };
    }
    
    const activePoll = activePolls.get(eventId);
    
    return {
      isActive: true,
      startTime: activePoll.startTime,
      runtime: getPollRuntime(activePoll.startTime),
      lastPollTime: activePoll.lastPollTime,
      hashtags: activePoll.hashtags,
      lastResults: activePoll.lastResults,
      message: 'Instagram polling is active'
    };
  } catch (error) {
    logger.error(`Get Instagram poll status error: ${error.message}`, { error, eventId });
    return {
      isActive: false,
      error: error.message
    };
  }
};

const getPollRuntime = (startTime) => {
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