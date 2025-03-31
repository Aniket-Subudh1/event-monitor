import React, { useState, useEffect, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { SocketContext } from '../context/SocketContext';
import eventService from '../services/eventService';
import analyticsService from '../services/analyticsService';


import SentimentOverview from '../components/dashboard/SentimentOverview';
import ActiveAlerts from '../components/dashboard/ActiveAlerts';
import FeedbackStream from '../components/dashboard/FeedbackStream';
import TrendingTopics from '../components/dashboard/TrendingTopics';
import SentimentChart from '../components/charts/SentimentChart';
import { Loader } from '../components/common/Loader';

// Icons
import { Calendar, Users, MessageCircle, Bell, Clock } from 'react-feather';

const Dashboard = () => {
  const { selectedEvent } = useContext(EventContext);
  const { socket } = useContext(SocketContext);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('day'); // 'hour', 'day', 'week'
  
  useEffect(() => {
    if (!selectedEvent) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardData(selectedEvent.id);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up socket listeners for real-time updates
    if (socket) {
      socket.emit('join-event', { eventId: selectedEvent.id });
      
      socket.on('new-feedback', (feedback) => {
        // Update feedback stream in real-time
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            feedback: {
              ...prev.feedback,
              latest: [feedback, ...prev.feedback.latest.slice(0, 4)],
              recent: prev.feedback.recent + 1
            }
          };
        });
      });
      
      socket.on('new-alert', (alert) => {
        // Update alerts in real-time
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            alerts: {
              ...prev.alerts,
              latest: [alert, ...prev.alerts.latest.slice(0, 4)],
              active: prev.alerts.active + 1
            }
          };
        });
      });
      
      return () => {
        socket.emit('leave-event', { eventId: selectedEvent.id });
        socket.off('new-feedback');
        socket.off('new-alert');
      };
    }
  }, [selectedEvent, socket]);
  
  if (!selectedEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl mb-4">Select an event to view dashboard</h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.href = '/events'}
        >
          Go to Events
        </button>
      </div>
    );
  }
  
  if (loading) {
    return <Loader size="lg" className="mt-10" />;
  }
  
  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg mt-4">
        <p className="text-lg font-semibold">{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!dashboardData) {
    return <div>No data available for this event.</div>;
  }
  
  return (
    <div className="p-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">{selectedEvent.name}</h1>
            <div className="flex items-center text-gray-500">
              <Calendar size={16} className="mr-2" />
              {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex space-x-2">
            <div className={`px-3 py-1 rounded-full text-white ${selectedEvent.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
              {selectedEvent.isActive ? 'Active' : 'Inactive'}
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Manage Event
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 mb-1">Active Alerts</p>
              <h3 className="text-2xl font-bold">{dashboardData.alerts.active}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Bell size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 mb-1">Recent Feedback</p>
              <h3 className="text-2xl font-bold">{dashboardData.feedback.recent}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 mb-1">Connected Users</p>
              <h3 className="text-2xl font-bold">{dashboardData.event.connectedUsers || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 mb-1">Time Remaining</p>
              <h3 className="text-2xl font-bold">{dashboardData.event.daysRemaining || '0'} days</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sentiment Overview */}
          <SentimentOverview 
            sentimentData={dashboardData.feedback.sentiment} 
            className="bg-white rounded-lg shadow p-6"
          />
          
          {/* Sentiment Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sentiment Timeline</h3>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 rounded ${timeframe === 'hour' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setTimeframe('hour')}
                >
                  Hourly
                </button>
                <button 
                  className={`px-3 py-1 rounded ${timeframe === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setTimeframe('day')}
                >
                  Daily
                </button>
                <button 
                  className={`px-3 py-1 rounded ${timeframe === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setTimeframe('week')}
                >
                  Weekly
                </button>
              </div>
            </div>
            <SentimentChart timeframe={timeframe} eventId={selectedEvent.id} height={300} />
          </div>
          
          {/* Trending Topics */}
          <TrendingTopics 
            topics={dashboardData.trends} 
            className="bg-white rounded-lg shadow p-6"
          />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <ActiveAlerts 
            alerts={dashboardData.alerts.latest} 
            className="bg-white rounded-lg shadow p-6"
          />
          
          {/* Live Feedback */}
          <FeedbackStream 
            feedback={dashboardData.feedback.latest} 
            className="bg-white rounded-lg shadow p-6"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;