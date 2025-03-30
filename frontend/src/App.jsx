import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppRoutes } from './routes';
import NotFoundPage from './pages/NotFoundPage';

// Layout components
import AuthLayout from './components/common/Layout/AuthLayout';
import DashboardLayout from './components/common/Layout/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import EventSetupPage from './pages/dashboard/EventSetupPage';

// Event pages
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';

// Feedback pages
import FeedbackPage from './pages/feedback/FeedbackPage';
import FeedbackDetailPage from './pages/feedback/FeedbackDetailPage';

// Alerts pages
import AlertsPage from './pages/alerts/AlertsPage';
import AlertDetailPage from './pages/alerts/AlertDetailPage';

// Analytics pages
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SentimentAnalysisPage from './pages/analytics/SentimentAnalysisPage';
import ReportsPage from './pages/analytics/ReportsPage';

// Settings pages
import ProfilePage from './pages/settings/ProfilePage';
import IntegrationsPage from './pages/settings/IntegrationsPage';
import AlertSettingsPage from './pages/settings/AlertSettingsPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* Protected routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events/setup" element={<EventSetupPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/events/:eventId/feedback" element={<FeedbackPage />} />
            <Route path="/events/:eventId/feedback/:feedbackId" element={<FeedbackDetailPage />} />
            <Route path="/events/:eventId/alerts" element={<AlertsPage />} />
            <Route path="/events/:eventId/alerts/:alertId" element={<AlertDetailPage />} />
            <Route path="/events/:eventId/analytics" element={<AnalyticsPage />} />
            <Route path="/events/:eventId/analytics/sentiment" element={<SentimentAnalysisPage />} />
            <Route path="/events/:eventId/analytics/reports" element={<ReportsPage />} />
            <Route path="/settings/profile" element={<ProfilePage />} />
            <Route path="/events/:eventId/settings/integrations" element={<IntegrationsPage />} />
            <Route path="/events/:eventId/settings/alerts" element={<AlertSettingsPage />} />
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;