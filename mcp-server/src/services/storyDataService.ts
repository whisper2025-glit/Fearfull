import axios from 'axios';
import { Cache } from '../utils/cache.js';
import { WikiDataFetcher } from '../data-sources/wikiDataFetcher.js';
import { AnimeDataFetcher } from '../data-sources/animeDataFetcher.js';
import { AniListDataFetcher } from '../data-sources/aniListDataFetcher.js';
import { MangaDexDataFetcher } from '../data-sources/mangaDexDataFetcher.js';

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
  private aniListDataFetcher: AniListDataFetcher;
  private mangaDexDataFetcher: MangaDexDataFetcher;

  constructor() {
    this.cache = new Cache();
    this.wikiDataFetcher = new WikiDataFetcher();
    this.animeDataFetcher = new AnimeDataFetcher();
    this.aniListDataFetcher = new AniListDataFetcher();
    this.mangaDexDataFetcher = new MangaDexDataFetcher();
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
      const [wikiData, animeData, aniListAnimeData, aniListMangaData, mangaDexData] = await Promise.allSettled([
        this.wikiDataFetcher.getStoryInfo(sourceName),
        this.animeDataFetcher.getAnimeInfo(sourceName),
        this.aniListDataFetcher.getAnimeInfo(sourceName),
        this.aniListDataFetcher.getMangaInfo(sourceName),
        this.mangaDexDataFetcher.getMangaInfo(sourceName)
      ]);

      // Combine data from different sources
      const storyInfo = this.combineStoryData(sourceName, {
        wiki: wikiData,
        anime: animeData,
        aniListAnime: aniListAnimeData,
        aniListManga: aniListMangaData,
        mangaDex: mangaDexData
      }, setting, arc);
      
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
      
      // Search in all data sources
      const [wikiResults, animeResults, aniListResults, mangaDexResults] = await Promise.allSettled([
        this.wikiDataFetcher.searchContent(sourceName, query, contentType),
        this.animeDataFetcher.searchContent(sourceName, query, contentType),
        this.aniListDataFetcher.searchMedia(query, contentType === 'anime' ? 'ANIME' : contentType === 'manga' ? 'MANGA' : undefined),
        this.mangaDexDataFetcher.searchContent(sourceName, query, contentType)
      ]);

      // Combine results from all sources
      if (wikiResults.status === 'fulfilled') results.push(...wikiResults.value);
      if (animeResults.status === 'fulfilled') results.push(...animeResults.value);
      if (aniListResults.status === 'fulfilled') {
        const aniListFormattedResults = aniListResults.value.map(item => ({
          type: item.type.toLowerCase(),
          name: item.title.romaji || item.title.english || 'Unknown',
          description: item.description || '',
          source: 'anilist',
          relevanceScore: 0.8,
          additionalInfo: {
            anilist_id: item.id,
            genres: item.genres,
            averageScore: item.averageScore
          }
        }));
        results.push(...aniListFormattedResults);
      }
      if (mangaDexResults.status === 'fulfilled') results.push(...mangaDexResults.value);

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

      if (exactMatches.length > 0 && exactMatches[0]) {
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
    allData: {
      wiki: PromiseSettledResult<any>;
      anime: PromiseSettledResult<any>;
      aniListAnime: PromiseSettledResult<any>;
      aniListManga: PromiseSettledResult<any>;
      mangaDx: PromiseSettledResult<any>;
    },
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
    if (allData.wiki.status === 'fulfilled' && allData.wiki.value) {
      const wiki = allData.wiki.value as any;
      if (wiki) {
        baseInfo.description = wiki.description || baseInfo.description;
        baseInfo.plotSummary = wiki.plotSummary || baseInfo.plotSummary;
        baseInfo.worldBuilding = { ...baseInfo.worldBuilding, ...(wiki.worldBuilding || {}) };
        baseInfo.mainCharacters = wiki.mainCharacters || baseInfo.mainCharacters;
        baseInfo.arcs = wiki.arcs || baseInfo.arcs;
      }
    }

    // Merge Jikan anime data
    if (allData.anime.status === 'fulfilled' && allData.anime.value) {
      const anime = allData.anime.value as any;
      if (anime) {
        baseInfo.type = 'anime';
        baseInfo.description = anime.synopsis || baseInfo.description;
        if (anime.characters && Array.isArray(anime.characters)) {
          baseInfo.mainCharacters = [...new Set([...baseInfo.mainCharacters, ...anime.characters])];
        }
      }
    }

    // Merge AniList anime data
    if (allData.aniListAnime.status === 'fulfilled' && allData.aniListAnime.value) {
      const aniAnime = allData.aniListAnime.value as any;
      if (aniAnime) {
        baseInfo.type = 'anime';
        baseInfo.description = aniAnime.description || baseInfo.description;
        if (aniAnime.characters && Array.isArray(aniAnime.characters)) {
          baseInfo.mainCharacters = [...new Set([...baseInfo.mainCharacters, ...aniAnime.characters])];
        }
        if (aniAnime.genres) {
          baseInfo.worldBuilding.powerSystem = aniAnime.genres.join(', ');
        }
      }
    }

    // Merge AniList manga data
    if (allData.aniListManga.status === 'fulfilled' && allData.aniListManga.value) {
      const aniManga = allData.aniListManga.value as any;
      if (aniManga) {
        baseInfo.type = 'manga';
        baseInfo.description = aniManga.description || baseInfo.description;
        if (aniManga.characters && Array.isArray(aniManga.characters)) {
          baseInfo.mainCharacters = [...new Set([...baseInfo.mainCharacters, ...aniManga.characters])];
        }
      }
    }

    // Merge MangaDex data
    if (allData.mangaDx.status === 'fulfilled' && allData.mangaDx.value) {
      const mangaDx = allData.mangaDx.value as any;
      if (mangaDx) {
        baseInfo.type = 'manga';
        baseInfo.description = mangaDx.description || baseInfo.description;
        if (mangaDx.authors) {
          baseInfo.worldBuilding.mainOrganizations = [...baseInfo.worldBuilding.mainOrganizations, ...mangaDx.authors];
        }
      }
    }

    return baseInfo;
  }
}
