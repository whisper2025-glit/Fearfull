import { Cache } from '../utils/cache.js';
import { DatabaseManager } from '../utils/database.js';

export interface AdventureContext {
  adventure_id: string;
  source_name: string;
  current_arc?: string;
  active_characters: string[];
  story_state: {
    current_location?: string;
    time_period?: string;
    major_events: string[];
    character_relationships: { [key: string]: { [key: string]: string } };
    plot_points: Array<{
      id: string;
      description: string;
      status: 'pending' | 'active' | 'completed' | 'failed';
      importance: 'low' | 'medium' | 'high' | 'critical';
    }>;
    player_choices: Array<{
      choice: string;
      consequences: string[];
      timestamp: string;
    }>;
    world_state: { [key: string]: any };
  };
  created_at: string;
  updated_at: string;
}

export interface AdventureState {
  context: AdventureContext;
  recent_events: Array<{
    type: 'choice' | 'event' | 'dialogue' | 'system';
    content: string;
    characters: string[];
    location?: string;
    timestamp: string;
  }>;
  ai_context: {
    narrative_tone: string;
    important_facts: string[];
    character_states: { [characterName: string]: any };
    location_details: { [locationName: string]: any };
  };
}

export class AdventureContextService {
  private cache: Cache;
  private db: DatabaseManager;

  constructor() {
    this.cache = new Cache();
    this.db = new DatabaseManager();
  }

  async setAdventureContext(context: Omit<AdventureContext, 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const fullContext: AdventureContext = {
        ...context,
        created_at: timestamp,
        updated_at: timestamp
      };

      // Save to database
      await this.db.saveAdventureContext(fullContext);
      
      // Cache the context
      this.cache.set(`adventure_context:${context.adventure_id}`, fullContext);
      
      console.log(`Adventure context set for adventure ${context.adventure_id}`);
    } catch (error) {
      console.error(`Error setting adventure context:`, error);
      throw new Error(`Failed to set adventure context for "${context.adventure_id}"`);
    }
  }

  async getAdventureState(adventureId: string): Promise<AdventureState | null> {
    const cacheKey = `adventure_state:${adventureId}`;
    
    // Check cache first
    const cached = this.cache.get<AdventureState>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get context from database
      const context = await this.db.getAdventureContext(adventureId);
      if (!context) {
        return null;
      }

      // Get recent events
      const recent_events = await this.db.getRecentEvents(adventureId, 10);

      // Build AI context
      const ai_context = await this.buildAIContext(context);

      const adventureState: AdventureState = {
        context,
        recent_events,
        ai_context
      };

      // Cache the state
      this.cache.set(cacheKey, adventureState);
      
      return adventureState;
    } catch (error) {
      console.error(`Error getting adventure state for ${adventureId}:`, error);
      throw new Error(`Failed to get adventure state for "${adventureId}"`);
    }
  }

  async updateStoryState(
    adventureId: string, 
    updates: Partial<AdventureContext['story_state']>
  ): Promise<void> {
    try {
      const context = await this.db.getAdventureContext(adventureId);
      if (!context) {
        throw new Error(`Adventure context not found for ${adventureId}`);
      }

      // Merge updates with existing story state
      context.story_state = { ...context.story_state, ...updates };
      context.updated_at = new Date().toISOString();

      // Save updated context
      await this.db.saveAdventureContext(context);
      
      // Invalidate cache
      this.cache.delete(`adventure_context:${adventureId}`);
      this.cache.delete(`adventure_state:${adventureId}`);
      
      console.log(`Story state updated for adventure ${adventureId}`);
    } catch (error) {
      console.error(`Error updating story state:`, error);
      throw new Error(`Failed to update story state for "${adventureId}"`);
    }
  }

  async addPlayerChoice(
    adventureId: string, 
    choice: string, 
    consequences: string[]
  ): Promise<void> {
    try {
      const context = await this.db.getAdventureContext(adventureId);
      if (!context) {
        throw new Error(`Adventure context not found for ${adventureId}`);
      }

      // Add the choice to player choices history
      const playerChoice = {
        choice,
        consequences,
        timestamp: new Date().toISOString()
      };

      context.story_state.player_choices.push(playerChoice);
      context.updated_at = new Date().toISOString();

      // Save updated context
      await this.db.saveAdventureContext(context);
      
      // Add event record
      await this.db.addEvent(adventureId, {
        type: 'choice',
        content: choice,
        characters: context.active_characters,
        location: context.story_state.current_location,
        timestamp: playerChoice.timestamp
      });

      // Invalidate cache
      this.cache.delete(`adventure_state:${adventureId}`);
      
      console.log(`Player choice recorded for adventure ${adventureId}`);
    } catch (error) {
      console.error(`Error adding player choice:`, error);
      throw new Error(`Failed to record player choice for "${adventureId}"`);
    }
  }

  async updateCharacterRelationship(
    adventureId: string, 
    character1: string, 
    character2: string, 
    relationship: string
  ): Promise<void> {
    try {
      const context = await this.db.getAdventureContext(adventureId);
      if (!context) {
        throw new Error(`Adventure context not found for ${adventureId}`);
      }

      // Initialize character relationships if not exists
      if (!context.story_state.character_relationships[character1]) {
        context.story_state.character_relationships[character1] = {};
      }

      context.story_state.character_relationships[character1][character2] = relationship;
      context.updated_at = new Date().toISOString();

      // Save updated context
      await this.db.saveAdventureContext(context);
      
      // Invalidate cache
      this.cache.delete(`adventure_state:${adventureId}`);
      
      console.log(`Character relationship updated: ${character1} -> ${character2}: ${relationship}`);
    } catch (error) {
      console.error(`Error updating character relationship:`, error);
      throw new Error(`Failed to update character relationship for "${adventureId}"`);
    }
  }

  async addPlotPoint(
    adventureId: string, 
    plotPoint: AdventureContext['story_state']['plot_points'][0]
  ): Promise<void> {
    try {
      const context = await this.db.getAdventureContext(adventureId);
      if (!context) {
        throw new Error(`Adventure context not found for ${adventureId}`);
      }

      context.story_state.plot_points.push(plotPoint);
      context.updated_at = new Date().toISOString();

      // Save updated context
      await this.db.saveAdventureContext(context);
      
      // Invalidate cache
      this.cache.delete(`adventure_state:${adventureId}`);
      
      console.log(`Plot point added for adventure ${adventureId}: ${plotPoint.description}`);
    } catch (error) {
      console.error(`Error adding plot point:`, error);
      throw new Error(`Failed to add plot point for "${adventureId}"`);
    }
  }

  async updatePlotPointStatus(
    adventureId: string, 
    plotPointId: string, 
    status: AdventureContext['story_state']['plot_points'][0]['status']
  ): Promise<void> {
    try {
      const context = await this.db.getAdventureContext(adventureId);
      if (!context) {
        throw new Error(`Adventure context not found for ${adventureId}`);
      }

      const plotPoint = context.story_state.plot_points.find(pp => pp.id === plotPointId);
      if (!plotPoint) {
        throw new Error(`Plot point not found: ${plotPointId}`);
      }

      plotPoint.status = status;
      context.updated_at = new Date().toISOString();

      // Save updated context
      await this.db.saveAdventureContext(context);
      
      // Invalidate cache
      this.cache.delete(`adventure_state:${adventureId}`);
      
      console.log(`Plot point status updated: ${plotPointId} -> ${status}`);
    } catch (error) {
      console.error(`Error updating plot point status:`, error);
      throw new Error(`Failed to update plot point status for "${adventureId}"`);
    }
  }

  private async buildAIContext(context: AdventureContext): Promise<AdventureState['ai_context']> {
    try {
      const aiContext: AdventureState['ai_context'] = {
        narrative_tone: 'engaging',
        important_facts: [],
        character_states: {},
        location_details: {}
      };

      // Build important facts from story state
      aiContext.important_facts = [
        `Current arc: ${context.current_arc || 'Unknown'}`,
        `Active characters: ${context.active_characters.join(', ')}`,
        `Current location: ${context.story_state.current_location || 'Unknown'}`,
        `Major events: ${context.story_state.major_events.slice(-3).join(', ')}`
      ];

      // Add plot points information
      const activePlotPoints = context.story_state.plot_points.filter(pp => pp.status === 'active');
      if (activePlotPoints.length > 0) {
        aiContext.important_facts.push(
          `Active plot points: ${activePlotPoints.map(pp => pp.description).join(', ')}`
        );
      }

      // Add recent player choices context
      const recentChoices = context.story_state.player_choices.slice(-3);
      if (recentChoices.length > 0) {
        aiContext.important_facts.push(
          `Recent player choices: ${recentChoices.map(choice => choice.choice).join(', ')}`
        );
      }

      return aiContext;
    } catch (error) {
      console.error(`Error building AI context:`, error);
      return {
        narrative_tone: 'engaging',
        important_facts: ['Error building context'],
        character_states: {},
        location_details: {}
      };
    }
  }

  async getAllAdventures(): Promise<Array<{ adventureId: string; sourceName: string; lastUpdated: string }>> {
    try {
      return await this.db.getAllAdventures();
    } catch (error) {
      console.error(`Error getting all adventures:`, error);
      return [];
    }
  }

  async deleteAdventureContext(adventureId: string): Promise<void> {
    try {
      await this.db.deleteAdventureContext(adventureId);
      
      // Clear cache
      this.cache.delete(`adventure_context:${adventureId}`);
      this.cache.delete(`adventure_state:${adventureId}`);
      
      console.log(`Adventure context deleted for ${adventureId}`);
    } catch (error) {
      console.error(`Error deleting adventure context:`, error);
      throw new Error(`Failed to delete adventure context for "${adventureId}"`);
    }
  }
}
