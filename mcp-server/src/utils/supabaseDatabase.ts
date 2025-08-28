import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdventureContext } from '../services/adventureContextService.js';

export class SupabaseDatabaseManager {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jhrmlnfdnxjdlrlzokdd.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impocm1sbmZkbnhqZGxybHpva2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzAzNDIsImV4cCI6MjA3MTcwNjM0Mn0.1Qu2IDtDNb93qtEd_EinPrRe8Z2HPuFmcyyARGbEFnM';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and API key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    try {
      // Check if tables exist and create them if they don't
      await this.ensureTableExists();
      console.log('Supabase tables initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase tables:', error);
    }
  }

  private async ensureTableExists(): Promise<void> {
    try {
      // Test if adventure_contexts table exists by trying to query it
      const { error } = await this.supabase
        .from('adventure_contexts')
        .select('adventure_id')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log('Tables do not exist. Please create them manually in Supabase dashboard.');
        console.log('Required tables: adventure_contexts, adventure_events, story_cache');
        throw new Error('Database tables not found. Please set up the schema first.');
      }
    } catch (error) {
      console.warn('Could not verify table existence:', error);
    }
  }

  async saveAdventureContext(context: AdventureContext): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('adventure_contexts')
        .upsert({
          adventure_id: context.adventure_id,
          source_name: context.source_name,
          current_arc: context.current_arc,
          active_characters: context.active_characters,
          story_state: context.story_state,
          ai_context: context.ai_context || {},
          created_at: context.created_at,
          updated_at: context.updated_at
        });

      if (error) {
        throw new Error(`Failed to save adventure context: ${error.message}`);
      }

      console.log(`Adventure context saved for ${context.adventure_id}`);
    } catch (error) {
      console.error('Error saving adventure context:', error);
      throw error;
    }
  }

  async getAdventureContext(adventureId: string): Promise<AdventureContext | null> {
    try {
      const { data, error } = await this.supabase
        .from('adventure_contexts')
        .select('*')
        .eq('adventure_id', adventureId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Failed to get adventure context: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        adventure_id: data.adventure_id,
        source_name: data.source_name,
        current_arc: data.current_arc,
        active_characters: data.active_characters || [],
        story_state: data.story_state || {
          major_events: [],
          character_relationships: {},
          plot_points: [],
          player_choices: [],
          world_state: {}
        },
        ai_context: data.ai_context,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error(`Error getting adventure context for ${adventureId}:`, error);
      throw error;
    }
  }

  async addEvent(adventureId: string, event: {
    type: string;
    content: string;
    characters: string[];
    location?: string;
    timestamp: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('adventure_events')
        .insert({
          adventure_id: adventureId,
          event_type: event.type,
          event_content: event.content,
          characters: event.characters,
          location: event.location,
          timestamp: event.timestamp
        });

      if (error) {
        throw new Error(`Failed to add event: ${error.message}`);
      }

      console.log(`Event added for adventure ${adventureId}`);
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  async getRecentEvents(adventureId: string, limit: number = 10): Promise<Array<{
    type: string;
    content: string;
    characters: string[];
    location?: string;
    timestamp: string;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('adventure_events')
        .select('event_type, event_content, characters, location, timestamp')
        .eq('adventure_id', adventureId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get recent events: ${error.message}`);
      }

      return (data || []).map(row => ({
        type: row.event_type,
        content: row.event_content,
        characters: row.characters || [],
        location: row.location,
        timestamp: row.timestamp
      }));
    } catch (error) {
      console.error(`Error getting recent events for ${adventureId}:`, error);
      throw error;
    }
  }

  async getAllAdventures(): Promise<Array<{ adventureId: string; sourceName: string; lastUpdated: string }>> {
    try {
      const { data, error } = await this.supabase
        .from('adventure_contexts')
        .select('adventure_id, source_name, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get all adventures: ${error.message}`);
      }

      return (data || []).map(row => ({
        adventureId: row.adventure_id,
        sourceName: row.source_name,
        lastUpdated: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting all adventures:', error);
      return [];
    }
  }

  async deleteAdventureContext(adventureId: string): Promise<void> {
    try {
      // Delete events first (will be handled by CASCADE, but being explicit)
      await this.supabase
        .from('adventure_events')
        .delete()
        .eq('adventure_id', adventureId);

      // Delete adventure context
      const { error } = await this.supabase
        .from('adventure_contexts')
        .delete()
        .eq('adventure_id', adventureId);

      if (error) {
        throw new Error(`Failed to delete adventure context: ${error.message}`);
      }

      console.log(`Adventure context deleted for ${adventureId}`);
    } catch (error) {
      console.error(`Error deleting adventure context for ${adventureId}:`, error);
      throw error;
    }
  }

  async cacheStoryData(key: string, sourceName: string, data: any, ttlHours: number = 24): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
      
      const { error } = await this.supabase
        .from('story_cache')
        .upsert({
          cache_key: key,
          source_name: sourceName,
          cache_data: data,
          expires_at: expiresAt
        });

      if (error) {
        throw new Error(`Failed to cache story data: ${error.message}`);
      }

      console.log(`Story data cached for key: ${key}`);
    } catch (error) {
      console.error('Error caching story data:', error);
      throw error;
    }
  }

  async getCachedStoryData(key: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('story_cache')
        .select('cache_data')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw new Error(`Failed to get cached story data: ${error.message}`);
      }

      return data?.cache_data || null;
    } catch (error) {
      console.error(`Error getting cached story data for ${key}:`, error);
      return null;
    }
  }

  async cleanExpiredCache(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('story_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to clean expired cache: ${error.message}`);
      }

      console.log('Expired cache entries cleaned');
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  // Health check method
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('adventure_contexts')
        .select('adventure_id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

  // Get database stats
  async getStats(): Promise<{
    totalAdventures: number;
    totalEvents: number;
    cacheEntries: number;
  }> {
    try {
      const [adventuresResult, eventsResult, cacheResult] = await Promise.all([
        this.supabase.from('adventure_contexts').select('*', { count: 'exact', head: true }),
        this.supabase.from('adventure_events').select('*', { count: 'exact', head: true }),
        this.supabase.from('story_cache').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalAdventures: adventuresResult.count || 0,
        totalEvents: eventsResult.count || 0,
        cacheEntries: cacheResult.count || 0
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalAdventures: 0,
        totalEvents: 0,
        cacheEntries: 0
      };
    }
  }
}
