const APP_NAMESPACE = 'event_monitor_';

const localStorage = {

  setItem: (key, value, expiryInMinutes = null) => {
    try {
      const namespacedKey = APP_NAMESPACE + key;
      
      const item = {
        value,
        timestamp: new Date().getTime()
      };
      
      // Add expiry if specified
      if (expiryInMinutes) {
        item.expiry = expiryInMinutes * 60 * 1000; // Convert to milliseconds
      }
      
      window.localStorage.setItem(namespacedKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  },
  
  // Get an item from localStorage, respecting expiry
  getItem: (key) => {
    try {
      const namespacedKey = APP_NAMESPACE + key;
      const itemStr = window.localStorage.getItem(namespacedKey);
      
      // Return null if item doesn't exist
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      
      // Check if the item is expired
      if (item.expiry && item.timestamp + item.expiry < now) {
        // Remove the expired item
        window.localStorage.removeItem(namespacedKey);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  },
  
  // Remove an item from localStorage
  removeItem: (key) => {
    try {
      const namespacedKey = APP_NAMESPACE + key;
      window.localStorage.removeItem(namespacedKey);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  },
  
  // Clear all items from localStorage that belong to our app
  clear: () => {
    try {
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith(APP_NAMESPACE)) {
          window.localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
  
  // Check if a key exists in localStorage and isn't expired
  hasItem: (key) => {
    const item = localStorage.getItem(key);
    return item !== null;
  },
  
  // Update an existing object in localStorage by merging with new values
  updateObject: (key, newValues) => {
    try {
      const existingObj = localStorage.getItem(key);
      
      if (existingObj === null) {
        return localStorage.setItem(key, newValues);
      }
      
      // Get the original item to preserve metadata like expiry
      const namespacedKey = APP_NAMESPACE + key;
      const itemStr = window.localStorage.getItem(namespacedKey);
      const item = JSON.parse(itemStr);
      
      // Merge with new values
      item.value = { ...existingObj, ...newValues };
      item.timestamp = new Date().getTime();
      
      window.localStorage.setItem(namespacedKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error updating localStorage object:', error);
      return false;
    }
  },
  
  // Set a temporary item that will expire automatically
  setTemp: (key, value, expiryInMinutes = 30) => {
    return localStorage.setItem(key, value, expiryInMinutes);
  },
  
  // Clean up expired items
  clearExpired: () => {
    try {
      const now = new Date().getTime();
      
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith(APP_NAMESPACE)) {
          const itemStr = window.localStorage.getItem(key);
          
          try {
            const item = JSON.parse(itemStr);
            
            if (item.expiry && item.timestamp + item.expiry < now) {
              window.localStorage.removeItem(key);
            }
          } catch (err) {
            // Skip if the item can't be parsed
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing expired localStorage items:', error);
      return false;
    }
  }
};

export default localStorage;