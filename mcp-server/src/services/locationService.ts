import { Cache } from '../utils/cache.js';
import { WikiDataFetcher } from '../data-sources/wikiDataFetcher.js';

export interface LocationData {
  name: string;
  aliases: string[];
  source: string;
  type: 'city' | 'village' | 'country' | 'island' | 'building' | 'landmark' | 'dimension' | 'other';
  description: string;
  geography: {
    climate?: string;
    terrain?: string;
    size?: string;
    location?: string;
    surroundings?: string[];
  };
  population: {
    inhabitants?: string;
    species?: string[];
    culture?: string;
    government?: string;
    leader?: string;
  };
  features: {
    landmarks: string[];
    importantBuildings: string[];
    naturalFeatures: string[];
    defenses?: string[];
  };
  history: {
    founded?: string;
    keyEvents: string[];
    previousNames?: string[];
    significance: string;
  };
  connections: {
    parentLocation?: string;
    childLocations: string[];
    neighboringAreas: string[];
    accessMethods: string[];
  };
  currentStatus: {
    condition: 'thriving' | 'declining' | 'destroyed' | 'abandoned' | 'unknown';
    controlledBy?: string;
    timePeriod?: string;
    accessibility?: string;
  };
  notableResidents: string[];
  images?: string[];
  lastUpdated: string;
}

export class LocationService {
  private cache: Cache;
  private wikiDataFetcher: WikiDataFetcher;

  constructor() {
    this.cache = new Cache();
    this.wikiDataFetcher = new WikiDataFetcher();
  }

  async getLocationData(
    locationName: string, 
    sourceName: string, 
    timePeriod?: string
  ): Promise<LocationData> {
    const cacheKey = `location:${sourceName}:${locationName}:${timePeriod || 'default'}`;
    
    // Check cache first
    const cached = this.cache.get<LocationData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch data from wiki sources
      const wikiData = await this.wikiDataFetcher.getLocationInfo(sourceName, locationName);
      
      // Process and structure the data
      const locationData = this.processLocationData(locationName, sourceName, wikiData, timePeriod);
      
      // Cache the result
      this.cache.set(cacheKey, locationData);
      
      return locationData;
    } catch (error) {
      console.error(`Error fetching location data for ${locationName} from ${sourceName}:`, error);
      throw new Error(`Failed to fetch location information for "${locationName}" from "${sourceName}"`);
    }
  }

  async searchLocations(
    sourceName: string, 
    query: string, 
    filters?: {
      type?: LocationData['type'];
      status?: LocationData['currentStatus']['condition'];
      hasResidents?: boolean;
    }
  ): Promise<Array<{ name: string; score: number; basicInfo: Partial<LocationData> }>> {
    const cacheKey = `location_search:${sourceName}:${query}:${JSON.stringify(filters || {})}`;
    
    const cached = this.cache.get<Array<{ name: string; score: number; basicInfo: Partial<LocationData> }>>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Search for locations in the wiki
      const searchResults = await this.wikiDataFetcher.searchLocations(sourceName, query);
      
      // Apply filters if provided
      let filteredResults = searchResults;
      
      if (filters) {
        filteredResults = searchResults.filter(result => {
          if (filters.type && result.basicInfo.type !== filters.type) {
            return false;
          }
          
          if (filters.status && result.basicInfo.currentStatus?.condition !== filters.status) {
            return false;
          }
          
          if (filters.hasResidents !== undefined) {
            const hasResidents = (result.basicInfo.notableResidents?.length || 0) > 0;
            if (filters.hasResidents !== hasResidents) {
              return false;
            }
          }
          
          return true;
        });
      }

      this.cache.set(cacheKey, filteredResults);
      return filteredResults;
    } catch (error) {
      console.error(`Error searching locations in ${sourceName}:`, error);
      throw new Error(`Failed to search locations in "${sourceName}"`);
    }
  }

  async getLocationsByType(
    sourceName: string, 
    locationType: LocationData['type']
  ): Promise<LocationData[]> {
    const cacheKey = `locations_by_type:${sourceName}:${locationType}`;
    
    const cached = this.cache.get<LocationData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const allLocations = await this.wikiDataFetcher.getAllLocations(sourceName);
      const filteredLocations = allLocations.filter(location => location.type === locationType);
      
      this.cache.set(cacheKey, filteredLocations);
      return filteredLocations;
    } catch (error) {
      console.error(`Error fetching locations by type for ${sourceName}:`, error);
      throw new Error(`Failed to fetch ${locationType} locations from "${sourceName}"`);
    }
  }

  async getLocationConnections(
    locationName: string, 
    sourceName: string
  ): Promise<{
    parent?: LocationData;
    children: LocationData[];
    neighbors: LocationData[];
  }> {
    const locationData = await this.getLocationData(locationName, sourceName);
    
    const connections = {
      parent: undefined as LocationData | undefined,
      children: [] as LocationData[],
      neighbors: [] as LocationData[],
    };

    try {
      // Get parent location if exists
      if (locationData.connections.parentLocation) {
        connections.parent = await this.getLocationData(
          locationData.connections.parentLocation, 
          sourceName
        );
      }

      // Get child locations
      for (const childName of locationData.connections.childLocations) {
        try {
          const child = await this.getLocationData(childName, sourceName);
          connections.children.push(child);
        } catch (error) {
          console.warn(`Could not fetch child location: ${childName}`);
        }
      }

      // Get neighboring locations
      for (const neighborName of locationData.connections.neighboringAreas) {
        try {
          const neighbor = await this.getLocationData(neighborName, sourceName);
          connections.neighbors.push(neighbor);
        } catch (error) {
          console.warn(`Could not fetch neighboring location: ${neighborName}`);
        }
      }

      return connections;
    } catch (error) {
      console.error(`Error fetching location connections for ${locationName}:`, error);
      throw new Error(`Failed to fetch connections for "${locationName}"`);
    }
  }

  private processLocationData(
    locationName: string,
    sourceName: string,
    wikiData: any,
    timePeriod?: string
  ): LocationData {
    const baseData: LocationData = {
      name: locationName,
      aliases: [],
      source: sourceName,
      type: 'other',
      description: '',
      geography: {},
      population: {},
      features: {
        landmarks: [],
        importantBuildings: [],
        naturalFeatures: [],
      },
      history: {
        keyEvents: [],
        significance: '',
      },
      connections: {
        childLocations: [],
        neighboringAreas: [],
        accessMethods: [],
      },
      currentStatus: {
        condition: 'unknown',
        timePeriod: timePeriod,
      },
      notableResidents: [],
      lastUpdated: new Date().toISOString(),
    };

    // Process wiki data if available
    if (wikiData) {
      baseData.aliases = wikiData.aliases || baseData.aliases;
      baseData.type = this.determineLocationType(wikiData.type || locationName);
      baseData.description = wikiData.description || baseData.description;
      baseData.geography = { ...baseData.geography, ...wikiData.geography };
      baseData.population = { ...baseData.population, ...wikiData.population };
      baseData.features = { ...baseData.features, ...wikiData.features };
      baseData.history = { ...baseData.history, ...wikiData.history };
      baseData.connections = { ...baseData.connections, ...wikiData.connections };
      baseData.currentStatus = { ...baseData.currentStatus, ...wikiData.currentStatus };
      baseData.notableResidents = wikiData.notableResidents || baseData.notableResidents;
      baseData.images = wikiData.images || baseData.images;
    }

    // Apply time period specific modifications
    if (timePeriod) {
      baseData.currentStatus.timePeriod = timePeriod;
      const modifiedData = this.applyTimePeriodContext(baseData, timePeriod);
      Object.assign(baseData, modifiedData);
    }

    return baseData;
  }

  private determineLocationType(typeHint: string): LocationData['type'] {
    const type = typeHint.toLowerCase();
    
    if (type.includes('city') || type.includes('town')) return 'city';
    if (type.includes('village')) return 'village';
    if (type.includes('country') || type.includes('nation')) return 'country';
    if (type.includes('island')) return 'island';
    if (type.includes('building') || type.includes('structure')) return 'building';
    if (type.includes('landmark') || type.includes('monument')) return 'landmark';
    if (type.includes('dimension') || type.includes('realm')) return 'dimension';
    
    return 'other';
  }

  private applyTimePeriodContext(locationData: LocationData, timePeriod: string): LocationData {
    // This method can be expanded to handle time-specific location changes
    // For example, destruction during wars, rebuilding after conflicts, etc.
    
    const period = timePeriod.toLowerCase();
    
    if (period.includes('war') || period.includes('battle')) {
      // During war times, locations might be damaged or under siege
      if (locationData.currentStatus.condition === 'thriving') {
        locationData.currentStatus.condition = 'declining';
      }
      locationData.currentStatus.accessibility = 'Restricted due to conflict';
    }
    
    if (period.includes('post') || period.includes('after')) {
      // Post-conflict periods might show rebuilding
      if (locationData.currentStatus.condition === 'destroyed') {
        locationData.currentStatus.condition = 'declining'; // Recovering
      }
    }

    return locationData;
  }

  async validateLocationExists(
    locationName: string,
    sourceName: string
  ): Promise<{ exists: boolean; confidence: number; suggestions?: string[] }> {
    try {
      const searchResults = await this.searchLocations(sourceName, locationName);
      
      const exactMatch = searchResults.find(result => 
        result.name.toLowerCase() === locationName.toLowerCase()
      );

      if (exactMatch) {
        return { exists: true, confidence: 1.0 };
      }

      // Look for partial matches
      const partialMatches = searchResults
        .filter(result => result.score > 0.5)
        .slice(0, 3)
        .map(result => result.name);

      if (partialMatches.length > 0) {
        return { 
          exists: false, 
          confidence: 0.7, 
          suggestions: partialMatches 
        };
      }

      return { exists: false, confidence: 0 };
    } catch (error) {
      console.error(`Error validating location existence:`, error);
      return { exists: false, confidence: 0 };
    }
  }
}
