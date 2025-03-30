import api from './api';

const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback/submit', feedbackData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get feedback for an event with filters
  getEventFeedback: async (eventId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.sentiment) queryParams.append('sentiment', filters.sentiment);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.issueType) queryParams.append('issueType', filters.issueType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await api.get(`/feedback/event/${eventId}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get feedback statistics for an event
  getEventFeedbackStats: async (eventId) => {
    try {
      const response = await api.get(`/feedback/event/${eventId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get sentiment breakdown
  getSentimentBreakdown: async (eventId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);
      
      const response = await api.get(`/feedback/event/${eventId}/sentiment?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get issue breakdown
  getIssueBreakdown: async (eventId) => {
    try {
      const response = await api.get(`/feedback/event/${eventId}/issues`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get feedback breakdown by source
  getFeedbackBySource: async (eventId) => {
    try {
      const response = await api.get(`/feedback/event/${eventId}/by-source`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get single feedback by ID
  getFeedback: async (feedbackId) => {
    try {
      const response = await api.get(`/feedback/${feedbackId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update feedback
  updateFeedback: async (feedbackId, feedbackData) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}`, feedbackData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    try {
      const response = await api.delete(`/feedback/${feedbackId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Batch process multiple feedback items
  batchProcessFeedback: async (feedbackIds, updates) => {
    try {
      const response = await api.post('/feedback/batch-process', {
        feedbackIds,
        updates
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default feedbackService;