import React, { useState, useEffect, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import integrationService from '../services/integrationService';

// Icons
import { 
  Share2, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Settings, 
  RefreshCw, 
  Power, 
  ZapOff,
  AlertCircle,
  Check,
  MessageCircle
} from 'react-feather';

const IntegrationCard = ({ 
  title, 
  description, 
  icon, 
  connected, 
  onConnect, 
  onDisconnect,
  onConfigure,
  loading,
  status,
  configOptions
}) => {
  return (
    <Card className="mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {icon}
          <div className="ml-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          {connected ? (
            <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full mr-4">
              <Check size={14} className="mr-1" /> Connected
            </span>
          ) : (
            <span className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full mr-4">
              <AlertCircle size={14} className="mr-1" /> Disconnected
            </span>
          )}
          
          {loading ? (
            <Loader size="sm" className="mr-2" />
          ) : connected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              icon={<ZapOff size={16} />}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onConnect}
              icon={<Power size={16} />}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
      
      {connected && (
        <>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium mb-2">Status</h4>
            <div className="text-sm">
              {status && Object.entries(status).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <span className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {configOptions && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={onConfigure}
                icon={<Settings size={16} />}
              >
                Configure
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

const IntegrationSettings = ({ selectedEvent }) => {
  const [twitterStatus, setTwitterStatus] = useState(null);
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [linkedinStatus, setLinkedInStatus] = useState(null);
  
  const [loading, setLoading] = useState({
    twitter: false,
    instagram: false,
    linkedin: false
  });
  
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchIntegrationStatus();
  }, [selectedEvent]);
  
  const fetchIntegrationStatus = async () => {
    try {
      setError(null);
      
      // Fetch Twitter status
      const twitter = await integrationService.getTwitterStatus();
      setTwitterStatus(twitter);
      
      // Fetch Instagram status
      const instagram = await integrationService.getInstagramStatus();
      setInstagramStatus(instagram);
      
      // Fetch LinkedIn status
      const linkedin = await integrationService.getLinkedInStatus();
      setLinkedInStatus(linkedin);
    } catch (err) {
      console.error('Error fetching integration status:', err);
      setError('Failed to load integration status. Please try again.');
    }
  };
  
  const handleTwitterConnect = async () => {
    try {
      setLoading(prev => ({ ...prev, twitter: true }));
      await integrationService.connectTwitter();
      const status = await integrationService.getTwitterStatus();
      setTwitterStatus(status);
    } catch (err) {
      console.error('Error connecting Twitter:', err);
      setError('Failed to connect Twitter. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, twitter: false }));
    }
  };
  
  const handleTwitterDisconnect = async () => {
    try {
      setLoading(prev => ({ ...prev, twitter: true }));
      await integrationService.disconnectTwitter();
      const status = await integrationService.getTwitterStatus();
      setTwitterStatus(status);
    } catch (err) {
      console.error('Error disconnecting Twitter:', err);
      setError('Failed to disconnect Twitter. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, twitter: false }));
    }
  };
  
  const handleInstagramConnect = async () => {
    try {
      setLoading(prev => ({ ...prev, instagram: true }));
      await integrationService.connectInstagram();
      const status = await integrationService.getInstagramStatus();
      setInstagramStatus(status);
    } catch (err) {
      console.error('Error connecting Instagram:', err);
      setError('Failed to connect Instagram. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };
  
  const handleInstagramDisconnect = async () => {
    try {
      setLoading(prev => ({ ...prev, instagram: true }));
      await integrationService.disconnectInstagram();
      const status = await integrationService.getInstagramStatus();
      setInstagramStatus(status);
    } catch (err) {
      console.error('Error disconnecting Instagram:', err);
      setError('Failed to disconnect Instagram. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };
  
  const handleLinkedInConnect = async () => {
    try {
      setLoading(prev => ({ ...prev, linkedin: true }));
      await integrationService.connectLinkedIn();
      const status = await integrationService.getLinkedInStatus();
      setLinkedInStatus(status);
    } catch (err) {
      console.error('Error connecting LinkedIn:', err);
      setError('Failed to connect LinkedIn. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };
  
  const handleLinkedInDisconnect = async () => {
    try {
      setLoading(prev => ({ ...prev, linkedin: true }));
      await integrationService.disconnectLinkedIn();
      const status = await integrationService.getLinkedInStatus();
      setLinkedInStatus(status);
    } catch (err) {
      console.error('Error disconnecting LinkedIn:', err);
      setError('Failed to disconnect LinkedIn. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };
  
  const handleTwitterConfigure = () => {
    // Logic to configure Twitter settings
    console.log('Configure Twitter');
  };
  
  const handleInstagramConfigure = () => {
    // Logic to configure Instagram settings
    console.log('Configure Instagram');
  };
  
  const handleLinkedInConfigure = () => {
    // Logic to configure LinkedIn settings
    console.log('Configure LinkedIn');
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <IntegrationCard
        title="Twitter Integration"
        description="Connect to Twitter to monitor mentions, hashtags, and sentiment about your event."
        icon={<Twitter size={24} className="text-blue-400" />}
        connected={twitterStatus?.connected}
        onConnect={handleTwitterConnect}
        onDisconnect={handleTwitterDisconnect}
        onConfigure={handleTwitterConfigure}
        loading={loading.twitter}
        status={twitterStatus?.status}
        configOptions={true}
      />
      
      <IntegrationCard
        title="Instagram Integration"
        description="Connect to Instagram to monitor hashtags and comments related to your event."
        icon={<Instagram size={24} className="text-purple-500" />}
        connected={instagramStatus?.connected}
        onConnect={handleInstagramConnect}
        onDisconnect={handleInstagramDisconnect}
        onConfigure={handleInstagramConfigure}
        loading={loading.instagram}
        status={instagramStatus?.status}
        configOptions={true}
      />
      
      <IntegrationCard
        title="LinkedIn Integration"
        description="Connect to LinkedIn to monitor company pages and event-related content."
        icon={<Linkedin size={24} className="text-blue-700" />}
        connected={linkedinStatus?.connected}
        onConnect={handleLinkedInConnect}
        onDisconnect={handleLinkedInDisconnect}
        onConfigure={handleLinkedInConfigure}
        loading={loading.linkedin}
        status={linkedinStatus?.status}
        configOptions={true}
      />
    </div>
  );
};

const Integrations = () => {
  const { selectedEvent } = useContext(EventContext);
  
  if (!selectedEvent) {
    return (
      <div className="flex h-64 flex-col items-center justify-center p-6">
        <Share2 size={48} className="mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">No event selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select an event to manage integrations.
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => window.location.href = '/events'}
        >
          Go to Events
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integrations</h1>
        
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          icon={<RefreshCw size={16} className="mr-2" />}
        >
          Refresh
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="flex items-center mb-4">
          <MessageCircle className="text-blue-500 mr-2" size={20} />
          <h3 className="text-lg font-medium">Integration Status</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Connect your event to social media platforms to monitor feedback and sentiment in real-time.
          Integrated data will be automatically collected and analyzed.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Twitter className="text-blue-600" size={18} />
              </div>
              <div>
                <h4 className="font-medium">Twitter</h4>
                <p className="text-xs text-gray-500">Monitor tweets, hashtags, and mentions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <Instagram className="text-purple-600" size={18} />
              </div>
              <div>
                <h4 className="font-medium">Instagram</h4>
                <p className="text-xs text-gray-500">Track posts, hashtags, and stories</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Linkedin className="text-blue-700" size={18} />
              </div>
              <div>
                <h4 className="font-medium">LinkedIn</h4>
                <p className="text-xs text-gray-500">Monitor company updates and event posts</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <IntegrationSettings selectedEvent={selectedEvent} />
    </div>
  );
};

export default Integrations;