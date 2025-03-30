import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  RefreshCw
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import EventContext from '../../context/EventContext';
import AlertContext from '../../context/AlertContext';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import { AppRoutes } from '../../routes';
import dateFormatter from '../../utils/dateFormatter';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { events, loadEvents, isLoading: eventsLoading } = useContext(EventContext);
  const { getAlertsBySeverity } = useContext(AlertContext);
  
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Load events and alerts
  useEffect(() => {
    const fetchData = async () => {
      await loadEvents({
        owner: 'me',
        sort: 'desc',
        limit: 10
      });
    };

    fetchData();
  }, [loadEvents]);

  // Fetch critical alerts
  useEffect(() => {
    const fetchCriticalAlerts = async () => {
      setAlertsLoading(true);
      try {
        const response = await getAlertsBySeverity('critical');
        setCriticalAlerts(response.data);
      } catch (error) {
        console.error('Error fetching critical alerts:', error);
      } finally {
        setAlertsLoading(false);
      }
    };

    if (events.length > 0) {
      fetchCriticalAlerts();
    }
  }, [events, getAlertsBySeverity]);

  // Filter and categorize events
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      
      // Recent events (ended in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      setRecentEvents(
        events
          .filter(event => new Date(event.endDate) < now && new Date(event.endDate) > thirtyDaysAgo)
          .slice(0, 3)
      );
      
      // Upcoming events (starting in future)
      setUpcomingEvents(
        events
          .filter(event => new Date(event.startDate) > now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3)
      );
      
      // Active events (currently running)
      setActiveEvents(
        events
          .filter(
            event => 
              new Date(event.startDate) <= now && 
              new Date(event.endDate) >= now &&
              event.isActive
          )
          .slice(0, 3)
      );
    }
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          as={Link}
          to={AppRoutes.EVENT_SETUP}
          icon={<Plus size={16} />}
        >
          New Event
        </Button>
      </div>

      {/* Welcome message */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Welcome back, {user?.name}!</h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your events today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline-gray"
              size="sm"
              onClick={() => loadEvents({ owner: 'me' })}
              icon={<RefreshCw size={16} />}
              loading={eventsLoading}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Active Events" 
          icon={<Calendar className="text-green-500" size={24} />}
          className="bg-green-50 border border-green-100"
        >
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {activeEvents.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Events currently running
            </p>
          </div>
        </Card>
        
        <Card 
          title="Critical Alerts" 
          icon={<AlertTriangle className="text-red-500" size={24} />}
          className="bg-red-50 border border-red-100"
        >
          <div className="mt-2">
            {alertsLoading ? (
              <Loader size="sm" />
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {criticalAlerts.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Requiring immediate attention
                </p>
              </>
            )}
          </div>
        </Card>
        
        <Card 
          title="Upcoming Events" 
          icon={<TrendingUp className="text-blue-500" size={24} />}
          className="bg-blue-50 border border-blue-100"
        >
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {upcomingEvents.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Events scheduled in the future
            </p>
          </div>
        </Card>
      </div>

      {/* Active Events Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Events</h2>
        {eventsLoading ? (
          <Loader />
        ) : activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => (
              <Card 
                key={event._id}
                title={event.name}
                subtitle={`${dateFormatter.formatDate(event.startDate)} - ${dateFormatter.formatDate(event.endDate)}`}
                hoverable
                bordered
                className="transition-all hover:shadow-md"
              >
                <p className="text-sm text-gray-500 mb-4">{event.location}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex justify-end">
                  <Button
                    as={Link}
                    to={AppRoutes.getEventDetailRoute(event._id)}
                    variant="primary"
                    size="sm"
                  >
                    View Event
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="default" className="bg-gray-50">
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active events</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any events currently running.
              </p>
              <div className="mt-6">
                <Button
                  as={Link}
                  to={AppRoutes.EVENT_SETUP}
                  variant="primary"
                  size="sm"
                  icon={<Plus size={16} />}
                >
                  Create a new event
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h2>
        {eventsLoading ? (
          <Loader />
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card 
                key={event._id}
                title={event.name}
                subtitle={`Starts ${dateFormatter.formatDate(event.startDate)}`}
                hoverable
                bordered
                className="transition-all hover:shadow-md"
              >
                <p className="text-sm text-gray-500 mb-4">{event.location}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex justify-end">
                  <Button
                    as={Link}
                    to={AppRoutes.getEventDetailRoute(event._id)}
                    variant="primary"
                    size="sm"
                  >
                    View Event
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="default" className="bg-gray-50">
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any scheduled events in the future.
              </p>
              <div className="mt-6">
                <Button
                  as={Link}
                  to={AppRoutes.EVENT_SETUP}
                  variant="primary"
                  size="sm"
                  icon={<Plus size={16} />}
                >
                  Create a new event
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Critical Alerts Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Critical Alerts</h2>
        {alertsLoading ? (
          <Loader />
        ) : criticalAlerts.length > 0 ? (
          <div className="space-y-4">
            {criticalAlerts.map((alert) => (
              <Card 
                key={alert._id}
                title={alert.title}
                subtitle={`${alert.event.name} - ${dateFormatter.formatRelative(alert.createdAt)}`}
                icon={<AlertTriangle className="text-red-500" size={20} />}
                className="border-l-4 border-l-red-500"
              >
                <p className="text-sm text-gray-500 mb-4">{alert.description}</p>
                <div className="flex justify-end">
                  <Button
                    as={Link}
                    to={AppRoutes.getAlertDetailRoute(alert.event._id, alert._id)}
                    variant="danger"
                    size="sm"
                  >
                    View Alert
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="default" className="bg-gray-50">
            <div className="text-center py-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No critical alerts</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any critical alerts requiring attention.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;