import api from './api';

const eventService = {
  // Get all events with filters
  getEvents: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.owner) queryParams.append('owner', filters.owner);
      if (filters.organizer) queryParams.append('organizer', filters.organizer);
      if (filters.active !== undefined) queryParams.append('active', filters.active);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await api.get(`/events?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get single event by ID
  getEvent: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Toggle event active status
  toggleEventActive: async (eventId) => {
    try {
      const response = await api.put(`/events/${eventId}/toggle-active`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Add organizer to event
  addOrganizer: async (eventId, email) => {
    try {
      const response = await api.post(`/events/${eventId}/organizers`, { email });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Remove organizer from event
  removeOrganizer: async (eventId, organizerId) => {
    try {
      const response = await api.delete(`/events/${eventId}/organizers/${organizerId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update social tracking settings
  updateSocialTracking: async (eventId, trackingData) => {
    try {
      const response = await api.put(`/events/${eventId}/social-tracking`, trackingData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update alert settings
  updateAlertSettings: async (eventId, settingsData) => {
    try {
      const response = await api.put(`/events/${eventId}/alert-settings`, settingsData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Get location map
  getLocationMap: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/location-map`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Update location map
  updateLocationMap: async (eventId, mapData) => {
    try {
      const response = await api.put(`/events/${eventId}/location-map`, mapData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default eventService;