import axios from 'axios';
import * as cheerio from 'cheerio';
import Fuse from 'fuse.js';

export interface WikiSearchResult {
  name: string;
  score: number;
  basicInfo: any;
}

export class WikiDataFetcher {
  private readonly baseUrls = {
    fandom: 'https://{wiki}.fandom.com/api.php',
    wikipedia: 'https://en.wikipedia.org/api/rest_v1',
  };

  private wikiMappings: { [key: string]: string } = {
    'one piece': 'onepiece',
    'naruto': 'naruto',
    'dragon ball': 'dragonball',
    'attack on titan': 'shingekinokyojin',
    'demon slayer': 'kimetsu-no-yaiba',
    'my hero academia': 'bokunoheroacademia',
    'jujutsu kaisen': 'jujutsu-kaisen',
    'bleach': 'bleach',
    'fullmetal alchemist': 'fma',
    'death note': 'deathnote',
    'hunter x hunter': 'hunterxhunter',
  };

  async getStoryInfo(sourceName: string): Promise<any> {
    try {
      const wikiName = this.getWikiName(sourceName);
      if (!wikiName) {
        throw new Error(`No wiki mapping found for ${sourceName}`);
      }

      // Get main story page
      const storyData = await this.fetchWikiPage(wikiName, sourceName);
      
      return {
        description: storyData.extract || '',
        plotSummary: storyData.plot || '',
        worldBuilding: this.extractWorldBuilding(storyData.content),
        mainCharacters: this.extractMainCharacters(storyData.content),
        arcs: await this.getStoryArcs(wikiName, sourceName),
      };
    } catch (error) {
      console.error(`Error fetching story info for ${sourceName}:`, error);
      return null;
    }
  }

  async getCharacterInfo(sourceName: string, characterName: string): Promise<any> {
    try {
      const wikiName = this.getWikiName(sourceName);
      if (!wikiName) {
        return null;
      }

      const characterData = await this.fetchWikiPage(wikiName, characterName);
      
      return {
        aliases: this.extractAliases(characterData.content),
        appearance: this.extractAppearanceInfo(characterData.content),
        personality: this.extractPersonalityInfo(characterData.content),
        abilities: this.extractAbilities(characterData.content),
        relationships: this.extractRelationships(characterData.content),
        backstory: this.extractBackstory(characterData.content),
        currentStatus: this.extractCurrentStatus(characterData.content),
        quotes: this.extractQuotes(characterData.content),
        images: characterData.images || [],
      };
    } catch (error) {
      console.error(`Error fetching character info for ${characterName}:`, error);
      return null;
    }
  }

  async getLocationInfo(sourceName: string, locationName: string): Promise<any> {
    try {
      const wikiName = this.getWikiName(sourceName);
      if (!wikiName) {
        return null;
      }

      const locationData = await this.fetchWikiPage(wikiName, locationName);
      
      return {
        aliases: this.extractAliases(locationData.content),
        type: this.extractLocationType(locationData.content),
        description: locationData.extract || '',
        geography: this.extractGeography(locationData.content),
        population: this.extractPopulation(locationData.content),
        features: this.extractLocationFeatures(locationData.content),
        history: this.extractLocationHistory(locationData.content),
        connections: this.extractLocationConnections(locationData.content),
        currentStatus: this.extractLocationStatus(locationData.content),
        notableResidents: this.extractNotableResidents(locationData.content),
        images: locationData.images || [],
      };
    } catch (error) {
      console.error(`Error fetching location info for ${locationName}:`, error);
      return null;
    }
  }

  async getTimelineEvents(sourceName: string, arcName?: string): Promise<any[]> {
    try {
      const wikiName = this.getWikiName(sourceName);
      if (!wikiName) {
        return [];
      }

      // Try to find timeline or episode list pages
      const timelinePages = [
        `${sourceName} Timeline`,
        `${sourceName} Episode List`,
        `${sourceName} Chapter List`,
        `List of ${sourceName} episodes`,
        `${arcName} Arc`
      ].filter(Boolean);

      const events: any[] = [];

      for (const pageName of timelinePages) {
        try {
          const pageData = await this.fetchWikiPage(wikiName, pageName);
          const pageEvents = this.extractTimelineEvents(pageData.content, arcName);
          events.push(...pageEvents);
        } catch (error) {
          console.warn(`Could not fetch timeline from ${pageName}`);
        }
      }

      return events;
    } catch (error) {
      console.error(`Error fetching timeline events for ${sourceName}:`, error);
      return [];
    }
  }

  async searchContent(sourceName: string, query: string, contentType?: string): Promise<any[]> {
    try {
      const wikiName = this.getWikiName(sourceName);
      if (!wikiName) {
        return [];
      }

      const searchResults = await this.performWikiSearch(wikiName, query);
      
      // Filter by content type if specified
      if (contentType && contentType !== 'all') {
        return searchResults.filter(result => 
          this.matchesContentType(result.name, contentType)
        );
      }

      return searchResults;
    } catch (error) {
      console.error(`Error searching content in ${sourceName}:`, error);
      return [];
    }
  }

  async searchCharacters(sourceName: string, query: string): Promise<WikiSearchResult[]> {
    try {
      const results = await this.searchContent(sourceName, query, 'character');
      return results.map(result => ({
        name: result.name,
        score: result.relevanceScore,
        basicInfo: result.additionalInfo
      }));
    } catch (error) {
      console.error(`Error searching characters:`, error);
      return [];
    }
  }

  async searchLocations(sourceName: string, query: string): Promise<WikiSearchResult[]> {
    try {
      const results = await this.searchContent(sourceName, query, 'location');
      return results.map(result => ({
        name: result.name,
        score: result.relevanceScore,
        basicInfo: result.additionalInfo
      }));
    } catch (error) {
      console.error(`Error searching locations:`, error);
      return [];
    }
  }

  async getAllLocations(sourceName: string): Promise<any[]> {
    try {
      const wikiName = this.getWikiName(sourceName);
      if (!wikiName) {
        return [];
      }

      // Try to find location category pages
      const locationCategories = [
        'Category:Locations',
        'Category:Places',
        'Category:Islands',
        'Category:Cities',
        'Category:Villages'
      ];

      const locations: any[] = [];

      for (const category of locationCategories) {
        try {
          const categoryMembers = await this.getCategoryMembers(wikiName, category);
          locations.push(...categoryMembers);
        } catch (error) {
          console.warn(`Could not fetch category ${category}`);
        }
      }

      return locations;
    } catch (error) {
      console.error(`Error fetching all locations for ${sourceName}:`, error);
      return [];
    }
  }

  private async fetchWikiPage(wikiName: string, pageName: string): Promise<any> {
    try {
      const url = this.baseUrls.fandom.replace('{wiki}', wikiName);
      
      // First, get page info
      const pageInfoResponse = await axios.get(url, {
        params: {
          action: 'query',
          format: 'json',
          titles: pageName,
          prop: 'extracts|images|pageimages',
          exintro: true,
          explaintext: true,
          exsectionformat: 'wiki',
        },
        timeout: 10000,
      });

      const pages = pageInfoResponse.data.query?.pages;
      if (!pages) {
        throw new Error(`No pages found for ${pageName}`);
      }

      const pageId = Object.keys(pages)[0];
      if (!pageId) {
        throw new Error(`No page ID found for ${pageName}`);
      }
      const page = pages[pageId];

      if (pageId === '-1') {
        throw new Error(`Page not found: ${pageName}`);
      }

      // Get full page content
      const contentResponse = await axios.get(url, {
        params: {
          action: 'query',
          format: 'json',
          pageids: pageId,
          prop: 'revisions',
          rvprop: 'content',
          rvslots: 'main',
        },
        timeout: 10000,
      });

      const contentPage = contentResponse.data.query?.pages?.[pageId];
      const fullContent = contentPage?.revisions?.[0]?.slots?.main?.['*'] || '';

      return {
        title: page.title,
        extract: page.extract,
        content: fullContent,
        images: page.images || [],
      };
    } catch (error) {
      console.error(`Error fetching wiki page ${pageName}:`, error);
      throw error;
    }
  }

  private async performWikiSearch(wikiName: string, query: string): Promise<any[]> {
    try {
      const url = this.baseUrls.fandom.replace('{wiki}', wikiName);
      
      const response = await axios.get(url, {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: query,
          srlimit: 20,
        },
        timeout: 10000,
      });

      const searchResults = response.data.query?.search || [];
      
      return searchResults.map((result: any, index: number) => ({
        type: this.determineContentType(result.title),
        name: result.title,
        description: result.snippet || '',
        source: wikiName,
        relevanceScore: (20 - index) / 20, // Simple scoring based on search order
        additionalInfo: {
          wordcount: result.wordcount,
          size: result.size,
        }
      }));
    } catch (error) {
      console.error(`Error performing wiki search:`, error);
      return [];
    }
  }

  private async getCategoryMembers(wikiName: string, categoryName: string): Promise<any[]> {
    try {
      const url = this.baseUrls.fandom.replace('{wiki}', wikiName);
      
      const response = await axios.get(url, {
        params: {
          action: 'query',
          format: 'json',
          list: 'categorymembers',
          cmtitle: categoryName,
          cmlimit: 100,
        },
        timeout: 10000,
      });

      return response.data.query?.categorymembers || [];
    } catch (error) {
      console.error(`Error fetching category members:`, error);
      return [];
    }
  }

  private getWikiName(sourceName: string): string | null {
    const normalizedName = sourceName.toLowerCase().trim();
    return this.wikiMappings[normalizedName] || null;
  }

  private determineContentType(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('character') || lower.includes('person')) return 'character';
    if (lower.includes('location') || lower.includes('place') || lower.includes('island') || lower.includes('city')) return 'location';
    if (lower.includes('ability') || lower.includes('technique') || lower.includes('power')) return 'ability';
    if (lower.includes('organization') || lower.includes('group') || lower.includes('crew')) return 'organization';
    if (lower.includes('item') || lower.includes('weapon') || lower.includes('tool')) return 'item';
    if (lower.includes('event') || lower.includes('battle') || lower.includes('war')) return 'event';
    return 'other';
  }

  private matchesContentType(title: string, contentType: string): boolean {
    return this.determineContentType(title) === contentType;
  }

  // Content extraction methods (simplified implementations)
  private extractWorldBuilding(content: string): any {
    return {
      setting: 'Fantasy/Adventure',
      timeType: 'Alternative Timeline',
      importantLocations: [],
      mainOrganizations: [],
    };
  }

  private extractMainCharacters(content: string): string[] {
    // Simple character extraction logic
    const characterPattern = /\[\[([^|\]]+)(?:\|[^]]+)?\]\]/g;
    const matches = content.match(characterPattern) || [];
    return matches.slice(0, 10).map(match => match.replace(/\[\[|\]\]/g, '').split('|')[0]).filter(Boolean);
  }

  private extractAliases(content: string): string[] {
    // Extract aliases from infobox or content
    return [];
  }

  private extractAppearanceInfo(content: string): any {
    return { description: '' };
  }

  private extractPersonalityInfo(content: string): any {
    return { traits: [], description: '' };
  }

  private extractAbilities(content: string): any {
    return {
      powers: [],
      skills: [],
      weapons: [],
      specialAbilities: [],
    };
  }

  private extractRelationships(content: string): any {
    return {
      allies: [],
      enemies: [],
      family: [],
    };
  }

  private extractBackstory(content: string): any {
    return {
      origin: '',
      keyEvents: [],
      development: [],
    };
  }

  private extractCurrentStatus(content: string): any {
    return {
      alive: true,
    };
  }

  private extractQuotes(content: string): string[] {
    return [];
  }

  private extractTimelineEvents(content: string, arcName?: string): any[] {
    return [];
  }

  private extractLocationType(content: string): string {
    return 'other';
  }

  private extractGeography(content: string): any {
    return {};
  }

  private extractPopulation(content: string): any {
    return {};
  }

  private extractLocationFeatures(content: string): any {
    return {
      landmarks: [],
      importantBuildings: [],
      naturalFeatures: [],
    };
  }

  private extractLocationHistory(content: string): any {
    return {
      keyEvents: [],
      significance: '',
    };
  }

  private extractLocationConnections(content: string): any {
    return {
      childLocations: [],
      neighboringAreas: [],
      accessMethods: [],
    };
  }

  private extractLocationStatus(content: string): any {
    return {
      condition: 'unknown',
    };
  }

  private extractNotableResidents(content: string): string[] {
    return [];
  }

  private async getStoryArcs(wikiName: string, sourceName: string): Promise<any[]> {
    // Simplified implementation - would need to be expanded for each specific source
    return [];
  }
}
