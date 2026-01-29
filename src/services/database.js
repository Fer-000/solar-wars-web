import { db } from './firebase';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from 'firebase/firestore';


// Database service for Solar Wars Bot integration
class DatabaseService {
  constructor() {
    this.cache = {};
  }

  // Convert Firestore data types to JavaScript values
  convertFirestoreData(data) {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.convertFirestoreData(item));
    }

    if (typeof data === 'object') {
      // Check if this is a Firestore type object (e.g., {S: "value"})
      if (data.S !== undefined) return data.S; // String
      if (data.N !== undefined) return parseFloat(data.N); // Number
      if (data.B !== undefined) return data.B; // Boolean
      if (data.L !== undefined) {
        // List - ensure it's an array before mapping
        try {
          const listData = Array.isArray(data.L) ? data.L : [];
          return listData.map(item => this.convertFirestoreData(item));
        } catch (error) {
          console.warn('Error converting Firestore list:', data.L, error);
          return [];
        }
      }
      if (data.M !== undefined) {
        // Map object
        try {
          const converted = {};
          for (const [key, value] of Object.entries(data.M)) {
            converted[key] = this.convertFirestoreData(value);
          }
          return converted;
        } catch (error) {
          console.warn('Error converting Firestore map:', data.M, error);
          return {};
        }
      }

      // Regular object - convert all properties
      try {
        const converted = {};
        for (const [key, value] of Object.entries(data)) {
          converted[key] = this.convertFirestoreData(value);
        }
        return converted;
      } catch (error) {
        console.warn('Error converting object:', data, error);
        return data;
      }
    }

    return data;
  }

  // List all available collections/servers (web SDK compatible)
  async listCollections() {
    try {
      // Since listCollections() is not available in web SDK, we'll try common server names
      const commonServers = ["The Solar Wars"];
      const availableServers = [];
      
      for (const server of commonServers) {
        try {
          const collectionRef = collection(db, server);
          const snapshot = await getDocs(collectionRef);
          if (!snapshot.empty) {
            availableServers.push(server);
          }
        } catch (error) {
          // Silently fail for non-existent collections
          console.log(`Server not accessible or empty`);
        }
      }
      
      return availableServers;
    } catch (error) {
      console.error('Error testing collections:', error);
      return [];
    }
  }

  // Get all faction data for a server (matches bot's getFactions function)
  async getFactions(server = "The Solar Wars") {
    // Use globalDB if loaded
    try {
      const globalDB = (await import("./GlobalDB")).default;
      const cached = globalDB.getFactions(server);
      if (cached && Object.keys(cached).length > 0) return cached;
      // Fallback to Firestore
      const collectionRef = collection(db, server);
      const snapshot = await getDocs(collectionRef);
      const factions = {};
      snapshot.forEach((doc) => {
        const rawData = doc.data();
        factions[doc.id] = this.convertFirestoreData(rawData);
      });
      this.cache[server] = factions;
      return factions;
    } catch (error) {
      console.error('Error fetching factions:', error);
      return {};
    }
  }

  // Get specific faction data (matches bot's getFaction function)
  async getFaction(server = "The Solar Wars", factionId) {
    // Use globalDB if loaded
    try {
      const globalDB = (await import("./GlobalDB")).default;
      const cached = globalDB.getFaction(server, factionId);
      if (cached) return cached;
      // Fallback to Firestore
      const docRef = doc(db, server, factionId.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const convertedData = this.convertFirestoreData(rawData);
        return convertedData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching faction:', error);
      return null;
    }
  }

  // Update faction data (matches bot's setFaction function)
  async setFaction(server = "The Solar Wars", factionId, newData) {
    try {
      const docRef = doc(db, server, factionId.toLowerCase());
      await updateDoc(docRef, newData);
      console.log('Successfully updated Firestore document');
      
      // Update globalDB cache
      const globalDB = (await import("./GlobalDB")).default;
      globalDB.updateFaction(server, factionId, newData);
      console.log('Updated globalDB cache');
      
      // Update local cache
      if (this.cache[server] && this.cache[server][factionId.toLowerCase()]) {
        this.cache[server][factionId.toLowerCase()] = {
          ...this.cache[server][factionId.toLowerCase()],
          ...newData
        };
        console.log('Updated local cache');
      }
      return true;
    } catch (error) {
      console.error('Error updating faction:', error);
      return false;
    }
  }

  // Create new faction (matches bot's createFaction function)
  async createFaction(server = "The Solar Wars", factionId, data) {
    try {
      const docRef = doc(db, server, factionId.toLowerCase());
      await setDoc(docRef, data);
      
      // Update cache
      if (this.cache[server]) {
        this.cache[server][factionId.toLowerCase()] = data;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating faction:', error);
      return false;
    }
  }

  // Get faction's fleets
  async getFleets(server = "The Solar Wars", factionId) {
    const faction = await this.getFaction(server, factionId);
    return faction?.Fleets || [];
  }

  // Update faction's fleets
  async updateFleets(server = "The Solar Wars", factionId, fleets) {
    return await this.setFaction(server, factionId, { Fleets: fleets });
  }

  // Get faction's vehicles/ships
  async getVehicles(server = "The Solar Wars", factionId) {
    const faction = await this.getFaction(server, factionId);
    return faction?.Vehicles || [];
  }

  // Get faction's resources
  async getResources(server = "The Solar Wars", factionId) {
    const faction = await this.getFaction(server, factionId);
    return faction?.Resources || {};
  }

  async getData(server = "The Solar Wars"){
    const data = await this.getFaction(server, "Data");
    return data;
  }
  // Get faction's basic info
  async getFactionInfo(server = "The Solar Wars", factionId) {
    const faction = await this.getFaction(server, factionId);
    if (!faction) return null;

    // Calculate territory (worlds with 1+ hexes)
    const territory = Object.values(faction.Maps || {}).filter(hexes => hexes >= 1).length;

    return {
      name: factionId,
      population: faction.Resources?.Population || 0,
      territory: territory,
      buildings: faction.Buildings || 0,
      resources: faction.Resources || {},
      fleets: faction.Fleets || [],
      vehicles: faction.Vehicles || [],
      maps: faction.Maps || {},
      settings: faction.Settings || {}
    };
  }

  // Get all available worlds/maps from settings
  async getAvailableWorlds(server = "The Solar Wars") {
    try {
      // Get all factions to collect all unique world names
      const factions = await this.getFactions(server);
      const allWorlds = new Set();
      
      // Collect worlds from all factions' Maps
      Object.values(factions).forEach(faction => {
        if (faction.Maps && typeof faction.Maps === 'object') {
          Object.keys(faction.Maps).forEach(worldName => {
            allWorlds.add(worldName);
          });
        }
      });
      
      // Also try to get from settings if available
      try {
        const settings = await this.getFaction(server, "settings");
        if (settings?.Places) {
          Object.keys(settings.Places).forEach(worldName => {
            allWorlds.add(worldName);
          });
        }
      } catch (error) {
        console.log('No settings faction found, using faction Maps data');
      }
      
      const worldsArray = Array.from(allWorlds).sort();
      console.log('Available worlds found:', worldsArray);
      return worldsArray;
    } catch (error) {
      console.error('Error fetching available worlds:', error);
      return [];
    }
  }

  // Convert Discord bot fleet format to web UI format
  convertFleetsToUnits(fleets = [], vehicles = []) {
    
    return fleets.map((fleet, index) => {
      
      // Calculate total vehicles in this fleet by summing all vehicle counts
      const totalVehicles = fleet.Vehicles?.reduce((total, vehicle) => {
        const count = vehicle.count || 0;
        return total + count;
      }, 0) || 0;
      
      
      // Determine if fleet is space-based or ground-based based on fleet type
      const isSpaceBased = fleet.Type === 'Space' || this.isFleetSpaceBased(fleet.Vehicles, vehicles);
      
      const unit = {
        id: fleet.ID || index,
        name: fleet.Name || `Fleet ${fleet.ID || index + 1}`,
        ships: totalVehicles,
        vehicleLabel: isSpaceBased ? 'Ships' : 'Vehicles',
        status: this.getFleetStatus(fleet.State),
        location: fleet.State?.Location || 'Unknown',
        state: fleet.State?.Action || 'Unknown',
        type: fleet.Type || 'Unknown',
        value: typeof fleet.Value === 'object' ? JSON.stringify(fleet.Value) : (fleet.Value || 'No additional info'),
        vehicles: fleet.Vehicles || []
      };
      
      return unit;
    });
  }

  // Determine if fleet is space-based
  isFleetSpaceBased(fleetVehicles = [], allVehicles = []) {
    if (!fleetVehicles.length) return true; // Default to space
    
    // Create lookup for vehicle types
    const vehicleTypes = {};
    allVehicles.forEach(v => {
      vehicleTypes[v.ID] = v;
    });
    
    // Check if any vehicle in fleet is space-based
    return fleetVehicles.some(fv => {
      const vehicle = vehicleTypes[fv.ID];
      return vehicle && this.isVehicleSpaceBased(vehicle.name);
    });
  }

  // Check if vehicle is space-based by name
  isVehicleSpaceBased(vehicleName = '') {
    const spaceBased = ['fighter', 'cruiser', 'battleship', 'destroyer', 'carrier', 'frigate', 'dreadnought'];
    const name = vehicleName.toLowerCase();
    return spaceBased.some(type => name.includes(type));
  }

  // Debug function to test connection and see available data
  async debugConnection() {
    try {
      console.log('Testing Firebase connection...');
      
      
      const factions = await this.getFactions("The Solar Wars");
      console.log('Firebase connection successful');
      return factions;
    } catch (error) {
      console.error('Firebase connection failed:', error);
      return null;
    }
  }

  // Calculate total vehicles by type from fleets
  calculateVehicleTotalsFromFleets(fleets = [], vehicles = []) {
    
    // Create lookup for vehicle info by ID and initialize all vehicles with 0 count
    const vehicleInfo = {};
    const totals = {};
    
    vehicles.forEach(v => {
      vehicleInfo[v.ID] = v;
      const vehicleName = v.name || `Vehicle ${v.ID}`;
      totals[vehicleName] = 0; // Initialize all vehicles with 0
    });

    // Count vehicles from all fleets
    fleets.forEach((fleet, fleetIndex) => {
      fleet.Vehicles?.forEach(fleetVehicle => {
        const vehicle = vehicleInfo[fleetVehicle.ID];
        if (vehicle) {
          const vehicleName = vehicle.name || `Vehicle ${vehicle.ID}`;
          const count = fleetVehicle.count || 0;
          totals[vehicleName] += count;
        } else {
        }
      });
    });

    return totals;
  }

  // Get detailed vehicle information by name
  getVehicleDetailsByName(vehicleName, vehicles = []) {
    return vehicles.find(v => v.name === vehicleName) || null;
  }

  // Get fleet status from Discord bot format
  getFleetStatus(state) {
    if (!state) return 'Unknown';
    
    switch (state.Action) {
      case 'Defense': return 'Active';
      case 'Move': return 'Patrol';
      case 'Mothballed': return 'Maintenance';
      case 'Battle': return 'Combat';
      default: return 'Idle';
    }
  }

  // Calculate faction income (similar to bot's /income command)
  async calculateFactionIncome(server = "The Solar Wars", factionId) {
    try {
      const factionData = await this.getFaction(server, factionId);
      if (!factionData) return null;

      // This is a simplified income calculation
      // For full bot compatibility, you'd need to implement the complete incomeMath.js logic
      const income = factionData.Income || {};
      return income;
    } catch (error) {
      console.error('Error calculating faction income:', error);
      return null;
    }
  }

  // Update faction resources
  async updateFactionResources(server = "The Solar Wars", factionId, newResources) {
    try {
      const currentData = await this.getFaction(server, factionId);
      if (!currentData) {
        throw new Error('Faction not found');
      }

      await this.setFaction(server, factionId, {
        ...currentData,
        Resources: newResources
      });

      return true;
    } catch (error) {
      console.error('Error updating faction resources:', error);
      return false;
    }
  }

  // Get place/world data from Places collection
  async getPlaceData(server = "The Solar Wars", worldName) {
    try {
      // Get the faction document
      const factionDoc = await this.getFaction(server, "settings");
      
      if (!factionDoc || !factionDoc.Places) {
        console.warn(`No Places data found in faction settings`);
        return null;
      }

      // Navigate to the specific world
      const placeData = factionDoc.Places[worldName];
      
      if (!placeData) {
        console.warn(`No data found for world: ${worldName}`);
        return null;
      }

      return {
        Claimed: placeData.Claimed,
        ID: placeData.ID,
        Resources: placeData.Resources,
        Size: placeData.Size,
        Image: placeData.Image,
        Claims: placeData.Claims, // This is the JSON string
      };
    } catch (error) {
      console.error(`Error fetching place data for ${worldName}:`, error);
      return null;
    }
  }
}

  // Create singleton instance
const databaseService = new DatabaseService();
export default databaseService;