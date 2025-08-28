export interface EnvironmentConfig {
  // Server Configuration
  serverName: string;
  serverVersion: string;
  
  // API Endpoints
  jikanApiBaseUrl: string;
  aniListApiUrl: string;
  mangaDexApiUrl: string;
  
  // API Keys (optional but recommended)
  aniListClientId?: string;
  aniListClientSecret?: string;
  
  // Cache Configuration
  cacheTtlSeconds: number;
  cacheMaxEntries: number;
  
  // Database Configuration
  databasePath: string;
  
  // Rate Limiting
  apiRateLimitPerMinute: number;
  jikanRateLimitDelay: number;
  aniListRateLimitDelay: number;
  mangaDexRateLimitDelay: number;
  
  // Retry Configuration
  maxRetries: number;
  retryDelayMs: number;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    // Server Configuration
    serverName: process.env.MCP_SERVER_NAME || 'adventure-story-server',
    serverVersion: process.env.MCP_SERVER_VERSION || '1.0.0',
    
    // API Endpoints
    jikanApiBaseUrl: process.env.JIKAN_API_BASE_URL || 'https://api.jikan.moe/v4',
    aniListApiUrl: process.env.ANILIST_API_URL || 'https://graphql.anilist.co',
    mangaDexApiUrl: process.env.MANGADEX_API_URL || 'https://api.mangadx.org',
    
    // API Keys
    aniListClientId: process.env.ANILIST_CLIENT_ID,
    aniListClientSecret: process.env.ANILIST_CLIENT_SECRET,
    
    // Cache Configuration
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600'),
    cacheMaxEntries: parseInt(process.env.CACHE_MAX_ENTRIES || '1000'),
    
    // Database Configuration
    databasePath: process.env.DATABASE_PATH || './data/stories.db',
    
    // Rate Limiting
    apiRateLimitPerMinute: parseInt(process.env.API_RATE_LIMIT_PER_MINUTE || '60'),
    jikanRateLimitDelay: parseInt(process.env.JIKAN_RATE_LIMIT_DELAY || '1000'),
    aniListRateLimitDelay: parseInt(process.env.ANILIST_RATE_LIMIT_DELAY || '1000'),
    mangaDexRateLimitDelay: parseInt(process.env.MANGADEX_RATE_LIMIT_DELAY || '200'),
    
    // Retry Configuration
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000'),
  };
};

export const validateEnvironmentConfig = (config: EnvironmentConfig): void => {
  const errors: string[] = [];
  
  if (config.cacheTtlSeconds <= 0) {
    errors.push('CACHE_TTL_SECONDS must be greater than 0');
  }
  
  if (config.cacheMaxEntries <= 0) {
    errors.push('CACHE_MAX_ENTRIES must be greater than 0');
  }
  
  if (config.apiRateLimitPerMinute <= 0) {
    errors.push('API_RATE_LIMIT_PER_MINUTE must be greater than 0');
  }
  
  if (config.maxRetries < 0) {
    errors.push('MAX_RETRIES must be greater than or equal to 0');
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
  }
};

// Load and validate configuration on import
export const config = getEnvironmentConfig();
validateEnvironmentConfig(config);
