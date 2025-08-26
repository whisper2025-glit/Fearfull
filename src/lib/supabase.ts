import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to set Clerk token for Supabase authentication
export const setSupabaseAuth = async (token: string | null) => {
  if (token) {
    // Use Supabase's built-in auth system to set the session
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // Clerk handles refresh
    });
  } else {
    // Sign out from Supabase when no Clerk token
    await supabase.auth.signOut();
  }
};

// Create authenticated Supabase client for user operations
export const createAuthenticatedSupabaseClient = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // Clerk user ID
          username?: string | null;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          owner_id: string; // References users.id (Clerk user ID)
          name: string;
          intro: string;
          scenario: string | null;
          greeting: string | null;
          personality: string | null;
          appearance: string | null;
          avatar_url: string | null;
          scene_url: string | null;
          visibility: 'public' | 'unlisted' | 'private';
          rating: 'filtered' | 'unfiltered';
          tags: string[] | null;
          gender: string | null;
          age: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          intro: string;
          scenario?: string | null;
          greeting?: string | null;
          personality?: string | null;
          appearance?: string | null;
          avatar_url?: string | null;
          scene_url?: string | null;
          visibility?: 'public' | 'unlisted' | 'private';
          rating?: 'filtered' | 'unfiltered';
          tags?: string[] | null;
          gender?: string | null;
          age?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          intro?: string;
          scenario?: string | null;
          greeting?: string | null;
          personality?: string | null;
          appearance?: string | null;
          avatar_url?: string | null;
          scene_url?: string | null;
          visibility?: 'public' | 'unlisted' | 'private';
          rating?: 'filtered' | 'unfiltered';
          tags?: string[] | null;
          gender?: string | null;
          age?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          character_id: string;
          title: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
          is_archived: boolean;
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          character_id: string;
          title?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          is_archived?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          character_id?: string;
          title?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          is_archived?: boolean;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          character_id: string;
          conversation_id: string | null; // References conversations.id
          author_id: string | null; // Clerk user ID for user messages, null for bot
          content: string;
          is_bot: boolean;
          type: 'intro' | 'scenario' | 'regular';
          created_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          conversation_id?: string | null;
          author_id?: string | null;
          content: string;
          is_bot?: boolean;
          type?: 'intro' | 'scenario' | 'regular';
          created_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          conversation_id?: string | null;
          author_id?: string | null;
          content?: string;
          is_bot?: boolean;
          type?: 'intro' | 'scenario' | 'regular';
          created_at?: string;
        };
      };
    };
  };
}

// Helper functions for common operations
export const uploadImage = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return { data, publicUrl };
};

export const generateUniqueUsername = async (baseName: string): Promise<string> => {
  // Clean the base name (remove special characters, convert to lowercase)
  const cleanBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let username = cleanBase;
  let counter = 1;

  // Keep checking until we find a unique username
  while (true) {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned, username is available
      return username;
    }

    if (data) {
      // Username exists, try with number suffix
      username = `${cleanBase}${counter}`;
      counter++;
    } else {
      // Some other error occurred
      throw error;
    }
  }
};

export const createOrUpdateUser = async (clerkUser: any) => {
  console.log('🔧 createOrUpdateUser called with:', {
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    fullName: clerkUser.fullName,
    email: clerkUser.emailAddresses?.[0]?.emailAddress
  });

  const userData = {
    id: clerkUser.id,
    full_name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User',
    email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
    avatar_url: clerkUser.imageUrl || null,
    updated_at: new Date().toISOString()
  };

  console.log('📊 User data to upsert:', userData);

  const { data, error } = await supabase
    .from('users')
    .upsert(userData, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase upsert error:', error);
    throw error;
  }

  console.log('✅ Supabase upsert successful:', data);
  return data;
};
