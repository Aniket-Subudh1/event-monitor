import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import alertService from '../services/alertService';
import SocketContext from './SocketContext';
import EventContext from './EventContext';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const { eventId, alertId } = useParams();
  const { socket, isConnected } = useContext(SocketContext);
  const { currentEvent } = useContext(EventContext);
  
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertCounts, setAlertCounts] = useState({
    total: 0,
    active: 0,
    new: 0,
    acknowledged: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    high: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({
    status: ['new', 'acknowledged', 'inProgress'],
    severity: [],
    type: [],
    category: [],
    sort: 'desc',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Load alert data if alertId is present in URL
  useEffect(() => {
    if (alertId) {
      loadAlert(alertId);
    }
  }, [alertId]);

  // Load alerts when event ID changes or filter changes
  useEffect(() => {
    if (eventId) {
      loadAlerts(eventId, currentFilter);
      loadAlertCounts(eventId);
    }
  }, [eventId, currentFilter]);

  // Socket event subscriptions
  useEffect(() => {
    if (socket && isConnected && eventId) {
      // Subscribe to alert updates for this event
      socket.emit('subscribe-alerts', { eventId });
      
      // Listen for new alerts
      socket.on('new-alert', handleNewAlert);
      
      // Listen for alert updates
      socket.on('alert-updated', handleAlertUpdate);
      
      // Clean up socket listeners when unmounting
      return () => {
        socket.off('new-alert', handleNewAlert);
        socket.off('alert-updated', handleAlertUpdate);
      };
    }
  }, [socket, isConnected, eventId]);

  // Socket event handlers
  const handleNewAlert = (alert) => {
    if (alert.event === eventId) {
      // Add new alert to the list
      setAlerts(prevAlerts => [alert, ...prevAlerts]);
      
      // Update alert counts
      setAlertCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
        new: prev.new + 1,
        [alert.severity]: prev[alert.severity] + 1
      }));
      
      // Notify of new alert if needed (can be implemented with a toast notification)
    }
  };

  // Change alerts filter
  const changeFilter = (newFilter) => {
    setCurrentFilter(prev => ({
      ...prev,
      ...newFilter,
      page: newFilter.page || 1 // Reset to first page when filters change
    }));
  };

  // Get alerts by severity
  const getAlertsBySeverity = async (severity) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.getAlertsBySeverity(severity);
      return response.data;
    } catch (err) {
      console.error(`Failed to load ${severity} alerts:`, err);
      setError(err.response?.data?.message || `Failed to load ${severity} alerts`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    alerts,
    currentAlert,
    alertCounts,
    isLoading,
    error,
    pagination,
    filter: currentFilter,
    loadAlert,
    loadAlerts,
    loadAlertCounts,
    updateAlertStatus,
    assignAlert,
    addAlertNote,
    createAlert,
    updateAlert,
    deleteAlert,
    getAlertTypes,
    resolveMultipleAlerts,
    changeFilter,
    getAlertsBySeverity
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

const handleAlertUpdate = (updatedAlert) => {
    if (updatedAlert.event === eventId) {
      // Update in alerts list
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === updatedAlert._id ? updatedAlert : alert
        )
      );
      
      // Update current alert if it's the one being updated
      if (currentAlert && currentAlert._id === updatedAlert._id) {
        setCurrentAlert(updatedAlert);
      }
      
      // Refresh alert counts since status may have changed
      loadAlertCounts(eventId);
    }
  };

  // Load single alert
  const loadAlert = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.getAlert(id);
      setCurrentAlert(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to load alert:', err);
      setError(err.response?.data?.message || 'Failed to load alert data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load alerts for an event with filters
  const loadAlerts = async (eventId, filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.getEventAlerts(eventId, filters);
      setAlerts(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
      return response.data;
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError(err.response?.data?.message || 'Failed to load alerts');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load alert counts for an event
  const loadAlertCounts = async (eventId) => {
    try {
      const response = await alertService.getAlertCounts(eventId);
      setAlertCounts(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to load alert counts:', err);
      return null;
    }
  };

  // Update alert status
  const updateAlertStatus = async (alertId, status, note) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.updateAlertStatus(alertId, status, note);
      
      // Update in alerts list
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId ? response.data : alert
        )
      );
      
      // Update current alert if it's the one being updated
      if (currentAlert && currentAlert._id === alertId) {
        setCurrentAlert(response.data);
      }
      
      // Refresh alert counts since status changed
      if (eventId) {
        loadAlertCounts(eventId);
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to update alert status:', err);
      setError(err.response?.data?.message || 'Failed to update alert status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign alert to user
  const assignAlert = async (alertId, userId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.assignAlert(alertId, userId);
      
      // Update in alerts list
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId ? response.data : alert
        )
      );
      
      // Update current alert if it's the one being assigned
      if (currentAlert && currentAlert._id === alertId) {
        setCurrentAlert(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to assign alert:', err);
      setError(err.response?.data?.message || 'Failed to assign alert');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add note to alert
  const addAlertNote = async (alertId, note) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.addAlertNote(alertId, note);
      
      // Update current alert if it's the one being modified
      if (currentAlert && currentAlert._id === alertId) {
        setCurrentAlert(prev => ({
          ...prev,
          statusUpdates: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to add alert note:', err);
      setError(err.response?.data?.message || 'Failed to add alert note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create new alert
  const createAlert = async (alertData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.createAlert({
        ...alertData,
        event: alertData.event || eventId
      });
      
      // Add to alerts list
      setAlerts(prevAlerts => [response.data, ...prevAlerts]);
      
      // Refresh alert counts
      if (eventId) {
        loadAlertCounts(eventId);
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to create alert:', err);
      setError(err.response?.data?.message || 'Failed to create alert');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update alert
  const updateAlert = async (alertId, alertData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.updateAlert(alertId, alertData);
      
      // Update in alerts list
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId ? response.data : alert
        )
      );
      
      // Update current alert if it's the one being updated
      if (currentAlert && currentAlert._id === alertId) {
        setCurrentAlert(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to update alert:', err);
      setError(err.response?.data?.message || 'Failed to update alert');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete alert
  const deleteAlert = async (alertId) => {
    try {
      setIsLoading(true);
      setError(null);
      await alertService.deleteAlert(alertId);
      
      // Remove from alerts list
      setAlerts(prevAlerts => 
        prevAlerts.filter(alert => alert._id !== alertId)
      );
      
      // Clear current alert if it's the one being deleted
      if (currentAlert && currentAlert._id === alertId) {
        setCurrentAlert(null);
      }
      
      // Refresh alert counts
      if (eventId) {
        loadAlertCounts(eventId);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete alert:', err);
      setError(err.response?.data?.message || 'Failed to delete alert');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get alert type metadata (types, categories, severities)
  const getAlertTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.getAlertTypes();
      return response.data;
    } catch (err) {
      console.error('Failed to load alert types:', err);
      setError(err.response?.data?.message || 'Failed to load alert types');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve multiple alerts in bulk
  const resolveMultipleAlerts = async (alertIds, note) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await alertService.resolveMultipleAlerts(alertIds, note);
      
      // Update alerts in the list
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alertIds.includes(alert._id) 
            ? { ...alert, status: 'resolved', resolvedAt: new Date() } 
            : alert
        )
      );
      
      // Update current alert if it's one of the resolved alerts
      if (currentAlert && alertIds.includes(currentAlert._id)) {
        setCurrentAlert(prev => ({
          ...prev,
          status: 'resolved',
          resolvedAt: new Date()
        }));
      }
      
      // Refresh alert counts
      if (eventId) {
        loadAlertCounts(eventId);
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to resolve alerts:', err);
      setError(err.response?.data?.message || 'Failed to resolve alerts');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  export default AlertContext;