import NodeCache from 'node-cache';

export class Cache {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 3600, maxKeys: number = 1000) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      maxKeys: maxKeys,
      deleteOnExpire: true,
      useClones: false
    });

    // Log cache statistics periodically
    setInterval(() => {
      const stats = this.cache.getStats();
      if (stats.keys > 0) {
        console.log(`Cache stats: ${stats.keys} keys, ${stats.hits} hits, ${stats.misses} misses`);
      }
    }, 300000); // Every 5 minutes
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl);
  }

  delete(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  keys(): string[] {
    return this.cache.keys();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Multi-get functionality
  mget<T>(keys: string[]): { [key: string]: T } {
    return this.cache.mget(keys) as { [key: string]: T };
  }

  // Multi-set functionality
  mset<T>(keyValuePairs: Array<{ key: string; val: T; ttl?: number }>): boolean {
    return this.cache.mset(keyValuePairs);
  }

  // Get with fallback function
  async getOrSet<T>(
    key: string, 
    fallbackFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fallbackFn();
    this.set(key, value, ttl);
    return value;
  }

  // Batch invalidation by pattern
  deleteByPattern(pattern: string): number {
    const keys = this.cache.keys().filter(key => key.includes(pattern));
    return this.cache.del(keys);
  }

  // Get cache size in memory (approximate)
  getMemoryUsage(): { keys: number; memoryUsage: string } {
    const stats = this.cache.getStats();
    return {
      keys: stats.keys,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    };
  }
}
