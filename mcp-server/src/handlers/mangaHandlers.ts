export class MangaHandlers {
  private mangaDexService: any;
  private aniListService: any;
  private storyService: any;

  constructor(mangaDexService: any, aniListService: any, storyService: any) {
    this.mangaDexService = mangaDexService;
    this.aniListService = aniListService;
    this.storyService = storyService;
  }

  async handleGetMangaInfo(args: any) {
    const { manga_name, include_chapters = false, language = 'en' } = args;
    
    if (!manga_name) {
      throw new Error('manga_name is required');
    }

    try {
      // Get manga info from multiple sources
      const [mangaDexInfo, aniListInfo] = await Promise.allSettled([
        this.mangaDexService.getMangaInfo(manga_name),
        this.aniListService.getMangaInfo(manga_name)
      ]);

      const mangaInfo: any = {
        name: manga_name,
        sources: {}
      };

      // Add MangaDex info
      if (mangaDexInfo.status === 'fulfilled' && mangaDexInfo.value) {
        mangaInfo.sources.mangadx = mangaDexInfo.value;
      }

      // Add AniList info  
      if (aniListInfo.status === 'fulfilled' && aniListInfo.value) {
        mangaInfo.sources.anilist = aniListInfo.value;
      }

      // Combine the best information
      mangaInfo.title = mangaInfo.sources.mangadx?.title || mangaInfo.sources.anilist?.title || manga_name;
      mangaInfo.description = mangaInfo.sources.mangadx?.description || mangaInfo.sources.anilist?.description || '';
      mangaInfo.status = mangaInfo.sources.mangadx?.status || mangaInfo.sources.anilist?.status || 'unknown';
      mangaInfo.genres = [
        ...(mangaInfo.sources.mangadx?.genres || []),
        ...(mangaInfo.sources.anilist?.genres || [])
      ];
      mangaInfo.authors = mangaInfo.sources.mangadx?.authors || [];
      mangaInfo.year = mangaInfo.sources.mangadx?.year || mangaInfo.sources.anilist?.year;

      // Include chapters if requested
      if (include_chapters && mangaInfo.sources.mangadx?.mangadx_id) {
        const chapters = await this.mangaDexService.getMangaChapterList(manga_name);
        mangaInfo.chapters = chapters.slice(0, 50); // Limit to 50 most recent
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(mangaInfo, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get manga info: ${error.message}`);
    }
  }

  async handleGetMangaChapters(args: any) {
    const { manga_name, chapter_range, translated_language = 'en' } = args;
    
    if (!manga_name) {
      throw new Error('manga_name is required');
    }

    try {
      const chapters = await this.mangaDexService.getMangaChapterList(manga_name);
      
      let filteredChapters = chapters;

      // Filter by chapter range if specified
      if (chapter_range && chapter_range !== 'all') {
        if (chapter_range === 'latest') {
          filteredChapters = chapters.slice(-10); // Last 10 chapters
        } else if (chapter_range.includes('-')) {
          const [start, end] = chapter_range.split('-').map(num => parseInt(num.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            filteredChapters = chapters.filter(ch => {
              const chapterNum = parseFloat(ch.chapter || '0');
              return chapterNum >= start && chapterNum <= end;
            });
          }
        }
      }

      // Filter by language
      if (translated_language !== 'all') {
        filteredChapters = filteredChapters.filter(ch => 
          ch.translatedLanguage === translated_language
        );
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              manga_name,
              total_chapters: chapters.length,
              filtered_chapters: filteredChapters.length,
              chapters: filteredChapters
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get manga chapters: ${error.message}`);
    }
  }

  async handleCompareAdaptations(args: any) {
    const { source_name, focus_area = 'all' } = args;
    
    if (!source_name) {
      throw new Error('source_name is required');
    }

    try {
      // Get both anime and manga data
      const [animeInfo, mangaInfo] = await Promise.allSettled([
        this.aniListService.getAnimeInfo(source_name),
        this.aniListService.getMangaInfo(source_name)
      ]);

      const comparison: any = {
        source_name,
        has_anime: animeInfo.status === 'fulfilled' && animeInfo.value !== null,
        has_manga: mangaInfo.status === 'fulfilled' && mangaInfo.value !== null,
        comparison: {}
      };

      if (comparison.has_anime && comparison.has_manga) {
        const anime = animeInfo.value;
        const manga = mangaInfo.value;

        if (focus_area === 'all' || focus_area === 'characters') {
          comparison.comparison.characters = {
            anime_characters: anime.characters || [],
            manga_characters: manga.characters || [],
            shared_characters: this.findSharedElements(anime.characters || [], manga.characters || [])
          };
        }

        if (focus_area === 'all' || focus_area === 'plot') {
          comparison.comparison.plot = {
            anime_description: anime.description,
            manga_description: manga.description,
            description_similarity: this.calculateSimilarity(anime.description, manga.description)
          };
        }

        if (focus_area === 'all' || focus_area === 'timeline') {
          comparison.comparison.timeline = {
            anime_episodes: anime.episodes,
            manga_chapters: manga.chapters,
            anime_year: anime.year,
            manga_start_year: manga.startDate?.year
          };
        }

        if (focus_area === 'all' || focus_area === 'differences') {
          comparison.comparison.differences = {
            genre_differences: this.findDifferences(anime.genres || [], manga.genres || []),
            format_differences: {
              anime_format: anime.format,
              manga_format: manga.format
            }
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(comparison, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to compare adaptations: ${error.message}`);
    }
  }

  async handleGetPopularContent(args: any) {
    const { content_type = 'both', time_period = 'current', limit = 20 } = args;

    try {
      const results: any = {};

      if (content_type === 'anime' || content_type === 'both') {
        const trendingAnime = await this.aniListService.getTrendingAnime();
        results.popular_anime = trendingAnime.slice(0, limit);
      }

      if (content_type === 'manga' || content_type === 'both') {
        const [trendingManga, popularManga] = await Promise.allSettled([
          this.aniListService.getTrendingManga(),
          this.mangaDexService.getPopularManga(limit)
        ]);

        results.popular_manga = [];
        if (trendingManga.status === 'fulfilled') {
          results.popular_manga.push(...trendingManga.value.slice(0, limit));
        }
        if (popularManga.status === 'fulfilled') {
          results.popular_manga_mangadx = popularManga.value.slice(0, limit);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get popular content: ${error.message}`);
    }
  }

  async handleValidateCanon(args: any) {
    const { source_name, element_description, adaptation_type = 'both' } = args;
    
    if (!source_name || !element_description) {
      throw new Error('source_name and element_description are required');
    }

    try {
      const validation: any = {
        source_name,
        element_description,
        validation_results: {}
      };

      if (adaptation_type === 'anime' || adaptation_type === 'both') {
        const animeValidation = await this.storyService.validateStoryElement(
          source_name, 'anime', element_description
        );
        validation.validation_results.anime = animeValidation;
      }

      if (adaptation_type === 'manga' || adaptation_type === 'both') {
        const mangaValidation = await this.storyService.validateStoryElement(
          source_name, 'manga', element_description
        );
        validation.validation_results.manga = mangaValidation;
      }

      // Overall canonical status
      const animeValid = validation.validation_results.anime?.isValid || false;
      const mangaValid = validation.validation_results.manga?.isValid || false;

      validation.overall_canonical = adaptation_type === 'both' 
        ? (animeValid && mangaValid)
        : (animeValid || mangaValid);

      validation.confidence = Math.max(
        validation.validation_results.anime?.confidence || 0,
        validation.validation_results.manga?.confidence || 0
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(validation, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to validate canon: ${error.message}`);
    }
  }

  private findSharedElements(arr1: string[], arr2: string[]): string[] {
    return arr1.filter(item => arr2.includes(item));
  }

  private findDifferences(arr1: string[], arr2: string[]): { only_in_first: string[]; only_in_second: string[] } {
    return {
      only_in_first: arr1.filter(item => !arr2.includes(item)),
      only_in_second: arr2.filter(item => !arr1.includes(item))
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const shared = this.findSharedElements(words1, words2);
    
    return shared.length / Math.max(words1.length, words2.length);
  }
}
