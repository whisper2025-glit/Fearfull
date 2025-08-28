import axios from 'axios';

export interface AnimeInfo {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  type: string;
  episodes?: number;
  status: string;
  rating: string;
  synopsis: string;
  characters: string[];
  images: string[];
  genres: string[];
  themes: string[];
  studios: string[];
  year?: number;
}

export class AnimeDataFetcher {
  private readonly jikanBaseUrl = 'https://api.jikan.moe/v4';
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // 1 second between requests

  private async rateLimitedRequest(url: string, params?: any): Promise<any> {
    // Ensure we don't exceed rate limits
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(url, { 
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'Adventure-Story-MCP-Server/1.0.0'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          // Rate limited, wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 3000));
          return this.rateLimitedRequest(url, params);
        }
        if (error.response?.status === 404) {
          return null; // Not found
        }
      }
      throw error;
    }
  }

  async getAnimeInfo(sourceName: string): Promise<AnimeInfo | null> {
    try {
      // First, search for the anime
      const searchResults = await this.searchAnime(sourceName);
      
      if (!searchResults || searchResults.length === 0) {
        console.warn(`No anime found for: ${sourceName}`);
        return null;
      }

      // Get the first match (most relevant)
      const anime = searchResults[0];
      
      // Get detailed information
      const detailedInfo = await this.getAnimeDetails(anime.mal_id);
      
      if (!detailedInfo) {
        return anime;
      }

      // Get characters
      const characters = await this.getAnimeCharacters(anime.mal_id);
      
      return {
        ...detailedInfo,
        characters: characters.map(char => char.name).slice(0, 20), // Top 20 characters
      };
    } catch (error) {
      console.error(`Error fetching anime info for ${sourceName}:`, error);
      return null;
    }
  }

  async getCharacterInfo(sourceName: string, characterName: string): Promise<any> {
    try {
      // Search for the character
      const searchResults = await this.searchCharacter(characterName);
      
      if (!searchResults || searchResults.length === 0) {
        return null;
      }

      // Find character from the correct anime
      const character = searchResults.find(char => 
        char.anime?.some((anime: any) => 
          anime.title?.toLowerCase().includes(sourceName.toLowerCase())
        )
      ) || searchResults[0];

      if (!character) {
        return null;
      }

      // Get detailed character info
      const detailedChar = await this.getCharacterDetails(character.mal_id);
      
      return {
        description: detailedChar?.about || '',
        images: detailedChar?.images ? Object.values(detailedChar.images).flat() : [],
        voiceActors: detailedChar?.voice_actors || [],
        animeography: detailedChar?.anime || [],
      };
    } catch (error) {
      console.error(`Error fetching character info for ${characterName}:`, error);
      return null;
    }
  }

  async searchContent(sourceName: string, query: string, contentType?: string): Promise<any[]> {
    try {
      let results: any[] = [];

      // Search based on content type
      switch (contentType) {
        case 'character':
          const characters = await this.searchCharacter(query);
          results = characters.map(char => ({
            type: 'character',
            name: char.name,
            description: char.about || '',
            source: sourceName,
            relevanceScore: this.calculateRelevanceScore(char.name, query),
            additionalInfo: {
              mal_id: char.mal_id,
              favorites: char.favorites,
              images: char.images
            }
          }));
          break;

        case 'anime':
        case 'all':
        default:
          const anime = await this.searchAnime(query);
          results = anime.map(ani => ({
            type: 'anime',
            name: ani.title,
            description: ani.synopsis || '',
            source: sourceName,
            relevanceScore: this.calculateRelevanceScore(ani.title, query),
            additionalInfo: {
              mal_id: ani.mal_id,
              type: ani.type,
              episodes: ani.episodes,
              score: ani.score
            }
          }));
          
          // If searching all content, also add characters
          if (contentType === 'all') {
            const characters = await this.searchCharacter(query);
            const characterResults = characters.map(char => ({
              type: 'character',
              name: char.name,
              description: char.about || '',
              source: sourceName,
              relevanceScore: this.calculateRelevanceScore(char.name, query),
              additionalInfo: {
                mal_id: char.mal_id,
                favorites: char.favorites
              }
            }));
            results = [...results, ...characterResults];
          }
          break;
      }

      // Sort by relevance score
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error(`Error searching content:`, error);
      return [];
    }
  }

  private async searchAnime(query: string): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/anime`, {
        q: query,
        limit: 10,
        order_by: 'score',
        sort: 'desc'
      });

      return data?.data || [];
    } catch (error) {
      console.error(`Error searching anime:`, error);
      return [];
    }
  }

  private async searchCharacter(query: string): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/characters`, {
        q: query,
        limit: 10,
        order_by: 'favorites',
        sort: 'desc'
      });

      return data?.data || [];
    } catch (error) {
      console.error(`Error searching characters:`, error);
      return [];
    }
  }

  private async getAnimeDetails(malId: number): Promise<AnimeInfo | null> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/anime/${malId}`);
      
      if (!data?.data) {
        return null;
      }

      const anime = data.data;
      
      return {
        mal_id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        title_japanese: anime.title_japanese,
        type: anime.type,
        episodes: anime.episodes,
        status: anime.status,
        rating: anime.rating,
        synopsis: anime.synopsis || '',
        characters: [], // Will be filled separately
        images: anime.images ? (Object.values(anime.images).flat() as string[]) : [],
        genres: anime.genres?.map((genre: any) => genre.name) || [],
        themes: anime.themes?.map((theme: any) => theme.name) || [],
        studios: anime.studios?.map((studio: any) => studio.name) || [],
        year: anime.year,
      };
    } catch (error) {
      console.error(`Error getting anime details:`, error);
      return null;
    }
  }

  private async getCharacterDetails(malId: number): Promise<any> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/characters/${malId}`);
      return data?.data || null;
    } catch (error) {
      console.error(`Error getting character details:`, error);
      return null;
    }
  }

  private async getAnimeCharacters(malId: number): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/anime/${malId}/characters`);
      
      if (!data?.data) {
        return [];
      }

      return data.data.map((item: any) => ({
        mal_id: item.character.mal_id,
        name: item.character.name,
        role: item.role,
        favorites: item.character.favorites,
        images: item.character.images
      }));
    } catch (error) {
      console.error(`Error getting anime characters:`, error);
      return [];
    }
  }

  private calculateRelevanceScore(title: string, query: string): number {
    const normalizedTitle = title.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Exact match
    if (normalizedTitle === normalizedQuery) {
      return 1.0;
    }
    
    // Title starts with query
    if (normalizedTitle.startsWith(normalizedQuery)) {
      return 0.9;
    }
    
    // Title contains query
    if (normalizedTitle.includes(normalizedQuery)) {
      return 0.7;
    }
    
    // Query contains title (for shorter titles)
    if (normalizedQuery.includes(normalizedTitle)) {
      return 0.6;
    }
    
    // Check for word matches
    const titleWords = normalizedTitle.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    
    const matchingWords = titleWords.filter(word => 
      queryWords.some(qWord => word.includes(qWord) || qWord.includes(word))
    );
    
    if (matchingWords.length > 0) {
      return Math.min(0.5, matchingWords.length / Math.max(titleWords.length, queryWords.length));
    }
    
    return 0.1; // Default low score
  }

  async getAnimeEpisodes(malId: number): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/anime/${malId}/episodes`);
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting anime episodes:`, error);
      return [];
    }
  }

  async getAnimeStaff(malId: number): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/anime/${malId}/staff`);
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting anime staff:`, error);
      return [];
    }
  }

  async getAnimeRecommendations(malId: number): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/anime/${malId}/recommendations`);
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting anime recommendations:`, error);
      return [];
    }
  }

  async getSeasonalAnime(year: number, season: 'winter' | 'spring' | 'summer' | 'fall'): Promise<any[]> {
    try {
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/seasons/${year}/${season}`);
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting seasonal anime:`, error);
      return [];
    }
  }

  async getTopAnime(type?: string, filter?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (type) params.type = type;
      if (filter) params.filter = filter;
      
      const data = await this.rateLimitedRequest(`${this.jikanBaseUrl}/top/anime`, params);
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting top anime:`, error);
      return [];
    }
  }
}
