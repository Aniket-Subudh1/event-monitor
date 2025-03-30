import { format, formatDistance, formatRelative, isToday, isYesterday } from 'date-fns';

const dateFormatter = {
  // Format date to standard format: Jan 1, 2023
  formatDate: (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy');
  },
  
  // Format date with time: Jan 1, 2023 12:00 PM
  formatDateTime: (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  },
  
  // Format time only: 12:00 PM
  formatTime: (date) => {
    if (!date) return '';
    return format(new Date(date), 'h:mm a');
  },
  
  // Format as relative time: 5 minutes ago, 2 hours ago, etc.
  formatRelative: (date) => {
    if (!date) return '';
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  },
  
  // Format as relative with day context: Today at 12:00 PM, Yesterday at 3:45 PM, etc.
  formatRelativeWithDay: (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    } else if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'h:mm a')}`;
    } else {
      return format(dateObj, 'MMM d, yyyy h:mm a');
    }
  },
  
  // Format date for input fields: 2023-01-01
  formatForInput: (date) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  },
  
  // Format date and time for input fields: 2023-01-01T12:00
  formatDateTimeForInput: (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  },
  
  // Format duration in minutes to hours and minutes: 1h 30m
  formatDuration: (minutes) => {
    if (!minutes) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  },
  
  // Format duration in milliseconds to human readable: 1h 30m 15s
  formatDurationMs: (ms) => {
    if (!ms) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    
    let result = '';
    
    if (hours > 0) {
      result += `${hours}h `;
    }
    
    if (remainingMinutes > 0 || hours > 0) {
      result += `${remainingMinutes}m `;
    }
    
    if (remainingSeconds > 0 || (hours === 0 && remainingMinutes === 0)) {
      result += `${remainingSeconds}s`;
    }
    
    return result.trim();
  }
};

export default dateFormatter;