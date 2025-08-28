// Supabase Configuration for MCP Server
// This file manages the Supabase connection settings

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  // Check for environment variables first
  const url = process.env.VITE_SUPABASE_URL || 
              process.env.SUPABASE_URL || 
              'https://jhrmlnfdnxjdlrlzokdd.supabase.co';
              
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                  process.env.SUPABASE_ANON_KEY || 
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impocm1sbmZkbnhqZGxybHpva2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzAzNDIsImV4cCI6MjA3MTcwNjM0Mn0.1Qu2IDtDNb93qtEd_EinPrRe8Z2HPuFmcyyARGbEFnM';

  if (!url || !anonKey) {
    throw new Error('Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  return {
    url,
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

// Validate Supabase configuration
export function validateSupabaseConfig(config: SupabaseConfig): boolean {
  if (!config.url || !config.anonKey) {
    return false;
  }

  // Check URL format
  if (!config.url.startsWith('https://') || !config.url.includes('.supabase.co')) {
    console.warn('Supabase URL format may be incorrect');
    return false;
  }

  // Check key format (basic validation)
  if (!config.anonKey.startsWith('eyJ')) {
    console.warn('Supabase anon key format may be incorrect');
    return false;
  }

  return true;
}

// Export default configuration
export default getSupabaseConfig();
