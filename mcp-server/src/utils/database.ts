import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { AdventureContext } from '../services/adventureContextService.js';

export class DatabaseManager {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath: string = './data/stories.db') {
    this.dbPath = dbPath;
    this.ensureDataDirectory();
    this.db = new sqlite3.Database(this.dbPath);
    this.initializeTables();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private initializeTables(): void {
    const queries = [
      `CREATE TABLE IF NOT EXISTS adventure_contexts (
        adventure_id TEXT PRIMARY KEY,
        source_name TEXT NOT NULL,
        current_arc TEXT,
        active_characters TEXT, -- JSON array
        story_state TEXT, -- JSON object
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS adventure_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        adventure_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_content TEXT NOT NULL,
        characters TEXT, -- JSON array
        location TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (adventure_id) REFERENCES adventure_contexts (adventure_id)
      )`,
      `CREATE TABLE IF NOT EXISTS story_cache (
        cache_key TEXT PRIMARY KEY,
        source_name TEXT NOT NULL,
        cache_data TEXT NOT NULL, -- JSON data
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_adventure_events_adventure_id 
       ON adventure_events (adventure_id)`,
      `CREATE INDEX IF NOT EXISTS idx_adventure_events_timestamp 
       ON adventure_events (timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_story_cache_source 
       ON story_cache (source_name)`,
      `CREATE INDEX IF NOT EXISTS idx_story_cache_expires 
       ON story_cache (expires_at)`
    ];

    queries.forEach(query => {
      this.db.run(query, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        }
      });
    });
  }

  async saveAdventureContext(context: AdventureContext): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO adventure_contexts 
        (adventure_id, source_name, current_arc, active_characters, story_state, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        context.adventure_id,
        context.source_name,
        context.current_arc || null,
        JSON.stringify(context.active_characters),
        JSON.stringify(context.story_state),
        context.created_at,
        context.updated_at
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getAdventureContext(adventureId: string): Promise<AdventureContext | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM adventure_contexts WHERE adventure_id = ?`;
      
      this.db.get(query, [adventureId], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const context: AdventureContext = {
              adventure_id: row.adventure_id,
              source_name: row.source_name,
              current_arc: row.current_arc,
              active_characters: JSON.parse(row.active_characters),
              story_state: JSON.parse(row.story_state),
              created_at: row.created_at,
              updated_at: row.updated_at
            };
            resolve(context);
          } catch (parseErr) {
            reject(new Error(`Failed to parse adventure context: ${parseErr}`));
          }
        }
      });
    });
  }

  async addEvent(adventureId: string, event: {
    type: string;
    content: string;
    characters: string[];
    location?: string;
    timestamp: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO adventure_events 
        (adventure_id, event_type, event_content, characters, location, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        adventureId,
        event.type,
        event.content,
        JSON.stringify(event.characters),
        event.location || null,
        event.timestamp
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getRecentEvents(adventureId: string, limit: number = 10): Promise<Array<{
    type: string;
    content: string;
    characters: string[];
    location?: string;
    timestamp: string;
  }>> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT event_type, event_content, characters, location, timestamp 
        FROM adventure_events 
        WHERE adventure_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `;
      
      this.db.all(query, [adventureId, limit], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const events = rows.map(row => ({
              type: row.event_type,
              content: row.event_content,
              characters: JSON.parse(row.characters),
              location: row.location,
              timestamp: row.timestamp
            }));
            resolve(events);
          } catch (parseErr) {
            reject(new Error(`Failed to parse events: ${parseErr}`));
          }
        }
      });
    });
  }

  async getAllAdventures(): Promise<Array<{ adventureId: string; sourceName: string; lastUpdated: string }>> {
    return new Promise((resolve, reject) => {
      const query = `SELECT adventure_id, source_name, updated_at FROM adventure_contexts ORDER BY updated_at DESC`;
      
      this.db.all(query, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const adventures = rows.map(row => ({
            adventureId: row.adventure_id,
            sourceName: row.source_name,
            lastUpdated: row.updated_at
          }));
          resolve(adventures);
        }
      });
    });
  }

  async deleteAdventureContext(adventureId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Delete events first (foreign key constraint)
        this.db.run(`DELETE FROM adventure_events WHERE adventure_id = ?`, [adventureId]);
        
        // Delete adventure context
        this.db.run(`DELETE FROM adventure_contexts WHERE adventure_id = ?`, [adventureId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async cacheStoryData(key: string, sourceName: string, data: any, ttlHours: number = 24): Promise<void> {
    return new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
      const query = `
        INSERT OR REPLACE INTO story_cache 
        (cache_key, source_name, cache_data, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        key,
        sourceName,
        JSON.stringify(data),
        new Date().toISOString(),
        expiresAt
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getCachedStoryData(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT cache_data FROM story_cache 
        WHERE cache_key = ? AND expires_at > ?
      `;
      
      this.db.get(query, [key, new Date().toISOString()], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const data = JSON.parse(row.cache_data);
            resolve(data);
          } catch (parseErr) {
            reject(new Error(`Failed to parse cached data: ${parseErr}`));
          }
        }
      });
    });
  }

  async cleanExpiredCache(): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM story_cache WHERE expires_at <= ?`;
      
      this.db.run(query, [new Date().toISOString()], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Cleaned ${this.changes} expired cache entries`);
          resolve();
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
