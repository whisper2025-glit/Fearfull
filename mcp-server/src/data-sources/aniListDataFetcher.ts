import axios from 'axios';

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  description: string;
  type: 'ANIME' | 'MANGA';
  format: string;
  status: string;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  genres: string[];
  tags: Array<{
    name: string;
    description: string;
    rank: number;
  }>;
  characters: {
    nodes: Array<{
      id: number;
      name: {
        first?: string;
        middle?: string;
        last?: string;
        full: string;
        native?: string;
      };
      description?: string;
      image: {
        large: string;
        medium: string;
      };
    }>;
  };
  studios?: {
    nodes: Array<{
      name: string;
      isAnimationStudio: boolean;
    }>;
  };
  coverImage: {
    large: string;
    medium: string;
    color?: string;
  };
  bannerImage?: string;
  averageScore?: number;
  popularity: number;
  favourites: number;
  source?: string;
  season?: string;
  seasonYear?: number;
  startDate: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate: {
    year?: number;
    month?: number;
    day?: number;
  };
}

export class AniListDataFetcher {
  private readonly apiUrl = 'https://graphql.anilist.co';
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // AniList allows 90 requests per minute

  private async rateLimitedRequest(query: string, variables: any = {}): Promise<any> {
    // Ensure we don't exceed rate limits
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();

    try {
      const response = await axios.post(this.apiUrl, {
        query,
        variables
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Adventure-Story-MCP-Server/1.0.0'
        }
      });

      if (response.data.errors) {
        console.error('AniList GraphQL errors:', response.data.errors);
        return null;
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          // Rate limited, wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          return this.rateLimitedRequest(query, variables);
        }
        if (error.response?.status === 404) {
          return null; // Not found
        }
      }
      throw error;
    }
  }

  async searchMedia(query: string, type?: 'ANIME' | 'MANGA'): Promise<AniListMedia[]> {
    const searchQuery = `
      query ($search: String, $type: MediaType) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: $type, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            type
            format
            status
            episodes
            chapters
            volumes
            genres
            tags {
              name
              description
              rank
            }
            coverImage {
              large
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            favourites
            source
            season
            seasonYear
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    try {
      const data = await this.rateLimitedRequest(searchQuery, {
        search: query,
        type: type
      });

      return data?.Page?.media || [];
    } catch (error) {
      console.error(`Error searching AniList media:`, error);
      return [];
    }
  }

  async getMediaById(id: number): Promise<AniListMedia | null> {
    const mediaQuery = `
      query ($id: Int) {
        Media(id: $id) {
          id
          title {
            romaji
            english
            native
          }
          description
          type
          format
          status
          episodes
          chapters
          volumes
          genres
          tags {
            name
            description
            rank
          }
          characters(page: 1, perPage: 25, sort: ROLE) {
            nodes {
              id
              name {
                first
                middle
                last
                full
                native
              }
              description
              image {
                large
                medium
              }
            }
          }
          studios {
            nodes {
              name
              isAnimationStudio
            }
          }
          coverImage {
            large
            medium
            color
          }
          bannerImage
          averageScore
          popularity
          favourites
          source
          season
          seasonYear
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
        }
      }
    `;

    try {
      const data = await this.rateLimitedRequest(mediaQuery, { id });
      return data?.Media || null;
    } catch (error) {
      console.error(`Error getting AniList media by ID:`, error);
      return null;
    }
  }

  async getCharacterById(id: number): Promise<any> {
    const characterQuery = `
      query ($id: Int) {
        Character(id: $id) {
          id
          name {
            first
            middle
            last
            full
            native
          }
          description
          image {
            large
            medium
          }
          favourites
          media(page: 1, perPage: 25, sort: POPULARITY_DESC) {
            nodes {
              id
              title {
                romaji
                english
                native
              }
              type
              format
              coverImage {
                medium
              }
            }
          }
          dateOfBirth {
            year
            month
            day
          }
          age
          gender
          bloodType
        }
      }
    `;

    try {
      const data = await this.rateLimitedRequest(characterQuery, { id });
      return data?.Character || null;
    } catch (error) {
      console.error(`Error getting AniList character:`, error);
      return null;
    }
  }

  async searchCharacters(query: string): Promise<any[]> {
    const characterQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          characters(search: $search, sort: FAVOURITES_DESC) {
            id
            name {
              first
              middle
              last
              full
              native
            }
            description
            image {
              large
              medium
            }
            favourites
            media(page: 1, perPage: 3, sort: POPULARITY_DESC) {
              nodes {
                id
                title {
                  romaji
                  english
                }
                type
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.rateLimitedRequest(characterQuery, { search: query });
      return data?.Page?.characters || [];
    } catch (error) {
      console.error(`Error searching AniList characters:`, error);
      return [];
    }
  }

  async getAnimeInfo(sourceName: string): Promise<any> {
    try {
      const searchResults = await this.searchMedia(sourceName, 'ANIME');
      
      if (!searchResults || searchResults.length === 0) {
        return null;
      }

      // Get the best match (first result is usually most relevant due to popularity sort)
      const anime = searchResults[0];
      if (!anime) {
        return null;
      }

      // Get detailed information if we only have basic data
      const detailedAnime = await this.getMediaById(anime.id);

      return {
        anilist_id: anime.id,
        title: anime.title.romaji,
        title_english: anime.title.english,
        title_native: anime.title.native,
        description: this.cleanDescription(anime.description),
        type: anime.type,
        format: anime.format,
        status: anime.status,
        episodes: anime.episodes,
        genres: anime.genres,
        tags: anime.tags?.map(tag => tag.name) || [],
        characters: detailedAnime?.characters?.nodes?.map(char => char.name.full) || [],
        studios: anime.studios?.nodes?.map(studio => studio.name) || [],
        images: [anime.coverImage.large, anime.bannerImage].filter(Boolean),
        averageScore: anime.averageScore,
        popularity: anime.popularity,
        favourites: anime.favourites,
        source: anime.source,
        season: anime.season,
        year: anime.seasonYear || anime.startDate?.year,
        startDate: anime.startDate,
        endDate: anime.endDate
      };
    } catch (error) {
      console.error(`Error fetching AniList anime info for ${sourceName}:`, error);
      return null;
    }
  }

  async getMangaInfo(sourceName: string): Promise<any> {
    try {
      const searchResults = await this.searchMedia(sourceName, 'MANGA');
      
      if (!searchResults || searchResults.length === 0) {
        return null;
      }

      const manga = searchResults[0];
      if (!manga) {
        return null;
      }

      const detailedManga = await this.getMediaById(manga.id);

      return {
        anilist_id: manga.id,
        title: manga.title.romaji,
        title_english: manga.title.english,
        title_native: manga.title.native,
        description: this.cleanDescription(manga.description),
        type: manga.type,
        format: manga.format,
        status: manga.status,
        chapters: manga.chapters,
        volumes: manga.volumes,
        genres: manga.genres,
        tags: manga.tags?.map(tag => tag.name) || [],
        characters: detailedManga?.characters?.nodes?.map(char => char.name.full) || [],
        images: [manga.coverImage.large, manga.bannerImage].filter(Boolean),
        averageScore: manga.averageScore,
        popularity: manga.popularity,
        favourites: manga.favourites,
        source: manga.source,
        startDate: manga.startDate,
        endDate: manga.endDate
      };
    } catch (error) {
      console.error(`Error fetching AniList manga info for ${sourceName}:`, error);
      return null;
    }
  }

  async getCharacterInfo(sourceName: string, characterName: string): Promise<any> {
    try {
      const characters = await this.searchCharacters(characterName);
      
      if (!characters || characters.length === 0) {
        return null;
      }

      // Find character from the correct source or use first result
      const character = characters.find(char => 
        char.media?.nodes?.some((media: any) => 
          media.title?.romaji?.toLowerCase().includes(sourceName.toLowerCase()) ||
          media.title?.english?.toLowerCase().includes(sourceName.toLowerCase())
        )
      ) || characters[0];

      if (!character) {
        return null;
      }

      const detailedCharacter = await this.getCharacterById(character.id);
      
      return {
        anilist_id: character.id,
        name: character.name.full,
        name_native: character.name.native,
        description: this.cleanDescription(detailedCharacter?.description || character.description),
        images: [character.image.large, character.image.medium].filter(Boolean),
        favourites: character.favourites,
        dateOfBirth: detailedCharacter?.dateOfBirth,
        age: detailedCharacter?.age,
        gender: detailedCharacter?.gender,
        bloodType: detailedCharacter?.bloodType,
        appearances: character.media?.nodes || []
      };
    } catch (error) {
      console.error(`Error fetching AniList character info:`, error);
      return null;
    }
  }

  async getTrendingAnime(page: number = 1): Promise<AniListMedia[]> {
    const trendingQuery = `
      query ($page: Int) {
        Page(page: $page, perPage: 20) {
          media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
            id
            title {
              romaji
              english
              native
            }
            description
            episodes
            genres
            averageScore
            popularity
            coverImage {
              large
              medium
            }
            season
            seasonYear
          }
        }
      }
    `;

    try {
      const data = await this.rateLimitedRequest(trendingQuery, { page });
      return data?.Page?.media || [];
    } catch (error) {
      console.error(`Error getting trending anime:`, error);
      return [];
    }
  }

  async getTrendingManga(page: number = 1): Promise<AniListMedia[]> {
    const trendingQuery = `
      query ($page: Int) {
        Page(page: $page, perPage: 20) {
          media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
            id
            title {
              romaji
              english
              native
            }
            description
            chapters
            volumes
            genres
            averageScore
            popularity
            coverImage {
              large
              medium
            }
          }
        }
      }
    `;

    try {
      const data = await this.rateLimitedRequest(trendingQuery, { page });
      return data?.Page?.media || [];
    } catch (error) {
      console.error(`Error getting trending manga:`, error);
      return [];
    }
  }

  private cleanDescription(description?: string): string {
    if (!description) return '';
    
    // Remove HTML tags and clean up AniList description formatting
    return description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, '\n') // Clean up multiple newlines
      .trim();
  }

  private calculateRelevanceScore(title: any, query: string): number {
    const normalizedQuery = query.toLowerCase();
    
    // Check all title variants
    const titles = [
      title.romaji,
      title.english,
      title.native
    ].filter(Boolean).map(t => t.toLowerCase());

    for (const titleVariant of titles) {
      if (titleVariant === normalizedQuery) return 1.0;
      if (titleVariant.startsWith(normalizedQuery)) return 0.9;
      if (titleVariant.includes(normalizedQuery)) return 0.7;
    }

    return 0.1;
  }
}
