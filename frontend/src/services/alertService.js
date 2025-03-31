import api from './api';

const alertService = {
  /**
   * Get alerts for an event
   * @param {string} eventId - Event ID
   * @param {Object} params - Query parameters (status, type, severity, page, limit, etc.)
   * @returns {Promise} Promise object with alerts data
   */
  getEventAlerts: async (eventId, params = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for fetching alerts');
      }
      
      const response = await api.get(`/alerts/event/${eventId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error in getEventAlerts:', error);
      throw error.response?.data?.message || 'Failed to fetch alerts';
    }
  },
  
  /**
   * Get active alert count for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} Promise object with alert counts
   */
  getActiveAlertCount: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for fetching alert counts');
      }
      
      const response = await api.get(`/alerts/event/${eventId}/count`);
      return response.data.data;
    } catch (error) {
      console.error('Error in getActiveAlertCount:', error);
      throw error.response?.data?.message || 'Failed to fetch alert count';
    }
  },
  
  /**
   * Get alert by ID
   * @param {string} alertId - Alert ID
   * @returns {Promise} Promise object with alert data
   */
  getAlertById: async (alertId) => {
    try {
      const response = await api.get(`/alerts/${alertId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch alert';
    }
  },
  
  /**
   * Update alert status
   * @param {string} alertId - Alert ID
   * @param {string} status - New status ('new', 'acknowledged', 'inProgress', 'resolved', 'ignored')
   * @param {string} note - Optional status update note
   * @returns {Promise} Promise object with updated alert data
   */
  updateAlertStatus: async (alertId, status, note = '') => {
    try {
      const response = await api.put(`/alerts/${alertId}/status`, { status, note });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update alert status';
    }
  },
  
  /**
   * Assign alert to user
   * @param {string} alertId - Alert ID
   * @param {string} userId - User ID to assign to (or null to unassign)
   * @returns {Promise} Promise object with updated alert data
   */
  assignAlert: async (alertId, userId) => {
    try {
      const response = await api.put(`/alerts/${alertId}/assign`, { userId });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to assign alert';
    }
  },
  
  /**
   * Add note to alert
   * @param {string} alertId - Alert ID
   * @param {string} note - Note content
   * @returns {Promise} Promise object with alert status updates
   */
  addAlertNote: async (alertId, note) => {
    try {
      const response = await api.post(`/alerts/${alertId}/notes`, { note });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add alert note';
    }
  },
  
  /**
   * Create a new alert manually
   * @param {Object} alertData - Alert data
   * @returns {Promise} Promise object with created alert data
   */
  createAlert: async (alertData) => {
    try {
      if (!alertData.event) {
        throw new Error('Event ID is required for creating an alert');
      }
      
      const response = await api.post('/alerts', alertData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create alert';
    }
  },
  
  /**
   * Update alert
   * @param {string} alertId - Alert ID
   * @param {Object} updateData - Updated alert data
   * @returns {Promise} Promise object with updated alert data
   */
  updateAlert: async (alertId, updateData) => {
    try {
      const response = await api.put(`/alerts/${alertId}`, updateData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update alert';
    }
  },
  
  /**
   * Delete alert
   * @param {string} alertId - Alert ID
   * @returns {Promise} Promise object with success message
   */
  deleteAlert: async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      return true;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete alert';
    }
  },
  
  /**
   * Get alert types, categories, and severities
   * @returns {Promise} Promise object with alert metadata
   */
  getAlertTypes: async () => {
    try {
      const response = await api.get('/alerts/types');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch alert types';
    }
  },
  
  /**
   * Get alerts by severity
   * @param {string} severity - Alert severity level
   * @returns {Promise} Promise object with alerts data
   */
  getAlertsBySeverity: async (severity) => {
    try {
      const response = await api.get(`/alerts/severity/${severity}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch alerts by severity';
    }
  },
  
  /**
   * Resolve multiple alerts
   * @param {Array} alertIds - Array of alert IDs to resolve
   * @param {string} note - Optional resolution note
   * @returns {Promise} Promise object with bulk resolution result
   */
  resolveMultipleAlerts: async (alertIds, note = '') => {
    try {
      const response = await api.post('/alerts/resolve-multiple', {
        alertIds,
        note
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to resolve alerts';
    }
  }
};

export default alertService;