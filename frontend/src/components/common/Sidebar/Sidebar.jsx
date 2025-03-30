import React, { useState, useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AppRoutes } from '../../../routes';
import EventContext from '../../../context/EventContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { eventId } = useParams();
  const { currentEvent } = useContext(EventContext);
  
  // Determine active section and subsection from URL
  const [activeSection, setActiveSection] = useState(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/events') && !eventId) return 'events';
    if (path.includes('/feedback')) return 'feedback';
    if (path.includes('/alerts')) return 'alerts';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/settings')) return 'settings';
    
    return '';
  });

  // Navigation items grouped by section
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          className="text-gray-400 group-hover:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: AppRoutes.DASHBOARD,
      isActive: activeSection === 'dashboard',
    },
    {
      id: 'events',
      label: 'Events',
      icon: (
        <svg
          className="text-gray-400 group-hover:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: eventId ? AppRoutes.getEventDetailRoute(eventId) : AppRoutes.EVENTS,
      isActive: activeSection === 'events',
    }
  ];

  // Event-specific navigation items (only shown when an event is selected)
  const eventNavigationItems = [
    {
      id: 'feedback',
      label: 'Feedback',
      icon: (
        <svg
          className="text-gray-400 group-hover:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: eventId ? AppRoutes.getFeedbackRoute(eventId) : '#',
      isActive: activeSection === 'feedback',
      requiresEvent: true,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: (
        <svg
          className="text-gray-400 group-hover:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: eventId ? AppRoutes.getAlertsRoute(eventId) : '#',
      isActive: activeSection === 'alerts',
      requiresEvent: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg
          className="text-gray-400 group-hover:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 19V13C9 11.8954 8.10457 11 7 11H5C3.89543 11 3 11.8954 3 13V19C3 20.1046 3.89543 21 5 21H7C8.10457 21 9 20.1046 9 19ZM9 19V9C9 7.89543 9.89543 7 11 7H13C14.1046 7 15 7.89543 15 9V19M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19M15 19V5C15 3.89543 15.8954 3 17 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H17C15.8954 21 15 20.1046 15 19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: eventId ? AppRoutes.getAnalyticsRoute(eventId) : '#',
      isActive: activeSection === 'analytics',
      requiresEvent: true,
      subItems: [
        {
          id: 'sentiment',
          label: 'Sentiment Analysis',
          href: eventId ? AppRoutes.getSentimentAnalysisRoute(eventId) : '#',
          isActive: location.pathname.includes('/analytics/sentiment'),
        },
        {
          id: 'reports',
          label: 'Reports',
          href: eventId ? AppRoutes.getReportsRoute(eventId) : '#',
          isActive: location.pathname.includes('/analytics/reports'),
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg
          className="text-gray-400 group-hover:text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.3246 4.31731C10.751 2.5609 13.249 2.5609 13.6754 4.31731C13.9508 5.45193 15.2507 5.99038 16.2478 5.38285C17.7913 4.44239 19.5576 6.2087 18.6172 7.75218C18.0096 8.74925 18.5481 10.0492 19.6827 10.3246C21.4391 10.751 21.4391 13.249 19.6827 13.6754C18.5481 13.9508 18.0096 15.2507 18.6172 16.2478C19.5576 17.7913 17.7913 19.5576 16.2478 18.6172C15.2507 18.0096 13.9508 18.5481 13.6754 19.6827C13.249 21.4391 10.751 21.4391 10.3246 19.6827C10.0492 18.5481 8.74926 18.0096 7.75219 18.6172C6.2087 19.5576 4.44239 17.7913 5.38285 16.2478C5.99038 15.2507 5.45193 13.9508 4.31731 13.6754C2.5609 13.249 2.5609 10.751 4.31731 10.3246C5.45193 10.0492 5.99037 8.74926 5.38285 7.75218C4.44239 6.2087 6.2087 4.44239 7.75219 5.38285C8.74926 5.99037 10.0492 5.45193 10.3246 4.31731Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: AppRoutes.PROFILE,
      isActive: activeSection === 'settings',
      subItems: [
        {
          id: 'profile',
          label: 'Profile',
          href: AppRoutes.PROFILE,
          isActive: location.pathname.includes('/settings/profile'),
        },
        {
          id: 'integrations',
          label: 'Integrations',
          href: eventId ? AppRoutes.getIntegrationsRoute(eventId) : '#',
          isActive: location.pathname.includes('/settings/integrations'),
          requiresEvent: true,
        },
        {
          id: 'alert-settings',
          label: 'Alert Settings',
          href: eventId ? AppRoutes.getAlertSettingsRoute(eventId) : '#',
          isActive: location.pathname.includes('/settings/alerts'),
          requiresEvent: true,
        },
      ],
    },
  ];

  // Handle click on section
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId === activeSection ? '' : sectionId);
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:translate-x-0`}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="text-xl font-semibold text-primary-600">
            Event Monitor
          </div>
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Event name if we're in an event context */}
        {currentEvent && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-500">Current Event</h2>
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {currentEvent.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {currentEvent.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {/* Main navigation items */}
            {navigationItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium group ${
                    item.isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => handleSectionClick(item.id)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Divider */}
            {eventId && <hr className="my-4 border-gray-200" />}

            {/* Event-specific navigation items */}
            {eventId &&
              eventNavigationItems.map((item) => (
                <li key={item.id}>
                  {/* Main section with optional dropdown */}
                  <div
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium group ${
                      item.isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } ${!item.requiresEvent || eventId ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => (!item.requiresEvent || eventId) && handleSectionClick(item.id)}
                  >
                    <span className="mr-3 flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.subItems && (
                      <svg
                        className={`h-5 w-5 transform ${activeSection === item.id ? 'rotate-90' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Sub-items for sections with dropdowns */}
                  {item.subItems && activeSection === item.id && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.href}
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${
                              subItem.isActive
                                ? 'bg-gray-100 text-primary-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            } ${
                              !subItem.requiresEvent || eventId
                                ? ''
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={(e) => {
                              if (!subItem.requiresEvent || eventId) {
                                return;
                              }
                              e.preventDefault();
                            }}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200">
          <a
            href="https://github.com/yourusername/event-sentiment-monitor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg
              className="mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;