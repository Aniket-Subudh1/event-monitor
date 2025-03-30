import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import eventService from '../services/eventService';
import AuthContext from './AuthContext';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const { eventId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [currentEvent, setCurrentEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({
    owner: 'me',
    active: true,
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

  // Load event data if eventId is present in URL
  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
  }, [eventId]);

  // Load events based on filters
  useEffect(() => {
    loadEvents(currentFilter);
  }, [currentFilter]);

  // Load single event
  const loadEvent = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.getEvent(id);
      setCurrentEvent(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to load event:', err);
      setError(err.response?.data?.message || 'Failed to load event data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load multiple events with filters
  const loadEvents = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.getEvents(filters);
      setEvents(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
      return response.data;
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create new event
  const createEvent = async (eventData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.createEvent(eventData);
      
      // Update events list
      setEvents(prevEvents => [response.data, ...prevEvents]);
      
      return response.data;
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err.response?.data?.message || 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update event
  const updateEvent = async (id, eventData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.updateEvent(id, eventData);
      
      // Update current event if it's the one being edited
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(response.data);
      }
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === id ? response.data : event
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Failed to update event:', err);
      setError(err.response?.data?.message || 'Failed to update event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      await eventService.deleteEvent(id);
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.filter(event => event._id !== id)
      );
      
      // Clear current event if it's the one being deleted
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(null);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err.response?.data?.message || 'Failed to delete event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle event active status
  const toggleEventActive = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.toggleEventActive(id);
      
      // Update current event if it's the one being toggled
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(prev => ({
          ...prev,
          isActive: response.data.isActive
        }));
      }
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === id ? { ...event, isActive: response.data.isActive } : event
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Failed to toggle event status:', err);
      setError(err.response?.data?.message || 'Failed to toggle event status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add organizer to event
  const addOrganizer = async (id, email) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.addOrganizer(id, email);
      
      // Update current event if it's the one being modified
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(response.data);
      }
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === id ? response.data : event
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Failed to add organizer:', err);
      setError(err.response?.data?.message || 'Failed to add organizer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove organizer from event
  const removeOrganizer = async (id, organizerId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.removeOrganizer(id, organizerId);
      
      // Update current event if it's the one being modified
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(response.data);
      }
      
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === id ? response.data : event
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Failed to remove organizer:', err);
      setError(err.response?.data?.message || 'Failed to remove organizer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update social tracking settings
  const updateSocialTracking = async (id, trackingData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.updateSocialTracking(id, trackingData);
      
      // Update current event if it's the one being modified
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(prev => ({
          ...prev,
          socialTracking: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to update social tracking:', err);
      setError(err.response?.data?.message || 'Failed to update social tracking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update alert settings
  const updateAlertSettings = async (id, settingsData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.updateAlertSettings(id, settingsData);
      
      // Update current event if it's the one being modified
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(prev => ({
          ...prev,
          alertSettings: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to update alert settings:', err);
      setError(err.response?.data?.message || 'Failed to update alert settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get location map for event
  const getLocationMap = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.getLocationMap(id);
      return response.data;
    } catch (err) {
      console.error('Failed to load location map:', err);
      setError(err.response?.data?.message || 'Failed to load location map');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update location map for event
  const updateLocationMap = async (id, mapData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.updateLocationMap(id, mapData);
      
      // Update current event if it's the one being modified
      if (currentEvent && currentEvent._id === id) {
        setCurrentEvent(prev => ({
          ...prev,
          locationMap: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to update location map:', err);
      setError(err.response?.data?.message || 'Failed to update location map');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Change events filter
  const changeFilter = (newFilter) => {
    setCurrentFilter(prev => ({
      ...prev,
      ...newFilter,
      page: newFilter.page || 1 // Reset to first page when filters change
    }));
  };

  // Check if user is authorized for this event
  const isAuthorized = (eventData = currentEvent) => {
    if (!eventData || !user) return false;
    
    if (user.role === 'admin') return true;
    if (user.id === eventData.owner) return true;
    return eventData.organizers?.some(org => org === user.id);
  };

  const value = {
    currentEvent,
    events,
    isLoading,
    error,
    pagination,
    filter: currentFilter,
    loadEvent,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventActive,
    addOrganizer,
    removeOrganizer,
    updateSocialTracking,
    updateAlertSettings,
    getLocationMap,
    updateLocationMap,
    changeFilter,
    isAuthorized
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export default EventContext;