import axios from 'axios';
import { Cache } from '../utils/cache.js';
import { WikiDataFetcher } from '../data-sources/wikiDataFetcher.js';
import { AnimeDataFetcher } from '../data-sources/animeDataFetcher.js';

export interface StoryInfo {
  name: string;
  type: 'anime' | 'manga' | 'novel' | 'game' | 'other';
  description: string;
  worldBuilding: {
    setting: string;
    timeType: string;
    powerSystem?: string;
    importantLocations: string[];
    mainOrganizations: string[];
  };
  plotSummary: string;
  mainCharacters: string[];
  currentArc?: string;
  arcs: Array<{
    name: string;
    description: string;
    episodes?: string;
    chapters?: string;
    keyEvents: string[];
  }>;
  lastUpdated: string;
}

export interface TimelineEvent {
  episode?: number;
  chapter?: number;
  arc: string;
  event: string;
  characters: string[];
  location: string;
  significance: string;
  consequences: string[];
}

export interface SearchResult {
  type: 'character' | 'location' | 'ability' | 'event' | 'item' | 'organization';
  name: string;
  description: string;
  source: string;
  relevanceScore: number;
  additionalInfo?: any;
}

export interface ValidationResult {
  isValid: boolean;
  elementName: string;
  elementType: string;
  source: string;
  confidence: number;
  alternativeSuggestions?: string[];
  canonicalInfo?: any;
}

export class StoryDataService {
  private cache: Cache;
  private wikiDataFetcher: WikiDataFetcher;
  private animeDataFetcher: AnimeDataFetcher;

  constructor() {
    this.cache = new Cache();
    this.wikiDataFetcher = new WikiDataFetcher();
    this.animeDataFetcher = new AnimeDataFetcher();
  }

  async getStoryInfo(sourceName: string, setting?: string, arc?: string): Promise<StoryInfo> {
    const cacheKey = `story_info:${sourceName}:${setting || 'default'}:${arc || 'default'}`;
    
    // Check cache first
    const cached = this.cache.get<StoryInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Try to get data from multiple sources
      const [wikiData, animeData] = await Promise.allSettled([
        this.wikiDataFetcher.getStoryInfo(sourceName),
        this.animeDataFetcher.getAnimeInfo(sourceName)
      ]);

      // Combine data from different sources
      const storyInfo = this.combineStoryData(sourceName, wikiData, animeData, setting, arc);
      
      // Cache the result
      this.cache.set(cacheKey, storyInfo);
      
      return storyInfo;
    } catch (error) {
      console.error(`Error fetching story info for ${sourceName}:`, error);
      throw new Error(`Failed to fetch story information for "${sourceName}"`);
    }
  }

  async getTimelineEvents(
    sourceName: string, 
    arcName?: string, 
    episodeRange?: string, 
    chapterRange?: string
  ): Promise<TimelineEvent[]> {
    const cacheKey = `timeline:${sourceName}:${arcName || 'all'}:${episodeRange || ''}:${chapterRange || ''}`;
    
    const cached = this.cache.get<TimelineEvent[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const events: TimelineEvent[] = [];
      
      // Get timeline data from wiki
      const wikiEvents = await this.wikiDataFetcher.getTimelineEvents(sourceName, arcName);
      events.push(...wikiEvents);

      // Filter by episode/chapter range if specified
      let filteredEvents = events;
      
      if (episodeRange) {
        const rangeParts = episodeRange.split('-').map(num => parseInt(num.trim()));
        const start = rangeParts[0];
        const end = rangeParts[1];
        if (start !== undefined && end !== undefined) {
          filteredEvents = events.filter(event =>
            event.episode && event.episode >= start && event.episode <= end
          );
        }
      }

      if (chapterRange) {
        const rangeParts = chapterRange.split('-').map(num => parseInt(num.trim()));
        const start = rangeParts[0];
        const end = rangeParts[1];
        if (start !== undefined && end !== undefined) {
          filteredEvents = events.filter(event =>
            event.chapter && event.chapter >= start && event.chapter <= end
          );
        }
      }

      this.cache.set(cacheKey, filteredEvents);
      return filteredEvents;
    } catch (error) {
      console.error(`Error fetching timeline events for ${sourceName}:`, error);
      throw new Error(`Failed to fetch timeline events for "${sourceName}"`);
    }
  }

  async searchStoryContent(
    sourceName: string, 
    query: string, 
    contentType?: string
  ): Promise<SearchResult[]> {
    const cacheKey = `search:${sourceName}:${query}:${contentType || 'all'}`;
    
    const cached = this.cache.get<SearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results: SearchResult[] = [];
      
      // Search in wiki data
      const wikiResults = await this.wikiDataFetcher.searchContent(sourceName, query, contentType);
      results.push(...wikiResults);

      // Search in anime database
      const animeResults = await this.animeDataFetcher.searchContent(sourceName, query, contentType);
      results.push(...animeResults);

      // Sort by relevance score
      const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      this.cache.set(cacheKey, sortedResults);
      return sortedResults;
    } catch (error) {
      console.error(`Error searching story content for ${sourceName}:`, error);
      throw new Error(`Failed to search content in "${sourceName}"`);
    }
  }

  async validateStoryElement(
    sourceName: string, 
    elementType: string, 
    elementName: string, 
    context?: string
  ): Promise<ValidationResult> {
    const cacheKey = `validate:${sourceName}:${elementType}:${elementName}:${context || 'default'}`;
    
    const cached = this.cache.get<ValidationResult>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Search for the element in the story
      const searchResults = await this.searchStoryContent(sourceName, elementName, elementType);
      
      // Check if we have exact matches
      const exactMatches = searchResults.filter(result => 
        result.name.toLowerCase() === elementName.toLowerCase() && 
        result.type === elementType
      );

      let validation: ValidationResult;

      if (exactMatches.length > 0) {
        validation = {
          isValid: true,
          elementName,
          elementType,
          source: sourceName,
          confidence: exactMatches[0].relevanceScore,
          canonicalInfo: exactMatches[0].additionalInfo
        };
      } else {
        // Look for similar matches
        const similarMatches = searchResults
          .filter(result => result.type === elementType)
          .slice(0, 3)
          .map(result => result.name);

        validation = {
          isValid: false,
          elementName,
          elementType,
          source: sourceName,
          confidence: 0,
          alternativeSuggestions: similarMatches
        };
      }

      this.cache.set(cacheKey, validation);
      return validation;
    } catch (error) {
      console.error(`Error validating story element:`, error);
      throw new Error(`Failed to validate "${elementName}" in "${sourceName}"`);
    }
  }

  private combineStoryData(
    sourceName: string,
    wikiData: PromiseSettledResult<any>,
    animeData: PromiseSettledResult<any>,
    setting?: string,
    arc?: string
  ): StoryInfo {
    const baseInfo: StoryInfo = {
      name: sourceName,
      type: 'other',
      description: '',
      worldBuilding: {
        setting: setting || 'Unknown',
        timeType: 'Unknown',
        importantLocations: [],
        mainOrganizations: []
      },
      plotSummary: '',
      mainCharacters: [],
      currentArc: arc,
      arcs: [],
      lastUpdated: new Date().toISOString()
    };

    // Merge wiki data
    if (wikiData.status === 'fulfilled' && wikiData.value) {
      const wiki = wikiData.value as any;
      baseInfo.description = wiki.description || baseInfo.description;
      baseInfo.plotSummary = wiki.plotSummary || baseInfo.plotSummary;
      baseInfo.worldBuilding = { ...baseInfo.worldBuilding, ...(wiki.worldBuilding || {}) };
      baseInfo.mainCharacters = wiki.mainCharacters || baseInfo.mainCharacters;
      baseInfo.arcs = wiki.arcs || baseInfo.arcs;
    }

    // Merge anime data
    if (animeData.status === 'fulfilled' && animeData.value) {
      const anime = animeData.value as any;
      baseInfo.type = 'anime';
      baseInfo.description = anime.synopsis || baseInfo.description;
      if (anime.characters && Array.isArray(anime.characters)) {
        baseInfo.mainCharacters = [...new Set([...baseInfo.mainCharacters, ...anime.characters])];
      }
    }

    return baseInfo;
  }
}
