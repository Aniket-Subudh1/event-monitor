/**
 * Maps issue types to their respective icons and colors
 */

const issueIcons = {
    // Get icon for issue type
    getIssueIcon: (type) => {
      switch(type) {
        case 'queue':
          return 'QueueListIcon';
        case 'audio':
          return 'SpeakerWaveIcon';
        case 'video':
          return 'FilmIcon';
        case 'crowding':
          return 'UserGroupIcon';
        case 'amenities':
          return 'BuildingStorefrontIcon';
        case 'content':
          return 'DocumentTextIcon';
        case 'temperature':
          return 'FireIcon';
        case 'safety':
          return 'ShieldExclamationIcon';
        case 'general':
          return 'ExclamationCircleIcon';
        case 'other':
          return 'QuestionMarkCircleIcon';
        default:
          return 'QuestionMarkCircleIcon';
      }
    },
    
    // Get color for issue type
    getIssueColor: (type) => {
      switch(type) {
        case 'queue':
          return '#8B5CF6'; // violet-500
        case 'audio':
          return '#3B82F6'; // blue-500
        case 'video':
          return '#EC4899'; // pink-500
        case 'crowding':
          return '#F59E0B'; // amber-500
        case 'amenities':
          return '#10B981'; // emerald-500
        case 'content':
          return '#6366F1'; // indigo-500
        case 'temperature':
          return '#EF4444'; // red-500
        case 'safety':
          return '#DC2626'; // red-600
        case 'general':
          return '#4B5563'; // gray-600
        case 'other':
          return '#6B7280'; // gray-500
        default:
          return '#6B7280'; // gray-500
      }
    },
    
    // Get background color for issue type
    getIssueBgColor: (type) => {
      switch(type) {
        case 'queue':
          return '#EDE9FE'; // violet-100
        case 'audio':
          return '#DBEAFE'; // blue-100
        case 'video':
          return '#FCE7F3'; // pink-100
        case 'crowding':
          return '#FEF3C7'; // amber-100
        case 'amenities':
          return '#D1FAE5'; // emerald-100
        case 'content':
          return '#E0E7FF'; // indigo-100
        case 'temperature':
          return '#FEE2E2'; // red-100
        case 'safety':
          return '#FEE2E2'; // red-100
        case 'general':
          return '#F3F4F6'; // gray-100
        case 'other':
          return '#F3F4F6'; // gray-100
        default:
          return '#F3F4F6'; // gray-100
      }
    },
    
    // Get tailwind class for issue badge
    getIssueBadgeClass: (type) => {
      switch(type) {
        case 'queue':
          return 'bg-violet-100 text-violet-800';
        case 'audio':
          return 'bg-blue-100 text-blue-800';
        case 'video':
          return 'bg-pink-100 text-pink-800';
        case 'crowding':
          return 'bg-amber-100 text-amber-800';
        case 'amenities':
          return 'bg-emerald-100 text-emerald-800';
        case 'content':
          return 'bg-indigo-100 text-indigo-800';
        case 'temperature':
          return 'bg-red-100 text-red-800';
        case 'safety':
          return 'bg-red-100 text-red-800';
        case 'general':
          return 'bg-gray-100 text-gray-800';
        case 'other':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    },
    
    // Get label for issue type
    getIssueLabel: (type) => {
      switch(type) {
        case 'queue':
          return 'Queue/Waiting';
        case 'audio':
          return 'Audio Problems';
        case 'video':
          return 'Video/Display';
        case 'crowding':
          return 'Overcrowding';
        case 'amenities':
          return 'Amenities';
        case 'content':
          return 'Content';
        case 'temperature':
          return 'Temperature';
        case 'safety':
          return 'Safety';
        case 'general':
          return 'General';
        case 'other':
          return 'Other';
        default:
          return 'Unknown';
      }
    },
    
    // Get all issue types
    getAllIssueTypes: () => {
      return [
        { id: 'queue', label: 'Queue/Waiting', description: 'Issues with lines or waiting times' },
        { id: 'audio', label: 'Audio Problems', description: 'Sound system or audio quality issues' },
        { id: 'video', label: 'Video/Display', description: 'Projection, screens or visibility issues' },
        { id: 'crowding', label: 'Overcrowding', description: 'Space or capacity problems' },
        { id: 'amenities', label: 'Amenities', description: 'Issues with facilities like food, bathrooms, etc.' },
        { id: 'content', label: 'Content', description: 'Issues with speakers, presentations or content' },
        { id: 'temperature', label: 'Temperature', description: 'Issues with room temperature or climate' },
        { id: 'safety', label: 'Safety', description: 'Safety or security concerns' },
        { id: 'general', label: 'General', description: 'General alerts not fitting other categories' },
        { id: 'other', label: 'Other', description: 'Miscellaneous issues' }
      ];
    }
  };
  
  export default issueIcons;