import { Cache } from '../utils/cache.js';
import { WikiDataFetcher } from '../data-sources/wikiDataFetcher.js';
import { AnimeDataFetcher } from '../data-sources/animeDataFetcher.js';
import { AniListDataFetcher } from '../data-sources/aniListDataFetcher.js';

export interface CharacterData {
  name: string;
  aliases: string[];
  source: string;
  appearance: {
    description: string;
    height?: string;
    age?: string;
    species?: string;
  };
  personality: {
    traits: string[];
    description: string;
    alignment?: string;
  };
  abilities: {
    powers: string[];
    skills: string[];
    weapons: string[];
    specialAbilities: string[];
    powerLevel?: string;
  };
  relationships: {
    allies: string[];
    enemies: string[];
    family: string[];
    romantic?: string;
    mentor?: string;
    students?: string[];
  };
  backstory: {
    origin: string;
    keyEvents: string[];
    development: string[];
  };
  currentStatus: {
    alive: boolean;
    location?: string;
    occupation?: string;
    affiliation?: string;
    arc?: string;
  };
  quotes: string[];
  images?: string[];
  lastUpdated: string;
}

export class CharacterService {
  private cache: Cache;
  private wikiDataFetcher: WikiDataFetcher;
  private animeDataFetcher: AnimeDataFetcher;
  private aniListDataFetcher: AniListDataFetcher;

  constructor() {
    this.cache = new Cache();
    this.wikiDataFetcher = new WikiDataFetcher();
    this.animeDataFetcher = new AnimeDataFetcher();
    this.aniListDataFetcher = new AniListDataFetcher();
  }

  async getCharacterData(
    characterName: string, 
    sourceName: string, 
    arcContext?: string
  ): Promise<CharacterData> {
    const cacheKey = `character:${sourceName}:${characterName}:${arcContext || 'default'}`;
    
    // Check cache first
    const cached = this.cache.get<CharacterData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch data from multiple sources
      const [wikiData, animeData, aniListData] = await Promise.allSettled([
        this.wikiDataFetcher.getCharacterInfo(sourceName, characterName),
        this.animeDataFetcher.getCharacterInfo(sourceName, characterName),
        this.aniListDataFetcher.getCharacterInfo(sourceName, characterName)
      ]);

      // Combine and process the data
      const characterData = this.combineCharacterData(characterName, sourceName, {
        wiki: wikiData,
        anime: animeData,
        aniList: aniListData
      }, arcContext);
      
      // Cache the result
      this.cache.set(cacheKey, characterData);
      
      return characterData;
    } catch (error) {
      console.error(`Error fetching character data for ${characterName} from ${sourceName}:`, error);
      throw new Error(`Failed to fetch character information for "${characterName}" from "${sourceName}"`);
    }
  }

  async getCharacterRelationships(
    characterName: string,
    sourceName: string,
    arcContext?: string
  ): Promise<{ [key: string]: string[] }> {
    const characterData = await this.getCharacterData(characterName, sourceName, arcContext);
    return {
      allies: characterData.relationships.allies,
      enemies: characterData.relationships.enemies,
      family: characterData.relationships.family,
      students: characterData.relationships.students || []
    };
  }

  async getCharacterAbilities(
    characterName: string, 
    sourceName: string, 
    arcContext?: string
  ): Promise<CharacterData['abilities']> {
    const characterData = await this.getCharacterData(characterName, sourceName, arcContext);
    return characterData.abilities;
  }

  async searchCharacters(
    sourceName: string, 
    query: string, 
    filters?: {
      abilities?: string[];
      affiliation?: string;
      status?: 'alive' | 'deceased' | 'unknown';
    }
  ): Promise<Array<{ name: string; score: number; basicInfo: Partial<CharacterData> }>> {
    const cacheKey = `character_search:${sourceName}:${query}:${JSON.stringify(filters || {})}`;
    
    const cached = this.cache.get<Array<{ name: string; score: number; basicInfo: Partial<CharacterData> }>>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Search for characters in the wiki
      const searchResults = await this.wikiDataFetcher.searchCharacters(sourceName, query);
      
      // Apply filters if provided
      let filteredResults = searchResults;
      
      if (filters) {
        filteredResults = searchResults.filter(result => {
          if (filters.abilities && result.basicInfo.abilities) {
            const hasAbility = filters.abilities.some(ability => 
              result.basicInfo.abilities?.powers.includes(ability) ||
              result.basicInfo.abilities?.specialAbilities.includes(ability)
            );
            if (!hasAbility) return false;
          }
          
          if (filters.affiliation && result.basicInfo.currentStatus?.affiliation !== filters.affiliation) {
            return false;
          }
          
          if (filters.status) {
            if (filters.status === 'alive' && !result.basicInfo.currentStatus?.alive) return false;
            if (filters.status === 'deceased' && result.basicInfo.currentStatus?.alive) return false;
          }
          
          return true;
        });
      }

      this.cache.set(cacheKey, filteredResults);
      return filteredResults;
    } catch (error) {
      console.error(`Error searching characters in ${sourceName}:`, error);
      throw new Error(`Failed to search characters in "${sourceName}"`);
    }
  }

  private combineCharacterData(
    characterName: string,
    sourceName: string,
    allData: {
      wiki: PromiseSettledResult<any>;
      anime: PromiseSettledResult<any>;
      aniList: PromiseSettledResult<any>;
    },
    arcContext?: string
  ): CharacterData {
    const baseData: CharacterData = {
      name: characterName,
      aliases: [],
      source: sourceName,
      appearance: {
        description: '',
      },
      personality: {
        traits: [],
        description: '',
      },
      abilities: {
        powers: [],
        skills: [],
        weapons: [],
        specialAbilities: [],
      },
      relationships: {
        allies: [],
        enemies: [],
        family: [],
      },
      backstory: {
        origin: '',
        keyEvents: [],
        development: [],
      },
      currentStatus: {
        alive: true,
        arc: arcContext,
      },
      quotes: [],
      lastUpdated: new Date().toISOString(),
    };

    // Merge wiki data
    if (allData.wiki.status === 'fulfilled' && allData.wiki.value) {
      const wiki = allData.wiki.value;
      baseData.aliases = wiki.aliases || baseData.aliases;
      baseData.appearance = { ...baseData.appearance, ...wiki.appearance };
      baseData.personality = { ...baseData.personality, ...wiki.personality };
      baseData.abilities = { ...baseData.abilities, ...wiki.abilities };
      baseData.relationships = { ...baseData.relationships, ...wiki.relationships };
      baseData.backstory = { ...baseData.backstory, ...wiki.backstory };
      baseData.currentStatus = { ...baseData.currentStatus, ...wiki.currentStatus };
      baseData.quotes = wiki.quotes || baseData.quotes;
      baseData.images = wiki.images || baseData.images;
    }

    // Merge anime data
    if (allData.anime.status === 'fulfilled' && allData.anime.value) {
      const anime = allData.anime.value;
      baseData.appearance.description = anime.description || baseData.appearance.description;
      if (anime.images) {
        baseData.images = [...(baseData.images || []), ...anime.images];
      }
    }

    // Merge AniList data
    if (allData.aniList.status === 'fulfilled' && allData.aniList.value) {
      const aniList = allData.aniList.value;
      baseData.appearance.description = aniList.description || baseData.appearance.description;
      if (aniList.name_native) {
        baseData.aliases = [...baseData.aliases, aniList.name_native];
      }
      if (aniList.images) {
        baseData.images = [...(baseData.images || []), ...aniList.images];
      }
      if (aniList.gender) {
        baseData.appearance.species = aniList.gender;
      }
      if (aniList.age) {
        baseData.appearance.age = aniList.age.toString();
      }
    }

    // Apply arc-specific modifications if needed
    if (arcContext) {
      baseData.currentStatus.arc = arcContext;
      // Here you could add logic to modify character abilities/status based on the arc
      const modifiedData = this.applyArcContext(baseData, arcContext);
      Object.assign(baseData, modifiedData);
    }

    return baseData;
  }

  private applyArcContext(characterData: CharacterData, arcContext: string): CharacterData {
    // This method can be expanded to handle arc-specific character changes
    // For example, power-ups, status changes, new relationships, etc.
    
    // Example: If it's a later arc, the character might have new abilities
    if (arcContext.toLowerCase().includes('timeskip') || arcContext.toLowerCase().includes('war')) {
      // Add a note that abilities might be enhanced
      characterData.abilities.powers = characterData.abilities.powers.map(power => 
        `${power} (Enhanced during ${arcContext})`
      );
    }

    return characterData;
  }

  async validateCharacterAbility(
    characterName: string,
    sourceName: string,
    abilityName: string,
    arcContext?: string
  ): Promise<{ isValid: boolean; confidence: number; details?: string }> {
    try {
      const characterData = await this.getCharacterData(characterName, sourceName, arcContext);
      
      const allAbilities = [
        ...characterData.abilities.powers,
        ...characterData.abilities.skills,
        ...characterData.abilities.specialAbilities
      ];

      const isExactMatch = allAbilities.some(ability => 
        ability.toLowerCase() === abilityName.toLowerCase()
      );

      if (isExactMatch) {
        return { isValid: true, confidence: 1.0 };
      }

      // Check for partial matches
      const partialMatches = allAbilities.filter(ability => 
        ability.toLowerCase().includes(abilityName.toLowerCase()) ||
        abilityName.toLowerCase().includes(ability.toLowerCase())
      );

      if (partialMatches.length > 0) {
        return { 
          isValid: true, 
          confidence: 0.7, 
          details: `Similar abilities found: ${partialMatches.join(', ')}` 
        };
      }

      return { 
        isValid: false, 
        confidence: 0, 
        details: `No matching abilities found for ${characterName}` 
      };
    } catch (error) {
      console.error(`Error validating character ability:`, error);
      return { isValid: false, confidence: 0, details: 'Error during validation' };
    }
  }
}
