import api from './api';

const integrationService = {

  connectTwitter: async () => {
    try {
      const response = await api.post('/integrations/twitter/connect');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  disconnectTwitter: async () => {
    try {
      const response = await api.delete('/integrations/twitter/disconnect');
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getTwitterStatus: async () => {
    try {
      const response = await api.get('/integrations/twitter/status');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  startTwitterStream: async (eventId) => {
    try {
      const response = await api.post(`/integrations/twitter/stream/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  stopTwitterStream: async (eventId) => {
    try {
      const response = await api.delete(`/integrations/twitter/stream/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  
  connectInstagram: async () => {
    try {
      const response = await api.post('/integrations/instagram/connect');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  disconnectInstagram: async () => {
    try {
      const response = await api.delete('/integrations/instagram/disconnect');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  getInstagramStatus: async () => {
    try {
      const response = await api.get('/integrations/instagram/status');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  configureInstagramHashtags: async (eventId, hashtags) => {
    try {
      const response = await api.post(`/integrations/instagram/hashtags/${eventId}`, {
        hashtags
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  connectLinkedIn: async () => {
    try {
      const response = await api.post('/integrations/linkedin/connect');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  disconnectLinkedIn: async () => {
    try {
      const response = await api.delete('/integrations/linkedin/disconnect');
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  getLinkedInStatus: async () => {
    try {
      const response = await api.get('/integrations/linkedin/status');
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  configureLinkedInCompany: async (eventId, companyData) => {
    try {
      const response = await api.post(`/integrations/linkedin/company/${eventId}`, companyData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getIntegrationSettings: async (eventId) => {
    try {
      const response = await api.get(`/integrations/settings/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  updateIntegrationSettings: async (eventId, settingsData) => {
    try {
      const response = await api.put(`/integrations/settings/${eventId}`, settingsData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  

  testIntegration: async (platform, eventId) => {
    try {
      const response = await api.post(`/integrations/test/${platform}`, {
        eventId
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default integrationService;