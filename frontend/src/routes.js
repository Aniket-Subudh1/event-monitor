export const AppRoutes = {
    // Auth routes
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    
    // Dashboard and event routes
    DASHBOARD: '/dashboard',
    EVENTS: '/events',
    EVENT_SETUP: '/events/setup',
    EVENT_DETAIL: '/events/:eventId',
    
    // Feedback routes
    FEEDBACK: '/events/:eventId/feedback',
    FEEDBACK_DETAIL: '/events/:eventId/feedback/:feedbackId',
    
    // Alerts routes
    ALERTS: '/events/:eventId/alerts',
    ALERT_DETAIL: '/events/:eventId/alerts/:alertId',
    
    // Analytics routes
    ANALYTICS: '/events/:eventId/analytics',
    SENTIMENT_ANALYSIS: '/events/:eventId/analytics/sentiment',
    REPORTS: '/events/:eventId/analytics/reports',
    
    // Settings routes
    PROFILE: '/settings/profile',
    INTEGRATIONS: '/events/:eventId/settings/integrations',
    ALERT_SETTINGS: '/events/:eventId/settings/alerts',
    
    // Helper functions to generate dynamic routes
    getEventDetailRoute: (eventId) => `/events/${eventId}`,
    getFeedbackRoute: (eventId) => `/events/${eventId}/feedback`,
    getFeedbackDetailRoute: (eventId, feedbackId) => `/events/${eventId}/feedback/${feedbackId}`,
    getAlertsRoute: (eventId) => `/events/${eventId}/alerts`,
    getAlertDetailRoute: (eventId, alertId) => `/events/${eventId}/alerts/${alertId}`,
    getAnalyticsRoute: (eventId) => `/events/${eventId}/analytics`,
    getSentimentAnalysisRoute: (eventId) => `/events/${eventId}/analytics/sentiment`,
    getReportsRoute: (eventId) => `/events/${eventId}/analytics/reports`,
    getIntegrationsRoute: (eventId) => `/events/${eventId}/settings/integrations`,
    getAlertSettingsRoute: (eventId) => `/events/${eventId}/settings/alerts`,
  };