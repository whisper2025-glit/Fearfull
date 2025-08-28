import axios from 'axios';

export interface MangaDexManga {
  id: string;
  attributes: {
    title: { [key: string]: string };
    altTitles: Array<{ [key: string]: string }>;
    description: { [key: string]: string };
    isLocked: boolean;
    links?: { [key: string]: string };
    originalLanguage: string;
    lastVolume?: string;
    lastChapter?: string;
    publicationDemographic?: string;
    status: string;
    year?: number;
    contentRating: string;
    tags: Array<{
      id: string;
      attributes: {
        name: { [key: string]: string };
        description: { [key: string]: string };
        group: string;
        version: number;
      };
    }>;
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: any;
  }>;
}

export interface MangaDexChapter {
  id: string;
  attributes: {
    volume?: string;
    chapter?: string;
    title?: string;
    translatedLanguage: string;
    externalUrl?: string;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
  };
}

export interface MangaDexAuthor {
  id: string;
  attributes: {
    name: string;
    imageUrl?: string;
    biography: { [key: string]: string };
    twitter?: string;
    pixiv?: string;
    melonBook?: string;
    fanBox?: string;
    booth?: string;
    nicoVideo?: string;
    skeb?: string;
    fantia?: string;
    tumblr?: string;
    youtube?: string;
    weibo?: string;
    naver?: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

export class MangaDexDataFetcher {
  private readonly baseUrl = 'https://api.mangadex.org';
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 200; // MangaDex allows 5 requests per second

  private async rateLimitedRequest(endpoint: string, params?: any): Promise<any> {
    // Ensure we don't exceed rate limits
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        timeout: 15000,
        headers: {
          'User-Agent': 'Adventure-Story-MCP-Server/1.0.0'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          // Rate limited, wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.rateLimitedRequest(endpoint, params);
        }
        if (error.response?.status === 404) {
          return null; // Not found
        }
      }
      throw error;
    }
  }

  async searchManga(query: string, limit: number = 20): Promise<MangaDexManga[]> {
    try {
      const params = {
        title: query,
        limit: limit,
        offset: 0,
        includes: ['author', 'artist', 'cover_art'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        order: { relevance: 'desc' }
      };

      const data = await this.rateLimitedRequest('/manga', params);
      return data?.data || [];
    } catch (error) {
      console.error(`Error searching MangaDex manga:`, error);
      return [];
    }
  }

  async getMangaById(id: string): Promise<MangaDexManga | null> {
    try {
      const data = await this.rateLimitedRequest(`/manga/${id}`, {
        includes: ['author', 'artist', 'cover_art']
      });
      return data?.data || null;
    } catch (error) {
      console.error(`Error getting MangaDex manga by ID:`, error);
      return null;
    }
  }

  async getMangaChapters(mangaId: string, limit: number = 100): Promise<MangaDexChapter[]> {
    try {
      const data = await this.rateLimitedRequest(`/manga/${mangaId}/feed`, {
        limit: limit,
        offset: 0,
        translatedLanguage: ['en'],
        order: { chapter: 'asc' }
      });
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting MangaDex chapters:`, error);
      return [];
    }
  }

  async getAuthorById(id: string): Promise<MangaDexAuthor | null> {
    try {
      const data = await this.rateLimitedRequest(`/author/${id}`);
      return data?.data || null;
    } catch (error) {
      console.error(`Error getting MangaDex author:`, error);
      return null;
    }
  }

  async getMangaInfo(sourceName: string): Promise<any> {
    try {
      const searchResults = await this.searchManga(sourceName);
      
      if (!searchResults || searchResults.length === 0) {
        return null;
      }

      // Get the best match
      const manga = searchResults[0];
      
      // Get authors and artists
      const authors = await this.getMangaAuthors(manga);
      const coverArt = this.getMangaCoverArt(manga);
      
      return {
        mangadex_id: manga.id,
        title: this.getTitle(manga.attributes.title),
        altTitles: manga.attributes.altTitles.map(altTitle => Object.values(altTitle)[0]).filter(Boolean),
        description: this.getDescription(manga.attributes.description),
        status: manga.attributes.status,
        originalLanguage: manga.attributes.originalLanguage,
        publicationDemographic: manga.attributes.publicationDemographic,
        contentRating: manga.attributes.contentRating,
        year: manga.attributes.year,
        lastVolume: manga.attributes.lastVolume,
        lastChapter: manga.attributes.lastChapter,
        tags: manga.attributes.tags.map(tag => this.getTitle(tag.attributes.name)),
        genres: manga.attributes.tags
          .filter(tag => tag.attributes.group === 'genre')
          .map(tag => this.getTitle(tag.attributes.name)),
        themes: manga.attributes.tags
          .filter(tag => tag.attributes.group === 'theme')
          .map(tag => this.getTitle(tag.attributes.name)),
        authors: authors.authors,
        artists: authors.artists,
        coverImage: coverArt,
        links: manga.attributes.links || {},
        createdAt: manga.attributes.createdAt,
        updatedAt: manga.attributes.updatedAt
      };
    } catch (error) {
      console.error(`Error fetching MangaDex manga info for ${sourceName}:`, error);
      return null;
    }
  }

  async getMangaChapterList(sourceName: string): Promise<any[]> {
    try {
      const searchResults = await this.searchManga(sourceName, 1);
      
      if (!searchResults || searchResults.length === 0) {
        return [];
      }

      const manga = searchResults[0];
      const chapters = await this.getMangaChapters(manga.id);
      
      return chapters.map(chapter => ({
        id: chapter.id,
        volume: chapter.attributes.volume,
        chapter: chapter.attributes.chapter,
        title: chapter.attributes.title,
        translatedLanguage: chapter.attributes.translatedLanguage,
        pages: chapter.attributes.pages,
        publishAt: chapter.attributes.publishAt,
        readableAt: chapter.attributes.readableAt
      }));
    } catch (error) {
      console.error(`Error fetching MangaDex chapter list:`, error);
      return [];
    }
  }

  async getPopularManga(limit: number = 20): Promise<MangaDexManga[]> {
    try {
      const data = await this.rateLimitedRequest('/manga', {
        limit: limit,
        offset: 0,
        includes: ['author', 'artist', 'cover_art'],
        contentRating: ['safe', 'suggestive'],
        order: { followedCount: 'desc' },
        hasAvailableChapters: true
      });
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting popular MangaDex manga:`, error);
      return [];
    }
  }

  async getRecentlyUpdated(limit: number = 20): Promise<MangaDexManga[]> {
    try {
      const data = await this.rateLimitedRequest('/manga', {
        limit: limit,
        offset: 0,
        includes: ['author', 'artist', 'cover_art'],
        contentRating: ['safe', 'suggestive'],
        order: { latestUploadedChapter: 'desc' },
        hasAvailableChapters: true
      });
      return data?.data || [];
    } catch (error) {
      console.error(`Error getting recently updated MangaDex manga:`, error);
      return [];
    }
  }

  async searchContent(sourceName: string, query: string, contentType?: string): Promise<any[]> {
    try {
      if (contentType && contentType !== 'manga' && contentType !== 'all') {
        return []; // MangaDex only has manga content
      }

      const results = await this.searchManga(query);
      
      return results.map(manga => ({
        type: 'manga',
        name: this.getTitle(manga.attributes.title),
        description: this.getDescription(manga.attributes.description),
        source: 'mangadx',
        relevanceScore: this.calculateRelevanceScore(manga.attributes.title, query),
        additionalInfo: {
          mangadex_id: manga.id,
          status: manga.attributes.status,
          contentRating: manga.attributes.contentRating,
          year: manga.attributes.year,
          tags: manga.attributes.tags.map(tag => this.getTitle(tag.attributes.name))
        }
      }));
    } catch (error) {
      console.error(`Error searching MangaDex content:`, error);
      return [];
    }
  }

  private async getMangaAuthors(manga: MangaDexManga): Promise<{ authors: string[]; artists: string[] }> {
    const authors: string[] = [];
    const artists: string[] = [];

    const authorRelationships = manga.relationships.filter(rel => rel.type === 'author');
    const artistRelationships = manga.relationships.filter(rel => rel.type === 'artist');

    // Get author names
    for (const rel of authorRelationships) {
      if (rel.attributes?.name) {
        authors.push(rel.attributes.name);
      } else {
        try {
          const author = await this.getAuthorById(rel.id);
          if (author) {
            authors.push(author.attributes.name);
          }
        } catch (error) {
          console.warn(`Could not fetch author ${rel.id}`);
        }
      }
    }

    // Get artist names
    for (const rel of artistRelationships) {
      if (rel.attributes?.name) {
        artists.push(rel.attributes.name);
      } else {
        try {
          const artist = await this.getAuthorById(rel.id);
          if (artist) {
            artists.push(artist.attributes.name);
          }
        } catch (error) {
          console.warn(`Could not fetch artist ${rel.id}`);
        }
      }
    }

    return { authors, artists };
  }

  private getMangaCoverArt(manga: MangaDexManga): string | null {
    const coverArtRel = manga.relationships.find(rel => rel.type === 'cover_art');
    if (coverArtRel?.attributes?.fileName) {
      return `https://uploads.mangadx.org/covers/${manga.id}/${coverArtRel.attributes.fileName}`;
    }
    return null;
  }

  private getTitle(titleObj: { [key: string]: string }): string {
    // Prefer English, then romanized, then any available
    return titleObj.en || titleObj.ja_ro || Object.values(titleObj)[0] || '';
  }

  private getDescription(descObj: { [key: string]: string }): string {
    // Prefer English, then any available
    return descObj.en || Object.values(descObj)[0] || '';
  }

  private calculateRelevanceScore(titleObj: { [key: string]: string }, query: string): number {
    const normalizedQuery = query.toLowerCase();
    const titles = Object.values(titleObj).map(title => title.toLowerCase());

    for (const title of titles) {
      if (title === normalizedQuery) return 1.0;
      if (title.startsWith(normalizedQuery)) return 0.9;
      if (title.includes(normalizedQuery)) return 0.7;
    }

    return 0.1;
  }
}
