import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to create Supabase client with Clerk authentication
export const createSupabaseClientWithClerkAuth = (getToken: () => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: async () => {
          const token = await getToken();
          return token ? `Bearer ${token}` : '';
        }
      }
    }
  });
};

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
          gender: string | null;
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
          gender?: string | null;
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
          gender?: string | null;
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
      personas: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          name: string;
          gender: 'Male' | 'Female' | 'Non-binary';
          description: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          gender: 'Male' | 'Female' | 'Non-binary';
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          gender?: 'Male' | 'Female' | 'Non-binary';
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string; // Clerk user ID
          character_id: string;
          persona_id: string | null; // References personas.id
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
          persona_id?: string | null;
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
          persona_id?: string | null;
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

// Helper function to generate username from display name
const generateUsername = (displayName: string, userId: string): string => {
  // Remove spaces and special characters, convert to lowercase
  let username = displayName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20); // Limit length

  // If empty after cleaning, use part of user ID
  if (!username) {
    username = 'user' + userId.substring(0, 8);
  }

  // Add part of user ID to ensure uniqueness
  username += userId.substring(0, 4);

  return username;
};

export const createOrUpdateUser = async (clerkUser: any) => {
  console.log('🔧 createOrUpdateUser called with:', {
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    fullName: clerkUser.fullName,
    email: clerkUser.emailAddresses?.[0]?.emailAddress
  });

  const displayName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
  const userData = {
    id: clerkUser.id,
    username: clerkUser.username || generateUsername(displayName, clerkUser.id),
    full_name: displayName,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
    avatar_url: clerkUser.imageUrl || null,
    updated_at: new Date().toISOString()
  };

  console.log('📊 User data to upsert:', userData);

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase upsert error:', error);
      // If RLS error, try without select to avoid permission issues
      if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('RLS')) {
        console.log('🔄 RLS/permission error detected, trying simple upsert...');
        const { error: retryError } = await supabase
          .from('users')
          .upsert(userData, { onConflict: 'id' });

        if (!retryError) {
          console.log('✅ Simple upsert successful');
          return userData; // Return the data we tried to insert
        } else {
          console.error('❌ Simple upsert also failed:', retryError);
          throw retryError;
        }
      }
      throw error;
    }

    console.log('✅ Supabase upsert successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in createOrUpdateUser:', error);
    // Return the user data even if DB failed - app should continue working
    console.log('⚠️ Returning user data despite DB error');
    return userData;
  }
};

// Persona CRUD operations
export interface PersonaData {
  id?: string;
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  description: string;
  applyToNewChats: boolean;
}

export const createPersona = async (userId: string, personaData: Omit<PersonaData, 'id'>, authenticatedClient?: any) => {
  try {
    const client = authenticatedClient || supabase;
    const { data, error } = await client
      .from('personas')
      .insert({
        user_id: userId,
        name: personaData.name,
        gender: personaData.gender,
        description: personaData.description || null,
        is_default: personaData.applyToNewChats
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating persona:', error);
      throw error;
    }

    console.log('✅ Persona created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in createPersona:', error);
    throw error;
  }
};

export const updatePersona = async (personaId: string, personaData: Partial<Omit<PersonaData, 'id'>>, authenticatedClient?: any) => {
  try {
    const client = authenticatedClient || supabase;
    const updateData: any = {};

    if (personaData.name !== undefined) updateData.name = personaData.name;
    if (personaData.gender !== undefined) updateData.gender = personaData.gender;
    if (personaData.description !== undefined) updateData.description = personaData.description || null;
    if (personaData.applyToNewChats !== undefined) updateData.is_default = personaData.applyToNewChats;

    const { data, error } = await client
      .from('personas')
      .update(updateData)
      .eq('id', personaId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating persona:', error);
      throw error;
    }

    console.log('✅ Persona updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in updatePersona:', error);
    throw error;
  }
};

export const deletePersona = async (personaId: string, authenticatedClient?: any) => {
  try {
    const client = authenticatedClient || supabase;
    const { error } = await client
      .from('personas')
      .delete()
      .eq('id', personaId);

    if (error) {
      console.error('❌ Error deleting persona:', error);
      throw error;
    }

    console.log('✅ Persona deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Final error in deletePersona:', error);
    throw error;
  }
};

export const getUserPersonas = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching personas:', error);
      throw error;
    }

    console.log('✅ Personas fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Final error in getUserPersonas:', error);
    return [];
  }
};

export const getDefaultPersona = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching default persona:', error);
      throw error;
    }

    console.log('✅ Default persona fetched:', data);
    return data || null;
  } catch (error) {
    console.error('❌ Final error in getDefaultPersona:', error);
    return null;
  }
};

export const setDefaultPersona = async (personaId: string, userId: string) => {
  try {
    // First, unset all other defaults for this user
    await supabase
      .from('personas')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the specified persona as default
    const { data, error } = await supabase
      .from('personas')
      .update({ is_default: true })
      .eq('id', personaId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error setting default persona:', error);
      throw error;
    }

    console.log('✅ Default persona set successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Final error in setDefaultPersona:', error);
    throw error;
  }
};
