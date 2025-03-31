import React, { useState, useEffect, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { SocketContext } from '../context/SocketContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import feedbackService from '../services/feedbackService';
import { 
  MessageCircle, 
  Smile, 
  Meh, 
  Frown, 
  Filter, 
  Calendar, 
  RefreshCw,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'react-feather';

const FeedbackTable = ({ feedback, onViewDetail, onProcessFeedback, onDelete, onSelectMultiple, selectedIds }) => {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="text-green-500" />;
      case 'neutral':
        return <Meh className="text-gray-500" />;
      case 'negative':
        return <Frown className="text-red-500" />;
      default:
        return <Meh className="text-gray-500" />;
    }
  };
  
  const getSourceIcon = (source) => {
    switch (source) {
      case 'twitter':
        return <Twitter size={16} className="text-blue-400" />;
      case 'instagram':
        return <Instagram size={16} className="text-purple-500" />;
      case 'linkedin':
        return <Linkedin size={16} className="text-blue-700" />;
      case 'app_chat':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'survey':
        return <CheckCircle size={16} className="text-orange-500" />;
      default:
        return <MessageCircle size={16} className="text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };
  
  const isSelected = (id) => selectedIds.includes(id);
  
  const toggleSelection = (id) => {
    if (isSelected(id)) {
      onSelectMultiple(selectedIds.filter(itemId => itemId !== id));
    } else {
      onSelectMultiple([...selectedIds, id]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === feedback.length) {
      onSelectMultiple([]);
    } else {
      onSelectMultiple(feedback.map(item => item._id));
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={selectedIds.length > 0 && selectedIds.length === feedback.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th scope="col" className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sentiment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feedback
            </th>
            <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue
            </th>
            <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {feedback.map((item) => (
            <tr key={item._id} className={isSelected(item._id) ? 'bg-blue-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={isSelected(item._id)}
                  onChange={() => toggleSelection(item._id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getSentimentIcon(item.sentiment)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 line-clamp-2">{item.text}</div>
                {item.metadata?.username && (
                  <div className="text-xs text-gray-500">@{item.metadata.username}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getSourceIcon(item.source)}
                  <span className="ml-1 text-xs capitalize">{item.source}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.issueType ? (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    {item.issueType}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">None</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetail(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  {!item.processed && (
                    <button
                      onClick={() => onProcessFeedback(item)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Process
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FeedbackFilter = ({ filters, setFilters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState({ ...filters });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };
  
  const handleReset = () => {
    const resetFilters = {
      sentiment: 'all',
      source: 'all',
      issueType: 'all',
      startDate: '',
      endDate: '',
      search: ''
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters(localFilters);
    onApplyFilters(localFilters);
  };
  
  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700">
              Sentiment
            </label>
            <select
              id="sentiment"
              name="sentiment"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={localFilters.sentiment}
              onChange={handleChange}
            >
              <option value="all">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <select
              id="source"
              name="source"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={localFilters.source}
              onChange={handleChange}
            >
              <option value="all">All</option>
              <option value="twitter">Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="app_chat">App Chat</option>
              <option value="survey">Survey</option>
              <option value="direct">Direct</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
              Issue Type
            </label>
            <select
              id="issueType"
              name="issueType"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={localFilters.issueType}
              onChange={handleChange}
            >
              <option value="all">All</option>
              <option value="queue">Queue</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="crowding">Crowding</option>
              <option value="amenities">Amenities</option>
              <option value="content">Content</option>
              <option value="temperature">Temperature</option>
              <option value="safety">Safety</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={localFilters.startDate}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={localFilters.endDate}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search feedback..."
              value={localFilters.search}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            icon={<Filter size={16} className="mr-2" />}
          >
            Apply Filters
          </Button>
        </div>
      </form>
    </Card>
  );
};

const FeedbackDetailModal = ({ isOpen, onClose, feedback }) => {
  if (!feedback) return null;
  
  const getSentimentText = (sentiment, score) => {
    let text = '';
    let color = '';
    
    switch (sentiment) {
      case 'positive':
        text = 'Positive';
        color = 'text-green-500';
        break;
      case 'neutral':
        text = 'Neutral';
        color = 'text-gray-500';
        break;
      case 'negative':
        text = 'Negative';
        color = 'text-red-500';
        break;
      default:
        text = 'Unknown';
        color = 'text-gray-500';
    }
    
    return (
      <span className={color}>
        {text} ({score ? score.toFixed(2) : 'N/A'})
      </span>
    );
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Feedback Details"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Feedback</h3>
          <p className="mt-1 text-sm text-gray-600">{feedback.text}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Metadata</h4>
            <div className="mt-1 bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Source:</div>
                <div className="capitalize">{feedback.source}</div>
                
                <div className="text-gray-500">Sentiment:</div>
                <div>{getSentimentText(feedback.sentiment, feedback.sentimentScore)}</div>
                
                <div className="text-gray-500">Date:</div>
                <div>{formatDate(feedback.createdAt)}</div>
                
                <div className="text-gray-500">Processed:</div>
                <div>{feedback.processed ? 'Yes' : 'No'}</div>
                
                {feedback.metadata?.username && (
                  <>
                    <div className="text-gray-500">Username:</div>
                    <div>@{feedback.metadata.username}</div>
                  </>
                )}
                
                {feedback.metadata?.followerCount !== undefined && (
                  <>
                    <div className="text-gray-500">Followers:</div>
                    <div>{feedback.metadata.followerCount.toLocaleString()}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900">Issue Details</h4>
            <div className="mt-1 bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Issue Type:</div>
                <div>{feedback.issueType || 'None'}</div>
                
                {feedback.issueDetails?.severity && (
                  <>
                    <div className="text-gray-500">Severity:</div>
                    <div className="capitalize">{feedback.issueDetails.severity}</div>
                  </>
                )}
                
                {feedback.issueDetails?.location && (
                  <>
                    <div className="text-gray-500">Location:</div>
                    <div>{feedback.issueDetails.location}</div>
                  </>
                )}
                
                <div className="text-gray-500">Resolved:</div>
                <div>{feedback.issueDetails?.resolved ? 'Yes' : 'No'}</div>
                
                {feedback.issueDetails?.resolvedAt && (
                  <>
                    <div className="text-gray-500">Resolved At:</div>
                    <div>{formatDate(feedback.issueDetails.resolvedAt)}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {feedback.metadata?.keywords && feedback.metadata.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Keywords</h4>
            <div className="mt-1 flex flex-wrap">
              {feedback.metadata.keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="mr-2 mb-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {feedback.sourceId && (
          <div className="pt-4 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink size={14} className="mr-1" />}
              onClick={() => window.open(`#view-original-source-${feedback.source}-${feedback.sourceId}`)}
            >
              View Original
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

const ProcessFeedbackModal = ({ isOpen, onClose, feedback, onSubmit }) => {
  const [formData, setFormData] = useState({
    issueType: '',
    severity: 'medium',
    location: '',
    resolved: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (feedback) {
      setFormData({
        issueType: feedback.issueType || '',
        severity: feedback.issueDetails?.severity || 'medium',
        location: feedback.issueDetails?.location || '',
        resolved: feedback.issueDetails?.resolved || false
      });
    }
  }, [feedback]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        processed: true,
        issueType: formData.issueType || null,
        issueDetails: {
          severity: formData.severity,
          location: formData.location || null,
          resolved: formData.resolved
        }
      };
      
      await onSubmit(feedback._id, updateData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process feedback');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Feedback"
      size="md"
    >
      {feedback && (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{feedback.text}</p>
            <div className="mt-1 text-xs text-gray-500">
              <span className="capitalize">{feedback.source}</span> • 
              <span className="ml-1">{new Date(feedback.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-sm text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
                  Issue Type
                </label>
                <select
                  id="issueType"
                  name="issueType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.issueType}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  <option value="queue">Queue</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="crowding">Crowding</option>
                  <option value="amenities">Amenities</option>
                  <option value="content">Content</option>
                  <option value="temperature">Temperature</option>
                  <option value="safety">Safety</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {formData.issueType && (
                <>
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                      Severity
                    </label>
                    <select
                      id="severity"
                      name="severity"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.severity}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="E.g. Main Hall, Room 3, etc."
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="resolved"
                      name="resolved"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.resolved}
                      onChange={handleChange}
                    />
                    <label htmlFor="resolved" className="ml-2 block text-sm text-gray-900">
                      Mark as resolved
                    </label>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-5 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? <Loader size="sm" color="white" className="mr-2" /> : null}
                Save
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};

const BatchProcessModal = ({ isOpen, onClose, selectedCount, onSubmit }) => {
  const [formData, setFormData] = useState({
    processed: true,
    issueType: '',
    severity: 'medium',
    resolved: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process feedback');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Batch Process (${selectedCount} items)`}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-sm text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
              Issue Type
            </label>
            <select
              id="issueType"
              name="issueType"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.issueType}
              onChange={handleChange}
            >
              <option value="">No Change</option>
              <option value="none">None</option>
              <option value="queue">Queue</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="crowding">Crowding</option>
              <option value="amenities">Amenities</option>
              <option value="content">Content</option>
              <option value="temperature">Temperature</option>
              <option value="safety">Safety</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="">No Change</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="resolved"
              name="resolved"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.resolved}
              onChange={handleChange}
            />
            <label htmlFor="resolved" className="ml-2 block text-sm text-gray-900">
              Mark as resolved
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="processed"
              name="processed"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.processed}
              onChange={handleChange}
            />
            <label htmlFor="processed" className="ml-2 block text-sm text-gray-900">
              Mark as processed
            </label>
          </div>
        </div>
        
        <div className="mt-5 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? <Loader size="sm" color="white" className="mr-2" /> : null}
            Apply to {selectedCount} items
          </Button>
        </div>
      </form>
    </Modal>
  );
};
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isMultiple, count = 1, isDeleting }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMultiple ? `Delete ${count} Items` : 'Delete Feedback'}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader size="sm" color="white" className="mr-2" /> : null}
            Delete
          </Button>
        </>
      }
    >
      <p className="text-gray-700">
        Are you sure you want to delete {isMultiple ? `these ${count} feedback items` : 'this feedback item'}?
      </p>
      <p className="mt-2 text-sm text-gray-500">
        This action cannot be undone. {isMultiple ? 'These items' : 'This item'} will be permanently deleted from the database.
      </p>
    </Modal>
  );
};

const Feedback = () => {
  const { selectedEvent } = useContext(EventContext);
  const { newFeedback } = useContext(SocketContext);
  
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState({
    sentiment: 'all',
    source: 'all',
    issueType: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMultiple, setDeleteMultiple] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Fetch feedback when event or filters change
  useEffect(() => {
    if (selectedEvent) {
      fetchFeedback();
    }
  }, [selectedEvent, pagination.page]);
  
  // Handle new feedback from socket
  useEffect(() => {
    if (newFeedback && selectedEvent && newFeedback.event === selectedEvent.id) {
      setFeedback(prev => [newFeedback, ...prev]);
    }
  }, [newFeedback, selectedEvent]);
  
  const fetchFeedback = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Add filters to query params
      if (filters.sentiment !== 'all') queryParams.sentiment = filters.sentiment;
      if (filters.source !== 'all') queryParams.source = filters.source;
      if (filters.issueType !== 'all') queryParams.issueType = filters.issueType;
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;
      if (filters.search) queryParams.search = filters.search;
      
      const response = await feedbackService.getEventFeedback(selectedEvent.id, queryParams);
      
      setFeedback(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.total,
        totalPages: response.pagination.totalPages
      });
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplyFilters = () => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchFeedback();
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const handleViewDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };
  
  const handleProcessFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowProcessModal(true);
  };
  
  const handleUpdateFeedback = async (feedbackId, updateData) => {
    try {
      const updatedFeedback = await feedbackService.updateFeedback(feedbackId, updateData);
      
      // Update feedback in state
      setFeedback(prev => prev.map(item => (
        item._id === feedbackId ? updatedFeedback : item
      )));
      
      return updatedFeedback;
    } catch (err) {
      console.error('Error updating feedback:', err);
      throw err;
    }
  };
  
  const handleDelete = (feedbackId) => {
    setFeedbackToDelete(feedbackId);
    setDeleteMultiple(false);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      
      if (deleteMultiple) {
        // Delete multiple feedback items
        await feedbackService.batchProcessFeedback(selectedIds, { deleted: true });
        
        // Update feedback in state
        setFeedback(prev => prev.filter(item => !selectedIds.includes(item._id)));
        setSelectedIds([]);
      } else {
        // Delete single feedback item
        await feedbackService.deleteFeedback(feedbackToDelete);
        
        // Update feedback in state
        setFeedback(prev => prev.filter(item => item._id !== feedbackToDelete));
      }
      
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError('Failed to delete feedback. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleBatchProcess = async (updateData) => {
    try {
      await feedbackService.batchProcessFeedback(selectedIds, updateData);
      
      // Refresh feedback data
      fetchFeedback();
      
      // Clear selection
      setSelectedIds([]);
    } catch (err) {
      console.error('Error batch processing feedback:', err);
      throw err;
    }
  };
  
  const handleRefresh = () => {
    fetchFeedback();
  };
  
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    setDeleteMultiple(true);
    setShowDeleteModal(true);
  };
  
  const handleBatchSelected = () => {
    if (selectedIds.length === 0) return;
    
    setShowBatchModal(true);
  };
  
  if (!selectedEvent) {
    return (
      <div className="flex h-64 flex-col items-center justify-center p-6">
        <MessageCircle size={48} className="mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">No event selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select an event to view feedback.
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
        <h1 className="text-2xl font-bold">Feedback</h1>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<RefreshCw size={16} className="mr-2" />}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="primary"
            icon={<MessageCircle size={16} className="mr-2" />}
          >
            Submit Feedback
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <FeedbackFilter
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
      />
      
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">Feedback List</h2>
            <p className="text-sm text-gray-500">
              {pagination.total} total items • Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBatchSelected}
              >
                Process Selected ({selectedIds.length})
              </Button>
              
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <MessageCircle size={48} className="mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No feedback found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or submit new feedback.
            </p>
          </div>
        ) : (
          <>
            <FeedbackTable
              feedback={feedback}
              onViewDetail={handleViewDetail}
              onProcessFeedback={handleProcessFeedback}
              onDelete={handleDelete}
              onSelectMultiple={setSelectedIds}
              selectedIds={selectedIds}
            />
            
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav className="flex items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(pagination.page - 1, 1))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="mx-4 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(pagination.page + 1, pagination.totalPages))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Modals */}
      <FeedbackDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        feedback={selectedFeedback}
      />
      
      <ProcessFeedbackModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        feedback={selectedFeedback}
        onSubmit={handleUpdateFeedback}
      />
      
      <BatchProcessModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        selectedCount={selectedIds.length}
        onSubmit={handleBatchProcess}
      />
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isMultiple={deleteMultiple}
        count={selectedIds.length}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Feedback;