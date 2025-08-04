// GlobalDB.js
// Persistent cache for Solar Wars database using localStorage

class GlobalDB {
  constructor() {
    this.cacheKey = 'solarWarsDB';
    this.timestampKey = 'solarWarsDBTimestamp';
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.data = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const timestamp = localStorage.getItem(this.timestampKey);
      const now = Date.now();
      
      // Check if cache is expired
      if (!timestamp || (now - parseInt(timestamp)) > this.cacheExpiry) {
        console.log('Cache expired, clearing...');
        this.clearCache();
        return;
      }
      
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        this.data = JSON.parse(cached);
        console.log('Loaded database from localStorage cache');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.clearCache();
    }
  }

  saveToStorage() {
    try {
      if (this.data) {
        localStorage.setItem(this.cacheKey, JSON.stringify(this.data));
        localStorage.setItem(this.timestampKey, Date.now().toString());
        console.log('Saved database to localStorage cache');
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  clearCache() {
    localStorage.removeItem(this.cacheKey);
    localStorage.removeItem(this.timestampKey);
    this.data = null;
  }

  set(data) {
    this.data = data;
    this.saveToStorage();
  }

  get() {
    return this.data;
  }

  isLoaded() {
    return this.data !== null;
  }

  updateFaction(server, factionId, newData) {
    if (!this.data || !this.data[server] || !this.data[server][factionId.toLowerCase()]) return;
    this.data[server][factionId.toLowerCase()] = {
      ...this.data[server][factionId.toLowerCase()],
      ...newData,
    };
    this.saveToStorage();
  }

  getFaction(server, factionId) {
    return this.data?.[server]?.[factionId.toLowerCase()] || null;
  }

  getFactions(server) {
    return this.data?.[server] || {};
  }
}

const globalDB = new GlobalDB();
export default globalDB;
