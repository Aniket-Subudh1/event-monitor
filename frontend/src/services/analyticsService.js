import api from './api';

const analyticsService = {
  // Get sentiment trend data
  getSentimentTrend: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.timeframe) queryParams.append('timeframe', params.timeframe);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/analytics/sentiment/trend/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get sentiment overview
  getSentimentOverview: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startTime) queryParams.append('startTime', params.startTime);
      if (params.endTime) queryParams.append('endTime', params.endTime);
      
      const response = await api.get(`/analytics/sentiment/overview/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get issue trend data
  getIssueTrend: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.timeframe) queryParams.append('timeframe', params.timeframe);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/analytics/issues/trend/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get source distribution
  getSourceDistribution: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startTime) queryParams.append('startTime', params.startTime);
      if (params.endTime) queryParams.append('endTime', params.endTime);
      
      const response = await api.get(`/analytics/sources/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get trending topics
  getTrendingTopics: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.timeWindow) queryParams.append('timeWindow', params.timeWindow);
      if (params.minMentions) queryParams.append('minMentions', params.minMentions);
      if (params.maxTopics) queryParams.append('maxTopics', params.maxTopics);
      
      const response = await api.get(`/analytics/trending/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get location heatmap
  getLocationHeatmap: async (eventId) => {
    try {
      const response = await api.get(`/analytics/location/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get alert history
  getAlertHistory: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startTime) queryParams.append('startTime', params.startTime);
      if (params.endTime) queryParams.append('endTime', params.endTime);
      
      const response = await api.get(`/analytics/alerts/history/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get event summary
  getEventSummary: async (eventId) => {
    try {
      const response = await api.get(`/analytics/summary/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get dashboard data
  getDashboardData: async (eventId) => {
    try {
      const response = await api.get(`/analytics/dashboard/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get feedback volume
  getFeedbackVolume: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.groupBy) queryParams.append('groupBy', params.groupBy);
      if (params.startTime) queryParams.append('startTime', params.startTime);
      if (params.endTime) queryParams.append('endTime', params.endTime);
      
      const response = await api.get(`/analytics/volume/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get resolution stats
  getResolutionStats: async (eventId) => {
    try {
      const response = await api.get(`/analytics/resolution/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Export analytics data
  exportAnalyticsData: async (eventId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.format) queryParams.append('format', params.format);
      if (params.includeAll !== undefined) queryParams.append('includeAll', params.includeAll);
      
      const response = await api.get(`/analytics/export/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get word cloud data
    getWordCloudData: async (eventId, params = {}) => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params.sentiment) queryParams.append('sentiment', params.sentiment);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.startTime) queryParams.append('startTime', params.startTime);
        if (params.endTime) queryParams.append('endTime', params.endTime);
        if (params.maxWords) queryParams.append('maxWords', params.maxWords);
        
        const response = await api.get(`/analytics/wordcloud/${eventId}?${queryParams.toString()}`);
        return response;
      } catch (error) {
        throw error;
      }
    }
  };
  
  export default analyticsService;